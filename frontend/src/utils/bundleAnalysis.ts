/**
 * Bundle Analysis Utilities
 * Helper functions to analyze and optimize bundle size
 */

/**
 * Log bundle size information in development
 */
export const logBundleInfo = (): void => {
  if (import.meta.env.DEV) {
    console.group('📦 Bundle Information');
    
    // Log loaded scripts
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    console.log('Loaded Scripts:', scripts.length);
    
    scripts.forEach((script) => {
      const src = script.getAttribute('src');
      console.log(`  - ${src}`);
    });

    // Log loaded stylesheets
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    console.log('Loaded Stylesheets:', stylesheets.length);
    
    stylesheets.forEach((link) => {
      const href = link.getAttribute('href');
      console.log(`  - ${href}`);
    });

    console.groupEnd();
  }
};

/**
 * Analyze resource timing
 */
export const analyzeResourceTiming = (): void => {
  if (!window.performance || !window.performance.getEntriesByType) return;

  const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  console.group('📊 Resource Timing Analysis');
  
  // Group by type
  const byType: Record<string, PerformanceResourceTiming[]> = {};
  resources.forEach((resource) => {
    const type = resource.initiatorType;
    if (!byType[type]) byType[type] = [];
    byType[type].push(resource);
  });

  // Log statistics by type
  Object.entries(byType).forEach(([type, items]) => {
    const totalSize = items.reduce((sum, item) => sum + (item.transferSize || 0), 0);
    const avgDuration = items.reduce((sum, item) => sum + item.duration, 0) / items.length;
    
    console.log(`${type}:`, {
      count: items.length,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      avgDuration: `${avgDuration.toFixed(2)} ms`,
    });
  });

  // Find slowest resources
  const slowest = [...resources]
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5);

  console.log('Slowest Resources:');
  slowest.forEach((resource, index) => {
    console.log(`  ${index + 1}. ${resource.name} - ${resource.duration.toFixed(2)} ms`);
  });

  console.groupEnd();
};

/**
 * Check for duplicate dependencies
 */
export const checkDuplicateDependencies = (): void => {
  if (import.meta.env.DEV) {
    console.group('🔍 Checking for Duplicate Dependencies');
    
    // This is a placeholder - actual implementation would require build tool integration
    console.log('Run "npm run build" and check the build output for duplicate dependencies');
    console.log('Consider using tools like:');
    console.log('  - webpack-bundle-analyzer');
    console.log('  - rollup-plugin-visualizer');
    console.log('  - vite-plugin-bundle-analyzer');
    
    console.groupEnd();
  }
};

/**
 * Initialize bundle analysis
 */
export const initBundleAnalysis = (): void => {
  if (import.meta.env.DEV) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        logBundleInfo();
        analyzeResourceTiming();
        checkDuplicateDependencies();
      }, 1000);
    });
  }
};
