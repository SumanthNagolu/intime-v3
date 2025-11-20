/**
 * Admin Handler Health Page
 *
 * Monitor event handler health and enable/disable handlers.
 * Shows handler status, failure counts, and health metrics.
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

export default function AdminHandlersPage() {
  const [selectedHandler, setSelectedHandler] = useState<any | null>(null);

  // Fetch handlers
  const { data: handlers, isLoading, refetch } = trpc.admin.handlers.list.useQuery({
    limit: 100,
    offset: 0,
  });

  // Fetch handler health dashboard
  const { data: dashboard } = trpc.admin.handlers.healthDashboard.useQuery({});

  // Mutations
  const enableMutation = trpc.admin.handlers.enable.useMutation({
    onSuccess: () => {
      alert('Handler enabled successfully!');
      refetch();
    },
    onError: (error) => {
      alert(`Error enabling handler: ${error.message}`);
    },
  });

  const disableMutation = trpc.admin.handlers.disable.useMutation({
    onSuccess: () => {
      alert('Handler disabled successfully!');
      refetch();
    },
    onError: (error) => {
      alert(`Error disabling handler: ${error.message}`);
    },
  });

  const handleEnable = (handlerId: string) => {
    if (confirm('Enable this handler?')) {
      enableMutation.mutate({ handlerId });
    }
  };

  const handleDisable = (handlerId: string) => {
    if (confirm('Disable this handler? It will stop processing events.')) {
      disableMutation.mutate({ handlerId });
    }
  };

  // Calculate health statistics
  const stats = handlers
    ? {
        total: handlers.length,
        healthy:
          handlers.filter((h: any) => h.health_status === 'healthy' || h.health_status === 'healthy_with_errors')
            .length,
        warning: handlers.filter((h: any) => h.health_status === 'warning').length,
        critical: handlers.filter((h: any) => h.health_status === 'critical').length,
        disabled: handlers.filter((h: any) => h.health_status === 'disabled').length,
      }
    : { total: 0, healthy: 0, warning: 0, critical: 0, disabled: 0 };

  const healthPercentage =
    stats.total > 0 ? Math.round(((stats.healthy + stats.warning) / stats.total) * 100) : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Handler Health Dashboard</h1>
        <p className="text-gray-600">Monitor and manage event handler status</p>
      </div>

      {/* Health Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Handlers" value={stats.total} color="blue" />
        <StatCard label="Healthy" value={stats.healthy} color="green" />
        <StatCard label="Warning" value={stats.warning} color="yellow" />
        <StatCard label="Critical" value={stats.critical} color="red" />
        <StatCard label="Disabled" value={stats.disabled} color="gray" />
      </div>

      {/* Health Percentage */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Overall Health</h2>
          <span className="text-2xl font-bold text-blue-600">{healthPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full ${
              healthPercentage >= 90
                ? 'bg-green-500'
                : healthPercentage >= 70
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {stats.healthy + stats.warning} out of {stats.total} handlers are operational
        </p>
      </div>

      {/* Handlers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Event Handlers</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading handlers...</div>
        ) : handlers && handlers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Handler Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Pattern
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Health Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Failures
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Failure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {handlers.map((handler: any) => (
                  <tr key={handler.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {handler.subscriber_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {handler.event_pattern}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <HealthBadge status={handler.health_status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>Total: {handler.failure_count}</div>
                        <div className="text-xs text-red-600">
                          Consecutive: {handler.consecutive_failures}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {handler.last_failure_at
                        ? new Date(handler.last_failure_at).toLocaleString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedHandler(handler)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Details
                      </button>
                      {handler.is_active ? (
                        <button
                          onClick={() => handleDisable(handler.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={disableMutation.isPending}
                        >
                          Disable
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEnable(handler.id)}
                          className="text-green-600 hover:text-green-900"
                          disabled={enableMutation.isPending}
                        >
                          Enable
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
            No handlers registered yet.
          </div>
        )}
      </div>

      {/* Handler Details Modal */}
      {selectedHandler && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Handler Details</h3>
              <button
                onClick={() => setSelectedHandler(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-4">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Handler ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">
                    {selectedHandler.id}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Handler Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedHandler.subscriber_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Event Pattern</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">
                    {selectedHandler.event_pattern}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Health Status</dt>
                  <dd className="mt-1">
                    <HealthBadge status={selectedHandler.health_status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Active</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedHandler.is_active ? 'Yes' : 'No'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Failure Count</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    Total: {selectedHandler.failure_count}, Consecutive:{' '}
                    {selectedHandler.consecutive_failures}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Triggered</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedHandler.last_triggered_at
                      ? new Date(selectedHandler.last_triggered_at).toLocaleString()
                      : 'Never'}
                  </dd>
                </div>
                {selectedHandler.last_failure_at && (
                  <div>
                    <dt className="text-sm font-medium text-red-500">Last Failure</dt>
                    <dd className="mt-1 text-sm text-red-900">
                      {new Date(selectedHandler.last_failure_at).toLocaleString()}
                    </dd>
                  </div>
                )}
                {selectedHandler.last_failure_message && (
                  <div>
                    <dt className="text-sm font-medium text-red-500">Last Failure Message</dt>
                    <dd className="mt-1 text-sm text-red-900 bg-red-50 p-3 rounded">
                      {selectedHandler.last_failure_message}
                    </dd>
                  </div>
                )}
                {selectedHandler.auto_disabled_at && (
                  <div>
                    <dt className="text-sm font-medium text-red-500">Auto-Disabled At</dt>
                    <dd className="mt-1 text-sm text-red-900">
                      {new Date(selectedHandler.auto_disabled_at).toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
              {selectedHandler.is_active ? (
                <button
                  onClick={() => {
                    handleDisable(selectedHandler.id);
                    setSelectedHandler(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  disabled={disableMutation.isPending}
                >
                  Disable Handler
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleEnable(selectedHandler.id);
                    setSelectedHandler(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  disabled={enableMutation.isPending}
                >
                  Enable Handler
                </button>
              )}
              <button
                onClick={() => setSelectedHandler(null)}
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

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${colors[color]}`}>
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function HealthBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    healthy: 'bg-green-100 text-green-800',
    healthy_with_errors: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
    disabled: 'bg-gray-100 text-gray-800',
  };

  const labels: Record<string, string> = {
    healthy: 'Healthy',
    healthy_with_errors: 'Healthy (with errors)',
    warning: 'Warning',
    critical: 'Critical',
    disabled: 'Disabled',
  };

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        styles[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {labels[status] || status}
    </span>
  );
}
