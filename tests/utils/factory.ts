/**
 * Entity Factories
 * 
 * Provides factory functions for creating test entities with realistic data.
 * Following the specs from docs/specs/10-DATABASE/
 */

import { v4 as uuidv4 } from 'uuid';

// ==========================================
// TYPES (from specs)
// ==========================================

// Activity Types (from 01-ACTIVITIES-EVENTS-FRAMEWORK.md)
export type ActivityType =
  | 'call'
  | 'email'
  | 'meeting'
  | 'task'
  | 'note'
  | 'sms'
  | 'linkedin'
  | 'review'
  | 'document'
  | 'interview'
  | 'submission'
  | 'status_change'
  | 'assignment'
  | 'escalation'
  | 'follow_up'
  | 'custom';

export type ActivityStatus = 'open' | 'in_progress' | 'completed' | 'cancelled' | 'deferred';

export type ActivityPriority = 'critical' | 'high' | 'medium' | 'low';

export type ActivityOutcome =
  | 'successful'
  | 'unsuccessful'
  | 'no_answer'
  | 'left_voicemail'
  | 'rescheduled'
  | 'no_show'
  | 'partial'
  | 'pending_response';

// Job Types (from 01-jobs.md)
export type JobStatus = 'draft' | 'active' | 'on_hold' | 'filled' | 'closed' | 'cancelled';
export type JobPriority = 'critical' | 'high' | 'medium' | 'low';
export type JobType = 'full_time' | 'contract' | 'contract_to_hire' | 'part_time';
export type WorkMode = 'onsite' | 'remote' | 'hybrid';

// Candidate Types (from 02-candidates.md)
export type CandidateStatus = 'active' | 'passive' | 'placed' | 'on_bench' | 'inactive' | 'do_not_contact';

// US Visa Types (from 00-MASTER-FRAMEWORK.md)
export type USVisaType =
  | 'USC'
  | 'GC'
  | 'GC_EAD'
  | 'H1B'
  | 'H1B_TRANSFER'
  | 'H4_EAD'
  | 'L1A'
  | 'L1B'
  | 'L2_EAD'
  | 'OPT'
  | 'OPT_STEM'
  | 'CPT'
  | 'TN'
  | 'E3'
  | 'O1';

// Canada Work Auth Types (from 00-MASTER-FRAMEWORK.md)
export type CanadaWorkAuth =
  | 'CITIZEN'
  | 'PR'
  | 'WORK_PERMIT'
  | 'OWP'
  | 'PGWP'
  | 'LMIA'
  | 'IEC'
  | 'BRIDGING_OWP';

// Submission Types (from 07-submissions.md)
export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'sent_to_client'
  | 'client_review'
  | 'interview_requested'
  | 'interview_scheduled'
  | 'interviewed'
  | 'offer_pending'
  | 'offered'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

// Lead Types (from 05-leads.md)
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost';
export type LeadSource = 'website' | 'referral' | 'linkedin' | 'cold_call' | 'event' | 'other';

// Deal Types (from 06-deals.md)
export type DealStage = 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

// Account Types (from 03-accounts.md)
export type AccountTier = 'enterprise' | 'mid_market' | 'smb' | 'startup';
export type AccountStatus = 'prospect' | 'active' | 'inactive' | 'churned';

// Entity Types (for polymorphic relations)
export type EntityType =
  | 'job'
  | 'candidate'
  | 'submission'
  | 'account'
  | 'contact'
  | 'lead'
  | 'deal'
  | 'placement'
  | 'consultant'
  | 'job_order'
  | 'vendor';

// ==========================================
// FACTORY INTERFACES
// ==========================================

export interface FactoryJob {
  id: string;
  orgId: string;
  accountId: string;
  title: string;
  description: string;
  status: JobStatus;
  priority: JobPriority;
  jobType: JobType;
  workMode: WorkMode;
  location: string;
  billRateMin: number;
  billRateMax: number;
  payRateMin: number;
  payRateMax: number;
  currency: string;
  openings: number;
  ownerId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FactoryCandidate {
  id: string;
  orgId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: CandidateStatus;
  visaType: USVisaType | CanadaWorkAuth;
  visaExpiry?: Date;
  experienceYears: number;
  currentRate: number;
  desiredRate: number;
  location: string;
  ownerId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FactorySubmission {
  id: string;
  orgId: string;
  jobId: string;
  candidateId: string;
  status: SubmissionStatus;
  billRate: number;
  payRate: number;
  margin: number;
  submittedBy: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FactoryActivity {
  id: string;
  orgId: string;
  activityNumber: string;
  type: ActivityType;
  status: ActivityStatus;
  priority: ActivityPriority;
  subject: string;
  description?: string;
  relatedEntityType: EntityType;
  relatedEntityId: string;
  assignedTo: string;
  createdBy: string;
  dueDate?: Date;
  completedAt?: Date;
  outcome?: ActivityOutcome;
  durationMinutes?: number;
  isAutoCreated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FactoryAccount {
  id: string;
  orgId: string;
  name: string;
  industry: string;
  website: string;
  tier: AccountTier;
  status: AccountStatus;
  healthScore: number;
  ownerId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FactoryLead {
  id: string;
  orgId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: LeadSource;
  score: number;
  ownerId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FactoryDeal {
  id: string;
  orgId: string;
  accountId: string;
  leadId?: string;
  name: string;
  stage: DealStage;
  value: number;
  probability: number;
  expectedCloseDate: Date;
  ownerId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// COUNTER FOR UNIQUE NUMBERS
// ==========================================

let counter = {
  activity: 0,
  job: 0,
  candidate: 0,
  submission: 0,
  account: 0,
  lead: 0,
  deal: 0,
};

export function resetCounters(): void {
  counter = {
    activity: 0,
    job: 0,
    candidate: 0,
    submission: 0,
    account: 0,
    lead: 0,
    deal: 0,
  };
}

// ==========================================
// FACTORY FUNCTIONS
// ==========================================

/**
 * Create a test job
 */
export function createJob(overrides: Partial<FactoryJob> = {}): FactoryJob {
  counter.job++;
  const now = new Date();
  
  return {
    id: overrides.id || uuidv4(),
    orgId: overrides.orgId || 'org_test_1',
    accountId: overrides.accountId || uuidv4(),
    title: overrides.title || `Senior Developer ${counter.job}`,
    description: overrides.description || 'Test job description',
    status: overrides.status || 'active',
    priority: overrides.priority || 'medium',
    jobType: overrides.jobType || 'contract',
    workMode: overrides.workMode || 'hybrid',
    location: overrides.location || 'New York, NY',
    billRateMin: overrides.billRateMin ?? 80,
    billRateMax: overrides.billRateMax ?? 100,
    payRateMin: overrides.payRateMin ?? 60,
    payRateMax: overrides.payRateMax ?? 75,
    currency: overrides.currency || 'USD',
    openings: overrides.openings ?? 1,
    ownerId: overrides.ownerId || 'user_owner',
    createdBy: overrides.createdBy || 'user_creator',
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
  };
}

/**
 * Create a test candidate
 */
export function createCandidate(overrides: Partial<FactoryCandidate> = {}): FactoryCandidate {
  counter.candidate++;
  const now = new Date();
  const firstName = overrides.firstName || `John${counter.candidate}`;
  const lastName = overrides.lastName || 'Doe';
  
  return {
    id: overrides.id || uuidv4(),
    orgId: overrides.orgId || 'org_test_1',
    firstName,
    lastName,
    email: overrides.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    phone: overrides.phone || '+1234567890',
    status: overrides.status || 'active',
    visaType: overrides.visaType || 'H1B',
    visaExpiry: overrides.visaExpiry,
    experienceYears: overrides.experienceYears ?? 5,
    currentRate: overrides.currentRate ?? 70,
    desiredRate: overrides.desiredRate ?? 80,
    location: overrides.location || 'San Francisco, CA',
    ownerId: overrides.ownerId || 'user_owner',
    createdBy: overrides.createdBy || 'user_creator',
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
  };
}

/**
 * Create a test submission
 */
export function createSubmission(overrides: Partial<FactorySubmission> = {}): FactorySubmission {
  counter.submission++;
  const now = new Date();
  const billRate = overrides.billRate ?? 95;
  const payRate = overrides.payRate ?? 72;
  
  return {
    id: overrides.id || uuidv4(),
    orgId: overrides.orgId || 'org_test_1',
    jobId: overrides.jobId || uuidv4(),
    candidateId: overrides.candidateId || uuidv4(),
    status: overrides.status || 'submitted',
    billRate,
    payRate,
    margin: overrides.margin ?? ((billRate - payRate) / billRate) * 100,
    submittedBy: overrides.submittedBy || 'user_submitter',
    submittedAt: overrides.submittedAt || now,
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
  };
}

/**
 * Create a test activity
 */
export function createActivity(overrides: Partial<FactoryActivity> = {}): FactoryActivity {
  counter.activity++;
  const now = new Date();
  
  return {
    id: overrides.id || uuidv4(),
    orgId: overrides.orgId || 'org_test_1',
    activityNumber: overrides.activityNumber || `ACT-2025-${String(counter.activity).padStart(5, '0')}`,
    type: overrides.type || 'call',
    status: overrides.status || 'open',
    priority: overrides.priority || 'medium',
    subject: overrides.subject || `Test activity ${counter.activity}`,
    description: overrides.description,
    relatedEntityType: overrides.relatedEntityType || 'candidate',
    relatedEntityId: overrides.relatedEntityId || uuidv4(),
    assignedTo: overrides.assignedTo || 'user_assigned',
    createdBy: overrides.createdBy || 'user_creator',
    dueDate: overrides.dueDate,
    completedAt: overrides.completedAt,
    outcome: overrides.outcome,
    durationMinutes: overrides.durationMinutes,
    isAutoCreated: overrides.isAutoCreated ?? false,
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
  };
}

/**
 * Create a test account
 */
export function createAccount(overrides: Partial<FactoryAccount> = {}): FactoryAccount {
  counter.account++;
  const now = new Date();
  
  return {
    id: overrides.id || uuidv4(),
    orgId: overrides.orgId || 'org_test_1',
    name: overrides.name || `Acme Corp ${counter.account}`,
    industry: overrides.industry || 'Technology',
    website: overrides.website || `https://acme${counter.account}.com`,
    tier: overrides.tier || 'mid_market',
    status: overrides.status || 'active',
    healthScore: overrides.healthScore ?? 75,
    ownerId: overrides.ownerId || 'user_owner',
    createdBy: overrides.createdBy || 'user_creator',
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
  };
}

/**
 * Create a test lead
 */
export function createLead(overrides: Partial<FactoryLead> = {}): FactoryLead {
  counter.lead++;
  const now = new Date();
  
  return {
    id: overrides.id || uuidv4(),
    orgId: overrides.orgId || 'org_test_1',
    companyName: overrides.companyName || `Lead Company ${counter.lead}`,
    contactName: overrides.contactName || `Contact ${counter.lead}`,
    email: overrides.email || `lead${counter.lead}@example.com`,
    phone: overrides.phone || '+1987654321',
    status: overrides.status || 'new',
    source: overrides.source || 'website',
    score: overrides.score ?? 50,
    ownerId: overrides.ownerId || 'user_owner',
    createdBy: overrides.createdBy || 'user_creator',
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
  };
}

/**
 * Create a test deal
 */
export function createDeal(overrides: Partial<FactoryDeal> = {}): FactoryDeal {
  counter.deal++;
  const now = new Date();
  const closeDate = new Date();
  closeDate.setDate(closeDate.getDate() + 30);
  
  return {
    id: overrides.id || uuidv4(),
    orgId: overrides.orgId || 'org_test_1',
    accountId: overrides.accountId || uuidv4(),
    leadId: overrides.leadId,
    name: overrides.name || `Deal ${counter.deal}`,
    stage: overrides.stage || 'discovery',
    value: overrides.value ?? 50000,
    probability: overrides.probability ?? 20,
    expectedCloseDate: overrides.expectedCloseDate || closeDate,
    ownerId: overrides.ownerId || 'user_owner',
    createdBy: overrides.createdBy || 'user_creator',
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
  };
}

// ==========================================
// BULK FACTORIES
// ==========================================

/**
 * Create multiple jobs
 */
export function createJobs(count: number, overrides: Partial<FactoryJob> = {}): FactoryJob[] {
  return Array.from({ length: count }, () => createJob(overrides));
}

/**
 * Create multiple candidates
 */
export function createCandidates(count: number, overrides: Partial<FactoryCandidate> = {}): FactoryCandidate[] {
  return Array.from({ length: count }, () => createCandidate(overrides));
}

/**
 * Create multiple activities
 */
export function createActivities(count: number, overrides: Partial<FactoryActivity> = {}): FactoryActivity[] {
  return Array.from({ length: count }, () => createActivity(overrides));
}

// ==========================================
// SCENARIO FACTORIES
// ==========================================

/**
 * Create a complete job pipeline scenario
 * (Job with candidates, submissions, activities)
 */
export function createJobPipelineScenario(orgId: string = 'org_test_1') {
  const account = createAccount({ orgId });
  const job = createJob({ orgId, accountId: account.id });
  
  const candidates = createCandidates(5, { orgId });
  const submissions = candidates.slice(0, 3).map((candidate) =>
    createSubmission({
      orgId,
      jobId: job.id,
      candidateId: candidate.id,
    })
  );
  
  const activities = [
    createActivity({
      orgId,
      type: 'meeting',
      subject: `Job kickoff: ${job.title}`,
      relatedEntityType: 'job',
      relatedEntityId: job.id,
      status: 'completed',
    }),
    ...submissions.map((sub) =>
      createActivity({
        orgId,
        type: 'submission',
        subject: `Candidate submitted`,
        relatedEntityType: 'submission',
        relatedEntityId: sub.id,
        status: 'completed',
      })
    ),
  ];
  
  return {
    account,
    job,
    candidates,
    submissions,
    activities,
  };
}

/**
 * Create a lead-to-deal conversion scenario
 */
export function createLeadConversionScenario(orgId: string = 'org_test_1') {
  const lead = createLead({ orgId, status: 'converted' });
  const account = createAccount({ orgId, name: lead.companyName });
  const deal = createDeal({
    orgId,
    accountId: account.id,
    leadId: lead.id,
    stage: 'negotiation',
  });
  
  const activities = [
    createActivity({
      orgId,
      type: 'call',
      subject: 'Qualification call',
      relatedEntityType: 'lead',
      relatedEntityId: lead.id,
      status: 'completed',
      outcome: 'successful',
    }),
    createActivity({
      orgId,
      type: 'meeting',
      subject: 'Discovery meeting',
      relatedEntityType: 'deal',
      relatedEntityId: deal.id,
      status: 'completed',
      outcome: 'successful',
    }),
  ];
  
  return {
    lead,
    account,
    deal,
    activities,
  };
}

