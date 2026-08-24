/**
 * LETCON - Notifications Page
 * Full notification list for the earner with delete functionality.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaBell, FaCheckDouble, FaTrash, FaTrashCan } from 'react-icons/fa6';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatRelativeTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

/**
 * Notifications page component.
 */
export default function Notifications() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  /**
   * Handles deleting a single notification.
   * @param {string} id - The notification ID.
   */
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteNotification(id);
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Handles deleting all notifications.
   */
  const handleDeleteAll = async () => {
    setDeletingAll(true);
    try {
      await deleteAllNotifications();
      toast.success('All notifications deleted');
      setShowDeleteAllModal(false);
    } catch (error) {
      toast.error('Failed to delete notifications');
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Notifications"
        subtitle="All your LETCON notifications"
        icon={<FaBell />}
        actions={
          notifications.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <FaCheckDouble /> Mark all read
              </Button>
              <Button variant="danger" size="sm" onClick={() => setShowDeleteAllModal(true)}>
                <FaTrashCan /> Delete all
              </Button>
            </>
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
                <div
                  key={notification.id}
                  className={`notification-full-item ${notification.read ? '' : 'unread'}`}
                >
                  <div className="notification-full-item-content">
                    <div className="notification-full-item-header">
                      <span className="notification-full-item-title">{notification.title}</span>
                      <div className="notification-full-item-actions">
                        <span className="notification-full-item-time">
                          {formatRelativeTime(notification.createdAt?.toDate?.() || notification.createdAt)}
                        </span>
                        {!notification.read && (
                          <button
                            className="notification-action-btn"
                            onClick={() => markAsRead(notification.id)}
                            title="Mark as read"
                          >
                            <FaCheckDouble />
                          </button>
                        )}
                        <button
                          className="notification-action-btn notification-delete-btn"
                          onClick={() => handleDelete(notification.id)}
                          disabled={deletingId === notification.id}
                          title="Delete notification"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
