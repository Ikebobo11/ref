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
  const handleApprove = async (request) => {
    setProcessingId(request.id);
    try {
      await approveVerification(request.id, userData.uid, userData.role);
      toast.success(`Verified @${request.username} on ${request.platform}!`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Rejects a verification request.
   */
  const handleReject = async () => {
    if (!rejectModal) return;
    setProcessingId(rejectModal.id);
    try {
      await rejectVerification(rejectModal.id, userData.uid, userData.role, rejectReason);
      toast.success('Verification rejected. The fee is non-refundable.');
      setRejectModal(null);
      setRejectReason('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <Spinner label="Loading verification queue..." />;
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Verification Queue"
        subtitle="Review earner accounts and follower proof"
        icon={<FaUserShield />}
      />

      {requests.length === 0 ? (
        <EmptyState
          icon={<FaUserShield />}
          title="No pending verifications"
          message="New earner verification requests will appear here."
        />
      ) : (
        <div className="verification-list">
          {requests.map((request) => (
            <Card key={request.id} className="verification-item">
              <CardBody>
                <div className="verification-item-header">
                  <div className="verification-item-title">
                    <PlatformBadge platform={request.platform} size="sm" />
                    <h4>@{request.username}</h4>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                  <span className="verification-item-date">
                    {formatDateTime(request.createdAt?.toDate?.() || request.createdAt)}
                  </span>
                </div>

                <div className="verification-item-details">
                  <div className="review-detail-row">
                    <span className="label">Full Name</span>
                    <span className="value">{request.fullName}</span>
                  </div>
                  <div className="review-detail-row">
                    <span className="label">Email</span>
                    <span className="value">{request.email}</span>
                  </div>
                  <div className="review-detail-row">
                    <span className="label">Platform</span>
                    <span className="value">{request.platform}</span>
                  </div>
                  <div className="review-detail-row">
                    <span className="label">Username</span>
                    <span className="value">@{request.username}</span>
                  </div>
                  <div className="review-detail-row">
                    <span className="label">Follower Count</span>
                    <span className="value">{formatNumber(request.followerCount)}</span>
                  </div>
                  <div className="review-detail-row">
                    <span className="label">Profile URL</span>
                    <span className="value">
                      <a href={request.profileUrl} target="_blank" rel="noopener noreferrer">
                        <FaExternalLink /> View profile
                      </a>
                    </span>
                  </div>
