/**
 * LETCON - Transactions Page
 * Full transaction history for the earner.
 */
import { FaArrowRightFromBracket, FaCircleCheck, FaClock } from 'react-icons/fa6';
import { useWallet } from '../../contexts/WalletContext';
import { formatNaira, formatDateTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
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
    case 'verification_fee':
      return 'default';
    default:
      return 'default';
  }
}

/**
 * Transactions page component.
 */
export default function Transactions() {
  const { transactions, loading } = useWallet();

  if (loading) {
    return <Spinner label="Loading transactions..." />;
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Transactions"
        subtitle="Your complete transaction history"
        icon={<FaArrowRightFromBracket />}
      />

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardBody>
          {transactions.length === 0 ? (
            <EmptyState
              icon={<FaArrowRightFromBracket />}
              title="No transactions yet"
              message="Your earnings, withdrawals, and fees will appear here."
            />
          ) : (
            <div className="transaction-list">
              {transactions.map((txn) => (
