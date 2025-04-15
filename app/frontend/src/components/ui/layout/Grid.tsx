import React from 'react';
import { cn } from '../../../utils/classNames';

type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    xs?: GridColumns;
    sm?: GridColumns;
    md?: GridColumns;
    lg?: GridColumns;
    xl?: GridColumns;
  };
  gap?: GridGap;
  rowGap?: GridGap;
  colGap?: GridGap;
}

/**
 * A responsive grid component
 */
export const Grid: React.FC<GridProps> = ({
  children,
  className,
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  gap = 'md',
  rowGap,
  colGap,
}) => {
  const getColumnsClass = () => {
    const classes = [];
    
    if (cols.xs) classes.push(`grid-cols-${cols.xs}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    
    return classes.join(' ');
  };
  
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };
  
  const rowGapClasses = {
    none: 'row-gap-0',
    xs: 'row-gap-1',
    sm: 'row-gap-2',
    md: 'row-gap-4',
    lg: 'row-gap-6',
    xl: 'row-gap-8',
  };
  
  const colGapClasses = {
    none: 'col-gap-0',
    xs: 'col-gap-1',
    sm: 'col-gap-2',
    md: 'col-gap-4',
    lg: 'col-gap-6',
    xl: 'col-gap-8',
  };
  
  return (
    <div
      className={cn(
        'grid',
        getColumnsClass(),
        !rowGap && !colGap && gapClasses[gap],
        rowGap && rowGapClasses[rowGap],
        colGap && colGapClasses[colGap],
        className
      )}
    >
      {children}
    </div>
  );
};

export default Grid;
