/**
 * Account Entity Configuration
 *
 * Defines the Account entity structure for database, tRPC, and frontend sync.
 * Account is a supporting entity (no workplan) that represents client organizations.
 */

import type { EntityConfig } from '../types';

export const accountEntity: EntityConfig = {
  // ==========================================
  // IDENTITY
  // ==========================================
  name: 'account',
  displayName: 'Account',
  pluralName: 'Accounts',

  // ==========================================
  // DATABASE
  // ==========================================
  tableName: 'accounts',
  schema: 'public',

  // ==========================================
  // tRPC
  // ==========================================
  router: 'crm',
  procedures: {
    getById: 'getAccountById',
    list: 'listAccounts',
    create: 'createAccount',
    update: 'updateAccount',
    delete: 'deleteAccount',
    // Custom procedures
    getMetrics: 'getAccountMetrics',
    bulkAssign: 'bulkAssignAccounts',
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

    // --------------------------------
    // Core fields
    // --------------------------------
    name: {
      type: 'text',
      required: true,
      maxLength: 255,
      description: 'Account/company name',
    },
    industry: {
      type: 'enum',
      options: [
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
        'staffing_agency',
        'vendor',
      ],
      defaultValue: 'direct_client',
      description: 'Type of company relationship',
    },
    status: {
      type: 'enum',
      required: true,
      options: ['prospect', 'active', 'inactive', 'churned'],
      defaultValue: 'prospect',
      description: 'Current account status',
    },
    tier: {
      type: 'enum',
      options: ['enterprise', 'mid_market', 'smb', 'strategic'],
      description: 'Account tier classification',
    },

    // --------------------------------
    // Account management
    // --------------------------------
    accountManagerId: {
      type: 'uuid',
      references: 'userProfiles',
      description: 'Assigned account manager',
    },
    responsiveness: {
      type: 'enum',
      options: ['high', 'medium', 'low'],
      description: 'Client responsiveness level',
    },
    preferredQuality: {
      type: 'enum',
      options: ['premium', 'standard', 'budget'],
      description: 'Preferred quality tier for submissions',
    },
    description: {
      type: 'text',
      description: 'Account description and notes',
    },

    // --------------------------------
    // Business terms
    // --------------------------------
    contractStartDate: {
      type: 'timestamp',
      description: 'Contract start date',
    },
    contractEndDate: {
      type: 'timestamp',
      description: 'Contract end date',
    },
    paymentTermsDays: {
      type: 'integer',
      defaultValue: 30,
      min: 0,
      max: 180,
      description: 'Payment terms in days (Net 30, etc.)',
    },
    markupPercentage: {
      type: 'currency',
      precision: 5,
      scale: 2,
      description: 'Standard markup percentage',
    },
    annualRevenueTarget: {
      type: 'currency',
      precision: 12,
      scale: 2,
      description: 'Annual revenue target for this account',
    },

    // --------------------------------
    // Contact info
    // --------------------------------
    website: {
      type: 'url',
      maxLength: 500,
      description: 'Company website URL',
    },
    headquartersLocation: {
      type: 'text',
      maxLength: 255,
      description: 'Headquarters location/address',
    },
    phone: {
      type: 'phone',
      maxLength: 30,
      description: 'Main company phone',
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
    updatedBy: {
      type: 'uuid',
      references: 'userProfiles',
      internal: true,
      description: 'User who last updated the record',
    },
    deletedAt: {
      type: 'timestamp',
      softDelete: true,
      description: 'Soft delete timestamp',
    },

    // --------------------------------
    // Search (internal)
    // --------------------------------
    searchVector: {
      type: 'text',
      internal: true,
      computed: true,
      description: 'Full-text search vector (tsvector)',
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
    accountManager: {
      type: 'belongsTo',
      entity: 'userProfile',
      field: 'accountManagerId',
      eager: true,
    },
    pointOfContacts: {
      type: 'hasMany',
      entity: 'pointOfContact',
      foreignKey: 'accountId',
    },
    leads: {
      type: 'hasMany',
      entity: 'lead',
      foreignKey: 'accountId',
    },
    deals: {
      type: 'hasMany',
      entity: 'deal',
      foreignKey: 'accountId',
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
    { fields: ['orgId'], name: 'idx_accounts_org', where: 'deleted_at IS NULL' },
    { fields: ['name'], name: 'idx_accounts_name', where: 'deleted_at IS NULL' },
    { fields: ['status'], name: 'idx_accounts_status', where: 'deleted_at IS NULL' },
    { fields: ['accountManagerId'], name: 'idx_accounts_manager' },
  ],

  // ==========================================
  // SEARCH
  // ==========================================
  searchFields: ['name', 'website', 'headquartersLocation'],

  // ==========================================
  // DEFAULTS
  // ==========================================
  defaultSort: {
    field: 'name',
    direction: 'asc',
  },

  listFields: [
    'name',
    'industry',
    'companyType',
    'status',
    'tier',
    'accountManagerId',
    'annualRevenueTarget',
    'phone',
    'createdAt',
  ],

  detailFields: [
    'name',
    'industry',
    'companyType',
    'status',
    'tier',
    'accountManagerId',
    'responsiveness',
    'preferredQuality',
    'description',
    'contractStartDate',
    'contractEndDate',
    'paymentTermsDays',
    'markupPercentage',
    'annualRevenueTarget',
    'website',
    'headquartersLocation',
    'phone',
    'createdAt',
    'updatedAt',
  ],
};

export default accountEntity;
