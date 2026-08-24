/**
 * LETCON - EmptyState Component
 * Reusable empty state placeholder with icon and action.
 */
import { motion } from 'framer-motion';

/**
 * EmptyState component.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} [props.icon] - Icon component.
 * @param {string} props.title - Empty state title.
 * @param {string} [props.message] - Empty state message.
 * @param {React.ReactNode} [props.action] - Action button/component.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function EmptyState({ icon, title, message, action, className = '' }) {
  return (
    <motion.div
      className={`empty-state ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      {message && <p className="empty-state-message">{message}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </motion.div>
  );
}