# Use Case: Review Submitted Candidates

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-CLI-002 |
| Actor | Client Portal User (Hiring Manager) |
| Goal | Review candidates submitted by recruiters and provide feedback/decisions |
| Frequency | 5-10 times per week |
| Estimated Time | 5-15 minutes per candidate |
| Priority | Critical |

---

## Preconditions

1. User is logged in as Client Portal User
2. User has "candidate:view" and "candidate:feedback" permissions
3. At least one candidate has been submitted for user's jobs
4. Job is in "active" status

---

## Trigger

One of the following:
- Email notification: "New candidate submitted for [Job Title]"
- Dashboard shows new submissions in "Recent Submissions" widget
- User navigates to Candidates page to review pending submissions
- Push notification (mobile app)
- Daily digest email

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Candidates

**User Action:** Click "Candidates" in navigation menu

**System Response:**
- URL changes to: `/client/candidates`
- Candidates list page loads
- Default filter: "Pending Review" (status = submitted)
- List shows candidates awaiting client review

**Screen State:**
```
+----------------------------------------------------------+
| Candidates                    [Search...] [Filter ▼] [⚙] |
+----------------------------------------------------------+
| Filter: [Pending Review ▼]    Sort: [Newest First ▼]     |
+----------------------------------------------------------+
| Status Tabs:                                              |
| ● Pending Review (8) │ ○ Interviewing (5) │ ○ All (23)   |
+----------------------------------------------------------+
| Candidate            Job               Submitted   Rating|
| ─────────────────────────────────────────────────────────|
| 👤 John Martinez     Sr. SW Engineer   2 hours ago ★★★★★ |
|    React, Node.js, AWS                Recruiter: Amy Chen|
|    [Quick Review] [View Full Profile]                    |
|                                                           |
| 👤 Lisa Wang         Product Manager   5 hours ago ★★★★☆ |
|    Agile, Product Strategy            Recruiter: Mike Ross|
|    [Quick Review] [View Full Profile]                    |
|                                                           |
| 👤 Robert Johnson    DevOps Engineer   1 day ago   ★★★☆☆ |
|    Docker, K8s, Jenkins               Recruiter: Amy Chen|
|    [Quick Review] [View Full Profile]                    |
|                                                           |
+----------------------------------------------------------+
| Showing 3 of 8 pending reviews               [Load More] |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 2: Select Candidate to Review

**User Action:** Click [View Full Profile] on "John Martinez"

**System Response:**
- Modal slides in from right (full-height)
- Shows comprehensive candidate profile
- Resume viewer embedded
- Skills match visualization
- Recruiter notes displayed

**Screen State:**
```
+----------------------------------------------------------+
|                                  [← Back to List]    [×]  |
| Candidate Review: John Martinez                           |
+----------------------------------------------------------+
| Submitted: 2 hours ago           For: Sr. Software Engineer|
| Recruiter: Amy Chen              Rating: ★★★★★ (Excellent)|
+----------------------------------------------------------+
| [Overview] [Resume] [Skills] [Experience] [Notes]         |
+----------------------------------------------------------+
| Overview                                                  |
|                                                           |
| 👤 John Martinez                                          |
| 📧 john.martinez@email.com                                |
| 📱 (555) 123-4567                                         |
| 📍 San Francisco, CA                                      |
| 💰 Rate Expectation: $95-105/hr                           |
| 📅 Availability: Immediate (2 weeks notice)               |
|                                                           |
| Quick Stats                                               |
| +------------------+  +------------------+                |
| | Total Experience |  | Relevant Exp.    |                |
| |    8 years       |  |    6 years       |                |
| +------------------+  +------------------+                |
| | Education        |  | Work Auth        |                |
| | BS Computer Sci  |  | US Citizen ✓     |                |
| +------------------+  +------------------+                |
|                                                           |
+----------------------------------------------------------+
| Skills Match                                  92% Match ✓ |
+----------------------------------------------------------+
| Required Skills (Must Have)                               |
| ✅ React          [████████████░] 95% Expert              |
| ✅ Node.js        [█████████████] 98% Expert              |
| ✅ AWS            [██████████░░░] 85% Advanced            |
|                                                           |
| Nice-to-Have Skills                                       |
| ✅ TypeScript     [████████████░] 90% Expert              |
| ✅ GraphQL        [█████████░░░░] 75% Intermediate        |
| ❌ Docker         [████░░░░░░░░░] 40% Basic (gap)         |
|                                                           |
| Additional Skills                                         |
| • PostgreSQL (Advanced)                                   |
| • MongoDB (Intermediate)                                  |
| • CI/CD (GitHub Actions, Jenkins)                         |
| • Agile/Scrum                                             |
+----------------------------------------------------------+
| Recruiter's Assessment                                    |
+----------------------------------------------------------+
| ⭐⭐⭐⭐⭐ Excellent Match (5/5)                               |
|                                                           |
| "John is an exceptional full-stack engineer with strong   |
| React and Node.js expertise. He recently led a migration  |
| of a monolith to microservices at his current company,    |
| reducing load times by 40%. He's articulate, passionate   |
| about clean code, and would be a great cultural fit.      |
|                                                           |
| Phone screen went very well - he answered all technical   |
| questions confidently and showed genuine interest in      |
| your product. Available to start in 2 weeks."             |
|                                                           |
| Pre-screen Date: Nov 29, 2025                             |
| Technical Assessment: Passed (87/100)                     |
+----------------------------------------------------------+
| [View Resume] [Download PDF] [View LinkedIn Profile]     |
+----------------------------------------------------------+
| Your Decision                                             |
+----------------------------------------------------------+
| ○ Accept for Interview                                    |
|   [Select interview type ▼]                               |
|   □ Technical Round   □ Hiring Manager Round              |
|   □ Team Fit Round    □ Executive Round                   |
|                                                           |
| ○ Reject                                                  |
|   [Select reason ▼]                                       |
|   - Not enough experience                                 |
|   - Skills mismatch                                       |
|   - Rate too high                                         |
|   - Location/availability                                 |
|   - Other (specify below)                                 |
|                                                           |
| ○ Request More Information                                |
|   [What do you need? _________________________]           |
|                                                           |
| Feedback/Notes (visible to recruiter)                     |
| [                                                      ]  |
| [                                                      ]  |
|                                               ] 0/1000    |
|                                                           |
| Internal Notes (private, not shared)                      |
| [                                                      ]  |
|                                               ] 0/500     |
|                                                           |
+----------------------------------------------------------+
|              [Cancel]  [Save Draft]  [Submit Decision]    |
+----------------------------------------------------------+
```

**Time:** ~5 seconds

---

### Step 3: Review Overview Tab

**User Action:** Review candidate overview section (default view)

**System Response:**
- Shows summary information
- Contact details displayed
- Rate expectation shown
- Availability status

**Overview Data Fields:**

| Field | Source | Display Format |
|-------|--------|----------------|
| Full Name | `candidates.first_name + last_name` | "John Martinez" |
| Email | `candidates.email` | "john.martinez@email.com" |
| Phone | `candidates.phone` | "(555) 123-4567" |
| Location | `candidates.location` | "San Francisco, CA" |
| Rate Expectation | `candidates.rate_expectation` | "$95-105/hr" |
| Availability | `candidates.availability` | "Immediate (2 weeks notice)" |
| Total Experience | `candidates.total_experience_years` | "8 years" |
| Relevant Experience | Calculated from job requirements | "6 years" |
| Education | `candidates.education` | "BS Computer Science" |
| Work Authorization | `candidates.work_authorization` | "US Citizen ✓" |

**Time:** ~30 seconds

---

### Step 4: View Skills Match Analysis

**User Action:** Review "Skills Match" section

**System Response:**
- Shows overall match percentage (92%)
- Green checkmark if match > 80%
- Required skills listed with proficiency bars
- Nice-to-have skills listed
- Gaps highlighted in yellow/red

**Skills Match Calculation:**

```typescript
interface SkillMatch {
  skill: string;
  required: boolean;
  candidateLevel: 'none' | 'basic' | 'intermediate' | 'advanced' | 'expert';
  matchPercentage: number; // 0-100
  matchStatus: 'perfect' | 'good' | 'acceptable' | 'gap';
}

// Overall match formula:
// (Required skills met × 70%) + (Nice-to-have skills met × 30%)
```

**Visual Indicators:**

| Match % | Color | Symbol | Status |
|---------|-------|--------|--------|
| 90-100% | Green | ✅ | Perfect match |
| 75-89% | Light Green | ✅ | Good match |
| 60-74% | Yellow | ⚠️ | Acceptable (review needed) |
| < 60% | Red | ❌ | Significant gap |

**Time:** ~45 seconds

---

### Step 5: Read Recruiter's Assessment

**User Action:** Read recruiter notes and assessment

**System Response:**
- Shows recruiter's pre-screen rating (1-5 stars)
- Detailed notes from phone screen
- Technical assessment score (if applicable)
- Pre-screen date

**Recruiter Assessment Fields:**

| Field | Source | Description |
|-------|--------|-------------|
| Rating | `submissions.recruiter_rating` | 1-5 stars |
| Assessment Notes | `submissions.recruiter_notes` | Detailed feedback |
| Pre-screen Date | `submissions.pre_screen_date` | When phone screen occurred |
| Technical Score | `submissions.technical_assessment_score` | 0-100 score (if test given) |

**Time:** ~1-2 minutes

---

### Step 6: View Resume

**User Action:** Click [Resume] tab

**System Response:**
- Tab switches to resume viewer
- PDF embedded in modal (if available)
- Text extraction shown if PDF unavailable
- Download and print options available

**Screen State:**
```
+----------------------------------------------------------+
| [Overview] [Resume] [Skills] [Experience] [Notes]         |
+----------------------------------------------------------+
| Resume                              [Download] [Print]    |
+----------------------------------------------------------+
|                                                           |
| ┌──────────────────────────────────────────────────────┐ |
| │                                                        │ |
| │   JOHN MARTINEZ                                        │ |
| │   Full Stack Software Engineer                         │ |
| │   john.martinez@email.com | (555) 123-4567            │ |
| │   San Francisco, CA | linkedin.com/in/johnmartinez    │ |
| │                                                        │ |
| │   PROFESSIONAL SUMMARY                                 │ |
| │   Results-driven software engineer with 8 years of     │ |
| │   experience building scalable web applications...     │ |
| │                                                        │ |
| │   EXPERIENCE                                           │ |
| │   Senior Software Engineer                             │ |
| │   TechCorp Inc. | Jan 2020 - Present                    │ |
| │   • Led migration of monolithic app to microservices  │ |
| │   • Reduced page load times by 40% through...         │ |
| │   • Mentored team of 5 junior developers              │ |
| │                                                        │ |
| │   Software Engineer                                    │ |
| │   StartupXYZ | Jun 2017 - Dec 2019                     │ |
| │   • Built React-based dashboard for analytics         │ |
| │   • Implemented RESTful APIs using Node.js/Express    │ |
| │                                                        │ |
| │   EDUCATION                                            │ |
| │   BS Computer Science                                  │ |
| │   University of California, Berkeley | 2015            │ |
| │                                                        │ |
| │   SKILLS                                               │ |
| │   React, Node.js, TypeScript, AWS, PostgreSQL...       │ |
| │                                                        │ |
| └──────────────────────────────────────────────────────┘ |
|                                                           |
| Page 1 of 2                          [◀ Previous] [Next ▶]|
|                                                           |
+----------------------------------------------------------+
```

**Resume Viewer Features:**

- Embedded PDF viewer (browser native or PDF.js)
- Zoom controls (50% to 200%)
- Page navigation for multi-page resumes
- Text selection and copy enabled
- Download original file
- Print resume

**Time:** ~2-3 minutes

---

### Step 7: Review Work Experience

**User Action:** Click [Experience] tab

**System Response:**
- Shows parsed work history
- Timeline visualization
- Relevance indicators for each role

**Screen State:**
```
+----------------------------------------------------------+
| [Overview] [Resume] [Skills] [Experience] [Notes]         |
+----------------------------------------------------------+
| Work Experience Timeline                    8 total years |
+----------------------------------------------------------+
|                                                           |
| 📍 Current Role                      Relevance: High ✓    |
| Senior Software Engineer                                  |
| TechCorp Inc.                                             |
| Jan 2020 - Present (5 years, 11 months)                   |
| San Francisco, CA                                         |
|                                                           |
| Key Achievements:                                         |
| • Led migration of monolithic application to              |
|   microservices architecture, reducing load times by 40%  |
| • Implemented automated CI/CD pipeline using GitHub       |
|   Actions, reducing deployment time from 2hrs to 15min    |
| • Mentored team of 5 junior developers                    |
| • Architected and built customer dashboard using React    |
|   and Node.js, serving 50k+ daily active users            |
|                                                           |
| Technologies Used:                                        |
| React, Node.js, AWS (EC2, Lambda, S3), PostgreSQL,        |
| Docker, Kubernetes, GitHub Actions                        |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| 📍 Previous Role                     Relevance: Medium ✓  |
| Software Engineer                                         |
| StartupXYZ                                                |
| Jun 2017 - Dec 2019 (2 years, 7 months)                   |
| San Francisco, CA                                         |
|                                                           |
| Key Achievements:                                         |
| • Built analytics dashboard from scratch using React      |
| • Implemented RESTful APIs using Node.js/Express          |
| • Reduced API response time by 60% through caching        |
|                                                           |
| Technologies Used:                                        |
| React, Node.js, Express, MongoDB, Redis                   |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| 📍 Early Career                      Relevance: Low       |
| Junior Developer                                          |
| CodeAgency LLC                                            |
| Aug 2015 - May 2017 (1 year, 10 months)                   |
| Oakland, CA                                               |
|                                                           |
| Key Achievements:                                         |
| • Developed client websites using HTML, CSS, JavaScript   |
| • Learned React and contributed to internal projects      |
|                                                           |
+----------------------------------------------------------+
```

**Experience Analysis:**

| Field | Calculation | Display |
|-------|-------------|---------|
| Relevance | Based on job requirements match | High/Medium/Low with color |
| Duration | Parsed from dates | "X years, Y months" |
| Recency | Time since end date | Current/Recent/Past |
| Technologies | Extracted from description | Tag list |

**Time:** ~1-2 minutes

---

### Step 8: Check Notes/Communications

**User Action:** Click [Notes] tab

**System Response:**
- Shows all internal communications about candidate
- Recruiter notes
- Other team members' feedback (if any)
- Interview notes from past rounds (if applicable)

**Screen State:**
```
+----------------------------------------------------------+
| [Overview] [Resume] [Skills] [Experience] [Notes]         |
+----------------------------------------------------------+
| Communication History                                     |
+----------------------------------------------------------+
|                                                           |
| 📝 Nov 29, 2025 - 10:30 AM                                |
| Amy Chen (Recruiter)                                      |
| ─────────────────────────────────────────────────────────|
| Phone Screen Completed                                    |
|                                                           |
| Had a great conversation with John. He's very sharp and   |
| articulate. Asked him about his microservices migration   |
| project - he explained the architecture decisions clearly |
| and showed deep understanding of trade-offs.              |
|                                                           |
| Asked about availability - he's willing to give 2 weeks   |
| notice. Current company is aware he's looking. No red     |
| flags on culture fit.                                     |
|                                                           |
| Salary expectation: $95-105/hr (within budget)            |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| 📝 Nov 29, 2025 - 9:15 AM                                 |
| Amy Chen (Recruiter)                                      |
| ─────────────────────────────────────────────────────────|
| Initial Outreach                                          |
|                                                           |
| Sourced John from LinkedIn. Reached out via InMail.       |
| He responded within 2 hours (good sign of interest).      |
| Set up phone screen for 10 AM today.                      |
|                                                           |
+----------------------------------------------------------+
| [Add Internal Note]                                       |
+----------------------------------------------------------+
```

**Time:** ~1 minute

---

### Step 9: Make Decision - Accept for Interview

**User Action:** Scroll to "Your Decision" section, select "Accept for Interview"

**System Response:**
- Radio button selected
- Interview type selector appears
- Additional options expand

**Screen State:**
```
+----------------------------------------------------------+
| Your Decision                                             |
+----------------------------------------------------------+
| ⦿ Accept for Interview                                    |
|                                                           |
|   Select Interview Round(s):                              |
|   ☑ Technical Round                                       |
|   ☑ Hiring Manager Round (You)                            |
|   ☐ Team Fit Round                                        |
|   ☐ Executive Round                                       |
|                                                           |
|   Interview Format:                                       |
|   ⦿ Video Call   ○ Phone   ○ In-Person                    |
|                                                           |
|   Scheduling Preference:                                  |
|   ⦿ ASAP - Let recruiter propose times                    |
|   ○ Specific dates - I'll provide my availability         |
|                                                           |
|   [If specific dates selected:]                           |
|   Available dates/times:                                  |
|   Dec 1: [2:00 PM] [4:00 PM]                              |
|   Dec 2: [10:00 AM] [3:00 PM]                             |
|   [+ Add more times]                                      |
|                                                           |
| ○ Reject                                                  |
| ○ Request More Information                                |
|                                                           |
+----------------------------------------------------------+
| Feedback/Notes (visible to recruiter)                     |
+----------------------------------------------------------+
| [John looks like a strong match! I'd like to proceed with ]|
| [a technical round followed by a hiring manager interview.]|
| [Please schedule ASAP - we're moving quickly on this role.]|
|                                               ] 125/1000   |
|                                                           |
| Internal Notes (private, not shared with recruiter/candidate)|
+----------------------------------------------------------+
| [Great resume. Check references before final offer.       ]|
|                                               ] 45/500     |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~2 minutes

---

### Step 10: Add Feedback Notes

**User Action:** Type feedback in "Feedback/Notes" field

**System Response:**
- Text appears as typed
- Character counter updates
- Real-time save to draft (every 5 seconds)

**Field Specifications:**

| Field | Description | Visibility | Max Length |
|-------|-------------|------------|------------|
| Feedback/Notes | Shared with recruiter and candidate (sanitized) | Recruiter, Candidate (summary) | 1000 chars |
| Internal Notes | Private notes for client team only | Client team only | 500 chars |

**Time:** ~1-2 minutes

---

### Step 11: Submit Decision

**User Action:** Click [Submit Decision] button

**System Response:**
1. Button shows loading state (spinner)
2. Form validates all required fields
3. API call: `POST /api/client/candidates/{id}/decision`
4. On success:
   - Modal shows success animation
   - Toast: "Decision submitted. Recruiter notified."
   - Email sent to recruiter (Amy Chen)
   - Candidate moved to "Interviewing" status
   - Interview workflow triggered
5. Modal closes after 2 seconds
6. Candidate list refreshes
7. John Martinez removed from "Pending Review" list

**Validation Rules:**

| Field | Rule | Error Message |
|-------|------|---------------|
| Decision | Must select one option | "Please select a decision" |
| Interview Type | Required if "Accept" selected | "Please select at least one interview round" |
| Rejection Reason | Required if "Reject" selected | "Please provide a rejection reason" |
| Feedback Notes | Optional but recommended | Warning: "Consider adding feedback to help recruiter" |

**Time:** ~2-3 seconds

---

### Step 12: Review Next Candidate (Optional)

**User Action:** Click [← Back to List] or press Esc

**System Response:**
- Modal closes
- Returns to candidates list
- John Martinez no longer in "Pending Review"
- Count updated: "Pending Review (7)" (was 8)
- Next candidate (Lisa Wang) ready for review

**Time:** ~1 second

---

## Postconditions

1. ✅ Candidate decision recorded in database
2. ✅ Candidate status updated: "submitted" → "interviewing" (if accepted)
3. ✅ Recruiter notified via email and in-app notification
4. ✅ If accepted: Interview scheduling workflow triggered
5. ✅ Activity logged: "candidate.reviewed" event
6. ✅ RCAI updated: Client user marked as "Consulted"
7. ✅ Metrics updated: Avg review time, acceptance rate, etc.

---

## Events Logged

| Event | Payload |
|-------|---------|
| `candidate.reviewed` | `{ candidate_id, job_id, client_user_id, decision, timestamp }` |
| `interview.requested` | `{ candidate_id, interview_types[], client_user_id, timestamp }` |
| `candidate.rejected` | `{ candidate_id, job_id, rejection_reason, timestamp }` |
| `notification.sent` | `{ recipient: recruiter_id, type: 'candidate_decision', timestamp }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Candidate Not Found | Candidate deleted/withdrawn | "This candidate is no longer available" | Return to list |
| Job Closed | Job filled/cancelled | "This job has been closed" | Show alert, disable actions |
| Already Reviewed | Another user reviewed | "This candidate was already reviewed by [Name]" | Show decision, disable edit |
| Permission Denied | User lacks permission | "You don't have permission to review candidates for this job" | Contact admin |
| Network Error | API timeout | "Failed to submit decision. Please try again." | [Retry] button |
| Validation Failed | Missing required field | "Please select interview rounds" | Highlight field |

---

## Decision Outcomes Matrix

| Decision | Next Status | Triggers | Notifications |
|----------|-------------|----------|---------------|
| **Accept for Interview** | `interviewing` | Interview scheduling workflow | Recruiter, Coordinator |
| **Reject** | `rejected` | None (terminal state) | Recruiter only |
| **Request More Info** | `info_requested` | Recruiter task created | Recruiter |
| **Save Draft** | `submitted` (unchanged) | Auto-save to user's drafts | None |

---

## Alternative Flows

### A1: Quick Review (From Dashboard)

If user clicks [Quick Review] from dashboard:

1. Compact review modal opens (half-screen)
2. Shows summary only (no tabs)
3. Quick decision buttons: [✓ Accept] [✗ Reject] [📋 Full Review]
4. If [Full Review] clicked → Opens full modal (main flow)

### A2: Bulk Review Mode

If user wants to review multiple candidates:

1. Click "Bulk Review Mode" toggle
2. Candidates show in swipeable cards (Tinder-style)
3. Swipe Right = Accept, Swipe Left = Reject
4. [Hold for Details] shows full profile
5. Decisions queued, submitted at end

### A3: Collaborative Review

If multiple hiring managers involved:

1. User adds feedback/notes
2. Tags other reviewers: "@Sarah @Tom please review"
3. Other reviewers notified
4. Each adds their feedback
5. Final decision made once all reviewed
6. Consensus shown (3/3 recommend interview)

### A4: Reject with Feedback

If user selects "Reject":

**Screen State:**
```
+----------------------------------------------------------+
| ○ Accept for Interview                                    |
| ⦿ Reject                                                  |
|                                                           |
|   Rejection Reason:                                       |
|   ⦿ Not enough experience                                 |
|   ○ Skills mismatch                                       |
|   ○ Rate expectation too high                             |
|   ○ Location/availability issues                          |
|   ○ Cultural fit concerns                                 |
|   ○ Other (please specify)                                |
|                                                           |
|   Detailed Feedback (shared with recruiter):              |
|   [While John has strong React skills, we need someone    ]|
|   [with more AWS experience for this role. Please look for]|
|   [candidates with 5+ years of AWS production experience. ]|
|                                               ] 150/1000   |
|                                                           |
|   ☐ Add to talent pool for future opportunities           |
|   ☐ Keep resume on file for 6 months                      |
|                                                           |
+----------------------------------------------------------+
```

**Rejection Reasons (Pre-defined):**

| Reason | Effect | Feedback Template |
|--------|--------|-------------------|
| Not enough experience | Logged for recruiter | "Candidate needs X more years in [skill]" |
| Skills mismatch | Highlights gap areas | "Missing required skills: [list]" |
| Rate too high | Budget constraint flag | "Rate expectation exceeds budget ($X)" |
| Location/availability | Logistics issue | "Cannot accommodate [remote/relocation/start date]" |
| Cultural fit | Soft skills concern | "Team dynamics/culture alignment concerns" |
| Other | Free text required | User provides custom reason |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` / `→` | Previous/Next candidate |
| `1` | Accept for interview |
| `2` | Reject |
| `3` | Request more info |
| `R` | Focus on Resume tab |
| `S` | Focus on Skills tab |
| `E` | Focus on Experience tab |
| `Cmd/Ctrl+Enter` | Submit decision |
| `Cmd/Ctrl+S` | Save draft |
| `Esc` | Close modal |

---

## Performance Metrics Tracked

| Metric | Calculation | Business Value |
|--------|-------------|----------------|
| Avg Review Time | Time from submission to decision | Identify bottlenecks |
| Acceptance Rate | % of candidates accepted for interview | Recruiter quality indicator |
| Time to Decision | Hours between submission and review | Client responsiveness |
| Interview Request Rate | % requesting interviews | Candidate quality gauge |
| Rejection Reasons | Distribution of rejection types | Improve sourcing criteria |

---

## Related Use Cases

- [01-portal-dashboard.md](./01-portal-dashboard.md) - Dashboard with pending candidates
- [03-schedule-interview.md](./03-schedule-interview.md) - Next step after accepting candidate
- [05-create-job-request.md](./05-create-job-request.md) - Initial job creation

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Accept candidate for interview | Status updated, recruiter notified |
| TC-002 | Reject candidate with reason | Status updated, reason logged |
| TC-003 | Request more information | Task created for recruiter |
| TC-004 | Save draft without submitting | Draft saved, status unchanged |
| TC-005 | Submit with no decision selected | Validation error shown |
| TC-006 | View candidate already reviewed | Read-only mode, show existing decision |
| TC-007 | Network error during submit | Error message, retry option |
| TC-008 | Bulk review 10 candidates | All decisions recorded correctly |
| TC-009 | Collaborative review (2 users) | Both feedbacks saved separately |
| TC-010 | Download resume PDF | File downloads correctly |

---

*Last Updated: 2025-11-30*
