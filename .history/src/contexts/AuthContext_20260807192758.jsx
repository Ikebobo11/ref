/**
 * LETCON - Authentication Context
 * Manages user authentication state, role-based access, and user profile data.
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { COLLECTIONS, ROLES } from '../config/constants';
import { getAuthErrorMessage } from '../utils/errors';

const AuthContext = createContext(null);

/**
 * Auth Provider component that wraps the app.
