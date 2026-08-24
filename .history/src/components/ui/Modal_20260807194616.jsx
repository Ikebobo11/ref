/**
 * LETCON - Modal Component
 * Reusable modal dialog with animations.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { FaXmark } from 'react-icons/fa6';

/**
 * Modal component.
 * @param {Object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {Function} props.onClose - Close handler.
 * @param {string} [props.title] - Modal title.
 * @param {React.ReactNode} props.children - Modal content.
 * @param {string} [props.size='md'] - Modal size: sm, md, lg, xl.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function Modal({ isOpen, onClose, title, children, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'modal-sm',
    md: 'modal-md',
    lg: 'modal-lg',
    xl: 'modal-xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`modal ${sizeClasses[size]} ${className}`}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
