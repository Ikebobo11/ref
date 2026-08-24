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
} from 'react-icons/fa6';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <FaGaugeHigh />, end: true },
  { to: '/admin/verification-queue', label: 'Verification Queue', icon: <FaUserShield /> },
  { to: '/admin/rejected-tasks', label: 'Rejected Tasks', icon: <FaCircleXmark /> },
  { to: '/admin/upgrades', label: 'Approve Upgrades', icon: <FaArrowUpRightDots /> },
  { to: '/admin/account-changes', label: 'Account Change Requests', icon: <FaArrowRightArrowLeft /> },
  { to: '/admin/flagged-mismatches', label: 'Flagged Mismatches', icon: <FaTriangleExclamation /> },
  { to: '/admin/users', label: 'Users', icon: <FaUsers /> },
  { to: '/admin/reports', label: 'Reports', icon: <FaChartLine /> },
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