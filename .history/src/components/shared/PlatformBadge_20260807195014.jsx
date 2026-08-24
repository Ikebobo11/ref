/**
 * LETCON - PlatformBadge Component
 * Displays a platform icon with optional name.
 */
import { getPlatformIcon, getPlatformColor } from '../../utils/platformIcons';

/**
 * PlatformBadge component.
 * @param {Object} props - Component props.
 * @param {string} props.platform - The platform name.
 * @param {boolean} [props.showName=true] - Whether to show the platform name.
 * @param {string} [props.size='md'] - Badge size: sm, md, lg.
