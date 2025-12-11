---
date: 2025-12-11T10:55:01-05:00
researcher: Claude
git_commit: ca56456
branch: main
repository: intime-v3
topic: "WAVE 1: Foundation Issues - Current State Analysis"
tags: [research, codebase, wave-1, entities, skills, documents, notes, history, polymorphic]
status: complete
last_updated: 2025-12-11
last_updated_by: Claude
---

# Research: WAVE 1 Foundation Issues - Current State Analysis

**Date**: 2025-12-11T10:55:01-05:00
**Researcher**: Claude
**Git Commit**: ca56456
**Branch**: main
**Repository**: intime-v3

## Research Question

Document the current state of the codebase for WAVE 1 Foundation issues (ENTITIES-01, SKILLS-01, DOCS-01, NOTES-01, HISTORY-01) to understand what exists before implementation.

## Summary

WAVE 1 consists of 5 foundation issues with NO dependencies that can be implemented in parallel:

| Issue | Purpose | Current State | Effort |
|-------|---------|---------------|--------|
| **ENTITIES-01** | Entity Resolution Service | No central registry exists; polymorphic patterns scattered across 26+ tables | 0.5 week |
| **SKILLS-01** | Skills Taxonomy & Matching | 6+ fragmented skill tables; dual systems (legacy candidate_skills + new contact_skills) | 1 week |
| **DOCS-01** | Centralized Documents System | 8+ entity-specific document tables; hybrid storage patterns | 1 week |
| **NOTES-01** | Centralized Notes System | 5+ notes tables with hybrid approach (dedicated tables vs activities) | 0.5 week |
| **HISTORY-01** | Unified Audit Trail | 10+ history tables; partitioned audit_logs with triggers | 1 week |

---

## Detailed Findings

### 1. ENTITIES-01: Polymorphic Entity Patterns

#### Current State

The codebase extensively uses polymorphic relationships through `entity_type` + `entity_id` columns but lacks a **central registry** for validation or resolution.

#### Tables Using Polymorphic Patterns (26+ tables)

| Table | Purpose | Entity Types Constrained |
|-------|---------|-------------------------|
| `activities` | Business actions | No constraint |
| `activity_log` | Communication history | No constraint |
| `addresses` | Physical/mailing addresses | **10 types** (CHECK constraint) |
| `file_uploads` | File metadata | No constraint |
| `generated_documents` | Generated PDFs | No constraint |
| `notifications` | User notifications | No constraint |
| `object_owners` | RACI ownership | **9 types** (CHECK constraint) |
| `comments` | Collaborative comments | No constraint |
| `workflow_instances` | Running workflows | No constraint |
| `audit_logs` | Comprehensive audit trail | No constraint |

**Only 2 tables have CHECK constraints** on entity_type:

```sql
-- addresses (baseline.sql:11159)
CONSTRAINT addresses_entity_type_check CHECK ((entity_type = ANY (ARRAY[
  'candidate', 'account', 'contact', 'vendor', 'organization',
  'lead', 'job', 'interview', 'employee', 'placement'
])))

-- object_owners (baseline.sql:21304)
CONSTRAINT object_owners_entity_type_check CHECK ((entity_type = ANY (ARRAY[
  'campaign', 'lead', 'deal', 'account', 'job',
  'job_order', 'submission', 'contact', 'external_job'
])))
```

#### Entity Type Inconsistencies

| Context | Entity Types | Format |
|---------|-------------|--------|
| Navigation (`entity-navigation.types.ts`) | 9 types | Singular (`job`, `candidate`) |
| Workflows (`workflows/types.ts`) | 13 types | Plural (`jobs`, `candidates`) |
| Activities router | Mixed | `account` OR `company` interchangeable |

#### Entity Resolution Logic (Distributed)

**File**: `src/lib/data-management/entities.ts:240-252`
```typescript
// Current entity resolution - lookup table in code
ENTITY_CONFIGS = {
  candidates: { table: 'user_profiles' },
  jobs: { table: 'jobs' },
  accounts: { table: 'accounts' },
  contacts: { table: 'contacts' },
  // ...
}
```

**File**: `src/lib/workflows/action-executor.ts:580-595`
```typescript
// Duplicate mapping in workflow engine
const tableMap: Record<EntityType, string> = {
  jobs: 'jobs',
  employees: 'user_profiles',
  consultants: 'bench_consultants',
  // ...
}
```

#### What ENTITIES-01 Will Add

- `entity_type_registry` table as central source of truth
- `resolve_entity()` database function
- Consistent entity type validation across all polymorphic tables

---

### 2. SKILLS-01: Skills & Certifications System

#### Current State

**Dual systems exist** with migration path from legacy to unified contacts:

| Table | Purpose | Status |
|-------|---------|--------|
| `skills` | Master taxonomy (global) | Active |
| `skill_aliases` | Org-specific aliases | Active |
| `candidate_skills` | Legacy skills (links to user_profiles) | Active (legacy) |
| `contact_skills` | Unified skills (links to contacts) | Active (new) |
| `job_skills` | Job requirements | Active |
| `external_job_order_skills` | Vendor job skills | Active |
| `candidate_certifications` | Legacy certs (comprehensive) | Active (legacy) |
| `contact_certifications` | Unified certs (simplified) | Active (new) |

#### Key Schema Differences

| Feature | candidate_skills | contact_skills |
|---------|-----------------|----------------|
| Proficiency | TEXT ('intermediate') | INTEGER (1-5) |
| Verification | No | Yes (verified_by, verified_at, verification_method) |
| Skill FK | Required | Optional (allows ad-hoc skills) |
| Soft Delete | No | Yes (deleted_at) |
| Multi-tenancy | Via candidate FK | Direct org_id |

#### Master Skills Table (`baseline.sql:23741-23751`)

```sql
CREATE TABLE public.skills (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    category text,
    parent_skill_id uuid,  -- Hierarchy support
    description text,
    is_verified boolean DEFAULT false,
    usage_count integer DEFAULT 0,
    created_at, updated_at
);
```

**Missing from Master Guide proposal**:
- `embedding VECTOR(1536)` - For semantic search
- `canonical_name` - Normalized lowercase
- `hierarchy_path` - Materialized path
- `demand_score`, `trending` - ML features

#### tRPC Routers

| Router | Table | Procedures |
|--------|-------|-----------|
| `contactSkills` | contact_skills | list, getById, getByContact, searchBySkill, create, bulkCreate, update, delete, verify, stats |
| `contactCertifications` | contact_certifications | list, getById, getByContact, getActiveCertifications, getExpiringCertifications, create, update, delete, renew, sendRenewalReminder, checkExpiration, stats |

#### UI Components

- **SkillsSection.tsx**: Empty placeholder ("Skill management functionality coming soon")
- No active skill picker, selector, or management interface

#### What SKILLS-01 Will Add

- Enhanced `skills` table with hierarchy, embeddings, taxonomy
- Polymorphic `entity_skills` table (replaces 4 junction tables)
- Unified `certifications` table
- `skill_endorsements` for social proof
- Vector embeddings for semantic matching

---

### 3. DOCS-01: Document Storage System

#### Current State

**Hybrid storage approach** with entity-specific tables and polymorphic tracking:

| Table | Purpose | Entity Link | Storage |
|-------|---------|-------------|---------|
| `file_uploads` | Universal metadata | Polymorphic | Supabase Storage |
| `candidate_documents` | Candidate docs | candidate_id + contact_id | URL |
| `candidate_resumes` | Resume versions | candidate_id + contact_id | bucket + path |
| `campaign_documents` | Campaign materials | campaign_id | URL |
| `employee_documents` | HR documents | employee_id | URL |
| `immigration_documents` | Visa/work auth | case_id + file_id | Dual reference |
| `candidate_compliance_documents` | Compliance docs | candidate_id | file_id |
| `generated_documents` | Generated PDFs | Polymorphic | Storage path |
| `generated_resumes` | AI-generated resumes | user_id | Storage path |
| `document_templates` | Handlebars templates | org_id | Content in DB |

#### Storage Buckets (Supabase)

```sql
-- file_uploads.bucket constraint (baseline.sql:19017)
CONSTRAINT valid_bucket CHECK ((bucket = ANY (ARRAY[
  'avatars', 'resumes', 'documents', 'attachments', 'course-materials'
])))
```

#### Storage Pattern Types

| Pattern | Tables | Link Method |
|---------|--------|-------------|
| **Direct URL** | campaign_documents, candidate_documents, employee_documents | `file_url` column |
| **Polymorphic Metadata** | file_uploads | `entity_type` + `entity_id` |
| **Dual Reference** | immigration_documents | `file_url` + `file_id` |
| **Template-Based** | generated_documents | `template_id` + entity linking |

#### Document Features by Table

| Feature | candidate_resumes | employee_documents | campaign_documents |
|---------|-------------------|-------------------|-------------------|
| Versioning | Yes (previous_version_id) | No | No |
| AI Parsing | Yes (parsed_content, parsed_skills) | No | No |
| Expiry | No | Yes | No |
| Verification | No | Yes (verified_by) | No |
| Usage Tracking | No | No | Yes (usage_count) |

#### tRPC Routers

| Router | Procedures |
|--------|-----------|
| `crm.campaigns.documents` | list, getById, create, update, delete, incrementUsage |
| `contactAgreements` | Includes documentUrl, signedDocumentUrl |
| `contactCompliance` | Includes documentUrl |

#### UI Components

- **FileUpload.tsx**: Drag-drop file upload with validation
- No document viewer/preview component
- No document versioning UI

#### What DOCS-01 Will Add

- Unified `documents` table with polymorphic entity reference
- Consistent versioning support
- OCR/AI processing metadata
- Access control (confidentiality levels)
- Document deduplication via content hashing

---

### 4. NOTES-01: Notes System

#### Current State

**Hybrid approach**: Dedicated notes tables for some entities, activities table for others.

| Table | Entity | Features |
|-------|--------|----------|
| `account_notes` | Accounts | title, content, note_type (text), is_pinned |
| `company_notes` | Companies | title, content, note_type (ENUM), is_pinned, is_private, related_* FKs |
| `submission_notes` | Submissions | note only, is_client_visible |
| `external_job_order_notes` | Job orders | note only, no org_id, no soft delete |
| `meeting_notes` | Meetings | Full meeting management (scheduling, status, action_items) |
| `comments` | Polymorphic | Threading, @mentions, reactions |
| `activities` | Polymorphic | When activity_type='note', uses subject/description |

#### Notes Pattern by Entity

| Entity | Notes Implementation |
|--------|---------------------|
| Accounts | Dedicated `account_notes` table with full CRUD |
| Companies | Dedicated `company_notes` table with ENUM types |
| Contacts | Activities table with `activity_type='note'` |
| Jobs | Activities table with `activity_type='note'` |
| Submissions | Dedicated `submission_notes` table |

#### Schema Inconsistencies

| Feature | account_notes | company_notes | submission_notes | external_job_order_notes |
|---------|---------------|---------------|------------------|--------------------------|
| Title | Optional | Optional | No | No |
| Note Type | text enum | ENUM type | No | No |
| Is Pinned | Yes | Yes | No | No |
| Is Private | No | Yes | No | No |
| Updated By | Yes | No | No | No |
| Org ID | Yes | Yes | Yes | **No** |
| Soft Delete | Yes | Yes | Yes | **No** |

#### tRPC Routers

| Router | Entity | Procedures |
|--------|--------|-----------|
| `crm.notes` | Accounts | listByAccount, getById, create, update, delete |
| `crm.meetingNotes` | Meetings | listByAccount, getById, create, update, complete |
| `companies` | Companies | createNote, getNotes, deleteNote |
| `activities` | Contacts, Jobs | log (with activity_type='note'), listByEntity |

#### UI Components

| Component | Entity | Pattern |
|-----------|--------|---------|
| `InlineNoteForm.tsx` | Accounts | Collapsed button → Expanded form |
| `NoteInlinePanel.tsx` | Accounts | View/edit inline panel |
| `AccountNotesSection.tsx` | Accounts | List + inline panel (Guidewire pattern) |
| `ContactNotesSection.tsx` | Contacts | Uses activities, simple textarea |
| `JobNotesSection.tsx` | Jobs | Uses activities, mimics account_notes UI |
| `NotesSection.tsx` (PCF) | Generic | Config-driven, reusable |

#### What NOTES-01 Will Add

- Unified polymorphic `notes` table
- Threading support (parent_note_id, thread_root_id)
- @mentions with notification integration
- Visibility controls (private, team, organization)
- Clear separation from activities

---

### 5. HISTORY-01: Audit Trail System

#### Current State

**Three-tier history system**:

1. **Entity-specific status history** (manual capture)
2. **Specialized history tables** (domain-specific)
3. **Universal audit log** (automatic triggers)

#### History Tables (10+)

| Table | Purpose | Capture Method |
|-------|---------|----------------|
| `job_status_history` | Job state transitions | Manual (tRPC) |
| `submission_status_history` | Submission pipeline | Manual (tRPC) |
| `deal_stages_history` | Deal progression | Manual (tRPC) |
| `activity_history` | Activity modifications | Manual (tRPC) |
| `workflow_history` | Workflow transitions | Manual (immutable) |
| `contact_merge_history` | Deduplication audit | Manual (immutable) |
| `contact_work_history` | Employment history | CRUD |
| `candidate_work_history` | Employment history (legacy) | CRUD |
| `bulk_update_history` | Permission bulk changes | Manual |
| `login_history` | Login attempts | Manual |
| `audit_logs` | System-wide DML | **Automatic triggers** |

#### Audit Log Architecture

**Partitioned table** (`baseline.sql:13699-13734`):

```sql
CREATE TABLE public.audit_logs (
    id uuid,
    created_at timestamptz NOT NULL,
    table_name text NOT NULL,
    action text NOT NULL,  -- INSERT, UPDATE, DELETE, LOGIN, LOGOUT, etc.
    record_id uuid,
    user_id uuid,
    user_email text,
    old_values jsonb,
    new_values jsonb,
    changed_fields text[],
    severity text DEFAULT 'info',
    org_id uuid,
    entity_type text,
    entity_id uuid,
    is_compliance_relevant boolean DEFAULT false,
    retention_category text,
    result text DEFAULT 'SUCCESS',
    -- ...
) PARTITION BY RANGE (created_at);
```

**Partitions**: 2025_11, 2025_12, 2026_01, 2026_02

#### Automatic Triggers

| Trigger | Tables | Purpose |
|---------|--------|---------|
| `audit_trigger_func()` | user_profiles | Universal audit capture |
| `trigger_audit_log()` | roles, user_profiles, user_roles | Generic audit logging |
| `prevent_audit_log_modification()` | audit_logs | Immutability enforcement |
| `prevent_workflow_history_modification()` | workflow_history | Immutability enforcement |

#### Schema Differences

| Feature | job_status_history | submission_status_history | workflow_history | audit_logs |
|---------|-------------------|---------------------------|------------------|------------|
| Reason Field | Yes | Yes | No | No |
| Metadata JSONB | Yes | No | Yes | Yes |
| Business Metrics | Yes (days_to_fill, counts) | No | No | No |
| Immutability | Manual | Manual | **Trigger enforced** | **Trigger enforced** |
| Full Snapshot | No | No | No | Yes (old/new_values) |

#### tRPC Routers

| Router | Procedures |
|--------|-----------|
| `audit` | getStats, list, getById, export, listAlerts, getAlert, updateAlert, createRule, updateRule, deleteRule, toggleRule |
| `contactMergeHistory` | list, getById, getBySurvivor, getByMergedContact, create, getSnapshot, stats |
| `contactWorkHistory` | list, getById, getByContact, getCurrentEmployment, create, update, delete, endEmployment, verify, reorder, stats |
| `ats` (jobs) | getStatusHistory |

#### UI Components

| Component | Purpose |
|-----------|---------|
| `WorkflowHistoryPage.tsx` | Workflow execution logs with expandable details |
| `HistorySection.tsx` | Empty placeholder for contacts |
| `CommunicationLog.tsx` | Stub component |
| `UpdateStatusDialog.tsx` | Job status transitions (invalidates history) |

#### What HISTORY-01 Will Add

- Unified `entity_history` table for all status changes
- `audit_log` for field-level changes
- `system_events` for application events
- GDPR-compliant PII masking
- Retention policies with archiving
- Timeline API for visualization

---

## Code References

### Polymorphic Patterns
- Entity navigation types: `src/lib/navigation/entity-navigation.types.ts:9-18`
- Workflow entity types: `src/lib/workflows/types.ts:29-42`
- Entity config: `src/lib/data-management/entities.ts:240-252`
- Activities router polymorphic: `src/server/routers/activities.ts:85-100`

### Skills System
- Skills master: `baseline.sql:23741-23751`
- Contact skills: `baseline.sql:17079-17098`
- Contact skills router: `src/server/routers/contact-skills.ts:1-471`
- Skills section (placeholder): `src/components/contacts/sections/SkillsSection.tsx`

### Documents System
- File uploads: `baseline.sql:19003-19018`
- Candidate resumes: `baseline.sql:15520-15548`
- Campaign documents router: `src/server/routers/crm.ts:5942-6156`
- FileUpload component: `src/components/ui/file-upload.tsx:1-214`

### Notes System
- Account notes: `baseline.sql:11295-11308`
- Company notes: `baseline.sql:16276-16292`
- Comments (polymorphic): `baseline.sql:15923-15942`
- Account notes router: `src/server/routers/crm.ts:3610-3743`
- InlineNoteForm: `src/components/recruiting/accounts/InlineNoteForm.tsx`
- PCF NotesSection: `src/components/pcf/sections/NotesSection.tsx`

### History System
- Audit logs: `baseline.sql:13699-13734`
- Job status history: `baseline.sql:20170-20193`
- Workflow history: `baseline.sql:25954-25965`
- Audit router: `src/server/routers/audit.ts`
- WorkflowHistoryPage: `src/components/admin/workflows/WorkflowHistoryPage.tsx`

---

## Architecture Documentation

### Current Polymorphic Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                  NO CENTRAL REGISTRY                             │
│         (entity_type values are string literals)                 │
└─────────────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   activities    │ │   addresses     │ │  object_owners  │
│  (no constraint)│ │ (10 types CHECK)│ │ (9 types CHECK) │
└─────────────────┘ └─────────────────┘ └─────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│  26+ tables with entity_type + entity_id (mostly unconstrained)  │
└─────────────────────────────────────────────────────────────────┘
```

### Current Skills Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              MASTER SKILLS (global, no org_id)                   │
│  skills → skill_aliases (org-specific)                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │ LEGACY          │ NEW             │
         ▼                 ▼                 │
┌─────────────────┐ ┌─────────────────┐      │
│ candidate_skills│ │ contact_skills  │      │
│ (user_profiles) │ │ (contacts)      │      │
│ TEXT proficiency│ │ INT 1-5         │      │
│ No verification │ │ + Verification  │      │
└─────────────────┘ └─────────────────┘      │
         │                 │                 │
         └─────────────────┴─────────────────┤
                           │                 │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   job_skills    │ │external_job_    │ │  certifications │
│ (FK required)   │ │order_skills     │ │ (2 tables)      │
│                 │ │(no FK, freeform)│ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Current Notes Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    HYBRID NOTES SYSTEM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PATTERN A: Dedicated Tables          PATTERN B: Activities      │
│  ┌─────────────────┐                 ┌─────────────────┐        │
│  │ account_notes   │                 │   activities    │        │
│  │ company_notes   │                 │ activity_type=  │        │
│  │ submission_notes│                 │   'note'        │        │
│  │ meeting_notes   │                 │                 │        │
│  └─────────────────┘                 └─────────────────┘        │
│         │                                     │                  │
│         │ Used by:                           │ Used by:         │
│         ├─ Accounts                          ├─ Contacts        │
│         ├─ Companies                         ├─ Jobs            │
│         └─ Submissions                       └─ (other entities)│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Open Questions

1. **ENTITIES-01**: Should entity_type validation use CHECK constraints or FK to registry table with triggers? - choose best

2. **SKILLS-01**: What is the migration plan for existing `candidate_skills` data to `entity_skills`? Should it be immediate or gradual with backward compatibility views? - immediate

3. **DOCS-01**: How to handle deduplication of existing documents already stored multiple times in different entity-specific tables? - Dont worry bout data, w are in development phase

4. **NOTES-01**: Should activities with `activity_type='note'` be migrated to the new `notes` table, or should they remain as activities? - Notes

5. **HISTORY-01**: Which tables should get automatic history triggers vs. manual application-level capture? - all (Object is either in active or closed. OR it MUST have atleast open activity)

---

## Implementation Readiness

| Issue | Schema Ready | tRPC Ready | UI Ready | Migration Complexity |
|-------|-------------|-----------|----------|---------------------|
| ENTITIES-01 | Create new | Create new | N/A | Low (seed data only) |
| SKILLS-01 | Enhance + create | Modify existing | Create new | High (4 table migrations) |
| DOCS-01 | Create new | Modify existing | Modify existing | High (8 table migrations) |
| NOTES-01 | Create new | Modify existing | Modify existing | Medium (5 table migrations) |
| HISTORY-01 | Enhance + create | Modify existing | Modify existing | High (10+ table migrations) |

---

## Related Research

- Master Implementation Guide: `thoughts/shared/issues/00-MASTER-IMPLEMENTATION-GUIDE.md`
- Individual issue specs: `thoughts/shared/issues/[issue-id]`
