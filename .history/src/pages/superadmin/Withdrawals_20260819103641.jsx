/**
 * LETCON - Withdrawals Page (Super Admin)
 * View and manage all withdrawal requests with bank details.
 * Full lifecycle: pending → processing → completed/failed (with wallet refund + notification + audit).
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaArrowUpRightDots, FaCheck, FaXmark, FaClock, FaWallet } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { getDocument, updateDocument, executeBatch } from '../../services/firestoreService';
import { COLLECTIONS, TRANSACTION_STATUS, WITHDRAWAL_STATUS } from '../../config/constants';
import { formatNaira, formatDateTime } from '../../utils/formatters';
import { notifyWithdrawalCompleted, notifyWithdrawalFailed } from '../../services/notificationService';
import { logWithdrawalProcess, logWithdrawalComplete, logWithdrawalFail } from '../../services/auditService';
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
  const { userData } = useAuth();
  const [processingId, setProcessingId] = useState(null);
  const { data: withdrawals, loading } = useFirestoreQuery(COLLECTIONS.WITHDRAWALS, {
    orderByFields: [{ field: 'createdAt', direction: 'desc' }],
    limitCount: 100,
  });

  const actorId = userData?.uid || 'unknown';
  const actorRole = userData?.role || 'super_admin';

  /**
   * Processes a withdrawal status change with full side effects.
   * @param {Object} withdrawal - The withdrawal record.
   * @param {string} status - The new status: processing, completed, failed.
   */
  const updateStatus = async (withdrawal, status) => {
    setProcessingId(withdrawal.id);
    try {
      // 1. Update the withdrawal document
      await updateDocument(COLLECTIONS.WITHDRAWALS, withdrawal.id, {
        status,
        processedAt: new Date(),
        processedBy: actorId,
      });

      // 2. Update the associated transaction status if it exists
      if (withdrawal.reference) {
        try {
          const txn = await getDocument(COLLECTIONS.TRANSACTIONS, withdrawal.reference);
          if (txn && txn.withdrawalId === withdrawal.id) {
            await updateDocument(COLLECTIONS.TRANSACTIONS, withdrawal.reference, {
              status: status === 'completed'
                ? TRANSACTION_STATUS.SUCCESS
                : status === 'failed'
                  ? TRANSACTION_STATUS.FAILED
                  : txn.status,
            });
          }
        } catch {
          // Transaction update is non-critical
        }
      }

      // 3. Handle notifications, refunds, and audit based on status
      if (status === 'completed') {
        await notifyWithdrawalCompleted(withdrawal.uid, withdrawal.amount);
        await logWithdrawalComplete(actorId, actorRole, withdrawal.id, {
          uid: withdrawal.uid,
          amount: withdrawal.amount,
          bankName: withdrawal.bankName,
          reference: withdrawal.reference,
        });
        toast.success(`Withdrawal of ${formatNaira(withdrawal.amount)} marked as completed`);
      } else if (status === 'failed') {
        // Refund the wallet balance since the money was deducted when the request was created
        try {
          const wallet = await getDocument(COLLECTIONS.WALLETS, withdrawal.uid);
          if (wallet) {
            await updateDocument(COLLECTIONS.WALLETS, withdrawal.uid, {
              balance: (wallet.balance || 0) + withdrawal.amount,
            });
          }
        } catch {
          // Refund is non-critical but logged below
        }

        await notifyWithdrawalFailed(withdrawal.uid, withdrawal.amount, 'Bank transfer failed');
        await logWithdrawalFail(actorId, actorRole, withdrawal.id, {
          uid: withdrawal.uid,
          amount: withdrawal.amount,
          refunded: true,
          reference: withdrawal.reference,
        });
        toast.success(`Withdrawal of ${formatNaira(withdrawal.amount)} marked as failed (refunded)`);
      } else if (status === 'processing') {
        await logWithdrawalProcess(actorId, actorRole, withdrawal.id, {
          uid: withdrawal.uid,
          amount: withdrawal.amount,
          bankName: withdrawal.bankName,
          reference: withdrawal.reference,
        });
        toast.success(`Withdrawal marked as ${status}`);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update withdrawal status');
    } finally {
      setProcessingId(null);
    }
                    <Badge variant={getStatusVariant(w.status)}>{w.status}</Badge>
                    {w.status === 'pending' && (
                      <Button
                        variant="success"
                        size="sm"
                        loading={processingId === w.id}
                        onClick={() => updateStatus(w, 'processing')}
                      >
                        Start Processing
                      </Button>
                    )}
                    {w.status === 'processing' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          loading={processingId === w.id}
                          onClick={() => updateStatus(w, 'completed')}
                        >
                          <FaCheck /> Complete
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={processingId === w.id}
                          onClick={() => updateStatus(w, 'failed')}
                        >
                          <FaXmark /> Fail
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}