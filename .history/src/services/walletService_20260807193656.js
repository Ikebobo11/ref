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
      createdAt: new Date(),
    });

    return { balance: newBalance };
  });
}

/**
 * Creates a withdrawal request.
 * @param {Object} options - Withdrawal options.
 * @param {string} options.uid - The user ID.
 * @param {number} options.amount - The withdrawal amount.
 * @param {string} options.bankName - The bank name.
 * @param {string} options.accountNumber - The account number.
 * @param {string} options.accountName - The account name.
 * @returns {Promise<Object>} The withdrawal record.
 */
export async function createWithdrawal({ uid, amount, bankName, accountNumber, accountName }) {
  return executeTransaction(async (transaction) => {
    const walletRef = doc(db, COLLECTIONS.WALLETS, uid);
    const walletSnapshot = await transaction.get(walletRef);

    if (!walletSnapshot.exists()) {
      throw new Error('Wallet not found');
    }

    const currentBalance = walletSnapshot.data().balance || 0;
    if (currentBalance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    // Deduct from wallet
    const newBalance = currentBalance - amount;
    transaction.update(walletRef, {
      balance: newBalance,
      updatedAt: new Date(),
    });

    // Create withdrawal record
    const withdrawalRef = doc(db, COLLECTIONS.WITHDRAWALS);
    const withdrawalId = withdrawalRef.id;
    const reference = generateReference('WDR');

    transaction.set(withdrawalRef, {
      uid,
      amount,
      bankName,
      accountNumber,
      accountName,
      status: WITHDRAWAL_STATUS.PENDING,
      reference,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Record transaction
    const txnRef = doc(db, COLLECTIONS.TRANSACTIONS, reference);
    transaction.set(txnRef, {
      uid,
      type: TRANSACTION_TYPES.WITHDRAWAL,
      amount,
      status: TRANSACTION_STATUS.SUCCESS,
      reference,
      withdrawalId,
      description: `Withdrawal to ${bankName} (${accountNumber})`,
      createdAt: new Date(),
    });

    return { id: withdrawalId, reference, amount, newBalance };
  });
}

/**
 * Gets a user's withdrawal history.
 * @param {string} uid - The user ID.
 * @param {Object} options - Query options.
 * @returns {Promise<Array<Object>>} Array of withdrawals.
 */
export async function getWithdrawals(uid, { status, limitCount = 20 } = {}) {
  const filters = [{ field: 'uid', operator: '==', value: uid }];
  if (status) filters.push({ field: 'status', operator: '==', value: status });

  return queryDocuments(COLLECTIONS.WITHDRAWALS, {
    filters,
    orderByFields: [{ field: 'createdAt', direction: 'desc' }],
    limitCount,
  });
}

/**
 * Gets a user's transaction history.
 * @param {string} uid - The user ID.
 * @param {Object} options - Query options.
 * @returns {Promise<Array<Object>>} Array of transactions.
 */
export async function getTransactions(uid, { type, status, limitCount = 20 } = {}) {
  const filters = [{ field: 'uid', operator: '==', value: uid }];
  if (type) filters.push({ field: 'type', operator: '==', value: type });
  if (status) filters.push({ field: 'status', operator: '==', value: status });

  return queryDocuments(COLLECTIONS.TRANSACTIONS, {
    filters,
    orderByFields: [{ field: 'createdAt', direction: 'desc' }],
