# certificate_templates Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `certificate_templates` |
| Schema | `public` |
| Purpose | Templates for generating certificates with branding and layout |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| name | text | NO | - | Display name |
| design_template | text | NO | - | Design Template |
| fields | jsonb | YES | - | Fields |
| is_active | boolean | YES | true | Whether record is active |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |

## Foreign Keys

No foreign key constraints defined.

## Indexes

| Index Name | Definition |
|------------|------------|
| certificate_templates_pkey | `CREATE UNIQUE INDEX certificate_templates_pkey ON public.certificate_templates USING btree (id)` |
| idx_certificate_templates_active | `CREATE INDEX idx_certificate_templates_active ON public.certificate_templates USING btree (is_active)` |
