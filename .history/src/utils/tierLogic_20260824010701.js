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
import { getCachedSettings } from '../services/settingsService';

/**
 * Resolves the effective settings: explicit argument, or cached app settings.
 * @param {Object} [settings] - Optional settings override.
 * @returns {Object} Settings object.
 */
function _resolveSettings(settings) {
  return settings || getCachedSettings();
}

/**
 * Gets the current tier definitions from settings or constants.
 * @param {Object} [settings] - Optional settings object from SettingsContext.
 * @returns {Object} Tier definitions.
 */
function _getTiersMap(settings) {
  const s = _resolveSettings(settings);
  if (s?.tierList && s?.tierMinFollowers) {
    const tiers = {};
    s.tierList.forEach((t, i) => {
      tiers[`TIER_${i + 1}`] = t;
    });
    return tiers;
  }
  return TIERS;

/**
 * Gets the current tier payments from settings or constants.
 * @param {Object} [settings] - Optional settings object.
 * @returns {Object} Tier payments matrix.
 */
function _getTierPaymentsMap(settings) {
  if (settings?.tierPayments) return settings.tierPayments;
  return TIER_PAYMENTS;
}

/**
 * Gets the current revenue split from settings or constants.
 * @param {Object} [settings] - Optional settings object.
 * @returns {Object} Revenue split percentages.
 */
function _getRevenueSplitMap(settings) {
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
function _getPlatformListArr(settings) {
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
  const minFollowers = _getTierMinFollowersMap(settings);
  const tiers = _getTiersMap(settings);
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
 * @param {string} tier - The tier key/name.
 * @param {string} platform - The platform name.
 * @param {Object} [settings] - Optional settings object.
 * @returns {number} The payment amount in naira.
 */
export function getTierPayment(tier, platform, settings) {
  const payments = _getTierPaymentsMap(settings);
  return payments?.[tier]?.[platform] ?? 0;
}

/**
 * Calculates the revenue split for a task payment.
 * @param {number} taskAmount - The total task payment amount.
 * @param {Object} [settings] - Optional settings object.
 * @returns {Object} Object with platformAmount and earnerAmount.
 */
export function calculateRevenueSplit(taskAmount, settings) {
  const split = _getRevenueSplitMap(settings);
  const platformAmount = Math.round(
    (taskAmount * split.PLATFORM_PERCENT) / 100
  );
  const earnerAmount = taskAmount - platformAmount;
  return { platformAmount, earnerAmount };
}

/**
 * Checks if an earner can see a task based on tier and platform.
 * @param {Object} earner - The earner object with tier and verifiedPlatform.
 * @param {Object} task - The task object with followerTier and platform.
 * @returns {boolean} True if the earner can see the task.
 */
export function canEarnerSeeTask(earner, task) {
  if (!earner || !task) return false;
  if (!earner.tier || !earner.verifiedPlatform) return false;
  if (!task.followerTier || !task.platform) return false;

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
 * @param {string} tier - The tier key/name.
 * @param {Object} [settings] - Optional settings object.
 * @returns {number} Minimum follower count.
 */
export function getTierMinFollowers(tier, settings) {
  const minFollowers = _getTierMinFollowersMap(settings);
  return minFollowers[tier] ?? 0;
}

/**
 * Validates that a platform is supported.
 * @param {string} platform - The platform name.
 * @param {Object} [settings] - Optional settings object.
 * @returns {boolean} True if supported.
 */
export function isValidPlatform(platform, settings) {
  const platforms = _getPlatformListArr(settings);
  return platforms.includes(platform);
}

/**
 * Validates that a tier is valid.
 * @param {string} tier - The tier key/name.
 * @param {Object} [settings] - Optional settings object.
 * @returns {boolean} True if valid.
 */
export function isValidTier(tier, settings) {
  const tierList = settings?.tierList || Object.values(TIERS);
  return tierList.includes(tier);
}

/**
 * Gets the next tier for an upgrade request.
 * @param {string} currentTier - The current tier.
 * @param {Object} [settings] - Optional settings object.
 * @returns {string|null} The next tier or null if already at max.
 */
export function getNextTier(currentTier, settings) {
  const tierList = settings?.tierList || Object.values(TIERS);
  const index = tierList.indexOf(currentTier);
  if (index === -1 || index === tierList.length - 1) return null;
  return tierList[index + 1];
}