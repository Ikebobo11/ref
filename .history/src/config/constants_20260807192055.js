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
 * Payment rates per tier and platform (₦)
 * Tier 1: TikTok/Facebook/Snapchat ₦12,000 | Instagram/YouTube/X ₦18,000
 * Tier 2: TikTok/Facebook/Snapchat ₦26,000 | Instagram/YouTube/X ₦32,000
 * Tier 3: TikTok/Facebook/Snapchat ₦38,000 | Instagram/YouTube/X ₦46,000
 */
export const TIER_PAYMENTS = {
  [TIERS.TIER_1]: {
    [PLATFORMS.TIKTOK]: 12000,
    [PLATFORMS.FACEBOOK]: 12000,
    [PLATFORMS.SNAPCHAT]: 12000,
    [PLATFORMS.INSTAGRAM]: 18000,
    [PLATFORMS.YOUTUBE]: 18000,
    [PLATFORMS.X]: 18000,
  },
  [TIERS.TIER_2]: {
    [PLATFORMS.TIKTOK]: 26000,
    [PLATFORMS.FACEBOOK]: 26000,
    [PLATFORMS.SNAPCHAT]: 26000,
    [PLATFORMS.INSTAGRAM]: 32000,
    [PLATFORMS.YOUTUBE]: 32000,
    [PLATFORMS.X]: 32000,
  },
  [TIERS.TIER_3]: {
    [PLATFORMS.TIKTOK]: 38000,
    [PLATFORMS.FACEBOOK]: 38000,
    [PLATFORMS.SNAPCHAT]: 38000,
    [PLATFORMS.INSTAGRAM]: 46000,
    [PLATFORMS.YOUTUBE]: 46000,
    [PLATFORMS.X]: 46000,
  },
};

/** Platform revenue split percentages */
export const REVENUE_SPLIT = {
  PLATFORM_PERCENT: 30,
  EARNER_PERCENT: 70,
};

/** Fees (₦) */
export const FEES = {
  VERIFICATION_FEE: 1000,
  TASK_POSTING_FEE: 1000,
};

/** Auto-approval window (24 hours in milliseconds) */
export const AUTO_APPROVAL_HOURS = 24;
export const AUTO_APPROVAL_MS = AUTO_APPROVAL_HOURS * 60 * 60 * 1000;

/** User roles */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  ADVERTISER: 'advertiser',
  EARNER: 'earner',
};

/** Task statuses */
export const TASK_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
