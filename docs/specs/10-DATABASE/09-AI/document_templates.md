# document_templates Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `document_templates` |
| Schema | `public` |
| Purpose | Manages AI-powered document templates for generating resumes, cover letters, proposals, and other business documents |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for the template |
| org_id | uuid | NO | - | Organization that owns the template |
| name | text | NO | - | Template name (unique per org) |
| description | text | YES | - | Description of template purpose and use case |
| template_type | text | NO | - | Type of template (resume, cover_letter, proposal, etc.) |
| category | text | NO | - | Category for organization (technical, sales, executive, etc.) |
| template_content | text | NO | - | Template text with variable placeholders |
| variables | jsonb | NO | '{}'::jsonb | List of variables and their definitions |
| sample_data | jsonb | YES | '{}'::jsonb | Sample data for previewing template |
| is_active | boolean | NO | true | Whether template is currently available for use |
| created_by | uuid | NO | - | User who created the template |
| created_at | timestamp with time zone | NO | now() | When template was created |
| updated_at | timestamp with time zone | NO | now() | Last modification timestamp |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| org_id | organizations.id | - |
| created_by | user_profiles.id | - |

## Indexes

| Index Name | Definition |
|------------|------------|
| document_templates_pkey | CREATE UNIQUE INDEX document_templates_pkey ON public.document_templates USING btree (id) |
| unique_template_name_per_org | CREATE UNIQUE INDEX unique_template_name_per_org ON public.document_templates USING btree (org_id, name) |
| idx_document_templates_org_id | CREATE INDEX idx_document_templates_org_id ON public.document_templates USING btree (org_id) |
| idx_document_templates_category | CREATE INDEX idx_document_templates_category ON public.document_templates USING btree (category) |
| idx_document_templates_type | CREATE INDEX idx_document_templates_type ON public.document_templates USING btree (template_type) |
| idx_document_templates_active | CREATE INDEX idx_document_templates_active ON public.document_templates USING btree (is_active) WHERE (is_active = true) |

## Usage Notes

- Powers AI document generation with customizable templates
- Variables JSONB defines placeholders for dynamic content
- Sample data enables template preview before generation
- Unique constraint ensures no duplicate template names per org
- Soft delete via deleted_at preserves template history
- Partial index on is_active optimizes template selection queries
- Supports multi-tenant template management
