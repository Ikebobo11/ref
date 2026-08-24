/**
 * LETCON - Task Service
 * Handles task creation, acceptance, submission, and approval workflows.
 */
import {
  addDocument,
  updateDocument,
  getDocument,
  queryDocuments,
  executeBatch,
} from './firestoreService';
import {
  COLLECTIONS,
  TASK_STATUS,
  FEES,
  REVENUE_SPLIT,
  AUTO_APPROVAL_MS,
} from '../config/constants';
import { calculateRevenueSplit, checkVerifiedAccountMatch } from '../utils/tierLogic';
import { getTierPayment } from '../utils/tierLogic';
import {
  notifyTaskAccepted,
  notifyTaskApproved,
  notifyTaskRejected,
  notifyAccountMismatchFlagged,
  notifyWalletCredited,
} from './notificationService';

/**
 * Creates a new task.
 * @param {Object} taskData - The task data.
 * @param {string} taskData.advertiserId - The advertiser's user ID.
