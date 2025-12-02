# candidate_resumes Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `candidate_resumes` |
| Schema | `public` |
| Purpose | Resume/CV files and metadata for candidates |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| candidate_id | uuid | NO | - | Foreign key to candidate |
| version | integer | NO | 1 | Version |
| is_latest | boolean | NO | true | Is latest |
| previous_version_id | uuid | YES | - | Foreign key to previous_version |
| bucket | text | NO | 'resumes'::text | Bucket |
| file_path | text | NO | - | File path |
| file_name | text | NO | - | File name |
| file_size | integer | NO | - | File size |
| mime_type | text | NO | - | Mime type |
| resume_type | text | YES | 'master'::text | Resume type |
| title | text | YES | - | Title |
| notes | text | YES | - | Notes |
| parsed_content | text | YES | - | Parsed content |
| parsed_skills | ARRAY | YES | - | Parsed skills |
| parsed_experience | text | YES | - | Parsed experience |
| ai_summary | text | YES | - | Ai summary |
| submission_write_up | text | YES | - | Submission write up |
| uploaded_by | uuid | NO | - | Uploaded by |
| uploaded_at | timestamp with time zone | NO | now() | Uploaded at |
| is_archived | boolean | YES | false | Is archived |
| archived_at | timestamp with time zone | YES | - | Archived at |
| archived_by | uuid | YES | - | Archived by |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| archived_by | user_profiles.id | User profiles |
| candidate_id | user_profiles.id | User profiles |
| org_id | organizations.id | Organizations |
| previous_version_id | candidate_resumes.id | Candidate resumes |
| uploaded_by | user_profiles.id | User profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| candidate_resumes_pkey | CREATE UNIQUE INDEX candidate_resumes_pkey ON public.candidate_resumes USING btree (id) |
| idx_candidate_resumes_org_id | CREATE INDEX idx_candidate_resumes_org_id ON public.candidate_resumes USING btree (org_id) |
| idx_candidate_resumes_candidate_id | CREATE INDEX idx_candidate_resumes_candidate_id ON public.candidate_resumes USING btree (candidate_id) |
| idx_candidate_resumes_is_latest | CREATE INDEX idx_candidate_resumes_is_latest ON public.candidate_resumes USING btree (candidate_id, is_latest) WHERE (is_latest = true) |
| idx_candidate_resumes_resume_type | CREATE INDEX idx_candidate_resumes_resume_type ON public.candidate_resumes USING btree (resume_type) |
| idx_candidate_resumes_not_archived | CREATE INDEX idx_candidate_resumes_not_archived ON public.candidate_resumes USING btree (candidate_id) WHERE (is_archived = false) |
