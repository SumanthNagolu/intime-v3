# immigration_documents Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `immigration_documents` |
| Schema | `public` |
| Purpose | Stores immigration-related documents for each case including visas, work permits, and supporting documentation |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique document identifier |
| case_id | uuid | NO | - | Immigration case this document belongs to |
| document_type | text | NO | - | Type of document (e.g., 'visa', 'i797', 'ead', 'passport') |
| file_url | text | YES | - | URL to the stored document file |
| file_id | uuid | YES | - | Reference to file in file storage system |
| file_name | text | YES | - | Original filename of the document |
| issue_date | date | YES | - | Date document was issued |
| expiry_date | date | YES | - | Date document expires (if applicable) |
| verified_by | uuid | YES | - | User who verified the document |
| verified_at | timestamp with time zone | YES | - | Timestamp when document was verified |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| case_id | immigration_cases.id | Associated immigration case |
| verified_by | user_profiles.id | User who verified the document |

## Indexes

| Index Name | Definition |
|------------|------------|
| immigration_documents_pkey | CREATE UNIQUE INDEX immigration_documents_pkey ON public.immigration_documents USING btree (id) |
| idx_immigration_documents_case_id | CREATE INDEX idx_immigration_documents_case_id ON public.immigration_documents USING btree (case_id) |

## Business Logic

### Document Types
Common immigration document types:
- `visa` - Visa stamp in passport
- `i797` - USCIS approval notice
- `i94` - Arrival/departure record
- `ead` - Employment Authorization Document
- `passport` - Passport copy
- `i140` - Immigrant petition approval
- `i485_receipt` - Adjustment of status receipt
- `gc` - Green Card (permanent resident card)
- `perm` - Labor certification approval
- `opt` - OPT card for students
- `offer_letter` - Job offer letter
- `paystubs` - Pay stubs for verification
- `lca` - Labor Condition Application

### Document Verification
1. Documents are uploaded and linked to immigration case
2. HR/Immigration team reviews and verifies authenticity
3. `verified_by` and `verified_at` track verification status
4. Unverified documents may trigger alerts

### Expiration Tracking
- Documents with `expiry_date` are monitored
- System creates alerts before expiration (via immigration_alerts table)
- Critical for:
  - Visa expiration dates
  - EAD card expiration
  - I-94 expiration
  - Passport expiration

### File Storage
- `file_url`: Direct URL to file in storage (S3, etc.)
- `file_id`: Reference to file management system
- `file_name`: Original filename for user reference
- Supports multiple files per case (visa, I-797, passport, etc.)

### Key Features
- **Issue/Expiry tracking**: Monitors document validity periods
- **Verification workflow**: Ensures document authenticity
- **Multi-file support**: Multiple documents per case
- **Audit trail**: Tracks who verified and when
