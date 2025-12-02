# vendor_contacts Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `vendor_contacts` |
| Schema | `public` |
| Purpose | Stores contact information for vendor representatives including primary contact designation and department information |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| vendor_id | uuid | NO | - | Reference to vendor |
| name | text | NO | - | Contact person name |
| title | text | YES | - | Contact person title/role |
| email | text | YES | - | Contact email address |
| phone | text | YES | - | Contact phone number |
| is_primary | boolean | YES | false | Whether this is the primary contact |
| department | text | YES | - | Contact's department |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| updated_at | timestamp with time zone | NO | now() | Last update timestamp |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| vendor_id | vendors.id | vendor_contacts_vendor_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| vendor_contacts_pkey | CREATE UNIQUE INDEX vendor_contacts_pkey ON public.vendor_contacts USING btree (id) |
| idx_vendor_contacts_vendor_id | CREATE INDEX idx_vendor_contacts_vendor_id ON public.vendor_contacts USING btree (vendor_id) |
