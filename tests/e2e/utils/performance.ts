import { Page, expect } from '@playwright/test'

export interface PerformanceMetrics {
  navigationStart: number
  domContentLoaded: number
  loadComplete: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  timeToInteractive: number
}

/**
 * Measure page load performance metrics
 */
export async function measurePageLoad(page: Page, url: string): Promise<PerformanceMetrics> {
  // Navigate and wait for network idle
  await page.goto(url, { waitUntil: 'networkidle' })

  // Get performance timing from browser
  const metrics = await page.evaluate(() => {
    const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')
    const fcp = paint.find(p => p.name === 'first-contentful-paint')

    return {
      navigationStart: perf.startTime,
      domContentLoaded: perf.domContentLoadedEventEnd,
      loadComplete: perf.loadEventEnd,
      firstContentfulPaint: fcp?.startTime ?? 0,
      largestContentfulPaint: 0, // Will be filled by LCP observer
      timeToInteractive: perf.domInteractive,
    }
  })

  return metrics
}

/**
 * Assert page loads within target time
 */
export async function assertFastPageLoad(
  page: Page,
  url: string,
  maxLoadTimeMs: number = 500
): Promise<void> {
  const startTime = Date.now()

  // Navigate to page
  await page.goto(url, { waitUntil: 'domcontentloaded' })

  // Wait for main content to be visible (not skeleton)
  await page.waitForSelector('[data-testid="page-content"]', {
    state: 'visible',
    timeout: maxLoadTimeMs + 1000
  })

  const loadTime = Date.now() - startTime

  // Assert load time is under threshold
  expect(loadTime, `Page ${url} took ${loadTime}ms to load (max: ${maxLoadTimeMs}ms)`).toBeLessThan(maxLoadTimeMs)
}

/**
 * Assert no client-side loading spinners appear on initial load
 */
export async function assertNoLoadingSpinner(page: Page): Promise<void> {
  // Check that skeleton/spinner elements are NOT visible
  const skeletonVisible = await page.locator('[data-testid="loading-skeleton"]').isVisible().catch(() => false)
  const spinnerVisible = await page.locator('.animate-spin').first().isVisible().catch(() => false)

  expect(skeletonVisible, 'Loading skeleton should not be visible on server-rendered page').toBe(false)
  expect(spinnerVisible, 'Loading spinner should not be visible on server-rendered page').toBe(false)
}
