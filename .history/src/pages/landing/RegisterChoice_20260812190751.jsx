/**
 * LETCON - Register Choice Page
 * Simple role selection between Earner and Advertiser registration.
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUsers, FaBullhorn, FaArrowRight } from 'react-icons/fa6';
import Logo from '../../components/shared/Logo';
import { APP_NAME, APP_TAGLINE } from '../../config/constants';

/**
 * Register choice page component.
 */
export default function RegisterChoice() {
  return (
    <div className="register-choice-page">
      <div className="register-choice-container">
        <motion.div
          className="register-choice-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link to="/" className="register-choice-logo">
            <Logo />
          </Link>
          <h1>Join {APP_NAME}</h1>
          <p>{APP_TAGLINE}. Choose how you want to get started.</p>
        </motion.div>

        <div className="register-choice-grid">
          <motion.div
            className="register-choice-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="register-choice-icon icon-earn">
              <FaUsers />
            </div>
            <h2>I'm an Influencer</h2>
            <p>
              Get verified, complete tasks, and earn money from your social media following.
            </p>
            <ul className="register-choice-list">
              <li>Earn ₦12,000 – ₦46,000+ per task</li>
              <li>Tasks matched to your tier & platform</li>
              <li>Withdraw earnings to your bank</li>
            </ul>
            <Link to="/register/earner" className="btn btn-primary btn-lg btn-full">
              Sign Up as Earner <FaArrowRight />
            </Link>
          </motion.div>

          <motion.div
            className="register-choice-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="register-choice-icon icon-advertise">
              <FaBullhorn />
            </div>
            <h2>I'm an Advertiser</h2>
            <p>
              Post campaigns and get authentic promotion from verified micro-influencers.
            </p>
            <ul className="register-choice-list">
              <li>Reach vetted, real audiences</li>
              <li>Only pay for completed work</li>
              <li>Full campaign analytics</li>
            </ul>
            <Link to="/register/advertiser" className="btn btn-secondary btn-lg btn-full">
              Sign Up as Advertiser <FaArrowRight />
            </Link>
