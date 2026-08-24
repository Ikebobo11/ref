/**
 * LETCON - Admin Service
 * Handles admin operations: user management, verification, upgrades, and account changes.
 */
import {
  getDocument,
  updateDocument,
  addDocument,
  queryDocuments,
  executeBatch,
} from './firestoreService';
