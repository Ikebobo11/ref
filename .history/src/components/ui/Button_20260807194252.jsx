/**
 * LETCON - Button Component
 * Reusable button with variants, sizes, and loading states.
 */
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa6';

/**
 * Button component.
 * @param {Object} props - Component props.
 * @param {string} [props.variant='primary'] - Button variant: primary, secondary, outline, danger, success, ghost.
 * @param {string} [props.size='md'] - Button size: sm, md, lg.
 * @param {boolean} [props.loading=false] - Show loading spinner.
 * @param {boolean} [props.fullWidth=false] - Make button full width.
 * @param {React.ReactNode} props.children - Button content.
 * @param {Function} [props.onClick] - Click handler.
 * @param {string} [props.type='button'] - Button type.
 * @param {boolean} [props.disabled=false] - Disabled state.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  ...rest
}) {
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  };

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    danger: 'btn-danger',
    success: 'btn-success',
    ghost: 'btn-ghost',
  };

  return (
    <motion.button
      type={type}
      className={`btn ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'btn-full' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      {...rest}
    >
      {loading && <FaSpinner className="btn-spinner" />}
      {children}
    </motion.button>
  );
}