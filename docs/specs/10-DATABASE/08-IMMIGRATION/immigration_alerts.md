# immigration_alerts Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `immigration_alerts` |
| Schema | `public` |
| Purpose | Manages time-sensitive alerts for immigration deadlines, document expirations, and compliance issues |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique alert identifier |
| consultant_id | uuid | NO | - | Consultant this alert is for |
| alert_type | text | NO | - | Type of alert (e.g., 'visa_expiry', 'i9_reverification', 'case_deadline') |
| entity_id | uuid | YES | - | Related entity ID (case, document, etc.) |
| alert_date | date | NO | - | Date when the alert should trigger/be shown |
| severity | text | NO | - | Alert severity level (e.g., 'critical', 'high', 'medium', 'low') |
| message | text | NO | - | Alert message to display to user |
| acknowledged_by | uuid | YES | - | User who acknowledged/dismissed the alert |
| acknowledged_at | timestamp with time zone | YES | - | Timestamp when alert was acknowledged |
| created_at | timestamp with time zone | NO | now() | Timestamp when alert was created |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| consultant_id | bench_consultants.id | Consultant this alert pertains to |
| acknowledged_by | user_profiles.id | User who acknowledged the alert |

## Indexes

| Index Name | Definition |
|------------|------------|
| immigration_alerts_pkey | CREATE UNIQUE INDEX immigration_alerts_pkey ON public.immigration_alerts USING btree (id) |
| idx_immigration_alerts_consultant_id | CREATE INDEX idx_immigration_alerts_consultant_id ON public.immigration_alerts USING btree (consultant_id) |
| idx_immigration_alerts_alert_date | CREATE INDEX idx_immigration_alerts_alert_date ON public.immigration_alerts USING btree (alert_date) |
| idx_immigration_alerts_severity | CREATE INDEX idx_immigration_alerts_severity ON public.immigration_alerts USING btree (severity) |

## Business Logic

### Alert Types
Common alert types include:
- `visa_expiry` - Visa expiration approaching
- `i9_reverification` - I-9 reverification deadline
- `case_deadline` - Immigration case deadline
- `document_expiry` - Immigration document expiration
- `rfe_response` - Request for Evidence response deadline
- `opt_expiry` - OPT authorization expiration

### Severity Levels
- `critical` - Immediate action required (< 7 days)
- `high` - Urgent attention needed (7-30 days)
- `medium` - Important but not urgent (30-60 days)
- `low` - Informational/reminder (60+ days)

### Alert Workflow
1. System automatically creates alerts based on immigration dates
2. Alerts are shown to HR/immigration team based on alert_date
3. Users can acknowledge alerts to mark them as seen/handled
4. Acknowledged alerts remain in history for audit purposes

### Key Features
- **entity_id**: Links alert to specific immigration case, document, or other entity
- **Acknowledgment tracking**: Records who dismissed alert and when
- **Date-based triggering**: Alerts become active on/after alert_date
- **Severity-based prioritization**: Critical alerts surface first in UI
