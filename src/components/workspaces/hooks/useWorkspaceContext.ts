/**
 * useWorkspaceContext Hook
 *
 * Determines the workspace context from user's primary role
 * This enables context-aware rendering of workspace components
 */

'use client';

import { useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';

// Mock useSession for now - replace with actual auth when available
const useSession = (): { data: any; status: 'loading' | 'authenticated' | 'unauthenticated' } => ({
  data: null,
  status: 'unauthenticated',
});

export type WorkspaceContext = 'recruiting' | 'bench' | 'ta' | 'manager' | 'executive' | 'general';

export interface WorkspaceContextResult {
  context: WorkspaceContext;
  primaryRole: string;
  canEdit: boolean;
  canAssignRCAI: boolean;
  canDelete: boolean;
  isManager: boolean;
  isExecutive: boolean;
  isLoading: boolean;
  userId: string | null;
  orgId: string | null;
}

// Map user roles to workspace contexts
const ROLE_CONTEXT_MAP: Record<string, WorkspaceContext> = {
  // Recruiting roles
  'recruiter': 'recruiting',
  'senior_recruiter': 'recruiting',
  'lead_recruiter': 'recruiting',
  'recruiting_coordinator': 'recruiting',
  'sourcer': 'recruiting',

  // Bench Sales roles
  'bench_sales': 'bench',
  'bench_sales_rep': 'bench',
  'bench_sales_lead': 'bench',
  'account_executive': 'bench',

  // Talent Acquisition roles
  'ta_specialist': 'ta',
  'ta_coordinator': 'ta',
  'ta_manager': 'ta',
  'talent_sourcer': 'ta',

  // Management roles
  'recruiting_manager': 'manager',
  'bench_manager': 'manager',
  'ta_director': 'manager',
  'delivery_manager': 'manager',
  'operations_manager': 'manager',
  'team_lead': 'manager',

  // Executive roles
  'vp_recruiting': 'executive',
  'vp_sales': 'executive',
  'vp_operations': 'executive',
  'ceo': 'executive',
  'coo': 'executive',
  'cfo': 'executive',
  'director': 'executive',

  // Admin roles
  'admin': 'executive',
  'super_admin': 'executive',

  // Default
  'employee': 'general',
  'user': 'general',
};

// Roles that can assign RCAI
const RCAI_ASSIGNABLE_ROLES = [
  'manager', 'executive', 'admin', 'super_admin',
  'recruiting_manager', 'bench_manager', 'ta_director',
  'vp_recruiting', 'vp_sales', 'ceo', 'coo',
  'team_lead', 'director',
];

// Roles that can delete records
const DELETE_CAPABLE_ROLES = [
  'manager', 'executive', 'admin', 'super_admin',
  'recruiting_manager', 'bench_manager', 'ta_director',
  'vp_recruiting', 'ceo', 'director',
];

export function useWorkspaceContext(
  entityType?: string,
  entityId?: string
): WorkspaceContextResult {
  const { data: session, status } = useSession();

  // Get RCAI info if entity provided
  const { data: rcaiData, isLoading: rcaiLoading } = trpc.objectOwners.canAccess.useQuery(
    {
      entityType: entityType as 'lead' | 'deal' | 'account' | 'job' | 'submission' | 'contact' | 'job_order' | 'campaign' | 'external_job',
      entityId: entityId!,
      requiredPermission: 'edit',
    },
    {
      enabled: !!entityType && !!entityId && status === 'authenticated',
    }
  );

  const result = useMemo(() => {
    const isLoading = status === 'loading' || (!!entityId && rcaiLoading);
    const userId = session?.user?.id || null;
    const orgId = (session?.user as { orgId?: string })?.orgId || null;

    // Get user's roles from session
    const userRoles: string[] = (session?.user as { roles?: string[] })?.roles || [];
    const primaryRole = userRoles[0] || 'employee';

    // Determine context from primary role
    const context = ROLE_CONTEXT_MAP[primaryRole.toLowerCase()] || 'general';

    // Check management/executive status
    const isManager = ['manager', 'executive'].includes(context) ||
      userRoles.some(r => RCAI_ASSIGNABLE_ROLES.includes(r.toLowerCase()));
    const isExecutive = context === 'executive';

    // Determine permissions
    const canAssignRCAI = userRoles.some(r =>
      RCAI_ASSIGNABLE_ROLES.includes(r.toLowerCase())
    );

    const canDelete = userRoles.some(r =>
      DELETE_CAPABLE_ROLES.includes(r.toLowerCase())
    );

    // canEdit is true if user has edit permission via RCAI, or is manager/executive
    const canEdit = rcaiData?.hasAccess || isManager || isExecutive;

    return {
      context,
      primaryRole,
      canEdit,
      canAssignRCAI,
      canDelete,
      isManager,
      isExecutive,
      isLoading,
      userId,
      orgId,
    };
  }, [session, status, rcaiData, rcaiLoading, entityId]);

  return result;
}

/**
 * Hook to get tabs based on workspace context
 */
export function useContextTabs(
  context: WorkspaceContext,
  entityType: string
): { id: string; label: string; icon?: string }[] {
  return useMemo(() => {
    const baseTabs = [
      { id: 'overview', label: 'Overview', icon: 'FileText' },
      { id: 'activity', label: 'Activity', icon: 'Activity' },
      { id: 'documents', label: 'Documents', icon: 'FolderOpen' },
    ];

    // Context-specific tabs based on entity type
    switch (entityType) {
      case 'job':
        if (context === 'recruiting') {
          return [
            baseTabs[0],
            { id: 'pipeline', label: 'Candidate Pipeline', icon: 'Users' },
            { id: 'source', label: 'Source Talent', icon: 'Search' },
            { id: 'submissions', label: 'Submissions', icon: 'Send' },
            ...baseTabs.slice(1),
          ];
        }
        if (context === 'bench') {
          return [
            baseTabs[0],
            { id: 'matches', label: 'Matching Talent', icon: 'Sparkles' },
            { id: 'bench-submissions', label: 'Bench Submissions', icon: 'Send' },
            ...baseTabs.slice(1),
          ];
        }
        if (context === 'ta') {
          return [
            baseTabs[0],
            { id: 'campaigns', label: 'Related Campaigns', icon: 'Target' },
            { id: 'leads', label: 'Sourced Leads', icon: 'Users' },
            ...baseTabs.slice(1),
          ];
        }
        break;

      case 'lead':
        if (context === 'ta') {
          return [
            baseTabs[0],
            { id: 'qualification', label: 'BANT Qualification', icon: 'CheckCircle' },
            { id: 'campaigns', label: 'Campaigns', icon: 'Target' },
            { id: 'strategy', label: 'Strategy', icon: 'Lightbulb' },
            ...baseTabs.slice(1),
          ];
        }
        return [
          baseTabs[0],
          { id: 'qualification', label: 'BANT Qualification', icon: 'CheckCircle' },
          { id: 'contacts', label: 'Contacts', icon: 'Users' },
          { id: 'strategy', label: 'Strategy', icon: 'Lightbulb' },
          ...baseTabs.slice(1),
        ];

      case 'deal':
        return [
          baseTabs[0],
          { id: 'pipeline', label: 'Pipeline', icon: 'TrendingUp' },
          { id: 'jobs', label: 'Jobs', icon: 'Briefcase' },
          { id: 'contacts', label: 'Contacts', icon: 'Users' },
          { id: 'proposals', label: 'Proposals', icon: 'FileText' },
          ...baseTabs.slice(1),
        ];

      case 'account':
        if (context === 'recruiting') {
          return [
            baseTabs[0],
            { id: 'jobs', label: 'Jobs', icon: 'Briefcase' },
            { id: 'placements', label: 'Placements', icon: 'UserCheck' },
            { id: 'contacts', label: 'Contacts', icon: 'Users' },
            ...baseTabs.slice(1),
          ];
        }
        if (context === 'bench') {
          return [
            baseTabs[0],
            { id: 'orders', label: 'Job Orders', icon: 'FileText' },
            { id: 'submissions', label: 'Submissions', icon: 'Send' },
            { id: 'contacts', label: 'Contacts', icon: 'Users' },
            ...baseTabs.slice(1),
          ];
        }
        return [
          baseTabs[0],
          { id: 'deals', label: 'Deals', icon: 'TrendingUp' },
          { id: 'jobs', label: 'Jobs', icon: 'Briefcase' },
          { id: 'contacts', label: 'Contacts', icon: 'Users' },
          ...baseTabs.slice(1),
        ];

      case 'submission':
        return [
          baseTabs[0],
          { id: 'candidate', label: 'Candidate', icon: 'User' },
          { id: 'interviews', label: 'Interviews', icon: 'Calendar' },
          { id: 'offers', label: 'Offers', icon: 'Gift' },
          ...baseTabs.slice(1),
        ];

      case 'contact':
        return [
          baseTabs[0],
          { id: 'interactions', label: 'Interactions', icon: 'MessageSquare' },
          { id: 'linked-entities', label: 'Linked Entities', icon: 'Link' },
          ...baseTabs.slice(1),
        ];

      case 'job_order':
        return [
          baseTabs[0],
          { id: 'submissions', label: 'Submissions', icon: 'Send' },
          { id: 'requirements', label: 'Requirements', icon: 'List' },
          { id: 'financials', label: 'Financials', icon: 'DollarSign' },
          ...baseTabs.slice(1),
        ];

      case 'campaign':
        return [
          baseTabs[0],
          { id: 'contacts', label: 'Contacts', icon: 'Users' },
          { id: 'engagement', label: 'Engagement', icon: 'BarChart' },
          { id: 'conversions', label: 'Conversions', icon: 'TrendingUp' },
          ...baseTabs.slice(1),
        ];

      default:
        return baseTabs;
    }

    return baseTabs;
  }, [context, entityType]);
}

/**
 * Hook to get primary action based on context
 */
export function useContextPrimaryAction(
  context: WorkspaceContext,
  entityType: string
): { label: string; icon: string; action: string } | null {
  return useMemo(() => {
    switch (entityType) {
      case 'job':
        if (context === 'recruiting') {
          return { label: 'Source Talent', icon: 'Search', action: 'source-talent' };
        }
        if (context === 'bench') {
          return { label: 'Find Matches', icon: 'Sparkles', action: 'find-matches' };
        }
        if (context === 'ta') {
          return { label: 'Create Campaign', icon: 'Target', action: 'create-campaign' };
        }
        break;

      case 'lead':
        if (context === 'ta') {
          return { label: 'Add to Campaign', icon: 'Target', action: 'add-to-campaign' };
        }
        return { label: 'Qualify Lead', icon: 'CheckCircle', action: 'qualify' };

      case 'deal':
        return { label: 'Create Job', icon: 'Briefcase', action: 'create-job' };

      case 'account':
        return { label: 'Create Job Order', icon: 'FileText', action: 'create-job-order' };

      case 'submission':
        return { label: 'Schedule Interview', icon: 'Calendar', action: 'schedule-interview' };

      case 'contact':
        return { label: 'Log Activity', icon: 'Plus', action: 'log-activity' };

      case 'job_order':
        return { label: 'Submit Candidate', icon: 'Send', action: 'submit-candidate' };

      case 'campaign':
        return { label: 'Add Contacts', icon: 'UserPlus', action: 'add-contacts' };

      default:
        return null;
    }

    return null;
  }, [context, entityType]);
}

export default useWorkspaceContext;
