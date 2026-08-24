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
import { COLLECTIONS, VERIFICATION_STATUS, UPGRADE_STATUS, ACCOUNT_CHANGE_STATUS, ROLES } from '../config/constants';
import { getTierFromFollowers } from '../utils/tierLogic';
import {
  notifyVerificationApproved,
  notifyVerificationRejected,
  notifyUpgradeApproved,
  notifyUpgradeRejected,
  notifyAccountChangeApproved,
  notifyAccountChangeRejected,
} from './notificationService';
import {
  logVerificationApprove,
  logVerificationReject,
  logUpgradeApprove,
  logUpgradeReject,
  logAccountChangeApprove,
  logAccountChangeReject,
  logUserSuspend,
  logUserBan,
  logAdminInvite,
  logAdminRemove,
} from './auditService';

/**
 * Gets all users with optional role filter.
 * @param {Object} options - Query options.
 * @param {string} [options.role] - Filter by role.
 * @param {string} [options.status] - Filter by status.
 * @param {number} [options.limitCount] - Maximum results.
 * @returns {Promise<Array<Object>>} Array of users.
 */
export async function getUsers({ role, status, limitCount = 50 } = {}) {
  const filters = [];
  if (role) filters.push({ field: 'role', operator: '==', value: role });
  if (status) filters.push({ field: 'status', operator: '==', value: status });

  return queryDocuments(COLLECTIONS.USERS, {
    filters,
    orderByFields: [{ field: 'createdAt', direction: 'desc' }],
    limitCount,
  });
}

/**
 * Suspends a user account.
 * @param {string} uid - The user ID to suspend.
 * @param {string} adminId - The admin performing the action.
 * @param {string} adminRole - The admin's role.
 * @param {string} [reason] - The suspension reason.
 * @returns {Promise<void>}
 */
export async function suspendUser(uid, adminId, adminRole, reason = '') {
  await updateDocument(COLLECTIONS.USERS, uid, {
    suspended: true,
    status: 'suspended',
    suspendedAt: new Date(),
    suspendedBy: adminId,
    suspensionReason: reason,
  });

  await logUserSuspend(adminId, adminRole, uid, { reason });
}

/**
 * Unsuspends a user account.
 * @param {string} uid - The user ID to unsuspend.
 * @param {string} adminId - The admin performing the action.
 * @param {string} adminRole - The admin's role.
 * @returns {Promise<void>}
 */
export async function unsuspendUser(uid, adminId, adminRole) {
  await updateDocument(COLLECTIONS.USERS, uid, {
    suspended: false,
    status: 'active',
    unsuspendedAt: new Date(),
    unsuspendedBy: adminId,
  });

  await logAudit({ action: 'user.unsuspend', actorId: adminId, actorRole: adminRole, targetId: uid, targetType: 'user' });
}

/**
 * Permanently bans a user.
 * @param {string} uid - The user ID to ban.
 * @param {string} adminId - The admin performing the action.
 * @param {string} adminRole - The admin's role.
 * @param {string} [reason] - The ban reason.
 * @returns {Promise<void>}
 */
export async function banUser(uid, adminId, adminRole, reason = '') {
  await updateDocument(COLLECTIONS.USERS, uid, {
    banned: true,
    status: 'banned',
    bannedAt: new Date(),
