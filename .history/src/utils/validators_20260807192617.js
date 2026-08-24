/**
 * LETCON - Zod Validators
 * Form and data validation schemas using Zod.
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

/** Advertiser registration schema */
export const advertiserRegisterSchema = z.object({
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
  followerScreenshot: z.any().refine((file) => file, 'Upload a screenshot showing your followers'),
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
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description too long'),
  instructions: z.string().min(20, 'Instructions must be at least 20 characters').max(5000, 'Instructions too long'),
  script: z.string().optional(),
  hashtags: z.string().optional(),
  mentions: z.string().optional(),
  deadline: z.string().min(1, 'Deadline is required'),
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
  budget: z
    .number({ invalid_type_error: 'Enter a budget' })
    .min(1000, 'Minimum budget is ₦1,000'),
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
