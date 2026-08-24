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


  useEffect(() => {
    if (initializing || loading) return;

    if (!user) {
      navigate(redirectTo, { replace: true });
      return;
    }

    const userRole = userData?.role;
    if (!allowedRoles.includes(userRole)) {
      navigate(redirectForbidden, { replace: true });
    }
  }, [user, userData, loading, initializing, allowedRoles, navigate, redirectTo, redirectForbidden]);

  const isAllowed = Boolean(
    user && userData && allowedRoles.includes(userData.role)
  );

  return {
    isAllowed,
    isLoading: loading || initializing,
  };
}

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