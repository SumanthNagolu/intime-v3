/**
 * Unified Workspace Dynamic Route
 *
 * Renders the appropriate workspace component based on entity type
 * URL Pattern: /employee/workspace/[type]/[id]
 *
 * Examples:
 * - /employee/workspace/leads/123
 * - /employee/workspace/deals/456
 * - /employee/workspace/jobs/789
 * - /employee/workspace/talent/abc
 *
 * Query Parameters:
 * - v2=true: Use new modular workspace architecture (UnifiedJobWorkspace, etc.)
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import {
  // Legacy workspaces
  LeadsWorkspace,
  DealsWorkspace,
  AccountsWorkspace,
  ContactsWorkspace,
  JobsWorkspace,
  SubmissionsWorkspace,
  TalentWorkspace,
  JobOrdersWorkspace,
  CampaignsWorkspace,
  // New modular workspaces (v2)
  UnifiedJobWorkspace,
  UnifiedTalentWorkspace,
  UnifiedSubmissionWorkspace,
} from '@/components/workspaces';

// Valid workspace types
const WORKSPACE_TYPES = {
  leads: 'lead',
  lead: 'lead',
  deals: 'deal',
  deal: 'deal',
  accounts: 'account',
  account: 'account',
  contacts: 'contact',
  contact: 'contact',
  jobs: 'job',
  job: 'job',
  submissions: 'submission',
  submission: 'submission',
  talent: 'talent',
  candidates: 'talent',
  candidate: 'talent',
  'job-orders': 'job_order',
  job_orders: 'job_order',
  job_order: 'job_order',
  campaigns: 'campaign',
  campaign: 'campaign',
} as const;

type WorkspaceType = keyof typeof WORKSPACE_TYPES;

// Map entity types to workspace components (legacy)
const WorkspaceComponents = {
  lead: LeadsWorkspace,
  deal: DealsWorkspace,
  account: AccountsWorkspace,
  contact: ContactsWorkspace,
  job: JobsWorkspace,
  submission: SubmissionsWorkspace,
  talent: TalentWorkspace,
  job_order: JobOrdersWorkspace,
  campaign: CampaignsWorkspace,
} as const;

// Map entity types to unified workspace components (v2 modular architecture)
const UnifiedWorkspaceComponents = {
  job: UnifiedJobWorkspace,
  submission: UnifiedSubmissionWorkspace,
  talent: UnifiedTalentWorkspace,
  // Others will fall back to legacy
} as const;

type UnifiedEntityType = keyof typeof UnifiedWorkspaceComponents;

// Loading component
function WorkspaceLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rust" />
    </div>
  );
}

// Generate static params for common types (optional optimization)
export function generateStaticParams() {
  return [];
}

// Generate metadata based on type
export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  const normalizedType = WORKSPACE_TYPES[type as WorkspaceType];

  if (!normalizedType) {
    return { title: 'Not Found' };
  }

  const titles: Record<string, string> = {
    lead: 'Lead',
    deal: 'Deal',
    account: 'Account',
    contact: 'Contact',
    job: 'Job',
    submission: 'Submission',
    talent: 'Talent',
    job_order: 'Job Order',
    campaign: 'Campaign',
  };

  return {
    title: `${titles[normalizedType]} | InTime v3`,
    description: `View and manage ${titles[normalizedType].toLowerCase()} details`,
  };
}

// Main page component
export default async function WorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string; id: string }>;
  searchParams: Promise<{ v2?: string }>;
}) {
  const { type, id } = await params;
  const resolvedSearchParams = await searchParams;
  const useV2 = resolvedSearchParams?.v2 === 'true';

  // Normalize the type (handle both singular and plural)
  const normalizedType = WORKSPACE_TYPES[type as WorkspaceType];

  if (!normalizedType) {
    notFound();
  }

  // Check if v2 modular workspace is requested and available
  const hasUnifiedWorkspace = normalizedType in UnifiedWorkspaceComponents;

  if (useV2 && hasUnifiedWorkspace) {
    // Use new modular workspace architecture
    const UnifiedComponent = UnifiedWorkspaceComponents[normalizedType as UnifiedEntityType];

    // Unified workspaces use consistent prop names
    const propMap: Record<UnifiedEntityType, string> = {
      job: 'jobId',
      talent: 'talentId',
      submission: 'submissionId',
    };

    const propName = propMap[normalizedType as UnifiedEntityType];

    return (
      <Suspense fallback={<WorkspaceLoading />}>
        <UnifiedComponent {...{ [propName]: id } as any} />
      </Suspense>
    );
  }

  // Fall back to legacy workspace components
  const WorkspaceComponent = WorkspaceComponents[normalizedType as keyof typeof WorkspaceComponents];

  if (!WorkspaceComponent) {
    notFound();
  }

  // Map prop names based on entity type for legacy components
  const propName = `${normalizedType}Id` as const;

  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <WorkspaceComponent {...{ [propName]: id } as any} />
    </Suspense>
  );
}
