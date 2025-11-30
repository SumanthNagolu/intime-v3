# Use Case: Schedule and Manage Interviews

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-CLI-003 |
| Actor | Client Portal User (Hiring Manager) |
| Goal | Schedule, confirm, reschedule interviews and submit feedback |
| Frequency | 3-8 times per week |
| Estimated Time | 3-10 minutes per interview |
| Priority | High |

---

## Preconditions

1. User is logged in as Client Portal User
2. User has "interview:schedule" and "interview:feedback" permissions
3. Candidate has been accepted for interview stage
4. Calendar integration configured (Google/Outlook) - optional but recommended

---

## Trigger

One of the following:
- Email notification: "Interview proposed for [Candidate Name]"
- Dashboard shows pending interview confirmations
- User clicks [Schedule Interview] from candidate review
- Recruiter requests interview scheduling
- Interview time proposed by coordinator

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Interviews

**User Action:** Click "Interviews" in navigation menu

**System Response:**
- URL changes to: `/client/interviews`
- Interviews page loads
- Default view: Calendar + List combo
- Tabs: Pending (3) | Upcoming (5) | Past (28)

**Screen State:**
```
+----------------------------------------------------------+
| Interviews                    [Calendar] [List]  [Filter]|
+----------------------------------------------------------+
| [Pending Confirmation (3)] [Upcoming (5)] [Past (28)]     |
+----------------------------------------------------------+
| December 2025                           [< Today >] [◀ ▶] |
+----------------------------------------------------------+
| Sun   Mon   Tue   Wed   Thu   Fri   Sat                  |
| ───   ───   ───   ───   ───   ───   ───                  |
|       27    28    29    30     1     2                    |
|                                🔔2    ✓2   ✓1             |
|  3     4     5     6     7     8     9                    |
|             ✓1                              ✓1            |
+----------------------------------------------------------+
| Pending Confirmations (Needs Your Action)                 |
+----------------------------------------------------------+
| 🔔 Sarah Miller - Technical Round                         |
|    Proposed: Dec 1, 2025 at 2:00 PM (Your timezone)      |
|    Duration: 60 minutes                                   |
|    Format: Video Call (Google Meet)                      |
|    For: Senior Software Engineer                         |
|    Proposed by: Amy Chen (Recruiter)                     |
|                                                           |
|    [✓ Confirm This Time] [📅 Propose New Times]          |
|    [View Candidate Profile]                               |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| 🔔 Alex Thompson - Hiring Manager Round                   |
|    Proposed: Dec 1, 2025 at 4:00 PM (Your timezone)      |
|    Duration: 45 minutes                                   |
|    Format: Video Call (Google Meet)                      |
|    For: Product Manager                                  |
|    Proposed by: Mike Ross (Recruiter)                    |
|    ⚠️ Pending since 2 days ago                            |
|                                                           |
|    [✓ Confirm This Time] [📅 Propose New Times]          |
|    [View Candidate Profile]                               |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| 🔔 David Lee - Final Round Panel                          |
|    Proposed: Dec 2, 2025 at 10:00 AM (Your timezone)     |
|    Duration: 90 minutes                                   |
|    Format: Video Call (Zoom)                             |
|    For: Senior Software Engineer                         |
|    Panel: You, Sarah (Tech Lead), Tom (CTO)              |
|    Proposed by: Amy Chen (Recruiter)                     |
|                                                           |
|    [✓ Confirm This Time] [📅 Propose New Times]          |
|    [View Candidate Profile]                               |
|                                                           |
+----------------------------------------------------------+
| Upcoming Confirmed Interviews                [View All →] |
+----------------------------------------------------------+
| ✓ Tomorrow - Dec 1, 2025                                  |
|                                                           |
|   2:00 PM - 3:00 PM                                       |
|   Sarah Miller - Technical Round                         |
|   Senior Software Engineer                                |
|   [Join Video Call] [Reschedule] [View Prep Materials]   |
|                                                           |
|   4:00 PM - 4:45 PM                                       |
|   Alex Thompson - Hiring Manager Round                    |
|   Product Manager                                         |
|   [Join Video Call] [Reschedule] [View Prep Materials]   |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 2: Review Pending Interview Request

**User Action:** Review first pending interview (Sarah Miller)

**System Response:**
- Shows proposed interview details
- Displays candidate name, role, time, format
- Shows who proposed (recruiter name)
- Action buttons highlighted

**Interview Details Displayed:**

| Field | Source | Display |
|-------|--------|---------|
| Candidate Name | `candidates.first_name + last_name` | "Sarah Miller" |
| Interview Type | `interviews.type` | "Technical Round" |
| Proposed Time | `interviews.proposed_time` | "Dec 1, 2025 at 2:00 PM" |
| Duration | `interviews.duration` | "60 minutes" |
| Format | `interviews.format` | "Video Call (Google Meet)" |
| Job Title | `jobs.title` | "Senior Software Engineer" |
| Proposed By | `users.first_name + last_name` | "Amy Chen (Recruiter)" |
| Days Pending | `NOW() - interviews.proposed_at` | "Proposed 5 hours ago" |

**Time:** ~15 seconds

---

### Step 3: Check Calendar Availability

**User Action:** Click [📅 Propose New Times] to check calendar

**System Response:**
- Calendar integration modal opens
- Shows user's calendar (if connected)
- Displays availability grid
- Can select multiple time slots

**Screen State:**
```
+----------------------------------------------------------+
| Schedule Interview: Sarah Miller                      [×] |
+----------------------------------------------------------+
| Technical Round - Senior Software Engineer               |
| Duration: 60 minutes                                      |
+----------------------------------------------------------+
| Your Calendar (Google Calendar connected ✓)              |
|                                                           |
| Week of Dec 1-7, 2025                           [◀ ▶]    |
+----------------------------------------------------------+
|        Mon 1   Tue 2   Wed 3   Thu 4   Fri 5             |
| 8 AM                                                      |
| 9 AM   ─────   [    ]  [    ]  [    ]  [    ]            |
| 10 AM  ─────   [    ]  Busy    [    ]  [    ]            |
| 11 AM  ─────   [    ]  Busy    [    ]  [    ]            |
| 12 PM  ─────   [    ]  [    ]  [    ]  [    ]            |
| 1 PM   ─────   [    ]  [    ]  [    ]  [    ]            |
| 2 PM   [✓✓✓]   [    ]  [    ]  Busy    [    ]            |
| 3 PM   Busy    [    ]  [    ]  Busy    [    ]            |
| 4 PM   [⚠⚠⚠]   [    ]  [    ]  [    ]  [    ]            |
| 5 PM   Busy    [    ]  [    ]  [    ]  [    ]            |
+----------------------------------------------------------+
| [✓✓✓] = Already proposed (Dec 1, 2:00 PM)                |
| [⚠⚠⚠] = Conflict with existing interview                 |
| Busy  = Calendar event exists                            |
| [   ] = Available slot                                   |
+----------------------------------------------------------+
| Selected Time Slots:                                      |
| ✓ Mon Dec 1, 2:00 PM - 3:00 PM (Proposed)                |
|                                                           |
| Add Alternative Times (optional):                         |
| [Click slots above to add alternatives]                  |
|                                                           |
| Interview Format:                                         |
| ⦿ Video Call   ○ Phone   ○ In-Person                     |
|                                                           |
| Video Platform:                                           |
| ⦿ Google Meet   ○ Zoom   ○ Microsoft Teams               |
|                                                           |
| Additional Attendees (optional):                          |
| [+ Add team member]                                       |
|                                                           |
| Notes for Candidate:                                      |
| [Looking forward to discussing your experience with      ]|
| [React and microservices architecture.                   ]|
|                                               ] 80/500    |
|                                                           |
+----------------------------------------------------------+
|              [Cancel]  [✓ Confirm Interview]              |
+----------------------------------------------------------+
```

**Time:** ~30 seconds

---

### Step 4: Confirm Interview Time

**User Action:** Click [✓ Confirm This Time] (for proposed time)

**System Response:**
- Confirmation dialog appears
- Shows summary of interview details
- Requests final confirmation

**Confirmation Dialog:**
```
+----------------------------------------------------------+
| Confirm Interview                                     [×] |
+----------------------------------------------------------+
| You are confirming:                                       |
|                                                           |
| 👤 Candidate: Sarah Miller                                |
| 📋 Position: Senior Software Engineer                     |
| 🎯 Type: Technical Round                                  |
| 📅 Date: Monday, December 1, 2025                         |
| ⏰ Time: 2:00 PM - 3:00 PM                                |
| 🌍 Timezone: Pacific Time (PT)                            |
| 🎥 Format: Video Call (Google Meet)                       |
|                                                           |
| Calendar Actions:                                         |
| ☑ Add to my Google Calendar                               |
| ☑ Send calendar invite to candidate                       |
| ☑ Send reminder 1 day before                              |
| ☑ Send reminder 1 hour before                             |
|                                                           |
| Notifications:                                            |
| ✓ Candidate will receive email confirmation               |
| ✓ Recruiter will be notified                              |
| ✓ Video call link will be generated                       |
|                                                           |
+----------------------------------------------------------+
|              [Go Back]  [✓ Confirm Interview]             |
+----------------------------------------------------------+
```

**User Action:** Click [✓ Confirm Interview]

**System Response:**
1. Button shows loading spinner
2. API call: `POST /api/client/interviews/{id}/confirm`
3. Success animation plays
4. Toast: "Interview confirmed! Calendar invite sent."
5. Email sent to:
   - Candidate (Sarah Miller)
   - Recruiter (Amy Chen)
   - User (confirmation)
6. Calendar event created in Google Calendar
7. Video call link generated (Google Meet)
8. Dialog closes
9. Interview moves to "Upcoming" tab
10. "Pending Confirmations" count decreases (3 → 2)

**Time:** ~3-5 seconds

---

### Step 5: View Upcoming Interviews

**User Action:** Click [Upcoming (5)] tab

**System Response:**
- Tab switches to upcoming confirmed interviews
- Shows chronological list
- Today's interviews highlighted at top

**Screen State:**
```
+----------------------------------------------------------+
| [Pending (2)] [Upcoming (5)] [Past (28)]                  |
+----------------------------------------------------------+
| Today - November 30, 2025                                 |
+----------------------------------------------------------+
| No interviews scheduled for today                         |
|                                                           |
+----------------------------------------------------------+
| Tomorrow - December 1, 2025                               |
+----------------------------------------------------------+
|                                                           |
| ⏰ 2:00 PM - 3:00 PM                 Confirmed ✓          |
| ┌────────────────────────────────────────────────────┐   |
| │ Sarah Miller - Technical Round                      │   |
| │ Senior Software Engineer                            │   |
| │                                                     │   |
| │ 🎥 Video Call: Google Meet                          │   |
| │ 📎 Prep Materials: Resume, Take-home project        │   |
| │ 📝 Interview Guide: Technical skills assessment     │   |
| │                                                     │   |
| │ [🎥 Join Video Call] [📋 View Prep] [🔄 Reschedule] │   |
| └────────────────────────────────────────────────────┘   |
|                                                           |
| ⏰ 4:00 PM - 4:45 PM                 Confirmed ✓          |
| ┌────────────────────────────────────────────────────┐   |
| │ Alex Thompson - Hiring Manager Round                │   |
| │ Product Manager                                     │   |
| │                                                     │   |
| │ 🎥 Video Call: Google Meet                          │   |
| │ 📎 Prep Materials: Resume, Portfolio                │   |
| │ 📝 Interview Guide: Product management scenarios    │   |
| │                                                     │   |
| │ [🎥 Join Video Call] [📋 View Prep] [🔄 Reschedule] │   |
| └────────────────────────────────────────────────────┘   |
|                                                           |
+----------------------------------------------------------+
| Monday - December 2, 2025                                 |
+----------------------------------------------------------+
|                                                           |
| ⏰ 10:00 AM - 11:30 AM               Confirmed ✓          |
| ┌────────────────────────────────────────────────────┐   |
| │ David Lee - Final Round Panel Interview            │   |
| │ Senior Software Engineer                            │   |
| │                                                     │   |
| │ 🎥 Video Call: Zoom                                 │   |
| │ 👥 Panel: You, Sarah Chen, Tom Wilson               │   |
| │ 📎 Prep Materials: Resume, Code samples             │   |
| │ 📝 Interview Guide: System design + culture fit     │   |
| │                                                     │   |
| │ [🎥 Join Video Call] [📋 View Prep] [🔄 Reschedule] │   |
| └────────────────────────────────────────────────────┘   |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~10 seconds

---

### Step 6: Access Prep Materials

**User Action:** Click [📋 View Prep] for Sarah Miller interview

**System Response:**
- Prep materials modal opens
- Shows all relevant documents and guides

**Screen State:**
```
+----------------------------------------------------------+
| Interview Prep: Sarah Miller                          [×] |
+----------------------------------------------------------+
| Technical Round - Senior Software Engineer               |
| Tomorrow, Dec 1 at 2:00 PM                                |
+----------------------------------------------------------+
| [Candidate Info] [Interview Guide] [Questions] [Notes]   |
+----------------------------------------------------------+
| Candidate Information                                     |
|                                                           |
| 👤 Sarah Miller                                           |
| 📧 sarah.miller@email.com                                 |
| 📱 (555) 987-6543                                         |
| 📍 San Francisco, CA                                      |
|                                                           |
| 📄 Resume                              [View] [Download]  |
| 💻 GitHub Profile                      [View]             |
| 💼 LinkedIn                            [View]             |
| 🔗 Portfolio Website                   [View]             |
|                                                           |
| Key Skills to Assess:                                     |
| • React (Expert level required)                           |
| • Node.js (Advanced level required)                       |
| • AWS (Intermediate level acceptable)                     |
| • System Design                                           |
|                                                           |
| Pre-Screen Summary (from Recruiter):                      |
| ─────────────────────────────────────────────────────────|
| Amy Chen - Nov 29, 2025                                   |
|                                                           |
| Sarah has 7 years of experience with React and Node.js.   |
| She recently built a real-time dashboard handling 100k+   |
| concurrent users. Strong technical skills, good           |
| communicator. Passed coding assessment (92/100).          |
|                                                           |
| Areas to probe:                                           |
| - AWS architecture experience (seemed light on details)   |
| - Team leadership experience                              |
| - Handling production incidents                           |
|                                                           |
+----------------------------------------------------------+
```

**User Action:** Click [Interview Guide] tab

**System Response:**
- Shows structured interview guide
- Questions organized by category
- Scoring rubric provided

**Screen State:**
```
+----------------------------------------------------------+
| [Candidate Info] [Interview Guide] [Questions] [Notes]   |
+----------------------------------------------------------+
| Technical Round Interview Guide                           |
| Duration: 60 minutes                                      |
+----------------------------------------------------------+
| Interview Structure                                       |
|                                                           |
| ⏱️ 0-5 min    Introduction & Icebreaker                   |
| ⏱️ 5-15 min   Technical Background Discussion             |
| ⏱️ 15-40 min  Technical Deep Dive & Problem Solving       |
| ⏱️ 40-50 min  System Design Discussion                    |
| ⏱️ 50-55 min  Candidate Questions                         |
| ⏱️ 55-60 min  Next Steps & Wrap-up                        |
|                                                           |
+----------------------------------------------------------+
| Key Competencies to Assess                                |
+----------------------------------------------------------+
| ☐ Technical Depth (React/Node.js)        Weight: 30%     |
| ☐ Problem Solving Ability                Weight: 25%     |
| ☐ System Design Thinking                 Weight: 20%     |
| ☐ Communication Skills                   Weight: 15%     |
| ☐ Cultural Fit                           Weight: 10%     |
|                                                           |
+----------------------------------------------------------+
| Sample Questions                        [View All →]      |
+----------------------------------------------------------+
| Technical Depth:                                          |
| 1. Describe your most complex React application. What     |
|    challenges did you face and how did you solve them?    |
|                                                           |
| 2. Explain how you would optimize a slow-rendering        |
|    React component. Walk me through your debugging steps. |
|                                                           |
| Problem Solving:                                          |
| 3. [Coding Problem] Implement a debounce function in      |
|    JavaScript. Discuss time/space complexity.             |
|                                                           |
| System Design:                                            |
| 4. Design a real-time notification system for 1M users.   |
|    What technologies would you use and why?               |
|                                                           |
| [View Full Question Bank (25 questions)]                  |
|                                                           |
+----------------------------------------------------------+
| Scoring Rubric                                            |
+----------------------------------------------------------+
| 5 - Outstanding: Exceeds expectations, hire immediately   |
| 4 - Strong: Meets all requirements, recommend hire        |
| 3 - Acceptable: Meets most requirements, borderline       |
| 2 - Weak: Does not meet requirements, likely reject       |
| 1 - Poor: Definitely reject                               |
|                                                           |
+----------------------------------------------------------+
|                       [Close]  [Print Guide]              |
+----------------------------------------------------------+
```

**Time:** ~2-3 minutes

---

### Step 7: Join Interview (Day Of)

**User Action:** On Dec 1 at 1:55 PM, click [🎥 Join Video Call]

**System Response:**
- Pre-join checklist appears
- Camera/mic test available
- Countdown timer shown (if early)

**Screen State:**
```
+----------------------------------------------------------+
| Join Interview: Sarah Miller                          [×] |
+----------------------------------------------------------+
| Technical Round starts in 5 minutes                       |
+----------------------------------------------------------+
| Pre-Join Checklist                                        |
|                                                           |
| ✓ Camera working                          [Test Camera]  |
| ✓ Microphone working                      [Test Mic]     |
| ✓ Audio output working                    [Test Audio]   |
| ✓ Internet connection stable (50 Mbps)                   |
| ✓ Interview guide ready                   [View Guide]   |
| ⚠️ Background noisy - find quiet space                    |
|                                                           |
| Quick Reminders:                                          |
| • Duration: 60 minutes (2:00 PM - 3:00 PM)                |
| • Format: Technical assessment                            |
| • Focus areas: React, Node.js, System Design              |
| • Feedback due within 24 hours                            |
|                                                           |
| Interview will automatically record (with consent)        |
|                                                           |
+----------------------------------------------------------+
|              [Test Setup]  [Join Video Call Now]          |
+----------------------------------------------------------+
```

**User Action:** Click [Join Video Call Now]

**System Response:**
- Opens Google Meet link in new tab/window
- Meeting room loads
- Candidate joins (or waiting room if early)
- Interview begins

**Time:** ~1-2 minutes

---

### Step 8: Submit Interview Feedback (After Interview)

**User Action:** After interview ends, click [Submit Feedback] link

**System Response:**
- Feedback form modal opens
- Shows interview details at top
- Form fields for structured feedback

**Screen State:**
```
+----------------------------------------------------------+
| Interview Feedback: Sarah Miller                      [×] |
+----------------------------------------------------------+
| Technical Round - Senior Software Engineer               |
| Conducted: Dec 1, 2025 at 2:00 PM - 3:00 PM               |
| Duration: 60 minutes                                      |
+----------------------------------------------------------+
| Overall Recommendation *                                  |
+----------------------------------------------------------+
| ⦿ Strong Hire (5/5)     - Exceeds all expectations        |
| ○ Hire (4/5)            - Meets all requirements          |
| ○ Maybe/Borderline (3/5)- On the fence                    |
| ○ No Hire (2/5)         - Does not meet requirements      |
| ○ Strong No (1/5)       - Definitely reject               |
|                                                           |
+----------------------------------------------------------+
| Competency Ratings *                                      |
+----------------------------------------------------------+
| Technical Depth (React/Node.js)                           |
| [★★★★★] 5/5  Expert level demonstrated                    |
|                                                           |
| Problem Solving Ability                                   |
| [★★★★☆] 4/5  Strong analytical thinking                   |
|                                                           |
| System Design Thinking                                    |
| [★★★★☆] 4/5  Good architectural understanding             |
|                                                           |
| Communication Skills                                      |
| [★★★★★] 5/5  Excellent communicator                       |
|                                                           |
| Cultural Fit                                              |
| [★★★★★] 5/5  Great culture match                          |
|                                                           |
+----------------------------------------------------------+
| Detailed Feedback *                                       |
+----------------------------------------------------------+
| Strengths:                                                |
| [Sarah demonstrated exceptional React knowledge. She     ]|
| [explained complex state management patterns clearly and  ]|
| [solved the coding problem efficiently. Her experience    ]|
| [with building real-time dashboards is directly relevant. ]|
| [Great communicator and collaborative mindset.            ]|
|                                               ] 250/2000   |
|                                                           |
| Areas for Development / Concerns:                         |
| [AWS knowledge is more theoretical than hands-on. She    ]|
| [hasn't led major cloud migrations. This could be addressed]|
| [with some mentorship from our DevOps team.               ]|
|                                               ] 120/2000   |
|                                                           |
| Key Takeaways / Notes:                                    |
| [- Solved the debounce problem in 8 minutes (impressive) ]|
| [- Designed notification system with Redis pub/sub        ]|
| [- Asked great questions about our tech stack             ]|
| [- Very interested in joining the team                    ]|
|                                               ] 180/1000   |
|                                                           |
+----------------------------------------------------------+
| Next Steps Recommendation *                               |
+----------------------------------------------------------+
| ⦿ Proceed to next round (Hiring Manager interview)        |
| ○ Move to offer stage                                     |
| ○ Reject                                                  |
| ○ Hold/Needs discussion                                   |
|                                                           |
| If proceeding, suggested next round:                      |
| ☑ Hiring Manager Round (with you)                         |
| ☐ Team Fit Round                                          |
| ☐ Executive Round                                         |
|                                                           |
+----------------------------------------------------------+
| Interview Recording                                       |
+----------------------------------------------------------+
| 📹 Recording available                    [View] [Download]|
| Duration: 58 minutes                                      |
| Uploaded: Dec 1, 2025 at 3:05 PM                          |
|                                                           |
| ⚠️ Reminder: Recordings auto-delete after 30 days         |
|                                                           |
+----------------------------------------------------------+
| Internal Notes (Not shared with candidate/recruiter)      |
+----------------------------------------------------------+
| [Check references before final offer. Seems great but    ]|
| [want to verify AWS cloud experience claims.              ]|
|                                               ] 75/500     |
|                                                           |
+----------------------------------------------------------+
|              [Save Draft]  [Submit Feedback]              |
+----------------------------------------------------------+
```

**Time:** ~5-8 minutes

---

### Step 9: Submit Feedback

**User Action:** Click [Submit Feedback] button

**System Response:**
1. Validates all required fields
2. Shows confirmation dialog
3. On confirm:
   - API call: `POST /api/client/interviews/{id}/feedback`
   - Success toast: "Feedback submitted successfully"
   - Email sent to recruiter with summary
   - Candidate status updated: "interviewing" → "in_review"
   - If "Proceed to next round" selected:
     - Next interview automatically queued
     - Recruiter notified to schedule
   - Modal closes
   - Interview moves to "Past" tab with "Feedback Submitted ✓"

**Validation Rules:**

| Field | Rule | Error Message |
|-------|------|---------------|
| Overall Recommendation | Required | "Please select an overall recommendation" |
| Competency Ratings | All 5 required | "Please rate all competencies" |
| Strengths | Min 50 chars | "Please provide detailed strengths (at least 50 characters)" |
| Next Steps | Required | "Please indicate next steps" |

**Time:** ~2-3 seconds

---

### Step 10: Reschedule Interview (Alternative Flow)

**User Action:** Click [🔄 Reschedule] on upcoming interview

**System Response:**
- Reschedule modal opens
- Shows current time
- Asks for reason
- Provides new time selection

**Screen State:**
```
+----------------------------------------------------------+
| Reschedule Interview: Alex Thompson                   [×] |
+----------------------------------------------------------+
| Current Schedule:                                         |
| Dec 1, 2025 at 4:00 PM - 4:45 PM (Tomorrow)               |
+----------------------------------------------------------+
| Reason for Rescheduling *                                 |
+----------------------------------------------------------+
| ⦿ Conflict - have another meeting                         |
| ○ Emergency / Unexpected issue                            |
| ○ Need more preparation time                              |
| ○ Candidate requested change                              |
| ○ Other (specify below)                                   |
|                                                           |
| Additional Details:                                       |
| [Double-booked with executive meeting that just got      ]|
| [scheduled. Apologies for the inconvenience.              ]|
|                                               ] 80/500     |
|                                                           |
+----------------------------------------------------------+
| Propose New Time *                                        |
+----------------------------------------------------------+
| Your Available Times (select multiple):                   |
|                                                           |
| Dec 2 (Tuesday):                                          |
| ☑ 2:00 PM - 2:45 PM                                       |
| ☑ 4:00 PM - 4:45 PM                                       |
|                                                           |
| Dec 3 (Wednesday):                                        |
| ☑ 10:00 AM - 10:45 AM                                     |
| ☐ 3:00 PM - 3:45 PM                                       |
|                                                           |
| [Load More Dates]                                         |
|                                                           |
| Or enter specific date/time:                              |
| Date: [MM/DD/YYYY 📅]  Time: [HH:MM AM/PM]                |
|                                                           |
+----------------------------------------------------------+
| Notifications:                                            |
| ✓ Candidate will be notified of reschedule request        |
| ✓ Recruiter will coordinate new time                      |
| ✓ Original calendar event will be cancelled               |
|                                                           |
+----------------------------------------------------------+
|              [Cancel]  [Request Reschedule]               |
+----------------------------------------------------------+
```

**User Action:** Select new times and click [Request Reschedule]

**System Response:**
1. API call: `POST /api/client/interviews/{id}/reschedule`
2. Original calendar event cancelled
3. Notifications sent:
   - Candidate: "Interview rescheduled by hiring manager"
   - Recruiter: "Please coordinate new time with candidate"
4. Interview status: "confirmed" → "rescheduling"
5. Interview appears in "Pending Confirmations"
6. Toast: "Reschedule request sent. Recruiter will coordinate."

**Time:** ~2-3 minutes

---

## Postconditions

1. ✅ Interview scheduled and confirmed in system
2. ✅ Calendar event created in user's calendar
3. ✅ Candidate notified via email with calendar invite
4. ✅ Video call link generated and shared
5. ✅ Recruiter notified of confirmation
6. ✅ Interview feedback submitted (after interview)
7. ✅ Candidate status updated based on feedback
8. ✅ Next round triggered (if applicable)
9. ✅ Activity logged for analytics

---

## Events Logged

| Event | Payload |
|-------|---------|
| `interview.confirmed` | `{ interview_id, candidate_id, client_user_id, scheduled_time, timestamp }` |
| `interview.rescheduled` | `{ interview_id, old_time, new_time, reason, timestamp }` |
| `interview.feedback_submitted` | `{ interview_id, overall_rating, next_steps, timestamp }` |
| `interview.joined` | `{ interview_id, user_id, join_time }` |
| `notification.sent` | `{ recipient: candidate_id, type: 'interview_confirmed', timestamp }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Calendar Conflict | Time already booked | "You have another meeting at this time" | Show alternative times |
| Interview Cancelled | Candidate withdrew | "This interview has been cancelled" | Remove from list |
| Video Link Failed | Platform API error | "Unable to generate video link" | [Retry] or enter manual link |
| Feedback Too Early | Submitted before interview | "Interview hasn't occurred yet" | Disable submit until after |
| Network Error | Connection lost | "Failed to confirm interview" | [Retry] button |
| Permission Denied | User not authorized | "You cannot schedule interviews for this job" | Contact admin |

---

## Alternative Flows

### A1: Propose Multiple Times (No Calendar Integration)

If calendar not connected:

1. User selects "Propose New Times"
2. Manual date/time picker shown
3. User enters 3-5 available slots
4. Recruiter coordinates with candidate
5. Once agreed, recruiter confirms final time

### A2: Panel Interview Coordination

If multiple interviewers:

1. System finds common availability (if calendars connected)
2. Shows overlap windows
3. User selects time when all available
4. All panelists receive calendar invite
5. Each can accept/decline

### A3: Emergency Cancellation

If interview must be cancelled (not rescheduled):

1. User clicks [Cancel Interview]
2. Reason required (dropdown + text)
3. Confirmation: "Are you sure? Candidate will be notified."
4. If confirmed:
   - Interview cancelled
   - Candidate status reverted
   - All parties notified
   - Calendar event deleted

### A4: Interview No-Show

If candidate doesn't show up:

1. User waits 15 minutes
2. Clicks [Mark as No-Show]
3. Reason: "Candidate did not join"
4. System asks: "Reschedule or Reject candidate?"
5. If reschedule: Opens reschedule flow
6. If reject: Candidate marked "no_show" → "rejected"

---

## Calendar Integration Details

### Supported Platforms

| Platform | OAuth | Webhook Support | Features |
|----------|-------|-----------------|----------|
| Google Calendar | ✓ | ✓ | Full (create, update, delete, sync) |
| Microsoft Outlook | ✓ | ✓ | Full (create, update, delete, sync) |
| Apple Calendar (CalDAV) | ✓ | ✗ | Limited (create, update, no sync) |
| Generic iCal | ✗ | ✗ | Export only (.ics file) |

### Integration Features

**Real-time Sync:**
- User's availability pulled every 5 minutes
- Conflicts detected automatically
- Changes to InTime interviews push to calendar
- Changes in calendar reflect in InTime (webhook)

**Smart Scheduling:**
- Suggest times based on historical patterns
- Avoid back-to-back interviews (add buffer)
- Respect working hours (9 AM - 6 PM default)
- Timezone-aware scheduling

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `C` | Confirm selected interview |
| `R` | Reschedule selected interview |
| `F` | Submit feedback for completed interview |
| `J` | Join video call (if within 15 min window) |
| `P` | View prep materials |
| `Esc` | Close modal |
| `←` / `→` | Navigate between interviews |

---

## Related Use Cases

- [01-portal-dashboard.md](./01-portal-dashboard.md) - Dashboard shows pending interviews
- [02-review-candidates.md](./02-review-candidates.md) - Accept candidate → triggers scheduling
- [04-manage-placements.md](./04-manage-placements.md) - Successful interview → placement

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Confirm proposed interview | Status updated, calendar event created |
| TC-002 | Propose new time with calendar integration | Conflicts detected, alternatives shown |
| TC-003 | Join interview 5 min early | Pre-join checklist shown |
| TC-004 | Submit feedback without rating | Validation error shown |
| TC-005 | Reschedule confirmed interview | Original cancelled, new proposed |
| TC-006 | Submit feedback recommending next round | Next interview auto-queued |
| TC-007 | Calendar integration disconnected | Manual time entry fallback |
| TC-008 | Panel interview with 3 people | All receive invites, common time found |
| TC-009 | Mark candidate as no-show | Status updated, options presented |
| TC-010 | Download interview recording | File downloads correctly |

---

*Last Updated: 2025-11-30*
