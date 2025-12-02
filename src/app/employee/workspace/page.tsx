/**
 * Workspace Router
 * 
 * Redirects users to the appropriate metadata-driven dashboard based on their role.
 * This replaces the old monolithic workspace with role-specific dashboards.
 */

import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{ role?: string; specificRole?: string }>;
}

// Map roles to their metadata-driven dashboard paths
const ROLE_DASHBOARD_PATHS: Record<string, string> = {
  // IC Roles
  recruiting: '/employee/recruiting/dashboard',
  technical_recruiter: '/employee/recruiting/dashboard',
  bench: '/employee/bench/dashboard',
  bench_sales: '/employee/bench/dashboard',
  bench_sales_recruiter: '/employee/bench/dashboard',
  ta: '/employee/ta/dashboard',
  ta_specialist: '/employee/ta/dashboard',
  
  // Manager Roles
  recruiting_manager: '/employee/manager/dashboard',
  bench_manager: '/employee/manager/dashboard',
  ta_manager: '/employee/manager/dashboard',
  manager: '/employee/manager/dashboard',
  
  // Executive Roles
  ceo: '/employee/ceo/dashboard',
  coo: '/employee/coo/dashboard',
  cfo: '/employee/cfo/dashboard',
  
  // Functional Roles
  hr: '/employee/hr/dashboard',
  admin: '/employee/admin/dashboard',
};

export default async function WorkspaceRouter({ searchParams }: PageProps) {
  // Get role from query params (Next.js 15 requires awaiting searchParams)
  const params = await searchParams;
  const role = params.specificRole || params.role || 'recruiting';
  
  // Find the dashboard path for this role
  const dashboardPath = ROLE_DASHBOARD_PATHS[role.toLowerCase()] || '/employee/recruiting/dashboard';
  
  // Redirect to the appropriate dashboard
  redirect(dashboardPath);
}


