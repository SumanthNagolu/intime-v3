# ai_embeddings Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `ai_embeddings` |
| Schema | `public` |
| Purpose | Stores vector embeddings for semantic search and similarity matching across platform content |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | text | NO | - | Primary key, unique identifier for the embedded content |
| content | text | NO | - | Original text content that was embedded |
| embedding | vector | NO | - | Vector embedding representation of the content |
| metadata | jsonb | NO | '{}'::jsonb | Additional context about the embedded content (source, type, etc.) |
| created_at | timestamp with time zone | NO | now() | Timestamp when the embedding was created |

## Foreign Keys

None

## Indexes

| Index Name | Definition |
|------------|------------|
| ai_embeddings_pkey | CREATE UNIQUE INDEX ai_embeddings_pkey ON public.ai_embeddings USING btree (id) |
| idx_ai_embeddings_vector | CREATE INDEX idx_ai_embeddings_vector ON public.ai_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists='100') |
| idx_ai_embeddings_metadata | CREATE INDEX idx_ai_embeddings_metadata ON public.ai_embeddings USING gin (metadata) |

## Usage Notes

- Uses pgvector extension for efficient vector similarity search
- IVFFlat index enables fast approximate nearest neighbor search
- Supports semantic search across courses, documents, and knowledge base
- Metadata GIN index allows filtering embeddings by source type or category
- Vector data type requires pgvector extension to be enabled
