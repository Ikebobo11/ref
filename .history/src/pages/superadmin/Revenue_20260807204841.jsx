/**
 * LETCON - Revenue Page
 * Super admin views platform revenue, fees, and earnings breakdown.
 */
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { FaWallet, FaCreditCard, FaArrowUpRightDots, FaCircleCheck } from 'react-icons/fa6';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { COLLECTIONS } from '../../config/constants';
import { formatNaira, formatNumber } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

/**
 * Revenue page component.
 */
export default function Revenue() {
  const { data: transactions, loading } = useFirestoreQuery(COLLECTIONS.TRANSACTIONS, {
    limitCount: 100,
  });

  if (loading) {
    return <Spinner label="Loading revenue data..." />;
  }

  const platformRevenue = transactions
    .filter((t) => t.type === 'platform_revenue' && t.status === 'success')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const earnerPayments = transactions
    .filter((t) => t.type === 'task_payment' && t.status === 'success')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const verificationFees = transactions
    .filter((t) => t.type === 'verification_fee' && t.status === 'success')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const postingFees = transactions
    .filter((t) => t.type === 'task_posting_fee' && t.status === 'success')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalRevenue = platformRevenue + verificationFees + postingFees;

  // Revenue by type chart
  const revenueByType = [
    { name: 'Platform Revenue (30%)', value: platformRevenue },
    { name: 'Verification Fees', value: verificationFees },
    { name: 'Posting Fees', value: postingFees },
  ];

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Revenue"
        subtitle="Platform earnings and financial breakdown"
        icon={<FaWallet />}
      />

      <div className="stat-grid">
        <StatCard icon={<FaWallet />} label="Total Revenue" value={formatNaira(totalRevenue)} color="primary" />
        <StatCard icon={<FaCircleCheck />} label="Platform Revenue (30%)" value={formatNaira(platformRevenue)} color="success" />
        <StatCard icon={<FaCreditCard />} label="Verification Fees" value={formatNaira(verificationFees)} color="info" />
