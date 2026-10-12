/**
 * Centralized Error Handler for SmartGigs Kenya
 *
 * This utility provides consistent error handling across all components.
 * It standardizes error logging, user feedback, and error categorization.
 *
 * @module errorHandler
 *
 * @example
 * import { handleError, withErrorHandling } from '@/lib/errorHandler'
 *
 * // Simple error handling
 * try {
 *   await someOperation()
 * } catch (error) {
 *   handleError(error, 'ComponentName', 'Operation description')
 * }
 *
 * // Wrapper for async functions
 * const result = await withErrorHandling(
 *   async () => await someOperation(),
 *   'ComponentName',
 * )
 */
import React from 'react'

/**
 * Error categories for better organization
 * @readonly
 * @enum {string}
 */
export const ErrorCategory = {
  NETWORK: 'network',
  DATABASE: 'database',
  AUTH: 'auth',
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  NOT_FOUND: 'not_found',
  UNKNOWN: 'unknown',
}

/**
 * Error severity levels
 * @readonly
 * @enum {string}
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
}

/**
 * Error categories for better organization
 */
export const ErrorCategory = {
  NETWORK: 'network',
  DATABASE: 'database',
  AUTH: 'auth',
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  NOT_FOUND: 'not_found',
  UNKNOWN: 'unknown',
}

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  LOW: 'low', // Non-critical, can be ignored
  MEDIUM: 'medium', // Affects UX but doesn't block functionality
  HIGH: 'high', // Blocks functionality, needs user attention
  CRITICAL: 'critical', // System-breaking error
}

/**
 * Categorize an error based on its properties
 *
 * @param {Error} error - The error object
 * @returns {keyof ErrorCategory} The error category
 *
 * @example
 * categorizeError(new Error('fetch failed')) // 'network'
 * categorizeError({ code: 'PGRST116' }) // 'not_found'
 */
// Network errors
if (error.message?.includes('fetch') || error.message?.includes('network')) {
  return ErrorCategory.NETWORK
}

// Database errors
if (error.code?.startsWith('PGRST') || error.message?.includes('database')) {
  return ErrorCategory.DATABASE
}

// Auth errors
if (error.message?.includes('auth') || error.message?.includes('unauthorized')) {
  return ErrorCategory.AUTH
}

// Permission errors
if (error.message?.includes('permission') || error.message?.includes('forbidden')) {
  return ErrorCategory.PERMISSION
}

// Not found errors
if (error.message?.includes('not found') || error.code === 'PGRST116') {
  return ErrorCategory.NOT_FOUND
}

// Validation errors
if (error.message?.includes('validation') || error.message?.includes('invalid')) {
  return ErrorCategory.VALIDATION
}

return ErrorCategory.UNKNOWN
}

/**
 * Determine error severity based on category and message
 *
 * @param {Error} error - The error object
 * @param {keyof ErrorCategory} category - The error category
 * @returns {keyof ErrorSeverity} The error severity
 */
// Critical errors
if (category === ErrorCategory.AUTH && error.message?.includes('session')) {
  return ErrorSeverity.CRITICAL
}

// High severity
if (
  category === ErrorCategory.PERMISSION ||
  category === ErrorCategory.DATABASE ||
  error.message?.includes('column') ||
  error.message?.includes('table')
) {
  return ErrorSeverity.HIGH
}

// Medium severity
if (
  category === ErrorCategory.NETWORK ||
  category === ErrorCategory.VALIDATION
) {
  return ErrorSeverity.MEDIUM
}

// Low severity
if (category === ErrorCategory.NOT_FOUND) {
  return ErrorSeverity.LOW
}

return ErrorSeverity.MEDIUM
}

/**
 * Get a user-friendly error message
 *
 * @param {Error} error - The error object
 * @param {keyof ErrorCategory} category - The error category
 * @returns {string} User-friendly message
 */
switch (category) {
  case ErrorCategory.NETWORK:
    return 'Network error. Please check your connection and try again.'

  case ErrorCategory.DATABASE:
    if (error.message?.includes('column')) {
      return 'A data error occurred. Please try again or contact support.'
    }
    if (error.message?.includes('table')) {
      return 'Service temporarily unavailable. Please try again later.'
    }
    return 'Unable to save data. Please try again.'

  case ErrorCategory.AUTH:
    if (error.message?.includes('session')) {
      return 'Your session has expired. Please log in again.'
    }
    return 'Authentication error. Please log in and try again.'

  case ErrorCategory.PERMISSION:
    return 'You do not have permission to perform this action.'

  case ErrorCategory.NOT_FOUND:
    return 'The requested resource was not found.'

  case ErrorCategory.VALIDATION:
    return 'Please check your input and try again.'

  default:
    return 'An unexpected error occurred. Please try again.'
}
}

/**
 * Log error with context information
 *
 * @param {Error} error - The error object
 * @param {string} component - The component name
 * @param {string} operation - The operation being performed
 * @param {object} [context={}] - Additional context data
 */
const category = categorizeError(error)
const severity = getErrorSeverity(error, category)

const logData = {
  timestamp: new Date().toISOString(),
  component,
  operation,
  category,
  severity,
  message: error.message,
  code: error.code,
  stack: error.stack,
  context,
}

// Log based on severity
switch (severity) {
  case ErrorSeverity.CRITICAL:
  case ErrorSeverity.HIGH:
    console.error('[Error Handler]', logData)
    break
  case ErrorSeverity.MEDIUM:
    console.warn('[Error Handler]', logData)
    break
  case ErrorSeverity.LOW:
    console.log('[Error Handler]', logData)
    break
}

// In production, you might want to send this to an error tracking service
// like Sentry, LogRocket, or a custom logging endpoint
if (import.meta.env.PROD && severity !== ErrorSeverity.LOW) {
  // Example: sendToErrorTracking(logData)
}
}

/**
 * Handle an error with logging and optional user feedback
 *
 * @param {Error} error - The error object
 * @param {string} component - The component name
 * @param {string} operation - The operation being performed
 * @param {object} [options={}] - Additional options
 * @param {Function} [options.onError] - Callback for custom error handling
 * @param {boolean} [options.silent=false] - If true, don't log to console
 * @param {object} [options.context={}] - Additional context data
 * @returns {{error: Error, category: keyof ErrorCategory, severity: keyof ErrorSeverity, userMessage: string}} Error information
 */
const {
  onError,
  silent = false,
  context = {},
} = options

const category = categorizeError(error)
const severity = getErrorSeverity(error, category)
const userMessage = getUserMessage(error, category)

// Log error
if (!silent) {
  logError(error, component, operation, context)
}

// Call custom error handler if provided
if (onError) {
  onError(error, {
    category,
    severity,
    userMessage,
  })
}

return {
  error,
  category,
  severity,
  userMessage,
}
}

/**
 * Wrapper for async functions with automatic error handling
 *
 * @template T
 * @param {() => Promise<T>} fn - The async function to wrap
 * @param {string} component - The component name
 * @param {object} [options={}] - Additional options
 * @param {string} [options.operation='Async operation'] - The operation description
 * @returns {Promise<T>} Promise that resolves with result or rejects with error
 */
const { operation = 'Async operation', ...rest } = options

try {
  return await fn()
} catch (error) {
  handleError(error, component, operation, rest)
  throw error
}
}

/**
 * Create a higher-order component for error boundaries
 *
 * @template {React.ComponentType} T
 * @param {T} WrappedComponent - The component to wrap
 * @param {string} componentName - The component name
 * @returns {React.ComponentType<React.ComponentProps<T>>} The wrapped component
 */
return function ErrorBoundaryWrapper(props) {
  return (
    <ErrorBoundary componentName={componentName}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  )
}
}

/**
 * React Error Boundary component
 * This catches JavaScript errors in component trees
 *
 * @extends {React.Component<{componentName?: string, children: React.ReactNode}, {hasError: boolean, error: Error | null}>}
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    handleError(
      error,
      this.props.componentName || 'ErrorBoundary',
      'Render error',
      { errorInfo }
    )
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-red-600">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Default export
 */
export default {
  handleError,
  withErrorHandling,
  withErrorBoundary,
  ErrorBoundary,
  categorizeError,
  getErrorSeverity,
  getUserMessage,
  logError,
  ErrorCategory,
  ErrorSeverity,
}
