/**
 * Drizzle ORM Schema: CRM Module
 * Tables: accounts, point_of_contacts, activity_log, leads, deals
 */

import { pgTable, uuid, text, timestamp, numeric, integer, boolean, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userProfiles } from './user-profiles';
import { organizations } from './organizations';

// =====================================================
// ACCOUNTS
// =====================================================

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Core fields
  name: text('name').notNull(),
  industry: text('industry'),
  companyType: text('company_type').default('direct_client'),
  status: text('status').notNull().default('prospect'),
  tier: text('tier'),

  // Account management
  accountManagerId: uuid('account_manager_id').references(() => userProfiles.id),
  responsiveness: text('responsiveness'),
  preferredQuality: text('preferred_quality'),
  description: text('description'),

  // Business terms
  contractStartDate: timestamp('contract_start_date', { withTimezone: true }),
  contractEndDate: timestamp('contract_end_date', { withTimezone: true }),
  paymentTermsDays: integer('payment_terms_days').default(30),
  markupPercentage: numeric('markup_percentage', { precision: 5, scale: 2 }),
  annualRevenueTarget: numeric('annual_revenue_target', { precision: 12, scale: 2 }),

  // Contact info
  website: text('website'),
  headquartersLocation: text('headquarters_location'),
  phone: text('phone'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  updatedBy: uuid('updated_by').references(() => userProfiles.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),

  // Search
  searchVector: text('search_vector'),
});

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [accounts.orgId],
    references: [organizations.id],
  }),
  accountManager: one(userProfiles, {
    fields: [accounts.accountManagerId],
    references: [userProfiles.id],
  }),
  pointOfContacts: many(pointOfContacts),
  leads: many(leads),
  deals: many(deals),
}));

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

// =====================================================
// POINT OF CONTACTS
// =====================================================

export const pointOfContacts = pgTable('point_of_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),

  // Core fields
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  fullName: text('full_name'),
  title: text('title'),
  role: text('role'),

  // Contact
  email: text('email').notNull(),
  phone: text('phone'),
  linkedinUrl: text('linkedin_url'),
  preferredContactMethod: text('preferred_contact_method').default('email'),

  // Influence
  decisionAuthority: text('decision_authority'),
  notes: text('notes'),

  // Status
  isPrimary: boolean('is_primary').default(false),
  isActive: boolean('is_active').default(true),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const pointOfContactsRelations = relations(pointOfContacts, ({ one, many }) => ({
  account: one(accounts, {
    fields: [pointOfContacts.accountId],
    references: [accounts.id],
  }),
  activities: many(activityLog),
}));

export type PointOfContact = typeof pointOfContacts.$inferSelect;
export type NewPointOfContact = typeof pointOfContacts.$inferInsert;

// =====================================================
// ACTIVITY LOG
// =====================================================

export const activityLog = pgTable('activity_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Association (polymorphic)
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),

  // Activity details
  activityType: text('activity_type').notNull(),
  subject: text('subject'),
  body: text('body'),
  direction: text('direction'),

  // Participants
  performedBy: uuid('performed_by').references(() => userProfiles.id),
  pocId: uuid('poc_id').references(() => pointOfContacts.id),

  // Metadata
  activityDate: timestamp('activity_date', { withTimezone: true }).defaultNow().notNull(),
  durationMinutes: integer('duration_minutes'),
  outcome: text('outcome'),
  nextAction: text('next_action'),
  nextActionDate: timestamp('next_action_date', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  organization: one(organizations, {
    fields: [activityLog.orgId],
    references: [organizations.id],
  }),
  performer: one(userProfiles, {
    fields: [activityLog.performedBy],
    references: [userProfiles.id],
  }),
  pointOfContact: one(pointOfContacts, {
    fields: [activityLog.pocId],
    references: [pointOfContacts.id],
  }),
}));

export type ActivityLog = typeof activityLog.$inferSelect;
export type NewActivityLog = typeof activityLog.$inferInsert;

// =====================================================
// LEADS
// =====================================================

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Lead type
  leadType: text('lead_type').notNull().default('company'),

  // Company fields
  companyName: text('company_name'),
  industry: text('industry'),
  companyType: text('company_type'), // direct_client, implementation_partner, msp_vms, system_integrator
  companySize: text('company_size'),
  website: text('website'),
  headquarters: text('headquarters'),
  tier: text('tier'), // enterprise, mid_market, smb, strategic
  companyDescription: text('company_description'),

  // Contact fields
  firstName: text('first_name'),
  lastName: text('last_name'),
  // fullName is a GENERATED ALWAYS column in the database - we don't define it in Drizzle
  // to prevent Drizzle from trying to insert into it. Access it via raw SQL if needed.
  title: text('title'),
  email: text('email'),
  phone: text('phone'),
  linkedinUrl: text('linkedin_url'),
  decisionAuthority: text('decision_authority'), // decision_maker, influencer, gatekeeper, end_user, champion
  preferredContactMethod: text('preferred_contact_method').default('email'),

  // Link to existing account (for person leads)
  accountId: uuid('account_id').references(() => accounts.id),

  // Lead status
  status: text('status').notNull().default('new'),
  estimatedValue: numeric('estimated_value', { precision: 12, scale: 2 }),

  // Source tracking
  source: text('source'),
  sourceCampaignId: uuid('source_campaign_id'),

  // Assignment
  ownerId: uuid('owner_id').references(() => userProfiles.id),

  // Notes
  notes: text('notes'),

  // BANT Qualification Scores (0-25 each)
  bantBudget: integer('bant_budget').default(0),
  bantAuthority: integer('bant_authority').default(0),
  bantNeed: integer('bant_need').default(0),
  bantTimeline: integer('bant_timeline').default(0),
  
  // BANT Notes
  bantBudgetNotes: text('bant_budget_notes'),
  bantAuthorityNotes: text('bant_authority_notes'),
  bantNeedNotes: text('bant_need_notes'),
  bantTimelineNotes: text('bant_timeline_notes'),
  
  // bant_total_score is a GENERATED column - don't define in Drizzle

  // Engagement
  lastContactedAt: timestamp('last_contacted_at', { withTimezone: true }),
  lastResponseAt: timestamp('last_response_at', { withTimezone: true }),
  engagementScore: integer('engagement_score'),

  // Conversion
  convertedToDealId: uuid('converted_to_deal_id'),
  convertedToAccountId: uuid('converted_to_account_id').references(() => accounts.id),
  convertedAt: timestamp('converted_at', { withTimezone: true }),
  lostReason: text('lost_reason'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  // Note: search_vector column removed - not needed for MVP, can be re-added with proper tsvector type later
});

export const leadsRelations = relations(leads, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [leads.orgId],
    references: [organizations.id],
  }),
  owner: one(userProfiles, {
    fields: [leads.ownerId],
    references: [userProfiles.id],
  }),
  convertedToAccount: one(accounts, {
    fields: [leads.convertedToAccountId],
    references: [accounts.id],
  }),
  // NOTE: Tasks are now tracked via unified 'activities' table
  // Use entityType='lead' and entityId=lead.id to query activities for a lead
}));

// =====================================================
// LEAD TASKS - DEPRECATED
// =====================================================
// Tasks are now tracked via the unified 'activities' table
// See: src/lib/db/schema/activities.ts
// Query: activities WHERE entityType='lead' AND activityType IN ('task', 'follow_up')
// =====================================================

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

// =====================================================
// DEALS
// =====================================================

export const deals = pgTable('deals', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Association
  leadId: uuid('lead_id').references(() => leads.id),
  accountId: uuid('account_id').references(() => accounts.id),

  // Deal details
  title: text('title').notNull(),
  description: text('description'),
  value: numeric('value', { precision: 12, scale: 2 }).notNull(),

  // Pipeline stage
  stage: text('stage').notNull().default('discovery'),
  probability: integer('probability'),
  expectedCloseDate: timestamp('expected_close_date', { mode: 'date' }),
  actualCloseDate: timestamp('actual_close_date', { mode: 'date' }),

  // Assignment
  ownerId: uuid('owner_id').notNull().references(() => userProfiles.id),

  // Outcome
  closeReason: text('close_reason'),

  // Linked jobs
  linkedJobIds: uuid('linked_job_ids').array(),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const dealsRelations = relations(deals, ({ one }) => ({
  organization: one(organizations, {
    fields: [deals.orgId],
    references: [organizations.id],
  }),
  lead: one(leads, {
    fields: [deals.leadId],
    references: [leads.id],
  }),
  account: one(accounts, {
    fields: [deals.accountId],
    references: [accounts.id],
  }),
  owner: one(userProfiles, {
    fields: [deals.ownerId],
    references: [userProfiles.id],
  }),
}));

export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;

// =====================================================
// Enums for Type Safety
// =====================================================

export const AccountStatus = {
  PROSPECT: 'prospect',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CHURNED: 'churned',
} as const;

export const LeadStatus = {
  NEW: 'new',
  WARM: 'warm',
  HOT: 'hot',
  COLD: 'cold',
  CONVERTED: 'converted',
  LOST: 'lost',
} as const;

export const DealStage = {
  DISCOVERY: 'discovery',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  CLOSED_WON: 'closed_won',
  CLOSED_LOST: 'closed_lost',
} as const;

export const CRMActivityType = {
  EMAIL: 'email',
  CALL: 'call',
  MEETING: 'meeting',
  NOTE: 'note',
  LINKEDIN_MESSAGE: 'linkedin_message',
} as const;

export type AccountStatusType = typeof AccountStatus[keyof typeof AccountStatus];
export type LeadStatusType = typeof LeadStatus[keyof typeof LeadStatus];
export type DealStageType = typeof DealStage[keyof typeof DealStage];
export type CRMActivityTypeType = typeof CRMActivityType[keyof typeof CRMActivityType];
