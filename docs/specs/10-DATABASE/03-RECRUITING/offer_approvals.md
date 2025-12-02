# offer_approvals Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `offer_approvals` |
| Schema | `public` |
| Purpose | Approval workflow for job offers |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| offer_id | uuid | NO | - | Foreign key to offer |
| approver_id | uuid | NO | - | Foreign key to approver |
| status | text | NO | 'pending'::text | Status |
| notes | text | YES | - | Notes |
| decided_at | timestamp with time zone | YES | - | Decided at |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| approver_id | user_profiles.id | User profiles |
| offer_id | offers.id | Offers |
| org_id | organizations.id | Organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| offer_approvals_pkey | CREATE UNIQUE INDEX offer_approvals_pkey ON public.offer_approvals USING btree (id) |
| idx_offer_approvals_offer_id | CREATE INDEX idx_offer_approvals_offer_id ON public.offer_approvals USING btree (offer_id) |
| idx_offer_approvals_approver_id | CREATE INDEX idx_offer_approvals_approver_id ON public.offer_approvals USING btree (approver_id) |
