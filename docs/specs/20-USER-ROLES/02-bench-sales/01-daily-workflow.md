# Bench Sales Recruiter Daily Workflow

This document describes a typical day for a Bench Sales Recruiter, with specific times, actions, and expected system interactions.

---

## Morning Routine (8:00 AM - 10:00 AM)

### 8:00 AM - Login & Bench Dashboard Review

**Step 1: Login**
- User navigates to: `https://app.intime.com/auth/employee`
- User enters email and password
- User clicks "Sign In"
- System redirects to: `/employee/workspace/bench` (Bench Dashboard)
- Time: ~10 seconds

**Step 2: Review Bench Dashboard**
- Dashboard loads with bench-specific widgets
- User sees:
  - **Bench Overview** - Total consultants on bench, average days, alerts
  - **My Consultants** - Assigned bench consultants with status cards
  - **Today's Tasks** - Follow-ups, submissions due, calls scheduled
  - **Sprint Progress** - Placement goal (e.g., "0/1 placements this sprint")
  - **Recent Activity** - Last 5 activities logged
- Time: ~30 seconds to scan

**Screen State:**
```
+------------------------------------------------------------------+
|  Bench Dashboard                                    [Settings ⚙] |
+------------------------------------------------------------------+
| Bench Overview                                                    |
| ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐    |
| │ On Bench   │ │ Avg Days   │ │ Alerts     │ │ This Week  │    |
| │    12      │ │   38       │ │   🟠 3     │ │ 2 Placed   │    |
| │ consultants│ │   days     │ │   🟢 9     │ │ 18 Submits │    |
| └────────────┘ └────────────┘ └────────────┘ └────────────┘    |
+------------------------------------------------------------------+
| My Consultants (Assigned: 6)               [Filter ▼] [Sort ▼]  |
+------------------------------------------------------------------+
| 🟠 Rajesh Kumar       | 🟢 Priya Sharma      | 🟢 David Chen      |
| Java Developer        | React Developer      | DevOps Engineer    |
| 42 days on bench      | 18 days on bench     | 12 days on bench   |
| Last contact: 2d ago  | Last contact: 1d ago | Last contact: 3h ago|
| 2 active submissions  | 3 active submissions | 1 active submission |
| [View] [Market] [Log] | [View] [Market] [Log]| [View] [Market][Log]|
+------------------------------------------------------------------+
| 🟢 Maria Garcia       | 🟢 Ahmed Ali         | 🟠 John Smith      |
| QA Engineer           | Data Analyst         | Full Stack Dev     |
| 8 days on bench       | 22 days on bench     | 35 days on bench   |
| Last contact: 5h ago  | Last contact: 1d ago | Last contact: 3d ago|
| 0 active submissions  | 2 active submissions | 1 active submission |
| [View] [Market] [Log] | [View] [Market] [Log]| [View] [Market][Log]|
+------------------------------------------------------------------+
```

**Color Coding:**
- 🟢 Green: 0-30 days on bench (normal)
- 🟠 Orange: 31-60 days on bench (urgent)
- 🔴 Red: 61+ days on bench (critical)

**Step 3: Check Urgent Items**
- User looks at orange/red badges indicating:
  - Consultants 30+ days on bench
  - Consultants not contacted in 3+ days
  - Pending vendor responses > 48 hours
  - Interviews scheduled today
  - Visa expiring <90 days
- User clicks on first urgent item
- Time: ~1 minute

### 8:15 AM - Review Overnight Vendor Responses

**Step 4: Check Notifications**
- User clicks bell icon (🔔) in header
- Dropdown shows unread notifications:
  - Vendor responded to submission
  - Interview confirmed
  - External job matched consultant
  - New consultant added to bench
- User clicks each notification to navigate to relevant entity
- Time: ~5 minutes

**Step 5: Update Bench Submission Statuses**
- From notification, user lands on Bench Submission Detail
- User updates status based on vendor feedback:
  - Click status dropdown
  - Select new status (e.g., "Vendor Accepted" → "Interview Scheduled")
  - Add note explaining update
  - Click "Save"
- Repeat for each vendor response
- Time: ~2 minutes per update

### 8:30 AM - Check New Bench Consultants

**Step 6: Review New Bench Arrivals**
- User clicks "New to Bench" filter on dashboard
- System shows consultants who joined bench in last 7 days
- For each new consultant:
  - Review profile (skills, experience, rate, visa)
  - Check resume is current
  - Verify contact information
  - Assign to self if not already assigned
  - Create initial marketing plan task
- Time: ~5 minutes per new consultant

**Step 7: Prioritize Today's Focus**
- User identifies top 3 consultants to focus on:
  1. Anyone 30+ days on bench (orange/red)
  2. Anyone with pending vendor responses
  3. New bench consultants (<7 days)
- User creates tasks for priority consultants:
  - Click "+ Add Task" on consultant card
  - Types task: "Find 3 requirements for Rajesh"
  - Sets due date: Today
  - Sets priority: High
  - Clicks "Save"
- Time: ~1 minute per task

### 9:00 AM - Consultant Check-in Calls

**Step 8: Call High-Priority Consultants**
- User opens consultant card for Rajesh Kumar (42 days on bench)
- Clicks phone icon to initiate call
- During call, user has consultant profile open
- Topics to cover:
  - Current availability (still on bench?)
  - Rate expectations (any changes?)
  - Location preferences
  - Skills update (any new certifications?)
  - Motivation level
  - Feedback on recent submissions
- User takes notes in real-time
- Time: 10-15 minutes per call

**Step 9: Log Call Activity**
- After call ends:
  - User clicks "Complete Activity"
  - Modal opens with call summary
  - User enters:
    - Duration: Actual minutes
    - Outcome: Positive/Neutral/Negative
    - Notes: "Rajesh confirmed available, rate $85/hr, open to remote or local DC area. Updated Java skills with Spring Boot cert."
    - Follow-up required: Yes/No
  - Clicks "Save"
- Activity logged to consultant timeline
- Time: ~2 minutes

**Repeat Steps 8-9 for 2-3 priority consultants**

---

## Mid-Morning (10:00 AM - 12:00 PM)

### 10:00 AM - External Job Discovery

**Step 10: Scan Dice.com**
- User opens new browser tab: `https://dice.com`
- Searches for: "Java developer contract remote"
- Scans first 20 results
- For each relevant job:
  - Opens job detail
  - Reviews requirements (skills, rate, location, visa)
  - Identifies if it matches any bench consultants
  - Time: ~2 minutes per job

**Step 11: Add External Job to System**
- User finds promising job: "Senior Java Developer - Remote - $90-100/hr"
- User switches back to InTime OS
- Clicks "+ New" → "External Job"
- External Job modal opens

**Screen State:**
```
+------------------------------------------------------------------+
|                       Add External Job                       [×] |
+------------------------------------------------------------------+
| Source Information                                                |
| Source: [Dice.com         ▼]                                     |
| Job URL: [https://dice.com/jobs/detail/12345              ]      |
| Source Job ID: [12345                    ] (optional)            |
|                                                                   |
+------------------------------------------------------------------+
| Job Details *                                                     |
| Title: [Senior Java Developer - Remote                    ]      |
| Company: [Accenture Federal Services                      ]      |
| Description:                                                      |
| [We are seeking a Senior Java Developer with 8+ years...  ]      |
| [                                                          ]      |
| [                                              ] 0/5000           |
|                                                                   |
+------------------------------------------------------------------+
| Location & Remote                                                 |
| Location: [Washington, DC (Remote OK)                     ]      |
| ☑ Remote allowed                                                 |
|                                                                   |
+------------------------------------------------------------------+
| Rate Range *                                                      |
| Min: $[90    ] /hr    Max: $[100   ] /hr                         |
| Rate Type: ● Hourly  ○ Daily  ○ Annual                          |
|                                                                   |
+------------------------------------------------------------------+
| Requirements                                                      |
| Required Skills (comma-separated):                                |
| [Java, Spring Boot, AWS, Microservices, REST APIs         ]      |
|                                                                   |
| Min Experience: [8     ] years                                   |
|                                                                   |
| Visa Requirements:                                                |
| ☑ US Citizen  ☑ Green Card  ☑ H1B  ☐ EAD  ☐ TN                 |
|                                                                   |
+------------------------------------------------------------------+
| Job Validity                                                      |
| Scraped/Posted Date: [2024-11-30     ] (today)                   |
| Expires: [2024-12-30     ] (30 days default)                     |
|                                                                   |
+------------------------------------------------------------------+
| Auto-Match Consultants                                            |
| ☑ Show matching bench consultants after saving                  |
|                                                                   |
+------------------------------------------------------------------+
|                                    [Cancel]  [Save & Match →]    |
+------------------------------------------------------------------+
```

**Step 12: Fill External Job Form**
- User fills required fields:
  - Source: Select "Dice.com" from dropdown
  - Job URL: Paste URL
  - Title: Copy from job posting
  - Company: Enter company name
  - Description: Copy/paste or summarize
  - Location: Enter location
  - Remote: Check if remote allowed
  - Rate range: Enter min/max
  - Required skills: Enter comma-separated
  - Min experience: Enter years
  - Visa: Check accepted types
- User clicks "Save & Match →"
- Time: ~3-5 minutes per job

**Step 13: Review Auto-Matched Consultants**
- System analyzes external job vs bench consultants
- Match modal opens showing ranked consultants:

```
+------------------------------------------------------------------+
|  Matching Bench Consultants for: Senior Java Developer          |
+------------------------------------------------------------------+
| ✓ Rajesh Kumar                                        Match: 95% |
| Java Developer | 42 days on bench | Available | $85/hr | H1B   |
| Skills: Java, Spring Boot, AWS, Microservices, REST              |
| [View Profile]  [Submit to Job]                                  |
+------------------------------------------------------------------+
| ✓ John Smith                                          Match: 82% |
| Full Stack Developer | 35 days on bench | Available | $90/hr   |
| Skills: Java, Spring, React, AWS, Docker                         |
| [View Profile]  [Submit to Job]                                  |
+------------------------------------------------------------------+
| ⚠ David Chen                                          Match: 65% |
| DevOps Engineer | 12 days on bench | Available | $95/hr | H1B  |
| Skills: AWS, Docker, Java, Python (missing Spring Boot)          |
| [View Profile]  [Submit to Job]                                  |
+------------------------------------------------------------------+
| No Match: Priya (React), Maria (QA), Ahmed (Data Analyst)        |
+------------------------------------------------------------------+
|                                              [Close]  [Submit →] |
+------------------------------------------------------------------+
```

- User reviews matches
- Selects top 2 consultants: Rajesh (95%) and John (82%)
- Clicks "Submit →" to create submissions (or saves for later)
- Time: ~2 minutes

**Repeat Steps 10-13 for multiple job boards:**
- Dice.com (5-10 jobs)
- Indeed.com (5-10 jobs)
- LinkedIn Jobs (3-5 jobs)
- Vendor email blasts (as received)

**Total job discovery time: 60-90 minutes**

### 11:30 AM - Vendor Marketing Calls

**Step 14: Call Vendors with Hotlist**
- User opens Vendor contact list
- Filters by: "Last contacted >7 days ago"
- Calls vendor: "TechStaff Solutions"
- During call:
  - Introduce current bench consultants
  - Reference recent hotlist sent
  - Ask about current requirements
  - Note any specific needs
  - Schedule follow-up
- Time: 5-10 minutes per call

**Step 15: Log Vendor Call**
- User clicks "Log Activity"
- Type: "Vendor Call"
- Related To: Account (TechStaff Solutions)
- Duration: 8 minutes
- Outcome: "Discussed 3 consultants, vendor will review and respond by EOD"
- Follow-up: Schedule task for tomorrow
- Time: ~2 minutes

**Target: 3-5 vendor calls in 30-minute block**

---

## Afternoon (12:00 PM - 3:00 PM)

### 12:00 PM - Lunch Break (30 minutes)

### 12:30 PM - Bench Submission Prep

**Step 16: Review Ready-to-Submit Consultants**
- User goes to Bench Dashboard
- Clicks "Ready to Submit" tab
- Views consultants matched to external jobs but not yet submitted
- Sees: Rajesh Kumar matched to 3 external jobs

**Step 17: Submit Consultant to External Job**
- User clicks "Submit" on Rajesh → "Senior Java Developer" match
- Bench Submission modal opens

**Screen State:**
```
+------------------------------------------------------------------+
|               Submit Consultant to External Job              [×] |
+------------------------------------------------------------------+
| Consultant: Rajesh Kumar (Java Developer)                        |
| External Job: Senior Java Developer @ Accenture (Dice)           |
| Vendor: Direct to Accenture (no vendor middleman)                |
+------------------------------------------------------------------+
| Consultant Resume *                                               |
| ○ Master Resume (uploaded 2024-11-15)                            |
| ● Formatted Resume - Java Focus (uploaded 2024-11-28)           |
| ○ Create New Formatted Version                                   |
|                                                                   |
| [Preview Resume]  [Upload New]                                   |
|                                                                   |
+------------------------------------------------------------------+
| Submission Rate *                                                 |
| Consultant Rate: $[85    ] /hr (from profile)                    |
| Job Range: $90-100/hr                                            |
| Submitted Rate: $[92    ] /hr                                    |
| ☐ Override rate: $[      ] /hr                                   |
|                                                                   |
| ⚠ Note: Submitted rate is within job range. Margin: ~8%          |
+------------------------------------------------------------------+
| Consultant Highlights * (sent to vendor/client)                   |
| [                                                          ]      |
| [• 10+ years Java development experience                   ]      |
| [• Expert in Spring Boot, Microservices, REST APIs         ]      |
| [• AWS certified Solutions Architect                       ]      |
| [• Excellent communication, team player                    ]      |
| [• Available immediately, H1B transfer ready               ]      |
| [                                                 ] 245/1000      |
|                                                                   |
| ☐ Use AI to generate highlights                                 |
|                                                                   |
+------------------------------------------------------------------+
| Internal Notes (not sent to vendor)                               |
| [Rajesh is on bench 42 days, highly motivated. Rate flexible]    |
| [if good opportunity. Last project: Meta, 3 years          ]      |
|                                                  ] 95/500         |
|                                                                   |
+------------------------------------------------------------------+
| Vendor Contact Information                                        |
| Submission Method:                                                |
| ● Email to vendor                                                |
|   Vendor Email: [recruiting@accenture.com                  ]      |
|   CC: [my.email@intime.com                                 ]      |
| ○ Vendor portal upload (if integrated)                           |
| ○ Manual (I will submit externally)                              |
|                                                                   |
+------------------------------------------------------------------+
| Pre-Submission Checklist                                          |
| ☑ Contacted consultant today                                     |
| ☑ Consultant confirmed available                                 |
| ☑ Rate approved by consultant                                    |
| ☑ Resume is current (<30 days)                                   |
| ☑ Visa status verified (H1B valid until 2026-03-15)              |
| ☐ Manager approval required (for >60 day bench)                  |
|                                                                   |
+------------------------------------------------------------------+
|                            [Cancel]  [Submit to Vendor →]        |
+------------------------------------------------------------------+
```

**Step 18: Complete Submission Form**
- User selects "Formatted Resume - Java Focus"
- Reviews submitted rate ($92/hr fits $90-100 range)
- Edits/confirms consultant highlights
- Adds internal notes for tracking
- Enters vendor email
- Checks all pre-submission items
- Clicks "Submit to Vendor →"
- Time: ~5-10 minutes per submission

**Step 19: System Processes Submission**
- System validates all fields
- Generates formatted email to vendor:

```
Subject: Qualified Java Developer - Rajesh Kumar - Accenture Senior Java Role

Hi Accenture Recruiting Team,

I have an excellent consultant for your Senior Java Developer position (Ref: Dice #12345).

Candidate: Rajesh Kumar
Title: Java Developer
Experience: 10+ years
Rate: $92/hr
Availability: Immediate
Visa: H1B (valid through 2026)

Key Highlights:
• 10+ years Java development experience
• Expert in Spring Boot, Microservices, REST APIs
• AWS Certified Solutions Architect
• Excellent communication, team player
• Available immediately, H1B transfer ready

Resume attached. Please let me know if you'd like to schedule an interview.

Best regards,
[Your Name]
InTime Staffing
[Your Contact Info]
```

- Email sent to vendor
- BCC sent to recruiter
- Submission record created with status: "submitted_to_vendor"
- Activity logged
- Consultant card updated (shows 3 active submissions)
- Toast: "Rajesh Kumar submitted to Accenture ✓"
- Time: ~5 seconds

**Repeat Steps 16-19 for 5-10 submissions**

**Target submissions: 15 per week = 3 per day**

### 1:30 PM - Create/Update Hotlist

**Step 20: Open Hotlist Builder**
- User clicks "+ New" → "Hotlist"
- Hotlist builder opens

**Step 21: Build Hotlist**
- User enters:
  - Title: "Available Java & .NET Developers - Week of 12/2"
  - Description: "Top consultants available immediately"
- User clicks "Add Consultants"
- Multi-select modal opens showing bench consultants
- User filters by: Skills = "Java" OR ".NET", Days on Bench >15
- Selects 8 consultants
- Clicks "Add Selected"
- Time: ~5 minutes

**Step 22: Customize Consultant Entries**
- For each consultant in hotlist:
  - Review profile summary
  - Edit highlighted skills (if needed)
  - Verify rate is current
  - Ensure resume is attached
- User clicks "Generate Hotlist Document"
- System generates PDF with consultant profiles
- Preview shows professional layout
- Time: ~10 minutes

**Step 23: Send Hotlist**
- User clicks "Send Hotlist"
- Distribution modal opens:

```
+------------------------------------------------------------------+
|                        Send Hotlist                          [×] |
+------------------------------------------------------------------+
| Hotlist: Available Java & .NET Developers - Week of 12/2         |
| Consultants: 8                                                    |
| Document: [hotlist_2024-12-02.pdf] (842 KB)                      |
+------------------------------------------------------------------+
| Send To:                                                          |
| ● Email Distribution List                                        |
|   [All Vendors (42 contacts)                              ▼]     |
|                                                                   |
| ○ Specific Accounts                                              |
|   [Select accounts...                                     ▼]     |
|                                                                   |
| ○ Specific Email Addresses                                       |
|   [Enter emails separated by commas...                    ]      |
|                                                                   |
+------------------------------------------------------------------+
| Email Subject:                                                    |
| [InTime Hotlist: Available Java & .NET Developers - 12/2  ]      |
|                                                                   |
| Email Body:                                                       |
| [Hi [Vendor Name],                                         ]      |
| [                                                          ]      |
| [Please see attached hotlist of our available consultants ]      |
| [this week. All are immediately available and cleared for ]      |
| [C2C or W2.                                                ]      |
| [                                                          ]      |
| [Let me know if any match your current requirements.      ]      |
| [                                                          ]      |
| [Best regards,                                             ]      |
| [[Your Signature]                                    ] 350/2000   |
|                                                                   |
| Template: [Vendor Hotlist - Standard                      ▼]     |
|                                                                   |
+------------------------------------------------------------------+
| Tracking                                                          |
| ☑ Track opens and clicks                                         |
| ☑ Request responses                                              |
| ☐ Set expiry (14 days default)                                   |
|                                                                   |
+------------------------------------------------------------------+
|                                         [Cancel]  [Send Email →] |
+------------------------------------------------------------------+
```

- User selects "All Vendors" distribution list
- Reviews email subject and body
- Clicks "Send Email →"
- System sends hotlist to 42 vendor contacts
- Hotlist status changes to "sent"
- Activity logged
- Time: ~5 minutes

**Total hotlist creation: ~20-25 minutes**

### 2:00 PM - Vendor Follow-ups

**Step 24: Check Pending Submissions**
- User navigates to Bench Submissions list
- Filters by: Status = "Submitted to Vendor", Age >48 hours
- Reviews 5 stale submissions
- For each:
  - Open submission detail
  - Review last activity
  - Call or email vendor for status
  - Log follow-up activity
  - Update status if response received
- Time: ~5 minutes per follow-up

### 2:30 PM - Interview Preparation

**Step 25: Prep Consultant for Vendor Interview**
- User opens submission with interview scheduled tomorrow
- Consultant: John Smith
- Vendor: TechStaff Solutions
- Client: Capital One
- Reviews:
  - Interview details (time, format, interviewers)
  - External job requirements
  - Vendor/client company info
- User calls consultant:
  - Confirms interview time/format
  - Reviews job requirements
  - Discusses potential technical questions
  - Shares client background
  - Confirms logistics (video link, phone number)
- Logs prep call activity
- Time: ~20-30 minutes per interview prep

---

## Late Afternoon (3:00 PM - 5:00 PM)

### 3:00 PM - Update Consultant Profiles

**Step 26: Profile Maintenance**
- User reviews consultants not contacted in 3+ days
- For each consultant:
  - Check if still on bench (or placed?)
  - Update availability status
  - Verify rate expectations
  - Add any new skills/certifications
  - Update "last contacted" timestamp
- Time: ~5 minutes per consultant

### 3:30 PM - Immigration Case Review

**Step 27: Check Visa Expiry Alerts**
- User clicks "Immigration" in sidebar
- Dashboard shows consultants with visa issues:
  - Rajesh Kumar: H1B expires in 120 days (Yellow alert)
  - Ahmed Ali: EAD expires in 45 days (Red alert)
- User opens Ahmed's immigration case
- Reviews:
  - Current visa: EAD (expires 2025-01-15)
  - Case status: Extension pending
  - Next action: Follow up with attorney on 12/5
- User logs note: "Checked with Ahmed, attorney submitted extension 11/20, waiting for receipt notice"
- User ensures Ahmed is not submitted to any jobs requiring >60 days start time
- Time: ~10 minutes for immigration review

### 4:00 PM - Metrics & Pipeline Review

**Step 28: Review Personal Metrics**
- User opens "My Metrics" dashboard
- Reviews week-to-date:

```
+------------------------------------------------------------------+
| My Bench Sales Metrics                    Week: 11/25 - 12/1    |
+------------------------------------------------------------------+
| Placements:           0 / 1 target        ⚠ Behind pace          |
| Submissions:         18 / 15 target       ✓ On track             |
| Marketing Calls:     22 / 20 target       ✓ Ahead                |
| Hotlists Sent:        2 / 2 target        ✓ Complete             |
| Vendor Responses:     7 (38% rate)        ⚠ Below 40% target     |
+------------------------------------------------------------------+
| My Consultants (6 assigned)                                       |
| 0-15 days: 2 (Green)                                             |
| 16-30 days: 2 (Green)                                            |
| 31-60 days: 2 (Orange) ⚠                                         |
| 61+ days: 0 (Red)                                                |
+------------------------------------------------------------------+
| Action Items:                                                     |
| • Focus on placing Rajesh (42 days) and John (35 days)          |
| • Increase vendor follow-up rate                                 |
| • Target 1 placement by end of sprint (12/6)                    |
+------------------------------------------------------------------+
```

- User identifies action items for remainder of week
- Time: ~5 minutes

**Step 29: Update Manager on Progress**
- User opens task: "Weekly check-in with manager"
- Prepares summary:
  - Consultants on bench: 6 assigned
  - Top priorities: Rajesh (42d), John (35d)
  - Submissions this week: 18
  - Pipeline: 3 interviews scheduled next week
  - Blockers: None
- Sends summary email or schedules call
- Time: ~10 minutes

### 4:30 PM - Plan Tomorrow

**Step 30: Create Tomorrow's Tasks**
- User opens Today View
- Reviews what's due tomorrow
- Creates new tasks:
  - "Follow up on Rajesh interview (TechStaff)"
  - "Call 5 vendors from hotlist"
  - "Find 10 external jobs for .NET consultants"
  - "Contact Maria (8 days bench) - check status"
- Sets priorities and due dates
- Reviews sprint goals
- Notes any blockers for manager
- Time: ~10 minutes

### 4:45 PM - End of Day Activities

**Step 31: Final Activity Logging**
- User reviews any unlogged activities from the day
- Logs:
  - Calls made but not logged
  - Emails sent
  - Internal meetings
- Ensures all submissions are updated
- Time: ~10 minutes

### 5:00 PM - Logout

**Step 32: Sign Out**
- User clicks profile menu
- Clicks "Sign Out"
- Session ends
- Redirect to login page

---

## Daily Activity Summary

By end of day, a typical Bench Sales Recruiter should have logged:

| Activity Type | Target Count |
|---------------|--------------|
| Consultant Check-in Calls | 3-5 |
| Vendor Marketing Calls | 5-8 |
| Bench Submissions Created | 3-4 |
| External Jobs Added | 10-15 |
| Vendor Follow-up Calls | 5-10 |
| Emails Logged | 15-25 |
| Tasks Completed | 5-10 |
| Status Updates | 10-15 |
| Hotlists Sent | 0-1 (2 per week) |

---

## Weekly Patterns

| Day | Focus |
|-----|-------|
| Monday | Priority setting, check weekend responses, bench status review |
| Tuesday | Heavy job sourcing, submissions, hotlist creation |
| Wednesday | Vendor marketing calls, interview prep, follow-ups |
| Thursday | Pipeline review, submissions, consultant engagement |
| Friday | Metrics review, manager sync, planning next week |

---

## Common Daily Scenarios

### Scenario 1: New Consultant Joins Bench
**Trigger:** HR notifies bench team of consultant rolling off project

**Actions:**
1. Receive notification: "Priya Sharma ending project at Meta on 12/1"
2. Open Priya's profile
3. Update status: "On Bench" with bench start date
4. Assign to self (if in your pod)
5. Schedule call with Priya
6. Review/update resume
7. Identify matching external jobs
8. Add to next hotlist
9. Create marketing plan task

**Time:** ~30 minutes initial setup

### Scenario 2: Vendor Requests Interview
**Trigger:** Email from vendor: "We'd like to interview Rajesh for the Capital One role"

**Actions:**
1. Click notification → Bench Submission detail
2. Update status: "Vendor Accepted" → "Interview Requested"
3. Reply to vendor with Rajesh's availability
4. Call Rajesh to confirm interest and availability
5. Coordinate interview time
6. Update submission with interview details
7. Create task: "Prep Rajesh for Capital One interview"
8. Log all activities

**Time:** ~15-20 minutes

### Scenario 3: Consultant Reaches 30 Days on Bench
**Trigger:** System alert: "Rajesh Kumar reached 30 days on bench"

**Actions:**
1. Review alert notification
2. Open Rajesh's consultant card
3. Review current pipeline (active submissions, interviews)
4. Check recent marketing efforts (hotlists, direct submits)
5. Call Rajesh for status check and motivation
6. Notify manager (if not already aware)
7. Increase marketing frequency (daily contact)
8. Add to high-priority section of next hotlist
9. Target 5+ submissions in next 3 days
10. Create escalation task for 60-day checkpoint

**Time:** ~20 minutes + ongoing increased effort

### Scenario 4: Placement Closes
**Trigger:** Vendor confirms: "Rajesh accepted offer, starts 12/15"

**Actions:**
1. Update bench submission status: "Placed"
2. Enter placement details (start date, rate, client)
3. Update Rajesh's user profile status: "Placed" (no longer on bench)
4. Log placement activity
5. Notify manager and celebrate!
6. Update sprint metrics (1/1 placement)
7. Request feedback from Rajesh
8. Send thank you to vendor
9. Create follow-up task for Rajesh's first day

**Time:** ~15 minutes

---

## Time Allocation (Typical Day)

| Activity Block | Time | Percentage |
|----------------|------|------------|
| Consultant engagement (calls, check-ins) | 90 min | 20% |
| Job discovery (sourcing external jobs) | 90 min | 20% |
| Vendor marketing (calls, emails, hotlists) | 75 min | 17% |
| Submissions (creating, submitting) | 60 min | 13% |
| Follow-ups (vendors, consultants) | 60 min | 13% |
| Administrative (logging, updating, metrics) | 45 min | 10% |
| Interview prep | 30 min | 7% |
| **Total Productive Time** | **450 min** | **100%** |

*Note: 7.5 hour workday excluding lunch and breaks*

---

## Common Blockers & Escalation

| Blocker | Escalation Path |
|---------|-----------------|
| Consultant not responding | Try multiple channels, escalate to manager after 3 attempts |
| Vendor not responding | Follow up via phone, try alternate contact, escalate to manager |
| External job expired | Mark as expired, remove from active list |
| Consultant 30+ days bench | Notify manager, increase marketing, create action plan |
| Visa expiring soon | Notify HR and manager immediately, halt relevant submissions |
| Rate mismatch (too high) | Discuss with manager, negotiate with consultant |
| No external jobs for skillset | Expand search, consider training, discuss with manager |

---

*Last Updated: 2024-11-30*
