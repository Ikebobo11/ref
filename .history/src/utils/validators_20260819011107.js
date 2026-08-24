/**
 * LETCON - Zod Validators
 * Form and data validation schemas using Zod.
 * Supports dynamic limits from settings with fallback to constants.
 */
import { z } from 'zod';
import {
  PLATFORM_LIST,
  TIER_LIST,
  COUNTRIES,
  UPLOAD_LIMITS,
} from '../config/constants';

/** Email validator */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email address');

/** Password validator - min 8 chars, at least 1 letter and 1 number */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/** Login form schema */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Gets the current platform list from settings or constants.
 * @param {Object} [settings] - Optional settings object.
 * @returns {Array<string>} Platform list.
 */
function getPlatformList(settings) {
  if (settings?.platformList?.length) return settings.platformList;
  return PLATFORM_LIST;
}

/**
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/** Earner registration schema - includes verified promotion account setup */
export const earnerRegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  // Verified Promotion Account fields
  platform: z.enum(PLATFORM_LIST, {
    errorMap: () => ({ message: 'Select a platform' }),
  }),
  platformName: z.string().min(2, 'Platform name is required'),
  username: z
    .string()
    .min(2, 'Username is required')
    .regex(/^@?[a-zA-Z0-9._]+$/, 'Enter a valid username (letters, numbers, . _)'),
  profileUrl: z.string().url('Enter a valid profile URL'),
  followerCount: z
    .number({ invalid_type_error: 'Enter your follower count' })
    .min(1000, 'Minimum 1,000 followers required to register')
    .max(100000000, 'Follower count seems too high'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/** Task creation schema */
export const taskSchema = z.object({
  platform: z.enum(PLATFORM_LIST, {
    errorMap: () => ({ message: 'Select a platform' }),
  }),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
  instructions: z.string().min(20, 'Instructions must be at least 20 characters').max(5000, 'Instructions too long'),
  script: z.string().optional(),
  hashtags: z.string().optional(),
  mentions: z.string().optional(),
  country: z.enum(COUNTRIES, {
    errorMap: () => ({ message: 'Select a country' }),
  }),
  influencersNeeded: z
    .number({ invalid_type_error: 'Enter number of influencers needed' })
    .min(1, 'At least 1 influencer needed')
    .max(100, 'Maximum 100 influencers'),
  followerTier: z.enum(TIER_LIST, {
    errorMap: () => ({ message: 'Select a follower tier' }),
  }),
  images: z.array(z.any()).optional(),
  videos: z.array(z.any()).optional(),
  example: z.any().optional(),
});

/** Wallet funding schema */
export const fundWalletSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Enter an amount' })
    .min(100, 'Minimum funding is ₦100')
    .max(10000000, 'Maximum funding is ₦10,000,000'),
});

/** Withdrawal schema */
export const withdrawalSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Enter an amount' })
    .min(1000, 'Minimum withdrawal is ₦1,000'),
  bankName: z.string().min(2, 'Bank name is required'),
  accountNumber: z
    .string()
    .min(10, 'Enter a valid account number')
    .max(10, 'Account number must be 10 digits')
    .regex(/^\d+$/, 'Account number must contain only digits'),
  accountName: z.string().min(2, 'Account name is required'),
});

/** Account change request schema */
export const accountChangeSchema = z.object({
  newPlatform: z.enum(PLATFORM_LIST, {
    errorMap: () => ({ message: 'Select a platform' }),
  }),
  newUsername: z
    .string()
    .min(2, 'Username is required')
    .regex(/^@?[a-zA-Z0-9._]+$/, 'Enter a valid username'),
  newProfileUrl: z.string().url('Enter a valid profile URL'),
  newFollowerCount: z
    .number({ invalid_type_error: 'Enter your follower count' })
    .min(1000, 'Minimum 1,000 followers'),
  newFollowerScreenshot: z.any().refine((file) => file, 'Upload a screenshot showing your followers'),
  reason: z.string().min(10, 'Please provide a reason for the change').max(500, 'Reason too long'),
});

/** Upgrade request schema */
export const upgradeSchema = z.object({
  newFollowerCount: z
    .number({ invalid_type_error: 'Enter your new follower count' })
    .min(5000, 'Minimum 5,000 followers for Tier 1'),
  newProfileLink: z.string().url('Enter a valid profile URL'),
  newScreenshot: z.any().refine((file) => file, 'Upload a new screenshot showing your followers'),
});

/** Admin invite schema */
export const adminInviteSchema = z.object({
  email: emailSchema,
  fullName: z.string().min(2, 'Full name is required'),
  role: z.enum(['admin'], {
    errorMap: () => ({ message: 'Select a role' }),
  }),
});

/** Verification review schema */
export const verificationReviewSchema = z.object({
  decision: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: 'Select a decision' }),
  }),
  notes: z.string().optional(),
});

/** Task review schema (advertiser) */
export const taskReviewSchema = z.object({
  decision: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: 'Select a decision' }),
  }),
  reason: z.string().optional(),
});

/** Admin task review schema */
export const adminTaskReviewSchema = z.object({
  decision: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: 'Select a decision' }),
  }),
  notes: z.string().min(5, 'Notes are required').max(1000, 'Notes too long'),
});

/** Message schema */
export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
});

/** Settings schema */
export const settingsSchema = z.object({
  platformName: z.string().min(2, 'Platform name is required'),
  supportEmail: emailSchema,
  verificationFee: z.number().min(0, 'Fee cannot be negative'),
  taskPostingFee: z.number().min(0, 'Fee cannot be negative'),
  platformRevenuePercent: z
    .number()
    .min(0, 'Cannot be negative')
    .max(100, 'Cannot exceed 100%'),
  autoApprovalHours: z.number().min(1, 'Minimum 1 hour').max(168, 'Maximum 7 days'),
});

/** File validation helper */
export function validateImageFile(file) {
  if (!file) return { valid: false, error: 'No file selected' };
  if (!UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid image type. Use JPG, PNG, WEBP, or GIF' };
  }
  if (file.size > UPLOAD_LIMITS.MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `Image must be under ${UPLOAD_LIMITS.MAX_IMAGE_SIZE_MB}MB` };
  }
  return { valid: true, error: null };
}

/** File validation helper for videos */
export function validateVideoFile(file) {
  if (!file) return { valid: false, error: 'No file selected' };
  if (!UPLOAD_LIMITS.ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid video type. Use MP4, WEBM, or MOV' };
  }
  if (file.size > UPLOAD_LIMITS.MAX_VIDEO_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `Video must be under ${UPLOAD_LIMITS.MAX_VIDEO_SIZE_MB}MB` };
  }
  return { valid: true, error: null };
}