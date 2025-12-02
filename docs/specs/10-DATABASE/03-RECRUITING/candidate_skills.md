# candidate_skills Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `candidate_skills` |
| Schema | `public` |
| Purpose | Skills possessed by candidates with proficiency levels |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| candidate_id | uuid | NO | - | Foreign key to candidate |
| skill_id | uuid | NO | - | Foreign key to skill |
| proficiency_level | text | YES | 'intermediate'::text | Proficiency level |
| years_of_experience | numeric | YES | - | Years of experience |
| is_certified | boolean | YES | false | Is certified |
| certification_name | text | YES | - | Certification name |
| last_used_date | date | YES | - | Last used date |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| skill_name | text | YES | - | Skill name |
| certification_expiry | date | YES | - | Certification expiry |
| is_primary | boolean | YES | false | Is primary |
| source | text | YES | - | Source |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| candidate_id | user_profiles.id | User profiles |
| skill_id | skills.id | Skills |

## Indexes

| Index Name | Definition |
|------------|------------|
| candidate_skills_pkey | CREATE UNIQUE INDEX candidate_skills_pkey ON public.candidate_skills USING btree (id) |
| candidate_skills_candidate_id_skill_id_key | CREATE UNIQUE INDEX candidate_skills_candidate_id_skill_id_key ON public.candidate_skills USING btree (candidate_id, skill_id) |
| idx_candidate_skills_candidate | CREATE INDEX idx_candidate_skills_candidate ON public.candidate_skills USING btree (candidate_id) |
| idx_candidate_skills_skill | CREATE INDEX idx_candidate_skills_skill ON public.candidate_skills USING btree (skill_id) |
| idx_candidate_skills_proficiency | CREATE INDEX idx_candidate_skills_proficiency ON public.candidate_skills USING btree (proficiency_level) |
| idx_candidate_skills_primary | CREATE INDEX idx_candidate_skills_primary ON public.candidate_skills USING btree (candidate_id) WHERE (is_primary = true) |
