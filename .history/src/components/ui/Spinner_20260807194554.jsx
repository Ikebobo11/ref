/**
 * LETCON - Spinner Component
 * Loading spinner with size variants.
 */
import { FaSpinner } from 'react-icons/fa6';

/**
 * Spinner component.
 * @param {Object} props - Component props.
 * @param {string} [props.size='md'] - Spinner size: sm, md, lg.
 * @param {string} [props.label] - Accessible label.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function Spinner({ size = 'md', label = 'Loading...', className = '' }) {
  const sizeClasses = {
    sm: 'spinner-sm',
    md: 'spinner-md',
    lg: 'spinner-lg',
  };

  return (
    <div className={`spinner-container ${className}`} role="status" aria-label={label}>
      <FaSpinner className={`spinner ${sizeClasses[size]}`} />
      <span className="spinner-label">{label}</span>
    </div>
  );
}