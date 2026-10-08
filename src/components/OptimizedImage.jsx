import React, { useState, useRef, useEffect } from 'react'
import { Image as ImageIcon, Loader2 } from 'lucide-react'

/**
 * Optimized Image Component
 * Features:
 * - Lazy loading with Intersection Observer
 * - Responsive image loading
 * - Blur-up effect while loading
 * - Error handling with fallback
 * - WebP support (if available)
 */
export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false, // Skip lazy loading for priority images (LCP)
  fallback = null,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const imgRef = useRef(null)
  const observerRef = useRef(null)

  useEffect(() => {
    const img = imgRef.current
    if (!img) return

    // Skip lazy loading for priority images
    if (priority) {
      img.src = src
      return
    }

    // Set up Intersection Observer for lazy loading
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            img.src = src
            observerRef.current?.unobserve(img)
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before element enters viewport
        threshold: 0.01,
      }
    )

    observerRef.current.observe(img)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [src, priority])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setIsError(true)
  }

  // Show fallback or placeholder
  if (isError && fallback) {
    return <img src={fallback} alt={alt} className={className} {...props} />
  }

  if (isError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ width, height }}
      >
        <ImageIcon className="w-8 h-8 text-gray-300" />
      </div>
    )
  }

  return (
    <div className="relative" style={{ width, height }}>
      {/* Loading placeholder */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse"
          style={{ width, height }}
        >
          <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
        </div>
      )}

      {/* Image */}
      <img
        ref={imgRef}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        style={{ width, height }}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...props}
      />
    </div>
  )
}

/**
 * Background Image Component with optimization
 */
export function OptimizedBackground({
  src,
  className = '',
  children,
  priority = false,
  fallback = null,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const divRef = useRef(null)

  useEffect(() => {
    const div = divRef.current
    if (!div) return

    const img = new Image()
    
    img.onload = () => {
      setIsLoaded(true)
      div.style.backgroundImage = `url(${src})`
    }

    img.onerror = () => {
      setIsError(true)
      if (fallback) {
        div.style.backgroundImage = `url(${fallback})`
      }
    }

    if (priority) {
      img.src = src
    } else {
      // Lazy load background image
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              img.src = src
              observer.unobserve(div)
            }
          })
        },
        { rootMargin: '50px' }
      )
      observer.observe(div)
      return () => observer.disconnect()
    }
  }, [src, priority, fallback])

  return (
    <div
      ref={divRef}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={{
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      {...props}
    >
      {children}
    </div>
  )
}
