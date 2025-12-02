# vendors Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `vendors` |
| Schema | `public` |
| Purpose | Manages vendor/staffing agency relationships including type, tier, industry focus, geographic coverage, and status tracking |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization identifier |
| name | text | NO | - | Vendor name |
| type | vendor_type | NO | - | Type of vendor (enum) |
| status | text | NO | 'active' | Vendor status (active/inactive) |
| tier | vendor_tier | YES | 'standard' | Vendor tier (preferred/standard/etc.) |
| website | text | YES | - | Vendor website URL |
| industry_focus | text[] | YES | - | Array of industries vendor focuses on |
| geographic_focus | text[] | YES | - | Array of geographic regions |
| notes | text | YES | - | General notes about vendor |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| updated_at | timestamp with time zone | NO | now() | Last update timestamp |
| created_by | uuid | YES | - | User who created the vendor record |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| org_id | organizations.id | vendors_org_id_fkey |
| created_by | user_profiles.id | vendors_created_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| vendors_pkey | CREATE UNIQUE INDEX vendors_pkey ON public.vendors USING btree (id) |
| idx_vendors_org_id | CREATE INDEX idx_vendors_org_id ON public.vendors USING btree (org_id) |
| idx_vendors_status | CREATE INDEX idx_vendors_status ON public.vendors USING btree (status) |
| idx_vendors_tier | CREATE INDEX idx_vendors_tier ON public.vendors USING btree (tier) |
| idx_vendors_org | CREATE INDEX idx_vendors_org ON public.vendors USING btree (org_id) |
