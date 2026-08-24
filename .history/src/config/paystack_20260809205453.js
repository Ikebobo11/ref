/**
 * LETCON - Paystack Configuration
 * Centralizes Paystack integration settings and helpers.
 */
import { CURRENCY } from './constants';

/** Paystack public key from environment */
export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

/** Whether Paystack is configured with a real key */
export const isPaystackConfigured = Boolean(
  PAYSTACK_PUBLIC_KEY && PAYSTACK_PUBLIC_KEY !== 'pk_test_your-paystack-public-key'
);

/** Default currency for all Paystack transactions */
export const PAYSTACK_CURRENCY = CURRENCY;

/**
 * Builds a Paystack inline checkout handler.
 * @param {Object} options - Paystack popup options.
 * @param {string} options.email - Customer email.
 * @param {number} options.amount - Amount in kobo (Paystack uses smallest currency unit).
 * @param {string} options.reference - Unique transaction reference.
 * @param {Function} options.onSuccess - Callback on successful payment.
 * @param {Function} options.onCancel - Callback on payment cancellation.
 * @param {string} [options.metadata] - Additional metadata JSON string.
 * @returns {Function} A function that opens the Paystack popup.
 */
export function createPaystackHandler({ email, amount, reference, onSuccess, onCancel, metadata }) {
  return () => {
    if (!isPaystackConfigured) {
      console.warn('[LETCON] Paystack is not configured. Add VITE_PAYSTACK_PUBLIC_KEY to .env');
      return;
    }

    if (typeof window.PaystackPop === 'undefined') {
      console.error('[LETCON] Paystack script not loaded. Add the Paystack inline script to index.html');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: Math.round(amount * 100), // Convert naira to kobo
      currency: PAYSTACK_CURRENCY,
      ref: reference,
      metadata: metadata ? JSON.parse(metadata) : undefined,
      callback: (response) => {
        onSuccess?.(response);
      },
      onClose: () => {
        onCancel?.();
      },
    });

    handler.openIframe();
  };
}

/**
 * Generates a unique transaction reference.
 * @param {string} prefix - Reference prefix (e.g., 'VER', 'TASK', 'WALLET').
 * @returns {string} A unique reference string.
 */
export function generateReference(prefix = 'LET') {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
