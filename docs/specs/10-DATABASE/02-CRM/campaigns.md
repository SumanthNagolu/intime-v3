# campaigns Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `campaigns` |
| Schema | `public` |
| Purpose | TA/HR campaigns (recruitment/talent acquisition) |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| org_id | uuid | NO | NULL | Organization ID (tenant isolation) |
| name | text | NO | NULL | Name or title |
| description | text | YES | NULL | Detailed description |
| campaign_type | text | NO | `'talent_sourcing'::text` | Campaign type |
| channel | text | NO | `'email'::text` | Channel |
| status | text | NO | `'draft'::text` | Current status |
| target_audience | text | YES | NULL | Target audience |
| target_locations | ARRAY | YES | NULL | Target locations |
| target_skills | ARRAY | YES | NULL | Target skills |
| target_company_sizes | ARRAY | YES | NULL | Target company sizes |
| is_ab_test | boolean | YES | `false` | Is ab test |
| variant_a_template_id | uuid | YES | NULL | Reference to variant a template |
| variant_b_template_id | uuid | YES | NULL | Reference to variant b template |
| ab_split_percentage | integer | YES | `50` | Ab split percentage |
| target_contacts_count | integer | YES | NULL | Target contacts count |
| target_response_rate | numeric | YES | NULL | Target response rate |
| target_conversion_count | integer | YES | NULL | Target conversion count |
| contacts_reached | integer | YES | `0` | Contacts reached |
| emails_sent | integer | YES | `0` | Emails sent |
| linkedin_messages_sent | integer | YES | `0` | Linkedin messages sent |
| responses_received | integer | YES | `0` | Responses received |
| conversions | integer | YES | `0` | Conversions |
| response_rate | numeric | YES | NULL | Response rate |
| start_date | date | YES | NULL | Start date |
| end_date | date | YES | NULL | End date |
| owner_id | uuid | NO | NULL | Reference to owner |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |
| created_by | uuid | YES | NULL | User who created the record |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| created_by | user_profiles.id | campaigns_created_by_fkey |
| org_id | organizations.id | campaigns_org_id_fkey |
| owner_id | user_profiles.id | campaigns_owner_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| campaigns_pkey | `CREATE UNIQUE INDEX campaigns_pkey ON public.campaigns USING btree (id)` |
| idx_campaigns_org | `CREATE INDEX idx_campaigns_org ON public.campaigns USING btree (org_id)` |
| idx_campaigns_status | `CREATE INDEX idx_campaigns_status ON public.campaigns USING btree (status)` |
| idx_campaigns_owner | `CREATE INDEX idx_campaigns_owner ON public.campaigns USING btree (owner_id)` |
| idx_campaigns_dates | `CREATE INDEX idx_campaigns_dates ON public.campaigns USING btree (start_date, end_date)` |
