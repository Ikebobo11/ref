/**
 * LETCON - VerifiedAccountBanner Component
 * Highly visible warning banner on every earner dashboard page.
 * Dismissible for the current session only - reappears on every login.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTriangleExclamation, FaXmark, FaEye } from 'react-icons/fa6';
import Button from '../ui/Button';

const SESSION_KEY = 'letcon-verified-banner-dismissed';

/**
 * VerifiedAccountBanner component.
 * @param {Object} props - Component props.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function VerifiedAccountBanner({ className = '' }) {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  /**
   * Checks session storage for dismissal state.
   * The banner reappears on every new session/login.
   */
  useEffect(() => {
    const dismissed = sessionStorage.getItem(SESSION_KEY);
    setVisible(!dismissed);
  }, []);

  /**
   * Dismisses the banner for the current session only.
   */
  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    setVisible(false);
  };

  /**
   * Navigates to the verified account page.
   */
  const handleViewVerifiedAccount = () => {
    navigate('/earner/verified-account');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`verified-account-banner ${className}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          role="alert"
        >
          <div className="verified-account-banner-icon">
            <FaTriangleExclamation />
          </div>
          <div className="verified-account-banner-content">
            <h4 className="verified-account-banner-title">Verified Account Policy</h4>
            <p className="verified-account-banner-message">
              You must complete every task using your verified social media account. Using a
              different account or platform may result in task rejection, account suspension, or
              permanent banning from LETCON.
            </p>
          </div>
          <div className="verified-account-banner-actions">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewVerifiedAccount}
            >
              <FaEye /> View Verified Account
            </Button>
            <button
