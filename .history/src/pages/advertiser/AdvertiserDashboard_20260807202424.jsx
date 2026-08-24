/**
 * LETCON - Advertiser Dashboard Page
 * Overview of campaigns, wallet, and task activity.
 */
import { Link } from 'react-router-dom';
import {
  FaWallet,
  FaBullhorn,
  FaPlusCircle,
  FaClockRotateLeft,
  FaCircleCheck,
} from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { COLLECTIONS, TASK_STATUS } from '../../config/constants';
import { formatNaira, formatNumber, formatRelativeTime } from '../../utils/formatters';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PlatformBadge from '../../components/shared/PlatformBadge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

/**
 * Advertiser dashboard page component.
 */
export default function AdvertiserDashboard() {
  const { userData } = useAuth();
  const { wallet, loading: walletLoading } = useWallet();

  const { data: tasks, loading: tasksLoading } = useFirestoreQuery(COLLECTIONS.TASKS, {
    filters: [{ field: 'advertiserId', operator: '==', value: userData?.uid || '' }],
    orderByFields: [{ field: 'createdAt', direction: 'desc' }],
    limitCount: 5,
  });

  const { data: submissions, loading: submissionsLoading } = useFirestoreQuery('taskSubmissions', {
    filters: [{ field: 'status', operator: '==', value: TASK_STATUS.SUBMITTED }],
    orderByFields: [{ field: 'submittedAt', direction: 'desc' }],
    limitCount: 5,
  });

  if (walletLoading || tasksLoading || submissionsLoading) {
    return <Spinner label="Loading your dashboard..." />;
  }

  const publishedCount = tasks.filter((t) => t.status === TASK_STATUS.PUBLISHED).length;
  const pendingReview = submissions.length;

  return (
    <div className="dashboard-page">
      <div className="welcome-section">
        <h2>Welcome back, {userData?.fullName?.split(' ')[0] || 'Advertiser'}!</h2>
        <p>Manage your campaigns, review task submissions, and track your spending.</p>
      </div>

      <div className="stat-grid">
        <StatCard
          icon={<FaWallet />}
          label="Wallet Balance"
          value={formatNaira(wallet?.balance ?? 0)}
          subtext={`Total spent: ${formatNaira(wallet?.totalSpent ?? 0)}`}
          color="primary"
        />
        <StatCard
          icon={<FaBullhorn />}
          label="Active Campaigns"
          value={formatNumber(publishedCount)}
          subtext="published tasks"
          color="info"
