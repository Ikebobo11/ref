/**
 * LETCON - Account Changes Page (Super Admin)
 * Review earner account change requests: approve or reject.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaUserPlus, FaCircleCheck, FaXmark, FaArrowRightArrowLeft } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { approveAccountChange, rejectAccountChange } from '../../services/adminService';
import { COLLECTIONS } from '../../config/constants';
import { formatDate, formatNumber } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import PlatformBadge from '../../components/shared/PlatformBadge';

/**
 * Account Changes page component (Super Admin).
 */
export default function AccountChanges() {
  const { userData } = useAuth();
  const [processingId, setProcessingId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [reason, setReason] = useState('');

  const { data: requests, loading } = useFirestoreQuery(COLLECTIONS.ACCOUNT_CHANGE_REQUESTS, {
    filters: [{ field: 'status', operator: '==', value: 'pending' }],
    orderByFields: [{ field: 'createdAt', direction: 'asc' }],
    limitCount: 50,
  });

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

  const handleReject = async () => {
    if (!rejectModal) return;
    setProcessingId(rejectModal.id);
    try {
      await rejectAccountChange(rejectModal.id, userData.uid, userData.role, reason);
      toast.success('Account change rejected. Existing verified account remains active.');
      setRejectModal(null);
      setReason('');
