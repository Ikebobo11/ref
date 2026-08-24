/**
 * LETCON - Reports Page (Super Admin)
 * Platform-wide statistics, users by role, and task status distribution.
 */
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { FaChartLine, FaUsers, FaWallet, FaCircleCheck, FaClipboardList } from 'react-icons/fa6';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { COLLECTIONS } from '../../config/constants';
import { formatNaira, formatNumber } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

const COLORS = ['#6c5ce7', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#fd79a8'];

/**
 * Reports page component.
 */
export default function Reports() {
  const { data: users, loading: usersLoading } = useFirestoreQuery(COLLECTIONS.USERS, {
    limitCount: 100,
  });

  const { data: tasks, loading: tasksLoading } = useFirestoreQuery(COLLECTIONS.TASKS, {
    limitCount: 100,
  });

  const { data: transactions, loading: transactionsLoading } = useFirestoreQuery(COLLECTIONS.TRANSACTIONS, {
    limitCount: 100,
  });

  if (usersLoading || tasksLoading || transactionsLoading) {
    return <Spinner label="Loading reports..." />;
  }

  // Users by role
  const roleCounts = {};
  users.forEach((user) => {
    roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
  });
  const usersByRole = Object.entries(roleCounts).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
  }));

  // Task status distribution
  const statusCounts = {};
  tasks.forEach((task) => {
    statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
  });
  const taskStatus = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
  }));

  const platformRevenue = transactions
    .filter((t) => t.type === 'platform_revenue' && t.status === 'success')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const earnerPayments = transactions
    .filter((t) => t.type === 'task_payment' && t.status === 'success')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalFees = transactions
    .filter((t) => (t.type === 'verification_fee' || t.type === 'task_posting_fee') && t.status === 'success')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const verifiedEarners = users.filter((user) => user.role === 'earner' && user.verified).length;
  const totalEarners = users.filter((user) => user.role === 'earner').length;

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Reports"
        subtitle="Platform-wide statistics and analytics"
        icon={<FaChartLine />}
      />

      <div className="stat-grid">
        <StatCard icon={<FaUsers />} label="Total Users" value={formatNumber(users.length)} color="primary" />
        <StatCard icon={<FaClipboardList />} label="Total Tasks" value={formatNumber(tasks.length)} color="info" />
        <StatCard icon={<FaCircleCheck />} label="Verified Earners" value={`${formatNumber(verifiedEarners)} / ${formatNumber(totalEarners)}`} color="success" />
        <StatCard icon={<FaWallet />} label="Platform Revenue" value={formatNaira(platformRevenue)} color="warning" />
      </div>

      <div className="stat-grid">
        <StatCard icon={<FaWallet />} label="Earner Payments" value={formatNaira(earnerPayments)} color="success" />
        <StatCard icon={<FaWallet />} label="Total Fees" value={formatNaira(totalFees)} color="info" />
      </div>

      {users.length === 0 && tasks.length === 0 ? (
        <EmptyState icon={<FaChartLine />} title="No analytics data yet" message="Create campaigns and users to see platform analytics." />
      ) : (
        <div className="analytics-grid">
          <Card>
            <CardHeader>
              <CardTitle>Users by Role</CardTitle>
            </CardHeader>
            <CardBody>
              {usersByRole.length === 0 ? (
                <EmptyState icon={<FaUsers />} title="No user data" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={usersByRole} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {usersByRole.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task Status Distribution</CardTitle>
            </CardHeader>
            <CardBody>
              {taskStatus.length === 0 ? (
                <EmptyState icon={<FaClipboardList />} title="No task data" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={taskStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#6c5ce7" name="Tasks" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}