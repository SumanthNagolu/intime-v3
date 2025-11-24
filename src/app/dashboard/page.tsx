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
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { signOutAction } from '@/app/actions/auth';

export default async function DashboardPage() {
  const session = await requireAuth();
  const profile = await getUserProfile(session.user.id);
  
  // If profile is missing, show a "Complete Setup" or "Contact Support" screen
  // DO NOT redirect to /login, as that causes an infinite loop if the user is authenticated
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Not Found</h1>
            <p className="mt-2 text-gray-600">
              Your account exists, but your user profile is missing. This usually happens if the signup process was interrupted.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <form action={async () => {
              'use server';
              await signOutAction();
            }}>
              <Button variant="outline" className="w-full">
                Sign Out & Try Again
              </Button>
            </form>
            
            <p className="text-xs text-gray-500 mt-4">
              User ID: {session.user.id}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const roles = await getUserRoles(session.user.id);

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
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <form action={async () => {
              'use server';
              await signOutAction();
            }}>
              <Button variant="outline">Sign Out</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
