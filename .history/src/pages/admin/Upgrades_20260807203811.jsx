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
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Rejects an upgrade request.
   */
  const handleReject = async () => {
    if (!rejectModal) return;
    setProcessingId(rejectModal.id);
    try {
      await rejectUpgrade(rejectModal.id, userData.uid, userData.role, rejectReason);
      toast.success('Upgrade rejected.');
      setRejectModal(null);
      setRejectReason('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <Spinner label="Loading upgrade requests..." />;
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Approve Upgrades"
        subtitle="Review earner tier upgrade requests"
        icon={<FaArrowUpRightDots />}
      />

      {requests.length === 0 ? (
        <EmptyState
          icon={<FaArrowUpRightDots />}
          title="No upgrade requests"
          message="Earner tier upgrade requests will appear here."
        />
      ) : (
        <div className="review-list">
          {requests.map((request) => (
            <Card key={request.id} className="review-item">
              <CardBody>
                <div className="review-item-header">
                  <div className="review-item-title">
                    <h4>Upgrade Request</h4>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                  <span className="review-item-time">
                    {formatRelativeTime(request.createdAt?.toDate?.() || request.createdAt)}
                  </span>
                </div>

                <div className="review-item-details">
                  <div className="review-detail-row">
                    <span className="label">Current Tier</span>
                    <span className="value">{request.currentTier}</span>
                  </div>
                  <div className="review-detail-row">
                    <span className="label">New Follower Count</span>
                    <span className="value">{formatNumber(request.newFollowerCount)}</span>
                  </div>
                  <div className="review-detail-row">
                    <span className="label">New Profile Link</span>
                    <span className="value">
                      <a href={request.newProfileLink} target="_blank" rel="noopener noreferrer">
                        <FaExternalLink /> View profile
                      </a>
                    </span>
                  </div>
                  <div className="review-detail-row">
                    <span className="label">New Screenshot</span>
                    <span className="value">
                      <a href={request.newScreenshotUrl} target="_blank" rel="noopener noreferrer">
                        <FaExternalLink /> View screenshot
                      </a>
                    </span>
                  </div>
                </div>

                <div className="review-item-actions">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApprove(request)}
                    loading={processingId === request.id}
                  >
                    <FaCircleCheck /> Approve
