/**
 * Feature Flags Module
 *
 * Provides feature flag functionality for gradual rollout of features.
 *
 * Usage:
 * ```typescript
 * // Import flags and functions
 * import {
 *   FeatureFlags,
 *   getFeatureFlag,
 *   setFeatureFlag,
 *   useFeatureFlag,
 * } from '@/lib/features';
 *
 * // Check flag in component
 * const useLiveData = useFeatureFlag('USE_LIVE_JOBS_DATA');
 *
 * // Check flag in utility function
 * if (getFeatureFlag(FeatureFlags.USE_LIVE_JOBS_DATA)) {
 *   // use live data
 * }
 *
 * // Toggle flag at runtime (e.g., from admin UI)
 * setFeatureFlag(FeatureFlags.USE_LIVE_JOBS_DATA, true, true); // persist to localStorage
 * ```
 */

// Core flag functions
export {
  FeatureFlags,
  getFeatureFlag,
  setFeatureFlag,
  clearFeatureFlagOverrides,
  getAllFeatureFlags,
  isLiveDataEnabled,
  enableAllLiveData,
  disableAllLiveData,
  type FeatureFlagKey,
  type FeatureFlagValue,
} from './flags';

// React hooks
export {
  useFeatureFlag,
  useFeatureFlagWithSetter,
  useFeatureFlags,
  useAllFeatureFlags,
  useAtsLiveData,
  useCrmLiveData,
  useBenchLiveData,
  useTahrLiveData,
  useConditionalComponent,
  useDataSource,
  type DataSource,
} from './hooks';
