/**
 * LETCON - Rejected Tasks Page
 * Admin reviews tasks rejected by advertisers. Final decision is binding.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaCircleXmark, FaCircleCheck, FaExternalLink } from 'react-icons/fa6';
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
 * Rejected tasks page component.
 */
export default function RejectedTasks() {
  const { userData } = useAuth();
  const [processingId, setProcessingId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: submissions, loading } = useFirestoreQuery('taskSubmissions', {
    filters: [{ field: 'status', operator: '==', value: 'pending_admin_review' }],
    orderByFields: [{ field: 'submittedAt', direction: 'desc' }],
    limitCount: 50,
  });

  /**
   * Approves a rejected task (final decision).
   * @param {Object} submission - The submission.
   */
  const handleApprove = async (submission) => {
    setProcessingId(submission.id);
    try {
      await approveTaskSubmission(submission.id, userData.uid, 'admin');
      toast.success('Task approved! Payment released.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Rejects a task (final decision).
   */
  const handleReject = async () => {
    if (!rejectModal) return;
    setProcessingId(rejectModal.id);
    try {
      await rejectTaskSubmission(rejectModal.id, userData.uid, rejectReason, 'admin');
      toast.success('Task rejected. Final decision recorded.');
      setRejectModal(null);
      setRejectReason('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <Spinner label="Loading rejected tasks..." />;
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Rejected Tasks"
        subtitle="Review tasks rejected by advertisers. Your decision is final."
        icon={<FaCircleXmark />}
      />

      {submissions.length === 0 ? (
        <EmptyState
          icon={<FaCircleXmark />}
          title="No rejected tasks to review"
          message="Tasks rejected by advertisers will appear here for your final decision."
        />
      ) : (
        <div className="review-list">
          {submissions.map((submission) => (
            <Card key={submission.id} className="review-item">
              <CardBody>
                <div className="review-item-header">
                  <div className="review-item-title">
                    <h4>Task {submission.taskId}</h4>
                    <Badge variant="danger">Admin Review</Badge>
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
                    <span className="label">Platform</span>
                    <span className="value">{submission.platform}</span>
                  </div>
                  <div className="review-detail-row">
                    <span className="label">Verified Match</span>
                    <span className="value">
                      <Badge variant={submission.verifiedAccountMatch ? 'success' : 'danger'}>
                        {submission.verifiedAccountMatch ? 'Confirmed' : 'Mismatch'}
                      </Badge>
                    </span>
                  </div>
                  <div className="review-detail-row">
                    <span className="label">Advertiser Reason</span>
                    <span className="value">{submission.rejectionReason || 'No reason provided'}</span>
                  </div>
                  {submission.postLink && (
                    <div className="review-detail-row">
                      <span className="label">Post Link</span>
                      <span className="value">
