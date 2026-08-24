/**
 * LETCON - Earner Registration Page
 * Registration with Verified Promotion Account setup and verification fee payment.
 * Registration and verified-account setup happen together - no separate general registration.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaRightToBracket,
  FaHashtag,
  FaLink,
  FaUsers,
  FaImage,
  FaCreditCard,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa6';
import { earnerRegisterSchema } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES, PLATFORM_LIST, FEES, CURRENCY_SYMBOL } from '../../config/constants';
import { uploadVerificationProof } from '../../services/storageService';
import { recordVerificationFeePayment } from '../../services/paystackService';
import { generateReference } from '../../config/paystack';
import { addDocument } from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/ui/FileUpload';
import Logo from '../../components/shared/Logo';
import PlatformBadge from '../../components/shared/PlatformBadge';

const PLATFORM_OPTIONS = PLATFORM_LIST.map((platform) => ({ value: platform, label: platform }));

/**
 * Earner registration page component.
 */
export default function EarnerRegister() {
  const { register: registerUser, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [followerScreenshot, setFollowerScreenshot] = useState(null);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(earnerRegisterSchema),
    defaultValues: {
      platform: '',
      platformName: '',
      username: '',
      profileUrl: '',
      followerCount: '',
    },
  });

  const selectedPlatform = watch('platform');

  /**
   * Handles form submission - creates account, uploads proof, and initiates verification fee payment.
   * @param {Object} data - Form data.
   */
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Upload follower screenshot first
      const proofUpload = await uploadVerificationProof(
        followerScreenshot,
        'pending',
        (progress) => console.log(`Upload progress: ${progress}%`)
      );

      // Create the user account with verified promotion account data
      const { user: createdUser } = await registerUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        role: ROLES.EARNER,
        profile: {
          phone: data.phone,
          verifiedPlatform: data.platform,
          verifiedUsername: data.username,
          profileUrl: data.profileUrl,
          followerCount: data.followerCount,
          platformName: data.platformName,
          followerScreenshotUrl: proofUpload.downloadUrl,
          verificationStatus: 'pending',
          verified: false,
        },
      });

      // Create verification request
      const reference = generateReference('VER');
      await addDocument(COLLECTIONS.VERIFICATION_REQUESTS, {
        uid: createdUser.uid,
        email: data.email,
        fullName: data.fullName,
        platform: data.platform,
        platformName: data.platformName,
        username: data.username,
        profileUrl: data.profileUrl,
        followerCount: data.followerCount,
        followerScreenshotUrl: proofUpload.downloadUrl,
        status: 'pending',
        feePaid: false,
        feeReference: reference,
        createdAt: new Date(),
      });

      // Record the verification fee transaction
      await recordVerificationFeePayment({
        uid: createdUser.uid,
        email: data.email,
        reference,
      });

      toast.success('Account created! Please pay the verification fee to complete registration.');
      navigate('/ver
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form auth-form-wide">
      <div className="auth-form-mobile-logo">
        <Logo />
      </div>
      <h2 className="auth-form-title">Create Earner Account</h2>
      <p className="auth-form-subtitle">
        Register with your exact social media account you will use for tasks
      </p>

      <div className="verification-fee-notice">
        <FaCreditCard />
        <div>
          <strong>Verification Fee: {CURRENCY_SYMBOL}{FEES.VERIFICATION_FEE.toLocaleString()}</strong>
          <p>Non-refundable. Paid after registration to verify your account.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form-fields">
        <div className="form-section">
          <h3 className="form-section-title">Account Details</h3>
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
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+234..."
            icon={<FaPhone />}
            error={errors.phone?.message}
            {...register('phone')}
          />
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
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Verified Promotion Account</h3>
          <p className="form-section-subtitle">
            This is the exact account you will use to complete all tasks. It cannot be changed
            without an approved Account Change Request.
          </p>

          <Select
            label="Select Platform"
            options={PLATFORM_OPTIONS}
            error={errors.platform?.message}
            {...register('platform')}
          />

          {selectedPlatform && (
            <div className="selected-platform-preview">
              <PlatformBadge platform={selectedPlatform} size="lg" />
            </div>
          )}

          <Input
            label="Platform Name"
            placeholder="e.g., @johncreator"
            icon={<FaHashtag />}
            error={errors.platformName?.message}
            {...register('platformName')}
          />

          <Input
            label="Username"
            placeholder="e.g., johncreator"
            icon={<FaUser />}
            error={errors.username?.message}
            {...register('username')}
          />

          <Input
            label="Profile URL / Link"
            type="url"
            placeholder="https://..."
            icon={<FaLink />}
            error={errors.profileUrl?.message}
            {...register('profileUrl')}
          />

          <Input
            label="Current Follower / Subscriber Count"
            type="number"
            placeholder="e.g., 5000"
            icon={<FaUsers />}
            error={errors.followerCount?.message}
            {...register('followerCount', { valueAsNumber: true })}
          />

          <FileUpload
            label="Upload Screenshot Showing Followers"
            accept="image/*"
            onChange={(files) => setFollowerScreenshot(files[0])}
            error={errors.followerScreenshot?.message}
            helperText="Screenshot must clearly show your follower count"
          />
        </div>

        <Button type="submit" fullWidth loading={loading}>
          <FaRightToBracket /> Create Account & Continue to Payment
        </Button>
      </form>

      <div className="auth-form-divider">
        <span>Already have an account?</span>
      </div>

      <div className="auth-form-actions">
        <Link to="/login" className="auth-action-btn">
          Sign In
        </Link>
        <Link to="/register/advertiser" className="auth-action-btn auth-action-btn-primary">
          Register as Advertiser
        </Link>
      </div>
    </div>
  );
}