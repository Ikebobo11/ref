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
