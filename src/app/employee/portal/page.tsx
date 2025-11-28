export const dynamic = "force-dynamic";

import { EmployeePortal } from '@/components/employee/EmployeePortal';
import { requirePortalAccess } from '@/lib/auth/server';
import { createAdminClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'InTime OS - Employee Portal | InTime',
  description: 'Internal operations hub for InTime employees',
};

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  // Require authentication and employee portal access (handles all validation + redirects)
  const { user, roles } = await requirePortalAccess('employee');

  // Get user profile for display name using admin client
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, email')
    .eq('auth_id', user!.id)
    .is('deleted_at', null)
    .single();

  // Determine primary role (first match in priority order)
  const rolePriority = [
    'super_admin', 'ceo', 'admin',
    'hr_admin', 'hr_manager',
    'academy_admin',
    'ta_specialist', 'talent_acquisition',
    'bench_manager', 'bench_sales',
    'recruiter', 'senior_recruiter', 'junior_recruiter',
    'trainer', 'training_coordinator',
    'immigration_specialist',
    'employee'
  ];
  const primaryRole = rolePriority.find(role => roles.includes(role)) || roles[0] || undefined;

  const userName = profile?.full_name || profile?.email?.split('@')[0] || user?.email?.split('@')[0];

  return (
    <EmployeePortal
      userRole={primaryRole}
      userName={userName}
      userRoles={roles}
      error={params.error}
    />
  );
}
