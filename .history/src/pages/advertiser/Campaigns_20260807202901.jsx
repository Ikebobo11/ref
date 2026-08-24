/**
 * LETCON - Campaigns Page
 * Lists all advertiser campaigns with status and performance.
 */
import { Link } from 'react-router-dom';
import { FaBullhorn, FaPlusCircle, FaUsers, FaCircleCheck, FaClock } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { COLLECTIONS, TASK_STATUS } from '../../config/constants';
import { formatNaira, formatNumber, formatRelativeTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PlatformBadge from '../../components/shared/PlatformBadge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

/**
 * Gets badge variant for task status.
 * @param {string} status - Task status.
 * @returns {string} Badge variant.
 */
function getStatusVariant(status) {
  switch (status) {
    case TASK_STATUS.PUBLISHED:
      return 'success';
    case TASK_STATUS.DRAFT:
      return 'default';
    case TASK_STATUS.COMPLETED:
      return 'info';
    case TASK_STATUS.SUBMITTED:
      return 'warning';
    default:
      return 'default';
  }
}

/**
 * Campaigns page component.
 */
export default function Campaigns() {
  const { userData } = useAuth();

  const { data: tasks, loading } = useFirestoreQuery(COLLECTIONS.TASKS, {
