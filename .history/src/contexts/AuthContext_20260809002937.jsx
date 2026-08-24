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
    await setDocument(COLLECTIONS.USERS, uid, userData);

    // 2. Create/update role-specific document
    const roleCollection = role === ROLES.EARNER
      ? COLLECTIONS.EARNERS
      : role === ROLES.ADVERTISER
        ? COLLECTIONS.ADVERTISERS
        : role === ROLES.ADMIN
          ? COLLECTIONS.ADMINS
          : null;

    if (roleCollection) {
      await setDocument(roleCollection, uid, { ...userData });
    }

    // 3. Create/update wallet
    await setDocument(COLLECTIONS.WALLETS, uid, {
      uid,
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      updatedAt: now,
    });

    return { id: uid, ...userData };
  }, []);

  /**
   * Fetches the user's profile data from Firestore with auto-creation fallback.
   * @param {Object} firebaseUser - The Firebase user object.
   * @returns {Promise<Object|null>} The user profile data.
   */
  const fetchUserData = useCallback(async (firebaseUser) => {
    const uid = firebaseUser?.uid;
    if (!uid) return null;

    try {
      // Check users collection first
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        // If role exists, return it
        if (data.role) {
          return { id: userDoc.id, ...data };
        }
        // Role missing - try to detect and fill it in
        const detectedRole = await detectRole(uid);
        if (detectedRole) {
          const fullData = await ensureUserDocuments(firebaseUser, detectedRole);
          return fullData;
        }
        // No role anywhere - default to earner if no role-specific doc exists
        const defaultRole = ROLES.EARNER;
        const fullData = await ensureUserDocuments(firebaseUser, defaultRole);
        return fullData;
      }

      // No user doc - detect role from role-specific collections
      const detectedRole = await detectRole(uid);
      if (detectedRole) {
        const fullData = await ensureUserDocuments(firebaseUser, detectedRole);
        return fullData;
      }

      // No role detected anywhere - create as earner by default
      const defaultRole = ROLES.EARNER;
      const fullData = await ensureUserDocuments(firebaseUser, defaultRole);
      return fullData;
    } catch (error) {
      console.error('[LETCON] Error fetching user data:', error);
      return null;
    }
  }, [detectRole, ensureUserDocuments]);

  /**
   * Listens for authentication state changes.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const data = await fetchUserData(firebaseUser);
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
      // Ensure the user document is created with the correct role
      await ensureUserDocuments(userCredential.user, role);

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

      const data = await fetchUserData(userCredential.user);
      setUserData(data);
      return { user: userCredential.user, userData: data };
    } catch
