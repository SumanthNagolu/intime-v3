import { Suspense } from 'react';
import { TimelineList } from '@/components/timeline/TimelineList';
import { TimelineFilters } from '@/components/timeline/TimelineFilters';
import { TimelineStats } from '@/components/timeline/TimelineStats';
import { readFileTimeline } from '@/lib/db/timeline';

/**
 * Project Timeline Dashboard
 *
 * Server component that displays the complete project history
 * including all Claude Code interactions, decisions, and outcomes.
 */
export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await searchParams in Next.js 15
  const params = await searchParams;

  // Get filter parameters from URL
  const sessionId = typeof params.session === 'string' ? params.session : undefined;
  const search = typeof params.search === 'string' ? params.search : undefined;
  const tag = typeof params.tag === 'string' ? params.tag : undefined;

  // Fetch timeline entries (file-based for now, will switch to DB when ready)
  let entries = await readFileTimeline(sessionId);

  // Apply filters
  if (search) {
    entries = entries.filter((entry) =>
      entry.conversationSummary.toLowerCase().includes(search.toLowerCase()) ||
      entry.userIntent?.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (tag) {
    entries = entries.filter((entry) => entry.tags?.includes(tag));
  }

  // Get unique tags and sessions for filtering
  const allTags = Array.from(
    new Set(entries.flatMap((e) => e.tags || []))
  ).sort();

  const allSessions = Array.from(
    new Set(entries.map((e) => e.sessionId))
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Project Timeline</h1>
        <p className="text-muted-foreground">
          Complete history of all Claude Code interactions, decisions, and outcomes
        </p>
      </div>

      {/* Statistics Section */}
      <Suspense fallback={<div>Loading statistics...</div>}>
        <TimelineStats entries={entries} />
      </Suspense>

      {/* Filters Section */}
      <div className="my-6">
        <TimelineFilters
          availableTags={allTags}
          availableSessions={allSessions}
          currentFilters={{
            search,
            tag,
            session: sessionId,
          }}
        />
      </div>

      {/* Timeline List */}
      <Suspense fallback={<div>Loading timeline...</div>}>
        <TimelineList entries={entries} />
      </Suspense>

      {/* Empty State */}
      {entries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            No timeline entries found
          </p>
          <p className="text-sm text-muted-foreground">
            Start logging your work with:{' '}
            <code className="bg-muted px-2 py-1 rounded">
              pnpm timeline add "Your summary here"
            </code>
          </p>
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: 'Project Timeline - InTime v3',
  description: 'Complete project history and interaction logs',
};
