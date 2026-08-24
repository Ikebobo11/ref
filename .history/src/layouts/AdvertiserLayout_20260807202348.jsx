/**
 * LETCON - AdvertiserLayout Component
 * Advertiser dashboard layout.
 */
import { Outlet } from 'react-router-dom';
import {
  FaGaugeHigh,
  FaWallet,
  FaBullhorn,
  FaPlusCircle,
  FaChartLine,
  FaClockRotateLeft,
  FaCommentDots,
  FaBell,
  FaArrowRightFromBracket,
} from 'react-icons/fa6';
import DashboardLayout from './DashboardLayout';

const NAV_ITEMS = [
  { to: '/advertiser/dashboard', label: 'Dashboard', icon: <FaGaugeHigh />, end: true },
  { to: '/advertiser/wallet', label: 'Wallet', icon: <FaWallet /> },
  { to: '/advertiser/campaigns', label: 'Campaigns', icon: <FaBullhorn /> },
  { to: '/advertiser/create-campaign', label: 'Create Campaign', icon: <FaPlusCircle /> },
  { to: '/advertiser/task-review', label: 'Task Review', icon: <FaClockRotateLeft /> },
  { to: '/advertiser/analytics', label: 'Analytics', icon: <FaChartLine /> },
  { to: '/advertiser/transactions', label: 'Transactions', icon: <FaArrowRightFromBracket /> },
  { to: '/advertiser/messages', label: 'Messages', icon: <FaCommentDots /> },
  { to: '/advertiser/notifications', label: 'Notifications', icon: <FaBell /> },
];

/**
 * AdvertiserLayout component.
 */
