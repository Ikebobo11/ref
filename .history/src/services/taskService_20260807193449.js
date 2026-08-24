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
 * @param {string} taskData.platform - The target platform.
 * @param {string} taskData.title - The task title.
 * @param {string} taskData.description - The task description.
 * @param {string} taskData.instructions - The task instructions.
 * @param {string} taskData.followerTier - The required follower tier.
 * @param {number} taskData.budget - The task budget.
 * @param {Object} [taskData.media] - Uploaded media files.
 * @returns {Promise<Object>} The created task.
 */
export async function createTask(taskData) {
  const {
    advertiserId,
    platform,
    title,
    description,
    instructions,
    followerTier,
    budget,
    ...rest
  } = taskData;

  // Calculate the payment per influencer based on tier and platform
  const paymentPerInfluencer = getTierPayment(followerTier, platform);


