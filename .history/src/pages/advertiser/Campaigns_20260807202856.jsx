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
