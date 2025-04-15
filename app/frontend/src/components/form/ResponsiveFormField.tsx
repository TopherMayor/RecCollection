import React from 'react';

interface ResponsiveFormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  isTextarea?: boolean;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  autoComplete?: string;
}

const ResponsiveFormField: React.FC<ResponsiveFormFieldProps> = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  isTextarea = false,
  rows = 3,
  min,
  max,
  step,
  pattern,
  autoComplete,
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label 
        htmlFor={id} 
        className="block text-sm sm:text-base font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {isTextarea ? (
        <textarea
          id={id}
          name={id}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
            error ? 'border-red-300' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          pattern={pattern}
          autoComplete={autoComplete}
          className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
            error ? 'border-red-300' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
      )}
      
      {error && (
        <p className="mt-1 text-xs sm:text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default ResponsiveFormField;
