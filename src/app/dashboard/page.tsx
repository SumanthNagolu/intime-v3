/**
 * Dashboard Page
 *
 * Protected page - requires authentication
 * Shows user profile and role information
 *
 * Epic: FOUND-005 - Configure Supabase Auth
 */

import { requireAuth, getUserProfile, getUserRoles } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await requireAuth();
  const profile = await getUserProfile(session.user.id);
  const roles = await getUserRoles(session.user.id);

  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-white p-8 shadow dark:bg-gray-800">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, {profile.full_name}!
          </h1>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="mt-1 text-gray-900 dark:text-white">{profile.email}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Roles
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Account Status
              </p>
              <p className="mt-1 text-green-600 dark:text-green-400">✓ Active</p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              🎉 Sprint 1 Complete! Authentication is working.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
