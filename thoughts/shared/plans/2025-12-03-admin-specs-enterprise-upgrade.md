# Implementation Plan: Admin Portal Specs - Enterprise-Level Upgrade

**Date**: 2025-12-03
**Based On**: `/thoughts/shared/research/2025-12-03-admin-portal-specs-gap-analysis.md`
**Author**: Claude Code
**Status**: COMPLETE - All Phases Finished

---

## Executive Summary

This plan upgrades the Admin portal specs from their current state (~33-96% completeness) to enterprise-level quality matching the recruiter spec format (`06-make-placement.md` - 1,294 lines). The work is organized into three phases:

1. **Phase 1**: Create missing critical specs (HIGH priority)
2. **Phase 2**: Upgrade existing specs to enterprise format
3. **Phase 3**: Format standardization and test cases

**Estimated Effort**: 15-20 spec files, each requiring 400-800 lines

---

## Phase 1: Create Missing Critical Specs (HIGH Priority)

### Task 1.1: Create `00-OVERVIEW.md` Dashboard Spec (Upgrade)

**Status**: ✅ COMPLETED (634 lines)
**Target**: 500+ lines with dashboard wireframe, metrics grid, navigation spec

**Additions Required**:
- [ ] Admin Dashboard ASCII wireframe with metrics grid
- [ ] Quick Actions panel spec
- [ ] Alert/Notification center spec
- [ ] Navigation structure aligned with Mantine v7 AppShell
- [ ] Sidebar configuration details
- [ ] Keyboard shortcuts table
- [ ] Metrics with data sources and refresh rates

**Template Section to Add**:
```markdown
## Admin Dashboard Screen

### Screen Layout (ASCII)
+----------------------------------------------------------+
| InTime OS                    [🔔 3] [👤 Admin ▼]         |
+----------------------------------------------------------+
| ADMIN                                                     |
| ┌──────────────┐                                         |
| │ 📊 Dashboard │ ← Active                                |
| │ 👥 Users     │                                         |
| │ 🔐 Roles     │                                         |
...

### Metrics Grid Specification
| Metric | Data Source | Refresh Rate | Click Action |
|--------|-------------|--------------|--------------|
| Total Users | `admin.users.count()` | 5 min | → Users List |
...
```

---

### Task 1.2: Create `09-workflow-configuration.md` (NEW - HIGH Priority)

**Status**: ✅ COMPLETED (1,028 lines)
**Target**: 600+ lines

**Required Sections**:
- [ ] Overview table (Use Case ID, Actor, Goal, Frequency, Time, Priority)
- [ ] Preconditions list
- [ ] Trigger events
- [ ] Workflow Types table (Approval Chain, Status Automation, Notification Trigger, SLA Escalation, Field Automation, Assignment Rules)
- [ ] Click-by-click main flow with step numbers
- [ ] Workflow Builder screen ASCII wireframe
- [ ] Workflow Conditions operators table
- [ ] Approval Status Tracking specification
- [ ] Test Workflow functionality spec
- [ ] Field specifications for all form inputs
- [ ] Backend processing steps (SQL/TypeScript)
- [ ] Test cases table
- [ ] Error scenarios
- [ ] Keyboard shortcuts

---

### Task 1.3: Create `10-email-templates.md` (NEW - HIGH Priority)

**Status**: ✅ COMPLETED (892 lines)
**Target**: 400+ lines

**Required Sections**:
- [ ] Overview table
- [ ] Email Template Categories table (User Notifications, Candidate Communications, Client Notifications, Internal Alerts, System Alerts)
- [ ] Template Library list screen ASCII wireframe
- [ ] Template Editor screen ASCII wireframe (Visual Editor, HTML Editor, Plain Text tabs)
- [ ] Variable Reference table ({{first_name}}, {{company_name}}, etc.)
- [ ] Click-by-click flow for creating/editing templates
- [ ] Preview and test email functionality
- [ ] Field specifications
- [ ] Test cases
- [ ] Error scenarios

---

### Task 1.4: Create `15-organization-settings.md` (NEW - HIGH Priority)

**Status**: ✅ COMPLETED (964 lines)
**Target**: 450+ lines

**Required Sections**:
- [ ] Overview table
- [ ] Organization Branding screen (Logo, Favicon, Colors)
- [ ] Regional Settings screen (Timezone, Locale, Date/Time Format, Currency)
- [ ] Fiscal Year Configuration
- [ ] Business Hours configuration with per-day settings
- [ ] Holiday Calendar management
- [ ] Default Values configuration
- [ ] Email Signature templates
- [ ] Field specifications for all inputs
- [ ] Click-by-click flows
- [ ] Test cases
- [ ] Error scenarios

---

### Task 1.5: Create `12-sla-configuration.md` (NEW - MEDIUM Priority)

**Status**: ✅ COMPLETED (969 lines)
**Target**: 400+ lines

**Required Sections**:
- [ ] Overview table
- [ ] SLA Categories table (Response Time, Submission Speed, Interview Scheduling, Offer Response, etc.)
- [ ] SLA Rule Builder screen ASCII wireframe
- [ ] Time Calculation configuration (Start Time, End Time, Business Hours, Exclude Weekends/Holidays)
- [ ] Escalation Levels specification (Level 1: Warning, Level 2: Breach, Level 3: Critical)
- [ ] Notification configuration per escalation level
- [ ] Test Rule functionality
- [ ] Field specifications
- [ ] Test cases
- [ ] Error scenarios

---

### Task 1.6: Create `13-activity-patterns.md` (NEW - MEDIUM Priority)

**Status**: ✅ COMPLETED (930 lines)
**Target**: 350+ lines

**Required Sections**:
- [ ] Overview table
- [ ] Activity Types table (Call - Outbound/Inbound, Email Sent/Received, Meeting, LinkedIn, SMS, etc.)
- [ ] Activity Pattern Editor screen ASCII wireframe
- [ ] Required Fields configuration
- [ ] Outcome Options configuration (with Next Action triggers)
- [ ] Automation settings (auto-create follow-up, auto-log from integrations)
- [ ] Points/Targets configuration for activity tracking
- [ ] Field specifications
- [ ] Test cases
- [ ] Error scenarios

---

### Task 1.7: Create `14-feature-flags.md` (NEW - MEDIUM Priority)

**Status**: ✅ COMPLETED (814 lines)
**Target**: 300+ lines

**Required Sections**:
- [ ] Overview table
- [ ] Feature Flag List screen ASCII wireframe (Active, Beta, Disabled categories)
- [ ] Feature Flag Configuration screen ASCII wireframe
- [ ] Rollout Strategy options (Specific roles, Specific users, Percentage, All, None)
- [ ] Role-based enablement configuration
- [ ] Beta testing workflow
- [ ] A/B testing configuration (if applicable)
- [ ] Field specifications
- [ ] Test cases
- [ ] Error scenarios

---

## Phase 2: Upgrade Existing Specs to Enterprise Format

### Task 2.1: Upgrade `05-user-management.md` (MEDIUM Priority)

**Status**: ✅ COMPLETED (1,155 lines)
**Current State**: 620 lines, ~78% complete
**Target**: 800+ lines

**Additions Required**:
- [x] Click-by-click main flow with step numbers and timing
- [x] Field specifications with error messages and validation details
- [x] Keyboard shortcuts
- [x] Test cases table with specific IDs (ADMIN-USR-001 through ADMIN-USR-015)
- [x] Database schema reference
- [x] User Profile Photos handling
- [x] SSO/SAML user provisioning flow
- [x] API Token Management per user
- [x] Additional enterprise fields (Employee ID, Cost Center, Hire Date, Commission Plan, License Type, SSO Identifier, External System ID, etc.)

---

### Task 2.2: Upgrade `02-configure-pods.md` (MEDIUM Priority)

**Status**: ✅ COMPLETED (1,335 lines)
**Current State**: ~180 lines, ~45% complete
**Target**: 400+ lines

**Additions Required**:
- [x] Pod Types configuration (Recruiting, Bench Sales, TA, HR, Mixed, Client Services)
- [x] Territory Assignment for pods
- [x] Pod Metrics/Targets configuration
- [x] Sprint Configuration screen (Duration, Targets, Weights, Notifications)
- [x] Pod Hierarchy (pods within regions)
- [x] Pod Transfer workflow (moving users between pods)
- [x] Pod Performance Dashboard specs
- [x] Pod Templates for quick setup
- [x] Click-by-click flows
- [x] Field specifications
- [x] Test cases
- [x] Error scenarios

---

### Task 2.3: Upgrade `04-data-management.md` (HIGH Priority)

**Status**: ✅ COMPLETED (1,182 lines)
**Current State**: ~150 lines, ~38% complete
**Target**: 400+ lines

**Additions Required**:
- [x] Bulk Import Wizard - Step-by-step flow (5 steps)
  - Step 1: Select Entity Type
  - Step 2: Upload File
  - Step 3: Field Mapping UI
  - Step 4: Validation Results
  - Step 5: Import Complete
- [x] Field Mapping UI specs with column matching
- [x] Validation Results screen with error/warning handling
- [x] Import History with rollback capability
- [x] Export Templates configuration
- [x] Data Reassignment workflow (bulk ownership transfer)
- [x] Data Archival policies
- [x] GDPR Data Request workflow
- [x] Data Purge schedule configuration
- [x] Click-by-click flows
- [x] Test cases
- [x] Error scenarios

---

### Task 2.4: Upgrade `03-system-settings.md` (MEDIUM Priority after 15-organization-settings.md created)

**Status**: ✅ COMPLETED (1,474 lines)
**Current State**: 1212 lines, but partially duplicated with proposed 15-organization-settings.md
**Target**: 600+ lines (refactored to focus on system-level settings)

**Changes Required**:
- [x] Move Organization Branding, Regional Settings, Fiscal Year, Business Hours to `15-organization-settings.md`
- [x] Add Field Customization (custom fields per entity)
- [x] Add Workflow Stage definitions
- [x] Add Status Configuration (custom statuses per entity)
- [x] Add Document Templates management (offer letter, NDA, etc.)
- [x] Ensure click-by-click flows
- [x] Add test cases
- [x] Add error scenarios

---

### Task 2.9: Upgrade `11-emergency-procedures.md` (Added - MEDIUM Priority)

**Status**: ✅ COMPLETED (809 lines)
**Current State**: 621 lines, missing standard template sections
**Target**: 750+ lines

**Additions Required**:
- [x] Overview table with Use Case properties
- [x] Preconditions section
- [x] Trigger section
- [x] Error Scenarios table
- [x] Keyboard Shortcuts table
- [x] Test cases (15 test cases with ADMIN-EMR-XXX IDs)
- [x] Database Schema Reference (incidents, incident_timeline, break_glass_access, emergency_drills)
- [x] Related Use Cases section

---

### Task 2.5: Upgrade `06-permission-management.md` (LOW Priority)

**Status**: ✅ COMPLETED (861 lines)
**Current State**: ~463 lines, ~77% complete
**Target**: 600+ lines

**Additions Required**:
- [x] Test cases table with specific IDs (ADMIN-PRM-001 through ADMIN-PRM-015)
- [x] Keyboard shortcuts
- [x] Permission inheritance visualization
- [x] Role comparison view
- [x] Bulk permission updates
- [x] Permission audit trail
- [x] Error scenarios
- [x] Database schema reference

---

### Task 2.6: Upgrade `07-integration-management.md` (LOW Priority)

**Status**: ✅ COMPLETED (731 lines)
**Current State**: ~390 lines, ~78% complete
**Target**: 500+ lines

**Additions Required**:
- [x] Test cases table (ADMIN-INT-001 through ADMIN-INT-015)
- [x] Webhook debugging tools
- [x] Integration health monitoring dashboard
- [x] OAuth flow documentation
- [x] API rate limit monitoring
- [x] Error retry configuration
- [x] Error scenarios
- [x] Database schema reference

---

### Task 2.7: Upgrade `08-audit-logs.md` (LOW Priority)

**Status**: ✅ COMPLETED (724 lines)
**Current State**: ~411 lines, ~82% complete
**Target**: 500+ lines

**Additions Required**:
- [x] Test cases table (ADMIN-AUD-001 through ADMIN-AUD-015)
- [x] Export specifications (CSV, JSON, SIEM/CEF formats)
- [x] Advanced filtering options
- [x] Audit log retention policies
- [x] Security incident detection patterns
- [x] Compliance reporting templates
- [x] Real-time log streaming with WebSocket
- [x] Error scenarios
- [x] Database schema reference

---

### Task 2.8: Consolidate `01-manage-users.md` (LOW Priority)

**Status**: ✅ COMPLETED (Deprecated in favor of 05-user-management.md)
**Current State**: ~200 lines, duplicates `05-user-management.md`
**Action**: Remove or merge into `05-user-management.md`

- [x] Audit content for any unique information
- [x] Merge unique content into `05-user-management.md`
- [x] ~~Delete `01-manage-users.md`~~ Added deprecation notice redirecting to `05-user-management.md`

---

## Phase 3: Format Standardization

**Phase Status**: ✅ COMPLETE

**Deliverables Created:**
- `TEMPLATE.md` - Standard template for new admin specs (345 lines)
- `UI-DESIGN-SYSTEM.md` - Complete Mantine v7 component reference (678 lines)
- `README.md` - Updated with full documentation index and standardization guide (244 lines)

**Audit Results:** All 16 spec files verified to contain required sections (Overview, Test Cases, Error Scenarios, Keyboard Shortcuts, Database Schema, Change Log)

---

### Task 3.1: Create Standard Template for Admin Specs

**Status**: ✅ COMPLETED (TEMPLATE.md - 345 lines)

Every admin spec must include the following sections in order:

```markdown
# UC-ADMIN-XXX: [Use Case Name]

## Overview
| Property | Value |
|----------|-------|
| Use Case ID | UC-ADMIN-XXX |
| Actor | Admin |
| Goal | [Goal description] |
| Frequency | [How often] |
| Estimated Time | [Duration] |
| Priority | [HIGH/MEDIUM/LOW] |

## Preconditions
1. [Precondition 1]
2. [Precondition 2]

## Trigger
- [Trigger event 1]
- [Trigger event 2]

## Main Flow (Click-by-Click)

### Step 1: [Step Name]

**User Action:** [What user does]

**System Response:**
- [Response 1]
- [Response 2]

**Screen State:**
```ascii
[ASCII wireframe]
```

**Field Specification: [Field Name]**
| Property | Value |
|----------|-------|
| Field Name | `fieldName` |
| Type | [Input type] |
| Required | Yes/No |
| Validation | [Rules] |
| Error Messages | |
| - Empty | "[Message]" |
| - Invalid | "[Message]" |

**Time:** ~X seconds

---

[Repeat for each step]

## Alternative Flows

### Alternative A: [Scenario]
[Description]

## Postconditions
1. [Postcondition 1]
2. [Postcondition 2]

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| [Error] | [Cause] | "[Message]" | [Recovery] |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+K` | [Action] |

## Test Cases

| Test ID | Scenario | Preconditions | Steps | Expected Result |
|---------|----------|---------------|-------|-----------------|
| ADMIN-XXX-001 | [Scenario] | [Preconditions] | [Steps] | [Result] |

## Database Schema Reference

```sql
[Relevant SQL schema]
```

## Related Use Cases
- [UC-ADMIN-XXX](./XX-name.md)

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | YYYY-MM-DD | Initial documentation |
```

---

### Task 3.2: UI Design System Alignment

**Status**: ✅ COMPLETED (UI-DESIGN-SYSTEM.md - 678 lines)

Ensure all specs reference correct Mantine v7 components:

| Context | Color | Token |
|---------|-------|-------|
| Primary Actions | Forest Green | `--mantine-color-brand-6` (#2D5016) |
| Destructive Actions | Rust Red | `--mantine-color-rust-6` (#E07A5F) |
| Warning States | Goldenrod | `--mantine-color-gold-6` (#FFD700) |
| Info/Links | Ocean Blue | `--mantine-color-ocean-6` (#1E3A5F) |

| Pattern | Component | Usage |
|---------|-----------|-------|
| Primary Button | `<Button variant="filled">` | Save, Submit |
| Secondary Button | `<Button variant="outline">` | Cancel, Back |
| Danger Button | `<Button variant="filled" color="red">` | Delete |
| Form Input | `<TextInput>` | All text fields |
| Select | `<Select searchable>` | Dropdowns |
| Table | `<Table.ScrollContainer>` | Data lists |
| Modal | `<Modal centered>` | Dialogs |

---

## Implementation Order (Recommended)

### Week 1: Create Missing HIGH Priority Specs
1. `09-workflow-configuration.md` (NEW)
2. `10-email-templates.md` (NEW)
3. `15-organization-settings.md` (NEW)

### Week 2: Create Missing MEDIUM Priority Specs + Upgrade Data Management
4. `12-sla-configuration.md` (NEW)
5. `13-activity-patterns.md` (NEW)
6. `14-feature-flags.md` (NEW)
7. Upgrade `04-data-management.md`

### Week 3: Upgrade Existing Specs
8. Upgrade `00-OVERVIEW.md`
9. Upgrade `05-user-management.md`
10. Upgrade `02-configure-pods.md`
11. Refactor `03-system-settings.md`

### Week 4: Final Upgrades + Consolidation
12. Upgrade `06-permission-management.md`
13. Upgrade `07-integration-management.md`
14. Upgrade `08-audit-logs.md`
15. Consolidate/remove `01-manage-users.md`
16. Final review and format standardization

---

## Success Criteria

1. **Line Count**: Each spec has 300-800+ lines (matching recruiter spec quality)
2. **Click-by-Click Flows**: Every spec has numbered steps with timing
3. **ASCII Wireframes**: Every screen state has an ASCII wireframe
4. **Field Specifications**: Every form field has a specification table
5. **Test Cases**: Every spec has 10+ test cases with IDs
6. **Error Scenarios**: Every spec has an error scenarios table
7. **Keyboard Shortcuts**: Every spec lists relevant shortcuts
8. **Database Schema**: Every spec references relevant schema
9. **UI Alignment**: All specs reference correct Mantine v7 components

---

## Open Questions (Require User Input)

1. **Mobile/Responsive**: Should admin specs include mobile/responsive variants?
2. **Admin Levels**: Are there sub-levels within Admin (Super Admin vs Admin)?
3. **Multi-tenancy**: Are multi-tenancy settings in Admin or separate Platform Admin?
4. **White-label**: Are there white-label/client branding requirements?
5. **API Rate Limits**: Should rate limits be admin-configurable?
6. **Audit Retention**: Should audit log retention be admin-configurable?

---

## Files to Create/Modify

### New Files (6)
- `/docs/specs/20-USER-ROLES/10-admin/09-workflow-configuration.md`
- `/docs/specs/20-USER-ROLES/10-admin/10-email-templates.md`
- `/docs/specs/20-USER-ROLES/10-admin/12-sla-configuration.md`
- `/docs/specs/20-USER-ROLES/10-admin/13-activity-patterns.md`
- `/docs/specs/20-USER-ROLES/10-admin/14-feature-flags.md`
- `/docs/specs/20-USER-ROLES/10-admin/15-organization-settings.md`

### Existing Files to Upgrade (10)
- `/docs/specs/20-USER-ROLES/10-admin/00-OVERVIEW.md`
- `/docs/specs/20-USER-ROLES/10-admin/02-configure-pods.md`
- `/docs/specs/20-USER-ROLES/10-admin/03-system-settings.md`
- `/docs/specs/20-USER-ROLES/10-admin/04-data-management.md`
- `/docs/specs/20-USER-ROLES/10-admin/05-user-management.md`
- `/docs/specs/20-USER-ROLES/10-admin/06-permission-management.md`
- `/docs/specs/20-USER-ROLES/10-admin/07-integration-management.md`
- `/docs/specs/20-USER-ROLES/10-admin/08-audit-logs.md`
- `/docs/specs/20-USER-ROLES/10-admin/11-emergency-procedures.md` (added to scope)
- `/docs/specs/20-USER-ROLES/10-admin/README.md` (update to reflect new structure)

### Files to Remove/Consolidate (1)
- `/docs/specs/20-USER-ROLES/10-admin/01-manage-users.md` (merge into 05-user-management.md)

---

*Plan Created: 2025-12-03*
*Ready for User Approval*
