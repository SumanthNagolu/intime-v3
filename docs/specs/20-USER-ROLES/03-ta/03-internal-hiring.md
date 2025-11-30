# Use Case: Internal Position Hiring Workflow

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-TA-002 |
| Actor | TA Recruiter |
| Goal | Complete full hiring lifecycle for an internal position from job posting to offer acceptance |
| Frequency | 2-3 times per month |
| Estimated Time | 2-4 weeks per hire |
| Priority | Critical |

---

## Preconditions

1. User is logged in as TA Recruiter
2. Hiring requisition approved by HR and hiring manager
3. Job description and requirements defined
4. Budget approved for position
5. User has permissions to post internal jobs

---

## Trigger

One of the following:
- Hiring manager submits new requisition
- Department expansion approved
- Backfill for departing employee
- New role creation approved by leadership

---

## Main Flow (Click-by-Click)

### Phase 1: Post Internal Job

#### Step 1: Navigate to Internal Jobs

**User Action:** Click "Internal Jobs" in sidebar

**System Response:**
- URL changes to: `/employee/workspace/internal-jobs`
- Internal jobs list loads
- Shows all internal job requisitions

**Screen State:**
```
+----------------------------------------------------------+
| Internal Jobs                         [+ Post New Job]    |
+----------------------------------------------------------+
| [Search jobs...]                     [Filter ▼] [Sort ▼]  |
+----------------------------------------------------------+
| ● Open │ ○ On Hold │ ○ Filled │ ○ Closed │ ○ All          |
+----------------------------------------------------------+
| Title             Dept      Posted   Pipeline  Manager    |
| ───────────────────────────────────────────────────────── |
| Senior Recruiter  TA        14d      8         Sarah J.   |
| Jr. Developer     Eng       7d       12        Mike C.    |
| BDR               Sales     21d      3         Lisa K.    |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

#### Step 2: Click "Post New Job"

**User Action:** Click "+ Post New Job" button

**System Response:**
- Job creation modal opens
- Step 1 of 3: Job Details

**Screen State:**
```
+----------------------------------------------------------+
|                                       Post New Job    [×] |
+----------------------------------------------------------+
| Step 1 of 3: Job Details                                  |
|                                                           |
| Job Title *                                               |
| [                                                      ]  |
|                                                           |
| Department *                                              |
| [Select department...                                 ▼]  |
|   Options: Engineering, Sales, TA, HR, Finance, Marketing |
|                                                           |
| Reporting To (Hiring Manager) *                           |
| [Select manager...                                    ▼]  |
|   (Auto-filtered by department)                           |
|                                                           |
| Employment Type *                                         |
| ● Full-Time  ○ Part-Time  ○ Contract  ○ Intern           |
|                                                           |
| Location *                                                |
| ○ On-Site  ● Hybrid  ○ Remote                            |
|                                                           |
| Work Location (if On-Site or Hybrid)                      |
| [San Francisco, CA - HQ                               ▼]  |
|                                                           |
| Job Description *                                         |
| [                                                      ]  |
| [Paste or write job description...                    ]  |
| [                                                      ]  |
| [                                               ] 0/5000  |
|                                                           |
+----------------------------------------------------------+
|                                      [Cancel] [Continue →]|
+----------------------------------------------------------+
```

**Field Specification: Job Title**
| Property | Value |
|----------|-------|
| Field Name | `title` |
| Type | Text Input |
| Label | "Job Title" |
| Required | Yes |
| Max Length | 100 characters |
| Examples | "Senior Technical Recruiter", "Account Executive", "DevOps Engineer" |
| Validation | Non-empty |

**Field Specification: Department**
| Property | Value |
|----------|-------|
| Field Name | `departmentId` |
| Type | Dropdown (Select) |
| Label | "Department" |
| Required | Yes |
| Data Source | `departments` table (org-specific) |
| Display | Department name |

**Field Specification: Reporting To**
| Property | Value |
|----------|-------|
| Field Name | `hiringManagerId` |
| Type | Dropdown (Select) |
| Label | "Reporting To (Hiring Manager)" |
| Required | Yes |
| Data Source | Users with manager role in selected department |
| Display | Full name + title |

**Field Specification: Employment Type**
| Property | Value |
|----------|-------|
| Field Name | `employmentType` |
| Type | Radio Button Group |
| Label | "Employment Type" |
| Required | Yes |
| Options | |
| - `full_time` | "Full-Time" (default) |
| - `part_time` | "Part-Time" |
| - `contract` | "Contract" |
| - `intern` | "Intern" |

**Field Specification: Job Description**
| Property | Value |
|----------|-------|
| Field Name | `description` |
| Type | Rich Text Editor |
| Label | "Job Description" |
| Required | Yes |
| Max Length | 5000 characters |
| Formatting | Markdown or HTML |
| Sections | Overview, Responsibilities, Requirements, Nice-to-Haves, Benefits |

**User Action:** Fill in job details, click "Continue"

**Time:** ~5 minutes

---

#### Step 3: Define Requirements & Compensation

**System Response:**
- Slides to Step 2: Requirements & Compensation

**Screen State:**
```
+----------------------------------------------------------+
|                                       Post New Job    [×] |
+----------------------------------------------------------+
| Step 2 of 3: Requirements & Compensation                  |
|                                                           |
| Required Skills * (select at least 3)                     |
| [Search skills...                                      ]  |
| [Recruiting] [×]  [ATS] [×]  [LinkedIn Recruiter] [×]    |
| [+ Add skill]                                             |
|                                                           |
| Preferred Skills (optional)                               |
| [Boolean search] [×]  [Agency experience] [×]            |
| [+ Add skill]                                             |
|                                                           |
| Experience Level *                                        |
| Min: [3] years  Max: [7] years                           |
|                                                           |
| Education Requirement                                     |
| [Bachelor's Degree preferred                          ▼]  |
|   Options: Not Required, Preferred, Required              |
|                                                           |
| Work Authorization *                                      |
| ☑ US Citizen  ☑ Green Card  ☑ H1B  ☑ EAD                |
| (Select all acceptable)                                   |
|                                                           |
| Compensation                                              |
| Base Salary Range *                                       |
| Min: $[75,000]  Max: $[90,000]  /year                    |
|                                                           |
| On-Target Earnings (OTE) [if commission/bonus]            |
| $[105,000] /year                                          |
|   (Base $82.5K + Commission/Bonus $22.5K)                |
|                                                           |
| Commission Plan                                           |
| [Standard Recruiter Plan (2% GP)                      ▼]  |
|                                                           |
| Benefits                                                  |
| ☑ Health Insurance                                       |
| ☑ 401(k) Matching (4%)                                   |
| ☑ Unlimited PTO                                          |
| ☑ Remote Work Flexibility                                |
| ☑ Professional Development Budget                        |
| ☐ Equity/Stock Options                                   |
|                                                           |
+----------------------------------------------------------+
|                        [← Back] [Cancel] [Continue →]     |
+----------------------------------------------------------+
```

**Field Specification: Required Skills**
| Property | Value |
|----------|-------|
| Field Name | `requiredSkills` |
| Type | Multi-select Tag Input |
| Label | "Required Skills" |
| Required | Yes (at least 3) |
| Data Source | `skills` table (autocomplete) |
| Allow Custom | Yes |
| Max Tags | 20 |

**Field Specification: Base Salary Range**
| Property | Value |
|----------|-------|
| Field Name | `salaryMin`, `salaryMax` |
| Type | Currency Input (pair) |
| Label | "Base Salary Range" |
| Required | Yes |
| Min Value | 0 |
| Max Value | 500,000 |
| Currency | USD |
| Validation | Min < Max |
| Error | "Maximum salary must be greater than minimum" |

**User Action:** Fill in requirements and compensation, click "Continue"

**Time:** ~5 minutes

---

#### Step 4: Review and Post

**System Response:**
- Slides to Step 3: Review & Post
- Shows summary of job posting

**Screen State:**
```
+----------------------------------------------------------+
|                                       Post New Job    [×] |
+----------------------------------------------------------+
| Step 3 of 3: Review & Post                                |
|                                                           |
| Job Summary                                               |
| ┌─────────────────────────────────────────────────────┐ |
| │ Senior Technical Recruiter                          │ |
| │ Talent Acquisition • Reports to: Sarah Johnson      │ |
| │ Full-Time • Hybrid (SF HQ)                          │ |
| │                                                      │ |
| │ Compensation: $75K - $90K + Commission              │ |
| │ OTE: $105K                                          │ |
| │                                                      │ |
| │ Required: Recruiting, ATS, LinkedIn Recruiter       │ |
| │ 3-7 years experience                                │ |
| │ Bachelor's preferred                                │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| Visibility                                                |
| ● Internal only (employees can refer)                    |
| ○ Public (post to careers page)                          |
| ○ Both internal and public                               |
|                                                           |
| Posting Options                                           |
| ☑ Enable employee referrals ($1000 bonus)               |
| ☑ Post to LinkedIn Jobs                                  |
| ☑ Post to Indeed                                         |
| ☐ Post to Dice                                           |
|                                                           |
| Application Deadline (optional)                           |
| [Jan 15, 2025] (45 days from now)                        |
|                                                           |
+----------------------------------------------------------+
| [← Back] [Save as Draft] [Cancel] [Post Job →]          |
+----------------------------------------------------------+
```

**Field Specification: Visibility**
| Property | Value |
|----------|-------|
| Field Name | `visibility` |
| Type | Radio Button Group |
| Label | "Visibility" |
| Options | |
| - `internal` | "Internal only" |
| - `public` | "Public (careers page)" |
| - `both` | "Both internal and public" |
| Default | `both` |

**Field Specification: Enable Employee Referrals**
| Property | Value |
|----------|-------|
| Field Name | `enableReferrals` |
| Type | Checkbox |
| Label | "Enable employee referrals" |
| Default | Checked (true) |
| Bonus Amount | Configurable (default $1000) |

**User Action:** Review, click "Post Job →"

**System Response:**
1. Validates all fields
2. Creates job record in `internal_jobs` table
3. Status: "open"
4. If LinkedIn/Indeed enabled: Posts via API integrations
5. If referrals enabled: Creates referral program entry
6. Sends notification to hiring manager
7. Posts to internal careers page
8. Toast: "Job posted successfully!"
9. Redirects to job detail page

**Time:** ~2 minutes

---

### Phase 2: Source and Screen Candidates

#### Step 5: Source Candidates

**Options for sourcing:**

**A. From Active Campaign:**
- User has campaign running for this role
- Campaign responses convert to candidates
- Automatically associated with this job
- See [02-run-campaign.md](./02-run-campaign.md)

**B. LinkedIn Sourcing:**
- User searches LinkedIn Recruiter
- Adds candidates to InTime
- Associates with this job
- Sends InMails

**C. Employee Referrals:**
- Employees submit referrals via employee portal
- Referrals appear in job's "Referred" pipeline
- TA Recruiter reviews and screens

**D. Direct Applications:**
- Candidates apply via careers page
- Applications appear in job's "Applied" pipeline
- TA Recruiter reviews

**Screen State (Job Pipeline):**
```
+----------------------------------------------------------+
| Senior Technical Recruiter                     [⋮ Actions]|
+----------------------------------------------------------+
| RCAI: R: You  A: Sarah Johnson (Hiring Mgr)  C: -  I: -  |
+----------------------------------------------------------+
| [Overview] [Pipeline] [Activity] [Settings]               |
+----------------------------------------------------------+
| Applied  │ Screening │ Mgr Screen│ Interview │ Offer     |
| (12)     │ (5)       │ (3)       │ (2)       │ (0)       |
+──────────────────────────────────────────────────────────+
| ┌──────┐│ ┌──────┐ │ ┌──────┐ │ ┌──────┐  │           |
| │Alex J││ │Maria G│ │ │David K│ │ │Lisa P │  │           |
| │Referl││ │88%    │ │ │Schedul│ │ │Today  │  │           |
| └──────┘│ └──────┘ │ └──────┘ │ │2:00PM │  │           |
| ┌──────┐│ ┌──────┐ │           │ └──────┘  │           |
| │Sarah ││ │John D │ │           │           │           |
| │Direct││ │82%    │ │           │           │           |
| └──────┘│ └──────┘ │           │           │           |
+──────────────────────────────────────────────────────────+
```

**Time:** Ongoing, 1-2 hours daily

---

#### Step 6: Conduct Initial Screening

**User Action:** Click on candidate card "Alex Johnson" in "Applied" column

**System Response:**
- Candidate detail panel slides in from right
- Shows full candidate profile

**Screen State (Candidate Quick View):**
```
+----------------------------------------------------------+
| Alex Johnson                           [Full Profile] [×]|
+----------------------------------------------------------+
| 📧 alex.johnson@email.com  📞 (555) 123-4567             |
| 📍 San Francisco, CA • 🔗 linkedin.com/in/alexjohnson    |
|                                                           |
| Status: 🟢 Applied (via employee referral - Maria G.)    |
| Source: Employee Referral                                 |
| Applied: 2 days ago                                       |
|                                                           |
| Match Score: 92% (excellent fit)                          |
| ✓ Recruiting (6 years)                                    |
| ✓ ATS (Greenhouse, Lever, 5 years)                       |
| ✓ LinkedIn Recruiter (Expert)                             |
| ✓ Agency experience (3 years at Hireup)                   |
|                                                           |
| Current: Senior Recruiter at TechStaff Inc.               |
| Experience: 6 years total recruiting                      |
| Education: BA in Business, USC                            |
|                                                           |
| Resume: alex_johnson_resume.pdf (uploaded 2d ago)         |
| [View Resume] [Download]                                  |
|                                                           |
| Referrer Notes (from Maria G.):                           |
| "Alex and I worked together at TechStaff. Top performer,  |
|  consistently hit placement goals. Great culture fit!"    |
|                                                           |
+----------------------------------------------------------+
| [Reject] [Schedule Screen] [Move to Screening]           |
+----------------------------------------------------------+
```

**User Action:** Click "Schedule Screen" button

**System Response:**
- Scheduling modal opens
- Pre-fills candidate and user info

**User Action:** Select time slot, click "Send Invite"

**System Response:**
- Calendar invite sent to candidate and TA Recruiter
- Candidate moves to "Screening" column
- Status: "Screening Scheduled"
- Activity logged

**Time:** ~5 minutes per candidate

---

#### Step 7: Conduct Screening Call

**User opens candidate profile on day of call:**

**Screen State (Active Call Interface):**
```
+----------------------------------------------------------+
| 📞 Screening Call: Alex Johnson           [00:12:45]     |
+----------------------------------------------------------+
| [Candidate Info] [Call Notes] [Checklist]                |
+----------------------------------------------------------+
| Call Notes (auto-saving every 10 seconds)                 |
| [                                                      ]  |
| [• Currently Sr. Recruiter at TechStaff Inc.          ]  |
| [• 6 years recruiting, 3 in agency (Hireup)           ]  |
| [• Specializes in tech recruiting (eng, product)      ]  |
| [• Avg 2.5 placements/month over last year            ]  |
| [• Reason for leaving: seeking growth, mgmt track     ]  |
| [• Salary expectation: $85K base + commission         ]  |
| [• Available: 3 weeks notice                          ]  |
| [• Referral from Maria G. (worked together 2 years)   ]  |
| [• Strengths: sourcing, relationship building         ]  |
| [• Question: career growth path at InTime?            ]  |
| [• Very enthusiastic, prepared, researched company    ]  |
| [                                               ]0/2000  |
|                                                           |
| Screening Checklist                                       |
| ☑ Experience match (6 years ✓ target 3-7)                |
| ☑ Skills verification (Recruiting, ATS, LinkedIn ✓)      |
| ☑ Compensation aligned ($85K within $75-90K range ✓)     |
| ☑ Availability acceptable (3 weeks ✓)                    |
| ☑ Culture fit indicators (positive ✓)                    |
| ☑ Interest level (high ✓)                                |
| ☑ Communication skills (excellent ✓)                     |
| ☑ No red flags (✓)                                       |
|                                                           |
| Recommendation:                                           |
| ● Strong Yes - Recommend for Manager Interview           |
| ○ Maybe - Needs more evaluation                          |
| ○ No - Not a fit                                         |
|                                                           |
+----------------------------------------------------------+
| [End Call & Reject] [End Call & Save] [Move to Next →]  |
+----------------------------------------------------------+
```

**User Action:** Complete checklist, select "Strong Yes", click "Move to Next →"

**System Response:**
- Call notes saved
- Candidate moves to "Manager Screen" column
- Status: "Screening Passed"
- Activity logged: "Screening completed - Positive"
- Notification sent to hiring manager
- Time: ~30 minutes (20 min call + 10 min notes)

**Repeat Steps 6-7 for all candidates in "Applied" column**

---

### Phase 3: Coordinate Manager Interviews

#### Step 8: Schedule Hiring Manager Screen

**User Action:** Click on candidate "Alex Johnson" in "Manager Screen" column

**User Action:** Click "Schedule Manager Screen" button

**Screen State (Manager Screen Scheduling):**
```
+----------------------------------------------------------+
| Schedule Manager Screen: Alex Johnson                     |
+----------------------------------------------------------+
| Interview Type: Hiring Manager Screen (30-45 min)        |
|                                                           |
| Hiring Manager *                                          |
| [Sarah Johnson - TA Manager                           ▼]  |
|   (Auto-populated from job)                               |
|                                                           |
| Check Availability                                        |
| [Show Calendar →]                                         |
|                                                           |
| Available Time Slots (next 7 days)                        |
| ○ Tomorrow, Dec 3 at 2:00 PM                             |
| ○ Thursday, Dec 5 at 10:00 AM                            |
| ● Friday, Dec 6 at 3:00 PM [Candidate preferred]         |
| ○ Monday, Dec 9 at 11:00 AM                              |
|                                                           |
| Interview Format                                          |
| ○ In-Person  ● Video Call  ○ Phone                       |
|                                                           |
| Video Call Link (auto-generated)                          |
| [https://meet.intime.com/sarah-j/alex-johnson-screen  ]  |
|   (Auto-sent in calendar invite)                          |
|                                                           |
| Duration                                                  |
| [45] minutes                                              |
|                                                           |
| Briefing Notes for Manager                                |
| [Excellent screening call. 6 years recruiting exp,    ]  |
| [strong tech recruiting background. Currently hitting  ]  |
| [2.5 placements/month at TechStaff. Salary aligned    ]  |
| [at $85K. Referred by Maria G. Key question: career   ]  |
| [growth path at InTime.                               ]  |
|                                               ] 0/500     |
|                                                           |
+----------------------------------------------------------+
| [Cancel] [Send Calendar Invites]                         |
+----------------------------------------------------------+
```

**User Action:** Select Friday 3:00 PM, add briefing notes, click "Send Calendar Invites"

**System Response:**
1. Calendar invites sent to:
   - Sarah Johnson (hiring manager)
   - Alex Johnson (candidate)
   - TA Recruiter (organizer)
2. Video call link created
3. Candidate status: "Manager Screen Scheduled"
4. Activity logged
5. Reminder task created for TA Recruiter: "Confirm Alex Johnson interview - 1 day before"
6. Toast: "Interview scheduled successfully!"

**Time:** ~5 minutes

---

#### Step 9: Prepare Candidate for Interview

**Day before interview:**

**User Action:** Call or email candidate with interview prep

**Prep points:**
- Confirm time and video link
- Review format (30-45 min with hiring manager)
- Share what to expect (questions about experience, scenarios, culture fit)
- Provide company background
- Answer any questions

**User logs this activity:**
- Activity type: "Interview Prep Call"
- Duration: 15 minutes
- Notes: "Confirmed Friday 3pm, shared interview format, answered questions about company growth"

**Time:** ~15 minutes

---

#### Step 10: Follow Up After Manager Screen

**After interview (same day or next day):**

**User Action:** Follow up with both hiring manager and candidate

**A. Hiring Manager Follow-Up:**
- User calls or messages Sarah Johnson
- Gets feedback on candidate
- Sarah's feedback: "Strong candidate, good fit. Let's move to panel interview."
- User logs feedback in candidate profile

**B. Candidate Follow-Up:**
- User calls Alex Johnson
- Gets candidate's perspective
- Alex's feedback: "Great conversation, very interested!"
- User logs feedback

**User Action:** Update candidate status to "Panel Interview"

**Time:** ~20 minutes

---

### Phase 4: Panel Interview and Final Decision

#### Step 11: Schedule Panel Interview

**User Action:** Schedule panel interview with multiple interviewers

**Panel includes:**
- Sarah Johnson (Hiring Manager)
- Mike Chen (TA Director)
- Lisa Park (Peer - Senior Recruiter)

**Time:** 90 minutes (30 min each)

**User coordinates schedules, sends invites**

**Time:** ~15 minutes

---

#### Step 12: Collect Interview Feedback

**After panel interview:**

**System provides interview feedback form to each panelist:**

**Screen State (Interview Feedback Form - Panelist View):**
```
+----------------------------------------------------------+
| Interview Feedback: Alex Johnson                          |
| Panel Interview - Senior Technical Recruiter              |
+----------------------------------------------------------+
| Interviewer: Sarah Johnson (Hiring Manager)               |
| Date: Dec 10, 2024                                        |
|                                                           |
| Overall Recommendation *                                  |
| ● Strong Yes - Hire                                      |
| ○ Yes - Hire with minor reservations                     |
| ○ Maybe - Unsure                                         |
| ○ No - Do not hire                                       |
|                                                           |
| Rating (1-5) *                                            |
| Skills & Experience:    [5] ⭐⭐⭐⭐⭐                     |
| Culture Fit:            [5] ⭐⭐⭐⭐⭐                     |
| Communication:          [5] ⭐⭐⭐⭐⭐                     |
| Problem Solving:        [4] ⭐⭐⭐⭐                       |
| Team Collaboration:     [5] ⭐⭐⭐⭐⭐                     |
|                                                           |
| Strengths                                                 |
| [Deep recruiting experience, excellent sourcing skills,]  |
| [strong relationship builder, understands metrics...   ]  |
|                                               ] 0/500     |
|                                                           |
| Areas of Concern (if any)                                 |
| [None. Ready to contribute from day 1.                ]   |
|                                               ] 0/500     |
|                                                           |
| Key Interview Notes                                       |
| [Asked great questions about team structure, growth    ]  |
| [plans. Shared examples of complex placements. Very    ]  |
| [impressed by metrics: 2.5 placements/month avg.      ]  |
|                                               ] 0/1000    |
|                                                           |
+----------------------------------------------------------+
| [Save Draft] [Submit Feedback]                           |
+----------------------------------------------------------+
```

**All panelists submit feedback**

**TA Recruiter reviews consolidated feedback:**

**Screen State (Consolidated Interview Feedback):**
```
+----------------------------------------------------------+
| Interview Feedback Summary: Alex Johnson                  |
+----------------------------------------------------------+
| Panel Interview - Senior Technical Recruiter              |
| Date: Dec 10, 2024                                        |
|                                                           |
| Overall Consensus: 🟢 STRONG YES - HIRE                  |
|                                                           |
| ┌─────────────────────────────────────────────────────┐ |
| │ Sarah Johnson (Hiring Manager)                      │ |
| │ Recommendation: Strong Yes                          │ |
| │ Ratings: 5/5 avg • "Ready to contribute from day 1" │ |
| ├─────────────────────────────────────────────────────┤ |
| │ Mike Chen (TA Director)                             │ |
| │ Recommendation: Strong Yes                          │ |
| │ Ratings: 5/5 avg • "Exactly what we need"           │ |
| ├─────────────────────────────────────────────────────┤ |
| │ Lisa Park (Peer - Sr. Recruiter)                    │ |
| │ Recommendation: Yes                                 │ |
| │ Ratings: 4.5/5 avg • "Great addition to team"       │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| Decision: PROCEED TO OFFER                                |
|                                                           |
+----------------------------------------------------------+
| [Move to Offer Stage] [Schedule Follow-Up] [Reject]      |
+----------------------------------------------------------+
```

**User Action:** Click "Move to Offer Stage"

**System Response:**
- Candidate moves to "Offer" column
- Status: "Offer Preparation"
- Hiring manager notified
- HR notified

**Time:** ~10 minutes to review feedback

---

### Phase 5: Extend Offer

#### Step 13: Prepare Offer Letter

**User Action:** Click "Prepare Offer" on candidate profile

**Screen State (Offer Preparation):**
```
+----------------------------------------------------------+
| Prepare Offer: Alex Johnson                               |
+----------------------------------------------------------+
| Position Details                                          |
| Job Title: [Senior Technical Recruiter                ]   |
| Department: [Talent Acquisition                       ]   |
| Reporting To: [Sarah Johnson - TA Manager             ]   |
| Employment Type: [Full-Time                           ]   |
| Start Date: [Jan 13, 2025] (flexible within 2 weeks)     |
|                                                           |
| Compensation                                              |
| Base Salary: $[85,000] /year                             |
|   (Candidate expectation: $85K ✓)                         |
|   (Budget range: $75K-90K ✓)                             |
|                                                           |
| Commission Plan: [Standard Recruiter Plan             ▼]  |
|   (2% of gross profit on placements)                      |
|                                                           |
| Sign-On Bonus: $[5,000]                                  |
|   (Paid after 90 days)                                    |
|                                                           |
| On-Target Earnings (OTE): $[110,000] /year               |
|   (Base $85K + Est. Commission $25K)                     |
|                                                           |
| Benefits Package                                          |
| ☑ Health Insurance (Medical, Dental, Vision)             |
|   Employee contribution: 20%, starts Day 1                |
| ☑ 401(k) with 4% Company Match                           |
|   Eligible after 90 days                                  |
| ☑ Unlimited PTO                                          |
| ☑ 10 Paid Holidays                                       |
| ☑ Remote Work Flexibility (3 days/week WFH)              |
| ☑ Professional Development Budget ($2,000/year)          |
| ☐ Equity/Stock Options                                   |
|                                                           |
| Probationary Period                                       |
| [90] days with performance checkpoints at 30, 60, 90 days|
|                                                           |
| Special Terms (optional)                                  |
| [Relocation assistance: N/A (local candidate)         ]   |
| [                                               ] 0/500   |
|                                                           |
| Offer Expiration                                          |
| [Dec 20, 2024] (7 business days from offer date)         |
|                                                           |
+----------------------------------------------------------+
| [Save Draft] [Cancel] [Submit for Approval →]            |
+----------------------------------------------------------+
```

**User Action:** Review all fields, click "Submit for Approval →"

**System Response:**
1. Offer saved as draft
2. Routed to HR Manager for approval
3. Status: "Offer Pending Approval"
4. TA Recruiter notified when approved
5. Toast: "Offer submitted for approval"

**Time:** ~15 minutes

---

#### Step 14: HR Approves Offer

**HR Manager reviews and approves offer**

**System notifies TA Recruiter: "Offer approved for Alex Johnson"**

---

#### Step 15: Extend Offer to Candidate

**User Action:** Call candidate to verbally extend offer

**Call script:**
- Congratulate candidate
- Review offer details (salary, benefits, start date)
- Answer questions
- Set expectation for formal offer letter
- Ask for tentative verbal acceptance

**Candidate (Alex): "Yes! I accept! This is exactly what I was hoping for."**

**User Action:** After call, click "Send Offer Letter"

**System Response:**
1. Generates offer letter PDF (DocuSign template)
2. Sends via DocuSign to candidate email
3. Status: "Offer Extended"
4. Activity logged: "Offer extended verbally and via DocuSign"
5. Reminder task created: "Follow up on offer signature - 3 days"

**Time:** ~30 minutes (call + send)

---

#### Step 16: Candidate Signs Offer

**Candidate receives DocuSign email, reviews, and signs offer letter**

**System receives webhook from DocuSign:**
- Offer status: "Offer Accepted"
- Signed offer PDF attached to candidate profile
- Activity logged: "Offer signed"
- Hiring manager notified
- HR notified to begin onboarding
- Job status updated: "Filled" (if this was the only opening)

**User Action:** Call candidate to congratulate

**Time:** ~10 minutes

---

## Postconditions

1. ✅ Internal job posted and visible
2. ✅ Candidates sourced and screened
3. ✅ Manager screen and panel interviews completed
4. ✅ Interview feedback collected
5. ✅ Offer prepared and approved
6. ✅ Offer extended and signed
7. ✅ Job status updated to "Filled"
8. ✅ Hiring manager notified
9. ✅ HR notified for onboarding
10. ✅ Next step: Onboarding (see [04-onboard-employee.md](./04-onboard-employee.md))

---

## Timeline (Typical)

| Week | Phase | Activities |
|------|-------|------------|
| Week 1 | Post Job & Source | Post job, launch campaign, source candidates |
| Week 2 | Screening | Conduct 10-15 screening calls, select top 3-5 |
| Week 3 | Manager Screens | Coordinate and complete manager screens, select top 2-3 for panel |
| Week 4 | Panel Interview | Panel interviews, collect feedback, make decision |
| Week 5 | Offer | Prepare offer, get approval, extend, negotiate, sign |

**Total Time to Hire: 4-5 weeks (average)**

---

## Error Scenarios

| Error | Cause | Recovery |
|-------|-------|----------|
| No qualified candidates | Sourcing ineffective | Adjust targeting, increase budget for ads, expand search |
| Hiring manager unresponsive | Schedule conflicts | Escalate to TA Manager, delegate to another interviewer |
| Candidate rejects offer | Compensation/fit mismatch | Negotiate if possible, move to next candidate |
| Offer approval delayed | HR backlog | Follow up with HR Manager, escalate if urgent |
| Background check fails | Candidate issue | Rescind offer, move to next candidate |
| Candidate accepts counteroffer | Current employer retention | Move to next candidate, note for future |

---

## Events Logged

| Event | Payload |
|-------|---------|
| `internal_job.posted` | `{ job_id, title, department, hiring_manager, posted_by, posted_at }` |
| `candidate.applied` | `{ job_id, candidate_id, source, applied_at }` |
| `screening.completed` | `{ job_id, candidate_id, recommendation, screened_by, completed_at }` |
| `interview.scheduled` | `{ job_id, candidate_id, interview_type, interviewers, scheduled_at }` |
| `interview.completed` | `{ job_id, candidate_id, feedback_summary, completed_at }` |
| `offer.prepared` | `{ job_id, candidate_id, salary, prepared_by, prepared_at }` |
| `offer.approved` | `{ job_id, candidate_id, approved_by, approved_at }` |
| `offer.extended` | `{ job_id, candidate_id, extended_by, extended_at }` |
| `offer.signed` | `{ job_id, candidate_id, signed_at }` |
| `job.filled` | `{ job_id, candidate_id, filled_at }` |

---

## Related Use Cases

- [02-run-campaign.md](./02-run-campaign.md) - Sourcing candidates via campaigns
- [04-onboard-employee.md](./04-onboard-employee.md) - Next step after offer acceptance
- [01-daily-workflow.md](./01-daily-workflow.md) - Daily management tasks

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Post internal job with all required fields | Job posted successfully, appears in list |
| TC-002 | Post job without salary range | Error: "Salary range is required" |
| TC-003 | Source candidate via campaign | Candidate associated with job |
| TC-004 | Schedule manager screen | Calendar invites sent, interview scheduled |
| TC-005 | Collect panel feedback | Feedback aggregated, consensus shown |
| TC-006 | Prepare offer within budget | Offer created and routed for approval |
| TC-007 | Prepare offer above budget | Warning shown, requires VP approval |
| TC-008 | Extend offer via DocuSign | Offer sent, signature tracked |
| TC-009 | Candidate signs offer | Job status updated to "Filled", onboarding triggered |
| TC-010 | Candidate rejects offer | Status updated, next candidate notified |

---

## Success Metrics

Hire is successful when:
1. ✅ Time to hire ≤ 30 days
2. ✅ Quality of hire rating 4+ (from hiring manager)
3. ✅ Offer acceptance rate 85%+
4. ✅ New hire passes 90-day review
5. ✅ New hire retention at 1 year
6. ✅ Cost per hire < $3,000
7. ✅ Hiring manager satisfaction 4+ out of 5

---

*Last Updated: 2024-11-30*
