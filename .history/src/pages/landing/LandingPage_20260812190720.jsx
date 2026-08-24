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
            <Link to="/login" className="btn btn-ghost btn-md">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-md">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <header className="landing-hero">
        <motion.div
          className="landing-hero-inner"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="landing-badge">
            <FaBolt /> {APP_TAGLINE}
          </span>
          <h1 className="landing-hero-title">
            Monetize your influence. <span className="gradient-text">Grow your brand.</span>
          </h1>
          <p className="landing-hero-subtitle">
            {APP_NAME} connects verified micro-influencers with advertisers who want authentic
            promotion. Earn real money completing tasks, or reach engaged audiences to grow your
            business.
          </p>
          <div className="landing-hero-actions">
            <Link to="/register/earner" className="btn btn-primary btn-lg">
              Start Earning <FaArrowRight />
            </Link>
            <Link to="/register/advertiser" className="btn btn-secondary btn-lg">
              Post a Task
            </Link>
          </div>
          <div className="landing-hero-stats">
            <div className="landing-hero-stat">
              <strong>5K+</strong>
              <span>Follower tiers</span>
            </div>
            <div className="landing-hero-stat">
              <strong>6</strong>
              <span>Platforms supported</span>
            </div>
            <div className="landing-hero-stat">
              <strong>100%</strong>
              <span>Secured payments</span>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="landing-hero-art"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="landing-hero-card landing-hero-card-main">
            <div className="hero-pill"><FaWallet /> Wallet balance</div>
            <div className="hero-amount">₦184,500</div>
            <div className="hero-progress">
              <span style={{ width: '70%' }}></span>
            </div>
            <div className="hero-progress-label">Weekly goal 70%</div>
            <div className="hero-tag"><FaCircleCheck /> Tasks completed</div>
          </div>
          <div className="landing-hero-card landing-hero-card-secondary">
            <div className="hero-mini-icon"><FaBullhorn /></div>
            <div>
              <strong>Campaign live</strong>
              <span>New task available</span>
            </div>
          </div>
          <div className="landing-hero-card landing-hero-card-tertiary">
            <FaMoneyBillTrendUp />
            <span>Earnings up 32%</span>
          </div>
        </motion.div>
      </header>

      {/* ===== TRUST BAR ===== */}
      <section className="landing-trust">
        <div className="landing-trust-item">
          <FaLock />
