import { useState, useEffect, useRef } from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  sizes?: string;
}

export function Image({
  src,
  alt,
  fallbackSrc = '/images/placeholder.jpg',
  aspectRatio,
  objectFit = 'cover',
  sizes = '100vw',
  className,
  ...props
}: ImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setImgSrc(src);
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '200px', // Load images 200px before they come into view
    });
    
    observer.observe(imgRef.current);
    
    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);
  
  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  // Handle image error
  const handleError = () => {
    setError(true);
    setImgSrc(fallbackSrc);
  };
  
  // Generate srcSet for responsive images
  const generateSrcSet = (url: string) => {
    // Extract base URL and extension
    const lastDotIndex = url.lastIndexOf('.');
    if (lastDotIndex === -1) return url;
    
    const baseUrl = url.substring(0, lastDotIndex);
    const extension = url.substring(lastDotIndex);
    
    // Generate srcSet with different sizes
    return [
      `${baseUrl}-small${extension} 480w`,
      `${baseUrl}-medium${extension} 768w`,
      `${baseUrl}-large${extension} 1024w`,
      `${url} 1280w`,
    ].join(', ');
  };
  
  return (
    <div
      className={`relative overflow-hidden ${className || ''}`}
      style={{ aspectRatio: aspectRatio }}
    >
      {/* Placeholder/skeleton while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      )}
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={imgSrc || fallbackSrc}
        srcSet={imgSrc && !error ? generateSrcSet(imgSrc) : undefined}
        sizes={sizes}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ objectFit }}
        loading="lazy"
        {...props}
      />
    </div>
  );
}
