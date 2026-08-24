/**
 * LETCON - PageHeader Component
 * Reusable page header with title, subtitle, and actions.
 */
import { motion } from 'framer-motion';

/**
 * PageHeader component.
 * @param {Object} props - Component props.
 * @param {string} props.title - Page title.
 * @param {string} [props.subtitle] - Page subtitle.
 * @param {React.ReactNode} [props.actions] - Action buttons/links.
 * @param {React.ReactNode} [props.icon] - Optional icon.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function PageHeader({ title, subtitle, actions, icon, className = '' }) {
  return (
    <motion.div
      className={`page-header ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header-left">
        {icon && <div className="page-header-icon">{icon}</div>}
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </motion.div>
  );
}