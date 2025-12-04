/**
 * Workspace Router
 *
 * Redirects users to the appropriate metadata-driven dashboard based on their role.
 * This replaces the old monolithic workspace with role-specific dashboards.
 *
 * Flow:
 * 1. Check if user is authenticated via Supabase
 * 2. Fetch user's profile to determine role
 * 3. Redirect to role-specific dashboard
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface PageProps {
  searchParams: Promise<{ role?: string; specificRole?: string }>;
}

// Map roles to their metadata-driven dashboard paths
const ROLE_DASHBOARD_PATHS: Record<string, string> = {
  // Admin
  admin: '/employee/admin/dashboard',

  // HR
  hr_manager: '/employee/hr/dashboard',
  hr: '/employee/hr/dashboard',

  // Recruiting IC Roles
  recruiter: '/employee/recruiting/dashboard',
  recruiting: '/employee/recruiting/dashboard',
  technical_recruiter: '/employee/recruiting/dashboard',

  // Recruiting Manager
  recruiting_manager: '/employee/manager/dashboard',

  // Bench Sales IC Roles
  bench_sales: '/employee/bench/dashboard',
  bench: '/employee/bench/dashboard',
  bench_sales_recruiter: '/employee/bench/dashboard',

  // Bench Sales Manager
  bench_sales_manager: '/employee/manager/dashboard',
  bench_manager: '/employee/manager/dashboard',

  // TA IC Roles
  ta: '/employee/ta/dashboard',
  ta_specialist: '/employee/ta/dashboard',

  // TA Manager
  ta_manager: '/employee/manager/dashboard',

  // Executive Roles
  ceo: '/employee/ceo/dashboard',
  cfo: '/employee/cfo/dashboard',
  coo: '/employee/coo/dashboard',

  // Regional
  regional_director: '/employee/manager/dashboard',

  // Manager fallback
  manager: '/employee/manager/dashboard',
};

export default async function WorkspaceRouter({ searchParams }: PageProps) {
  const supabase = await createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/employee');
  }

  // Try to get role from user metadata or profile
  // Use type assertion for profiles table since it may not be in generated types
  const { data: profile } = await (supabase.from as any)('profiles')
    .select('role, pod_type')
    .eq('user_id', user.id)
    .single() as { data: { role?: string; pod_type?: string } | null };

  // Fallback to query params if profile not found or role not set
  const params = await searchParams;
  const queryRole = params.specificRole || params.role;

  // Determine the role to use (profile > query param > default)
  let role = 'recruiting';
  if (profile?.role) {
    role = profile.role;
  } else if (queryRole) {
    role = queryRole;
  }

  // Find the dashboard path for this role
  const dashboardPath = ROLE_DASHBOARD_PATHS[role.toLowerCase()] ?? '/employee/recruiting/dashboard';

  // Redirect to the appropriate dashboard
  redirect(dashboardPath);
}



