/**
 * LETCON - Login Page
 * User authentication with email and password.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaRightToBracket, FaEye, FaEyeSlash } from 'react-icons/fa6';
import { loginSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../config/constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/shared/Logo';

/**
 * Login page component.
 */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  /**
   * Handles form submission.
   * @param {Object} data - Form data.
   */
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { userData } = await login(data.email, data.password

      // Redirect based on role
      const roleRoutes = {
        [ROLES.SUPER_ADMIN]: '/super-admin/dashboard',
        [ROLES.ADMIN]: '/admin/dashboard',
        [ROLES.ADVERTISER]: '/advertiser/dashboard',
        [ROLES.EARNER]: '/earner/dashboard',
      };

      const route = roleRoutes[userData?.role] || '/';
      toast.success('Welcome back!');
      navigate(route);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <div className="auth-form-mobile-logo">
        <Logo />
      </div>
      <h2 className="auth-form-title">Welcome back</h2>
      <p className="auth-form-subtitle">Sign in to your LETCON account</p>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form-fields">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          icon={<FaEnvelope />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          icon={<FaLock />}
          rightIcon={
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="auth-form-links">
          <Link to="/forgot-password" className="auth-link">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={loading}>
          <FaRightToBracket /> Sign In
        </Button>
      </form>

      <div className="auth-form-divider">
        <span>New to LETCON?</span>
      </div>

      <div className="auth-form-actions">
        <Link to="/register/advertiser" className="auth-action-btn">
          Register as Advertiser
        </Link>
        <Link to="/register/earner" className="auth-action-btn auth-action-btn-primary">
          Register as Earner
        </Link>
      </div>
    </div>
  );
}