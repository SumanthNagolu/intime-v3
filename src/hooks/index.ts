/**
 * Hooks Index
 *
 * Re-exports all hooks for easy importing.
 *
 * Usage:
 * ```typescript
 * // Import query hooks
 * import { useJobs, useAccounts, useCandidates } from '@/hooks';
 *
 * // Import mutation hooks
 * import { useCreateJob, useUpdateAccount } from '@/hooks';
 *
 * // Or import from specific modules
 * import { useJobs } from '@/hooks/queries';
 * import { useCreateJob } from '@/hooks/mutations';
 * ```
 */

// Re-export all query hooks
export * from './queries';

// Re-export all mutation hooks
export * from './mutations';
