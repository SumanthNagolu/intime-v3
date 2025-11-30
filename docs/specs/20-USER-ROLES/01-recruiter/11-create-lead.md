# Use Case: Create Cross-Pillar Lead

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-011 |
| Actor | Recruiter (Technical Recruiter) |
| Goal | Create a lead for opportunities discovered outside their pillar (cross-pollination) |
| Frequency | 2-4 times per week |
| Estimated Time | 3-5 minutes |
| Priority | High (Cross-pillar collaboration, revenue growth) |
| Business Impact | Cross-pillar revenue sharing, lead sourcing credits, collaboration metrics |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "lead.create" permission (default for Recruiter role)
3. User is in any work context (job detail, candidate call, client meeting, etc.)
4. User discovered an opportunity outside their pillar
5. Opportunity has enough info to create a minimal lead (company name or contact name + opportunity type)

---

## Trigger

One of the following:
- During candidate screening call, candidate mentions their company is hiring internally → TA Lead
- Client mentions need for bench consultants for other projects → Bench Sales Lead
- Client asks about training programs for their team → Academy Lead
- Discovered new company during prospecting → Sales/CRM Lead
- Referral from existing placement about new opportunity → Any pillar lead
- Recruiter clicks "Create Lead" hotkey (Cmd+L) or button

---

## Main Flow (Click-by-Click)

### Step 1: Trigger Lead Creation

**Context:** Recruiter is in any screen (job detail, candidate profile, call notes, etc.)

**User Action:** Press `Cmd+L` hotkey OR click "Create Lead" button in global action bar

**System Response:**
- Lead creation modal slides in from right (300ms animation)
- Modal overlays current screen (dim background)
- Modal title: "Create Cross-Pillar Lead"
- First field (Lead Type) is focused
- Keyboard cursor ready

**Screen State:**
```
+----------------------------------------------------------+
|                          CREATE CROSS-PILLAR LEAD        |
|                                                      [×] |
+----------------------------------------------------------+
| Step 1 of 3: Lead Type & Source                         |
|                                                          |
| What type of opportunity did you discover? *             |
|                                                          |
| ○ TA Lead - Internal hiring opportunity                  |
|   (Company needs to hire their own employees)            |
|                                                          |
| ○ Bench Sales Lead - Bench consultant placement          |
|   (Client needs consultants from our bench)              |
|                                                          |
| ○ Sales Lead - New client/account opportunity            |
|   (New company to add to pipeline)                       |
|                                                          |
| ○ Academy Lead - Training/certification opportunity      |
|   (Company needs training for their team)                |
|                                                          |
+----------------------------------------------------------+
|                           [Cancel]  [Next: Details →]   |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 2: Select Lead Type

**User Action:** Click on one of the lead type radio buttons (e.g., "Bench Sales Lead")

**System Response:**
- Radio button becomes selected (filled circle)
- Contextual help text appears below selection
- "Next" button becomes enabled (was disabled)

**Field Specification: Lead Type**
| Property | Value |
|----------|-------|
| Field Name | `leadType` |
| Type | Radio Button Group |
| Label | "What type of opportunity did you discover?" |
| Required | Yes |
| Options | 4 mutually exclusive options |
| Default | None (user must select) |
| Validation | Must select one option |
| Error Messages | |
| - Not selected | "Please select a lead type" |

**Lead Type Options:**

| Value | Display Label | Description | Target Team | Icon |
|-------|---------------|-------------|-------------|------|
| `ta_lead` | TA Lead | Internal hiring opportunity - Company hiring their own employees | TA Team | 👔 |
| `bench_lead` | Bench Sales Lead | Bench consultant placement - Client needs consultants from bench | Bench Sales Team | 💼 |
| `sales_lead` | Sales Lead | New client/account opportunity - New company for pipeline | Sales/Account Mgmt | 🎯 |
| `academy_lead` | Academy Lead | Training/certification opportunity - Training for client team | Academy Team | 🎓 |

**Time:** ~3 seconds

---

### Step 3: Review Lead Type Selection

**User Action:** Review help text for selected lead type

**System Response:**
- Help text appears below selection:

**TA Lead Help Text:**
```
💡 Great find! This company is hiring internally. Our TA team will help them
   with their hiring needs. You'll get credit for this cross-pillar lead!

   Examples:
   • "We're hiring 5 software engineers this quarter"
   • "Looking for a VP of Engineering"
   • "Need to build out our data science team"
```

**Bench Sales Lead Help Text:**
```
💡 Perfect! This client needs bench consultants. Our Bench Sales team will
   match them with available consultants. You'll earn lead sourcing credit!

   Examples:
   • "Need a Java developer to start next week"
   • "Looking for contractors with cloud experience"
   • "Need to fill 3 positions ASAP"
```

**Sales Lead Help Text:**
```
💡 Nice! This is a new company opportunity. Our Sales team will nurture this
   relationship. You'll get credit for bringing in this new account!

   Examples:
   • Discovered new company during research
   • Referral from existing client
   • Met someone at networking event
```

**Academy Lead Help Text:**
```
💡 Excellent! This company needs training services. Our Academy team will
   design a custom training program. You'll earn cross-pillar commission!

   Examples:
   • "Need to upskill our team on React"
   • "Looking for AWS certification training"
   • "Want to train 20 people on Agile"
```

**Time:** ~5 seconds

---

### Step 4: Click "Next: Details"

**User Action:** Click "Next: Details →" button

**System Response:**
- Form validates Step 1 (lead type selected)
- Slides to Step 2 (300ms animation)
- Step 2 form pre-loads based on selected lead type
- Different fields show based on lead type selected

**Screen State (Step 2 - Bench Sales Lead Selected):**
```
+----------------------------------------------------------+
|                          CREATE CROSS-PILLAR LEAD        |
|                                                      [×] |
+----------------------------------------------------------+
| Step 2 of 3: Opportunity Details                         |
|                                                          |
| 💼 Bench Sales Lead                                      |
|                                                          |
| Company Name *                                           |
| [                                              ] 0/200   |
|                                                          |
| Contact Name                                             |
| First Name              Last Name                        |
| [                  ]    [                         ]      |
|                                                          |
| Contact Email                                            |
| [                                              ]         |
|                                                          |
| Contact Phone                                            |
| [                                              ]         |
|                                                          |
| Opportunity Description *                                |
| [                                                      ] |
| [                                                      ] |
| [                                               ] 0/500  |
|                                                          |
| Where did you discover this? *                           |
| ○ Candidate mentioned it   ○ Client mentioned it         |
| ○ During job call          ○ Referral                    |
| ○ Other: [_______________]                               |
|                                                          |
+----------------------------------------------------------+
|                [← Back]  [Cancel]  [Next: Priority →]   |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 5: Enter Company Name

**User Action:** Type company name, e.g., "TechCorp Industries"

**System Response:**
- Characters appear in input field
- Character counter updates: "18/200"
- Autocomplete suggestions appear if company exists in system
- If company exists: Shows message "Company already in system - will link to existing account"

**Field Specification: Company Name**
| Property | Value |
|----------|-------|
| Field Name | `companyName` |
| Type | Text Input with Autocomplete |
| Label | "Company Name" |
| Placeholder | "e.g., Acme Corporation" |
| Required | Yes |
| Max Length | 200 characters |
| Min Length | 2 characters |
| Validation | Not empty, basic text validation |
| Autocomplete | Searches existing accounts and leads |
| Duplicate Check | Warns if company already exists |
| Error Messages | |
| - Empty | "Company name is required" |
| - Too short | "Company name must be at least 2 characters" |
| Database Mapping | `leads.company_name` |

**Time:** ~5 seconds

---

### Step 6: Enter Contact Information (Optional but Recommended)

**User Action:** Enter contact first name, last name, email, and/or phone

**System Response:**
- Each field updates as user types
- Email field validates format in real-time
- Phone field auto-formats to standard format

**Field Specification: Contact First Name**
| Property | Value |
|----------|-------|
| Field Name | `firstName` |
| Type | Text Input |
| Label | "First Name" |
| Placeholder | "John" |
| Required | No (but recommended) |
| Max Length | 100 characters |
| Database Mapping | `leads.first_name` |

**Field Specification: Contact Last Name**
| Property | Value |
|----------|-------|
| Field Name | `lastName` |
| Type | Text Input |
| Label | "Last Name" |
| Placeholder | "Smith" |
| Required | No (but recommended) |
| Max Length | 100 characters |
| Database Mapping | `leads.last_name` |

**Field Specification: Contact Email**
| Property | Value |
|----------|-------|
| Field Name | `email` |
| Type | Email Input |
| Label | "Contact Email" |
| Placeholder | "contact@techcorp.com" |
| Required | No (but one of email or phone recommended) |
| Max Length | 255 characters |
| Validation | Valid email format |
| Error Messages | |
| - Invalid format | "Please enter a valid email address" |
| Database Mapping | `leads.email` |

**Field Specification: Contact Phone**
| Property | Value |
|----------|-------|
| Field Name | `phone` |
| Type | Phone Input |
| Label | "Contact Phone" |
| Placeholder | "+1 (555) 123-4567" |
| Required | No |
| Max Length | 50 characters |
| Auto-format | Yes (formats to standard phone format) |
| Database Mapping | `leads.phone` |

**Time:** ~15 seconds

---

### Step 7: Describe the Opportunity

**User Action:** Type opportunity description in textarea

**System Response:**
- Text appears in textarea
- Character counter updates: "X/500"
- System watches for keywords to suggest urgency level

**Field Specification: Opportunity Description**
| Property | Value |
|----------|-------|
| Field Name | `description` |
| Type | Textarea |
| Label | "Opportunity Description" |
| Placeholder | "Describe what the client needs..." |
| Required | Yes |
| Max Length | 500 characters |
| Min Length | 10 characters |
| Rows | 4 |
| Validation | Not empty, minimum length |
| Error Messages | |
| - Empty | "Please describe the opportunity" |
| - Too short | "Description must be at least 10 characters" |
| Database Mapping | `leads.notes` (initially) |
| AI Assist | Suggests urgency based on keywords like "ASAP", "urgent", "immediate" |

**Example Descriptions by Lead Type:**

**TA Lead:**
```
"Client mentioned they're hiring 3 Senior Java Developers for a new project
starting in Q1. Budget is approved. Hiring manager is Sarah Johnson."
```

**Bench Sales Lead:**
```
"Need 2 React developers ASAP for 6-month project. Must have AWS experience.
Rate budget: $85-95/hr. Start date: next Monday."
```

**Sales Lead:**
```
"Met VP of Engineering at networking event. Company is a Series B fintech
startup, growing fast. Open to staffing partnership. Warm lead."
```

**Academy Lead:**
```
"Client wants to train their entire development team (25 people) on
microservices architecture. Timeline: within 3 months. Big opportunity!"
```

**Time:** ~30 seconds

---

### Step 8: Select Discovery Source

**User Action:** Select where the opportunity was discovered

**System Response:**
- Radio button or option is selected
- If "Other" selected, text input appears for custom source

**Field Specification: Discovery Source**
| Property | Value |
|----------|-------|
| Field Name | `source` |
| Type | Radio Button Group OR Dropdown |
| Label | "Where did you discover this?" |
| Required | Yes |
| Options | Context-aware based on current screen |
| Database Mapping | `leads.source` |

**Source Options:**

| Value | Display Label | When Available |
|-------|---------------|----------------|
| `candidate_call` | Candidate mentioned it | Always |
| `client_call` | Client mentioned it | Always |
| `job_discussion` | During job call | When viewing job |
| `placement_followup` | Placement follow-up | When viewing placement |
| `referral` | Referral from contact | Always |
| `networking` | Networking event | Always |
| `research` | Prospecting/Research | Always |
| `other` | Other (specify) | Always |

**Time:** ~3 seconds

---

### Step 9: Click "Next: Priority"

**User Action:** Click "Next: Priority →" button

**System Response:**
- Validates Step 2 fields (company name and description required)
- Slides to Step 3 (300ms animation)
- Step 3 shows urgency and handoff settings

**Screen State (Step 3):**
```
+----------------------------------------------------------+
|                          CREATE CROSS-PILLAR LEAD        |
|                                                      [×] |
+----------------------------------------------------------+
| Step 3 of 3: Priority & Handoff                          |
|                                                          |
| Urgency Level *                                          |
| How urgent is this opportunity?                          |
|                                                          |
| ○ 🟢 Low - No rush, nurture over time                    |
| ○ 🔵 Normal - Standard follow-up (within 1 week)         |
| ● 🟡 High - Follow up soon (within 2-3 days)             |
| ○ 🔴 Urgent - Immediate action needed (within 24 hours)  |
|                                                          |
| Estimated Value (Optional)                               |
| Potential revenue from this opportunity                  |
| $ [           ] USD                                      |
|                                                          |
| Assign To (Optional)                                     |
| Leave blank for auto-assignment to pillar team           |
| [Search team members...                          ▼]      |
|                                                          |
| Handoff Notes (Optional)                                 |
| Any additional context for the receiving team            |
| [                                                      ] |
| [                                               ] 0/500  |
|                                                          |
| ✅ Auto-Actions:                                         |
| • Assign to Bench Sales team (round-robin)              |
| • Create follow-up task (due based on urgency)           |
| • Notify team lead                                       |
| • Add to your lead sourcing credits                      |
|                                                          |
+----------------------------------------------------------+
|              [← Back]  [Cancel]  [🎯 Create Lead!]      |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 10: Select Urgency Level

**User Action:** Click urgency level radio button

**System Response:**
- Radio button becomes selected
- Due date for follow-up task is auto-calculated
- System shows calculated due date in help text

**Field Specification: Urgency Level**
| Property | Value |
|----------|-------|
| Field Name | `urgency` |
| Type | Radio Button Group |
| Label | "Urgency Level" |
| Required | Yes |
| Default | "Normal" |
| Options | 4 levels |
| Database Mapping | Custom field, affects task due date |

**Urgency Levels:**

| Value | Display Label | Color | Follow-up Due | Priority Level |
|-------|---------------|-------|---------------|----------------|
| `low` | Low - No rush, nurture over time | Green | 14 days | Low |
| `normal` | Normal - Standard follow-up | Blue | 7 days | Normal |
| `high` | High - Follow up soon | Yellow | 2-3 days | High |
| `urgent` | Urgent - Immediate action needed | Red | 24 hours | Critical |

**Impact on Task Creation:**
```typescript
const getTaskDueDate = (urgency: string) => {
  switch (urgency) {
    case 'urgent': return addHours(now(), 24);
    case 'high': return addDays(now(), 2);
    case 'normal': return addDays(now(), 7);
    case 'low': return addDays(now(), 14);
  }
};
```

**Time:** ~3 seconds

---

### Step 11: Enter Estimated Value (Optional)

**User Action:** Enter estimated revenue potential, e.g., "50000"

**System Response:**
- Number appears in input with $ prefix
- Auto-formats with commas: "$50,000"
- Help text shows context-specific value guidance

**Field Specification: Estimated Value**
| Property | Value |
|----------|-------|
| Field Name | `estimatedValue` |
| Type | Currency Input |
| Label | "Estimated Value" |
| Prefix | "$" |
| Suffix | Currency code (defaults to "USD") |
| Required | No (but recommended for tracking) |
| Min Value | 0 |
| Max Value | 9,999,999.99 |
| Precision | 2 decimal places |
| Database Mapping | `leads.estimated_value` |
| Help Text | Context-specific guidance |

**Value Guidance by Lead Type:**

**TA Lead:**
```
💡 Estimated Value = Number of positions × Average placement fee
   Example: 3 positions × $25,000 fee = $75,000
```

**Bench Sales Lead:**
```
💡 Estimated Value = (Bill rate - Pay rate) × Hours × Duration
   Example: ($95 - $75) × 176 hrs/mo × 6 months = $21,120
```

**Sales Lead:**
```
💡 Estimated Value = Projected annual revenue from account
   Example: 5 contractors × $10k/mo margin × 12 months = $600,000
```

**Academy Lead:**
```
💡 Estimated Value = Number of trainees × Cost per trainee
   Example: 25 people × $2,000 per person = $50,000
```

**Time:** ~5 seconds

---

### Step 12: Assign to Specific Person (Optional Override)

**User Action:** (Optional) Search and select a specific team member

**System Response:**
- Dropdown opens with team members from target pillar
- Shows team members filtered by pillar type
- If left blank: Auto-assigns via round-robin to pillar team

**Field Specification: Assign To**
| Property | Value |
|----------|-------|
| Field Name | `ownerId` |
| Type | Searchable Dropdown |
| Label | "Assign To" |
| Placeholder | "Search team members..." |
| Required | No (auto-assigns if blank) |
| Data Source | Filtered by lead type's target pillar |
| Display Format | `{firstName} {lastName} - {role}` |
| Default Behavior | Auto-assign round-robin to pillar team |
| Database Mapping | `leads.owner_id` |

**Auto-Assignment Logic by Lead Type:**

| Lead Type | Target Team | Auto-Assignment Rule |
|-----------|-------------|---------------------|
| `ta_lead` | TA Team | Round-robin among TA Specialists |
| `bench_lead` | Bench Sales Team | Round-robin among Bench Sales Reps |
| `sales_lead` | Sales Team | Round-robin among Account Managers |
| `academy_lead` | Academy Team | Assign to Academy Sales Lead |

**Time:** ~5 seconds (if used)

---

### Step 13: Add Handoff Notes (Optional)

**User Action:** Type additional context in handoff notes field

**System Response:**
- Text appears in textarea
- Character counter updates
- These notes are visible to receiving team

**Field Specification: Handoff Notes**
| Property | Value |
|----------|-------|
| Field Name | `handoffNotes` |
| Type | Textarea |
| Label | "Handoff Notes" |
| Placeholder | "Any additional context for the receiving team..." |
| Required | No |
| Max Length | 500 characters |
| Rows | 3 |
| Database Mapping | Appended to `leads.notes` with prefix |
| Visibility | Visible to receiving team |

**Example Handoff Notes:**
```
"This came from our placement at Microsoft. The hiring manager (Sarah) is
very responsive. She mentioned urgency because team is growing fast.
Good relationship - should be easy close!"
```

**Time:** ~20 seconds (if used)

---

### Step 14: Review Auto-Actions

**User Action:** Review the auto-actions that will be triggered

**System Response:**
- Shows checklist of automatic actions
- All actions are pre-checked (not configurable for MVP)

**Auto-Actions List:**

| Action | Description | Triggered When |
|--------|-------------|----------------|
| Assign to Team | Auto-assigns to pillar team via round-robin (or manual assignment) | Always |
| Create Follow-up Task | Creates task for assigned owner with due date based on urgency | Always |
| Notify Team Lead | Sends notification to pillar team lead | Always |
| Add Sourcing Credit | Records lead sourcing credit for creating recruiter | Always |
| Create Activity Log | Logs lead creation activity | Always |
| Check for Duplicates | Warns if similar lead exists | If duplicate found |

**Time:** ~5 seconds

---

### Step 15: Click "Create Lead!"

**User Action:** Click green "🎯 Create Lead!" button

**System Response:**

1. **Button State (300ms):**
   - Button shows loading spinner
   - Button text changes to "Creating..."
   - Button disabled

2. **Validation:**
   - Validates all required fields
   - Checks for duplicate leads (same company + similar description)
   - If duplicate found: Shows confirmation dialog

3. **API Call:**
   - `POST /api/trpc/leads.create`
   - Payload includes all form data

4. **Success Response:**
   - Modal shows success checkmark (500ms)
   - Success toast appears: "Lead created and assigned to [Team Name]!"
   - Modal closes (300ms slide-out)
   - Returns user to previous screen

5. **Success Animation:**
   ```
   +----------------------------------------+
   |                                        |
   |         ✅ Lead Created!               |
   |                                        |
   |   Assigned to: Bench Sales Team       |
   |   Owner: John Smith                   |
   |   Follow-up Due: Dec 17, 2024         |
   |                                        |
   |   🎉 +1 Cross-Pillar Lead Credit      |
   |                                        |
   +----------------------------------------+
   ```

**Backend Processing (Sequential):**

**1. Validate Input:**
```typescript
// Check required fields
if (!companyName || !description || !leadType || !urgency) {
  throw new Error('Missing required fields');
}

// Check for duplicates
const existingLead = await db.query.leads.findFirst({
  where: and(
    eq(leads.orgId, currentOrgId),
    eq(leads.companyName, companyName),
    eq(leads.deletedAt, null)
  )
});

if (existingLead) {
  // Show duplicate warning (user can proceed or cancel)
  return { status: 'duplicate_found', existing: existingLead };
}
```

**2. Determine Target Pillar & Auto-Assign:**
```typescript
const getPillarTeam = (leadType: string) => {
  const pillarMap = {
    ta_lead: 'ta',
    bench_lead: 'bench_sales',
    sales_lead: 'sales',
    academy_lead: 'academy'
  };
  return pillarMap[leadType];
};

const pillar = getPillarTeam(leadType);

// Get available team members from target pillar
const teamMembers = await db.query.employeeMetadata.findMany({
  where: and(
    eq(employeeMetadata.orgId, currentOrgId),
    eq(employeeMetadata.department, pillar),
    eq(employeeMetadata.status, 'active')
  )
});

// Round-robin assignment (unless manually assigned)
const assignedOwner = ownerId || getNextInRoundRobin(teamMembers);
```

**3. Create Lead Record:**
```sql
INSERT INTO leads (
  id, org_id, lead_type, company_name, first_name, last_name,
  email, phone, notes, source, status, estimated_value,
  owner_id, created_by, created_at, updated_at
) VALUES (
  uuid_generate_v4(),
  :current_org_id,
  :lead_type_mapped, -- Maps to 'company' or 'person'
  :company_name,
  :first_name,
  :last_name,
  :email,
  :phone,
  :description || '\n\nHandoff Notes: ' || :handoff_notes,
  :source,
  'new', -- Initial status
  :estimated_value,
  :assigned_owner_id,
  :current_user_id,
  NOW(),
  NOW()
);
```

**Lead Type Mapping:**
```typescript
// Cross-pillar lead types map to standard lead types
const leadTypeMapping = {
  ta_lead: 'company',      // TA leads are company leads
  bench_lead: 'company',   // Bench leads are company leads
  sales_lead: 'company',   // Sales leads are company leads
  academy_lead: 'company'  // Academy leads are company leads
};

// Store cross-pillar type in custom metadata field (future enhancement)
const metadata = {
  crossPillarType: leadType,  // 'ta_lead', 'bench_lead', etc.
  sourcedBy: currentUserId,
  sourcedByPillar: currentUserPillar,
  urgency: urgency
};
```

**4. Create Follow-up Task:**
```typescript
const taskDueDate = calculateDueDate(urgency);

await db.insert(activities).values({
  id: uuid(),
  orgId: currentOrgId,
  entityType: 'lead',
  entityId: newLeadId,
  activityType: 'task',
  title: `Follow up on ${companyName} - ${getLeadTypeLabel(leadType)}`,
  description: `Qualify and engage this lead. Original notes:\n${description}`,
  dueDate: taskDueDate,
  priority: getPriorityFromUrgency(urgency),
  status: 'pending',
  assignedTo: assignedOwnerId,
  createdBy: currentUserId,
  createdAt: new Date()
});
```

**5. Add Lead Sourcing Credit:**
```typescript
// Track cross-pillar lead sourcing for gamification
await db.insert(leadSourcingCredits).values({
  id: uuid(),
  orgId: currentOrgId,
  leadId: newLeadId,
  sourcedBy: currentUserId,
  sourcePillar: currentUserPillar, // 'recruiting'
  targetPillar: pillar,            // 'bench_sales', 'ta', etc.
  creditPoints: 10,                // Base points for lead sourcing
  createdAt: new Date()
});

// Update user's monthly metrics
await db.insert(recruiterMetrics).values({
  recruiterId: currentUserId,
  period: getCurrentPeriod(),
  crossPillarLeadsCreated: sql`COALESCE((SELECT cross_pillar_leads_created FROM recruiter_metrics WHERE recruiter_id = ${currentUserId} AND period = ${getCurrentPeriod()}), 0) + 1`,
  updatedAt: new Date()
}).onConflictDoUpdate({
  target: [recruiterMetrics.recruiterId, recruiterMetrics.period],
  set: {
    crossPillarLeadsCreated: sql`recruiter_metrics.cross_pillar_leads_created + 1`,
    updatedAt: new Date()
  }
});
```

**6. Notify Team Lead:**
```typescript
// Get team lead for target pillar
const teamLead = await db.query.employeeMetadata.findFirst({
  where: and(
    eq(employeeMetadata.orgId, currentOrgId),
    eq(employeeMetadata.department, pillar),
    eq(employeeMetadata.role, 'manager')
  )
});

// Notify team lead
await sendNotification({
  userId: teamLead.userId,
  type: 'cross_pillar_lead_received',
  title: 'New Cross-Pillar Lead',
  message: `${recruiterName} from Recruiting created a ${getLeadTypeLabel(leadType)}: ${companyName}`,
  link: `/employee/leads/${newLeadId}`,
  metadata: {
    leadId: newLeadId,
    sourcedBy: currentUserId,
    urgency: urgency
  }
});

// Notify assigned owner (if different from team lead)
if (assignedOwnerId !== teamLead.userId) {
  await sendNotification({
    userId: assignedOwnerId,
    type: 'lead_assigned',
    title: 'Lead Assigned to You',
    message: `New ${getLeadTypeLabel(leadType)} from ${recruiterName}: ${companyName}`,
    link: `/employee/leads/${newLeadId}`,
    priority: urgency === 'urgent' ? 'high' : 'normal'
  });
}

// Notify creating recruiter (confirmation)
await sendNotification({
  userId: currentUserId,
  type: 'lead_created_confirmation',
  title: 'Lead Created Successfully',
  message: `Your ${getLeadTypeLabel(leadType)} for ${companyName} has been assigned to ${ownerName}`,
  link: `/employee/leads/${newLeadId}`
});
```

**7. Log Activity:**
```typescript
await db.insert(activityLog).values({
  id: uuid(),
  orgId: currentOrgId,
  entityType: 'lead',
  entityId: newLeadId,
  activityType: 'note',
  subject: 'Cross-pillar lead created',
  body: `Lead created by ${recruiterName} (Recruiting) for ${pillar} team. Source: ${source}`,
  performedBy: currentUserId,
  activityDate: new Date(),
  createdAt: new Date()
});
```

**8. Update Leaderboard:**
```typescript
// Update cross-pillar collaboration leaderboard
await db.insert(leaderboardEntries).values({
  id: uuid(),
  orgId: currentOrgId,
  userId: currentUserId,
  leaderboardType: 'cross_pillar_leads',
  period: getCurrentQuarter(),
  score: sql`COALESCE((SELECT score FROM leaderboard_entries WHERE user_id = ${currentUserId} AND leaderboard_type = 'cross_pillar_leads' AND period = ${getCurrentQuarter()}), 0) + 1`,
  metadata: {
    leadType: leadType,
    targetPillar: pillar,
    estimatedValue: estimatedValue
  },
  updatedAt: new Date()
}).onConflictDoUpdate({
  target: [leaderboardEntries.userId, leaderboardEntries.leaderboardType, leaderboardEntries.period],
  set: {
    score: sql`leaderboard_entries.score + 1`,
    updatedAt: new Date()
  }
});
```

**Time:** ~2-3 seconds (backend processing)

---

## Postconditions

1. ✅ New lead record created in `leads` table with status = "new"
2. ✅ Lead assigned to target pillar team member (auto or manual)
3. ✅ Follow-up task created with due date based on urgency
4. ✅ Team lead notified of new cross-pillar lead
5. ✅ Assigned owner notified of new lead assignment
6. ✅ Creating recruiter receives confirmation notification
7. ✅ Lead sourcing credit recorded for creating recruiter
8. ✅ Cross-pillar metrics updated for creating recruiter
9. ✅ Activity log entry created for lead creation
10. ✅ Leaderboard updated with cross-pillar lead point
11. ✅ User returned to previous screen (seamless flow)

---

## Events Logged

| Event | Payload | Recipients |
|-------|---------|-----------|
| `lead.created` | `{ lead_id, company_name, lead_type, urgency, estimated_value, owner_id, created_by, source, created_at }` | System |
| `lead.assigned` | `{ lead_id, owner_id, assigned_by, pillar }` | Assigned Owner |
| `task.created` | `{ task_id, lead_id, title, due_date, priority, assigned_to }` | Assigned Owner |
| `notification.sent` | Multiple notifications (team lead, owner, creator) | Multiple |
| `metric.updated` | `{ user_id, metric: 'cross_pillar_leads_created', value: +1 }` | Creator |
| `leaderboard.updated` | `{ user_id, leaderboard: 'cross_pillar_leads', score: +1 }` | All users (public) |
| `credit.awarded` | `{ user_id, credit_type: 'lead_sourcing', points: 10, lead_id }` | Creator |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Missing Required Field | User skipped required field | "Company name is required" | Fill in required field |
| Description Too Short | Description < 10 characters | "Please provide more detail about the opportunity" | Add more description |
| Duplicate Lead | Same company + similar description | "⚠️ Similar lead exists. Do you want to proceed?" | View existing or create anyway |
| No Available Team | No team members in target pillar | "No available team members for this pillar. Contact Admin." | Contact admin to add team |
| Invalid Email | Email format incorrect | "Please enter a valid email address" | Fix email format |
| Permission Denied | User lacks lead.create permission | "You don't have permission to create leads" | Contact Admin |
| Network Error | API call failed | "Network error. Please try again." | Retry |
| Estimated Value Invalid | Negative or too large value | "Estimated value must be between $0 and $9,999,999" | Enter valid amount |

---

## Keyboard Shortcuts (During Flow)

| Key | Action |
|-----|--------|
| `Cmd+L` | Open lead creation modal (from anywhere) |
| `Esc` | Close modal (with confirmation if data entered) |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Enter` | Next step (when on button) |
| `Cmd+Enter` | Submit form (from any field in Step 3) |
| `Arrow Up/Down` | Navigate radio button options |

---

## Alternative Flows

### A1: Create Lead from Job Detail Page

**Trigger:** Recruiter is viewing a job and client mentions related opportunity

**Flow:**
1. User clicks "Create Related Lead" button on job detail page
2. Lead creation modal opens
3. Company name and contact pre-fill from job's account
4. Source auto-set to "During job call"
5. Context automatically includes: "Related to Job: {job.title}"
6. Continue from Step 2 onwards

---

### A2: Create Lead from Candidate Call

**Trigger:** During candidate screening call, candidate mentions opportunity

**Flow:**
1. User is in candidate call notes or detail screen
2. User presses `Cmd+L` hotkey
3. Modal opens with source pre-set to "Candidate mentioned it"
4. Optional: Can link lead to candidate who mentioned it
5. Handoff notes auto-include: "Mentioned by candidate: {candidate.name}"
6. Continue from Step 2 onwards

---

### A3: Create Lead from Client Meeting

**Trigger:** During client meeting, client mentions additional need

**Flow:**
1. User is in account/client detail screen
2. User clicks "Create Lead" from account actions
3. Company name auto-fills from current account
4. Source pre-set to "Client mentioned it"
5. Lead automatically linked to account (`account_id` field)
6. Continue from Step 2 onwards

---

### A4: Quick Lead Creation (Minimal Info)

**Trigger:** Recruiter has very limited info but wants to capture lead quickly

**Flow:**
1. User presses `Cmd+L`
2. Selects lead type
3. Enters only: Company name + 1-sentence description
4. Clicks "Create Lead!" (skips optional fields)
5. System creates lead with minimal info
6. Follow-up task prompts assigned owner to gather more details

**Minimum Required Fields:**
- Lead type
- Company name (OR first name + last name)
- Opportunity description (minimum 10 characters)

---

### A5: Duplicate Lead Found

**Trigger:** User tries to create lead for company that already exists

**Flow:**
1. User completes form and clicks "Create Lead!"
2. System detects duplicate (same company name)
3. Modal shows duplicate warning:
   ```
   ⚠️ SIMILAR LEAD EXISTS

   Company: TechCorp Industries
   Status: Warm
   Owner: Jane Smith (Bench Sales)
   Created: 5 days ago

   What do you want to do?

   [View Existing Lead]  [Create Anyway]  [Cancel]
   ```
4. **Option 1: View Existing Lead**
   - Redirects to existing lead detail
   - User can add notes to existing lead
5. **Option 2: Create Anyway**
   - Creates new lead with duplicate flag
   - System creates task for admin to merge/dedupe
6. **Option 3: Cancel**
   - Closes modal, preserves form data

---

### A6: Urgent Lead (Immediate Handoff)

**Trigger:** Opportunity requires immediate action (client needs consultant ASAP)

**Flow:**
1. User selects "Urgent" urgency level
2. System shows additional confirmation:
   ```
   🔴 URGENT LEAD

   This will create a high-priority alert for the receiving team.
   Follow-up task will be due within 24 hours.

   Are you sure this is urgent?

   [Yes, Create Urgent Lead]  [Change to High Priority]
   ```
3. If confirmed:
   - Creates lead with urgent flag
   - Sends push notification to team lead (not just email)
   - Creates task with 24-hour deadline
   - Adds "URGENT" prefix to lead title
4. If not urgent:
   - Changes to "High" priority
   - Normal flow continues

---

### A7: Lead with High Value (Commission Tracking)

**Trigger:** Estimated value > $100,000

**Flow:**
1. User enters estimated value > $100,000
2. System shows additional fields:
   ```
   💰 HIGH-VALUE OPPORTUNITY

   This lead has significant revenue potential!

   Commission Split (if converted):
   • You (Lead Sourcer): 10%
   • Assigned Owner: 90%

   Do you want to add any strategic notes?
   [___________________________________]
   ```
3. User can add strategic context
4. System flags lead as "high_value"
5. Additional tracking for commission calculation
6. Monthly report includes high-value leads sourced

---

## Related Use Cases

- [02-create-job.md](./02-create-job.md) - Creating jobs (recruiting pillar)
- [03-source-candidates.md](./03-source-candidates.md) - Sourcing candidates
- [10-manage-pipeline.md](./10-manage-pipeline.md) - Managing recruiting pipeline
- [../02-bench-sales/01-create-bench-lead.md](../02-bench-sales/01-create-bench-lead.md) - Bench sales flow
- [../03-ta-specialist/01-qualify-lead.md](../03-ta-specialist/01-qualify-lead.md) - TA lead qualification

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Create TA lead with all required fields | Lead created, assigned to TA team |
| TC-002 | Create bench lead with minimal info | Lead created with only company + description |
| TC-003 | Create sales lead with high value | High-value flag set, commission tracking enabled |
| TC-004 | Create academy lead with urgent priority | Task created with 24-hour deadline |
| TC-005 | Submit without company name | Error: "Company name is required" |
| TC-006 | Submit without description | Error: "Please describe the opportunity" |
| TC-007 | Create lead with duplicate company | Duplicate warning shown with options |
| TC-008 | Create lead from job detail page | Company name pre-fills from job account |
| TC-009 | Create lead from candidate call | Source pre-set to "Candidate mentioned it" |
| TC-010 | Invalid email format | Error: "Please enter a valid email address" |
| TC-011 | Estimated value > $10M | Error: "Value exceeds maximum" |
| TC-012 | Create lead with no available team | Error: "No available team members" |
| TC-013 | Cancel mid-creation with data entered | Confirmation prompt shown |
| TC-014 | Network error during creation | Retry button appears, data preserved |
| TC-015 | Create 5 leads in 1 minute | All 5 leads created, leaderboard updated +5 |
| TC-016 | Assign to specific person override | Lead assigned to chosen person, not round-robin |
| TC-017 | Create lead with international phone | Phone auto-formats correctly |

---

## International Considerations

### Multi-Currency Support

For international leads, the estimated value supports multiple currencies:

**Currency Selection:**
```
Estimated Value
$ [50000  ] [USD ▼]

Currency Options:
• USD - US Dollar
• EUR - Euro
• GBP - British Pound
• CAD - Canadian Dollar
• INR - Indian Rupee
• AUD - Australian Dollar
• MXN - Mexican Peso
```

**Database Storage:**
```sql
ALTER TABLE leads ADD COLUMN currency TEXT DEFAULT 'USD';
```

**Exchange Rate Conversion:**
```typescript
// Convert to USD for reporting/comparison
const estimatedValueUSD = await convertCurrency({
  amount: estimatedValue,
  fromCurrency: currency,
  toCurrency: 'USD',
  conversionDate: new Date()
});
```

---

### Regional Team Assignment

Leads can be assigned based on company location/region:

**Regional Routing:**
```typescript
const getRegionalTeam = (headquarters: string, pillar: string) => {
  const region = detectRegion(headquarters);

  // Find team members in same region
  const regionalTeam = await db.query.employeeMetadata.findMany({
    where: and(
      eq(employeeMetadata.department, pillar),
      eq(employeeMetadata.region, region),
      eq(employeeMetadata.status, 'active')
    )
  });

  return regionalTeam.length > 0
    ? getNextInRoundRobin(regionalTeam)
    : getNextInRoundRobin(allPillarTeam); // Fallback to global team
};
```

**Regions:**
- North America (US, Canada, Mexico)
- Europe (UK, Germany, France, etc.)
- Asia Pacific (India, Australia, Singapore)
- Latin America (Brazil, Argentina, etc.)

---

### Timezone-Aware Follow-up

Follow-up tasks respect the assigned owner's timezone:

**Timezone Handling:**
```typescript
const createFollowUpTask = (dueDate: Date, ownerId: string) => {
  // Get owner's timezone
  const ownerTimezone = await getUserTimezone(ownerId);

  // Convert due date to owner's timezone
  const dueDateInOwnerTZ = convertToTimezone(dueDate, ownerTimezone);

  // Store as UTC, display in owner's timezone
  return {
    dueDate: dueDateInOwnerTZ.toISOString(),
    timezone: ownerTimezone
  };
};
```

---

## Gamification & Metrics

### Lead Sourcing Credits

Recruiters earn points for creating cross-pillar leads:

**Point System:**
| Action | Points | Bonus Conditions |
|--------|--------|------------------|
| Create cross-pillar lead | 10 pts | Base points |
| Lead converted to deal | +25 pts | Bonus when lead converts |
| High-value lead (>$100k) | +15 pts | Extra points for big opportunities |
| Urgent lead actioned within 24h | +10 pts | Quick response bonus |
| Monthly: 10+ cross-pillar leads | +50 pts | Volume bonus |

**Tracking:**
```sql
CREATE TABLE lead_sourcing_credits (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  lead_id UUID NOT NULL REFERENCES leads(id),
  sourced_by UUID NOT NULL REFERENCES user_profiles(id),
  source_pillar TEXT NOT NULL,
  target_pillar TEXT NOT NULL,
  credit_points INTEGER DEFAULT 10,
  bonus_points INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'converted', 'lost'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Monthly Lead Leaderboard

**Leaderboard Categories:**
1. **Most Cross-Pillar Leads Created** - Total count
2. **Highest Value Leads** - Sum of estimated values
3. **Best Conversion Rate** - % of leads that converted to deals
4. **Fastest Responders** - Avg time from lead creation to first action

**Display:**
```
🏆 CROSS-PILLAR LEADERBOARD - December 2024

Most Leads Created:
1. 🥇 Sarah Johnson   23 leads  230 pts
2. 🥈 Mike Chen       19 leads  190 pts
3. 🥉 Emily Davis     17 leads  170 pts

Highest Value:
1. 🥇 James Wilson    $850K estimated value
2. 🥈 Sarah Johnson   $720K estimated value
3. 🥉 Lisa Brown      $680K estimated value

Best Conversion Rate:
1. 🥇 Mike Chen       65% (13/20 converted)
2. 🥈 Emily Davis     58% (10/17 converted)
3. 🥉 James Wilson    55% (11/20 converted)
```

---

### Lead-to-Placement Tracking

Track when cross-pillar leads result in actual placements:

**Full Lifecycle Tracking:**
```
Cross-Pillar Lead Created (by Recruiter A)
  ↓
Assigned to Bench Sales Rep (Rep B)
  ↓
Qualified & Converted to Deal
  ↓
Deal → Placement
  ↓
💰 Commission Split:
  • Lead Sourcer (Recruiter A): 10% of margin
  • Closer (Rep B): 90% of margin
```

**Commission Calculation:**
```typescript
// Example: Bench placement from cross-pillar lead
const monthlyRevenue = 21120; // Bill rate × hours
const recruiterACommission = monthlyRevenue * 0.05 * 0.10; // 10% of 5% commission
const repBCommission = monthlyRevenue * 0.05 * 0.90; // 90% of 5% commission

// Recruiter A: $105.60/month (for 6 months = $633.60 total)
// Rep B: $950.40/month (for 6 months = $5,702.40 total)
```

---

## UI/UX Specifications

### Lead Type Icons

Each lead type has a distinct icon and color:

| Lead Type | Icon | Color | Gradient |
|-----------|------|-------|----------|
| TA Lead | 👔 | Purple | #8B5CF6 → #6366F1 |
| Bench Sales Lead | 💼 | Blue | #3B82F6 → #2563EB |
| Sales Lead | 🎯 | Green | #10B981 → #059669 |
| Academy Lead | 🎓 | Orange | #F59E0B → #D97706 |

---

### Modal Animations

**Slide-in Animation:**
```css
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.lead-modal {
  animation: slideInRight 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Step Transition:**
```css
@keyframes stepForward {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.step-content {
  animation: stepForward 200ms ease-out;
}
```

---

### Success Celebration

**Confetti Animation (Lightweight):**
- 20 confetti pieces (not 50 - keep it subtle for lead creation)
- Colors match lead type
- 1.5 second duration
- Falls from top-center

**Toast Notification:**
```
┌─────────────────────────────────────────┐
│ ✅ Lead Created Successfully!           │
│                                         │
│ Assigned to: John Smith (Bench Sales)  │
│ Follow-up due: Dec 17, 2024            │
│                                         │
│ 🎉 +1 Cross-Pillar Lead Credit         │
└─────────────────────────────────────────┘
```

---

### Responsive Design

**Mobile Considerations:**
- Modal becomes full-screen on mobile (<768px)
- Radio buttons become larger touch targets
- Urgency selector uses button group instead of radio buttons
- Estimated value uses native number keyboard
- Source selector uses native select on mobile

**Tablet:**
- Modal width: 600px (centered)
- Two-column layout for Step 2 fields (first name | last name)

**Desktop:**
- Modal width: 700px
- Full three-step wizard visible
- Keyboard shortcuts enabled

---

## Database Schema Reference

**Leads Table (Relevant Fields for Cross-Pillar):**
```sql
-- Standard fields from leads table
id UUID PRIMARY KEY
org_id UUID NOT NULL
lead_type TEXT NOT NULL DEFAULT 'company'
company_name TEXT
first_name TEXT
last_name TEXT
email TEXT
phone TEXT
notes TEXT -- Contains description + handoff notes
source TEXT
status TEXT DEFAULT 'new'
estimated_value NUMERIC(12,2)
owner_id UUID REFERENCES user_profiles(id)
created_by UUID REFERENCES user_profiles(id)
created_at TIMESTAMPTZ DEFAULT NOW()

-- Additional metadata (stored in separate table or JSONB)
-- For cross-pillar tracking:
metadata JSONB -- {
  --   crossPillarType: 'ta_lead' | 'bench_lead' | 'sales_lead' | 'academy_lead',
  --   urgency: 'low' | 'normal' | 'high' | 'urgent',
  --   sourcedByPillar: 'recruiting',
  --   targetPillar: 'ta' | 'bench_sales' | 'sales' | 'academy',
  --   handoffNotes: string
  -- }
```

**Lead Sourcing Credits Table (New):**
```sql
CREATE TABLE lead_sourcing_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  lead_id UUID NOT NULL REFERENCES leads(id),
  sourced_by UUID NOT NULL REFERENCES user_profiles(id),
  source_pillar TEXT NOT NULL, -- 'recruiting', 'bench_sales', 'ta', etc.
  target_pillar TEXT NOT NULL,
  credit_points INTEGER DEFAULT 10,
  bonus_points INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'converted', 'lost'
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_lead_sourcing_credits_sourced_by ON lead_sourcing_credits(sourced_by);
CREATE INDEX idx_lead_sourcing_credits_lead_id ON lead_sourcing_credits(lead_id);
```

---

## Analytics & Reporting

### Cross-Pillar Lead Metrics

**Key Metrics to Track:**
1. Total cross-pillar leads created per month
2. Conversion rate by lead type
3. Average estimated value by lead type
4. Time to first action by urgency level
5. Lead source effectiveness
6. Cross-pillar commission earned

**Sample Query - Monthly Cross-Pillar Report:**
```sql
SELECT
  up.first_name || ' ' || up.last_name as recruiter_name,
  COUNT(*) as total_leads_created,
  COUNT(*) FILTER (WHERE l.status = 'converted') as converted_leads,
  ROUND(COUNT(*) FILTER (WHERE l.status = 'converted')::numeric / COUNT(*)::numeric * 100, 1) as conversion_rate_pct,
  SUM(l.estimated_value) as total_estimated_value,
  SUM(lsc.credit_points + lsc.bonus_points) as total_points_earned
FROM lead_sourcing_credits lsc
JOIN leads l ON lsc.lead_id = l.id
JOIN user_profiles up ON lsc.sourced_by = up.id
WHERE lsc.created_at >= DATE_TRUNC('month', CURRENT_DATE)
  AND lsc.created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
  AND l.org_id = :org_id
GROUP BY up.id, recruiter_name
ORDER BY total_leads_created DESC;
```

---

## Future Enhancements

### Phase 2 Features

1. **AI-Powered Lead Scoring**
   - Auto-score leads based on company size, industry, description keywords
   - Predict likelihood to convert
   - Suggest optimal urgency level

2. **Lead Templates**
   - Save frequently used lead patterns
   - One-click create from template
   - Templates by lead type

3. **Bulk Lead Import**
   - Import multiple leads from CSV
   - Map columns to lead fields
   - Batch assign to team

4. **Lead Referral Tracking**
   - Track which placements generated cross-pillar leads
   - "Placement → Lead → Deal" relationship mapping
   - Referral bonuses

5. **Advanced Duplicate Detection**
   - Fuzzy matching on company names
   - Email domain matching
   - Website URL matching
   - Auto-merge suggestions

6. **Mobile App Quick Create**
   - Voice-to-text for description
   - Photo capture for business cards
   - GPS auto-detect location

---

*Last Updated: 2024-11-30*
*Document Version: 1.0*
*Author: InTime v3 Product Team*
*Status: Final*
