import * as Sentry from '@sentry/react';

// Initialize Sentry for error tracking and performance monitoring
// Note: Set SENTRY_DSN in your .env file to enable Sentry
// Example: VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id

if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      new Sentry.BrowserTracing({
        // Set tracing sample rate to 1.0 to capture 100% of transactions
        // for performance monitoring. Adjust this value in production
        tracesSampleRate: 0.1,
      }),
      new Sentry.Replay({
        // Capture 10% of all sessions for replay
        sessionSampleRate: 0.1,
        // Capture 100% of sessions with an error
        errorSampleRate: 1.0,
      }),
    ],
    // Set release version for better error tracking
    release: `studio22@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
    
    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data from events
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      return event;
    },
    
    // Ignore specific errors
    ignoreErrors: [
      // Ignore network errors that are not critical
      'Network Error',
      'Failed to fetch',
      // Ignore browser extension errors
      'Non-Error promise rejection captured',
    ],
    
    // Performance monitoring
    beforeSendTransaction(transaction) {
      // Filter out slow transactions that are not critical
      return transaction;
    },
  });
  
  console.log('Sentry initialized for error tracking');
} else {
  console.log('Sentry not initialized: running in development or DSN not configured');
}

export default Sentry;
