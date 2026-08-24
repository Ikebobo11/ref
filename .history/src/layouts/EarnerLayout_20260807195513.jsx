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
