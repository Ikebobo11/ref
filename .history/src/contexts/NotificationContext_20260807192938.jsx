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
