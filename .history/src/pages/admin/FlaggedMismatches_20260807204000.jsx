/**
 * LETCON - Flagged Mismatches Page
 * Admin reviews task submissions flagged for verified account mismatch.
 * These are excluded from auto-approval and must go through admin review.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaTriangleExclamation, FaCircleCheck, FaCircleXmark, FaExternalLink } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { approveTaskSubmission, rejectTaskSubmission } from '../../services/taskService';
import { formatRelativeTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

/**
 * Flagged mismatches page component.
 */
export default function FlaggedMismatches() {
  const { userData } = useAuth();
  const [processingId, setProcessingId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: submissions, loading } = useFirestoreQuery('taskSubmissions', {
    filters: [{ field: 'status', operator: '==', value: 'flagged' }],
    orderByFields: [{ field: 'submittedAt', direction: 'desc' }],
    limitCount: 50,
  });

  /**
   * Approves a flagged submission.
   * @param {Object} submission - The submission.
   */
  const handleApprove = async (submission) => {
    setProcessingId(submission.id);
    try {
      await approveTaskSubmission(submission.id, userData.uid, 'admin');
      toast.success('Submission approved! Payment released.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Rejects a flagged submission.
   */
  const handleReject = async () => {
    if (!rejectModal) return;
    setProcessingId(rejectModal.id);
    try {
      await rejectTaskSubmission(rejectModal.id, userData.uid, rejectReason, 'admin');
      toast.success('Submission rejected. Violation recorded.');
      setRejectModal(null);
      setRejectReason('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <Spinner label="Loading flagged submissions..." />;
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Flagged Account Mismatches"
        subtitle="Submissions where the account does not match the earner's verified account"
        icon={<FaTriangleExclamation />}
      />

      <div className="auto-approval-note danger">
        <FaTriangleExclamation />
        <span>
          These submissions are <strong>excluded from auto-approval</strong> and must be reviewed
          by an admin regardless of the 24-hour window.
        </span>
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          icon={<FaTriangleExclamation />}
          title="No flagged mismatches"
          message="Submissions with verified account mismatches will appear here."
        />
      ) : (
        <div className="review-list">
          {submissions.map((submission) => (
            <Card key={submission.id} className="review-item flagged">
              <CardBody>
                <div className="review-item-header">
                  <div className="review-item-title">
                    <h4>Task {submission.taskId}</h4>
                    <Badge variant="danger">Flagged</Badge>
                  </div>
                  <span className="review-item-time">
                    {formatRelativeTime(submission.submittedAt?.toDate?.() || submission.submittedAt)}
                  </span>
                </div>

                <div className="review-item-details">
                  <div className="review-detail-row">
                    <span className="label">Earner</span>
                    <span className="value">@{submission.username}</span>
                  </div>
                  <div className="review-detail-row">
                    <span className="label">Submitted Platform</span>
                    <span className="value">{submission.platform}</span>
                  </div>
