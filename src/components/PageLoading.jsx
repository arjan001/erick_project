import React, { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

/**
 * Page Loading Component
 * Used as a fallback during route-based code splitting
 */
export default function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  )
}

/**
 * Wrapper component for lazy-loaded routes
 * Automatically handles Suspense with a loading fallback
 */
export function LazyRoute({ children, fallback = null }) {
  return (
    <Suspense fallback={fallback || <PageLoading />}>
      {children}
    </Suspense>
  )
}
