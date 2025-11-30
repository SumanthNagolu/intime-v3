# Use Case: Log Activity

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-006 |
| Actor | Recruiter (Technical Recruiter) |
| Goal | Log communication/activity on any entity (lead, candidate, submission, job, account) |
| Frequency | 10-20 times per day |
| Estimated Time | 1-3 minutes |
| Priority | Critical |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "activity.create" permission (default for Recruiter role)
3. Entity (lead, candidate, job, submission, account) exists in the system
4. User is viewing an entity detail page OR uses global hotkey

---

## Trigger

One of the following:
- Just completed a call with a candidate
- Sent/received an email from a client
- Finished a screening meeting
- Sent a LinkedIn message to a prospect
- Need to add a quick note about a lead
- Need to schedule a follow-up task
- Manager requested activity documentation
- Compliance requirement to log all communications

---

## Main Flow (Click-by-Click)

### Step 1: Open Activity Log Modal

**Option A: From Entity Detail Page**

**User Action:** Click "Log Activity" button in entity header (or click "+" in Activity Feed section)

**System Response:**
- Button shows click state
- Modal slides in from right (300ms animation)
- Modal title: "Log Activity - {Entity Name}"
- Entity type and ID auto-detected from current context
- First activity type tab (Email) is active
- Subject field is focused (for Email/Meeting tabs)
- Keyboard cursor blinks in appropriate field

**Option B: Global Hotkey**

**User Action:** Press `Cmd+L` (Mac) or `Ctrl+L` (Windows) from anywhere in app

**System Response:**
- Modal slides in from right (300ms animation)
- Modal title: "Quick Log Activity"
- Entity selector shown at top (auto-populated if on entity page)
- First activity type tab active
- Subject field focused

**Screen State (Option A - From Entity Page):**
```
+----------------------------------------------------------+
|                      Log Activity - John Doe (Candidate)  |
|                                                      [×]  |
+----------------------------------------------------------+
| [EMAIL] │ CALL │ MEETING │ LINKEDIN │ NOTE                |
+----------------------------------------------------------+
|                                                           |
| Subject                                          [🕐]     |
| [                                              ]          |
|                                                           |
| Direction                                                 |
| [OUTBOUND]  [Inbound]                                     |
|                                                           |
| Body                                                      |
| [                                                      ]  |
| [                                                      ]  |
| [                                               ] 0/5000  |
|                                                           |
| Outcome                                                   |
| [Positive] [Neutral] [Negative]                          |
|                                                           |
| Point of Contact (Optional)                               |
| [Search contacts...                               ▼]     |
|                                                           |
| □ Schedule Follow-up Activity                             |
|                                                           |
+----------------------------------------------------------+
|                           [Cancel]  [Log Email] [Send >] |
+----------------------------------------------------------+
```

**Screen State (Option B - Global Hotkey):**
```
+----------------------------------------------------------+
|                              Quick Log Activity           |
|                                                      [×]  |
+----------------------------------------------------------+
| Log activity for:                                         |
| [Search entity... (Lead, Candidate, Job, etc.)     ▼]    |
|   🔍 John Doe (Candidate)                                |
|   🔍 Google - Senior Engineer (Job)                      |
|   🔍 Microsoft (Account)                                 |
+----------------------------------------------------------+
| [EMAIL] │ CALL │ MEETING │ LINKEDIN │ NOTE                |
+----------------------------------------------------------+
| ... (rest of form same as Option A)                       |
+----------------------------------------------------------+
```

**Time:** ~500ms

---

### Step 2: Select Activity Type (If Changing Default)

**User Action:** Click "CALL" tab

**System Response:**
- Tab becomes active (dark text, rust bottom border, white background)
- Other tabs become inactive (gray background, gray text)
- Form fields update based on activity type:
  - Subject field disappears (calls use auto-generated subjects)
  - Direction buttons remain (Outbound/Inbound)
  - Duration field appears
  - Body placeholder changes to "Log details about this call..."
  - Submit button text changes to "Log Call"

**Activity Type Tabs:**

| Tab | Icon | Label | Color |
|-----|------|-------|-------|
| `email` | ✉️ Mail | EMAIL | Blue |
| `call` | 📞 Phone | CALL | Green |
| `meeting` | 📅 Calendar | MEETING | Purple |
| `linkedin_message` | 💼 Linkedin | LINKEDIN | Blue |
| `note` | 📝 FileText | NOTE | Gray |

**Field Specification: Activity Type**
| Property | Value |
|----------|-------|
| Field Name | `activityType` |
| Type | Tab Selection |
| Required | Yes |
| Default | `email` |
| Options | |
| - `email` | "Email" - Sent/received email communication |
| - `call` | "Call" - Phone conversation |
| - `meeting` | "Meeting" - In-person or virtual meeting |
| - `linkedin_message` | "LinkedIn" - LinkedIn InMail or message |
| - `note` | "Note" - General note/observation |
| Icon Library | Lucide React |
| Keyboard Shortcut | `1-5` keys to switch tabs |

**Time:** ~1 second

---

### Step 3: Set Direction (For Email, Call, LinkedIn)

**User Action:** Click "Inbound" button (if receiving communication)

**System Response:**
- Button becomes active (dark background, white text)
- "Outbound" button becomes inactive (white background, gray text)
- Direction stored as 'inbound'

**Field Specification: Direction**
| Property | Value |
|----------|-------|
| Field Name | `direction` |
| Type | Button Toggle Group |
| Label | "Direction" |
| Required | No (but recommended for email, call, linkedin) |
| Default | `outbound` |
| Options | |
| - `outbound` | "Outbound" - Recruiter initiated |
| - `inbound` | "Inbound" - External party initiated |
| Visible For | `email`, `call`, `linkedin_message` only |
| Button Style | Toggle buttons (one active at a time) |

**Visual States:**
- Active: `bg-charcoal text-white border-charcoal`
- Inactive: `bg-white text-stone-500 border-stone-200 hover:border-stone-400`

**Time:** ~1 second

---

### Step 4: Enter Subject (For Email, Meeting)

**User Action:** Type subject, e.g., "Initial screening call scheduled"

**System Response:**
- Characters appear in input field
- Character counter updates: "28/200"
- Clock icon (🕐) visible to right of subject field

**Field Specification: Subject**
| Property | Value |
|----------|-------|
| Field Name | `subject` |
| Type | Text Input |
| Label | "Subject" |
| Placeholder | Varies by activity type |
| - Email | "Email subject line" |
| - Meeting | "Meeting topic" |
| Required | No (but recommended for email/meeting) |
| Max Length | 200 characters |
| Visible For | `email`, `meeting` only |
| Auto-suggestions | None |
| Character Counter | Yes (e.g., "0/200") |

**Auto-Generated Subjects (for calls and notes):**
- Call: "Call with {entity_name}" or "{direction} call"
- Note: "Note about {entity_name}"

**Time:** ~5 seconds

---

### Step 5: Set Activity Date/Time (Optional)

**User Action:** Click clock icon (🕐) next to subject field

**System Response:**
- Amber-colored date/time picker panel expands below subject
- Shows datetime-local input pre-populated with current time
- Shows helper text: "When did this activity happen? Defaults to now."
- Close button (×) appears in top-right of panel

**User Action:** Adjust date to yesterday, keep time as 2:30 PM

**System Response:**
- Selected date/time stored
- Panel remains open until user closes it

**User Action:** Click × to close date/time picker

**System Response:**
- Panel collapses (smooth animation)
- Clock icon remains visible (no visual indication of custom time set)

**Field Specification: Activity Date/Time**
| Property | Value |
|----------|-------|
| Field Name | `activityDate` |
| Type | datetime-local input |
| Label | "Activity Date & Time" |
| Default | Current date/time |
| Format | YYYY-MM-DDTHH:MM |
| Panel Style | Amber background (bg-amber-50 border-amber-200) |
| Purpose | For backdating activities that happened earlier |
| Trigger | Clock icon button next to subject |
| Min Date | None (can backdate indefinitely) |
| Max Date | Current date/time (cannot future-date completed activities) |

**Panel State:**
```
+----------------------------------------------------------+
| Activity Date & Time                                 [×] |
| ┌────────────────────────────────────────────────────┐  |
| │ 2024-11-29T14:30                                    │  |
| └────────────────────────────────────────────────────┘  |
| When did this activity happen? Defaults to now.          |
+----------------------------------------------------------+
```

**Time:** ~5 seconds

---

### Step 6: Enter Body/Notes

**User Action:** Type detailed notes in body textarea

Example for call:
```
Call with John to discuss Google opportunity:
- Currently exploring new roles
- Interested in hybrid positions
- Available to start in 2 weeks
- Strong React/Node.js background
- Will send resume by EOD
```

**System Response:**
- Text appears in textarea with line breaks preserved
- Character counter updates: "187/5000"
- Textarea auto-expands if more vertical space needed

**Field Specification: Body**
| Property | Value |
|----------|-------|
| Field Name | `body` |
| Type | Textarea |
| Label | "Body" or "Notes" |
| Placeholder | Varies by activity type |
| - Email | "Write your email content..." |
| - Call | "Log details about this call..." |
| - Meeting | "Meeting notes and key points..." |
| - LinkedIn | "LinkedIn message content..." |
| - Note | "Add a note about this {entity}..." |
| Required | No (but one of subject or body required) |
| Max Length | 5000 characters |
| Min Height | 128px (h-32) |
| Resize | No (resize-none) |
| Character Counter | Yes (e.g., "0/5000") |
| Rich Text | Plain text only (future: add rich text editor) |

**Validation:**
- At least one of `subject` or `body` must be filled
- Error message: "Please enter a subject or body for this activity"

**Time:** ~20-60 seconds (depending on detail)

---

### Step 7: Set Duration (For Calls, Meetings)

**User Action:** Click in duration field, type "30"

**System Response:**
- Number appears in field
- No validation error (30 is valid)

**Field Specification: Duration**
| Property | Value |
|----------|-------|
| Field Name | `durationMinutes` |
| Type | Number Input |
| Label | "Duration (minutes)" |
| Placeholder | "30" |
| Required | No |
| Min | 0 |
| Max | 480 (8 hours) |
| Step | 1 |
| Visible For | `call`, `meeting` only |
| Validation | Integer only |
| Error Messages | |
| - Too large | "Duration cannot exceed 480 minutes (8 hours)" |
| - Invalid | "Please enter a valid number" |

**Common Durations:**
- Quick call: 5-15 minutes
- Screening call: 15-30 minutes
- Technical interview: 45-60 minutes
- Client meeting: 30-60 minutes
- All-day event: 480 minutes

**Time:** ~3 seconds

---

### Step 8: Set Outcome

**User Action:** Click "Positive" button

**System Response:**
- "Positive" button becomes active (green background, green text, green border)
- Other outcome buttons remain inactive
- Outcome stored as 'positive'

**Field Specification: Outcome**
| Property | Value |
|----------|-------|
| Field Name | `outcome` |
| Type | Button Toggle Group (single select) |
| Label | "Outcome" |
| Required | No (but recommended for calls/meetings/emails) |
| Default | undefined (none selected) |
| Allow Deselect | Yes (click active button to deselect) |
| Options | |
| - `positive` | "Positive" - Good outcome, moved forward |
| - `neutral` | "Neutral" - No decision, neutral response |
| - `negative` | "Negative" - Rejection, not interested |

**Visual States:**
| Outcome | Active Style | Inactive Style |
|---------|-------------|----------------|
| Positive | `bg-green-100 text-green-700 border-green-200` | `bg-white text-stone-500 border-stone-200` |
| Neutral | `bg-stone-100 text-stone-600 border-stone-200` | `bg-white text-stone-500 border-stone-200` |
| Negative | `bg-red-100 text-red-700 border-red-200` | `bg-white text-stone-500 border-stone-200` |

**Use Cases:**
- **Positive:** Candidate interested, client approved, meeting went well
- **Neutral:** No commitment, need to follow up, gathering information
- **Negative:** Candidate declined, client rejected, not a fit

**Time:** ~2 seconds

---

### Step 9: Select Point of Contact (Optional)

**User Action:** Click "Point of Contact" dropdown

**System Response:**
- Dropdown opens showing searchable list
- Shows contacts associated with current entity (if account/candidate)
- Shows all POCs for organization if no entity-specific contacts

**User Action:** Type "Sarah" to search

**System Response:**
- List filters in real-time
- Shows "Sarah Johnson (Hiring Manager)"

**User Action:** Click "Sarah Johnson"

**System Response:**
- Dropdown closes
- Field shows: "Sarah Johnson (Hiring Manager)"
- POC ID stored

**Field Specification: Point of Contact**
| Property | Value |
|----------|-------|
| Field Name | `pocId` |
| Type | Searchable Dropdown (Combobox) |
| Label | "Point of Contact (Optional)" |
| Placeholder | "Search contacts..." |
| Required | No |
| Data Source | `point_of_contacts` table filtered by entity or org |
| Display Format | `{poc.name} ({poc.title})` |
| Search Fields | `name`, `email`, `title` |
| Allow Create | No (must create POC separately) |
| Visible For | All activity types |
| Purpose | Track who was involved in the communication |

**Entity-Specific Filtering:**
- For Account activities: Show POCs linked to that account
- For Candidate activities: Show candidate as POC if exists
- For Job activities: Show hiring managers for that job
- For Lead activities: Show POC if lead is converted to account

**Time:** ~5 seconds

---

### Step 10: Schedule Follow-up (Optional)

**User Action:** Click "Schedule Follow-up Activity" button with + icon

**System Response:**
- Button becomes active (blue background, blue text)
- Blue panel expands below button showing follow-up form
- Panel header: "Follow-up Task"
- Helper text: "This will create a new task linked to this activity"
- Follow-up subject field focused

**User Action:** Type "Send job description and benefits summary"

**System Response:**
- Text appears in follow-up subject field

**User Action:** Click in follow-up due date field, select date 3 days from now

**System Response:**
- Date picker opens
- User selects date
- Date appears in field: "2024-12-02"

**Field Specification: Follow-up Toggle**
| Property | Value |
|----------|-------|
| Field Name | `createFollowUp` |
| Type | Boolean Toggle (Button) |
| Label | "Schedule Follow-up Activity" |
| Default | `false` (unchecked) |
| Icon | Plus icon (Lucide `Plus`) |
| Panel Style | Blue theme (bg-blue-50 border-blue-200) |

**Field Specification: Follow-up Subject**
| Property | Value |
|----------|-------|
| Field Name | `followUpSubject` |
| Type | Text Input |
| Label | None (inline placeholder) |
| Placeholder | "Follow-up subject (e.g., 'Check in after demo')" |
| Required | No (defaults to auto-generated if blank) |
| Max Length | 200 characters |
| Auto-Generated Default | "Follow up on: {parent_subject}" or "Follow up on: {activity_type}" |

**Field Specification: Follow-up Due Date**
| Property | Value |
|----------|-------|
| Field Name | `followUpDueDate` |
| Type | Date Input |
| Label | "Follow-up Due Date *" |
| Required | **Yes** (if follow-up toggle is on) |
| Format | YYYY-MM-DD |
| Min Date | Today |
| Validation | Must be present if `createFollowUp` is true |
| Error Message | "Follow-up due date is required when scheduling a follow-up" |

**Follow-up Panel State:**
```
+----------------------------------------------------------+
| + Schedule Follow-up Activity                     [✓]    |
+----------------------------------------------------------+
| Follow-up Task       This will create a new task linked |
|                      to this activity                    |
|                                                           |
| [Send job description and benefits summary         ]     |
|                                                           |
| Follow-up Due Date *                                      |
| [2024-12-02                                     📅]      |
+----------------------------------------------------------+
```

**Time:** ~10 seconds

---

### Step 11: Add Additional Entities (Future Feature)

**Note:** This is a planned feature for multi-entity activities.

**User Action:** Click "+ Add Entity" button

**System Response:**
- Entity search dropdown appears
- User can link activity to multiple entities (e.g., log a call that discussed both a job and a candidate)
- Primary entity remains the original one
- Additional entities stored in `activity_entities` junction table (future schema)

**Field Specification: Additional Entities**
| Property | Value |
|----------|-------|
| Field Name | `additionalEntities` |
| Type | Multi-select Entity Search |
| Label | "Additional Entities (Optional)" |
| Required | No |
| Status | **Planned Feature** (not in v1) |
| Use Case | Call discussed multiple jobs, meeting covered multiple candidates |

**Time:** N/A (future feature)

---

### Step 12: Set Priority (For Future Tasks Only)

**Note:** Priority is only relevant when logging a task (not a completed activity).

For completed activities logged with this form, priority defaults to "medium" and is not shown.

For the follow-up task being created, priority also defaults to "medium".

**Field Specification: Priority**
| Property | Value |
|----------|-------|
| Field Name | `priority` |
| Type | Dropdown |
| Label | "Priority" |
| Default | `medium` |
| Options | |
| - `low` | "Low" 🟢 `bg-stone-100 text-stone-600` |
| - `medium` | "Medium" 🔵 `bg-blue-100 text-blue-600` |
| - `high` | "High" 🟡 `bg-amber-100 text-amber-700` |
| - `urgent` | "Urgent" 🔴 `bg-red-100 text-red-700` |
| Visible | Only when creating tasks (not in log activity flow) |
| Note | Hidden in this use case; used in Task Management use case |

**Time:** N/A (not visible in this flow)

---

### Step 13: Submit Activity

**User Action:** Click "Log Call" button (or press `Cmd+Enter`)

**System Response:**
1. Button shows loading state:
   - Text changes to "Saving..."
   - Spinner icon appears
   - Button becomes disabled
2. Form validates:
   - At least one of subject or body is filled ✓
   - If follow-up enabled, due date is filled ✓
3. API call: `POST /api/trpc/activities.log`
4. On success (200ms - 1s):
   - Modal closes (300ms slide-out animation)
   - Toast notification appears (top-right):
     - "Activity logged successfully" (green toast)
     - If follow-up created: "Follow-up task scheduled for Dec 2" (blue toast)
   - Activity feed on entity page refreshes
   - New activity appears at top of feed (highlighted for 3 seconds)
   - Activity counter increments (+1)
   - If entity is a lead: `lastContactedAt` updates to now
5. On error:
   - Modal stays open
   - Error toast: "Failed to log activity: {error message}"
   - Button returns to enabled state
   - Form data preserved

**Submit Button States:**

| State | Text | Icon | Style |
|-------|------|------|-------|
| Idle (valid) | "Log Call" | Send | `bg-charcoal text-white hover:bg-rust` |
| Idle (invalid) | "Log Call" | Send | `bg-charcoal text-white opacity-50 cursor-not-allowed` |
| Loading | "Saving..." | Spinner (animated) | `bg-charcoal text-white opacity-75` |

**Keyboard Shortcuts:**
| Key | Action |
|-----|--------|
| `Cmd+Enter` (Mac) or `Ctrl+Enter` (Win) | Submit form |
| `Esc` | Close modal (with unsaved changes warning) |

**Time:** ~2 seconds

---

## Postconditions

1. ✅ New activity record created in `activities` table
2. ✅ Activity status set to `completed`
3. ✅ Activity `completedAt` timestamp = now (or custom activity date if set)
4. ✅ Activity `dueDate` = now (or custom activity date)
5. ✅ Activity `assignedTo` = current user profile ID
6. ✅ Activity `performedBy` = current user profile ID
7. ✅ Activity `createdBy` = current user profile ID
8. ✅ Entity's `lastContactedAt` updated (if entity is lead and activity is email/call/meeting/linkedin)
9. ✅ If follow-up created:
   - New activity record created with `activityType` = 'follow_up'
   - Status = 'scheduled'
   - `parentActivityId` = original activity ID
   - `dueDate` = selected follow-up date
   - `assignedTo` = current user
10. ✅ Activity appears in entity's activity feed
11. ✅ Activity appears in user's task list (if follow-up created)
12. ✅ Activity count increments on entity detail page

---

## Events Logged

| Event | Payload | Trigger |
|-------|---------|---------|
| `activity.created` | `{ activity_id, entity_type, entity_id, activity_type, created_by, created_at }` | On activity creation |
| `activity.completed` | `{ activity_id, outcome, duration_minutes, completed_at }` | On activity log (auto-completed) |
| `follow_up.created` | `{ activity_id, parent_activity_id, due_date, assigned_to }` | If follow-up scheduled |
| `lead.contacted` | `{ lead_id, activity_id, contacted_at }` | If entity is lead |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Validation Failed | Both subject and body empty | "Please enter a subject or body for this activity" | Fill in at least one field |
| Duration Too Long | Duration > 480 minutes | "Duration cannot exceed 480 minutes (8 hours)" | Reduce duration |
| Invalid Follow-up | Follow-up enabled but no due date | "Follow-up due date is required when scheduling a follow-up" | Set follow-up date or disable follow-up |
| Entity Not Found | Selected entity deleted mid-session | "Entity no longer exists" | Refresh page or select different entity |
| Permission Denied | User lacks activity.create permission | "You don't have permission to log activities" | Contact Admin |
| Network Error | API call failed | "Network error. Please try again." | Retry |
| User Profile Missing | No user profile found for auth user | "User profile not found" | Contact support |
| POC Not Found | Selected POC deleted | "Selected contact no longer exists" | Select different POC or leave blank |

---

## Keyboard Shortcuts (During Flow)

| Key | Action |
|-----|--------|
| `Cmd+L` or `Ctrl+L` | Open quick log activity modal (global) |
| `Esc` | Close modal (shows unsaved changes warning if form dirty) |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `1-5` | Switch activity type tabs (1=Email, 2=Call, 3=Meeting, 4=LinkedIn, 5=Note) |
| `Cmd+Enter` or `Ctrl+Enter` | Submit form |
| `↑` `↓` | Navigate dropdown options (when open) |
| `Enter` | Select dropdown option |
| `Space` | Toggle button groups (direction, outcome) |

---

## Alternative Flows

### A1: Quick Log from Email (Email Integration)

**Trigger:** User clicks "Log in InTime" button in email client (Gmail/Outlook plugin)

**Flow:**
1. Email content auto-populated:
   - Subject = Email subject line
   - Body = Email body (plain text)
   - Direction = Detected (inbound if in Inbox, outbound if in Sent)
   - Activity type = Email
2. Entity auto-detected:
   - Matches email address to POC
   - Finds associated candidate/account/lead
   - Pre-selects entity
3. User reviews and adjusts if needed
4. User clicks "Log Email"
5. Activity logged with email metadata

**Time:** ~30 seconds

---

### A2: Voice-to-Text Integration (Future Feature)

**Trigger:** User clicks microphone icon in body field

**Flow:**
1. Browser requests microphone permission
2. User clicks "Record" button
3. User speaks notes: "Had a great call with John. He's very interested in the Google role. Will send him the job description and schedule a technical interview next week."
4. Speech-to-text API converts to text
5. Text appears in body field
6. User reviews and edits
7. User submits

**Time:** ~45 seconds

**API:** Web Speech API or external service (e.g., OpenAI Whisper)

---

### A3: Log from Calendar Event (Calendar Integration)

**Trigger:** User completes a calendar event and clicks "Log Activity" in calendar notification

**Flow:**
1. Activity modal opens with:
   - Activity type = Meeting
   - Subject = Calendar event title
   - Duration = Actual event duration
   - Activity date = Event start time
   - Entity = Detected from event attendees or event description
2. User adds notes in body
3. User sets outcome
4. User submits

**Time:** ~1 minute

---

### A4: Batch Activity Log (Future Feature)

**Trigger:** User selects multiple entities (e.g., 10 candidates) and clicks "Log Activity to All"

**Flow:**
1. Batch activity modal opens
2. User selects activity type: Email
3. User enters subject: "Follow-up on application status"
4. User enters body: "Template email content..."
5. User sets direction: Outbound
6. System creates one activity per selected entity (10 activities)
7. Success message: "10 activities logged"

**Time:** ~2 minutes for 10 entities

**Use Case:** Bulk email outreach, mass call campaign logging

---

### A5: Log Activity with Template (Future Feature)

**Trigger:** User selects activity type and clicks "Use Template" button

**Flow:**
1. Template selector dropdown appears
2. Shows saved templates:
   - "Initial outreach call"
   - "Follow-up after interview"
   - "Client check-in"
3. User selects template
4. Form pre-fills with template content:
   - Subject
   - Body structure
   - Default outcome
   - Default follow-up settings
5. User customizes as needed
6. User submits

**Time:** ~30 seconds

---

### A6: Log and Continue (Save and Add Another)

**Trigger:** User needs to log multiple activities in sequence

**Flow:**
1. User submits first activity
2. Instead of clicking "Log Call", user clicks "Log and Add Another" (future button)
3. Activity saves
4. Toast notification: "Activity logged"
5. Modal stays open
6. Form resets to defaults
7. Same entity pre-selected
8. User can immediately log next activity

**Time:** ~1 minute per activity

---

### A7: Email Forwarding to Log Activity (Future Feature)

**Trigger:** User forwards an email to `log@intime.com` with entity reference in subject

**Example Email:**
```
From: recruiter@company.com
To: log@intime.com
Subject: [LEAD-123] Initial outreach email
Body: Email content...
```

**Flow:**
1. InTime email parser receives email
2. Extracts entity ID from subject: `LEAD-123`
3. Parses email content
4. Creates activity:
   - Entity type = Lead
   - Entity ID = 123
   - Activity type = Email
   - Subject = Email subject (without [LEAD-123])
   - Body = Email body
   - Direction = Outbound (if from user's email address)
5. Sends confirmation email: "Activity logged for Lead #123"

**Time:** ~10 seconds (automated)

**Configuration:** User must set up email forwarding alias

---

## Activity Type Details

### Email Activity

**Fields Shown:**
- ✅ Subject
- ✅ Body
- ✅ Direction (Outbound/Inbound)
- ✅ Outcome
- ✅ Point of Contact
- ✅ Activity Date/Time (clock icon)
- ✅ Follow-up scheduling

**Fields Hidden:**
- ❌ Duration

**Submit Button:** "Log Email"

**Icon:** Mail (envelope)

**Color Theme:** Blue

**Auto-populated Subject Examples:**
- "Re: Google Senior Engineer position"
- "Introduction to InTime staffing services"
- "Resume submission for React Developer role"

---

### Call Activity

**Fields Shown:**
- ✅ Body (no subject field)
- ✅ Direction (Outbound/Inbound)
- ✅ Duration
- ✅ Outcome
- ✅ Point of Contact
- ✅ Follow-up scheduling

**Fields Hidden:**
- ❌ Subject (auto-generated)
- ❌ Activity Date/Time clock icon (calls default to now)

**Submit Button:** "Log Call"

**Icon:** Phone

**Color Theme:** Green

**Auto-generated Subject:**
- "Outbound call" (if direction = outbound)
- "Inbound call" (if direction = inbound)
- "Call with {entity_name}"

**Typical Durations:**
- Quick check-in: 5-10 minutes
- Screening call: 15-30 minutes
- Technical interview: 45-60 minutes

---

### Meeting Activity

**Fields Shown:**
- ✅ Subject
- ✅ Body
- ✅ Duration
- ✅ Outcome
- ✅ Point of Contact
- ✅ Activity Date/Time (clock icon)
- ✅ Follow-up scheduling

**Fields Hidden:**
- ❌ Direction (meetings are always two-way)

**Submit Button:** "Log Meeting"

**Icon:** Calendar

**Color Theme:** Purple

**Typical Meeting Types:**
- Client kickoff meeting
- Candidate interview
- Team standup
- Strategy session

---

### LinkedIn Message Activity

**Fields Shown:**
- ✅ Subject (optional)
- ✅ Body
- ✅ Direction (Outbound/Inbound)
- ✅ Outcome
- ✅ Point of Contact
- ✅ Follow-up scheduling

**Fields Hidden:**
- ❌ Duration
- ❌ Activity Date/Time (defaults to now)

**Submit Button:** "Log Message"

**Icon:** Linkedin

**Color Theme:** Blue

**Use Cases:**
- InMail to passive candidate
- Connection request message
- Follow-up on candidate profile view
- Referral request

---

### Note Activity

**Fields Shown:**
- ✅ Body (no subject field)
- ✅ Point of Contact (optional)

**Fields Hidden:**
- ❌ Subject (auto-generated)
- ❌ Direction
- ❌ Duration
- ❌ Outcome (notes are informational, no outcome)
- ❌ Follow-up scheduling (use tasks for this)

**Submit Button:** "Save Note"

**Icon:** FileText

**Color Theme:** Gray

**Use Cases:**
- Quick observation about candidate
- Internal note about client preference
- Research findings on company
- Manager feedback on submission

**Auto-generated Subject:**
- "Note about {entity_name}"

---

## Activity Feed Rendering

After logging an activity, it appears in the entity's activity feed.

### Feed Item Structure

```
+----------------------------------------------------------+
| 📞 Call (Outbound)                           2 mins ago  |
| John Recruiter → Sarah Johnson (Hiring Manager)          |
+----------------------------------------------------------+
| Duration: 30 minutes                                      |
| Outcome: Positive                                         |
|                                                           |
| Had a great call with John. He's very interested in the  |
| Google role. Will send him the job description and...    |
|                                                           |
| Follow-up: Send job description (Due: Dec 2, 2024)       |
+----------------------------------------------------------+
```

**Feed Item Components:**

| Component | Description |
|-----------|-------------|
| Icon | Activity type icon (Mail, Phone, Calendar, etc.) |
| Type Label | "Call", "Email", "Meeting", "LinkedIn", "Note" |
| Direction Badge | "(Outbound)" or "(Inbound)" if applicable |
| Timestamp | Relative time (e.g., "2 mins ago", "3 hours ago", "Yesterday") |
| Actor | "John Recruiter" (performedBy user) |
| Arrow | → (indicates direction to POC) |
| POC | "Sarah Johnson (Hiring Manager)" if applicable |
| Duration | "Duration: 30 minutes" if applicable |
| Outcome Badge | Color-coded badge: Positive (green), Neutral (gray), Negative (red) |
| Body Excerpt | First 200 characters of body with "..." if truncated |
| Follow-up Link | If follow-up created, shows linked task with due date |

**Feed Item Colors:**

| Activity Type | Border Color | Icon Color |
|--------------|-------------|-----------|
| Email | Blue | `text-blue-600` |
| Call | Green | `text-green-600` |
| Meeting | Purple | `text-purple-600` |
| LinkedIn | Blue | `text-blue-600` |
| Note | Gray | `text-stone-500` |

---

## Quick Templates (Future Feature)

### Call Templates

**Template: "Screening Call - Positive"**
```
Outcome: Positive
Duration: 20 minutes
Body:
Initial screening call went well:
- Background aligned with requirements
- Available for immediate start
- Salary expectations within range: $___
- Next steps: ___
```

**Template: "Screening Call - Not a Fit"**
```
Outcome: Negative
Duration: 15 minutes
Body:
Screening call revealed this is not a fit:
- Reason: ___
- Status: Will keep in database for future opportunities
```

**Template: "Client Check-in Call"**
```
Outcome: Neutral
Duration: 15 minutes
Body:
Client check-in call:
- Still interviewing candidates
- Timeline: ___
- Next steps: ___
```

### Email Templates

**Template: "Initial Candidate Outreach"**
```
Subject: Exciting opportunity at [Client Name]
Direction: Outbound
Body:
Hi [Name],

I came across your profile and believe you'd be a great fit for a [Job Title] role at [Client Name].

Key details:
- Location: ___
- Rate: $___
- Duration: ___

Would you be interested in learning more?

Best regards,
[Your name]
```

**Template: "Submission Confirmation"**
```
Subject: Profile submitted to [Client Name]
Direction: Outbound
Body:
Hi [Name],

I've submitted your profile to [Client Name] for the [Job Title] position.

Next steps:
- Client will review within 2-3 business days
- I'll reach out as soon as I hear back

Thanks for your patience!
```

### Meeting Templates

**Template: "Client Kickoff Meeting"**
```
Subject: Kickoff meeting for [Job Title] search
Duration: 45 minutes
Outcome: Positive
Body:
Kickoff meeting with [Client Name]:

Requirements discussed:
- Must-have skills: ___
- Nice-to-have skills: ___
- Timeline: ___
- Interview process: ___

Next steps:
- Begin sourcing candidates
- Submit first batch by ___
```

---

## Escalation Rules for Overdue Follow-ups

When a follow-up task is created from a logged activity, escalation rules apply if the task becomes overdue.

### Escalation Timeline

| Overdue By | System Action | Notification |
|-----------|---------------|--------------|
| 1 day | Yellow flag on task | Email to assignee: "1 task overdue" |
| 3 days | Orange flag on task | Email to assignee + manager: "3 days overdue" |
| 7 days | Red flag on task | Email to assignee + manager + alert in dashboard |
| 14 days | Critical alert | Email to senior management + task escalated |

### Escalation Field

**Field Specification: Escalation Date**
| Property | Value |
|----------|-------|
| Field Name | `escalationDate` |
| Type | Timestamp |
| Calculation | `dueDate` + escalation threshold |
| Default Threshold | 3 days for high priority, 7 days for medium |
| Purpose | Trigger alerts for overdue follow-ups |
| Visible in UI | No (calculated automatically) |

**Example:**
- Follow-up created with due date: Dec 2, 2024
- Priority: Medium
- Escalation date: Dec 9, 2024 (due date + 7 days)
- If not completed by Dec 9, escalation triggers

---

## Related Use Cases

- [01-daily-workflow.md](./01-daily-workflow.md) - Activity logging is core to daily workflow
- [03-source-candidates.md](./03-source-candidates.md) - Log outreach activities when sourcing
- [04-submit-candidate.md](./04-submit-candidate.md) - Log submission activities
- [05-schedule-interview.md](./05-schedule-interview.md) - Create meeting activities for interviews
- [08-manage-tasks.md](./08-manage-tasks.md) - Follow-up tasks appear in task list

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Log email with subject and body | Activity created successfully |
| TC-002 | Log call with duration and outcome | Activity created with all fields saved |
| TC-003 | Submit with empty subject and body | Error: "Please enter a subject or body" |
| TC-004 | Log activity and create follow-up | Two activities created, linked by parentActivityId |
| TC-005 | Follow-up enabled but no due date | Error: "Follow-up due date is required" |
| TC-006 | Duration > 480 minutes | Error: "Duration cannot exceed 480 minutes" |
| TC-007 | Cancel mid-entry with unsaved changes | Warning: "You have unsaved changes. Discard?" |
| TC-008 | Press Cmd+L from entity page | Modal opens with entity pre-selected |
| TC-009 | Press Cmd+L from dashboard | Modal opens with entity selector |
| TC-010 | Log activity for lead | Lead.lastContactedAt updates |
| TC-011 | Log activity for job | Job.lastContactedAt does NOT update (jobs don't have this field) |
| TC-012 | Network error during submit | Error toast, modal stays open, data preserved |
| TC-013 | Select POC for call | POC name displayed in feed |
| TC-014 | Log meeting without POC | Activity saved, no POC shown in feed |
| TC-015 | Set custom activity date (backdate) | Activity saved with custom completedAt timestamp |
| TC-016 | Submit via Cmd+Enter | Form submits successfully |
| TC-017 | Switch activity types | Form fields update correctly |
| TC-018 | Log activity with voice-to-text (future) | Speech converted to text in body field |
| TC-019 | Use activity template (future) | Form pre-fills with template data |
| TC-020 | Log and add another (future) | First activity saved, form resets, modal stays open |

---

## Accessibility

### Screen Reader Support

| Element | ARIA Label | Role |
|---------|-----------|------|
| Activity type tabs | "Email activity type", "Call activity type", etc. | `tab` |
| Direction buttons | "Outbound direction", "Inbound direction" | `radio` |
| Outcome buttons | "Positive outcome", "Neutral outcome", "Negative outcome" | `button` |
| Follow-up toggle | "Schedule follow-up activity" | `checkbox` |
| Submit button | "Log email activity" (dynamic based on type) | `button` |
| Close button | "Close activity log modal" | `button` |

### Keyboard Navigation

All interactive elements must be keyboard accessible:
- Tab order: Activity tabs → Subject → Clock button → Direction → Body → Duration → Outcome → POC → Follow-up toggle → Follow-up fields → Submit
- Arrow keys: Navigate within button groups (direction, outcome)
- Enter/Space: Activate buttons
- Escape: Close modal

### Focus Management

- On modal open: Focus on first input (subject or body)
- On error: Focus on first invalid field
- On close: Return focus to trigger button

---

## Performance Metrics

### API Response Times

| Endpoint | Expected Response Time | SLA |
|----------|----------------------|-----|
| `POST /api/trpc/activities.log` | < 200ms | 95th percentile < 500ms |
| Activity feed refresh | < 300ms | 95th percentile < 1s |
| Follow-up creation | < 300ms | 95th percentile < 500ms |

### User Experience Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to log activity | < 1 minute average | User session tracking |
| Activities logged per day per recruiter | 10-20 | Analytics dashboard |
| Follow-up completion rate | > 80% | Task completion tracking |
| Error rate | < 1% | Error logging |

---

## Database Schema Reference

### Activities Table

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Polymorphic association
  entity_type TEXT NOT NULL, -- 'lead' | 'deal' | 'account' | 'candidate' | 'submission' | 'job' | 'poc'
  entity_id UUID NOT NULL,

  -- Activity details
  activity_type TEXT NOT NULL, -- 'email' | 'call' | 'meeting' | 'note' | 'linkedin_message' | 'task' | 'follow_up' | 'reminder'
  status TEXT NOT NULL DEFAULT 'open', -- 'scheduled' | 'open' | 'in_progress' | 'completed' | 'skipped' | 'cancelled'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low' | 'medium' | 'high' | 'urgent'

  -- Content
  subject TEXT,
  body TEXT,
  direction TEXT, -- 'inbound' | 'outbound'

  -- Timing
  scheduled_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  escalation_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  skipped_at TIMESTAMPTZ,
  duration_minutes INTEGER,

  -- Outcome
  outcome TEXT, -- 'positive' | 'neutral' | 'negative'

  -- Assignment
  assigned_to UUID NOT NULL REFERENCES user_profiles(id),
  performed_by UUID REFERENCES user_profiles(id),
  poc_id UUID REFERENCES point_of_contacts(id),

  -- Follow-up chain
  parent_activity_id UUID REFERENCES activities(id),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Indexes
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_due_date ON activities(due_date);
CREATE INDEX idx_activities_assigned_to ON activities(assigned_to);
CREATE INDEX idx_activities_org_id ON activities(org_id);
```

---

## API Endpoint Documentation

### `POST /api/trpc/activities.log`

**Purpose:** Log a completed activity (email, call, meeting, note, linkedin_message)

**Input:**
```typescript
{
  entityType: 'lead' | 'deal' | 'account' | 'candidate' | 'submission' | 'job' | 'poc';
  entityId: string; // UUID
  activityType: 'email' | 'call' | 'meeting' | 'note' | 'linkedin_message';
  subject?: string; // Optional, max 200 chars
  body?: string; // Optional, max 5000 chars
  direction?: 'inbound' | 'outbound'; // For email, call, linkedin_message
  durationMinutes?: number; // 0-480, for call, meeting
  outcome?: 'positive' | 'neutral' | 'negative';
  pocId?: string; // UUID of point of contact

  // Follow-up creation
  createFollowUp?: boolean; // Default: false
  followUpSubject?: string; // Optional, defaults to auto-generated
  followUpDueDate?: Date; // Required if createFollowUp = true
}
```

**Output:**
```typescript
{
  activity: {
    id: string;
    entityType: string;
    entityId: string;
    activityType: string;
    status: 'completed';
    subject: string | null;
    body: string | null;
    direction: string | null;
    durationMinutes: number | null;
    outcome: string | null;
    assignedTo: string;
    performedBy: string;
    pocId: string | null;
    completedAt: Date;
    createdAt: Date;
  };
  followUp: {
    id: string;
    activityType: 'follow_up';
    status: 'scheduled';
    subject: string;
    dueDate: Date;
    parentActivityId: string;
  } | null;
}
```

**Error Responses:**
- `400` - Validation error (missing required fields, invalid values)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (no permission to create activities)
- `404` - Entity not found
- `500` - Internal server error

---

## UI/UX Design Notes

### Modal Design

- **Width:** 600px (desktop), 100% (mobile)
- **Height:** Auto (max 90vh, scrollable if needed)
- **Border Radius:** 16px (1rem)
- **Shadow:** `shadow-2xl` (large shadow for modal prominence)
- **Backdrop:** Semi-transparent dark overlay (`bg-black/50`)
- **Animation:** Slide in from right (300ms ease-out)

### Color Palette

| Element | Color | Tailwind Class |
|---------|-------|---------------|
| Primary action | Charcoal (#2C2C2C) | `bg-charcoal` |
| Hover state | Rust (#E85D04) | `bg-rust` |
| Positive outcome | Green | `bg-green-100 text-green-700` |
| Neutral outcome | Gray | `bg-stone-100 text-stone-600` |
| Negative outcome | Red | `bg-red-100 text-red-700` |
| Follow-up panel | Blue | `bg-blue-50 border-blue-200` |
| Activity date panel | Amber | `bg-amber-50 border-amber-200` |

### Typography

| Element | Font Size | Font Weight | Class |
|---------|-----------|-------------|-------|
| Modal title | 20px | Bold (700) | `text-xl font-bold` |
| Tab labels | 11px | Bold (700) | `text-xs font-bold uppercase tracking-widest` |
| Field labels | 11px | Bold (700) | `text-xs font-bold uppercase tracking-widest` |
| Input text | 14px | Normal (400) | `text-sm` |
| Button text | 11px | Bold (700) | `text-xs font-bold uppercase tracking-widest` |
| Helper text | 12px | Normal (400) | `text-xs` |

### Spacing

- Modal padding: 24px (`p-6`)
- Section spacing: 16px (`space-y-4`)
- Button gap: 8px (`gap-2`)
- Input padding: 12px (`p-3`)

---

## Mobile Responsiveness

### Modal on Mobile

- Full screen modal (100vw, 100vh)
- Slide up from bottom instead of right
- Activity type tabs scroll horizontally if needed
- Sticky header with title and close button
- Sticky footer with submit button
- Scrollable content area between header and footer

### Touch Interactions

- Larger touch targets (minimum 44x44px)
- Swipe down to dismiss modal
- Tap outside to dismiss (with unsaved changes warning)

### Mobile-Specific Optimizations

- Use native date/time pickers (`<input type="datetime-local">` displays native picker on mobile)
- Autocomplete "off" for custom dropdowns (prevent browser autocomplete interference)
- Virtual keyboard handling: Scroll input into view when focused

---

*Last Updated: 2024-11-30*
