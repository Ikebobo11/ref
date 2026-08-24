/**
 * LETCON - Paystack Service
 * Handles payment initialization, verification, and webhook processing.
 */
import axios from 'axios';
import { PAYSTACK_PUBLIC_KEY, isPaystackConfigured, generateReference } from '../config/paystack';
import { FEES, COLLECTIONS } from '../config/constants';
import { addDocument, setDocument, updateDocument, getDocument } from './firestoreService';
import { fundWallet } from './walletService';

/** Paystack API base URL */
const PAYSTACK_API_URL = 'https://api.paystack.co';

/** Paystack inline script URL */
const PAYSTACK_INLINE_SCRIPT = 'https://js
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
 * Verifies a Paystack transaction and credits the user's wallet if successful.
 * This is the client-side fallback for the webhook handler (used in test mode).
 * @param {string} reference - The transaction reference.
 * @param {string} uid - The user ID.
 * @param {number} amount - The amount in naira to credit.
 * @returns {Promise<Object>} The verification result.
 */
export async function verifyAndCreditWallet(reference, uid, amount) {
  const verification = await verifyTransaction(reference);

  if (verification?.data?.status === 'success') {
    // Credit the user's wallet
    await fundWallet({ uid, amount, reference });

    // Update the transaction status
    await updateDocument(COLLECTIONS.TRANSACTIONS, reference, {
      status: 'success',
      paidAt: new Date(),
      paystackReference: reference,
    });

    return verification;
  }

  throw new Error('Payment verification failed');
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
        // Credit the user's wallet (amount is in kobo from Paystack, convert to naira)
        await fundWallet({
          uid: transaction.uid,
          amount: amount / 100,
          reference,
        });

        await updateDocument(COLLECTIONS.TRANSACTIONS, reference, {
          status: 'success',
          paidAt: new Date(),
          paystackData: data,
        });
      }
      break;
    }
    default:
      console.log('[LETCON] Unhandled webhook event:', eventType);
  }
}

/**
 * Fetches all Nigerian banks from Paystack.
 * @returns {Promise<Array<Object>>} Array of bank objects with name and code.
 */
export async function fetchBanks() {
  const secretKey = import.meta.env.VITE_PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error('Paystack secret key not configured. Add VITE_PAYSTACK_SECRET_KEY to .env');
  }

  try {
    const response = await axios.get(`${PAYSTACK_API_URL}/bank`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
      params: {
        country: 'nigeria',
        perPage: 100,
      },
    });

    return response.data.data.map((bank) => ({
      name: bank.name,
      code: bank.code,
      id: bank.id,
    }));
  } catch (error) {
    console.error('[LETCON] Error fetching banks:', error);
    throw new Error('Failed to fetch banks. Please try again.');
  }
}

/**
 * Resolves an account number to get the account name.
 * @param {string} accountNumber - The 10-digit account number.
 * @param {string} bankCode - The bank code.
 * @returns {Promise<Object>} Object containing account_name and account_number.
 */
export async function resolveAccountNumber(accountNumber, bankCode) {
  const secretKey = import.meta.env.VITE_PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error('Paystack secret key not configured. Add VITE_PAYSTACK_SECRET_KEY to .env');
  }

  if (!accountNumber || accountNumber.length !== 10) {
    throw new Error('Please enter a valid 10-digit account number');
  }

  if (!bankCode) {
    throw new Error('Please select a bank');
  }

  try {
    const response = await axios.get(`${PAYSTACK_API_URL}/bank/resolve`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
      params: {
        account_number: accountNumber,
        bank_code: bankCode,
      },
    });

    return {
      accountName: response.data.data.account_name,
      accountNumber: response.data.data.account_number,
      bankId: response.data.data.bank_id,
    };
  } catch (error) {
    console.error('[LETCON] Error resolving account number:', error);
    if (error.response?.status === 404 || error.response?.status === 400) {
      throw new Error('Invalid account number. Please check and try again.');
    }
    throw new Error('Failed to verify account number. Please try again.');
  }
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
      const err = new Error('Paystack is not configured. Add VITE_PAYSTACK_PUBLIC_KEY to .env');
      console.error('[LETCON]', err.message);
      throw err;
    }

    if (typeof window.PaystackPop === 'undefined') {
      const err = new Error('Paystack script not loaded. Add the Paystack inline script to index.html');
      console.error('[LETCON]', err.message);
      throw err;
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
