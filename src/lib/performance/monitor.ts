/**
 * Performance Monitoring Utilities
 *
 * Provides utilities for monitoring and logging performance metrics
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();
  private enabled: boolean;

  constructor() {
    // Only enable in development or when explicitly enabled
    this.enabled = process.env.NODE_ENV === 'development' ||
                   process.env.ENABLE_PERFORMANCE_MONITORING === 'true';
  }

  /**
   * Start timing an operation
   */
  start(name: string): void {
    if (!this.enabled) return;
    this.timers.set(name, performance.now());
  }

  /**
   * End timing an operation and record the metric
   */
  end(name: string, metadata?: Record<string, unknown>): number | null {
    if (!this.enabled) return null;

    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`No start time found for metric: ${name}`);
      return null;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Log slow operations (> 1000ms)
    if (duration > 1000) {
      console.warn(`⚠️  Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, metadata);
    }

    return duration;
  }

  /**
   * Measure an async operation
   */
  async measure<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    this.start(name);
    try {
      const result = await operation();
      this.end(name, metadata);
      return result;
    } catch (error) {
      this.end(name, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Measure a synchronous operation
   */
  measureSync<T>(
    name: string,
    operation: () => T,
    metadata?: Record<string, unknown>
  ): T {
    this.start(name);
    try {
      const result = operation();
      this.end(name, metadata);
      return result;
    } catch (error) {
      this.end(name, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics summary
   */
  getSummary(): Record<string, { count: number; avgDuration: number; maxDuration: number }> {
    const summary: Record<string, { count: number; totalDuration: number; maxDuration: number }> = {};

    for (const metric of this.metrics) {
      if (!summary[metric.name]) {
        summary[metric.name] = { count: 0, totalDuration: 0, maxDuration: 0 };
      }

      summary[metric.name].count++;
      summary[metric.name].totalDuration += metric.duration;
      summary[metric.name].maxDuration = Math.max(summary[metric.name].maxDuration, metric.duration);
    }

    return Object.fromEntries(
      Object.entries(summary).map(([name, data]) => [
        name,
        {
          count: data.count,
          avgDuration: data.totalDuration / data.count,
          maxDuration: data.maxDuration,
        },
      ])
    );
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.timers.clear();
  }

  /**
   * Log performance summary to console
   */
  logSummary(): void {
    if (!this.enabled) return;

    const summary = this.getSummary();
    console.table(summary);
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator for measuring async function performance
 */
export function measurePerformance(name?: string) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const metricName = name || `${target?.constructor?.name}.${propertyKey}`;

    descriptor.value = async function (...args: unknown[]) {
      return performanceMonitor.measure(
        metricName,
        () => originalMethod.apply(this, args),
        { args: args.length }
      );
    };

    return descriptor;
  };
}

/**
 * React hook for measuring component render time
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCount = React.useRef(0);
  const isClient = typeof window !== 'undefined';

  React.useEffect(() => {
    if (!isClient) return;

    renderCount.current++;
    const renderName = `${componentName}.render.${renderCount.current}`;
    performanceMonitor.start(renderName);

    return () => {
      performanceMonitor.end(renderName);
    };
  });
}

// Make React available for the hook
import React from 'react';
