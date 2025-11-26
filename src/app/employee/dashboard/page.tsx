/**
 * Employee Dashboard Router
 *
 * This page detects the user's role and redirects them to the appropriate
 * role-based dashboard (recruiting, bench sales, HR, etc.)
 */

import { redirect } from 'next/navigation';
import { requireAuth, getUserRoles } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

// Role-to-dashboard mapping
const ROLE_DASHBOARDS: Record<string, string> = {
  'ceo': '/employee/ceo/dashboard',
  'admin': '/employee/admin/dashboard',
  'super_admin': '/employee/admin/dashboard',

  // Recruiting
  'recruiter': '/employee/recruiting/dashboard',
  'senior_recruiter': '/employee/recruiting/dashboard',
  'junior_recruiter': '/employee/recruiting/dashboard',

  // Bench Sales
  'bench_sales': '/employee/bench/dashboard',
  'senior_bench_sales': '/employee/bench/dashboard',
  'junior_bench_sales': '/employee/bench/dashboard',

  // Talent Acquisition
  'talent_acquisition': '/employee/ta/dashboard',
  'senior_ta': '/employee/ta/dashboard',
  'junior_ta': '/employee/ta/dashboard',

  // HR
  'hr_manager': '/employee/hr/dashboard',
  'hr_specialist': '/employee/hr/dashboard',

  // Immigration
  'immigration_specialist': '/employee/immigration/dashboard',

  // Training Academy
  'trainer': '/employee/academy/admin/dashboard',
  'academy_admin': '/employee/academy/admin/dashboard',
};

// Default fallback for employees without specific roles
const DEFAULT_EMPLOYEE_DASHBOARD = '/employee/shared/combined';

export default async function EmployeeDashboardPage() {
  // Ensure user is authenticated
  await requireAuth('/auth/employee');

  // Get user roles
  const roles = await getUserRoles();

  // Debug logging
  console.log('🔍 Employee Dashboard Router - User Roles:', roles);
  console.log('🔍 Available Role Mappings:', Object.keys(ROLE_DASHBOARDS));

  // Find the first matching role dashboard
  for (const role of roles) {
    const dashboard = ROLE_DASHBOARDS[role];
    console.log(`🔍 Checking role: ${role} -> ${dashboard || 'not found'}`);
    if (dashboard) {
      console.log(`✅ Redirecting to: ${dashboard}`);
      redirect(dashboard);
    }
  }

  // If no specific role found, redirect to shared dashboard
  console.log(`⚠️ No matching role found, redirecting to default: ${DEFAULT_EMPLOYEE_DASHBOARD}`);
  redirect(DEFAULT_EMPLOYEE_DASHBOARD);
}
