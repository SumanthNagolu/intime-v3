/**
 * Account Entity Validation Schemas
 *
 * Generated from entity configuration: src/lib/entities/crm/account.entity.ts
 * Provides Zod schemas for runtime validation of Account operations.
 */

import { z } from 'zod';

// ==========================================
// ENUM SCHEMAS
// ==========================================

export const accountIndustrySchema = z.enum([
  'technology',
  'healthcare',
  'finance',
  'banking',
  'insurance',
  'manufacturing',
  'retail',
  'consulting',
  'government',
  'education',
  'energy',
  'telecommunications',
  'pharmaceutical',
  'other',
]);

export const accountCompanyTypeSchema = z.enum([
  'direct_client',
  'implementation_partner',
  'msp_vms',
  'system_integrator',
  'staffing_agency',
  'vendor',
]);

export const accountStatusSchema = z.enum([
  'prospect',
  'active',
  'inactive',
  'churned',
]);

export const accountTierSchema = z.enum([
  'enterprise',
  'mid_market',
  'smb',
  'strategic',
]);

export const accountResponsivenessSchema = z.enum([
  'high',
  'medium',
  'low',
]);

export const accountPreferredQualitySchema = z.enum([
  'premium',
  'standard',
  'budget',
]);

// ==========================================
// FULL ACCOUNT SCHEMA
// ==========================================

export const accountSchema = z.object({
  // Primary key
  id: z.string().uuid(),
  orgId: z.string().uuid(),

  // Core fields
  name: z.string().min(1).max(255),
  industry: accountIndustrySchema.nullable(),
  companyType: accountCompanyTypeSchema.nullable(),
  status: accountStatusSchema,
  tier: accountTierSchema.nullable(),

  // Account management
  accountManagerId: z.string().uuid().nullable(),
  responsiveness: accountResponsivenessSchema.nullable(),
  preferredQuality: accountPreferredQualitySchema.nullable(),
  description: z.string().nullable(),

  // Business terms
  contractStartDate: z.date().nullable(),
  contractEndDate: z.date().nullable(),
  paymentTermsDays: z.number().int().min(0).max(180).nullable(),
  markupPercentage: z.string().nullable(), // Stored as numeric/string
  annualRevenueTarget: z.string().nullable(), // Stored as numeric/string

  // Contact info
  website: z.string().url().nullable(),
  headquartersLocation: z.string().max(255).nullable(),
  phone: z.string().max(30).nullable(),

  // Audit fields
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().uuid().nullable(),
  updatedBy: z.string().uuid().nullable(),
  deletedAt: z.date().nullable(),
});

// ==========================================
// CREATE INPUT
// ==========================================

export const createAccountInput = z.object({
  // Required fields
  name: z.string().min(1, 'Account name is required').max(255),

  // Optional fields with defaults
  industry: accountIndustrySchema.optional(),
  companyType: accountCompanyTypeSchema.optional().default('direct_client'),
  status: accountStatusSchema.optional().default('prospect'),
  tier: accountTierSchema.optional(),

  // Account management
  accountManagerId: z.string().uuid().optional(),
  responsiveness: accountResponsivenessSchema.optional(),
  preferredQuality: accountPreferredQualitySchema.optional(),
  description: z.string().optional(),

  // Business terms
  contractStartDate: z.coerce.date().optional(),
  contractEndDate: z.coerce.date().optional(),
  paymentTermsDays: z.number().int().min(0).max(180).optional().default(30),
  markupPercentage: z.number().min(0).max(100).optional(),
  annualRevenueTarget: z.number().min(0).optional(),

  // Contact info
  website: z.string().url().optional().or(z.literal('')),
  headquartersLocation: z.string().max(255).optional(),
  phone: z.string().max(30).optional(),
});

// ==========================================
// UPDATE INPUT
// ==========================================

export const updateAccountInput = z.object({
  id: z.string().uuid(),
  data: createAccountInput.partial(),
});

// ==========================================
// LIST INPUT (Pagination + Filters)
// ==========================================

export const listAccountsInput = z.object({
  // Pagination
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(25),

  // Sorting
  sortBy: z.enum(['name', 'status', 'tier', 'createdAt', 'annualRevenueTarget']).optional().default('name'),
  sortDirection: z.enum(['asc', 'desc']).default('asc'),

  // Search
  search: z.string().optional(),

  // Filters
  filters: z.object({
    status: z.array(accountStatusSchema).optional(),
    tier: z.array(accountTierSchema).optional(),
    industry: z.array(accountIndustrySchema).optional(),
    companyType: z.array(accountCompanyTypeSchema).optional(),
    accountManagerId: z.string().uuid().optional(),
    hasContract: z.boolean().optional(),
    dateRange: z.object({
      from: z.coerce.date().optional(),
      to: z.coerce.date().optional(),
    }).optional(),
  }).optional(),
});

// ==========================================
// LIST OUTPUT
// ==========================================

export const listAccountsOutput = z.object({
  items: z.array(accountSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  metrics: z.object({
    byStatus: z.record(z.number()).optional(),
    byTier: z.record(z.number()).optional(),
    totalRevenueTarget: z.number().optional(),
  }).optional(),
});

// ==========================================
// METRICS OUTPUT
// ==========================================

export const accountMetricsOutput = z.object({
  // Count by status
  byStatus: z.object({
    prospect: z.number(),
    active: z.number(),
    inactive: z.number(),
    churned: z.number(),
  }),
  // Count by tier
  byTier: z.object({
    enterprise: z.number(),
    mid_market: z.number(),
    smb: z.number(),
    strategic: z.number(),
    unassigned: z.number(),
  }),
  // Revenue metrics
  totalRevenueTarget: z.number(),
  activeRevenueTarget: z.number(),
  // Count metrics
  total: z.number(),
  withActiveContract: z.number(),
  contractsExpiringSoon: z.number(), // Within 30 days
});

// ==========================================
// BULK ASSIGN INPUT
// ==========================================

export const bulkAssignAccountsInput = z.object({
  accountIds: z.array(z.string().uuid()).min(1, 'At least one account is required'),
  accountManagerId: z.string().uuid(),
});

// ==========================================
// TYPE EXPORTS
// ==========================================

export type Account = z.infer<typeof accountSchema>;
export type CreateAccountInput = z.infer<typeof createAccountInput>;
export type UpdateAccountInput = z.infer<typeof updateAccountInput>;
export type ListAccountsInput = z.infer<typeof listAccountsInput>;
export type ListAccountsOutput = z.infer<typeof listAccountsOutput>;
export type AccountMetricsOutput = z.infer<typeof accountMetricsOutput>;
export type BulkAssignAccountsInput = z.infer<typeof bulkAssignAccountsInput>;

// Enum types
export type AccountIndustry = z.infer<typeof accountIndustrySchema>;
export type AccountCompanyType = z.infer<typeof accountCompanyTypeSchema>;
export type AccountStatus = z.infer<typeof accountStatusSchema>;
export type AccountTier = z.infer<typeof accountTierSchema>;
