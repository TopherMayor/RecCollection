import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select' | 'url' | 'email' | 'password';
  value: string | number | undefined;
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
}

export default function FormField({
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
}: FormFieldProps) {
  const baseInputClassName = `mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${inputClassName}`;
  const baseLabelClassName = `block text-sm font-medium text-gray-700 ${labelClassName}`;
  
  return (
    <div className={`${className}`}>
      <label htmlFor={id} className={baseLabelClassName}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={id}
          name={id}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={baseInputClassName}
          rows={4}
        />
      ) : type === 'select' ? (
        <select
          id={id}
          name={id}
          value={value || ''}
          onChange={onChange}
          required={required}
          className={baseInputClassName}
        >
          {children}
        </select>
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          step={step}
          className={baseInputClassName}
        />
      )}
      
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
