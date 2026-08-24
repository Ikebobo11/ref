/**
 * LETCON - Super Admin Dashboard Page
 * Platform-wide overview with revenue, users, and task statistics.
 */
import { Link } from 'react-router-dom';
import {
  FaWallet,
  FaUsers,
  FaBullhorn,
  FaCircleCheck,
  FaUserShield,
  FaArrowUpRightDots,
  FaScroll,
} from 'react-icons/fa6';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { COLLECTIONS } from '../../config/constants';
import { formatNaira, formatNumber } from '../../utils/formatters';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

/**
 * Super admin dashboard page component.
 */
export default function SuperAdminDashboard() {
  const { data: users, loading: usersLoading } = useFirestoreQuery(COLLECTIONS.USERS, { limitCount: 100 });
  const { data: tasks, loading: tasksLoading } = useFirestoreQuery(COLLECTIONS.TASKS, { limitCount: 100 });
  const { data: transactions, loading: txnLoading } = useFirestoreQuery(COLLECTIONS.TRANSACTIONS, { limitCount: 100 });
  const { data: verifications, loading: verificationsLoading } = useFirestoreQuery(COLLECTIONS.VERIFICATION_REQUESTS, {
    filters: [{ field: 'status', operator: '==', value: 'pending' }],
    limitCount: 5,
  });
  const { data: withdrawals, loading: withdrawalsLoading } = useFirestoreQuery(COLLECTIONS.WITHDRAWALS, {
    filters: [{ field: 'status', operator: '==', value: 'pending' }],
    limitCount: 5,
  });

  if (usersLoading || tasksLoading || txnLoading || verificationsLoading || withdrawalsLoading) {
    return <Spinner label="Loading platform overview..." />;
  }

  const totalRevenue = transactions
    .filter((t) => t.type === 'platform_revenue' && t.status === 'success')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalEarnerPayments = transactions
    .filter((t) => t.type === 'task_payment' && t.status === 'success')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalFees = transactions
    .filter((t) => (t.type === 'verification_fee' || t.type === 'task_posting_fee') && t.status === 'success')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const earners = users.filter((u) => u.role === 'earner');
  const advertisers = users.filter((u) => u.role === 'advertiser');
  const admins = users.filter((u) => u.role === 'admin' || u.role === 'super_admin');
  const verifiedEarners = earners.filter((u) => u.verified).length;

  return (
    <div className="dashboard-page">
      <div className="welcome-section">
        <h2>Platform Overview</h2>
        <p>Full control over LETCON marketplace operations.</p>
      </div>

      <div className="stat-grid">
        <StatCard icon={<FaWallet />} label="Platform Revenue" value={formatNaira(totalRevenue)} color="primary" />
        <StatCard icon={<FaWallet />} label="Earner Payments" value={formatNaira(totalEarnerPayments)} color="success" />
        <StatCard icon={<FaWallet />} label="Total Fees" value={formatNaira(totalFees)} color="info" />
        <StatCard icon={<FaUsers />} label="Total Users" value={formatNumber(users.length)} color="warning" />
      </div>

      <div className="stat-grid">
        <StatCard icon={<FaBullhorn />} label="Total Tasks" value={formatNumber(tasks.length)} color="info" />
        <StatCard icon={<FaCircleCheck />} label="Verified Earners" value={`${formatNumber(verifiedEarners)} / ${formatNumber(earners.length)}`} color="success" />
        <StatCard icon={<FaUserShield />} label="Admins" value={formatNumber(admins.length)} color="primary" />
        <StatCard icon={<FaUsers />} label="Advertisers" value={formatNumber(advertisers.length)} color="warning" />
      </div>

      <div className="dashboard-grid">
        <Card className="dashboard-section">
          <CardHeader>
            <CardTitle>Pending Verifications</CardTitle>
            <Link to="/super-admin/verification" className="text-link">View all</Link>
          </CardHeader>
          <CardBody>
            {verifications.length === 0 ? (
              <EmptyState icon={<FaUserShield />} title="No pending verifications" />
            ) : (
              <div className="task-list">
                {verifications.map((req) => (
                  <div key={req.id} className="task-list-item">
                    <div className="task-list-item-top">
                      <h4 className="task-list-item-title">@{req.username}</h4>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                    <div className="task-list-item-meta">
                      <span>{req.platform}</span>
                      <span>{req.followerCount?.toLocaleString()} followers</span>
                    </div>
                  </div>
