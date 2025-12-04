/**
 * QuickActions Component
 *
 * Context-aware quick action dropdown that shows relevant actions
 * based on the current pathname. Used for common operations like
 * creating new entities within a module.
 */

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, ChevronDown } from 'lucide-react';

// =====================================================
// TYPES
// =====================================================

interface QuickAction {
  label: string;
  href: string;
}

// =====================================================
// QUICK ACTIONS BY PATH PREFIX
// =====================================================

const quickActions: Record<string, QuickAction[]> = {
  // Recruiting
  '/employee/recruiting': [
    { label: 'New Job', href: '/employee/recruiting/jobs/new' },
    { label: 'Add Candidate', href: '/employee/recruiting/candidates/new' },
    { label: 'Create Submission', href: '/employee/recruiting/submissions/new' },
    { label: 'New Account', href: '/employee/recruiting/accounts/new' },
  ],

  // Bench Sales
  '/employee/bench': [
    { label: 'Onboard Consultant', href: '/employee/bench/consultants/onboard' },
    { label: 'Create Hotlist', href: '/employee/bench/hotlists/new' },
    { label: 'New Job Order', href: '/employee/bench/job-orders/new' },
  ],

  // HR
  '/employee/hr': [
    { label: 'Add Employee', href: '/employee/hr/employees/new' },
    { label: 'Start Onboarding', href: '/employee/hr/onboarding/new' },
    { label: 'Create Review', href: '/employee/hr/performance/new' },
  ],

  // TA
  '/employee/ta': [
    { label: 'New Lead', href: '/employee/ta/leads/new' },
    { label: 'Create Campaign', href: '/employee/ta/campaigns/new' },
    { label: 'Internal Job', href: '/employee/ta/internal-jobs/new' },
  ],

  // Manager
  '/employee/manager': [
    { label: 'New Task', href: '/employee/manager/tasks/new' },
    { label: 'Schedule 1:1', href: '/employee/manager/1-on-1s/new' },
    { label: 'Create Report', href: '/employee/manager/reports/new' },
  ],

  // Admin
  '/employee/admin': [
    { label: 'Invite User', href: '/employee/admin/users/invite' },
    { label: 'Create Pod', href: '/employee/admin/pods/new' },
    { label: 'New Role', href: '/employee/admin/roles/new' },
  ],

  // Client Portal
  '/client': [
    { label: 'Post Job', href: '/client/jobs/new' },
    { label: 'Schedule Interview', href: '/client/interviews/schedule' },
  ],

  // Talent Portal
  '/talent': [
    { label: 'Update Profile', href: '/talent/profile/edit' },
    { label: 'Browse Jobs', href: '/talent/jobs' },
  ],

  // Academy
  '/training': [
    { label: 'Browse Courses', href: '/training/courses' },
    { label: 'View Progress', href: '/training/my-learning' },
  ],
};

// =====================================================
// COMPONENT
// =====================================================

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Find matching quick actions based on pathname prefix
  const matchingPath = Object.keys(quickActions).find((path) =>
    pathname?.startsWith(path)
  );

  const actions = matchingPath ? quickActions[matchingPath] : [];

  // Don't render if no actions available
  if (actions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={className}>
          <Plus className="mr-2 h-4 w-4" />
          Quick Add
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.href}
            onClick={() => router.push(action.href)}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// =====================================================
// UTILITY EXPORTS
// =====================================================

/**
 * Get quick actions for a specific path
 */
export function getQuickActionsForPath(path: string): QuickAction[] {
  const matchingPath = Object.keys(quickActions).find((prefix) =>
    path.startsWith(prefix)
  );
  return matchingPath ? quickActions[matchingPath] : [];
}

/**
 * Check if quick actions are available for a path
 */
export function hasQuickActions(path: string): boolean {
  return getQuickActionsForPath(path).length > 0;
}

export default QuickActions;
