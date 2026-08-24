/**
 * LETCON - Payments Page (Super Admin)
 * View all platform transactions: funding, fees, task payments, and revenue.
 */
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { FaCreditCard, FaArrowUpRightDots, FaCircleCheck, FaWallet } from 'react-icons/fa6';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { COLLECTIONS } from '../../config/constants';
import { formatNaira, formatDateTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

const COLORS = ['#6c5ce7', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

/**
 * Returns badge variant for a transaction type.
 * @param {string} type - The transaction type.
 * @returns {string} Badge variant.
 */
function getTypeVariant(type) {
  switch (type) {
    case 'task_payment':
      return 'success';
    case 'withdrawal':
      return 'warning';
    case 'wallet_funding':
      return 'info';
    case 'verification_fee':
    case 'task_posting_fee':
      return 'default';
    case 'platform_revenue':
      return 'primary';
    default:
      return 'default';
  }
}

/**
 * Payments page component.
 */
export default function Payments() {
  const { data: transactions, loading } = useFirestoreQuery(COLLECTIONS.TRANSACTIONS, {
    orderByFields: [{ field: 'createdAt', direction: 'desc' }],
    limitCount: 100,
  });

  if (loading) {
    return <Spinner label="Loading payments..." />;
  }

  const totalRevenue = transactions
    .filter((t) => t.type === 'platform_revenue' && t.status === 'success')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalVolume = transactions
    .filter((t) => t.status === 'success')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalFees = transactions
    .filter((t) => (t.type === 'verification_fee' || t.type === 'task_posting_fee') && t.status === 'success')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Payment breakdown chart
  const typeCounts = {};
  transactions.forEach((t) => {
    typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
  });
  const paymentBreakdown = Object.entries(typeCounts).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
  }));

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Payments"
        subtitle="All platform transactions and payment records"
        icon={<FaCreditCard />}
      />

      <div className="stat-grid">
        <StatCard icon={<FaWallet />} label="Total Successful Volume" value={formatNaira(totalVolume)} color="primary" />
        <StatCard icon={<FaCircleCheck />} label="Platform Revenue" value={formatNaira(totalRevenue)} color="success" />
        <StatCard icon={<FaArrowUpRightDots />} label="Total Fees" value={formatNaira(totalFees)} color="info" />
      </div>

      {transactions.length === 0 ? (
        <EmptyState icon={<FaCreditCard />} title="No payments yet" message="Transactions from wallet funding, task payments, and fees will appear here." />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Payment Types</CardTitle>
            </CardHeader>
            <CardBody>
              {paymentBreakdown.length === 0 ? (
                <EmptyState icon={<FaCreditCard />} title="No payment data" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={paymentBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {paymentBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="transaction-list">
                {transactions.map((txn) => (
                  <div key={txn.id} className="transaction-item">
                    <div className="transaction-item-left">
                      <div className="transaction-item-icon">
                        {txn.type === 'task_payment' ? <FaCircleCheck /> : <FaCreditCard />}
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
                      <span className={`transaction-item-amount ${txn.type === 'withdrawal' ? 'negative' : 'positive'}`}>
                        {txn.type === 'withdrawal' ? '-' : '+'}{formatNaira(txn.amount)}
                      </span>
                      <Badge variant={getTypeVariant(txn.type)}>
                        {txn.type.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant={txn.status === 'success' ? 'success' : txn.status === 'failed' ? 'danger' : 'warning'}>
                        {txn.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
