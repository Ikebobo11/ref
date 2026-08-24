/**
 * LETCON - Card Component
 * Reusable card container with glassmorphism styling.
 */
import { motion } from 'framer-motion';

/**
 * Card component.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Card content.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {boolean} [props.hoverable=false] - Enable hover animation.
 * @param {Function} [props.onClick] - Click handler.
 */
export default function Card({ children, className = '', hoverable = false, onClick, ...rest }) {
  return (
    <motion.div
      className={`card ${hoverable ? 'card-hoverable' : ''} ${className}`}
      onClick={onClick}
      whileHover={hoverable ? { y: -4 } : undefined}
      transition={{ duration: 0.2 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Card Header component.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Header content.
 * @param {string} [props.className] - Additional CSS classes.
 */
export function CardHeader({ children, className = '' }) {
  return <div className={`card-header ${className}`}>{children}</div>;
}

/**
 * Card Title component.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Title content.
 */
export function CardTitle({ children }) {
  return <h3 className="card-title">{children}</h3>;
}

/**
 * Card Body component.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Body content.
 * @param {string} [props.className] - Additional CSS classes.
 */
export function CardBody({ children, className = '' }) {
