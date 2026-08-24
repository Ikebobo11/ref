/**
 * LETCON - useRoleGuard Hook
 * Route protection and role-based access control.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../config/constants';

/**
 * Hook that guards routes based on user role.
 * @param {Array<string>} allowedRoles - Array of roles allowed to access the route.
 * @param {Object} [options] - Options.
 * @param {string} [options.redirectTo='/login'] - Redirect path for unauthenticated users.
 * @param {string} [options.redirectForbidden='/'] - Redirect path for unauthorized users.
 * @returns {Object} { isAllowed, isLoading }
 */
export function useRoleGuard(allowedRoles, {
  redirectTo = '/login',
  redirectForbidden = '/',
} = {}) {
  const { user, userData, loading, initializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initializing || loading) return;

    if (!user) {
      navigate(redirectTo, { replace: true });
      return;
    }

    const userRole = userData?.role;
    if (!allowedRoles.includes(userRole)) {
