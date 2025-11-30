# Use Case: Market Consultant to Find Requirements

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-BENCH-002 |
| Actor | Bench Sales Recruiter |
| Goal | Create and distribute consultant hotlist to vendors/clients to generate opportunities |
| Frequency | 2 times per week |
| Estimated Time | 20-30 minutes per hotlist |
| Priority | High (Core marketing activity) |

---

## Preconditions

1. User is logged in as Bench Sales Recruiter
2. Consultants exist on bench with complete profiles
3. Consultant resumes are current (<30 days old)
4. Vendor contact list exists
5. User has permission to create and send hotlists

---

## Trigger

One of the following:
- Weekly marketing schedule (e.g., Tuesday and Thursday)
- New consultants added to bench
- Vendor requests available consultants
- Manager requests increased marketing for specific consultant
- Consultant reaching 30 days on bench (urgent marketing)

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Hotlist Builder

**User Action:** Click "+ New" → "Hotlist" OR navigate to `/employee/workspace/bench/hotlists/new`

**System Response:**
- Hotlist Builder page loads
- Blank hotlist form appears
- Consultant selector ready

**URL:** `/employee/workspace/bench/hotlists/new`

**Screen State:**
```
+------------------------------------------------------------------+
|  ← Back to Hotlists              Create Hotlist     [Save Draft] |
+------------------------------------------------------------------+
| [Step 1: Details] [Step 2: Consultants] [Step 3: Review & Send] |
+------------------------------------------------------------------+
|                                                                   |
| Hotlist Details                                                   |
+------------------------------------------------------------------+
| Title: *                                                          |
| [Available Java & .NET Developers - Week of              ]       |
|                                                                   |
| Description:                                                      |
| [Top consultants available immediately for contract roles ]      |
| [                                                 ] 65/500        |
|                                                                   |
+------------------------------------------------------------------+
| Target Audience: *                                                |
| ● All Vendors (recommended for weekly hotlist)                   |
| ○ Specific Skills-focused Vendors                                |
| ○ Specific Accounts/Clients                                      |
| ○ Custom Email List                                              |
|                                                                   |
+------------------------------------------------------------------+
| Hotlist Focus: (optional)                                         |
| Target Skills: [Java, .NET, React                          ▼]    |
| Target Roles: [Developer, Engineer, Architect              ▼]    |
| Location: [Remote, DC Area                                 ▼]    |
|                                                                   |
+------------------------------------------------------------------+
| Validity Period:                                                  |
| Expires: [14     ] days from send date                           |
|                                                                   |
+------------------------------------------------------------------+
|                                    [Cancel]  [Next: Select →]    |
+------------------------------------------------------------------+
```

**Time:** ~1 minute

---

### Step 2: Fill Hotlist Details

**User Action:** Enter hotlist information

**Field Specifications:**

| Field | Type | Required | Max Length | Default |
|-------|------|----------|------------|---------|
| Title | Text | Yes | 100 chars | "Available [Skills] - Week of [Date]" |
| Description | Textarea | No | 500 chars | - |
| Target Audience | Radio | Yes | - | All Vendors |
| Target Skills | Multi-select | No | - | - |
| Target Roles | Multi-select | No | - | - |
| Location | Multi-select | No | - | - |
| Expires | Number | Yes | - | 14 days |

**Common Title Patterns:**
- "Available Java & .NET Developers - Week of 12/2"
- "Immediate Start: Full Stack Engineers"
- "Urgent: Senior Consultants on Bench"
- "Top React & Node Developers Available"

**User Action:** Click "Next: Select →"

**System Response:**
- Validates required fields
- Proceeds to Step 2: Consultant Selection
- Auto-filters consultants based on target skills (if specified)

**Time:** ~2 minutes

---

### Step 3: Select Consultants for Hotlist

**Screen State:**
```
+------------------------------------------------------------------+
|  ← Back to Details           Select Consultants    [Save Draft]  |
+------------------------------------------------------------------+
| [Step 1: Details] [Step 2: Consultants] [Step 3: Review & Send] |
+------------------------------------------------------------------+
|                                                                   |
| Select Consultants                        Selected: 0/20 max     |
+------------------------------------------------------------------+
| [All] [My Consultants] [Priority] [Skills Match]                 |
| Filters: [Java ×] [.NET ×]  Sort: Days on Bench ▼  [Clear]      |
+------------------------------------------------------------------+
| ☐ Select All Visible (12)                                        |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ☑ Rajesh Kumar                               42 days | 🟠     │ |
| │ Java Developer | $85/hr | H1B | Remote/DC                     │ |
| │ Skills: Java, Spring Boot, AWS, Microservices                 │ |
| │ Last project: Meta (3 years) | Available: Immediate           │ |
| │ ⚠ High priority: 30+ days on bench                            │ |
| │ [View Profile] [Preview Marketing Profile]                    │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ☑ John Smith                                 35 days | 🟠     │ |
| │ Full Stack Developer | $90/hr | Citizen | Remote             │ |
| │ Skills: Java, Spring, React, Node, AWS, Docker                │ |
| │ Last project: Amazon (2 years) | Available: Immediate         │ |
| │ ⚠ High priority: 30+ days on bench                            │ |
| │ [View Profile] [Preview Marketing Profile]                    │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ☐ Priya Sharma                               18 days | 🟢     │ |
| │ React Developer | $95/hr | Green Card | Remote/Bay Area      │ |
| │ Skills: React, TypeScript, Node, GraphQL, AWS                 │ |
| │ Last project: Google (18 months) | Available: Immediate       │ |
| │ [View Profile] [Preview Marketing Profile]                    │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ☐ David Chen                                 12 days | 🟢     │ |
| │ DevOps Engineer | $95/hr | H1B | Remote                       │ |
| │ Skills: AWS, Docker, Kubernetes, Java, Python                 │ |
| │ Last project: Netflix (1 year) | Available: Immediate         │ |
| │ [View Profile] [Preview Marketing Profile]                    │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ... 8 more consultants ...                                        |
+------------------------------------------------------------------+
|                               [← Back]  [Next: Review & Send →]  |
+------------------------------------------------------------------+
```

**Selection Strategy:**

**Priority Order:**
1. **Orange/Red consultants first** (31+ days on bench)
2. **Skills match** to target audience
3. **Complete profiles** (resume, skills, rate current)
4. **Responsive consultants** (recently contacted)
5. **Diverse skillsets** (variety appealing to vendors)

**Best Practices:**
- Maximum 20 consultants per hotlist (avoid overwhelming vendors)
- Include mix of experience levels (junior, mid, senior)
- Include mix of visa statuses (Citizen, GC, H1B)
- Prioritize consultants 15+ days on bench
- Verify all consultants confirmed available

**User Action:** Select 8-12 consultants by checking boxes

**System Response:**
- Selected count updates: "Selected: 8/20"
- Selected consultants highlighted
- Can preview individual marketing profiles

**Time:** ~5 minutes

---

### Step 4: Preview Marketing Profiles

**User Action:** Click "Preview Marketing Profile" on a consultant

**Modal Opens:**
```
+------------------------------------------------------------------+
|              Marketing Profile Preview: Rajesh Kumar         [×] |
+------------------------------------------------------------------+
| This is how Rajesh will appear in the hotlist document:          |
+------------------------------------------------------------------+
|                                                                   |
| RAJESH KUMAR                                                      |
| Java Developer                                                    |
+------------------------------------------------------------------+
| Experience: 10+ years                                             |
| Location: Washington, DC (Open to remote)                        |
| Rate: $85/hr                                                      |
| Availability: Immediate                                           |
| Work Authorization: H1B (valid through 2026)                      |
|                                                                   |
| KEY SKILLS:                                                       |
| • Java, Spring Boot, Microservices                               |
| • AWS, Docker, Kubernetes                                        |
| • REST APIs, GraphQL                                             |
| • MySQL, PostgreSQL, MongoDB                                     |
|                                                                   |
| RECENT PROJECT:                                                   |
| Meta (3 years, 2021-2024)                                        |
| Backend Services Engineer                                         |
| • Built scalable microservices handling 10M+ requests/day       |
| • Migrated monolith to microservices architecture                |
| • Led team of 4 developers                                       |
|                                                                   |
| CERTIFICATIONS:                                                   |
| • AWS Certified Solutions Architect (2023)                       |
| • Spring Professional Certification (2022)                       |
|                                                                   |
| EDUCATION:                                                        |
| MS Computer Science - University of Maryland (2012)              |
|                                                                   |
+------------------------------------------------------------------+
| ☑ Include resume                                                 |
| Resume: [Rajesh_Kumar_Java_Developer.pdf (485 KB)         ▼]    |
|                                                                   |
+------------------------------------------------------------------+
| [Edit Profile] [Use AI to Enhance]              [Close] [Save]  |
+------------------------------------------------------------------+
```

**Optional Actions:**
- **Edit Profile**: Make hotlist-specific edits without changing master profile
- **Use AI to Enhance**: AI generates compelling highlights
- **Include Resume**: Attach resume to hotlist PDF

**User Action:** Review profile, make any edits, click "Save"

**Repeat for priority consultants (optional - can bulk generate)**

**Time:** ~2 minutes per consultant (optional)

---

### Step 5: Review Complete Hotlist

**User Action:** Click "Next: Review & Send →"

**Screen State:**
```
+------------------------------------------------------------------+
|  ← Back to Consultants          Review & Send       [Save Draft] |
+------------------------------------------------------------------+
| [Step 1: Details] [Step 2: Consultants] [Step 3: Review & Send] |
+------------------------------------------------------------------+
|                                                                   |
| Hotlist Summary                                                   |
+------------------------------------------------------------------+
| Title: Available Java & .NET Developers - Week of 12/2           |
| Consultants: 8 selected                                           |
| Target: All Vendors (42 contacts)                                |
| Expires: 14 days (12/16/2024)                                    |
+------------------------------------------------------------------+
|                                                                   |
| Consultant List:                                                  |
| 1. 🟠 Rajesh Kumar - Java Developer - 42 days bench              |
| 2. 🟠 John Smith - Full Stack Developer - 35 days bench          |
| 3. 🟢 Priya Sharma - React Developer - 18 days bench             |
| 4. 🟢 David Chen - DevOps Engineer - 12 days bench               |
| 5. 🟢 Maria Garcia - QA Engineer - 8 days bench                  |
| 6. 🟢 Ahmed Ali - Data Analyst - 22 days bench                   |
| 7. 🟠 Sarah Johnson - .NET Developer - 38 days bench             |
| 8. 🟢 Wei Zhang - Cloud Architect - 15 days bench                |
+------------------------------------------------------------------+
|                                                                   |
| Document Generation                                               |
| Format: ● PDF  ○ HTML Email  ○ Both                              |
|                                                                   |
| [Generate Preview]                                                |
|                                                                   |
| ☑ Include consultant resumes as attachments                      |
| ☐ Include company branding and logo                              |
| ☑ Include contact information (phone, email)                     |
| ☐ Password protect document                                      |
|                                                                   |
+------------------------------------------------------------------+
|                                [← Back]  [Generate Document →]   |
+------------------------------------------------------------------+
```

**User Action:** Select format and options, click "Generate Document →"

**System Response:**
- Generates PDF hotlist with professional layout
- Includes InTime branding
- Formats consultant profiles in clean, scannable layout
- Compiles all resumes into single zip file (if selected)
- Preview loads in modal

**Time:** ~10 seconds to generate

---

### Step 6: Preview Generated Hotlist Document

**PDF Preview Modal:**
```
+------------------------------------------------------------------+
|                    Hotlist Document Preview                  [×] |
+------------------------------------------------------------------+
| [Page 1 of 9]                     [◀ Prev] [▶ Next] [Download]  |
+------------------------------------------------------------------+
|                                                                   |
|           ╔═══════════════════════════════════════════╗          |
|           ║                                           ║          |
|           ║         INTIME STAFFING                   ║          |
|           ║    Available IT Consultants               ║          |
|           ║                                           ║          |
|           ║    Java & .NET Developers                 ║          |
|           ║    Week of December 2, 2024               ║          |
|           ║                                           ║          |
|           ╚═══════════════════════════════════════════╝          |
|                                                                   |
|    8 Top Consultants Available Immediately                       |
|    All cleared for C2C or W2 contracts                           |
|                                                                   |
|    Contact: [Your Name]                                          |
|    Email: [your.email@intime.com]                                |
|    Phone: [555-123-4567]                                         |
|                                                                   |
|    Valid through: December 16, 2024                              |
|                                                                   |
|    [Page 2: Consultant 1 - Rajesh Kumar]                         |
|    [Page 3: Consultant 2 - John Smith]                           |
|    [Page 4: Consultant 3 - Priya Sharma]                         |
|    ...                                                            |
|                                                                   |
+------------------------------------------------------------------+
|                              [← Back]  [Looks Good, Continue →]  |
+------------------------------------------------------------------+
```

**User Action:** Review preview, navigate pages, click "Looks Good, Continue →"

**System Response:**
- Saves document to file storage
- Prepares distribution modal
- Document ready to send

**Time:** ~1 minute review

---

### Step 7: Configure Distribution

**Screen State:**
```
+------------------------------------------------------------------+
|                      Send Hotlist                            [×] |
+------------------------------------------------------------------+
| Hotlist: Available Java & .NET Developers - Week of 12/2         |
| Consultants: 8 | Document: hotlist_2024-12-02.pdf (1.2 MB)       |
+------------------------------------------------------------------+
|                                                                   |
| Distribution Method: *                                            |
| ● Email                                                          |
| ○ Share Link (vendors access via portal)                         |
| ○ Both                                                           |
|                                                                   |
+------------------------------------------------------------------+
| Send To: *                                                        |
| ● All Vendors (42 contacts)                                      |
|   - TechStaff Solutions                                          |
|   - ClearanceJobs                                                |
|   - Robert Half                                                  |
|   ... and 39 more                                                |
|   [View Full List]                                               |
|                                                                   |
| ○ Vendor Groups                                                  |
|   [Java-focused Vendors (12)                              ▼]     |
|   [.NET-focused Vendors (8)                               ▼]     |
|   [Government Contractors (15)                            ▼]     |
|                                                                   |
| ○ Specific Accounts                                              |
|   [Select accounts...                                     ▼]     |
|                                                                   |
| ○ Custom Email List                                              |
|   [Enter emails (comma-separated)...                      ]      |
|                                                                   |
+------------------------------------------------------------------+
| Email Template: *                                                 |
| [Weekly Hotlist - All Vendors                             ▼]     |
|                                                                   |
| Subject: *                                                        |
| [InTime Hotlist: Java & .NET Developers Available 12/2   ]       |
|                                                                   |
| Email Body:                                                       |
| [Hi {{vendor_name}},                                      ]       |
| [                                                          ]       |
| [Please find attached our latest hotlist of available     ]       |
| [consultants. All are immediately available and cleared   ]       |
| [for C2C or W2 contracts.                                 ]       |
| [                                                          ]       |
| [Featured this week:                                      ]       |
| [• 2 Senior Java Developers (8-10 years exp)              ]       |
| [• 1 Full Stack Developer (Java/React)                    ]       |
| [• 1 .NET Developer (5 years)                             ]       |
| [• DevOps, QA, Data Analyst roles                         ]       |
| [                                                          ]       |
| [All consultants are H1B transfer-ready or US authorized. ]       |
| [Rates range from $85-100/hr.                             ]       |
| [                                                          ]       |
| [Please let me know if any match your current requirements]       |
| [or if you'd like additional details on any consultant.   ]       |
| [                                                          ]       |
| [Best regards,                                             ]       |
| [{{your_signature}}                                        ]       |
| [                                                 ] 890/2000      |
|                                                                   |
| Attachments:                                                      |
| ✓ hotlist_2024-12-02.pdf (1.2 MB)                                |
| ☑ Include consultant resumes (zip, 4.8 MB)                       |
|                                                                   |
+------------------------------------------------------------------+
| Tracking & Engagement:                                            |
| ☑ Track email opens                                              |
| ☑ Track PDF downloads                                            |
| ☑ Track link clicks                                              |
| ☑ Request response/acknowledgment                                |
|                                                                   |
| Send Options:                                                     |
| ○ Send immediately                                               |
| ● Schedule send: [12/02/2024 9:00 AM                      ]      |
| ○ Save draft (send later)                                        |
|                                                                   |
+------------------------------------------------------------------+
|                                    [Save Draft]  [Send Email →]  |
+------------------------------------------------------------------+
```

**Field Specifications:**

| Field | Type | Required | Options |
|-------|------|----------|---------|
| Distribution Method | Radio | Yes | Email, Share Link, Both |
| Send To | Radio + Multi-select | Yes | All Vendors, Groups, Specific, Custom |
| Email Template | Dropdown | Yes | Pre-defined templates |
| Subject | Text | Yes | Max 100 chars |
| Email Body | Textarea | Yes | Max 2000 chars, supports {{variables}} |
| Attachments | Checkbox | No | PDF (required), Resumes (optional) |
| Tracking | Checkboxes | No | Opens, Downloads, Clicks, Response |
| Send Options | Radio + DateTime | Yes | Now, Schedule, Draft |

**Template Variables:**
- `{{vendor_name}}` - Vendor company name
- `{{vendor_contact_name}}` - Contact first name
- `{{your_name}}` - Your full name
- `{{your_signature}}` - Email signature from profile
- `{{consultant_count}}` - Number of consultants
- `{{skills_list}}` - Comma-separated skills

**User Action:** Configure distribution, click "Send Email →"

**Time:** ~3-5 minutes

---

### Step 8: Confirm and Send

**Confirmation Modal:**
```
+------------------------------------------------------------------+
|                      Confirm Send                            [×] |
+------------------------------------------------------------------+
| You are about to send this hotlist to:                           |
|                                                                   |
| Recipients: 42 vendor contacts                                    |
| Subject: InTime Hotlist: Java & .NET Developers Available 12/2   |
| Attachments: hotlist_2024-12-02.pdf (1.2 MB)                     |
|              consultant_resumes.zip (4.8 MB)                      |
|                                                                   |
| Scheduled: December 2, 2024 at 9:00 AM                           |
|                                                                   |
| This action will:                                                 |
| ✓ Send 42 emails                                                 |
| ✓ Create hotlist record in system                                |
| ✓ Update consultant "last marketed" timestamps                   |
| ✓ Track engagement (opens, downloads, responses)                 |
|                                                                   |
| ⚠ This cannot be undone. Emails cannot be recalled.              |
|                                                                   |
+------------------------------------------------------------------+
|                           [← Go Back]  [Confirm & Send Email →]  |
+------------------------------------------------------------------+
```

**User Action:** Click "Confirm & Send Email →"

**System Processing:**
1. Creates hotlist record in database
2. Uploads PDF to file storage
3. Uploads resume zip to file storage
4. Creates email distribution records
5. Sends emails to 42 recipients (batch processing)
6. Updates consultant metadata:
   - `lastHotlistSentAt` timestamp
   - `hotlistSendCount` increment
7. Creates activity log: "Hotlist created and sent"
8. Sets up tracking pixels for opens/downloads
9. Creates follow-up tasks:
   - "Review hotlist engagement in 2 days"
   - "Follow up with non-responders in 5 days"

**System Response:**
- Progress bar shows email sending (5-10 seconds)
- Success toast: "Hotlist sent to 42 vendors ✓"
- Redirects to Hotlist detail page
- Shows distribution status dashboard

**Time:** ~10 seconds processing

---

### Step 9: View Hotlist Status Dashboard

**Screen State:**
```
+------------------------------------------------------------------+
| ← Back to Hotlists    Hotlist: Java & .NET Devs 12/2  [⋮ Actions|
+------------------------------------------------------------------+
| Status: ✓ Sent                        Sent: 12/2/24 9:00 AM      |
| Expires: 12/16/24                     Consultants: 8             |
+------------------------------------------------------------------+
|                                                                   |
| Engagement Metrics                           Last updated: 2m ago |
+------------------------------------------------------------------+
| ┌─────────────────┐ ┌─────────────────┐ ┌────────────────────┐  |
| │ Email Opens     │ │ PDF Downloads   │ │ Responses Received │  |
| │      28/42      │ │      15/42      │ │       3/42         │  |
| │      67%        │ │      36%        │ │       7%           │  |
| │                 │ │                 │ │                    │  |
| │ ✓ Good rate     │ │ ✓ Good rate     │ │ → Follow up        │  |
| └─────────────────┘ └─────────────────┘ └────────────────────┘  |
+------------------------------------------------------------------+
|                                                                   |
| Vendor Engagement Details                        [Export CSV]    |
+------------------------------------------------------------------+
| Vendor                    | Opened | Downloaded | Responded |    |
|---------------------------|--------|------------|-----------|    |
| TechStaff Solutions       |   ✓    |     ✓      |    ✓      |    |
| ClearanceJobs             |   ✓    |     ✓      |    -      |    |
| Robert Half               |   ✓    |     -      |    -      |    |
| Insight Global            |   ✓    |     ✓      |    ✓      |    |
| TEKsystems                |   -    |     -      |    -      |    |
| ... 37 more vendors ...                                          |
+------------------------------------------------------------------+
|                                                                   |
| Responses (3)                                                     |
+------------------------------------------------------------------+
| TechStaff Solutions - 12/2 10:15 AM                              |
| "Interested in Rajesh Kumar for Accenture role. Can you send     |
| full resume and rate?"                                            |
| [Reply] [Create Submission]                                       |
+------------------------------------------------------------------+
| Insight Global - 12/2 11:30 AM                                   |
| "Looking for .NET developer for client in Baltimore. Is Sarah    |
| Johnson available for interview next week?"                       |
| [Reply] [Create Submission]                                       |
+------------------------------------------------------------------+
| CyberCoders - 12/2 2:45 PM                                       |
| "Thanks for the hotlist. Will review and get back to you."       |
| [Reply] [Mark as Acknowledged]                                    |
+------------------------------------------------------------------+
```

**Metrics Explained:**
- **Email Opens**: How many vendors opened the email (tracked via pixel)
- **PDF Downloads**: How many vendors downloaded the hotlist PDF
- **Responses**: Direct replies to the hotlist email

**Good Engagement Rates:**
- Opens: >50% within 48 hours
- Downloads: >30% within 48 hours
- Responses: >5% within 5 days

**Time:** Ongoing monitoring

---

## Alternative Flows

### A1: Urgent Hotlist for Specific Consultant

**Trigger:** Consultant reaches 45 days on bench, manager requests immediate marketing

**Actions:**
1. Create focused hotlist with 1-3 high-priority consultants
2. Select targeted vendor group (not all vendors)
3. Customize email subject: "🔴 URGENT: Senior Java Developer Available Immediately"
4. Add urgency language in email body
5. Send immediately (no scheduling)
6. Follow up by phone within 2 hours to top 10 vendors
7. Track responses hourly

### A2: Skills-Specific Hotlist

**Trigger:** Multiple consultants with same skillset on bench, demand for that skill

**Actions:**
1. Create hotlist title: "Available React Developers - Immediate Start"
2. Filter consultants by primary skill = "React"
3. Select 5-8 React consultants
4. Target "React-focused Vendors" group only (12 vendors)
5. Include specific React project examples in email
6. Higher open/response rate due to targeting

### A3: Vendor Requests Hotlist

**Trigger:** Vendor calls: "Do you have any Java developers available?"

**Actions:**
1. Create on-demand hotlist: "Java Developers for [Vendor Name]"
2. Select Java consultants matching vendor's typical requirements
3. Send to single vendor (not distribution)
4. Mark as "Custom Request" (not weekly hotlist)
5. Follow up within 24 hours

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Title | Required, 10-100 chars | "Please enter a hotlist title" |
| Consultants | Required, min 1, max 20 | "Please select at least 1 consultant (max 20)" |
| Send To | Required, min 1 recipient | "Please select at least one recipient" |
| Subject | Required, max 100 chars | "Email subject is required" |
| Email Body | Required, min 50 chars | "Email body too short (min 50 characters)" |

---

## Business Rules

### Hotlist Frequency
- **Weekly**: 2 hotlists per week (Tuesday, Thursday)
- **Monthly**: 8-10 hotlists per month
- **Per Consultant**: Maximum 2 hotlists per week per consultant (avoid over-exposure)

### Consultant Eligibility
- ✅ On bench >7 days
- ✅ Profile complete (resume, skills, rate)
- ✅ Contacted within last 5 days (confirmed available)
- ✅ Visa valid >90 days
- ❌ Already on hotlist within last 3 days
- ❌ Profile incomplete
- ❌ Unresponsive (no contact in >10 days)

### Document Standards
- **Format**: PDF (not editable)
- **Branding**: InTime logo and colors
- **Content**: Professional, error-free
- **Compliance**: No discriminatory language, visa status disclosed
- **Contact**: Include recruiter name, email, phone

### Tracking Requirements
- All hotlists must have tracking enabled
- Review engagement within 48 hours
- Follow up with non-openers at 5 days
- Archive hotlists after expiry date

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+Enter` | Send hotlist (if on send screen) |
| `Tab` | Next field |
| `Space` | Select/deselect consultant |
| `Cmd+S` | Save draft |
| `Esc` | Cancel / Close modal |

---

## Email Template Variables

| Variable | Replacement |
|----------|-------------|
| `{{vendor_name}}` | Vendor company name |
| `{{vendor_contact_name}}` | Contact first name |
| `{{vendor_contact_full_name}}` | Contact full name |
| `{{your_name}}` | Your full name |
| `{{your_email}}` | Your email |
| `{{your_phone}}` | Your phone |
| `{{your_signature}}` | Email signature from profile |
| `{{consultant_count}}` | Number of consultants |
| `{{skills_list}}` | Comma-separated skills |
| `{{hotlist_title}}` | Hotlist title |
| `{{expires_date}}` | Expiry date |

---

## Events Logged

| Event | Payload |
|-------|---------|
| `hotlist.created` | `{ hotlist_id, title, consultant_ids, created_by }` |
| `hotlist.sent` | `{ hotlist_id, sent_to, sent_at, delivery_count }` |
| `hotlist.opened` | `{ hotlist_id, vendor_id, opened_at }` |
| `hotlist.downloaded` | `{ hotlist_id, vendor_id, downloaded_at }` |
| `hotlist.responded` | `{ hotlist_id, vendor_id, response_text, responded_at }` |
| `consultant.marketed` | `{ consultant_id, hotlist_id, marketed_at }` |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Hotlist Frequency | 2 per week | Weekly count |
| Email Open Rate | >50% | Opens / Sends |
| PDF Download Rate | >30% | Downloads / Sends |
| Response Rate | >5% | Responses / Sends |
| Submission Conversion | >10% | Submissions from hotlist / Total consultants |
| Placement from Hotlist | >15% | Placements from hotlist / Total consultants |

---

## Related Use Cases

- [02-manage-bench.md](./02-manage-bench.md) - Managing bench consultants
- [04-find-requirements.md](./04-find-requirements.md) - Finding external jobs for consultants
- [05-submit-bench-consultant.md](./05-submit-bench-consultant.md) - Submitting consultants from hotlist responses

---

*Last Updated: 2024-11-30*
