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
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

/**
 * Deletes a document.
 * @param {string} collectionName - The collection name.
 * @param {string} docId - The document ID.
 * @returns {Promise<void>}
 */
export async function deleteDocument(collectionName, docId) {
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

/**
 * Queries documents with filters, ordering, and pagination.
 * @param {string} collectionName - The collection name.
 * @param {Object} options - Query options.
 * @param {Array<Object>} [options.filters] - Array of { field, operator, value } filter objects.
 * @param {Array<Object>} [options.orderByFields] - Array of { field, direction } order objects.
 * @param {number} [options.limitCount] - Maximum number of documents to return.
 * @param {Object} [options.cursor] - Pagination cursor document.
 * @returns {Promise<Array<Object>>} Array of document data.
 */
export async function queryDocuments(collectionName, {
  filters = [],
  orderByFields = [],
  limitCount = 20,
  cursor = null,
} = {}) {
  try {
    let q = collection(db, collectionName);

    const constraints = [];

    filters.forEach(({ field, operator, value }) => {
      constraints.push(where(field, operator, value));
    });

    orderByFields.forEach(({ field, direction = 'asc' }) => {
      constraints.push(orderBy(field, direction));
    });

    if (cursor) {
      constraints.push(startAfter(cursor));
    }

    constraints.push(limit(limitCount));

    const queryRef = query(q, ...constraints);
    const snapshot = await getDocs(queryRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(getFirestoreErrorMessage(error));
  }
}

/**
 * Subscribes to a document with real-time updates.
 * @param {string} collectionName - The collection name.
 * @param {string} docId - The document ID.
 * @param {Function} callback - Callback with the document data.
 * @returns {Function} Unsubscribe function.
 */
export function subscribeToDocument(collectionName, docId, callback) {
  const docRef = doc(db, collectionName, docId);
  return onSnapshot(
    docRef,
    (snapshot) => {
      callback(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
    },
    (error) => {
      console.error(`[LETCON] Error subscribing to ${collectionName}/${docId}:`, error);
    }
  );
}

/**
