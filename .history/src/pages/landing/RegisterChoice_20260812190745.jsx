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
