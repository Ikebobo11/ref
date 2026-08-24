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
