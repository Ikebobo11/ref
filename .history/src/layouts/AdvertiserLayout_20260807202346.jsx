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
