# offer_negotiations Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `offer_negotiations` |
| Schema | `public` |
| Purpose | Negotiation history and counter-offers |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| offer_id | uuid | NO | - | Foreign key to offer |
| requested_by | text | NO | - | Requested by |
| requested_changes | text | YES | - | Requested changes |
| status | text | NO | 'pending'::text | Status |
| notes | text | YES | - | Notes |
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
| offer_negotiations_pkey | CREATE UNIQUE INDEX offer_negotiations_pkey ON public.offer_negotiations USING btree (id) |
| idx_offer_negotiations_offer_id | CREATE INDEX idx_offer_negotiations_offer_id ON public.offer_negotiations USING btree (offer_id) |
