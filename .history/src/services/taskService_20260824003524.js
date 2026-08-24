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
  deleteDocument,
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
import { createNotification } from './notificationService';
import { NOTIFICATION_TYPES } from '../config/constants';

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
    description: rest.description || '',
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
    link: rest.link || '',
    targetGender: rest.targetGender || 'any',
    images: rest.images || [],
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
  const existing = await queryDocuments('taskAcceptances', {
    filters: [
      { field: 'earnerId', operator: '==', value: earner.uid },
      { field: 'taskId', operator: '==', value: taskId },
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

  // Check if earner has already submitted proof for this task
  const existingSubmissions = await queryDocuments('taskSubmissions', {
    filters: [
      { field: 'earnerId', operator: '==', value: earner.uid },
      { field: 'taskId', operator: '==', value: taskId },
    ],
    limitCount: 1,
  });

  if (existingSubmissions.length > 0) {
    throw new Error('You have already submitted proof for this task. You can only submit once.');
  }

  // Check verified account match
  const matchResult = checkVerifiedAccountMatch(earner, {
    platform: submission.platform,
    username: submission.username,
    profileUrl: submission.profileUrl,
  });

  const submissionData = {
    taskId,
    earnerId: earner.uid,
    advertiserId: task.advertiserId,
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
 * Optimized to use parallel reads + a single batch write for minimal latency.
 * @param {string} submissionId - The submission ID.
 * @param {string} approvedBy - The approver's user ID.
 * @param {string} [approvalType] - 'advertiser', 'admin', or 'auto'.
 * @returns {Promise<Object>} The approval result.
 */
export async function approveTaskSubmission(submissionId, approvedBy, approvalType = 'advertiser') {
  // Fetch submission first to know the task ID and earner ID.
  const submission = await getDocument('taskSubmissions', submissionId);
  if (!submission) throw new Error('Submission not found');
  if (submission.status === TASK_STATUS.APPROVED) throw new Error('Task already approved');

  // Fetch task + wallet in parallel.
  const [resolvedTask, resolvedWallet] = await Promise.all([
    getDocument(COLLECTIONS.TASKS, submission.taskId),
    getDocument(COLLECTIONS.WALLETS, submission.earnerId),
  ]);
  if (!resolvedTask) throw new Error('Task not found');

  // Calculate revenue split
  const { platformAmount, earnerAmount } = calculateRevenueSplit(resolvedTask.paymentPerInfluencer);

  // 3. Single batch write-commit: submission update + task update + wallet update + 2 transactions.
  await executeBatch([
    {
      type: 'update',
      collectionName: 'taskSubmissions',
      docId: submissionId,
      data: {
        status: TASK_STATUS.APPROVED,
        approvedBy,
        approvalType,
        approvedAt: new Date(),
        platformAmount,
        earnerAmount,
      },
    },
    {
      type: 'update',
      collectionName: COLLECTIONS.TASKS,
      docId: submission.taskId,
      data: {
        status: TASK_STATUS.COMPLETED,
        completedCount: (resolvedTask.completedCount || 0) + 1,
      },
    },
    {
      type: 'update',
      collectionName: COLLECTIONS.WALLETS,
      docId: submission.earnerId,
      data: {
        balance: (resolvedWallet?.balance || 0) + earnerAmount,
        totalEarned: (resolvedWallet?.totalEarned || 0) + earnerAmount,
      },
    },
    {
      type: 'set',
      collectionName: COLLECTIONS.TRANSACTIONS,
      docId: `txn-${submissionId}`,
      data: {
        uid: submission.earnerId,
        type: 'task_payment',
        amount: earnerAmount,
        status: 'success',
        taskId: submission.taskId,
        submissionId,
        description: `Payment for task: ${resolvedTask.title}`,
        createdAt: new Date(),
      },
    },
    {
      type: 'set',
      collectionName: COLLECTIONS.TRANSACTIONS,
      docId: `txn-platform-${submissionId}`,
      data: {
        uid: 'platform',
        type: 'platform_revenue',
        amount: platformAmount,
        status: 'success',
        taskId: submission.taskId,
        submissionId,
        description: `Platform revenue (30%) for task: ${resolvedTask.title}`,
        createdAt: new Date(),
      },
    },
  ]);

  // 4. Fire-and-forget notifications
  notifyTaskApproved(submission.earnerId, resolvedTask.title).catch(console.error);
  notifyWalletCredited(submission.earnerId, earnerAmount).catch(console.error);

  // Notify the advertiser when admin approves a task they rejected
  if (approvalType === 'admin' && resolvedTask.advertiserId) {
    createNotification({
      uid: resolvedTask.advertiserId,
      type: NOTIFICATION_TYPES.TASK_APPROVED,
      title: 'Task Approved by Admin',
      message: `The task "${resolvedTask.title}" was approved by an admin. Payment has been released to the earner.`,
      link: '/advertiser/task-review',
    }).catch(console.error);
  }

  return { submission, task: resolvedTask, platformAmount, earnerAmount };
}

/**
 * Rejects a task submission.
 * @param {string} submissionId - The submission ID.
 * @param {string} rejectedBy - The rejector's user ID.
 * @param {string} reason - The rejection reason.
 * @param {string} [rejectionType] - 'advertiser' or 'admin'.
 * @returns {Promise<Object>} The rejection result.
 */
export async function rejectTaskSubmission(submissionId, rejectedBy, reason, rejectionType = 'advertiser') {
  // Parallel reads: submission + we'll get task after we know the taskId.
  const submission = await getDocument('taskSubmissions', submissionId);
  if (!submission) throw new Error('Submission not found');

  const task = await getDocument(COLLECTIONS.TASKS, submission.taskId);

  // If advertiser rejects, it goes to pending admin review
  const newStatus = rejectionType === 'advertiser'
    ? TASK_STATUS.PENDING_ADMIN_REVIEW
    : TASK_STATUS.REJECTED;

  // Single batch write for submission + task status update
  await executeBatch([
    {
      type: 'update',
      collectionName: 'taskSubmissions',
      docId: submissionId,
      data: {
        status: newStatus,
        rejectedBy,
        rejectionType,
        rejectionReason: reason,
        rejectedAt: new Date(),
      },
    },
    {
      type: 'update',
      collectionName: COLLECTIONS.TASKS,
      docId: submission.taskId,
      data: {
        status: newStatus,
      },
    },
  ]);

  if (rejectionType === 'admin') {
    notifyTaskRejected(submission.earnerId, task?.title || 'Task', reason).catch(console.error);

    // Notify the advertiser of the admin's final decision
    if (task?.advertiserId) {
      createNotification({
        uid: task.advertiserId,
        type: NOTIFICATION_TYPES.TASK_REJECTED,
        title: 'Task Rejected by Admin',
        message: `The task "${task.title}" was rejected by an admin. Reason: ${reason || 'No reason provided'}`,
        link: '/advertiser/task-review',
      }).catch(console.error);
    }
  }

  return { submission, task, newStatus };
}

/**
 * Gets tasks for an advertiser.
 * @param {string} advertiserId - The advertiser's user ID.
 * @param {Object} options - Query options.
 * @returns {Promise<Array<Object>>} Array of tasks.
 */
export async function getAdvertiserTasks(advertiserId, { status, limitCount = 20 } = {}) {
  const filters = [{ field: 'advertiserId', operator: '==', value: advertiserId }];
  if (status) filters.push({ field: 'status', operator: '==', value: status });

  return queryDocuments(COLLECTIONS.TASKS, {
    filters,
    orderByFields: [{ field: 'createdAt', direction: 'desc' }],
    limitCount,
  });
}

/**
 * Deletes a task. Only the task's advertiser or staff can delete it.
 * @param {string} taskId - The task ID.
 * @param {string} deletedBy - The user ID performing the deletion.
 * @returns {Promise<void>}
 */
export async function deleteTask(taskId, deletedBy) {
  const task = await getDocument(COLLECTIONS.TASKS, taskId);
  if (!task) throw new Error('Task not found');
  if (task.advertiserId !== deletedBy) throw new Error('You do not have permission to delete this task');
  if (task.status === TASK_STATUS.COMPLETED) throw new Error('Completed tasks cannot be deleted');

  await deleteDocument(COLLECTIONS.TASKS, taskId);
}

/**
 * Gets tasks for an earner.
 * @param {string} earnerId - The earner's user ID.
 * @param {Object} options - Query options.
 * @returns {Promise<Array<Object>>} Array of tasks.
 */
export async function getEarnerTasks(earnerId, { status, limitCount = 20 } = {}) {
  const filters = [{ field: 'earnerId', operator: '==', value: earnerId }];
  if (status) filters.push({ field: 'status', operator: '==', value: status });

  return queryDocuments('taskAcceptances', {
    filters,
    orderByFields: [{ field: 'acceptedAt', direction: 'desc' }],
    limitCount,
  });
}