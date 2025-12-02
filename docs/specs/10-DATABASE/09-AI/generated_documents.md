# generated_documents Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `generated_documents` |
| Schema | `public` |
| Purpose | Tracks AI-generated documents (resumes, cover letters, proposals) created from templates |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for the document |
| org_id | uuid | NO | - | Organization that owns the document |
| template_id | uuid | NO | - | Template used to generate the document |
| entity_type | text | NO | - | Type of entity (candidate, job_order, deal, etc.) |
| entity_id | uuid | NO | - | ID of the entity the document is for |
| file_path | text | NO | - | Storage path to the generated file |
| file_name | text | NO | - | Name of the generated file |
| file_size | integer | NO | - | File size in bytes |
| mime_type | text | NO | - | MIME type of the file (application/pdf, etc.) |
| generated_by | uuid | NO | - | User who generated the document |
| generated_at | timestamp with time zone | NO | now() | When document was generated |
| metadata | jsonb | NO | '{}'::jsonb | Additional context and generation parameters |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| org_id | organizations.id | - |
| template_id | document_templates.id | - |
| generated_by | user_profiles.id | - |

## Indexes

| Index Name | Definition |
|------------|------------|
| generated_documents_pkey | CREATE UNIQUE INDEX generated_documents_pkey ON public.generated_documents USING btree (id) |
| idx_generated_documents_org_id | CREATE INDEX idx_generated_documents_org_id ON public.generated_documents USING btree (org_id) |
| idx_generated_documents_template_id | CREATE INDEX idx_generated_documents_template_id ON public.generated_documents USING btree (template_id) |
| idx_generated_documents_entity | CREATE INDEX idx_generated_documents_entity ON public.generated_documents USING btree (entity_type, entity_id) |
| idx_generated_documents_generated_at | CREATE INDEX idx_generated_documents_generated_at ON public.generated_documents USING btree (generated_at DESC) |

## Usage Notes

- Supports AI-powered document generation across multiple entity types
- Links generated docs to source templates and entities
- File metadata enables storage management
- Entity indexing allows retrieval of all docs for a candidate/job/etc.
