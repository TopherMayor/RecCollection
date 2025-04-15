import React from 'react';
import { cn } from '../../../utils/classNames';

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  padding?: boolean;
  centered?: boolean;
}

/**
 * A responsive container component
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  maxWidth = 'lg',
  padding = true,
  centered = true,
}) => {
  const maxWidthClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
    none: '',
  };
  
  return (
    <div
      className={cn(
        maxWidthClasses[maxWidth],
        padding && 'px-4 sm:px-6',
        centered && 'mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Container;
