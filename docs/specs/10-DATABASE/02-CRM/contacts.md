# contacts Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `contacts` |
| Schema | `public` |
| Purpose | Universal contacts table for CRM (client POCs, vendors, partners) |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| org_id | uuid | NO | NULL | Organization ID (tenant isolation) |
| contact_type | text | NO | `'general'::text` | Contact type |
| first_name | text | YES | NULL | First name |
| last_name | text | YES | NULL | Last name |
| email | text | YES | NULL | Email address |
| phone | text | YES | NULL | Phone number |
| mobile | text | YES | NULL | Mobile |
| linkedin_url | text | YES | NULL | Linkedin url |
| avatar_url | text | YES | NULL | Avatar url |
| title | text | YES | NULL | Title |
| company_name | text | YES | NULL | Company name |
| company_id | uuid | YES | NULL | Reference to company |
| department | text | YES | NULL | Department |
| work_location | text | YES | NULL | Work location |
| timezone | text | YES | `'America/New_York'::text` | Timezone |
| preferred_contact_method | text | YES | `'email'::text` | Preferred contact method |
| best_time_to_contact | text | YES | NULL | Best time to contact |
| do_not_call_before | text | YES | NULL | Do not call before |
| do_not_call_after | text | YES | NULL | Do not call after |
| status | text | NO | `'active'::text` | Current status |
| source | text | YES | NULL | Source |
| source_detail | text | YES | NULL | Source detail |
| source_campaign_id | uuid | YES | NULL | Reference to source campaign |
| user_profile_id | uuid | YES | NULL | Reference to user profile |
| last_contacted_at | timestamp with time zone | YES | NULL | Last contacted at |
| last_response_at | timestamp with time zone | YES | NULL | Last response at |
| total_interactions | integer | YES | `0` | Total interactions |
| engagement_score | integer | YES | `0` | Engagement score |
| twitter_url | text | YES | NULL | Twitter url |
| github_url | text | YES | NULL | Github url |
| decision_authority | text | YES | NULL | Decision authority |
| buying_role | text | YES | NULL | Buying role |
| influence_level | text | YES | NULL | Influence level |
| tags | ARRAY | YES | NULL | Tags |
| notes | text | YES | NULL | Additional notes |
| internal_notes | text | YES | NULL | Internal notes |
| owner_id | uuid | YES | NULL | Reference to owner |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |
| created_by | uuid | YES | NULL | User who created the record |
| updated_by | uuid | YES | NULL | User who last updated the record |
| deleted_at | timestamp with time zone | YES | NULL | Soft delete timestamp (NULL if not deleted) |
| search_vector | tsvector | YES | NULL | Search vector |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| company_id | accounts.id | contacts_company_id_fkey |
| created_by | user_profiles.id | contacts_created_by_fkey |
| org_id | organizations.id | contacts_org_id_fkey |
| owner_id | user_profiles.id | contacts_owner_id_fkey |
| updated_by | user_profiles.id | contacts_updated_by_fkey |
| user_profile_id | user_profiles.id | contacts_user_profile_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| contacts_pkey | `CREATE UNIQUE INDEX contacts_pkey ON public.contacts USING btree (id)` |
| idx_contacts_org_id | `CREATE INDEX idx_contacts_org_id ON public.contacts USING btree (org_id)` |
| idx_contacts_email | `CREATE INDEX idx_contacts_email ON public.contacts USING btree (email)` |
| idx_contacts_company_id | `CREATE INDEX idx_contacts_company_id ON public.contacts USING btree (company_id)` |
| idx_contacts_owner_id | `CREATE INDEX idx_contacts_owner_id ON public.contacts USING btree (owner_id)` |
| idx_contacts_status | `CREATE INDEX idx_contacts_status ON public.contacts USING btree (status)` |
| idx_contacts_contact_type | `CREATE INDEX idx_contacts_contact_type ON public.contacts USING btree (contact_type)` |
| idx_contacts_engagement | `CREATE INDEX idx_contacts_engagement ON public.contacts USING btree (engagement_score)` |
| idx_contacts_search | `CREATE INDEX idx_contacts_search ON public.contacts USING gin (search_vector)` |
