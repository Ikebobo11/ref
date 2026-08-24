/**
 * LETCON - Logo Component
 * Brand logo with icon and text.
 */
import { FaBullhorn } from 'react-icons/fa6';
import { APP_NAME } from '../../config/constants';

/**
 * Logo component.
 * @param {Object} props - Component props.
 * @param {string} [props.size='md'] - Logo size: sm, md, lg.
 * @param {boolean} [props.showText=true] - Whether to show the text.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function Logo({ size = 'md', showText = true, className = '' }) {
  const sizeClasses = {
    sm: 'logo-sm',
    md: 'logo-md',
    lg: 'logo-lg',
  };

  return (
    <div className={`logo ${sizeClasses[size]} ${className}`}>
      <div className="logo-icon">
        <FaBullhorn />
      </div>
      {showText && <span className="logo-text">{APP_NAME}</span>}
    </div>
  );
}