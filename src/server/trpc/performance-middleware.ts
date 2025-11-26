/**
 * tRPC Performance Middleware
 *
 * Monitors and logs slow tRPC queries and mutations
 */

import { middleware } from './init';
import { performanceMonitor } from '@/lib/performance/monitor';

/**
 * Performance tracking middleware for tRPC
 *
 * Logs slow operations and tracks performance metrics
 */
export const performanceMiddleware = middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const metricName = `trpc.${type}.${path}`;

  try {
    const result = await next();
    const duration = Date.now() - start;

    // Log slow operations (> 2000ms for queries, > 3000ms for mutations)
    const threshold = type === 'query' ? 2000 : 3000;
    if (duration > threshold) {
      console.warn(
        `⚠️  Slow tRPC ${type}: ${path} took ${duration}ms (threshold: ${threshold}ms)`
      );
    }

    // Track in performance monitor if enabled
    if (process.env.NODE_ENV === 'development') {
      performanceMonitor.start(metricName);
      performanceMonitor.end(metricName, { type, duration });
    }

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(
      `❌ tRPC ${type} failed: ${path} after ${duration}ms`,
      error
    );
    throw error;
  }
});

/**
 * Apply performance middleware to a procedure
 *
 * @example
 * const myProcedure = publicProcedure.use(performanceMiddleware);
 */
