// Performance Optimization Library for CounterOS
// Enterprise-grade performance monitoring and optimization

import { logger } from '@/lib/logger';

export interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

export interface CacheConfig {
  maxAge: number;
  staleWhileRevalidate: number;
  cacheKey: string;
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }

  // Measure page load performance
  measurePageLoad(pageName: string): void {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navigationEntry = entry as PerformanceNavigationTiming;
          this.metrics.set(pageName, {
            loadTime: navigationEntry.loadEventEnd - navigationEntry.fetchStart,
            firstContentfulPaint: 0, // Will be updated by paint observer
            largestContentfulPaint: 0, // Will be updated by LCP observer
            cumulativeLayoutShift: 0, // Will be updated by layout-shift observer
            timeToInteractive: navigationEntry.domInteractive - navigationEntry.fetchStart,
          });
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });

    // Measure Core Web Vitals
    this.measureCoreWebVitals(pageName);
  }

  private measureCoreWebVitals(pageName: string): void {
    if (typeof window === 'undefined') return;

    // First Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          const currentMetrics = this.metrics.get(pageName) || {} as PerformanceMetrics;
          this.metrics.set(pageName, {
            ...currentMetrics,
            firstContentfulPaint: entry.startTime,
          });
        }
      }
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      const currentMetrics = this.metrics.get(pageName) || {} as PerformanceMetrics;
      this.metrics.set(pageName, {
        ...currentMetrics,
        largestContentfulPaint: lastEntry.startTime,
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          const currentMetrics = this.metrics.get(pageName) || {} as PerformanceMetrics;
          this.metrics.set(pageName, {
            ...currentMetrics,
            cumulativeLayoutShift: clsValue,
          });
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Get performance metrics for a page
  getMetrics(pageName: string): PerformanceMetrics | undefined {
    return this.metrics.get(pageName);
  }

  // Send metrics to analytics (would be implemented with real analytics service)
  sendMetrics(pageName: string): void {
    const metrics = this.metrics.get(pageName);
    if (!metrics) return;

    // In production, send to analytics service
    logger.debug(`📊 Performance Metrics: ${pageName}`, {
      loadTime: `${metrics.loadTime.toFixed(2)}ms`,
      FCP: `${metrics.firstContentfulPaint.toFixed(2)}ms`,
      LCP: `${metrics.largestContentfulPaint.toFixed(2)}ms`,
      CLS: metrics.cumulativeLayoutShift.toFixed(4),
      TTI: `${metrics.timeToInteractive.toFixed(2)}ms`
    });
  }
}

// Caching utilities for data optimization
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; config: CacheConfig }>();

  set<T>(key: string, data: T, config: CacheConfig): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      config,
    });
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    const age = now - cached.timestamp;

    // Return fresh data
    if (age < cached.config.maxAge * 1000) {
      return cached.data;
    }

    // Return stale data if within stale-while-revalidate window
    if (age < (cached.config.maxAge + cached.config.staleWhileRevalidate) * 1000) {
      // Trigger background revalidation here
      return cached.data;
    }

    // Data is too old
    this.cache.delete(key);
    return null;
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Bundle analysis utilities
export const bundleOptimization = {
  // Preload critical resources
  preloadRoute(routePath: string): void {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = routePath;
      document.head.appendChild(link);
    }
  },

  // Image optimization
  optimizeImage(src: string, width: number, quality: number = 80): string {
    // In production, this would integrate with image optimization service
    return `${src}?w=${width}&q=${quality}`;
  },
};

// Global performance instance
export const performanceMonitor = PerformanceMonitor.getInstance();
export const cacheManager = new CacheManager();