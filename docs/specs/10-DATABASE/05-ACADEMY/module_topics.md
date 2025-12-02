# module_topics Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `module_topics` |
| Schema | `public` |
| Purpose | Individual topics or lessons within course modules |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| module_id | uuid | NO | - | Reference to course module |
| slug | text | NO | - | URL-friendly unique identifier |
| title | text | NO | - | Display title |
| description | text | YES | - | Detailed description |
| topic_number | integer | NO | - | Topic Number |
| estimated_duration_minutes | integer | YES | - | Estimated Duration Minutes |
| content_type | text | NO | - | Content Type |
| prerequisite_topic_ids | ARRAY | YES | - | Prerequisite Topic Ids |
| is_published | boolean | YES | false | Whether content is published and visible |
| is_required | boolean | YES | true | Boolean flag: required |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| module_id | course_modules.id | module_topics_module_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| module_topics_pkey | `CREATE UNIQUE INDEX module_topics_pkey ON public.module_topics USING btree (id)` |
| unique_module_topic_number | `CREATE UNIQUE INDEX unique_module_topic_number ON public.module_topics USING btree (module_id, topic_number)` |
| unique_module_topic_slug | `CREATE UNIQUE INDEX unique_module_topic_slug ON public.module_topics USING btree (module_id, slug)` |
| idx_module_topics_module_id | `CREATE INDEX idx_module_topics_module_id ON public.module_topics USING btree (module_id)` |
| idx_module_topics_number | `CREATE INDEX idx_module_topics_number ON public.module_topics USING btree (module_id, topic_number)` |
| idx_module_topics_required | `CREATE INDEX idx_module_topics_required ON public.module_topics USING btree (is_required) WHERE (is_required = true)` |
