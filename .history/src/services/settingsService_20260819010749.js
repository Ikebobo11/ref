/**
 * LETCON - Settings Service
 * Loads platform settings from Firestore with fallback to constants defaults.
 * Provides getSettings() and getSetting() for app-wide configuration.
 */
import { getDocument, setDocument } from './firestoreService';
import { COLLECTIONS } from '../config/constants';
import {
  PLATFORMS,
  PLATFORM_LIST,
  TIERS,
  TIER_LIST,
  TIER_MIN_FOLLOWERS,
  TIER_PAYMENTS,
  REVENUE_SPLIT,
  FEES,
  AUTO_APPROVAL_HOURS,
  CURRENCY,
  CURRENCY_SYMBOL,
  APP_NAME,
  APP_TAGLINE,
  COUNTRIES,
  UPLOAD_LIMITS,
  QUERY_LIMITS,
  PAGINATION,
} from '../config/constants';

/** In-memory cache of settings */
let cachedSettings = null;

/**
 * Default settings from constants (fallback when no Firestore doc exists).
 */
const DEFAULT_SETTINGS = {
  // General
  platformName: APP_NAME,
  supportEmail: 'support@letcon.app',
  appTagline: APP_TAGLINE,
  currency: CURRENCY,
  currencySymbol: CURRENCY_SYMBOL,

  // Platforms
  platforms: { ...PLATFORMS },
  platformList: [...PLATFORM_LIST],

  // Tiers
  tiers: { ...TIERS },
  tierList: [...TIER_LIST],
  tierMinFollowers: { ...TIER_MIN_FOLLOWERS },
  tierPayments: JSON.parse(JSON.stringify(TIER_PAYMENTS)),

  // Pricing & Fees
  verificationFee: FEES.VERIFICATION_FEE,
  taskPostingFee: FEES.TASK_POSTING_FEE,
  platformRevenuePercent: REVENUE_SPLIT.PLATFORM_PERCENT,
  earnerRevenuePercent: REVENUE_SPLIT.EARNER_PERCENT,
  autoApprovalHours: AUTO_APPROVAL_HOURS,
  minWithdrawal: 1000,
  maxWithdrawal: 10000000,
  minWalletFunding: 100,
  maxWalletFunding: 10000000,
