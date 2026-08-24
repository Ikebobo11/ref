/**
 * LETCON - Messaging Service
 * Handles direct messages, support conversations, admin broadcasts,
 * and chat with file attachments.
 */
import {
  addDocument,
  updateDocument,
  getDocument,
  queryDocuments,
  executeBatch,
} from './firestoreService';
import { COLLECTIONS, NOTIFICATION_TYPES, CONVERSATION_TYPES } from '../config/constants';

/**
 * Generates a deterministic conversation ID between two participants.
 * Ensures both users share the same conversation document.
 * @param {string} uidA - First user ID.
 * @param {string} uidB - Second user ID.
 * @returns {string} The conversation ID.
 */
export function getConversationId(uidA, uidB) {
  return [uidA, uidB].sort().join('__');
}

/**
 * Creates or retrieves a conversation between two users.
 * @param {Object} options - Conversation options.
 * @param {string} options.participant1 - First participant user ID.
 * @param {string} options.participant2 - Second participant user ID.
 * @param {string} options.participant1Name - First participant display name.
 * @param {string} options.participant2Name - Second participant display name.
 * @param {string} [options.type] - CONVERSATION_TYPES.DIRECT or SUPPORT.
 * @returns {Promise<Object>} The conversation document.
 */
export async function getOrCreateConversation({
  participant1,
  participant2,
  participant1Name,
  participant2Name,
  type = CONVERSATION_TYPES.DIRECT,
}) {
  const conversationId = getConversationId(participant1, participant2);
  const existing = await getDocument('conversations', conversationId);
  if (existing) return existing;

  const conversation = {
    id: conversationId,
    participants: [participant1, participant2],
    participantNames: {
      [participant1]: participant1Name || 'User',
      [participant2]: participant2Name || 'User',
    },
    type,
    lastMessage: '',
    lastMessageAt: new Date(),
    unreadCounts: {
      [participant1]: 0,
      [participant2]: 0,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Create the conversation if it doesn't exist.
  const { setDocument } = await import('./firestoreService');
  await setDocument('conversations', conversationId, conversation);
  return conversation;
}

/**
 * Sends a message in a conversation.
 * Creates a notification for the recipient.
 * @param {Object} options - Message options.
 * @param {string} options.conversationId - The conversation ID.
 * @param {string} options.senderId - The sender's user ID.
 * @param {string} options.senderName - The sender's display name.
 * @param {string} options.senderRole - The sender's role.
 * @param {string} options.content - The message text.
 * @param {string} [options.recipientId] - The recipient user ID (for notifications).
 * @param {Object} [options.attachment] - { name, url, type, size } file attachment.
 * @returns {Promise<Object>} The created message.
 */
export async function sendMessage({
  conversationId,
  senderId,
  senderName,
  senderRole,
  content,
  recipientId,
  attachment,
}) {
  const message = await addDocument(COLLECTIONS.MESSAGES, {
    conversationId,
    senderId,
    senderName,
    senderRole,
    content,
    attachment: attachment || null,
    read: false,
    readAt: null,
    createdAt: new Date(),
  });

  // Update the conversation with the last message
  const conversation = await getDocument('conversations', conversationId);
  if (conversation) {
    const unreadCounts = { ...conversation.unreadCounts };
    if (recipientId) {
      unreadCounts[recipientId] = (unreadCounts[recipientId] || 0) + 1;
    }
    await updateDocument('conversations', conversationId, {
      lastMessage: content || (attachment ? `📎 ${attachment.name}` : ''),
      lastMessageAt: new Date(),
      lastMessageSender: senderId,
      unreadCounts,
    });
  }

  // Create a notification for the recipient
  if (recipientId && recipientId !== senderId) {
    await import('./notificationService').then(({ createNotification }) =>
      createNotification({
        uid: recipientId,
        type: NOTIFICATION_TYPES.NEW_MESSAGE,
        title: `New message from ${senderName}`,
        message: content || (attachment ? `Sent a file: ${attachment.name}` : ''),
        link: `/messages?conversation=${conversationId}`,
        data: { conversationId },
      })
    );
  }

  return message;
}

/**
 * Sends a direct message between two users.
 * @param {Object} options - Send options.
 * @param {string} options.senderId - Sender user ID.
 * @param {string} options.senderName - Sender display name.
 * @param {string} options.senderRole - Sender role.
 * @param {string} options.recipientId - Recipient user ID.
 * @param {string} options.recipientName - Recipient display name.
 * @param {string} options.content - Message text.
 * @param {Object} [options.attachment] - File attachment.
 * @returns {Promise<Object>} { conversation, message }
 */
export async function sendDirectMessage({
  senderId,
  senderName,
  senderRole,
  recipientId,
  recipientName,
  content,
  attachment,
}) {
  const conversationId = getConversationId(senderId, recipientId);
  const type = senderRole === 'admin' || senderRole === 'super_admin'
    ? CONVERSATION_TYPES.SUPPORT
    : CONVERSATION_TYPES.DIRECT;

  let conversation = await getDocument('conversations', conversationId);
  if (!conversation) {
    conversation = await getOrCreateConversation({
      participant1: senderId,
      participant2: recipientId,
      participant1Name: senderName,
      participant2Name: recipientName,
      type,
    });
  }

  const message = await sendMessage({
    conversationId,
    senderId,
    senderName,
    senderRole,
    content,
    recipientId,
    attachment,
  });

  return { conversation, message };
}

/**
 * Sends an admin broadcast message to all users (or filtered by role).
 * Creates individual notifications for each recipient.
 * @param {Object} options - Broadcast options.
 * @param {string} options.adminId - Admin user ID.
 * @param {string} options.adminName - Admin display name.
 * @param {string} options.content - The broadcast message.
 * @param {string} [options.targetRole] - Filter by role ('earner', 'advertiser', etc).
 * @param {Object} [options.attachment] - Optional file attachment.
 * @returns {Promise<Object>} { broadcastId }
 */
export async function sendBroadcast({
  adminId,
  adminName,
  content,
  targetRole,
  attachment,
}) {
  // Create the broadcast record
  const broadcast = await addDocument('broadcasts', {
    adminId,
    adminName,
    content,
    attachment: attachment || null,
    targetRole: targetRole || 'all',
    createdAt: new Date(),
  });

  // Query the target users
  const filters = [];
  if (targetRole && targetRole !== 'all') {
    filters.push({ field: 'role', operator: '==', value: targetRole });
  }

  const users = await queryDocuments(COLLECTIONS.USERS, {
    filters,
    limitCount: 500,
  });

  // Create notifications for all recipients (fire-and-forget)
  const { createBulkNotifications } = await import('./notificationService');
  const recipients = users.map((u) => ({
    uid: u.uid || u.id,
    type: NOTIFICATION_TYPES.BROADCAST,
    title: `📢 ${adminName}`,
    message: content || (attachment ? `Sent a file: ${attachment.name}` : ''),
    link: `/messages?broadcast=${broadcast.id}`,
    data: { broadcastId: broadcast.id },
  }));

  try {
    await createBulkNotifications(recipients);
  } catch (error) {
    console.error('[LETCON] Failed to send broadcast notifications:', error);
  }

  return { broadcast };
}

/**
 * Marks a conversation as read for a user.
 * @param {string} conversationId - The conversation ID.
 * @param {string} uid - The user who read the conversation.
 * @returns {Promise<void>}
 */
export async function markConversationRead(conversationId, uid) {
  const conversation = await getDocument('conversations', conversationId);
  if (!conversation) return;

  const unreadCounts = { ...conversation.unreadCounts };
  unreadCounts[uid] = 0;
  await updateDocument('conversations', conversationId, { unreadCounts });
}

/**
 * Uploads a file for a message and sends it.
 * @param {Object} options - Send with file options.
 * @param {File} options.file - The file to upload.
 * @param {string} options.senderId - Sender user ID.
 * @param {string} options.senderName - Sender display name.
 * @param {string} options.senderRole - Sender role.
 * @param {string} options.recipientId - Recipient user ID.
 * @param {string} [options.recipientName] - Recipient display name.
 * @param {string} [options.content] - Optional text content.
 * @param {Function} [options.onProgress] - Upload progress callback.
 * @returns {Promise<Object>} The sent message.
 */
export async function sendMessageWithFile({
  file,
  senderId,
  senderName,
  senderRole,
  recipientId,
  recipientName,
  content = '',
  onProgress,
}) {
  const { uploadFile } = await import('./storageService');

  const attachment = await uploadFile(file, 'message-attachments', senderId, onProgress);

  return sendDirectMessage({
    senderId,
    senderName,
    senderRole,
    recipientId,
    recipientName,
    content,
    attachment,
  });
}