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
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}