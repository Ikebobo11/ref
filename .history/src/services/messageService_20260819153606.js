/**
 * LETCON - Messaging Service
 * Handles direct messages, support conversations, admin broadcasts,
 * and chat with file attachments.
 */
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
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
 * Uses raw Firestore SDK to avoid merge:true permission issues.
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
  const convRef = doc(db, 'conversations', conversationId);

  // Use setDoc with merge:true to avoid the permission error that occurs
  // when getDoc is called on a non-existent document (resource.data is null
  // for non-existent docs, which fails the read rule's participants check).
  // merge:true will create the doc if it doesn't exist, or merge new fields
  // into the existing doc without overwriting.
  const conversation = {
    participants: [participant1, participant2],
    participantNames: {
      [participant1]: participant1Name || 'User',
      [participant2]: participant2Name || 'User',
    },
    type,
    lastMessage: '',
    lastMessageAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(convRef, conversation, { merge: true });

  // Now read back the full document (which definitely exists now)
  const snap = await getDoc(convRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }

  // Fallback: return the minimal object we just set
  return {
    id: conversationId,
    ...conversation,
    unreadCounts: {
      [participant1]: 0,
      [participant2]: 0,
    },
    createdAt: new Date(),
  };
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
  // Get conversation participants for the message document
  // so the security rule can check access without a get() call
  let participants = [];
  try {
    const conversation = await getDocument('conversations', conversationId);
    if (conversation) {
      participants = conversation.participants || [];
    }
  } catch {
    // Non-critical — participants will be empty
  });

  // Update the conversation with the last message
  try {
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
  } catch {
    // Conversation update is non-critical — ignore errors
  }

  // Create a notification for the recipient
  if (recipientId && recipientId !== senderId) {
    try {
      const { createNotification } = await import('./notificationService');
      await createNotification({
        uid: recipientId,
        type: NOTIFICATION_TYPES.NEW_MESSAGE,
        title: `New message from ${senderName}`,
        message: content || (attachment ? `Sent a file: ${attachment.name}` : ''),
        link: `/messages?conversation=${conversationId}`,
        data: { conversationId },
      });
    } catch {
      // Notification is non-critical
    }
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

  // Ensure conversation exists (creates if needed)
  const conversation = await getOrCreateConversation({
    participant1: senderId,
    participant2: recipientId,
    participant1Name: senderName,
    participant2Name: recipientName,
    type,
  });

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
  try {
    const conversation = await getDocument('conversations', conversationId);
    if (!conversation) return;

    const unreadCounts = { ...conversation.unreadCounts };
    unreadCounts[uid] = 0;
    await updateDocument('conversations', conversationId, { unreadCounts });
  } catch {
    // Non-critical
  }
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