/**
 * ImageWithLazyLoad Component
 * Lazy loads images with placeholder and fade-in effect
 */

import React, { useState, useRef, useEffect } from 'react';

const ImageWithLazyLoad = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = null,
  threshold = 0.1,
  onLoad = null,
  onError = null
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // Create Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    // Observe the image element
    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setHasError(true);
    if (onError) onError();
  };

  // Default placeholder
  const defaultPlaceholder = (
    <div className={`bg-gray-200 animate-pulse ${className}`} />
  );

  return (
    <div ref={imgRef} className="relative overflow-hidden">
      {/* Placeholder */}
      {!isLoaded && (placeholder || defaultPlaceholder)}
      
      {/* Actual Image */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          style={{ display: isLoaded ? 'block' : 'none' }}
        />
      )}
      
      {/* Error state */}
      {hasError && (
        <div className={`bg-gray-300 flex items-center justify-center ${className}`}>
          <span className="text-gray-500 text-sm">Image not available</span>
        </div>
      )}
    </div>
  );
};

export default ImageWithLazyLoad;
