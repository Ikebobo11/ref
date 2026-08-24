/**
 * LETCON - Wallet Service
 * Handles wallet operations: funding, withdrawals, and balance management.
 */
import {
  getDocument,
  updateDocument,
  addDocument,
  queryDocuments,
  executeTransaction,
} from './firestoreService';
