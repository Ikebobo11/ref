/**
 * LETCON - useRoleGuard Hook
 * Route protection and role-based access control.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../config/constants';

/**
 * Normalizes a role string to handle aliases (superadmin, owner, super_admin).
 * @param {string} role - The raw role value.
 * @returns {string} The normalized role.
 */
function normalizeRole(role) {
  if (!role) return '';
  const normalized = String(role).toLowerCase();
  if (normalized === 'superadmin' || normalized === 'owner' || normalized === 'super_admin') {
    return ROLES.SUPER_ADMIN;
  }
  return normalized;
}

/**
 * Determines the default dashboard path for a given role.
 * @param {string} role - The user's role.
 * @returns {string} The default dashboard path.
 */
function getDefaultDashboard(role) {
  switch (normalizeRole(role)) {
    case ROLES.SUPER_ADMIN:
      return '/super-admin/dashboard';
    case ROLES.ADMIN:
      return '/admin/dashboard';
    case ROLES.ADVERTISER:
      return '/advertiser/dashboard';
    case ROLES.EARNER:
      return '/earner/dashboard';
    default:
      return '/';
  }
}

/**
 * Hook that guards routes based on user role.
 * @param {Array<string>} allowedRoles - Array of roles allowed to access the route.
 * @param {Object} [options] - Options.

/**
 * Hook that checks if the current user has a specific role.
 * @param {string} role - The role to check.
 * @returns {boolean} True if the user has the role.
 */
export function useHasRole(role) {
  const { userData } = useAuth();
  return userData?.role === role;
}

/**
 * Hook that checks if the current user is staff (admin or super admin).
 * @returns {boolean} True if the user is staff.
 */
export function useIsStaff() {
  const { userData } = useAuth();
  return userData?.role === ROLES.ADMIN || userData?.role === ROLES.SUPER_ADMIN;
}