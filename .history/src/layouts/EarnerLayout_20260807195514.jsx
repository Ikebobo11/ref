/**
 * LETCON - EarnerLayout Component
 * Earner dashboard layout with Verified Account Policy banner on every page.
 */
import { Outlet } from 'react-router-dom';
import {
  FaGaugeHigh,
  FaListCheck,
  FaClipboardCheck,
  FaCircleCheck,
  FaWallet,
  FaArrowUpRightDots,
  FaArrowRightArrowLeft,
  FaShieldHalved,
  FaBell,
  FaArrowRightFromBracket,
} from 'react-icons/fa6';
import DashboardLayout from './DashboardLayout';
import VerifiedAccountBanner from '../components/shared/VerifiedAccountBanner';

const NAV_ITEMS = [
  { to: '/earner/dashboard', label: 'Dashboard', icon: <FaGaugeHigh />, end: true },
  { to: '/earner/available-tasks', label: 'Available Tasks', icon: <FaListCheck /> },
  { to: '/earner/accepted-tasks', label: 'Accepted Tasks', icon: <FaClipboardCheck /> },
  { to: '/earner/completed-tasks', label: 'Completed Tasks', icon: <FaCircleCheck /> },
  { to: '/earner/wallet', label: 'Wallet', icon: <FaWallet /> },
  { to: '/earner/withdraw', label: 'Withdraw', icon: <FaArrowUpRightDots /> },
  { to: '/earner/upgrade', label: 'Upgrade Account', icon: <FaArrowUpRightDots /> },
  { to: '/earner/account-change', label: 'Request Account Change', icon: <FaArrowRightArrowLeft /> },
  { to: '/earner/verified-account', label: 'Verified Account', icon: <FaShieldHalved /> },
  { to: '/earner/notifications', label: 'Notifications', icon: <FaBell /> },
