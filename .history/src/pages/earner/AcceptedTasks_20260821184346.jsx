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
                {submitted.map((acceptance) => (
                  <Card key={acceptance.id} className="task-card">
                    <CardBody>
                      <h4 className="task-card-title">Task {acceptance.taskId}</h4>
                      <div className="task-card-meta">
                        <Badge variant={acceptance.status === TASK_STATUS.FLAGGED ? 'danger' : 'info'}>
                          {acceptance.status.replace('_', ' ')}
                        </Badge>
                        {acceptance.status === TASK_STATUS.FLAGGED && (
                          <p className="flag-warning">
                            Your submission was flagged for admin review. Using a different account is a violation.
                          </p>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Submission Modal */}
      <Modal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title="Submit Task Proof"
        size="lg"
      >
        {selectedTask && (
          <div className="submission-form">
            <div className="verified-account-match-banner strong">
              <FaShieldHalved />
              <div>
                <strong>Verified Account Confirmation</strong>
                <p>
                  Your task will be linked to @{earner?.verifiedUsername} on {earner?.verifiedPlatform}.
                  Submissions from any other account will be flagged for admin review.
                </p>
              </div>
            </div>

            <Input
              label="Post / Profile Link"
              type="url"
              placeholder="https://..."
              value={postLink}
              onChange={(e) => setPostLink(e.target.value)}
              helperText="The URL of your post or profile on your verified account"
            />

            <FileUpload
              label="Upload Proof (Screenshots or Videos)"
              accept="image/*,video/*"
              multiple
              onChange={setProofFiles}
              helperText="Screenshots or videos showing your completed task"
            />

            <Input
              label="Additional Notes (Optional)"
              type="text"
              placeholder="Any additional information"
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
            />

            <Button onClick={handleSubmit} fullWidth loading={submitting}>
              <FaPaperPlane /> Submit Proof
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}