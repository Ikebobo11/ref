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
