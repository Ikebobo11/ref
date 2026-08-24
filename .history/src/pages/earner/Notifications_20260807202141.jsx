/**
 * LETCON - Notifications Page
 * Full notification list for the earner.
 */
import { FaBell, FaCheckDouble } from 'react-icons/fa6';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatRelativeTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';

/**
 * Notifications page component.
 */
export default function Notifications() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Notifications"
        subtitle="All your LETCON notifications"
        icon={<FaBell />}
        actions={
          notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <FaCheckDouble /> Mark all read
            </Button>
          )
        }
      />

      <Card>
        <CardBody>
          {notifications.length === 0 ? (
            <EmptyState
              icon={<FaBell />}
              title="No notifications"
              message="You will be notified about task approvals, payments, and account updates."
            />
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={`notification-full-item ${notification.read ? '' : 'unread'}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-full-item-content">
                    <div className="notification-full-item-header">
                      <span className="notification-full-item-title">{notification.title}</span>
                      <span className="notification-full-item-time">
                        {formatRelativeTime(notification.createdAt?.toDate?.() || notification.createdAt)}
                      </span>
                    </div>
                    <p className="notification-full-item-message">{notification.message}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
