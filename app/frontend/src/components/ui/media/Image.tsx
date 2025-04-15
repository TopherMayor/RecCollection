import React from 'react';
import { cn } from '../../../utils/classNames';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

/**
 * A responsive image component with fallback
 */
export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  className,
  fallback = '/placeholder-image.jpg',
  aspectRatio,
  objectFit = 'cover',
  rounded = 'md',
  ...props
}) => {
  const [imgSrc, setImgSrc] = React.useState<string | undefined>(src);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  
  React.useEffect(() => {
    setImgSrc(src);
    setIsLoading(true);
    setError(false);
  }, [src]);
  
  const handleError = () => {
    setError(true);
    setImgSrc(fallback);
  };
  
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  const aspectRatioClasses = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-[16/9]',
    '21:9': 'aspect-[21/9]',
  };
  
  const objectFitClasses = {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down',
  };
  
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };
  
  return (
    <div className={cn(
      'relative overflow-hidden',
      aspectRatio && aspectRatioClasses[aspectRatio],
      roundedClasses[rounded],
      className
    )}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <svg 
            className="animate-spin h-8 w-8 text-gray-400" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
      
      <img
        src={imgSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          'w-full h-full',
          objectFitClasses[objectFit],
          roundedClasses[rounded],
          error && 'opacity-50',
          isLoading && 'opacity-0',
          !isLoading && 'opacity-100 transition-opacity duration-200'
        )}
        loading="lazy"
        {...props}
      />
    </div>
  );
};

export default Image;
