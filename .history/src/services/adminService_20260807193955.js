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
    bannedBy: adminId,
    banReason: reason,
  });

  await logUserBan(adminId, adminRole, uid, { reason });
}

/**
 * Approves an earner verification request.
 * @param {string} requestId - The verification request ID.
 * @param {string} adminId - The admin's user ID.
 * @param {string} adminRole - The admin's role.
 * @param {string} [notes] - Admin notes.
 * @returns {Promise<void>}
 */
export async function approveVerification(requestId, adminId, adminRole, notes = '') {
  const request = await getDocument(COLLECTIONS.VERIFICATION_REQUESTS, requestId);
  if (!request) throw new Error('Verification request not found');

  const earnerId = request.uid;
  const tier = getTierFromFollowers(request.followerCount);

  await executeBatch([
    {
      type: 'update',
      collectionName: COLLECTIONS.VERIFICATION_REQUESTS,
      docId: requestId,
      data: {
        status: VERIFICATION_STATUS.APPROVED,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reviewNotes: notes,
      },
    },
    {
      type: 'update',
      collectionName: COLLECTIONS.USERS,
      docId: earnerId,
      data: {
        verified: true,
        verificationStatus: VERIFICATION_STATUS.APPROVED,
        verifiedAt: new Date(),
        tier,
        verifiedPlatform: request.platform,
        verifiedUsername: request.username,
        profileUrl: request.profileUrl,
        followerCount: request.followerCount,
        lastVerificationDate: new Date(),
      },
    },
    {
      type: 'update',
      collectionName: COLLECTIONS.EARNERS,
      docId: earnerId,
      data: {
        verified: true,
        verificationStatus: VERIFICATION_STATUS.APPROVED,
        verifiedAt: new Date(),
        tier,
        verifiedPlatform: request.platform,
        verifiedUsername: request.username,
        profileUrl: request.profileUrl,
        followerCount: request.followerCount,
      },
    },
  ]);

  await notifyVerificationApproved(earnerId);
  await logVerificationApprove(adminId, adminRole, requestId, { earnerId, tier });
}

/**
 * Rejects an earner verification request.
 * @param {string} requestId - The verification request ID.
 * @param {string} adminId - The admin's user ID.
 * @param {string} adminRole - The admin's role.
 * @param {string} reason - The rejection reason.
 * @returns {Promise<void>}
 */
export async function rejectVerification(requestId, adminId, adminRole, reason) {
  const request = await getDocument(COLLECTIONS.VERIFICATION_REQUESTS, requestId);
  if (!request) throw new Error('Verification request not found');

  await updateDocument(COLLECTIONS.VERIFICATION_REQUESTS, requestId, {
    status: VERIFICATION_STATUS.REJECTED,
    reviewedBy: adminId,
    reviewedAt: new Date(),
    reviewNotes: reason,
  });

  await updateDocument(COLLECTIONS.USERS, request.uid, {
    verificationStatus: VERIFICATION_STATUS.REJECTED,
  });

  await notifyVerificationRejected(request.uid, reason);
  await logVerificationReject(adminId, adminRole, requestId, { earnerId: request.uid, reason });
}

/**
 * Approves an upgrade request.
 * @param {string} requestId - The upgrade request ID.
 * @param {string} adminId - The admin's user ID.
 * @param {string} adminRole - The admin's role.
 * @param {string} [notes] - Admin notes.
 * @returns {Promise<void>}
 */
export async function approveUpgrade(requestId, adminId, adminRole, notes = '') {
  const request = await getDocument(COLLECTIONS.UPGRADE_REQUESTS, requestId);
  if (!request) throw new Error('Upgrade request not found');

  const earnerId = request.uid;
  const newTier = getTierFromFollowers(request.newFollowerCount);

  await executeBatch([
    {
      type: 'update',
      collectionName: COLLECTIONS.UPGRADE_REQUESTS,
      docId: requestId,
      data: {
        status: UPGRADE_STATUS.APPROVED,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reviewNotes: notes,
      },
    },
    {
      type: 'update',
      collectionName: COLLECTIONS.USERS,
      docId: earnerId,
      data: {
        tier: newTier,
        followerCount: request.newFollowerCount,
        profileUrl: request.newProfileLink,
        lastUpgradeDate: new Date(),
      },
    },
    {
      type: 'update',
      collectionName: COLLECTIONS.EARNERS,
      docId: earnerId,
      data: {
        tier: newTier,
        followerCount: request.newFollowerCount,
        profileUrl: request.newProfileLink,
      },
    },
  ]);

  await notifyUpgradeApproved(earnerId, newTier);
  await logUpgradeApprove(adminId, adminRole, requestId, { earnerId, newTier });
}

/**
 * Rejects an upgrade request.
 * @param {string} requestId - The upgrade request ID.
 * @param {string} adminId - The admin's user ID.
 * @param {string} adminRole - The admin's role.
 * @param {string} reason - The rejection reason.
 * @returns {Promise<void>}
 */
export async function rejectUpgrade(requestId, adminId, adminRole, reason) {
  const request = await getDocument(COLLECTIONS.UPGRADE_REQUESTS, requestId);
  if (!request) throw new Error('Upgrade request not found');

  await updateDocument(COLLECTIONS.UPGRADE_REQUESTS, requestId, {
    status: UPGRADE_STATUS.REJECTED,
    reviewedBy: adminId,
    reviewedAt: new Date(),
    reviewNotes: reason,
  });

  await notifyUpgradeRejected(request.uid, reason);
  await logUpgradeReject(adminId, adminRole, requestId, { earnerId: request.uid, reason });
}

/**
 * Approves an account change request.
 * @param {string} requestId - The account change request ID.
 * @param {string} adminId - The admin's user ID.
 * @param {string} adminRole - The admin's role.
 * @param {string} [notes] - Admin notes.
 * @returns {Promise<void>}
 */
export async function approveAccountChange(requestId, adminId, adminRole, notes = '') {
  const request = await getDocument(COLLECTIONS.ACCOUNT_CHANGE_REQUESTS, requestId);
  if (!request) throw new Error('Account change request not found');

  const earnerId = request.uid;
  const newTier = getTierFromFollowers(request.newFollowerCount);

  await executeBatch([
    {
      type: 'update',
      collectionName: COLLECTIONS.ACCOUNT_CHANGE_REQUESTS,
      docId: requestId,
      data: {
        status: ACCOUNT_CHANGE_STATUS.APPROVED,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reviewNotes: notes,
        previousAccount: {
          platform: request.previousPlatform,
          username: request.previousUsername,
          profileUrl: request.previousProfileUrl,
        },
      },
    },
    {
      type: 'update',
      collectionName: COLLECTIONS.USERS,
      docId: earnerId,
      data: {
        verifiedPlatform: request.newPlatform,
        verifiedUsername: request.newUsername,
        profileUrl: request.newProfileUrl,
        followerCount: request.newFollowerCount,
        tier: newTier,
        lastAccountChangeDate: new Date(),
      },
    },
    {
      type: 'update',
      collectionName: COLLECTIONS.EARNERS,
      docId: earnerId,
      data: {
        verifiedPlatform: request.newPlatform,
        verifiedUsername: request.newUsername,
        profileUrl: request.newProfileUrl,
        followerCount: request.newFollowerCount,
        tier: newTier,
      },
    },
  ]);

  await notifyAccountChangeApproved(earnerId);
  await logAccountChangeApprove(adminId, adminRole, requestId, {
    earnerId,
    oldPlatform: request.previousPlatform,
    newPlatform: request.newPlatform,
  });
}

/**
 * Rejects an account change request.
 * @param {string} requestId - The account change request ID.
 * @param {string} adminId - The admin's user ID.
 * @param {string} adminRole - The admin's role.
 * @param {string} reason - The rejection reason.
 * @returns {Promise<void>}
 */
export async function rejectAccountChange(requestId, adminId, adminRole, reason) {
  const request = await getDocument(COLLECTIONS.ACCOUNT_CHANGE_REQUESTS, requestId);
  if (!request) throw new Error('Account change request not found');

  await updateDocument(COLLECTIONS.ACCOUNT_CHANGE_REQUESTS, requestId, {
    status: ACCOUNT_CHANGE_STATUS.REJECTED,
    reviewedBy: adminId,
    reviewedAt: new Date(),
    reviewNotes: reason,
  });

  await notifyAccountChangeRejected(request.uid, reason);
  await logAccountChangeReject(adminId, adminRole, requestId, { earnerId: request.uid, reason });
}

/**
 * Invites a new admin.
 * @param {Object} options - Invite options.
 * @param {string} options.email - The admin email.
 * @param {string} options.fullName - The admin full name.
 * @param {string} options.superAdminId - The super admin's user ID.
 * @returns {Promise<Object>} The invite record.
 */
export async function inviteAdmin({ email, fullName, superAdminId }) {
  const invite = await addDocument(COLLECTIONS.ADMINS, {
    email,
    fullName,
    role: ROLES.ADMIN,
    status: 'invited',
    invitedBy: superAdminId,
    invitedAt: new Date(),
  });

  await logAdminInvite(superAdminId, ROLES.SUPER_ADMIN, invite.id, { email });
  return invite;
}

/**
 * Removes an admin.
 * @param {string} adminId - The admin user ID to remove.
 * @param {string} superAdminId - The super admin's user ID.
 * @returns {Promise<void>}
 */
export async function removeAdmin(adminId, superAdminId) {
  const admin = await getDocument(COLLECTIONS.ADMINS, adminId);
  if (!admin) throw new Error('Admin not found');

  await updateDocument(COLLECTIONS.ADMINS, adminId, {
    status: 'removed',
    removedBy: superAdminId,
    removedAt: new Date(),
  });

  await logAdminRemove(superAdminId, ROLES.SUPER_ADMIN, adminId, { email: admin.email });
}

/**
 * Gets pending verification requests.
 * @param {Object} options - Query options.
 * @returns {Promise<Array<Object>>} Array of verification requests.
 */
export async function getPendingVerifications({ limitCount = 50 } = {}) {
  return queryDocuments(COLLECTIONS.VERIFICATION_REQUESTS, {
    filters: [{ field: 'status', operator: '==', value: VERIFICATION_STATUS.PENDING }],
    orderByFields: [{ field: 'createdAt', direction: 'asc' }],
    limitCount,
  });
}

/**
 * Gets pending upgrade requests.
 * @param {Object} options - Query options.
 * @returns {Promise<Array<Object>>} Array of upgrade requests.
 */
export async function getPendingUpgrades({ limitCount = 50 } = {}) {
  return queryDocuments(COLLECTIONS.UPGRADE_REQUESTS, {
    filters: [{ field: 'status', operator: '==', value: UPGRADE_STATUS.PENDING }],
    orderByFields: [{ field: 'createdAt', direction: 'asc' }],
    limitCount,
  });
}

/**
 * Gets pending account change requests.
 * @param {Object} options - Query options.
 * @returns {Promise<Array<Object>>} Array of account change requests.
 */
export async function getPendingAccountChanges({ limitCount = 50 } = {}) {
  return queryDocuments(COLLECTIONS.ACCOUNT_CHANGE_REQUESTS, {
    filters: [{ field: 'status', operator: '==', value: ACCOUNT_CHANGE_STATUS.PENDING }],
    orderByFields: [{ field: 'createdAt', direction: 'asc' }],
    limitCount,
  });
}

/**
 * Gets flagged task submissions (verified account mismatches).
 * @param {Object} options - Query options.
