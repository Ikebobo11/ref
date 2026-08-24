/**
 * LETCON - Upgrades Page
 * Admin approves or rejects earner tier upgrade requests.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaArrowUpRightDots, FaCircleCheck, FaCircleXmark, FaExternalLink } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { approveUpgrade, rejectUpgrade } from '../../services/adminService';
import { COLLECTIONS, UPGRADE_STATUS } from '../../config/constants';
import { formatNumber, formatRelativeTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

/**
 * Upgrades page component.
 */
export default function Upgrades() {
  const { userData } = useAuth();
  const [processingId, setProcessingId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: requests, loading } = useFirestoreQuery(COLLECTIONS.UPGRADE_REQUESTS, {
    filters: [{ field: 'status', operator: '==', value: UPGRADE_STATUS.PENDING }],
    orderByFields: [{ field: 'createdAt', direction: 'asc' }],
    limitCount: 50,
  });

  /**
   * Approves an upgrade request.
   * @param {Object} request - The upgrade request.
   */
  const handleApprove = async (request) => {
    setProcessingId(request.id);
    try {
      await approveUpgrade(request.id, userData.uid, userData.role);
      toast.success('Upgrade approved! Earner tier updated.');
    } catch (error) {
      toast.error(error.message);
