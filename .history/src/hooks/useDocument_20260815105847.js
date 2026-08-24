/**
 * LETCON - useDocument Hook
 * React hook for subscribing to a single Firestore document.
 */
import { useEffect, useState } from 'react';
import { subscribeToDocument, getDocument } from '../services/firestoreService';

/**
 * Hook for real-time document subscription.
 * @param {string} collectionName - The collection name.
 * @param {string} docId - The document ID.
 * @param {boolean} [realtime=true] - Whether to subscribe to real-time updates.
 * @returns {Object} { data, loading, error }
 */
export function useDocument(collectionName, docId, realtime = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (!realtime) {
      getDocument(collectionName, docId)
        .then((result) => {
          setData(result);
          setError(null);
        })
        .catch((err) => setError(err))
        .finally(() => setLoading(false));
      return;
    }

    const unsubscribe = subscribeToDocument(collectionName, docId, (doc, err) => {
      if (err) {
        setError(err);
        setLoading(false);
        setData(null);
        return;
      }
      setData(doc);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [collectionName, docId, realtime]);

  return { data, loading, error };
}