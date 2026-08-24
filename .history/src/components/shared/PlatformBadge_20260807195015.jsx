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
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function PlatformBadge({ platform, showName = true, size = 'md', className = '' }) {
  const Icon = getPlatformIcon(platform);
  const color = getPlatformColor(platform);

  return (
    <span className={`platform-badge platform-badge-${size} ${className}`}>
      <span className="platform-badge-icon" style={{ color }}>
        <Icon />
      </span>
      {showName && <span className="platform-badge-name">{platform}</span>}
    </span>
  );
}