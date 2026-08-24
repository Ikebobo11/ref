/**
 * LETCON - Advertiser Wallet Page
 * Wallet funding via Paystack and transaction history.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FaWallet, FaCreditCard, FaCircleCheck, FaClock } from 'react-icons/fa6';
import { fundWalletSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';
import { createCheckoutHandler, generateReference } from '../../config/paystack';
import { recordWalletFunding } from '../../services/paystackService';
import { formatNaira, formatDateTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

/**
 * Advertiser wallet page component.
 */
export default function AdvertiserWallet() {
  const { user } = useAuth();
  const { wallet, transactions, loading, refreshWallet } = useWallet();
  const [funding, setFunding] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(fundWalletSchema),
  });

  /**
   * Handles wallet funding via Paystack.
   * @param {Object} data - Form data.
   */
  const handleFund = async (data) => {
    setFunding(true);
    const reference = generateReference('WALLET');

    try {
      await recordWalletFunding({
        uid: user.uid,
        email: user.email,
        amount: data.amount,
        reference,
      });

      const handler = createCheckoutHandler({
        email: user.email,
        amount: data.amount,
        reference,
        onSuccess: async (response) => {
          toast.success('Wallet funded successfully!');
          refreshWallet();
        },
