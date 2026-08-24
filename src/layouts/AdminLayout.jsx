/**
 * LETCON - AdminLayout Component
 * Admin dashboard layout.
 */
import { Outlet } from 'react-router-dom';
import {
  FaGaugeHigh,
  FaUserShield,
  FaClipboardCheck,
  FaCircleXmark,
  FaArrowRightArrowLeft,
  FaTriangleExclamation,
  FaChartLine,
  FaUsers,
  FaArrowUpRightDots,
  FaHeadset,
  FaComments,
} from 'react-icons/fa6';
import DashboardLayout from './DashboardLayout';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <FaGaugeHigh />, end: true },
  { to: '/admin/verification-queue', label: 'Verification Queue', icon: <FaUserShield /> },
  { to: '/admin/rejected-tasks', label: 'Rejected Tasks', icon: <FaCircleXmark /> },
  { to: '/admin/upgrades', label: 'Approve Upgrades', icon: <FaArrowUpRightDots /> },
  { to: '/admin/account-changes', label: 'Account Change Requests', icon: <FaArrowRightArrowLeft /> },
  { to: '/admin/flagged-mismatches', label: 'Flagged Mismatches', icon: <FaTriangleExclamation /> },
  { to: '/admin/users', label: 'Users', icon: <FaUsers /> },
  { to: '/admin/reports', label: 'Reports', icon: <FaChartLine /> },
  { to: '/admin/support-messages', label: 'Support Messages', icon: <FaHeadset /> },
  { to: '/admin/super-admin-chat', label: 'Super Admin Chat', icon: <FaComments /> },
];

/**
 * AdminLayout component.
 */
export default function AdminLayout() {
  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Admin Dashboard">
      <Outlet />
    </DashboardLayout>
  );
}