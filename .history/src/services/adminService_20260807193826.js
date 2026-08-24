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
