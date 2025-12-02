/**
 * Entity Registry
 *
 * Standardizes entity configurations across the unified workspace.
 * Each entity type defines its display properties, data hooks, and routes.
 */

import {
  Target,
  Building2,
  DollarSign,
  Briefcase,
  User,
  Send,
  Users,
  FileText,
  type LucideIcon,
} from 'lucide-react';

// =====================================================
// TYPES
// =====================================================

export type EntityType =
  | 'lead'
  | 'account'
  | 'deal'
  | 'job'
  | 'talent'
  | 'submission'
  | 'contact'
  | 'job_order'
  // HR entity types
  | 'employee'
  | 'onboarding'
  | 'timeoff'
  | 'payroll'
  | 'benefit_plan'
  | 'performance'
  | 'compliance'
  | 'pod';

export interface EntityStatus {
  label: string;
  color: string;
  bgColor: string;
}

export interface EntityConfig {
  // Identity
  type: EntityType;
  name: string;
  pluralName: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;

  // Status mapping
  statuses: Record<string, EntityStatus>;

  // Display functions
  getTitle: (entity: Record<string, unknown>) => string;
  getSubtitle: (entity: Record<string, unknown>) => string | null;
  getStatus: (entity: Record<string, unknown>) => EntityStatus | null;
  getAvatarUrl?: (entity: Record<string, unknown>) => string | null;
  getInitials?: (entity: Record<string, unknown>) => string;

  // Relationships
  relatedTypes: EntityType[];

  // Routes
  routes: {
    list: string;
    detail: (id: string) => string;
    graph?: (id: string) => string;
  };

  // Search keys for filtering
  searchKeys: string[];
}

// =====================================================
// STATUS DEFINITIONS
// =====================================================

const LEAD_STATUSES: Record<string, EntityStatus> = {
  new: { label: 'New', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  warm: { label: 'Warm', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  hot: { label: 'Hot', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  cold: { label: 'Cold', color: 'text-stone-500', bgColor: 'bg-stone-100' },
  converted: { label: 'Converted', color: 'text-green-700', bgColor: 'bg-green-100' },
  lost: { label: 'Lost', color: 'text-red-700', bgColor: 'bg-red-100' },
};

const ACCOUNT_STATUSES: Record<string, EntityStatus> = {
  prospect: { label: 'Prospect', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  active: { label: 'Active', color: 'text-green-700', bgColor: 'bg-green-100' },
  inactive: { label: 'Inactive', color: 'text-stone-500', bgColor: 'bg-stone-100' },
  churned: { label: 'Churned', color: 'text-red-700', bgColor: 'bg-red-100' },
};

const DEAL_STATUSES: Record<string, EntityStatus> = {
  discovery: { label: 'Discovery', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  qualification: { label: 'Qualification', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  proposal: { label: 'Proposal', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  negotiation: { label: 'Negotiation', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  closed_won: { label: 'Won', color: 'text-green-700', bgColor: 'bg-green-100' },
  closed_lost: { label: 'Lost', color: 'text-red-700', bgColor: 'bg-red-100' },
};

const JOB_STATUSES: Record<string, EntityStatus> = {
  draft: { label: 'Draft', color: 'text-stone-500', bgColor: 'bg-stone-100' },
  open: { label: 'Open', color: 'text-green-700', bgColor: 'bg-green-100' },
  urgent: { label: 'Urgent', color: 'text-red-700', bgColor: 'bg-red-100' },
  on_hold: { label: 'On Hold', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  filled: { label: 'Filled', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  cancelled: { label: 'Cancelled', color: 'text-stone-500', bgColor: 'bg-stone-100' },
};

const TALENT_STATUSES: Record<string, EntityStatus> = {
  active: { label: 'Active', color: 'text-green-700', bgColor: 'bg-green-100' },
  placed: { label: 'Placed', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  bench: { label: 'On Bench', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  inactive: { label: 'Inactive', color: 'text-stone-500', bgColor: 'bg-stone-100' },
  blacklisted: { label: 'Blacklisted', color: 'text-red-700', bgColor: 'bg-red-100' },
};

const SUBMISSION_STATUSES: Record<string, EntityStatus> = {
  sourced: { label: 'Sourced', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  screening: { label: 'Screening', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  vendor_pending: { label: 'Vendor Pending', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  submitted_to_client: { label: 'Submitted', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  client_review: { label: 'Client Review', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  client_interview: { label: 'Interview', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  offer_stage: { label: 'Offer', color: 'text-pink-700', bgColor: 'bg-pink-100' },
  placed: { label: 'Placed', color: 'text-green-700', bgColor: 'bg-green-100' },
  rejected: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100' },
  withdrawn: { label: 'Withdrawn', color: 'text-stone-500', bgColor: 'bg-stone-100' },
};

// =====================================================
// ENTITY CONFIGURATIONS
// =====================================================

export const entityRegistry: Record<EntityType, EntityConfig> = {
  lead: {
    type: 'lead',
    name: 'Lead',
    pluralName: 'Leads',
    icon: Target,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    statuses: LEAD_STATUSES,
    getTitle: (entity) => (entity.companyName as string) || (entity.title as string) || 'Unknown Lead',
    getSubtitle: (entity) => (entity.contactName as string) || null,
    getStatus: (entity) => LEAD_STATUSES[(entity.status as string)?.toLowerCase()] || null,
    getInitials: (entity) => {
      const name = (entity.companyName as string) || (entity.title as string) || '?';
      return name.substring(0, 2).toUpperCase();
    },
    relatedTypes: ['account', 'deal', 'contact'],
    routes: {
      list: '/employee/workspace/leads',
      detail: (id) => `/employee/workspace/leads/${id}`,
      graph: (id) => `/employee/workspace/leads/${id}/graph`,
    },
    searchKeys: ['companyName', 'title', 'contactName', 'email'],
  },

  account: {
    type: 'account',
    name: 'Account',
    pluralName: 'Accounts',
    icon: Building2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    statuses: ACCOUNT_STATUSES,
    getTitle: (entity) => (entity.name as string) || 'Unknown Account',
    getSubtitle: (entity) => (entity.industry as string) || null,
    getStatus: (entity) => ACCOUNT_STATUSES[(entity.status as string)?.toLowerCase()] || null,
    getInitials: (entity) => {
      const name = (entity.name as string) || '?';
      return name.substring(0, 2).toUpperCase();
    },
    relatedTypes: ['lead', 'deal', 'job', 'contact', 'submission'],
    routes: {
      list: '/employee/workspace/accounts',
      detail: (id) => `/employee/workspace/accounts/${id}`,
      graph: (id) => `/employee/workspace/accounts/${id}/graph`,
    },
    searchKeys: ['name', 'industry', 'website'],
  },

  deal: {
    type: 'deal',
    name: 'Deal',
    pluralName: 'Deals',
    icon: DollarSign,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    statuses: DEAL_STATUSES,
    getTitle: (entity) => (entity.title as string) || 'Unknown Deal',
    getSubtitle: (entity) => {
      const value = entity.value as number;
      return value ? `$${value.toLocaleString()}` : null;
    },
    getStatus: (entity) => DEAL_STATUSES[(entity.stage as string)?.toLowerCase()] || null,
    getInitials: (entity) => {
      const title = (entity.title as string) || '?';
      return title.substring(0, 2).toUpperCase();
    },
    relatedTypes: ['lead', 'account', 'job', 'contact'],
    routes: {
      list: '/employee/workspace/deals',
      detail: (id) => `/employee/workspace/deals/${id}`,
      graph: (id) => `/employee/workspace/deals/${id}/graph`,
    },
    searchKeys: ['title', 'description'],
  },

  job: {
    type: 'job',
    name: 'Job',
    pluralName: 'Jobs',
    icon: Briefcase,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    statuses: JOB_STATUSES,
    getTitle: (entity) => (entity.title as string) || 'Unknown Job',
    getSubtitle: (entity) => {
      const location = entity.location as string;
      const rateMin = entity.rateMin as number;
      const rateMax = entity.rateMax as number;
      const parts: string[] = [];
      if (location) parts.push(location);
      if (rateMin && rateMax) parts.push(`$${rateMin}-$${rateMax}/hr`);
      return parts.length > 0 ? parts.join(' | ') : null;
    },
    getStatus: (entity) => JOB_STATUSES[(entity.status as string)?.toLowerCase()] || null,
    getInitials: (entity) => {
      const title = (entity.title as string) || '?';
      return title.substring(0, 2).toUpperCase();
    },
    relatedTypes: ['account', 'deal', 'submission', 'talent'],
    routes: {
      list: '/employee/workspace/jobs',
      detail: (id) => `/employee/workspace/jobs/${id}`,
      graph: (id) => `/employee/workspace/jobs/${id}/graph`,
    },
    searchKeys: ['title', 'description', 'location', 'requiredSkills'],
  },

  talent: {
    type: 'talent',
    name: 'Talent',
    pluralName: 'Talent',
    icon: User,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    statuses: TALENT_STATUSES,
    getTitle: (entity) => {
      const firstName = entity.firstName as string;
      const lastName = entity.lastName as string;
      if (firstName && lastName) return `${firstName} ${lastName}`;
      return (entity.name as string) || 'Unknown Talent';
    },
    getSubtitle: (entity) => (entity.professionalHeadline as string) || (entity.email as string) || null,
    getStatus: (entity) => TALENT_STATUSES[(entity.candidateStatus as string)?.toLowerCase()] || null,
    getAvatarUrl: (entity) => (entity.profilePictureUrl as string) || null,
    getInitials: (entity) => {
      const firstName = (entity.firstName as string) || '';
      const lastName = (entity.lastName as string) || '';
      if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
      const name = (entity.name as string) || '?';
      return name.substring(0, 2).toUpperCase();
    },
    relatedTypes: ['submission', 'job', 'account'],
    routes: {
      list: '/employee/workspace/talent',
      detail: (id) => `/employee/workspace/talent/${id}`,
      graph: (id) => `/employee/workspace/talent/${id}/graph`,
    },
    searchKeys: ['firstName', 'lastName', 'email', 'candidateSkills', 'professionalHeadline'],
  },

  submission: {
    type: 'submission',
    name: 'Submission',
    pluralName: 'Submissions',
    icon: Send,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    statuses: SUBMISSION_STATUSES,
    getTitle: (entity) => {
      const candidateName = entity.candidateName as string;
      const jobTitle = entity.jobTitle as string;
      if (candidateName && jobTitle) return `${candidateName} → ${jobTitle}`;
      return 'Unknown Submission';
    },
    getSubtitle: (entity) => {
      const matchScore = entity.aiMatchScore as number;
      return matchScore ? `Match: ${matchScore}%` : null;
    },
    getStatus: (entity) => SUBMISSION_STATUSES[(entity.status as string)?.toLowerCase()] || null,
    getInitials: (entity) => {
      const candidateName = (entity.candidateName as string) || '?';
      return candidateName.substring(0, 2).toUpperCase();
    },
    relatedTypes: ['talent', 'job', 'account'],
    routes: {
      list: '/employee/workspace/submissions',
      detail: (id) => `/employee/workspace/submissions/${id}`,
    },
    searchKeys: ['candidateName', 'jobTitle'],
  },

  contact: {
    type: 'contact',
    name: 'Contact',
    pluralName: 'Contacts',
    icon: Users,
    color: 'text-stone-600',
    bgColor: 'bg-stone-100',
    statuses: {
      active: { label: 'Active', color: 'text-green-700', bgColor: 'bg-green-100' },
      inactive: { label: 'Inactive', color: 'text-stone-500', bgColor: 'bg-stone-100' },
    },
    getTitle: (entity) => {
      const firstName = entity.firstName as string;
      const lastName = entity.lastName as string;
      if (firstName && lastName) return `${firstName} ${lastName}`;
      return (entity.name as string) || 'Unknown Contact';
    },
    getSubtitle: (entity) => (entity.title as string) || (entity.email as string) || null,
    getStatus: (entity) => {
      const status = (entity.status as string)?.toLowerCase();
      return status === 'active'
        ? { label: 'Active', color: 'text-green-700', bgColor: 'bg-green-100' }
        : { label: 'Inactive', color: 'text-stone-500', bgColor: 'bg-stone-100' };
    },
    getInitials: (entity) => {
      const firstName = (entity.firstName as string) || '';
      const lastName = (entity.lastName as string) || '';
      if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
      return '?';
    },
    relatedTypes: ['account', 'lead', 'deal'],
    routes: {
      list: '/employee/workspace/contacts',
      detail: (id) => `/employee/workspace/contacts/${id}`,
    },
    searchKeys: ['firstName', 'lastName', 'email', 'company', 'title'],
  },

  job_order: {
    type: 'job_order',
    name: 'Job Order',
    pluralName: 'Job Orders',
    icon: FileText,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    statuses: JOB_STATUSES, // Reuse job statuses
    getTitle: (entity) => (entity.title as string) || 'Unknown Job Order',
    getSubtitle: (entity) => (entity.clientName as string) || null,
    getStatus: (entity) => JOB_STATUSES[(entity.status as string)?.toLowerCase()] || null,
    getInitials: (entity) => {
      const title = (entity.title as string) || '?';
      return title.substring(0, 2).toUpperCase();
    },
    relatedTypes: ['account', 'talent', 'submission'],
    routes: {
      list: '/employee/workspace/job-orders',
      detail: (id) => `/employee/workspace/job-orders/${id}`,
    },
    searchKeys: ['title', 'clientName', 'description'],
  },
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export function getEntityConfig(type: EntityType): EntityConfig {
  const config = entityRegistry[type];
  if (!config) {
    throw new Error(`Unknown entity type: ${type}`);
  }
  return config;
}

export function getEntityTypes(): EntityType[] {
  return Object.keys(entityRegistry) as EntityType[];
}

export function getEntityIcon(type: EntityType): LucideIcon {
  return entityRegistry[type]?.icon || FileText;
}

export function getEntityColor(type: EntityType): string {
  return entityRegistry[type]?.color || 'text-stone-600';
}

export function getEntityBgColor(type: EntityType): string {
  return entityRegistry[type]?.bgColor || 'bg-stone-100';
}

export function getRelatedEntityTypes(type: EntityType): EntityType[] {
  return entityRegistry[type]?.relatedTypes || [];
}
