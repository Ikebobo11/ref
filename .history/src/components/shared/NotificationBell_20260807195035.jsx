/**
 * LETCON - NotificationBell Component
 * Displays unread notification count with dropdown panel.
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaCheckDouble } from 'react-icons/fa6';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatRelativeTime } from '../../utils/formatters';

/**
 * NotificationBell component.
 * @param {Object} props - Component props.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function NotificationBell({ className = '' }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  /**
   * Closes the dropdown when clicking outside.
   */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Handles notification click.
   * @param {Object} notification - The notification object.
   */
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setIsOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className={`notification-bell ${className}`} ref={dropdownRef}>
      <button
        className="notification-bell-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="notification-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="notification-dropdown-header">
              <h4>Notifications</h4>
              {unreadCount > 0 && (
                <button className="notification-mark-all" onClick={markAllAsRead}>
                  <FaCheckDouble /> Mark all read
                </button>
              )}
            </div>
            <div className="notification-dropdown-list">
              {notifications.length === 0 ? (
                <div className="notification-empty">No notifications yet</div>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <button
                    key={notification.id}
                    className={`notification-item ${notification.read ? '' : 'unread'}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-item-content">
                      <span className="notification-item-title">{notification.title}</span>
                      <span className="notification-item-message">{notification.message}</span>
                    </div>
                    <span className="notification-item-time">
