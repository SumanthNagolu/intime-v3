# candidate_work_authorizations Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `candidate_work_authorizations` |
| Schema | `public` |
| Purpose | Work authorization and visa status for candidates |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| candidate_id | uuid | NO | - | Foreign key to candidate |
| authorization_type | text | NO | - | Authorization type |
| visa_type | text | YES | - | Visa type |
| country_code | text | NO | - | Country code |
| status | text | NO | 'active'::text | Status |
| issue_date | date | YES | - | Issue date |
| expiry_date | date | YES | - | Expiry date |
| receipt_number | text | YES | - | Receipt number |
| requires_sponsorship | boolean | YES | false | Requires sponsorship |
| current_sponsor | text | YES | - | Current sponsor |
| is_transferable | boolean | YES | true | Is transferable |
| transfer_in_progress | boolean | YES | false | Transfer in progress |
| cap_exempt | boolean | YES | false | Cap exempt |
| lottery_selected | boolean | YES | - | Lottery selected |
| lottery_year | integer | YES | - | Lottery year |
| ead_category | text | YES | - | Ead category |
| ead_card_number | text | YES | - | Ead card number |
| ead_expiry | date | YES | - | Ead expiry |
| i9_completed | boolean | YES | false | I9 completed |
| i9_completed_at | timestamp with time zone | YES | - | I9 completed at |
| i9_expiry_date | date | YES | - | I9 expiry date |
| i9_section_2_completed | boolean | YES | false | I9 section 2 completed |
| i9_document_list | text | YES | - | I9 document list |
| i9_document_details | jsonb | YES | - | I9 document details |
| e_verify_status | text | YES | - | E verify status |
| e_verify_case_number | text | YES | - | E verify case number |
| e_verify_completion_date | date | YES | - | E verify completion date |
| passport_country | text | YES | - | Passport country |
| passport_number_encrypted | text | YES | - | Passport number encrypted |
| passport_issue_date | date | YES | - | Passport issue date |
| passport_expiry_date | date | YES | - | Passport expiry date |
| has_valid_visa_stamp | boolean | YES | false | Has valid visa stamp |
| visa_stamp_expiry | date | YES | - | Visa stamp expiry |
| documents | jsonb | YES | '[]'::jsonb | Documents |
| notes | text | YES | - | Notes |
| is_primary | boolean | YES | false | Is primary |
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
| candidate_work_authorizations_pkey | CREATE UNIQUE INDEX candidate_work_authorizations_pkey ON public.candidate_work_authorizations USING btree (id) |
| idx_work_auth_candidate | CREATE INDEX idx_work_auth_candidate ON public.candidate_work_authorizations USING btree (candidate_id) |
| idx_work_auth_org | CREATE INDEX idx_work_auth_org ON public.candidate_work_authorizations USING btree (org_id) |
| idx_work_auth_country | CREATE INDEX idx_work_auth_country ON public.candidate_work_authorizations USING btree (country_code) |
| idx_work_auth_status | CREATE INDEX idx_work_auth_status ON public.candidate_work_authorizations USING btree (status) |
| idx_work_auth_expiry | CREATE INDEX idx_work_auth_expiry ON public.candidate_work_authorizations USING btree (expiry_date) |
