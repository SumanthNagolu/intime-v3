/**
 * Lead Entity Configuration
 *
 * Defines the Lead entity structure for database, tRPC, and frontend sync.
 */

import type { EntityConfig } from '../types';

export const leadEntity: EntityConfig = {
  // ==========================================
  // IDENTITY
  // ==========================================
  name: 'lead',
  displayName: 'Lead',
  pluralName: 'Leads',

  // ==========================================
  // DATABASE
  // ==========================================
  tableName: 'leads',
  schema: 'public',

  // ==========================================
  // tRPC
  // ==========================================
  router: 'crm',
  procedures: {
    getById: 'getLeadById',
    list: 'listLeads',
    create: 'createLead',
    update: 'updateLead',
    delete: 'deleteLead',
    // Custom procedures
    convertToDeal: 'convertLeadToDeal',
    bulkAssign: 'bulkAssignLeads',
    bulkUpdateStatus: 'bulkUpdateLeadStatus',
  },

  // ==========================================
  // FIELDS
  // ==========================================
  fields: {
    // Primary key
    id: {
      type: 'uuid',
      primaryKey: true,
      description: 'Unique identifier',
    },

    // Multi-tenant
    orgId: {
      type: 'uuid',
      required: true,
      internal: true,
      references: 'organizations',
      description: 'Organization ID for multi-tenancy',
    },

    // Lead type
    leadType: {
      type: 'enum',
      required: true,
      options: ['company', 'person'],
      defaultValue: 'company',
      description: 'Type of lead - company or individual',
    },

    // --------------------------------
    // Company fields
    // --------------------------------
    companyName: {
      type: 'text',
      maxLength: 255,
      description: 'Company/organization name',
    },
    industry: {
      type: 'enum',
      options: [
        'technology',
        'healthcare',
        'finance',
        'manufacturing',
        'retail',
        'consulting',
        'other',
      ],
      description: 'Industry vertical',
    },
    companyType: {
      type: 'enum',
      options: [
        'direct_client',
        'implementation_partner',
        'msp_vms',
        'system_integrator',
      ],
      description: 'Type of company relationship',
    },
    companySize: {
      type: 'enum',
      options: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      description: 'Company employee count range',
    },
    tier: {
      type: 'enum',
      options: ['enterprise', 'mid_market', 'smb', 'strategic'],
      description: 'Account tier classification',
    },
    website: {
      type: 'url',
      maxLength: 500,
      description: 'Company website URL',
    },
    headquarters: {
      type: 'text',
      maxLength: 255,
      description: 'Headquarters location',
    },
    companyDescription: {
      type: 'text',
      description: 'Company description/notes',
    },

    // --------------------------------
    // Contact fields
    // --------------------------------
    firstName: {
      type: 'text',
      maxLength: 100,
      description: 'Contact first name',
    },
    lastName: {
      type: 'text',
      maxLength: 100,
      description: 'Contact last name',
    },
    title: {
      type: 'text',
      maxLength: 200,
      description: 'Contact job title',
    },
    email: {
      type: 'email',
      maxLength: 255,
      description: 'Contact email address',
    },
    phone: {
      type: 'phone',
      maxLength: 30,
      description: 'Contact phone number',
    },
    linkedinUrl: {
      type: 'url',
      maxLength: 500,
      description: 'LinkedIn profile URL',
    },
    decisionAuthority: {
      type: 'enum',
      options: [
        'decision_maker',
        'influencer',
        'gatekeeper',
        'end_user',
        'champion',
      ],
      description: 'Decision-making authority level',
    },
    preferredContactMethod: {
      type: 'enum',
      options: ['email', 'phone', 'linkedin'],
      defaultValue: 'email',
      description: 'Preferred method of contact',
    },

    // --------------------------------
    // Link to existing account
    // --------------------------------
    accountId: {
      type: 'uuid',
      references: 'accounts',
      description: 'Link to existing account (for person leads)',
    },

    // --------------------------------
    // Lead status & value
    // --------------------------------
    status: {
      type: 'enum',
      required: true,
      options: [
        'new',
        'contacted',
        'qualified',
        'proposal',
        'negotiation',
        'converted',
        'lost',
      ],
      defaultValue: 'new',
      description: 'Current lead status',
    },
    estimatedValue: {
      type: 'currency',
      precision: 12,
      scale: 2,
      description: 'Estimated deal value',
    },

    // --------------------------------
    // Source tracking
    // --------------------------------
    source: {
      type: 'enum',
      options: [
        'website',
        'referral',
        'linkedin',
        'cold_outreach',
        'event',
        'inbound',
        'partner',
      ],
      description: 'Lead source/origin',
    },
    sourceCampaignId: {
      type: 'uuid',
      description: 'Marketing campaign that generated this lead',
    },

    // --------------------------------
    // Assignment
    // --------------------------------
    ownerId: {
      type: 'uuid',
      references: 'userProfiles',
      description: 'Assigned owner/sales rep',
    },

    // --------------------------------
    // Notes
    // --------------------------------
    notes: {
      type: 'text',
      description: 'General notes about the lead',
    },

    // --------------------------------
    // BANT Qualification
    // --------------------------------
    bantBudget: {
      type: 'integer',
      min: 0,
      max: 25,
      defaultValue: 0,
      description: 'Budget qualification score (0-25)',
    },
    bantAuthority: {
      type: 'integer',
      min: 0,
      max: 25,
      defaultValue: 0,
      description: 'Authority qualification score (0-25)',
    },
    bantNeed: {
      type: 'integer',
      min: 0,
      max: 25,
      defaultValue: 0,
      description: 'Need qualification score (0-25)',
    },
    bantTimeline: {
      type: 'integer',
      min: 0,
      max: 25,
      defaultValue: 0,
      description: 'Timeline qualification score (0-25)',
    },
    bantBudgetNotes: {
      type: 'text',
      description: 'Notes on budget qualification',
    },
    bantAuthorityNotes: {
      type: 'text',
      description: 'Notes on authority qualification',
    },
    bantNeedNotes: {
      type: 'text',
      description: 'Notes on need qualification',
    },
    bantTimelineNotes: {
      type: 'text',
      description: 'Notes on timeline qualification',
    },

    // --------------------------------
    // Engagement tracking
    // --------------------------------
    lastContactedAt: {
      type: 'timestamp',
      description: 'Last time we contacted this lead',
    },
    lastResponseAt: {
      type: 'timestamp',
      description: 'Last time lead responded',
    },
    engagementScore: {
      type: 'integer',
      min: 0,
      max: 100,
      description: 'Engagement score percentage',
    },

    // --------------------------------
    // Conversion tracking
    // --------------------------------
    convertedToDealId: {
      type: 'uuid',
      description: 'Deal ID if converted',
    },
    convertedToAccountId: {
      type: 'uuid',
      references: 'accounts',
      description: 'Account ID if converted',
    },
    convertedAt: {
      type: 'timestamp',
      description: 'When lead was converted',
    },
    lostReason: {
      type: 'text',
      description: 'Reason if lead was lost',
    },

    // --------------------------------
    // Audit fields
    // --------------------------------
    createdAt: {
      type: 'timestamp',
      required: true,
      auto: true,
      description: 'Record creation timestamp',
    },
    updatedAt: {
      type: 'timestamp',
      required: true,
      auto: true,
      description: 'Record last update timestamp',
    },
    createdBy: {
      type: 'uuid',
      references: 'userProfiles',
      internal: true,
      description: 'User who created the record',
    },
    deletedAt: {
      type: 'timestamp',
      softDelete: true,
      description: 'Soft delete timestamp',
    },
  },

  // ==========================================
  // RELATIONS
  // ==========================================
  relations: {
    organization: {
      type: 'belongsTo',
      entity: 'organization',
      field: 'orgId',
    },
    owner: {
      type: 'belongsTo',
      entity: 'userProfile',
      field: 'ownerId',
      eager: true,
    },
    account: {
      type: 'belongsTo',
      entity: 'account',
      field: 'accountId',
    },
    convertedToAccount: {
      type: 'belongsTo',
      entity: 'account',
      field: 'convertedToAccountId',
    },
    activities: {
      type: 'hasMany',
      entity: 'activity',
      foreignKey: 'entityId',
    },
  },

  // ==========================================
  // INDEXES
  // ==========================================
  indexes: [
    { fields: ['orgId'], name: 'idx_leads_org' },
    { fields: ['orgId', 'status'], name: 'idx_leads_org_status' },
    { fields: ['orgId', 'ownerId'], name: 'idx_leads_org_owner' },
    { fields: ['orgId', 'tier'], name: 'idx_leads_org_tier' },
    { fields: ['orgId', 'createdAt'], name: 'idx_leads_org_created' },
    { fields: ['accountId'], name: 'idx_leads_account' },
    {
      fields: ['orgId'],
      name: 'idx_leads_active',
      where: 'deleted_at IS NULL',
    },
  ],

  // ==========================================
  // SEARCH
  // ==========================================
  searchFields: ['companyName', 'firstName', 'lastName', 'email'],

  // ==========================================
  // DEFAULTS
  // ==========================================
  defaultSort: {
    field: 'createdAt',
    direction: 'desc',
  },

  listFields: [
    'companyName',
    'firstName',
    'lastName',
    'status',
    'tier',
    'estimatedValue',
    'source',
    'ownerId',
    'lastContactedAt',
    'createdAt',
  ],

  detailFields: [
    // All fields except internal
  ],
};

export default leadEntity;
