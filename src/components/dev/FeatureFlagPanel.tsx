/**
 * Feature Flag Panel
 *
 * Development panel for toggling feature flags at runtime.
 * Only visible in development mode.
 */

'use client';

import { useState } from 'react';
import { Settings, X, ChevronDown, ChevronRight, ToggleLeft, ToggleRight, Zap } from 'lucide-react';
import {
  useAllFeatureFlags,
  FeatureFlags,
  enableAllLiveData,
  disableAllLiveData,
} from '@/lib/features';

// Group flags by category
const FLAG_CATEGORIES = {
  'ATS Module': [
    FeatureFlags.USE_LIVE_JOBS_DATA,
    FeatureFlags.USE_LIVE_SUBMISSIONS_DATA,
    FeatureFlags.USE_LIVE_INTERVIEWS_DATA,
    FeatureFlags.USE_LIVE_OFFERS_DATA,
    FeatureFlags.USE_LIVE_PLACEMENTS_DATA,
  ],
  'CRM Module': [
    FeatureFlags.USE_LIVE_ACCOUNTS_DATA,
    FeatureFlags.USE_LIVE_LEADS_DATA,
    FeatureFlags.USE_LIVE_DEALS_DATA,
    FeatureFlags.USE_LIVE_ACTIVITIES_DATA,
  ],
  'Bench Module': [
    FeatureFlags.USE_LIVE_BENCH_DATA,
    FeatureFlags.USE_LIVE_HOTLIST_DATA,
    FeatureFlags.USE_LIVE_EXTERNAL_JOBS_DATA,
  ],
  'TA-HR Module': [
    FeatureFlags.USE_LIVE_EMPLOYEES_DATA,
    FeatureFlags.USE_LIVE_PAYROLL_DATA,
    FeatureFlags.USE_LIVE_TIMESHEETS_DATA,
  ],
  'Academy Module': [
    FeatureFlags.USE_LIVE_COURSES_DATA,
    FeatureFlags.USE_LIVE_ENROLLMENTS_DATA,
  ],
  'Features': [
    FeatureFlags.ENABLE_REAL_TIME_UPDATES,
    FeatureFlags.ENABLE_OPTIMISTIC_UPDATES,
    FeatureFlags.ENABLE_OFFLINE_MODE,
    FeatureFlags.NEW_PIPELINE_VIEW,
    FeatureFlags.NEW_DASHBOARD_LAYOUT,
    FeatureFlags.DARK_MODE_TOGGLE,
  ],
  'Debug': [
    FeatureFlags.DEBUG_API_CALLS,
    FeatureFlags.SHOW_MOCK_DATA_BADGE,
  ],
};

// Format flag name for display
function formatFlagName(flag: string): string {
  return flag
    .replace(/_/g, ' ')
    .replace(/^use live /i, '')
    .replace(/ data$/i, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function FeatureFlagPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['ATS Module', 'CRM Module'])
  );
  const { flags, setFlag, resetAll } = useAllFeatureFlags();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const liveDataCount = Object.entries(flags).filter(
    ([key, value]) => key.includes('live') && value
  ).length;

  const totalLiveFlags = Object.keys(flags).filter(key => key.includes('live')).length;

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-50 w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        title="Feature Flags"
      >
        <Settings
          size={20}
          className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : 'group-hover:rotate-45'}`}
        />
        {liveDataCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {liveDataCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-20 left-4 z-50 w-80 max-h-[70vh] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Zap size={18} className="text-purple-600" />
                Feature Flags
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              {liveDataCount}/{totalLiveFlags} live data flags enabled
            </p>
          </div>

          {/* Quick actions */}
          <div className="p-3 border-b border-gray-100 flex gap-2">
            <button
              onClick={() => {
                enableAllLiveData();
                window.location.reload();
              }}
              className="flex-1 px-3 py-2 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              Enable All Live
            </button>
            <button
              onClick={() => {
                disableAllLiveData();
                window.location.reload();
              }}
              className="flex-1 px-3 py-2 text-xs font-medium bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
            >
              Use All Mock
            </button>
            <button
              onClick={() => {
                resetAll();
                window.location.reload();
              }}
              className="px-3 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Flag list */}
          <div className="flex-1 overflow-y-auto">
            {Object.entries(FLAG_CATEGORIES).map(([category, categoryFlags]) => (
              <div key={category} className="border-b border-gray-100 last:border-0">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-gray-700">{category}</span>
                  {expandedCategories.has(category) ? (
                    <ChevronDown size={16} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-400" />
                  )}
                </button>

                {expandedCategories.has(category) && (
                  <div className="px-4 pb-3 space-y-2">
                    {categoryFlags.map(flag => (
                      <div
                        key={flag}
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-xs text-gray-600">
                          {formatFlagName(flag)}
                        </span>
                        <button
                          onClick={() => {
                            setFlag(flag, !flags[flag], true);
                            // Trigger re-render
                            window.dispatchEvent(new Event('featureflagchange'));
                          }}
                          className="p-1"
                        >
                          {flags[flag] ? (
                            <ToggleRight size={24} className="text-green-500" />
                          ) : (
                            <ToggleLeft size={24} className="text-gray-300" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400 text-center">
              Changes require page reload to take effect
            </p>
          </div>
        </div>
      )}
    </>
  );
}
