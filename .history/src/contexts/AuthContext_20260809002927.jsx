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
import { getDocument, setDocument } from '../services/firestoreService';
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
   * Auto-detects a user's role by checking role-specific collections.
   * @param {string} uid - The user's UID.
   * @returns {Promise<string|null>} The detected role or null.
   */
  const detectRole = useCallback(async (uid) => {
    const roleChecks = [
      { role: ROLES.EARNER, collection: COLLECTIONS.EARNERS },
      { role: ROLES.ADVERTISER, collection: COLLECTIONS.ADVERTISERS },
      { role: ROLES.ADMIN, collection: COLLECTIONS.ADMINS },
    ];

    for (const { role, collection } of roleChecks) {
      try {
        const roleDoc = await getDoc(doc(db, collection, uid));
        if (roleDoc.exists()) {
          return role;
        }
      } catch (error) {
        console.error(`[LETCON] Error checking ${collection} for role detection:`, error);
      }
    }
    return null;
  }, []);

  /**
   * Auto-creates missing user documents (user profile, wallet, role doc).
   * @param {Object} firebaseUser - The Firebase user object.
   * @param {string} role - The detected role.
   * @returns {Promise<Object>} The complete user data.
   */
  const ensureUserDocuments = useCallback(async (firebaseUser, role) => {
    const uid = firebaseUser.uid;
    const email = firebaseUser.email || '';
    const fullName = firebaseUser.displayName ||

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
   * @param {string} userInfo.fullName - User full name.
   * @param {string} userInfo.role - User role.
   * @param {Object} [userInfo.profile] - Additional profile data.
   * @returns {Promise<Object>} The created user.
   */
  const register = async ({ email, password, fullName, role, profile = {} }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await updateProfile(userCredential.user, { displayName: fullName });

      const userDoc = {
        uid,
        email,
        fullName,
        role,
        status: 'active',
        suspended: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...profile,
      };

      await setDoc(doc(db, COLLECTIONS.USERS, uid), userDoc);

      // Create role-specific document
      const roleCollection = role === ROLES.EARNER
        ? COLLECTIONS.EARNERS
        : role === ROLES.ADVERTISER
          ? COLLECTIONS.ADVERTISERS
          : null;

      if (roleCollection) {
        await setDoc(doc(db, roleCollection, uid), {
          uid,
          email,
          fullName,
          createdAt: serverTimestamp(),
          ...profile,
        });
      }

      // Create wallet for the user
      await setDoc(doc(db, COLLECTIONS.WALLETS, uid), {
        uid,
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const data = await fetchUserData(uid);
      setUserData(data);
      return { user: userCredential.user, userData: data };
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  };

  /**
   * Signs out the current user.
   */
  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserData(null);
  };

  /**
   * Sends a password reset email.
   * @param {string} email - User email.
   */
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  };

  /**
   * Refreshes the user's profile data.
   */
  const refreshUserData = useCallback(async () => {
    if (user) {
      const data = await fetchUserData(user.uid);
      setUserData(data);
      return data;
    }
    return null;
  }, [user, fetchUserData]);

  /** Role helpers */
  const isSuperAdmin = userData?.role === ROLES.SUPER_ADMIN;
  const isAdmin = userData?.role === ROLES.ADMIN;
  const isAdvertiser = userData?.role === ROLES.ADVERTISER;
  const isEarner = userData?.role === ROLES.EARNER;
  const isStaff = isSuperAdmin || isAdmin;

  const value = {
    user,
    userData,
    loading,
    initializing,
    login,
    register,
    logout,
    resetPassword,
    refreshUserData,
    isSuperAdmin,
    isAdmin,
    isAdvertiser,
    isEarner,
    isStaff,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use the auth context.
 * @returns {Object} Auth context value.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}