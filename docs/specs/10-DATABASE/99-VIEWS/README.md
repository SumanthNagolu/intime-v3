# Database Views Documentation

This directory contains documentation for all database views in the InTime v3 system.

## Overview

Total Views: 27

## View Categories

### User & Authentication
- [v_active_users](v_active_users.md) - Consolidated active user profiles
- [v_auth_rls_status](v_auth_rls_status.md) - Authentication and RLS status
- [v_user_activity_summary](v_user_activity_summary.md) - User activity metrics
- [v_user_roles_detailed](v_user_roles_detailed.md) - User role assignments
- [v_session_summary](v_session_summary.md) - Session activity summary

### Business Entities
- [v_bench_candidates](v_bench_candidates.md) - Available bench candidates
- [v_clients](v_clients.md) - Active client accounts
- [v_employees](v_employees.md) - Current employees
- [v_students](v_students.md) - Student enrollments

### Audit & Monitoring
- [v_audit_logs_critical](v_audit_logs_critical.md) - Critical audit entries
- [v_audit_logs_recent](v_audit_logs_recent.md) - Recent audit logs
- [v_events_failed](v_events_failed.md) - Failed events
- [v_events_recent](v_events_recent.md) - Recent events
- [v_event_stats_by_type](v_event_stats_by_type.md) - Event statistics by type

### Security & Permissions
- [v_rls_policies](v_rls_policies.md) - RLS policies configuration
- [v_rls_status](v_rls_status.md) - Current RLS status
- [v_role_permissions_audit](v_role_permissions_audit.md) - Permission audit trail
- [v_roles_with_permissions](v_roles_with_permissions.md) - Roles and permissions

### Workflow & Processes
- [v_workflow_instances_with_state](v_workflow_instances_with_state.md) - Workflow instances
- [v_workflow_metrics](v_workflow_metrics.md) - Workflow metrics

### Timeline & Activities
- [v_timeline_recent](v_timeline_recent.md) - Recent timeline events
- [v_timeline_stats_by_tag](v_timeline_stats_by_tag.md) - Timeline statistics

### System Status
- [v_agent_framework_status](v_agent_framework_status.md) - Agent framework status
- [v_multi_tenancy_status](v_multi_tenancy_status.md) - Multi-tenancy status
- [v_organization_stats](v_organization_stats.md) - Organization statistics
- [v_sprint_5_status](v_sprint_5_status.md) - Sprint 5 status
- [v_subscriber_performance](v_subscriber_performance.md) - Subscriber metrics

## All Views

| View Name | Columns | Purpose |
|-----------|---------|----------|
| [v_active_users](v_active_users.md) | 50 | Consolidated view of all active user profiles with student, employee, candidate, client, and recruiter attributes |
| [v_agent_framework_status](v_agent_framework_status.md) | 8 | Status overview of the agent framework system |
| [v_audit_logs_critical](v_audit_logs_critical.md) | 8 | Critical audit log entries requiring attention |
| [v_audit_logs_recent](v_audit_logs_recent.md) | 8 | Recent audit log entries for monitoring |
| [v_auth_rls_status](v_auth_rls_status.md) | 5 | Authentication and Row Level Security status |
| [v_bench_candidates](v_bench_candidates.md) | 10 | Available bench candidates with their skills and availability |
| [v_clients](v_clients.md) | 9 | Active client accounts and their contract details |
| [v_employees](v_employees.md) | 8 | Current employees with department and performance information |
| [v_event_stats_by_type](v_event_stats_by_type.md) | 7 | Aggregated statistics of events grouped by type |
| [v_events_failed](v_events_failed.md) | 9 | Failed event processing entries for troubleshooting |
| [v_events_recent](v_events_recent.md) | 8 | Recent event entries for monitoring |
| [v_multi_tenancy_status](v_multi_tenancy_status.md) | 5 | Multi-tenancy configuration and status |
| [v_organization_stats](v_organization_stats.md) | 13 | Organization-level statistics and metrics |
| [v_rls_policies](v_rls_policies.md) | 8 | Row Level Security policies configuration |
| [v_rls_status](v_rls_status.md) | 3 | Current Row Level Security status across tables |
| [v_role_permissions_audit](v_role_permissions_audit.md) | 11 | Audit trail of role permissions changes |
| [v_roles_with_permissions](v_roles_with_permissions.md) | 7 | Roles with their associated permissions |
| [v_session_summary](v_session_summary.md) | 18 | User session summary and activity metrics |
| [v_sprint_5_status](v_sprint_5_status.md) | 6 | Sprint 5 development status and progress |
| [v_students](v_students.md) | 8 | Student enrollment and course progress information |
| [v_subscriber_performance](v_subscriber_performance.md) | 7 | Subscriber engagement and performance metrics |
| [v_timeline_recent](v_timeline_recent.md) | 29 | Recent timeline events and activities |
| [v_timeline_stats_by_tag](v_timeline_stats_by_tag.md) | 5 | Timeline statistics aggregated by tag |
| [v_user_activity_summary](v_user_activity_summary.md) | 7 | User activity summary and engagement metrics |
| [v_user_roles_detailed](v_user_roles_detailed.md) | 9 | Detailed user role assignments and permissions |
| [v_workflow_instances_with_state](v_workflow_instances_with_state.md) | 16 | Workflow instances with their current state |
| [v_workflow_metrics](v_workflow_metrics.md) | 10 | Workflow performance metrics and statistics |

## Usage

These views are used throughout the InTime v3 application for:
- Simplified data access patterns
- Performance optimization through pre-joined data
- Consistent data filtering (active records, soft deletes)
- Security enforcement through RLS
- Reporting and analytics

## Maintenance

Views are automatically updated when underlying table data changes. However, structural changes to base tables may require view recreation.

To refresh view definitions:
```sql
-- Refresh a specific view
CREATE OR REPLACE VIEW view_name AS ...;
```
