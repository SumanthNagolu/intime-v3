# Data Management Implementation Plan

## Overview

Implement a full production-ready Data Management system for the Admin Portal that enables admins to import, export, archive, and manage data across the InTime platform with GDPR compliance.

**Feature**: Data Management (ADMIN-US-006)
**Epic**: Admin Portal (Epic-01)
**Priority**: Medium
**Estimated Phases**: 10

---

## Current State Analysis

### What Exists
- tRPC router patterns established (`src/server/trpc/`)
- Admin portal structure with routes and navigation
- File upload component (`src/components/ui/file-upload.tsx`)
- Audit logging via database triggers
- Multi-tenant data isolation via `org_id`
- Database schema for `bulk_activity_jobs` (unused)
- ioredis dependency installed (unused)
- Vercel Cron configured (not implemented)

### What's Missing
- CSV/Excel parsing libraries (papaparse, xlsx)
- Import/Export job tables
- GDPR request tables
- Duplicate detection tables
- Supabase Edge Functions for async processing
- Data management UI components
- tRPC data router

---

## Desired End State

### Functional
1. **Data Import**: Multi-step wizard supporting CSV, Excel, JSON with field mapping, validation preview, and progress tracking for 100K+ rows
2. **Data Export**: Filter-based export builder with column selection, multiple formats, and scheduled recurring exports
3. **Bulk Operations**: Update/delete multiple records with preview and confirmation
4. **Duplicate Management**: Automated detection, review interface, and merge functionality
5. **GDPR Compliance**: Process DSAR requests, erasure requests, and generate subject data exports
6. **Data Archival**: Archive old records, view archived data, restore or permanently delete

### Technical
- Background job processing via Supabase Edge Functions
- Real-time progress tracking via database polling
- Scheduled exports via Vercel Cron
- Comprehensive audit trail for all operations
- Support for 37 entity types across all modules

### Verification
- All acceptance criteria from spec met
- Unit tests for services and utilities
- E2E tests for critical workflows
- Performance validated for 100K row imports

---

## What We're NOT Doing

- Real-time data sync with external systems
- Data masking for non-admin users (separate feature)
- Custom ETL pipelines
- Third-party integrations (Zapier, etc.)
- Automatic duplicate merge (manual review only)
- Cross-organization data operations

---

## Implementation Approach

**Architecture**:
- Supabase Edge Functions for async job processing (imports, exports, GDPR)
- Database-driven job status with client polling
- Multi-step wizard pattern for complex workflows
- Entity-agnostic services with configuration per entity type

**Job Processing Flow**:
```
Client → tRPC (create job record) → Edge Function (async processing)
                ↓                              ↓
          Return job ID              Process in chunks
                                              ↓
Client polls status ← Database ← Update progress
```

---

## Phase 1: Database Schema

### Overview
Create database tables for import jobs, export jobs, GDPR requests, and duplicate tracking.

### Changes Required

#### 1. Migration File
**File**: `supabase/migrations/20251208000000_data_management_tables.sql` (NEW)

```sql
-- ============================================================================
-- Migration: Data Management Tables
-- Date: 2025-12-08
-- Description: Tables for data import, export, GDPR, and duplicate management
-- ============================================================================

-- ============================================================================
-- IMPORT JOBS
-- ============================================================================
CREATE TABLE IF NOT EXISTS import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Job configuration
  entity_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes INTEGER,
  field_mapping JSONB NOT NULL DEFAULT '{}',
  import_options JSONB NOT NULL DEFAULT '{}',

  -- Progress tracking
  total_rows INTEGER,
  processed_rows INTEGER DEFAULT 0,
  success_rows INTEGER DEFAULT 0,
  error_rows INTEGER DEFAULT 0,
  warning_rows INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  error_message TEXT,
  error_log JSONB DEFAULT '[]',
  warnings_log JSONB DEFAULT '[]',

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Audit
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE import_jobs IS 'Tracks data import operations';
COMMENT ON COLUMN import_jobs.status IS 'pending, validating, processing, completed, failed, cancelled';
COMMENT ON COLUMN import_jobs.import_options IS 'error_handling: skip|stop|flag, create_missing_references, etc.';

-- ============================================================================
-- EXPORT JOBS
-- ============================================================================
CREATE TABLE IF NOT EXISTS export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Job configuration
  entity_type VARCHAR(50) NOT NULL,
  export_name VARCHAR(255),
  filters JSONB DEFAULT '{}',
  columns TEXT[] NOT NULL,
  format VARCHAR(20) NOT NULL DEFAULT 'csv',
  include_headers BOOLEAN DEFAULT TRUE,

  -- Scheduling
  is_scheduled BOOLEAN DEFAULT FALSE,
  schedule_cron VARCHAR(100),
  schedule_name VARCHAR(255),
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,

  -- Results
  file_path TEXT,
  file_size_bytes INTEGER,
  record_count INTEGER,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  error_message TEXT,

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Audit
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE export_jobs IS 'Tracks data export operations';
COMMENT ON COLUMN export_jobs.status IS 'pending, processing, completed, failed, cancelled';
COMMENT ON COLUMN export_jobs.format IS 'csv, excel, json';

-- ============================================================================
-- GDPR REQUESTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS gdpr_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Request identification
  request_number VARCHAR(50) NOT NULL,
  request_type VARCHAR(30) NOT NULL,

  -- Subject information
  subject_email VARCHAR(255) NOT NULL,
  subject_name VARCHAR(255),
  subject_phone VARCHAR(50),
  verification_method VARCHAR(50),
  verified_at TIMESTAMPTZ,

  -- Data discovery
  data_found JSONB DEFAULT '{}',
  tables_scanned TEXT[],
  total_records_found INTEGER DEFAULT 0,

  -- Processing
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  action_taken VARCHAR(50),
  export_file_path TEXT,
  anonymized_fields JSONB DEFAULT '[]',

  -- Notes and compliance
  notes TEXT,
  due_date DATE NOT NULL,
  compliance_notes TEXT,

  -- Audit
  processed_by UUID REFERENCES user_profiles(id),
  processed_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE gdpr_requests IS 'Tracks GDPR data subject requests (DSAR, erasure, etc.)';
COMMENT ON COLUMN gdpr_requests.request_type IS 'dsar, erasure, rectification, restriction, portability';
COMMENT ON COLUMN gdpr_requests.status IS 'pending, in_review, processing, completed, rejected';

-- ============================================================================
-- DUPLICATE RECORDS
-- ============================================================================
CREATE TABLE IF NOT EXISTS duplicate_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Entity information
  entity_type VARCHAR(50) NOT NULL,
  record_id_1 UUID NOT NULL,
  record_id_2 UUID NOT NULL,

  -- Match information
  confidence_score DECIMAL(5,4) NOT NULL,
  match_fields TEXT[] NOT NULL,
  match_details JSONB DEFAULT '{}',

  -- Resolution
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  merged_into_id UUID,
  dismissed_reason TEXT,

  -- Audit
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_duplicate_pair UNIQUE (org_id, entity_type, record_id_1, record_id_2),
  CONSTRAINT ordered_record_ids CHECK (record_id_1 < record_id_2)
);

COMMENT ON TABLE duplicate_records IS 'Tracks potential duplicate records for review and merge';
COMMENT ON COLUMN duplicate_records.status IS 'pending, merged, dismissed, auto_merged';

-- ============================================================================
-- DUPLICATE RULES
-- ============================================================================
CREATE TABLE IF NOT EXISTS duplicate_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Rule configuration
  entity_type VARCHAR(50) NOT NULL,
  rule_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,

  -- Match criteria
  match_fields TEXT[] NOT NULL,
  match_type VARCHAR(20) NOT NULL DEFAULT 'exact',
  fuzzy_threshold DECIMAL(3,2) DEFAULT 0.85,

  -- Auto-merge settings
  auto_merge_threshold DECIMAL(5,4),
  auto_merge_enabled BOOLEAN DEFAULT FALSE,

  -- Audit
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_rule_name UNIQUE (org_id, entity_type, rule_name)
);

COMMENT ON TABLE duplicate_rules IS 'Configurable rules for duplicate detection per entity type';
COMMENT ON COLUMN duplicate_rules.match_type IS 'exact, fuzzy, phonetic';

-- ============================================================================
-- DATA ARCHIVE RECORDS
-- ============================================================================
CREATE TABLE IF NOT EXISTS archived_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Original record info
  entity_type VARCHAR(50) NOT NULL,
  original_id UUID NOT NULL,
  original_data JSONB NOT NULL,

  -- Archive info
  archive_reason VARCHAR(100),
  archived_by UUID NOT NULL REFERENCES user_profiles(id),
  archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Restoration
  restored_at TIMESTAMPTZ,
  restored_by UUID REFERENCES user_profiles(id),

  -- Permanent deletion
  permanently_deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),

  -- Constraints
  CONSTRAINT unique_archived_record UNIQUE (org_id, entity_type, original_id)
);

COMMENT ON TABLE archived_records IS 'Stores archived/soft-deleted records with full data for restoration';

-- ============================================================================
-- RETENTION POLICIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Policy configuration
  entity_type VARCHAR(50) NOT NULL,
  policy_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,

  -- Retention rules
  retention_days INTEGER NOT NULL,
  archive_after_days INTEGER,
  delete_after_archive_days INTEGER,

  -- Conditions
  status_filter TEXT[],
  additional_conditions JSONB DEFAULT '{}',

  -- Audit
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_retention_policy UNIQUE (org_id, entity_type, policy_name)
);

COMMENT ON TABLE retention_policies IS 'Configurable data retention policies per entity type';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Import jobs indexes
CREATE INDEX IF NOT EXISTS idx_import_jobs_org ON import_jobs(org_id);
CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON import_jobs(status);
CREATE INDEX IF NOT EXISTS idx_import_jobs_created_by ON import_jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_import_jobs_created_at ON import_jobs(created_at DESC);

-- Export jobs indexes
CREATE INDEX IF NOT EXISTS idx_export_jobs_org ON export_jobs(org_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON export_jobs(status);
CREATE INDEX IF NOT EXISTS idx_export_jobs_scheduled ON export_jobs(is_scheduled) WHERE is_scheduled = TRUE;
CREATE INDEX IF NOT EXISTS idx_export_jobs_next_run ON export_jobs(next_run_at) WHERE is_scheduled = TRUE;
CREATE INDEX IF NOT EXISTS idx_export_jobs_created_at ON export_jobs(created_at DESC);

-- GDPR requests indexes
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_org ON gdpr_requests(org_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_status ON gdpr_requests(status);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_type ON gdpr_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_email ON gdpr_requests(subject_email);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_due_date ON gdpr_requests(due_date);

-- Duplicate records indexes
CREATE INDEX IF NOT EXISTS idx_duplicate_records_org ON duplicate_records(org_id);
CREATE INDEX IF NOT EXISTS idx_duplicate_records_entity ON duplicate_records(entity_type);
CREATE INDEX IF NOT EXISTS idx_duplicate_records_status ON duplicate_records(status);
CREATE INDEX IF NOT EXISTS idx_duplicate_records_confidence ON duplicate_records(confidence_score DESC);

-- Archived records indexes
CREATE INDEX IF NOT EXISTS idx_archived_records_org ON archived_records(org_id);
CREATE INDEX IF NOT EXISTS idx_archived_records_entity ON archived_records(entity_type, original_id);
CREATE INDEX IF NOT EXISTS idx_archived_records_archived_at ON archived_records(archived_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at triggers
CREATE TRIGGER import_jobs_updated_at
  BEFORE UPDATE ON import_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER export_jobs_updated_at
  BEFORE UPDATE ON export_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER gdpr_requests_updated_at
  BEFORE UPDATE ON gdpr_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER duplicate_records_updated_at
  BEFORE UPDATE ON duplicate_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER duplicate_rules_updated_at
  BEFORE UPDATE ON duplicate_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER retention_policies_updated_at
  BEFORE UPDATE ON retention_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_policies ENABLE ROW LEVEL SECURITY;

-- Import jobs RLS
CREATE POLICY "import_jobs_org_isolation" ON import_jobs
  FOR ALL USING (org_id = auth_user_org_id());

-- Export jobs RLS
CREATE POLICY "export_jobs_org_isolation" ON export_jobs
  FOR ALL USING (org_id = auth_user_org_id());

-- GDPR requests RLS (admin only)
CREATE POLICY "gdpr_requests_admin_only" ON gdpr_requests
  FOR ALL USING (org_id = auth_user_org_id() AND user_has_permission('admin.gdpr.manage'));

-- Duplicate records RLS
CREATE POLICY "duplicate_records_org_isolation" ON duplicate_records
  FOR ALL USING (org_id = auth_user_org_id());

-- Duplicate rules RLS (admin only)
CREATE POLICY "duplicate_rules_admin_only" ON duplicate_rules
  FOR ALL USING (org_id = auth_user_org_id() AND user_has_permission('admin.data.manage'));

-- Archived records RLS (admin only)
CREATE POLICY "archived_records_admin_only" ON archived_records
  FOR ALL USING (org_id = auth_user_org_id() AND user_has_permission('admin.data.manage'));

-- Retention policies RLS (admin only)
CREATE POLICY "retention_policies_admin_only" ON retention_policies
  FOR ALL USING (org_id = auth_user_org_id() AND user_has_permission('admin.data.manage'));

-- ============================================================================
-- SEED DEFAULT DUPLICATE RULES
-- ============================================================================

-- Note: These will be inserted via application seed, not migration
-- Example rules for reference:
--
-- Candidates: email exact match (high confidence)
-- Candidates: first_name + last_name + phone (medium confidence)
-- Accounts: name exact match
-- Contacts: email exact match
-- Leads: email exact match

-- ============================================================================
-- END MIGRATION
-- ============================================================================
```

### Success Criteria

#### Automated Verification:
- [ ] Migration applies cleanly: `pnpm db:migrate`
- [ ] No errors in migration status: `pnpm db:status`
- [ ] Tables exist: Query `information_schema.tables`
- [ ] Indexes created: Query `pg_indexes`
- [ ] RLS enabled: Query `pg_tables` for `rowsecurity`

#### Manual Verification:
- [ ] Tables visible in Supabase Dashboard
- [ ] RLS policies function correctly (test with different roles)

---

## Phase 2: Dependencies & Infrastructure

### Overview
Install required npm packages and set up Supabase Edge Functions infrastructure.

### Changes Required

#### 1. Install NPM Dependencies

**Command**:
```bash
pnpm add papaparse xlsx
pnpm add -D @types/papaparse
```

#### 2. Create Storage Bucket
**File**: `supabase/migrations/20251208000001_data_management_storage.sql` (NEW)

```sql
-- Create storage buckets for data management
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('imports', 'imports', false, 52428800, ARRAY['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/json']),
  ('exports', 'exports', false, 104857600, ARRAY['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/json']),
  ('gdpr-exports', 'gdpr-exports', false, 104857600, ARRAY['application/json', 'application/zip'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for imports bucket
CREATE POLICY "imports_org_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'imports' AND
    (storage.foldername(name))[1] = auth_user_org_id()::text
  );

CREATE POLICY "imports_org_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'imports' AND
    (storage.foldername(name))[1] = auth_user_org_id()::text
  );

-- Storage policies for exports bucket
CREATE POLICY "exports_org_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'exports' AND
    (storage.foldername(name))[1] = auth_user_org_id()::text
  );

-- Storage policies for gdpr-exports bucket (admin only)
CREATE POLICY "gdpr_exports_admin_only" ON storage.objects
  FOR ALL USING (
    bucket_id = 'gdpr-exports' AND
    (storage.foldername(name))[1] = auth_user_org_id()::text AND
    user_has_permission('admin.gdpr.manage')
  );
```

#### 3. Create Edge Function Directory Structure

**Files to create**:
```
supabase/functions/
├── process-import/
│   └── index.ts
├── process-export/
│   └── index.ts
├── process-gdpr-request/
│   └── index.ts
├── detect-duplicates/
│   └── index.ts
└── _shared/
    ├── cors.ts
    ├── supabase.ts
    └── parsers/
        ├── csv.ts
        ├── excel.ts
        └── json.ts
```

#### 4. Shared Edge Function Utilities

**File**: `supabase/functions/_shared/supabase.ts` (NEW)
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const createServiceClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
```

**File**: `supabase/functions/_shared/cors.ts` (NEW)
```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

### Success Criteria

#### Automated Verification:
- [ ] Dependencies installed: `pnpm list papaparse xlsx`
- [ ] TypeScript compiles: `pnpm build`
- [ ] Storage bucket migration applies: `pnpm db:migrate`

#### Manual Verification:
- [ ] Storage buckets visible in Supabase Dashboard
- [ ] Edge Functions directory structure created

---

## Phase 3: Entity Configuration & Parsers

### Overview
Create centralized entity configuration for import/export and file parsing utilities.

### Changes Required

#### 1. Entity Configuration
**File**: `src/lib/data-management/entities.ts` (NEW)

```typescript
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
    ],
    uniqueConstraints: [],
    foreignKeys: [],
  },

  // Add more entities as needed: submissions, interviews, placements, employees, pods, etc.
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
```

#### 2. File Parsers
**File**: `src/lib/data-management/parsers/index.ts` (NEW)

```typescript
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export interface ParsedData {
  headers: string[]
  rows: Record<string, unknown>[]
  totalRows: number
  errors: ParseError[]
}

export interface ParseError {
  row?: number
  message: string
  code: string
}

export const parseCSV = async (file: File | string): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    const config: Papa.ParseConfig = {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        resolve({
          headers: results.meta.fields || [],
          rows: results.data as Record<string, unknown>[],
          totalRows: results.data.length,
          errors: results.errors.map(e => ({
            row: e.row,
            message: e.message,
            code: e.code,
          })),
        })
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`))
      },
    }

    if (typeof file === 'string') {
      Papa.parse(file, config)
    } else {
      Papa.parse(file, config)
    }
  })
}

export const parseExcel = async (file: File | ArrayBuffer): Promise<ParsedData> => {
  const buffer = file instanceof File ? await file.arrayBuffer() : file
  const workbook = XLSX.read(buffer, { type: 'array' })

  // Use first sheet
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  // Convert to JSON with headers
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
    raw: false,
  })

  // Get headers from first row
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1')
  const headers: string[] = []
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cell = sheet[XLSX.utils.encode_cell({ r: 0, c: col })]
    const header = cell?.v?.toString().trim().toLowerCase().replace(/\s+/g, '_') || `column_${col}`
    headers.push(header)
  }

  return {
    headers,
    rows: jsonData,
    totalRows: jsonData.length,
    errors: [],
  }
}

export const parseJSON = async (file: File | string): Promise<ParsedData> => {
  const content = typeof file === 'string' ? file : await file.text()
  const data = JSON.parse(content)

  if (!Array.isArray(data)) {
    throw new Error('JSON file must contain an array of objects')
  }

  if (data.length === 0) {
    return { headers: [], rows: [], totalRows: 0, errors: [] }
  }

  const headers = Object.keys(data[0])

  return {
    headers,
    rows: data,
    totalRows: data.length,
    errors: [],
  }
}

export const detectFileType = (fileName: string): 'csv' | 'excel' | 'json' => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'csv':
      return 'csv'
    case 'xls':
    case 'xlsx':
      return 'excel'
    case 'json':
      return 'json'
    default:
      throw new Error(`Unsupported file type: ${extension}`)
  }
}

export const parseFile = async (file: File): Promise<ParsedData> => {
  const fileType = detectFileType(file.name)

  switch (fileType) {
    case 'csv':
      return parseCSV(file)
    case 'excel':
      return parseExcel(file)
    case 'json':
      return parseJSON(file)
  }
}
```

#### 3. Data Validators
**File**: `src/lib/data-management/validators.ts` (NEW)

```typescript
import { z } from 'zod'
import type { EntityConfig, FieldConfig } from './entities'

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  row: number
  field: string
  value: unknown
  message: string
  code: string
}

export interface ValidationWarning {
  row: number
  field: string
  value: unknown
  message: string
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^[\d\s\-\+\(\)\.]+$/

export const validateField = (
  value: unknown,
  field: FieldConfig,
  rowIndex: number
): { errors: ValidationError[]; warnings: ValidationWarning[] } => {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Check required
  if (field.required && (value === null || value === undefined || value === '')) {
    errors.push({
      row: rowIndex,
      field: field.name,
      value,
      message: `${field.displayName} is required`,
      code: 'REQUIRED',
    })
    return { errors, warnings }
  }

  // Skip further validation if empty and not required
  if (value === null || value === undefined || value === '') {
    return { errors, warnings }
  }

  const strValue = String(value).trim()

  // Type validation
  switch (field.type) {
    case 'email':
      if (!emailRegex.test(strValue)) {
        errors.push({
          row: rowIndex,
          field: field.name,
          value,
          message: `Invalid email format`,
          code: 'INVALID_EMAIL',
        })
      }
      break

    case 'phone':
      if (!phoneRegex.test(strValue)) {
        warnings.push({
          row: rowIndex,
          field: field.name,
          value,
          message: `Phone number may have invalid characters`,
        })
      }
      break

    case 'number':
      if (isNaN(Number(value))) {
        errors.push({
          row: rowIndex,
          field: field.name,
          value,
          message: `Must be a number`,
          code: 'INVALID_NUMBER',
        })
      }
      break

    case 'boolean':
      const boolValues = ['true', 'false', '1', '0', 'yes', 'no']
      if (!boolValues.includes(strValue.toLowerCase())) {
        errors.push({
          row: rowIndex,
          field: field.name,
          value,
          message: `Must be true/false, yes/no, or 1/0`,
          code: 'INVALID_BOOLEAN',
        })
      }
      break

    case 'date':
    case 'datetime':
      const date = new Date(strValue)
      if (isNaN(date.getTime())) {
        errors.push({
          row: rowIndex,
          field: field.name,
          value,
          message: `Invalid date format`,
          code: 'INVALID_DATE',
        })
      }
      break
  }

  // Enum validation
  if (field.enumValues && field.enumValues.length > 0) {
    if (!field.enumValues.includes(strValue)) {
      errors.push({
        row: rowIndex,
        field: field.name,
        value,
        message: `Must be one of: ${field.enumValues.join(', ')}`,
        code: 'INVALID_ENUM',
      })
    }
  }

  // Max length validation
  if (field.maxLength && strValue.length > field.maxLength) {
    errors.push({
      row: rowIndex,
      field: field.name,
      value,
      message: `Exceeds maximum length of ${field.maxLength}`,
      code: 'MAX_LENGTH',
    })
  }

  return { errors, warnings }
}

export const validateRows = (
  rows: Record<string, unknown>[],
  entityConfig: EntityConfig,
  fieldMapping: Record<string, string>
): ValidationResult => {
  const allErrors: ValidationError[] = []
  const allWarnings: ValidationWarning[] = []

  rows.forEach((row, index) => {
    entityConfig.fields.forEach(field => {
      if (!field.importable) return

      const sourceColumn = Object.entries(fieldMapping).find(
        ([, destField]) => destField === field.name
      )?.[0]

      if (!sourceColumn) return

      const value = row[sourceColumn]
      const { errors, warnings } = validateField(value, field, index + 1)

      allErrors.push(...errors)
      allWarnings.push(...warnings)
    })
  })

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  }
}
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm build`
- [ ] Parser tests pass (create unit tests)
- [ ] Entity configs export correctly

#### Manual Verification:
- [ ] CSV parsing works with sample file
- [ ] Excel parsing works with sample file
- [ ] Validation catches expected errors

---

## Phase 4: tRPC Data Router

### Overview
Create the tRPC router for all data management operations.

### Changes Required

#### 1. Data Router
**File**: `src/server/routers/data.ts` (NEW)

```typescript
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getEntityConfig, getImportableEntities, getExportableEntities } from '@/lib/data-management/entities'
import { parseFile, detectFileType } from '@/lib/data-management/parsers'
import { validateRows } from '@/lib/data-management/validators'

export const dataRouter = router({
  // ============================================================================
  // ENTITY METADATA
  // ============================================================================

  getImportableEntities: orgProtectedProcedure
    .query(() => {
      return getImportableEntities().map(e => ({
        name: e.name,
        displayName: e.displayName,
        fields: e.fields.filter(f => f.importable).map(f => ({
          name: f.name,
          displayName: f.displayName,
          type: f.type,
          required: f.required,
        })),
      }))
    }),

  getExportableEntities: orgProtectedProcedure
    .query(() => {
      return getExportableEntities().map(e => ({
        name: e.name,
        displayName: e.displayName,
        fields: e.fields.filter(f => f.exportable).map(f => ({
          name: f.name,
          displayName: f.displayName,
          type: f.type,
        })),
      }))
    }),

  // ============================================================================
  // IMPORT OPERATIONS
  // ============================================================================

  parseImportFile: orgProtectedProcedure
    .input(z.object({
      fileData: z.string(), // base64
      fileName: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Decode base64
      const buffer = Buffer.from(input.fileData.split(',')[1] || input.fileData, 'base64')
      const blob = new Blob([buffer])
      const file = new File([blob], input.fileName)

      const parsed = await parseFile(file)

      return {
        headers: parsed.headers,
        sampleRows: parsed.rows.slice(0, 5),
        totalRows: parsed.totalRows,
        parseErrors: parsed.errors,
      }
    }),

  validateImportData: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      fileData: z.string(),
      fileName: z.string(),
      fieldMapping: z.record(z.string()),
    }))
    .mutation(async ({ input }) => {
      const entityConfig = getEntityConfig(input.entityType)
      if (!entityConfig) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid entity type' })
      }

      // Parse file
      const buffer = Buffer.from(input.fileData.split(',')[1] || input.fileData, 'base64')
      const blob = new Blob([buffer])
      const file = new File([blob], input.fileName)
      const parsed = await parseFile(file)

      // Validate
      const validation = validateRows(parsed.rows, entityConfig, input.fieldMapping)

      return {
        totalRows: parsed.totalRows,
        validRows: parsed.totalRows - validation.errors.filter((e, i, arr) =>
          arr.findIndex(x => x.row === e.row) === i
        ).length,
        errors: validation.errors.slice(0, 100), // Limit to first 100
        warnings: validation.warnings.slice(0, 100),
      }
    }),

  createImportJob: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      fileName: z.string(),
      fileData: z.string(), // base64
      fieldMapping: z.record(z.string()),
      importOptions: z.object({
        errorHandling: z.enum(['skip', 'stop', 'flag']).default('skip'),
        createMissingReferences: z.boolean().default(false),
        updateExisting: z.boolean().default(false),
      }).default({}),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const entityConfig = getEntityConfig(input.entityType)
      if (!entityConfig) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid entity type' })
      }

      // Upload file to storage
      const buffer = Buffer.from(input.fileData.split(',')[1] || input.fileData, 'base64')
      const filePath = `${orgId}/${Date.now()}-${input.fileName}`

      const { error: uploadError } = await supabase.storage
        .from('imports')
        .upload(filePath, buffer, {
          contentType: detectFileType(input.fileName) === 'csv' ? 'text/csv' : 'application/octet-stream',
        })

      if (uploadError) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to upload file' })
      }

      // Parse to get row count
      const blob = new Blob([buffer])
      const file = new File([blob], input.fileName)
      const parsed = await parseFile(file)

      // Create import job record
      const { data: job, error: jobError } = await supabase
        .from('import_jobs')
        .insert({
          org_id: orgId,
          entity_type: input.entityType,
          file_name: input.fileName,
          file_path: filePath,
          file_size_bytes: buffer.length,
          field_mapping: input.fieldMapping,
          import_options: input.importOptions,
          total_rows: parsed.totalRows,
          status: 'pending',
          created_by: user?.id,
        })
        .select()
        .single()

      if (jobError) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create import job' })
      }

      // Trigger Edge Function to process
      const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-import`
      fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ jobId: job.id }),
      }).catch(console.error) // Fire and forget

      // Log audit
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'create',
        table_name: 'import_jobs',
        record_id: job.id,
        new_values: { entity_type: input.entityType, file_name: input.fileName },
      })

      return job
    }),

  getImportJob: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data, error } = await supabase
        .from('import_jobs')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Import job not found' })
      }

      return data
    }),

  listImportJobs: orgProtectedProcedure
    .input(z.object({
      status: z.string().optional(),
      entityType: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      let query = supabase
        .from('import_jobs')
        .select('*, created_by_user:user_profiles!import_jobs_created_by_fkey(email, full_name)', { count: 'exact' })
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (input.status) {
        query = query.eq('status', input.status)
      }
      if (input.entityType) {
        query = query.eq('entity_type', input.entityType)
      }

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { jobs: data, total: count || 0 }
    }),

  // ============================================================================
  // EXPORT OPERATIONS
  // ============================================================================

  createExportJob: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      exportName: z.string().optional(),
      filters: z.record(z.unknown()).default({}),
      columns: z.array(z.string()),
      format: z.enum(['csv', 'excel', 'json']).default('csv'),
      includeHeaders: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const entityConfig = getEntityConfig(input.entityType)
      if (!entityConfig) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid entity type' })
      }

      // Create export job record
      const { data: job, error: jobError } = await supabase
        .from('export_jobs')
        .insert({
          org_id: orgId,
          entity_type: input.entityType,
          export_name: input.exportName || `${input.entityType}-export`,
          filters: input.filters,
          columns: input.columns,
          format: input.format,
          include_headers: input.includeHeaders,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          created_by: user?.id,
        })
        .select()
        .single()

      if (jobError) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create export job' })
      }

      // Trigger Edge Function
      const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-export`
      fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ jobId: job.id }),
      }).catch(console.error)

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'create',
        table_name: 'export_jobs',
        record_id: job.id,
        new_values: { entity_type: input.entityType, format: input.format },
      })

      return job
    }),

  getExportJob: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data, error } = await supabase
        .from('export_jobs')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Export job not found' })
      }

      return data
    }),

  getExportDownloadUrl: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data: job } = await supabase
        .from('export_jobs')
        .select('file_path, status')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (!job || job.status !== 'completed' || !job.file_path) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Export not ready' })
      }

      const { data: signedUrl } = await supabase.storage
        .from('exports')
        .createSignedUrl(job.file_path, 3600) // 1 hour

      return { url: signedUrl?.signedUrl }
    }),

  listExportJobs: orgProtectedProcedure
    .input(z.object({
      status: z.string().optional(),
      entityType: z.string().optional(),
      scheduled: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      let query = supabase
        .from('export_jobs')
        .select('*, created_by_user:user_profiles!export_jobs_created_by_fkey(email, full_name)', { count: 'exact' })
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (input.status) query = query.eq('status', input.status)
      if (input.entityType) query = query.eq('entity_type', input.entityType)
      if (input.scheduled !== undefined) query = query.eq('is_scheduled', input.scheduled)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { jobs: data, total: count || 0 }
    }),

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  bulkUpdate: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      ids: z.array(z.string().uuid()).min(1).max(1000),
      updates: z.record(z.unknown()),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const entityConfig = getEntityConfig(input.entityType)
      if (!entityConfig) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid entity type' })
      }

      // Validate updates against schema
      const validFields = entityConfig.fields
        .filter(f => f.importable)
        .map(f => f.dbColumn)

      const updateData: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(input.updates)) {
        const field = entityConfig.fields.find(f => f.name === key || f.dbColumn === key)
        if (field && validFields.includes(field.dbColumn)) {
          updateData[field.dbColumn] = value
        }
      }

      if (Object.keys(updateData).length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No valid fields to update' })
      }

      // Perform bulk update
      const { data, error } = await supabase
        .from(entityConfig.table)
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('org_id', orgId)
        .in('id', input.ids)
        .select('id')

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'bulk_update',
        table_name: entityConfig.table,
        new_values: { ids: input.ids, updates: updateData, count: data?.length },
      })

      return { updatedCount: data?.length || 0 }
    }),

  bulkDelete: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      ids: z.array(z.string().uuid()).min(1).max(1000),
      permanent: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const entityConfig = getEntityConfig(input.entityType)
      if (!entityConfig) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid entity type' })
      }

      if (input.permanent) {
        // Archive records first
        const { data: records } = await supabase
          .from(entityConfig.table)
          .select('*')
          .eq('org_id', orgId)
          .in('id', input.ids)

        if (records) {
          await supabase.from('archived_records').insert(
            records.map(r => ({
              org_id: orgId,
              entity_type: input.entityType,
              original_id: r.id,
              original_data: r,
              archive_reason: 'bulk_delete',
              archived_by: user?.id,
            }))
          )
        }

        // Hard delete
        const { error } = await supabase
          .from(entityConfig.table)
          .delete()
          .eq('org_id', orgId)
          .in('id', input.ids)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }
      } else {
        // Soft delete
        const { error } = await supabase
          .from(entityConfig.table)
          .update({ deleted_at: new Date().toISOString() })
          .eq('org_id', orgId)
          .in('id', input.ids)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: input.permanent ? 'bulk_delete_permanent' : 'bulk_delete',
        table_name: entityConfig.table,
        new_values: { ids: input.ids, count: input.ids.length },
      })

      return { deletedCount: input.ids.length }
    }),

  // ============================================================================
  // DUPLICATE MANAGEMENT
  // ============================================================================

  detectDuplicates: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      ruleId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Trigger Edge Function
      const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/detect-duplicates`
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          orgId,
          entityType: input.entityType,
          ruleId: input.ruleId,
          userId: user?.id,
        }),
      })

      const result = await response.json()
      return { duplicatesFound: result.duplicatesFound || 0 }
    }),

  listDuplicates: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      status: z.enum(['pending', 'merged', 'dismissed']).default('pending'),
      minConfidence: z.number().min(0).max(1).default(0.5),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data, error, count } = await supabase
        .from('duplicate_records')
        .select('*', { count: 'exact' })
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('status', input.status)
        .gte('confidence_score', input.minConfidence)
        .order('confidence_score', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { duplicates: data, total: count || 0 }
    }),

  mergeDuplicates: orgProtectedProcedure
    .input(z.object({
      duplicateId: z.string().uuid(),
      keepRecordId: z.string().uuid(),
      mergeRecordId: z.string().uuid(),
      fieldOverrides: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Get duplicate record
      const { data: duplicate } = await supabase
        .from('duplicate_records')
        .select('*')
        .eq('id', input.duplicateId)
        .eq('org_id', orgId)
        .single()

      if (!duplicate) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Duplicate record not found' })
      }

      const entityConfig = getEntityConfig(duplicate.entity_type)
      if (!entityConfig) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid entity type' })
      }

      // Get both records
      const { data: keepRecord } = await supabase
        .from(entityConfig.table)
        .select('*')
        .eq('id', input.keepRecordId)
        .eq('org_id', orgId)
        .single()

      const { data: mergeRecord } = await supabase
        .from(entityConfig.table)
        .select('*')
        .eq('id', input.mergeRecordId)
        .eq('org_id', orgId)
        .single()

      if (!keepRecord || !mergeRecord) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'One or both records not found' })
      }

      // Merge records - fill in missing fields from merge record
      const mergedData: Record<string, unknown> = { ...keepRecord }
      for (const field of entityConfig.fields) {
        if (field.importable && !mergedData[field.dbColumn] && mergeRecord[field.dbColumn]) {
          mergedData[field.dbColumn] = mergeRecord[field.dbColumn]
        }
      }

      // Apply overrides
      if (input.fieldOverrides) {
        for (const [key, value] of Object.entries(input.fieldOverrides)) {
          const field = entityConfig.fields.find(f => f.name === key || f.dbColumn === key)
          if (field) {
            mergedData[field.dbColumn] = value
          }
        }
      }

      // Update keep record
      await supabase
        .from(entityConfig.table)
        .update(mergedData)
        .eq('id', input.keepRecordId)

      // Archive and delete merge record
      await supabase.from('archived_records').insert({
        org_id: orgId,
        entity_type: duplicate.entity_type,
        original_id: input.mergeRecordId,
        original_data: mergeRecord,
        archive_reason: 'merged_duplicate',
        archived_by: user?.id,
      })

      await supabase
        .from(entityConfig.table)
        .delete()
        .eq('id', input.mergeRecordId)

      // Update duplicate record
      await supabase
        .from('duplicate_records')
        .update({
          status: 'merged',
          merged_into_id: input.keepRecordId,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', input.duplicateId)

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'merge_duplicate',
        table_name: entityConfig.table,
        record_id: input.keepRecordId,
        old_values: { merged_record: mergeRecord },
        new_values: { merged_into: input.keepRecordId },
      })

      return { mergedIntoId: input.keepRecordId }
    }),

  dismissDuplicate: orgProtectedProcedure
    .input(z.object({
      duplicateId: z.string().uuid(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      await supabase
        .from('duplicate_records')
        .update({
          status: 'dismissed',
          dismissed_reason: input.reason,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', input.duplicateId)
        .eq('org_id', orgId)

      return { success: true }
    }),

  // ============================================================================
  // GDPR OPERATIONS
  // ============================================================================

  createGdprRequest: orgProtectedProcedure
    .input(z.object({
      requestType: z.enum(['dsar', 'erasure', 'rectification', 'restriction', 'portability']),
      subjectEmail: z.string().email(),
      subjectName: z.string().optional(),
      subjectPhone: z.string().optional(),
      notes: z.string().optional(),
      dueDate: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Generate request number
      const year = new Date().getFullYear()
      const { count } = await supabase
        .from('gdpr_requests')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .gte('created_at', `${year}-01-01`)

      const requestNumber = `GDPR-${year}-${String((count || 0) + 1).padStart(4, '0')}`

      const { data, error } = await supabase
        .from('gdpr_requests')
        .insert({
          org_id: orgId,
          request_number: requestNumber,
          request_type: input.requestType,
          subject_email: input.subjectEmail,
          subject_name: input.subjectName,
          subject_phone: input.subjectPhone,
          notes: input.notes,
          due_date: input.dueDate,
          status: 'pending',
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'create',
        table_name: 'gdpr_requests',
        record_id: data.id,
        new_values: { request_type: input.requestType, subject_email: input.subjectEmail },
      })

      return data
    }),

  listGdprRequests: orgProtectedProcedure
    .input(z.object({
      status: z.string().optional(),
      requestType: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      let query = supabase
        .from('gdpr_requests')
        .select('*', { count: 'exact' })
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (input.status) query = query.eq('status', input.status)
      if (input.requestType) query = query.eq('request_type', input.requestType)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { requests: data, total: count || 0 }
    }),

  processGdprRequest: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      action: z.enum(['discover', 'export', 'anonymize', 'complete', 'reject']),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const { data: request } = await supabase
        .from('gdpr_requests')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (!request) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Request not found' })
      }

      if (input.action === 'discover') {
        // Trigger data discovery Edge Function
        const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-gdpr-request`
        await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            requestId: input.id,
            action: 'discover',
            orgId,
          }),
        })

        await supabase
          .from('gdpr_requests')
          .update({ status: 'in_review' })
          .eq('id', input.id)
      } else if (input.action === 'export' || input.action === 'anonymize') {
        // Trigger processing Edge Function
        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-gdpr-request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            requestId: input.id,
            action: input.action,
            orgId,
          }),
        })

        await supabase
          .from('gdpr_requests')
          .update({ status: 'processing' })
          .eq('id', input.id)
      } else if (input.action === 'complete') {
        await supabase
          .from('gdpr_requests')
          .update({
            status: 'completed',
            processed_by: user?.id,
            processed_at: new Date().toISOString(),
            compliance_notes: input.notes,
          })
          .eq('id', input.id)
      } else if (input.action === 'reject') {
        await supabase
          .from('gdpr_requests')
          .update({
            status: 'rejected',
            processed_by: user?.id,
            processed_at: new Date().toISOString(),
            compliance_notes: input.notes,
          })
          .eq('id', input.id)
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: `gdpr_${input.action}`,
        table_name: 'gdpr_requests',
        record_id: input.id,
        new_values: { action: input.action, notes: input.notes },
      })

      return { success: true }
    }),

  // ============================================================================
  // ARCHIVE OPERATIONS
  // ============================================================================

  listArchivedRecords: orgProtectedProcedure
    .input(z.object({
      entityType: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      let query = supabase
        .from('archived_records')
        .select('*, archived_by_user:user_profiles!archived_records_archived_by_fkey(email, full_name)', { count: 'exact' })
        .eq('org_id', orgId)
        .is('restored_at', null)
        .is('permanently_deleted_at', null)
        .order('archived_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (input.entityType) query = query.eq('entity_type', input.entityType)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { records: data, total: count || 0 }
    }),

  restoreArchivedRecord: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const { data: archived } = await supabase
        .from('archived_records')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('restored_at', null)
        .single()

      if (!archived) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Archived record not found' })
      }

      const entityConfig = getEntityConfig(archived.entity_type)
      if (!entityConfig) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid entity type' })
      }

      // Restore to original table
      const { deleted_at, ...restoreData } = archived.original_data
      await supabase
        .from(entityConfig.table)
        .upsert({
          ...restoreData,
          deleted_at: null,
          updated_at: new Date().toISOString(),
        })

      // Mark as restored
      await supabase
        .from('archived_records')
        .update({
          restored_at: new Date().toISOString(),
          restored_by: user?.id,
        })
        .eq('id', input.id)

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'restore',
        table_name: entityConfig.table,
        record_id: archived.original_id,
      })

      return { restoredId: archived.original_id }
    }),

  permanentlyDelete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const { data: archived } = await supabase
        .from('archived_records')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('permanently_deleted_at', null)
        .single()

      if (!archived) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Archived record not found' })
      }

      // Mark as permanently deleted (keep for audit trail)
      await supabase
        .from('archived_records')
        .update({
          permanently_deleted_at: new Date().toISOString(),
          deleted_by: user?.id,
          original_data: { _redacted: true, _deleted_at: new Date().toISOString() }, // Redact data
        })
        .eq('id', input.id)

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'permanent_delete',
        table_name: 'archived_records',
        record_id: input.id,
        old_values: { entity_type: archived.entity_type, original_id: archived.original_id },
      })

      return { success: true }
    }),

  // ============================================================================
  // DASHBOARD STATS
  // ============================================================================

  getDashboardStats: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      // Get counts in parallel
      const [
        importJobsResult,
        exportJobsResult,
        duplicatesResult,
        gdprResult,
        archivedResult,
      ] = await Promise.all([
        supabase
          .from('import_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId),
        supabase
          .from('export_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId),
        supabase
          .from('duplicate_records')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('status', 'pending'),
        supabase
          .from('gdpr_requests')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('status', 'pending'),
        supabase
          .from('archived_records')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .is('restored_at', null)
          .is('permanently_deleted_at', null),
      ])

      // Get recent operations
      const { data: recentOps } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('org_id', orgId)
        .in('action', ['create', 'bulk_update', 'bulk_delete', 'merge_duplicate', 'gdpr_export', 'restore'])
        .in('table_name', ['import_jobs', 'export_jobs', 'gdpr_requests', 'duplicate_records', 'archived_records'])
        .order('created_at', { ascending: false })
        .limit(10)

      return {
        totalImports: importJobsResult.count || 0,
        totalExports: exportJobsResult.count || 0,
        pendingDuplicates: duplicatesResult.count || 0,
        pendingGdpr: gdprResult.count || 0,
        archivedRecords: archivedResult.count || 0,
        recentOperations: recentOps || [],
      }
    }),
})
```

#### 2. Register Router
**File**: `src/server/trpc/root.ts`
**Changes**: Add data router import and registration

```typescript
// Add import
import { dataRouter } from '../routers/data'

// Add to appRouter
export const appRouter = router({
  // ... existing routers
  data: dataRouter,
})
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm build`
- [ ] tRPC types generate correctly
- [ ] No import errors

#### Manual Verification:
- [ ] API endpoints accessible via tRPC client
- [ ] Audit logs created for operations

---

## Phase 5: Edge Functions for Async Processing

### Overview
Create Supabase Edge Functions for processing imports, exports, and GDPR requests asynchronously.

### Changes Required

#### 1. Import Processing Edge Function
**File**: `supabase/functions/process-import/index.ts` (NEW)

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Papa from 'https://esm.sh/papaparse@5.4.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { jobId } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('import_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      throw new Error('Job not found')
    }

    // Update status to processing
    await supabase
      .from('import_jobs')
      .update({ status: 'processing', started_at: new Date().toISOString() })
      .eq('id', jobId)

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('imports')
      .download(job.file_path)

    if (downloadError || !fileData) {
      throw new Error('Failed to download file')
    }

    // Parse file
    const text = await fileData.text()
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })

    const rows = parsed.data as Record<string, unknown>[]
    const fieldMapping = job.field_mapping as Record<string, string>
    const importOptions = job.import_options as { errorHandling: string; createMissingReferences: boolean; updateExisting: boolean }

    let successCount = 0
    let errorCount = 0
    const errorLog: Array<{ row: number; error: string }> = []

    // Get entity table
    const entityTables: Record<string, string> = {
      candidates: 'user_profiles',
      jobs: 'jobs',
      accounts: 'accounts',
      contacts: 'point_of_contacts',
      leads: 'leads',
    }
    const tableName = entityTables[job.entity_type] || job.entity_type

    // Process in chunks of 100
    const chunkSize = 100
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize)

      for (let j = 0; j < chunk.length; j++) {
        const row = chunk[j]
        const rowIndex = i + j + 1

        try {
          // Map fields
          const insertData: Record<string, unknown> = {
            org_id: job.org_id,
          }

          for (const [sourceCol, destField] of Object.entries(fieldMapping)) {
            if (row[sourceCol] !== undefined && row[sourceCol] !== '') {
              insertData[destField] = row[sourceCol]
            }
          }

          // Insert or update
          if (importOptions.updateExisting) {
            // Try upsert if we have unique key (email for candidates)
            if (insertData.email) {
              const { error } = await supabase
                .from(tableName)
                .upsert(insertData, { onConflict: 'org_id,email' })

              if (error) throw error
            } else {
              const { error } = await supabase
                .from(tableName)
                .insert(insertData)

              if (error) throw error
            }
          } else {
            const { error } = await supabase
              .from(tableName)
              .insert(insertData)

            if (error) throw error
          }

          successCount++
        } catch (err) {
          errorCount++
          errorLog.push({
            row: rowIndex,
            error: err instanceof Error ? err.message : 'Unknown error',
          })

          if (importOptions.errorHandling === 'stop') {
            throw new Error(`Import stopped at row ${rowIndex}: ${err}`)
          }
        }
      }

      // Update progress
      await supabase
        .from('import_jobs')
        .update({
          processed_rows: Math.min(i + chunkSize, rows.length),
          success_rows: successCount,
          error_rows: errorCount,
          error_log: errorLog.slice(-100), // Keep last 100 errors
        })
        .eq('id', jobId)
    }

    // Mark as completed
    await supabase
      .from('import_jobs')
      .update({
        status: errorCount > 0 && successCount === 0 ? 'failed' : 'completed',
        completed_at: new Date().toISOString(),
        processed_rows: rows.length,
        success_rows: successCount,
        error_rows: errorCount,
        error_log: errorLog,
      })
      .eq('id', jobId)

    return new Response(
      JSON.stringify({ success: true, processed: rows.length, successCount, errorCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Import processing error:', error)

    // Try to update job status to failed
    try {
      const { jobId } = await req.clone().json()
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      )

      await supabase
        .from('import_jobs')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId)
    } catch {}

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

#### 2. Export Processing Edge Function
**File**: `supabase/functions/process-export/index.ts` (NEW)

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Papa from 'https://esm.sh/papaparse@5.4.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { jobId } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('export_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      throw new Error('Job not found')
    }

    // Update status
    await supabase
      .from('export_jobs')
      .update({ status: 'processing', started_at: new Date().toISOString() })
      .eq('id', jobId)

    // Get entity table
    const entityTables: Record<string, string> = {
      candidates: 'user_profiles',
      jobs: 'jobs',
      accounts: 'accounts',
      contacts: 'point_of_contacts',
      leads: 'leads',
    }
    const tableName = entityTables[job.entity_type] || job.entity_type

    // Build query
    let query = supabase
      .from(tableName)
      .select(job.columns.join(','))
      .eq('org_id', job.org_id)
      .is('deleted_at', null)

    // Apply filters
    const filters = job.filters as Record<string, unknown>
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'date_from') {
            query = query.gte('created_at', value)
          } else if (key === 'date_to') {
            query = query.lte('created_at', value)
          } else if (key === 'status') {
            query = query.eq('status', value)
          } else {
            query = query.eq(key, value)
          }
        }
      }
    }

    const { data: records, error: queryError } = await query

    if (queryError) {
      throw new Error(`Query failed: ${queryError.message}`)
    }

    // Generate file content
    let fileContent: string
    let contentType: string
    let extension: string

    if (job.format === 'json') {
      fileContent = JSON.stringify(records, null, 2)
      contentType = 'application/json'
      extension = 'json'
    } else {
      // CSV (default)
      fileContent = Papa.unparse(records || [], {
        header: job.include_headers,
      })
      contentType = 'text/csv'
      extension = 'csv'
    }

    // Upload to storage
    const filePath = `${job.org_id}/${job.id}.${extension}`
    const { error: uploadError } = await supabase.storage
      .from('exports')
      .upload(filePath, fileContent, {
        contentType,
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Update job
    await supabase
      .from('export_jobs')
      .update({
        status: 'completed',
        file_path: filePath,
        file_size_bytes: new TextEncoder().encode(fileContent).length,
        record_count: records?.length || 0,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    return new Response(
      JSON.stringify({ success: true, recordCount: records?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Export processing error:', error)

    try {
      const { jobId } = await req.clone().json()
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      )

      await supabase
        .from('export_jobs')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId)
    } catch {}

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

#### 3. Duplicate Detection Edge Function
**File**: `supabase/functions/detect-duplicates/index.ts` (NEW)

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple string similarity (Dice coefficient)
function similarity(s1: string, s2: string): number {
  const lower1 = s1.toLowerCase().trim()
  const lower2 = s2.toLowerCase().trim()

  if (lower1 === lower2) return 1.0
  if (lower1.length < 2 || lower2.length < 2) return 0.0

  const bigrams1 = new Set<string>()
  for (let i = 0; i < lower1.length - 1; i++) {
    bigrams1.add(lower1.substring(i, i + 2))
  }

  let intersectionSize = 0
  for (let i = 0; i < lower2.length - 1; i++) {
    if (bigrams1.has(lower2.substring(i, i + 2))) {
      intersectionSize++
    }
  }

  return (2.0 * intersectionSize) / (lower1.length - 1 + lower2.length - 1)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orgId, entityType, ruleId, userId } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get duplicate rules
    let rules: Array<{ match_fields: string[]; match_type: string; fuzzy_threshold: number }>

    if (ruleId) {
      const { data } = await supabase
        .from('duplicate_rules')
        .select('match_fields, match_type, fuzzy_threshold')
        .eq('id', ruleId)
        .eq('org_id', orgId)
        .eq('is_active', true)
        .single()

      rules = data ? [data] : []
    } else {
      const { data } = await supabase
        .from('duplicate_rules')
        .select('match_fields, match_type, fuzzy_threshold')
        .eq('org_id', orgId)
        .eq('entity_type', entityType)
        .eq('is_active', true)

      rules = data || []
    }

    // Default rules if none configured
    if (rules.length === 0) {
      rules = [
        { match_fields: ['email'], match_type: 'exact', fuzzy_threshold: 0.85 },
      ]
    }

    // Get entity table
    const entityTables: Record<string, string> = {
      candidates: 'user_profiles',
      contacts: 'point_of_contacts',
      leads: 'leads',
      accounts: 'accounts',
    }
    const tableName = entityTables[entityType] || entityType

    // Get all records
    const { data: records, error } = await supabase
      .from(tableName)
      .select('id, email, first_name, last_name, phone, name')
      .eq('org_id', orgId)
      .is('deleted_at', null)

    if (error || !records) {
      throw new Error('Failed to fetch records')
    }

    // Find duplicates
    const duplicates: Array<{
      record_id_1: string
      record_id_2: string
      confidence_score: number
      match_fields: string[]
    }> = []

    const seen = new Set<string>()

    for (let i = 0; i < records.length; i++) {
      for (let j = i + 1; j < records.length; j++) {
        const record1 = records[i]
        const record2 = records[j]

        // Skip if already found
        const pairKey = [record1.id, record2.id].sort().join('-')
        if (seen.has(pairKey)) continue

        for (const rule of rules) {
          const matchedFields: string[] = []
          let totalScore = 0
          let fieldCount = 0

          for (const field of rule.match_fields) {
            const val1 = record1[field as keyof typeof record1]
            const val2 = record2[field as keyof typeof record2]

            if (!val1 || !val2) continue

            fieldCount++

            if (rule.match_type === 'exact') {
              if (String(val1).toLowerCase() === String(val2).toLowerCase()) {
                matchedFields.push(field)
                totalScore += 1
              }
            } else if (rule.match_type === 'fuzzy') {
              const score = similarity(String(val1), String(val2))
              if (score >= rule.fuzzy_threshold) {
                matchedFields.push(field)
                totalScore += score
              }
            }
          }

          if (matchedFields.length > 0 && fieldCount > 0) {
            const confidence = totalScore / fieldCount

            if (confidence >= 0.5) {
              seen.add(pairKey)
              duplicates.push({
                record_id_1: record1.id < record2.id ? record1.id : record2.id,
                record_id_2: record1.id < record2.id ? record2.id : record1.id,
                confidence_score: Math.round(confidence * 10000) / 10000,
                match_fields: matchedFields,
              })
              break
            }
          }
        }
      }
    }

    // Insert duplicates (ignore conflicts)
    if (duplicates.length > 0) {
      for (const dup of duplicates) {
        await supabase
          .from('duplicate_records')
          .upsert({
            org_id: orgId,
            entity_type: entityType,
            ...dup,
            status: 'pending',
          }, {
            onConflict: 'org_id,entity_type,record_id_1,record_id_2',
            ignoreDuplicates: true,
          })
      }
    }

    return new Response(
      JSON.stringify({ success: true, duplicatesFound: duplicates.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Duplicate detection error:', error)

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### Success Criteria

#### Automated Verification:
- [ ] Edge Functions deploy: `supabase functions deploy`
- [ ] Functions respond to test requests

#### Manual Verification:
- [ ] Import job processes file and creates records
- [ ] Export job generates downloadable file
- [ ] Duplicate detection finds matching records

---

## Phase 6-10: UI Components

Due to the length of this plan, phases 6-10 (UI Components) are documented at a higher level:

### Phase 6: Data Management Dashboard
- Create `src/app/employee/admin/data/page.tsx`
- Create `src/components/admin/data/DataManagementDashboard.tsx`
- Display stats cards, recent operations, scheduled exports
- Navigation to sub-features

### Phase 7: Import Wizard
- Create `src/components/admin/data/ImportWizard.tsx`
- 4-step wizard: Upload → Field Mapping → Preview → Import
- Real-time progress polling
- Error display and handling

### Phase 8: Export Builder
- Create `src/components/admin/data/ExportBuilder.tsx`
- Entity selection, filter configuration, column picker
- Format selection, scheduling options
- Download management

### Phase 9: Bulk Operations & Duplicates
- Create `src/components/admin/data/BulkOperationsDialog.tsx`
- Create `src/components/admin/data/DuplicatesManager.tsx`
- Bulk update/delete with preview
- Duplicate review and merge interface

### Phase 10: GDPR & Archive
- Create `src/components/admin/data/GdprRequestsList.tsx`
- Create `src/components/admin/data/ArchiveManager.tsx`
- GDPR request creation and processing
- Archive viewing, restore, permanent delete

---

## Testing Strategy

### Unit Tests
- Parser functions (CSV, Excel, JSON)
- Validation functions
- Entity configuration utilities

### Integration Tests
- tRPC endpoint tests with test database
- Edge Function invocation tests

### E2E Tests
- Import wizard flow (upload → map → preview → import)
- Export builder flow (configure → download)
- GDPR request flow (create → discover → export)

### Manual Testing Steps
1. Upload CSV with 100 candidates, verify all imported
2. Export candidates to Excel, verify file opens correctly
3. Create GDPR DSAR request, verify data discovery
4. Detect duplicates, merge two records, verify merge
5. Bulk update 50 records, verify all updated
6. Archive and restore record, verify data integrity

---

## Performance Considerations

1. **Large File Imports**: Edge Functions process in chunks of 100, with progress updates
2. **Export Query Optimization**: Use pagination for large exports, stream to storage
3. **Duplicate Detection**: O(n²) algorithm limited to 10K records per run, use database indexes
4. **Client Polling**: Poll every 2 seconds during job processing, use exponential backoff

---

## Migration Notes

1. Run migrations in order (schema first, then storage)
2. Deploy Edge Functions before using import/export features
3. Seed default duplicate rules for common entities
4. Configure storage bucket CORS if needed

---

## References

- Epic spec: `thoughts/shared/epics/epic-01-admin/06-data-management.md`
- Research: `thoughts/shared/research/2025-12-05-data-management-codebase-research.md`
- File upload pattern: `src/server/routers/settings.ts:473-582`
- Wizard pattern: `src/components/admin/permissions/BulkUpdateDialog.tsx`
- tRPC patterns: `src/server/routers/pods.ts`
