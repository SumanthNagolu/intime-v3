# FOUND-013: Configure Vitest and Playwright

**Story Points:** 2
**Sprint:** Sprint 3 (Week 5-6)
**Priority:** HIGH

---

## User Story

As a **Developer**,
I want **testing frameworks configured and ready to use**,
So that **I can write tests without setup overhead**.

---

## Acceptance Criteria

- [ ] Vitest installed and configured for unit/integration tests
- [ ] Playwright installed and configured for E2E tests
- [ ] Test coverage reporting enabled (80% target)
- [ ] Test scripts in package.json
- [ ] Example tests provided
- [ ] Test database setup for integration tests
- [ ] CI-friendly configuration (headless, parallel execution)

---

## Technical Implementation

### Installation

```bash
pnpm add -D vitest @vitest/ui @vitest/coverage-v8
pnpm add -D @playwright/test
pnpm add -D @testing-library/react @testing-library/jest-dom
pnpm add -D @testing-library/user-event
```

### Vitest Configuration

Create file: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/*'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### Vitest Setup File

Create file: `tests/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
```

### Playwright Configuration

Create file: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

### Package.json Scripts

Update `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

### Example Unit Test

Create file: `tests/unit/rbac.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkPermission } from '@/lib/rbac';

vi.mock('@/lib/supabase/server');

describe('RBAC - checkPermission', () => {
  it('should return true for admin with any permission', async () => {
    const result = await checkPermission('admin-user-id', 'candidates', 'create');
    expect(result).toBe(true);
  });

  it('should return false for user without permission', async () => {
    const result = await checkPermission('student-user-id', 'candidates', 'delete');
    expect(result).toBe(false);
  });
});
```

### Example Component Test

Create file: `tests/unit/components/Button.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### Example E2E Test

Create file: `tests/e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h2')).toContainText('Sign in to InTime');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('.text-red-800')).toContainText('Invalid');
  });
});
```

---

## Dependencies

- **Requires:** None (foundation setup)
- **Used by:** All feature stories (testing required)

---

## Testing Checklist

- [ ] Vitest runs unit tests
- [ ] Coverage report generated
- [ ] Playwright runs E2E tests
- [ ] Tests pass in CI environment
- [ ] Example tests work

---

## Documentation Updates

- [ ] Create testing guide
- [ ] Document test writing patterns

---

**Created:** 2025-11-18
**Assigned:** TBD
**Status:** Ready for Development
