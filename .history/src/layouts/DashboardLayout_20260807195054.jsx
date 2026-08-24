/**
 * LETCON - DashboardLayout Component
 * Shared dashboard layout with sidebar navigation, topbar, and responsive design.
 */
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaXmark, FaRightFromBracket, FaMoon, FaSun } from 'react-icons/fa6';
import { useAuth } from '../contexts/AuthContext';
