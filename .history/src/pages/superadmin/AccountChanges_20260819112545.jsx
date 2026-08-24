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
      await approveAccountChange(request.id, userData.uid, userData?.role || 'super_admin');
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
      await rejectAccountChange(rejectModal.id, userData.uid, userData?.role || 'super_admin', reason);
      toast.success('Account change rejected. Existing verified account remains active.');
      setRejectModal(null);
      setReason('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <Spinner label="Loading account change requests..." />;
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Account Change Requests"
        subtitle="Review earner requests to change their verified promotion account"
        icon={<FaUserPlus />}
      />

      {requests.length === 0 ? (
        <EmptyState icon={<FaUserPlus />} title="No account change requests" message="Earner account change requests will appear here." />
      ) : (
        <div className="review-list">
          {requests.map((request) => (
            <Card key={request.id} className="review-item">
              <CardBody>
                <div className="review-item-header">
                  <div className="review-item-title">
                    <h4>Account Change Request</h4>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                  <span className="review-item-time">
                    {formatDate(request.createdAt?.toDate?.() || request.createdAt)}
                  </span>
                </div>

                <div className="account-change-comparison" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div className="account-change-side" style={{ flex: 1 }}>
                    <h5>Current Account</h5>
                    <div style={{ margin: '0.5rem 0' }}>
                      <PlatformBadge platform={request.previousPlatform} size="sm" />
                    </div>
                    <div className="review-detail-row">
                      <span className="label">Username</span>
                      <span className="value">@{request.previousUsername}</span>
                    </div>
                    <div className="review-detail-row">
                      <span className="label">Profile URL</span>
                      <span className="value">{request.previousProfileUrl}</span>
                    </div>
                  </div>
                  <div className="account-change-arrow" style={{ paddingTop: '3rem' }}>
                    <FaArrowRightArrowLeft />
                  </div>
                  <div className="account-change-side" style={{ flex: 1 }}>
                    <h5>Requested Account</h5>
                    <div style={{ margin: '0.5rem 0' }}>
                      <PlatformBadge platform={request.newPlatform} size="sm" />
                    </div>
                    <div className="review-detail-row">
                      <span className="label">Username</span>
                      <span className="value">@{request.newUsername}</span>
                    </div>
                    <div className="review-detail-row">
                      <span className="label">Profile URL</span>
                      <span className="value">{request.newProfileUrl}</span>
                    </div>
                    <div className="review-detail-row">
                      <span className="label">Followers</span>
                      <span className="value">{formatNumber(request.newFollowerCount)}</span>
                    </div>
                  </div>
                </div>

                <div className="review-item-details">
                  <div className="review-detail-row">
                    <span className="label">Reason</span>
                    <span className="value">{request.reason}</span>
                  </div>
                  {request.newScreenshotUrl && (
                    <div className="review-detail-row">
                      <span className="label">New Screenshot</span>
                      <span className="value">
                        <a href={request.newScreenshotUrl} target="_blank" rel="noopener noreferrer">View screenshot</a>
                      </span>
                    </div>
                  )}
                </div>

                <div className="review-item-actions">
                  <Button variant="success" size="sm" onClick={() => handleApprove(request)} loading={processingId === request.id}>
                    <FaCircleCheck /> Approve
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setRejectModal(request)} disabled={processingId === request.id}>
                    <FaXmark /> Reject
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={Boolean(rejectModal)} onClose={() => setRejectModal(null)} title="Reject Account Change">
        {rejectModal && (
          <div className="reject-form">
            <p className="reject-info">
              Rejecting this request keeps the existing verified account active.
            </p>
            <Input
              label="Rejection Reason"
              type="text"
              placeholder="Why is this account change being rejected?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button variant="danger" fullWidth onClick={handleReject} loading={processingId === rejectModal.id}>
              Confirm Rejection
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}