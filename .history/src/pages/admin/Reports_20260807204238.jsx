/**
 * LETCON - Admin Reports Page
 * Platform statistics and analytics for admins.
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
import { FaChartLine, FaUsers, FaBullhorn, FaCircleCheck, FaWallet } from 'react-icons/fa6';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { COLLECTIONS } from '../../config/constants';
import { formatNaira, formatNumber } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

const PIE_COLORS = ['#6c5ce7', '#00b894', '#fdcb6e', '#e17055', '#0984e3', '#fd79a8'];

/**
 * Admin reports page component.
 */
export default function Reports() {
  const { data: users, loading: usersLoading } = useFirestoreQuery(COLLECTIONS.USERS, {
    limitCount: 100,
  });


