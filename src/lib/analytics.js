import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function reportWebVitals(onPerfEntry) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
}

// Log Web Vitals to console in development
export function logWebVitals() {
  if (import.meta.env.DEV) {
    reportWebVitals((metric) => {
      console.log(`[Web Vitals] ${metric.name}:`, metric.value, metric.rating);
    });
  }
}
