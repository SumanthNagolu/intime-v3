# vendor_blacklist Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `vendor_blacklist` |
| Schema | `public` |
| Purpose | Tracks blacklisted vendors with reasons and review dates for compliance and risk management |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| vendor_id | uuid | NO | - | Reference to vendor |
| reason | text | NO | - | Reason for blacklisting |
| review_date | date | YES | - | Date to review blacklist status |
| blacklisted_at | timestamp with time zone | NO | now() | When vendor was blacklisted |
| blacklisted_by | uuid | YES | - | User who blacklisted the vendor |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| vendor_id | vendors.id | vendor_blacklist_vendor_id_fkey |
| blacklisted_by | user_profiles.id | vendor_blacklist_blacklisted_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| vendor_blacklist_pkey | CREATE UNIQUE INDEX vendor_blacklist_pkey ON public.vendor_blacklist USING btree (id) |
| idx_vendor_blacklist_vendor_id | CREATE INDEX idx_vendor_blacklist_vendor_id ON public.vendor_blacklist USING btree (vendor_id) |
