/**
 * LETCON - Paystack Service
 * Handles payment initialization, verification, and webhook processing.
 */
import axios from 'axios';
import { PAYSTACK_PUBLIC_KEY, isPaystackConfigured, generateReference } from '../config/paystack';
import { FEES, COLLECTIONS } from '../config/constants';
import { addDocument, setDocument, updateDocument, getDocument } from './firestoreService';

/** Paystack API base URL */
const PAYSTACK_API_URL = 'https://api.paystack.co';

/**
 * Initializes a Paystack payment.
 * @param {Object} options - Payment options.
 * @param {string} options.email - Customer email.
 * @param {number} options.amount - Amount in naira.
 * @param {string} [options.metadata] - Metadata object.
 * @param {string} [options.reference] - Custom reference (auto-generated if not provided).
 * @returns {Promise<Object>} Payment initialization result.
 */
export async function initializePayment({ email, amount, metadata, reference }) {
  if (!isPaystackConfigured) {
    throw new Error('Paystack is not configured. Add VITE_PAYSTACK_PUBLIC_KEY to .env');
  }

  const ref = reference || generateReference('PAY');

  return {
    reference: ref,
    email,
    amount,
    metadata,
  };
}

/**
 * Verifies a Paystack transaction.
 * @param {string} reference - The transaction reference.
 * @returns {Promise<Object>} Verification result.
 */
export async function verifyTransaction(reference) {
  const secretKey = import.meta.env.VITE_PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error('Paystack secret key not configured. Add VITE_PAYSTACK_SECRET_KEY to .env');
  }

  try {
    const response = await axios.get(`${PAYSTACK_API_URL}/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('[LETCON] Paystack verification error:', error);
    throw new Error('Failed to verify payment');
  }
}

/**
 * Records a verification fee payment.
 * @param {Object} options - Payment options.
 * @param {string} options.uid - The user ID.
 * @param {string} options.email - The user email.
 * @param {string} options.reference - The payment reference.
 * @returns {Promise<Object>} The created transaction record.
 */
export async function recordVerificationFeePayment({ uid, email, reference }) {
  // Use the payment reference as the document ID so the payment-success
  // handler can find and update this transaction by reference.
  const transaction = await setDocument(COLLECTIONS.TRANSACTIONS, reference, {
    uid,
    email,
    type: 'verification_fee',
    amount: FEES.VERIFICATION_FEE,
    status: 'pending',
    reference,
    description: 'Earner verification fee',
    createdAt: new Date(),
  });

  return transaction;
}

/**
 * Records a task posting fee payment.
 * @param {Object} options - Payment options.
 * @param {string} options.uid - The user ID.
 * @param {string} options.email - The user email.
 * @param {string} options.reference - The payment reference.
 * @param {string} options.taskId - The task ID.
 * @returns {Promise<Object>} The created transaction record.
 */
export async function recordTaskPostingFee({ uid, email, reference, taskId }) {
  const transaction = await setDocument(COLLECTIONS.TRANSACTIONS, reference, {
    uid,
    email,
    type: 'task_posting_fee',
    amount: FEES.TASK_POSTING_FEE,
    status: 'pending',
    reference,
    taskId,
    description: 'Task posting fee',
    createdAt: new Date(),
  });

  return transaction;
}

/**
 * Records a wallet funding transaction.
 * @param {Object} options - Payment options.
 * @param {string} options.uid - The user ID.
 * @param {string} options.email - The user email.
 * @param {number} options.amount - The funding amount.
 * @param {string} options.reference - The payment reference.
 * @returns {Promise<Object>} The created transaction record.
 */
export async function recordWalletFunding({ uid, email, amount, reference }) {
  const transaction = await setDocument(COLLECTIONS.TRANSACTIONS, reference, {
    uid,
    email,
    type: 'wallet_funding',
    amount,
    status: 'pending',
    reference,
    description: 'Wallet funding',
    createdAt: new Date(),
  });

  return transaction;
}

/**
 * Handles a Paystack webhook event.
 * @param {Object} event - The webhook event.
 * @returns {Promise<void>}
 */
export async function handleWebhook(event) {
  const { event: eventType, data } = event;

  switch (eventType) {
    case 'charge.success': {
      const { reference, amount } = data;
      const transaction = await getDocument(COLLECTIONS.TRANSACTIONS, reference);

      if (transaction && transaction.status === 'pending') {
        await updateDocument(COLLECTIONS.TRANSACTIONS, reference, {
          status: 'success',
          paidAt: new Date(),
          paystackData: data,
        });

        // Credit the user's wallet (amount is in kobo from Paystack, convert to naira)
        const currentBalance = await getWalletBalance(transaction.uid);
        await updateDocument(COLLECTIONS.WALLETS, transaction.uid, {
          balance: (amount / 100) + currentBalance,
        });
      }
      break;
    }
    default:
      console.log('[LETCON] Unhandled webhook event:', eventType);
  }
}

/**
 * Gets the current wallet balance for a user.
 * @param {string} uid - The user ID.
 * @returns {Promise<number>} The wallet balance.
 */
async function getWalletBalance(uid) {
  const wallet = await getDocument(COLLECTIONS.WALLETS, uid);
  return wallet?.balance ?? 0;
}

/**
 * Creates a Paystack inline checkout handler.
 * @param {Object} options - Checkout options.
 * @param {string} options.email - Customer email.
 * @param {number} options.amount - Amount in naira.
 * @param {string} options.reference - Transaction reference.
 * @param {Function} options.onSuccess - Success callback.
 * @param {Function} options.onCancel - Cancel callback.
 * @param {Object} [options.metadata] - Additional metadata.
 * @returns {Function} Handler function that opens the checkout.
 */
export function createCheckoutHandler({ email, amount, reference, onSuccess, onCancel, metadata }) {
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
      currency: 'NGN',
      ref: reference,
      metadata,
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
