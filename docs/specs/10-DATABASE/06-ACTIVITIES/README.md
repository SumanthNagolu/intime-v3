# ACTIVITIES/WORKFLOWS Domain Documentation

## Overview

This directory contains comprehensive database documentation for the **ACTIVITIES/WORKFLOWS** domain in InTime v3. This domain manages all activity tracking, workflow orchestration, approvals, SLAs, and task management across the platform.

**Total Tables Documented:** 35

**Last Updated:** 2025-12-01

---

## Table Categories

### Core Activity Management (15 tables)

| Table | Purpose |
|-------|---------|
| [`activities`](./activities.md) | Core table for tracking all activities across the platform (tasks, calls, emails, meetings, etc.) |
| [`activity_attachments`](./activity_attachments.md) | Stores file attachments associated with activities |
| [`activity_auto_rules`](./activity_auto_rules.md) | Defines automation rules for auto-creating activities based on events |
| [`activity_checklist_items`](./activity_checklist_items.md) | Individual checklist items within activities |
| [`activity_comments`](./activity_comments.md) | Comments and notes on activities with threading support |
| [`activity_dependencies`](./activity_dependencies.md) | Defines dependencies between activities (finish-to-start, etc.) |
| [`activity_field_values`](./activity_field_values.md) | Stores custom field values for activities |
| [`activity_history`](./activity_history.md) | Audit trail of changes made to activities |
| [`activity_log`](./activity_log.md) | Log of activity execution and system events |
| [`activity_metrics`](./activity_metrics.md) | Performance metrics and analytics for activities |
| [`activity_participants`](./activity_participants.md) | Users participating in activities (attendees, collaborators) |
| [`activity_reminders`](./activity_reminders.md) | Reminder notifications for activities |
| [`activity_time_entries`](./activity_time_entries.md) | Time tracking entries for activities |
| [`tasks`](./tasks.md) | Simple task tracking (lighter than activities) |
| [`bulk_activity_jobs`](./bulk_activity_jobs.md) | Batch jobs for creating/updating multiple activities |

### Activity Patterns & Templates (5 tables)

| Table | Purpose |
|-------|---------|
| [`activity_patterns`](./activity_patterns.md) | Reusable activity templates and patterns |
| [`activity_pattern_successors`](./activity_pattern_successors.md) | Defines successor activities in activity patterns |
| [`pattern_checklist_items`](./pattern_checklist_items.md) | Template checklist items for activity patterns |
| [`pattern_fields`](./pattern_fields.md) | Custom field definitions for activity patterns |

### Workplan Management (5 tables)

| Table | Purpose |
|-------|---------|
| [`workplan_templates`](./workplan_templates.md) | Reusable multi-activity workplan templates |
| [`workplan_template_activities`](./workplan_template_activities.md) | Activities defined in workplan templates |
| [`workplan_instances`](./workplan_instances.md) | Active instances of workplan templates |
| [`workplan_phases`](./workplan_phases.md) | Phases within workplan templates or instances |

### Workflow Engine (5 tables)

| Table | Purpose |
|-------|---------|
| [`workflows`](./workflows.md) | Workflow definitions with states and transitions |
| [`workflow_states`](./workflow_states.md) | Available states in workflow definitions |
| [`workflow_transitions`](./workflow_transitions.md) | Allowed transitions between workflow states |
| [`workflow_instances`](./workflow_instances.md) | Active workflow instances for entities |
| [`workflow_history`](./workflow_history.md) | Audit trail of workflow state changes |

### Approval System (3 tables)

| Table | Purpose |
|-------|---------|
| [`approval_workflows`](./approval_workflows.md) | Multi-step approval workflow definitions |
| [`approval_steps`](./approval_steps.md) | Individual approval steps within approval workflows |
| [`approval_instances`](./approval_instances.md) | Active approval requests |

### SLA Management (2 tables)

| Table | Purpose |
|-------|---------|
| [`sla_definitions`](./sla_definitions.md) | Service Level Agreement definitions |
| [`sla_instances`](./sla_instances.md) | Active SLA tracking instances |

### Work Queue System (2 tables)

| Table | Purpose |
|-------|---------|
| [`work_queues`](./work_queues.md) | Work queue definitions for routing activities/tasks |
| [`queue_items`](./queue_items.md) | Items in work queues awaiting assignment |

---

## Key Concepts

### Activities

The `activities` table is the core of the domain. Activities are:

- **Polymorphic**: Can be attached to any entity via `entity_type` and `entity_id`
- **Flexible**: Support for calls, emails, tasks, meetings, and custom activity types
- **Automated**: Can be auto-created via activity patterns and auto-rules
- **Trackable**: Full audit history, time tracking, and metrics
- **Collaborative**: Support for participants, comments, and attachments

### Activity Patterns

Activity patterns are reusable templates that define:
- Standard activity types (e.g., "Follow-up Call", "Contract Review")
- Default assignments and due dates
- Custom fields and checklists
- Auto-completion conditions
- Successor patterns for activity chains

### Workplans

Workplans orchestrate complex multi-activity processes:
- Templates define the structure
- Instances track execution
- Phases group related activities
- Dependencies ensure proper sequencing

### Workflows

Workflows define state machines for entities:
- Workflow definitions specify allowed states and transitions
- Workflow instances track current state
- History maintains full audit trail
- Can trigger activities on state changes

### Approvals

Multi-step approval processes:
- Workflows define approval steps
- Instances track approval requests
- Support for sequential and parallel approvals
- Integration with workflow engine

### SLAs

Service Level Agreement tracking:
- Definitions specify time targets
- Instances monitor compliance
- Automatic escalation on violations

---

## Database Relationships

### Key Foreign Keys

**Activities connect to:**
- `organizations` (org_id) - Multi-tenant isolation
- `user_profiles` (assigned_to, performed_by, created_by) - User assignments
- `pods` (assigned_group) - Team assignments
- `activity_patterns` (pattern_id) - Template reference
- `workplan_instances` (workplan_instance_id) - Workplan context
- Self-referential (parent_activity_id, predecessor_activity_id) - Hierarchies

**Patterns and Templates:**
- Activity patterns can reference successor patterns
- Workplan templates define template activities
- Workplan instances reference templates

**Workflows:**
- Workflows define states and transitions
- Workflow instances track entity state
- Can trigger activity auto-rules

---

## Common Indexes

### Performance Optimizations

The domain uses extensive indexing for:
- **Entity lookups**: `(entity_type, entity_id)` composite indexes
- **Assignment queries**: `assigned_to`, `assigned_group` indexes
- **Time-based queries**: `due_date`, `scheduled_at`, `completed_at` indexes
- **Status filtering**: `status` indexes with partial indexes for active records
- **Pattern matching**: `pattern_id`, `workplan_instance_id` indexes
- **Full-text search**: GIN indexes on `tags` arrays

---

## Usage Patterns

### Creating Activities

1. **Manual Creation**: Direct insert into `activities` table
2. **From Patterns**: Reference `pattern_id`, copy default values
3. **Auto-Rules**: Triggered by events matching `activity_auto_rules`
4. **Workplan Execution**: Created when workplan instance starts
5. **Workflow Transitions**: Created on state changes

### Activity Lifecycle

```
Open → In Progress → Completed
  ↓         ↓            ↓
Skipped  Escalated   Auto-Completed
```

### Workplan Execution

```
Template → Instance → Activities → Completion
    ↓          ↓           ↓           ↓
  Define   Execute    Dependencies  Metrics
```

---

## Data Integrity

### Soft Deletes

Most tables support soft deletion via `deleted_at`:
- `activities`
- `activity_attachments`
- `activity_comments`
- `workflows`

### Audit Trail

Change tracking via:
- `activity_history` - Activity changes
- `workflow_history` - Workflow state changes
- Timestamps: `created_at`, `updated_at`
- User tracking: `created_by`, `updated_by`

### Multi-tenancy

All major tables include `org_id` for tenant isolation with indexes for performance.

---

## Extension Points

### Custom Fields

- `activity_field_values` - Store custom field data
- `pattern_fields` - Define custom fields for patterns
- `activities.custom_fields` - JSONB for flexible schema

### Automation

- `activity_auto_rules` - Event-driven activity creation
- Auto-completion conditions in patterns
- Workflow transition actions
- Approval workflow triggers

### Integration

- Polymorphic entity relationships
- Secondary entity support for cross-domain activities
- Tags for categorization
- Custom field extensibility

---

## Query Examples

See individual table documentation for detailed schema and indexes. Key query patterns:

1. **Get user's pending activities**:
   - Filter: `assigned_to = user_id AND status = 'open' AND deleted_at IS NULL`
   - Uses: `idx_activities_assigned_to`, `idx_activities_status`

2. **Get entity activities**:
   - Filter: `entity_type = 'job' AND entity_id = job_id`
   - Uses: `idx_activities_entity`

3. **Get overdue activities**:
   - Filter: `due_date < NOW() AND status = 'open'`
   - Uses: `idx_activities_due_date`, `idx_activities_status`

4. **Get workplan progress**:
   - Join: `activities JOIN workplan_instances ON workplan_instance_id`
   - Group by: `status` for completion metrics

---

## Migration Notes

When adding new activity types or patterns:

1. Create pattern definition in `activity_patterns`
2. Add custom fields in `pattern_fields` if needed
3. Set up auto-rules in `activity_auto_rules` if applicable
4. Create workplan templates for multi-activity processes
5. Configure SLA definitions for time-sensitive activities

---

## Related Documentation

- **CRM Domain**: Activities are core to CRM (leads, deals, accounts)
- **Recruiting Domain**: Recruitment workflows use activities extensively
- **Bench Sales**: Consultant placement activities
- **HR Domain**: Employee onboarding workplans

---

## Files in this Directory

All 35 table documentation files follow the same format:
- Overview with table purpose
- Complete column listing with types and descriptions
- Foreign key relationships
- Index definitions
- Usage notes for key tables
