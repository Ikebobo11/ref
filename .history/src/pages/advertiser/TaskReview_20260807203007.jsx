/**
 * LETCON - Task Review Page
 * Advertiser reviews task submissions. Approve releases payment (70/30 split).
 * Reject sends to admin review. Auto-approval after 24 hours if no action.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaClockRotateLeft, FaCircleCheck, FaCircleXmark, FaClock } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { approveTaskSubmission, rejectTaskSubmission } from '../../services/taskService';
import { COLLECTIONS, TASK_STATUS, AUTO_APPROVAL_HOURS } from '../../config/constants';
import { formatNaira, formatRelativeTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

/**
 * Task review page component.
 */
export default function TaskReview() {
  const { user } = useAuth();
  const [processingId, setProcessingId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: submissions, loading } = useFirestoreQuery('taskSubmissions', {
    filters: [{ field: 'status', operator: '==', value: TASK_STATUS.SUBMITTED }],
    orderByFields: [{ field: 'submittedAt', direction: 'desc' }],
    limitCount: 50,
  });

  /**
   * Approves a submission and releases payment.
   * @param {Object} submission - The submission.
   */
  const handleApprove = async (submission) => {
    setProcessingId(submission.id);
    try {
      await approveTaskSubmission(submission.id, user.uid, 'advertiser');
      toast.success('Task approved! Payment released (70% to earner, 30% platform).');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Rejects a submission (goes to admin review).
   */
  const handleReject = async () => {
    if (!rejectModal) return;
    setProcessingId(rejectModal.id);
    try {
      await rejectTaskSubmission(rejectModal.id, user.uid, rejectReason, 'advertiser');
      toast.success('Task rejected. It has been sent to admin review.');
      setRejectModal(null);
      setRejectReason('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <Spinner label="Loading submissions..." />;
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Task Review"
        subtitle={`Approve or reject submissions. Auto-approved after ${AUTO_APPROVAL_HOURS} hours if no action.`}
        icon={<FaClockRotateLeft />}
      />

      <div className="auto-approval-note">
        <FaClock />
        <span>
          If you do not review a submission within {AUTO_APPROVAL_HOURS} hours, it will be
          automatically approved and payment released. You cannot reject after auto-approval.
        </span>
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          icon={<FaClockRotateLeft />}
          title="No submissions to review"
          message="When earners submit task proofs, they will appear here for your approval."
        />
      ) : (
        <div className="review-list">
          {submissions.map((submission) => (
            <Card key={submission.id} className="review-item">
              <CardBody>
                <div className="review-item-header">
                  <div className="review-item-title">
