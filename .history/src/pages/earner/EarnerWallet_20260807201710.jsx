/**
 * LETCON - Earner Wallet Page
 * Displays wallet balance, earnings, and transaction history.
 */
import { Link } from 'react-router-dom';
import { FaWallet, FaArrowUpRightDots, FaCircleCheck, FaClock } from 'react-icons/fa6';
import { useWallet } from '../../contexts/WalletContext';
import { formatNaira, formatDateTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

/**
 * Gets badge variant for transaction type.
 * @param {string} type - Transaction type.
 * @returns {string} Badge variant.
 */
function getTxnVariant(type) {
  switch (type) {
    case 'task_payment':
      return 'success';
    case 'withdrawal':
      return 'warning';
    case 'wallet_funding':
      return 'info';
    default:
      return 'default';
  }
}

/**
 * Earner wallet page component.
 */
export default function EarnerWallet() {
  const { wallet, transactions, loading } = useWallet();

  if (loading) {
    return <Spinner label="Loading your wallet..." />;
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="My Wallet"
        subtitle="Your earnings from approved tasks"
        icon={<FaWallet />}
        actions={
          <Link to="/earner/withdraw">
            <Button variant="success">
              <FaArrowUpRightDots /> Withdraw Funds
            </Button>
          </Link>
        }
      />

      <div className="wallet-balance-card">
        <div className="wallet-balance-label">Available Balance</div>
