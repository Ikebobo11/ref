/**
 * LETCON - Advertiser Notifications Page
 * Full notification list for the advertiser with delete functionality.
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
 * Advertiser notifications page component.
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