/**
 * LETCON - Core Business Constants
 * Centralized configuration for tiers, platforms, pricing, and business rules.
 */

/** Supported social media platforms */
export const PLATFORMS = {
  TIKTOK: 'TikTok',
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  SNAPCHAT: 'Snapchat',
  YOUTUBE: 'YouTube',
  X: 'X',
};

/** All supported platforms as an array */
export const PLATFORM_LIST = Object.values(PLATFORMS);

/** Follower tiers */
export const TIERS = {
  TIER_1: '5K',
  TIER_2: '10K',
  TIER_3: '15K',
};

/** All tiers as an array */
export const TIER_LIST = [TIERS.TIER_1, TIERS.TIER_2, TIERS.TIER_3];

/** Minimum followers required for each tier */
export const TIER_MIN_FOLLOWERS = {
  [TIERS.TIER_1]: 5000,
  [TIERS.TIER_2]: 10000,
  [TIERS.TIER_3]: 15000,
};

/**
