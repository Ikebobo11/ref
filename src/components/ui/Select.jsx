/**
 * LETCON - Select Component
 * Reusable select dropdown with label and error support.
 */
import { forwardRef } from 'react';

/**
 * Select component.
 * @param {Object} props - Component props.
 * @param {string} [props.label] - Select label.
 * @param {string} [props.error] - Error message.
 * @param {Array<Object>} props.options - Array of { value, label } options.
 * @param {string} [props.placeholder] - Placeholder text.
 * @param {string} [props.className] - Additional CSS classes.
 */
const Select = forwardRef(function Select({
  label,
  error,
  options = [],
  placeholder = 'Select an option',
  className = '',
  id,
  ...rest
}, ref) {
  const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
        </label>
      )}
      <div className={`input-wrapper ${error ? 'input-error' : ''}`}>
        <select ref={ref} id={selectId} className="form-select" {...rest}>
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

export default Select;