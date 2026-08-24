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
