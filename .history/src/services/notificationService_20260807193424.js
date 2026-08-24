/**
 * LETCON - Notification Service
 * Creates in-app notifications and sends FCM push notifications.
 */
import { addDocument, getDocument } from './firestoreService';
import { COLLECTIONS, NOTIFICATION_TYPES } from '../config/constants';

/**
 * Creates a notification for a user.
 * @param {Object} options - Notification options.
 * @param {string} options.uid - The recipient user ID.
 * @param {string} options.type - The notification type (use NOTIFICATION_TYPES).
 * @param {string} options.title - The notification title.
 * @param {string} options.message - The notification message.
 * @param {string} [options.link] - Optional link to navigate to.
 * @param {Object} [options.data] - Additional data.
 * @returns {Promise<Object>} The created notification.
 */
export async function createNotification({ uid, type, title, message, link, data = {} }) {
  try {
    const notification = await addDocument(COLLECTIONS.NOTIFICATIONS, {
      uid,
      type,
      title,
      message,
      link,
      data,
      read: false,
      readAt: null,
      createdAt: new Date(),
    });

    // In production, a Cloud Function would send the FCM push notification here.
    return notification;
  } catch (error) {
    console.error('[LETCON] Error creating notification:', error);
    throw error;
  }
}

/**
 * Creates a notification for multiple users.
 * @param {Array<Object>} recipients - Array of { uid, type, title, message, link, data } objects.
 * @returns {Promise<Array<Object>>} Array of created notifications.
 */
export async function createBulkNotifications(recipients) {
  const results = [];
  for (const recipient of recipients) {
    const notification = await createNotification(recipient);
    results.push(notification);
  }
  return results;
}

/**
 * Sends a push notification via FCM.
 * @param {Object} options - Push notification options.
 * @param {string} options.token - The FCM device token.
 * @param {string} options.title - The notification title.
 * @param {string} options.body - The notification body.
 * @param {Object} [options.data] - Additional data payload.
 * @returns {Promise<void>}
 */
export async function sendPushNotification({ token, title, body, data = {} }) {
  // This should be handled by a Cloud Function in production.
  // The frontend cannot send FCM messages directly.
  console.log('[LETCON] Push notification would be sent:', { token, title, body, data });
}

/**
 * Convenience notification helpers for common events.
 */
export const notifyTaskApproved = (uid, taskTitle) =>
  createNotification({
    uid,
    type: NOTIFICATION_TYPES.TASK_APPROVED,
    title: 'Task Approved',
    message: `Your task "${taskTitle}" has been approved. Payment has been released to your wallet.`,
    link: '/earner/completed-tasks',
  });

export const notifyTaskRejected = (uid, taskTitle, reason) =>
  createNotification({
    uid,
    type: NOTIFICATION_TYPES.TASK_REJECTED,
    title: 'Task Rejected',
    message: `Your task "${taskTitle}" was rejected.${reason ? ` Reason: ${reason}` : ''}`,
    link: '/earner/completed-tasks',
  });

export const notifyTaskAccepted = (uid, taskTitle) =>
  createNotification({
    uid,
    type: NOTIFICATION_TYPES.TASK_ACCEPTED,
    title: 'Task Accepted',
    message: `You have accepted the task "${taskTitle}". Complete it using your verified account.`,
    link: '/earner/accepted-tasks',
  });

export const notifyWalletCredited = (uid, amount) =>
  createNotification({
    uid,
    type: NOTIFICATION_TYPES.WALLET_CREDITED,
    title: 'Wallet Credited',
    message: `₦${amount.toLocaleString()} has been added to your wallet.`,
    link: '/earner/wallet',
  });

export const notifyWithdrawalSuccessful = (uid, amount) =>
  createNotification({
    uid,
    type: NOTIFICATION_TYPES.WITHDRAWAL_SUCCESSFUL,
    title: 'Withdrawal Successful',
    message: `Your withdrawal of ₦${amount.toLocaleString()} has been processed successfully.`,
    link: '/earner/wallet',
  });

export const notifyVerificationApproved = (uid) =>
  createNotification({
    uid,
    type: NOTIFICATION_TYPES.VERIFICATION_APPROVED,
    title: 'Verification Approved',
    message: 'Congratulations! Your account has been verified. You can now start accepting tasks.',
    link: '/earner/dashboard',
  });

export const notifyVerificationRejected = (uid, reason) =>
  createNotification({
    uid,
    type: NOTIFICATION_TYPES.VERIFICATION_REJECTED,
    title: 'Verification Rejected',
    message: `Your verification was rejected.${reason ? ` Reason: ${reason}` : ''}`,
    link: '/earner/dashboard',
  });

export const notifyNewTaskAvailable = (uid, taskTitle) =>
  createNotification({
    uid,
    type: NOTIFICATION_TYPES.NEW_TASK_AVAILABLE,
    title: 'New Task Available',
    message: `A new task "${taskTitle}" is available for you.`,
    link: '/earner/available-tasks',
  });

export const notifyAccountChangeApproved = (uid) =>
  createNotification({
    uid,
    type: NOTIFICATION_TYPES.ACCOUNT_CHANGE_APPROVED,
    title: 'Account Change Approved',
    message: 'Your account change request has been approved. Your verified account has been updated.',
    link: '/earner/verified-account',
  });

export const notifyAccountChangeRejected = (uid, reason) =>
  createNotification({
    uid,
    type: NOTIFICATION_TYPES.ACCOUNT_CHANGE_REJECTED,
    title: 'Account Change Rejected',
    message: `Your account change request was rejected.${reason ? ` Reason: ${reason}` : ''}`,
    link: '/earner/verified-account',
  });

export const notifyAccountMismatchFlagged = (uid, taskTitle) =>
  createNotification({
    uid,
    type: NOTIFICATION_TYPES.ACCOUNT_MISMATCH_FLAGGED,
    title: 'Account Mismatch Flagged',
    message: `Your submission for "${taskTitle}" was flagged because it does not match your verified account.`,
    link: '/earner/completed-tasks',
  });

export const notifyUpgradeApproved = (uid, newTier) =>
  createNotification({
    uid,
    type: NOTIFICATION_TYPES.UPGRADE_APPROVED,
    title: 'Upgrade Approved',
    message: `Your account has been upgraded to Tier ${newTier}. You can now see tasks in this tier.`,
    link: '/earner/dashboard',
  });

export const notifyUpgradeRejected = (uid, reason) =>
  createNotification({
    uid,
    type: NOTIFICATION_TYPES.UPGRADE_REJECTED,
    title: 'Upgrade Rejected',
    message: `Your upgrade request was rejected.${reason ? ` Reason: ${reason}` : ''}`,
    link: '/earner/dashboard',
  });