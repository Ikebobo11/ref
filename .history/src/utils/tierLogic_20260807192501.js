/**
 * LETCON - Tier & Revenue Logic
 * Core business rules for follower tiers, platform matching, and revenue splits.
 */
import {
  TIERS,
  TIER_MIN_FOLLOWERS,
  TIER_PAYMENTS,
  REVENUE_SPLIT,
  PLATFORMS,
} from '../config/constants';

/**
 * Determines the tier for a given follower count.
 * @param {number} followerCount - The follower count.
 * @returns {string} The tier key ('5K', '10K', or '15K').
 */
export function getTierFromFollowers(followerCount) {
  if (followerCount >= TIER_MIN_FOLLOWERS[TIERS.TIER_3]) return TIERS.TIER_3;
  if (followerCount >= TIER_MIN_FOLLOWERS[TIERS.TIER_2]) return TIERS.TIER_2;
  if (followerCount >= TIER_MIN_FOLLOWERS[TIERS.TIER_1]) return TIERS.TIER_1;
  return null;
}

/**
 * Gets the payment amount for a tier and platform.
 * @param {string} tier - The tier key ('5K', '10K', '15K').
 * @param {string} platform - The platform name.
 * @returns {number} The payment amount in naira.
 */
export function getTierPayment(tier, platform) {
  return TIER_PAYMENTS?.[tier]?.[platform] ?? 0;
}

/**
 * Calculates the revenue split for a task payment.
 * @param {number} taskAmount - The total task payment amount.
 * @returns {Object} Object with platformAmount and earnerAmount.
 */
export function calculateRevenueSplit(taskAmount) {
  const platformAmount = Math.round(
    (taskAmount * REVENUE_SPLIT.PLATFORM_PERCENT) / 100
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


