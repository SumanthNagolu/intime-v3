# quiz_questions Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `quiz_questions` |
| Schema | `public` |
| Purpose | Question bank for quizzes and assessments |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| topic_id | uuid | YES | - | Reference to module topic |
| created_by | uuid | NO | - | User who created this record |
| question_text | text | NO | - | Question Text |
| question_type | text | NO | - | Question Type |
| options | jsonb | NO | - | Options |
| correct_answers | jsonb | NO | - | Correct Answers |
| explanation | text | YES | - | Explanation |
| difficulty | text | NO | 'medium'::text | Difficulty |
| points | integer | NO | 1 | Points |
| code_language | text | YES | - | Code Language |
| is_public | boolean | NO | false | Boolean flag: public |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| created_by | user_profiles.id | quiz_questions_created_by_fkey |
| topic_id | module_topics.id | quiz_questions_topic_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| idx_quiz_questions_public | `CREATE INDEX idx_quiz_questions_public ON public.quiz_questions USING btree (is_public) WHERE (is_public = true)` |
| idx_quiz_questions_created_by | `CREATE INDEX idx_quiz_questions_created_by ON public.quiz_questions USING btree (created_by)` |
| idx_quiz_questions_text_search | `CREATE INDEX idx_quiz_questions_text_search ON public.quiz_questions USING gin (to_tsvector('english'::regconfig, question_text))` |
| quiz_questions_pkey | `CREATE UNIQUE INDEX quiz_questions_pkey ON public.quiz_questions USING btree (id)` |
| idx_quiz_questions_topic | `CREATE INDEX idx_quiz_questions_topic ON public.quiz_questions USING btree (topic_id)` |
| idx_quiz_questions_type | `CREATE INDEX idx_quiz_questions_type ON public.quiz_questions USING btree (question_type)` |
| idx_quiz_questions_difficulty | `CREATE INDEX idx_quiz_questions_difficulty ON public.quiz_questions USING btree (difficulty)` |
