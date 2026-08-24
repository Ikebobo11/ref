/**
 * LETCON - Landing Page
 * Marketing home page with hero section, features, how-it-works, and CTAs.
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaBolt,
  FaShieldHalved,
  FaWallet,
  FaBullhorn,
  FaUsers,
  FaCircleCheck,
  FaArrowRight,
  FaMagnifyingGlass,
  FaClipboardCheck,
  FaMoneyBillTrendUp,
  FaStar,
  FaChartLine,
  FaHandshake,
  FaLock,
} from 'react-icons/fa6';
import Logo from '../../components/shared/Logo';
import { APP_NAME, APP_TAGLINE } from '../../config/constants';

/**
 * Landing page component.
 */
export default function LandingPage() {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.5 },
  };

  return (
    <div className="landing-page">
      {/* ===== NAVBAR ===== */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-logo">
            <Logo />
          </Link>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#platforms">Platforms</a>
          </div>
          <div className="landing-nav-actions">
