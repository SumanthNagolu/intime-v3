# accounts Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `accounts` |
| Schema | `public` |
| Purpose | Core accounts/clients table for CRM - stores company/client information |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| org_id | uuid | NO | NULL | Organization ID (tenant isolation) |
| name | text | NO | NULL | Name or title |
| industry | text | YES | NULL | Industry classification |
| company_type | text | YES | `'direct_client'::text` | Company type |
| status | text | NO | `'prospect'::text` | Current status |
| tier | text | YES | NULL | Account tier/classification |
| account_manager_id | uuid | YES | NULL | Reference to account manager |
| responsiveness | text | YES | NULL | Responsiveness |
| preferred_quality | text | YES | NULL | Preferred quality |
| description | text | YES | NULL | Detailed description |
| contract_start_date | timestamp with time zone | YES | NULL | Contract start date |
| contract_end_date | timestamp with time zone | YES | NULL | Contract end date |
| payment_terms_days | integer | YES | `30` | Payment terms days |
| markup_percentage | numeric | YES | NULL | Markup percentage |
| annual_revenue_target | numeric | YES | NULL | Annual revenue target |
| website | text | YES | NULL | Website URL |
| headquarters_location | text | YES | NULL | Headquarters location |
| phone | text | YES | NULL | Phone number |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |
| created_by | uuid | YES | NULL | User who created the record |
| updated_by | uuid | YES | NULL | User who last updated the record |
| deleted_at | timestamp with time zone | YES | NULL | Soft delete timestamp (NULL if not deleted) |
| search_vector | tsvector | YES | NULL | Search vector |
| legal_name | text | YES | NULL | Legal name |
| founded_year | integer | YES | NULL | Founded year |
| employee_count | integer | YES | NULL | Employee count |
| annual_revenue | numeric | YES | NULL | Annual revenue |
| health_score | integer | YES | NULL | Health score |
| primary_contact_id | uuid | YES | NULL | Reference to primary contact |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| account_manager_id | user_profiles.id | accounts_account_manager_id_fkey |
| created_by | user_profiles.id | accounts_created_by_fkey |
| org_id | organizations.id | accounts_org_id_fkey |
| updated_by | user_profiles.id | accounts_updated_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| idx_accounts_name | `CREATE INDEX idx_accounts_name ON public.accounts USING btree (name) WHERE (deleted_at IS NULL)` |
| accounts_pkey | `CREATE UNIQUE INDEX accounts_pkey ON public.accounts USING btree (id)` |
| idx_accounts_org | `CREATE INDEX idx_accounts_org ON public.accounts USING btree (org_id) WHERE (deleted_at IS NULL)` |
| idx_accounts_manager | `CREATE INDEX idx_accounts_manager ON public.accounts USING btree (account_manager_id)` |
| idx_accounts_status | `CREATE INDEX idx_accounts_status ON public.accounts USING btree (status) WHERE (deleted_at IS NULL)` |
| idx_accounts_search | `CREATE INDEX idx_accounts_search ON public.accounts USING gin (search_vector)` |
| idx_accounts_org_id | `CREATE INDEX idx_accounts_org_id ON public.accounts USING btree (org_id)` |
| idx_accounts_tier | `CREATE INDEX idx_accounts_tier ON public.accounts USING btree (tier)` |
| idx_accounts_account_manager_id | `CREATE INDEX idx_accounts_account_manager_id ON public.accounts USING btree (account_manager_id)` |
| idx_accounts_health_score | `CREATE INDEX idx_accounts_health_score ON public.accounts USING btree (health_score)` |
