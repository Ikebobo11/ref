/**
 * LETCON - Admin Dashboard Page
 * Overview of pending verifications, rejected tasks, upgrades, and account changes.
 */
import { Link } from 'react-router-dom';
import {
  FaUserShield,
  FaCircleXmark,
  FaArrowUpRightDots,
  FaArrowRightArrowLeft,
  FaTriangleExclamation,
  FaUsers,
} from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { COLLECTIONS, VERIFICATION_STATUS, UPGRADE_STATUS, ACCOUNT_CHANGE_STATUS } from '../../config/constants';
import { formatNumber, formatRelativeTime } from '../../utils/formatters';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PlatformBadge from '../../components/shared/PlatformBadge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

/**
 * Admin dashboard page component.
 */
export default function AdminDashboard() {
  const { userData } = useAuth();

  const { data: verifications, loading: verificationsLoading } = useFirestoreQuery(
    COLLECTIONS.VERIFICATION_REQUESTS,
    {
      filters: [{ field: 'status', operator: '==', value: VERIFICATION_STATUS.PENDING }],
      orderByFields: [{ field: 'createdAt', direction: 'asc' }],
      limitCount: 5,
    }
  );

  const { data: rejectedTasks, loading: rejectedLoading } = useFirestoreQuery('taskSubmissions', {
    filters: [{ field: 'status', operator: '==', value: 'pending_admin_review' }],
    orderByFields: [{ field: 'submittedAt', direction: 'desc' }],
    limitCount: 5,
  });

  const { data: upgrades, loading: upgradesLoading } = useFirestoreQuery(
    COLLECTIONS.UPGRADE_REQUESTS,
    {
      filters: [{ field: 'status', operator: '==', value: UPGRADE_STATUS.PENDING }],
      orderByFields: [{ field: 'createdAt', direction: 'asc' }],
      limitCount: 5,
    }
  );

  const { data: accountChanges, loading: accountChangesLoading } = useFirestoreQuery(
    COLLECTIONS.ACCOUNT_CHANGE_REQUESTS,
    {
      filters: [{ field: 'status', operator: '==', value: ACCOUNT_CHANGE_STATUS.PENDING }],
      orderByFields: [{ field: 'createdAt', direction: 'asc' }],
      limitCount: 5,
    }
  );

  const { data: flagged, loading: flaggedLoading } = useFirestoreQuery('taskSubmissions', {
    filters: [{ field: 'status', operator: '==', value: 'flagged' }],
    orderByFields: [{ field: 'submittedAt', direction: 'desc' }],
    limitCount: 5,
  });

  if (verificationsLoading || rejectedLoading || upgradesLoading || accountChangesLoading || flaggedLoading) {
    return <Spinner label="Loading admin dashboard..." />;
  }

  return (
