/**
 * Feature Flags System
 *
 * Enables gradual rollout of features and A/B testing.
 * Used for migrating components from mock data to real API.
 *
 * Usage:
 * ```tsx
 * import { useFeatureFlag, FeatureFlags } from '@/lib/features';
 *
 * // In component
 * const useLiveData = useFeatureFlag('USE_LIVE_JOBS_DATA');
 *
 * // Conditional rendering
 * if (useLiveData) {
 *   return <JobsListLive />;
 * }
 * return <JobsListMock />;
 * ```
 */

// ============================================
// FEATURE FLAG DEFINITIONS
// ============================================

/**
 * All available feature flags
 */
export const FeatureFlags = {
  // ATS Module
  USE_LIVE_JOBS_DATA: 'use_live_jobs_data',
  USE_LIVE_SUBMISSIONS_DATA: 'use_live_submissions_data',
  USE_LIVE_INTERVIEWS_DATA: 'use_live_interviews_data',
  USE_LIVE_OFFERS_DATA: 'use_live_offers_data',
  USE_LIVE_PLACEMENTS_DATA: 'use_live_placements_data',

  // CRM Module
  USE_LIVE_ACCOUNTS_DATA: 'use_live_accounts_data',
  USE_LIVE_LEADS_DATA: 'use_live_leads_data',
  USE_LIVE_DEALS_DATA: 'use_live_deals_data',
  USE_LIVE_ACTIVITIES_DATA: 'use_live_activities_data',

  // Bench Module
  USE_LIVE_BENCH_DATA: 'use_live_bench_data',
  USE_LIVE_HOTLIST_DATA: 'use_live_hotlist_data',
  USE_LIVE_EXTERNAL_JOBS_DATA: 'use_live_external_jobs_data',

  // TA-HR Module
  USE_LIVE_EMPLOYEES_DATA: 'use_live_employees_data',
  USE_LIVE_PAYROLL_DATA: 'use_live_payroll_data',
  USE_LIVE_TIMESHEETS_DATA: 'use_live_timesheets_data',

  // Academy Module
  USE_LIVE_COURSES_DATA: 'use_live_courses_data',
  USE_LIVE_ENROLLMENTS_DATA: 'use_live_enrollments_data',

  // Cross-cutting
  ENABLE_REAL_TIME_UPDATES: 'enable_real_time_updates',
  ENABLE_OPTIMISTIC_UPDATES: 'enable_optimistic_updates',
  ENABLE_OFFLINE_MODE: 'enable_offline_mode',

  // UI/UX
  NEW_PIPELINE_VIEW: 'new_pipeline_view',
  NEW_DASHBOARD_LAYOUT: 'new_dashboard_layout',
  DARK_MODE_TOGGLE: 'dark_mode_toggle',

  // Debug
  DEBUG_API_CALLS: 'debug_api_calls',
  SHOW_MOCK_DATA_BADGE: 'show_mock_data_badge',
} as const;

export type FeatureFlagKey = keyof typeof FeatureFlags;
export type FeatureFlagValue = (typeof FeatureFlags)[FeatureFlagKey];

// ============================================
// DEFAULT VALUES
// ============================================

/**
 * Default feature flag values
 * Set to true to enable by default, false to disable
 */
const defaultFlags: Record<FeatureFlagValue, boolean> = {
  // ATS - NOW USING LIVE DATA
  [FeatureFlags.USE_LIVE_JOBS_DATA]: true,
  [FeatureFlags.USE_LIVE_SUBMISSIONS_DATA]: true,
  [FeatureFlags.USE_LIVE_INTERVIEWS_DATA]: true,
  [FeatureFlags.USE_LIVE_OFFERS_DATA]: true,
  [FeatureFlags.USE_LIVE_PLACEMENTS_DATA]: true,

  // CRM - NOW USING LIVE DATA
  [FeatureFlags.USE_LIVE_ACCOUNTS_DATA]: true,
  [FeatureFlags.USE_LIVE_LEADS_DATA]: true,
  [FeatureFlags.USE_LIVE_DEALS_DATA]: true,
  [FeatureFlags.USE_LIVE_ACTIVITIES_DATA]: true,

  // Bench - NOW USING LIVE DATA
  [FeatureFlags.USE_LIVE_BENCH_DATA]: true,
  [FeatureFlags.USE_LIVE_HOTLIST_DATA]: true,
  [FeatureFlags.USE_LIVE_EXTERNAL_JOBS_DATA]: true,

  // TA-HR - NOW USING LIVE DATA
  [FeatureFlags.USE_LIVE_EMPLOYEES_DATA]: true,
  [FeatureFlags.USE_LIVE_PAYROLL_DATA]: true,
  [FeatureFlags.USE_LIVE_TIMESHEETS_DATA]: true,

  // Academy - Already integrated, using live data
  [FeatureFlags.USE_LIVE_COURSES_DATA]: true,
  [FeatureFlags.USE_LIVE_ENROLLMENTS_DATA]: true,

  // Cross-cutting - Start disabled
  [FeatureFlags.ENABLE_REAL_TIME_UPDATES]: false,
  [FeatureFlags.ENABLE_OPTIMISTIC_UPDATES]: true,
  [FeatureFlags.ENABLE_OFFLINE_MODE]: false,

  // UI/UX - Start disabled
  [FeatureFlags.NEW_PIPELINE_VIEW]: false,
  [FeatureFlags.NEW_DASHBOARD_LAYOUT]: false,
  [FeatureFlags.DARK_MODE_TOGGLE]: true,

  // Debug - Start enabled in development
  [FeatureFlags.DEBUG_API_CALLS]: process.env.NODE_ENV === 'development',
  [FeatureFlags.SHOW_MOCK_DATA_BADGE]: process.env.NODE_ENV === 'development',
};

// ============================================
// ENVIRONMENT OVERRIDES
// ============================================

/**
 * Get feature flag from environment variable
 * Environment variables should be prefixed with NEXT_PUBLIC_FF_
 * e.g., NEXT_PUBLIC_FF_USE_LIVE_JOBS_DATA=true
 */
function getEnvFlag(flag: FeatureFlagValue): boolean | undefined {
  const envKey = `NEXT_PUBLIC_FF_${flag.toUpperCase()}`;
  const envValue = process.env[envKey];

  if (envValue === undefined) return undefined;
  return envValue === 'true' || envValue === '1';
}

// ============================================
// FLAG STORAGE
// ============================================

/**
 * In-memory flag overrides (for runtime toggling)
 */
const runtimeOverrides: Partial<Record<FeatureFlagValue, boolean>> = {};

/**
 * Get flag from localStorage (client-side only)
 */
function getStoredFlag(flag: FeatureFlagValue): boolean | undefined {
  if (typeof window === 'undefined') return undefined;

  const stored = localStorage.getItem(`ff_${flag}`);
  if (stored === null) return undefined;
  return stored === 'true';
}

/**
 * Store flag in localStorage (client-side only)
 */
function storeFlag(flag: FeatureFlagValue, value: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`ff_${flag}`, String(value));
}

// ============================================
// FLAG ACCESS
// ============================================

/**
 * Get the current value of a feature flag
 *
 * Priority order:
 * 1. Runtime override (for testing)
 * 2. Environment variable
 * 3. localStorage (for user preferences)
 * 4. Default value
 */
export function getFeatureFlag(flag: FeatureFlagKey | FeatureFlagValue): boolean {
  const flagValue = typeof flag === 'string' && flag in FeatureFlags
    ? FeatureFlags[flag as FeatureFlagKey]
    : flag as FeatureFlagValue;

  // 1. Check runtime overrides
  if (flagValue in runtimeOverrides) {
    return runtimeOverrides[flagValue]!;
  }

  // 2. Check environment variable
  const envValue = getEnvFlag(flagValue);
  if (envValue !== undefined) {
    return envValue;
  }

  // 3. Check localStorage
  const storedValue = getStoredFlag(flagValue);
  if (storedValue !== undefined) {
    return storedValue;
  }

  // 4. Return default
  return defaultFlags[flagValue] ?? false;
}

/**
 * Set a feature flag value at runtime
 * Useful for testing or admin overrides
 */
export function setFeatureFlag(
  flag: FeatureFlagKey | FeatureFlagValue,
  value: boolean,
  persist = false
): void {
  const flagValue = typeof flag === 'string' && flag in FeatureFlags
    ? FeatureFlags[flag as FeatureFlagKey]
    : flag as FeatureFlagValue;

  runtimeOverrides[flagValue] = value;

  if (persist) {
    storeFlag(flagValue, value);
  }
}

/**
 * Clear all runtime overrides
 */
export function clearFeatureFlagOverrides(): void {
  Object.keys(runtimeOverrides).forEach(key => {
    delete runtimeOverrides[key as FeatureFlagValue];
  });
}

/**
 * Get all feature flags with their current values
 */
export function getAllFeatureFlags(): Record<FeatureFlagValue, boolean> {
  const result: Record<string, boolean> = {};

  Object.values(FeatureFlags).forEach(flag => {
    result[flag] = getFeatureFlag(flag);
  });

  return result as Record<FeatureFlagValue, boolean>;
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Check if live data is enabled for a specific module
 */
export function isLiveDataEnabled(module: 'ats' | 'crm' | 'bench' | 'tahr' | 'academy'): boolean {
  switch (module) {
    case 'ats':
      return getFeatureFlag(FeatureFlags.USE_LIVE_JOBS_DATA);
    case 'crm':
      return getFeatureFlag(FeatureFlags.USE_LIVE_ACCOUNTS_DATA);
    case 'bench':
      return getFeatureFlag(FeatureFlags.USE_LIVE_BENCH_DATA);
    case 'tahr':
      return getFeatureFlag(FeatureFlags.USE_LIVE_EMPLOYEES_DATA);
    case 'academy':
      return getFeatureFlag(FeatureFlags.USE_LIVE_COURSES_DATA);
    default:
      return false;
  }
}

/**
 * Enable all live data flags (for testing full integration)
 */
export function enableAllLiveData(): void {
  setFeatureFlag(FeatureFlags.USE_LIVE_JOBS_DATA, true);
  setFeatureFlag(FeatureFlags.USE_LIVE_SUBMISSIONS_DATA, true);
  setFeatureFlag(FeatureFlags.USE_LIVE_INTERVIEWS_DATA, true);
  setFeatureFlag(FeatureFlags.USE_LIVE_OFFERS_DATA, true);
  setFeatureFlag(FeatureFlags.USE_LIVE_PLACEMENTS_DATA, true);
  setFeatureFlag(FeatureFlags.USE_LIVE_ACCOUNTS_DATA, true);
  setFeatureFlag(FeatureFlags.USE_LIVE_LEADS_DATA, true);
  setFeatureFlag(FeatureFlags.USE_LIVE_DEALS_DATA, true);
  setFeatureFlag(FeatureFlags.USE_LIVE_ACTIVITIES_DATA, true);
  setFeatureFlag(FeatureFlags.USE_LIVE_BENCH_DATA, true);
  setFeatureFlag(FeatureFlags.USE_LIVE_HOTLIST_DATA, true);
  setFeatureFlag(FeatureFlags.USE_LIVE_EXTERNAL_JOBS_DATA, true);
  setFeatureFlag(FeatureFlags.USE_LIVE_EMPLOYEES_DATA, true);
  setFeatureFlag(FeatureFlags.USE_LIVE_PAYROLL_DATA, true);
  setFeatureFlag(FeatureFlags.USE_LIVE_TIMESHEETS_DATA, true);
}

/**
 * Disable all live data flags (revert to mock data)
 */
export function disableAllLiveData(): void {
  setFeatureFlag(FeatureFlags.USE_LIVE_JOBS_DATA, false);
  setFeatureFlag(FeatureFlags.USE_LIVE_SUBMISSIONS_DATA, false);
  setFeatureFlag(FeatureFlags.USE_LIVE_INTERVIEWS_DATA, false);
  setFeatureFlag(FeatureFlags.USE_LIVE_OFFERS_DATA, false);
  setFeatureFlag(FeatureFlags.USE_LIVE_PLACEMENTS_DATA, false);
  setFeatureFlag(FeatureFlags.USE_LIVE_ACCOUNTS_DATA, false);
  setFeatureFlag(FeatureFlags.USE_LIVE_LEADS_DATA, false);
  setFeatureFlag(FeatureFlags.USE_LIVE_DEALS_DATA, false);
  setFeatureFlag(FeatureFlags.USE_LIVE_ACTIVITIES_DATA, false);
  setFeatureFlag(FeatureFlags.USE_LIVE_BENCH_DATA, false);
  setFeatureFlag(FeatureFlags.USE_LIVE_HOTLIST_DATA, false);
  setFeatureFlag(FeatureFlags.USE_LIVE_EXTERNAL_JOBS_DATA, false);
  setFeatureFlag(FeatureFlags.USE_LIVE_EMPLOYEES_DATA, false);
  setFeatureFlag(FeatureFlags.USE_LIVE_PAYROLL_DATA, false);
  setFeatureFlag(FeatureFlags.USE_LIVE_TIMESHEETS_DATA, false);
}
