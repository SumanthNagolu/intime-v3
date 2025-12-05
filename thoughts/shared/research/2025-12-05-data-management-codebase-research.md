---
date: 2025-12-05T12:00:00-08:00
researcher: Claude
git_commit: bd4f5462d7a853ef861c78d80d1461677782892c
branch: main
repository: intime-v3
topic: "Data Management Feature - Codebase Research"
tags: [research, codebase, data-management, admin, import-export, gdpr]
status: complete
last_updated: 2025-12-05
last_updated_by: Claude
---

# Research: Data Management Feature - Codebase Research

**Date**: 2025-12-05T12:00:00-08:00
**Researcher**: Claude
**Git Commit**: bd4f5462d7a853ef861c78d80d1461677782892c
**Branch**: main
**Repository**: intime-v3

## Research Question

Research the codebase to understand how the system works and what files/line numbers are relevant to implementing the Data Management feature (ADMIN-US-006), which includes:
- Data Import (CSV, Excel, JSON)
- Data Export with scheduling
- Data Archival
- Duplicate Management
- Bulk Operations
- GDPR/Data Retention compliance

## Summary

The InTime v3 codebase has solid foundational infrastructure for implementing the Data Management feature:

1. **tRPC Router Patterns**: Well-established patterns for CRUD operations, input validation with Zod, audit logging, and multi-tenant data isolation via `orgProtectedProcedure`.

2. **Admin Portal Structure**: Complete admin portal with routes, components, and navigation. Settings pages use a sectioned layout pattern that can be adapted for Data Management.

3. **File Upload**: Basic file upload component exists with base64 conversion and Supabase Storage integration. CSV/Excel parsing libraries are NOT installed.

4. **Background Jobs**: Database schema exists for queues and bulk jobs, but NO application-level implementation. No scheduler library installed.

5. **Audit Logging**: Comprehensive audit trail via database triggers and explicit logging in mutations.

6. **Multi-Step Wizards**: One example (BulkUpdateDialog) with manual step management. No reusable wizard component.

7. **Database Migrations**: Well-defined patterns for table creation, indexes, RLS policies, and idempotent migrations.

---

## Detailed Findings

### 1. tRPC Router Patterns

**Key Files:**
- Root Router: `src/server/trpc/root.ts:8-14`
- tRPC Init: `src/server/trpc/init.ts:6-24`
- Middleware: `src/server/trpc/middleware.ts:4-35`
- Context: `src/server/trpc/context.ts:11-41`

**Pattern for New Router (`dataRouter`):**

```typescript
// src/server/routers/data.ts (NEW FILE)
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'

export const dataRouter = router({
  // Import procedures
  createImportJob: orgProtectedProcedure
    .input(z.object({...}))
    .mutation(async ({ ctx, input }) => {...}),

  // Export procedures
  createExportJob: orgProtectedProcedure
    .input(z.object({...}))
    .mutation(async ({ ctx, input }) => {...}),

  // GDPR procedures
  listGdprRequests: orgProtectedProcedure
    .input(z.object({...}))
    .query(async ({ ctx, input }) => {...}),
})
```

**Registration in Root Router** (`src/server/trpc/root.ts`):
```typescript
import { dataRouter } from '../routers/data'

export const appRouter = router({
  // ... existing routers
  data: dataRouter,  // ADD THIS
})
```

**Existing Router Examples:**
- `src/server/routers/pods.ts` (766 lines) - Full CRUD with audit logging
- `src/server/routers/users.ts` (765 lines) - Complex create with auth user + profile
- `src/server/routers/settings.ts` (700 lines) - File upload pattern for branding

---

### 2. Admin Portal Routes & Components

**Route Structure:**
```
src/app/employee/admin/
├── layout.tsx              # SidebarLayout wrapper
├── dashboard/page.tsx      # Dashboard
├── users/                  # User management (pattern to follow)
│   ├── page.tsx           # List page
│   ├── new/page.tsx       # Create form
│   ├── [id]/page.tsx      # Detail view
│   └── [id]/edit/page.tsx # Edit form
└── settings/               # Settings hub (pattern to follow)
    └── layout.tsx         # Nested layout with tabs
```

**For Data Management, create:**
```
src/app/employee/admin/data/
├── page.tsx               # Data Management Dashboard
├── import/page.tsx        # Import wizard
├── export/page.tsx        # Export builder
├── archive/page.tsx       # Archive management
├── duplicates/page.tsx    # Duplicate detection
└── gdpr/page.tsx          # GDPR requests
```

**Navigation Config** (`src/lib/navigation/adminNavConfig.ts:83-112`):
Data Management already defined at line 100:
```typescript
{ label: 'Data Management', href: '/employee/admin/data', icon: Database }
```

**Component Pattern:**

Page files are thin wrappers:
```typescript
// src/app/employee/admin/data/page.tsx
export const dynamic = 'force-dynamic'
import { DataManagementDashboard } from '@/components/admin/data/DataManagementDashboard'
export default function DataPage() {
  return <DataManagementDashboard />
}
```

Components go in:
```
src/components/admin/data/
├── DataManagementDashboard.tsx  # Main dashboard
├── ImportWizard.tsx             # Multi-step import
├── ExportBuilder.tsx            # Export configuration
├── DuplicatesManager.tsx        # Duplicate review
├── GdprRequestsList.tsx         # GDPR requests table
└── index.ts                     # Barrel export
```

**Layout Wrapper Pattern** (`src/components/dashboard/DashboardShell.tsx:14-47`):
```typescript
<DashboardShell
  title="Data Management"
  description="Import, export, and manage your data"
  breadcrumbs={[
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Data Management' }
  ]}
  actions={<Button>New Import</Button>}
>
  {children}
</DashboardShell>
```

---

### 3. File Upload Patterns

**Existing Component:** `src/components/ui/file-upload.tsx`
- Lines 21-32: Props (value, onChange, accept, maxSize, preview)
- Lines 46-88: File validation and base64 conversion
- Lines 90-112: Drag-and-drop handlers
- Lines 137-213: Render with preview

**Usage Example** (`src/components/admin/settings/BrandingSettingsPage.tsx:108-121`):
```typescript
<FileUpload
  value={logoLight}
  onChange={(base64, originalFile) => handleLogoUpload('logo_light', base64, originalFile)}
  accept={['image/png', 'image/jpeg', 'image/svg+xml']}
  maxSize={5 * 1024 * 1024}
  preview
  aspectRatio="landscape"
/>
```

**Server-Side Upload** (`src/server/routers/settings.ts:473-582`):
- Lines 484-490: MIME type validation
- Lines 492-503: Base64 to Buffer conversion, size validation
- Lines 522-528: Upload to Supabase Storage
- Lines 538-552: Save metadata to database

**Missing Libraries (need to install):**
```bash
pnpm add papaparse xlsx
pnpm add -D @types/papaparse
```

- `papaparse` - CSV parsing
- `xlsx` - Excel parsing

**For Import Feature:**
1. Extend `FileUpload` to accept `.csv`, `.xlsx`, `.json`
2. Create parsers: `src/lib/import/parsers/csv.ts`, `excel.ts`, `json.ts`
3. Server-side: Process file, validate, queue for import

---

### 4. Background Job Processing

**Database Schema EXISTS** (`supabase/migrations/20251201001000_workplan_activity_system.sql`):

**work_queues** (lines 764-793):
- Queue configuration with assignment strategies
- Filter criteria and sort order

**queue_items** (lines 801-836):
- Items in queues with status tracking
- Status: 'queued', 'assigned', 'in_progress', 'completed', 'removed'

**bulk_activity_jobs** (lines 842-882):
- Batch operation tracking
- Progress: total_items, processed_items, failed_items
- Status: 'pending', 'running', 'completed', 'failed'

**Application Code: NOT IMPLEMENTED**

No queue manager, job processor, or scheduler exists. Options:

1. **Simple Approach (Recommended for MVP):**
   - Process imports/exports synchronously for small files
   - Use Supabase Edge Functions for larger files
   - Track status in database

2. **Full Implementation (Future):**
   - Add `pg-boss` or `bull` for job queues
   - Create worker process
   - Implement scheduled exports with cron

**For Import Jobs Table** (from requirement spec):
```sql
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
  status VARCHAR(20) DEFAULT 'pending',
  error_log JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 5. Multi-Tenant Data Patterns

**Context Creation** (`src/server/trpc/context.ts:16-34`):
- Extracts `org_id` from `user_profiles` via service role client
- Passes `orgId` to all procedures via context

**Middleware** (`src/server/trpc/middleware.ts:19-32`):
```typescript
const hasOrg = middleware(async ({ ctx, next }) => {
  if (!ctx.orgId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must belong to an organization',
    })
  }
  return next({ ctx: { ...ctx, orgId: ctx.orgId } })
})
```

**Query Pattern** (used 46+ times across routers):
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('org_id', orgId)  // ALWAYS filter by org_id
  .is('deleted_at', null)
```

**Insert Pattern:**
```typescript
await supabase.from('table_name').insert({
  org_id: orgId,  // ALWAYS include org_id
  // ... other fields
})
```

**For Data Management:**
- All import/export jobs scoped to `org_id`
- GDPR requests scoped to `org_id`
- Duplicate detection within organization only

---

### 6. Activity/Audit Logging

**Audit Table Fields** (`supabase/migrations/20251130200000_core_schema_enhancements.sql:172-193`):
- `table_name`, `action`, `record_id`
- `user_id`, `user_email`, `org_id`
- `old_values`, `new_values` (JSONB)
- `entity_type`, `entity_id` (polymorphic)

**Audit Pattern in Mutations** (`src/server/routers/pods.ts:202-210`):
```typescript
await supabase.from('audit_logs').insert({
  org_id: orgId,
  user_id: user?.id,
  user_email: user?.email,
  action: 'create',
  table_name: 'pods',
  record_id: pod.id,
  new_values: pod,
})
```

**For Data Management:**
- Log all import operations with row counts
- Log export requests and downloads
- Log GDPR request processing
- Log bulk operations with affected record counts

---

### 7. UI Wizard/Multi-Step Form Patterns

**Only Example:** `src/components/admin/permissions/BulkUpdateDialog.tsx`

**Step Management** (lines 70-76):
```typescript
const [step, setStep] = useState(1)
```

**Progress Indicator** (lines 349-359):
```typescript
<div className="flex gap-1">
  {[1, 2, 3, 4].map((s) => (
    <div
      key={s}
      className={`flex-1 h-1 rounded ${
        s <= step ? 'bg-hublot-500' : 'bg-charcoal-200'
      }`}
    />
  ))}
</div>
```

**Step Validation** (lines 147-153):
```typescript
const canProceedStep1 = updateType !== ''
const canProceedStep2 = selectedUsers.length > 0
// ...
```

**Navigation** (lines 368-401):
```typescript
<DialogFooter>
  {step > 1 && (
    <Button variant="outline" onClick={() => setStep(step - 1)}>
      Back
    </Button>
  )}
  {step < 4 ? (
    <Button
      onClick={() => setStep(step + 1)}
      disabled={!canProceed}
    >
      Continue
    </Button>
  ) : (
    <Button onClick={handleSubmit}>Submit</Button>
  )}
</DialogFooter>
```

**For Import Wizard (4 steps per requirement):**
1. Upload File + Select Entity Type
2. Field Mapping (source → destination)
3. Preview + Error Handling Options
4. Import Progress + Results

**Dialog Component:** `src/components/ui/dialog.tsx`
- Use `DialogContent className="max-w-2xl"` for wider wizard
- Can be full-page or modal-based

---

### 8. Database Migration Patterns

**Naming Convention:**
```
YYYYMMDDHHMMSS_descriptive_name.sql
Example: 20251208000000_data_management_tables.sql
```

**Header Pattern:**
```sql
-- ============================================================================
-- Migration: Data Management Tables
-- Date: 2025-12-08
-- Description: Tables for data import, export, GDPR, and duplicate management
-- ============================================================================
```

**Table Creation Pattern:**
```sql
CREATE TABLE IF NOT EXISTS import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Job details
  entity_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,

  -- Audit
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Index Pattern:**
```sql
CREATE INDEX IF NOT EXISTS idx_import_jobs_org ON import_jobs(org_id);
CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON import_jobs(status);
```

**RLS Pattern:**
```sql
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "import_jobs_org_policy" ON import_jobs
  FOR ALL
  USING (org_id = auth_user_org_id() OR user_is_admin());
```

**Trigger Pattern:**
```sql
CREATE TRIGGER import_jobs_updated_at
  BEFORE UPDATE ON import_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Code References

### tRPC Infrastructure
- `src/server/trpc/root.ts:8-14` - Router composition
- `src/server/trpc/init.ts:6-24` - tRPC initialization with superjson
- `src/server/trpc/middleware.ts:4-35` - Auth and org middleware
- `src/server/trpc/context.ts:11-41` - Context creation with org_id

### Router Examples
- `src/server/routers/pods.ts:14-77` - List with pagination
- `src/server/routers/pods.ts:120-213` - Create with audit logging
- `src/server/routers/users.ts:177-310` - Complex create (auth + profile)
- `src/server/routers/settings.ts:473-582` - File upload mutation

### Admin Components
- `src/app/employee/admin/layout.tsx:1-16` - Admin layout
- `src/lib/navigation/adminNavConfig.ts:83-112` - Navigation config
- `src/components/dashboard/DashboardShell.tsx:14-47` - Page wrapper
- `src/components/admin/settings/SettingsSection.tsx:15-48` - Section card

### File Upload
- `src/components/ui/file-upload.tsx:46-88` - Validation and base64 conversion
- `src/server/routers/settings.ts:493-528` - Server-side file processing

### Wizard Pattern
- `src/components/admin/permissions/BulkUpdateDialog.tsx:70-76` - Step state
- `src/components/admin/permissions/BulkUpdateDialog.tsx:349-359` - Progress bar
- `src/components/admin/permissions/BulkUpdateDialog.tsx:368-401` - Navigation

### Form Components
- `src/components/ui/input.tsx:5-67` - Input with variants
- `src/components/ui/select.tsx:1-168` - Select dropdown
- `src/components/ui/dialog.tsx:33-62` - Dialog content styling
- `src/components/ui/button.tsx:10-67` - Button variants

### Database
- `supabase/migrations/20251205000000_user_management_tables.sql` - Recent migration example
- `supabase/migrations/20251119184000_add_multi_tenancy.sql:138-164` - RLS helpers
- `supabase/migrations/20251123000000_create_helper_functions.sql:11-17` - updated_at trigger

---

## Architecture Documentation

### Multi-Tenant Data Flow
```
Request → createContext() → getUser() → query user_profiles → orgId → Context
                                                                    ↓
orgProtectedProcedure → check user exists → check orgId exists → Procedure
                                                                    ↓
                                    Query: .eq('org_id', orgId) → Response
```

### File Upload Flow
```
Client FileUpload → base64 conversion → tRPC mutation
                                             ↓
                      Server: validate → Buffer → Supabase Storage
                                             ↓
                            Database: metadata record → signed URL
```

### Audit Logging Flow
```
Mutation → Business Logic → Database Operation → Audit Log Insert
              ↓                                        ↓
         Validate           Insert/Update      org_id, user_id,
                                               action, old/new values
```

---

## Dependencies to Add

For full Data Management implementation:

```json
{
  "dependencies": {
    "papaparse": "^5.4.1",      // CSV parsing
    "xlsx": "^0.18.5"           // Excel parsing
  },
  "devDependencies": {
    "@types/papaparse": "^5.3.14"
  }
}
```

---

## Open Questions

1. **Background Jobs**: Should we implement a full job queue (pg-boss/bull) or use simpler synchronous processing for MVP?

2. **Large File Handling**: Should large files be processed via Supabase Edge Functions or chunked on the server?

3. **Export Scheduling**: Should scheduled exports use database polling, external cron, or Supabase scheduled functions?

4. **GDPR Data Discovery**: Which tables should be scanned for GDPR subject data? Need comprehensive entity mapping.

5. **Duplicate Detection Algorithm**: What matching rules should be configurable? Email-only, name+phone, fuzzy matching?

---

## Related Files

### Requirement Spec
- `thoughts/shared/epics/epic-01-admin/06-data-management.md`

### Database Specs (if needed)
- `docs/specs/10-DATABASE/10-SYSTEM/file_uploads.md`
- `docs/specs/10-DATABASE/10-SYSTEM/background_jobs.md`

### Archived Reference (design patterns only)
- `.archive/ui-reference/screens/admin/data-import.screen.ts`
- `.archive/ui-reference/screens/admin/data-export.screen.ts`
