/**
 * LETCON - Available Tasks Page
 * Shows tasks matching the earner's tier AND verified platform.
 * Displays full task details including instructions, script, and media.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  FaListCheck,
  FaLocationDot,
  FaUsers,
  FaClock,
  FaCircleInfo,
  FaHashtag,
  FaAt,
  FaFileLines,
  FaImage,
} from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useTierVisibility } from '../../hooks/useTierVisibility';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { acceptTask } from '../../services/taskService';
import { COLLECTIONS, TASK_STATUS } from '../../config/constants';
import { formatNaira, formatRelativeTime, formatNumber } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
export default function AvailableTasks() {
  const { userData } = useAuth();
  const { tier, platform, earner } = useTierVisibility();
  const [acceptingId, setAcceptingId] = useState(null);

  // Query strictly by earner's tier + platform - enforced at query level
  const { data: tasks, loading } = useFirestoreQuery(COLLECTIONS.TASKS, {
    filters: [
      { field: 'followerTier', operator: '==', value: tier || '' },
      { field: 'platform', operator: '==', value: platform || '' },
      { field: 'status', operator: '==', value: TASK_STATUS.PUBLISHED },
    ],
    orderByFields: [{ field: 'createdAt', direction: 'desc' }],
    limitCount: 50,
  });

  /**
   * Handles task acceptance.
   * @param {Object} task - The task object.
   */
  const handleAccept = async (task) => {
    setAcceptingId(task.id);
    try {
      await acceptTask(task.id, earner);
      toast.success('Task accepted! Complete it using your verified account.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return <Spinner label="Loading available tasks..." />;
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Available Tasks"
        subtitle={`Showing ${tier} ${platform} tasks only, per LETCON visibility rules`}
        icon={<FaListCheck />}
      />

      {tasks.length === 0 ? (
        <EmptyState
          icon={<FaListCheck />}
          title="No tasks available"
          message={`There are currently no ${tier} ${platform} tasks available. New tasks appear here when advertisers publish them.`}
        />
      ) : (
        <div className="task-card-grid">
          {tasks.map((task) => (
            <Card key={task.id} hoverable className="task-card">
              <CardHeader>
                <div className="task-card-header-top">
                  <PlatformBadge platform={task.platform} size="sm" showName={false} />
                  <Badge variant="success">{formatNaira(task.paymentPerInfluencer)}</Badge>
                </div>
                <CardTitle>{task.title}</CardTitle>
              </CardHeader>
              <CardBody>
                <p className="task-card-desc">{task.description}</p>

                <div className="task-card-tags">
                  {task.hashtags?.split(',').filter(Boolean).slice(0, 4).map((tag, i) => (
                    <span key={i} className="task-tag">{tag.trim()}</span>
                  ))}
                </div>

                <div className="task-card-meta">
                  <span><FaLocationDot /> {task.country}</span>
                  <span><FaUsers /> {formatNumber(task.influencersNeeded)} needed</span>
                  <span><FaClock /> {formatRelativeTime(task.createdAt)}</span>
                </div>

                <div className="task-card-footer">
                  <span className="task-deadline">
                    Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Not set'}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleAccept(task)}
                    loading={acceptingId === task.id}
                  >
                    Accept Task
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}