# TA Recruiter Daily Workflow

This document describes a typical day for a Talent Acquisition Recruiter, with specific times, actions, and expected system interactions.

---

## Morning Routine (8:00 AM - 10:00 AM)

### 8:00 AM - Login & Dashboard Review

**Step 1: Login**
- User navigates to: `https://app.intime.com/auth/employee`
- User enters email and password
- User clicks "Sign In"
- System redirects to: `/employee/workspace` (Today View)
- Time: ~10 seconds

**Step 2: Review Today View**
- Dashboard loads with personalized widgets
- User sees:
  - **Today's Tasks** - Tasks due today, sorted by priority
  - **Active Campaigns** - Campaign performance summary
  - **Open Requisitions** - Internal jobs waiting for candidates
  - **Upcoming Interviews** - Scheduled for today
  - **Recent Activity** - Last 5 activities logged
- Time: ~30 seconds to scan

**Step 3: Check Urgent Items**
- User looks at red badges indicating:
  - Overdue tasks (red dot)
  - Campaigns with low response rates
  - Interviews scheduled today
  - Pending offer approvals
- User clicks on first urgent item
- Time: ~1 minute

### 8:15 AM - Campaign Performance Review

**Step 4: Review Active Campaigns**
- User clicks "Campaigns" in sidebar
- Campaigns list shows all active campaigns
- User sees metrics for each:
  - Contacts reached
  - Open rate
  - Response rate
  - Conversions (to candidates)
- Time: ~3 minutes

**Screen State:**
```
+----------------------------------------------------------+
| Campaigns                              [+ New Campaign]   |
+----------------------------------------------------------+
| [Search campaigns...]               [Filter ▼] [Sort ▼]   |
+----------------------------------------------------------+
| ● Active │ ○ Completed │ ○ Draft │ ○ All                  |
+----------------------------------------------------------+
| Name              Sent   Opens  Response  Conversions     |
| ───────────────────────────────────────────────────────── |
| Senior Recruiter   247    142    38 (15%)   5             |
|   Sourcing         🟢 Active                              |
|                                                           |
| Jr. Developer      89     41     12 (13%)   2             |
|   Hiring           🟢 Active                              |
|                                                           |
| BDR Position       156    78     19 (12%)   3             |
|   🟡 Low Response                                         |
+----------------------------------------------------------+
```

**Step 5: Check Low-Performing Campaign**
- User clicks on "BDR Position" campaign (low response)
- Campaign detail opens
- User reviews:
  - A/B test results (Variant A vs B)
  - Email open times (when are people opening?)
  - Response quality
- User notes: "Consider changing subject line"
- Time: ~5 minutes

### 8:30 AM - Review Open Requisitions

**Step 6: Check Internal Jobs**
- User clicks "Internal Jobs" in sidebar
- Jobs list shows all open internal positions
- User sees:
  - Job title, department
  - Days open
  - Candidates in pipeline
  - Hiring manager

**Screen State:**
```
+----------------------------------------------------------+
| Internal Jobs                        [+ Post New Job]     |
+----------------------------------------------------------+
| [Search jobs...]                    [Filter ▼] [Sort ▼]   |
+----------------------------------------------------------+
| ● Open │ ○ On Hold │ ○ Filled │ ○ All                     |
+----------------------------------------------------------+
| Title             Dept      Days   Pipeline  Manager      |
| ───────────────────────────────────────────────────────── |
| Senior Recruiter  TA        14     8         Sarah J.     |
| 🟡 Urgent                                                 |
|                                                           |
| Jr. Developer     Eng       7      12        Mike C.      |
| 🟢 On Track                                               |
|                                                           |
| BDR               Sales     21     3         Lisa K.      |
| 🔴 Attention Needed                                       |
+----------------------------------------------------------+
```

**Step 7: Prioritize Jobs for Today**
- User sorts by "Days Open" descending
- Identifies top 2 priority jobs:
  1. BDR (21 days open, only 3 candidates)
  2. Senior Recruiter (14 days, urgent)
- User creates tasks for each priority job
- Time: ~3 minutes

### 9:00 AM - Review Overnight Responses

**Step 8: Check Campaign Responses**
- User goes to Campaigns → "Senior Recruiter Sourcing"
- Clicks "Responses" tab
- Sees 5 new responses overnight
- User reviews each response:
  - Interested: Move to candidate pipeline
  - Not interested: Mark as unsubscribed
  - Need more info: Flag for follow-up
- Time: ~10 minutes

**Screen State (Campaign Responses):**
```
+----------------------------------------------------------+
| Campaign: Senior Recruiter Sourcing       [Campaign Menu] |
+----------------------------------------------------------+
| [Overview] [Contacts] [Responses] [Analytics] [Settings]  |
+----------------------------------------------------------+
| Responses (38 total, 5 new)                               |
|                                                           |
| ✉️ NEW  Jessica Martinez                                 |
|   Responded: 2 hours ago                                  |
|   "Very interested! I have 5 years in agency recruiting.  |
|    When can we chat?"                                     |
|   [Convert to Candidate] [Reply] [Archive]                |
|                                                           |
| ✉️ NEW  David Kim                                        |
|   Responded: 5 hours ago                                  |
|   "Not looking right now, but keep me posted for Q1."     |
|   [Add to Nurture List] [Reply] [Archive]                |
+----------------------------------------------------------+
```

**Step 9: Convert Interested Responses to Candidates**
- User clicks "Convert to Candidate" on Jessica Martinez
- Modal opens with pre-filled data from campaign contact
- User reviews and confirms
- Candidate profile created
- Candidate automatically associated with "Senior Recruiter" job
- Status: "Sourced via Campaign"
- Time: ~2 minutes per conversion

---

## Mid-Morning (10:00 AM - 12:00 PM)

### 10:00 AM - Candidate Sourcing

**Step 10: Source for Priority Job (BDR)**
- User opens "BDR" internal job
- Clicks "Source Candidates" button
- Opens LinkedIn Recruiter in new tab
- Searches: "Business Development Representative" + "Staffing" + "San Francisco"
- Finds 5 potential candidates
- For each candidate:
  - Reviews profile
  - Checks fit (2-3 years BDR experience, tech staffing background)
  - Clicks "Add to InTime" bookmark
  - Candidate added to pipeline
- Time: ~30 minutes (6 minutes per candidate)

**Step 11: Send LinkedIn InMails**
- For each candidate in pipeline:
  - User clicks "Send InMail" button
  - Modal shows templated message (customizable)
  - User personalizes message
  - Sends InMail
  - Activity logged automatically
- Time: ~15 minutes (3 minutes per candidate)

### 10:45 AM - Screening Calls

**Step 12: Conduct Screening Call**
- User has scheduled call with Jessica Martinez (from campaign)
- Opens candidate profile
- Reviews resume and campaign interaction history
- Clicks "Start Call" (integrates with phone system)
- During call, user takes notes in real-time:
  - Current role and responsibilities
  - Years of experience in recruiting
  - Desired compensation
  - Availability
  - Interest level
  - Red flags
- Time: 20 minutes

**Screen State (During Call):**
```
+----------------------------------------------------------+
| 📞 Active Call: Jessica Martinez         [00:14:32]      |
+----------------------------------------------------------+
| [Candidate Profile] [Call Notes] [Screening Checklist]   |
+----------------------------------------------------------+
| Call Notes (auto-saving)                                  |
| [                                                      ]  |
| [• Currently Sr. Recruiter at TechStaff Inc.          ]  |
| [• 5 years total, 3 in agency recruiting              ]  |
| [• Placed avg 2.5 people/month last year              ]  |
| [• Looking for growth opportunity, management track    ]  |
| [• Salary expectation: $80-90K + commission           ]  |
| [• Available: 2 weeks notice                          ]  |
| [• Strong communication, enthusiastic                 ]  |
| [                                                      ]  |
+----------------------------------------------------------+
| Screening Checklist                                       |
| ☑ Experience match (5 years ✓)                           |
| ☑ Compensation aligned ($85K budgeted ✓)                 |
| ☑ Availability acceptable (2 weeks ✓)                    |
| ☑ Culture fit assessment (positive ✓)                    |
| ☑ Interest level (high ✓)                                |
|                                                           |
| Recommendation: ● Proceed to Manager Interview           |
+----------------------------------------------------------+
| [End Call] [Schedule Follow-up] [Submit Screen]          |
+----------------------------------------------------------+
```

**Step 13: Log Screening Call**
- After call ends, user clicks "Submit Screen"
- Modal opens with summary
- User confirms:
  - Duration: 20 minutes
  - Outcome: Positive - Recommend for Manager Interview
  - Notes: Auto-populated from call notes
  - Next step: Schedule manager interview
- Clicks "Save & Move to Next Stage"
- Candidate moves from "Sourced" to "Screening Passed"
- Activity logged
- Time: ~3 minutes

**Repeat Steps 12-13 for 2 more candidates**
- Total time: ~1 hour for 3 screening calls

---

## Afternoon (12:00 PM - 3:00 PM)

### 12:00 PM - Lunch Break
- Time: 30 minutes

### 12:30 PM - Coordinate with Hiring Managers

**Step 14: Schedule Manager Interviews**
- User opens candidate: Jessica Martinez
- Clicks "Schedule Interview" button
- Modal opens with interview scheduling form

**Screen State (Interview Scheduling):**
```
+----------------------------------------------------------+
| Schedule Interview: Jessica Martinez                      |
+----------------------------------------------------------+
| Interview Type *                                          |
| ● Hiring Manager Screen  ○ Panel Interview  ○ Final      |
|                                                           |
| Hiring Manager                                            |
| [Sarah Johnson                                        ▼]  |
|   (Senior Manager, TA - Availability: Check Calendar)     |
|                                                           |
| Interviewers (select multiple)                            |
| ☑ Sarah Johnson (Hiring Manager)                         |
| ☐ Mike Chen (TA Director)                                |
|                                                           |
| Proposed Times (check hiring manager calendar)            |
| Tuesday, Dec 3 at 2:00 PM [Send Invite]                  |
| Wednesday, Dec 4 at 10:00 AM [Send Invite]               |
| Thursday, Dec 5 at 3:00 PM [Send Invite]                 |
|                                                           |
| Interview Format                                          |
| ○ In-Person  ● Video Call  ○ Phone                       |
|                                                           |
| Video Call Link (auto-generated)                          |
| [https://meet.intime.com/sarah-j/interview-abc123     ]  |
|                                                           |
| Duration                                                  |
| [45] minutes                                              |
|                                                           |
| Interview Notes for Manager                               |
| [Strong agency background, 5 years recruiting. Looking ]  |
| [for growth opportunity. Passed initial screen.        ]  |
|                                               ] 0/500     |
+----------------------------------------------------------+
| [Cancel] [Send Calendar Invites]                         |
+----------------------------------------------------------+
```

**Step 15: Send Calendar Invites**
- User selects Tuesday, Dec 3 at 2:00 PM
- Clicks "Send Calendar Invites"
- System sends:
  - Invite to Sarah Johnson (hiring manager)
  - Invite to Jessica Martinez (candidate)
  - Confirmation to TA Recruiter (user)
- Interview status: "Scheduled"
- Activity logged
- Time: ~5 minutes per interview

**Repeat Step 14-15 for 2 more candidates**

### 1:30 PM - Run Outreach Campaign

**Step 16: Create New Campaign for Jr. Developer Role**
- User clicks "Campaigns" → "+ New Campaign"
- Campaign builder opens

**Screen State (Campaign Builder - Step 1):**
```
+----------------------------------------------------------+
| Create New Campaign                                   [×] |
+----------------------------------------------------------+
| Step 1 of 4: Campaign Details                             |
|                                                           |
| Campaign Name *                                           |
| [Jr. Developer Sourcing - Q1 2025                     ]   |
|                                                           |
| Campaign Type *                                           |
| ● Talent Sourcing  ○ Business Development  ○ Mixed       |
|                                                           |
| Target Role *                                             |
| [Junior Developer                                     ▼]  |
|   (Auto-populates from Internal Jobs)                     |
|                                                           |
| Channel *                                                 |
| ☑ LinkedIn  ☑ Email  ☐ Combined                          |
|                                                           |
| Campaign Duration                                         |
| Start Date: [Dec 1, 2024]  End Date: [Dec 31, 2024]     |
|                                                           |
+----------------------------------------------------------+
|                                    [Cancel] [Continue →]  |
+----------------------------------------------------------+
```

**Step 17: Define Target Audience**
- User clicks "Continue"
- Step 2: Target Audience

**Screen State (Campaign Builder - Step 2):**
```
+----------------------------------------------------------+
| Step 2 of 4: Target Audience                              |
|                                                           |
| Target Skills (select multiple)                           |
| [React] [×]  [JavaScript] [×]  [Node.js] [×]             |
| [+ Add skill]                                             |
|                                                           |
| Experience Level                                          |
| Min: [1] years  Max: [3] years                           |
|                                                           |
| Target Locations                                          |
| [San Francisco, CA] [×]  [Remote] [×]                    |
| [+ Add location]                                          |
|                                                           |
| Current Companies (optional)                              |
| [Tech startups, SaaS companies                        ]   |
|                                                           |
| Target Contact Count                                      |
| [200] contacts                                            |
|                                                           |
| Expected Response Rate                                    |
| [15]%                                                     |
|                                                           |
+----------------------------------------------------------+
|                              [← Back] [Cancel] [Continue] |
+----------------------------------------------------------+
```

**Step 18: Set Up A/B Test**
- User clicks "Continue"
- Step 3: Message Templates

**Screen State (Campaign Builder - Step 3):**
```
+----------------------------------------------------------+
| Step 3 of 4: Message Templates                            |
|                                                           |
| ☑ Enable A/B Testing                                     |
|   Split: [50]% A  [50]% B                                |
|                                                           |
| Variant A: Subject Line                                   |
| [Exciting Jr. Developer Opportunity at InTime        ]   |
|                                                           |
| Variant A: Message Body                                   |
| [                                                      ]  |
| [Hi {{firstName}},                                     ]  |
| [                                                      ]  |
| [I came across your profile and was impressed by your  ]  |
| [React experience. We're hiring a Jr. Developer at    ]  |
| [InTime, a fast-growing staffing tech company.        ]  |
| [                                                      ]  |
| [Interested in learning more?                         ]  |
| [                                               ] 0/1000  |
|                                                           |
| Variant B: Subject Line                                   |
| [Join InTime's Engineering Team - Jr. Developer       ]   |
|                                                           |
| Variant B: Message Body                                   |
| [Similar template with different wording...           ]   |
|                                                           |
| Call-to-Action                                            |
| [Schedule a Quick Chat]                                   |
| Link: [https://calendly.com/ta-recruiter/15min       ]   |
|                                                           |
+----------------------------------------------------------+
|                              [← Back] [Cancel] [Continue] |
+----------------------------------------------------------+
```

**Step 19: Review & Launch Campaign**
- User clicks "Continue"
- Step 4: Review & Launch
- User reviews all settings
- Clicks "Launch Campaign"
- System:
  - Creates campaign record
  - Imports contacts from LinkedIn (if integrated)
  - Randomly assigns A/B variants (50/50 split)
  - Schedules sends over 7 days (to avoid spam filters)
  - Status: "Active"
- Toast: "Campaign launched successfully!"
- Time: ~20 minutes total to create campaign

### 2:30 PM - Update Campaign Analytics

**Step 20: Review Campaign Performance**
- User opens "Senior Recruiter Sourcing" campaign
- Clicks "Analytics" tab
- Reviews metrics:
  - Total sent: 247
  - Opened: 142 (57%)
  - Responded: 38 (15%)
  - Conversions: 5 (13% of responders)
  - A/B Test Winner: Variant B (18% response vs 12%)
- User notes: "Use Variant B subject line for future campaigns"
- Time: ~10 minutes

**Screen State (Campaign Analytics):**
```
+----------------------------------------------------------+
| Campaign: Senior Recruiter Sourcing                       |
+----------------------------------------------------------+
| [Overview] [Contacts] [Responses] [Analytics] [Settings]  |
+----------------------------------------------------------+
| Campaign Performance                                      |
|                                                           |
| Sent: 247        Opened: 142 (57%)    Responded: 38 (15%)|
| Conversions: 5 candidates added to pipeline              |
|                                                           |
| A/B Test Results                                          |
| ┌───────────────────────────────────────────────────┐   |
| │ Variant A                  │ Variant B            │   |
| │ Sent: 124                  │ Sent: 123            │   |
| │ Opened: 65 (52%)           │ Opened: 77 (63%)     │   |
| │ Responded: 15 (12%)        │ Responded: 23 (18%)  │   |
| │ 🔴 Underperforming         │ 🟢 Winner            │   |
| └───────────────────────────────────────────────────┘   |
|                                                           |
| Response Rate Over Time                                   |
| [Line chart showing daily response rates]                 |
|                                                           |
| Top Performing Send Times                                 |
| 1. Tuesday 10:00 AM (22% response)                        |
| 2. Thursday 2:00 PM (19% response)                        |
| 3. Wednesday 9:00 AM (17% response)                       |
|                                                           |
| Conversion Funnel                                         |
| Sent: 247 ──▶ Opened: 142 ──▶ Responded: 38 ──▶ Conv: 5 |
|                                                           |
+----------------------------------------------------------+
```

---

## Late Afternoon (3:00 PM - 5:00 PM)

### 3:00 PM - Prepare Offer Letter

**Step 21: Create Offer for Top Candidate**
- Candidate "Alex Johnson" has passed all interviews for "Senior Recruiter" role
- Hiring manager approved to extend offer
- User clicks "Create Offer" on candidate profile

**Screen State (Offer Creation):**
```
+----------------------------------------------------------+
| Create Offer: Alex Johnson                                |
+----------------------------------------------------------+
| Position Details                                          |
| Job Title: [Senior Technical Recruiter                ]   |
| Department: [Talent Acquisition                       ]   |
| Reporting To: [Sarah Johnson - TA Manager             ]   |
| Start Date: [Jan 6, 2025                              ]   |
|                                                           |
| Compensation                                              |
| Base Salary: $[85,000] /year                             |
| Commission Plan: [Standard Recruiter Plan             ▼]  |
|   (2% of gross profit on placements)                      |
| Bonus Target: $[15,000] /year                            |
|                                                           |
| Benefits                                                  |
| ☑ Health Insurance (starts first day)                    |
| ☑ 401(k) Matching (up to 4%)                             |
| ☑ 15 days PTO (year 1)                                   |
| ☑ Remote Work (3 days/week)                              |
|                                                           |
| Equity (if applicable)                                    |
| Stock Options: [1000] shares                              |
| Vesting: [4-year vest, 1-year cliff                   ]   |
|                                                           |
| Employment Type                                           |
| ● Full-Time  ○ Part-Time  ○ Contract                     |
|                                                           |
| Special Terms                                             |
| [Sign-on bonus: $5,000 after 90 days                  ]   |
| [                                               ] 0/500   |
|                                                           |
| Offer Expiration                                          |
| [Dec 10, 2024] (7 days from now)                         |
|                                                           |
+----------------------------------------------------------+
| [Save as Draft] [Cancel] [Submit for Approval →]         |
+----------------------------------------------------------+
```

**Step 22: Submit Offer for Approval**
- User reviews all fields
- Clicks "Submit for Approval"
- System routes to HR Manager for approval
- Status: "Pending HR Approval"
- User notified when approved
- Time: ~15 minutes

### 3:30 PM - Onboarding Preparation

**Step 23: Prepare Onboarding for Incoming Hire**
- Previous hire "Maria Gonzalez" (BDR) accepted offer last week
- Start date: Next Monday
- User clicks "Start Onboarding" on Maria's profile

**Screen State (Onboarding Checklist):**
```
+----------------------------------------------------------+
| Onboarding: Maria Gonzalez                  Start: Dec 2  |
+----------------------------------------------------------+
| Pre-Start Tasks (complete before Day 1)                   |
| ☑ Offer letter signed (completed Nov 25)                 |
| ☑ Background check passed (completed Nov 27)             |
| ☑ I-9 verification scheduled (Dec 1)                     |
| ☑ Benefits enrollment sent (completed Nov 28)            |
| ☐ Equipment order placed                                 |
|   [Order MacBook Pro, Monitor, Keyboard, Mouse]           |
| ☐ User account created (IT)                              |
|   [Assign to: IT Admin]                                   |
| ☐ Email address provisioned                              |
|   maria.gonzalez@intime.com                               |
|                                                           |
| Day 1 Tasks                                               |
| ☐ Welcome email sent                                     |
| ☐ Onboarding buddy assigned                              |
| ☐ Pod assignment                                         |
|   Recommended: [Sales Pod 2 - Lisa K. (Senior)        ▼] |
|   [Assign to Pod] (requires HR approval)                  |
| ☐ Training enrollment                                    |
|   - InTime Academy: Onboarding Track (Week 1)             |
|   - Sales Process Training (Week 2)                       |
|   - CRM Training (Week 1)                                 |
|   [Enroll in Courses]                                     |
| ☐ First day agenda shared                                |
|                                                           |
| Week 1 Tasks                                              |
| ☐ Manager 1:1 scheduled                                  |
| ☐ Team introductions                                     |
| ☐ System access verified                                 |
| ☐ 30-60-90 day plan created                              |
|                                                           |
+----------------------------------------------------------+
| [Save Progress] [Assign Tasks] [Complete Onboarding]     |
+----------------------------------------------------------+
```

**Step 24: Complete Pre-Start Tasks**
- User clicks "Order MacBook Pro, Monitor, Keyboard, Mouse"
- Redirects to IT equipment request form
- User fills out form, submits
- Task marked complete
- User clicks "Assign to: IT Admin" for user account
- IT Admin receives task notification
- Time: ~20 minutes

### 4:00 PM - Cross-Pollination Check

**Step 25: Log Cross-Pillar Opportunity**
- During call with candidate, learned they have a friend looking for contract work
- User clicks "Log Opportunity" (global button)
- Modal opens

**Screen State (Create Cross-Pillar Lead):**
```
+----------------------------------------------------------+
| Log Opportunity                                       [×] |
+----------------------------------------------------------+
| Opportunity Type *                                        |
| ○ Client Lead (for Sales)                                |
| ● Candidate Lead (for Technical Recruiting)              |
| ○ Training Lead (for Academy)                            |
|                                                           |
| Details                                                   |
| Contact Name: [Priya Sharma                           ]   |
| Email: [priya.sharma@email.com                        ]   |
| Phone: [+1 (555) 234-5678                             ]   |
|                                                           |
| Skills: [Java] [Spring Boot] [AWS]                       |
|                                                           |
| Notes                                                     |
| [Referred by Maria Gonzalez (our new BDR hire).       ]   |
| [Looking for contract work, 8 years Java experience.  ]   |
| [Available immediately.                               ]   |
|                                               ] 0/500     |
|                                                           |
| Assign To                                                 |
| Department: [Technical Recruiting                     ▼]  |
| Recruiter: [Auto-assign based on skills               ▼]  |
|                                                           |
+----------------------------------------------------------+
| [Cancel] [Create Lead]                                    |
+----------------------------------------------------------+
```

**Step 26: Submit Lead**
- User clicks "Create Lead"
- Lead created in CRM
- Assigned to Technical Recruiting team
- User becomes "Consulted" on lead (gets updates)
- Activity logged
- Time: ~3 minutes

### 4:30 PM - Plan Tomorrow

**Step 27: Review and Plan**
- User opens Today View
- Checks what's due tomorrow:
  - 3 screening calls scheduled
  - 2 manager interviews to coordinate
  - 1 campaign to launch
  - 1 onboarding Day 1 (Maria Gonzalez)
- User creates tasks for tomorrow:
  - "Prepare interview questions for 3 screens"
  - "Confirm manager availability for 2 interviews"
  - "Review campaign analytics for Jr. Dev campaign"
  - "Welcome Maria on her first day"
- Reviews sprint progress
- Notes blockers for manager:
  - "BDR role: need hiring manager feedback on 2 candidates"
- Time: ~10 minutes

### 5:00 PM - End of Day

**Step 28: Logout**
- User clicks profile menu
- Clicks "Sign Out"
- Session ends
- Redirect to login page

---

## Daily Activity Summary

By end of day, a typical TA recruiter should have logged:

| Activity Type | Target Count |
|---------------|--------------|
| Screening Calls | 3-5 |
| Campaign Responses Reviewed | 10-20 |
| LinkedIn InMails Sent | 5-10 |
| Manager Interviews Coordinated | 2-3 |
| Offers Prepared | 0-1 |
| Onboarding Tasks Completed | 5-10 |
| Tasks Completed | 8-12 |
| Status Updates | 10-15 |

---

## Weekly Patterns

| Day | Focus |
|-----|-------|
| Monday | Priority setting, campaign review, sourcing |
| Tuesday | Heavy sourcing, screening calls |
| Wednesday | Interview coordination, campaign optimization |
| Thursday | Follow-ups, offer preparation |
| Friday | Onboarding tasks, analytics review, planning |

---

## Common Blockers & Escalation

| Blocker | Escalation Path |
|---------|-----------------|
| Hiring manager not responding | TA Manager escalates to department head |
| Candidate not responding | Remove from pipeline after 3 attempts |
| Offer approval delayed | Follow up with HR Manager |
| System issue | Report to IT Admin |
| Compensation out of budget | Discuss with HR Manager and CFO |
| Low campaign response rates | Review with TA Manager, adjust messaging |

---

## Monthly Milestones

| Week | Key Activities |
|------|----------------|
| Week 1 | Launch new campaigns, review prior month metrics |
| Week 2 | Heavy sourcing, pipeline building |
| Week 3 | Interview coordination, offer preparation |
| Week 4 | Onboarding new hires, campaign optimization, planning next month |

---

*Last Updated: 2024-11-30*
