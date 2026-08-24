/**
 * LETCON - useDocument Hook
 * React hook for subscribing to a single Firestore document.
 */
import { useEffect, useState, useRef } from 'react';
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
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Safety timeout: never let a page hang on loading forever.
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      if (!error) setError(new Error(`Document ${collectionName}/${docId} timed out`));
    }, 8000);

    if (!realtime) {
      getDocument(collectionName, docId)
        .then((result) => {
          setData(result);
          setError(null);
        })
        .catch((err) => setError(err))
        .finally(() => {
          clearTimeout(timeoutRef.current);
          setLoading(false);
        });
      return;
    }

    const unsubscribe = subscribeToDocument(collectionName, docId, (doc, err) => {
      clearTimeout(timeoutRef.current);
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

    return () => {
      clearTimeout(timeoutRef.current);
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, docId, realtime]);

  return { data, loading, error };
}
