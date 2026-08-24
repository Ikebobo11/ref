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

  const task = await addDocument(COLLECTIONS.TASKS, {
    advertiserId,
    platform,
    title,
    description,
    instructions,
    followerTier,
    budget,
    paymentPerInfluencer,
    status: TASK_STATUS.DRAFT,
    postingFeePaid: false,
    influencersNeeded: rest.influencersNeeded || 1,
    acceptedCount: 0,
    completedCount: 0,
    deadline: rest.deadline ? new Date(rest.deadline) : null,
    country: rest.country,
    hashtags: rest.hashtags || '',
    mentions: rest.mentions || '',
    script: rest.script || '',
    images: rest.images || [],
    videos: rest.videos || [],
    example: rest.example || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return task;
}

/**
 * Publishes a task after the posting fee is paid.
 * @param {string} taskId - The task ID.
 * @returns {Promise<void>}
 */
export async function publishTask(taskId) {
  await updateDocument(COLLECTIONS.TASKS, taskId, {
    status: TASK_STATUS.PUBLISHED,
    postingFeePaid: true,
    publishedAt: new Date(),
  });
}

/**
 * Gets tasks visible to an earner based on tier and platform.
 * @param {Object} earner - The earner object.
 * @param {Object} options - Query options.
 * @returns {Promise<Array<Object>>} Array of visible tasks.
 */
export async function getVisibleTasks(earner, { status = TASK_STATUS.PUBLISHED, limitCount = 20 } = {}) {
  if (!earner?.tier || !earner?.verifiedPlatform) return [];

  // Enforce tier + platform visibility at the query level
  return queryDocuments(COLLECTIONS.TASKS, {
    filters: [
      { field: 'followerTier', operator: '==', value: earner.tier },
      { field: 'platform', operator: '==', value: earner.verifiedPlatform },
      { field: 'status', operator: '==', value: status },
    ],
