/**
 * LETCON - Verification Page (Super Admin)
 * Review earner verification requests: approve or reject with reason.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaUserShield, FaCircleCheck, FaXmark } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { approveVerification, rejectVerification } from '../../services/adminService';
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

/**
 * Verification page component.
 */
export default function Verification() {
  const { userData } = useAuth();
  const [processingId, setProcessingId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [reason, setReason] = useState('');

  const { data: requests, loading } = useFirestoreQuery(COLLECTIONS.VERIFICATION_REQUESTS, {
    filters: [{ field: 'status', operator: '==', value: 'pending' }],
    orderByFields: [{ field: 'createdAt', direction: 'asc' }],
    limitCount: 50,
  });

  const handleApprove = async (request) => {
    setProcessingId(request.id);
    try {
      await approveVerification(request.id, userData.uid, userData?.role || 'super_admin');
      toast.success(`Verified @${request.username} on ${request.platform}!`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    if (!reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setProcessingId(rejectModal.id);
    try {
      await rejectVerification(rejectModal.id, userData.uid, userData?.role || 'super_admin', reason);
      toast.success('Verification rejected
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
        <EmptyState icon={<FaUserShield />} title="No pending verifications" message="New earner verification requests will appear here." />
      ) : (
        <div className="verification-list">
          {requests.map((request) => (
            <Card key={request.id} className="verification-item">
              <CardBody>
                <div className="verification-item-header">
                  <div className="verification-item-title">
                    <span style={{ fontSize: '1.1rem' }}>{request.platform}</span>
                    <h4 style={{ margin: '0 0 0 8px' }}>@{request.username}</h4>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                  <span className="verification-item-date">
                    {formatDate(request.createdAt?.toDate?.() || request.createdAt)}
                  </span>
                </div>
                <div className="review-item-details">
                  <div className="review-detail-row">
                    <span className="label">Full Name</span>
                    <span className="value">{request.fullName}</span>
                  </div>
                  <div className="review-detail-row">
                    <span className="label">Email</span>
                    <span className="value">{request.email}</span>
                  </div>
                  <div className="review-detail-row">
                    <span className="label">Follower Count</span>
                    <span className="value">{formatNumber(request.followerCount)}</span>
                  </div>
                  {request.profileUrl && (
                    <div className="review-detail-row">
                      <span className="label">Profile URL</span>
                      <span className="value">
                        <a href={request.profileUrl} target="_blank" rel="noopener noreferrer">View profile</a>
                      </span>
                    </div>
                  )}
                  {request.followerScreenshotUrl && (
                    <div className="review-detail-row">
                      <span className="label">Follower Proof</span>
                      <span className="value">
                        <a href={request.followerScreenshotUrl} target="_blank" rel="noopener noreferrer">View screenshot</a>
                      </span>
                    </div>
                  )}
                  <div className="review-detail-row">
                    <span className="label">Fee Paid</span>
                    <span className="value">
                      <Badge variant={request.feePaid ? 'success' : 'danger'}>
                        {request.feePaid ? 'Paid' : 'Not Paid'}
                      </Badge>
                    </span>
                  </div>
                </div>
                <div className="verification-item-actions">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApprove(request)}
                    loading={processingId === request.id}
                  >
                    <FaCircleCheck /> Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setRejectModal(request)}
                    disabled={processingId === request.id}
                  >
                    <FaXmark /> Reject
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={Boolean(rejectModal)}
        onClose={() => setRejectModal(null)}
        title="Reject Verification"
      >
        {rejectModal && (
          <div className="reject-form">
            <p className="reject-info">
              Rejecting this verification means the followers are fake, bought, artificial, bot, or spam.
            </p>
            <Input
              label="Rejection Reason"
              type="text"
              placeholder="e.g., Fake followers detected"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button
              variant="danger"
              fullWidth
              onClick={handleReject}
              loading={processingId === rejectModal.id}
            >
              Confirm Rejection
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}