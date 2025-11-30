# Use Case: View Job Submissions

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-CAN-003 |
| Actor | Candidate Portal User |
| Goal | Track status of job applications and submissions |
| Frequency | Daily (active job seekers), 2-3x per week (passive) |
| Estimated Time | 2-5 minutes per session |
| Priority | High |

---

## Preconditions

1. User is logged in to Candidate Portal
2. User has submitted at least one job application OR been submitted by a recruiter
3. User has "candidate.submissions.view" permission (default for candidate_user)

---

## Trigger

One of the following:
- User wants to check application status
- Email notification about submission update received
- Weekly job search routine
- Interview scheduled notification
- Offer received notification
- Recruiter requested additional information

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Submissions

**User Action:** Click "My Applications" or "Submissions" in the main navigation

**System Response:**
- Navigation item highlights
- URL changes to: `/portal/submissions`
- Submissions list loads
- Loading skeleton shows for 200-500ms
- Filters and status tabs appear

**Screen State:**
```
+----------------------------------------------------------------+
| InTime Candidate Portal                    [🔔] [👤 John Doe] |
+----------------------------------------------------------------+
| [Dashboard] [My Profile] [●Applications] [Messages] [Settings] |
+----------------------------------------------------------------+
|                                                                 |
| My Applications                           Last updated: Just now|
+----------------------------------------------------------------+
| [Search applications...]                    [Filter ▼] [📊]    |
+----------------------------------------------------------------+
| ● Active (3) │ ○ Interview (2) │ ○ Offer (1) │ ○ All (8)      |
+----------------------------------------------------------------+
|                                                                 |
| Status    Job Title              Company      Updated   Stage  |
| ────────────────────────────────────────────────────────────── |
| 🟢 Active Senior SW Engineer     Google       2h ago    2 of 5 |
| 🟡 Review Staff Engineer         Stripe       1d ago    1 of 5 |
| 🔵 Phone  Lead Developer         Meta         3d ago    3 of 5 |
| 🟠 Onsite Engineering Manager    Apple        5d ago    4 of 5 |
| 🟢 Active Full Stack Engineer    Netflix      1w ago    2 of 5 |
|                                                                 |
| Showing 5 of 8 applications              [Load More] [View All]|
+----------------------------------------------------------------+
|                                                                 |
| QUICK STATS                                                     |
| ┌──────────────┬──────────────┬──────────────┬──────────────┐ |
| │ Applications │  Interviews  │   Offers     │ Avg Response  │ |
| │      8       │      2       │      1       │   2.5 days    │ |
| └──────────────┴──────────────┴──────────────┴──────────────┘ |
+----------------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: View Submission Details

**User Action:** Click on "Senior SW Engineer" at Google row

**System Response:**
- Row expands or navigates to detail page
- URL changes to: `/portal/submissions/{submission_id}`
- Detailed submission information loads
- Timeline shows all activities

**Screen State:**
```
+----------------------------------------------------------------+
| [← Back to Applications]         Senior Software Engineer      |
+----------------------------------------------------------------+
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ 🏢 Google                                  Status: ACTIVE │  |
| │ 📍 San Francisco, CA (Remote)                             │  |
| │ 💰 $110-130/hr · Contract · 6-12 months                   │  |
| │                                                            │  |
| │ Applied: Nov 28, 2024                                      │  |
| │ Last Updated: 2 hours ago                                  │  |
| │ Recruiter: Sarah Johnson (sarah@intime.com)               │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ APPLICATION PROGRESS                                       │  |
| │                                                            │  |
| │ ✓────●────○────○────○                                    │  |
| │ Applied Review Phone Onsite Offer                         │  |
| │                                                            │  |
| │ Current Stage: Under Review                               │  |
| │ Next Step: Phone screen with hiring manager              │  |
| │ Expected: Within 3-5 days                                 │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| ┌────────────────────────┬─────────────────────────────────┐  |
| │ JOB DETAILS            │ MY SUBMISSION                   │  |
| │                        │                                 │  |
| │ Required Skills:       │ Resume Submitted:               │  |
| │ • React                │ ✓ John_Doe_Resume_2024.pdf      │  |
| │ • Node.js              │                                 │  |
| │ • TypeScript           │ Cover Letter:                   │  |
| │ • AWS                  │ ✓ Included (View)               │  |
| │ • GraphQL              │                                 │  |
| │                        │ Availability:                   │  |
| │ Experience: 5-10 years │ Immediate (2 weeks notice)      │  |
| │                        │                                 │  |
| │ [View Full Job →]      │ Desired Rate: $120/hr           │  |
| │                        │                                 │  |
| │                        │ [View My Application →]         │  |
| └────────────────────────┴─────────────────────────────────┘  |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ TIMELINE                                          [Filter]│  |
| │                                                            │  |
| │ 🕐 2 hours ago                                            │  |
| │ Status Update: Recruiter Sarah added note                │  |
| │ "Client loved your profile! Setting up phone screen       │  |
| │  for next week."                                          │  |
| │                                                            │  |
| │ 🕐 Yesterday at 3:45 PM                                   │  |
| │ Submission: Your profile was submitted to Google          │  |
| │ Resume: John_Doe_Resume_2024.pdf                          │  |
| │                                                            │  |
| │ 🕐 Nov 28, 2024 at 10:22 AM                               │  |
| │ Application: You applied to this position                 │  |
| │ Source: Direct application via job board                  │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ MESSAGES (2)                                     [View All]│  |
| │                                                            │  |
| │ Sarah Johnson · 2 hours ago                               │  |
| │ "Hi John! Great news - the client wants to schedule a     │  |
| │  phone screen. Are you available next Tuesday or Wed..."  │  |
| │                                              [Reply]       │  |
| │                                                            │  |
| │ You · Yesterday                                           │  |
| │ "Thank you for submitting my profile! Looking forward..." │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| [Message Recruiter]  [Withdraw Application]  [Share Status]   |
+----------------------------------------------------------------+
```

**Time:** ~500ms

---

### Step 3: Check Interview Submissions

**User Action:** Click "Interview (2)" tab at top of submissions page

**System Response:**
- Filters submissions to show only those with scheduled interviews
- Interview cards display with date/time prominently

**Screen State:**
```
+----------------------------------------------------------------+
| My Applications                                                 |
+----------------------------------------------------------------+
| [Search applications...]                    [Filter ▼] [📊]    |
+----------------------------------------------------------------+
| ○ Active (3) │ ● Interview (2) │ ○ Offer (1) │ ○ All (8)      |
+----------------------------------------------------------------+
|                                                                 |
| UPCOMING INTERVIEWS (2)                                         |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ 📅 Tomorrow, Dec 1 at 10:00 AM PST                        │  |
| │ ───────────────────────────────────────────────────────   │  |
| │ PHONE SCREEN                                              │  |
| │ Lead Developer - Meta                                     │  |
| │                                                            │  |
| │ Interview Type: Phone Screen (45 min)                     │  |
| │ Interviewer: Michael Chen, Engineering Manager           │  |
| │ Call Link: [Join Zoom Meeting]                            │  |
| │ Phone: +1 (555) 234-5678 (backup)                         │  |
| │                                                            │  |
| │ 📋 Preparation:                                           │  |
| │ • Review job description                                  │  |
| │ • Prepare STAR stories about React projects              │  |
| │ • Questions about team structure                          │  |
| │                                                            │  |
| │ 📎 Documents Shared:                                      │  |
| │ • Your Resume: John_Doe_Resume_2024.pdf                   │  |
| │ • Job Description: Lead_Developer_Meta.pdf                │  |
| │                                                            │  |
| │ [Add to Calendar] [View Details] [Reschedule] [Cancel]   │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ 📅 Next Week, Dec 5 at 2:00 PM PST                        │  |
| │ ───────────────────────────────────────────────────────   │  |
| │ ON-SITE INTERVIEW                                         │  |
| │ Engineering Manager - Apple                               │  |
| │                                                            │  |
| │ Interview Type: Full Loop (4 hours)                       │  |
| │ Location: Apple Park, Cupertino, CA                       │  |
| │ Building: Main Campus, Conference Room 3B                 │  |
| │                                                            │  |
| │ Schedule:                                                  │  |
| │ 2:00 PM - Technical Round 1 (1 hr) - Jane Smith          │  |
| │ 3:00 PM - Technical Round 2 (1 hr) - Bob Wilson          │  |
| │ 4:00 PM - Behavioral (30 min) - Lisa Park                │  |
| │ 4:30 PM - Hiring Manager (1 hr) - Tom Anderson           │  |
| │                                                            │  |
| │ 📋 Preparation Tips:                                      │  |
| │ • Bring printed resume (5 copies)                         │  |
| │ • Government-issued ID required                           │  |
| │ • Laptop for coding exercise                              │  |
| │ • Plan to arrive 15 min early                             │  |
| │                                                            │  |
| │ 🗺️ [Get Directions] | 🚗 [Parking Info]                   │  |
| │                                                            │  |
| │ [Add to Calendar] [View Details] [Reschedule] [Cancel]   │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| COMPLETED INTERVIEWS (1)                         [Show/Hide ▼] |
+----------------------------------------------------------------+
```

**Time:** ~500ms

---

### Step 4: Add Interview to Calendar

**User Action:** Click "Add to Calendar" for Meta phone screen

**System Response:**
- Calendar format selector modal appears
- Options shown: Google Calendar, Outlook, Apple Calendar, iCal download

**Screen State:**
```
+----------------------------------------------------------------+
|               Add Interview to Calendar                    [×] |
+----------------------------------------------------------------+
|                                                                 |
| Select your calendar app:                                      |
|                                                                 |
| ┌────────────────────────────────────────────────────────┐    |
| │ 📅 Google Calendar                                [→] │    |
| └────────────────────────────────────────────────────────┘    |
|                                                                 |
| ┌────────────────────────────────────────────────────────┐    |
| │ 📅 Microsoft Outlook                              [→] │    |
| └────────────────────────────────────────────────────────┘    |
|                                                                 |
| ┌────────────────────────────────────────────────────────┐    |
| │ 📅 Apple Calendar                                 [→] │    |
| └────────────────────────────────────────────────────────┘    |
|                                                                 |
| ┌────────────────────────────────────────────────────────┐    |
| │ 💾 Download .ics file                             [↓] │    |
| └────────────────────────────────────────────────────────┘    |
|                                                                 |
| Event Details:                                                  |
| Title: Phone Screen - Lead Developer at Meta                   |
| Date: Dec 1, 2024 at 10:00 AM PST                              |
| Duration: 45 minutes                                            |
| Reminder: 30 minutes before                                     |
|                                                                 |
+----------------------------------------------------------------+
```

**User Action:** Click "Google Calendar"

**System Response:**
- Opens Google Calendar in new tab
- Pre-fills event with all details
- Interview details auto-populate
- Join link included in description

**Time:** ~2-3 seconds

---

### Step 5: View Offer Submissions

**User Action:** Click "Offer (1)" tab

**System Response:**
- Filters to show submissions with active offers
- Offer details prominently displayed

**Screen State:**
```
+----------------------------------------------------------------+
| My Applications                                                 |
+----------------------------------------------------------------+
| [Search applications...]                    [Filter ▼] [📊]    |
+----------------------------------------------------------------+
| ○ Active (3) │ ○ Interview (2) │ ● Offer (1) │ ○ All (8)      |
+----------------------------------------------------------------+
|                                                                 |
| ACTIVE OFFERS (1)                                               |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ 🎉 Congratulations! You have an offer!                    │  |
| │                                                            │  |
| │ Staff Software Engineer - Stripe                          │  |
| │ Offer Received: Nov 25, 2024                              │  |
| │ Response Deadline: Dec 9, 2024 (14 days remaining) ⏰     │  |
| │                                                            │  |
| │ ╔═══════════════════════════════════════════════════════╗ │  |
| │ ║ OFFER DETAILS                                         ║ │  |
| │ ╚═══════════════════════════════════════════════════════╝ │  |
| │                                                            │  |
| │ Contract Type: Contract-to-Hire                           │  |
| │ Duration: 6 months (with conversion option)               │  |
| │                                                            │  |
| │ 💰 Compensation:                                          │  |
| │    Hourly Rate: $125/hour                                 │  |
| │    Estimated Annual: ~$260,000 (based on 2080 hrs)        │  |
| │    Overtime: Time and a half after 40 hrs/week            │  |
| │                                                            │  |
| │ 📅 Start Date:                                            │  |
| │    Proposed: Dec 16, 2024                                 │  |
| │    Flexible: Can negotiate up to Jan 2, 2025             │  |
| │                                                            │  |
| │ 📍 Location:                                              │  |
| │    Primary: Remote (US-based)                             │  |
| │    Office Visits: Optional SF office access               │  |
| │                                                            │  |
| │ 🎁 Benefits (while on contract):                          │  |
| │    ✓ Health insurance stipend ($500/month)                │  |
| │    ✓ Paid holidays (10 days/year)                         │  |
| │    ✓ Sick leave (5 days/year)                             │  |
| │    ✓ Professional development ($2,000/year)               │  |
| │    ✓ Equipment provided (MacBook Pro, monitor)            │  |
| │                                                            │  |
| │ 🔄 Conversion Details (after 6 months):                   │  |
| │    • Full-time employee conversion available              │  |
| │    • Estimated FTE salary: $220,000-$250,000 + equity     │  |
| │    • Decision point: Month 5 performance review           │  |
| │                                                            │  |
| │ 📋 Next Steps:                                            │  |
| │    1. Review offer details carefully                      │  |
| │    2. Schedule call with recruiter if questions           │  |
| │    3. Accept or decline by Dec 9, 2024                    │  |
| │    4. If accepting: Complete background check             │  |
| │    5. Sign contract and onboarding docs                   │  |
| │                                                            │  |
| │ 📄 Documents:                                             │  |
| │    • [📥 Download Offer Letter (PDF)]                     │  |
| │    • [📥 Download Contract Template]                      │  |
| │    • [📥 Download Benefits Summary]                       │  |
| │                                                            │  |
| │ ────────────────────────────────────────────────────────  │  |
| │                                                            │  |
| │ Have questions about this offer?                          │  |
| │ [💬 Message Recruiter]  [📞 Schedule Call]                │  |
| │                                                            │  |
| │ Ready to decide?                                           │  |
| │ [✓ Accept Offer]  [✗ Decline Offer]  [⏸ Request Extension]│  |
| └──────────────────────────────────────────────────────────┘  |
+----------------------------------------------------------------+
```

**Time:** ~500ms

---

### Step 6: Download Offer Letter

**User Action:** Click "Download Offer Letter (PDF)"

**System Response:**
- PDF download initiates
- File downloads: "Stripe_Offer_Letter_John_Doe.pdf"
- Toast notification: "Offer letter downloaded"
- Download tracked in activity log

**Time:** ~1-2 seconds

---

### Step 7: Message Recruiter About Offer

**User Action:** Click "Message Recruiter" button

**System Response:**
- Message compose modal opens
- Recruiter pre-selected (Sarah Johnson)
- Subject pre-filled: "Question about Stripe offer"

**Screen State:**
```
+----------------------------------------------------------------+
|                  Message Your Recruiter                    [×] |
+----------------------------------------------------------------+
|                                                                 |
| To: Sarah Johnson (sarah@intime.com)                           |
|                                                                 |
| Subject: Question about Stripe offer                           |
|                                                                 |
| Message:                                                        |
| ┌────────────────────────────────────────────────────────┐    |
| │                                                         │    |
| │                                                         │    |
| │                                                         │    |
| │                                                         │    |
| │                                                         │    |
| │                                                         │    |
| └────────────────────────────────────────────────────────┘    |
|                                              0/2000 characters |
|                                                                 |
| Quick Templates:                                                |
| • I have questions about the benefits                          |
| • Can we schedule a call to discuss?                           |
| • I need more time to decide                                   |
| • I'd like to negotiate the rate                               |
|                                                                 |
| 📎 Attach File (optional)                                      |
|                                                                 |
|                                    [Cancel]  [Send Message →]  |
+----------------------------------------------------------------+
```

**User Action:** Type message: "Hi Sarah, I have a few questions about the health insurance stipend and the conversion timeline. Can we schedule a quick call this week?"

**User Action:** Click "Send Message →"

**System Response:**
- Message sends
- Modal closes
- Toast: "Message sent to Sarah Johnson"
- Message appears in conversation thread
- Recruiter receives notification

**Time:** ~30 seconds to compose, ~1 second to send

---

### Step 8: Filter Submissions by Company

**User Action:** Click "Filter ▼" button on submissions page

**System Response:**
- Filter dropdown opens with multiple filter options

**Screen State:**
```
+----------------------------------------------------------------+
| [Search applications...]           [●Filter ▼] [📊]            |
+----------------------------------------------------------------+
| ┌─ FILTERS ──────────────────────────────────────────────┐    |
| │                                                         │    |
| │ Status:                                                 │    |
| │ ☑ Active        ☑ Under Review   ☑ Interview           │    |
| │ ☑ Offer         ☐ Declined       ☐ Withdrawn           │    |
| │                                                         │    |
| │ Company:                                                │    |
| │ [Search companies...                              ▼]   │    |
| │                                                         │    |
| │ Job Type:                                               │    |
| │ ☑ Full-Time     ☑ Contract       ☑ Contract-to-Hire    │    |
| │ ☐ Part-Time     ☐ Temporary                            │    |
| │                                                         │    |
| │ Rate Range:                                             │    |
| │ Min: [$       ] /hr    Max: [$       ] /hr             │    |
| │                                                         │    |
| │ Applied Date:                                           │    |
| │ ○ Last 7 days   ○ Last 30 days   ○ Last 90 days       │    |
| │ ● All time      ○ Custom range: [____] to [____]      │    |
| │                                                         │    |
| │ Submission Source:                                      │    |
| │ ☑ Applied directly   ☑ Recruiter submitted             │    |
| │ ☑ Referral           ☐ Job board                       │    |
| │                                                         │    |
| │                        [Clear All]  [Apply Filters]    │    |
| └─────────────────────────────────────────────────────────┘    |
+----------------------------------------------------------------+
```

**User Action:** Click company search, type "Google", select "Google"

**User Action:** Click "Apply Filters"

**System Response:**
- Dropdown closes
- List filters to show only Google submissions
- Filter badge appears showing "Company: Google [×]"
- Count updates: "Showing 1 of 8 applications"

**Time:** ~5 seconds

---

### Step 9: View Submission Statistics

**User Action:** Click statistics icon [📊] in top right

**System Response:**
- Statistics dashboard modal opens
- Charts and metrics display

**Screen State:**
```
+----------------------------------------------------------------+
|                   Application Analytics                    [×] |
+----------------------------------------------------------------+
|                                                                 |
| Overview - Last 90 Days                                         |
|                                                                 |
| ┌──────────────┬──────────────┬──────────────┬──────────────┐ |
| │ Applications │  Response    │  Interview   │  Offer Rate  │ |
| │      8       │  Rate: 87%   │  Rate: 25%   │    12.5%     │ |
| │  +2 vs prev  │              │              │              │ |
| └──────────────┴──────────────┴──────────────┴──────────────┘ |
|                                                                 |
| Application Funnel:                                             |
| ┌────────────────────────────────────────────────────────┐    |
| │ Applied          ████████████████████████████ 8        │    |
| │ Submitted        ██████████████████████████   7        │    |
| │ Under Review     ███████████████████████      6        │    |
| │ Phone Screen     ████████                     2        │    |
| │ On-Site          ████                         1        │    |
| │ Offer            ██                           1        │    |
| └────────────────────────────────────────────────────────┘    |
|                                                                 |
| Applications by Status:                                         |
| 🟢 Active: 3 (37.5%)                                           |
| 🟡 Under Review: 2 (25%)                                       |
| 🔵 Interview: 2 (25%)                                          |
| 🟠 Offer: 1 (12.5%)                                            |
|                                                                 |
| Average Time in Each Stage:                                     |
| Applied → Submitted: 1.2 days                                  |
| Submitted → Review: 2.5 days                                   |
| Review → Phone: 5.3 days                                       |
| Phone → On-Site: 7.1 days                                      |
| On-Site → Offer: 4.2 days                                      |
|                                                                 |
| Top Companies Applied To:                                       |
| 1. FAANG companies: 4 applications                             |
| 2. Startups: 3 applications                                    |
| 3. Mid-size tech: 1 application                                |
|                                                                 |
| Most Successful Skills (in accepted applications):             |
| • React (5 matches)                                            |
| • Node.js (4 matches)                                          |
| • TypeScript (4 matches)                                       |
|                                                                 |
| Recommendations:                                                |
| 💡 Your response rate is excellent! (87% vs 65% average)       |
| 💡 Consider applying to 3-5 more positions to increase odds    |
| 💡 Your profile strength for "Senior Engineer" roles: 92%      |
|                                                                 |
|                                    [Export Data]  [Close]      |
+----------------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 10: Withdraw Application

**User Action:** Navigate back to Full Stack Engineer - Netflix submission

**User Action:** Click "Withdraw Application" button

**System Response:**
- Confirmation modal appears

**Screen State:**
```
+----------------------------------------------------------------+
|                   Withdraw Application                     [×] |
+----------------------------------------------------------------+
|                                                                 |
| Are you sure you want to withdraw your application?            |
|                                                                 |
| Job: Full Stack Engineer                                       |
| Company: Netflix                                                |
| Status: Active (Under Review)                                  |
|                                                                 |
| ⚠️  This action cannot be undone. Your application will be     |
| removed from the process and the recruiter will be notified.   |
|                                                                 |
| Reason for withdrawal (optional):                              |
| ┌────────────────────────────────────────────────────────┐    |
| │ [Select reason...                                   ▼] │    |
| └────────────────────────────────────────────────────────┘    |
|                                                                 |
| Options:                                                        |
| • Accepted another offer                                       |
| • No longer interested in position                             |
| • Compensation doesn't match expectations                      |
| • Location/remote policy doesn't work                          |
| • Timeline doesn't align with availability                     |
| • Company culture concerns                                     |
| • Other (please specify)                                       |
|                                                                 |
| Additional comments:                                            |
| ┌────────────────────────────────────────────────────────┐    |
| │                                                         │    |
| │                                                         │    |
| └────────────────────────────────────────────────────────┘    |
|                                              0/500 characters  |
|                                                                 |
|                                    [Cancel]  [Withdraw]        |
+----------------------------------------------------------------+
```

**User Action:** Select "Accepted another offer", click "Withdraw"

**System Response:**
- Modal closes
- API call `POST /api/trpc/submissions.withdraw`
- Submission status updates to "Withdrawn"
- Recruiter receives notification
- Toast: "Application withdrawn successfully"
- Application moves to "Withdrawn" filter section

**Time:** ~2-3 seconds

---

## Postconditions

1. ✅ User has viewed current status of all submissions
2. ✅ Interview calendar events created for upcoming interviews
3. ✅ Messages sent to recruiters logged in system
4. ✅ Offer letter downloaded and saved locally
5. ✅ Application withdrawal processed (if applicable)
6. ✅ Activity logged: "submissions.viewed"
7. ✅ Statistics and analytics updated
8. ✅ Read receipts marked for notifications

---

## Events Logged

| Event | Payload |
|-------|---------|
| `submission.viewed` | `{ candidate_id, submission_id, timestamp }` |
| `submission.offer_viewed` | `{ candidate_id, submission_id, offer_id, timestamp }` |
| `submission.offer_downloaded` | `{ candidate_id, submission_id, offer_id, file_name }` |
| `submission.message_sent` | `{ candidate_id, recruiter_id, submission_id, message }` |
| `submission.calendar_exported` | `{ candidate_id, interview_id, calendar_type }` |
| `submission.withdrawn` | `{ candidate_id, submission_id, reason, timestamp }` |
| `submission.statistics_viewed` | `{ candidate_id, date_range }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| No Submissions Found | User has not applied to any jobs | "You haven't applied to any jobs yet. Browse open positions to get started." | Link to job board |
| Submission Load Failed | API error | "Unable to load submissions. Please try again." | Retry button |
| Calendar Export Failed | External calendar API error | "Failed to add to calendar. Please try manual download." | Download .ics file |
| Offer Letter Download Failed | File not found or permissions issue | "Unable to download offer letter. Contact your recruiter." | Message recruiter |
| Message Send Failed | Network error | "Failed to send message. Please try again." | Retry |
| Withdrawal Failed | Submission already processed | "Cannot withdraw - submission status has changed" | Refresh page |
| Interview Details Unavailable | Interview not yet scheduled | "Interview details pending. You'll be notified when scheduled." | Check back later |

---

## Submission Status Definitions

| Status | Icon | Description | Candidate Actions Available |
|--------|------|-------------|----------------------------|
| Draft | 📝 | Application started but not submitted | Complete and submit, Delete |
| Submitted | ✉️ | Application submitted to recruiter | View, Withdraw |
| Under Review | 🟡 | Recruiter reviewing profile | View, Message recruiter, Withdraw |
| Submitted to Client | 📤 | Profile sent to hiring company | View, Message recruiter |
| Phone Screen | 📞 | Phone interview scheduled | View interview details, Reschedule, Prepare |
| Technical Assessment | 💻 | Coding/technical test scheduled | Take assessment, View instructions |
| On-Site Interview | 🏢 | In-person interviews scheduled | View schedule, Add to calendar, Get directions |
| Offer Extended | 🎉 | Formal offer received | Accept, Decline, Negotiate, Download offer |
| Offer Accepted | ✅ | Candidate accepted offer | View onboarding, Complete paperwork |
| Placement Active | 🟢 | Currently on assignment | View assignment details, Timesheets |
| Declined | ❌ | Candidate or client declined | View feedback (if available) |
| Withdrawn | 🔙 | Candidate withdrew application | None (archived) |
| Filled | ✔️ | Position filled by another candidate | None (archived) |

---

## Interview Types & Details

| Interview Type | Duration | Format | Preparation Time |
|----------------|----------|--------|------------------|
| Phone Screen | 30-45 min | Phone/Video call | 15-30 min |
| Technical Phone | 45-60 min | Video + screen share | 30-60 min |
| Coding Assessment | 60-90 min | Online platform | As needed |
| On-Site Round 1 | 45-60 min | In-person/Video | 30-60 min |
| On-Site Round 2 | 45-60 min | In-person/Video | 30-60 min |
| Behavioral | 30-45 min | In-person/Video | 30 min |
| Hiring Manager | 45-60 min | In-person/Video | 30 min |
| Executive Round | 30-45 min | In-person/Video | 60 min |

---

## Notification Preferences

**Candidates can configure notifications for:**

| Event | Email | SMS | Push | In-App |
|-------|-------|-----|------|--------|
| Application status change | ✓ | ○ | ✓ | ✓ |
| Interview scheduled | ✓ | ✓ | ✓ | ✓ |
| Interview reminder (1 day) | ✓ | ✓ | ✓ | ✓ |
| Interview reminder (1 hour) | ○ | ✓ | ✓ | ✓ |
| Offer received | ✓ | ✓ | ✓ | ✓ |
| Offer deadline reminder | ✓ | ✓ | ✓ | ✓ |
| Message from recruiter | ✓ | ○ | ✓ | ✓ |
| Document request | ✓ | ○ | ✓ | ✓ |

---

## Mobile View Optimizations

**Mobile-Specific Features:**
- Swipe left on submission card to reveal actions (Withdraw, Message, Share)
- Pull-to-refresh on submissions list
- Bottom navigation for quick filter switching
- Interview countdown timer on home screen widget
- One-tap call/join for upcoming interviews
- Native calendar integration
- Push notifications with action buttons

**Mobile Screen (Simplified):**
```
+--------------------------------+
| My Applications          [🔔]  |
+--------------------------------+
| Search...            [⚙️]      |
+--------------------------------+
| Active | Interview | Offer     |
+--------------------------------+
| 🔔 NEXT INTERVIEW              |
| Tomorrow 10:00 AM              |
| Phone Screen - Meta            |
| [Prepare] [Join] [Calendar]    |
+--------------------------------+
| Google                    2h   |
| Senior SW Engineer             |
| Under Review         [→]       |
+--------------------------------+
| Stripe                    1d   |
| Staff Engineer                 |
| Offer! Respond by Dec 9  [→]  |
+--------------------------------+
```

---

## Related Use Cases

- [01-portal-onboarding.md](./01-portal-onboarding.md) - Initial registration
- [02-manage-profile.md](./02-manage-profile.md) - Update candidate profile
- [04-prepare-interview.md](./04-prepare-interview.md) - Detailed interview preparation
- [05-manage-placement.md](./05-manage-placement.md) - After offer acceptance

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | View all submissions with valid data | Submissions list displays correctly |
| TC-002 | View submission with no applications | Empty state with "Browse Jobs" CTA |
| TC-003 | Filter submissions by status | Only matching submissions show |
| TC-004 | View interview details | All interview info displays |
| TC-005 | Add interview to Google Calendar | Calendar event created successfully |
| TC-006 | Download offer letter | PDF downloads correctly |
| TC-007 | Send message to recruiter | Message delivered and logged |
| TC-008 | Withdraw application | Status updates, recruiter notified |
| TC-009 | View submission statistics | Charts and metrics render |
| TC-010 | Mobile swipe to reveal actions | Actions menu appears |
| TC-011 | Filter by multiple criteria | AND logic applied correctly |
| TC-012 | Export statistics data | CSV downloads with correct data |

---

*Last Updated: 2024-11-30*
