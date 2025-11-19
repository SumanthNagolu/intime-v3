'use client';

import { TimelineInput } from '@/lib/db/timeline';

interface TimelineStatsProps {
  entries: TimelineInput[];
}

export function TimelineStats({ entries }: TimelineStatsProps) {
  // Calculate statistics
  const totalEntries = entries.length;
  const uniqueSessions = new Set(entries.map((e) => e.sessionId)).size;

  const allTags = entries.flatMap((e) => e.tags || []);
  const uniqueTags = new Set(allTags).size;

  const statusCounts = entries.reduce(
    (acc, entry) => {
      const status = entry.results?.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const successRate =
    totalEntries > 0
      ? Math.round(((statusCounts.success || 0) / totalEntries) * 100)
      : 0;

  const topTags = Object.entries(
    allTags.reduce(
      (acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    )
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const totalFilesChanged = entries.reduce((acc, entry) => {
    const created = entry.filesChanged?.created.length || 0;
    const modified = entry.filesChanged?.modified.length || 0;
    const deleted = entry.filesChanged?.deleted.length || 0;
    return acc + created + modified + deleted;
  }, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Entries */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Entries</p>
            <p className="text-3xl font-bold mt-1">{totalEntries}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
        </div>
      </div>

      {/* Unique Sessions */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Sessions</p>
            <p className="text-3xl font-bold mt-1">{uniqueSessions}</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔄</span>
          </div>
        </div>
      </div>

      {/* Success Rate */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <p className="text-3xl font-bold mt-1">{successRate}%</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">✅</span>
          </div>
        </div>
      </div>

      {/* Files Changed */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Files Changed</p>
            <p className="text-3xl font-bold mt-1">{totalFilesChanged}</p>
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📁</span>
          </div>
        </div>
      </div>

      {/* Top Tags */}
      {topTags.length > 0 && (
        <div className="bg-white border rounded-lg p-6 md:col-span-2 lg:col-span-2">
          <h3 className="font-semibold mb-3">Top Tags</h3>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
              >
                #{tag} ({count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Status Breakdown */}
      <div className="bg-white border rounded-lg p-6 md:col-span-2 lg:col-span-2">
        <h3 className="font-semibold mb-3">Status Breakdown</h3>
        <div className="space-y-2">
          {Object.entries(statusCounts).map(([status, count]) => {
            const percentage = Math.round((count / totalEntries) * 100);
            const colors: Record<string, string> = {
              success: 'bg-green-500',
              partial: 'bg-yellow-500',
              blocked: 'bg-red-500',
              failed: 'bg-red-500',
              unknown: 'bg-gray-500',
            };
            const bgColor = colors[status] || 'bg-gray-500';

            return (
              <div key={status} className="flex items-center gap-3">
                <div className="w-24 text-sm capitalize">{status}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className={`${bgColor} h-6 rounded-full flex items-center justify-center text-white text-xs font-medium`}
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage > 10 && `${count}`}
                  </div>
                </div>
                <div className="w-16 text-sm text-right text-muted-foreground">
                  {count} ({percentage}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
