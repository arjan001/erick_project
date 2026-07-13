/**
 * Performance Monitoring Utility
 * Tracks Core Web Vitals and custom performance metrics
 */

// Performance metrics storage
const performanceMetrics = {
  pageLoad: null,
  apiResponse: [],
  customMetrics: new Map()
};

/**
 * Measure page load time
 */
export function measurePageLoad() {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  const timing = window.performance.timing;
  const navigation = window.performance.navigation;

  const metrics = {
    // Navigation timing
    dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
    tcpConnection: timing.connectEnd - timing.connectStart,
    serverResponse: timing.responseStart - timing.requestStart,
    domProcessing: timing.domComplete - timing.domInteractive,
    domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
    pageLoad: timing.loadEventEnd - timing.navigationStart,
    
    // Resource timing
    totalResources: window.performance.getEntriesByType('resource').length,
    
    // Navigation type
    navigationType: navigation.type,
    redirectCount: navigation.redirectCount
  };

  performanceMetrics.pageLoad = metrics;
  return metrics;
}

/**
 * Measure API response time
 * @param {string} endpoint - API endpoint
 * @param {Function} apiFunction - API function to measure
 * @returns {Promise<*>} - API response
 */
export async function measureAPIResponse(endpoint, apiFunction) {
  const startTime = performance.now();
  
  try {
    const result = await apiFunction();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    performanceMetrics.apiResponse.push({
      endpoint,
      duration,
      timestamp: Date.now(),
      success: true
    });
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    performanceMetrics.apiResponse.push({
      endpoint,
      duration,
      timestamp: Date.now(),
      success: false,
      error: error.message
    });
    
    throw error;
  }
}

/**
 * Measure Core Web Vitals
 */
export function measureCoreWebVitals() {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  const vitals = {
    // Largest Contentful Paint (LCP)
    lcp: null,
    
    // First Input Delay (FID)
    fid: null,
    
    // Cumulative Layout Shift (CLS)
    cls: null,
    
    // First Contentful Paint (FCP)
    fcp: null,
    
    // Time to First Byte (TTFB)
    ttfb: null
  };

  // Measure LCP
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.error('LCP measurement failed:', e);
    }

    // Measure FID
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        vitals.fid = entries[0].processingStart - entries[0].startTime;
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.error('FID measurement failed:', e);
    }

    // Measure CLS
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        vitals.cls = clsValue;
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.error('CLS measurement failed:', e);
    }

    // Measure FCP
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        vitals.fcp = entries[0].startTime;
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
    } catch (e) {
      console.error('FCP measurement failed:', e);
    }
  }

  // Measure TTFB
  const timing = window.performance.timing;
  vitals.ttfb = timing.responseStart - timing.navigationStart;

  return vitals;
}

/**
 * Track custom metric
 * @param {string} name - Metric name
 * @param {number} value - Metric value
 * @param {Object} metadata - Additional metadata
 */
export function trackMetric(name, value, metadata = {}) {
  performanceMetrics.customMetrics.set(name, {
    value,
    timestamp: Date.now(),
    metadata
  });
}

/**
 * Get all performance metrics
 * @returns {Object} - All collected metrics
 */
export function getPerformanceMetrics() {
  return {
    pageLoad: performanceMetrics.pageLoad,
    apiResponse: performanceMetrics.apiResponse,
    customMetrics: Object.fromEntries(performanceMetrics.customMetrics),
    coreWebVitals: measureCoreWebVitals()
  };
}

/**
 * Get API response statistics
 * @returns {Object} - API statistics
 */
export function getAPIStatistics() {
  const responses = performanceMetrics.apiResponse;
  
  if (responses.length === 0) {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      slowestEndpoint: null,
      fastestEndpoint: null
    };
  }

  const successful = responses.filter(r => r.success);
  const failed = responses.filter(r => !r.success);
  const durations = responses.map(r => r.duration);
  
  const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  
  const slowest = responses.reduce((prev, current) => 
    (prev.duration > current.duration) ? prev : current
  );
  
  const fastest = responses.reduce((prev, current) => 
    (prev.duration < current.duration) ? prev : current
  );

  return {
    totalRequests: responses.length,
    successfulRequests: successful.length,
    failedRequests: failed.length,
    successRate: (successful.length / responses.length) * 100,
    averageResponseTime: averageDuration,
    minResponseTime: minDuration,
    maxResponseTime: maxDuration,
    slowestEndpoint: slowest.endpoint,
    fastestEndpoint: fastest.endpoint,
    slowestResponseTime: slowest.duration,
    fastestResponseTime: fastest.duration
  };
}

/**
 * Check if performance meets targets
 * @returns {Object} - Performance check results
 */
export function checkPerformanceTargets() {
  const metrics = getPerformanceMetrics();
  const apiStats = getAPIStatistics();
  
  const targets = {
    pageLoadTime: 3000, // 3 seconds
    apiResponseTime: 500, // 500ms
    lcp: 2500, // 2.5 seconds
    fid: 100, // 100ms
    cls: 0.1
  };

  const results = {
    pageLoadTime: {
      target: targets.pageLoadTime,
      actual: metrics.pageLoad?.pageLoad,
      passed: metrics.pageLoad?.pageLoad <= targets.pageLoadTime
    },
    apiResponseTime: {
      target: targets.apiResponseTime,
      actual: apiStats.averageResponseTime,
      passed: apiStats.averageResponseTime <= targets.apiResponseTime
    },
    lcp: {
      target: targets.lcp,
      actual: metrics.coreWebVitals?.lcp,
      passed: metrics.coreWebVitals?.lcp <= targets.lcp
    },
    fid: {
      target: targets.fid,
      actual: metrics.coreWebVitals?.fid,
      passed: metrics.coreWebVitals?.fid <= targets.fid
    },
    cls: {
      target: targets.cls,
      actual: metrics.coreWebVitals?.cls,
      passed: metrics.coreWebVitals?.cls <= targets.cls
    }
  };

  const allPassed = Object.values(results).every(r => r.passed);

  return {
    allPassed,
    results
  };
}

/**
 * Log performance metrics to console
 */
export function logPerformanceMetrics() {
  const metrics = getPerformanceMetrics();
  const apiStats = getAPIStatistics();
  const targets = checkPerformanceTargets();

  console.group('📊 Performance Metrics');
  console.log('Page Load:', metrics.pageLoad);
  console.log('API Statistics:', apiStats);
  console.log('Core Web Vitals:', metrics.coreWebVitals);
  console.log('Performance Targets:', targets);
  console.groupEnd();
}

/**
 * Send metrics to analytics service (placeholder)
 * @param {Object} metrics - Metrics to send
 */
export function sendMetricsToAnalytics(metrics) {
  // In production, send to analytics service
  // Example: analytics.track('performance_metrics', metrics);
  console.log('Metrics sent to analytics:', metrics);
}

/**
 * Start performance monitoring
 */
export function startPerformanceMonitoring() {
  // Measure page load on window load
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        measurePageLoad();
        measureCoreWebVitals();
      }, 0);
    });
  }

  // Log metrics periodically
  setInterval(() => {
    const metrics = getPerformanceMetrics();
    sendMetricsToAnalytics(metrics);
  }, 60000); // Every minute
}

/**
 * Create performance decorator for functions
 * @param {string} metricName - Metric name
 * @returns {Function} - Decorator function
 */
export function withPerformanceTracking(metricName) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      const startTime = performance.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        trackMetric(`${metricName}_${propertyKey}`, duration, {
          success: true
        });
        
        return result;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        trackMetric(`${metricName}_${propertyKey}`, duration, {
          success: false,
          error: error.message
        });
        
        throw error;
      }
    };
    
    return descriptor;
  };
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  startPerformanceMonitoring();
}
