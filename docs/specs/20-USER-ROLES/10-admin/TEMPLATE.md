# UC-ADMIN-XXX: [Use Case Name]

**Version:** 1.0
**Last Updated:** YYYY-MM-DD
**Role:** Admin
**Status:** Draft

---

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-ADMIN-XXX |
| Actor | Admin |
| Goal | [Goal description - what the admin is trying to accomplish] |
| Frequency | [How often this action is performed: Daily, Weekly, Monthly, As needed] |
| Estimated Time | [Duration: e.g., 2-5 min, 30 sec, 15 min] |
| Priority | HIGH / MEDIUM / LOW |

[1-2 paragraph description of the use case, its importance, and any critical considerations.]

---

## Preconditions

1. Admin logged in with full permissions
2. [Precondition 2]
3. [Precondition 3]

---

## Trigger

- [Trigger event 1 - what initiates this use case]
- [Trigger event 2]
- [Trigger event 3]

---

## Main Flow (Click-by-Click)

### Step 1: [Step Name]

**User Action:** [What the user does - be specific about clicks, inputs, etc.]

**System Response:**
```
+----------------------------------------------------------+
| Screen Title                           [Action Buttons]   |
+----------------------------------------------------------+
|                                                          |
| [ASCII wireframe showing the exact screen layout]        |
| [Include all visible elements, buttons, fields]          |
|                                                          |
| ┌────────────────────────────────────────────────────┐   |
| │ Section Header                                     │   |
| │ ┌──────────┐ ┌──────────┐ ┌──────────┐            │   |
| │ │  Value   │ │  Value   │ │  Value   │            │   |
| │ │  Label   │ │  Label   │ │  Label   │            │   |
| │ └──────────┘ └──────────┘ └──────────┘            │   |
| └────────────────────────────────────────────────────┘   |
|                                                          |
| [Primary Action]                      [Secondary Action]  |
+----------------------------------------------------------+
```

**System Actions:**
1. [Backend action 1]
2. [Backend action 2]
3. [Audit log entry created]

**Time:** ~X seconds

---

### Step 2: [Step Name]

**User Action:** [What the user does]

**System Response:**
```
[ASCII wireframe]
```

**Field Specification: [Field Name]**

| Property | Value |
|----------|-------|
| Field Name | `fieldName` |
| Type | TextInput / Select / DatePicker / etc. |
| Required | Yes / No |
| Max Length | [X characters] |
| Validation | [Validation rules] |
| Error Messages | |
| - Empty | "[Error message when empty]" |
| - Invalid | "[Error message when invalid]" |
| - Too Long | "[Error message when exceeds length]" |

**Time:** ~X seconds

---

### Step 3: [Confirmation/Completion]

**User Action:** Click "[Primary Action Button]"

**System Response:**
- [Response 1 - e.g., "Success toast displayed"]
- [Response 2 - e.g., "Redirect to list page"]
- [Response 3 - e.g., "Email notification sent"]

**System Actions on [Action Name]:**
1. [Database operation - e.g., "Create record in table"]
2. [Side effect - e.g., "Send notification"]
3. [Integration - e.g., "Sync with HRIS"]
4. [Audit - e.g., "Log action in audit trail"]

**Time:** ~X seconds

---

## Alternative Flows

### Alternative A: [Scenario Name]

**Trigger:** [What triggers this alternative flow]

**Flow:**
1. [Step 1]
2. [Step 2]
3. Return to main flow at Step X

### Alternative B: [Scenario Name]

**Trigger:** [What triggers this alternative flow]

**Flow:**
1. [Step 1]
2. [Step 2]

---

## Postconditions

1. [Postcondition 1 - what state the system is in after completion]
2. [Postcondition 2]
3. [Postcondition 3]

---

## Field Specifications

### [Form/Screen Name] Fields

**Field Specification: [Field 1 Name]**

| Property | Value |
|----------|-------|
| Field Name | `field1Name` |
| Type | TextInput |
| Required | Yes |
| Max Length | 100 characters |
| Validation | [Validation rules] |
| Placeholder | "[Placeholder text]" |
| Error Messages | |
| - Empty | "[Required field message]" |
| - Invalid | "[Validation error message]" |
| - Too Long | "[Length error message]" |

**Field Specification: [Field 2 Name]**

| Property | Value |
|----------|-------|
| Field Name | `field2Name` |
| Type | Select (searchable) |
| Required | Yes |
| Options | From `[table_name]` where `is_active = true` |
| Default | [Default value or "None"] |
| Error Messages | |
| - Empty | "[Required selection message]" |
| - Invalid | "[Invalid option message]" |

**Field Specification: [Field 3 Name]**

| Property | Value |
|----------|-------|
| Field Name | `field3Name` |
| Type | DatePicker |
| Required | No |
| Default | Today |
| Min Date | [Constraint or "None"] |
| Max Date | [Constraint or "None"] |
| Error Messages | |
| - Invalid Range | "[Date range error message]" |

---

## Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| [XXX-001] | [Rule description] | [How it's enforced] |
| [XXX-002] | [Rule description] | [How it's enforced] |
| [XXX-003] | [Rule description] | [How it's enforced] |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| [Error type] | [What causes it] | "[User-facing message]" | [How to recover] |
| [Error type] | [What causes it] | "[User-facing message]" | [How to recover] |
| [Error type] | [What causes it] | "[User-facing message]" | [How to recover] |
| [Error type] | [What causes it] | "[User-facing message]" | [How to recover] |

---

## Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `Cmd+K` / `Ctrl+K` | Open command palette | Any page |
| `g x` | Go to [destination] | Any admin page |
| `n x` | New [entity] | List page |
| `/` | Focus search | List page |
| `j` / `k` | Navigate up/down | List page |
| `Enter` | Open selected | List page |
| `e` | Edit | Detail page |
| `Escape` | Close modal | Any modal |

---

## Test Cases

| Test ID | Scenario | Preconditions | Steps | Expected Result |
|---------|----------|---------------|-------|-----------------|
| ADMIN-XXX-001 | [Happy path - basic creation] | [Setup required] | 1. [Step] 2. [Step] 3. [Step] | [Expected outcome] |
| ADMIN-XXX-002 | [Validation - required field] | [Setup] | 1. [Step] 2. Leave field empty 3. Submit | Error: "[message]" |
| ADMIN-XXX-003 | [Validation - duplicate] | [Existing record] | 1. [Step] 2. Enter duplicate value 3. Submit | Error: "[message]" |
| ADMIN-XXX-004 | [Update existing] | [Record exists] | 1. Open record 2. Edit 3. Save | [Expected outcome] |
| ADMIN-XXX-005 | [Delete/Deactivate] | [Record exists] | 1. Open record 2. Click Delete 3. Confirm | [Expected outcome] |
| ADMIN-XXX-006 | [Permission check] | [Non-admin user] | 1. Try to access | Access denied |
| ADMIN-XXX-007 | [Edge case 1] | [Setup] | 1. [Steps] | [Expected outcome] |
| ADMIN-XXX-008 | [Edge case 2] | [Setup] | 1. [Steps] | [Expected outcome] |
| ADMIN-XXX-009 | [Bulk operation] | [Multiple records] | 1. Select records 2. Bulk action 3. Confirm | [Expected outcome] |
| ADMIN-XXX-010 | [Integration test] | [Integration active] | 1. [Steps] | [Expected outcome] |

---

## Database Schema Reference

```sql
-- Primary table for this use case
CREATE TABLE [table_name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core fields
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',

  -- Relationships
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(organization_id, name)
);

-- Indexes for performance
CREATE INDEX idx_[table]_org ON [table_name](organization_id);
CREATE INDEX idx_[table]_status ON [table_name](status);

-- Related tables (if applicable)
CREATE TABLE [related_table] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  [parent]_id UUID NOT NULL REFERENCES [table_name](id) ON DELETE CASCADE,
  -- Additional fields
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints (if applicable)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/[resource]` | List all | Admin |
| GET | `/api/v1/[resource]/:id` | Get by ID | Admin |
| POST | `/api/v1/[resource]` | Create | Admin |
| PATCH | `/api/v1/[resource]/:id` | Update | Admin |
| DELETE | `/api/v1/[resource]/:id` | Delete | Admin |

---

## UI Component Reference (Mantine v7)

| Context | Component | Props |
|---------|-----------|-------|
| Page Container | `<Container size="xl">` | py="md" |
| Card | `<Paper p="md" withBorder>` | shadow="xs", radius="md" |
| Primary Button | `<Button variant="filled">` | color="brand" |
| Secondary Button | `<Button variant="outline">` | |
| Danger Button | `<Button variant="filled" color="red">` | |
| Form Input | `<TextInput>` | withAsterisk for required |
| Select | `<Select searchable>` | data={options} |
| Table | `<Table.ScrollContainer>` | minWidth={800} |
| Modal | `<Modal centered>` | size="lg" |
| Alert | `<Alert>` | color, icon |

### Color Tokens

| Context | Color | Token |
|---------|-------|-------|
| Primary Actions | Forest Green | `--mantine-color-brand-6` (#2D5016) |
| Destructive Actions | Rust Red | `--mantine-color-rust-6` (#E07A5F) |
| Warning States | Goldenrod | `--mantine-color-gold-6` (#FFD700) |
| Info/Links | Ocean Blue | `--mantine-color-ocean-6` (#1E3A5F) |

---

## Related Use Cases

- [UC-ADMIN-XXX: Related Use Case](./XX-related.md)
- [UC-ADMIN-YYY: Another Related Use Case](./YY-another.md)

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | YYYY-MM-DD | Initial documentation |

---

**End of UC-ADMIN-XXX**
