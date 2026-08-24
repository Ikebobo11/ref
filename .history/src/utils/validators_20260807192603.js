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
