# topic_lessons Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `topic_lessons` |
| Schema | `public` |
| Purpose | Lesson content and materials for each topic |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| topic_id | uuid | NO | - | Reference to module topic |
| title | text | NO | - | Display title |
| lesson_number | integer | NO | - | Lesson Number |
| content_type | text | NO | - | Content Type |
| content_url | text | YES | - | URL for content |
| content_markdown | text | YES | - | Content Markdown |
| duration_seconds | integer | YES | - | Duration Seconds |
| lab_environment_template | text | YES | - | Lab Environment Template |
| lab_instructions_url | text | YES | - | URL for lab instructions |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| topic_id | module_topics.id | topic_lessons_topic_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| topic_lessons_pkey | `CREATE UNIQUE INDEX topic_lessons_pkey ON public.topic_lessons USING btree (id)` |
| unique_topic_lesson_number | `CREATE UNIQUE INDEX unique_topic_lesson_number ON public.topic_lessons USING btree (topic_id, lesson_number)` |
| idx_topic_lessons_topic_id | `CREATE INDEX idx_topic_lessons_topic_id ON public.topic_lessons USING btree (topic_id)` |
| idx_topic_lessons_type | `CREATE INDEX idx_topic_lessons_type ON public.topic_lessons USING btree (content_type)` |
