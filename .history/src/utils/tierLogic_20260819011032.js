/**
 * LETCON - Tier & Revenue Logic
 * Core business rules for follower tiers, platform matching, and revenue splits.
 * Supports dynamic settings from Firestore with fallback to constants.
 */
import {
  TIERS,
  TIER_MIN_FOLLOWERS,
  TIER_PAYMENTS,
  REVENUE_SPLIT,
  PLATFORMS,
} from '../config/constants';

/**
 * Gets the current tier definitions from settings or constants.
 * @param {Object} [settings] - Optional settings object from SettingsContext.
 * @returns {Object} Tier definitions.
 */
function getTiers(settings) {
  if (settings?.tierList && settings?.tierMinFollowers) {
    const tiers = {};
    settings.tierList.forEach((t, i) => {
      tiers[`TIER_${i + 1}`] = t;
    });
    return tiers;
  }
  return TIERS;
}

/**
 * Gets the current tier min followers from settings or constants.
 * @param {Object} [settings] - Optional settings object.
 * @returns {Object} Tier min followers map.
 */
function getTierMinFollowers(settings) {
  if (settings?.tierMinFollowers) return settings.tierMinFollowers;
  return TIER_MIN_FOLLOWERS;
}

/**
 * Gets the current tier payments from settings or constants.
 * @param {Object} [settings] - Optional settings object.
 * @returns {Object} Tier payments matrix.
 */
function getTierPayments(settings) {
  if (settings?.tierPayments) return settings.tierPayments;
  return TIER_PAYMENTS;
}

/**
 * Gets the current revenue split from settings or constants.
 * @param {Object} [settings] - Optional settings object.
 * @returns {Object} Revenue split percentages.
 */
function getRevenueSplit(settings) {
  if (settings?.platformRevenuePercent !== undefined) {
    return {
      PLATFORM_PERCENT: settings.platformRevenuePercent,
      EARNER_PERCENT: 100 - settings.platformRevenuePercent,
    };
  }
  return REVENUE_SPLIT;
}

/**
 * Gets the current platform list from settings or constants.
 * @param {Object} [settings] - Optional settings object.
 * @returns {Array<string>} Platform list.
 */
function getPlatformList(settings) {
  if (settings?.platformList) return settings.platformList;
  return Object.values(PLATFORMS);
}

/**
 * Determines the tier for a given follower count.
 * @param {number} followerCount - The follower count.
 * @param {Object} [settings] - Optional settings object.
 * @returns {string|null} The tier key or null.
 */
export function getTierFromFollowers(followerCount, settings) {
  const minFollowers = getTierMinFollowers(settings);
  const tiers = getTiers(settings);
  const tierList = settings?.tierList || Object.values(tiers);

  // Sort tiers by min followers descending
  const sorted = tierList
    .map((t) => ({ name: t, min: minFollowers[t] || 0 }))
    .filter((t) => t.min > 0)
    .sort((a, b) => b.min - a.min);

  for (const tier of sorted) {
    if (followerCount >= tier.min) return tier.name;
  }
  return null;
}

/**
 * Gets the payment amount for a tier and platform.
    const normalizeUrl = (url) => url.replace(/\/+$/, '').toLowerCase();
    if (normalizeUrl(earner.profileUrl) !== normalizeUrl(submission.profileUrl)) {
      return {
        isMatch: false,
        reason: 'Profile URL does not match the verified account',
      };
    }
  }

  return { isMatch: true, reason: 'Verified account match confirmed' };
}

/**
 * Gets the minimum followers required for a tier.
 * @param {string} tier - The tier key.
 * @returns {number} Minimum follower count.
 */
export function getTierMinFollowers(tier) {
  return TIER_MIN_FOLLOWERS[tier] ?? 0;
}

/**
 * Validates that a platform is supported.
 * @param {string} platform - The platform name.
 * @returns {boolean} True if supported.
 */
export function isValidPlatform(platform) {
  return Object.values(PLATFORMS).includes(platform);
}

/**
 * Validates that a tier is valid.
 * @param {string} tier - The tier key.
 * @returns {boolean} True if valid.
 */
export function isValidTier(tier) {
  return Object.values(TIERS).includes(tier);
}

/**
 * Gets the next tier for an upgrade request.
 * @param {string} currentTier - The current tier.
 * @returns {string|null} The next tier or null if already at max.
 */
export function getNextTier(currentTier) {
  const order = [TIERS.TIER_1, TIERS.TIER_2, TIERS.TIER_3];
  const index = order.indexOf(currentTier);
  if (index === -1 || index === order.length - 1) return null;
  return order[index + 1];
}