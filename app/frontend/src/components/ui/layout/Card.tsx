import React from 'react';
import { cn } from '../../../utils/classNames';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect?: boolean;
  onClick?: () => void;
}

/**
 * A responsive card component for displaying content
 */
export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  shadow = 'md',
  border = true,
  rounded = 'md',
  hoverEffect = false,
  onClick,
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-2 sm:p-3',
    md: 'p-3 sm:p-4',
    lg: 'p-4 sm:p-6',
  };

  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'bg-white',
        paddingClasses[padding],
        shadowClasses[shadow],
        roundedClasses[rounded],
        border && 'border border-gray-200',
        hoverEffect && 'transition-all duration-200 hover:shadow-lg',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('mb-3 sm:mb-4', className)}>
      {children}
    </div>
  );
};

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className,
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200', className)}>
      {children}
    </div>
  );
};

export default Card;
