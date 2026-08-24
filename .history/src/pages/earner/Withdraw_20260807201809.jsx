/**
 * LETCON - Withdraw Page
 * Instant withdrawal with no admin approval required.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FaArrowUpRightDots, FaBuildingColumn, FaHashtag, FaUser } from 'react-icons/fa6';
import { withdrawalSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';
import { createWithdrawal } from '../../services/walletService';
import { formatNaira } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

/**
 * Withdraw page component.
 */
export default function Withdraw() {
  const { user } = useAuth();
  const { wallet, refreshWallet } = useWallet();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(withdrawalSchema),
  });

  /**
   * Handles withdrawal submission.
   * @param {Object} data - Form data.
   */
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await createWithdrawal({
        uid: user.uid,
        amount: data.amount,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
      });

      toast.success(`Withdrawal of ${formatNaira(data.amount)} initiated successfully!`);
      refreshWallet();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const balance = wallet?.balance ?? 0;

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Withdraw Funds"
        subtitle="Instant withdrawal - no admin approval needed"
