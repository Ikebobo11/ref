/**
 * LETCON - Earner Dashboard Page
 * Overview of tasks, earnings, and verified account status.
 */
import { Link } from 'react-router-dom';
import {
  FaWallet,
  FaListCheck,
  FaClipboardCheck,
  FaCircleCheck,
  FaShieldHalved,
  FaArrowUpRightDots,
} from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';
import { useTierVisibility } from '../../hooks/useTierVisibility';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { COLLECTIONS, TASK_STATUS, CURRENCY_SYMBOL } from '../../config/constants';
import { formatNaira, formatNumber, formatRelativeTime } from '../../utils/formatters';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PlatformBadge from '../../components/shared/PlatformBadge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

/**
 * Earner dashboard page component.
 */
export default function EarnerDashboard() {
  const { userData } = useAuth();
  const { wallet, loading: walletLoading } = useWallet();
  const { tier, platform } = useTierVisibility();

  // Query tasks visible to this earner (enforced by tier + platform filters)
  const { data: visibleTasks, loading: tasksLoading } = useFirestoreQuery(COLLECTIONS.TASKS, {
    filters: [
      { field: 'followerTier', operator: '==', value: tier || '' },
      { field: 'platform', operator: '==', value: platform || '' },
      { field: 'status', operator: '==', value: TASK_STATUS.PUBLISHED },
    ],
    orderByFields: [{ field: 'createdAt', direction: 'desc' }],
    limitCount: 5,
  });

  // Query accepted tasks
  const { data: acceptedTasks, loading: acceptedLoading } = useFirestoreQuery('taskAcceptances', {
    filters: [{ field: 'earnerId', operator: '==', value: userData?.uid || '' }],
    orderByFields: [{ field: 'acceptedAt', direction: 'desc' }],
    limitCount: 5,
  });

  if (walletLoading || tasksLoading || acceptedLoading) {
    return <Spinner label="Loading your dashboard..." />;
  }

  const verifiedStatus = userData?.verified ? 'Verified' : 'Pending Verification';
  const statusVariant = userData?.verified ? 'success' : 'warning';

  return (
    <div className="dashboard-page">
      <div className="welcome-section">
        <h2>Welcome back, {userData?.fullName?.split(' ')[0] || 'Earner'}!</h2>
        <p>
          {userData?.verified
            ? `You are viewing ${tier} tasks on ${platform}. Complete tasks using your verified account to earn.`
            : 'Your account is pending verification. Complete your verification to start earning.'}
        </p>
      </div>

      <div className="stat-grid">
        <StatCard
          icon={<FaWallet />}
          label="Wallet Balance"
          value={formatNaira(wallet?.balance ?? 0)}
          subtext={`Total earned: ${formatNaira(wallet?.totalEarned ?? 0)}`}
          color="primary"
        />
        <StatCard
          icon={<FaListCheck />}
          label="Available Tasks"
          value={formatNumber(visibleTasks?.length ?? 0)}
          subtext={`for ${tier} on ${platform}`}
          color="info"
        />
        <StatCard
          icon={<FaClipboardCheck />}
          label="Accepted Tasks"
          value={formatNumber(acceptedTasks?.length ?? 0)}
          subtext="in progress"
          color="warning"
        />
        <StatCard
          icon={<FaShieldHalved />}
          label="Account Status"
          value={verifiedStatus}
          subtext={`Tier: ${tier || 'N/A'} | Platform: ${platform || 'N/A'}`}
          color={userData?.verified ? 'success' : 'warning'}
        />
      </div>

      <div className="dashboard-grid">
        <Card className="dashboard-section">
          <CardHeader>
            <CardTitle>Recent Available Tasks</CardTitle>
            <Link to="/earner/available-tasks" className="text-link">View all</Link>
          </CardHeader>
          <CardBody>
            {visibleTasks?.length === 0 ? (
              <EmptyState
                icon={<FaListCheck />}
                title="No tasks available"
                message={`No ${tier} ${platform} tasks are currently available. Check back soon.`}
              />
            ) : (
              <div className="task-list">
                {visibleTasks?.map((task) => (
                  <div key={task.id} className="task-list-item">
                    <div className="task-list-item-top">
                      <PlatformBadge platform={task.platform} size="sm" showName={false} />
                      <h4 className="task-list-item-title">{task.title}</h4>
                      <Badge variant="success">{formatNaira(task.paymentPerInfluencer)}</Badge>
                    </div>
                    <p className="task-list-item-desc">{task.description}</p>
                    <div className="task-list-item-meta">
                      <span>{task.country}</span>
                      <span>{formatRelativeTime(task.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="dashboard-section">
          <CardHeader>
            <CardTitle>Your Verified Account</CardTitle>
            <Link to="/earner/verified-account" className="text-link">View</Link>
          </CardHeader>
          <CardBody>
            <div className="verified-account-summary">
              <div className="verified-account-avatar">
                <FaShieldHalved />
              </div>
              <div className="verified-account-details">
                <div className="verified-account-row">
                  <span className="label">Platform</span>
                  <span className="value">
                    {userData?.verifiedPlatform || 'N/A'}
                  </span>
                </div>
                <div className="verified-account-row">
                  <span className="label">Username</span>
                  <span className="value">@{userData?.verifiedUsername || 'N/A'}</span>
                </div>
                <div className="verified-account-row">
                  <span className="label">Followers</span>
                  <span className="value">{formatNumber(userData?.followerCount ?? 0)}</span>
                </div>
                <div className="verified-account-row">
                  <span className="label">Tier</span>
                  <span className="value">{tier || 'N/A'}</span>
                </div>
                <div className="verified-account-row">
                  <span className="label">Status</span>
                  <span className="value">
                    <Badge variant={statusVariant}>{verifiedStatus}</Badge>
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="quick-actions">
        <Link to="/earner/available-tasks" className="quick-action-btn">
          <FaListCheck /> Browse Tasks
        </Link>
        <Link to="/earner/upgrade" className="quick-action-btn">
          <FaArrowUpRightDots /> Upgrade Tier
        </Link>
        <Link to="/earner/withdraw" className="quick-action-btn">
          <FaWallet /> Withdraw Earnings
        </Link>
      </div>
    </div>
  );
}