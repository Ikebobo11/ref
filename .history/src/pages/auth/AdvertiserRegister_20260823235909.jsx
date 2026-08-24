/**
 * LETCON - Advertiser Registration Page
 * Registration for businesses, artists, brands, record labels, and agencies.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaUser, FaPhone, FaBuilding, FaRightToBracket, FaEye, FaEyeSlash } from 'react-icons/fa6';
import { advertiserRegisterSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../config/constants';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Logo from '../../components/shared/Logo';

const ACCOUNT_TYPES = [
  { value: 'Business', label: 'Business' },
  { value: 'Artist', label: 'Artist' },
  { value: 'Brand', label: 'Brand' },
  { value: 'Record Label', label: 'Record Label' },
  { value: 'Agency', label: 'Agency' },
];

/**
 * Advertiser registration page component.
 */
export default function AdvertiserRegister() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(advertiserRegisterSchema),
  });

  /**
   * Handles form submission.
   * @param {Object} data - Form data.
   */
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        role: ROLES.ADVERTISER,
        profile: {
          accountType: data.accountType,
          companyName: data.companyName || '',
          phone: data.phone,
          gender: data.gender,
        },
      toast.success('Account created successfully!');
      navigate('/advertiser/dashboard');
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
      <h2 className="auth-form-title">Create Advertiser Account</h2>
      <p className="auth-form-subtitle">For businesses, artists, brands, record labels, and agencies</p>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form-fields">
        <Input
          label="Full Name"
          placeholder="Your full name"
          icon={<FaUser />}
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          icon={<FaEnvelope />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Select
          label="Account Type"
          options={ACCOUNT_TYPES}
          error={errors.accountType?.message}
          {...register('accountType')}
        />

        <Input
          label="Company / Brand Name (Optional)"
          placeholder="Your company or brand name"
          icon={<FaBuilding />}
          error={errors.companyName?.message}
          {...register('companyName')}
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+234..."
          icon={<FaPhone />}
          error={errors.phone?.message}
          {...register('phone')}
        />

        <div className="form-group">
          <label className="form-label">Gender</label>
          <div className="gender-options">
            <label className={`gender-option ${watch('gender') === 'male' ? 'selected' : ''}`}>
              <input type="radio" value="male" {...register('gender')} />
              <span>Male</span>
            </label>
            <label className={`gender-option ${watch('gender') === 'female' ? 'selected' : ''}`}>
              <input type="radio" value="female" {...register('gender')} />
              <span>Female</span>
            </label>
          </div>
          {errors.gender?.message && <span className="form-error">{errors.gender.message}</span>}
        </div>

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min 8 characters with letters and numbers"
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

        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Re-enter your password"
          icon={<FaLock />}
          rightIcon={
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          }
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" fullWidth loading={loading}>
          <FaRightToBracket /> Create Account
        </Button>
      </form>

      <div className="auth-form-divider">
        <span>Already have an account?</span>
      </div>

      <div className="auth-form-actions">
        <Link to="/login" className="auth-action-btn">
          Sign In
        </Link>
        <Link to="/register/earner" className="auth-action-btn auth-action-btn-primary">
          Register as Earner
        </Link>
      </div>
    </div>
  );
}