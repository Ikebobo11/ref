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
 * Gets the current tier list from settings or constants.
 * @param {Object} [settings] - Optional settings object.
 * @returns {Array<string>} Tier list.
 */
function getTierList(settings) {
  if (settings?.tierList?.length) return settings.tierList;
  return TIER_LIST;
}

/**
 * Gets the current countries list from settings or constants.
 * @param {Object} [settings] - Optional settings object.
 * @returns {Array<string>} Countries list.
 */
function getCountries(settings) {
  if (settings?.countries?.length) return settings.countries;
  return COUNTRIES;
}

/**
 * Gets the current upload limits from settings or constants.
 * @param {Object} [settings] - Optional settings object.
 * @returns {Object} Upload limits.
 */
function getUploadLimits(settings) {
  return {
    MAX_IMAGE_SIZE_MB: settings?.maxImageSizeMB ?? UPLOAD_LIMITS.MAX_IMAGE_SIZE_MB,
    MAX_VIDEO_SIZE_MB: settings?.maxVideoSizeMB ?? UPLOAD_LIMITS.MAX_VIDEO_SIZE_MB,
    MAX_IMAGES_PER_TASK: settings?.maxImagesPerTask ?? UPLOAD_LIMITS.MAX_IMAGES_PER_TASK,
    MAX_VIDEOS_PER_TASK: settings?.maxVideosPerTask ?? UPLOAD_LIMITS.MAX_VIDEOS_PER_TASK,
    ALLOWED_IMAGE_TYPES: settings?.allowedImageTypes?.length
      ? settings.allowedImageTypes
      : UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES,
    ALLOWED_VIDEO_TYPES: settings?.allowedVideoTypes?.length
      ? settings.allowedVideoTypes
      : UPLOAD_LIMITS.ALLOWED_VIDEO_TYPES,
  };
}

/**
 * Gets the current min followers to register from settings or default.
 * @param {Object} [settings] - Optional settings object.
 * @returns {number} Min followers.
 */
function getMinFollowersToRegister(settings) {
  return settings?.minFollowersToRegister ?? 1000;
}

/**
 * Gets the current min/max withdrawal amounts from settings or defaults.
 * @param {Object} [settings] - Optional settings object.
 * @returns {{ min: number, max: number }} Withdrawal limits.
 */
function getWithdrawalLimits(settings) {
  return {
    min: settings?.minWithdrawal ?? 1000,
    max: settings?.maxWithdrawal ?? 10000000,
  };
}

/**
 * Gets the current min/max wallet funding amounts from settings or defaults.
 * @param {Object} [settings] - Optional settings object.
 * @returns {{ min: number, max: number }} Funding limits.
 */
function getFundingLimits(settings) {
  return {
    min: settings?.minWalletFunding ?? 100,
    max: settings?.maxWalletFunding ?? 10000000,
  };
}

/**
 * Creates an advertiser registration schema with dynamic settings.
 * @param {Object} [settings] - Optional settings object.
 * @returns {z.ZodObject} Advertiser registration schema.
 */
export function createAdvertiserRegisterSchema(settings) {
  return z.object({
    fullName: z.string().min(2, 'Full name is required'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    accountType: z.enum(['Business', 'Artist', 'Brand', 'Record Label', 'Agency'], {
      errorMap: () => ({ message: 'Select an account type' }),
    }),
    companyName: z.string().optional(),
    phone: z.string().min(10, 'Enter a valid phone number'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
}

// Static fallback (backward compatible)
export const advertiserRegisterSchema = createAdvertiserRegisterSchema();

/**
 * Creates an earner registration schema with dynamic settings.
 * @param {Object} [settings] - Optional settings object.
 * @returns {z.ZodObject} Earner registration schema.
 */
export function createEarnerRegisterSchema(settings) {
  const platforms = getPlatformList(settings);
  const minFollowers = getMinFollowersToRegister(settings);

  return z.object({
    fullName: z.string().min(2, 'Full name is required'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    phone: z.string().min(10, 'Enter a valid phone number'),
    platform: z.enum(platforms, {
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
      .min(minFollowers, `Minimum ${minFollowers.toLocaleString()} followers required to register`)
      .max(100000000, 'Follower count seems too high'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
}

// Static fallback (backward compatible)
export const earnerRegisterSchema = createEarnerRegisterSchema();

/**
 * Creates a task creation schema with dynamic settings.
 * @param {Object} [settings] - Optional settings object.
 * @returns {z.ZodObject} Task schema.
 */
export function createTaskSchema(settings) {
  const platforms = getPlatformList(settings);
  const tiers = getTierList(settings);
  const countries = getCountries(settings);

  return z.object({
    platform: z.enum(platforms, {
      errorMap: () => ({ message: 'Select a platform' }),
    }),
    title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
    instructions: z.string().min(20, 'Instructions must be at least 20 characters').max(5000, 'Instructions too long'),
    script: z.string().optional(),
    hashtags: z.string().optional(),
    mentions: z.string().optional(),
    country: z.enum(countries, {
      errorMap: () => ({ message: 'Select a country' }),
    }),
    influencersNeeded: z
      .number({ invalid_type_error: 'Enter number of influencers needed' })
      .min(1, 'At least 1 influencer needed')
      .max(100, 'Maximum 100 influencers'),
    followerTier: z.enum(tiers, {
      errorMap: () => ({ message: 'Select a follower tier' }),
    }),
    images: z.array(z.any()).optional(),
    videos: z.array(z.any()).optional(),
    example: z.any().optional(),
  });
}

// Static fallback (backward compatible)
export const taskSchema = createTaskSchema();

/**
 * Creates a wallet funding schema with dynamic settings.
 * @param {Object} [settings] - Optional settings object.
 * @returns {z.ZodObject} Fund wallet schema.
 */
export function createFundWalletSchema(settings) {
  const { min, max } = getFundingLimits(settings);
  return z.object({
    amount: z
      .number({ invalid_type_error: 'Enter an amount' })
      .min(min, `Minimum funding is ₦${min.toLocaleString()}`)
      .max(max, `Maximum funding is ₦${max.toLocaleString()}`),
  });
}

// Static fallback (backward compatible)
export const fundWalletSchema = createFundWalletSchema();

/**
 * Creates a withdrawal schema with dynamic settings.
 * @param {Object} [settings] - Optional settings object.
 * @returns {z.ZodObject} Withdrawal schema.
 */
export function createWithdrawalSchema(settings) {
  const { min } = getWithdrawalLimits(settings);
  return z.object({
    amount: z
      .number({ invalid_type_error: 'Enter an amount' })
      .min(min, `Minimum withdrawal is ₦${min.toLocaleString()}`),
    bankName: z.string().min(2, 'Bank name is required'),
    accountNumber: z
      .string()
      .min(10, 'Enter a valid account number')
      .max(10, 'Account number must be 10 digits')
      .regex(/^\d+$/, 'Account number must contain only digits'),
    accountName: z.string().min(2, 'Account name is required'),
  });
}

// Static fallback (backward compatible)
export const withdrawalSchema = createWithdrawalSchema();

/**
 * Creates an account change request schema with dynamic settings.
 * @param {Object} [settings] - Optional settings object.
 * @returns {z.ZodObject} Account change schema.
 */
export function createAccountChangeSchema(settings) {
  const platforms = getPlatformList(settings);
  return z.object({
    newPlatform: z.enum(platforms, {
