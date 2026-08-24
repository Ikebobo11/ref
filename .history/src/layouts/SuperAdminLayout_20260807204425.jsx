/**
 * LETCON - SuperAdminLayout Component
 * Super admin dashboard layout with full platform control.
 */
import { Outlet } from 'react-router-dom';
import {
  FaGaugeHigh,
  FaWallet,
  FaChartLine,
  FaUsers,
  FaUserShield,
  FaCreditCard,
  FaArrowUpRightDots,
  FaGear,
  FaClipboardList,
  FaScroll,
  FaTriangleExclamation,
  FaUserPlus,
} from 'react-icons/fa6';
import DashboardLayout from './DashboardLayout';

const NAV_ITEMS = [
  { to: '/super-admin/dashboard', label: 'Dashboard', icon: <FaGaugeHigh />, end: true },
  { to: '/super-admin/revenue', label: 'Revenue', icon: <FaWallet /> },
  { to: '/super-admin/reports', label: 'Reports', icon: <FaChartLine /> },
  { to: '/super-admin/users', label: 'Users', icon: <FaUsers /> },
  { to: '/super-admin/admins', label: 'Admins', icon: <FaUserShield /> },
  { to: '/super-admin/payments', label: 'Payments', icon: <FaCreditCard /> },
  { to: '/super-admin/withdrawals', label: 'Withdrawals', icon: <FaArrowUpRightDots /> },
  { to: '/super-admin/verification', label: 'Verification Queue', icon: <FaClipboardList /> },
