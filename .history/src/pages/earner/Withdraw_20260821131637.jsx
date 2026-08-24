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

              <Input
                label="Bank Name"
                placeholder="e.g., Access Bank"
                icon={<FaLandmark />}
                error={errors.bankName?.message}
                {...register('bankName')}
              />

              <Input
                label="Account Number"
                placeholder="10-digit account number"
                icon={<FaHashtag />}
                error={errors.accountNumber?.message}
                {...register('accountNumber')}
              />

              <Input
                label="Account Name"
                placeholder="Name on the account"
                icon={<FaUser />}
                error={errors.accountName?.message}
                {...register('accountName')}
              />

              <Button type="submit" fullWidth loading={loading} variant="success">
                <FaArrowUpRightDots /> Withdraw Now
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Information</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="info-list">
              <div className="info-item">
                <strong>Request Processing</strong>
                <p>Withdrawal requests are submitted instantly and processed by our team.</p>
              </div>
              <div className="info-item">
                <strong>Minimum Withdrawal</strong>
                <p>Minimum withdrawal amount is ₦1,000.</p>
              </div>
              <div className="info-item">
                <strong>Duplicate Prevention</strong>
                <p>Each withdrawal is recorded with a unique reference to prevent duplicates.</p>
              </div>
              <div className="info-item">
                <strong>Bank Transfer</strong>
                <p>Funds are sent to your provided bank account once the request is approved.</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}