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
