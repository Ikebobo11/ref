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
