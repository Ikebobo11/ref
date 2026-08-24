/**
 * LETCON - Forgot Password Page
 * Sends a password reset email.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa6';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/shared/Logo';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

/**
 * Forgot password page component.
 */
export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  /**
   * Handles form submission.
   * @param {Object} data - Form data.
   */
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await resetPassword(data.email);
      setSent(true);
      toast.success('Password reset email sent!');
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
      <h2 className="auth-form-title">Reset Password</h2>
      <p className="auth-form-subtitle">
        {sent
          ? 'Check your email for the password reset link.'
          : 'Enter your email and we will send you a reset link.'}
      </p>

      {!sent ? (
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form-fields">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            icon={<FaEnvelope />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Button type="submit" fullWidth loading={loading}>
            <FaPaperPlane /> Send Reset Link
          </Button>
        </form>
      ) : (
        <div className="auth-success-message">
          <p>If an account exists with that email, a password reset link has been sent.</p>
        </div>
      )}

      <div className="auth-form-divider">
        <span>Remembered your password?</span>
      </div>

      <div className="auth-form-actions">
        <Link to="/login" className="auth-action-btn">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}