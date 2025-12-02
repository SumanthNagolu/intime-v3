# account_addresses Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `account_addresses` |
| Schema | `public` |
| Purpose | Physical addresses for accounts (HQ, billing, office, shipping) |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| account_id | uuid | NO | NULL | Reference to account |
| address_type | text | NO | `'office'::text` | Address type |
| street | text | YES | NULL | Street |
| street2 | text | YES | NULL | Street2 |
| city | text | YES | NULL | City |
| state | text | YES | NULL | State |
| country | text | YES | `'USA'::text` | Country |
| postal_code | text | YES | NULL | Postal code |
| is_primary | boolean | YES | `false` | Whether this is the primary record |
| is_active | boolean | YES | `true` | Whether this record is active |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| account_id | accounts.id | account_addresses_account_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| account_addresses_pkey | `CREATE UNIQUE INDEX account_addresses_pkey ON public.account_addresses USING btree (id)` |
| idx_account_addresses_account_id | `CREATE INDEX idx_account_addresses_account_id ON public.account_addresses USING btree (account_id)` |
| idx_account_addresses_type | `CREATE INDEX idx_account_addresses_type ON public.account_addresses USING btree (address_type)` |
