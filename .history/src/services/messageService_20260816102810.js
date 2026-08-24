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
