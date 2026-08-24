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
import { db, messaging } from '../config/firebase';
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
  const [permission, setPermission] = useState('default');

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
