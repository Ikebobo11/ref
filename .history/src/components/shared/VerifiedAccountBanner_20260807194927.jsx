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
