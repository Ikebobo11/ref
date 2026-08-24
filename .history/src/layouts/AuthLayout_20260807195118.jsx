/**
 * LETCON - AuthLayout Component
 * Layout for authentication pages with brand showcase.
 */
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShieldHalved, FaWallet, FaUsers, FaBolt } from 'react-icons/fa6';
import Logo from '../components/shared/Logo';

/**
 * AuthLayout component.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} [props.children] - Page content (via Outlet).
 */
export default function AuthLayout() {
  const features = [
    { icon: <FaShieldHalved />, title: 'Verified Influencers', text: 'Every earner is verified with real follower proof.' },
    { icon: <FaWallet />, title: 'Instant Payments', text: '70% of every task payment goes straight to your wallet.' },
