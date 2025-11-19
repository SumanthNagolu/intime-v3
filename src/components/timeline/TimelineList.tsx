'use client';

import { TimelineInput } from '@/lib/db/timeline';
import { TimelineEntry } from './TimelineEntry';
import { useState } from 'react';

interface TimelineListProps {
  entries: TimelineInput[];
}

export function TimelineList({ entries }: TimelineListProps) {
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const toggleEntry = (sessionId: string) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => (
        <TimelineEntry
          key={`${entry.sessionId}-${index}`}
          entry={entry}
          isExpanded={expandedEntries.has(entry.sessionId)}
          onToggle={() => toggleEntry(entry.sessionId)}
        />
      ))}
    </div>
  );
}
