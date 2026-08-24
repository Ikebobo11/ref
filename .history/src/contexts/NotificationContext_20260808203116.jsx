/**
 * LETCON - Notification Context
 * Manages in-app notifications and Firebase Cloud Messaging integration.
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { getToken, onMessage } from 'firebase/messaging';
import { db, messagingPromise } from '../config/firebase';
import { COLLECTIONS, QUERY_LIMITS } from '../config/constants';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

/**
 * Notification Provider component.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components.
 */
export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fcmToken, setFcmToken] = useState(null);
  const

  /**
   * Subscribes to the user's notifications.
   */
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
    const notificationsQuery = query(
      notificationsRef,
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(QUERY_LIMITS.LARGE)
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setNotifications(items);
        setUnreadCount(items.filter((n) => !n.read).length);
      },
      (error) => {
        console.error('[LETCON] Notifications subscription error:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  /**
   * Requests notification permission and gets the FCM token.
   */
  const requestPermission = useCallback(async () => {
    if (!messaging || !user) return null;

    try {
      const currentPermission = await Notification.requestPermission();
      setPermission(currentPermission);

      if (currentPermission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FCM_VAPID_KEY,
        });
        setFcmToken(token);
        return token;
      }
      return null;
    } catch (error) {
      console.error('[LETCON] FCM permission error:', error);
      return null;
    }
  }, [user]);

  /**
   * Listens for foreground messages.
   */
  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[LETCON] Foreground message:', payload);
      // The onSnapshot subscription will pick up the notification from Firestore
    });

    return () => unsubscribe();
  }, []);

  /**
   * Marks a single notification as read.
   * @param {string} notificationId - The notification ID.
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), {
        read: true,
        readAt: new Date(),
      });
    } catch (error) {
      console.error('[LETCON] Error marking notification as read:', error);
    }
  }, []);

  /**
   * Marks all notifications as read.
   */
  const markAllAsRead = useCallback(async () => {
    if (!user || notifications.length === 0) return;

    try {
      const batch = writeBatch(db);
      notifications
        .filter((n) => !n.read)
        .forEach((n) => {
          batch.update(doc(db, COLLECTIONS.NOTIFICATIONS, n.id), {
            read: true,
            readAt: new Date(),
          });
        });
      await batch.commit();
    } catch (error) {
      console.error('[LETCON] Error marking all notifications as read:', error);
    }
  }, [user, notifications]);

  const value = {
    notifications,
    unreadCount,
    fcmToken,
    permission,
    requestPermission,
    markAsRead,
    markAllAsRead,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

/**
 * Hook to use the notification context.
 * @returns {Object} Notification context value.
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}