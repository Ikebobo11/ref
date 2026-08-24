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
          <div>
            <strong>Verified accounts only</strong>
            <span>No fake followers, no bots</span>
          </div>
        </div>
        <div className="landing-trust-item">
          <FaShieldHalved />
          <div>
            <strong>Secure payments</strong>
            <span>Powered by Paystack escrow</span>
          </div>
        </div>
        <div className="landing-trust-item">
          <FaHandshake />
          <div>
            <strong>Fair rewards</strong>
            <span>Transparent per-task payouts</span>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="landing-section" id="features">
        <motion.div className="landing-section-head" {...fadeUp}>
          <span className="landing-section-tag">Why {APP_NAME}</span>
          <h2 className="landing-section-title">Built for both sides of the marketplace</h2>
          <p className="landing-section-subtitle">
            Whether you're growing your audience or your business, {APP_NAME} gives you the tools
            to connect and transact with confidence.
          </p>
        </motion.div>

        <div className="landing-features-grid">
          <motion.div className="landing-feature-card" {...fadeUp}>
            <div className="landing-feature-icon icon-earn"><FaUsers /></div>
            <h3>For Influencers</h3>
            <p>
              Complete tasks from vetted brands and earn ₦12,000 – ₦46,000+ per task. Get verified
              once and unlock a steady stream of paid opportunities.
            </p>
            <Link to="/register/earner" className="landing-feature-link">Become an earner <FaArrowRight /></Link>
          </motion.div>

          <motion.div className="landing-feature-card" {...fadeUp}>
            <div className="landing-feature-icon icon-advertise"><FaBullhorn /></div>
            <h3>For Advertisers</h3>
            <p>
              Post campaigns and get authentic promotion from verified micro-influencers. Only pay
              for completed, verified work.
            </p>
            <Link to="/register/advertiser" className="landing-feature-link">Start advertising <FaArrowRight /></Link>
          </motion.div>

          <motion.div className="landing-feature-card" {...fadeUp}>
            <div className="landing-feature-icon icon-secure"><FaShieldHalved /></div>
            <h3>Strict Verification</h3>
            <p>
              Every account is manually verified. We reject fake, bought, or bot followers so
              advertisers get real reach and influencers keep their reputation.
            </p>
          </motion.div>

          <motion.div className="landing-feature-card" {...fadeUp}>
            <div className="landing-feature-icon icon-fast"><FaBolt /></div>
            <h3>Instant & Secure Payouts</h3>
            <p>
              Earners get paid straight to their wallet and can withdraw to their bank. Advertisers
              only release funds when a task is approved.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="landing-section landing-section-alt" id="how-it-works">
        <motion.div className="landing-section-head" {...fadeUp}>
          <span className="landing-section-tag">How it works</span>
          <h2 className="landing-section-title">Start in three simple steps</h2>
        </motion.div>

        <div className="landing-steps">
          <motion.div className="landing-step" {...fadeUp}>
            <div className="landing-step-number">1</div>
            <div className="landing-step-icon"><FaMagnifyingGlass /></div>
            <h3>Sign up & verify</h3>
            <p>Create your account and verify your social profile to unlock matching tasks.</p>
          </motion.div>
          <motion.div className="landing-step" {...fadeUp}>
            <div className="landing-step-number">2</div>
            <div className="landing-step-icon"><FaClipboardCheck /></div>
            <h3>Complete tasks</h3>
            <p>Choose tasks matched to your tier and platform, then complete and submit your work.</p>
          </motion.div>
          <motion.div className="landing-step" {...fadeUp}>
            <div className="landing-step-number">3</div>
            <div className="landing-step-icon"><FaWallet /></div>
            <h3>Get paid</h3>
            <p>Earn instantly to your wallet and withdraw to your bank whenever you're ready.</p>
          </motion.div>
        </div>
      </section>

      {/* ===== PLATFORMS ===== */}
      <section className="landing-section" id="platforms">
        <motion.div className="landing-section-head" {...fadeUp}>
          <span className="landing-section-tag">Supported platforms</span>
          <h2 className="landing-section-title">Work across every major platform</h2>
        </motion.div>
        <motion.div className="landing-platforms" {...fadeUp}>
          {['TikTok', 'Instagram', 'Facebook', 'Snapchat', 'YouTube', 'X'].map((p) => (
            <div key={p} className="landing-platform-pill">
              <FaStar /> {p}
            </div>
          ))}
        </motion.div>
      </section>

      {/* ===== CTA ===== */}
      <section className="landing-cta">
        <motion.div
          className="landing-cta-inner"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2>Ready to start earning or advertising?</h2>
          <p>Join {APP_NAME} today and tap into the micro-influencer economy.</p>
          <div className="landing-cta-actions">
            <Link to="/register/earner" className="btn btn-light btn-lg">I'm an Influencer</Link>
            <Link to="/register/advertiser" className="btn btn-outline-light btn-lg">I'm an Advertiser</Link>
          </div>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <Logo />
            <p>{APP_TAGLINE}. Connecting verified influencers with brands.</p>
          </div>
          <div className="landing-footer-links">
            <div>
              <h4>Get Started</h4>
              <Link to="/register/earner">Sign up as earner</Link>
              <Link to="/register/advertiser">Sign up as advertiser</Link>
              <Link to="/login">Sign in</Link>
            </div>
            <div>
              <h4>Platform</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How it works</a>
              <a href="#platforms">Platforms</a>
            </div>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <span>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}