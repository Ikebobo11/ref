/**
 * LETCON - Paystack Configuration
 * Centralizes Paystack integration settings and helpers.
 */
import { CURRENCY } from './constants';

/** Paystack public key from environment */
export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

/** Whether Paystack is configured with a real key */
