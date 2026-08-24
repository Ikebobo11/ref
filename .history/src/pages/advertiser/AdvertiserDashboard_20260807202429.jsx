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
        />
        <StatCard
          icon={<FaClockRotateLeft />}
          label="Pending Review"
          value={formatNumber(pendingReview)}
          subtext="submissions awaiting your review"
          color="warning"
        />
        <StatCard
          icon={<FaCircleCheck />}
          label="Total Tasks"
          value={formatNumber(tasks.length)}
          subtext="all time"
          color="success"
        />
      </div>

      <div className="dashboard-grid">
        <Card className="dashboard-section">
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <Link to="/advertiser/campaigns" className="text-link">View all</Link>
          </CardHeader>
          <CardBody>
            {tasks.length === 0 ? (
              <EmptyState
                icon={<FaBullhorn />}
                title="No campaigns yet"
                message="Create your first campaign to start reaching micro influencers."
                action={<Link to="/advertiser/create-campaign" className="btn btn-primary btn-sm">Create Campaign</Link>}
              />
            ) : (
              <div className="task-list">
                {tasks.map((task) => (
                  <div key={task.id} className="task-list-item">
                    <div className="task-list-item-top">
                      <PlatformBadge platform={task.platform} size="sm" showName={false} />
                      <h4 className="task-list-item-title">{task.title}</h4>
                      <Badge variant={task.status === TASK_STATUS.PUBLISHED ? 'success' : 'default'}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="task-list-item-meta">
                      <span>{task.followerTier} tier</span>
