/**
 * LETCON - Completed Tasks Page
 * Shows tasks the earner has completed with approval status.
 */
import { FaCircleCheck, FaClock, FaTriangleExclamation } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { COLLECTIONS, TASK_STATUS } from '../../config/constants';
import { formatNaira, formatDateTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

/**
 * Gets the badge variant for a task status.
 * @param {string} status - The task status.
 * @returns {string} Badge variant.
 */
function getStatusVariant(status) {
  switch (status) {
    case TASK_STATUS.APPROVED:
    case TASK_STATUS.COMPLETED:
      return 'success';
    case TASK_STATUS.REJECTED:
      return 'danger';
    case TASK_STATUS.FLAGGED:
      return 'danger';
    case TASK_STATUS.PENDING_ADMIN_REVIEW:
      return 'warning';
    default:
      return 'info';
  }
}

/**
 * Completed tasks page component.
 */
export default function CompletedTasks() {
  const { userData } = useAuth();

  const { data: submissions, loading } = useFirestoreQuery('taskSubmissions', {
    filters: [{ field: 'earnerId', operator: '==', value: userData?.uid || '' }],
    orderByFields: [{ field: 'submittedAt', direction: 'desc' }],
    limitCount: 50,
  });

  if (loading) {
    return <Spinner label="Loading completed tasks..." />;
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Completed Tasks"
        subtitle="All your task submissions and their approval status"
        icon={<FaCircleCheck />}
      />

      {submissions.length === 0 ? (
        <EmptyState
          icon={<FaCircleCheck />}
          title="No completed tasks yet"
          message="Your task submissions will appear here. Approve within 24 hours or auto-approved."
        />
      ) : (
        <div className="completion-list">
          {submissions.map((submission) => (
            <Card key={submission.id} className="completion-item">
              <CardBody>
                <div className="completion-item-header">
