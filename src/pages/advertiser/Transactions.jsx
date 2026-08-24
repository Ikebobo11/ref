/**
 * LETCON - Advertiser Transactions Page
 * Transaction history for the advertiser.
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
    case 'wallet_funding':
      return 'success';
    case 'task_posting_fee':
      return 'warning';
    case 'task_payment':
      return 'info';
    default:
      return 'default';
  }
}

/**
 * Advertiser transactions page component.
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
        subtitle="Your wallet funding and campaign payments"
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
                      {txn.reference && (
                        <span className="transaction-item-ref">Ref: {txn.reference}</span>
                      )}
                    </div>
                  </div>
                  <div className="transaction-item-right">
                    <span className={`transaction-item-amount ${txn.type === 'wallet_funding' ? 'positive' : 'negative'}`}>
                      {txn.type === 'wallet_funding' ? '+' : '-'}{formatNaira(txn.amount)}
                    </span>
                    <Badge variant={getTxnVariant(txn.type)}>{txn.type.replace('_', ' ')}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}