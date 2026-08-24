/**
 * LETCON - Notification Service
 * Creates in-app notifications and sends FCM push notifications.
 */
import { addDocument, getDocument } from './firestoreService';
import { COLLECTIONS, NOTIFICATION_TYPES } from '../config/constants';

/**
 * Creates a notification for a user.
