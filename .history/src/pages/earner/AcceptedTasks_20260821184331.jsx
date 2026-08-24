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
  const [postLink, setPostLink] = useState('');
  const [proofFiles, setProofFiles] = useState([]);
  const [extraNotes, setExtraNotes] = useState('');

  const { data: acceptances, loading } = useFirestoreQuery(COLLECTIONS.TASK_ACCEPTANCES, {
    filters: [{ field: 'earnerId', operator: '==', value: userData?.uid || '' }],
    orderByFields: [{ field: 'acceptedAt', direction: 'desc' }],
    limitCount: 50,
  });

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

  if (loading) {
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
                {inProgress.map((acceptance) => (
                  <Card key={acceptance.id} className="task-card">
                    <CardBody>
                      <div className="verified-account-match-banner">
                        <FaShieldHalved />
                        <span>Must be completed using @{earner?.verifiedUsername} on {earner?.verifiedPlatform}</span>
                      </div>
                      <h4 className="task-card-title">Task {acceptance.taskId}</h4>
                      <div className="task-card-meta">
                        <Badge variant="warning">{TASK_STATUS.IN_PROGRESS.replace('_', ' ')}</Badge>
                        <span>Accepted {new Date(acceptance.acceptedAt?.toDate?.() || acceptance.acceptedAt).toLocaleDateString()}</span>
                      </div>
                      <Button
                        size="sm"
                        fullWidth
                        onClick={() => openSubmitModal(acceptance)}
                      >
                        Submit Proof
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="accepted-section">
            <h3 className="section-title">Submitted</h3>
            {submitted.length === 0 ? (
              <p className="muted-text">No submitted tasks.</p>
            ) : (
              <div className="task-card-grid">
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