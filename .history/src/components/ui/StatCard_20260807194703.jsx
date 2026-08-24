/**
 * LETCON - StatCard Component
 * Displays a metric with icon, label, and value.
 */
import { motion } from 'framer-motion';

/**
 * StatCard component.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.icon - Icon component.
 * @param {string} props.label - Statistic label.
 * @param {string|number} props.value - Statistic value.
 * @param {string} [props.subtext] - Additional subtext.
 * @param {string} [props.color='primary'] - Accent color: primary, success, warning, danger, info.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function StatCard({ icon, label, value, subtext, color = 'primary', className = '' }) {
  const colorClasses = {
    primary: 'stat-primary',
    success: 'stat-success',
    warning: 'stat-warning',
    danger: 'stat-danger',
    info: 'stat-info',
  };

  return (
    <motion.div
      className={`stat-card ${colorClasses[color]} ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>
    </motion.div>
  );
}