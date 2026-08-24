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
