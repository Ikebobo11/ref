/**
 * LETCON - useDocument Hook
 * React hook for subscribing to a single Firestore document.
 */
import { useEffect, useState } from 'react';
import { subscribeToDocument, getDocument } from '../services/firestoreService';

/**
 * Hook for real-time document subscription.
 * @param {string} collectionName - The collection name.
