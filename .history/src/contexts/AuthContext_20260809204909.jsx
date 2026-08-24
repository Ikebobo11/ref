/**
 * LETCON - Authentication Context
 * Manages user authentication state, role-based access, and user profile data.
 */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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

  // Simple in-memory cache for user data to avoid redundant Firestore reads
  const userDataCache = useRef(new Map());

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
    const fullName = firebaseUser.displayName || email.split('@')[0] || 'User';

    const now = serverTimestamp();

    // 1. Create/update users/{uid}
    const userData = {
      uid,
      email,
      fullName,
      role,
      status: 'active',
      suspended: false,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, COLLECTIONS.USERS, uid), userData, { merge: true });

    // 2. Create/update role-specific document
    const roleCollection = role === ROLES.EARNER
      ? COLLECTIONS.EARNERS
      : role === ROLES.ADVERTISER
        ? COLLECTIONS.ADVERTISERS
        : role === ROLES.ADMIN
          ? COLLECTIONS.ADMINS
          : null;

    if (roleCollection) {
      await setDoc(doc(db, roleCollection, uid), { ...userData }, { merge: true });
    }

    // 3. Create/update wallet
    await setDoc(doc(db, COLLECTIONS.WALLETS, uid), {
      uid,
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      updatedAt: now,
    }, { merge: true });

    return { id: uid, ...userData };
  }, []);

  /**
   * Fetches the user's profile data from Firestore with auto-creation fallback.
   * Uses a cache to avoid redundant reads on repeated calls.
   * @param {Object} firebaseUser - The Firebase user object.
   * @param {boolean} [forceRefresh=false] - Bypass the cache and re-fetch.
   * @returns {Promise<Object|null>} The user profile data.
   */
  const fetchUserData = useCallback(async (firebaseUser, forceRefresh = false) => {
    const uid = firebaseUser?.uid;
    if (!uid) return null;

    // Check the cache first (unless forceRefresh)
    if (!forceRefresh && userDataCache.current.has(uid)) {
      return userDataCache.current.get(uid);
    }

    try {
      // Check users collection first
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));

      let result;
      if (userDoc.exists()) {
        const data = userDoc.data();
        // If role exists, return it
        if (data.role) {
          result = { id: userDoc.id, ...data };
        } else {
          // Role missing - try to detect and fill it in
          const detectedRole = await detectRole(uid);
          if (detectedRole) {
            result = await ensureUserDocuments(firebaseUser, detectedRole);
          } else {
            // No role anywhere - default to earner
            result = await ensureUserDocuments(firebaseUser, ROLES.EARNER);
          }
        }
      } else {
        // No user doc - detect role from role-specific collections
        const detectedRole = await detectRole(uid);
        if (detectedRole) {
          result = await ensureUserDocuments(firebaseUser, detectedRole);
        } else {
          // No role detected anywhere - create as earner by default
          result = await ensureUserDocuments(firebaseUser, ROLES.EARNER);
        }
      }

      // Cache the result
      userDataCache.current.set(uid, result);
      return result;
    } catch (error) {
      // Distinguish between "document not found" (recoverable) and real errors
      // (permissions, network). For real errors, fall back to a minimal profile
      // so the user can still be routed by role instead of being blocked.
      console.error('[LETCON] Error fetching user data:', error);

      // Try to detect the role even if the users doc read failed, so we can
      // still route the user correctly.
      try {
        const detectedRole = await detectRole(uid);
        if (detectedRole) {
          const fallback = {
            id: uid,
            uid,
            email: firebaseUser.email || '',
            fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            role: detectedRole,
            status: 'active',
            suspended: false,
          };
          userDataCache.current.set(uid, fallback);
          return fallback;
        }
      } catch (roleError) {
        console.error('[LETCON] Error detecting role in fallback:', roleError);
      }

      return null;
    }
  }, [detectRole, ensureUserDocuments]);
   * @returns {Promise<Object>} The signed-in user.
   */
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Use cache if available (onAuthStateChanged likely already fetched it)
      const data = await fetchUserData(userCredential.user);
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

      // Ensure all user documents are created with the correct role
      await ensureUserDocuments(userCredential.user, role);

      // Add any additional profile data
      if (Object.keys(profile).length > 0) {
        await setDoc(doc(db, COLLECTIONS.USERS, uid), profile, { merge: true });
        const roleCollection = role === ROLES.EARNER
          ? COLLECTIONS.EARNERS
          : role === ROLES.ADVERTISER
            ? COLLECTIONS.ADVERTISERS
            : null;
        if (roleCollection) {
          await setDoc(doc(db, roleCollection, uid), profile, { merge: true });
        }
      }

      const data = await fetchUserData(userCredential.user);
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
      const data = await fetchUserData(user, true);
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