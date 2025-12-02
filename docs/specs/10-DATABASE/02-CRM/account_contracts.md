# account_contracts Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `account_contracts` |
| Schema | `public` |
| Purpose | Contracts associated with accounts (MSA, SOW, NDA, etc.) |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| account_id | uuid | NO | NULL | Reference to account |
| contract_type | text | NO | NULL | Contract type |
| status | text | NO | `'draft'::text` | Current status |
| name | text | YES | NULL | Name or title |
| start_date | timestamp with time zone | YES | NULL | Start date |
| end_date | timestamp with time zone | YES | NULL | End date |
| signed_date | timestamp with time zone | YES | NULL | Signed date |
| value | numeric | YES | NULL | Value |
| currency | text | YES | `'USD'::text` | Currency |
| terms | jsonb | YES | NULL | Terms |
| payment_terms_days | integer | YES | NULL | Payment terms days |
| document_url | text | YES | NULL | Document url |
| notes | text | YES | NULL | Additional notes |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |
| created_by | uuid | YES | NULL | User who created the record |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| account_id | accounts.id | account_contracts_account_id_fkey |
| created_by | user_profiles.id | account_contracts_created_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| account_contracts_pkey | `CREATE UNIQUE INDEX account_contracts_pkey ON public.account_contracts USING btree (id)` |
| idx_account_contracts_account_id | `CREATE INDEX idx_account_contracts_account_id ON public.account_contracts USING btree (account_id)` |
| idx_account_contracts_type | `CREATE INDEX idx_account_contracts_type ON public.account_contracts USING btree (contract_type)` |
| idx_account_contracts_status | `CREATE INDEX idx_account_contracts_status ON public.account_contracts USING btree (status)` |
