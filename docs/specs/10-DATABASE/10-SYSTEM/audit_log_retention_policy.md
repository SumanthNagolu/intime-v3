# audit_log_retention_policy Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `audit_log_retention_policy` |
| Schema | `public` |
| Purpose | Defines data retention policies for audit logs by table name, specifying how long audit records should be retained before archival or deletion. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | Primary key, unique identifier for retention policy |
| table_name | text | NO | - | Name of the table this retention policy applies to |
| retention_months | integer | NO | 6 | Number of months to retain audit logs before deletion |
| archive_after_months | integer | YES | - | Number of months after which logs should be moved to cold storage/archive |
| created_at | timestamp with time zone | NO | now() | Timestamp when the policy was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when the policy was last updated |

## Foreign Keys

None

## Indexes

| Index Name | Definition |
|------------|------------|
| audit_log_retention_policy_pkey | CREATE UNIQUE INDEX ON audit_log_retention_policy (id) |

## Use Cases

1. **Compliance Management** - Define retention periods based on regulatory requirements
2. **Storage Optimization** - Automatically archive or delete old audit logs to manage database size
3. **Legal Hold** - Configure extended retention for specific tables under investigation
4. **Cost Control** - Balance compliance needs with storage costs by defining appropriate retention windows

## Example Policies

```sql
-- Financial records (7 years for tax compliance)
INSERT INTO audit_log_retention_policy (table_name, retention_months, archive_after_months)
VALUES ('payment_transactions', 84, 12);

-- PII data (3 years for GDPR)
INSERT INTO audit_log_retention_policy (table_name, retention_months, archive_after_months)
VALUES ('user_profiles', 36, 6);

-- Standard business data (6 months default)
INSERT INTO audit_log_retention_policy (table_name, retention_months)
VALUES ('jobs', 6);
```
