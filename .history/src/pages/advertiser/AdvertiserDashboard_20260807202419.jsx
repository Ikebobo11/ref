/**
 * LETCON - Advertiser Dashboard Page
 * Overview of campaigns, wallet, and task activity.
 */
import { Link } from 'react-router-dom';
import {
  FaWallet,
  FaBullhorn,
  FaPlusCircle,
  FaClockRotateLeft,
  FaCircleCheck,
} from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { COLLECTIONS, TASK_STATUS } from '../../config/constants';
import { formatNaira, formatNumber, formatRelativeTime } from '../../utils/formatters';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PlatformBadge from '../../components/shared/PlatformBadge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

/**
