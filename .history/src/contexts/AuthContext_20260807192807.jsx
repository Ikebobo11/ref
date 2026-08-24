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
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  /**
   * Fetches the user's profile data from Firestore.
   * @param {string} uid - The user's UID.
   * @returns {Promise<Object|null>} The user profile data.
   */
  const fetchUserData = useCallback(async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('[LETCON] Error fetching user data:', error);
      return null;
    }
  }, []);

  /**
   * Listens for authentication state changes.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const data = await fetchUserData(firebaseUser.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }
      setLoading(false);
      setInitializing(false);
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  /**
   * Signs in a user with email and password.
   * @param {string} email - User email.
   * @param {string} password - User password.
   * @returns {Promise<Object>} The signed-in user.
   */
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const data = await fetchUserData(userCredential.user.uid);
      setUserData(data);
      return { user: userCredential.user, userData: data };
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  };

  /**
   * Registers a new user and creates their profile.
   * @param {Object} userInfo - User registration data.
   * @param {string} userInfo.email - User email.
   * @param {string} userInfo.password - User password.
