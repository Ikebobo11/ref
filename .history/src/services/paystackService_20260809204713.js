/**
 * LETCON - Paystack Service
 * Handles payment initialization, verification, and webhook processing.
 */
import axios from 'axios';
import { PAYSTACK_PUBLIC_KEY, isPaystackConfigured, generateReference } from '../config/paystack';
import { FEES, COLLECTIONS } from '../config/constants';
import { add

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
    const response = await axios.get(`${PAYSTACK_API_URL}/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${import.meta.env.PAYSTACK_SECRET_KEY}`,
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
  const transaction = await addDocument(COLLECTIONS.TRANSACTIONS, {
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
  const transaction = await addDocument(COLLECTIONS.TRANSACTIONS, {
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
      const { reference, amount, metadata } = data;
      const transaction = await getDocument(COLLECTIONS.TRANSACTIONS, reference);

      if (transaction && transaction.status === 'pending') {
        await updateDocument(COLLECTIONS.TRANSACTIONS, reference, {
          status: 'success',
          paidAt: new Date(),
          paystackData: data,
        });

        // Credit the user's wallet
        const walletRef = `${COLLECTIONS.WALLETS}/${transaction.uid}`;
        await updateDocument(COLLECTIONS.WALLETS, transaction.uid, {
          balance: (transaction.amount / 100) + (await getWalletBalance(transaction.uid)),
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
      console.warn('[LETCON] Paystack is not configured');
      return;
    }

    if (typeof window.PaystackPop === 'undefined') {
      console.error('[LETCON] Paystack script not loaded');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: Math.round(amount * 100),
      currency: 'NGN',
      ref: reference,
      metadata,
      callback: (response) => onSuccess?.(response),
      onClose: () => onCancel?.(),
    });

    handler.openIframe();
  };
}