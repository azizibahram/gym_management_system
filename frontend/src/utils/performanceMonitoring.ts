/**
 * Performance Monitoring Utilities
 * Track Core Web Vitals and custom performance metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

/**
 * Core Web Vitals thresholds
 */
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 },   // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
  INP: { good: 200, poor: 500 },   // Interaction to Next Paint
};

/**
 * Get rating based on value and thresholds
 */
const getRating = (
  value: number,
  thresholds: { good: number; poor: number }
): 'good' | 'needs-improvement' | 'poor' => {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
};

/**
 * Report metric to console (can be extended to send to analytics)
 */
const reportMetric = (metric: PerformanceMetric): void => {
  console.log(`[Performance] ${metric.name}:`, {
    value: metric.value,
    rating: metric.rating,
    timestamp: new Date(metric.timestamp).toISOString(),
  });

  // TODO: Send to analytics service
  // Example: sendToAnalytics(metric);
};

/**
 * Measure Largest Contentful Paint (LCP)
 */
export const measureLCP = (): void => {
  if (!('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };

    const value = lastEntry.renderTime || lastEntry.loadTime || 0;
    reportMetric({
      name: 'LCP',
      value,
      rating: getRating(value, THRESHOLDS.LCP),
      timestamp: Date.now(),
    });
  });

  observer.observe({ entryTypes: ['largest-contentful-paint'] });
};

/**
 * Measure First Input Delay (FID)
 */
export const measureFID = (): void => {
  if (!('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      const fidEntry = entry as PerformanceEntry & { processingStart?: number };
      const value = fidEntry.processingStart ? fidEntry.processingStart - entry.startTime : 0;
      
      reportMetric({
        name: 'FID',
        value,
        rating: getRating(value, THRESHOLDS.FID),
        timestamp: Date.now(),
      });
    });
  });

  observer.observe({ entryTypes: ['first-input'] });
};

/**
 * Measure Cumulative Layout Shift (CLS)
 */
export const measureCLS = (): void => {
  if (!('PerformanceObserver' in window)) return;

  let clsValue = 0;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
      if (!layoutShiftEntry.hadRecentInput) {
        clsValue += layoutShiftEntry.value || 0;
      }
    });

    reportMetric({
      name: 'CLS',
      value: clsValue,
      rating: getRating(clsValue, THRESHOLDS.CLS),
      timestamp: Date.now(),
    });
  });

  observer.observe({ entryTypes: ['layout-shift'] });
};

/**
 * Measure First Contentful Paint (FCP)
 */
export const measureFCP = (): void => {
  if (!('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      reportMetric({
        name: 'FCP',
        value: entry.startTime,
        rating: getRating(entry.startTime, THRESHOLDS.FCP),
        timestamp: Date.now(),
      });
    });
  });

  observer.observe({ entryTypes: ['paint'] });
};

/**
 * Measure Time to First Byte (TTFB)
 */
export const measureTTFB = (): void => {
  if (!window.performance || !window.performance.timing) return;

  const { responseStart, requestStart } = window.performance.timing;
  const value = responseStart - requestStart;

  reportMetric({
    name: 'TTFB',
    value,
    rating: getRating(value, THRESHOLDS.TTFB),
    timestamp: Date.now(),
  });
};

/**
 * Measure page load time
 */
export const measurePageLoadTime = (): void => {
  window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

    console.log('[Performance] Page Load Time:', pageLoadTime, 'ms');
  });
};

/**
 * Measure Time to Interactive (TTI)
 */
export const measureTTI = (): void => {
  if (!window.performance) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = window.performance.timing;
      const tti = perfData.domInteractive - perfData.navigationStart;

      console.log('[Performance] Time to Interactive:', tti, 'ms');
    }, 0);
  });
};

/**
 * Get current performance metrics
 */
export const getPerformanceMetrics = () => {
  if (!window.performance) return null;

  const perfData = window.performance.timing;
  const navigation = window.performance.navigation;

  return {
    // Navigation timing
    navigationStart: perfData.navigationStart,
    redirectTime: perfData.redirectEnd - perfData.redirectStart,
    dnsTime: perfData.domainLookupEnd - perfData.domainLookupStart,
    tcpTime: perfData.connectEnd - perfData.connectStart,
    requestTime: perfData.responseEnd - perfData.requestStart,
    responseTime: perfData.responseEnd - perfData.responseStart,
    
    // Page load timing
    domLoadTime: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
    pageLoadTime: perfData.loadEventEnd - perfData.navigationStart,
    
    // Interactive timing
    domInteractive: perfData.domInteractive - perfData.navigationStart,
    domComplete: perfData.domComplete - perfData.navigationStart,
    
    // Navigation type
    navigationType: navigation.type,
    redirectCount: navigation.redirectCount,
  };
};

/**
 * Initialize all performance monitoring
 */
export const initPerformanceMonitoring = (): void => {
  if (typeof window === 'undefined') return;

  // Measure Core Web Vitals
  measureLCP();
  measureFID();
  measureCLS();
  measureFCP();
  measureTTFB();
  measurePageLoadTime();
  measureTTI();

  // Log performance metrics on page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      const metrics = getPerformanceMetrics();
      console.log('[Performance] Metrics:', metrics);
    }, 0);
  });
};

/**
 * Custom performance mark
 */
export const performanceMark = (name: string): void => {
  if (window.performance && window.performance.mark) {
    window.performance.mark(name);
  }
};

/**
 * Measure time between two marks
 */
export const performanceMeasure = (
  name: string,
  startMark: string,
  endMark: string
): number | null => {
  if (!window.performance || !window.performance.measure) return null;

  try {
    window.performance.measure(name, startMark, endMark);
    const measure = window.performance.getEntriesByName(name)[0];
    console.log(`[Performance] ${name}:`, measure.duration, 'ms');
    return measure.duration;
  } catch (error) {
    console.error('[Performance] Measure error:', error);
    return null;
  }
};
