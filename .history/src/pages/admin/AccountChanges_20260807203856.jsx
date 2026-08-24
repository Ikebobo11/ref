/**
 * LETCON - Account Changes Page
 * Admin approves or rejects earner account change requests.
 * Full audit history: previous account, requested account, decision, admin, timestamp.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaArrowRightArrowLeft, FaCircleCheck, FaCircleXmark, FaExternalLink } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { approveAccountChange, rejectAccountChange } from '../../services/adminService';
import { COLLECTIONS, ACCOUNT_CHANGE_STATUS } from '../../config/constants';
import { formatNumber, formatRelativeTime } from '../../utils/formatters';
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
 * Account changes page component.
 */
export default function AccountChanges() {
  const { userData } = useAuth();
  const [processingId, setProcessingId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: requests, loading } = useFirestoreQuery(COLLECTIONS.ACCOUNT_CHANGE_REQUESTS, {
    filters: [{ field: 'status', operator: '==', value: ACCOUNT_CHANGE_STATUS.PENDING }],
    orderByFields: [{ field: 'createdAt', direction: 'asc' }],
    limitCount: 50,
  });

  /**
   * Approves an account change request.
   * @param {Object} request - The account change request.
   */
  const handleApprove = async (request) => {
    setProcessingId(request.id);
    try {
      await approveAccountChange(request.id, userData.uid, userData.role);
      toast.success('Account change approved! Verified account updated.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Rejects an account change request.
   */
  const handleReject = async () => {
    if (!rejectModal) return;
