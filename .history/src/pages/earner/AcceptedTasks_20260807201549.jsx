/**
 * LETCON - Accepted Tasks Page
 * Shows tasks the earner has accepted and allows submitting proof using the verified account only.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaClipboardCheck, FaPaperPlane, FaShieldHalved } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useTierVisibility } from '../../hooks/useTierVisibility';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { submitTaskProof } from '../../services/taskService';
import { uploadTaskProof } from '../../services/storageService';
import { COLLECTIONS, TASK_STATUS } from '../../config/constants';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import FileUpload from '../../components/ui/FileUpload';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

/**
 * Accepted tasks page component.
 */
export default function AcceptedTasks() {
  const { userData, user } = useAuth();
  const { earner } = useTierVisibility();
  const [submitting, setSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [postLink, setPostLink] = useState('');
  const [proofFiles, setProofFiles] = useState([]);
  const [extraNotes, setExtraNotes] = useState('');

  const { data: acceptances, loading } = useFirestoreQuery('taskAcceptances', {
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
