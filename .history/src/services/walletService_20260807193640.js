/**
 * LETCON - Wallet Service
 * Handles wallet operations: funding, withdrawals, and balance management.
 */
import {
  getDocument,
  updateDocument,
  addDocument,
  queryDocuments,
  executeTransaction,
} from './firestoreService';
import { COLLECTIONS, TRANSACTION_TYPES, TRANSACTION_STATUS, WITHDRAWAL_STATUS } from '../config/constants';
import { generateReference } from '../config/paystack';
import { notifyWithdrawalSuccessful } from './notificationService';

/**
 * Gets a user's wallet.
 * @param {string} uid - The user ID.
 * @returns {Promise<Object|null>} The wallet data.
 */
export async function getWallet(uid) {
  return getDocument(COLLECTIONS.WALLETS, uid);
}

/**
 * Funds a user's wallet.
 * @param {Object} options - Funding options.
 * @param {string} options.uid - The user ID.
 * @param {number} options.amount - The amount to fund.
 * @param {string} options.reference - The payment reference.
 * @returns {Promise<Object>} The updated wallet.
 */
export async function fundWallet({ uid, amount, reference }) {
  return executeTransaction(async (transaction) => {
    const walletRef = doc(db, COLLECTIONS.WALLETS, uid);
    const walletSnapshot = await transaction.get(walletRef);

    if (!walletSnapshot.exists()) {
      throw new Error('Wallet not found');
    }

    const currentBalance = walletSnapshot.data().balance || 0;
    const newBalance = currentBalance + amount;

    transaction.update(walletRef, {
      balance: newBalance,
      totalSpent: walletSnapshot.data().totalSpent || 0,
      updatedAt: new Date(),
    });

    // Record transaction
    const txnRef = doc(db, COLLECTIONS.TRANSACTIONS, reference);
    transaction.set(txnRef, {
      uid,
      type: TRANSACTION_TYPES.WALLET_FUNDING,
      amount,
      status: TRANSACTION_STATUS.SUCCESS,
      reference,
      description: 'Wallet funding',
