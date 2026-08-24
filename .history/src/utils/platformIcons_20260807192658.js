/**
 * LETCON - Platform Icon Mapping
 * Maps platform names to React Icons components.
 */
import {
  FaTiktok,
  FaInstagram,
  FaFacebookF,
  FaSnapchatGhost,
  FaYoutube,
  FaXTwitter,
} from 'react-icons/fa6';
import { PLATFORMS } from '../config/constants';

/** Map of platform names to icon components */
export const PLATFORM_ICON_MAP = {
  [PLATFORMS.TIKTOK]: FaTiktok,
  [PLATFORMS.INSTAGRAM]: FaInstagram,
  [PLATFORMS.FACEBOOK]: FaFacebookF,
  [PLATFORMS.SNAPCHAT]: FaSnapchatGhost,
  [PLATFORMS.YOUTUBE]: FaYoutube,
  [PLATFORMS.X]: FaXTwitter,
};

/**
 * Gets the icon component for a platform.
 * @param {string} platform - The platform name.
 * @returns {Function} The React icon component.
 */
export function getPlatformIcon(platform) {
  return PLATFORM_ICON_MAP[platform] || FaInstagram;
}

/**
 * Gets the brand color for a platform.
 * @param {string} platform - The platform name.
 * @returns {string} Hex color code.
 */
export function getPlatformColor(platform) {
  const colors = {
    [PLATFORMS.TIKTOK]: '#000000',
