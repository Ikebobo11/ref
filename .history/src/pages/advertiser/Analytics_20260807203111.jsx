/**
 * LETCON - Advertiser Analytics Page
 * Campaign performance analytics with charts.
 */
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { FaChartLine, FaUsers, FaCircleCheck, FaWallet } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { COLLECTIONS, TASK_STATUS } from '../../config/constants';
import { formatNaira, formatNumber } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

const PIE_COLORS = ['#6c5ce7', '#00b894', '#fdcb6e', '#e17055', '#0984e3'];

/**
 * Advertiser analytics page component.
 */
export default function Analytics() {
  const { userData } = useAuth();

  const { data: tasks, loading } = useFirestoreQuery(COLLECTIONS.TASKS, {
    filters: [{ field: 'advertiserId', operator: '==', value: userData?.uid || '' }],
    orderByFields: [{ field: 'createdAt', direction: 'desc' }],
    limitCount: 100,
  });

  if (loading) {
    return <Spinner label="Loading analytics..." />;
  }

  // Calculate stats
  const totalBudget = tasks.reduce((sum, t) => sum + (t.budget || 0), 0);
  const totalCompleted = tasks.reduce((sum, t) => sum + (t.completedCount || 0), 0);
  const totalAccepted = tasks.reduce((sum, t) => sum + (t.acceptedCount || 0), 0);
  const published = tasks.filter((t) => t.status === TASK_STATUS.PUBLISHED).length;

  // Chart data by platform
  const platformData = {};
  tasks.forEach((task) => {
    if (!platformData[task.platform]) {
      platformData[task.platform] = { platform: task.platform, tasks: 0, budget: 0, completed: 0 };
    }
    platformData[task.platform].tasks += 1;
    platformData[task.platform].budget += task.budget || 0;
    platformData[task.platform].completed += task.completedCount || 0;
  });
  const platformChartData = Object.values(platformData);

  // Status distribution
  const statusCounts = {};
  tasks.forEach((task) => {
    statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
  });
  const statusChartData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
  }));

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Analytics"
        subtitle="Campaign performance and spending insights"
        icon={<FaChartLine />}
      />

      <div className="stat-grid">
        <StatCard icon={<FaWallet />} label="Total Budget" value={formatNaira(totalBudget)} color="primary" />
        <StatCard icon={<FaUsers />} label="Total Accepted" value={formatNumber(totalAccepted)} color="info" />
        <StatCard icon={<FaCircleCheck />} label="Completed" value={formatNumber(totalCompleted)} color="success" />
        <StatCard icon={<FaChartLine />} label="Active Campaigns" value={formatNumber(published)} color="warning" />
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={<FaChartLine />}
          title="No analytics data yet"
          message="Create campaigns to see performance analytics."
        />
      ) : (
        <div className="analytics-grid">
          <Card>
            <CardHeader>
              <CardTitle>Campaigns by Platform</CardTitle>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={platformChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tasks" fill="#6c5ce7" name="Tasks" />
                  <Bar dataKey="completed" fill="#00b894" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task Status Distribution</CardTitle>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
