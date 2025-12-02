# leads Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `leads` |
| Schema | `public` |
| Purpose | Sales leads (companies and individuals) in the pipeline |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| org_id | uuid | NO | NULL | Organization ID (tenant isolation) |
| lead_type | text | NO | `'company'::text` | Lead type |
| company_name | text | YES | NULL | Company name |
| industry | text | YES | NULL | Industry classification |
| company_size | text | YES | NULL | Company size |
| first_name | text | YES | NULL | First name |
| last_name | text | YES | NULL | Last name |
| title | text | YES | NULL | Title |
| email | text | YES | NULL | Email address |
| phone | text | YES | NULL | Phone number |
| linkedin_url | text | YES | NULL | Linkedin url |
| status | text | NO | `'new'::text` | Current status |
| estimated_value | numeric | YES | NULL | Estimated value |
| source | text | YES | NULL | Source |
| source_campaign_id | uuid | YES | NULL | Reference to source campaign |
| owner_id | uuid | YES | NULL | Reference to owner |
| last_contacted_at | timestamp with time zone | YES | NULL | Last contacted at |
| last_response_at | timestamp with time zone | YES | NULL | Last response at |
| engagement_score | integer | YES | NULL | Engagement score |
| converted_to_deal_id | uuid | YES | NULL | Reference to converted to deal |
| converted_to_account_id | uuid | YES | NULL | Reference to converted to account |
| converted_at | timestamp with time zone | YES | NULL | Converted at |
| lost_reason | text | YES | NULL | Lost reason |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |
| created_by | uuid | YES | NULL | User who created the record |
| deleted_at | timestamp with time zone | YES | NULL | Soft delete timestamp (NULL if not deleted) |
| company_type | text | YES | NULL | Company type |
| website | text | YES | NULL | Website URL |
| headquarters | text | YES | NULL | Headquarters |
| tier | text | YES | NULL | Account tier/classification |
| company_description | text | YES | NULL | Company description |
| decision_authority | text | YES | NULL | Decision authority |
| preferred_contact_method | text | YES | `'email'::text` | Preferred contact method |
| account_id | uuid | YES | NULL | Reference to account |
| notes | text | YES | NULL | Additional notes |
| search_vector | tsvector | YES | NULL | Search vector |
| bant_budget | integer | YES | `0` | Bant budget |
| bant_authority | integer | YES | `0` | Bant authority |
| bant_need | integer | YES | `0` | Bant need |
| bant_timeline | integer | YES | `0` | Bant timeline |
| bant_budget_notes | text | YES | NULL | Bant budget notes |
| bant_authority_notes | text | YES | NULL | Bant authority notes |
| bant_need_notes | text | YES | NULL | Bant need notes |
| bant_timeline_notes | text | YES | NULL | Bant timeline notes |
| bant_total_score | integer | YES | NULL | Bant total score |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| converted_to_deal_id | deals.id | fk_leads_converted_to_deal |
| account_id | accounts.id | leads_account_id_fkey |
| converted_to_account_id | accounts.id | leads_converted_to_account_id_fkey |
| created_by | user_profiles.id | leads_created_by_fkey |
| org_id | organizations.id | leads_org_id_fkey |
| owner_id | user_profiles.id | leads_owner_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| leads_pkey | `CREATE UNIQUE INDEX leads_pkey ON public.leads USING btree (id)` |
| idx_leads_org | `CREATE INDEX idx_leads_org ON public.leads USING btree (org_id) WHERE (deleted_at IS NULL)` |
| idx_leads_status | `CREATE INDEX idx_leads_status ON public.leads USING btree (status) WHERE (deleted_at IS NULL)` |
| idx_leads_owner | `CREATE INDEX idx_leads_owner ON public.leads USING btree (owner_id)` |
| idx_leads_source | `CREATE INDEX idx_leads_source ON public.leads USING btree (source_campaign_id)` |
| idx_leads_email | `CREATE INDEX idx_leads_email ON public.leads USING btree (email)` |
| idx_leads_account_id | `CREATE INDEX idx_leads_account_id ON public.leads USING btree (account_id)` |
| idx_leads_bant_total | `CREATE INDEX idx_leads_bant_total ON public.leads USING btree (bant_total_score)` |
| idx_leads_org_id | `CREATE INDEX idx_leads_org_id ON public.leads USING btree (org_id)` |
| idx_leads_owner_id | `CREATE INDEX idx_leads_owner_id ON public.leads USING btree (owner_id)` |
