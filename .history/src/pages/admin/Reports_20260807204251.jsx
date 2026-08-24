/**
 * LETCON - Admin Reports Page
 * Platform statistics and analytics for admins.
 */
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { FaChartLine, FaUsers, FaBullhorn, FaCircleCheck, FaWallet } from 'react-icons/fa6';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { COLLECTIONS } from '../../config/constants';
import { formatNaira, formatNumber } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

const PIE_COLORS = ['#6c5ce7', '#00b894', '#fdcb6e', '#e17055', '#0984e3', '#fd79a8'];

/**
 * Admin reports page component.
 */
export default function Reports() {
  const { data: users, loading: usersLoading } = useFirestoreQuery(COLLECTIONS.USERS, {
    limitCount: 100,
  });

  const { data: tasks, loading: tasksLoading } = useFirestoreQuery(COLLECTIONS.TASKS, {
    limitCount: 100,
  });

  const { data: transactions, loading: txnLoading } = useFirestoreQuery(COLLECTIONS.TRANSACTIONS, {
    limitCount: 100,
  });

  if (usersLoading || tasksLoading || txnLoading) {
    return <Spinner label="Loading reports..." />;
  }

  // User role distribution
  const roleCounts = {};
  users.forEach((user) => {
    roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
  });
  const roleChartData = Object.entries(roleCounts).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
  }));

  // Task status distribution
  const statusCounts = {};
  tasks.forEach((task) => {
    statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
  });
  const statusChartData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
  }));

  // Revenue stats
  const totalRevenue = transactions
    .filter((t) => t.type === 'platform_revenue' && t.status === 'success')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalEarnerPayments = transactions
    .filter((t) => t.type === 'task_payment' && t.status === 'success')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalFees = transactions
    .filter((t) => (t.type === 'verification_fee' || t.type === 'task_posting_fee') && t.status === 'success')
