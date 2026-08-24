/**
 * LETCON - Firebase Configuration
 * Initializes Firebase with environment variables and validates required config.
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
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

  if (missing.length > 0) {
    console.warn(
      `[LETCON] Missing Firebase environment variables: ${missing.join(', ')}. ` +
        'Copy .env.example to .env and fill in your Firebase project credentials.'
    );
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };
}

const firebaseConfig = validateFirebaseConfig();

/** Initialize Firebase app */
const app = initializeApp(firebaseConfig);

/** Firebase Authentication instance */
export const auth = getAuth(app);

/** Cloud Firestore instance with offline persistence enabled */
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

/** Firebase Storage instance */
export const storage = getStorage(app);

/**
