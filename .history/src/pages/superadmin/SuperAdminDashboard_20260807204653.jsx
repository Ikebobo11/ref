/**
 * LETCON - Super Admin Dashboard Page
 * Platform-wide overview with revenue, users, and task statistics.
 */
import { Link } from 'react-router-dom';
import {
  FaWallet,
  FaUsers,
  FaBullhorn,
  FaCircleCheck,
  FaUserShield,
  FaArrowUpRightDots,
  FaScroll,
} from 'react-icons/fa6';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { COLLECTIONS } from '../../config/constants';
import { formatNaira, formatNumber } from '../../utils/formatters';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

/**
 * Super admin dashboard page component.
 */
export default function SuperAdminDashboard() {
  const { data: users, loading: usersLoading } = useFirestoreQuery(COLLECTIONS.USERS, { limitCount: 100 });
  const { data: tasks, loading: tasksLoading } = useFirestoreQuery(COLLECTIONS.TASKS, { limitCount: 100 });
  const { data: transactions, loading: txnLoading } = useFirestoreQuery(COLLECTIONS.TRANSACTIONS, { limitCount: 100 });
  const { data: verifications, loading: verificationsLoading } = useFirestoreQuery(COLLECTIONS.VERIFICATION_REQUESTS, {
    filters: [{ field: 'status', operator: '==', value: 'pending' }],
    limitCount: 5,
  });
  const { data: withdrawals, loading: withdrawalsLoading } = useFirestoreQuery(COLLECTIONS.WITHDRAWALS, {
    filters: [{ field: 'status', operator: '==', value: 'pending' }],
    limitCount: 5,
  });

  if (usersLoading || tasksLoading || txnLoading || verificationsLoading || withdrawalsLoading) {
    return <Spinner label="Loading platform overview..." />;
  }

  const totalRevenue = transactions
    .filter((t) => t.type === 'platform_revenue' && t.status === 'success')
    .reduce((sum, t) => sum + (t.amount || 0), 0);


