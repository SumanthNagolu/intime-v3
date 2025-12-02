# candidate_references Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `candidate_references` |
| Schema | `public` |
| Purpose | Professional references provided by candidates |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| candidate_id | uuid | NO | - | Foreign key to candidate |
| reference_name | text | NO | - | Reference name |
| reference_title | text | YES | - | Reference title |
| reference_company | text | YES | - | Reference company |
| relationship_type | text | YES | - | Relationship type |
| relationship_description | text | YES | - | Relationship description |
| years_known | integer | YES | - | Years known |
| worked_together_from | date | YES | - | Worked together from |
| worked_together_to | date | YES | - | Worked together to |
| email | text | YES | - | Email |
| phone | text | YES | - | Phone |
| linkedin_url | text | YES | - | Linkedin url |
| preferred_contact_method | text | YES | - | Preferred contact method |
| best_time_to_contact | text | YES | - | Best time to contact |
| status | text | YES | 'pending'::text | Status |
| contact_attempts | integer | YES | 0 | Contact attempts |
| last_contact_attempt | timestamp with time zone | YES | - | Last contact attempt |
| contacted_at | timestamp with time zone | YES | - | Contacted at |
| contacted_by | uuid | YES | - | Contacted by |
| completed_at | timestamp with time zone | YES | - | Completed at |
| rating | integer | YES | - | Rating |
| overall_impression | text | YES | - | Overall impression |
| would_rehire | boolean | YES | - | Would rehire |
| would_work_with_again | boolean | YES | - | Would work with again |
| feedback_summary | text | YES | - | Feedback summary |
| strengths | ARRAY | YES | - | Strengths |
| areas_for_improvement | ARRAY | YES | - | Areas for improvement |
| questionnaire_responses | jsonb | YES | - | Questionnaire responses |
| verification_notes | text | YES | - | Verification notes |
| internal_notes | text | YES | - | Internal notes |
| reference_consent_given | boolean | YES | false | Reference consent given |
| consent_date | timestamp with time zone | YES | - | Consent date |
| display_order | integer | YES | 0 | Display order |
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
| candidate_references_pkey | CREATE UNIQUE INDEX candidate_references_pkey ON public.candidate_references USING btree (id) |
| idx_references_candidate | CREATE INDEX idx_references_candidate ON public.candidate_references USING btree (candidate_id) |
| idx_references_org | CREATE INDEX idx_references_org ON public.candidate_references USING btree (org_id) |
