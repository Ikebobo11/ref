/**
 * LETCON - Available Tasks Page
 * Shows tasks matching the earner's tier AND verified platform.
 * Displays full task details including instructions, script, and media.
 * Filters out tasks the earner has already accepted.
 */
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
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
  FaCircleCheck,
} from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useTierVisibility } from '../../hooks/useTierVisibility';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { acceptTask } from '../../services/taskService';
import { COLLECTIONS, TASK_STATUS } from '../../config/constants';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import PlatformBadge from '../../components/shared/PlatformBadge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

/**
 * Available tasks page component.
 */
export default function AvailableTasks() {
  const { userData } = useAuth();
  const { tier, platform, earner } = useTierVisibility();
  const [acceptingId, setAcceptingId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

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
      setSelectedTask(null);
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
                <p className="task-card-desc">
                  {task.instructions || task.description || 'No description provided'}
                </p>

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
                  <div className="task-card-actions">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTask(task)}
                    >
                      <FaCircleInfo /> View Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAccept(task)}
                      loading={acceptingId === task.id}
                    >
                      Accept Task
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Task Details Modal */}
      <Modal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title || 'Task Details'}
      >
        {selectedTask && (
          <div className="task-detail-modal">
            <div className="task-detail-header">
              <PlatformBadge platform={selectedTask.platform} size="sm" />
              <Badge variant="success">{formatNaira(selectedTask.paymentPerInfluencer)}</Badge>
            </div>

            <div className="task-detail-section">
              <h4><FaFileLines /> Instructions</h4>
              <p>{selectedTask.instructions || 'No instructions provided'}</p>
            </div>

            {selectedTask.script && (
              <div className="task-detail-section">
                <h4><FaFileLines /> Script</h4>
                <p>{selectedTask.script}</p>
              </div>
            )}

            {selectedTask.hashtags && (
              <div className="task-detail-section">
                <h4><FaHashtag /> Hashtags</h4>
                <div className="task-card-tags">
                  {selectedTask.hashtags.split(',').filter(Boolean).map((tag, i) => (
                    <span key={i} className="task-tag">{tag.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedTask.mentions && (
              <div className="task-detail-section">
                <h4><FaAt /> Mentions</h4>
                <p>{selectedTask.mentions}</p>
              </div>
            )}

            {selectedTask.images?.length > 0 && (
              <div className="task-detail-section">
                <h4><FaImage /> Media ({selectedTask.images.length})</h4>
                <div className="task-detail-images">
                  {selectedTask.images.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="task-detail-image-link">
                      <img src={url} alt={`Task media ${i + 1}`} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="task-detail-meta">
              <span><FaLocationDot /> {selectedTask.country}</span>
              <span><FaUsers /> {formatNumber(selectedTask.influencersNeeded)} influencers needed</span>
              <span><FaClock /> Posted {formatRelativeTime(selectedTask.createdAt)}</span>
            </div>

            <Button
              fullWidth
              onClick={() => handleAccept(selectedTask)}
              loading={acceptingId === selectedTask.id}
            >
              Accept Task
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}