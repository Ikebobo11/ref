/**
 * LETCON - Audit Logs Page (Super Admin)
 * View the complete security audit trail of all platform actions.
 */
import {
  FaScroll,
  FaUserShield,
  FaXmark,
  FaCheck,
  FaBan,
  FaPlay,
} from 'react-icons/fa6';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { COLLECTIONS } from '../../config/constants';
import { formatDateTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

/**
 * Gets the icon for an audit action.
 * @param {string} action - The audit action.
 * @returns {JSX.Element} The icon element.
 */
function getActionIcon(action) {
  if (action.includes('approve') || action.includes('verify')) return <FaCheck />;
  if (action.includes('reject') || action.includes('ban') || action.includes('remove')) return <FaBan />;
  if (action.includes('unsuspend')) return <FaPlay />;
  return <FaUserShield />;
}

/**
 * Gets badge variant for an audit action.
 * @param {string} action - The audit action.
 * @returns {string} Badge variant.
 */
function getActionVariant(action) {
  if (action.includes('approve') || action.includes('verify') || action.includes('unsuspend')) return 'success';
  if (action.includes('reject') || action.includes('ban') || action.includes('remove')) return 'danger';
  return 'info';
}

/**
 * Audit Logs page component.
 */
export default function AuditLogs() {
  const { data: logs, loading } = useFirestoreQuery(COLLECTIONS.AUDIT_LOGS, {
    orderByFields: [{ field: 'createdAt', direction: 'desc' }],
    limitCount: 100,
  });

  if (loading) {
    return <Spinner label="Loading audit logs..." />;
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Audit Logs"
        subtitle="Complete security audit trail of platform actions"
        icon={<FaScroll />}
      />

      {logs.length === 0 ? (
        <EmptyState icon={<FaScroll />} title="No audit logs yet" message="All admin actions such as verifications, suspensions, bans, and approvals will be recorded here." />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Audit Events</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="transaction-list">
              {logs.map((log) => (
                <div key={log.id} className="transaction-item">
                  <div className="transaction-item-left">
                    <div className="transaction-item-icon">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="transaction-item-info">
                      <span className="transaction-item-title">
                        <Badge variant={getActionVariant(log.action)}>{log.action}</Badge>
                      </span>
                      <span className="transaction-item-date">
                        {formatDateTime(log.createdAt?.toDate?.() || log.createdAt)}
                      </span>
                      <span className="transaction-item-date">
                        Actor: {log.actorRole || 'unknown'} ({log.actorId || 'N/A'})
                      </span>
                      {log.targetType && (
                        <span className="transaction-item-date">
                          Target: {log.targetType} ({log.targetId || 'N/A'})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="transaction-item-right">
                    {log.action === 'verification.approve' || log.action === 'verification.reject' ? (
                      <Badge variant={log.action.includes('approve') ? 'success' : 'danger'}>
                        {log.action.includes('approve') ? <FaCheck /> : <FaXmark />}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
