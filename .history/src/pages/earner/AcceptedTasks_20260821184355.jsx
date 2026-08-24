/**
 * LETCON - Accepted Tasks Page
 * Shows tasks the earner has accepted with full task details.
 * Allows submitting proof using the verified account only.
 */
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FaClipboardCheck,
  FaPaperPlane,
  FaShieldHalved,
  FaCircleInfo,
  FaLocationDot,
  FaUsers,
  FaClock,
  FaHashtag,
  FaAt,
  FaFileLines,
  FaImage,
} from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useTierVisibility } from '../../hooks/useTierVisibility';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { submitTaskProof } from '../../services/taskService';
import { uploadTaskProof } from '../../services/storageService';
import { getDocument } from '../../services/firestoreService';
import { COLLECTIONS, TASK_STATUS } from '../../config/constants';
import { formatNaira, formatRelativeTime, formatNumber } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import FileUpload from '../../components/ui/FileUpload';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import PlatformBadge from '../../components/shared/PlatformBadge';

/**
 * Accepted tasks page component.
 */
export default function AcceptedTasks() {
  const { userData, user } = useAuth();
  const { earner } = useTierVisibility();
  const [submitting, setSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewDetailsTask, setViewDetailsTask] = useState(null);
  const [postLink, setPostLink] = useState('');
  const [proofFiles, setProofFiles] = useState([]);
  const [extraNotes, setExtraNotes] = useState('');
  const [taskDetails, setTaskDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(true);

  const { data: acceptances, loading } = useFirestoreQuery(COLLECTIONS.TASK_ACCEPTANCES, {
    filters: [{ field: 'earnerId', operator: '==', value: userData?.uid || '' }],
    orderByFields: [{ field: 'acceptedAt', direction: 'desc' }],
    limitCount: 50,
  });

  /**
   * Fetches task details for all accepted tasks.
   */
  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (acceptances.length === 0) {
        setLoadingDetails(false);
        return;
      }

      try {
        const details = {};
        await Promise.all(
          acceptances.map(async (acceptance) => {
            const task = await getDocument(COLLECTIONS.TASKS, acceptance.taskId);
            if (task) {
              details[acceptance.taskId] = task;
            }
          })
        );
        setTaskDetails(details);
      } catch (error) {
        console.error('[LETCON] Error fetching task details:', error);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchTaskDetails();
  }, [acceptances]);

  /**
   * Opens the submission modal for a task.
   * @param {Object} acceptance - The acceptance record.
   */
  const openSubmitModal = (acceptance) => {
    setSelectedTask(acceptance);
    setPostLink('');
    setProofFiles([]);
    setExtraNotes('');
  };

  /**
   * Submits task proof with verified account matching.
   */
  const handleSubmit = async () => {
    if (!selectedTask) return;
    if (!earner) {
      toast.error('Your verified account information is not available. Please complete verification first.');
      return;
    }
    setSubmitting(true);
    try {
      // Upload proof files to storage
      const uploadedProofs = [];
      for (const file of proofFiles) {
        const upload = await uploadTaskProof(file, user.uid);
        uploadedProofs.push(upload.downloadUrl);
      }

      // Submit proof - the service checks verified account match
      await submitTaskProof(selectedTask.taskId, {
        platform: earner.verifiedPlatform,
        username: earner.verifiedUsername,
        profileUrl: earner.profileUrl,
        postLink,
        proofUrls: uploadedProofs,
        notes: extraNotes,
      }, earner);

      toast.success('Task submitted! It will be reviewed by the advertiser.');
      setSelectedTask(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingDetails) {
    return <Spinner label="Loading accepted tasks..." />;
  }

  const inProgress = acceptances.filter((a) => a.status === TASK_STATUS.IN_PROGRESS);
  const submitted = acceptances.filter((a) => a.status === TASK_STATUS.SUBMITTED || a.status === TASK_STATUS.FLAGGED);

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Accepted Tasks"
        subtitle="Complete tasks using your verified account only"
        icon={<FaClipboardCheck />}
      />

      {acceptances.length === 0 ? (
        <EmptyState
          icon={<FaClipboardCheck />}
          title="No accepted tasks yet"
          message="Browse available tasks and accept one to get started."
        />
      ) : (
        <>
          <div className="accepted-section">
            <h3 className="section-title">In Progress</h3>
            {inProgress.length === 0 ? (
              <p className="muted-text">No tasks in progress.</p>
            ) : (
              <div className="task-card-grid">
                {inProgress.map((acceptance) => {
                  const task = taskDetails[acceptance.taskId];
                  return (
                    <Card key={acceptance.id} className="task-card">
                      <CardHeader>
                        <div className="task-card-header-top">
                          {task && <PlatformBadge platform={task.platform} size="sm" showName={false} />}
                          {task && <Badge variant="success">{formatNaira(task.paymentPerInfluencer)}</Badge>}
                        </div>
                        <CardTitle>{task?.title || `Task ${acceptance.taskId}`}</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <div className="verified-account-match-banner">
                          <FaShieldHalved />
                          <span>Must be completed using @{earner?.verifiedUsername} on {earner?.verifiedPlatform}</span>
                        </div>

                        {task && (
                          <>
                            <p className="task-card-desc">
                              {task.instructions || task.description || 'No description provided'}
                            </p>

                            <div className="task-card-meta">
                              <span><FaLocationDot /> {task.country}</span>
                              <span><FaClock /> Accepted {new Date(acceptance.acceptedAt?.toDate?.() || acceptance.acceptedAt).toLocaleDateString()}</span>
                            </div>
                          </>
                        )}

                        <div className="task-card-footer">
                          <Badge variant="warning">{TASK_STATUS.IN_PROGRESS.replace('_', ' ')}</Badge>
                          <div className="task-card-actions">
                            {task && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewDetailsTask({ ...task, acceptance })}
                              >
                                <FaCircleInfo /> Details
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => openSubmitModal(acceptance)}
                            >
                              Submit Proof
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <div className="accepted-section">
            <h3 className="section-title">Submitted</h3>
            {submitted.length === 0 ? (
              <p className="muted-text">No submitted tasks.</p>
            ) : (
