# candidate_embeddings Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `candidate_embeddings` |
| Schema | `public` |
| Purpose | Vector embeddings for AI-powered candidate matching |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| candidate_id | uuid | NO | - | Foreign key to candidate |
| embedding | USER-DEFINED | YES | - | Embedding |
| resume_text | text | NO | - | Resume text |
| skills | ARRAY | YES | - | Skills |
| experience_level | text | YES | - | Experience level |
| availability | text | YES | - | Availability |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| org_id | organizations.id | Organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| candidate_embeddings_pkey | CREATE UNIQUE INDEX candidate_embeddings_pkey ON public.candidate_embeddings USING btree (id) |
| candidate_embeddings_org_id_candidate_id_key | CREATE UNIQUE INDEX candidate_embeddings_org_id_candidate_id_key ON public.candidate_embeddings USING btree (org_id, candidate_id) |
| idx_candidate_embeddings_vector | CREATE INDEX idx_candidate_embeddings_vector ON public.candidate_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists='100') |
| idx_candidate_embeddings_org | CREATE INDEX idx_candidate_embeddings_org ON public.candidate_embeddings USING btree (org_id) |
| idx_candidate_embeddings_skills | CREATE INDEX idx_candidate_embeddings_skills ON public.candidate_embeddings USING gin (skills) |
| idx_candidate_embeddings_experience | CREATE INDEX idx_candidate_embeddings_experience ON public.candidate_embeddings USING btree (experience_level) |
| idx_candidate_embeddings_availability | CREATE INDEX idx_candidate_embeddings_availability ON public.candidate_embeddings USING btree (availability) |
