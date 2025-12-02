# vendor_terms Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `vendor_terms` |
| Schema | `public` |
| Purpose | Defines business terms with vendors including payment terms, markup percentages, rate ranges, contract details, and MSA status |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| vendor_id | uuid | NO | - | Reference to vendor |
| payment_terms_days | integer | YES | 30 | Payment terms in days |
| markup_min_percent | numeric | YES | - | Minimum markup percentage |
| markup_max_percent | numeric | YES | - | Maximum markup percentage |
| preferred_rate_range_min | numeric | YES | - | Minimum preferred rate |
| preferred_rate_range_max | numeric | YES | - | Maximum preferred rate |
| contract_type | text | YES | - | Type of contract |
| contract_expiry | date | YES | - | Contract expiration date |
| msa_on_file | boolean | YES | false | Whether MSA is on file |
| notes | text | YES | - | Additional terms notes |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| updated_at | timestamp with time zone | NO | now() | Last update timestamp |
| created_by | uuid | YES | - | User who created the terms |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| vendor_id | vendors.id | vendor_terms_vendor_id_fkey |
| created_by | user_profiles.id | vendor_terms_created_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| vendor_terms_pkey | CREATE UNIQUE INDEX vendor_terms_pkey ON public.vendor_terms USING btree (id) |
| idx_vendor_terms_vendor_id | CREATE INDEX idx_vendor_terms_vendor_id ON public.vendor_terms USING btree (vendor_id) |
