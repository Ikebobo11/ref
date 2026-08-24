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
