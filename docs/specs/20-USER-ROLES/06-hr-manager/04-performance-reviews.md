# Use Case: Performance Review Management

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-HR-003 |
| Actor | HR Manager |
| Goal | Coordinate quarterly performance review cycles: schedule reviews, track completion, generate reports |
| Frequency | Quarterly (4 times per year) |
| Estimated Time | 4-8 hours per cycle |
| Priority | High (Employee Development, Compliance) |

---

## Preconditions

1. User is logged in as HR Manager
2. User has "performance_reviews.coordinate" permission
3. Quarter has ended or is ending soon
4. Employee list is current
5. Managers are assigned to all employees

---

## Trigger

One of the following:
- End of quarter approaching (auto-reminder 2 weeks before)
- HR Manager manually initiates review cycle
- System notification: "Q4 review cycle due"
- Calendar event: "Start Q4 performance reviews"

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Performance Reviews

**User Action:** Click "Performance Reviews" in sidebar

**System Response:**
- Sidebar highlights "Performance Reviews"
- URL changes to: `/employee/hr/performance`
- Performance review dashboard loads

**Screen State:**
```
+----------------------------------------------------------+
| Performance Reviews                   [+ New Cycle] [⌘K] |
+----------------------------------------------------------+
| CURRENT REVIEW CYCLE                                     |
|                                                          |
| Q4 2024 (October - December)                             |
| Due Date: 12/31/2024 (18 days remaining)                 |
| Status: 🔄 IN PROGRESS                                   |
|                                                          |
| ┌────────────────────────────────────────────────────┐ |
| │ CYCLE PROGRESS                                     │ |
| │                                                    │ |
| │ Total Employees: 127                               │ |
| │                                                    │ |
| │ ✅ Completed: 102 (80.3%)                          │ |
| │ 🔄 In Progress: 15 (11.8%)                         │ |
| │ ⏳ Not Started: 10 (7.9%)                          │ |
| │                                                    │ |
| │ [███████████████████░░░] 80%                      │ |
| └────────────────────────────────────────────────────┘ |
|                                                          |
| ⚠️ ITEMS NEEDING ATTENTION                               |
| • 10 reviews not started (18 days to deadline)           |
| • 3 managers have not started any reviews                |
| • 2 employees awaiting self-assessment                   |
|                                                          |
| [View All Reviews] [Send Reminders] [Generate Report]   |
+----------------------------------------------------------+
| REVIEW BREAKDOWN BY DEPARTMENT                           |
| Department      Total  Complete  In Progress  Not Started|
| ─────────────────────────────────────────────────────── |
| Recruiting        45      40         3            2      |
| Sales             32      28         2            2      |
| Operations        25      20         5            0      |
| IT                15      10         3            2      |
| Finance           10       4         2            4      |
| ─────────────────────────────────────────────────────── |
| [View by Manager] [Filter ▼]                            |
+----------------------------------------------------------+
| PREVIOUS CYCLES                                          |
| • Q3 2024: 100% Complete (Closed 10/05/24)              |
| • Q2 2024: 100% Complete (Closed 07/07/24)              |
| [View Archive]                                           |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 2: Review Not Started List

**User Action:** Click "View All Reviews", filter by "Not Started"

**System Response:**
- Reviews list loads
- Filtered to show 10 not-started reviews

**Screen State:**
```
+----------------------------------------------------------+
| Performance Reviews - Q4 2024         [Export] [⌘K]      |
+----------------------------------------------------------+
| [Search employees...]      [Filter ▼] [Sort ▼] [All ✓]  |
+----------------------------------------------------------+
| Status: [All] [Not Started (10)] [In Progress] [Complete]|
+----------------------------------------------------------+
| Employee        Department  Manager         Status       |
| ─────────────────────────────────────────────────────── |
| Sarah Chen      Recruiting  Mike Rodriguez  ⏳ Not Started|
|   Due: 12/31/24 (18 days)                               |
|   [Send Reminder to Manager] [View]                     |
| ─────────────────────────────────────────────────────── |
| John Doe        Sales       Lisa Wang       ⏳ Not Started|
|   Due: 12/31/24 (18 days)                               |
|   [Send Reminder to Manager] [View]                     |
| ─────────────────────────────────────────────────────── |
| Emily Rodriguez Finance     David Kim       ⏳ Not Started|
|   Due: 12/31/24 (18 days)                               |
|   [Send Reminder to Manager] [View]                     |
| ─────────────────────────────────────────────────────── |
| [Showing 3 of 10]                                       |
|                                                          |
| [Send Reminder to All] [Bulk Actions ▼]                 |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 3: Send Reminder to Manager

**User Action:** Click "Send Reminder to All"

**System Response:**
- Confirmation modal opens

**Screen State:**
```
+----------------------------------------------------------+
| Send Review Reminders                           [×]      |
+----------------------------------------------------------+
| You are about to send reminder emails to:                |
|                                                          |
| • Mike Rodriguez (2 pending reviews)                     |
| • Lisa Wang (1 pending review)                           |
| • David Kim (4 pending reviews)                          |
| • Kevin Zhang (3 pending reviews)                        |
|                                                          |
| Total: 4 managers, 10 pending reviews                    |
|                                                          |
| Email Preview:                                           |
| ┌────────────────────────────────────────────────────┐ |
| │ Subject: Action Required: Q4 Performance Reviews   │ |
| │                                                    │ |
| │ Hi Mike,                                           │ |
| │                                                    │ |
| │ You have 2 pending performance reviews due by     │ |
| │ 12/31/2024 (18 days remaining):                   │ |
| │                                                    │ |
| │ 1. Sarah Chen - Senior Recruiter                  │ |
| │ 2. Michael Johnson - Recruiter                    │ |
| │                                                    │ |
| │ Please complete these reviews by the deadline to  │ |
| │ ensure timely feedback for your team.             │ |
| │                                                    │ |
| │ [Start Reviews]                                   │ |
| │                                                    │ |
| │ Thanks,                                            │ |
| │ HR Team                                            │ |
| └────────────────────────────────────────────────────┘ |
|                                                          |
| ☑ Include direct link to review form                    |
| ☐ CC: HR Manager                                        |
|                                                          |
+----------------------------------------------------------+
|                            [Cancel]  [Send Reminders ✓]  |
+----------------------------------------------------------+
```

**User Action:** Click "Send Reminders"

**System Response:**
- Emails sent to 4 managers
- Activity logged for each reminder
- Toast: "Reminders sent to 4 managers"
- Modal closes

**Time:** ~1 minute

---

### Step 4: View In-Progress Review

**User Action:** Filter by "In Progress", click on first review

**System Response:**
- Review detail modal opens

**Screen State:**
```
+----------------------------------------------------------+
| Performance Review - Michael Johnson            [×]      |
+----------------------------------------------------------+
| Employee: Michael Johnson (EMP-2024-089)                 |
| Position: Senior Recruiter                               |
| Department: Recruiting                                   |
| Manager: Mike Rodriguez                                  |
| Review Period: Q4 2024 (Oct 1 - Dec 31)                  |
| Due Date: 12/31/2024                                     |
| Status: 🔄 IN PROGRESS (70% complete)                    |
+----------------------------------------------------------+
| REVIEW SECTIONS                                          |
|                                                          |
| ✅ 1. Employee Self-Assessment (Submitted 12/05)         |
| ✅ 2. Manager Evaluation (Submitted 12/10)               |
| 🔄 3. Goals Review (In Progress)                         |
| ⏳ 4. Development Plan (Not Started)                     |
| ⏳ 5. Compensation Review (Not Started - HR only)        |
+----------------------------------------------------------+
| EMPLOYEE SELF-ASSESSMENT                                 |
|                                                          |
| Q: What were your key accomplishments this quarter?      |
| A: "Placed 2 candidates at Google and Meta, exceeding   |
| my quarterly target of 1.5 placements. Built strong     |
| relationships with 5 new client hiring managers."        |
|                                                          |
| Q: What challenges did you face?                         |
| A: "Struggled with candidate sourcing for niche tech    |
| roles. Need to improve LinkedIn search skills."          |
|                                                          |
| Q: What are your goals for next quarter?                |
| A: "Aim for 2 placements again. Complete advanced       |
| sourcing training. Become pod senior member."            |
|                                                          |
| [View Full Self-Assessment]                              |
+----------------------------------------------------------+
| MANAGER EVALUATION                                       |
|                                                          |
| Overall Rating: ⭐⭐⭐⭐ (4/5 - Exceeds Expectations)      |
|                                                          |
| Category Ratings:                                        |
| • Quality of Work: 5/5 (Outstanding)                    |
| • Productivity: 4/5 (Exceeds)                           |
| • Communication: 4/5 (Exceeds)                          |
| • Teamwork: 4/5 (Exceeds)                               |
| • Initiative: 3/5 (Meets)                               |
|                                                          |
| Manager Comments:                                        |
| "Michael had an excellent quarter, placing 2 candidates |
| and building great client relationships. He needs to    |
| work on proactive candidate sourcing to reduce reliance |
| on job board searches."                                  |
|                                                          |
| [View Full Evaluation]                                   |
+----------------------------------------------------------+
| GOALS REVIEW (In Progress)                               |
|                                                          |
| Q3 Goals:                                                |
| ✅ 1. Make 1.5 placements (Achieved: 2)                 |
| ✅ 2. Build 3 new client relationships (Achieved: 5)    |
| ⚠️ 3. Complete CRM training (Partially: 60% done)       |
|                                                          |
| [Manager: Complete Goals Review]                         |
+----------------------------------------------------------+
| HR ACTIONS                                               |
| [Send Reminder to Manager] [Mark as Complete] [Export]  |
+----------------------------------------------------------+
```

**User Action:** Close modal (review in progress, no HR action needed yet)

**Time:** ~2 minutes

---

### Step 5: Generate Cycle Report

**User Action:** Return to dashboard, click "Generate Report"

**System Response:**
- Report options modal opens

**Screen State:**
```
+----------------------------------------------------------+
| Generate Performance Review Report          [×]          |
+----------------------------------------------------------+
| Report Type *                                            |
| ● Cycle Summary (Current quarter overview)              |
| ○ Individual Reviews (All employee reviews)             |
| ○ Manager Breakdown (By manager)                        |
| ○ Department Analysis (By department)                   |
| ○ Ratings Distribution (Bell curve, trends)             |
|                                                          |
| Review Cycle *                                           |
| [Q4 2024                                           ▼]    |
|                                                          |
| Include:                                                 |
| ☑ Completion status                                     |
| ☑ Rating distribution                                   |
| ☑ Goals achievement                                     |
| ☑ Top performers                                        |
| ☑ Development areas                                     |
| ☐ Compensation recommendations (HR only)                |
|                                                          |
| Format                                                   |
| ● PDF  ○ Excel  ○ PowerPoint                           |
|                                                          |
+----------------------------------------------------------+
|                    [Cancel]  [Generate Report ✓]         |
+----------------------------------------------------------+
```

**User Action:** Select options, click "Generate Report"

**System Response:**
- Report generates (5-10 seconds)
- PDF downloads: `Q4_2024_Performance_Review_Summary.pdf`

**Report Contents:**
```
┌────────────────────────────────────────────────────────┐
│ PERFORMANCE REVIEW CYCLE REPORT                        │
│ Q4 2024 (October - December)                           │
│ Generated: 12/13/2024                                  │
└────────────────────────────────────────────────────────┘

EXECUTIVE SUMMARY
─────────────────
• Total Employees: 127
• Reviews Completed: 102 (80.3%)
• Reviews In Progress: 15 (11.8%)
• Reviews Not Started: 10 (7.9%)
• Average Completion Time: 12 days
• On-Time Completion Rate: 85%

RATING DISTRIBUTION
───────────────────
5 - Outstanding:        18 (14.2%)  ⭐⭐⭐⭐⭐
4 - Exceeds:            52 (40.9%)  ⭐⭐⭐⭐
3 - Meets:              47 (37.0%)  ⭐⭐⭐
2 - Below:               8 (6.3%)   ⭐⭐
1 - Unsatisfactory:      2 (1.6%)   ⭐

Bell Curve: Normal distribution ✓

GOALS ACHIEVEMENT
─────────────────
• Fully Achieved: 68%
• Partially Achieved: 25%
• Not Achieved: 7%

TOP PERFORMERS (5/5 Rating)
───────────────────────────
1. Emily Rodriguez - Exceeded all targets, 2.5 placements
2. David Park - Exceptional client relationships
3. Lisa Martinez - Led team training initiative
... (15 more)

DEVELOPMENT AREAS
─────────────────
Most Common:
• Time management (mentioned in 23 reviews)
• Advanced technical skills (18 reviews)
• Leadership skills (15 reviews)

RECOMMENDATIONS
───────────────
1. Provide time management workshop (Q1 2025)
2. Offer LinkedIn Recruiter advanced training
3. Initiate leadership development program
4. Address 2 unsatisfactory performers (PIPs)

DEPARTMENT PERFORMANCE
──────────────────────
Recruiting:   Avg Rating: 3.8 (Exceeds company avg)
Sales:        Avg Rating: 3.6 (Meets company avg)
Operations:   Avg Rating: 3.9 (Exceeds)
IT:           Avg Rating: 3.5 (Meets)
Finance:      Avg Rating: 3.2 (Below company avg - needs attention)
```

**Time:** ~2 minutes

---

### Step 6: Start New Review Cycle (Optional - for next quarter)

**User Action:** Click "+ New Cycle"

**System Response:**
- New cycle wizard opens

**Screen State:**
```
+----------------------------------------------------------+
| Create New Review Cycle                         [×]      |
+----------------------------------------------------------+
| Step 1 of 3: Cycle Details                               |
|                                                          |
| Review Period *                                          |
| Quarter: [Q1 2025                              ▼]        |
| Start Date: [01/01/2025                       📅]        |
| End Date: [03/31/2025                         📅]        |
|                                                          |
| Review Due Date *                                        |
| [04/15/2025                                   📅]        |
| (2 weeks after quarter end - recommended)                |
|                                                          |
| Review Type *                                            |
| ● Quarterly Review (Standard)                           |
| ○ Annual Review (Comprehensive)                         |
| ○ Mid-Year Review (Semi-Annual)                         |
| ○ Probationary Review (New Hires)                       |
|                                                          |
| Participants *                                           |
| ☑ All Active Employees (130)                            |
| ☐ Specific Departments                                  |
| ☐ Specific Individuals                                  |
|                                                          |
| Exclude:                                                 |
| ☑ Employees on leave                                    |
| ☑ New hires < 30 days                                   |
| ☐ Contractors/Consultants                               |
|                                                          |
+----------------------------------------------------------+
|                     [Cancel]  [Next: Template →]         |
+----------------------------------------------------------+
```

**User Action:** Fill details, click "Next: Template"

**System Response:**
- Advances to Step 2: Review Template

**Screen State (Step 2):**
```
+----------------------------------------------------------+
| Create New Review Cycle                         [×]      |
+----------------------------------------------------------+
| Step 2 of 3: Review Template                             |
|                                                          |
| Template *                                               |
| ● Standard Quarterly Review                             |
| ○ Annual Comprehensive Review                           |
| ○ Custom Template                                       |
|                                                          |
| Review Sections (Included)                               |
| ☑ Employee Self-Assessment                              |
| ☑ Manager Evaluation                                    |
| ☑ Goals Review (Previous Quarter)                       |
| ☑ Goals Setting (Next Quarter)                          |
| ☑ Development Plan                                      |
| ☑ Compensation Discussion (HR only)                     |
|                                                          |
| Rating Scale *                                           |
| ● 1-5 Scale (Unsatisfactory to Outstanding)            |
| ○ 1-3 Scale (Needs Improvement, Meets, Exceeds)        |
| ○ Pass/Fail                                             |
|                                                          |
| Evaluation Categories                                    |
| ☑ Quality of Work                                       |
| ☑ Productivity                                          |
| ☑ Communication                                         |
| ☑ Teamwork                                              |
| ☑ Initiative                                            |
| ☑ Job Knowledge                                         |
| ☑ Problem Solving                                       |
|                                                          |
| [Preview Template]                                       |
+----------------------------------------------------------+
|              [← Back]  [Cancel]  [Next: Schedule →]      |
+----------------------------------------------------------+
```

**User Action:** Select template options, click "Next: Schedule"

**System Response:**
- Advances to Step 3: Schedule

**Screen State (Step 3):**
```
+----------------------------------------------------------+
| Create New Review Cycle                         [×]      |
+----------------------------------------------------------+
| Step 3 of 3: Schedule & Notifications                    |
|                                                          |
| Cycle Timeline                                           |
|                                                          |
| 01/01/2025: Q1 starts                                    |
| 03/31/2025: Q1 ends                                      |
| 04/01/2025: Notify managers to start reviews            |
| 04/15/2025: All reviews due                              |
|                                                          |
| Automatic Reminders                                      |
| ☑ 2 weeks before due date                               |
| ☑ 1 week before due date                                |
| ☑ 3 days before due date                                |
| ☑ Day of due date                                       |
| ☑ Daily after overdue                                   |
|                                                          |
| Notification Recipients                                  |
| ☑ Managers (for their direct reports)                   |
| ☑ Employees (to complete self-assessment)               |
| ☑ HR Manager (progress updates)                         |
| ☐ Executives (summary reports)                          |
|                                                          |
| Kickoff Communication                                    |
| ☑ Send kickoff email to all managers on 04/01/2025      |
| ☑ Send instructions to employees on 04/01/2025          |
|                                                          |
| Email Preview:                                           |
| [View Manager Email] [View Employee Email]               |
|                                                          |
+----------------------------------------------------------+
| REVIEW & CREATE                                          |
|                                                          |
| ✓ Cycle: Q1 2025 (01/01 - 03/31)                        |
| ✓ Due Date: 04/15/2025                                   |
| ✓ Participants: 130 employees                            |
| ✓ Template: Standard Quarterly                           |
| ✓ Reminders: Enabled                                     |
|                                                          |
+----------------------------------------------------------+
|          [← Back]  [Cancel]  [Create Review Cycle ✓]    |
+----------------------------------------------------------+
```

**User Action:** Click "Create Review Cycle"

**System Response:**

1. **Create Review Cycle Record:**
   ```sql
   INSERT INTO review_cycles (
     id, org_id, name, period_start, period_end,
     due_date, review_type, template_id,
     status, created_by
   ) VALUES (
     uuid_generate_v4(), current_org_id,
     'Q1 2025 Quarterly Review',
     '2025-01-01', '2025-03-31', '2025-04-15',
     'quarterly', 'standard_quarterly',
     'scheduled', current_user_id
   );
   ```

2. **Create Individual Reviews:**
   ```typescript
   const employees = await getActiveEmployees({ excludeOnLeave: true, excludeNew: true });
   // Returns 130 employees

   for (const employee of employees) {
     await db.insert(performance_reviews).values({
       cycleId: newCycleId,
       employeeId: employee.id,
       managerId: employee.managerId,
       status: 'not_started',
       dueDate: '2025-04-15'
     });
   }
   ```

3. **Schedule Automated Reminders:**
   ```typescript
   const reminders = [
     { date: '2025-04-01', type: 'kickoff' },
     { date: '2025-04-01', type: 'manager_start' },
     { date: '2025-04-01', type: 'employee_self_assessment' },
     { date: '2025-04-01', type: 'two_weeks_before' },
     { date: '2025-04-08', type: 'one_week_before' },
     { date: '2025-04-12', type: 'three_days_before' },
     { date: '2025-04-15', type: 'due_date' }
   ];

   for (const reminder of reminders) {
     await scheduleEmail({
       sendAt: reminder.date,
       template: reminder.type,
       recipients: reminder.type.includes('manager') ? managers : employees
     });
   }
   ```

4. **Success Response:**
   - Modal closes
   - Toast: "Q1 2025 review cycle created! 130 reviews scheduled."
   - Dashboard updates with new cycle
   - Current cycle remains Q4 2024 (until closed)

**Time:** ~3 minutes

---

## Postconditions

### For Current Cycle Management:
1. ✅ Reminders sent to managers with pending reviews
2. ✅ Progress tracked on HR dashboard
3. ✅ Report generated showing cycle status
4. ✅ Activity logged for all actions

### For New Cycle Creation:
1. ✅ New review cycle created (Q1 2025)
2. ✅ 130 individual reviews created
3. ✅ Automated reminders scheduled
4. ✅ Kickoff emails scheduled for 04/01/2025
5. ✅ Managers and employees will be notified
6. ✅ HR dashboard shows new cycle (status: "Scheduled")

---

## Alternative Flows

### A1: Close Completed Review Cycle

**Trigger:** All reviews completed

**Flow:**
1. HR navigates to review cycle
2. Verifies 100% completion
3. Clicks "Close Cycle"
4. System prompts: "Are you sure? This action cannot be undone."
5. HR confirms
6. System:
   - Sets cycle status to "Closed"
   - Archives all reviews
   - Generates final report
   - Sends summary to leadership
   - Locks reviews (no more edits)

### A2: Handle Overdue Reviews (Escalation)

**Trigger:** Reviews past due date, still incomplete

**Flow:**
1. System auto-sends daily reminders
2. After 3 days overdue:
   - HR receives notification: "15 reviews overdue"
   - HR reviews list of overdue managers
3. HR clicks "Escalate to Manager's Manager"
4. Email sent to senior manager:
   - "Your direct report [Manager] has 3 overdue reviews"
   - Requested action by [date]
5. After 7 days overdue:
   - HR escalates to CEO
   - CEO can intervene or require completion

### A3: Performance Improvement Plan (PIP) Creation

**Trigger:** Employee receives rating of 1 or 2 (Unsatisfactory/Below)

**Flow:**
1. Manager completes review with low rating
2. HR receives notification: "Low rating - consider PIP"
3. HR reviews employee's review
4. HR schedules meeting with manager
5. Together, they decide: PIP or other action
6. If PIP:
   - HR clicks "Create PIP" from review
   - PIP wizard opens
   - HR/Manager define:
     - Performance issues
     - Improvement goals
     - Timeline (typically 30-90 days)
     - Support/resources
     - Check-in schedule
   - PIP is created and assigned
   - Employee is notified and signs PIP
7. PIP progress tracked separately
8. At PIP end: Successful completion or termination

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Cannot create cycle | Overlapping cycle exists | "A review cycle for Q1 2025 already exists" | Edit existing cycle or delete |
| Manager missing | Employee has no assigned manager | "Cannot create review: Employee has no manager" | Assign manager first |
| No employees | No active employees meet criteria | "No employees match the cycle criteria" | Adjust criteria |
| Email send failure | SMTP error | "Failed to send reminder emails. Please try again." | Retry or send manually |
| Report generation error | Data processing error | "Failed to generate report. Please contact support." | Retry or export raw data |

---

## Compliance & Best Practices

### Legal Compliance

- **Documentation**: All reviews must be documented for legal defense
- **Consistency**: Use same criteria/template for all employees
- **Timeliness**: Complete reviews within reasonable timeframe
- **Privacy**: Store reviews securely, limit access
- **Signature**: Employee should acknowledge review (e-sign)

### Best Practices

1. **Regular Cadence**: Quarterly or annual reviews
2. **Two-Way Conversation**: Not just manager → employee
3. **Goal-Oriented**: Focus on future, not just past
4. **Specific Examples**: Use concrete examples, not generalizations
5. **Development Focus**: Identify growth opportunities
6. **Fair Ratings**: Avoid bias, use objective criteria
7. **Follow-Up**: Reviews should lead to action (goals, training, etc.)

---

## Related Use Cases

- [02-employee-onboarding.md](./02-employee-onboarding.md) - 90-day probationary review
- [03-payroll-management.md](./03-payroll-management.md) - Compensation adjustments

---

*Last Updated: 2024-11-30*
