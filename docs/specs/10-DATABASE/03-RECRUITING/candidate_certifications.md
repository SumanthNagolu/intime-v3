# candidate_certifications Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `candidate_certifications` |
| Schema | `public` |
| Purpose | Stores professional certifications held by candidates |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| candidate_id | uuid | NO | - | Foreign key to candidate |
| certification_type | text | NO | - | Certification type |
| name | text | NO | - | Name |
| acronym | text | YES | - | Acronym |
| issuing_organization | text | YES | - | Issuing organization |
| credential_id | text | YES | - | Foreign key to credential |
| credential_url | text | YES | - | Credential url |
| issue_date | date | YES | - | Issue date |
| expiry_date | date | YES | - | Expiry date |
| is_lifetime | boolean | YES | false | Is lifetime |
| requires_renewal | boolean | YES | false | Requires renewal |
| renewal_period_months | integer | YES | - | Renewal period months |
| cpe_credits_required | integer | YES | - | Cpe credits required |
| license_type | text | YES | - | License type |
| license_number | text | YES | - | License number |
| license_state | text | YES | - | License state |
| license_country | text | YES | - | License country |
| license_jurisdiction | text | YES | - | License jurisdiction |
| clearance_level | text | YES | - | Clearance level |
| clearance_status | text | YES | - | Clearance status |
| clearance_granted_date | date | YES | - | Clearance granted date |
| investigation_type | text | YES | - | Investigation type |
| polygraph_type | text | YES | - | Polygraph type |
| polygraph_date | date | YES | - | Polygraph date |
| sap_access | boolean | YES | false | Sap access |
| sci_access | boolean | YES | false | Sci access |
| is_verified | boolean | YES | false | Is verified |
| verified_at | timestamp with time zone | YES | - | Verified at |
| verified_by | uuid | YES | - | Verified by |
| verification_method | text | YES | - | Verification method |
| verification_notes | text | YES | - | Verification notes |
| document_file_id | uuid | YES | - | Foreign key to document_file |
| display_order | integer | YES | 0 | Display order |
| is_featured | boolean | YES | false | Is featured |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |
| created_by | uuid | YES | - | User who created the record |
| updated_by | uuid | YES | - | Updated by |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| candidate_id | user_profiles.id | User profiles |
| org_id | organizations.id | Organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| candidate_certifications_pkey | CREATE UNIQUE INDEX candidate_certifications_pkey ON public.candidate_certifications USING btree (id) |
| idx_certifications_candidate | CREATE INDEX idx_certifications_candidate ON public.candidate_certifications USING btree (candidate_id) |
| idx_certifications_org | CREATE INDEX idx_certifications_org ON public.candidate_certifications USING btree (org_id) |
