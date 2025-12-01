/**
 * Types Index
 *
 * Re-exports types for component imports.
 * Components can import from '@/types' or '../../types'
 * 
 * Core types are the canonical types defined from docs/specs.
 */

// Core types from specs (canonical - use these!)
export * from './core';

// Re-export all types from lib/types.ts
export * from '../lib/types';

// Re-export aligned types for convenience
export * from './aligned';
