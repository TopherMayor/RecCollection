import React from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'light' | 'dark';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
}

interface LinkButtonProps extends Omit<ButtonProps, 'type' | 'onClick'> {
  to: string;
  external?: boolean;
}

const getVariantClasses = (variant: ButtonVariant): string => {
  switch (variant) {
    case 'primary':
      return 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500';
    case 'secondary':
      return 'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-500';
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500';
    case 'success':
      return 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500';
    case 'warning':
      return 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500';
    case 'info':
      return 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500';
    case 'light':
      return 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-300';
    case 'dark':
      return 'bg-gray-800 hover:bg-gray-900 text-white focus:ring-gray-700';
    default:
      return 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500';
  }
};

const getSizeClasses = (size: ButtonSize): string => {
  switch (size) {
    case 'xs':
      return 'px-2 py-1 text-xs';
    case 'sm':
      return 'px-2.5 py-1.5 text-xs sm:text-sm';
    case 'md':
      return 'px-3 sm:px-4 py-2 text-sm sm:text-base';
    case 'lg':
      return 'px-4 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg';
    default:
      return 'px-3 sm:px-4 py-2 text-sm sm:text-base';
  }
};

export const ResponsiveButton: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  isLoading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = false,
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);
  const widthClass = fullWidth ? 'w-full' : '';
  const roundedClass = rounded ? 'rounded-full' : 'rounded-md';
  const disabledClass = disabled || isLoading ? 'opacity-60 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${roundedClass} ${disabledClass} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {isLoading && loadingText ? loadingText : children}
      {!isLoading && icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </button>
  );
};

export const ResponsiveLinkButton: React.FC<LinkButtonProps> = ({
  children,
  to,
  external = false,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = false,
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);
  const widthClass = fullWidth ? 'w-full' : '';
  const roundedClass = rounded ? 'rounded-full' : 'rounded-md';
  const disabledClass = disabled || isLoading ? 'opacity-60 cursor-not-allowed' : '';

  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${roundedClass} ${disabledClass} ${className}`}
      >
        {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      </a>
    );
  }

  return (
    <Link
      to={to}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${roundedClass} ${disabledClass} ${className}`}
    >
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </Link>
  );
};

export default ResponsiveButton;
