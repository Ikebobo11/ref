/**
 * LETCON - Admin Dashboard Page
 * Overview of pending verifications, rejected tasks, upgrades, and account changes.
 */
import { Link } from 'react-router-dom';
import {
  FaUserShield,
  FaCircleXmark,
  FaArrowUpRightDots,
  FaArrowRightArrowLeft,
  FaTriangleExclamation,
  FaUsers,
} from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { COLLECTIONS, VERIFICATION_STATUS, UPGRADE_STATUS, ACCOUNT_CHANGE_STATUS } from '../../config/constants';
import { formatNumber, formatRelativeTime } from '../../utils/formatters';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PlatformBadge from '../../components/shared/PlatformBadge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

/**
 * Admin dashboard page component.
 */
export default function AdminDashboard() {
  const { userData } = useAuth();

  const { data: verifications, loading: verificationsLoading } = useFirestoreQuery(
    COLLECTIONS.VERIFICATION_REQUESTS,
    {
      filters: [{ field: 'status', operator: '==', value: VERIFICATION_STATUS.PENDING }],
      orderByFields: [{ field: 'createdAt', direction: 'asc' }],
      limitCount: 5,
    }
  );

  const { data: rejectedTasks, loading: rejectedLoading } = useFirestoreQuery('taskSubmissions', {
    filters: [{ field: 'status', operator: '==', value: 'pending_admin_review' }],
    orderByFields: [{ field: 'submittedAt', direction: 'desc' }],
    limitCount: 5,
  });

  const { data: upgrades, loading: upgradesLoading } = useFirestoreQuery(
    COLLECTIONS.UPGRADE_REQUESTS,
    {
      filters: [{ field: 'status', operator: '==', value: UPGRADE_STATUS.PENDING }],
      orderByFields: [{ field: 'createdAt', direction: 'asc' }],
      limitCount: 5,
    }
  );

  const { data: accountChanges, loading: accountChangesLoading } = useFirestoreQuery(
    COLLECTIONS.ACCOUNT_CHANGE_REQUESTS,
    {
      filters: [{ field: 'status', operator: '==', value: ACCOUNT_CHANGE_STATUS.PENDING }],
      orderByFields: [{ field: 'createdAt', direction: 'asc' }],
      limitCount: 5,
    }
  );

  const { data: flagged, loading: flaggedLoading } = useFirestoreQuery('taskSubmissions', {
    filters: [{ field: 'status', operator: '==', value: 'flagged' }],
    orderByFields: [{ field: 'submittedAt', direction: 'desc' }],
    limitCount: 5,
  });

  if (verificationsLoading || rejectedLoading || upgradesLoading || accountChangesLoading || flaggedLoading) {
    return <Spinner label="Loading admin dashboard..." />;
  }

  return (
    <div className="dashboard-page">
      <div className="welcome-section">
        <h2>Admin Dashboard</h2>
        <p>Review verifications, rejected tasks, upgrades, and account changes.</p>
      </div>

      <div className="stat-grid">
        <StatCard
          icon={<FaUserShield />}
          label="Pending Verifications"
          value={formatNumber(verifications.length)}
          color="warning"
        />
        <StatCard
          icon={<FaCircleXmark />}
          label="Rejected Tasks"
          value={formatNumber(rejectedTasks.length)}
          color="danger"
        />
        <StatCard
          icon={<FaArrowUpRightDots />}
          label="Upgrade Requests"
          value={formatNumber(upgrades.length)}
          color="info"
        />
        <StatCard
          icon={<FaArrowRightArrowLeft />}
          label="Account Changes"
          value={formatNumber(accountChanges.length)}
          color="primary"
        />
        <StatCard
          icon={<FaTriangleExclamation />}
          label="Flagged Mismatches"
          value={formatNumber(flagged.length)}
          color="danger"
        />
      </div>

      <div className="dashboard-grid">
        <Card className="dashboard-section">
          <CardHeader>
            <CardTitle>Verification Queue</CardTitle>
            <Link to="/admin/verification-queue" className="text-link">View all</Link>
          </CardHeader>
          <CardBody>
            {verifications.length === 0 ? (
              <EmptyState icon={<FaUserShield />} title="No pending verifications" />
            ) : (
              <div className="task-list">
                {verifications.map((req) => (
                  <div key={req.id} className="task-list-item">
                    <div className="task-list-item-top">
                      <PlatformBadge platform={req.platform} size="sm" showName={false} />
                      <h4 className="task-list-item-title">@{req.username}</h4>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                    <div className="task-list-item-meta">
                      <span>{req.followerCount?.toLocaleString()} followers</span>
                      <span>{formatRelativeTime(req.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="dashboard-section">
          <CardHeader>
            <CardTitle>Rejected Tasks to Review</CardTitle>
            <Link to="/admin/rejected-tasks" className="text-link">View all</Link>
          </CardHeader>
          <CardBody>
            {rejectedTasks.length === 0 ? (
              <EmptyState icon={<FaCircleXmark />} title="No rejected tasks to review" />
            ) : (
              <div className="task-list">
                {rejectedTasks.map((submission) => (
                  <div key={submission.id} className="task-list-item">
                    <div className="task-list-item-top">
                      <h4 className="task-list-item-title">Task {submission.taskId}</h4>
                      <Badge variant="danger">Admin Review</Badge>
                    </div>
                    <div className="task-list-item-meta">
                      <span>@{submission.username}</span>
                      <span>{formatRelativeTime(submission.submittedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="dashboard-grid">
        <Card className="dashboard-section">
          <CardHeader>
            <CardTitle>Upgrade Requests</CardTitle>
            <Link to="/admin/upgrades" className="text-link">View all</Link>
          </CardHeader>
          <CardBody>
            {upgrades.length === 0 ? (
              <EmptyState icon={<FaArrowUpRightDots />} title="No upgrade requests" />
            ) : (
              <div className="task-list">
                {upgrades.map((req) => (
                  <div key={req.id} className="task-list-item">
                    <div className="task-list-item-top">
                      <h4 className="task-list-item-title">{req.currentTier} to {req.newFollowerCount?.toLocaleString()} followers</h4>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                    <div className="task-list-item-meta">
                      <span>{formatRelativeTime(req.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="dashboard-section">
          <CardHeader>
            <CardTitle>Account Change Requests</CardTitle>
            <Link to="/admin/account-changes" className="text-link">View all</Link>
          </CardHeader>
          <CardBody>
            {accountChanges.length === 0 ? (
              <EmptyState icon={<FaArrowRightArrowLeft />} title="No account change requests" />
            ) : (
              <div className="task-list">
                {accountChanges.map((req) => (
                  <div key={req.id} className="task-list-item">
                    <div className="task-list-item-top">
                      <h4 className="task-list-item-title">
                        {req.previousPlatform} to {req.newPlatform}
                      </h4>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                    <div className="task-list-item-meta">
                      <span>@{req.previousUsername} to @{req.newUsername}</span>
                      <span>{formatRelativeTime(req.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}