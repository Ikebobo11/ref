/**
 * LETCON - ProtectedRoute Component
 * Reusable route guard that restricts access based on the user's role.
 * Prevents unauthorized users from visiting admin/superadmin URLs directly.
 * Used as a layout route: renders <Outlet /> when authorized.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../config/constants';
import Spinner from '../ui/Spinner';

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
 * ProtectedRoute guard component (layout route).
 * @param {Object} props - Component props.
 * @param {Array<string>} props.allowedRoles - Roles allowed to access the wrapped routes.
 * @param {string} [props.redirectTo='/login'] - Redirect for unauthenticated users.
 * @param {string} [props.redirectForbidden] - Redirect for authenticated but unauthorized users.
 *   Defaults to the user's role-based dashboard.
 */
export default function ProtectedRoute({
  allowedRoles,
  redirectTo = '/login',
  redirectForbidden,
}) {
  const { user, userData, loading, initializing } = useAuth();
  const location = useLocation();

  // Show a full-page loader while auth state and user role are being resolved,
  // so protected pages never flash before the redirect happens.
  if (loading || initializing) {
    return (
      <div className="route-loader">
        <Spinner size="lg" label="Checking permissions..." />
      </div>
    );
  }

  // Not logged in → redirect to login (preserve intended destination).
  if (!user) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  const userRole = normalizeRole(userData?.role);
  const normalizedAllowed = (allowedRoles || []).map(normalizeRole);

  // Superadmin has full access to both /admin/* and /super-admin/* routes.
  const isSuperAdmin = userRole === ROLES.SUPER_ADMIN;
  const isAllowed = isSuperAdmin || normalizedAllowed.includes(userRole);

  if (!isAllowed) {
    // Admin trying to access /super-admin/* → redirect to /admin/dashboard.
    if (userRole === ROLES.ADMIN && location.pathname.startsWith('/super-admin')) {
      return <Navigate to="/admin/dashboard" replace />;
    }

    // Any other authenticated user (earner, advertiser, unknown) → their default dashboard.
    const fallback = redirectForbidden || getDefaultDashboard(userRole);
    return <Navigate to={fallback} replace />;
  }

  // Authorized → render the nested routes.
  return children;
}