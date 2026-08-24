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
