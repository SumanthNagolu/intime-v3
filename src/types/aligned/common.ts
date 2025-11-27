/**
 * Aligned Types: Common/Shared Types
 *
 * Shared types used across multiple modules.
 */

// ============================================
// PAGINATION
// ============================================

export interface PaginationInput {
  limit?: number;
  offset?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

// ============================================
// SORTING
// ============================================

export type SortOrder = 'asc' | 'desc';

export interface SortInput {
  field: string;
  order: SortOrder;
}

// ============================================
// USER TYPES
// ============================================

export interface UserReference {
  id: string;
  fullName: string;
  email?: string;
  avatarUrl?: string;
}

// ============================================
// ORGANIZATION
// ============================================

export interface OrganizationReference {
  id: string;
  name: string;
  slug: string;
}

// ============================================
// FILE REFERENCES
// ============================================

export interface FileReference {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedBy: string;
}

// ============================================
// DATE RANGES
// ============================================

export interface DateRange {
  from: Date;
  to: Date;
}

// ============================================
// AUDIT FIELDS
// ============================================

export interface AuditFields {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy?: string | null;
  deletedAt: Date | null;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface MutationResponse<T> {
  success: boolean;
  item?: T;
  error?: string;
}

// ============================================
// SEARCH
// ============================================

export interface SearchResult<T> {
  items: T[];
  total: number;
  highlights?: Record<string, string[]>;
}

export interface GlobalSearchResult {
  jobs: { id: string; title: string; client: string }[];
  candidates: { id: string; name: string; role: string }[];
  accounts: { id: string; name: string; industry: string }[];
  leads: { id: string; company: string; contact: string }[];
}

// ============================================
// FILTER TYPES
// ============================================

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface ActiveFilter {
  field: string;
  value: string | string[] | boolean | number;
  operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// ROLE & PERMISSION TYPES
// ============================================

export type SystemRole =
  | 'super_admin'
  | 'admin'
  | 'recruiter'
  | 'bench_sales'
  | 'trainer'
  | 'student'
  | 'employee'
  | 'candidate'
  | 'client'
  | 'hr_manager';

export interface UserRole {
  id: string;
  name: string;
  displayName: string;
  isPrimary: boolean;
}

export interface Permission {
  resource: string;
  action: string;
  scope: 'own' | 'team' | 'pod' | 'department' | 'all';
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface MetricCard {
  label: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

// ============================================
// STATUS MAPPING UTILITIES
// ============================================

// These help with frontend<->backend status transformations
export const JOB_STATUS_MAP = {
  toFrontend: {
    'draft': 'draft',
    'open': 'open',
    'on_hold': 'hold',
    'filled': 'filled',
    'cancelled': 'draft',
  },
  toDatabase: {
    'draft': 'draft',
    'open': 'open',
    'urgent': 'open',
    'hold': 'on_hold',
    'filled': 'filled',
  },
} as const;

export const ACCOUNT_STATUS_MAP = {
  toFrontend: {
    'prospect': 'Prospect',
    'active': 'Active',
    'inactive': 'Hold',
    'churned': 'Churned',
  },
  toDatabase: {
    'Prospect': 'prospect',
    'Active': 'active',
    'Hold': 'inactive',
    'Churned': 'churned',
  },
} as const;

export const DEAL_STAGE_MAP = {
  toFrontend: {
    'discovery': 'Discovery',
    'qualification': 'Discovery',
    'proposal': 'Proposal',
    'negotiation': 'Negotiation',
    'closed_won': 'Won',
    'closed_lost': 'Lost',
  },
  toDatabase: {
    'Prospect': 'discovery',
    'Discovery': 'discovery',
    'Proposal': 'proposal',
    'Negotiation': 'negotiation',
    'Won': 'closed_won',
    'Lost': 'closed_lost',
  },
} as const;
