/**
 * Drizzle ORM Schema: CRM Module
 *
 * Tables:
 * - accounts, account_addresses, account_contacts, account_contracts, account_preferences, account_metrics, account_team
 * - contacts, contact_preferences
 * - leads, lead_scores, lead_qualification, lead_touchpoints
 * - deals, deal_stages_history, deal_stakeholders, deal_competitors, deal_products
 * - campaigns, campaign_targets, campaign_content, campaign_metrics
 * - crm_activities (unified activity table for CRM)
 * - activity_log (legacy, kept for backward compatibility)
 */

import { pgTable, uuid, text, timestamp, numeric, integer, boolean, jsonb, index } from 'drizzle-orm/pg-core';
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
  legalName: text('legal_name'),
  industry: text('industry'),
  companyType: text('company_type').default('direct_client'), // direct_client, implementation_partner, msp_vms, system_integrator
  status: text('status').notNull().default('prospect'), // prospect, active, inactive, churned
  tier: text('tier'), // strategic, growth, standard

  // Business info
  website: text('website'),
  phone: text('phone'),
  headquartersLocation: text('headquarters_location'),
  foundedYear: integer('founded_year'),
  employeeCount: integer('employee_count'),
  annualRevenue: numeric('annual_revenue', { precision: 15, scale: 2 }),
  description: text('description'),

  // Health & metrics
  healthScore: integer('health_score'), // 0-100

  // Account management
  accountManagerId: uuid('account_manager_id').references(() => userProfiles.id),
  responsiveness: text('responsiveness'),
  preferredQuality: text('preferred_quality'),

  // Business terms
  contractStartDate: timestamp('contract_start_date', { withTimezone: true }),
  contractEndDate: timestamp('contract_end_date', { withTimezone: true }),
  paymentTermsDays: integer('payment_terms_days').default(30),
  markupPercentage: numeric('markup_percentage', { precision: 5, scale: 2 }),
  annualRevenueTarget: numeric('annual_revenue_target', { precision: 12, scale: 2 }),

  // Primary contact (optional reference)
  primaryContactId: uuid('primary_contact_id'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  updatedBy: uuid('updated_by').references(() => userProfiles.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),

  // Search
  searchVector: text('search_vector'),
}, (table) => ({
  orgIdIdx: index('idx_accounts_org_id').on(table.orgId),
  statusIdx: index('idx_accounts_status').on(table.status),
  tierIdx: index('idx_accounts_tier').on(table.tier),
  accountManagerIdx: index('idx_accounts_account_manager_id').on(table.accountManagerId),
  healthScoreIdx: index('idx_accounts_health_score').on(table.healthScore),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [accounts.orgId],
    references: [organizations.id],
  }),
  accountManager: one(userProfiles, {
    fields: [accounts.accountManagerId],
    references: [userProfiles.id],
  }),
  addresses: many(accountAddresses),
  contracts: many(accountContracts),
  preferences: many(accountPreferences),
  metrics: many(accountMetrics),
  team: many(accountTeam),
  pointOfContacts: many(pointOfContacts),
  leads: many(leads),
  deals: many(deals),
}));

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

// =====================================================
// ACCOUNT ADDRESSES
// =====================================================

export const accountAddresses = pgTable('account_addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),

  // Address type
  addressType: text('address_type').notNull().default('office'), // hq, billing, office, shipping

  // Address fields
  street: text('street'),
  street2: text('street2'),
  city: text('city'),
  state: text('state'),
  country: text('country').default('USA'),
  postalCode: text('postal_code'),

  // Status
  isPrimary: boolean('is_primary').default(false),
  isActive: boolean('is_active').default(true),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  accountIdIdx: index('idx_account_addresses_account_id').on(table.accountId),
  typeIdx: index('idx_account_addresses_type').on(table.addressType),
}));

export const accountAddressesRelations = relations(accountAddresses, ({ one }) => ({
  account: one(accounts, {
    fields: [accountAddresses.accountId],
    references: [accounts.id],
  }),
}));

export type AccountAddress = typeof accountAddresses.$inferSelect;
export type NewAccountAddress = typeof accountAddresses.$inferInsert;

// =====================================================
// ACCOUNT CONTRACTS
// =====================================================

export const accountContracts = pgTable('account_contracts', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),

  // Contract details
  contractType: text('contract_type').notNull(), // msa, sow, nda, amendment, addendum
  status: text('status').notNull().default('draft'), // draft, pending_review, active, expired, terminated
  name: text('name'),

  // Dates
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  signedDate: timestamp('signed_date', { withTimezone: true }),

  // Value
  value: numeric('value', { precision: 12, scale: 2 }),
  currency: text('currency').default('USD'),

  // Terms
  terms: jsonb('terms'), // { auto_renew: boolean, notice_period_days: number, ... }
  paymentTermsDays: integer('payment_terms_days'),

  // Document
  documentUrl: text('document_url'),
  notes: text('notes'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
}, (table) => ({
  accountIdIdx: index('idx_account_contracts_account_id').on(table.accountId),
  typeIdx: index('idx_account_contracts_type').on(table.contractType),
  statusIdx: index('idx_account_contracts_status').on(table.status),
}));

export const accountContractsRelations = relations(accountContracts, ({ one }) => ({
  account: one(accounts, {
    fields: [accountContracts.accountId],
    references: [accounts.id],
  }),
  creator: one(userProfiles, {
    fields: [accountContracts.createdBy],
    references: [userProfiles.id],
  }),
}));

export type AccountContract = typeof accountContracts.$inferSelect;
export type NewAccountContract = typeof accountContracts.$inferInsert;

// =====================================================
// ACCOUNT PREFERENCES (Hiring/Staffing Preferences)
// =====================================================

export const accountPreferences = pgTable('account_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),

  // Skill preferences
  preferredSkills: text('preferred_skills').array(),
  excludedSkills: text('excluded_skills').array(),

  // Visa/work authorization preferences
  preferredVisaTypes: text('preferred_visa_types').array(), // H1B, GC, USC, OPT, etc.
  excludedVisaTypes: text('excluded_visa_types').array(),

  // Rate range preferences
  rateRangeMin: numeric('rate_range_min', { precision: 10, scale: 2 }),
  rateRangeMax: numeric('rate_range_max', { precision: 10, scale: 2 }),
  preferredRateType: text('preferred_rate_type').default('hourly'), // hourly, daily, monthly, annual

  // Work mode preferences
  workModePreference: text('work_mode_preference'), // remote, onsite, hybrid
  onsiteRequirement: text('onsite_requirement'),

  // Interview process
  interviewProcessNotes: text('interview_process_notes'),
  typicalInterviewRounds: integer('typical_interview_rounds'),
  interviewTurnaroundDays: integer('interview_turnaround_days'),

  // Other preferences
  backgroundCheckRequired: boolean('background_check_required').default(false),
  drugScreenRequired: boolean('drug_screen_required').default(false),
  securityClearanceRequired: text('security_clearance_required'),

  // Notes
  notes: text('notes'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  accountIdIdx: index('idx_account_preferences_account_id').on(table.accountId),
}));

export const accountPreferencesRelations = relations(accountPreferences, ({ one }) => ({
  account: one(accounts, {
    fields: [accountPreferences.accountId],
    references: [accounts.id],
  }),
}));

export type AccountPreference = typeof accountPreferences.$inferSelect;
export type NewAccountPreference = typeof accountPreferences.$inferInsert;

// =====================================================
// ACCOUNT METRICS (Monthly Performance)
// =====================================================

export const accountMetrics = pgTable('account_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),

  // Period
  period: text('period').notNull(), // YYYY-MM format for monthly metrics
  periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),

  // Placement metrics
  totalPlacements: integer('total_placements').default(0),
  activePlacements: integer('active_placements').default(0),
  endedPlacements: integer('ended_placements').default(0),

  // Revenue metrics
  totalRevenue: numeric('total_revenue', { precision: 12, scale: 2 }).default('0'),
  totalMargin: numeric('total_margin', { precision: 12, scale: 2 }).default('0'),

  // Performance metrics
  avgTtfDays: numeric('avg_ttf_days', { precision: 5, scale: 1 }), // Time to fill
  submissionToInterviewRate: numeric('submission_to_interview_rate', { precision: 5, scale: 2 }), // Percentage
  interviewToOfferRate: numeric('interview_to_offer_rate', { precision: 5, scale: 2 }), // Percentage
  offerAcceptanceRate: numeric('offer_acceptance_rate', { precision: 5, scale: 2 }), // Percentage

  // Activity metrics
  totalSubmissions: integer('total_submissions').default(0),
  totalInterviews: integer('total_interviews').default(0),
  totalOffers: integer('total_offers').default(0),

  // Calculated health score for this period
  healthScore: integer('health_score'), // 0-100

  // Metadata
  calculatedAt: timestamp('calculated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  accountIdIdx: index('idx_account_metrics_account_id').on(table.accountId),
  periodIdx: index('idx_account_metrics_period').on(table.period),
  accountPeriodIdx: index('idx_account_metrics_account_period').on(table.accountId, table.period),
}));

export const accountMetricsRelations = relations(accountMetrics, ({ one }) => ({
  account: one(accounts, {
    fields: [accountMetrics.accountId],
    references: [accounts.id],
  }),
}));

export type AccountMetric = typeof accountMetrics.$inferSelect;
export type NewAccountMetric = typeof accountMetrics.$inferInsert;

// =====================================================
// ACCOUNT TEAM (RCAI Assignments)
// =====================================================

export const accountTeam = pgTable('account_team', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),

  // Role on the account
  role: text('role').notNull(), // owner, secondary, support, recruiter, account_manager

  // Dates
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
  unassignedAt: timestamp('unassigned_at', { withTimezone: true }),

  // Status
  isActive: boolean('is_active').default(true),
  isPrimary: boolean('is_primary').default(false),

  // Notes
  notes: text('notes'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
}, (table) => ({
  accountIdIdx: index('idx_account_team_account_id').on(table.accountId),
  userIdIdx: index('idx_account_team_user_id').on(table.userId),
  roleIdx: index('idx_account_team_role').on(table.role),
}));

export const accountTeamRelations = relations(accountTeam, ({ one }) => ({
  account: one(accounts, {
    fields: [accountTeam.accountId],
    references: [accounts.id],
  }),
  user: one(userProfiles, {
    fields: [accountTeam.userId],
    references: [userProfiles.id],
  }),
}));

export type AccountTeamMember = typeof accountTeam.$inferSelect;
export type NewAccountTeamMember = typeof accountTeam.$inferInsert;

// =====================================================
// CRM CONTACTS (Universal Contacts Table)
// Note: This is different from workspace.contacts - CRM contacts are for sales/marketing
// =====================================================

export const crmContacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Contact type
  contactType: text('contact_type').notNull().default('general'), // client_poc, candidate, vendor, partner, internal, general

  // Personal information
  firstName: text('first_name'),
  lastName: text('last_name'),
  // full_name is a GENERATED column in the database
  email: text('email'),
  phone: text('phone'),
  mobile: text('mobile'),
  linkedinUrl: text('linkedin_url'),

  // Avatar
  avatarUrl: text('avatar_url'),

  // Professional information
  title: text('title'),
  companyName: text('company_name'),
  companyId: uuid('company_id').references(() => accounts.id),
  department: text('department'),

  // Work location
  workLocation: text('work_location'),
  timezone: text('timezone').default('America/New_York'),

  // Communication preferences
  preferredContactMethod: text('preferred_contact_method').default('email'), // email, phone, mobile, linkedin, text
  bestTimeToContact: text('best_time_to_contact'),
  doNotCallBefore: text('do_not_call_before'),
  doNotCallAfter: text('do_not_call_after'),

  // Status
  status: text('status').notNull().default('active'), // active, inactive, do_not_contact, bounced, unsubscribed

  // Source tracking
  source: text('source'),
  sourceDetail: text('source_detail'),
  sourceCampaignId: uuid('source_campaign_id'),

  // Link to user profile (for candidates/employees)
  userProfileId: uuid('user_profile_id').references(() => userProfiles.id),

  // Engagement tracking
  lastContactedAt: timestamp('last_contacted_at', { withTimezone: true }),
  lastResponseAt: timestamp('last_response_at', { withTimezone: true }),
  totalInteractions: integer('total_interactions').default(0),
  engagementScore: integer('engagement_score').default(0), // 0-100

  // Social media
  twitterUrl: text('twitter_url'),
  githubUrl: text('github_url'),

  // Decision making (for client POCs)
  decisionAuthority: text('decision_authority'), // final_decision_maker, key_influencer, gatekeeper, recommender, end_user
  buyingRole: text('buying_role'), // champion, economic_buyer, technical_buyer, coach, blocker
  influenceLevel: text('influence_level'), // low, medium, high

  // Tags & notes
  tags: text('tags').array(),
  notes: text('notes'),
  internalNotes: text('internal_notes'),

  // Assignment
  ownerId: uuid('owner_id').references(() => userProfiles.id),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  updatedBy: uuid('updated_by').references(() => userProfiles.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  orgIdIdx: index('idx_contacts_org_id').on(table.orgId),
  contactTypeIdx: index('idx_contacts_contact_type').on(table.contactType),
  emailIdx: index('idx_contacts_email').on(table.email),
  companyIdIdx: index('idx_contacts_company_id').on(table.companyId),
  ownerIdIdx: index('idx_contacts_owner_id').on(table.ownerId),
  statusIdx: index('idx_contacts_status').on(table.status),
  engagementIdx: index('idx_crm_contacts_engagement').on(table.engagementScore),
}));

export const crmContactsRelations = relations(crmContacts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [crmContacts.orgId],
    references: [organizations.id],
  }),
  company: one(accounts, {
    fields: [crmContacts.companyId],
    references: [accounts.id],
  }),
  owner: one(userProfiles, {
    fields: [crmContacts.ownerId],
    references: [userProfiles.id],
    relationName: 'crmContactOwner',
  }),
  userProfile: one(userProfiles, {
    fields: [crmContacts.userProfileId],
    references: [userProfiles.id],
    relationName: 'crmContactUserProfile',
  }),
  preferences: many(crmContactPreferences),
}));

export type CrmContact = typeof crmContacts.$inferSelect;
export type NewCrmContact = typeof crmContacts.$inferInsert;

// =====================================================
// CRM CONTACT PREFERENCES
// =====================================================

export const crmContactPreferences = pgTable('crm_contact_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  contactId: uuid('contact_id').notNull().references(() => crmContacts.id, { onDelete: 'cascade' }),

  // Communication preferences
  preferredContactMethod: text('preferred_contact_method').default('email'),
  bestTimeToCall: text('best_time_to_call'),
  timezone: text('timezone').default('America/New_York'),
  communicationFrequency: text('communication_frequency'), // daily, weekly, biweekly, monthly

  // Email preferences
  marketingEmailsOptIn: boolean('marketing_emails_opt_in').default(true),
  newsletterOptIn: boolean('newsletter_opt_in').default(true),
  productUpdatesOptIn: boolean('product_updates_opt_in').default(true),

  // Call preferences
  doNotCall: boolean('do_not_call').default(false),
  doNotCallBefore: text('do_not_call_before'),
  doNotCallAfter: text('do_not_call_after'),

  // Meeting preferences
  preferredMeetingPlatform: text('preferred_meeting_platform'), // zoom, teams, google_meet, phone
  meetingDuration: integer('meeting_duration').default(30), // Default meeting duration in minutes

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  contactIdIdx: index('idx_contact_preferences_contact_id').on(table.contactId),
}));

export const crmContactPreferencesRelations = relations(crmContactPreferences, ({ one }) => ({
  contact: one(crmContacts, {
    fields: [crmContactPreferences.contactId],
    references: [crmContacts.id],
  }),
}));

export type CrmContactPreference = typeof crmContactPreferences.$inferSelect;
export type NewCrmContactPreference = typeof crmContactPreferences.$inferInsert;

// =====================================================
// POINT OF CONTACTS (Legacy, kept for backward compatibility)
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

  // Link to unified contacts table
  contactId: uuid('contact_id').references(() => crmContacts.id),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  accountIdIdx: index('idx_pocs_account_id').on(table.accountId),
  emailIdx: index('idx_pocs_email').on(table.email),
}));

export const pointOfContactsRelations = relations(pointOfContacts, ({ one, many }) => ({
  account: one(accounts, {
    fields: [pointOfContacts.accountId],
    references: [accounts.id],
  }),
  contact: one(crmContacts, {
    fields: [pointOfContacts.contactId],
    references: [crmContacts.id],
  }),
  activities: many(activityLog),
}));

export type PointOfContact = typeof pointOfContacts.$inferSelect;
export type NewPointOfContact = typeof pointOfContacts.$inferInsert;

// =====================================================
// LEADS
// =====================================================

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Lead type
  leadType: text('lead_type').notNull().default('company'), // company, person

  // Company fields
  companyName: text('company_name'),
  industry: text('industry'),
  companyType: text('company_type'), // direct_client, implementation_partner, msp_vms, system_integrator
  companySize: text('company_size'), // small, medium, large, enterprise
  website: text('website'),
  headquarters: text('headquarters'),
  tier: text('tier'), // enterprise, mid_market, smb, strategic
  companyDescription: text('company_description'),

  // Contact fields
  firstName: text('first_name'),
  lastName: text('last_name'),
  // fullName is a GENERATED ALWAYS column in the database
  title: text('title'),
  email: text('email'),
  phone: text('phone'),
  linkedinUrl: text('linkedin_url'),
  decisionAuthority: text('decision_authority'), // decision_maker, influencer, gatekeeper, end_user, champion
  preferredContactMethod: text('preferred_contact_method').default('email'),

  // Link to existing account (for person leads)
  accountId: uuid('account_id').references(() => accounts.id),

  // Lead status
  status: text('status').notNull().default('new'), // new, warm, hot, cold, converted, lost
  estimatedValue: numeric('estimated_value', { precision: 12, scale: 2 }),

  // Source tracking
  source: text('source'), // linkedin, referral, cold_outreach, inbound, event, partner, ad_campaign, other
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

  // bant_total_score is a GENERATED column (0-100)

  // Engagement
  lastContactedAt: timestamp('last_contacted_at', { withTimezone: true }),
  lastResponseAt: timestamp('last_response_at', { withTimezone: true }),
  engagementScore: integer('engagement_score'), // 0-100

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
}, (table) => ({
  orgIdIdx: index('idx_leads_org_id').on(table.orgId),
  statusIdx: index('idx_leads_status').on(table.status),
  ownerIdx: index('idx_leads_owner_id').on(table.ownerId),
  emailIdx: index('idx_leads_email').on(table.email),
  accountIdx: index('idx_leads_account_id').on(table.accountId),
  sourceIdx: index('idx_leads_source').on(table.source),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [leads.orgId],
    references: [organizations.id],
  }),
  owner: one(userProfiles, {
    fields: [leads.ownerId],
    references: [userProfiles.id],
  }),
  account: one(accounts, {
    fields: [leads.accountId],
    references: [accounts.id],
  }),
  convertedToAccount: one(accounts, {
    fields: [leads.convertedToAccountId],
    references: [accounts.id],
  }),
  scores: many(leadScores),
  qualification: many(leadQualification),
  touchpoints: many(leadTouchpoints),
}));

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

// =====================================================
// LEAD SCORES (Detailed Scoring Factors)
// =====================================================

export const leadScores = pgTable('lead_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),

  // Score
  score: integer('score').notNull().default(0), // 0-100

  // Scoring factors (JSONB)
  factors: jsonb('factors'), // { budget: { score: 25, reason: "..." }, authority: {...}, need: {...}, timeline: {...} }

  // Score breakdown
  budgetScore: integer('budget_score').default(0),
  authorityScore: integer('authority_score').default(0),
  needScore: integer('need_score').default(0),
  timelineScore: integer('timeline_score').default(0),
  engagementScore: integer('engagement_score').default(0),
  fitScore: integer('fit_score').default(0),

  // Calculated at
  calculatedAt: timestamp('calculated_at', { withTimezone: true }).defaultNow().notNull(),
  calculatedBy: text('calculated_by'), // 'system' or user_id

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  leadIdIdx: index('idx_lead_scores_lead_id').on(table.leadId),
  scoreIdx: index('idx_lead_scores_score').on(table.score),
}));

export const leadScoresRelations = relations(leadScores, ({ one }) => ({
  lead: one(leads, {
    fields: [leadScores.leadId],
    references: [leads.id],
  }),
}));

export type LeadScore = typeof leadScores.$inferSelect;
export type NewLeadScore = typeof leadScores.$inferInsert;

// =====================================================
// LEAD QUALIFICATION (BANT Details)
// =====================================================

export const leadQualification = pgTable('lead_qualification', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),

  // Budget
  hasBudget: boolean('has_budget'),
  budgetAmount: numeric('budget_amount', { precision: 12, scale: 2 }),
  budgetTimeframe: text('budget_timeframe'), // this_quarter, next_quarter, this_year, next_year
  budgetNotes: text('budget_notes'),

  // Authority
  decisionMaker: text('decision_maker'), // yes, no, partial, unknown
  decisionProcess: text('decision_process'),
  otherStakeholders: text('other_stakeholders'),
  authorityNotes: text('authority_notes'),

  // Need
  needIdentified: boolean('need_identified'),
  needUrgency: text('need_urgency'), // critical, high, medium, low
  painPoints: text('pain_points').array(),
  currentSolution: text('current_solution'),
  needNotes: text('need_notes'),

  // Timeline
  timeline: text('timeline'), // immediate, 30_days, 90_days, 6_months, 12_months, unknown
  decisionDate: timestamp('decision_date', { withTimezone: true }),
  projectStartDate: timestamp('project_start_date', { withTimezone: true }),
  timelineNotes: text('timeline_notes'),

  // Qualification metadata
  qualifiedBy: uuid('qualified_by').references(() => userProfiles.id),
  qualifiedAt: timestamp('qualified_at', { withTimezone: true }),
  qualificationStatus: text('qualification_status'), // pending, qualified, disqualified

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  leadIdIdx: index('idx_lead_qualification_lead_id').on(table.leadId),
  statusIdx: index('idx_lead_qualification_status').on(table.qualificationStatus),
}));

export const leadQualificationRelations = relations(leadQualification, ({ one }) => ({
  lead: one(leads, {
    fields: [leadQualification.leadId],
    references: [leads.id],
  }),
  qualifier: one(userProfiles, {
    fields: [leadQualification.qualifiedBy],
    references: [userProfiles.id],
  }),
}));

export type LeadQualificationRecord = typeof leadQualification.$inferSelect;
export type NewLeadQualificationRecord = typeof leadQualification.$inferInsert;

// =====================================================
// LEAD TOUCHPOINTS (Outreach Tracking)
// =====================================================

export const leadTouchpoints = pgTable('lead_touchpoints', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),

  // Touchpoint details
  touchpointType: text('touchpoint_type').notNull(), // call, email, meeting, linkedin, text, event
  direction: text('direction').notNull().default('outbound'), // inbound, outbound

  // Content
  subject: text('subject'),
  notes: text('notes'),

  // Outcome
  outcome: text('outcome'), // positive, neutral, negative, no_response
  nextSteps: text('next_steps'),
  nextFollowUpDate: timestamp('next_follow_up_date', { withTimezone: true }),

  // Duration (for calls/meetings)
  durationMinutes: integer('duration_minutes'),

  // Campaign tracking
  campaignId: uuid('campaign_id'),
  templateUsed: text('template_used'),

  // Attribution
  createdBy: uuid('created_by').references(() => userProfiles.id),

  // Metadata
  touchpointDate: timestamp('touchpoint_date', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  leadIdIdx: index('idx_lead_touchpoints_lead_id').on(table.leadId),
  typeIdx: index('idx_lead_touchpoints_type').on(table.touchpointType),
  dateIdx: index('idx_lead_touchpoints_date').on(table.touchpointDate),
}));

export const leadTouchpointsRelations = relations(leadTouchpoints, ({ one }) => ({
  lead: one(leads, {
    fields: [leadTouchpoints.leadId],
    references: [leads.id],
  }),
  creator: one(userProfiles, {
    fields: [leadTouchpoints.createdBy],
    references: [userProfiles.id],
  }),
}));

export type LeadTouchpoint = typeof leadTouchpoints.$inferSelect;
export type NewLeadTouchpoint = typeof leadTouchpoints.$inferInsert;

// =====================================================
// DEALS
// =====================================================

export const deals = pgTable('deals', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Association
  leadId: uuid('lead_id').references(() => leads.id),
  accountId: uuid('account_id').references(() => accounts.id),

  // Deal details - name and title are interchangeable, title is for backward compatibility
  name: text('name'), // Optional, defaults to title if not provided
  title: text('title').notNull(), // Keep title as primary for backward compatibility
  description: text('description'),
  dealType: text('deal_type'), // new_business, expansion, renewal, upsell

  // Value
  value: numeric('value', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),

  // Pipeline stage
  stage: text('stage').notNull().default('discovery'), // discovery, qualification, proposal, negotiation, closed_won, closed_lost
  probability: integer('probability'), // 0-100

  // Dates
  expectedCloseDate: timestamp('expected_close_date', { mode: 'date' }),
  actualCloseDate: timestamp('actual_close_date', { mode: 'date' }),

  // Assignment
  ownerId: uuid('owner_id').notNull().references(() => userProfiles.id),

  // Outcome
  closeReason: text('close_reason'),
  lossReason: text('loss_reason'),
  competitorWon: text('competitor_won'),

  // Linked jobs
  linkedJobIds: uuid('linked_job_ids').array(),

  // Notes
  notes: text('notes'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  orgIdIdx: index('idx_deals_org_id').on(table.orgId),
  stageIdx: index('idx_deals_stage').on(table.stage),
  ownerIdx: index('idx_deals_owner_id').on(table.ownerId),
  accountIdx: index('idx_deals_account_id').on(table.accountId),
  leadIdx: index('idx_deals_lead_id').on(table.leadId),
  expectedCloseIdx: index('idx_deals_expected_close').on(table.expectedCloseDate),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
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
  stagesHistory: many(dealStagesHistory),
  stakeholders: many(dealStakeholders),
  competitors: many(dealCompetitors),
  products: many(dealProducts),
}));

export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;

// =====================================================
// DEAL STAGES HISTORY
// =====================================================

export const dealStagesHistory = pgTable('deal_stages_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  dealId: uuid('deal_id').notNull().references(() => deals.id, { onDelete: 'cascade' }),

  // Stage transition
  stage: text('stage').notNull(),
  previousStage: text('previous_stage'),

  // Timing
  enteredAt: timestamp('entered_at', { withTimezone: true }).defaultNow().notNull(),
  exitedAt: timestamp('exited_at', { withTimezone: true }),
  durationDays: integer('duration_days'),

  // Context
  notes: text('notes'),
  reason: text('reason'),

  // Attribution
  changedBy: uuid('changed_by').references(() => userProfiles.id),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  dealIdIdx: index('idx_deal_stages_history_deal_id').on(table.dealId),
  stageIdx: index('idx_deal_stages_history_stage').on(table.stage),
  enteredAtIdx: index('idx_deal_stages_history_entered_at').on(table.enteredAt),
}));

export const dealStagesHistoryRelations = relations(dealStagesHistory, ({ one }) => ({
  deal: one(deals, {
    fields: [dealStagesHistory.dealId],
    references: [deals.id],
  }),
  changer: one(userProfiles, {
    fields: [dealStagesHistory.changedBy],
    references: [userProfiles.id],
  }),
}));

export type DealStageHistory = typeof dealStagesHistory.$inferSelect;
export type NewDealStageHistory = typeof dealStagesHistory.$inferInsert;

// =====================================================
// DEAL STAKEHOLDERS
// =====================================================

export const dealStakeholders = pgTable('deal_stakeholders', {
  id: uuid('id').primaryKey().defaultRandom(),
  dealId: uuid('deal_id').notNull().references(() => deals.id, { onDelete: 'cascade' }),
  contactId: uuid('contact_id').references(() => crmContacts.id),

  // Stakeholder info (if no contact record)
  name: text('name'),
  title: text('title'),
  email: text('email'),

  // Role in deal
  role: text('role').notNull(), // decision_maker, influencer, champion, blocker, gatekeeper, end_user
  influenceLevel: text('influence_level'), // high, medium, low

  // Engagement
  sentiment: text('sentiment'), // positive, neutral, negative, unknown
  engagementNotes: text('engagement_notes'),

  // Status
  isActive: boolean('is_active').default(true),
  isPrimary: boolean('is_primary').default(false),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  dealIdIdx: index('idx_deal_stakeholders_deal_id').on(table.dealId),
  contactIdIdx: index('idx_deal_stakeholders_contact_id').on(table.contactId),
  roleIdx: index('idx_deal_stakeholders_role').on(table.role),
}));

export const dealStakeholdersRelations = relations(dealStakeholders, ({ one }) => ({
  deal: one(deals, {
    fields: [dealStakeholders.dealId],
    references: [deals.id],
  }),
  contact: one(crmContacts, {
    fields: [dealStakeholders.contactId],
    references: [crmContacts.id],
  }),
}));

export type DealStakeholder = typeof dealStakeholders.$inferSelect;
export type NewDealStakeholder = typeof dealStakeholders.$inferInsert;

// =====================================================
// DEAL COMPETITORS
// =====================================================

export const dealCompetitors = pgTable('deal_competitors', {
  id: uuid('id').primaryKey().defaultRandom(),
  dealId: uuid('deal_id').notNull().references(() => deals.id, { onDelete: 'cascade' }),

  // Competitor info
  competitorName: text('competitor_name').notNull(),
  competitorWebsite: text('competitor_website'),

  // Analysis
  strengths: text('strengths'),
  weaknesses: text('weaknesses'),
  ourDifferentiators: text('our_differentiators'),
  pricing: text('pricing'),

  // Status
  status: text('status').default('active'), // active, won_against, lost_to, unknown
  threatLevel: text('threat_level'), // high, medium, low

  // Notes
  notes: text('notes'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  dealIdIdx: index('idx_deal_competitors_deal_id').on(table.dealId),
  nameIdx: index('idx_deal_competitors_name').on(table.competitorName),
  statusIdx: index('idx_deal_competitors_status').on(table.status),
}));

export const dealCompetitorsRelations = relations(dealCompetitors, ({ one }) => ({
  deal: one(deals, {
    fields: [dealCompetitors.dealId],
    references: [deals.id],
  }),
}));

export type DealCompetitor = typeof dealCompetitors.$inferSelect;
export type NewDealCompetitor = typeof dealCompetitors.$inferInsert;

// =====================================================
// DEAL PRODUCTS
// =====================================================

export const dealProducts = pgTable('deal_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  dealId: uuid('deal_id').notNull().references(() => deals.id, { onDelete: 'cascade' }),

  // Product details
  productType: text('product_type').notNull(), // staffing, training, consulting, recruitment, subscription
  productName: text('product_name'),
  description: text('description'),

  // Quantity and pricing
  quantity: integer('quantity').default(1),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }),
  totalValue: numeric('total_value', { precision: 12, scale: 2 }),
  discount: numeric('discount', { precision: 5, scale: 2 }),
  currency: text('currency').default('USD'),

  // Duration (for services)
  durationMonths: integer('duration_months'),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),

  // Notes
  notes: text('notes'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  dealIdIdx: index('idx_deal_products_deal_id').on(table.dealId),
  typeIdx: index('idx_deal_products_type').on(table.productType),
}));

export const dealProductsRelations = relations(dealProducts, ({ one }) => ({
  deal: one(deals, {
    fields: [dealProducts.dealId],
    references: [deals.id],
  }),
}));

export type DealProduct = typeof dealProducts.$inferSelect;
export type NewDealProduct = typeof dealProducts.$inferInsert;

// =====================================================
// CRM CAMPAIGNS (Marketing/Outreach Campaigns)
// Note: This is different from ta-hr.campaigns - CRM campaigns are for sales/marketing
// =====================================================

export const crmCampaigns = pgTable('crm_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Campaign details
  name: text('name').notNull(),
  description: text('description'),
  campaignType: text('campaign_type').notNull(), // email, linkedin, event, webinar, content, outbound_call

  // Status
  status: text('status').notNull().default('draft'), // draft, scheduled, active, paused, completed, cancelled

  // Target audience
  targetAudience: text('target_audience'),
  targetIndustries: text('target_industries').array(),
  targetTitles: text('target_titles').array(),
  targetCompanySizes: text('target_company_sizes').array(),

  // Schedule
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),

  // Budget
  budget: numeric('budget', { precision: 12, scale: 2 }),
  currency: text('currency').default('USD'),

  // Goals
  goalLeads: integer('goal_leads'),
  goalResponses: integer('goal_responses'),
  goalMeetings: integer('goal_meetings'),

  // Owner
  ownerId: uuid('owner_id').references(() => userProfiles.id),

  // Notes
  notes: text('notes'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  orgIdIdx: index('idx_campaigns_org_id').on(table.orgId),
  typeIdx: index('idx_campaigns_type').on(table.campaignType),
  statusIdx: index('idx_campaigns_status').on(table.status),
  ownerIdx: index('idx_campaigns_owner_id').on(table.ownerId),
  startDateIdx: index('idx_campaigns_start_date').on(table.startDate),
}));

export const crmCampaignsRelations = relations(crmCampaigns, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [crmCampaigns.orgId],
    references: [organizations.id],
  }),
  owner: one(userProfiles, {
    fields: [crmCampaigns.ownerId],
    references: [userProfiles.id],
  }),
  targets: many(crmCampaignTargets),
  content: many(crmCampaignContent),
  metrics: many(crmCampaignMetrics),
}));

export type CrmCampaign = typeof crmCampaigns.$inferSelect;
export type NewCrmCampaign = typeof crmCampaigns.$inferInsert;

// =====================================================
// CRM CAMPAIGN TARGETS
// =====================================================

export const crmCampaignTargets = pgTable('crm_campaign_targets', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').notNull().references(() => crmCampaigns.id, { onDelete: 'cascade' }),

  // Target (polymorphic)
  targetType: text('target_type').notNull(), // lead, contact, account
  targetId: uuid('target_id').notNull(),

  // Status
  status: text('status').notNull().default('pending'), // pending, sent, opened, clicked, responded, converted, bounced, unsubscribed

  // Tracking
  sentAt: timestamp('sent_at', { withTimezone: true }),
  openedAt: timestamp('opened_at', { withTimezone: true }),
  clickedAt: timestamp('clicked_at', { withTimezone: true }),
  respondedAt: timestamp('responded_at', { withTimezone: true }),
  convertedAt: timestamp('converted_at', { withTimezone: true }),

  // Result
  resultNotes: text('result_notes'),
  convertedToLeadId: uuid('converted_to_lead_id').references(() => leads.id),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  campaignIdIdx: index('idx_campaign_targets_campaign_id').on(table.campaignId),
  targetIdx: index('idx_campaign_targets_target').on(table.targetType, table.targetId),
  statusIdx: index('idx_campaign_targets_status').on(table.status),
}));

export const crmCampaignTargetsRelations = relations(crmCampaignTargets, ({ one }) => ({
  campaign: one(crmCampaigns, {
    fields: [crmCampaignTargets.campaignId],
    references: [crmCampaigns.id],
  }),
  convertedLead: one(leads, {
    fields: [crmCampaignTargets.convertedToLeadId],
    references: [leads.id],
  }),
}));

export type CrmCampaignTarget = typeof crmCampaignTargets.$inferSelect;
export type NewCrmCampaignTarget = typeof crmCampaignTargets.$inferInsert;

// =====================================================
// CRM CAMPAIGN CONTENT
// =====================================================

export const crmCampaignContent = pgTable('crm_campaign_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').notNull().references(() => crmCampaigns.id, { onDelete: 'cascade' }),

  // Content type
  contentType: text('content_type').notNull(), // email, landing_page, linkedin_message, call_script, asset

  // Content
  name: text('name'),
  subject: text('subject'),
  body: text('body'),
  htmlBody: text('html_body'),

  // Assets
  assetUrl: text('asset_url'),
  thumbnailUrl: text('thumbnail_url'),

  // Version control
  version: integer('version').default(1),
  isActive: boolean('is_active').default(true),

  // A/B testing
  variant: text('variant'), // A, B, C, etc.

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
}, (table) => ({
  campaignIdIdx: index('idx_campaign_content_campaign_id').on(table.campaignId),
  typeIdx: index('idx_campaign_content_type').on(table.contentType),
  variantIdx: index('idx_campaign_content_variant').on(table.variant),
}));

export const crmCampaignContentRelations = relations(crmCampaignContent, ({ one }) => ({
  campaign: one(crmCampaigns, {
    fields: [crmCampaignContent.campaignId],
    references: [crmCampaigns.id],
  }),
  creator: one(userProfiles, {
    fields: [crmCampaignContent.createdBy],
    references: [userProfiles.id],
  }),
}));

export type CrmCampaignContentItem = typeof crmCampaignContent.$inferSelect;
export type NewCrmCampaignContentItem = typeof crmCampaignContent.$inferInsert;

// =====================================================
// CRM CAMPAIGN METRICS
// =====================================================

export const crmCampaignMetrics = pgTable('crm_campaign_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').notNull().references(() => crmCampaigns.id, { onDelete: 'cascade' }),

  // Period
  period: text('period'), // YYYY-MM-DD or YYYY-MM for daily/monthly snapshots
  periodStart: timestamp('period_start', { withTimezone: true }),
  periodEnd: timestamp('period_end', { withTimezone: true }),

  // Reach metrics
  totalTargets: integer('total_targets').default(0),
  totalSent: integer('total_sent').default(0),
  totalDelivered: integer('total_delivered').default(0),
  totalBounced: integer('total_bounced').default(0),

  // Engagement metrics
  totalOpens: integer('total_opens').default(0),
  uniqueOpens: integer('unique_opens').default(0),
  totalClicks: integer('total_clicks').default(0),
  uniqueClicks: integer('unique_clicks').default(0),
  totalResponses: integer('total_responses').default(0),

  // Conversion metrics
  totalConversions: integer('total_conversions').default(0),
  totalLeadsGenerated: integer('total_leads_generated').default(0),
  totalMeetingsBooked: integer('total_meetings_booked').default(0),

  // Rates (calculated)
  openRate: numeric('open_rate', { precision: 5, scale: 2 }),
  clickRate: numeric('click_rate', { precision: 5, scale: 2 }),
  responseRate: numeric('response_rate', { precision: 5, scale: 2 }),
  conversionRate: numeric('conversion_rate', { precision: 5, scale: 2 }),
  bounceRate: numeric('bounce_rate', { precision: 5, scale: 2 }),

  // Cost metrics
  totalSpend: numeric('total_spend', { precision: 12, scale: 2 }),
  costPerSend: numeric('cost_per_send', { precision: 10, scale: 4 }),
  costPerOpen: numeric('cost_per_open', { precision: 10, scale: 4 }),
  costPerClick: numeric('cost_per_click', { precision: 10, scale: 4 }),
  costPerConversion: numeric('cost_per_conversion', { precision: 10, scale: 2 }),
  roi: numeric('roi', { precision: 10, scale: 2 }),

  // Revenue attribution
  attributedRevenue: numeric('attributed_revenue', { precision: 12, scale: 2 }),

  // Metadata
  calculatedAt: timestamp('calculated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  campaignIdIdx: index('idx_campaign_metrics_campaign_id').on(table.campaignId),
  periodIdx: index('idx_campaign_metrics_period').on(table.period),
}));

export const crmCampaignMetricsRelations = relations(crmCampaignMetrics, ({ one }) => ({
  campaign: one(crmCampaigns, {
    fields: [crmCampaignMetrics.campaignId],
    references: [crmCampaigns.id],
  }),
}));

export type CrmCampaignMetric = typeof crmCampaignMetrics.$inferSelect;
export type NewCrmCampaignMetric = typeof crmCampaignMetrics.$inferInsert;

// =====================================================
// CRM ACTIVITIES (Unified Activity Table)
// =====================================================

export const crmActivities = pgTable('crm_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Polymorphic association
  entityType: text('entity_type').notNull(), // account, contact, lead, deal, campaign
  entityId: uuid('entity_id').notNull(),

  // Activity details
  activityType: text('activity_type').notNull(), // call, email, meeting, note, task, linkedin, event
  subject: text('subject'),
  description: text('description'),
  outcome: text('outcome'),

  // Direction (for calls/emails)
  direction: text('direction'), // inbound, outbound

  // Scheduling
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  durationMinutes: integer('duration_minutes'),

  // Follow-up
  nextSteps: text('next_steps'),
  nextFollowUpDate: timestamp('next_follow_up_date', { withTimezone: true }),

  // Priority
  priority: text('priority').default('normal'), // urgent, high, normal, low

  // Assignment
  assignedTo: uuid('assigned_to').references(() => userProfiles.id),

  // Attribution
  createdBy: uuid('created_by').references(() => userProfiles.id),

  // Related entities
  relatedContactId: uuid('related_contact_id').references(() => crmContacts.id),
  relatedDealId: uuid('related_deal_id').references(() => deals.id),
  relatedCampaignId: uuid('related_campaign_id').references(() => crmCampaigns.id),

  // Status
  status: text('status').default('completed'), // pending, in_progress, completed, cancelled

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  orgIdIdx: index('idx_crm_activities_org_id').on(table.orgId),
  entityIdx: index('idx_crm_activities_entity').on(table.entityType, table.entityId),
  typeIdx: index('idx_crm_activities_type').on(table.activityType),
  assignedToIdx: index('idx_crm_activities_assigned_to').on(table.assignedTo),
  createdByIdx: index('idx_crm_activities_created_by').on(table.createdBy),
  scheduledAtIdx: index('idx_crm_activities_scheduled_at').on(table.scheduledAt),
  statusIdx: index('idx_crm_activities_status').on(table.status),
}));

export const crmActivitiesRelations = relations(crmActivities, ({ one }) => ({
  organization: one(organizations, {
    fields: [crmActivities.orgId],
    references: [organizations.id],
  }),
  assignee: one(userProfiles, {
    fields: [crmActivities.assignedTo],
    references: [userProfiles.id],
    relationName: 'activityAssignee',
  }),
  creator: one(userProfiles, {
    fields: [crmActivities.createdBy],
    references: [userProfiles.id],
    relationName: 'activityCreator',
  }),
  relatedContact: one(crmContacts, {
    fields: [crmActivities.relatedContactId],
    references: [crmContacts.id],
  }),
  relatedDeal: one(deals, {
    fields: [crmActivities.relatedDealId],
    references: [deals.id],
  }),
  relatedCampaign: one(crmCampaigns, {
    fields: [crmActivities.relatedCampaignId],
    references: [crmCampaigns.id],
  }),
}));

export type CrmActivity = typeof crmActivities.$inferSelect;
export type NewCrmActivity = typeof crmActivities.$inferInsert;

// =====================================================
// ACTIVITY LOG (Legacy - kept for backward compatibility)
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
}, (table) => ({
  orgIdIdx: index('idx_activity_log_org_id').on(table.orgId),
  entityIdx: index('idx_activity_log_entity').on(table.entityType, table.entityId),
  performedByIdx: index('idx_activity_log_performed_by').on(table.performedBy),
  activityDateIdx: index('idx_activity_log_activity_date').on(table.activityDate),
}));

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
// Enums for Type Safety
// =====================================================

export const AccountStatus = {
  PROSPECT: 'prospect',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CHURNED: 'churned',
} as const;

export const AccountTier = {
  STRATEGIC: 'strategic',
  GROWTH: 'growth',
  STANDARD: 'standard',
} as const;

export const CompanyType = {
  DIRECT_CLIENT: 'direct_client',
  IMPLEMENTATION_PARTNER: 'implementation_partner',
  MSP_VMS: 'msp_vms',
  SYSTEM_INTEGRATOR: 'system_integrator',
} as const;

export const CrmContactType = {
  CLIENT_POC: 'client_poc',
  CANDIDATE: 'candidate',
  VENDOR: 'vendor',
  PARTNER: 'partner',
  INTERNAL: 'internal',
  GENERAL: 'general',
} as const;

export const CrmContactStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DO_NOT_CONTACT: 'do_not_contact',
  BOUNCED: 'bounced',
  UNSUBSCRIBED: 'unsubscribed',
} as const;

export const LeadType = {
  COMPANY: 'company',
  PERSON: 'person',
} as const;

export const LeadStatus = {
  NEW: 'new',
  WARM: 'warm',
  HOT: 'hot',
  COLD: 'cold',
  CONVERTED: 'converted',
  LOST: 'lost',
} as const;

export const LeadSource = {
  LINKEDIN: 'linkedin',
  REFERRAL: 'referral',
  COLD_OUTREACH: 'cold_outreach',
  INBOUND: 'inbound',
  EVENT: 'event',
  PARTNER: 'partner',
  AD_CAMPAIGN: 'ad_campaign',
  OTHER: 'other',
} as const;

export const DecisionAuthority = {
  DECISION_MAKER: 'decision_maker',
  INFLUENCER: 'influencer',
  GATEKEEPER: 'gatekeeper',
  END_USER: 'end_user',
  CHAMPION: 'champion',
} as const;

export const DealType = {
  NEW_BUSINESS: 'new_business',
  EXPANSION: 'expansion',
  RENEWAL: 'renewal',
  UPSELL: 'upsell',
} as const;

export const DealStage = {
  DISCOVERY: 'discovery',
  QUALIFICATION: 'qualification',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  CLOSED_WON: 'closed_won',
  CLOSED_LOST: 'closed_lost',
} as const;

export const StakeholderRole = {
  DECISION_MAKER: 'decision_maker',
  INFLUENCER: 'influencer',
  CHAMPION: 'champion',
  BLOCKER: 'blocker',
  GATEKEEPER: 'gatekeeper',
  END_USER: 'end_user',
} as const;

export const CrmCampaignType = {
  EMAIL: 'email',
  LINKEDIN: 'linkedin',
  EVENT: 'event',
  WEBINAR: 'webinar',
  CONTENT: 'content',
  OUTBOUND_CALL: 'outbound_call',
} as const;

export const CrmCampaignStatus = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const CrmCampaignTargetStatus = {
  PENDING: 'pending',
  SENT: 'sent',
  OPENED: 'opened',
  CLICKED: 'clicked',
  RESPONDED: 'responded',
  CONVERTED: 'converted',
  BOUNCED: 'bounced',
  UNSUBSCRIBED: 'unsubscribed',
} as const;

export const ContractType = {
  MSA: 'msa',
  SOW: 'sow',
  NDA: 'nda',
  AMENDMENT: 'amendment',
  ADDENDUM: 'addendum',
} as const;

export const ContractStatus = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  TERMINATED: 'terminated',
} as const;

export const CRMActivityType = {
  CALL: 'call',
  EMAIL: 'email',
  MEETING: 'meeting',
  NOTE: 'note',
  TASK: 'task',
  LINKEDIN: 'linkedin',
  EVENT: 'event',
} as const;

export const CrmActivityDirection = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
} as const;

export const CrmActivityPriority = {
  URGENT: 'urgent',
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low',
} as const;

export const CrmActivityStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const AccountAddressType = {
  HQ: 'hq',
  BILLING: 'billing',
  OFFICE: 'office',
  SHIPPING: 'shipping',
} as const;

// Type exports
export type AccountStatusType = (typeof AccountStatus)[keyof typeof AccountStatus];
export type AccountTierType = (typeof AccountTier)[keyof typeof AccountTier];
export type CompanyTypeType = (typeof CompanyType)[keyof typeof CompanyType];
export type CrmContactTypeType = (typeof CrmContactType)[keyof typeof CrmContactType];
export type CrmContactStatusType = (typeof CrmContactStatus)[keyof typeof CrmContactStatus];
export type LeadTypeType = (typeof LeadType)[keyof typeof LeadType];
export type LeadStatusType = (typeof LeadStatus)[keyof typeof LeadStatus];
export type LeadSourceType = (typeof LeadSource)[keyof typeof LeadSource];
export type DecisionAuthorityType = (typeof DecisionAuthority)[keyof typeof DecisionAuthority];
export type DealTypeType = (typeof DealType)[keyof typeof DealType];
export type DealStageType = (typeof DealStage)[keyof typeof DealStage];
export type StakeholderRoleType = (typeof StakeholderRole)[keyof typeof StakeholderRole];
export type CrmCampaignTypeType = (typeof CrmCampaignType)[keyof typeof CrmCampaignType];
export type CrmCampaignStatusType = (typeof CrmCampaignStatus)[keyof typeof CrmCampaignStatus];
export type CrmCampaignTargetStatusType = (typeof CrmCampaignTargetStatus)[keyof typeof CrmCampaignTargetStatus];
export type ContractTypeType = (typeof ContractType)[keyof typeof ContractType];
export type ContractStatusType = (typeof ContractStatus)[keyof typeof ContractStatus];
export type CRMActivityTypeType = (typeof CRMActivityType)[keyof typeof CRMActivityType];
export type CrmActivityDirectionType = (typeof CrmActivityDirection)[keyof typeof CrmActivityDirection];
export type CrmActivityPriorityType = (typeof CrmActivityPriority)[keyof typeof CrmActivityPriority];
export type CrmActivityStatusType = (typeof CrmActivityStatus)[keyof typeof CrmActivityStatus];
export type AccountAddressTypeType = (typeof AccountAddressType)[keyof typeof AccountAddressType];
