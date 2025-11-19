'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface TimelineFiltersProps {
  availableTags: string[];
  availableSessions: string[];
  currentFilters: {
    search?: string;
    tag?: string;
    session?: string;
  };
}

export function TimelineFilters({
  availableTags,
  availableSessions,
  currentFilters,
}: TimelineFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(currentFilters.search || '');

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', searchInput || null);
  };

  const clearFilters = () => {
    setSearchInput('');
    router.push('/admin/timeline');
  };

  const hasActiveFilters =
    currentFilters.search || currentFilters.tag || currentFilters.session;

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Search timeline..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Search
          </button>
        </form>

        {/* Tag Filter */}
        <select
          value={currentFilters.tag || ''}
          onChange={(e) => updateFilter('tag', e.target.value || null)}
          className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Tags</option>
          {availableTags.map((tag) => (
            <option key={tag} value={tag}>
              #{tag}
            </option>
          ))}
        </select>

        {/* Session Filter */}
        <select
          value={currentFilters.session || ''}
          onChange={(e) => updateFilter('session', e.target.value || null)}
          className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Sessions</option>
          {availableSessions.map((session) => (
            <option key={session} value={session}>
              {session}
            </option>
          ))}
        </select>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {currentFilters.search && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-2">
              Search: {currentFilters.search}
              <button
                onClick={() => updateFilter('search', null)}
                className="hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}

          {currentFilters.tag && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-2">
              Tag: #{currentFilters.tag}
              <button
                onClick={() => updateFilter('tag', null)}
                className="hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}

          {currentFilters.session && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-2">
              Session: {currentFilters.session}
              <button
                onClick={() => updateFilter('session', null)}
                className="hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}

          <button
            onClick={clearFilters}
            className="text-xs text-red-600 hover:text-red-700 underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
