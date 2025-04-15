import React from 'react';
import { cn } from '../../../utils/classNames';

export interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select' | 'url' | 'email' | 'password' | 'checkbox' | 'radio';
  value: string | number | boolean | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  children?: React.ReactNode;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  readOnly?: boolean;
  rows?: number;
}

/**
 * A responsive form field component that can render different input types
 */
export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  min,
  max,
  step,
  className = '',
  labelClassName = '',
  inputClassName = '',
  children,
  error,
  helpText,
  disabled = false,
  readOnly = false,
  rows = 4,
}) => {
  const baseInputClassName = cn(
    "mt-1 block w-full border rounded-md shadow-sm text-xs sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500",
    error ? "border-red-300" : "border-gray-300",
    disabled ? "bg-gray-100 cursor-not-allowed" : "",
    readOnly ? "bg-gray-50 cursor-default" : "",
    inputClassName
  );
  
  const baseLabelClassName = cn(
    "block text-xs sm:text-sm font-medium",
    error ? "text-red-700" : "text-gray-700",
    disabled ? "opacity-70" : "",
    labelClassName
  );
  
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={id}
            name={id}
            value={value as string || ''}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={cn(baseInputClassName, "py-1.5 sm:py-2 px-2 sm:px-3")}
            rows={rows}
            disabled={disabled}
            readOnly={readOnly}
          />
        );
      case 'select':
        return (
          <select
            id={id}
            name={id}
            value={value as string || ''}
            onChange={onChange}
            required={required}
            className={cn(baseInputClassName, "py-1.5 sm:py-2 px-2 sm:px-3")}
            disabled={disabled}
          >
            {children}
          </select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              id={id}
              name={id}
              type="checkbox"
              checked={Boolean(value)}
              onChange={onChange}
              required={required}
              className={cn(
                "h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500",
                disabled ? "opacity-70 cursor-not-allowed" : "",
                inputClassName
              )}
              disabled={disabled}
              readOnly={readOnly}
            />
            <label htmlFor={id} className={cn("ml-2", baseLabelClassName)}>
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          </div>
        );
      case 'radio':
        return (
          <div className="flex items-center">
            <input
              id={id}
              name={id}
              type="radio"
              checked={Boolean(value)}
              onChange={onChange}
              required={required}
              className={cn(
                "h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500",
                disabled ? "opacity-70 cursor-not-allowed" : "",
                inputClassName
              )}
              disabled={disabled}
              readOnly={readOnly}
            />
            <label htmlFor={id} className={cn("ml-2", baseLabelClassName)}>
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          </div>
        );
      default:
        return (
          <input
            id={id}
            name={id}
            type={type}
            value={value as string || ''}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            min={min}
            max={max}
            step={step}
            className={cn(baseInputClassName, "py-1.5 sm:py-2 px-2 sm:px-3")}
            disabled={disabled}
            readOnly={readOnly}
          />
        );
    }
  };
  
  return (
    <div className={cn("mb-3 sm:mb-4", className)}>
      {type !== 'checkbox' && type !== 'radio' && (
        <label htmlFor={id} className={baseLabelClassName}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {renderInput()}
      
      {helpText && !error && (
        <p className="mt-1 text-xs sm:text-sm text-gray-500">{helpText}</p>
      )}
      
      {error && (
        <p className="mt-1 text-xs sm:text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormField;
