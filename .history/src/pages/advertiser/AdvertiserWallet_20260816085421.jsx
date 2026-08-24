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
import { generateReference } from '../../config/paystack';
import { createCheckoutHandler, recordWalletFunding, verifyAndCreditWallet } from '../../services/paystackService';
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
        onCancel: () => toast.error('Funding cancelled.'),
      });

      handler();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setFunding(false);
    }
  };

  if (loading) {
    return <Spinner label="Loading your wallet..." />;
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Wallet"
        subtitle="Fund your wallet to publish campaigns"
        icon={<FaWallet />}
      />

      <div className="wallet-layout">
        <Card>
          <CardHeader>
            <CardTitle>Fund Wallet</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="wallet-balance-card compact">
              <div className="wallet-balance-label">Current Balance</div>
              <div className="wallet-balance-amount">{formatNaira(wallet?.balance ?? 0)}</div>
            </div>

            <form onSubmit={handleSubmit(handleFund)} className="form-stack">
              <Input
                label="Amount to Fund (₦)"
                type="number"
                placeholder="Enter amount"
                icon={<FaCreditCard />}
                error={errors.amount?.message}
                {...register('amount', { valueAsNumber: true })}
              />

              <Button type="submit" fullWidth loading={funding}>
                <FaCreditCard /> Fund Wallet
              </Button>
              <p className="form-helper">Payments are processed securely by Paystack</p>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardBody>
            {transactions.length === 0 ? (
              <EmptyState
                icon={<FaWallet />}
                title="No transactions yet"
                message="Your wallet funding and campaign payments will appear here."
              />
            ) : (
              <div className="transaction-list">
                {transactions.map((txn) => (
                  <div key={txn.id} className="transaction-item">
                    <div className="transaction-item-left">
                      <div className="transaction-item-icon">
                        {txn.type === 'wallet_funding' ? <FaCircleCheck /> : <FaClock />}
                      </div>
                      <div className="transaction-item-info">
                        <span className="transaction-item-title">{txn.description || txn.type}</span>
                        <span className="transaction-item-date">
                          {formatDateTime(txn.createdAt?.toDate?.() || txn.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="transaction-item-right">
                      <span className="transaction-item-amount negative">
                        {txn.type === 'wallet_funding' ? '+' : '-'}{formatNaira(txn.amount)}
                      </span>
                      <Badge variant={txn.type === 'wallet_funding' ? 'success' : 'default'}>
                        {txn.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}