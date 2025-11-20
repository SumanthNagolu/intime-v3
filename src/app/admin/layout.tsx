/**
 * Admin Layout
 *
 * Provides navigation and layout structure for admin pages.
 * Requires admin role to access.
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication and admin role
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login?redirectTo=/admin');
  }

  // Check if user is admin
  const { data: isAdmin } = await supabase.rpc('user_is_admin');

  if (!isAdmin) {
    redirect('/dashboard?error=unauthorized');
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Admin Portal</h1>
        </div>

        <nav className="p-4 space-y-2">
          <NavLink href="/admin" label="Dashboard" />
          <NavLink href="/admin/events" label="Event Management" />
          <NavLink href="/admin/handlers" label="Handler Health" />
          <NavLink href="/admin/timeline" label="Project Timeline" />
          <div className="pt-4 mt-4 border-t">
            <NavLink href="/dashboard" label="Back to Dashboard" />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
    >
      {label}
    </Link>
  );
}
