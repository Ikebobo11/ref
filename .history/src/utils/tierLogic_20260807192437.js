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
