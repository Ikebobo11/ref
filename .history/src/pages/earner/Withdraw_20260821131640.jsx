/**
 * LETCON - Withdraw Page
 * Instant withdrawal with bank selection and account verification via Paystack.
 */
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  FaArrowUpRightDots,
  FaLandmark,
  FaHashtag,
  FaUser,
  FaCircleCheck,
  FaCircleXmark,
  FaSpinner,
} from 'react-icons/fa6';
import { withdrawalSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';
import { createWithdrawal } from '../../services/walletService';
import { fetchBanks, resolveAccountNumber } from '../../services/paystackService';
import { formatNaira } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

/**
 * Withdraw page component.
 */
export default function Withdraw() {
  const { user } = useAuth();
  const { wallet, refreshWallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedAccount, setVerifiedAccount] = useState(null);
  const [verificationError, setVerificationError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(withdrawalSchema),
  });

  const currentAccountNumber = watch('accountNumber');

  /**
   * Fetches banks on component mount.
   */
  useEffect(() => {
    const loadBanks = async () => {
      try {
        const bankList = await fetchBanks();
        setBanks(bankList);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoadingBanks(false);
      }
    };

    loadBanks();
  }, []);

  /**
   * Verifies account number when it reaches 10 digits and bank is selected.
   */
  const verifyAccount = useCallback(async (accNum, bankCode) => {
    if (!accNum || accNum.length !== 10 || !bankCode) {
      setVerifiedAccount(null);
      setVerificationError('');
      return;
    }

    setVerifying(true);
    setVerificationError('');
    setVerifiedAccount(null);

    try {
      const result = await resolveAccountNumber(accNum, bankCode);
      setVerifiedAccount(result);
      setValue('accountName', result.accountName);
      toast.success('Account verified successfully!');
    } catch (error) {
      setVerificationError(error.message);
      setVerifiedAccount(null);
      setValue('accountName', '');
    } finally {
      setVerifying(false);
    }
  }, [setValue]);

  /**
   * Handles account number input change.
   */
  useEffect(() => {
    if (currentAccountNumber?.length === 10 && selectedBank) {
      verifyAccount(currentAccountNumber, selectedBank);
    } else {
      setVerifiedAccount(null);
      setVerificationError('');
    }
  }, [currentAccountNumber, selectedBank, verifyAccount]);

  /**
   * Handles bank selection change.
   */
  const handleBankChange = (e) => {
    const bankCode = e.target.value;
    setSelectedBank(bankCode);
    setValue('bankName', banks.find((b) => b.code === bankCode)?.name || '');
    setVerifiedAccount(null);
    setVerificationError('');

    // Re-verify if account number is already entered
    if (currentAccountNumber?.length === 10 && bankCode) {
      verifyAccount(currentAccountNumber, bankCode);
    }
  };

  /**
   * Handles withdrawal submission.
   * @param {Object} data - Form data.
   */
  const onSubmit = async (data) => {
    if (!verifiedAccount) {
      toast.error('Please verify your account number before withdrawing');
      return;
    }

    setLoading(true);
    try {
      await createWithdrawal({
        uid: user.uid,
        amount: data.amount,
        bankName: data.bankName,
        bankCode: selectedBank,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
      });

      toast.success(`Withdrawal of ${formatNaira(data.amount)} initiated successfully!`);
      refreshWallet();

      // Reset form
      setVerifiedAccount(null);
      setSelectedBank('');
      setValue('amount', '');
      setValue('bankName', '');
      setValue('accountNumber', '');
      setValue('accountName', '');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const balance = wallet?.balance ?? 0;

  /** Bank options for select dropdown */
  const bankOptions = [
    { value: '', label: 'Select your bank' },
    ...banks.map((bank) => ({ value: bank.code, label: bank.name })),
  ];

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Withdraw Funds"
        subtitle="Request a withdrawal from your available balance"
        icon={<FaArrowUpRightDots />}
      />

      <div className="withdraw-layout">
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Details</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="form-stack">
              <div className="withdraw-balance-note">
                Available Balance: <strong>{formatNaira(balance)}</strong>
              </div>

              <Input
                label="Amount (₦)"
                type="number"
                placeholder="Enter amount to withdraw"
                icon={<FaArrowUpRightDots />}
                error={errors.amount?.message}
                {...register('amount', { valueAsNumber: true })}
              />


