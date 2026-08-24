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
    { icon: <FaUsers />, title: 'Trusted Marketplace', text: 'Connect with businesses, brands, and agencies.' },
    { icon: <FaBolt />, title: 'Fast & Secure', text: 'Paystack-powered payments with enterprise-grade security.' },
  ];

  return (
    <div className="auth-layout">
      <div className="auth-brand-side">
        <div className="auth-brand-content">
          <Logo size="lg" />
          <h1 className="auth-brand-title">The Micro Influencer Marketplace</h1>
          <p className="auth-brand-subtitle">
            Connect with verified micro influencers and complete paid promotional tasks on
            TikTok, Instagram, Facebook, Snapchat, YouTube, and X.
          </p>

          <div className="auth-features">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="auth-feature"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
