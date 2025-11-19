import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment
    environment: 'jsdom',

    // Setup files
    setupFiles: ['./src/lib/testing/setup.ts'],

    // Globals
    globals: true,

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/lib/testing/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        'src/app/layout.tsx',
        'src/app/**/layout.tsx',
      ],
      // Target 80% coverage for critical paths
      thresholds: {
        lines: 50,        // Start at 50%, increase gradually
        functions: 50,
        branches: 50,
        statements: 50,
      },
    },

    // Test patterns
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,ts,jsx,tsx}',
    ],
    exclude: [
      'node_modules/',
      'dist/',
      '.next/',
      'coverage/',
    ],

    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Watch options
    watch: false,

    // Reporter
    reporter: ['verbose'],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/app': path.resolve(__dirname, './src/app'),
    },
  },
});
