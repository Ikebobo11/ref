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
  genderPostingFee: FEES.GENDER_POSTING_FEE,
  platformRevenuePercent: REVENUE_SPLIT.PLATFORM_PERCENT,
  earnerRevenuePercent: REVENUE_SPLIT.EARNER_PERCENT,
  autoApprovalHours: AUTO_APPROVAL_HOURS,
  minWithdrawal: 1000,
  maxWithdrawal: 10000000,
  minWalletFunding: 100,
  maxWalletFunding: 10000000,
  minFollowersToRegister: 1000,

  // Upload Limits
  maxImageSizeMB: UPLOAD_LIMITS.MAX_IMAGE_SIZE_MB,
  maxVideoSizeMB: UPLOAD_LIMITS.MAX_VIDEO_SIZE_MB,
  maxImagesPerTask: UPLOAD_LIMITS.MAX_IMAGES_PER_TASK,
  maxVideosPerTask: UPLOAD_LIMITS.MAX_VIDEOS_PER_TASK,
  allowedImageTypes: [...UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES],
  allowedVideoTypes: [...UPLOAD_LIMITS.ALLOWED_VIDEO_TYPES],

  // Query & Pagination
  queryLimitDefault: QUERY_LIMITS.DEFAULT,
  queryLimitLarge: QUERY_LIMITS.LARGE,
  queryLimitMax: QUERY_LIMITS.MAX,
  pageSize: PAGINATION.PAGE_SIZE,
  pageSizeOptions: [...PAGINATION.PAGE_SIZE_OPTIONS],

  // Countries
  countries: [...COUNTRIES],
};

/**
 * Loads settings from Firestore, falling back to defaults.
 * Results are cached in memory.
 * @param {boolean} [forceRefresh=false] - Force reload from Firestore.
 * @returns {Promise<Object>} The settings object.
 */
export async function getSettings(forceRefresh = false) {
  if (cachedSettings && !forceRefresh) return cachedSettings;

  try {
    const settings = await getDocument(COLLECTIONS.SETTINGS, 'platform');
    if (settings) {
      // Merge with defaults to ensure all keys exist
      cachedSettings = { ...DEFAULT_SETTINGS, ...settings };
    } else {
      cachedSettings = { ...DEFAULT_SETTINGS };
    }
  } catch (error) {
    console.error('[LETCON] Error loading settings, using defaults:', error);
    cachedSettings = { ...DEFAULT_SETTINGS };
  }

  return cachedSettings;
}

/**
 * Gets the currently cached settings synchronously (no Firestore read).
 * Falls back to defaults if nothing is cached yet.
 * Use this in non-React code (services/utils) that cannot use hooks.
 * @returns {Object} The cached settings object.
 */
export function getCachedSettings() {
  return cachedSettings ? { ...cachedSettings } : { ...DEFAULT_SETTINGS };
}

/**
 * Gets a single setting value by key.
 * @param {string} key - The setting key.
 * @param {*} [defaultValue] - Fallback value if key not found.
 * @returns {Promise<*>} The setting value.
 */
export async function getSetting(key, defaultValue) {
  const settings = await getSettings();
  return settings[key] !== undefined ? settings[key] : defaultValue;
}

/**
 * Gets a single setting value by key synchronously from cache/defaults.
 * @param {string} key - The setting key.
 * @param {*} [defaultValue] - Fallback value if key not found.
 * @returns {*} The setting value.
 */
export function getSettingSync(key, defaultValue) {
  const settings = getCachedSettings();
  return settings[key] !== undefined ? settings[key] : defaultValue;
}
  cachedSettings = null;
}

/**
 * Gets the default settings (for initializing forms).
 * @returns {Object} The default settings object.
 */
export function getDefaultSettings() {
  return { ...DEFAULT_SETTINGS };
}