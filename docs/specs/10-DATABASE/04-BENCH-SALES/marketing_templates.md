# marketing_templates Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `marketing_templates` |
| Schema | `public` |
| Purpose | Organization-level templates for marketing materials with placeholder support for personalization |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization identifier |
| name | text | NO | - | Template name |
| format_type | text | NO | - | Type of format this template is for |
| template_content | text | NO | - | Template content with placeholders |
| placeholders | jsonb | YES | - | JSON object defining available placeholders |
| is_active | boolean | YES | true | Whether template is active |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| updated_at | timestamp with time zone | NO | now() | Last update timestamp |
| created_by | uuid | YES | - | User who created the template |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| org_id | organizations.id | marketing_templates_org_id_fkey |
| created_by | user_profiles.id | marketing_templates_created_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| marketing_templates_pkey | CREATE UNIQUE INDEX marketing_templates_pkey ON public.marketing_templates USING btree (id) |
| idx_marketing_templates_org_id | CREATE INDEX idx_marketing_templates_org_id ON public.marketing_templates USING btree (org_id) |
