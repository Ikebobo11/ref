/**
 * LETCON - Advertiser Notifications Page
 * Full notification list for the advertiser.
 */
import { FaBell, FaCheckDouble } from 'react-icons/fa6';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatRelativeTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';

/**
 * Advertiser notifications page component.
 */
export default function Notifications() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Notifications"
        subtitle="All your LETCON notifications"
