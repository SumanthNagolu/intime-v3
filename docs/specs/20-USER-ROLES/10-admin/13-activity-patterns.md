# UC-ADMIN-013: Activity Pattern Configuration

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-ADMIN-013 |
| Actor | Admin |
| Goal | Configure activity types, required fields, outcomes, and automation rules |
| Frequency | Monthly (initial setup) + as needed for modifications |
| Estimated Time | 10-30 minutes per activity pattern |
| Priority | MEDIUM |

---

## Preconditions

1. User is authenticated with Admin role
2. User has `activities.configure`, `activities.create_type` permissions
3. Organization has activity tracking enabled (feature flag: `activity_tracking`)
4. At least one user role exists that uses activity tracking

---

## Trigger

- Admin clicks "Activity Patterns" in the Admin sidebar under SYSTEM section
- Admin clicks "+ New Activity Type" button on Activity Patterns page
- Admin navigates directly to `/employee/admin/activity-patterns`
- Admin uses keyboard shortcut `g a` from any admin page
- Admin clicks "Configure" from activity type dropdown in any activity form

---

## Activity Categories

| Category | Code | Description | Example Types |
|----------|------|-------------|---------------|
| Communication | `communication` | Direct outreach and conversations | Calls, Emails, LinkedIn, SMS |
| Calendar | `calendar` | Scheduled time-based events | Meetings, Interviews, Follow-ups |
| Workflow | `workflow` | Business process actions | Submissions, Offers, Placements |
| Documentation | `documentation` | Notes and record updates | Notes, Comments, Updates |
| Research | `research` | Information gathering | Sourcing, Market Research |
| Administrative | `administrative` | Internal process tasks | Approvals, Reviews, Assignments |

---

## Default Activity Types

| Type | Category | Icon | Required Fields | Auto-Log | Points |
|------|----------|------|-----------------|----------|--------|
| Call - Outbound | Communication | 📞 | Contact, Duration, Outcome | No | 1 |
| Call - Inbound | Communication | 📲 | Contact, Duration, Notes | No | 0.5 |
| Email Sent | Communication | 📧 | Contact, Subject | Yes (Gmail/Outlook) | 0.5 |
| Email Received | Communication | 📨 | Contact, Subject | Yes (Gmail/Outlook) | 0 |
| Meeting - In Person | Calendar | 🤝 | Contact, Date/Time, Location | Yes (Calendar) | 2 |
| Meeting - Virtual | Calendar | 💻 | Contact, Date/Time, Link | Yes (Calendar) | 1.5 |
| LinkedIn Message | Communication | 💼 | Contact, Message Preview | Manual | 0.5 |
| LinkedIn Connection | Communication | 🔗 | Contact | Manual | 0.25 |
| Text/SMS | Communication | 💬 | Contact, Message | Yes (Twilio) | 0.5 |
| Submission Sent | Workflow | 📄 | Candidate, Job, Client | Yes | 3 |
| Interview Scheduled | Workflow | 📅 | Candidate, Date/Time, Type | Yes | 2 |
| Offer Extended | Workflow | 🎉 | Candidate, Terms | Yes | 5 |
| Placement Made | Workflow | 🏆 | Candidate, Job, Start Date | Yes | 10 |
| Note Added | Documentation | 📝 | Entity, Note Text | Manual | 0 |
| Task Created | Administrative | ✅ | Title, Due Date, Assignee | Yes | 0 |
| Task Completed | Administrative | ✓ | Task Reference | Manual | 0.5 |

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Activity Patterns

**User Action:** Click "Activity Patterns" in Admin sidebar under SYSTEM section

**System Response:**
- URL changes to: `/employee/admin/activity-patterns`
- Page title displays: "Activity Pattern Configuration"
- Activity type list loads organized by category
- Usage stats show activity counts for last 30 days

**Screen State:**

```
+------------------------------------------------------------------+
| Activity Patterns                          [+ New Activity Type]  |
+------------------------------------------------------------------+
| ACTIVITY USAGE (Last 30 Days)                                     |
| ┌──────────────────────────────────────────────────────────────┐ |
| │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐             │ |
| │  │ 2,847  │  │ 1,234  │  │  456   │  │  89    │             │ |
| │  │ Total  │  │ Calls  │  │ Emails │  │Meetings│             │ |
| │  │ Logged │  │        │  │        │  │        │             │ |
| │  └────────┘  └────────┘  └────────┘  └────────┘             │ |
| │                                                               │ |
| │  Most Active: Technical Recruiting Pod (892 activities)      │ |
| │  Top Performer: Sarah Chen (234 activities)                  │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| [Search activity types...]         [Category ▼] [Status ▼]       |
+------------------------------------------------------------------+
| COMMUNICATION                                                     |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 📞 Call - Outbound                              [Edit] [⋮]   │ |
| │    Required: Contact, Duration, Outcome                       │ |
| │    Points: 1 | Auto-log: No | Last 30 days: 892 uses         │ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ 📲 Call - Inbound                               [Edit] [⋮]   │ |
| │    Required: Contact, Duration, Notes                         │ |
| │    Points: 0.5 | Auto-log: No | Last 30 days: 342 uses       │ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ 📧 Email Sent                                   [Edit] [⋮]   │ |
| │    Required: Contact, Subject                                 │ |
| │    Points: 0.5 | Auto-log: Gmail, Outlook | Last 30 days: 456│ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ 💼 LinkedIn Message                             [Edit] [⋮]   │ |
| │    Required: Contact, Message Preview                         │ |
| │    Points: 0.5 | Auto-log: No | Last 30 days: 234 uses       │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| CALENDAR                                                          |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 🤝 Meeting - In Person                          [Edit] [⋮]   │ |
| │    Required: Contact, Date/Time, Location                     │ |
| │    Points: 2 | Auto-log: Calendar | Last 30 days: 45 uses    │ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ 💻 Meeting - Virtual                            [Edit] [⋮]   │ |
| │    Required: Contact, Date/Time, Meeting Link                 │ |
| │    Points: 1.5 | Auto-log: Calendar | Last 30 days: 89 uses  │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| WORKFLOW                                                          |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 📄 Submission Sent                              [Edit] [⋮]   │ |
| │    Required: Candidate, Job, Client                           │ |
| │    Points: 3 | Auto-log: Yes | Last 30 days: 234 uses        │ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ 🏆 Placement Made                               [Edit] [⋮]   │ |
| │    Required: Candidate, Job, Start Date                       │ |
| │    Points: 10 | Auto-log: Yes | Last 30 days: 12 uses        │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
+------------------------------------------------------------------+
| [Import Activity Types]  [Export Configuration]  [View Reports →] |
+------------------------------------------------------------------+
```

**Time:** ~2 seconds (page load)

---

### Step 2: Click New Activity Type

**User Action:** Click "+ New Activity Type" button

**System Response:**
- Modal opens with Activity Pattern Editor
- Category dropdown is focused
- Form is in "Create" mode
- Default values are pre-populated

**Screen State:**

```
+------------------------------------------------------------------+
| Create Activity Type                                    [× Close] |
+------------------------------------------------------------------+
| BASIC INFORMATION                                                 |
|                                                                   |
| Activity Type Name *                                              |
| [                                                            ]    |
| ℹ A descriptive name for this activity type                      |
|                                                                   |
| Category *                                                        |
| [Select category...                                          ▼]  |
| Options: Communication, Calendar, Workflow, Documentation,       |
|          Research, Administrative                                 |
|                                                                   |
| Description                                                       |
| [                                                            ]    |
| ℹ Help users understand when to use this activity type           |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| DISPLAY SETTINGS                                                  |
|                                                                   |
| Icon                                                              |
| [📞 Phone                                                    ▼]  |
| Preview: [📞]                                                     |
|                                                                   |
| Color                                                             |
| [Blue                                                        ▼]  |
| Preview: [████]                                                  |
|                                                                   |
| Display Order                                                     |
| [10        ] (lower numbers appear first in dropdowns)           |
|                                                                   |
+------------------------------------------------------------------+
|                                              [Cancel]  [Next →]   |
+------------------------------------------------------------------+
```

**Time:** ~1 second (modal open)

---

### Step 3: Configure Required Fields

**User Action:** Click "Next" to proceed to Required Fields section

**System Response:**
- Form advances to Required Fields configuration
- Standard fields are listed with toggle switches
- Custom field builder is available
- Field dependencies can be configured

**Screen State:**

```
+------------------------------------------------------------------+
| Create Activity Type                                    [× Close] |
+------------------------------------------------------------------+
| Step 2 of 4: Required Fields                                      |
|                                                                   |
| Configure which fields are required when logging this activity   |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| STANDARD FIELDS                                                   |
|                                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Field              │ Required │ Default Value │ Validation   │ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ Related Contact    │ [●]      │ (none)        │ Must exist   │ |
| │ Related Entity     │ [○]      │ Auto-detect   │ -            │ |
| │ Date/Time          │ [●]      │ Now           │ Not future   │ |
| │ Duration (minutes) │ [●]      │ (user input)  │ 1-480 mins   │ |
| │ Subject/Title      │ [○]      │ (none)        │ Max 200 char │ |
| │ Notes              │ [○]      │ (none)        │ Max 5000     │ |
| │ Outcome            │ [●]      │ (user select) │ From list    │ |
| │ Follow-up Date     │ [○]      │ (none)        │ Future only  │ |
| │ Attachments        │ [○]      │ (none)        │ Max 10MB     │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| CUSTOM FIELDS                                                     |
|                                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ No custom fields defined                                     │ |
| │                                                               │ |
| │ [+ Add Custom Field]                                         │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| FIELD DEPENDENCIES                                                |
|                                                                   |
| When [Outcome                ▼] equals [Left Voicemail      ▼]   |
| Then require: [Follow-up Date                               ▼]   |
|                                                                   |
| [+ Add Dependency Rule]                                          |
|                                                                   |
+------------------------------------------------------------------+
|                                    [← Back]  [Cancel]  [Next →]   |
+------------------------------------------------------------------+
```

**Field Specification: Related Contact**

| Property | Value |
|----------|-------|
| Field Name | `contact_id` |
| Type | Entity Search (Contacts, Candidates, Accounts) |
| Label | "Related Contact" |
| Required | Configurable (default: Yes) |
| Search | By name, email, phone, company |
| Validation | Must be valid entity in system |
| Error Messages | |
| - Empty | "Please select a contact" |
| - Not found | "Contact not found" |
| - Archived | "This contact has been archived" |

**Field Specification: Duration**

| Property | Value |
|----------|-------|
| Field Name | `duration_minutes` |
| Type | Number Input |
| Label | "Duration (minutes)" |
| Required | Configurable |
| Min Value | 1 |
| Max Value | 480 (8 hours) |
| Default | Blank (user must enter) |
| Quick Select | 5, 15, 30, 45, 60 minute buttons |
| Validation | Positive integer |
| Error Messages | |
| - Empty | "Please enter the call duration" |
| - Invalid | "Duration must be between 1 and 480 minutes" |
| - Non-numeric | "Please enter a valid number" |

**Time:** ~20 seconds

---

### Step 4: Configure Outcome Options

**User Action:** Click "Next" to proceed to Outcome Options section

**System Response:**
- Form advances to Outcome Options configuration
- Outcome list editor is displayed
- Each outcome can have automation rules
- Color coding for outcomes is available

**Screen State:**

```
+------------------------------------------------------------------+
| Create Activity Type                                    [× Close] |
+------------------------------------------------------------------+
| Step 3 of 4: Outcome Options                                      |
|                                                                   |
| Define the possible outcomes for this activity type              |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| OUTCOME OPTIONS                                                   |
|                                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Label              │ Value       │ Color   │ Next Action     │ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ [Connected       ] │ [connected] │ [🟢 ▼] │ [Log notes   ▼] │ |
| │                                                    [× Delete]│ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ [Left Voicemail  ] │ [voicemail] │ [🟡 ▼] │ [Schedule f/u▼] │ |
| │                                                    [× Delete]│ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ [No Answer       ] │ [no_answer] │ [🟠 ▼] │ [Retry later ▼] │ |
| │                                                    [× Delete]│ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ [Wrong Number    ] │ [wrong_num] │ [🔴 ▼] │ [Update info ▼] │ |
| │                                                    [× Delete]│ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ [Disconnected    ] │ [disconn  ] │ [⚫ ▼] │ [Mark invalid▼] │ |
| │                                                    [× Delete]│ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| [+ Add Outcome Option]                                           |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| OUTCOME COLORS                                                    |
|                                                                   |
| 🟢 Positive outcome (goal achieved)                              |
| 🟡 Neutral outcome (follow-up needed)                            |
| 🟠 Partial outcome (try again)                                   |
| 🔴 Negative outcome (action needed)                              |
| ⚫ Terminal outcome (no further action)                          |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| NEXT ACTION OPTIONS                                               |
|                                                                   |
| Define what happens after each outcome:                          |
|                                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Action          │ Description                                │ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ Log notes       │ Prompt for additional notes                │ |
| │ Schedule f/u    │ Show follow-up scheduling modal            │ |
| │ Retry later     │ Create task to retry in X hours            │ |
| │ Update info     │ Open contact edit modal                    │ |
| │ Mark invalid    │ Flag contact/phone as invalid              │ |
| │ Create task     │ Create custom follow-up task               │ |
| │ Send email      │ Open email composer                        │ |
| │ None            │ Just save the activity                     │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
+------------------------------------------------------------------+
|                                    [← Back]  [Cancel]  [Next →]   |
+------------------------------------------------------------------+
```

**Field Specification: Outcome Label**

| Property | Value |
|----------|-------|
| Field Name | `outcomes[n].label` |
| Type | Text Input |
| Label | "Label" |
| Required | Yes (at least one outcome) |
| Max Length | 50 characters |
| Validation | Alphanumeric with spaces |
| Error Messages | |
| - Empty | "Outcome label is required" |
| - Duplicate | "This outcome label already exists" |

**Field Specification: Outcome Value**

| Property | Value |
|----------|-------|
| Field Name | `outcomes[n].value` |
| Type | Text Input (auto-generated) |
| Label | "Value" |
| Required | Yes |
| Max Length | 30 characters |
| Validation | Snake_case, no spaces |
| Auto-generate | From label (lowercase, underscores) |
| Error Messages | |
| - Invalid | "Value must be lowercase with underscores only" |

**Time:** ~30 seconds

---

### Step 5: Configure Automation & Points

**User Action:** Click "Next" to proceed to Automation section

**System Response:**
- Form advances to Automation configuration
- Auto-logging integrations are shown
- Points and targets configuration is available
- Follow-up automation rules are displayed

**Screen State:**

```
+------------------------------------------------------------------+
| Create Activity Type                                    [× Close] |
+------------------------------------------------------------------+
| Step 4 of 4: Automation & Points                                  |
|                                                                   |
| Configure automatic logging and activity tracking                |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| AUTO-LOGGING                                                      |
|                                                                   |
| Automatically log this activity from integrations:               |
|                                                                   |
| ☐ Gmail / Google Workspace                                       |
|   ℹ Emails matching contacts will be auto-logged                 |
|                                                                   |
| ☐ Outlook / Microsoft 365                                        |
|   ℹ Emails matching contacts will be auto-logged                 |
|                                                                   |
| ☐ Google Calendar                                                |
|   ℹ Calendar events with contacts will be auto-logged            |
|                                                                   |
| ☐ RingCentral / Phone System                                     |
|   ℹ Calls will be auto-logged with duration                      |
|                                                                   |
| ☐ LinkedIn Sales Navigator                                       |
|   ℹ Messages and connections will be auto-logged                 |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| FOLLOW-UP AUTOMATION                                              |
|                                                                   |
| ☑ Auto-create follow-up task when outcome = [Left Voicemail ▼]  |
|   Follow-up delay: [24        ] hours                            |
|   Task title: [Follow-up call for {{contact_name}}          ]    |
|   Assign to: [Activity Owner                                ▼]  |
|                                                                   |
| [+ Add Follow-up Rule]                                           |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| POINTS & TARGETS                                                  |
|                                                                   |
| ☑ Count towards daily activity target                            |
|   Points per activity: [1.0      ]                               |
|   ℹ Users can earn activity points for productivity tracking     |
|                                                                   |
| Point multipliers (optional):                                    |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ When outcome = [Connected    ▼] → Multiply by [1.5   ]       │ |
| │ When duration > [30 minutes  ▼] → Add bonus of [0.5  ]       │ |
| │ [+ Add Multiplier Rule]                                      │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| NOTIFICATIONS                                                     |
|                                                                   |
| ☐ Notify manager when activity logged                            |
| ☐ Include in daily activity digest                               |
| ☑ Show in contact/entity activity timeline                       |
|                                                                   |
+------------------------------------------------------------------+
|                         [← Back]  [Cancel]  [Save Draft]  [Save]  |
+------------------------------------------------------------------+
```

**Field Specification: Activity Points**

| Property | Value |
|----------|-------|
| Field Name | `points` |
| Type | Decimal Input |
| Label | "Points per activity" |
| Required | No (defaults to 0) |
| Min Value | 0 |
| Max Value | 100 |
| Step | 0.25 |
| Default | 1.0 |
| Validation | Non-negative decimal |
| Error Messages | |
| - Invalid | "Points must be a positive number" |
| - Out of range | "Points must be between 0 and 100" |

**Field Specification: Follow-up Delay**

| Property | Value |
|----------|-------|
| Field Name | `followup_rules[n].delay_hours` |
| Type | Number Input |
| Label | "Follow-up delay" |
| Required | If follow-up enabled |
| Min Value | 1 |
| Max Value | 720 (30 days) |
| Default | 24 |
| Unit | Hours |
| Error Messages | |
| - Invalid | "Delay must be between 1 and 720 hours" |

**Time:** ~25 seconds

---

### Step 6: Save Activity Type

**User Action:** Click "Save" button

**System Response:**
- Activity type is validated
- Activity type is saved to database
- Success toast notification appears
- Modal closes
- Activity patterns list refreshes

**Backend Processing:**

```typescript
// Activity Type Creation
async function createActivityType(input: CreateActivityTypeInput): Promise<ActivityType> {
  // 1. Validate activity type configuration
  validateActivityType(input);

  // 2. Check for duplicate type names
  const existing = await db.activity_types.findFirst({
    where: { org_id: input.org_id, name: input.name }
  });
  if (existing) throw new Error('Activity type name already exists');

  // 3. Generate type key from name
  const typeKey = generateTypeKey(input.name);

  // 4. Create activity type record
  const activityType = await db.activity_types.create({
    data: {
      id: generateUUID(),
      org_id: input.org_id,
      name: input.name,
      type_key: typeKey,
      category: input.category,
      description: input.description,
      icon: input.icon,
      color: input.color,
      display_order: input.display_order,
      required_fields: input.required_fields,
      custom_fields: input.custom_fields,
      field_dependencies: input.field_dependencies,
      outcomes: input.outcomes,
      auto_log_integrations: input.auto_log_integrations,
      followup_rules: input.followup_rules,
      points: input.points,
      point_multipliers: input.point_multipliers,
      show_in_timeline: input.show_in_timeline,
      status: 'active',
      created_by: input.user_id,
      created_at: new Date(),
      updated_at: new Date()
    }
  });

  // 5. Create audit log
  await auditLog.create({
    action: 'activity_type.created',
    entity_type: 'activity_types',
    entity_id: activityType.id,
    user_id: input.user_id,
    new_values: activityType
  });

  // 6. Invalidate activity type cache
  await cache.invalidate(`activity_types:${input.org_id}`);

  return activityType;
}
```

```sql
-- Insert Activity Type
INSERT INTO activity_types (
  id, org_id, name, type_key, category, description,
  icon, color, display_order, required_fields, custom_fields,
  field_dependencies, outcomes, auto_log_integrations,
  followup_rules, points, point_multipliers, show_in_timeline,
  status, created_by, created_at, updated_at
) VALUES (
  $1, $2, $3, $4, $5, $6,
  $7, $8, $9, $10, $11,
  $12, $13, $14,
  $15, $16, $17, $18,
  'active', $19, NOW(), NOW()
);
```

**Success Message:**
- Toast: "Activity Type Created" (green, 4 seconds)
- Subtitle: "Call - Outbound is now available for activity logging"

**Time:** ~2 seconds

---

## Alternative Flows

### Alternative A: Edit Existing Activity Type

1. Admin clicks "Edit" on existing activity type
2. System loads configuration into editor
3. Admin modifies settings
4. System validates changes
5. Shows impact preview (X activities use this type)
6. Admin confirms changes
7. System updates type and refreshes cache

### Alternative B: Duplicate Activity Type

1. Admin clicks "⋮" → "Duplicate" on activity type
2. System creates copy with "(Copy)" suffix
3. Editor opens with duplicated settings
4. Admin modifies as needed
5. Saves as new activity type

### Alternative C: Import Activity Types

1. Admin clicks "Import Activity Types"
2. System shows file upload dialog
3. Admin uploads JSON configuration
4. System validates and previews types
5. Admin confirms import
6. Types are created (active by default)

### Alternative D: Disable Activity Type

1. Admin clicks "⋮" → "Disable" on activity type
2. Confirmation shows impact (X users have used this)
3. Admin confirms
4. Type is hidden from activity dropdowns
5. Historical activities remain visible

### Alternative E: Merge Activity Types

1. Admin selects two similar activity types
2. Clicks "Merge Types"
3. Chooses which type to keep
4. Confirms merge
5. All activities are reassigned to surviving type
6. Old type is deleted

---

## Postconditions

1. Activity type is saved to database with full configuration
2. Activity type appears in activity dropdowns for users
3. Audit log entry is created
4. Cache is invalidated for immediate availability
5. If auto-log configured, integration listeners are updated
6. Point tracking is enabled if configured

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Duplicate Name | Type name already exists | "An activity type with this name already exists" | Edit name |
| No Outcomes | Outcome list is empty | "At least one outcome option is required" | Add outcome |
| Invalid Points | Negative or invalid points value | "Points must be a positive number" | Fix value |
| Duplicate Outcome Value | Two outcomes have same value | "Outcome values must be unique" | Edit value |
| Invalid Field Dependency | Dependency references missing field | "Dependency references a field that is not enabled" | Fix dependency |
| Integration Not Configured | Auto-log enabled but integration not set up | "Gmail integration must be configured first" | Configure integration |
| Permission Denied | User lacks activities.configure | "You don't have permission to configure activity types" | Contact admin |
| Database Error | Connection or constraint failure | "Unable to save activity type. Please try again." | Retry |

---

## Keyboard Shortcuts

| Key | Context | Action |
|-----|---------|--------|
| `g a` | Any admin page | Go to Activity Patterns |
| `n` | Activity patterns list | New Activity Type |
| `e` | Type focused | Edit selected type |
| `d` | Type focused | Disable/Enable toggle |
| `Ctrl+S` / `Cmd+S` | Type editor | Save type |
| `Escape` | Type editor | Close modal (with confirmation if dirty) |
| `/` | Activity patterns list | Focus search field |
| `↑` / `↓` | Outcome list | Reorder outcomes |
| `?` | Any | Show keyboard shortcuts |

---

## Activity Logging Integration

```typescript
// Activity logging with pattern validation
async function logActivity(input: LogActivityInput): Promise<Activity> {
  // 1. Get activity type configuration
  const activityType = await getActivityType(input.type_key);

  // 2. Validate required fields
  for (const field of activityType.required_fields) {
    if (!input[field.name] && field.required) {
      throw new Error(`${field.label} is required`);
    }
  }

  // 3. Validate outcome
  if (activityType.outcomes.length > 0) {
    const validOutcome = activityType.outcomes.find(
      o => o.value === input.outcome
    );
    if (!validOutcome) {
      throw new Error('Invalid outcome selected');
    }
  }

  // 4. Calculate points
  let points = activityType.points;
  for (const multiplier of activityType.point_multipliers) {
    if (evaluateCondition(multiplier.condition, input)) {
      if (multiplier.type === 'multiply') {
        points *= multiplier.value;
      } else {
        points += multiplier.value;
      }
    }
  }

  // 5. Create activity record
  const activity = await db.activities.create({
    data: {
      id: generateUUID(),
      org_id: input.org_id,
      user_id: input.user_id,
      activity_type_id: activityType.id,
      type_key: activityType.type_key,
      contact_id: input.contact_id,
      entity_type: input.entity_type,
      entity_id: input.entity_id,
      occurred_at: input.occurred_at || new Date(),
      duration_minutes: input.duration_minutes,
      outcome: input.outcome,
      notes: input.notes,
      custom_fields: input.custom_fields,
      points_earned: points,
      source: input.source || 'manual',
      created_at: new Date()
    }
  });

  // 6. Process follow-up rules
  const outcome = activityType.outcomes.find(o => o.value === input.outcome);
  if (outcome) {
    await processFollowupRules(activity, activityType, outcome);
  }

  // 7. Update user activity stats
  await updateActivityStats(input.user_id, points);

  // 8. Publish activity event
  await eventBus.publish('activity.logged', {
    activity_id: activity.id,
    type_key: activityType.type_key,
    user_id: input.user_id,
    points: points
  });

  return activity;
}
```

---

## Test Cases

| Test ID | Scenario | Preconditions | Steps | Expected Result |
|---------|----------|---------------|-------|-----------------|
| ADMIN-ACT-001 | Create activity type - happy path | Admin logged in | 1. Click + New 2. Fill all fields 3. Add outcomes 4. Save | Type created, appears in list |
| ADMIN-ACT-002 | Create type - duplicate name | Type "Cold Call" exists | 1. Create new type 2. Name it "Cold Call" | Error: "Name already exists" |
| ADMIN-ACT-003 | Create type - no outcomes | Admin logged in | 1. Create type 2. Skip outcomes 3. Save | Error: "At least one outcome required" |
| ADMIN-ACT-004 | Edit existing type | Type with 100 activities | 1. Edit type 2. Change icon 3. Save | Type updated, activities unchanged |
| ADMIN-ACT-005 | Delete unused type | Type with 0 activities | 1. Click Delete 2. Confirm | Type deleted |
| ADMIN-ACT-006 | Delete type with activities | Type has 50 activities | 1. Click Delete | Warning: "50 activities use this type" |
| ADMIN-ACT-007 | Configure auto-log - Gmail | Gmail integration active | 1. Enable Gmail auto-log 2. Save | Emails auto-logged as activities |
| ADMIN-ACT-008 | Points calculation | Type with 1.0 base points | 1. Log activity with "Connected" outcome | Points = 1.5 (with multiplier) |
| ADMIN-ACT-009 | Follow-up automation | Voicemail rule configured | 1. Log call 2. Select "Left Voicemail" | Task created for 24 hours later |
| ADMIN-ACT-010 | Field dependency | Follow-up required on voicemail | 1. Log call 2. Select Voicemail 3. Skip follow-up | Error: "Follow-up date required" |
| ADMIN-ACT-011 | Custom field | Custom "Call Quality" field added | 1. Log call 2. Fill custom field | Custom field saved with activity |
| ADMIN-ACT-012 | Disable activity type | Active type exists | 1. Click Disable 2. Confirm | Type hidden from dropdowns |
| ADMIN-ACT-013 | Reorder outcomes | Type with 5 outcomes | 1. Drag outcome 3 to position 1 2. Save | Outcomes reordered in dropdown |
| ADMIN-ACT-014 | Import types | JSON file with 3 types | 1. Click Import 2. Upload file 3. Confirm | 3 types created |
| ADMIN-ACT-015 | Export configuration | 10 types configured | 1. Click Export 2. Download | JSON file with all type configs |

---

## Database Schema Reference

```sql
-- Activity Types Table
CREATE TABLE activity_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  type_key TEXT NOT NULL, -- e.g., 'call_outbound', 'email_sent'
  category TEXT NOT NULL CHECK (category IN (
    'communication', 'calendar', 'workflow', 'documentation',
    'research', 'administrative'
  )),
  description TEXT,
  icon TEXT DEFAULT '📞',
  color TEXT DEFAULT 'blue',
  display_order INTEGER DEFAULT 100,
  required_fields JSONB DEFAULT '[]', -- Array of field configurations
  custom_fields JSONB DEFAULT '[]', -- Array of custom field definitions
  field_dependencies JSONB DEFAULT '[]', -- Conditional field requirements
  outcomes JSONB DEFAULT '[]', -- Array of outcome options
  auto_log_integrations TEXT[] DEFAULT '{}', -- 'gmail', 'outlook', 'calendar'
  followup_rules JSONB DEFAULT '[]', -- Auto follow-up configuration
  points DECIMAL(5,2) DEFAULT 0,
  point_multipliers JSONB DEFAULT '[]', -- Conditional point multipliers
  show_in_timeline BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, name),
  UNIQUE(org_id, type_key)
);

-- Activities Table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  activity_type_id UUID NOT NULL REFERENCES activity_types(id),
  type_key TEXT NOT NULL, -- Denormalized for faster queries
  contact_id UUID REFERENCES contacts(id),
  entity_type TEXT, -- 'job', 'candidate', 'account', etc.
  entity_id UUID,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_minutes INTEGER,
  outcome TEXT,
  subject TEXT,
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  points_earned DECIMAL(5,2) DEFAULT 0,
  source TEXT DEFAULT 'manual', -- 'manual', 'gmail', 'calendar', 'api'
  external_id TEXT, -- ID from integration source
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Stats (aggregated daily)
CREATE TABLE activity_stats_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  activity_type_id UUID REFERENCES activity_types(id),
  count INTEGER DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,
  total_points DECIMAL(10,2) DEFAULT 0,
  outcomes JSONB DEFAULT '{}', -- Count by outcome
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id, date, activity_type_id)
);

-- Indexes for performance
CREATE INDEX idx_activities_user_date ON activities(user_id, occurred_at DESC);
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX idx_activities_contact ON activities(contact_id, occurred_at DESC);
CREATE INDEX idx_activities_type ON activities(activity_type_id, occurred_at DESC);
CREATE INDEX idx_activity_stats_user_date ON activity_stats_daily(user_id, date DESC);
```

---

## Related Use Cases

- [UC-ADMIN-009: Workflow Configuration](./09-workflow-configuration.md) - Workflows can trigger activity logging
- [UC-ADMIN-012: SLA Configuration](./12-sla-configuration.md) - SLAs can track activity-based metrics
- [UC-ADMIN-007: Integration Management](./07-integration-management.md) - Auto-logging from integrations
- [UC-REC-001: Log Activity](../01-recruiter/01-log-activity.md) - Recruiter activity logging flow

---

## UI Design System Reference

### Colors
- Communication category: `--mantine-color-blue-6`
- Calendar category: `--mantine-color-teal-6`
- Workflow category: `--mantine-color-violet-6`
- Documentation category: `--mantine-color-gray-6`
- Primary actions: `--mantine-color-brand-6` (#2D5016)

### Components
- Activity type cards: `<Paper p="md" withBorder>`
- Category headers: `<Text fw={600} size="sm" c="dimmed">`
- Icon picker: `<Popover>` with emoji grid
- Color picker: `<ColorSwatch>` group
- Outcome list: `<DragDropContext>` with `<Draggable>` items
- Form stepper: `<Stepper>` with `<Stepper.Step>`

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-04 | Initial documentation |
