# Use Case: Create Job Request

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-CLI-005 |
| Actor | Client Portal User (Hiring Manager, Department Head) |
| Goal | Submit new job requisition to InTime for staffing |
| Frequency | 2-5 times per month |
| Estimated Time | 10-20 minutes |
| Priority | High |

---

## Preconditions

1. User is logged in as Client Portal User
2. User has "job:create" permission
3. User has valid department/cost center (for budget tracking)
4. MSA (Master Service Agreement) exists with InTime
5. Client organization account is active

---

## Trigger

One of the following:
- New project approved requiring additional staff
- Existing employee resignation/departure
- Workload increase requiring temporary help
- Specialized skill need for project
- Manager determines staffing gap
- Budget allocated for contractor/consultant

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Jobs

**User Action:** Click "Jobs" in navigation menu

**System Response:**
- URL changes to: `/client/jobs`
- Jobs page loads showing client's job requests
- Tabs: Active | Draft | Filled | All

**Screen State:**
```
+----------------------------------------------------------+
| Jobs                            [+ New Job Request] [⚙]   |
+----------------------------------------------------------+
| [Active (12)] [Draft (3)] [Filled (28)] [All (43)]        |
+----------------------------------------------------------+
| Search jobs...                       [Filter ▼] [Sort ▼]  |
+----------------------------------------------------------+
| Job Title              Status       Candidates   Created  |
| ─────────────────────────────────────────────────────────|
| Senior Software Eng.   Active       12 submitted  5 days  |
|   Engineering Dept.    🟢           3 interviewing         |
|   [View Details] [View Candidates]                        |
|                                                           |
| Product Manager        Active       8 submitted   8 days  |
|   Product Dept.        🟢           2 interviewing         |
|   [View Details] [View Candidates]                        |
|                                                           |
| DevOps Engineer        Active       5 submitted   3 days  |
|   Operations Dept.     🟡           1 interviewing         |
|   [View Details] [View Candidates]                        |
|                                                           |
+----------------------------------------------------------+
| Showing 3 of 12 active jobs                  [Load More]  |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 2: Click "New Job Request"

**User Action:** Click [+ New Job Request] button

**System Response:**
- Job request form modal opens (full-screen)
- Multi-step wizard appears
- First step auto-focused

**Screen State:**
```
+----------------------------------------------------------+
|                                   Create Job Request  [×] |
+----------------------------------------------------------+
| Step 1 of 4: Basic Information                ○──○──○──○ |
+----------------------------------------------------------+
| Job Title *                                               |
| [                                              ] 0/200    |
| Example: "Senior Software Engineer", "Product Manager"   |
|                                                           |
| Department *                                              |
| [Engineering                                   ▼]         |
|                                                           |
| Hiring Manager *                                          |
| [Sarah Thompson (You)                          ▼]         |
|                                                           |
| Job Type *                                                |
| ⦿ Contract (Temporary)                                    |
| ○ Contract-to-Hire                                        |
| ○ Direct Hire (Permanent)                                 |
| ○ Statement of Work (SOW/Project-based)                   |
|                                                           |
| Duration (if Contract) *                                  |
| [6  ] months    (1-24 months)                             |
|                                                           |
| Number of Positions *                                     |
| [1  ] positions                                           |
|                                                           |
| Priority *                                                |
| ⦿ Normal - Standard hiring timeline                       |
| ○ High - Need to fill quickly (within 2 weeks)            |
| ○ Urgent - Critical need (within 1 week)                  |
|                                                           |
| Target Start Date *                                       |
| [MM/DD/YYYY                                     📅]       |
|                                                           |
+----------------------------------------------------------+
|                           [Cancel]  [Next: Details →]     |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 3: Enter Job Title

**User Action:** Type "Senior Full Stack Developer"

**System Response:**
- Text appears in field
- Character counter updates
- System checks for similar job requests (deduplication)

**Field Specification: Job Title**

| Property | Value |
|----------|-------|
| Field Name | `title` |
| Type | Text Input |
| Label | "Job Title" |
| Placeholder | "e.g., Senior Software Engineer" |
| Required | Yes |
| Max Length | 200 characters |
| Validation | Min 3 characters, no special chars except `-`, `()`, `/` |
| Autocomplete | Previous job titles from client history |

**Deduplication Check:**

If similar job exists:
```
⚠️ Similar Job Request Found

We found a similar job request:
"Senior Full Stack Developer" - Engineering Dept.
Status: Active (12 candidates submitted)
Created: Nov 15, 2025

Would you like to:
○ View existing job instead
○ Continue creating new job (different role)

[View Existing Job]  [Continue]
```

**Time:** ~10 seconds

---

### Step 4: Select Department

**User Action:** Click department dropdown, select "Engineering"

**System Response:**
- Dropdown opens with user's accessible departments
- User's primary department pre-selected
- Shows department budget status

**Field Specification: Department**

| Property | Value |
|----------|-------|
| Field Name | `departmentId` |
| Type | Dropdown |
| Label | "Department" |
| Required | Yes |
| Data Source | User's authorized departments |
| Display | Department name + budget indicator |

**Dropdown Options:**
```
Engineering                    ✓ Budget available
Product                        ✓ Budget available
Operations                     ⚠️ Budget 90% used
Marketing                      ✓ Budget available
Sales                          ✓ Budget available
```

**Time:** ~3 seconds

---

### Step 5: Confirm Hiring Manager

**User Action:** Leave default (Sarah Thompson - You)

**System Response:**
- Field shows current user by default
- Can select different manager if authorized

**Field Specification: Hiring Manager**

| Property | Value |
|----------|-------|
| Field Name | `hiringManagerId` |
| Type | Searchable Dropdown |
| Label | "Hiring Manager" |
| Required | Yes |
| Default | Current user |
| Options | Users in same department with hire permission |

**Time:** ~1 second

---

### Step 6: Select Job Type and Duration

**User Action:**
1. Select "Contract (Temporary)"
2. Enter "6" months

**System Response:**
- Duration field appears (conditional on Contract selection)
- Rate type hint shown: "You'll specify hourly rate in next step"

**Field Specification: Job Type**

| Property | Value |
|----------|-------|
| Field Name | `jobType` |
| Type | Radio Button Group |
| Options | Contract, Contract-to-Hire, Direct Hire, SOW |

**Field Specification: Duration**

| Property | Value |
|----------|-------|
| Field Name | `durationMonths` |
| Type | Number Input |
| Visible | Only when job type = Contract or Contract-to-Hire |
| Min | 1 month |
| Max | 24 months |
| Default | 6 months |

**Time:** ~5 seconds

---

### Step 7: Set Priority and Start Date

**User Action:**
1. Select "High - Need to fill quickly"
2. Click calendar, select Dec 15, 2025

**System Response:**
- Priority selection updates
- Calendar opens, user picks date
- System calculates recruitment timeline

**Priority Timeline Estimation:**
```
Based on priority "High", estimated timeline:
- Job posted to InTime: Today (Nov 30)
- Initial candidates: 3-5 days
- Interviews: 5-7 days
- Offer/Start: 10-14 days

Expected fill date: Dec 10-14, 2025 ✓ Meets your target
```

**Time:** ~10 seconds

---

### Step 8: Click "Next" to Requirements

**User Action:** Click [Next: Details →]

**System Response:**
- Validates Step 1 fields
- Slides to Step 2
- Auto-saves draft

**Screen State:**
```
+----------------------------------------------------------+
|                                   Create Job Request  [×] |
+----------------------------------------------------------+
| Step 2 of 4: Job Requirements              ●──○──○──○    |
+----------------------------------------------------------+
| Required Skills *                                         |
| [+ Add skill                                           ]  |
| (Add at least 3 required skills)                          |
|                                                           |
| Nice-to-Have Skills                                       |
| [+ Add skill                                           ]  |
| (Optional additional skills)                              |
|                                                           |
| Years of Experience *                                     |
| Min: [5  ] years    Max: [10 ] years                     |
|                                                           |
| Education Requirements                                    |
| [Select minimum education ▼]                              |
| ○ High School / GED                                       |
| ○ Associate Degree                                        |
| ⦿ Bachelor's Degree                                       |
| ○ Master's Degree                                         |
| ○ PhD                                                     |
| ○ No requirement                                          |
|                                                           |
| Certifications (Optional)                                 |
| [+ Add certification                                   ]  |
|                                                           |
| Work Authorization *                                      |
| ☑ US Citizen                                              |
| ☑ Green Card / Permanent Resident                         |
| ☑ H1B Visa                                                |
| ☐ EAD / Work Permit                                       |
| ☐ No restriction (Any status)                             |
|                                                           |
| Location & Remote Policy *                                |
| Location: [San Francisco, CA                           ]  |
|                                                           |
| Work Arrangement:                                         |
| ⦿ Hybrid (3 days/week in office)                          |
| ○ Fully Remote                                            |
| ○ On-site (5 days/week in office)                         |
|                                                           |
| If Hybrid, in-office days: [3  ] days/week                |
|                                                           |
+----------------------------------------------------------+
|               [← Back]  [Cancel]  [Next: Compensation →]  |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 9: Add Required Skills

**User Action:** Click [+ Add skill], type "React", press Enter

**System Response:**
- Autocomplete suggests: React, React Native, React.js
- Tag appears: [React] [×]
- Input clears for next skill

**User Action:** Add "Node.js", "TypeScript", "AWS"

**System Response:**
- Tags appear for each skill

**Field Specification: Required Skills**

| Property | Value |
|----------|-------|
| Field Name | `requiredSkills` |
| Type | Tag Input with Autocomplete |
| Required | Yes (minimum 3) |
| Max Tags | 15 |
| Data Source | InTime skills taxonomy (standardized) |
| Allow Custom | Yes (with approval) |

**Validation:**
- Minimum 3 required skills
- Maximum 15 skills total
- Duplicate detection

**Time:** ~30 seconds

---

### Step 10: Add Nice-to-Have Skills

**User Action:** Add "GraphQL", "Docker", "MongoDB"

**System Response:**
- Tags appear in nice-to-have section

**Time:** ~20 seconds

---

### Step 11: Set Experience Requirements

**User Action:** Enter Min: 5, Max: 10

**System Response:**
- Numbers entered
- Validation: Max ≥ Min

**Field Specification: Experience**

| Property | Value |
|----------|-------|
| Field Name | `minExperience`, `maxExperience` |
| Type | Number Input |
| Min Value | 0 |
| Max Value | 30 |
| Validation | Max must be ≥ Min |

**Time:** ~5 seconds

---

### Step 12: Select Education and Work Authorization

**User Action:**
1. Select "Bachelor's Degree"
2. Check US Citizen, Green Card, H1B

**System Response:**
- Options selected
- Multiple work authorization types allowed

**Time:** ~10 seconds

---

### Step 13: Set Location and Remote Policy

**User Action:**
1. Enter "San Francisco, CA"
2. Select "Hybrid (3 days/week)"
3. Enter "3" days

**System Response:**
- Location autocomplete (Google Places)
- Remote options shown
- Days field appears

**Time:** ~10 seconds

---

### Step 14: Click "Next" to Compensation

**User Action:** Click [Next: Compensation →]

**System Response:**
- Validates Step 2
- Slides to Step 3

**Screen State:**
```
+----------------------------------------------------------+
|                                   Create Job Request  [×] |
+----------------------------------------------------------+
| Step 3 of 4: Compensation & Budget         ●──●──○──○    |
+----------------------------------------------------------+
| Budget / Rate Information *                               |
|                                                           |
| ⚠️ IMPORTANT: This is your budget, not what InTime charges|
| InTime will add their margin on top of this rate.         |
|                                                           |
| Your Budget (Pay Rate to Consultant):                     |
| Min: [$   90.00  ] /hr    Max: [$  110.00  ] /hr         |
|                                                           |
| 💡 Market Rate Guidance:                                  |
| Based on skills (React, Node.js, AWS) and experience      |
| (5-10 years) in San Francisco, CA:                        |
|                                                           |
| Market Rate: $95-115/hour                                 |
| Your budget: $90-110/hour  ⚠️ Slightly below market       |
|                                                           |
| Recommendation: Consider increasing to $95-115/hr for     |
| competitive positioning.                                  |
|                                                           |
| [Apply Recommended Range]                                 |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Billing Rate Estimate (Including InTime Margin):          |
|                                                           |
| InTime's Bill Rate: $117-143/hour (approx)                |
| (Based on 30% margin - actual rate may vary)              |
|                                                           |
| Total 6-Month Cost Estimate:                              |
| Pay Rate:        $93,600 - $114,400                       |
| InTime Margin:   $28,080 - $34,320                        |
| Total Bill:      $121,680 - $148,720                      |
| (Based on 40 hrs/week × 26 weeks)                         |
|                                                           |
+----------------------------------------------------------+
| Budget Approval                                           |
+----------------------------------------------------------+
| Department Budget:                                        |
| Available:    $500,000                                    |
| Allocated:    $320,000 (64%)                              |
| Remaining:    $180,000 (36%)                              |
|                                                           |
| This job cost: $121,680 - $148,720                        |
| After approval: $31,320 - $58,320 remaining (6-12%)       |
|                                                           |
| ⚠️ This job requires approval from:                       |
| ☐ Department Head (> $100k)                               |
| ☐ Finance (> $100k)                                       |
|                                                           |
+----------------------------------------------------------+
| Additional Compensation Details                           |
|                                                           |
| Benefits Required:                                        |
| ☐ Health Insurance                                        |
| ☐ 401k Match                                              |
| ☐ PTO (Paid Time Off)                                     |
| ☐ None (Contractor - no benefits)                         |
|                                                           |
| Overtime Policy:                                          |
| ⦿ Standard (1.5x after 40 hrs/week)                       |
| ○ No overtime (40 hrs max/week)                           |
| ○ Custom overtime policy                                  |
|                                                           |
| Bonus / Incentives:                                       |
| ○ Yes, performance bonus available                        |
| ⦿ No bonus                                                |
|                                                           |
+----------------------------------------------------------+
|               [← Back]  [Cancel]  [Next: Description →]   |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 15: Enter Budget/Rate

**User Action:** Enter Min: $90, Max: $110

**System Response:**
- Rates entered
- Market rate comparison shown
- Warning: "Slightly below market"
- Total cost calculated automatically

**Market Rate Intelligence:**

System shows:
- Market data from InTime's database
- Regional adjustments (San Francisco premium)
- Skill-based rates (React/Node.js premium)
- Experience-based rates (5-10 years)

**Recommendation:**
```
⚠️ Your budget is 5-10% below market average.
This may reduce candidate pool quality.

Recommended action:
- Increase to $95-115/hr (competitive)
- OR accept longer time-to-fill
- OR be flexible on requirements
```

**User Action:** Click [Apply Recommended Range]

**System Response:**
- Rates update to $95-115/hr
- Warning disappears
- Cost estimate updates

**Time:** ~2 minutes

---

### Step 16: Review Budget Approval Requirements

**System Response (Automatic):**
- Calculates total job cost
- Checks against approval thresholds
- Shows approval workflow if needed

**Approval Rules:**

| Job Cost | Approval Required |
|----------|-------------------|
| < $50,000 | None (auto-approve) |
| $50,000 - $100,000 | Department Head |
| $100,000 - $250,000 | Department Head + Finance |
| > $250,000 | Department Head + Finance + Executive |

**In this case:** $121,680 - $148,720
- Requires Department Head approval ✓
- Requires Finance approval ✓

**Time:** ~30 seconds

---

### Step 17: Click "Next" to Description

**User Action:** Click [Next: Description →]

**System Response:**
- Validates budget fields
- Slides to Step 4 (final step)

**Screen State:**
```
+----------------------------------------------------------+
|                                   Create Job Request  [×] |
+----------------------------------------------------------+
| Step 4 of 4: Job Description           ●──●──●──○        |
+----------------------------------------------------------+
| Job Description *                                         |
+----------------------------------------------------------+
| [                                                      ]  |
| [                                                      ]  |
| [                                                      ]  |
| [                                                      ]  |
| [                                                      ]  |
| [                                                      ]  |
|                                               ] 0/5000    |
|                                                           |
| 💡 Tips for writing effective job descriptions:           |
| • Describe the project/team context                      |
| • Outline key responsibilities (bullet points)            |
| • Mention technologies/tools used                         |
| • Describe team size and structure                        |
| • Include "day in the life" if helpful                    |
|                                                           |
| [Load Template ▼]  [AI: Generate Description]            |
|                                                           |
+----------------------------------------------------------+
| Key Responsibilities (Optional but Recommended)           |
+----------------------------------------------------------+
| [+ Add responsibility                                  ]  |
|                                                           |
| Example:                                                  |
| • Design and implement scalable React components          |
| • Build RESTful APIs using Node.js and Express            |
| • Collaborate with UX designers on user experience        |
|                                                           |
+----------------------------------------------------------+
| Screening Questions (Optional)                            |
+----------------------------------------------------------+
| Add custom questions for InTime recruiters to ask         |
| candidates during pre-screening:                          |
|                                                           |
| [+ Add question                                        ]  |
|                                                           |
| Example:                                                  |
| • Have you worked on real-time dashboards before?         |
| • Describe your experience with AWS Lambda and API Gateway|
|                                                           |
+----------------------------------------------------------+
| Internal Notes (Not visible to candidates)                |
+----------------------------------------------------------+
| [                                                      ]  |
| [                                                      ]  |
|                                               ] 0/1000    |
|                                                           |
| Use this space for:                                       |
| • Replacement for specific person                         |
| • Special requirements or preferences                     |
| • Context InTime recruiters should know                   |
|                                                           |
+----------------------------------------------------------+
| Attachments (Optional)                                    |
+----------------------------------------------------------+
| Upload supporting documents:                              |
| [📎 Drag files here or click to browse]                  |
|                                                           |
| Accepted: PDF, DOC, DOCX (max 10MB each)                 |
|                                                           |
| Examples:                                                 |
| • Detailed project specs                                 |
| • Technical architecture diagrams                         |
| • Existing team org chart                                 |
|                                                           |
+----------------------------------------------------------+
|       [← Back]  [Save as Draft]  [Submit Job Request]    |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 18: Write Job Description

**User Action:** Click [AI: Generate Description]

**System Response:**
- AI modal opens
- Uses info from previous steps
- Generates draft description

**AI-Generated Description (Example):**
```
We are seeking a Senior Full Stack Developer to join our
Engineering team on a 6-month contract basis.

About the Role:
You will work on our customer-facing web application, building
new features using React and Node.js. The ideal candidate has
5-10 years of experience building scalable web applications
and is comfortable working in a fast-paced, agile environment.

Key Responsibilities:
• Design and implement responsive UI components using React
• Build and maintain RESTful APIs using Node.js and Express
• Deploy and manage applications on AWS infrastructure
• Collaborate with product managers and designers
• Write clean, maintainable, well-tested code
• Participate in code reviews and knowledge sharing

Technical Environment:
• Frontend: React, TypeScript, Redux
• Backend: Node.js, Express, PostgreSQL
• Infrastructure: AWS (Lambda, EC2, RDS), Docker
• Tools: Git, GitHub, CI/CD pipelines

Team Structure:
You'll join a team of 8 engineers (3 senior, 5 mid-level)
reporting to the Engineering Manager. We follow agile/scrum
methodology with 2-week sprints.

Work Arrangement:
Hybrid - 3 days/week in our San Francisco office
```

**User Action:** Review and edit as needed, click [Accept]

**System Response:**
- Description populated
- Character count updates

**Time:** ~3-5 minutes

---

### Step 19: Add Key Responsibilities (Optional)

**User Action:** Click [+ Add responsibility]

**System Response:**
- New input field appears
- Can add multiple responsibilities

**User Action:** Add 5 key responsibilities

**Responsibilities Added:**
1. Design and implement scalable React components
2. Build RESTful APIs using Node.js and Express
3. Write comprehensive unit and integration tests
4. Collaborate with UX designers on user experience
5. Mentor junior developers on best practices

**Time:** ~2 minutes

---

### Step 20: Add Screening Questions

**User Action:** Click [+ Add question]

**User Action:** Add 3 screening questions:

1. "Describe a complex React application you built. What challenges did you face?"
2. "How have you optimized Node.js API performance in production?"
3. "What's your experience deploying applications to AWS?"

**System Response:**
- Questions saved
- Will be provided to InTime recruiters for pre-screening

**Time:** ~3 minutes

---

### Step 21: Add Internal Notes

**User Action:** Type internal notes

**Example:**
```
This is a replacement for David who is transitioning to another
team in January. Need someone who can hit the ground running
with minimal ramp-up time.

Preference: Candidate with e-commerce experience (nice-to-have).

Timeline is tight - we have a major release in March that this
person will support.

Please prioritize candidates who can start by Dec 15.
```

**Time:** ~2 minutes

---

### Step 22: Upload Attachments (Optional)

**User Action:** Drag and drop "Project_Architecture.pdf"

**System Response:**
- File upload progress bar
- File appears in attachments list
- [×] to remove

**Attachments:**
- Project_Architecture.pdf (2.3 MB) [×]

**Time:** ~30 seconds

---

### Step 23: Review Complete Job Request

**User Action:** Scroll to top, review all sections

**System Response:**
- Shows validation status for all steps
- Highlights any missing required fields

**Validation Summary:**
```
✓ Step 1: Basic Information - Complete
✓ Step 2: Job Requirements - Complete
✓ Step 3: Compensation - Complete (Approval required)
✓ Step 4: Description - Complete

Ready to submit!
```

**Time:** ~1-2 minutes

---

### Step 24: Submit Job Request

**User Action:** Click [Submit Job Request]

**System Response:**
- Final confirmation modal appears

**Confirmation Modal:**
```
+----------------------------------------------------------+
| Submit Job Request                                    [×] |
+----------------------------------------------------------+
| You are about to submit:                                  |
|                                                           |
| Job Title: Senior Full Stack Developer                   |
| Department: Engineering                                   |
| Duration: 6 months                                        |
| Budget: $95-115/hour                                      |
| Total Cost: $124,020 - $150,280                           |
|                                                           |
| ⚠️ APPROVAL REQUIRED                                      |
|                                                           |
| This job requires approval from:                          |
| 1. Tom Wilson (Department Head) - 2 business days         |
| 2. Finance Team - 3 business days                         |
|                                                           |
| Estimated approval timeline: 5-7 business days            |
|                                                           |
| Once approved, InTime will:                               |
| 1. Review job requirements                                |
| 2. Begin sourcing candidates                              |
| 3. Submit initial candidates within 3-5 days              |
|                                                           |
| Next Steps:                                               |
| • You'll receive email confirmation                       |
| • Track approval status in your dashboard                 |
| • Approval notifications sent to approvers                |
| • You'll be notified when approved                        |
|                                                           |
| ☐ I confirm all information is accurate                   |
|                                                           |
+----------------------------------------------------------+
|              [Go Back & Edit]  [Submit Job Request]       |
+----------------------------------------------------------+
```

**User Action:** Check confirmation box, click [Submit Job Request]

**System Response:**
1. Button shows loading state
2. API call: `POST /api/client/jobs`
3. On success:
   - Success animation (confetti or checkmark)
   - Toast: "Job request submitted successfully!"
   - Emails sent:
     - User: Confirmation
     - Department Head: Approval request
     - Finance: FYI (pending dept head approval)
     - InTime Account Manager: New job notification
   - Job status: "pending_approval"
   - Approval workflow created
4. Modal closes
5. Redirects to job detail page

**Screen State (Job Detail - Pending Approval):**
```
+----------------------------------------------------------+
| Job Request: Senior Full Stack Developer      [Edit] [×] |
+----------------------------------------------------------+
| Status: 🟡 Pending Approval                               |
|                                                           |
| Your job request has been submitted and is awaiting       |
| approval from:                                            |
|                                                           |
| ┌─────────────────────────────────────────────────────┐  |
| │ Approval Workflow                                    │  |
| │                                                      │  |
| │ ✓ Step 1: You submitted (Nov 30, 2025)              │  |
| │                                                      │  |
| │ ○ Step 2: Department Head approval                  │  |
| │   Tom Wilson - Pending                               │  |
| │   Due: Dec 2, 2025 (2 business days)                 │  |
| │   [Send Reminder]                                    │  |
| │                                                      │  |
| │ ○ Step 3: Finance approval                           │  |
| │   Finance Team - Waiting for Step 2                  │  |
| │   Due: Dec 5, 2025 (after dept head)                 │  |
| │                                                      │  |
| │ ○ Step 4: InTime activation                          │  |
| │   Amy Chen (Account Manager)                         │  |
| │   Starts: After all approvals                        │  |
| │                                                      │  |
| └─────────────────────────────────────────────────────┘  |
|                                                           |
| Estimated Activation: Dec 6-8, 2025                       |
|                                                           |
+----------------------------------------------------------+
| Job Details                             [View Full Details]|
+----------------------------------------------------------+
| Title: Senior Full Stack Developer                        |
| Department: Engineering                                   |
| Type: Contract - 6 months                                 |
| Start Date: Dec 15, 2025                                  |
| Budget: $95-115/hour                                      |
| Required Skills: React, Node.js, TypeScript, AWS          |
|                                                           |
| [View Complete Job Request]                               |
+----------------------------------------------------------+
| Actions                                                   |
+----------------------------------------------------------+
| [📧 Contact Approver]  [✏️ Edit Request]  [❌ Withdraw]   |
|                                                           |
| Note: You can edit the request until it's approved.       |
| Withdrawing will cancel the approval workflow.            |
+----------------------------------------------------------+
```

**Time:** ~5-10 seconds

---

## Postconditions

1. ✅ Job request created in database with status "pending_approval"
2. ✅ Approval workflow triggered
3. ✅ Approvers notified via email
4. ✅ User receives confirmation email
5. ✅ InTime account manager notified (FYI, pending approval)
6. ✅ Budget allocated (provisional, pending approval)
7. ✅ Activity logged: "job_request.created"
8. ✅ User can track approval status in dashboard

---

## Events Logged

| Event | Payload |
|-------|---------|
| `job_request.created` | `{ job_id, title, department, budget, created_by, timestamp }` |
| `approval_workflow.started` | `{ job_id, approvers[], estimated_timeline, timestamp }` |
| `notification.sent` | `{ recipient: approver_id, type: 'approval_request', timestamp }` |
| `budget.allocated` | `{ department_id, amount, job_id, status: 'provisional', timestamp }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Budget Exceeded | Department budget insufficient | "Insufficient budget. $180k available, $148k needed." | Request budget increase or reduce scope |
| Duplicate Job | Similar active job exists | "Similar job already active. View existing?" | View existing or proceed |
| Missing Required Field | Validation failed | "Please complete all required fields" | Fill in highlighted fields |
| Approval Authority | User lacks permission | "You need approval to create jobs > $100k" | Submit for pre-approval |
| Network Error | API timeout | "Failed to submit job request" | [Retry] button |
| Invalid Rate | Rate below minimum | "Rate $50/hr below minimum $80/hr for this role" | Increase rate |

---

## Budget Approval Workflows

### Scenario 1: Under $50k (Auto-Approve)

1. User submits job
2. System auto-approves
3. Job immediately active
4. InTime begins sourcing
5. Estimated time: Instant

### Scenario 2: $50k - $100k (Department Head)

1. User submits job
2. Department Head receives email
3. Department Head reviews and approves
4. Job activated
5. InTime begins sourcing
6. Estimated time: 1-2 business days

### Scenario 3: $100k - $250k (Dept Head + Finance)

1. User submits job
2. Department Head approves (2 days)
3. Finance receives notification
4. Finance approves budget (3 days)
5. Job activated
6. InTime begins sourcing
7. Estimated time: 5-7 business days

### Scenario 4: Over $250k (Dept Head + Finance + Executive)

1. User submits job
2. Department Head approves (2 days)
3. Finance approves (3 days)
4. Executive approval (5 days)
5. Job activated
6. InTime begins sourcing
7. Estimated time: 10-14 business days

---

## Alternative Flows

### A1: Save as Draft

**User Action:** Click [Save as Draft] at any step

**System Response:**
1. Draft saved to database
2. Toast: "Draft saved"
3. User can continue later
4. Draft appears in "Draft (3)" tab
5. Auto-save every 2 minutes

**Resume Draft:**
1. Navigate to Jobs → Draft tab
2. Click [Continue Editing]
3. Returns to last completed step
4. Can complete and submit

---

### A2: Clone Existing Job

**User Action:** From Jobs list, click [Clone] on existing job

**System Response:**
1. New job form opens
2. All fields pre-populated from original
3. Title appended with "- Copy"
4. User can edit as needed
5. Submit as new job

**Use Case:** Hiring same role in different department or time period

---

### A3: Use Job Template

**User Action:** Click [Load Template] in description field

**System Response:**
- Template selector appears
- Shows pre-defined templates:
  - Software Engineer Template
  - Product Manager Template
  - Data Analyst Template
  - DevOps Engineer Template
  - Custom templates (if client created)

**User Action:** Select "Software Engineer Template"

**System Response:**
- Description field populated with template
- Responsibilities pre-filled
- Screening questions suggested
- User can customize

---

### A4: Request Budget Increase

**User Action:** If budget exceeded, click [Request Budget Increase]

**System Response:**
- Budget increase request form opens
- Shows current vs needed
- Requires business justification
- Sends to Finance for approval

**Flow:**
1. Submit budget increase request
2. Finance reviews (2-3 days)
3. If approved: Proceed with job request
4. If denied: Reduce scope or cancel

---

### A5: Expedited Approval (Urgent Jobs)

**User Action:** Select Priority: "Urgent"

**System Response:**
- Warning: "Expedited approval requires VP approval"
- VP added to approval chain
- SLA reduced: 1 day per approver
- Higher urgency notifications sent

**Use Case:** Critical production issue, key person resigned unexpectedly

---

## Job Request Templates

Client can create custom templates for common roles:

**Template Structure:**
```typescript
interface JobTemplate {
  id: string;
  name: string;
  clientId: string;
  category: string;

  // Pre-filled fields
  jobType: string;
  durationMonths?: number;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  minExperience: number;
  maxExperience: number;
  education: string;
  description: string;
  responsibilities: string[];
  screeningQuestions: string[];

  // Budget guidance
  suggestedMinRate: number;
  suggestedMaxRate: number;
}
```

**Benefits:**
- Consistent job requests
- Faster creation (1-click pre-fill)
- Ensures compliance with company standards
- Reduces errors

---

## Market Rate Intelligence

**Data Sources:**
- InTime's historical placement data
- Regional salary surveys
- Industry benchmarks
- Real-time market trends

**Calculation:**
```typescript
function calculateMarketRate(job: JobRequest): MarketRate {
  const baseRate = getBaseRateForRole(job.title);

  // Adjust for experience
  const experienceMultiplier =
    1 + (job.minExperience - 3) * 0.05; // +5% per year > 3

  // Adjust for location
  const locationMultiplier = getLocationIndex(job.location);
  // San Francisco: 1.3x, New York: 1.25x, Austin: 1.1x

  // Adjust for skills
  const skillPremium = calculateSkillPremium(job.requiredSkills);
  // High-demand skills (React, AWS): +10-15%

  const marketRate = baseRate *
    experienceMultiplier *
    locationMultiplier *
    (1 + skillPremium);

  return {
    min: marketRate * 0.9,
    max: marketRate * 1.1,
    median: marketRate,
    confidence: calculateConfidence()
  };
}
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd/Ctrl+S` | Save draft |
| `Cmd/Ctrl+Enter` | Submit job request (on final step) |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Esc` | Close modal (with confirmation) |

---

## Related Use Cases

- [01-portal-dashboard.md](./01-portal-dashboard.md) - Dashboard shows job requests
- [02-review-candidates.md](./02-review-candidates.md) - Review candidates for job
- [03-schedule-interview.md](./03-schedule-interview.md) - Schedule interviews for job

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Submit job under $50k budget | Auto-approved, immediately active |
| TC-002 | Submit job over $100k budget | Approval workflow triggered |
| TC-003 | Submit with missing required fields | Validation errors shown |
| TC-004 | Submit duplicate job title | Warning shown, can proceed or cancel |
| TC-005 | Save draft and resume later | All fields restored correctly |
| TC-006 | Use market rate recommendation | Rates updated to recommended range |
| TC-007 | Upload 15MB attachment | Error: "File too large (max 10MB)" |
| TC-008 | Clone existing job | All fields copied, title appended "-Copy" |
| TC-009 | Submit urgent priority job | Expedited approval workflow triggered |
| TC-010 | AI generate description | Description populated based on inputs |

---

*Last Updated: 2025-11-30*
