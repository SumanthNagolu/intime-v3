'use client';

import { TimelineInput } from '@/lib/db/timeline';

interface TimelineEntryProps {
  entry: TimelineInput;
  isExpanded: boolean;
  onToggle: () => void;
}

export function TimelineEntry({ entry, isExpanded, onToggle }: TimelineEntryProps) {
  const statusColors = {
    success: 'bg-green-100 text-green-800 border-green-200',
    partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    blocked: 'bg-red-100 text-red-800 border-red-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusColor = entry.results?.status
    ? statusColors[entry.results.status]
    : 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold">{entry.conversationSummary}</h3>
            {entry.results?.status && (
              <span
                className={`px-2 py-1 rounded text-xs font-medium border ${statusColor}`}
              >
                {entry.results.status}
              </span>
            )}
          </div>

          {entry.userIntent && (
            <p className="text-sm text-muted-foreground mb-2">
              <span className="font-medium">Goal:</span> {entry.userIntent}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Session: {entry.sessionId}</span>
            {entry.agentType && <span>Agent: {entry.agentType}</span>}
            {entry.duration && <span>Duration: {entry.duration}</span>}
          </div>
        </div>

        <button
          onClick={onToggle}
          className="text-sm text-primary hover:underline"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      </div>

      {/* Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4 border-t pt-4">
          {/* Actions Taken */}
          {entry.actionsTaken && entry.actionsTaken.completed.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Actions Taken</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {entry.actionsTaken.completed.map((action, idx) => (
                  <li key={idx} className="text-muted-foreground">
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Files Changed */}
          {entry.filesChanged && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Files Changed</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {entry.filesChanged.created.length > 0 && (
                  <div>
                    <span className="font-medium text-green-600">Created:</span>
                    <ul className="mt-1 space-y-1">
                      {entry.filesChanged.created.map((file, idx) => (
                        <li key={idx} className="text-muted-foreground truncate">
                          {file}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {entry.filesChanged.modified.length > 0 && (
                  <div>
                    <span className="font-medium text-blue-600">Modified:</span>
                    <ul className="mt-1 space-y-1">
                      {entry.filesChanged.modified.map((file, idx) => (
                        <li key={idx} className="text-muted-foreground truncate">
                          {file}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {entry.filesChanged.deleted.length > 0 && (
                  <div>
                    <span className="font-medium text-red-600">Deleted:</span>
                    <ul className="mt-1 space-y-1">
                      {entry.filesChanged.deleted.map((file, idx) => (
                        <li key={idx} className="text-muted-foreground truncate">
                          {file}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Decisions */}
          {entry.decisions && entry.decisions.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Decisions Made</h4>
              <div className="space-y-2">
                {entry.decisions.map((decision, idx) => (
                  <div key={idx} className="bg-purple-50 p-3 rounded text-sm">
                    <p className="font-medium text-purple-900">{decision.decision}</p>
                    <p className="text-purple-700 text-xs mt-1">{decision.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assumptions */}
          {entry.assumptions && entry.assumptions.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Assumptions</h4>
              <div className="space-y-2">
                {entry.assumptions.map((assumption, idx) => (
                  <div key={idx} className="bg-yellow-50 p-3 rounded text-sm">
                    <p className="font-medium text-yellow-900">{assumption.assumption}</p>
                    <p className="text-yellow-700 text-xs mt-1">{assumption.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Future Notes */}
          {entry.futureNotes && entry.futureNotes.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Future Notes</h4>
              <div className="space-y-2">
                {entry.futureNotes.map((note, idx) => (
                  <div key={idx} className="bg-blue-50 p-3 rounded text-sm">
                    <p className="text-blue-900">{note.note}</p>
                    {note.priority && (
                      <span className="text-xs text-blue-700 mt-1 inline-block">
                        Priority: {note.priority}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Links */}
          <div className="flex flex-wrap gap-4 text-xs">
            {entry.relatedCommits && entry.relatedCommits.length > 0 && (
              <div>
                <span className="font-medium">Commits:</span>{' '}
                {entry.relatedCommits.join(', ')}
              </div>
            )}
            {entry.relatedPRs && entry.relatedPRs.length > 0 && (
              <div>
                <span className="font-medium">PRs:</span> {entry.relatedPRs.join(', ')}
              </div>
            )}
            {entry.relatedDocs && entry.relatedDocs.length > 0 && (
              <div>
                <span className="font-medium">Docs:</span> {entry.relatedDocs.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
