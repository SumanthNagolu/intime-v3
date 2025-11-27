/**
 * Feature Flag React Hooks
 *
 * React hooks for accessing feature flags in components.
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getFeatureFlag,
  setFeatureFlag,
  getAllFeatureFlags,
  FeatureFlags,
  type FeatureFlagKey,
  type FeatureFlagValue,
} from './flags';

// ============================================
// SINGLE FLAG HOOK
// ============================================

/**
 * Hook to get a single feature flag value
 *
 * @example
 * ```tsx
 * const useLiveData = useFeatureFlag('USE_LIVE_JOBS_DATA');
 *
 * if (useLiveData) {
 *   return <JobsListLive />;
 * }
 * return <JobsListMock />;
 * ```
 */
export function useFeatureFlag(flag: FeatureFlagKey | FeatureFlagValue): boolean {
  const [value, setValue] = useState(() => getFeatureFlag(flag));

  // Re-check on mount (for localStorage values)
  useEffect(() => {
    setValue(getFeatureFlag(flag));
  }, [flag]);

  return value;
}

/**
 * Hook to get and set a feature flag
 *
 * @example
 * ```tsx
 * const [useLiveData, setUseLiveData] = useFeatureFlagWithSetter('USE_LIVE_JOBS_DATA');
 *
 * <button onClick={() => setUseLiveData(!useLiveData)}>
 *   Toggle Live Data
 * </button>
 * ```
 */
export function useFeatureFlagWithSetter(
  flag: FeatureFlagKey | FeatureFlagValue
): [boolean, (value: boolean, persist?: boolean) => void] {
  const [value, setValue] = useState(() => getFeatureFlag(flag));

  useEffect(() => {
    setValue(getFeatureFlag(flag));
  }, [flag]);

  const setFlagValue = useCallback(
    (newValue: boolean, persist = false) => {
      setFeatureFlag(flag, newValue, persist);
      setValue(newValue);
    },
    [flag]
  );

  return [value, setFlagValue];
}

// ============================================
// MULTIPLE FLAGS HOOK
// ============================================

/**
 * Hook to get multiple feature flags at once
 *
 * @example
 * ```tsx
 * const flags = useFeatureFlags([
 *   'USE_LIVE_JOBS_DATA',
 *   'USE_LIVE_ACCOUNTS_DATA'
 * ]);
 *
 * if (flags.USE_LIVE_JOBS_DATA) {
 *   // use live jobs data
 * }
 * ```
 */
export function useFeatureFlags<T extends readonly FeatureFlagKey[]>(
  flags: T
): Record<T[number], boolean> {
  const [values, setValues] = useState(() => {
    const result: Record<string, boolean> = {};
    flags.forEach(flag => {
      result[flag] = getFeatureFlag(flag);
    });
    return result as Record<T[number], boolean>;
  });

  useEffect(() => {
    const newValues: Record<string, boolean> = {};
    flags.forEach(flag => {
      newValues[flag] = getFeatureFlag(flag);
    });
    setValues(newValues as Record<T[number], boolean>);
  }, [flags]);

  return values;
}

// ============================================
// ALL FLAGS HOOK
// ============================================

/**
 * Hook to get all feature flags (useful for admin UI)
 *
 * @example
 * ```tsx
 * const { flags, setFlag, resetAll } = useAllFeatureFlags();
 *
 * return (
 *   <div>
 *     {Object.entries(flags).map(([key, value]) => (
 *       <label key={key}>
 *         <input
 *           type="checkbox"
 *           checked={value}
 *           onChange={(e) => setFlag(key, e.target.checked)}
 *         />
 *         {key}
 *       </label>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useAllFeatureFlags() {
  const [flags, setFlags] = useState(() => getAllFeatureFlags());

  useEffect(() => {
    setFlags(getAllFeatureFlags());
  }, []);

  const setFlag = useCallback((flag: FeatureFlagValue, value: boolean, persist = false) => {
    setFeatureFlag(flag, value, persist);
    setFlags(getAllFeatureFlags());
  }, []);

  const resetAll = useCallback(() => {
    // Clear localStorage flags
    if (typeof window !== 'undefined') {
      Object.values(FeatureFlags).forEach(flag => {
        localStorage.removeItem(`ff_${flag}`);
      });
    }
    setFlags(getAllFeatureFlags());
  }, []);

  return { flags, setFlag, resetAll };
}

// ============================================
// MODULE-SPECIFIC HOOKS
// ============================================

/**
 * Hook to check if live data is enabled for ATS module
 */
export function useAtsLiveData() {
  return {
    jobs: useFeatureFlag('USE_LIVE_JOBS_DATA'),
    submissions: useFeatureFlag('USE_LIVE_SUBMISSIONS_DATA'),
    interviews: useFeatureFlag('USE_LIVE_INTERVIEWS_DATA'),
    offers: useFeatureFlag('USE_LIVE_OFFERS_DATA'),
    placements: useFeatureFlag('USE_LIVE_PLACEMENTS_DATA'),
  };
}

/**
 * Hook to check if live data is enabled for CRM module
 */
export function useCrmLiveData() {
  return {
    accounts: useFeatureFlag('USE_LIVE_ACCOUNTS_DATA'),
    leads: useFeatureFlag('USE_LIVE_LEADS_DATA'),
    deals: useFeatureFlag('USE_LIVE_DEALS_DATA'),
    activities: useFeatureFlag('USE_LIVE_ACTIVITIES_DATA'),
  };
}

/**
 * Hook to check if live data is enabled for Bench module
 */
export function useBenchLiveData() {
  return {
    consultants: useFeatureFlag('USE_LIVE_BENCH_DATA'),
    hotlist: useFeatureFlag('USE_LIVE_HOTLIST_DATA'),
    externalJobs: useFeatureFlag('USE_LIVE_EXTERNAL_JOBS_DATA'),
  };
}

/**
 * Hook to check if live data is enabled for TA-HR module
 */
export function useTahrLiveData() {
  return {
    employees: useFeatureFlag('USE_LIVE_EMPLOYEES_DATA'),
    payroll: useFeatureFlag('USE_LIVE_PAYROLL_DATA'),
    timesheets: useFeatureFlag('USE_LIVE_TIMESHEETS_DATA'),
  };
}

// ============================================
// CONDITIONAL COMPONENT HOOK
// ============================================

/**
 * Hook for conditionally rendering components based on feature flag
 *
 * @example
 * ```tsx
 * const JobsList = useConditionalComponent(
 *   'USE_LIVE_JOBS_DATA',
 *   JobsListLive,
 *   JobsListMock
 * );
 *
 * return <JobsList />;
 * ```
 */
export function useConditionalComponent<P extends object>(
  flag: FeatureFlagKey | FeatureFlagValue,
  EnabledComponent: React.ComponentType<P>,
  DisabledComponent: React.ComponentType<P>
): React.ComponentType<P> {
  const isEnabled = useFeatureFlag(flag);

  return useMemo(() => {
    return isEnabled ? EnabledComponent : DisabledComponent;
  }, [isEnabled, EnabledComponent, DisabledComponent]);
}

// ============================================
// DATA SOURCE HOOK
// ============================================

export type DataSource = 'live' | 'mock';

/**
 * Hook to determine data source based on feature flag
 *
 * @example
 * ```tsx
 * const dataSource = useDataSource('USE_LIVE_JOBS_DATA');
 *
 * const { data } = dataSource === 'live'
 *   ? useJobs()
 *   : { data: mockJobs };
 * ```
 */
export function useDataSource(flag: FeatureFlagKey | FeatureFlagValue): DataSource {
  const isLive = useFeatureFlag(flag);
  return isLive ? 'live' : 'mock';
}
