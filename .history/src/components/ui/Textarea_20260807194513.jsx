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
  className = '',
  id,
  rows = 4,
  ...rest
}, ref) {
  const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`form-textarea ${error ? 'input-error' : ''}`}
        {...rest}
      />
      {error && <span className="form-error">{error}</span>}
      {!error && helperText && <span className="form-helper">{helperText}</span>}
    </div>
  );
});

export default Textarea;