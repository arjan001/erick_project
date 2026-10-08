// Web Vitals reporting — compatible with web-vitals v5 API
// (v5 replaced getCLS/getFID/etc with onCLS/onINP/etc)
export function reportWebVitals(onPerfEntry) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    try {
      import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
        onCLS?.(onPerfEntry)
        onFCP?.(onPerfEntry)
 onLCP?.(onPerfEntry)
        onTTFB?.(onPerfEntry)
        onINP?.(onPerfEntry)
      }).catch(() => {})
    } catch {
      // web-vitals not available — silently skip
    }
  }
}

export function logWebVitals() {
  if (import.meta.env.DEV) {
    reportWebVitals((metric) => {
      
    })
  }
}