/**
 * Zod Validation Schemas: CRM Module
 * Runtime validation for accounts, POCs, activity logs, leads, and deals
 */

import { z } from 'zod';

// =====================================================
// ACCOUNTS
// =====================================================

export const createAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(255),
  industry: z.string().optional(),
  companyType: z.enum(['direct_client', 'vendor', 'partner', 'prospect']).default('direct_client'),
  status: z.enum(['prospect', 'active', 'inactive', 'churned']).default('prospect'),
  tier: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),

  // Account management
  accountManagerId: z.string().uuid().optional(),
  responsiveness: z.enum(['low', 'medium', 'high']).optional(),
  preferredQuality: z.enum(['budget', 'standard', 'premium']).optional(),
  description: z.string().optional(),

  // Business terms
  contractStartDate: z.coerce.date().optional(),
  contractEndDate: z.coerce.date().optional(),
  paymentTermsDays: z.number().int().min(0).max(365).default(30),
  markupPercentage: z.number().min(0).max(100).optional(),
  annualRevenueTarget: z.number().min(0).optional(),

  // Contact info
  website: z.string().url().optional(),
  headquartersLocation: z.string().optional(),
  phone: z.string().optional(),
});

export const updateAccountSchema = createAccountSchema.partial().extend({
  id: z.string().uuid(),
});

// =====================================================
// POINT OF CONTACTS
// =====================================================

export const createPointOfContactSchema = z.object({
  accountId: z.string().uuid(),

  // Core fields
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  title: z.string().optional(),
  role: z.enum(['hiring_manager', 'recruiter', 'hr_director', 'vp', 'c_level', 'other']).optional(),

  // Contact
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  preferredContactMethod: z.enum(['email', 'phone', 'linkedin']).default('email'),

  // Influence
  decisionAuthority: z.enum(['none', 'influencer', 'decision_maker', 'final_approver']).optional(),
  notes: z.string().optional(),

  // Status
  isPrimary: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updatePointOfContactSchema = createPointOfContactSchema.partial().extend({
  id: z.string().uuid(),
});

// =====================================================
// ACTIVITY LOG
// =====================================================

export const createActivityLogSchema = z.object({
  // Association (polymorphic)
  entityType: z.enum(['account', 'lead', 'deal', 'submission', 'candidate']),
  entityId: z.string().uuid(),

  // Activity details
  activityType: z.enum(['email', 'call', 'meeting', 'note', 'linkedin_message']),
  subject: z.string().optional(),
  body: z.string().optional(),
  direction: z.enum(['inbound', 'outbound']).optional(),

  // Participants
  performedBy: z.string().uuid().optional(),
  pocId: z.string().uuid().optional(),

  // Metadata
  activityDate: z.coerce.date().optional(),
  durationMinutes: z.number().int().min(0).max(480).optional(),
  outcome: z.enum(['positive', 'neutral', 'negative']).optional(),
  nextAction: z.string().optional(),
  nextActionDate: z.coerce.date().optional(),
});

// =====================================================
// LEADS
// =====================================================

// Base schema without refinement for reusability
const baseLeadSchema = z.object({
  // Lead type
  leadType: z.enum(['company', 'contact']).default('company'),

  // Company fields
  companyName: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),

  // Contact fields
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  title: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedinUrl: z.string().url().optional(),

  // Lead status
  status: z.enum(['new', 'warm', 'hot', 'cold', 'converted', 'lost']).default('new'),
  estimatedValue: z.number().min(0).optional(),

  // Source tracking
  source: z.enum(['inbound', 'outbound', 'referral', 'campaign', 'event', 'linkedin', 'other']).optional(),
  sourceCampaignId: z.string().uuid().optional(),

  // Assignment
  ownerId: z.string().uuid().optional(),

  // Engagement
  lastContactedAt: z.coerce.date().optional(),
  lastResponseAt: z.coerce.date().optional(),
  engagementScore: z.number().int().min(0).max(100).optional(),
});

// Create schema with refinement
export const createLeadSchema = baseLeadSchema.refine(
  (data) => {
    if (data.leadType === 'company') {
      return !!data.companyName;
    }
    return !!(data.firstName && data.lastName && data.email);
  },
  {
    message: 'Company leads need companyName. Contact leads need firstName, lastName, and email.',
    path: ['leadType'],
  }
);

// Update schema - partial of base schema, then extend with id
export const updateLeadSchema = baseLeadSchema.partial().extend({
  id: z.string().uuid(),
});

export const convertLeadToDealSchema = z.object({
  leadId: z.string().uuid(),
  dealTitle: z.string().min(1, 'Deal title is required'),
  dealValue: z.number().min(0, 'Deal value must be positive'),
  stage: z.enum(['discovery', 'proposal', 'negotiation']).default('discovery'),
  expectedCloseDate: z.coerce.date().optional(),
  createAccount: z.boolean().default(false),
  accountName: z.string().optional(),
});

// =====================================================
// DEALS
// =====================================================

// Base schema without refinement for reusability
export const baseDealSchema = z.object({
  // Association
  leadId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),

  // Deal details
  title: z.string().min(1, 'Deal title is required').max(255),
  description: z.string().optional(),
  value: z.number().min(0, 'Deal value must be positive'),

  // Pipeline stage
  stage: z.enum(['discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).default('discovery'),
  probability: z.number().int().min(0).max(100).optional(),
  expectedCloseDate: z.coerce.date().optional(),

  // Assignment
  ownerId: z.string().uuid(),

  // Linked jobs
  linkedJobIds: z.array(z.string().uuid()).optional(),
});

// Create schema with refinement
export const createDealSchema = baseDealSchema.refine(
  (data) => !!(data.leadId || data.accountId),
  {
    message: 'Deal must be associated with either a lead or an account',
    path: ['accountId'],
  }
);

// Update schema - partial of base schema, then extend with id
export const updateDealSchema = baseDealSchema.partial().extend({
  id: z.string().uuid(),
});

export const closeDealSchema = z.object({
  dealId: z.string().uuid(),
  stage: z.enum(['closed_won', 'closed_lost']),
  closeReason: z.string().min(1, 'Close reason is required'),
  actualCloseDate: z.coerce.date().optional(),
});

// =====================================================
// Type Exports
// =====================================================

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

export type CreatePointOfContactInput = z.infer<typeof createPointOfContactSchema>;
export type UpdatePointOfContactInput = z.infer<typeof updatePointOfContactSchema>;

export type CreateActivityLogInput = z.infer<typeof createActivityLogSchema>;

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type ConvertLeadToDealInput = z.infer<typeof convertLeadToDealSchema>;

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
export type CloseDealInput = z.infer<typeof closeDealSchema>;
