/**
 * Aligned Types: CRM Module
 *
 * These types bridge the gap between frontend prototype types and database schema.
 */

// ============================================
// ACCOUNT TYPES
// ============================================

export type AccountStatus = 'prospect' | 'active' | 'inactive' | 'churned';
export type AccountType = 'direct_client' | 'vendor' | 'partner' | 'prospect';
export type AccountTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type Responsiveness = 'low' | 'medium' | 'high';
export type PreferredQuality = 'budget' | 'standard' | 'premium';

export interface AlignedAccount {
  id: string;
  orgId: string;

  // Core fields
  name: string;
  industry: string | null;
  companyType: AccountType;
  accountStatus: AccountStatus;
  tier: AccountTier | null;

  // Management
  ownerId: string | null;
  responsiveness: Responsiveness | null;
  preferredQuality: PreferredQuality | null;
  description: string | null;

  // Business terms
  contractStartDate: Date | null;
  contractEndDate: Date | null;
  paymentTermsDays: number;
  markupPercentage: number | null;
  annualRevenueTarget: number | null;

  // Contact
  website: string | null;
  headquartersLocation: string | null;
  phone: string | null;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: Date | null;

  // Relations (optional)
  owner?: { id: string; fullName: string };
  pocs?: AlignedPointOfContact[];
  _count?: {
    jobs: number;
    placements: number;
    deals: number;
  };
}

// Frontend-compatible account
export interface DisplayAccount {
  id: string;
  name: string;
  industry: string;
  status: 'Prospect' | 'Active' | 'Churned' | 'Hold';
  type: 'Direct Client' | 'MSP/VMS' | 'Implementation Partner';
  accountManagerId: string;
  logo?: string;
  responsiveness: 'High' | 'Medium' | 'Low';
  preference: 'Quality' | 'Quantity' | 'Speed';
  description?: string;
  pocs: DisplayPointOfContact[];
  activityLog?: { date: string; action: string; note?: string }[];
  // Extended
  tier?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  paymentTermsDays?: number;
  markupPercentage?: number;
  jobsCount?: number;
  placementsCount?: number;
}

// ============================================
// POINT OF CONTACT TYPES
// ============================================

export type POCRole = 'hiring_manager' | 'recruiter' | 'hr_director' | 'vp' | 'c_level' | 'other';
export type ContactMethod = 'email' | 'phone' | 'linkedin';
export type DecisionAuthority = 'none' | 'influencer' | 'decision_maker' | 'final_approver';

export interface AlignedPointOfContact {
  id: string;
  accountId: string;
  orgId: string;

  // Core fields
  firstName: string;
  lastName: string;
  title: string | null;
  role: POCRole | null;

  // Contact
  email: string;
  phone: string | null;
  linkedinUrl: string | null;
  preferredContactMethod: ContactMethod;

  // Influence
  decisionAuthority: DecisionAuthority | null;
  notes: string | null;

  // Status
  isPrimary: boolean;
  isActive: boolean;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  deletedAt: Date | null;
}

// Frontend-compatible POC
export interface DisplayPointOfContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  preference: 'Email' | 'Phone' | 'Text';
  influence: 'Decision Maker' | 'Influencer' | 'Gatekeeper';
}

// ============================================
// LEAD TYPES
// ============================================

export type LeadType = 'company' | 'contact';
export type LeadStatus = 'new' | 'warm' | 'hot' | 'cold' | 'converted' | 'lost';
export type LeadSource = 'inbound' | 'outbound' | 'referral' | 'campaign' | 'event' | 'linkedin' | 'other';
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';

export interface AlignedLead {
  id: string;
  orgId: string;

  // Lead type
  leadType: LeadType;

  // Company fields
  companyName: string | null;
  industry: string | null;
  companySize: CompanySize | null;

  // Contact fields
  firstName: string | null;
  lastName: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;

  // Status
  status: LeadStatus;
  estimatedValue: number | null;

  // Source tracking
  source: LeadSource | null;
  sourceCampaignId: string | null;

  // Assignment
  ownerId: string | null;

  // Engagement
  lastContactedAt: Date | null;
  lastResponseAt: Date | null;
  engagementScore: number | null;

  // Conversion
  convertedToDealId: string | null;
  convertedToAccountId: string | null;
  convertedAt: Date | null;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  deletedAt: Date | null;

  // Relations
  owner?: { id: string; fullName: string };
  account?: { id: string; name: string };
}

// Frontend-compatible lead
export interface DisplayLead {
  id: string;
  company: string;
  firstName: string;
  lastName: string;
  title: string;
  email?: string;
  phone?: string;
  status: 'new' | 'cold' | 'warm' | 'hot' | 'converted';
  value?: string;
  source?: string;
  lastAction?: string;
  notes?: string;
  contact: string;
  // Extended
  industry?: string;
  companySize?: string;
  engagementScore?: number;
}

// ============================================
// DEAL TYPES
// ============================================

export type DealStage = 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface AlignedDeal {
  id: string;
  orgId: string;

  // Associations
  leadId: string | null;
  accountId: string | null;

  // Deal details
  title: string;
  description: string | null;
  dealValue: number;

  // Pipeline
  stage: DealStage;
  probability: number | null;
  expectedCloseDate: Date | null;
  actualCloseDate: Date | null;

  // Close
  closeReason: string | null;

  // Source
  leadSource: string | null;

  // Assignment
  ownerId: string;

  // Linked jobs
  linkedJobIds: string[];

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  deletedAt: Date | null;

  // Relations
  owner?: { id: string; fullName: string };
  account?: { id: string; name: string };
  lead?: { id: string; companyName: string | null };
}

// Frontend-compatible deal
export interface DisplayDeal {
  id: string;
  leadId: string;
  company: string;
  title: string;
  value: string;
  stage: 'Prospect' | 'Discovery' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  probability: number;
  expectedClose: string;
  ownerId: string;
  notes?: string;
  // Extended
  accountId?: string;
  linkedJobIds?: string[];
}

// ============================================
// ACTIVITY LOG TYPES
// ============================================

export type ActivityEntityType = 'account' | 'lead' | 'deal' | 'poc' | 'submission' | 'candidate';
export type ActivityType = 'email' | 'call' | 'meeting' | 'note' | 'linkedin_message' | 'task' | 'status_change';
export type ActivityDirection = 'inbound' | 'outbound';
export type ActivityOutcome = 'positive' | 'neutral' | 'negative';

export interface AlignedActivityLog {
  id: string;
  orgId: string;

  // Entity reference (polymorphic)
  entityType: ActivityEntityType;
  entityId: string;

  // Activity details
  activityType: ActivityType;
  subject: string | null;
  description: string | null;
  direction: ActivityDirection | null;

  // Participants
  performedBy: string;
  pocId: string | null;

  // Metadata
  activityDate: Date;
  durationMinutes: number | null;
  outcome: ActivityOutcome | null;
  nextAction: string | null;
  nextActionDate: Date | null;

  // Extra data
  metadata: Record<string, unknown> | null;

  // Audit
  createdAt: Date;

  // Relations
  performer?: { id: string; fullName: string };
  poc?: { id: string; firstName: string; lastName: string };
}

// Timeline entry for display
export interface TimelineEntry {
  id: string;
  type: string;
  icon: string;
  title: string;
  description?: string;
  date: string;
  performer?: string;
  outcome?: string;
}

// ============================================
// LIST RESPONSE TYPES
// ============================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface AccountListResponse extends PaginatedResponse<AlignedAccount> {}
export interface LeadListResponse extends PaginatedResponse<AlignedLead> {}
export interface DealListResponse extends PaginatedResponse<AlignedDeal> {}
export interface POCListResponse extends PaginatedResponse<AlignedPointOfContact> {}
export interface ActivityListResponse extends PaginatedResponse<AlignedActivityLog> {}

// ============================================
// PIPELINE TYPES
// ============================================

export interface DealPipelineSummary {
  stage: DealStage;
  count: number;
  totalValue: number;
}

export interface DealForecast {
  month: string;
  expectedValue: number;
  weightedValue: number;
  dealCount: number;
}
