/**
 * LETCON - DashboardLayout Component
 * Shared dashboard layout with sidebar navigation, topbar, and responsive design.
 */
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaXmark, FaRightFromBracket, FaMoon, FaSun } from 'react-icons/fa6';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Logo from '../components/shared/Logo';
import NotificationBell from '../components/shared/NotificationBell';

/**
 * DashboardLayout component.
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.navItems - Array of { to, label, icon, end } navigation items.
 * @param {string} [props.title] - Dashboard title.
 * @param {React.ReactNode} [props.headerExtra] - Extra header content.
 * @param {React.ReactNode} [props.children] - Page content (via Outlet).
 */
export default function DashboardLayout({ navItems = [], title = 'Dashboard', headerExtra }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userData, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  /**
   * Handles logout.
   */
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <Logo />
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
