import { z } from 'zod'

export interface EntityConfig {
  name: string
  table: string
  displayName: string
  importable: boolean
  exportable: boolean
  fields: FieldConfig[]
  uniqueConstraints: string[][]
  foreignKeys: ForeignKeyConfig[]
  validations?: z.ZodSchema
}

export interface FieldConfig {
  name: string
  dbColumn: string
  displayName: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'email' | 'phone' | 'uuid' | 'json' | 'array'
  required: boolean
  importable: boolean
  exportable: boolean
  defaultValue?: unknown
  enumValues?: string[]
  maxLength?: number
  validation?: z.ZodSchema
}

export interface ForeignKeyConfig {
  field: string
  referencesTable: string
  referencesColumn: string
  lookupField?: string // Field to match on import (e.g., 'email' instead of 'id')
  createIfMissing?: boolean
}

// Entity configurations for all importable/exportable entities
export const ENTITY_CONFIGS: Record<string, EntityConfig> = {
  candidates: {
    name: 'candidates',
    table: 'user_profiles',
    displayName: 'Candidates',
    importable: true,
    exportable: true,
    fields: [
      { name: 'email', dbColumn: 'email', displayName: 'Email', type: 'email', required: true, importable: true, exportable: true },
      { name: 'first_name', dbColumn: 'first_name', displayName: 'First Name', type: 'string', required: true, importable: true, exportable: true, maxLength: 100 },
      { name: 'last_name', dbColumn: 'last_name', displayName: 'Last Name', type: 'string', required: true, importable: true, exportable: true, maxLength: 100 },
      { name: 'phone', dbColumn: 'phone', displayName: 'Phone', type: 'phone', required: false, importable: true, exportable: true },
      { name: 'candidate_status', dbColumn: 'candidate_status', displayName: 'Status', type: 'string', required: false, importable: true, exportable: true, enumValues: ['active', 'passive', 'placed', 'inactive', 'do_not_contact'] },
      { name: 'visa_status', dbColumn: 'visa_status', displayName: 'Visa Status', type: 'string', required: false, importable: true, exportable: true },
      { name: 'location', dbColumn: 'location', displayName: 'Location', type: 'string', required: false, importable: true, exportable: true },
      { name: 'availability_date', dbColumn: 'availability_date', displayName: 'Availability Date', type: 'date', required: false, importable: true, exportable: true },
      { name: 'linkedin_url', dbColumn: 'linkedin_url', displayName: 'LinkedIn URL', type: 'string', required: false, importable: true, exportable: true },
      { name: 'created_at', dbColumn: 'created_at', displayName: 'Created At', type: 'datetime', required: false, importable: false, exportable: true },
    ],
    uniqueConstraints: [['email']],
    foreignKeys: [],
  },

  jobs: {
    name: 'jobs',
    table: 'jobs',
    displayName: 'Jobs',
    importable: true,
    exportable: true,
    fields: [
      { name: 'title', dbColumn: 'title', displayName: 'Title', type: 'string', required: true, importable: true, exportable: true },
      { name: 'description', dbColumn: 'description', displayName: 'Description', type: 'string', required: false, importable: true, exportable: true },
      { name: 'status', dbColumn: 'status', displayName: 'Status', type: 'string', required: false, importable: true, exportable: true, enumValues: ['draft', 'open', 'on_hold', 'filled', 'cancelled'], defaultValue: 'open' },
      { name: 'account_name', dbColumn: 'account_id', displayName: 'Account', type: 'string', required: false, importable: true, exportable: true },
      { name: 'location', dbColumn: 'location', displayName: 'Location', type: 'string', required: false, importable: true, exportable: true },
      { name: 'is_remote', dbColumn: 'is_remote', displayName: 'Remote', type: 'boolean', required: false, importable: true, exportable: true, defaultValue: false },
      { name: 'rate_min', dbColumn: 'rate_min', displayName: 'Min Rate', type: 'number', required: false, importable: true, exportable: true },
      { name: 'rate_max', dbColumn: 'rate_max', displayName: 'Max Rate', type: 'number', required: false, importable: true, exportable: true },
      { name: 'positions_available', dbColumn: 'positions_available', displayName: 'Positions', type: 'number', required: false, importable: true, exportable: true, defaultValue: 1 },
      { name: 'created_at', dbColumn: 'created_at', displayName: 'Created At', type: 'datetime', required: false, importable: false, exportable: true },
    ],
    uniqueConstraints: [],
    foreignKeys: [
      { field: 'account_name', referencesTable: 'accounts', referencesColumn: 'id', lookupField: 'name' },
    ],
  },

  accounts: {
    name: 'accounts',
    table: 'accounts',
    displayName: 'Accounts',
    importable: true,
    exportable: true,
    fields: [
      { name: 'name', dbColumn: 'name', displayName: 'Name', type: 'string', required: true, importable: true, exportable: true },
      { name: 'industry', dbColumn: 'industry', displayName: 'Industry', type: 'string', required: false, importable: true, exportable: true },
      { name: 'status', dbColumn: 'status', displayName: 'Status', type: 'string', required: false, importable: true, exportable: true, enumValues: ['prospect', 'active', 'inactive', 'churned'], defaultValue: 'prospect' },
      { name: 'tier', dbColumn: 'tier', displayName: 'Tier', type: 'string', required: false, importable: true, exportable: true, enumValues: ['enterprise', 'mid_market', 'smb'] },
      { name: 'website', dbColumn: 'website', displayName: 'Website', type: 'string', required: false, importable: true, exportable: true },
      { name: 'phone', dbColumn: 'phone', displayName: 'Phone', type: 'phone', required: false, importable: true, exportable: true },
      { name: 'created_at', dbColumn: 'created_at', displayName: 'Created At', type: 'datetime', required: false, importable: false, exportable: true },
    ],
    uniqueConstraints: [['name']],
    foreignKeys: [],
  },

  contacts: {
    name: 'contacts',
    table: 'point_of_contacts',
    displayName: 'Contacts',
    importable: true,
    exportable: true,
    fields: [
      { name: 'first_name', dbColumn: 'first_name', displayName: 'First Name', type: 'string', required: true, importable: true, exportable: true },
      { name: 'last_name', dbColumn: 'last_name', displayName: 'Last Name', type: 'string', required: true, importable: true, exportable: true },
      { name: 'email', dbColumn: 'email', displayName: 'Email', type: 'email', required: false, importable: true, exportable: true },
      { name: 'phone', dbColumn: 'phone', displayName: 'Phone', type: 'phone', required: false, importable: true, exportable: true },
      { name: 'title', dbColumn: 'title', displayName: 'Title', type: 'string', required: false, importable: true, exportable: true },
      { name: 'account_name', dbColumn: 'account_id', displayName: 'Account', type: 'string', required: true, importable: true, exportable: true },
      { name: 'created_at', dbColumn: 'created_at', displayName: 'Created At', type: 'datetime', required: false, importable: false, exportable: true },
    ],
    uniqueConstraints: [],
    foreignKeys: [
      { field: 'account_name', referencesTable: 'accounts', referencesColumn: 'id', lookupField: 'name' },
    ],
  },

  leads: {
    name: 'leads',
    table: 'leads',
    displayName: 'Leads',
    importable: true,
    exportable: true,
    fields: [
      { name: 'company_name', dbColumn: 'company_name', displayName: 'Company', type: 'string', required: false, importable: true, exportable: true },
      { name: 'first_name', dbColumn: 'first_name', displayName: 'First Name', type: 'string', required: false, importable: true, exportable: true },
      { name: 'last_name', dbColumn: 'last_name', displayName: 'Last Name', type: 'string', required: false, importable: true, exportable: true },
      { name: 'email', dbColumn: 'email', displayName: 'Email', type: 'email', required: false, importable: true, exportable: true },
      { name: 'phone', dbColumn: 'phone', displayName: 'Phone', type: 'phone', required: false, importable: true, exportable: true },
      { name: 'status', dbColumn: 'status', displayName: 'Status', type: 'string', required: false, importable: true, exportable: true, enumValues: ['new', 'contacted', 'qualified', 'unqualified', 'converted'], defaultValue: 'new' },
      { name: 'source', dbColumn: 'source', displayName: 'Source', type: 'string', required: false, importable: true, exportable: true },
      { name: 'created_at', dbColumn: 'created_at', displayName: 'Created At', type: 'datetime', required: false, importable: false, exportable: true },
    ],
    uniqueConstraints: [],
    foreignKeys: [],
  },

  employees: {
    name: 'employees',
    table: 'user_profiles',
    displayName: 'Employees',
    importable: true,
    exportable: true,
    fields: [
      { name: 'email', dbColumn: 'email', displayName: 'Email', type: 'email', required: true, importable: true, exportable: true },
      { name: 'first_name', dbColumn: 'first_name', displayName: 'First Name', type: 'string', required: true, importable: true, exportable: true },
      { name: 'last_name', dbColumn: 'last_name', displayName: 'Last Name', type: 'string', required: true, importable: true, exportable: true },
      { name: 'phone', dbColumn: 'phone', displayName: 'Phone', type: 'phone', required: false, importable: true, exportable: true },
      { name: 'role', dbColumn: 'role', displayName: 'Role', type: 'string', required: false, importable: true, exportable: true },
      { name: 'department', dbColumn: 'department', displayName: 'Department', type: 'string', required: false, importable: true, exportable: true },
      { name: 'title', dbColumn: 'title', displayName: 'Title', type: 'string', required: false, importable: true, exportable: true },
      { name: 'hire_date', dbColumn: 'hire_date', displayName: 'Hire Date', type: 'date', required: false, importable: true, exportable: true },
      { name: 'created_at', dbColumn: 'created_at', displayName: 'Created At', type: 'datetime', required: false, importable: false, exportable: true },
    ],
    uniqueConstraints: [['email']],
    foreignKeys: [],
  },

  submissions: {
    name: 'submissions',
    table: 'submissions',
    displayName: 'Submissions',
    importable: false,
    exportable: true,
    fields: [
      { name: 'candidate_email', dbColumn: 'candidate_id', displayName: 'Candidate', type: 'string', required: true, importable: false, exportable: true },
      { name: 'job_title', dbColumn: 'job_id', displayName: 'Job', type: 'string', required: true, importable: false, exportable: true },
      { name: 'status', dbColumn: 'status', displayName: 'Status', type: 'string', required: false, importable: false, exportable: true },
      { name: 'submitted_at', dbColumn: 'submitted_at', displayName: 'Submitted At', type: 'datetime', required: false, importable: false, exportable: true },
      { name: 'created_at', dbColumn: 'created_at', displayName: 'Created At', type: 'datetime', required: false, importable: false, exportable: true },
    ],
    uniqueConstraints: [],
    foreignKeys: [],
  },

  interviews: {
    name: 'interviews',
    table: 'interviews',
    displayName: 'Interviews',
    importable: false,
    exportable: true,
    fields: [
      { name: 'submission_id', dbColumn: 'submission_id', displayName: 'Submission', type: 'uuid', required: true, importable: false, exportable: true },
      { name: 'interview_type', dbColumn: 'interview_type', displayName: 'Type', type: 'string', required: false, importable: false, exportable: true },
      { name: 'scheduled_at', dbColumn: 'scheduled_at', displayName: 'Scheduled At', type: 'datetime', required: false, importable: false, exportable: true },
      { name: 'status', dbColumn: 'status', displayName: 'Status', type: 'string', required: false, importable: false, exportable: true },
      { name: 'created_at', dbColumn: 'created_at', displayName: 'Created At', type: 'datetime', required: false, importable: false, exportable: true },
    ],
    uniqueConstraints: [],
    foreignKeys: [],
  },

  placements: {
    name: 'placements',
    table: 'placements',
    displayName: 'Placements',
    importable: false,
    exportable: true,
    fields: [
      { name: 'submission_id', dbColumn: 'submission_id', displayName: 'Submission', type: 'uuid', required: true, importable: false, exportable: true },
      { name: 'start_date', dbColumn: 'start_date', displayName: 'Start Date', type: 'date', required: false, importable: false, exportable: true },
      { name: 'end_date', dbColumn: 'end_date', displayName: 'End Date', type: 'date', required: false, importable: false, exportable: true },
      { name: 'bill_rate', dbColumn: 'bill_rate', displayName: 'Bill Rate', type: 'number', required: false, importable: false, exportable: true },
      { name: 'pay_rate', dbColumn: 'pay_rate', displayName: 'Pay Rate', type: 'number', required: false, importable: false, exportable: true },
      { name: 'status', dbColumn: 'status', displayName: 'Status', type: 'string', required: false, importable: false, exportable: true },
      { name: 'created_at', dbColumn: 'created_at', displayName: 'Created At', type: 'datetime', required: false, importable: false, exportable: true },
    ],
    uniqueConstraints: [],
    foreignKeys: [],
  },

  pods: {
    name: 'pods',
    table: 'pods',
    displayName: 'Pods',
    importable: true,
    exportable: true,
    fields: [
      { name: 'name', dbColumn: 'name', displayName: 'Name', type: 'string', required: true, importable: true, exportable: true },
      { name: 'description', dbColumn: 'description', displayName: 'Description', type: 'string', required: false, importable: true, exportable: true },
      { name: 'pod_type', dbColumn: 'pod_type', displayName: 'Type', type: 'string', required: false, importable: true, exportable: true, enumValues: ['recruiting', 'bench_sales', 'talent_acquisition', 'hr', 'mixed'] },
      { name: 'status', dbColumn: 'status', displayName: 'Status', type: 'string', required: false, importable: true, exportable: true, enumValues: ['active', 'inactive', 'archived'], defaultValue: 'active' },
      { name: 'created_at', dbColumn: 'created_at', displayName: 'Created At', type: 'datetime', required: false, importable: false, exportable: true },
    ],
    uniqueConstraints: [['name']],
    foreignKeys: [],
  },
}

export const getEntityConfig = (entityType: string): EntityConfig | undefined => {
  return ENTITY_CONFIGS[entityType]
}

export const getImportableEntities = (): EntityConfig[] => {
  return Object.values(ENTITY_CONFIGS).filter(e => e.importable)
}

export const getExportableEntities = (): EntityConfig[] => {
  return Object.values(ENTITY_CONFIGS).filter(e => e.exportable)
}

export const getEntityByTable = (tableName: string): EntityConfig | undefined => {
  return Object.values(ENTITY_CONFIGS).find(e => e.table === tableName)
}
