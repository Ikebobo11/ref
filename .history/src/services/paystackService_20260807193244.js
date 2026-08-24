/**
 * LETCON - Paystack Service
 * Handles payment initialization, verification, and webhook processing.
 */
import axios from 'axios';
import { PAYSTACK_PUBLIC_KEY, isPaystackConfigured, generateReference } from '../config/paystack';
import { FEES, COLLECTIONS } from '../config/constants';
import { addDocument, updateDocument, getDocument } from './firestoreService';

/** Paystack API base URL */
const PAYSTACK_API_URL = 'https://api.paystack.co';

/**
 * Initializes a Paystack payment.
 * @param {Object} options - Payment options.
 * @param {string} options.email - Customer email.
 * @param {number} options.amount - Amount in naira.
 * @param {string} options.metadata - Metadata JSON string.
 * @param {string} [options.reference] - Custom reference (auto-generated if not provided).
 * @returns {Promise<Object>} Payment initialization result.
 */
export async function initializePayment({ email, amount, metadata, reference }) {
  if (!isPaystackConfigured) {
    throw new Error('Paystack is not configured. Add VITE_PAYSTACK_PUBLIC_KEY to .env');
  }

  const ref = reference || generateReference('PAY');

  try {
    // In production, this should be called from a Cloud Function to keep the secret key server-side.
    // For the frontend, we use the inline checkout which handles this client-side.
    return {
      reference: ref,
      email,
      amount,
      metadata,
    };
  } catch (error) {
    console.error('[LETCON] Paystack initialization error:', error);
    throw new Error('Failed to initialize payment');
  }
}

/**
 * Verifies a Paystack transaction.
 * @param {string} reference - The transaction reference.
 * @returns {Promise<Object>} Verification result.
 */
export async function verifyTransaction(reference) {
  try {
    // This should be called from a Cloud Function in production.
    // The frontend should not have access to the secret key.
