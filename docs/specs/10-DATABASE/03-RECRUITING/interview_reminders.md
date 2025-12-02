# interview_reminders Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `interview_reminders` |
| Schema | `public` |
| Purpose | Automated reminder configurations for interviews |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| interview_id | uuid | NO | - | Foreign key to interview |
| reminder_type | text | NO | - | Reminder type |
| sent_at | timestamp with time zone | YES | - | Sent at |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| interview_id | interviews.id | Interviews |
| org_id | organizations.id | Organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| interview_reminders_pkey | CREATE UNIQUE INDEX interview_reminders_pkey ON public.interview_reminders USING btree (id) |
| idx_interview_reminders_interview_id | CREATE INDEX idx_interview_reminders_interview_id ON public.interview_reminders USING btree (interview_id) |
