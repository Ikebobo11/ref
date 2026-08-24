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
