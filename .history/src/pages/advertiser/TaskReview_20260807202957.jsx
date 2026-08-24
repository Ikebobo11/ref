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
