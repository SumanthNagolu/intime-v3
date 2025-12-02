# compliance_requirements Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `compliance_requirements` |
| Schema | `public` |
| Purpose | Compliance requirement definitions |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `org_id` | uuid | NO | - | Organization identifier |
| `name` | text | NO | - | Name |
| `type` | enum | NO | - | Type |
| `jurisdiction` | text | YES | - | Jurisdiction |
| `applies_to` | enum | NO | 'all'::compliance_applies_to | Applies To |
| `frequency` | enum | NO | - | Frequency |
| `description` | text | YES | - | Description |
| `document_template_url` | text | YES | - | Document Template Url |
| `is_active` | boolean | YES | true | Active/inactive flag |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |
| `created_by` | uuid | YES | - | User who created the record |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `created_by` | `user_profiles.id` | Links to user profiles |
| `org_id` | `organizations.id` | Links to organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| `compliance_requirements_pkey` | `CREATE UNIQUE INDEX compliance_requirements_pkey ON public.compliance_requirements USING btree (id)` |
| `idx_compliance_requirements_org_id` | `CREATE INDEX idx_compliance_requirements_org_id ON public.compliance_requirements USING btree (or...` |
| `idx_compliance_requirements_type` | `CREATE INDEX idx_compliance_requirements_type ON public.compliance_requirements USING btree (type)` |
| `idx_compliance_requirements_active` | `CREATE INDEX idx_compliance_requirements_active ON public.compliance_requirements USING btree (is...` |

## Usage Notes

