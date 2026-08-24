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
