/**
 * LETCON - Firestore Service
 * Reusable Firestore operations for CRUD, queries, and real-time subscriptions.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getFirestoreErrorMessage } from '../utils/errors';

/**
 * Gets a document by ID from a collection.
 * @param {string} collectionName - The collection name.
 * @param {string} docId - The document ID.
 * @returns {Promise<Object|null>} The document data or null.
 */
export async function getDocument(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

/**
 * Creates or updates a document.
 * @param {string} collectionName - The collection name.
 * @param {string} docId - The document ID.
 * @param {Object} data - The document data.
 * @returns {Promise<Object>} The created/updated document.
 */
export async function setDocument(collectionName, docId, data) {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return { id: docId, ...data };
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

/**
 * Creates a new document with an auto-generated ID.
 * @param {string} collectionName - The collection name.
 * @param {Object} data - The document data.
 * @returns {Promise<Object>} The created document.
 */
export async function addDocument(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...data };
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

/**
 * Updates a document.
 * @param {string} collectionName - The collection name.
 * @param {string} docId - The document ID.
 * @param {Object} data - The data to update.
 * @returns {Promise<void>}
 */
export async function updateDocument(collectionName, docId, data) {
  try {
