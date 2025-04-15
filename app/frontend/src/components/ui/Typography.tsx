import React from 'react';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
type TextAlign = 'left' | 'center' | 'right';

interface TypographyProps {
  children: React.ReactNode;
  as?: HeadingLevel | 'p' | 'span' | 'div';
  size?: TextSize;
  weight?: TextWeight;
  align?: TextAlign;
  color?: string;
  className?: string;
  responsive?: boolean;
}

const getSizeClass = (size: TextSize, responsive: boolean): string => {
  if (!responsive) {
    return `text-${size}`;
  }

  switch (size) {
    case 'xs':
      return 'text-xs';
    case 'sm':
      return 'text-xs sm:text-sm';
    case 'base':
      return 'text-sm sm:text-base';
    case 'lg':
      return 'text-base sm:text-lg';
    case 'xl':
      return 'text-lg sm:text-xl';
    case '2xl':
      return 'text-xl sm:text-2xl';
    case '3xl':
      return 'text-2xl sm:text-3xl';
    case '4xl':
      return 'text-3xl sm:text-4xl';
    case '5xl':
      return 'text-4xl sm:text-5xl';
    default:
      return 'text-sm sm:text-base';
  }
};

const getWeightClass = (weight: TextWeight): string => {
  switch (weight) {
    case 'normal':
      return 'font-normal';
    case 'medium':
      return 'font-medium';
    case 'semibold':
      return 'font-semibold';
    case 'bold':
      return 'font-bold';
    default:
      return 'font-normal';
  }
};

const getAlignClass = (align: TextAlign): string => {
  switch (align) {
    case 'left':
      return 'text-left';
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    default:
      return 'text-left';
  }
};

export const Typography: React.FC<TypographyProps> = ({
  children,
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  align = 'left',
  color = 'text-gray-900',
  className = '',
  responsive = true,
}) => {
  const sizeClass = getSizeClass(size, responsive);
  const weightClass = getWeightClass(weight);
  const alignClass = getAlignClass(align);

  return (
    <Component className={`${sizeClass} ${weightClass} ${alignClass} ${color} ${className}`}>
      {children}
    </Component>
  );
};

export const Heading: React.FC<Omit<TypographyProps, 'as'> & { level: HeadingLevel }> = ({
  children,
  level = 'h2',
  size,
  weight = 'bold',
  align = 'left',
  color = 'text-gray-900',
  className = '',
  responsive = true,
}) => {
  // Default sizes based on heading level
  const defaultSize = (): TextSize => {
    switch (level) {
      case 'h1': return '3xl';
      case 'h2': return '2xl';
      case 'h3': return 'xl';
      case 'h4': return 'lg';
      case 'h5': return 'base';
      case 'h6': return 'sm';
      default: return 'xl';
    }
  };

  return (
    <Typography
      as={level}
      size={size || defaultSize()}
      weight={weight}
      align={align}
      color={color}
      className={className}
      responsive={responsive}
    >
      {children}
    </Typography>
  );
};

export const Text: React.FC<Omit<TypographyProps, 'as'>> = (props) => {
  return <Typography as="p" {...props} />;
};

export default Typography;
