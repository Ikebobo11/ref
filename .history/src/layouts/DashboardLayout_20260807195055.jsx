/**
 * LETCON - DashboardLayout Component
 * Shared dashboard layout with sidebar navigation, topbar, and responsive design.
 */
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaXmark, FaRightFromBracket, FaMoon, FaSun } from 'react-icons/fa6';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Logo from '../components/shared/Logo';
import NotificationBell from '../components/shared/NotificationBell';

/**
 * DashboardLayout component.
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.navItems - Array of { to, label, icon, end } navigation items.
 * @param {string} [props.title] - Dashboard title.
 * @param {React.ReactNode} [props.headerExtra] - Extra header content.
