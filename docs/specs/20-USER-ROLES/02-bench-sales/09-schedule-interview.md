# Use Case: Schedule Vendor/Client Interviews for Bench Consultants

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-BENCH-008 |
| Actor | Bench Sales Recruiter |
| Goal | Coordinate and schedule interviews between vendors/clients and bench consultants |
| Frequency | 5-10 interviews per week |
| Estimated Time | 10-15 minutes per interview |
| Priority | High (Critical to placement pipeline) |

---

## Preconditions

1. User is logged in as Bench Sales Recruiter
2. Consultant has been submitted to vendor/client
3. Vendor has requested interview with consultant
4. Consultant profile is complete with contact information
5. User has access to calendar integration (Google Calendar, Outlook)
6. Vendor contact information is available in system

---

## Trigger

One of the following:
- Vendor emails/calls requesting interview with submitted consultant
- Vendor accepts submission via portal (auto-triggers interview scheduling)
- Manager requests expedited interview scheduling for priority consultant
- Consultant reaches interview stage in submission workflow
- End client (through vendor) requests direct interview

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Interview Scheduling

**Option A: From Submission Detail**
- User views submission detail page
- Submission status: "Submitted to Vendor" → "Interview Requested"
- User clicks "Schedule Interview" button

**Option B: From Dashboard Task**
- Dashboard shows task: "Schedule interview for Rajesh Kumar - Accenture role"
- User clicks task

**Option C: From Calendar View**
- User clicks "+ Schedule Interview" from bench calendar

**System Response:**
- Interview scheduling modal opens
- Submission details pre-populated (if coming from submission)
- Calendar integration ready

**URL:** `/employee/workspace/bench/interviews/new?submissionId=abc123`

**Screen State:**
```
+------------------------------------------------------------------+
|                  Schedule Interview                          [×] |
+------------------------------------------------------------------+
| [Step 1: Details] [Step 2: Availability] [Step 3: Confirm]      |
+------------------------------------------------------------------+
|                                                                   |
| Interview Context                                                 |
+------------------------------------------------------------------+
| Submission: #BS-2024-1234                                        |
| Consultant: Rajesh Kumar - Java Developer                        |
| Job: Senior Java Developer @ Accenture Federal                   |
| Vendor: TechStaff Solutions                                      |
| Rate: $92/hr | Remote | H1B                                      |
+------------------------------------------------------------------+
|                                                                   |
| Interview Details                                                 |
+------------------------------------------------------------------+
| Interview Type: *                                                 |
| ● Technical Screening (vendor-led)                              |
| ○ Client Interview (end client-led)                             |
| ○ Panel Interview (multiple interviewers)                        |
| ○ Rate Negotiation Call                                          |
| ○ Contract Review / Onboarding Call                              |
| ○ Manager/Peer Interview                                         |
|                                                                   |
+------------------------------------------------------------------+
| Interview Round: *                                                |
| ● Round 1 (Initial Screening)                                   |
| ○ Round 2 (Technical Deep Dive)                                  |
| ○ Round 3 (Final Round)                                          |
| ○ Other: [Specify round                               ]          |
|                                                                   |
+------------------------------------------------------------------+
| Duration: *                                                       |
| ● 30 minutes                                                     |
| ○ 45 minutes                                                     |
| ○ 60 minutes (1 hour)                                            |
| ○ 90 minutes                                                     |
| ○ Custom: [   ] minutes                                          |
|                                                                   |
+------------------------------------------------------------------+
| Interview Format: *                                               |
| ● Video Call (recommended)                                       |
|   Platform: [Zoom                                          ▼]     |
|             (Zoom, Teams, Google Meet, WebEx)                    |
| ○ Phone Call                                                     |
|   Dial-in: [Vendor will provide                        ]          |
| ○ In-Person                                                      |
|   Address: [                                            ]          |
|                                                                   |
+------------------------------------------------------------------+
| Interview Focus: (optional, helps consultant prepare)             |
| [Java technical questions, Spring Boot microservices,     ]      |
| [AWS architecture, past project experience at Meta        ]      |
| [                                                 ] 110/500      |
|                                                                   |
+------------------------------------------------------------------+
|                                      [Cancel]  [Next: Times →]   |
+------------------------------------------------------------------+
```

**Field Specifications:**

| Field | Type | Required | Options |
|-------|------|----------|---------|
| Interview Type | Radio | Yes | 6 predefined types |
| Interview Round | Radio | Yes | Round 1/2/3/Other |
| Duration | Radio + Custom | Yes | 30/45/60/90 min or custom |
| Interview Format | Radio + Dropdown | Yes | Video/Phone/In-Person |
| Platform | Dropdown | If Video | Zoom, Teams, Meet, WebEx |
| Interview Focus | Textarea | No | Max 500 chars |

**Common Interview Types Explained:**

1. **Technical Screening (Most Common)**
   - Vendor's technical recruiter screens consultant
   - Basic technical questions, project experience
   - Duration: 30-45 minutes
   - Usually first round

2. **Client Interview**
   - End client's hiring manager/tech lead interviews consultant
   - In-depth technical, cultural fit, project specifics
   - Duration: 45-60 minutes
   - Usually second round

3. **Panel Interview**
   - Multiple interviewers from vendor/client
   - Mix of technical, managerial, HR
   - Duration: 60-90 minutes
   - Final round or large projects

4. **Rate Negotiation Call**
   - Discuss rate, contract terms, benefits
   - Involves vendor account manager
   - Duration: 30 minutes
   - After successful technical interviews

5. **Contract Review / Onboarding**
   - Review contract details, start date, onboarding
   - HR/contracts team from vendor
   - Duration: 30-45 minutes
   - Final step before placement

6. **Manager/Peer Interview**
   - Meet team lead or future peers
   - Team fit, collaboration style
   - Duration: 30-45 minutes
   - Mid or final round

**Time:** ~2 minutes

---

### Step 2: Input Interview Participants

**User Action:** Click "Next: Times →"

**Screen State:**
```
+------------------------------------------------------------------+
|                  Schedule Interview                          [×] |
+------------------------------------------------------------------+
| [Step 1: Details] [Step 2: Availability] [Step 3: Confirm]      |
+------------------------------------------------------------------+
|                                                                   |
| Participants & Time                                               |
+------------------------------------------------------------------+
| Consultant: *                                                     |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ✅ Rajesh Kumar                                               │ |
| │ Email: rajesh.kumar@intime.com                                │ |
| │ Phone: +1-240-555-0123 (US)                                   │ |
| │ Timezone: US Eastern (GMT-5)                                  │ |
| │ Location: Washington, DC                                      │ |
| │                                                               │ |
| │ Consultant Status: Available                                  │ |
| │ Last contacted: Today 9:15 AM - Confirmed availability       │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
|                                                                   |
| Vendor/Client Contacts: *                                         |
| [+ Add Interviewer]                                               |
|                                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Interviewer 1:                                                │ |
| │ Name: [John Smith                                      ]  [×] │ |
| │ Title: [Senior Technical Recruiter                     ]      │ |
| │ Company: ● Vendor (TechStaff)  ○ End Client (Accenture)      │ |
| │ Email: [john.smith@techstaff.com                       ]  *   │ |
| │ Phone: [+1-212-555-7890                                ]      │ |
| │ Timezone: [US Eastern (GMT-5)                          ▼]  *  │ |
| │ Role: ● Primary Interviewer  ○ Observer  ○ Panelist          │ |
| │                                                               │ |
| │ ☑ Load from vendor contacts                                  │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Interviewer 2: (optional)                                     │ |
| │ Name: [Sarah Johnson                                   ]  [×] │ |
| │ Title: [Hiring Manager                                 ]      │ |
| │ Company: ● Vendor (TechStaff)  ○ End Client (Accenture)      │ |
| │ Email: [sarah.j@accenture.com                          ]  *   │ |
| │ Phone: [+1-703-555-2341                                ]      │ |
| │ Timezone: [US Eastern (GMT-5)                          ▼]  *  │ |
| │ Role: ○ Primary Interviewer  ○ Observer  ● Panelist          │ |
| │                                                               │ |
| │ ☐ Load from client contacts                                  │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| [+ Add Interviewer] (max 5 interviewers)                         |
|                                                                   |
+------------------------------------------------------------------+
| Additional Attendees: (optional)                                  |
| ☑ Include InTime recruiter (me) as observer                     |
|   Email: [your.name@intime.com                           ]      |
|   ☐ Send calendar invite to me                                  |
|                                                                   |
+------------------------------------------------------------------+
|                             [← Back]  [Next: Find Times →]       |
+------------------------------------------------------------------+
```

**Field Specifications:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Consultant | Auto-filled | Yes | From submission |
| Interviewer Name | Text | Yes | Min 2 chars |
| Interviewer Title | Text | No | - |
| Company Type | Radio | Yes | Vendor or End Client |
| Interviewer Email | Email | Yes | Valid email format |
| Interviewer Phone | Phone | No | International format OK |
| Timezone | Dropdown | Yes | All timezones |
| Role | Radio | Yes | Primary/Observer/Panelist |

**Timezone Considerations:**

Common scenarios in bench sales:
1. **Same timezone** (Easiest)
   - Consultant: US Eastern
   - Vendor: US Eastern
   - End Client: US Eastern
   - Scheduling: Simple, 9 AM-5 PM ET

2. **US Multi-timezone** (Common)
   - Consultant: US Eastern (EST, GMT-5)
   - Vendor: US Pacific (PST, GMT-8)
   - End Client: US Central (CST, GMT-6)
   - Scheduling: Find overlap (12 PM-2 PM ET = 9 AM-11 AM PT)

3. **International Consultant** (Frequent)
   - Consultant: India (IST, GMT+5:30) - InTime offshore consultants
   - Vendor: US Eastern (EST, GMT-5)
   - End Client: US Eastern
   - Scheduling: Early morning IST (7 AM IST = 8:30 PM ET previous day) OR late evening EST (8 PM ET = 6:30 AM IST next day)

4. **Global Panel** (Complex)
   - Consultant: US Eastern
   - Vendor: US Eastern
   - End Client #1: US Pacific
   - End Client #2: UK (GMT)
   - Scheduling: Very narrow window (1 PM ET = 10 AM PT = 6 PM GMT)

**System provides:**
- Timezone visual guide showing time conversion
- Availability finder based on business hours per timezone
- Warning if interview time is outside 8 AM-6 PM for any participant

**Time:** ~3 minutes

---

### Step 3: Find Available Time Slots

**User Action:** Click "Next: Find Times →"

**System Processing:**
1. Checks calendar integrations for consultant availability (if integrated)
2. Checks business hours for each timezone
3. Calculates overlap windows
4. Generates suggested time slots

**Screen State:**
```
+------------------------------------------------------------------+
|                  Schedule Interview                          [×] |
+------------------------------------------------------------------+
| [Step 1: Details] [Step 2: Availability] [Step 3: Confirm]      |
+------------------------------------------------------------------+
|                                                                   |
| Select Interview Time                                             |
+------------------------------------------------------------------+
| Participants (3):                                                 |
| • Rajesh Kumar (Consultant) - US Eastern (GMT-5)                 |
| • John Smith (Vendor) - US Eastern (GMT-5)                       |
| • Sarah Johnson (Client) - US Eastern (GMT-5)                    |
|                                                                   |
| Duration: 30 minutes | Format: Video (Zoom)                       |
+------------------------------------------------------------------+
|                                                                   |
| Timezone Converter                                                |
| Reference time: [12:00 PM                ] [US Eastern       ▼]  |
| → 12:00 PM US Eastern (Rajesh, John, Sarah)                      |
|                                                                   |
+------------------------------------------------------------------+
| Proposed Date: *                                                  |
| [📅 12/04/2024 (Wednesday)                                  ▼]    |
|                                                                   |
| Quick Suggestions (Based on business hours overlap):              |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ● TOMORROW (Wed 12/4)                                         │ |
| │   ○ 10:00 AM - 10:30 AM ET (All timezones: business hours)  │ |
| │   ○ 1:00 PM - 1:30 PM ET (All timezones: business hours)    │ |
| │   ○ 3:00 PM - 3:30 PM ET (All timezones: business hours)    │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ○ THURSDAY (12/5)                                             │ |
| │   ○ 9:00 AM - 9:30 AM ET (All timezones: business hours)    │ |
| │   ○ 11:00 AM - 11:30 AM ET (All timezones: business hours)  │ |
| │   ○ 2:00 PM - 2:30 PM ET (All timezones: business hours)    │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ○ FRIDAY (12/6)                                               │ |
| │   ○ 10:00 AM - 10:30 AM ET (All timezones: business hours)  │ |
| │   ○ 1:00 PM - 1:30 PM ET (All timezones: business hours)    │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| Custom Time:                                                      |
| ○ Select specific date/time:                                     |
|   Date: [12/04/2024           ] Time: [10:00 AM  ] [ET       ▼] |
|                                                                   |
+------------------------------------------------------------------+
| Consultant Availability Notes:                                    |
| ℹ Rajesh confirmed available: Mon-Fri 9 AM-5 PM ET               |
| ℹ Rajesh prefers: Afternoon slots (1 PM-4 PM ET)                 |
|                                                                   |
+------------------------------------------------------------------+
| Send Availability Request First?                                  |
| ○ Send proposed times to all participants for confirmation       |
|   (Creates calendar hold, waits for all confirmations)           |
| ● Proceed with selected time (send calendar invite directly)    |
|                                                                   |
+------------------------------------------------------------------+
|                         [← Back]  [Next: Prepare Consultant →]   |
+------------------------------------------------------------------+
```

**International Scheduling Example:**
```
+------------------------------------------------------------------+
| Timezone Converter (Multi-timezone Interview)                     |
+------------------------------------------------------------------+
| Participants (3):                                                 |
| • Amit Patel (Consultant) - India Standard Time (IST, GMT+5:30)  |
| • John Smith (Vendor) - US Eastern (EST, GMT-5)                  |
| • Client Manager - US Pacific (PST, GMT-8)                       |
|                                                                   |
| Proposed Time: 8:00 PM US Eastern                                |
| → 8:00 PM EST (John - Vendor)                                    |
| → 5:00 PM PST (Client Manager - ⚠ End of day)                   |
| → 6:30 AM IST NEXT DAY (Amit - ✅ Early morning)                 |
|                                                                   |
| ⚠ Warning: Client Manager time is outside preferred hours        |
| ℹ Consider: 7:00 AM EST = 6:00 PM IST (better for consultant)   |
|                                                                   |
| Business Hours Overlay:                                           |
| EST (GMT-5):  |████████████████░░░░░░░░| 9 AM - 5 PM             |
| PST (GMT-8):  |░░░░░░████████████████░░| 9 AM - 5 PM             |
| IST (GMT+5:30):|░░░░░░░░░░░░░░████████████████| 9 AM - 5 PM     |
|                                                                   |
| Recommended windows:                                              |
| ✅ 7:00 AM - 9:00 AM EST (Overlaps IST afternoon, PST not yet)   |
| ✅ 7:00 PM - 9:00 PM EST (Overlaps IST early morning next day)   |
+------------------------------------------------------------------+
```

**Time:** ~2 minutes

---

### Step 4: Prepare Consultant for Interview

**User Action:** Click "Next: Prepare Consultant →"

**Screen State:**
```
+------------------------------------------------------------------+
|                  Schedule Interview                          [×] |
+------------------------------------------------------------------+
| [Step 1: Details] [Step 2: Availability] [Step 3: Confirm]      |
+------------------------------------------------------------------+
|                                                                   |
| Consultant Preparation Package                                    |
+------------------------------------------------------------------+
| Interview scheduled: Wednesday, 12/4/2024 at 10:00 AM ET         |
| Consultant: Rajesh Kumar                                          |
+------------------------------------------------------------------+
|                                                                   |
| Information to Send Consultant:                                   |
+------------------------------------------------------------------+
| ☑ Interview Details (date, time, duration, format)              |
| ☑ Interviewer Information (names, titles, LinkedIn profiles)     |
| ☑ Job Description (full JD for this role)                       |
| ☑ Company Information (about Accenture Federal)                  |
| ☑ Interview Format & Expectations                                |
| ☑ Technical Topics Likely to be Covered                          |
| ☑ Zoom/Video Call Link                                           |
| ☑ Your contact info (for day-of issues)                          |
|                                                                   |
+------------------------------------------------------------------+
| Consultant Preparation Notes:                                     |
+------------------------------------------------------------------+
| Interview Type: Technical Screening (Round 1)                     |
| Interviewers:                                                     |
|   • John Smith, Senior Technical Recruiter, TechStaff Solutions  |
|   • Sarah Johnson, Hiring Manager, Accenture Federal             |
|                                                                   |
| Topics to Prepare:                                                |
| [• Java technical questions (data structures, algorithms)  ]     |
| [• Spring Boot microservices architecture                  ]     |
| [• AWS services (EC2, S3, Lambda, API Gateway)             ]     |
| [• Your experience at Meta (backend services, scalability) ]     |
| [• Questions about federal/government contracting (if any) ]     |
| [                                                           ]     |
| [• Dress code: Business casual (video call)                ]     |
| [• Have resume in front of you for reference               ]     |
| [• Prepare questions to ask them about the role/project    ]     |
| [                                                 ] 485/1000     |
|                                                                   |
+------------------------------------------------------------------+
| Interview Tips & Best Practices:                                  |
| [Default tips loaded - edit as needed]                           |
|                                                                   |
| ☑ Technical interview tips (whiteboarding, coding)               |
| ☑ Behavioral interview tips (STAR method)                        |
| ☑ Video interview tips (camera, lighting, background)            |
| ☑ Questions to ask the interviewer                               |
| ☑ Common mistakes to avoid                                       |
|                                                                   |
| [View/Edit Tips Document]                                         |
|                                                                   |
+------------------------------------------------------------------+
| Company Background (Accenture Federal Services):                  |
| [Auto-populated from company database or AI]                      |
|                                                                   |
| [Accenture Federal Services is a subsidiary of Accenture   ]     |
| [focused on serving US federal government agencies. They   ]     |
| [work on large-scale technology transformation projects... ]     |
| [                                                           ]     |
| [Notable projects: IRS modernization, DHS systems...       ]     |
| [                                                 ] 215/1000     |
|                                                                   |
+------------------------------------------------------------------+
| Send Preparation Package:                                         |
| Method: ● Email  ☑ SMS reminder                                  |
| Send: ● Immediately after scheduling                            |
|       ○ 1 day before interview                                   |
|       ○ Custom time: [Select date/time                    ]      |
|                                                                   |
| Email Template: [Interview Preparation - Technical        ▼]     |
|                                                                   |
| [Preview Email]                                                   |
|                                                                   |
+------------------------------------------------------------------+
| Reminders:                                                        |
| ☑ Send reminder 1 day before (Tue 12/3 at 10:00 AM)             |
| ☑ Send reminder 2 hours before (Wed 12/4 at 8:00 AM)            |
| ☑ Send Zoom link 15 minutes before (Wed 12/4 at 9:45 AM)        |
|                                                                   |
+------------------------------------------------------------------+
|                            [← Back]  [Next: Send Invites →]      |
+------------------------------------------------------------------+
```

**Preparation Package Components:**

1. **Interview Details**
   - Date, time, duration (with timezone clearly stated)
   - Format (video, phone, in-person)
   - Video call link (Zoom, Teams, etc.)
   - Dial-in number (if phone)

2. **Interviewer Information**
   - Names and titles
   - LinkedIn profiles (if available)
   - Brief background on each interviewer
   - Interviewer's role in hiring decision

3. **Job Description**
   - Full JD with requirements
   - Project details (if available)
   - Team structure
   - Technologies used

4. **Company Information**
   - Company overview
   - Recent news/projects
   - Culture and values
   - Why this is a good opportunity

5. **Interview Format & Expectations**
   - Type of questions (technical, behavioral)
   - Format (screen share, whiteboarding, live coding)
   - Duration and structure
   - What they're evaluating

6. **Technical Topics**
   - Specific technologies to review
   - Common interview questions for this role
   - Areas from resume they'll likely ask about
   - Coding/system design expectations

**Time:** ~5 minutes

---

### Step 5: Generate and Send Calendar Invites

**User Action:** Click "Next: Send Invites →"

**Screen State:**
```
+------------------------------------------------------------------+
|                  Schedule Interview                          [×] |
+------------------------------------------------------------------+
| [Step 1: Details] [Step 2: Availability] [Step 3: Confirm]      |
+------------------------------------------------------------------+
|                                                                   |
| Review & Send Calendar Invites                                    |
+------------------------------------------------------------------+
| Interview Summary:                                                |
+------------------------------------------------------------------+
| Title: Technical Screening - Rajesh Kumar - Accenture Java Role  |
| Date/Time: Wednesday, December 4, 2024 at 10:00 AM ET           |
| Duration: 30 minutes                                              |
| Format: Video Call (Zoom)                                         |
| Round: Round 1 (Initial Screening)                               |
|                                                                   |
| Participants:                                                     |
| • Rajesh Kumar (Consultant) - rajesh.kumar@intime.com           |
| • John Smith (Vendor) - john.smith@techstaff.com                 |
| • Sarah Johnson (Client) - sarah.j@accenture.com                 |
| • You (Observer) - your.name@intime.com                          |
|                                                                   |
+------------------------------------------------------------------+
| Video Conference Details:                                         |
| Platform: Zoom                                                    |
|                                                                   |
| Meeting Link Generation:                                          |
| ● Auto-generate Zoom link (via InTime Zoom integration)         |
|   Link: https://zoom.us/j/123456789 (generated)                 |
|   Meeting ID: 123 456 789                                        |
|   Passcode: Auto-generated                                       |
|                                                                   |
| ○ Use vendor's meeting link                                      |
|   Link: [Vendor will provide                             ]       |
|                                                                   |
| ○ Use client's meeting link                                      |
|   Link: [Client will provide                             ]       |
|                                                                   |
+------------------------------------------------------------------+
| Calendar Invite Details:                                          |
+------------------------------------------------------------------+
| Subject: *                                                        |
| [Technical Screening - Rajesh Kumar - Accenture Java Role ]      |
|                                                                   |
| Location/Link:                                                    |
| [https://zoom.us/j/123456789                              ]      |
|                                                                   |
| Description:                                                      |
| [Interview between Rajesh Kumar (Java Developer) and      ]      |
| [Accenture Federal Services for Senior Java Developer role]      |
| [                                                           ]      |
| [Interviewers:                                             ]      |
| [• John Smith, Senior Technical Recruiter, TechStaff      ]      |
| [• Sarah Johnson, Hiring Manager, Accenture Federal       ]      |
| [                                                           ]      |
| [Interview Focus:                                          ]      |
| [• Java technical questions                                ]      |
| [• Spring Boot microservices                               ]      |
| [• AWS cloud architecture                                  ]      |
| [• Past project experience                                 ]      |
| [                                                           ]      |
| [Zoom Link: https://zoom.us/j/123456789                   ]      |
| [Meeting ID: 123 456 789                                   ]      |
| [Passcode: [Auto-included in link]                        ]      |
| [                                                           ]      |
| [Please join 5 minutes early to test audio/video.         ]      |
| [                                                           ]      |
| [For technical issues, contact:                           ]      |
| [Your Name - your.name@intime.com - 555-123-4567          ]      |
| [                                                 ] 685/2000     |
|                                                                   |
+------------------------------------------------------------------+
| Attachments: (optional)                                           |
| ☑ Job Description (Accenture_Senior_Java_Developer.pdf)         |
| ☑ Consultant Resume (Rajesh_Kumar_Java_Developer.pdf)           |
| ☐ Interview Prep Guide (Interview_Tips.pdf)                     |
|                                                                   |
+------------------------------------------------------------------+
| Send Options:                                                     |
| ☑ Send calendar invite to all participants                       |
| ☑ Request RSVP (track who accepts)                              |
| ☑ Send confirmation email to consultant                          |
| ☑ Create interview record in InTime OS                           |
| ☑ Set up automated reminders                                    |
|                                                                   |
+------------------------------------------------------------------+
|                         [← Back]  [Confirm & Send Invites →]    |
+------------------------------------------------------------------+
```

**Calendar Invite Standards:**

**Subject Line Formats:**
- `Technical Screening - [Consultant] - [Company] [Role]`
- `Client Interview - [Consultant] - [Company] [Role] - Round 2`
- `Panel Interview - [Consultant] - [Company] [Role]`
- `Rate Negotiation - [Consultant] - [Company]`

**Description Template:**
```
Interview: [Type] (Round [N])
Consultant: [Name] - [Title]
Company: [Company Name]
Job: [Job Title]

Interviewers:
• [Name], [Title], [Company]
• [Name], [Title], [Company]

Interview Focus:
• [Topic 1]
• [Topic 2]
• [Topic 3]

Format: [Video/Phone/In-Person]
Duration: [X] minutes

[Video Call Link]
Meeting ID: [ID]
Passcode: [Passcode]

Preparation:
• Please join 5 minutes early to test audio/video
• Have your resume handy for reference
• Prepare questions to ask about the role/project

For technical issues or schedule changes:
[Recruiter Name]
[Email]
[Phone]

---
Scheduled via InTime Staffing
```

**Time:** ~2 minutes

---

### Step 6: Confirm and Send

**User Action:** Click "Confirm & Send Invites →"

**Confirmation Modal:**
```
+------------------------------------------------------------------+
|                      Confirm Interview Scheduling            [×] |
+------------------------------------------------------------------+
| You are about to schedule this interview:                        |
|                                                                   |
| Technical Screening - Rajesh Kumar - Accenture Java Role         |
| Wednesday, December 4, 2024 at 10:00 AM ET (30 minutes)         |
|                                                                   |
| Calendar invites will be sent to:                                |
| ✓ Rajesh Kumar - rajesh.kumar@intime.com                        |
| ✓ John Smith - john.smith@techstaff.com                         |
| ✓ Sarah Johnson - sarah.j@accenture.com                         |
| ✓ You - your.name@intime.com                                    |
|                                                                   |
| Actions:                                                          |
| ✓ Send 4 calendar invites (.ics files)                          |
| ✓ Create Zoom meeting link                                       |
| ✓ Create interview record in InTime OS                           |
| ✓ Update submission status to "Interview Scheduled"             |
| ✓ Send preparation email to Rajesh Kumar                         |
| ✓ Set up 3 automated reminders (1 day, 2 hours, 15 min before) |
| ✓ Create activity log entry                                      |
|                                                                   |
| ⚠ All participants will receive calendar invites immediately.    |
|                                                                   |
+------------------------------------------------------------------+
|                              [← Go Back]  [Confirm & Send →]     |
+------------------------------------------------------------------+
```

**User Action:** Click "Confirm & Send →"

**System Processing:**
1. **Create Interview Record**
   - Stores interview in database with all details
   - Links to submission, consultant, vendor, job
   - Status: "Scheduled"

2. **Generate Zoom Meeting**
   - Calls Zoom API to create meeting
   - Gets meeting link, ID, passcode
   - Stores credentials in interview record

3. **Send Calendar Invites**
   - Generates .ics files for each participant
   - Sends via email with proper timezone formatting
   - Includes Zoom link in location field
   - Attaches job description and resume (if selected)

4. **Update Submission Status**
   - Changes from "Submitted to Vendor" → "Interview Scheduled"
   - Updates submission timeline
   - Records interview date/time

5. **Send Preparation Email**
   - Sends detailed preparation package to consultant
   - Includes all context, tips, company info
   - Separate from calendar invite

6. **Set Up Reminders**
   - Schedules 3 reminder emails:
     - 1 day before: "Interview tomorrow at 10 AM ET"
     - 2 hours before: "Interview in 2 hours - join link"
     - 15 minutes before: "Interview starting soon - [Zoom link]"

7. **Create Activities**
   - Logs activity: "Interview scheduled with Accenture"
   - Adds to consultant timeline
   - Adds to submission timeline

8. **Notify Manager**
   - Sends notification: "Interview scheduled for Rajesh Kumar"
   - Includes interview details

**System Response:**
- Progress indicator (3-5 seconds)
- Success toast: "Interview scheduled ✓ Calendar invites sent to 4 participants"
- Redirects to Interview Detail page

**Confirmation Screen:**
```
+------------------------------------------------------------------+
|              Interview Successfully Scheduled!                    |
+------------------------------------------------------------------+
| ✅ Calendar invites sent to all participants                     |
| ✅ Zoom meeting created                                          |
| ✅ Preparation email sent to Rajesh Kumar                        |
| ✅ Submission status updated                                     |
| ✅ Reminders scheduled                                           |
+------------------------------------------------------------------+
|                                                                   |
| Interview Details:                                                |
| Technical Screening - Rajesh Kumar - Accenture Java Role         |
| Wednesday, December 4, 2024 at 10:00 AM ET (30 minutes)         |
|                                                                   |
| Zoom Link: https://zoom.us/j/123456789                           |
| Meeting ID: 123 456 789                                          |
|                                                                   |
| Next Steps:                                                       |
| • Monitor RSVP responses (3 of 4 accepted so far)                |
| • Send reminder 1 day before (Tue 12/3)                          |
| • Join interview as observer (optional)                          |
| • Collect feedback after interview                               |
|                                                                   |
+------------------------------------------------------------------+
| [View Interview Details] [Add to My Calendar] [Edit Interview]  |
+------------------------------------------------------------------+
```

**Time:** ~5 seconds processing

---

### Step 7: Monitor RSVP Responses

**Screen State (Interview Detail Page):**
```
+------------------------------------------------------------------+
| ← Back to Interviews     Technical Screening - Rajesh      [⋮]   |
+------------------------------------------------------------------+
| Status: ✅ Scheduled              Interview Date: 12/4/24 10 AM  |
| Submission: #BS-2024-1234         Round: Round 1                 |
+------------------------------------------------------------------+
|                                                                   |
| RSVP Status                                  Last updated: 2m ago |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ✅ Rajesh Kumar (Consultant)                                  │ |
| │    Accepted - 10 minutes ago                                  │ |
| │    Email: rajesh.kumar@intime.com                             │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ✅ John Smith (Vendor - TechStaff)                            │ |
| │    Accepted - 5 minutes ago                                   │ |
| │    Email: john.smith@techstaff.com                            │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ⏳ Sarah Johnson (Client - Accenture)                         │ |
| │    No response yet                                            │ |
| │    Calendar invite sent 15 minutes ago                        │ |
| │    [Send Reminder]                                            │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ✅ You (Observer)                                             │ |
| │    Accepted - 1 minute ago                                    │ |
| │    Email: your.name@intime.com                                │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| [Resend All Invites] [Send Individual Reminder]                  |
+------------------------------------------------------------------+
|                                                                   |
| Interview Details                                                 |
+------------------------------------------------------------------+
| Type: Technical Screening                                         |
| Round: Round 1 (Initial Screening)                               |
| Date: Wednesday, December 4, 2024                                |
| Time: 10:00 AM - 10:30 AM Eastern Time                           |
| Duration: 30 minutes                                              |
| Format: Video Call (Zoom)                                         |
| Zoom Link: https://zoom.us/j/123456789                           |
| Meeting ID: 123 456 789                                          |
| Passcode: ******** [Show]                                        |
|                                                                   |
| Interview Focus:                                                  |
| • Java technical questions, data structures                      |
| • Spring Boot microservices architecture                         |
| • AWS cloud services and scalability                             |
| • Past project experience at Meta                                |
|                                                                   |
+------------------------------------------------------------------+
| Scheduled Reminders                                               |
+------------------------------------------------------------------+
| ☑ 1 day before: Tuesday, 12/3 at 10:00 AM                       |
| ☑ 2 hours before: Wednesday, 12/4 at 8:00 AM                    |
| ☑ 15 minutes before: Wednesday, 12/4 at 9:45 AM                 |
|                                                                   |
| [Edit Reminders]                                                  |
+------------------------------------------------------------------+
|                                                                   |
| Consultant Preparation Status                                     |
+------------------------------------------------------------------+
| ✅ Preparation email sent (12/2 at 11:30 AM)                     |
| ✅ Email opened by Rajesh (12/2 at 12:15 PM)                     |
| ✅ Zoom link clicked (12/2 at 12:20 PM - tested connection)      |
|                                                                   |
| Last contact with consultant: Today 11:25 AM                     |
| Consultant confirmed ready: Yes                                   |
|                                                                   |
| [Send Additional Prep Materials] [Contact Consultant]            |
+------------------------------------------------------------------+
```

**RSVP Tracking:**
- System tracks who accepted/declined/no response
- Sends automatic reminders to non-responders
- Alerts recruiter if anyone declines (needs reschedule)
- Shows read receipts for preparation emails

**Time:** Ongoing monitoring until interview

---

### Step 8: Send Pre-Interview Reminders (Automated)

**1 Day Before (Tuesday 12/3 at 10:00 AM):**

**Email to Consultant (Rajesh):**
```
Subject: Reminder: Interview Tomorrow - Accenture Java Role

Hi Rajesh,

This is a friendly reminder about your interview tomorrow:

Interview: Technical Screening (Round 1)
Date: Wednesday, December 4, 2024
Time: 10:00 AM - 10:30 AM Eastern Time (30 minutes)
Format: Video Call via Zoom

Interviewers:
• John Smith, Senior Technical Recruiter, TechStaff Solutions
• Sarah Johnson, Hiring Manager, Accenture Federal Services

Zoom Link: https://zoom.us/j/123456789
Meeting ID: 123 456 789

Preparation Checklist:
☑ Review Java, Spring Boot, AWS topics
☑ Review your resume (especially Meta projects)
☑ Prepare 2-3 questions to ask them
☑ Test your camera, microphone, internet
☑ Find a quiet space with good lighting
☑ Dress business casual (video call)
☑ Have resume in front of you for reference

Interview Focus:
• Java technical questions (data structures, algorithms)
• Spring Boot microservices architecture
• AWS cloud services
• Your experience at Meta

Tips:
• Join 5 minutes early to avoid technical issues
• Look at the camera when speaking (not the screen)
• Use the STAR method for behavioral questions
• Ask thoughtful questions about the role/project

You've got this! This is a great opportunity and you're well-prepared.

If you have any questions or need anything, call/text me:
Your Name
555-123-4567
your.name@intime.com

Good luck!
```

**2 Hours Before (Wednesday 12/4 at 8:00 AM):**

**SMS to Consultant:**
```
Hi Rajesh, interview in 2 hours (10 AM ET)! Zoom link: https://zoom.us/j/123456789
Join 5 min early. You've got this! Call me if any issues: 555-123-4567 - [Your Name]
```

**15 Minutes Before (Wednesday 12/4 at 9:45 AM):**

**SMS to Consultant:**
```
Rajesh, your interview starts in 15 minutes!
Join now: https://zoom.us/j/123456789
Good luck! - [Your Name]
```

**Time:** Automated, no manual effort

---

### Step 9: Day-of Interview Support (Optional)

**Option A: Join as Observer**

**User Action:** Click "Join Interview" link at 9:55 AM (5 minutes early)

**Why observe?**
- First-time consultant (needs support)
- High-priority placement (valuable client)
- Complex interview (panel, executive)
- Consultant requested presence
- Training new bench recruiter

**Observer Role:**
- Keep camera/mic OFF (silent observer)
- Monitor interview flow
- Take notes on consultant performance
- Be available for technical issues
- Jump in ONLY if major issue (connection lost, etc.)

**Option B: Monitor Remotely**

**Dashboard shows:**
```
+------------------------------------------------------------------+
| Active Interview: Rajesh Kumar - Accenture                        |
+------------------------------------------------------------------+
| Status: 🔴 IN PROGRESS                                           |
| Started: 10:02 AM ET (2 minutes ago)                             |
| Expected end: 10:32 AM ET (28 minutes remaining)                 |
|                                                                   |
| Participants joined:                                              |
| ✅ Rajesh Kumar (joined 9:58 AM)                                 |
| ✅ John Smith (joined 10:00 AM)                                  |
| ✅ Sarah Johnson (joined 10:01 AM)                               |
|                                                                   |
| [Join as Observer] [End Interview] [Send Message to Consultant] |
+------------------------------------------------------------------+
```

**Time:** 30-60 minutes (duration of interview)

---

### Step 10: Post-Interview Follow-up

**Immediately After Interview Ends:**

**System Auto-Sends (to Consultant):**
```
Subject: Great job on your interview!

Hi Rajesh,

Your interview just ended. Great job!

Quick feedback survey (2 minutes):
[How did the interview go?]
• Went very well
• Went well
• Went okay
• Did not go well

[Were you asked technical questions?] Yes / No
[Did you get to ask your questions?] Yes / No

[Any concerns or feedback?]
[                                    ]

[Submit Feedback]

Next steps:
• Vendor will debrief with client today
• I'll follow up within 24 hours with updates
• If they want to move forward, next interview will be scheduled

Thanks for representing InTime well!

[Your Name]
555-123-4567
```

**Recruiter Action (within 1 hour):**

1. **Contact Consultant**
   - Call or message: "How did it go?"
   - Get immediate feedback
   - Gauge confidence level
   - Address any concerns

2. **Contact Vendor**
   - Call vendor contact (John Smith)
   - Get immediate feedback on consultant
   - Ask about next steps
   - Timeline for decision

3. **Update System**
   - Interview status: "In Progress" → "Completed"
   - Add feedback notes
   - Update submission status
   - Set follow-up task

**Screen State (Interview Detail - After Completion):**
```
+------------------------------------------------------------------+
| ← Back to Interviews     Technical Screening - Rajesh      [⋮]   |
+------------------------------------------------------------------+
| Status: ✅ Completed              Interview Date: 12/4/24 10 AM  |
| Submission: #BS-2024-1234         Round: Round 1                 |
+------------------------------------------------------------------+
|                                                                   |
| Interview Outcome                               [Edit Feedback]  |
+------------------------------------------------------------------+
| Result: ⏳ Awaiting Feedback                                     |
|                                                                   |
| Consultant Feedback: (collected via auto-survey)                  |
| • Interview went: Very Well ✅                                   |
| • Confidence level: High                                         |
| • Technical questions: Yes, Java/Spring/AWS as expected          |
| • Asked own questions: Yes, about project and team               |
| • Concerns: None, felt interview went smoothly                   |
| • Interested in role: Very interested                            |
|                                                                   |
| Collected: 12/4/24 10:35 AM (5 min after interview ended)        |
+------------------------------------------------------------------+
|                                                                   |
| Vendor Feedback: (collected via recruiter call)                   |
| • Overall impression: Positive ✅                                |
| • Technical skills: Strong in Java, Spring Boot, AWS             |
| • Communication: Excellent, clear and articulate                 |
| • Experience level: Matches requirements                          |
| • Concerns: None mentioned                                       |
| • Next steps: Moving to Round 2 (client interview)               |
| • Timeline: Client interview next week (12/9-12/11)              |
|                                                                   |
| Collected: 12/4/24 11:15 AM (via call with John Smith)          |
+------------------------------------------------------------------+
| Recruiter Notes:                                                  |
| [Called Rajesh at 10:35 AM - he felt interview went very   ]     |
| [well. John and Sarah were friendly, asked mostly Java and ]     |
| [Spring Boot questions, some AWS architecture. Rajesh      ]     |
| [answered confidently. They seemed impressed with Meta     ]     |
| [experience. Rajesh asked good questions about the project.]     |
| [                                                           ]     |
| [Called John (vendor) at 11:15 AM - very positive feedback.]     |
| [John said Rajesh did great, strong technical skills, good ]     |
| [fit. Sarah (client) wants to move forward to next round.  ]     |
| [Waiting for client to provide 3 time slots for Round 2.   ]     |
| [Should hear back by EOD Friday 12/6.                      ]     |
| [                                                 ] 485/2000     |
|                                                                   |
+------------------------------------------------------------------+
| Next Actions:                                                     |
| ☑ Follow up with vendor for Round 2 schedule (by Fri 12/6)      |
| ☑ Notify Rajesh of positive feedback (completed)                |
| ☑ Prepare for Round 2 when scheduled                            |
|                                                                   |
| [Schedule Round 2 Interview] [Update Submission Status]          |
+------------------------------------------------------------------+
```

**Time:** ~15-20 minutes post-interview follow-up

---

## Alternative Flows

### A1: Reschedule Interview

**Trigger:** Participant requests to reschedule (consultant, vendor, or client)

**Scenario:** Vendor emails day before: "Sarah Johnson has a conflict. Can we move to Thursday 12/5 at 2 PM?"

**Actions:**
1. User opens interview detail page
2. User clicks "Reschedule" button
3. System shows rescheduling modal
4. User enters new date/time: "Thursday 12/5 at 2:00 PM ET"
5. System checks availability (if calendar integrated)
6. User adds reschedule reason: "Client conflict"
7. User clicks "Send Updated Invites"
8. System:
   - Cancels original calendar invites (with cancellation notice)
   - Sends new calendar invites with updated time
   - Notifies all participants of change
   - Updates interview record
   - Sends apology/reschedule email to consultant
9. Consultant confirms new time
10. Interview rescheduled

**Time:** ~5 minutes

---

### A2: Cancel Interview

**Trigger:** Job filled, consultant placed elsewhere, or submission rejected before interview

**Scenario:** Vendor calls: "The position has been filled internally. Cancel Rajesh's interview."

**Actions:**
1. User opens interview detail page
2. User clicks "Cancel Interview"
3. Confirmation modal: "Are you sure? This will notify all participants."
4. User selects reason:
   - ○ Position filled
   - ○ Consultant no longer available
   - ○ Client cancelled req
   - ○ Submission rejected
   - ○ Other: [              ]
5. User adds note for consultant: "Position filled. Looking for other opportunities."
6. User clicks "Cancel & Notify Participants"
7. System:
   - Sends cancellation calendar invites (meeting cancelled)
   - Sends cancellation email to consultant (with reason)
   - Updates interview status: "Cancelled"
   - Updates submission status (back to "Submitted to Vendor" or "Rejected")
   - Creates activity log
8. Consultant notified

**Cancellation Email to Consultant:**
```
Subject: Interview Cancelled - Accenture Java Role

Hi Rajesh,

Unfortunately, your interview scheduled for Wednesday, 12/4 at 10:00 AM
has been cancelled.

Reason: The position has been filled by the client.

This is not a reflection of your skills or qualifications. These situations
are common in staffing.

Next Steps:
I'm actively working to find other Java opportunities for you. I'll keep you
updated on new matches.

Please let me know if you have any questions.

[Your Name]
555-123-4567
```

**Time:** ~3 minutes

---

### A3: No-Show by Consultant

**Trigger:** Consultant doesn't join interview (no-show)

**Timeline:**
- 10:00 AM: Interview scheduled to start
- 10:02 AM: Consultant hasn't joined, recruiter sends SMS
- 10:05 AM: Still no-show, recruiter calls consultant
- 10:08 AM: Can't reach consultant, recruiter apologizes to vendor
- 10:10 AM: Vendor ends call, frustrated

**Actions:**
1. During interview (10:05 AM): Recruiter calls consultant repeatedly
2. Post-interview: User marks interview as "No-Show"
3. User opens interview detail, clicks "Mark as No-Show"
4. Confirmation modal with options:
   - Was consultant contacted? Yes/No
   - Reason (if known): [Technical issue / Emergency / Forgot / Unresponsive]
   - Action taken: [Called, texted, emailed]
5. User clicks "Confirm No-Show"
6. System:
   - Updates interview status: "No-Show"
   - Updates submission status: "No-Show - Needs Follow-up"
   - Flags consultant profile (reliability concern)
   - Notifies manager (escalation)
   - Creates incident report
7. Recruiter actions:
   - Send apology to vendor (via email/call)
   - Try to reach consultant (keep calling)
   - Manager decides next steps (second chance vs. warning)

**Apology Email to Vendor:**
```
Subject: Sincere Apologies - Rajesh Kumar No-Show

Hi John,

I sincerely apologize for Rajesh not showing up to today's interview.
This is completely unacceptable and not reflective of InTime's standards.

I'm trying to reach Rajesh to understand what happened. I'll update you
once I connect with him.

Would you be open to rescheduling if there was a valid emergency?
Or should I submit a different consultant?

Again, my deepest apologies for wasting your and Sarah's time.

[Your Name]
555-123-4567
```

**Time:** Ongoing incident management

---

### A4: Multi-Round Interview Scheduling

**Trigger:** Consultant passes Round 1, vendor requests Round 2, then Round 3

**Workflow:**
1. **After Round 1 completes:**
   - Vendor feedback: "Rajesh did great, move to Round 2"
   - Recruiter clicks "Schedule Round 2" from Round 1 detail page

2. **Round 2 setup:**
   - System pre-fills consultant info from Round 1
   - Interviewers change (now client hiring manager + tech lead)
   - Interview type: "Client Interview" (deeper technical)
   - Duration: 60 minutes (longer than Round 1)
   - Format: Video (Zoom)

3. **Round 2 scheduling:**
   - Recruiter follows same steps as Round 1
   - Adds more technical topics to prep
   - Mentions "Round 2" in all communications
   - References Round 1 success: "Great job in Round 1! Round 2 is with client."

4. **After Round 2:**
   - If passes: Schedule Round 3 (often final round, panel or executive)
   - If fails: Update submission to "Rejected"

5. **Round 3 (Final):**
   - Often panel interview (3-5 interviewers)
   - Duration: 90 minutes
   - Mix of technical, cultural fit, contract discussion
   - May include rate negotiation

**Tracking Multi-Round:**
```
+------------------------------------------------------------------+
| Submission: #BS-2024-1234 - Rajesh Kumar - Accenture             |
+------------------------------------------------------------------+
| Interview History:                                                |
+------------------------------------------------------------------+
| ✅ Round 1: Technical Screening - 12/4/24 10 AM                  |
|    Result: Passed - Moving to Round 2                            |
|    Feedback: Strong technical skills, good communication         |
|                                                                   |
| ✅ Round 2: Client Interview - 12/9/24 2 PM                      |
|    Result: Passed - Moving to Round 3 (Final)                    |
|    Feedback: Excellent, client very impressed                    |
|                                                                   |
| 📅 Round 3: Panel Interview - 12/12/24 10 AM (Scheduled)         |
|    Interviewers: 4 (Hiring Mgr, Tech Lead, HR, VP Engineering)  |
|    Focus: Technical, cultural fit, rate negotiation              |
|                                                                   |
| [Schedule Next Round] [View All Interviews]                      |
+------------------------------------------------------------------+
```

**Time:** Ongoing over multiple weeks

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Interview Type | Required | "Please select an interview type" |
| Interview Round | Required | "Please select interview round" |
| Duration | Required, 15-240 min | "Duration must be between 15 minutes and 4 hours" |
| Interview Format | Required | "Please select interview format (video/phone/in-person)" |
| Consultant | Required | "Please select a consultant" |
| Interview Date | Required, not past | "Interview date cannot be in the past" |
| Interview Time | Required | "Please select interview time" |
| Interviewer Name | Required, min 2 chars | "Interviewer name is required" |
| Interviewer Email | Required, valid email | "Please enter a valid email address" |
| Interviewer Timezone | Required | "Please select interviewer timezone" |
| Video Platform | Required if format=video | "Please select video platform (Zoom, Teams, etc.)" |

**Business Rules:**
- Cannot schedule interview <2 hours in future (too short notice)
- Warning if scheduling interview <24 hours in future (short notice)
- Warning if scheduling outside business hours (8 AM-6 PM any timezone)
- Maximum 5 interviewers per interview
- Must have at least 1 interviewer
- Consultant must be in "Submitted to Vendor" status or later
- Cannot schedule interview if consultant already has interview at same time

---

## Business Rules

### Interview Timing

**Minimum Notice:**
- Ideal: 48 hours advance notice (2 business days)
- Acceptable: 24 hours advance notice (1 business day)
- Rush: 4-8 hours (requires manager approval)
- Emergency: <4 hours (rarely, vendor urgency)

**Time Slot Preferences:**
- Avoid Mondays before 10 AM (people catching up)
- Avoid Fridays after 3 PM (people winding down)
- Ideal: Tuesday-Thursday, 10 AM-4 PM
- Lunch hours OK if participants agree (12 PM-1 PM)

### International Scheduling

**India-US Interviews (Very Common):**
- **Option 1:** Early morning IST
  - 7:00 AM IST = 8:30 PM ET previous day
  - Works for: Consultant (morning), US team (evening)
  - Pro: Consultant fresh in morning
  - Con: US team may be tired

- **Option 2:** Late evening ET
  - 8:00 PM ET = 6:30 AM IST next day
  - Works for: US team (evening), Consultant (morning next day)
  - Pro: Both can be fresh
  - Con: Date confusion (different calendar dates)

- **Option 3:** Weekend
  - Saturday/Sunday IST = Friday night/Saturday ET
  - Works for: Flexible schedules
  - Pro: No work conflicts
  - Con: Weekend work (less ideal)

**Best Practice:**
- Always show both timezones in communications
- Use "IST" and "ET" explicitly (not just "AM/PM")
- Include calendar date for both timezones
- Example: "7:00 AM IST on Thursday, Dec 5 (8:30 PM ET on Wednesday, Dec 4)"

### Video Platform Selection

**Platform Priorities:**
1. **Vendor/Client Preference** (if specified)
2. **InTime Default** (Zoom)
3. **Consultant Preference** (if vendor flexible)

**Common Platforms:**
- **Zoom:** Most common, reliable, global
- **Microsoft Teams:** Government/enterprise clients
- **Google Meet:** Tech companies, startups
- **WebEx:** Older enterprise, government
- **Phone:** Fallback if video issues

### Interview Preparation Standards

**Minimum Preparation (for consultant):**
- Company research (15 minutes)
- Job description review (10 minutes)
- Resume review (own experience) (10 minutes)
- Technical topic review (30-60 minutes)
- Practice common questions (30 minutes)
- Total: 1.5-2 hours

**Recruiter Must Provide:**
- Interview details (date/time/format)
- Interviewer information (names, titles, LinkedIn)
- Job description
- Company information
- Technical topics to review
- Interview tips
- Contact info for day-of issues

### No-Show / Cancellation Policy

**Consultant No-Show:**
- First offense: Warning, second chance with vendor approval
- Second offense: Suspension from bench marketing (1 week)
- Third offense: Termination from company

**Vendor No-Show:**
- Rare but happens
- Recruiter apologizes to consultant
- Reschedule immediately
- Document vendor unreliability

**Acceptable Cancellations:**
- Emergency (family, medical)
- Technical failure (power outage, internet down)
- Provided >24 hours notice with valid reason

**Unacceptable Cancellations:**
- Forgot about interview
- Overslept
- "Something came up" (vague)
- No-show without communication

---

## Interview Types Deep Dive

### 1. Technical Screening (Round 1)

**Purpose:** Initial screening by vendor's technical recruiter

**Duration:** 30-45 minutes

**Interviewers:**
- Vendor technical recruiter (primary)
- Sometimes: Vendor account manager (secondary)

**Format:** Video call (Zoom, Teams)

**Topics:**
- Resume walkthrough (5-10 min)
- Technical questions - basic (10-15 min)
  - Java: OOP concepts, data structures
  - Spring Boot: Basics, annotations, DI
  - AWS: Basic services (EC2, S3, RDS)
- Past projects (10-15 min)
- Availability, rate, visa (5 min)

**Outcome:**
- Pass: Move to client interview (Round 2)
- Fail: Submission rejected
- Maybe: Vendor needs to discuss with client

**Consultant Prep:**
- Review resume thoroughly
- Prepare 2-min project summaries
- Review basic technical concepts
- Prepare questions about the role

---

### 2. Client Interview (Round 2)

**Purpose:** Client's hiring manager/tech lead evaluates technical fit

**Duration:** 45-60 minutes

**Interviewers:**
- Client hiring manager (primary)
- Client tech lead or senior engineer (secondary)
- Sometimes: Vendor recruiter (observer)

**Format:** Video call (client's platform)

**Topics:**
- In-depth technical questions (20-30 min)
  - Java: Advanced topics, design patterns, performance
  - Spring Boot: Microservices, security, testing
  - AWS: Architecture, scalability, cost optimization
- System design / architecture (10-15 min)
  - "Design a scalable API for X"
  - "How would you architect Y system?"
- Project deep-dive (10-15 min)
  - Specific projects from resume
  - Challenges faced, solutions implemented
- Cultural fit, soft skills (5-10 min)

**Outcome:**
- Pass: Move to final round OR offer (if 2-round process)
- Fail: Submission rejected
- Maybe: Client wants additional interview

**Consultant Prep:**
- Deep technical review (4-6 hours)
- System design practice
- STAR method for behavioral questions
- Research company's tech stack
- Prepare detailed project explanations

---

### 3. Panel Interview (Round 3 / Final)

**Purpose:** Multiple stakeholders evaluate overall fit

**Duration:** 60-90 minutes

**Interviewers:**
- Hiring manager
- Tech lead / Senior engineer
- HR representative
- VP or Director (for senior roles)
- Peer team members

**Format:** Video call, panel style

**Structure:**
- Introductions (5 min)
- Technical questions (20-30 min) - from tech lead
- Behavioral questions (15-20 min) - from hiring manager
- HR questions (10-15 min) - work auth, benefits, start date
- Cultural fit (10-15 min) - from peers
- Candidate questions (10 min)
- Closing (5 min)

**Outcome:**
- Pass: Offer extended (usually within 24-48 hours)
- Fail: Submission rejected
- Maybe: Additional reference check or short final call

**Consultant Prep:**
- All previous prep (technical, behavioral)
- Prepare questions for each interviewer type
- Research each interviewer on LinkedIn
- Practice maintaining energy for 90 minutes
- Dress professionally (business casual minimum)

---

### 4. Rate Negotiation Call

**Purpose:** Discuss compensation, benefits, contract terms

**Duration:** 30-45 minutes

**Participants:**
- Vendor account manager / contracts specialist
- Consultant
- Sometimes: InTime recruiter (advocate for consultant)

**Format:** Phone or video call

**Topics:**
- Hourly rate discussion
  - Consultant asks: $95/hr
  - Vendor offers: $90/hr
  - Negotiate: $92/hr (compromise)
- Contract terms
  - W2 or C2C (Corp-to-Corp)
  - Benefits (if W2): Health, 401k, PTO
  - Payment terms: Weekly, bi-weekly
- Start date
- Duration: 6 months, 1 year, contract-to-hire
- Work location: Remote, hybrid, on-site
- Work hours / schedule

**Outcome:**
- Agree: Contract drafted, placement imminent
- Disagree: Consultant declines or vendor withdraws

**Consultant Prep:**
- Know your minimum acceptable rate
- Research market rates for role/location
- Understand W2 vs C2C pros/cons
- Be ready to negotiate (but be reasonable)

---

### 5. Contract Review / Onboarding Call

**Purpose:** Review final contract, answer questions, prepare for start

**Duration:** 30-45 minutes

**Participants:**
- Vendor HR / contracts team
- Consultant
- InTime recruiter (optional, for consultant support)

**Format:** Video call

**Topics:**
- Contract walkthrough
  - Rate, payment schedule
  - Start date, end date
  - Termination clause
  - IP/NDA agreements
- Onboarding logistics
  - First day instructions
  - Equipment (laptop, phone)
  - Access (email, VPN, systems)
  - Point of contact
- Benefits enrollment (if W2)
- Background check / drug test (if required)
- I-9 / work authorization verification

**Outcome:**
- Sign contract
- Complete pre-employment requirements
- Set start date

**Consultant Prep:**
- Read contract thoroughly before call
- List questions about unclear terms
- Have SSN, work auth docs ready
- Know your start date availability

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `i` | Schedule new interview |
| `r` | Reschedule selected interview |
| `c` | Cancel selected interview |
| `Enter` | Confirm and send invites (when in form) |
| `Esc` | Cancel / Close modal |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |

---

## Email Templates

### Template 1: Initial Interview Invitation (to Consultant)

```
Subject: Great News! Interview Scheduled - [Company] [Role]

Hi [Consultant Name],

Great news! [Vendor Company] would like to interview you for the [Job Title]
position at [End Client Company].

Interview Details:
• Type: [Technical Screening / Client Interview / etc.]
• Date: [Day], [Month] [Date], [Year]
• Time: [Time] [Timezone] ([Duration] minutes)
• Format: [Video Call / Phone / In-Person]
• Round: [Round 1 / Round 2 / Final Round]

[If video:]
Zoom Link: [Link]
Meeting ID: [ID]
Passcode: [Passcode]

Interviewers:
• [Name], [Title], [Company]
• [Name], [Title], [Company]

Interview Focus:
• [Topic 1]
• [Topic 2]
• [Topic 3]

Preparation:
I've attached a detailed preparation guide including:
• Company background
• Job description
• Interview tips
• Common technical questions
• Suggested topics to review

Please:
1. Accept the calendar invite
2. Review the preparation materials
3. Test your video/audio setup beforehand
4. Join 5 minutes early on interview day

You've got this! You're well-qualified for this role and I'm confident you'll
do great.

If you have any questions or concerns, please call/text me immediately:
[Your Name]
[Phone]
[Email]

Good luck!

Best regards,
[Your Name]
[Title]
InTime Staffing
```

---

### Template 2: Interview Reminder (1 Day Before)

```
Subject: Reminder: Interview Tomorrow - [Company] [Role]

Hi [Consultant Name],

This is a friendly reminder about your interview tomorrow:

Interview: [Type] (Round [N])
Date: [Day], [Month] [Date], [Year]
Time: [Time] [Timezone] ([Duration] minutes)
Format: [Video Call / Phone]

[If video:]
Zoom Link: [Link]
Meeting ID: [ID]

Checklist:
☑ Review [technical topics]
☑ Review your resume
☑ Prepare 2-3 questions to ask
☑ Test camera/mic
☑ Find quiet space with good lighting
☑ Dress business casual
☑ Join 5 minutes early

You're well-prepared. Be confident, be yourself, and showcase your experience.

Call/text me if you need anything:
[Phone]

You've got this!

[Your Name]
```

---

### Template 3: Post-Interview Follow-up (to Consultant)

```
Subject: How did your interview go?

Hi [Consultant Name],

Your interview just ended. I hope it went well!

I'd love to hear your thoughts:
• How do you think it went?
• Were the questions what you expected?
• Any concerns or surprises?
• How interested are you in this role?

Please reply or give me a call when you have a moment:
[Phone]

I'll be reaching out to [Vendor] for their feedback and will update you
within 24 hours on next steps.

Thanks for representing InTime so well!

[Your Name]
```

---

### Template 4: Reschedule Notification (to Consultant)

```
Subject: Interview Rescheduled - [Company] [Role]

Hi [Consultant Name],

Your interview with [Company] has been rescheduled:

Original Time: [Old Date/Time]
New Time: [New Date/Time] [Timezone]

Reason: [Brief reason - client conflict, scheduling issue, etc.]

Everything else remains the same:
• Same interviewers
• Same format (video/phone)
• Same preparation

Please accept the updated calendar invite.

Let me know if the new time doesn't work for you and I'll work with the
vendor to find another time.

Sorry for the inconvenience!

[Your Name]
[Phone]
```

---

### Template 5: Interview Cancellation (to Consultant)

```
Subject: Interview Cancelled - [Company] [Role]

Hi [Consultant Name],

Unfortunately, your interview scheduled for [Date/Time] has been cancelled.

Reason: [Position filled / Req on hold / Client cancelled / etc.]

This is not a reflection of your qualifications or skills. These situations
are common in staffing and often outside our control.

Next Steps:
I'm actively working to find other opportunities that match your profile.
I'll keep you updated on new matches and will reach out as soon as I have
something promising.

Please let me know if you have any questions.

I appreciate your patience and professionalism.

[Your Name]
[Phone]
[Email]
```

---

## Events Logged

| Event | Payload |
|-------|---------|
| `interview.scheduled` | `{ interview_id, submission_id, consultant_id, vendor_id, interview_type, date_time, created_by }` |
| `interview.rescheduled` | `{ interview_id, old_datetime, new_datetime, reason, rescheduled_by }` |
| `interview.cancelled` | `{ interview_id, reason, cancelled_by, cancelled_at }` |
| `interview.started` | `{ interview_id, started_at }` |
| `interview.completed` | `{ interview_id, completed_at, duration }` |
| `interview.no_show` | `{ interview_id, no_show_party, contacted_attempts, reason }` |
| `interview.feedback_received` | `{ interview_id, feedback_from, feedback_text, outcome }` |
| `interview.round_completed` | `{ interview_id, round_number, outcome, next_round_scheduled }` |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Interview Scheduling Time | <15 min | Avg time from request to scheduled |
| Consultant Show-Up Rate | >95% | Interviews attended / Interviews scheduled |
| Vendor Show-Up Rate | >98% | Vendors attended / Scheduled |
| Interview Rescheduling Rate | <10% | Rescheduled / Total scheduled |
| Same-Day Scheduling | <5% | Interviews scheduled <24hr notice / Total |
| Multi-timezone Success | >90% | International interviews without issues |
| Post-Interview Follow-up Time | <2 hours | Time to contact consultant after interview |
| Round 1 Pass Rate | 60-70% | Consultants advancing to Round 2 |
| Final Round Pass Rate | 40-50% | Consultants getting offers |

---

## Common Challenges & Solutions

### Challenge 1: Timezone Confusion

**Problem:** Consultant in India joins 12 hours late (AM/PM confusion)

**Solution:**
- Always include timezone acronym (IST, EST, PST)
- Show time in ALL participant timezones
- Use 24-hour format for international (14:00 instead of 2:00 PM)
- Send multiple reminders with clear time conversions
- Add calendar date for both timezones

**Example:**
```
Interview Time:
• 7:00 AM IST on Thursday, December 5, 2024
• 8:30 PM EST on Wednesday, December 4, 2024
(Note different calendar dates!)
```

---

### Challenge 2: Technical Issues During Interview

**Problem:** Consultant's internet drops during interview

**Solution:**
- Always get consultant's phone number beforehand
- Include dial-in number as backup in calendar invite
- Recruiter on standby during interview
- If connection lost: Consultant calls recruiter, recruiter bridges to vendor
- Post-interview: Reschedule remainder if needed

---

### Challenge 3: Last-Minute Cancellation by Vendor

**Problem:** Vendor cancels 2 hours before interview

**Solution:**
- Immediately notify consultant (call + text)
- Apologize profusly to consultant
- Offer to reschedule or find alternative opportunity
- Document vendor unreliability in system
- If pattern: Consider reducing business with vendor

---

### Challenge 4: Consultant Unprepared

**Problem:** Consultant shows up but clearly didn't prepare

**Solution:**
- Prevention: Send prep materials 24-48 hours early
- Send reminder with "must review" items
- Quick prep call day before (optional)
- Post-interview: Debrief on importance of preparation
- If repeated: Manager conversation about professionalism

---

### Challenge 5: Interview Running Over Time

**Problem:** Interview scheduled for 30 min, runs 60 min

**Solution:**
- Consultant should be prepared for interviews to run over
- Mention in prep: "May run over, keep schedule clear"
- If consultant has hard stop: Mention at start "I have hard stop at X"
- Recruiter thanks vendor for extra time (shows interest)

---

## Related Use Cases

- [02-manage-bench.md](./02-manage-bench.md) - Managing bench consultants and availability
- [03-market-consultant.md](./03-market-consultant.md) - Creating hotlists that lead to interviews
- [04-find-requirements.md](./04-find-requirements.md) - Finding jobs that result in submissions and interviews
- [05-submit-bench-consultant.md](./05-submit-bench-consultant.md) - Submitting consultants (precedes interviews)
- [06-make-placement.md](./06-make-placement.md) - Making placement after successful interviews

---

*Last Updated: 2024-11-30*
