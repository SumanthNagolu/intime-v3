# User Story: Data Management

**Epic:** Admin Portal (Epic-01)
**Story ID:** ADMIN-US-006
**Priority:** Medium
**Estimated Context:** ~35K tokens
**Source Spec:** `docs/specs/20-USER-ROLES/10-admin/04-data-management.md`

---

## User Story

**As an** Admin user,
**I want** to import, export, archive, and manage data across the system,
**So that** I can maintain data quality, comply with regulations, and perform bulk operations.

---

## Acceptance Criteria

### AC-1: Data Import
- [ ] Upload CSV, Excel, or JSON files
- [ ] Auto-detect file format and columns
- [ ] Field mapping wizard (source → destination)
- [ ] Preview imported data before commit
- [ ] Handle validation errors gracefully
- [ ] Show import progress and results
- [ ] Support for all entity types (jobs, candidates, accounts, etc.)

### AC-2: Data Export
- [ ] Export filtered data or full tables
- [ ] Export formats: CSV, Excel, JSON
- [ ] Select columns to include
- [ ] Apply date range filters
- [ ] Schedule recurring exports
- [ ] Download history

### AC-3: Data Archival
- [ ] Archive old/inactive records
- [ ] Configure archival rules (age, status)
- [ ] View archived data
- [ ] Restore archived records
- [ ] Permanent deletion (with confirmation)

### AC-4: Duplicate Management
- [ ] Detect potential duplicates
- [ ] Configure duplicate rules (fields to match)
- [ ] Review and merge duplicates
- [ ] Auto-merge option for high confidence
- [ ] Audit trail of merges

### AC-5: Bulk Operations
- [ ] Bulk update field values
- [ ] Bulk status change
- [ ] Bulk assignment (owner, pod)
- [ ] Bulk delete (with safeguards)
- [ ] Preview affected records

### AC-6: Data Retention & GDPR
- [ ] Configure retention policies by entity type
- [ ] Process Data Subject Access Requests (DSAR)
- [ ] Process Right to Erasure requests
- [ ] Data anonymization
- [ ] Consent management

---

## UI/UX Requirements

### Data Management Dashboard
```
┌────────────────────────────────────────────────────────────────┐
│ Data Management                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ [Import] [Export] [Archive] [Duplicates] [Bulk Ops] [GDPR]    │
│                                                                │
│ ═══════════════════════════════════════════════════════════   │
│                                                                │
│ QUICK STATS                                                    │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│ │ Total Records│ Archived     │ Duplicates   │ GDPR Pending │ │
│ │ 45,231       │ 12,456       │ 234 (est.)   │ 3 requests   │ │
│ └──────────────┴──────────────┴──────────────┴──────────────┘ │
│                                                                │
│ RECENT OPERATIONS                                              │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Dec 4, 10:30 AM - Import: 150 candidates (success)        ││
│ │ Dec 3, 4:15 PM  - Export: Jobs report (completed)         ││
│ │ Dec 3, 2:00 PM  - Archive: 500 old submissions            ││
│ │ Dec 2, 11:00 AM - Merge: 12 duplicate candidates          ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ SCHEDULED OPERATIONS                                           │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Weekly export: Active jobs (Mondays 6 AM)          [Edit] ││
│ │ Monthly archive: Closed submissions (1st of month) [Edit] ││
│ └────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────┘
```

### Import Wizard
```
┌────────────────────────────────────────────────────────────────┐
│ Import Data                                               [×]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ STEP 1: Upload File                    [1]──[2]──[3]──[4]     │
│ ┌────────────────────────────────────────────────────────────┐│
│ │                                                            ││
│ │     ┌───────────────────────────────────────┐             ││
│ │     │         📁 Drop file here             │             ││
│ │     │      or click to browse               │             ││
│ │     │                                       │             ││
│ │     │   Supported: CSV, Excel, JSON         │             ││
│ │     └───────────────────────────────────────┘             ││
│ │                                                            ││
│ │ Entity Type: [Candidates                              ▼]   ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ [Cancel]                                            [Next →]   │
└────────────────────────────────────────────────────────────────┘
```

### Field Mapping Step
```
┌────────────────────────────────────────────────────────────────┐
│ Import Data - Field Mapping                              [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ STEP 2: Map Fields                     [1]──[2]──[3]──[4]     │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ SOURCE COLUMN          →  DESTINATION FIELD                ││
│ ├────────────────────────┬───────────────────────────────────┤│
│ │ first_name             │ [First Name                   ▼]  ││
│ │ last_name              │ [Last Name                    ▼]  ││
│ │ email_address          │ [Email                        ▼]  ││
│ │ phone                   │ [Phone                        ▼]  ││
│ │ resume_url             │ [Resume URL                   ▼]  ││
│ │ years_experience       │ [Years of Experience          ▼]  ││
│ │ skills                  │ [Skills (comma separated)     ▼]  ││
│ │ location               │ [-- Skip this column --       ▼]  ││
│ └────────────────────────┴───────────────────────────────────┘│
│                                                                │
│ ☑ First row contains headers                                  │
│ ☐ Create new fields for unmapped columns                      │
│                                                                │
│ [← Back]                                            [Next →]   │
└────────────────────────────────────────────────────────────────┘
```

### Import Preview
```
┌────────────────────────────────────────────────────────────────┐
│ Import Data - Preview                                    [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ STEP 3: Preview                        [1]──[2]──[3]──[4]     │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Total rows: 150  |  Valid: 147  |  Errors: 3              ││
│ ├────────────────────────────────────────────────────────────┤│
│ │ Row│ First Name │ Last Name │ Email         │ Status      ││
│ ├────┼────────────┼───────────┼───────────────┼─────────────┤│
│ │ 1  │ John       │ Doe       │ john@ex.com   │ ✓ Valid     ││
│ │ 2  │ Jane       │ Smith     │ jane@ex.com   │ ✓ Valid     ││
│ │ 3  │ Bob        │           │ bob@ex.com    │ ⚠ Warning   ││
│ │    │            │           │               │ (no last)   ││
│ │ 4  │ Alice      │ Johnson   │ invalid-email │ ✗ Error     ││
│ │    │            │           │               │ (bad email) ││
│ │ ...│            │           │               │             ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ Error Handling:                                                │
│ ● Skip rows with errors                                       │
│ ○ Stop import on first error                                  │
│ ○ Import all (create with errors flagged)                     │
│                                                                │
│ [← Back]                                          [Import →]   │
└────────────────────────────────────────────────────────────────┘
```

### Export Builder
```
┌────────────────────────────────────────────────────────────────┐
│ Export Data                                              [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ ENTITY                                                         │
│ [Candidates                                               ▼]  │
│                                                                │
│ FILTERS                                                        │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Date Range: [Last 30 days                             ▼]   ││
│ │ Status:     [All                                      ▼]   ││
│ │ Source:     [All                                      ▼]   ││
│ │ [+ Add Filter]                                             ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ COLUMNS TO INCLUDE                                             │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ ☑ First Name         ☑ Last Name          ☑ Email         ││
│ │ ☑ Phone              ☐ Address            ☑ Status        ││
│ │ ☑ Source             ☑ Created Date       ☐ Updated Date  ││
│ │ ☑ Skills             ☐ Resume URL         ☐ Notes         ││
│ │                                                            ││
│ │ [Select All] [Deselect All]                                ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ FORMAT                                                         │
│ ● CSV  ○ Excel  ○ JSON                                        │
│                                                                │
│ SCHEDULE (Optional)                                            │
│ ☐ Schedule recurring export                                   │
│                                                                │
│ Preview: ~2,500 records will be exported                      │
│                                                                │
│ [Cancel]                                           [Export]    │
└────────────────────────────────────────────────────────────────┘
```

### GDPR Request Processing
```
┌────────────────────────────────────────────────────────────────┐
│ GDPR Requests                                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ PENDING REQUESTS (3)                                           │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ #GDPR-2024-001 | Data Access Request | john@email.com     ││
│ │ Submitted: Dec 1, 2024 | Due: Dec 31, 2024                ││
│ │ [Process Request]                                          ││
│ ├────────────────────────────────────────────────────────────┤│
│ │ #GDPR-2024-002 | Erasure Request | jane@email.com         ││
│ │ Submitted: Dec 2, 2024 | Due: Jan 1, 2025                 ││
│ │ [Process Request]                                          ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ PROCESSING REQUEST: #GDPR-2024-001                             │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Subject: John Doe (john@email.com)                        ││
│ │ Request Type: Data Subject Access Request (DSAR)          ││
│ │                                                            ││
│ │ DATA FOUND:                                                ││
│ │ ☑ Candidate Profile (1 record)                            ││
│ │ ☑ Submissions (3 records)                                 ││
│ │ ☑ Interview Records (2 records)                           ││
│ │ ☑ Email Communications (15 records)                       ││
│ │ ☑ Activity Log (47 records)                               ││
│ │                                                            ││
│ │ [Generate Data Export]                                     ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ [Mark as Completed] [Reject Request]                          │
└────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Import jobs
CREATE TABLE import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  entity_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  field_mapping JSONB NOT NULL,
  total_rows INTEGER,
  processed_rows INTEGER DEFAULT 0,
  success_rows INTEGER DEFAULT 0,
  error_rows INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  error_log JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Export jobs
CREATE TABLE export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  entity_type VARCHAR(50) NOT NULL,
  filters JSONB,
  columns TEXT[],
  format VARCHAR(20) NOT NULL, -- csv, excel, json
  file_url TEXT,
  record_count INTEGER,
  status VARCHAR(20) DEFAULT 'pending',
  scheduled BOOLEAN DEFAULT false,
  schedule_cron VARCHAR(100),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GDPR requests
CREATE TABLE gdpr_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  request_number VARCHAR(50) NOT NULL,
  request_type VARCHAR(50) NOT NULL, -- dsar, erasure, rectification
  subject_email VARCHAR(255) NOT NULL,
  subject_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, rejected
  data_found JSONB,
  export_file_url TEXT,
  notes TEXT,
  due_date DATE NOT NULL,
  processed_by UUID REFERENCES user_profiles(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Duplicate detection
CREATE TABLE duplicate_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  candidate_id_1 UUID NOT NULL REFERENCES candidates(id),
  candidate_id_2 UUID NOT NULL REFERENCES candidates(id),
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  match_fields TEXT[], -- which fields matched
  status VARCHAR(20) DEFAULT 'pending', -- pending, merged, dismissed
  merged_into UUID REFERENCES candidates(id),
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_import_jobs_org ON import_jobs(organization_id);
CREATE INDEX idx_import_jobs_status ON import_jobs(status);
CREATE INDEX idx_export_jobs_org ON export_jobs(organization_id);
CREATE INDEX idx_gdpr_requests_org ON gdpr_requests(organization_id);
CREATE INDEX idx_gdpr_requests_status ON gdpr_requests(status);
CREATE INDEX idx_duplicate_candidates_org ON duplicate_candidates(organization_id);
```

---

## tRPC Endpoints

```typescript
// src/server/routers/admin/data.ts
export const dataRouter = router({
  // Import
  createImportJob: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      fileUrl: z.string(),
      fieldMapping: z.record(z.string())
    }))
    .mutation(async ({ ctx, input }) => {
      // Create import job
      // Queue for processing
    }),

  getImportStatus: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Return import job status
    }),

  // Export
  createExportJob: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      filters: z.record(z.any()).optional(),
      columns: z.array(z.string()),
      format: z.enum(['csv', 'excel', 'json']),
      scheduled: z.boolean().default(false),
      scheduleCron: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Create export job
      // Queue for processing
    }),

  downloadExport: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Return signed download URL
    }),

  // GDPR
  listGdprRequests: orgProtectedProcedure
    .input(z.object({
      status: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      // Return GDPR requests
    }),

  processGdprRequest: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      action: z.enum(['process', 'complete', 'reject']),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Process GDPR request
    }),

  // Duplicates
  detectDuplicates: orgProtectedProcedure
    .input(z.object({ entityType: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Run duplicate detection
    }),

  listDuplicates: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      status: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      // Return duplicate pairs
    }),

  mergeDuplicates: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      keepId: z.string().uuid(),
      mergeId: z.string().uuid()
    }))
    .mutation(async ({ ctx, input }) => {
      // Merge records
    }),

  // Bulk Operations
  bulkUpdate: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      ids: z.array(z.string().uuid()),
      updates: z.record(z.any())
    }))
    .mutation(async ({ ctx, input }) => {
      // Bulk update records
    }),

  bulkDelete: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      ids: z.array(z.string().uuid()),
      permanent: z.boolean().default(false)
    }))
    .mutation(async ({ ctx, input }) => {
      // Bulk delete (soft or hard)
    })
});
```

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| ADMIN-DATA-001 | Import CSV file | Records created from valid rows |
| ADMIN-DATA-002 | Import with mapping errors | Errors shown in preview |
| ADMIN-DATA-003 | Import skip error rows | Valid rows imported, errors logged |
| ADMIN-DATA-004 | Export to CSV | CSV file generated with selected columns |
| ADMIN-DATA-005 | Export with filters | Only filtered records exported |
| ADMIN-DATA-006 | Schedule recurring export | Export runs on schedule |
| ADMIN-DATA-007 | Detect duplicates | Potential duplicates identified |
| ADMIN-DATA-008 | Merge duplicates | Records merged, history preserved |
| ADMIN-DATA-009 | Process DSAR | Data export generated for subject |
| ADMIN-DATA-010 | Process erasure | Subject data anonymized/deleted |
| ADMIN-DATA-011 | Bulk update status | All selected records updated |
| ADMIN-DATA-012 | Bulk delete | Records soft deleted |
| ADMIN-DATA-013 | Restore archived | Record restored to active |
| ADMIN-DATA-014 | Permanent delete | Record permanently removed |
| ADMIN-DATA-015 | Non-admin access | Returns 403 Forbidden |

---

## Dependencies

- File storage (S3) for import/export files
- Background job processor for async operations
- Audit Logging (UC-ADMIN-008)
- Email system for GDPR notifications

---

## Out of Scope

- Real-time data sync with external systems
- Data masking for non-admin users
- Custom ETL pipelines
