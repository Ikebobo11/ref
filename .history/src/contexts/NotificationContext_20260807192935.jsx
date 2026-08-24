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
