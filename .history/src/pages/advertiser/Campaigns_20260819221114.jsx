/**
 * LETCON - Campaigns Page
 * Lists all advertiser campaigns with status and performance.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaBullhorn, FaCirclePlus, FaUsers, FaCircleCheck, FaClock, FaTrash } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PlatformBadge from '../../components/shared/PlatformBadge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

/**
 * Gets badge variant for task status.
 * @param {string} status - Task status.
 * @returns {string} Badge variant.
 */
function getStatusVariant(status) {
  switch (status) {
    case TASK_STATUS.PUBLISHED:
      return 'success';
    case TASK_STATUS.DRAFT:
      return 'default';
    case TASK_STATUS.COMPLETED:
      return 'info';
    case TASK_STATUS.SUBMITTED:
      return 'warning';
    default:
      return 'default';
  }
}

/**
 * Campaigns page component.
 */
export default function Campaigns() {
  const { userData } = useAuth();

  const { data: tasks, loading } = useFirestoreQuery(COLLECTIONS.TASKS, {
    filters: [{ field: 'advertiserId', operator: '==', value: userData?.uid || '' }],
    orderByFields: [{ field: 'createdAt', direction: 'desc' }],
    limitCount: 50,
  });

  if (loading) {
    return <Spinner label="Loading campaigns..." />;
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Campaigns"
        subtitle="Manage your promotional tasks"
        icon={<FaBullhorn />}
        actions={
          <Link to="/advertiser/create-campaign">
            <button className="btn btn-primary btn-sm">
              <FaCirclePlus /> New Campaign
            </button>
          </Link>
        }
      />

      {tasks.length === 0 ? (
        <EmptyState
          icon={<FaBullhorn />}
          title="No campaigns yet"
          message="Create your first campaign to start reaching micro influencers."
          action={
            <Link to="/advertiser/create-campaign">
              <button className="btn btn-primary">Create Campaign</button>
            </Link>
          }
        />
      ) : (
        <div className="campaign-list">
          {tasks.map((task) => (
            <Card key={task.id} className="campaign-item">
              <CardBody>
                <div className="campaign-item-header">
                  <div className="campaign-item-title">
                    <PlatformBadge platform={task.platform} size="sm" showName={false} />
                    <h4>{task.title}</h4>
                    <Badge variant={getStatusVariant(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <span className="campaign-item-date">
                    {formatRelativeTime(task.createdAt)}
                  </span>
                </div>

                <p className="campaign-item-desc">{task.description}</p>

                <div className="campaign-item-meta">
                  <span><FaUsers /> {formatNumber(task.influencersNeeded)} influencers</span>
                  <span><FaCircleCheck /> {formatNumber(task.completedCount || 0)} completed</span>
                  <span><FaClock /> {task.followerTier} tier</span>
                  <span className="campaign-item-budget">{formatNaira(task.budget)}</span>
                </div>

                <div className="campaign-item-footer">
                  <span className="campaign-item-payment">
                    Payment per influencer: <strong>{formatNaira(task.paymentPerInfluencer)}</strong>
                  </span>
                  {task.status === TASK_STATUS.DRAFT && (
                    <span className="muted-text">Awaiting posting fee payment</span>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}