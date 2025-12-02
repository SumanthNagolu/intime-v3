# interview_participants Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `interview_participants` |
| Schema | `public` |
| Purpose | Participants/interviewers for scheduled interviews |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| interview_id | uuid | NO | - | Foreign key to interview |
| participant_type | text | NO | - | Participant type |
| user_id | uuid | YES | - | Foreign key to user |
| external_name | text | YES | - | External name |
| external_email | text | YES | - | External email |
| is_required | boolean | YES | true | Is required |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| interview_id | interviews.id | Interviews |
| org_id | organizations.id | Organizations |
| user_id | user_profiles.id | User profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| interview_participants_pkey | CREATE UNIQUE INDEX interview_participants_pkey ON public.interview_participants USING btree (id) |
| idx_interview_participants_interview_id | CREATE INDEX idx_interview_participants_interview_id ON public.interview_participants USING btree (interview_id) |
