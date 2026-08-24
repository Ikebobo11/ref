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
    orderByFields: [{ field: 'createdAt', direction: 'desc' }],
    limitCount,
  });
}

/**
 * Accepts a task for an earner.
 * @param {string} taskId - The task ID.
 * @param {Object} earner - The earner object.
 * @returns {Promise<Object>} The acceptance record.
 */
export async function acceptTask(taskId, earner) {
  const task = await getDocument(COLLECTIONS.TASKS, taskId);
  if (!task) throw new Error('Task not found');
  if (task.status !== TASK_STATUS.PUBLISHED) throw new Error('Task is not available');
  if (task.followerTier !== earner.tier) throw new Error('Task tier does not match your tier');
  if (task.platform !== earner.verifiedPlatform) {
    throw new Error('Task platform does not match your verified platform');
  }

  // Check if earner already accepted this task
  const existing = await queryDocuments(COLLECTIONS.TASKS, {
    filters: [
      { field: 'earnerId', operator: '==', earner.uid },
      { field: 'taskId', operator: '==', taskId },
    ],
    limitCount: 1,
  });

  if (existing.length > 0) throw new Error('You have already accepted this task');

  // Create acceptance record
  const acceptance = await addDocument('taskAcceptances', {
    taskId,
    earnerId: earner.uid,
    platform: earner.verifiedPlatform,
    username: earner.verifiedUsername,
    status: TASK_STATUS.IN_PROGRESS,
    acceptedAt: new Date(),
    autoApprovalDeadline: new Date(Date.now() + AUTO_APPROVAL_MS),
  });

  // Increment accepted count
  await updateDocument(COLLECTIONS.TASKS, taskId, {
    acceptedCount: (task.acceptedCount || 0) + 1,
  });

  await notifyTaskAccepted(earner.uid, task.title);

  return acceptance;
}

/**
 * Submits proof for a task.
 * @param {string} taskId - The task ID.
 * @param {Object} submission - The submission data.
 * @param {Object} earner - The earner object.
 * @returns {Promise<Object>} The submission record.
 */
export async function submitTaskProof(taskId, submission, earner) {
  const task = await getDocument(COLLECTIONS.TASKS, taskId);
  if (!task) throw new Error('Task not found');

  // Check verified account match
  const matchResult = checkVerifiedAccountMatch(earner, {
    platform: submission.platform,
    username: submission.username,
    profileUrl: submission.profileUrl,
  });

  const submissionData = {
    taskId,
    earnerId: earner.uid,
    ...submission,
    verifiedAccountMatch: matchResult.isMatch,
    matchReason: matchResult.reason,
    status: matchResult.isMatch ? TASK_STATUS.SUBMITTED : TASK_STATUS.FLAGGED,
    submittedAt: new Date(),
    autoApprovalDeadline: new Date(Date.now() + AUTO_APPROVAL_MS),
  };

  const record = await addDocument('taskSubmissions', submissionData);

  // Update task status
  await updateDocument(COLLECTIONS.TASKS, taskId, {
    status: matchResult.isMatch ? TASK_STATUS.SUBMITTED : TASK_STATUS.FLAGGED,
    lastSubmissionId: record.id,
  });

  if (!matchResult.isMatch) {
    await notifyAccountMismatchFlagged(earner.uid, task.title);
  }

  return { ...record, verifiedAccountMatch: matchResult.isMatch };
}

/**
 * Approves a task submission and releases payment.
 * @param {string} submissionId - The submission ID.
 * @param {string} approvedBy - The approver's user ID.
 * @param {string} [approvalType] - 'advertiser', 'admin', or 'auto'.
 * @returns {Promise<Object>} The approval result.
 */
export async function approveTaskSubmission(submissionId, approvedBy, approvalType = 'advertiser') {
  const submission = await getDocument('taskSubmissions', submissionId);
  if (!submission) throw new Error('Submission not found');
  if (submission.status === TASK_STATUS.APPROVED) throw new Error('Task already approved');

  const task = await getDocument(COLLECTIONS.TASKS, submission.taskId);
  if (!task) throw new Error('Task not found');

  // Calculate revenue split
  const { platformAmount, earnerAmount } = calculateRevenueSplit(task.paymentPerInfluencer);

  // Update submission status
  await updateDocument('taskSubmissions', submissionId, {
    status: TASK_STATUS.APPROVED,
    approvedBy,
    approvalType,
    approvedAt: new Date(),
    platformAmount,
    earnerAmount,
  });

  // Update task
  await updateDocument(COLLECTIONS.TASKS, submission.taskId, {
    status: TASK_STATUS.COMPLETED,
    completedCount: (task.completedCount || 0) + 1,
  });

  // Credit earner wallet
  const earnerWallet = await getDocument(COLLECTIONS.WALLETS, submission.earnerId);
  const newBalance = (earnerWallet?.balance || 0) + earnerAmount;

  await executeBatch([
    {
      type: 'update',
      collectionName: COLLECTIONS.WALLETS,
      docId: submission.earnerId,
      data: {
        balance: newBalance,
        totalEarned: (earnerWallet?.totalEarned || 0) + earnerAmount,
      },
    },
    {
      type: 'add',
      collectionName: COLLECTIONS.TRANSACTIONS,
      docId: `txn-${submissionId}`,
      data: {
        uid: submission.earnerId,
        type: 'task_payment',
        amount: earnerAmount,
        status: 'success',
        taskId: submission.taskId,
        submissionId,
        description: `Payment for task: ${task.title}`,
      },
    },
    {
      type: 'add',
      collectionName: COLLECTIONS.TRANSACTIONS,
      docId: `txn-platform-${submissionId}`,
      data: {
        uid: 'platform',
        type: 'platform_revenue',
        amount: platformAmount,
        status: 'success',
        taskId: submission.taskId,
        submissionId,
        description: `Platform revenue (30%) for task: ${task.title}`,
      },
    },
  ]);

  await notifyTaskApproved(submission.earnerId, task.title);
  await notifyWalletCredited(submission.earnerId, earnerAmount);


