/**
 * LETCON - Input Component
 * Reusable form input with label, error, and icon support.
 */
import { forwardRef } from 'react';

/**
 * Input component.
 * @param {Object} props - Component props.
 * @param {string} [props.label] - Input label.
 * @param {string} [props.error] - Error message.
 * @param {React.ReactNode} [props.icon] - Leading icon.
 * @param {React.ReactNode} [props.rightIcon] - Trailing icon (e.g. password toggle).
 * @param {string} [props.helperText] - Helper text below input.
 * @param {string} [props.className] - Additional CSS classes.
 */
const Input = forwardRef(function Input({
  label,
  error,
  icon,
  rightIcon,
  helperText,
  className = '',
  id,
  ...rest
}, ref) {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div className={`input-wrapper ${error ? 'input-error' : ''}`}>
        {icon && <span className="input-icon">{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          className={`form-input ${icon ? 'has-icon' : ''} ${rightIcon ? 'has-right-icon' : ''}`}
          {...rest}
        />
        {rightIcon && <span className="input-right-icon">{rightIcon}</span>}
      </div>
  );
});

export default Input;