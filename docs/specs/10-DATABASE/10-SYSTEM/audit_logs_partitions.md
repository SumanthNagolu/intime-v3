# audit_logs Partitions

## Overview

The `audit_logs` table uses PostgreSQL table partitioning by month to improve query performance and simplify data archival. Each partition contains audit logs for a specific month.

## Partition Strategy

- **Partition Key**: `created_at` (timestamp with time zone)
- **Partition Type**: Range partitioning by month
- **Naming Convention**: `audit_logs_YYYY_MM`
- **Retention**: Managed by `audit_log_retention_policy` table

## Current Partitions

| Partition Name | Date Range | Purpose |
|----------------|------------|---------|
| audit_logs_2025_11 | 2025-11-01 to 2025-11-30 | November 2025 audit logs |
| audit_logs_2025_12 | 2025-12-01 to 2025-12-31 | December 2025 audit logs |
| audit_logs_2026_01 | 2026-01-01 to 2026-01-31 | January 2026 audit logs |
| audit_logs_2026_02 | 2026-02-01 to 2026-02-28 | February 2026 audit logs |

## Schema

All partitions inherit the schema from the parent `audit_logs` table. See [audit_logs.md](./audit_logs.md) for complete column definitions.

### Columns (Inherited)

- id (uuid)
- created_at (timestamp with time zone)
- table_name (text)
- action (text)
- record_id (uuid)
- user_id (uuid)
- user_email (text)
- user_ip_address (inet)
- user_agent (text)
- old_values (jsonb)
- new_values (jsonb)
- changed_fields (text[])
- request_id (text)
- session_id (text)
- request_path (text)
- request_method (text)
- metadata (jsonb)
- severity (text)
- org_id (uuid)
- entity_type (text)
- entity_id (uuid)
- actor_type (text)
- actor_id (uuid)
- correlation_id (text)
- parent_audit_id (uuid)
- is_compliance_relevant (boolean)
- retention_category (text)

## Partition Management

### Creating New Partitions

New partitions should be created before the month starts to avoid insertion failures:

```sql
-- Create partition for March 2026
CREATE TABLE audit_logs_2026_03 PARTITION OF audit_logs
FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
```

### Automated Partition Creation

A background job should run monthly to create the next 2-3 months of partitions:

```sql
-- Check for missing future partitions
SELECT to_char(generate_series(
  DATE_TRUNC('month', NOW()),
  DATE_TRUNC('month', NOW()) + INTERVAL '3 months',
  '1 month'::interval
), 'YYYY_MM') as partition_month;
```

### Dropping Old Partitions

After archival, old partitions can be dropped:

```sql
-- Drop partition after data is archived
DROP TABLE IF EXISTS audit_logs_2024_01;
```

## Query Performance

### Partition Pruning

PostgreSQL automatically routes queries to relevant partitions based on `created_at`:

```sql
-- Queries only audit_logs_2025_12 partition
SELECT * FROM audit_logs
WHERE created_at >= '2025-12-01'
  AND created_at < '2026-01-01'
  AND user_id = 'user-uuid';

-- Queries multiple partitions
SELECT * FROM audit_logs
WHERE created_at >= '2025-11-15'
  AND created_at < '2026-01-15';
```

### Best Practices

1. **Always filter by created_at** - Enables partition pruning
2. **Use date ranges** - More efficient than open-ended queries
3. **Avoid cross-partition queries** - Query specific months when possible
4. **Index usage** - Each partition inherits indexes from parent table

## Indexes

All partitions automatically inherit indexes from the parent `audit_logs` table:

- idx_audit_logs_created_at
- idx_audit_logs_user_id
- idx_audit_logs_table_action
- idx_audit_logs_record_id
- idx_audit_logs_session_id
- idx_audit_logs_severity
- idx_audit_logs_org_id
- idx_audit_logs_entity_type_id
- idx_audit_logs_correlation_id
- idx_audit_logs_actor_id

Indexes are created automatically on each partition when it's created.

## Storage & Archival

### Storage Growth

```sql
-- Get partition sizes
SELECT
  schemaname || '.' || tablename as partition,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  pg_total_relation_size(schemaname||'.'||tablename) as bytes
FROM pg_tables
WHERE tablename LIKE 'audit_logs_%'
  AND schemaname = 'public'
ORDER BY bytes DESC;
```

### Archival Process

1. **Export partition data** to cold storage (S3, Glacier)
2. **Verify export** completeness
3. **Drop partition** from database
4. **Update retention metadata** to track archive location

Example archival script:

```bash
# Export partition to CSV
psql -c "COPY (SELECT * FROM audit_logs_2024_01) TO STDOUT CSV HEADER" > audit_logs_2024_01.csv

# Compress
gzip audit_logs_2024_01.csv

# Upload to S3
aws s3 cp audit_logs_2024_01.csv.gz s3://intime-archives/audit-logs/2024/01/

# Verify and drop partition
psql -c "DROP TABLE audit_logs_2024_01;"
```

## Compliance Queries

### Query Specific Partition

```sql
-- Query December 2025 partition directly
SELECT * FROM audit_logs_2025_12
WHERE org_id = 'org-uuid'
  AND is_compliance_relevant = true
ORDER BY created_at DESC;
```

### Cross-Partition Compliance Report

```sql
-- Generate compliance report across multiple months
SELECT
  DATE_TRUNC('month', created_at) as month,
  table_name,
  action,
  COUNT(*) as event_count
FROM audit_logs
WHERE created_at >= '2025-01-01'
  AND created_at < '2026-01-01'
  AND is_compliance_relevant = true
GROUP BY month, table_name, action
ORDER BY month DESC, event_count DESC;
```

## Monitoring

### Partition Health Check

```sql
-- Check for missing partitions
WITH expected_partitions AS (
  SELECT to_char(
    generate_series(
      DATE_TRUNC('month', NOW() - INTERVAL '6 months'),
      DATE_TRUNC('month', NOW() + INTERVAL '3 months'),
      '1 month'::interval
    ),
    'audit_logs_YYYY_MM'
  ) as partition_name
),
actual_partitions AS (
  SELECT tablename as partition_name
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename LIKE 'audit_logs_____\_\_\_'
)
SELECT ep.partition_name
FROM expected_partitions ep
LEFT JOIN actual_partitions ap ON ep.partition_name = ap.partition_name
WHERE ap.partition_name IS NULL;
```

### Partition Growth Rate

```sql
-- Track daily growth per partition
SELECT
  to_char(created_at, 'audit_logs_YYYY_MM') as partition,
  DATE(created_at) as date,
  COUNT(*) as records,
  pg_size_pretty(SUM(pg_column_size(audit_logs.*))) as approx_size
FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY partition, date
ORDER BY partition DESC, date DESC;
```

## Maintenance Schedule

### Monthly Tasks

- Create partitions for next 3 months
- Review partition sizes
- Archive partitions older than retention period
- Vacuum analyze parent and child tables

### Quarterly Tasks

- Review retention policies
- Audit compliance logs
- Verify archive integrity
- Update documentation

## Troubleshooting

### No Partition Exists for Date

Error: `no partition of relation "audit_logs" found for row`

Solution: Create the missing partition:

```sql
CREATE TABLE audit_logs_YYYY_MM PARTITION OF audit_logs
FOR VALUES FROM ('YYYY-MM-01') TO ('YYYY-MM+1-01');
```

### Slow Queries Across Partitions

Issue: Query scans multiple partitions

Solution: Add `created_at` filter to enable partition pruning:

```sql
-- Slow (scans all partitions)
SELECT * FROM audit_logs WHERE user_id = 'user-uuid';

-- Fast (scans only relevant partition)
SELECT * FROM audit_logs
WHERE user_id = 'user-uuid'
  AND created_at >= '2025-12-01'
  AND created_at < '2026-01-01';
```

### Partition Size Imbalance

Issue: Some partitions much larger than others

Solution: Review data distribution and consider:
- Adjusting partition interval (weekly instead of monthly)
- Implementing sub-partitioning by org_id
- Archiving high-volume organizations separately
