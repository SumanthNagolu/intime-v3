# Use Case: Manage Active Placements

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-CLI-004 |
| Actor | Client Portal User (Hiring Manager, Procurement Manager) |
| Goal | Monitor, manage, and approve ongoing consultant/contractor placements |
| Frequency | Daily (for timesheet approvals), Weekly (for performance reviews) |
| Estimated Time | 2-5 minutes per timesheet, 10-20 minutes per review |
| Priority | Critical |

---

## Preconditions

1. User is logged in as Client Portal User
2. User has "placement:manage" and "timesheet:approve" permissions
3. At least one active placement exists for user's organization
4. Consultant/contractor has started work

---

## Trigger

One of the following:
- Email notification: "Timesheet submitted by [Consultant Name]"
- Dashboard shows pending timesheet approvals
- Weekly review reminder
- User navigates to Placements page
- Performance issue escalation
- Contract extension reminder (2 weeks before end date)

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Placements

**User Action:** Click "Placements" in navigation menu

**System Response:**
- URL changes to: `/client/placements`
- Placements page loads
- Default view: Active placements (grid/list view)
- Filters available: Active | Ending Soon | All

**Screen State:**
```
+----------------------------------------------------------+
| Placements                [Grid View] [List View] [Filter]|
+----------------------------------------------------------+
| [Active (42)] [Ending Soon (7)] [Past (156)] [All (205)] |
+----------------------------------------------------------+
| Filter: [All Departments ▼] [All Roles ▼]  Sort: [Newest]|
+----------------------------------------------------------+
| Search placements...                              [Search]|
+----------------------------------------------------------+
|                                                           |
| Active Placements (42)                                    |
|                                                           |
| ┌────────────────┐ ┌────────────────┐ ┌────────────────┐|
| │ Michael Chang  │ │Jennifer Garcia │ │ Chris Anderson │|
| │ ⭐⭐⭐⭐⭐        │ │ ⭐⭐⭐⭐☆        │ │ ⭐⭐⭐⭐⭐        │|
| │                │ │                │ │                │|
| │ Sr. Developer  │ │ DevOps Lead    │ │ QA Engineer    │|
| │ Engineering    │ │ Operations     │ │ Quality        │|
| │                │ │                │ │                │|
| │ Week 8 of 26   │ │ Week 11 of 26  │ │ Week 2 of 12   │|
| │ [██████░░░░░░] │ │ [███████░░░░░] │ │ [█░░░░░░░░░░░] │|
| │ 31% Complete   │ │ 42% Complete   │ │ 17% Complete   │|
| │                │ │                │ │                │|
| │ 🔔 Timesheet   │ │ ✓ All current  │ │ ✓ All current  │|
| │ 4 hrs pending  │ │                │ │                │|
| │                │ │                │ │                │|
| │ [Manage]       │ │ [Manage]       │ │ [Manage]       │|
| └────────────────┘ └────────────────┘ └────────────────┘|
|                                                           |
| ┌────────────────┐ ┌────────────────┐ ┌────────────────┐|
| │ Lisa Roberts   │ │ James Wilson   │ │ Maria Santos   │|
| │ ⭐⭐⭐⭐☆        │ │ ⭐⭐⭐⭐⭐        │ │ ⭐⭐⭐☆☆        │|
| │                │ │                │ │                │|
| │ Data Analyst   │ │ Sr. Backend    │ │ UI/UX Designer │|
| │ Analytics      │ │ Engineering    │ │ Design         │|
| │                │ │                │ │                │|
| │ Week 15 of 26  │ │ Week 22 of 26  │ │ Week 6 of 12   │|
| │ [██████████░░] │ │ [███████████░] │ │ [███░░░░░░░░░] │|
| │ 58% Complete   │ │ 85% Complete   │ │ 50% Complete   │|
| │                │ │                │ │                │|
| │ ⚠️ Review due   │ │ 🔔 Extend?     │ │ ✓ All current  │|
| │ in 3 days      │ │ 4 weeks left   │ │                │|
| │                │ │                │ │                │|
| │ [Manage]       │ │ [Manage]       │ │ [Manage]       │|
| └────────────────┘ └────────────────┘ └────────────────┘|
|                                                           |
+----------------------------------------------------------+
| Showing 6 of 42 active placements           [Load More]  |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 2: Select Placement to Manage

**User Action:** Click [Manage] on Michael Chang's card

**System Response:**
- Placement detail modal opens (full-screen)
- Shows comprehensive placement information
- Multiple tabs for different aspects

**Screen State:**
```
+----------------------------------------------------------+
|                                  [← Back to List]    [×]  |
| Placement: Michael Chang                                  |
+----------------------------------------------------------+
| [Overview] [Timesheets] [Performance] [Documents] [Notes]|
+----------------------------------------------------------+
| Overview                                                  |
|                                                           |
| ┌─────────────────────────────────────────────────────┐  |
| │ 👤 Michael Chang                                     │  |
| │ ⭐⭐⭐⭐⭐ 5.0/5.0 Average Rating                       │  |
| │                                                      │  |
| │ 📧 michael.chang@email.com                           │  |
| │ 📱 (555) 234-5678                                    │  |
| │ 💼 Senior Software Developer                         │  |
| │ 🏢 Department: Engineering                           │  |
| │ 👤 Manager: Sarah Thompson (You)                     │  |
| │ 📍 Location: San Francisco, CA (Remote)              │  |
| └─────────────────────────────────────────────────────┘  |
|                                                           |
| Placement Details                                         |
| ─────────────────────────────────────────────────────────|
| Start Date:       Oct 1, 2025                             |
| End Date:         Mar 31, 2026 (26 weeks total)           |
| Current Week:     Week 8 of 26 (31% complete)             |
| Days Remaining:   126 days (18 weeks)                     |
| Status:           Active ✓                                |
|                                                           |
| Contract Terms                                            |
| ─────────────────────────────────────────────────────────|
| Rate:             $95.00/hour                             |
| Hours/Week:       40 hours (Full-time)                    |
| Total Hours:      1,040 hours budgeted                    |
| Hours Used:       320 hours (31%)                         |
| Hours Remaining:  720 hours                               |
| Extension Option: Yes (up to 26 weeks)                    |
|                                                           |
| Financial Summary                                         |
| ─────────────────────────────────────────────────────────|
| Total Budget:     $98,800.00                              |
| Spent to Date:    $30,400.00 (31%)                        |
| Remaining:        $68,400.00                              |
| Avg Weekly Cost:  $3,800.00                               |
| On Budget:        ✓ Yes                                   |
|                                                           |
| Performance Snapshot                                      |
| ─────────────────────────────────────────────────────────|
| Latest Rating:    ⭐⭐⭐⭐⭐ 5.0 (Nov 15, 2025)             |
| Reviews:          2 reviews submitted                     |
| Attendance:       100% (0 absences)                       |
| Timesheet:        100% on-time submissions                |
| Quality:          Exceeds expectations                    |
|                                                           |
+----------------------------------------------------------+
| Pending Actions                                           |
+----------------------------------------------------------+
| 🔴 Timesheet Approval Required                            |
|    Week ending Dec 1, 2025 - 40.0 hours                  |
|    Submitted 4 hours ago                                  |
|    [Review & Approve Timesheet →]                         |
|                                                           |
+----------------------------------------------------------+
| Quick Actions                                             |
+----------------------------------------------------------+
| [📄 Approve Timesheet]  [⭐ Submit Review]                |
| [💬 Send Message]       [📎 View Documents]               |
| [📊 View Reports]       [🔄 Request Extension]            |
| [⚠️ Report Issue]        [❌ End Placement]                |
+----------------------------------------------------------+
```

**Time:** ~5 seconds

---

### Step 3: Review Pending Timesheet

**User Action:** Click [Review & Approve Timesheet →]

**System Response:**
- Switches to [Timesheets] tab
- Shows pending timesheet details
- Highlights current week

**Screen State:**
```
+----------------------------------------------------------+
| [Overview] [Timesheets] [Performance] [Documents] [Notes]|
+----------------------------------------------------------+
| Timesheets                                                |
|                                                           |
| Pending Approval (1)                                      |
|                                                           |
| ┌─────────────────────────────────────────────────────┐  |
| │ Week ending December 1, 2025                         │  |
| │ Submitted: Nov 30, 2025 at 5:15 PM                   │  |
| │ Status: 🔴 Pending Your Approval                     │  |
| │                                                      │  |
| │ Hours Breakdown:                                     │  |
| │ ──────────────────────────────────────────────────  │  |
| │ Mon, Nov 25   8.0 hrs  [████████] Regular           │  |
| │ Tue, Nov 26   8.0 hrs  [████████] Regular           │  |
| │ Wed, Nov 27   8.0 hrs  [████████] Regular           │  |
| │ Thu, Nov 28   0.0 hrs  [        ] Thanksgiving      │  |
| │ Fri, Nov 29   8.0 hrs  [████████] Regular           │  |
| │ Sat, Nov 30   8.0 hrs  [████████] Weekend Work      │  |
| │ Sun, Dec 1    0.0 hrs  [        ] -                 │  |
| │                                                      │  |
| │ Total Hours:  40.0 hours                             │  |
| │ Regular:      32.0 hours × $95/hr  = $3,040.00      │  |
| │ Weekend:       8.0 hours × $142.50/hr = $1,140.00   │  |
| │ Total Cost:   $4,180.00                              │  |
| │                                                      │  |
| │ Notes from Consultant:                               │  |
| │ "Worked Saturday to complete the authentication      │  |
| │ module before Monday's deployment. Module is now     │  |
| │ ready for QA review."                                │  |
| │                                                      │  |
| │ Project/Task Codes:                                  │  |
| │ - AUTH-MODULE: 32 hours                              │  |
| │ - DEPLOYMENT-PREP: 8 hours                           │  |
| │                                                      │  |
| └─────────────────────────────────────────────────────┘  |
|                                                           |
| Approval Options:                                         |
|                                                           |
| ⦿ Approve as submitted (40.0 hours)                       |
| ○ Approve with changes (adjust hours below)               |
| ○ Reject / Request corrections                            |
|                                                           |
| Approval Comments (optional):                             |
| [Great work on the authentication module! Thanks for     ]|
| [putting in the extra hours to meet the deadline.         ]|
|                                               ] 95/500     |
|                                                           |
| Weekend Work Approval:                                    |
| ☑ I confirm weekend work was pre-approved                 |
| ☐ Weekend work was emergency/unexpected                   |
|                                                           |
| Budget Impact:                                            |
| Week Cost:     $4,180.00                                  |
| Spent to Date: $30,400.00                                 |
| New Total:     $34,580.00 (35% of budget)                 |
| Status:        ✓ Within budget                            |
|                                                           |
+----------------------------------------------------------+
|              [Reject]  [Request Changes]  [Approve]       |
+----------------------------------------------------------+
```

**Time:** ~1-2 minutes

---

### Step 4: Verify Hours and Details

**User Action:** Review hours breakdown and notes

**System Response:**
- Shows day-by-day breakdown
- Highlights unusual entries (weekend work)
- Calculates costs including overtime/weekend premiums
- Shows project/task codes

**Timesheet Rules:**

| Rule | Check | Alert If |
|------|-------|----------|
| Max Daily Hours | ≤ 12 hours/day | Exceeded (requires approval) |
| Max Weekly Hours | ≤ 60 hours/week | Exceeded (requires approval) |
| Weekend Work | Requires pre-approval | Not pre-approved |
| Holiday Work | Double-time rate | Holiday detected |
| Gaps | Consecutive days off | > 3 days without entry |
| Project Codes | All hours assigned | Unassigned hours |

**Weekend Work Validation:**

In this case:
- Saturday (Nov 30): 8 hours worked
- Weekend rate: $95 × 1.5 = $142.50/hr
- User must confirm pre-approval

**Time:** ~2 minutes

---

### Step 5: Approve Timesheet

**User Action:**
1. Select "Approve as submitted"
2. Check "I confirm weekend work was pre-approved"
3. Add approval comment
4. Click [Approve] button

**System Response:**
1. Button shows loading state
2. Validates approval (budget check, approval authority)
3. API call: `POST /api/client/timesheets/{id}/approve`
4. On success:
   - Success animation
   - Toast: "Timesheet approved. Invoice will be generated."
   - Email sent to:
     - Consultant: "Timesheet approved by Sarah Thompson"
     - Accounting: Invoice generation triggered
     - Recruiter: FYI notification
   - Timesheet status: "pending" → "approved"
   - Badge removed from dashboard
   - Financial totals updated
5. Modal returns to Timesheets tab
6. Approved timesheet moves to "History" section

**Screen State (After Approval):**
```
+----------------------------------------------------------+
| Timesheets                                                |
|                                                           |
| ✓ All timesheets current - No pending approvals           |
|                                                           |
| Recent Timesheets                                         |
| ─────────────────────────────────────────────────────────|
| Week ending Dec 1, 2025    40.0 hrs  ✓ Approved          |
|   Approved: Nov 30, 2025 at 6:45 PM (just now)           |
|   Total: $4,180.00                                        |
|   [View Details] [Download PDF]                           |
|                                                           |
| Week ending Nov 24, 2025   40.0 hrs  ✓ Approved          |
|   Approved: Nov 24, 2025 at 4:30 PM                      |
|   Total: $3,800.00                                        |
|   [View Details] [Download PDF]                           |
|                                                           |
| Week ending Nov 17, 2025   40.0 hrs  ✓ Approved          |
|   Approved: Nov 17, 2025 at 3:15 PM                      |
|   Total: $3,800.00                                        |
|   [View Details] [Download PDF]                           |
|                                                           |
+----------------------------------------------------------+
| Timesheet Summary                                         |
+----------------------------------------------------------+
| Total Hours Approved:    320 hours                        |
| Total Cost to Date:      $34,580.00                       |
| Average Weekly Hours:    40.0 hours                       |
| On-time Submission Rate: 100%                             |
| Approval Turnaround:     Avg 18 hours                     |
|                                                           |
| [View All Timesheets] [Export to Excel] [View Invoice]   |
+----------------------------------------------------------+
```

**Time:** ~3-5 seconds

---

### Step 6: Submit Performance Review

**User Action:** Click [Performance] tab

**System Response:**
- Switches to Performance tab
- Shows performance history
- Highlights if review due

**Screen State:**
```
+----------------------------------------------------------+
| [Overview] [Timesheets] [Performance] [Documents] [Notes]|
+----------------------------------------------------------+
| Performance Reviews                                       |
|                                                           |
| ⚠️ Monthly Review Due in 3 Days                           |
| Last review: Nov 15, 2025 (2 weeks ago)                  |
| Next review due: Dec 15, 2025                            |
|                                                           |
| [Submit New Review]                                       |
|                                                           |
+----------------------------------------------------------+
| Performance History                                       |
+----------------------------------------------------------+
| Review #2 - November 15, 2025              ⭐⭐⭐⭐⭐ 5.0   |
| ┌─────────────────────────────────────────────────────┐  |
| │ Period: Nov 1-15, 2025 (Weeks 5-6)                  │  |
| │ Reviewed by: Sarah Thompson (You)                   │  |
| │                                                      │  |
| │ Ratings:                                             │  |
| │ Technical Skills:      ⭐⭐⭐⭐⭐ 5/5                    │  |
| │ Code Quality:          ⭐⭐⭐⭐⭐ 5/5                    │  |
| │ Communication:         ⭐⭐⭐⭐⭐ 5/5                    │  |
| │ Collaboration:         ⭐⭐⭐⭐⭐ 5/5                    │  |
| │ Productivity:          ⭐⭐⭐⭐⭐ 5/5                    │  |
| │ Reliability:           ⭐⭐⭐⭐⭐ 5/5                    │  |
| │                                                      │  |
| │ Comments:                                            │  |
| │ "Michael continues to exceed expectations. He        │  |
| │ completed the user dashboard feature ahead of        │  |
| │ schedule with excellent code quality. The team       │  |
| │ appreciates his mentorship of junior developers."    │  |
| │                                                      │  |
| │ Recommendation: Continue / Extend                    │  |
| │                                                      │  |
| │ [View Full Review]                                   │  |
| └─────────────────────────────────────────────────────┘  |
|                                                           |
| Review #1 - October 15, 2025              ⭐⭐⭐⭐⭐ 5.0   |
| ┌─────────────────────────────────────────────────────┐  |
| │ Period: Oct 1-15, 2025 (Weeks 1-2)                  │  |
| │ Reviewed by: Sarah Thompson (You)                   │  |
| │                                                      │  |
| │ Summary: Strong start, ramped up quickly...          │  |
| │ Recommendation: Continue                             │  |
| │                                                      │  |
| │ [View Full Review]                                   │  |
| └─────────────────────────────────────────────────────┘  |
|                                                           |
+----------------------------------------------------------+
```

**User Action:** Click [Submit New Review]

**System Response:**
- Review form modal opens
- Pre-populated with consultant details
- Rating categories shown

**Screen State:**
```
+----------------------------------------------------------+
| Submit Performance Review: Michael Chang              [×] |
+----------------------------------------------------------+
| Review Period:                                            |
| [Nov 16, 2025] to [Nov 30, 2025]  (Weeks 7-8)            |
|                                                           |
+----------------------------------------------------------+
| Performance Ratings *                                     |
+----------------------------------------------------------+
| Technical Skills / Competency                             |
| [★★★★★] 5/5  Outstanding                                 |
| Comments: [Excellent React and Node.js work              ]|
|                                                           |
| Code Quality / Best Practices                             |
| [★★★★★] 5/5  Outstanding                                 |
| Comments: [Clean, well-documented code                   ]|
|                                                           |
| Communication                                             |
| [★★★★★] 5/5  Outstanding                                 |
| Comments: [Proactive communicator, great updates         ]|
|                                                           |
| Team Collaboration                                        |
| [★★★★★] 5/5  Outstanding                                 |
| Comments: [Works well with team, helps others            ]|
|                                                           |
| Productivity / Output                                     |
| [★★★★★] 5/5  Outstanding                                 |
| Comments: [Consistently delivers on time                 ]|
|                                                           |
| Reliability / Attendance                                  |
| [★★★★★] 5/5  Outstanding                                 |
| Comments: [100% attendance, always available             ]|
|                                                           |
+----------------------------------------------------------+
| Overall Assessment *                                      |
+----------------------------------------------------------+
| Overall Rating: [★★★★★] 5.0/5.0  Outstanding             |
|                                                           |
| Key Achievements This Period:                             |
| [- Completed authentication module ahead of schedule     ]|
| [- Implemented automated testing, increasing coverage    ]|
| [  from 60% to 85%                                        ]|
| [- Mentored junior developer on React best practices     ]|
|                                               ] 180/1000   |
|                                                           |
| Areas for Improvement / Development:                      |
| [None at this time. Michael is performing at the highest ]|
| [level. Would like to see him take on architecture       ]|
| [decisions for the next major feature.                    ]|
|                                               ] 120/500    |
|                                                           |
+----------------------------------------------------------+
| Recommendation *                                          |
+----------------------------------------------------------+
| ⦿ Continue placement - performing excellently             |
| ○ Continue with minor improvements needed                 |
| ○ Concerns - requires improvement plan                    |
| ○ End placement - not meeting expectations                |
|                                                           |
| Contract Extension:                                       |
| ⦿ Yes, I recommend extending contract when it ends        |
| ○ Undecided - will evaluate closer to end date            |
| ○ No extension planned                                    |
|                                                           |
+----------------------------------------------------------+
| Feedback Sharing                                          |
+----------------------------------------------------------+
| ☑ Share feedback with consultant                          |
| ☑ Share feedback with recruiter                           |
| ☐ Keep confidential (internal only)                       |
|                                                           |
| Schedule 1:1 Feedback Session:                            |
| ☑ Yes, schedule feedback meeting                          |
|   Preferred date: [Dec 5, 2025 📅]                        |
|   Duration: [30 minutes ▼]                                |
|                                                           |
+----------------------------------------------------------+
|              [Save Draft]  [Submit Review]                |
+----------------------------------------------------------+
```

**Time:** ~5-8 minutes

---

### Step 7: Submit Review

**User Action:** Click [Submit Review]

**System Response:**
1. Validates all required fields
2. API call: `POST /api/client/placements/{id}/review`
3. Success:
   - Toast: "Review submitted successfully"
   - Email to consultant (if sharing enabled)
   - Email to recruiter
   - 1:1 meeting scheduled (if requested)
   - Review added to history
   - Performance rating updated (rolling average)
   - Next review date set (2 weeks from now)
4. Modal closes

**Time:** ~2-3 seconds

---

### Step 8: Request Contract Extension

**User Action:** Click [Overview] tab, then [🔄 Request Extension]

**System Response:**
- Extension request form opens

**Screen State:**
```
+----------------------------------------------------------+
| Request Contract Extension: Michael Chang             [×] |
+----------------------------------------------------------+
| Current Contract                                          |
| ─────────────────────────────────────────────────────────|
| Start Date:    Oct 1, 2025                                |
| End Date:      Mar 31, 2026                               |
| Duration:      26 weeks                                   |
| Weeks Left:    18 weeks                                   |
|                                                           |
+----------------------------------------------------------+
| Extension Request                                         |
+----------------------------------------------------------+
| Extension Duration *                                      |
| ⦿ 13 weeks (3 months)                                     |
| ○ 26 weeks (6 months)                                     |
| ○ 52 weeks (1 year)                                       |
| ○ Custom: [__] weeks                                      |
|                                                           |
| New End Date: Jun 30, 2026                                |
|                                                           |
| Rate for Extension *                                      |
| ⦿ Same rate ($95/hour)                                    |
| ○ Negotiated rate: [$___/hour]                            |
|                                                           |
| Reason for Extension *                                    |
| [Michael has been an outstanding contributor. We need    ]|
| [him to continue leading the new feature development     ]|
| [through Q2 2026. His expertise is critical for the      ]|
| [upcoming product launch in June.                         ]|
|                                               ] 200/1000   |
|                                                           |
| Budget Information                                        |
| ─────────────────────────────────────────────────────────|
| Extension Cost:    $49,400.00 (13 weeks × 40 hrs × $95)  |
| Original Budget:   $98,800.00                             |
| Spent to Date:     $34,580.00                             |
| Remaining:         $64,220.00                             |
| After Extension:   $148,200.00 total                      |
|                                                           |
| Budget Approval Required: Yes (exceeds original budget)   |
| Approval Chain: You → Department Head → Finance           |
|                                                           |
| Business Justification *                                  |
| [Project scope expanded to include mobile app. Michael's ]|
| [React Native experience makes him ideal to lead this.   ]|
| [Hiring and ramping up new contractor would delay launch.]|
|                                               ] 150/500    |
|                                                           |
+----------------------------------------------------------+
| Approval Workflow                                         |
+----------------------------------------------------------+
| Step 1: Your submission (today)                           |
| Step 2: Department Head approval (2 business days)        |
| Step 3: Finance approval (3 business days)                |
| Step 4: Recruiter negotiates with consultant              |
| Step 5: Contract amendment executed                       |
|                                                           |
| Estimated Timeline: 7-10 business days                    |
|                                                           |
+----------------------------------------------------------+
|              [Cancel]  [Submit Extension Request]         |
+----------------------------------------------------------+
```

**User Action:** Click [Submit Extension Request]

**System Response:**
1. Validates budget and approval authority
2. API call: `POST /api/client/placements/{id}/extend`
3. Creates approval workflow
4. Notifications sent:
   - Department Head: Approval request
   - Recruiter: FYI (pending approval)
5. Toast: "Extension request submitted for approval"
6. Status badge added to placement: "Extension Pending"

**Time:** ~5-7 minutes

---

### Step 9: Report Performance Issue (Alternative Flow)

**User Action:** Click [⚠️ Report Issue]

**System Response:**
- Issue reporting form opens

**Screen State:**
```
+----------------------------------------------------------+
| Report Issue: Michael Chang                           [×] |
+----------------------------------------------------------+
| Issue Type *                                              |
| ○ Performance concerns                                    |
| ○ Attendance / Reliability                                |
| ○ Code quality issues                                     |
| ○ Communication problems                                  |
| ○ Team conflict                                           |
| ○ Policy violation                                        |
| ○ Other                                                   |
|                                                           |
| Severity *                                                |
| ○ Low - Minor issue, FYI                                  |
| ○ Medium - Needs attention                                |
| ○ High - Urgent, requires immediate action                |
| ○ Critical - Severe, consider ending placement            |
|                                                           |
| Description *                                             |
| [Describe the issue in detail...                         ]|
|                                                           |
|                                                           |
|                                               ] 0/2000     |
|                                                           |
| Date(s) of Incident:                                      |
| [MM/DD/YYYY 📅]  [+ Add another date]                     |
|                                                           |
| Witnesses / Others Involved:                              |
| [+ Add team member]                                       |
|                                                           |
| Actions Taken So Far:                                     |
| [Have you discussed with consultant? ▼]                   |
| ○ Yes, discussed directly                                 |
| ○ No, not yet discussed                                   |
| ○ Attempted but unresolved                                |
|                                                           |
| Desired Resolution *                                      |
| [What outcome are you seeking?                           ]|
|                                               ] 0/500      |
|                                                           |
| Escalation                                                |
| ☑ Notify recruiter (Amy Chen)                             |
| ☑ Notify account manager                                  |
| ☐ Request mediation session                               |
| ☐ Request placement termination                           |
|                                                           |
+----------------------------------------------------------+
|              [Cancel]  [Submit Issue Report]              |
+----------------------------------------------------------+
```

**Note:** This is rare for Michael (5-star performer), but flow exists for problematic placements.

**Time:** ~5-10 minutes

---

### Step 10: End Placement (Alternative Flow)

**User Action:** Click [❌ End Placement]

**System Response:**
- Confirmation dialog with warning

**Screen State:**
```
+----------------------------------------------------------+
| End Placement: Michael Chang                          [×] |
+----------------------------------------------------------+
| ⚠️ WARNING: This action will terminate the placement      |
|                                                           |
| Current Status:                                           |
| - Active since Oct 1, 2025 (8 weeks)                     |
| - 18 weeks remaining on contract                         |
| - Performance rating: 5.0/5.0 (Outstanding)              |
|                                                           |
| Are you sure you want to end this placement?              |
|                                                           |
+----------------------------------------------------------+
| Reason for Ending *                                       |
+----------------------------------------------------------+
| ○ Project completed early                                 |
| ○ Budget constraints                                      |
| ○ Performance issues                                      |
| ○ Position no longer needed                               |
| ○ Consultant requested early termination                  |
| ○ Other (specify below)                                   |
|                                                           |
| Detailed Explanation *                                    |
| [Please provide detailed reason for early termination... ]|
|                                                           |
|                                               ] 0/1000     |
|                                                           |
| End Date *                                                |
| ⦿ Immediate (today)                                       |
| ○ 2 weeks notice (Dec 15, 2025)                           |
| ○ Custom date: [MM/DD/YYYY 📅]                            |
|                                                           |
| Financial Impact                                          |
| ─────────────────────────────────────────────────────────|
| Contracted Cost:     $98,800.00                           |
| Paid to Date:        $34,580.00                           |
| Early Term Penalty:  $0.00 (if 2 weeks notice given)     |
| Budget Saved:        $64,220.00                           |
|                                                           |
| ⚠️ Note: Contract requires 2 weeks notice to avoid penalty|
|                                                           |
| Feedback for Consultant (Optional but Recommended)        |
| [Provide feedback to help consultant...                  ]|
|                                               ] 0/500      |
|                                                           |
| Future Consideration                                      |
| ☐ Would consider re-hiring in future                      |
| ☐ Add to preferred vendor list                            |
| ☐ Do not re-engage                                        |
|                                                           |
+----------------------------------------------------------+
|              [Cancel]  [Confirm End Placement]            |
+----------------------------------------------------------+
```

**Note:** Ending a high-performer like Michael would be unusual, but process exists for legitimate reasons (project cancellation, budget cuts, etc.).

**Time:** ~5-8 minutes

---

## Postconditions

1. ✅ Timesheet approved and processed for payment
2. ✅ Invoice generated and sent to accounting
3. ✅ Performance review submitted and shared
4. ✅ Consultant receives feedback
5. ✅ Contract extension request submitted (if applicable)
6. ✅ Financial tracking updated
7. ✅ Activity logged for audit trail
8. ✅ Metrics updated (approval time, performance trends)

---

## Events Logged

| Event | Payload |
|-------|---------|
| `timesheet.approved` | `{ timesheet_id, placement_id, hours, cost, approver_id, timestamp }` |
| `timesheet.rejected` | `{ timesheet_id, reason, approver_id, timestamp }` |
| `performance.review_submitted` | `{ placement_id, rating, reviewer_id, timestamp }` |
| `placement.extension_requested` | `{ placement_id, duration, cost, requester_id, timestamp }` |
| `placement.issue_reported` | `{ placement_id, issue_type, severity, reporter_id, timestamp }` |
| `placement.ended` | `{ placement_id, end_reason, end_date, ended_by, timestamp }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Budget Exceeded | Timesheet approval exceeds budget | "Approval exceeds budget. Finance approval required." | Request budget increase |
| Unauthorized Approval | User lacks authority | "You don't have permission to approve this amount" | Escalate to manager |
| Duplicate Timesheet | Already approved | "This timesheet was already approved by [Name]" | Show existing approval |
| Past Deadline | Review overdue | "Review is 10 days overdue" | Submit immediately |
| Network Error | Connection lost | "Failed to approve timesheet" | [Retry] button |
| Consultant Withdrawn | Ended placement | "Consultant has ended this placement" | Show termination details |

---

## Timesheet Approval Workflows

### Standard Approval (< $5,000/week)

1. Consultant submits timesheet
2. Hiring manager receives notification
3. Manager approves within 48 hours
4. Accounting auto-processes invoice
5. Payment processed next billing cycle

### High-Value Approval (≥ $5,000/week)

1. Consultant submits timesheet
2. Hiring manager approves
3. Department head receives notification
4. Department head approves within 24 hours
5. Finance reviews and processes
6. Payment processed

### Weekend/Overtime Approval

1. Consultant submits with overtime
2. System flags for pre-approval check
3. Manager must confirm pre-approval
4. If not pre-approved: Requires escalation
5. Additional approval may be needed

---

## Alternative Flows

### A1: Batch Approve Multiple Timesheets

If manager has many timesheets pending:

1. Navigate to Timesheets bulk view
2. Select multiple timesheets (checkboxes)
3. Click [Approve Selected]
4. Review summary
5. Confirm batch approval
6. All approved at once

### A2: Reject Timesheet with Corrections

If hours are incorrect:

1. Select "Reject / Request corrections"
2. Specify issues: "Hours incorrect for Nov 27"
3. Add explanation
4. Click [Reject]
5. Consultant receives notification
6. Consultant resubmits corrected timesheet
7. Manager approves corrected version

### A3: Performance Improvement Plan

If performance issues:

1. Submit poor review (< 3.0 rating)
2. System prompts: "Create improvement plan?"
3. Manager creates 30-day PIP
4. Sets specific goals and metrics
5. Schedule follow-up reviews (weekly)
6. Track progress
7. End of 30 days: Reevaluate

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `A` | Approve selected timesheet |
| `R` | Reject selected timesheet |
| `P` | View performance reviews |
| `E` | Request extension |
| `I` | Report issue |
| `N` | Add note to placement |
| `Esc` | Close modal |

---

## Related Use Cases

- [01-portal-dashboard.md](./01-portal-dashboard.md) - Dashboard shows pending timesheets
- [02-review-candidates.md](./02-review-candidates.md) - Candidate review → placement
- [03-schedule-interview.md](./03-schedule-interview.md) - Interview → offer → placement

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Approve standard 40-hour timesheet | Status updated, invoice generated |
| TC-002 | Approve overtime timesheet with pre-approval | Weekend rate applied correctly |
| TC-003 | Reject timesheet with incorrect hours | Consultant notified, can resubmit |
| TC-004 | Submit 5-star performance review | Review saved, shared with consultant |
| TC-005 | Request contract extension | Approval workflow triggered |
| TC-006 | Approve timesheet exceeding budget | Finance approval required |
| TC-007 | Report performance issue | Escalation created, recruiter notified |
| TC-008 | End placement with 2 weeks notice | Termination processed, no penalty |
| TC-009 | Batch approve 5 timesheets | All approved, invoices generated |
| TC-010 | Submit review without rating | Validation error shown |

---

*Last Updated: 2025-11-30*
