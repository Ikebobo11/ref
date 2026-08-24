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
