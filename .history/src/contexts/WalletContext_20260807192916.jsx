/**
 * LETCON - Wallet Context
 * Manages wallet state, balance, and transaction history for the current user.
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS, QUERY_LIMITS } from '../config/constants';
import { useAuth } from './AuthContext';

const WalletContext = createContext(null);

/**
 * Wallet Provider component.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components.
 */
export function WalletProvider({ children }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Subscribes to the user's wallet document.
   */
  useEffect(() => {
    if (!user) {
      setWallet(null);
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to wallet document
    const walletRef = doc(db, COLLECTIONS.WALLETS, user.uid);
    const unsubscribeWallet = onSnapshot(
      walletRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setWallet({ id: snapshot.id, ...snapshot.data() });
        } else {
          setWallet(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('[LETCON] Wallet subscription error:', error);
        setLoading(false);
      }
    );

    // Subscribe to recent transactions
    const transactionsRef = collection(db, COLLECTIONS.TRANSACTIONS);
    const transactionsQuery = query(
      transactionsRef,
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(QUERY_LIMITS.DEFAULT)
    );


