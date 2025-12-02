# i9_records Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `i9_records` |
| Schema | `public` |
| Purpose | Manages I-9 Employment Eligibility Verification forms for US employees as required by federal law |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique I-9 record identifier |
| employee_id | uuid | NO | - | Employee this I-9 form is for (unique constraint) |
| section1_completed_at | timestamp with time zone | YES | - | When employee completed Section 1 |
| section2_completed_at | timestamp with time zone | YES | - | When employer completed Section 2 verification |
| list_a_document | text | YES | - | List A document info (proves identity AND work authorization) |
| list_b_document | text | YES | - | List B document info (proves identity only) |
| list_c_document | text | YES | - | List C document info (proves work authorization only) |
| authorized_rep_name | text | YES | - | Name of employer representative who verified documents |
| authorized_rep_title | text | YES | - | Title of employer representative |
| reverification_date | date | YES | - | Date when I-9 needs to be reverified (for temporary work auth) |
| status | i9_status | NO | 'pending' | Current status of the I-9 form |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| created_by | uuid | YES | - | User who created the I-9 record |

## Enums

### i9_status
Valid values for the `status` column:
- `pending` - I-9 not yet started or incomplete
- `section1_complete` - Employee completed Section 1
- `completed` - Both sections completed, valid I-9
- `expired` - I-9 requires reverification (work auth expired)

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| employee_id | employees.id | Employee this I-9 is for (unique) |
| created_by | user_profiles.id | User who created the record |

## Indexes

| Index Name | Definition |
|------------|------------|
| i9_records_pkey | CREATE UNIQUE INDEX i9_records_pkey ON public.i9_records USING btree (id) |
| i9_records_employee_id_key | CREATE UNIQUE INDEX i9_records_employee_id_key ON public.i9_records USING btree (employee_id) |
| idx_i9_records_employee_id | CREATE INDEX idx_i9_records_employee_id ON public.i9_records USING btree (employee_id) |
| idx_i9_records_status | CREATE INDEX idx_i9_records_status ON public.i9_records USING btree (status) |

## Business Logic

### I-9 Form Structure

#### Section 1 (Employee)
- Completed by employee on or before first day of work
- Employee attests to citizenship/immigration status
- Employee provides identity/work authorization information
- Tracked by `section1_completed_at` timestamp

#### Section 2 (Employer)
- Completed by employer within 3 business days of hire
- Employer physically examines original documents
- Must use List A OR (List B + List C)
- Tracked by `section2_completed_at` timestamp

### Document Lists

#### List A (Identity AND Work Authorization)
- US Passport
- Green Card (I-551)
- Foreign passport with I-94 and visa
- Employment Authorization Document (EAD)

#### List B (Identity Only)
- Driver's license
- State ID card
- School ID with photo

#### List C (Work Authorization Only)
- Social Security card
- Birth certificate
- Native American tribal document

### Reverification
Required when:
- Temporary work authorization expires (e.g., EAD expiration)
- Employee's name changes
- Set in `reverification_date` field
- Triggers alerts via immigration_alerts table

### Status Workflow
1. `pending` → I-9 initiated but not completed
2. `section1_complete` → Employee completed their portion
3. `completed` → Employer verified documents, I-9 valid
4. `expired` → Work authorization expired, needs reverification

### Compliance Requirements
- **Timing**: Section 1 by first day, Section 2 within 3 business days
- **Retention**: Keep I-9s for 3 years after hire or 1 year after termination (whichever is later)
- **Reverification**: Monitor expiration dates for temporary work auth
- **Audit trail**: Track who created and when sections completed
- **One per employee**: Unique constraint on employee_id

### Key Features
- **Unique per employee**: One active I-9 record per employee
- **Two-step completion**: Separate tracking for employee and employer sections
- **Document tracking**: Records which documents were examined
- **Reverification alerts**: Monitors expiration dates
- **Authorized representative**: Tracks who verified documents
- **Compliance dates**: Timestamps ensure regulatory compliance
