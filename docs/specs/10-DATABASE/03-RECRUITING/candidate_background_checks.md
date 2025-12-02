# candidate_background_checks Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `candidate_background_checks` |
| Schema | `public` |
| Purpose | Records background check information for candidates |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| candidate_id | uuid | NO | - | Foreign key to candidate |
| submission_id | uuid | YES | - | Foreign key to submission |
| placement_id | uuid | YES | - | Foreign key to placement |
| provider | text | YES | - | Provider |
| provider_reference_id | text | YES | - | Foreign key to provider_reference |
| provider_order_id | text | YES | - | Foreign key to provider_order |
| package_name | text | YES | - | Package name |
| package_type | text | YES | - | Package type |
| status | text | NO | 'not_started'::text | Status |
| overall_result | text | YES | - | Overall result |
| requested_at | timestamp with time zone | YES | - | Requested at |
| requested_by | uuid | YES | - | Requested by |
| initiated_at | timestamp with time zone | YES | - | Initiated at |
| estimated_completion | date | YES | - | Estimated completion |
| completed_at | timestamp with time zone | YES | - | Completed at |
| expires_at | timestamp with time zone | YES | - | Expires at |
| valid_for_months | integer | YES | 12 | Valid for months |
| checks | jsonb | YES | '{}'::jsonb | Checks |
| adjudication_status | text | YES | - | Adjudication status |
| adjudication_notes | text | YES | - | Adjudication notes |
| adjudicated_by | uuid | YES | - | Adjudicated by |
| adjudicated_at | timestamp with time zone | YES | - | Adjudicated at |
| adverse_action_required | boolean | YES | false | Adverse action required |
| pre_adverse_sent_at | timestamp with time zone | YES | - | Pre adverse sent at |
| pre_adverse_response_deadline | date | YES | - | Pre adverse response deadline |
| final_adverse_sent_at | timestamp with time zone | YES | - | Final adverse sent at |
| adverse_action_notes | text | YES | - | Adverse action notes |
| consent_form_file_id | uuid | YES | - | Foreign key to consent_form_file |
| consent_signed_at | timestamp with time zone | YES | - | Consent signed at |
| consent_ip_address | text | YES | - | Consent ip address |
| consent_user_agent | text | YES | - | Consent user agent |
| authorization_form_file_id | uuid | YES | - | Foreign key to authorization_form_file |
| report_file_id | uuid | YES | - | Foreign key to report_file |
| report_received_at | timestamp with time zone | YES | - | Report received at |
| cost | numeric | YES | - | Cost |
| cost_currency | text | YES | 'USD'::text | Cost currency |
| billed_to | text | YES | - | Billed to |
| notes | text | YES | - | Notes |
| internal_notes | text | YES | - | Internal notes |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |
| created_by | uuid | YES | - | User who created the record |
| updated_by | uuid | YES | - | Updated by |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| candidate_id | user_profiles.id | User profiles |
| org_id | organizations.id | Organizations |
| placement_id | placements.id | Placements |
| submission_id | submissions.id | Submissions |

## Indexes

| Index Name | Definition |
|------------|------------|
| candidate_background_checks_pkey | CREATE UNIQUE INDEX candidate_background_checks_pkey ON public.candidate_background_checks USING btree (id) |
| idx_bgc_candidate | CREATE INDEX idx_bgc_candidate ON public.candidate_background_checks USING btree (candidate_id) |
| idx_bgc_org | CREATE INDEX idx_bgc_org ON public.candidate_background_checks USING btree (org_id) |
