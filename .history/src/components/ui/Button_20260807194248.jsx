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
