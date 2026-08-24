/**
 * LETCON - useTierVisibility Hook
 * Enforces tier + platform task visibility for earners.
 */
import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { canEarnerSeeTask } from '../utils/tierLogic';

/**
 * Hook that provides tier and platform visibility helpers for earners.
 * @returns {Object} Visibility helpers.
 */
export function useTierVisibility() {
  const { userData } = useAuth();

  const earner = useMemo(() => {
    if (!userData) return null;
    return {
      uid: userData.uid,
      tier: userData.tier,
      verifiedPlatform: userData.verifiedPlatform,
      verifiedUsername: userData.verifiedUsername,
      profileUrl: userData.profileUrl,
      followerCount: userData.followerCount,
    };
  }, [userData]);

  /**
