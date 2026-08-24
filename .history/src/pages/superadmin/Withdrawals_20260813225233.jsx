/**
 * LETCON - Withdrawals Page (Super Admin)
 * View and manage all withdrawal requests with bank details.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaArrowUpRightDots, FaCheck, FaXmark, FaClock } from 'react-icons/fa6';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { updateDocument } from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import { formatNaira, formatDateTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

/**
 * Returns badge variant for a withdrawal status.
 * @param {string} status - The withdrawal status.
 * @returns {string} Badge variant.
 */
function getStatusVariant(status) {
  switch (status) {
    case 'completed':
      return 'success';
    case 'processing':
      return 'info';
    case 'failed':
      return 'danger';
    default:
      return 'warning';
  }
}

/**
 * Withdrawals page component.
 */
export default function Withdrawals() {
  const [processingId, setProcessingId] = useState(null);
  const { data: withdrawals, loading } = useFirestoreQuery(COLLECTIONS.WITHDRAWALS, {
    orderByFields: [{ field: 'createdAt', direction: 'desc' }],
    limitCount: 100,
  });

  const updateStatus = async (withdrawal, status) => {
    setProcessingId(withdrawal.id);
    try {
      await updateDocument(COLLECTIONS.WITHDRAWALS, withdrawal.id, {
        status,
        processedAt: new Date(),
      });
      toast.success(`Withdrawal marked as ${status}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <Spinner label="Loading withdrawals..." />;
  }

  const pending = withdrawals.filter((w) => w.status === 'pending').length;
  const processing = withdrawals.filter((w) => w.status === 'processing').length;
  const completed = withdrawals.filter((w) => w.status === 'completed').length;

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Withdrawals"
        subtitle="Review and manage all withdrawal requests"
        icon={<FaArrowUpRightDots />}
      />

      <div className="stat-grid">
        <div className="stat-card stat-warning">
          <div className="stat-icon"><FaClock /></div>
          <div className="stat-content">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{pending}</span>
          </div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-icon"><FaArrowUpRightDots /></div>
          <div className="stat-content">
            <span className="stat-label">Processing</span>
            <span className="stat-value">{processing}</span>
          </div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-icon"><FaCheck /></div>
          <div className="stat-content">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{completed}</span>
          </div>
        </div>
      </div>

      {withdrawals.length === 0 ? (
        <EmptyState icon={<FaArrowUpRightDots />} title="No withdrawals yet" message="Earner withdrawal requests will appear here." />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Withdrawal Requests</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="transaction-list">
              {withdrawals.map((w) => (
                <div key={w.id} className="transaction-item">
                  <div className="transaction-item-left">
                    <div className="transaction-item-icon">
                      <FaArrowUpRightDots />
                    </div>
                    <div className="transaction-item-info">
                      <span className="transaction-item-title">
                        {formatNaira(w.amount)} → {w.bankName} ({w.accountNumber})
                      </span>
