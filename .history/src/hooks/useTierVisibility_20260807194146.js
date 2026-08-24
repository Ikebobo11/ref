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
   * Checks if a task is visible to the current earner.
   * @param {Object} task - The task object.
   * @returns {boolean} True if visible.
   */
  const canSeeTask = useMemo(
    () => (task) => canEarnerSeeTask(earner, task),
    [earner]
  );

  /**
   * Filters a list of tasks to only those visible to the earner.
   * @param {Array<Object>} tasks - Array of tasks.
   * @returns {Array<Object>} Filtered tasks.
   */
  const filterVisibleTasks = useMemo(
    () => (tasks) => (tasks || []).filter((task) => canEarnerSeeTask(earner, task)),
    [earner]
  );

  return {
    earner,
    canSeeTask,
    filterVisibleTasks,
    tier: earner?.tier,
    platform: earner?.verifiedPlatform,
  };
}