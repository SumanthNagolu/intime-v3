# crm_campaign_content Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `crm_campaign_content` |
| Schema | `public` |
| Purpose | Email templates, landing pages, and assets for campaigns |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| campaign_id | uuid | NO | NULL | Reference to campaign |
| content_type | text | NO | NULL | Content type |
| name | text | YES | NULL | Name or title |
| subject | text | YES | NULL | Subject |
| body | text | YES | NULL | Body |
| html_body | text | YES | NULL | Html body |
| asset_url | text | YES | NULL | Asset url |
| thumbnail_url | text | YES | NULL | Thumbnail url |
| version | integer | YES | `1` | Version |
| is_active | boolean | YES | `true` | Whether this record is active |
| variant | text | YES | NULL | Variant |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |
| created_by | uuid | YES | NULL | User who created the record |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| campaign_id | crm_campaigns.id | crm_campaign_content_campaign_id_fkey |
| created_by | user_profiles.id | crm_campaign_content_created_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| crm_campaign_content_pkey | `CREATE UNIQUE INDEX crm_campaign_content_pkey ON public.crm_campaign_content USING btree (id)` |
| idx_crm_campaign_content_campaign_id | `CREATE INDEX idx_crm_campaign_content_campaign_id ON public.crm_campaign_content USING btree (campaign_id)` |
| idx_crm_campaign_content_type | `CREATE INDEX idx_crm_campaign_content_type ON public.crm_campaign_content USING btree (content_type)` |
| idx_crm_campaign_content_variant | `CREATE INDEX idx_crm_campaign_content_variant ON public.crm_campaign_content USING btree (variant)` |
