# offer_terms Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `offer_terms` |
| Schema | `public` |
| Purpose | Detailed terms and conditions of job offers |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| offer_id | uuid | NO | - | Foreign key to offer |
| term_type | text | NO | - | Term type |
| value | text | YES | - | Value |
| description | text | YES | - | Description |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| offer_id | offers.id | Offers |
| org_id | organizations.id | Organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| offer_terms_pkey | CREATE UNIQUE INDEX offer_terms_pkey ON public.offer_terms USING btree (id) |
| idx_offer_terms_offer_id | CREATE INDEX idx_offer_terms_offer_id ON public.offer_terms USING btree (offer_id) |
