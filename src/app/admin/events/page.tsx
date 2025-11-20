/**
 * Admin Events Management Page
 *
 * View, filter, and manage events in the event bus.
 * Includes replay functionality and dead letter queue management.
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

export default function AdminEventsPage() {
  const [filters, setFilters] = useState({
    eventType: '',
    status: '',
    limit: 100,
    offset: 0,
  });

  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // Fetch events with filters
  const { data: events, isLoading, refetch } = trpc.admin.events.list.useQuery({
    ...filters,
    status: filters.status || undefined,
  } as any);

  // Fetch dead letter queue
  const { data: deadLetterQueue } = trpc.admin.events.deadLetterQueue.useQuery({
    limit: 100,
    offset: 0,
  });

  // Mutation for replaying events
  const replayMutation = trpc.admin.events.replay.useMutation({
    onSuccess: () => {
      alert('Events queued for replay successfully!');
      refetch();
    },
    onError: (error) => {
      alert(`Error replaying events: ${error.message}`);
    },
  });

  const handleReplay = (eventIds: string[]) => {
    if (confirm(`Replay ${eventIds.length} event(s)?`)) {
      replayMutation.mutate({ eventIds });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Management</h1>
        <p className="text-gray-600">Monitor and manage events in the event bus</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <input
              type="text"
              placeholder="e.g., user.created"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.eventType}
              onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="dead_letter">Dead Letter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limit
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
            >
              <option value="50">50 events</option>
              <option value="100">100 events</option>
              <option value="200">200 events</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => refetch()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Events</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading events...</div>
        ) : events && events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retry Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event: any) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {event.event_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(event.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.retry_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                      {(event.status === 'failed' || event.status === 'dead_letter') && (
                        <button
                          onClick={() => handleReplay([event.id])}
                          className="text-green-600 hover:text-green-900"
                          disabled={replayMutation.isPending}
                        >
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No events found. Try adjusting your filters.
          </div>
        )}
      </div>

      {/* Dead Letter Queue */}
      {deadLetterQueue && deadLetterQueue.length > 0 && (
        <div className="mt-6 bg-red-50 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-red-800">
              Dead Letter Queue ({deadLetterQueue.length})
            </h2>
            <button
              onClick={() => handleReplay(deadLetterQueue.map((e: any) => e.id))}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              disabled={replayMutation.isPending}
            >
              Replay All DLQ Events
            </button>
          </div>
          <p className="text-sm text-red-700 mb-4">
            These events failed permanently after max retries.
          </p>
          <div className="space-y-2">
            {deadLetterQueue.slice(0, 5).map((event: any) => (
              <div key={event.id} className="text-sm text-red-800">
                • {event.event_type} - {new Date(event.created_at).toLocaleString()}
              </div>
            ))}
            {deadLetterQueue.length > 5 && (
              <div className="text-sm text-red-600">
                ... and {deadLetterQueue.length - 5} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Event Details</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-4">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Event ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{selectedEvent.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Event Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedEvent.event_type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <StatusBadge status={selectedEvent.status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Payload</dt>
                  <dd className="mt-1">
                    <pre className="text-xs bg-gray-50 p-4 rounded border overflow-x-auto">
                      {JSON.stringify(selectedEvent.payload, null, 2)}
                    </pre>
                  </dd>
                </div>
                {selectedEvent.metadata && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Metadata</dt>
                    <dd className="mt-1">
                      <pre className="text-xs bg-gray-50 p-4 rounded border overflow-x-auto">
                        {JSON.stringify(selectedEvent.metadata, null, 2)}
                      </pre>
                    </dd>
                  </div>
                )}
                {selectedEvent.error_message && (
                  <div>
                    <dt className="text-sm font-medium text-red-500">Error Message</dt>
                    <dd className="mt-1 text-sm text-red-900 bg-red-50 p-3 rounded">
                      {selectedEvent.error_message}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
              {(selectedEvent.status === 'failed' || selectedEvent.status === 'dead_letter') && (
                <button
                  onClick={() => {
                    handleReplay([selectedEvent.id]);
                    setSelectedEvent(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  disabled={replayMutation.isPending}
                >
                  Retry Event
                </button>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    dead_letter: 'bg-purple-100 text-purple-800',
  };

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        colors[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {status}
    </span>
  );
}
