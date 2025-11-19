/**
 * ONE-CLICK Migration Page
 *
 * Web-based migration runner - NO MANUAL STEPS!
 * Visit: http://localhost:3000/setup/migrate
 */

'use client';

import { useState } from 'react';

interface MigrationResult {
  filename: string;
  success: boolean;
  error?: string;
  timestamp: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  results?: MigrationResult[];
  error?: string;
  tables?: any[];
}

export default function MigratePage() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'running' | 'success' | 'error'>('idle');
  const [results, setResults] = useState<ApiResponse | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const checkStatus = async () => {
    setStatus('checking');
    addLog('Checking database status...');

    try {
      const response = await fetch('/api/migrate');
      const data = await response.json();

      setResults(data);
      addLog(`Status check complete. Found ${data.tables?.length || 0} tables.`);
      setStatus('idle');
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
      setStatus('error');
    }
  };

  const runMigrations = async () => {
    setStatus('running');
    setLogs([]);
    addLog('🚀 Starting automated migration...');
    addLog('Reading migration files...');

    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run' })
      });

      const data = await response.json();

      setResults(data);

      if (data.success) {
        addLog('✅ All migrations completed successfully!');
        setStatus('success');
      } else {
        addLog(`⚠️  ${data.message}`);
        addLog('Some migrations failed. Check results below.');
        setStatus('error');
      }
    } catch (error: any) {
      addLog(`❌ Fatal error: ${error.message}`);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">
            🤖 Automated Database Migration
          </h1>
          <p className="mt-2 text-gray-400">
            One-click migration - no manual SQL required!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={checkStatus}
            disabled={status === 'checking' || status === 'running'}
            className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'checking' ? 'Checking...' : '🔍 Check Status'}
          </button>

          <button
            onClick={runMigrations}
            disabled={status === 'running' || status === 'checking'}
            className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'running' ? '⏳ Running Migrations...' : '🚀 Run Migrations'}
          </button>
        </div>

        {/* Status Alert */}
        {status === 'success' && (
          <div className="mb-6 rounded-lg bg-green-900/50 border border-green-500 p-4">
            <p className="font-semibold text-green-200">
              ✅ Migration Complete!
            </p>
            <p className="mt-1 text-sm text-green-300">
              Your database is ready. You can now test the signup flow at{' '}
              <a href="/signup" className="underline">/signup</a>
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-6 rounded-lg bg-red-900/50 border border-red-500 p-4">
            <p className="font-semibold text-red-200">
              ⚠️  Migration Issues Detected
            </p>
            <p className="mt-1 text-sm text-red-300">
              Check the logs and results below for details.
            </p>
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <div className="mb-6 rounded-lg bg-gray-800 p-4">
            <h3 className="mb-2 font-semibold text-white">Logs:</h3>
            <div className="max-h-60 overflow-y-auto rounded bg-black p-3 font-mono text-sm">
              {logs.map((log, i) => (
                <div key={i} className="text-green-400">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="rounded-lg bg-gray-800 p-6">
            <h3 className="mb-4 text-xl font-semibold text-white">Results:</h3>

            {/* Table Status */}
            {results.tables && (
              <div className="mb-6">
                <h4 className="mb-2 font-medium text-gray-300">Database Tables:</h4>
                <div className="space-y-2">
                  {results.tables.map((table: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded bg-gray-700 p-3"
                    >
                      <span className="font-mono text-sm text-gray-200">
                        {table.table}
                      </span>
                      <div className="flex items-center gap-4">
                        {table.exists ? (
                          <>
                            <span className="text-xs text-gray-400">
                              {table.count} rows
                            </span>
                            <span className="text-green-400">✓ Exists</span>
                          </>
                        ) : (
                          <span className="text-red-400">✗ Missing</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Migration Results */}
            {results.results && (
              <div>
                <h4 className="mb-2 font-medium text-gray-300">Migration Files:</h4>
                <div className="space-y-2">
                  {results.results.map((result: MigrationResult, i: number) => (
                    <div
                      key={i}
                      className={`rounded p-3 ${
                        result.success
                          ? 'bg-green-900/30 border border-green-700'
                          : 'bg-red-900/30 border border-red-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm text-gray-200">
                          {result.filename}
                        </span>
                        <span className={result.success ? 'text-green-400' : 'text-red-400'}>
                          {result.success ? '✓ Success' : '✗ Failed'}
                        </span>
                      </div>
                      {result.error && (
                        <p className="mt-2 text-xs text-red-300">
                          Error: {result.error}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {results.error && (
              <div className="mt-4 rounded bg-red-900/30 border border-red-700 p-4">
                <p className="font-semibold text-red-200">Error:</p>
                <p className="mt-1 text-sm text-red-300">{results.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 rounded-lg bg-blue-900/30 border border-blue-700 p-6">
          <h3 className="mb-2 font-semibold text-blue-200">📖 Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-300">
            <li>Click <strong>"Check Status"</strong> to see current database state</li>
            <li>Click <strong>"Run Migrations"</strong> to execute all migrations automatically</li>
            <li>Wait for completion (usually 10-30 seconds)</li>
            <li>If successful, proceed to <a href="/signup" className="underline">/signup</a> to test</li>
          </ol>

          <div className="mt-4 rounded bg-yellow-900/30 border border-yellow-700 p-3">
            <p className="text-xs text-yellow-200">
              <strong>Note:</strong> This uses HTTP-based Supabase client, so no DNS/network issues!
              If you see RPC errors, see fallback instructions below.
            </p>
          </div>
        </div>

        {/* Fallback */}
        {status === 'error' && results?.error?.includes('exec_migration') && (
          <div className="mt-6 rounded-lg bg-gray-800 border border-gray-600 p-6">
            <h3 className="mb-2 font-semibold text-gray-200">🔧 Fallback Method:</h3>
            <p className="mb-4 text-sm text-gray-400">
              The RPC function doesn't exist yet. You'll need to bootstrap it first:
            </p>
            <div className="rounded bg-black p-4">
              <p className="mb-2 text-xs text-gray-500">Run this in Supabase Dashboard SQL Editor:</p>
              <pre className="overflow-x-auto text-xs text-green-400">
{`CREATE OR REPLACE FUNCTION exec_migration(migration_sql TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE migration_sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`}
              </pre>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              After running the above, click "Run Migrations" again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
