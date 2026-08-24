/**
 * LETCON - Root Application Component
 * Defines the full routing structure for all user roles.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from './config/constants';

// Auth Layout & Pages
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/auth/Login';
import AdvertiserRegister from './pages/auth/AdvertiserRegister';
import EarnerRegister from './pages/auth/EarnerRegister';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerificationPayment from './pages/auth/VerificationPayment';

// Earner Layout & Pages
import EarnerLayout from './layouts/EarnerLayout';
