# content_assets Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `content_assets` |
| Schema | `public` |
| Purpose | Media and file assets used in course content |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| filename | text | NO | - | Filename |
| storage_path | text | NO | - | Storage Path |
| file_type | text | NO | - | File Type |
| mime_type | text | NO | - | Mime Type |
| file_size_bytes | bigint | NO | - | File Size Bytes |
| topic_id | uuid | YES | - | Reference to module topic |
| lesson_id | uuid | YES | - | Foreign key reference to lesson |
| cdn_url | text | YES | - | URL for cdn |
| is_public | boolean | YES | false | Boolean flag: public |
| replaced_by | uuid | YES | - | Replaced By |
| is_current | boolean | YES | true | Boolean flag: current |
| uploaded_by | uuid | YES | - | Uploaded By |
| uploaded_at | timestamp with time zone | YES | now() | Timestamp for uploaded |
| searchable_content | text | YES | - | Searchable Content |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| lesson_id | topic_lessons.id | content_assets_lesson_id_fkey |
| replaced_by | content_assets.id | content_assets_replaced_by_fkey |
| topic_id | module_topics.id | content_assets_topic_id_fkey |
| uploaded_by | user_profiles.id | content_assets_uploaded_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| content_assets_pkey | `CREATE UNIQUE INDEX content_assets_pkey ON public.content_assets USING btree (id)` |
| content_assets_storage_path_key | `CREATE UNIQUE INDEX content_assets_storage_path_key ON public.content_assets USING btree (storage_path)` |
| idx_content_assets_topic | `CREATE INDEX idx_content_assets_topic ON public.content_assets USING btree (topic_id)` |
| idx_content_assets_lesson | `CREATE INDEX idx_content_assets_lesson ON public.content_assets USING btree (lesson_id)` |
| idx_content_assets_file_type | `CREATE INDEX idx_content_assets_file_type ON public.content_assets USING btree (file_type)` |
| idx_content_assets_storage_path | `CREATE INDEX idx_content_assets_storage_path ON public.content_assets USING btree (storage_path)` |
| idx_content_assets_uploaded_by | `CREATE INDEX idx_content_assets_uploaded_by ON public.content_assets USING btree (uploaded_by)` |
| idx_content_assets_is_current | `CREATE INDEX idx_content_assets_is_current ON public.content_assets USING btree (is_current) WHERE (is_current = true)` |
| idx_content_assets_search | `CREATE INDEX idx_content_assets_search ON public.content_assets USING gin (to_tsvector('english'::regconfig, COALESCE(searchable_content, ''::text)))` |
