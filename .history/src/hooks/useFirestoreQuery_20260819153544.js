/**
 * LETCON - useFirestoreQuery Hook
 * React hook for querying Firestore with real-time updates.
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { subscribeToQuery, queryDocuments } from '../services/firestoreService';

/**
 * Hook for real-time Firestore queries.
 * @param {string} collectionName - The collection name.
 * @param {Object} options - Query options.
 * @param {Array<Object>} [options.filters] - Array of { field, operator, value } filters.
 * @param {Array<Object>} [options.orderByFields] - Array of { field, direction } order objects.
 * @param {number} [options.limitCount] - Maximum documents.
 * @param {boolean} [options.realtime=true] - Whether to subscribe to real-time updates.
 * @returns {Object} { data, loading, error, refetch }
 */
export function useFirestoreQuery(collectionName, {
  filters = [],
  orderByFields = [],
  limitCount = 20,
  realtime = true,
} = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  /**
   * Clears the safety timeout.
   */
  const clearSafetyTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Fetches data once (non-realtime).
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await queryDocuments(collectionName, { filters, orderByFields, limitCount });
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [collectionName, JSON.stringify(filters), JSON.stringify(orderByFields), limitCount]);

  /**
   * Subscribes to real-time updates.
   */
  useEffect(() => {
    if (!realtime) {
      fetchData();
      return;
    }

    setLoading(true);
    clearSafetyTimeout();

    // Safety timeout: never let a page hang on loading forever.
    // If Firestore doesn't respond within 8 seconds, show as done.
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      if (!error) setError(new Error(`Query timed out for ${collectionName}`));
    }, 8000);

    const unsubscribe = subscribeToQuery(
      collectionName,
      { filters, orderByFields, limitCount },
      (items, err) => {
        clearSafetyTimeout();
        if (err) {
          // Don't clear existing data on subscription error —
          // keep the last known good data so messages don't disappear.
          console.error(`[LETCON] Query error for ${collectionName}:`, err);
          setError(err);
          setLoading(false);
          return;
        }
        setData(items);
        setLoading(false);
        setError(null);
      }
    );

    return () => {
      clearSafetyTimeout();
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, JSON.stringify(filters), JSON.stringify(orderByFields), limitCount, realtime]);

  return { data, loading, error, refetch: fetchData };
}
