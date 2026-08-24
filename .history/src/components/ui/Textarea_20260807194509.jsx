/**
 * LETCON - Textarea Component
 * Reusable textarea with label and error support.
 */
import { forwardRef } from 'react';

/**
 * Textarea component.
 * @param {Object} props - Component props.
 * @param {string} [props.label] - Textarea label.
 * @param {string} [props.error] - Error message.
 * @param {string} [props.helperText] - Helper text below textarea.
 * @param {string} [props.className] - Additional CSS classes.
 */
const Textarea = forwardRef(function Textarea({
  label,
  error,
  helperText,
