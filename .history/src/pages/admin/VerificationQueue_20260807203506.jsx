/**
 * LETCON - Verification Queue Page
 * Admin reviews earner verification requests and follower proof.
 * Rejects fake/bought/bot followers. Fee is non-refundable.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaUserShield, FaCircleCheck, FaCircleXmark, FaExternalLink } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { approveVerification, rejectVerification } from '../../services/adminService';
import { COLLECTIONS, VERIFICATION_STATUS } from '../../config/constants';
import { formatNumber, formatDateTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import PlatformBadge from '../../components/shared/PlatformBadge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

/**
 * Verification queue page component.
 */
export default function VerificationQueue() {
  const { userData } = useAuth();
  const [processingId, setProcessingId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: requests, loading } = useFirestoreQuery(COLLECTIONS.VERIFICATION_REQUESTS, {
    filters: [{ field: 'status', operator: '==', value: VERIFICATION_STATUS.PENDING }],
    orderByFields: [{ field: 'createdAt', direction: 'asc' }],
    limitCount: 50,
  });

  /**
   * Approves a verification request.
   * @param {Object} request - The verification request.
   */
