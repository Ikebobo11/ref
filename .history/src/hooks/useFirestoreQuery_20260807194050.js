/**
 * LETCON - useFirestoreQuery Hook
 * React hook for querying Firestore with real-time updates.
 */
import { useEffect, useState, useCallback } from 'react';
import { subscribeToQuery, queryDocuments } from '../services/firestoreService';

/**
 * Hook for real-time Firestore queries.
 * @param {string} collectionName - The collection name.
 * @param {Object} options - Query options.
 * @param {Array<Object>} [options.filters] - Array of { field, operator, value } filters.
 * @param {Array<Object>} [options.orderByFields] - Array of { field, direction } order objects.
 * @param {number} [options.limitCount] - Maximum documents.
