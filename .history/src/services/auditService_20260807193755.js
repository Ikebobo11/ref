/**
 * LETCON - Audit Log Service
 * Records all sensitive actions for security and compliance.
 */
import { addDocument, queryDocuments } from './firestoreService';
import { COLLECTIONS } from '../config/constants';

/**
 * Logs an audit event.
 * @param {Object} options - Audit log options.
 * @param {string} options.action - The action performed.
 * @param {string} options.actorId - The user ID performing the action.
 * @param {string} options.actorRole - The role of the actor.
 * @param {string} [options.targetId] - The target user/document ID.
 * @param {string} [options.targetType] - The target type (e.g., 'user', 'task', 'wallet').
 * @param {Object} [options.details] - Additional details.
 * @param {string} [options.ipAddress] - The IP address.
 * @param {string} [options.userAgent] - The user agent.
 * @returns {Promise<Object>} The audit log entry.
 */
export async function logAudit({
  action,
  actorId,
  actorRole,
  targetId,
  targetType,
  details = {},
  ipAddress,
  userAgent,
}) {
  try {
    return await addDocument(COLLECTIONS.AUDIT_LOGS, {
      action,
      actorId,
      actorRole,
      targetId,
      targetType,
      details,
      ipAddress,
      userAgent,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('[LETCON] Error logging audit event:', error);
    // Audit logging should never break the main flow
    return null;
  }
}

/**
 * Gets audit logs with filters.
 * @param {Object} options - Query options.
 * @param {string} [options.actorId] - Filter by actor ID.
 * @param {string} [options.action] - Filter by action.
 * @param {string} [options.targetId] - Filter by target ID.
 * @param {number} [options.limitCount] - Maximum results.
 * @returns {Promise<Array<Object>>} Array of audit logs.
 */
export async function getAuditLogs({ actorId, action, targetId, limitCount = 50 } = {}) {
  const filters = [];
  if (actorId) filters.push({ field: 'actorId', operator: '==', value: actorId });
  if (action) filters.push({ field: 'action', operator: '==', value: action });
  if (targetId) filters.push({ field: 'targetId', operator: '==', value: targetId });

  return queryDocuments(COLLECTIONS.AUDIT_LOGS, {
    filters,
    orderByFields: [{ field: 'createdAt', direction: 'desc' }],
    limitCount,
  });
}

/**
 * Convenience audit log helpers for common actions.
 */
export const logUserLogin = (actorId, actorRole, details = {}) =>
  logAudit({ action: 'user.login', actorId, actorRole, details });

export const logUserRegister = (actorId, actorRole, details = {}) =>
  logAudit({ action: 'user.register', actorId, actorRole, details });

export const logUserSuspend = (actorId, actorRole, targetId, details = {}) =>
  logAudit({ action: 'user.suspend', actorId, actorRole, targetId, targetType: 'user', details });

export const logUserBan = (actorId, actorRole, targetId, details = {}) =>
  logAudit({ action: 'user.ban', actorId, actorRole, targetId, targetType: 'user', details });

export const logVerificationApprove = (actorId, actorRole, targetId, details = {}) =>
  logAudit({ action: 'verification.approve', actorId, actorRole, targetId, targetType: 'verification', details });

export const logVerificationReject = (actorId, actorRole, targetId, details = {}) =>
  logAudit({ action: 'verification.reject', actorId, actorRole, targetId, targetType: 'verification', details });

export const logTaskApprove = (actorId, actorRole, targetId, details = {}) =>
  logAudit({ action: 'task.approve', actorId, actorRole, targetId, targetType: 'task', details });

export const logTaskReject = (actorId, actorRole, targetId, details = {}) =>
  logAudit({ action: 'task.reject', actorId, actorRole, targetId, targetType: 'task', details });

export const logWithdrawal = (actorId, actorRole, targetId, details = {}) =>
  logAudit({ action: 'wallet.withdrawal', actorId, actorRole, targetId, targetType: 'wallet', details });

export const logUpgradeApprove = (actorId, actorRole, targetId, details = {}) =>
  logAudit({ action: 'upgrade.approve', actorId, actorRole, targetId, targetType: 'upgrade', details });

export const logUpgradeReject = (actorId, actorRole, targetId, details = {}) =>
