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
