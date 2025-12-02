# audit_logs Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `audit_logs` |
| Schema | `public` |
| Purpose | Comprehensive audit trail for all system changes with multi-tenant support, compliance tracking, and hierarchical event correlation. Uses table partitioning by month for efficient long-term storage. |
| Partitioning | Monthly partitions (e.g., `audit_logs_2025_11`, `audit_logs_2025_12`, etc.) |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | YES | uuid_generate_v4() | Primary key, unique identifier for audit log entry |
| created_at | timestamp with time zone | NO | now() | Timestamp when the audit event was created |
| table_name | text | NO | - | Name of the table that was modified |
| action | text | NO | - | Type of action performed (INSERT, UPDATE, DELETE) |
| record_id | uuid | YES | - | ID of the record that was modified |
| user_id | uuid | YES | - | ID of the user who performed the action |
| user_email | text | YES | - | Email of the user who performed the action |
| user_ip_address | inet | YES | - | IP address from which the action was performed |
| user_agent | text | YES | - | Browser/client user agent string |
| old_values | jsonb | YES | - | Previous values of changed fields (for UPDATE actions) |
| new_values | jsonb | YES | - | New values after the change |
| changed_fields | text[] | YES | - | Array of field names that were changed |
| request_id | text | YES | - | Unique ID for the HTTP request that triggered this action |
| session_id | text | YES | - | User session identifier |
| request_path | text | YES | - | HTTP request path (e.g., /api/jobs/create) |
| request_method | text | YES | - | HTTP method (GET, POST, PUT, DELETE) |
| metadata | jsonb | YES | '{}' | Additional contextual metadata about the action |
| severity | text | YES | 'info' | Severity level (info, warning, error, critical) |
| org_id | uuid | YES | - | Organization ID for multi-tenant isolation |
| entity_type | text | YES | - | Type of entity being audited (e.g., 'job', 'candidate') |
| entity_id | uuid | YES | - | ID of the specific entity |
| actor_type | text | YES | 'user' | Type of actor (user, system, api, service) |
| actor_id | uuid | YES | - | ID of the actor (could be user_id, service_id, etc.) |
| correlation_id | text | YES | - | ID to correlate related audit events across services |
| parent_audit_id | uuid | YES | - | Reference to parent audit log for hierarchical event tracking |
| is_compliance_relevant | boolean | YES | false | Flag indicating if this event is relevant for compliance reporting |
| retention_category | text | YES | - | Category for retention policy (e.g., 'financial', 'hr', 'pii') |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| org_id | organizations.id | CASCADE |
| user_id | user_profiles.id | SET NULL |

## Indexes

| Index Name | Definition |
|------------|------------|
| idx_audit_logs_created_at | CREATE INDEX ON audit_logs (created_at DESC) |
| idx_audit_logs_user_id | CREATE INDEX ON audit_logs (user_id) WHERE user_id IS NOT NULL |
| idx_audit_logs_table_action | CREATE INDEX ON audit_logs (table_name, action) |
| idx_audit_logs_record_id | CREATE INDEX ON audit_logs (record_id) WHERE record_id IS NOT NULL |
| idx_audit_logs_session_id | CREATE INDEX ON audit_logs (session_id) WHERE session_id IS NOT NULL |
| idx_audit_logs_severity | CREATE INDEX ON audit_logs (severity) WHERE severity IN ('error', 'critical') |
| idx_audit_logs_org_id | CREATE INDEX ON audit_logs (org_id) |
| idx_audit_logs_entity_type_id | CREATE INDEX ON audit_logs (entity_type, entity_id) |
| idx_audit_logs_correlation_id | CREATE INDEX ON audit_logs (correlation_id) |
| idx_audit_logs_actor_id | CREATE INDEX ON audit_logs (actor_id) |

## Partitions

The `audit_logs` table is partitioned by month for efficient storage and querying:

- `audit_logs_2025_11` - November 2025
- `audit_logs_2025_12` - December 2025
- `audit_logs_2026_01` - January 2026
- `audit_logs_2026_02` - February 2026

New partitions are automatically created as needed. Each partition inherits all columns, foreign keys, and indexes from the parent table.

## Use Cases

1. **Compliance & Regulatory Reporting** - Track all data changes for GDPR, SOC2, HIPAA compliance
2. **Security Investigations** - Trace user actions by IP, session, or actor
3. **Change History** - View complete audit trail for any record
4. **Debugging** - Correlate events using correlation_id and parent_audit_id
5. **User Activity Monitoring** - Track specific user or organization activities
6. **Data Recovery** - Restore previous values using old_values field
