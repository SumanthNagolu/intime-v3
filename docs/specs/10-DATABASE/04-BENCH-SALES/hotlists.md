# hotlists Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `hotlists` |
| Schema | `public` |
| Purpose | Manages curated lists of consultants for marketing purposes, can be created for specific clients or general distribution |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization identifier |
| name | text | NO | - | Name of the hotlist |
| description | text | YES | - | Description of the hotlist purpose |
| purpose | text | NO | - | Purpose/goal of this hotlist |
| client_id | uuid | YES | - | Optional: specific client this list is for |
| status | text | NO | 'active' | Hotlist status (active/archived) |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| updated_at | timestamp with time zone | NO | now() | Last update timestamp |
| created_by | uuid | YES | - | User who created the hotlist |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| org_id | organizations.id | hotlists_org_id_fkey |
| client_id | accounts.id | hotlists_client_id_fkey |
| created_by | user_profiles.id | hotlists_created_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| hotlists_pkey | CREATE UNIQUE INDEX hotlists_pkey ON public.hotlists USING btree (id) |
| idx_hotlists_org_id | CREATE INDEX idx_hotlists_org_id ON public.hotlists USING btree (org_id) |
| idx_hotlists_client_id | CREATE INDEX idx_hotlists_client_id ON public.hotlists USING btree (client_id) |
| idx_hotlists_org | CREATE INDEX idx_hotlists_org ON public.hotlists USING btree (org_id) |
