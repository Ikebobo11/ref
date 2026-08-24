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
