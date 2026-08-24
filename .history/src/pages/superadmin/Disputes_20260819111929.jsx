/**
 * LETCON - Disputes Page (Super Admin)
 * Review and manage platform disputes with notifications and audit trail.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaTriangleExclamation, FaCircleCheck, FaXmark, FaClock } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { updateDocument } from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import { formatDateTime } from '../../utils/formatters';
import { notifyDisputeResolved, notifyDisputeRejected } from '../../services/notificationService';
import { logDisputeResolve, logDisputeReject } from '../../services/auditService';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

/**
 * Returns badge variant for a dispute status.
 * @param {string} status - The dispute status.
 * @returns {string} Badge variant.
 */
function getStatusVariant(status) {
  switch (status) {
    case 'resolved':
      return 'success';
    case 'rejected':
      return 'danger';
    default:
      return 'warning';
  }
}

/**
 * Disputes page component.
 */
export default function Disputes() {
  const { userData } = useAuth();
  const [processingId, setProcessingId] = useState(null);
  const [resolveModal, setResolveModal] = useState(null);
  const [resolution, setResolution] = useState('');

  const { data: disputes, loading } = useFirestoreQuery(COLLECTIONS.DISPUTES, {
    filters: [{ field: 'status', operator: '==', value: 'pending' }],
    orderByFields: [{ field: 'createdAt', direction: 'desc' }],
    limitCount: 50,
  });

  const actorId = userData?.uid || 'unknown';
  const actorRole = userData?.role || 'super_admin';

  const handleResolve = async () => {
    if (!resolveModal) return;
    if (!resolution.trim()) {
      toast.error('Please provide resolution details');
      return;
    }
    setProcessingId(resolveModal.id);
    try {
      await updateDocument(COLLECTIONS.DISPUTES, resolveModal.id, {
        status: 'resolved',
        resolution,
        resolvedAt: new Date(),
        resolvedBy: actorId,
      });

      // Notify the user and log the audit event
      await notifyDisputeResolved(resolveModal.uid, resolution);
      await logDisputeResolve(actorId, actorRole, resolveModal.id, {
        uid: resolveModal.uid,
        resolution,
      });

      toast.success('Dispute resolved successfully.');
      setResolveModal(null);
      setResolution('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (dispute) => {
    setProcessingId(dispute.id);
    try {
      await updateDocument(COLLECTIONS.DISPUTES, dispute.id, {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectedBy: actorId,
      });

      // Notify the user and log the audit event
      await notifyDisputeRejected(dispute.uid);
      await logDisputeReject(actorId, actorRole, dispute.id, {
        uid: dispute.uid,
      });

      toast.success('Dispute rejected.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <Spinner label="Loading disputes..." />;
  }

  const pending = disputes.filter((d) => d.status === 'pending').length;

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Disputes"
        subtitle="Review and resolve platform disputes"
        icon={<FaTriangleExclamation />}
      />

      <div className="stat-grid">
        <div className="stat-card stat-warning">
          <div className="stat-icon"><FaClock /></div>
          <div className="stat-content">
            <span className="stat-label">Pending Disputes</span>
            <span className="stat-value">{pending}</span>
          </div>
        </div>
      </div>

      {disputes.length === 0 ? (
        <EmptyState icon={<FaTriangleExclamation />} title="No pending disputes" message="When users open disputes, they will appear here for resolution." />
      ) : (
        <div className="review-list">
          {disputes.map((dispute) => (
            <Card key={dispute.id} className="review-item">
              <CardBody>
                <div className="review-item-header">
                  <div className="review-item-title">
                    <h4>Dispute</h4>
                    variant="success"
                    size="sm"
                    onClick={() => setResolveModal(dispute)}
                    loading={processingId === dispute.id}
                  >
                    <FaCircleCheck /> Resolve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleReject(dispute)}
                    disabled={processingId === dispute.id}
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
        isOpen={Boolean(resolveModal)}
        onClose={() => setResolveModal(null)}
        title="Resolve Dispute"
      >
        {resolveModal && (
          <div className="reject-form">
            <p className="reject-info">
              Provide the resolution details for this dispute. The user will be notified.
            </p>
            <Input
              label="Resolution Details"
              type="text"
              placeholder="How was this dispute resolved?"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            />
            <Button
              variant="success"
              fullWidth
              onClick={handleResolve}
              loading={processingId === resolveModal.id}
            >
              <FaCircleCheck /> Confirm Resolution
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}