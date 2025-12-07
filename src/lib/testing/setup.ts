/**
 * Vitest test setup file
 *
 * This file runs before all tests and sets up the global test environment.
 */

import { beforeAll, afterAll, afterEach } from 'vitest'

// Setup: Runs once before all tests
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test'

  // Suppress console logs during tests (optional)
  // global.console = {
  //   ...console,
  //   log: vi.fn(),
  //   debug: vi.fn(),
  //   info: vi.fn(),
  //   warn: vi.fn(),
  // }
})

// Cleanup: Runs after each test
afterEach(() => {
  // Clear all mocks after each test to prevent test pollution
  // Note: Individual test files should also use vi.clearAllMocks()
})

// Teardown: Runs once after all tests
afterAll(() => {
  // Cleanup any global resources
})

export {}
