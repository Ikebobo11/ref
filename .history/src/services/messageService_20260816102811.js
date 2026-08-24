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
