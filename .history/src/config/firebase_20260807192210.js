/**
 * LETCON - Firebase Configuration
 * Initializes Firebase with environment variables and validates required config.
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

/**
 * Validates that all required Firebase environment variables are present.
 * @returns {Object} The validated Firebase config object.
 * @throws {Error} If any required environment variable is missing.
 */
function validateFirebaseConfig() {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  const missing = requiredVars.filter((key) => !import.meta.env[key]);

