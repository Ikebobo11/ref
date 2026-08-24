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
  // Tier must match exactly
  if (earner.tier !== task.followerTier) return false;

  // Platform must match exactly
  if (earner.verifiedPlatform !== task.platform) return false;

  return true;
}

/**
 * Checks if a submitted proof matches the earner's verified account.
 * @param {Object} earner - The earner with verified account details.
 * @param {Object} submission - The task submission with platform, username, profileUrl.
 * @returns {Object} Result with isMatch and reason.
 */
export function checkVerifiedAccountMatch(earner, submission) {
  if (!earner || !submission) {
    return { isMatch: false, reason: 'Missing earner or submission data' };
  }

  // Platform must match
  if (earner.verifiedPlatform !== submission.platform) {
    return {
      isMatch: false,
      reason: `Platform mismatch: verified on ${earner.verifiedPlatform} but submitted on ${submission.platform}`,
    };
  }

  // Username must match (case-insensitive, strip @ prefix)
  const verifiedUsername = (earner.verifiedUsername || '').replace(/^@/, '').toLowerCase();
  const submittedUsername = (submission.username || '').replace(/^@/, '').toLowerCase();

  if (verifiedUsername && submittedUsername && verifiedUsername !== submittedUsername) {
    return {
      isMatch: false,
      reason: `Username mismatch: verified as @${verifiedUsername} but submitted @${submittedUsername}`,
    };
  }

  // Profile URL must match if provided
  if (earner.profileUrl && submission.profileUrl) {
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