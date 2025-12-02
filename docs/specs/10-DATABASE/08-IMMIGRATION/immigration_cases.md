# immigration_cases Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `immigration_cases` |
| Schema | `public` |
| Purpose | Tracks immigration cases for consultants including visa types, case status, and attorney assignments |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique case identifier |
| org_id | uuid | NO | - | Organization this case belongs to |
| consultant_id | uuid | NO | - | Consultant (bench sales) associated with this case |
| case_type | immigration_case_type | NO | - | Type of immigration case (H1B, Green Card, etc.) |
| status | immigration_case_status | NO | 'not_started' | Current status of the case |
| priority_date | date | YES | - | Priority date for green card cases |
| receipt_number | text | YES | - | USCIS receipt/case number |
| attorney_id | uuid | YES | - | Immigration attorney handling the case |
| employer_id | uuid | YES | - | Employer/client organization for the case |
| start_date | date | YES | - | Date when case processing started |
| expected_completion | date | YES | - | Estimated completion date |
| actual_completion | date | YES | - | Actual completion date when finalized |
| notes | text | YES | - | Additional case notes and details |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| created_by | uuid | YES | - | User who created the case record |

## Enums

### immigration_case_type
Valid values for the `case_type` column:
- `h1b_transfer` - H1B transfer to new employer
- `h1b_extension` - H1B visa extension
- `h1b_amendment` - H1B amendment for changes
- `gc_perm` - Green Card PERM labor certification
- `gc_i140` - Green Card I-140 immigrant petition
- `gc_i485` - Green Card I-485 adjustment of status
- `opt_extension` - OPT extension
- `tn_renewal` - TN visa renewal (NAFTA)
- `l1_extension` - L1 visa extension

### immigration_case_status
Valid values for the `status` column:
- `not_started` - Case not yet initiated
- `in_progress` - Case actively being processed
- `rfe` - Request for Evidence received
- `approved` - Case approved by USCIS
- `denied` - Case denied by USCIS
- `withdrawn` - Case withdrawn by applicant

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| org_id | organizations.id | Organization owning the case |
| consultant_id | bench_consultants.id | Consultant this case is for |
| attorney_id | immigration_attorneys.id | Assigned immigration attorney |
| employer_id | organizations.id | Employer/client for the case |
| created_by | user_profiles.id | User who created the record |

## Indexes

| Index Name | Definition |
|------------|------------|
| immigration_cases_pkey | CREATE UNIQUE INDEX immigration_cases_pkey ON public.immigration_cases USING btree (id) |
| idx_immigration_cases_org_id | CREATE INDEX idx_immigration_cases_org_id ON public.immigration_cases USING btree (org_id) |
| idx_immigration_cases_consultant_id | CREATE INDEX idx_immigration_cases_consultant_id ON public.immigration_cases USING btree (consultant_id) |
| idx_immigration_cases_status | CREATE INDEX idx_immigration_cases_status ON public.immigration_cases USING btree (status) |

## Business Logic

### Case Types
1. **H1B Cases**: Transfer, extension, and amendment workflows
2. **Green Card Cases**: Multi-stage process (PERM → I-140 → I-485)
3. **Other Visas**: OPT, TN, L1 extensions

### Status Workflow
1. `not_started` → Initial state when case is created
2. `in_progress` → Active processing with attorney/USCIS
3. `rfe` → Request for Evidence requires response
4. `approved` → Successful case completion
5. `denied` → Case rejected by USCIS
6. `withdrawn` → Applicant voluntarily withdraws

### Key Relationships
- Each case is tied to a specific consultant on the bench
- Cases may be assigned to an immigration attorney
- Employer field tracks the sponsoring organization
- Multiple cases can exist for the same consultant (extensions, transfers, etc.)
