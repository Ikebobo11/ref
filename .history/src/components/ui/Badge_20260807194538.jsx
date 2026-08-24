/**
 * LETCON - Badge Component
 * Reusable status badge with color variants.
 */

/**
 * Badge component.
 * @param {Object} props - Component props.
 * @param {string} [props.variant='default'] - Badge variant: default, success, warning, danger, info, primary.
 * @param {React.ReactNode} props.children - Badge content.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function Badge({ variant = 'default', children, className = '' }) {
  const variantClasses = {
    default: 'badge-default',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    primary: 'badge-primary',
  };

  return (
