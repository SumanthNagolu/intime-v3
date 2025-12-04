#!/usr/bin/env tsx
/**
 * Route Verification Script
 *
 * Verifies that all pages follow the metadata-driven ScreenRenderer pattern
 * and meet Next.js 15 requirements.
 *
 * Usage: npx tsx scripts/verify-routes.ts
 */

import { glob } from 'glob';
import * as fs from 'fs';

interface VerificationResult {
  errors: string[];
  warnings: string[];
  stats: {
    total: number;
    usingScreenRenderer: number;
    usingRedirect: number;
    usingOtherPatterns: number;
    withSuspense: number;
    withLayout: number;
  };
}

async function verifyRoutes(): Promise<VerificationResult> {
  const pages = await glob('src/app/**/page.tsx');
  const errors: string[] = [];
  const warnings: string[] = [];
  const stats = {
    total: pages.length,
    usingScreenRenderer: 0,
    usingRedirect: 0,
    usingOtherPatterns: 0,
    withSuspense: 0,
    withLayout: 0,
  };

  for (const page of pages) {
    const content = fs.readFileSync(page, 'utf-8');
    const relativePath = page.replace('src/app/', '');

    // Check for ScreenRenderer usage
    const usesScreenRenderer = content.includes('ScreenRenderer');
    const usesRedirect = content.includes('redirect(');

    if (usesScreenRenderer) {
      stats.usingScreenRenderer++;
    } else if (usesRedirect) {
      stats.usingRedirect++;
    } else {
      stats.usingOtherPatterns++;
      // Only warn for employee pages that should use ScreenRenderer
      if (relativePath.startsWith('employee/') || relativePath.startsWith('client/') || relativePath.startsWith('talent/')) {
        warnings.push(`${relativePath}: Not using ScreenRenderer pattern`);
      }
    }

    // Check for proper layout wrapping (AppLayout or ClientLayout, etc)
    if (content.includes('Layout') || content.includes('layout')) {
      stats.withLayout++;
    }

    // Check for Suspense boundaries
    if (content.includes('ScreenRenderer') && !content.includes('Suspense')) {
      warnings.push(`${relativePath}: Missing Suspense boundary for ScreenRenderer`);
    } else if (content.includes('Suspense')) {
      stats.withSuspense++;
    }

    // Check for proper async params handling (Next.js 15)
    const hasParams = content.includes('params:') || content.includes('{ params }');
    const hasAsyncParams = content.includes('Promise<{') || content.includes('Promise<{ params');
    const isDynamicRoute = page.includes('[');

    if (isDynamicRoute && hasParams && !hasAsyncParams) {
      // Check if params are awaited
      if (!content.includes('await params') && !content.includes('await (params)')) {
        errors.push(`${relativePath}: Params should be awaited in Next.js 15 (async params)`);
      }
    }

    // Check for 'use client' directive where needed
    const hasUseClient = content.includes("'use client'") || content.includes('"use client"');
    const hasClientSideHooks =
      content.includes('useState') ||
      content.includes('useEffect') ||
      content.includes('useRouter()');

    if (hasClientSideHooks && !hasUseClient) {
      errors.push(`${relativePath}: Missing 'use client' directive but uses client-side hooks`);
    }
  }

  return { errors, warnings, stats };
}

async function main() {
  console.log('\n=== Route Verification Results ===\n');

  const { errors, warnings, stats } = await verifyRoutes();

  // Print stats
  console.log('STATISTICS:');
  console.log(`  Total pages: ${stats.total}`);
  console.log(`  Using ScreenRenderer: ${stats.usingScreenRenderer} (${((stats.usingScreenRenderer / stats.total) * 100).toFixed(1)}%)`);
  console.log(`  Using redirect: ${stats.usingRedirect}`);
  console.log(`  Other patterns: ${stats.usingOtherPatterns}`);
  console.log(`  With Suspense: ${stats.withSuspense}`);
  console.log(`  With Layout: ${stats.withLayout}`);
  console.log('');

  if (errors.length > 0) {
    console.log('ERRORS (must fix):');
    errors.forEach((e) => console.log(`  ❌ ${e}`));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('WARNINGS (review):');
    warnings.slice(0, 20).forEach((w) => console.log(`  ⚠️  ${w}`));
    if (warnings.length > 20) {
      console.log(`  ... and ${warnings.length - 20} more warnings`);
    }
    console.log('');
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All routes verified successfully!');
  }

  // Exit with error code if there are errors
  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
