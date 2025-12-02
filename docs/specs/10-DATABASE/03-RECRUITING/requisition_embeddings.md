# requisition_embeddings Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `requisition_embeddings` |
| Schema | `public` |
| Purpose | Vector embeddings for AI-powered job matching |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| requisition_id | uuid | NO | - | Foreign key to requisition |
| embedding | USER-DEFINED | YES | - | Embedding |
| description | text | NO | - | Description |
| required_skills | ARRAY | YES | - | Required skills |
| nice_to_have_skills | ARRAY | YES | - | Nice to have skills |
| experience_level | text | YES | - | Experience level |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| org_id | organizations.id | Organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| requisition_embeddings_pkey | CREATE UNIQUE INDEX requisition_embeddings_pkey ON public.requisition_embeddings USING btree (id) |
| requisition_embeddings_org_id_requisition_id_key | CREATE UNIQUE INDEX requisition_embeddings_org_id_requisition_id_key ON public.requisition_embeddings USING btree (org_id, requisition_id) |
| idx_requisition_embeddings_vector | CREATE INDEX idx_requisition_embeddings_vector ON public.requisition_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists='100') |
| idx_requisition_embeddings_org | CREATE INDEX idx_requisition_embeddings_org ON public.requisition_embeddings USING btree (org_id) |
| idx_requisition_embeddings_skills | CREATE INDEX idx_requisition_embeddings_skills ON public.requisition_embeddings USING gin (required_skills) |
| idx_requisition_embeddings_experience | CREATE INDEX idx_requisition_embeddings_experience ON public.requisition_embeddings USING btree (experience_level) |
