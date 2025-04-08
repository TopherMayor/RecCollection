import { InputHTMLAttributes, forwardRef } from 'react';

// Input props
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, className = '', ...props }, ref) => {
    // Base classes
    const baseClasses = 'rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500';
    
    // Error classes
    const errorClasses = error
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300';
    
    // Full width class
    const fullWidthClass = fullWidth ? 'w-full' : '';
    
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            ${baseClasses}
            ${errorClasses}
            ${fullWidthClass}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
