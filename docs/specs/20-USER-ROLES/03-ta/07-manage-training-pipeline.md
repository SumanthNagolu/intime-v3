# UC-TA-007: Manage Training Pipeline (Academy Enrollments)

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** TA Specialist
**Status:** Approved

---

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-TA-007 |
| Actor | TA Specialist |
| Goal | Manage Academy training program enrollments from application to placement |
| Frequency | Weekly (ongoing pipeline management) |
| Estimated Time | 2-3 hours per week |
| Priority | High |

---

## Actors

- **Primary:** TA Specialist
- **Secondary:** Academy Instructor, Bench Sales Rep, TA Manager
- **System:** Academy module, CRM, Email automation, Payment gateway

---

## Preconditions

1. User is logged in as TA Specialist
2. User has "enrollment.create" and "enrollment.manage" permissions
3. Academy training programs exist and are published
4. Training leads have been generated (from [UC-TA-005](./05-generate-leads.md))
5. Pricing and program details are defined

---

## Trigger

One of the following:
- Lead interested in training program (from qualification call)
- Inbound application received (website form)
- Corporate client requesting bulk training
- Referral from employee or partner
- Marketing campaign generating training interest

---

## Main Flow: Individual Training Enrollment

### Step 1: Navigate to Training Pipeline

**User Action:** Navigate to `/employee/workspace/training` or click "Training" in sidebar

**System Response:**
```
┌──────────────────────────────────────────────────────────────┐
│ Academy Training Pipeline                    [+ New Enrollment]│
├──────────────────────────────────────────────────────────────┤
│ Applications │ Screening │ Enrolled │ In Progress │ Completed │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ 📊 PIPELINE METRICS                                           │
│ ┌─────────────┬─────────────┬─────────────┬─────────────┐    │
│ │ Applications│  Screening  │  Enrolled   │  Completed  │    │
│ │     12      │      8      │     15      │     42      │    │
│ │   +3 week   │   +2 week   │   +4 week   │  +8 month   │    │
│ └─────────────┴─────────────┴─────────────┴─────────────┘    │
│                                                               │
│ 🎯 THIS WEEK'S FOCUS                                          │
│ → 5 applications awaiting screening                          │
│ → 3 interviews scheduled                                      │
│ → 2 enrollments awaiting payment                             │
│ → 1 cohort starting next Monday (Java Bootcamp)              │
│                                                               │
│ 📋 ACTIVE PROGRAMS                                            │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Program                    Cohort    Seats    Start Date  │ │
│ ├──────────────────────────────────────────────────────────┤ │
│ │ Full Stack Dev Bootcamp    FSB-025  12/20    Mar 1, 2025 │ │
│ │ Java Developer Bootcamp    JDB-018   8/15    Mar 15, 2025│ │
│ │ Python Data Analytics      PDA-012   5/12    Apr 1, 2025  │ │
│ │ DevOps Engineering         DOE-009   3/10    Apr 15, 2025 │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ [View All Programs]  [Enrollment Report]  [Update Schedule]  │
└──────────────────────────────────────────────────────────────┘
```

**Time:** 2 seconds

---

### Step 2: Review New Applications

**User Action:** Click "Applications" tab

**System Response:**
```
┌──────────────────────────────────────────────────────────────┐
│ Training Applications (12 New)                               │
├──────────────────────────────────────────────────────────────┤
│ Filters: [Status ▼] [Program ▼] [Date Range] [🔍 Search]    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 📝 NEW APPLICATION                                        │ │
│ │ ──────────────────────────────────────────────────────────│ │
│ │ Name: Rajesh Kumar                                        │ │
│ │ Email: rajesh.kumar@email.com                             │ │
│ │ Phone: (408) 555-1234                                     │ │
│ │ Program Interest: Full Stack Dev Bootcamp                 │ │
│ │ Current Status: Software Tester (5 years exp)             │ │
│ │ Work Authorization: H1B (valid till Dec 2026)             │ │
│ │ Submitted: 2 days ago                                     │ │
│ │                                                           │ │
│ │ Application Score: ⭐⭐⭐⭐ (82/100)                       │ │
│ │ ├─ Technical Aptitude: High (previous coding exp)        │ │
│ │ ├─ Commitment: High (full-time available)                │ │
│ │ ├─ Placement Potential: High (H1B, local)                │ │
│ │ └─ Financial: Medium (needs payment plan)                │ │
│ │                                                           │ │
│ │ Why interested?                                           │ │
│ │ "I've been a manual tester for 5 years and want to       │ │
│ │  transition to development. I have basic coding skills   │ │
│ │  (HTML, CSS, JavaScript) and am ready to commit full-time│ │
│ │  to a structured program."                               │ │
│ │                                                           │ │
│ │ [View Full Application]  [Schedule Screen]  [Reject]     │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ [More Applications Below...]                                  │
└──────────────────────────────────────────────────────────────┘
```

**Application Field Specifications:**

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `firstName` | String | Yes | min:1, max:50 | - |
| `lastName` | String | Yes | min:1, max:50 | - |
| `email` | Email | Yes | Valid email | Primary contact |
| `phone` | Phone | Yes | E.164 format | Mobile preferred |
| `programInterest` | Enum | Yes | Valid program ID | Which bootcamp |
| `currentRole` | String | No | max:200 | Current job title |
| `yearsExperience` | Number | No | 0-50 | Work experience |
| `education` | String | No | max:500 | Degree, school |
| `technicalBackground` | Text | No | max:2000 | Coding experience |
| `workAuthorization` | Enum | Yes | See visa types | US/Canada work auth |
| `visaExpiryDate` | Date | Conditional | Future date | If visa-based |
| `availability` | Enum | Yes | full_time, part_time | Commitment level |
| `availableStartDate` | Date | Yes | Future date | When can start |
| `motivationStatement` | Text | Yes | min:50, max:2000 | Why interested |
| `financialSituation` | Enum | No | upfront, payment_plan | Payment preference |
| `referralSource` | String | No | max:200 | How heard about us |

**Time:** 2-3 minutes per application review

---

### Step 3: Schedule Screening Interview

**User Action:** Click "Schedule Screen" on high-scoring application

**System Response:**
```
┌──────────────────────────────────────────────────────────────┐
│ Schedule Screening Interview: Rajesh Kumar                   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ Interview Type:                                               │
│ ● Initial Screening (30 min)                                 │
│ ○ Technical Assessment (60 min)                              │
│                                                               │
│ Interviewer: *                                                │
│ [Me (TA Specialist)                                      ▼]  │
│                                                               │
│ Suggested Times:                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Based on your calendar availability:                     │ │
│ │ ○ Tomorrow, 2:00 PM - 2:30 PM EST                        │ │
│ │ ○ Tomorrow, 4:00 PM - 4:30 PM EST                        │ │
│ │ ● Friday, 10:00 AM - 10:30 AM EST                        │ │
│ │ ○ Friday, 2:00 PM - 2:30 PM EST                          │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ Or select custom time: [📅 Calendar Picker]                  │
│                                                               │
│ Meeting Link:                                                 │
│ ● Auto-generate Zoom link                                    │
│ ○ Use custom link: [____________________]                    │
│                                                               │
│ Email Template: [Screening Interview Invite              ▼]  │
│                                                               │
│ Preview:                                                      │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Subject: Training Program Screening - InTime Academy     │ │
│ │                                                          │ │
│ │ Hi Rajesh,                                               │ │
│ │                                                          │ │
│ │ Thank you for applying to our Full Stack Developer      │ │
│ │ Bootcamp! We'd love to learn more about your background │ │
│ │ and goals.                                               │ │
│ │                                                          │ │
│ │ I've scheduled a 30-minute screening call:              │ │
│ │ Date: Friday, March 1, 2025                             │ │
│ │ Time: 10:00 AM EST                                       │ │
│ │ Join Zoom: [Zoom Link]                                   │ │
│ │                                                          │ │
│ │ We'll discuss:                                           │ │
│ │ → Your technical background and goals                   │ │
│ │ → Program curriculum and expectations                   │ │
│ │ → Logistics (schedule, payment, placement)              │ │
│ │                                                          │ │
│ │ Please come prepared with questions!                    │ │
│ │                                                          │ │
│ │ Best,                                                    │ │
│ │ [Your Name]                                              │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ [Cancel]                              [Schedule & Send Email] │
└──────────────────────────────────────────────────────────────┘
```

**System Processing:**
1. Create calendar event (Google Calendar integration)
2. Generate Zoom meeting link
3. Create interview record in database
4. Send email to candidate
5. Add reminder 24 hours before interview
6. Update application status to "Screening Scheduled"

**Time:** 2-3 minutes

---

### Step 4: Conduct Screening Interview

**Interview Framework:**

```
┌──────────────────────────────────────────────────────────────┐
│ TRAINING SCREENING INTERVIEW GUIDE (30 min)                  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ 1. OPENING (2 min)                                            │
│    "Hi Rajesh, thanks for your interest in our program.      │
│     I've reviewed your application. Let me tell you about    │
│     the program, then I'd love to hear more about you."      │
│                                                               │
│ 2. PROGRAM OVERVIEW (5 min)                                   │
│    → Duration: 12 weeks full-time (40 hrs/week)              │
│    → Format: Live online classes + hands-on projects         │
│    → Curriculum: [Specific tech stack for program]           │
│    → Outcomes: Job placement support, 70%+ placement rate    │
│    → Cost: $8,000 ($1,000 deposit, balance before start)     │
│                                                               │
│ 3. CANDIDATE BACKGROUND (8 min)                               │
│    Questions:                                                 │
│    □ "Tell me about your current role and technical work"    │
│    □ "What coding experience do you have? (languages, tools)"│
│    □ "Walk me through a technical project you've done"       │
│    □ "Why do you want to transition to development?"         │
│    □ "What's your learning style? How do you learn best?"    │
│                                                               │
│ 4. COMMITMENT & LOGISTICS (8 min)                             │
│    Questions:                                                 │
│    □ "Can you commit 40 hours/week for 12 weeks?"            │
│    □ "What's your current work situation? (notice period?)"  │
│    □ "Do you have a quiet space for remote learning?"        │
│    □ "What's your timeline? When could you start?"           │
│    □ "Work authorization status? Any visa concerns?"         │
│                                                               │
│ 5. FINANCIAL QUALIFICATION (3 min)                            │
│    □ "Have you reviewed the program cost ($8,000)?"          │
│    □ "How do you plan to fund the program?"                  │
│       Options: Upfront, Payment plan, Employer sponsorship   │
│    □ "Any questions about payment options?"                  │
│                                                               │
│ 6. ASSESSMENT & FIT (2 min)                                   │
│    □ "On a scale of 1-10, how committed are you to this?"    │
│    □ "What concerns or hesitations do you have?"             │
│    □ "What questions do you have for me?"                    │
│                                                               │
│ 7. NEXT STEPS (2 min)                                         │
│    If Good Fit:                                              │
│    "I think you'd be a great fit. Next steps:               │
│     1. You'll receive technical assessment (2 hours)         │
│     2. We'll review results within 48 hours                  │
│     3. If approved, we'll send enrollment agreement          │
│     4. Deposit secures your seat                             │
│     Does that timeline work for you?"                        │
│                                                               │
│    If Not a Fit:                                             │
│    "Based on our conversation, I think [reason]. I'd         │
│     recommend [alternative path]. Happy to stay in touch."   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**During Call - Live Screening Form:**

**User Action:** Open candidate record, click "Start Screening"

```
┌──────────────────────────────────────────────────────────────┐
│ Live Screening: Rajesh Kumar                                 │
│ [● Recording] Duration: 00:15:23                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ TECHNICAL BACKGROUND:                                         │
│ [Capture notes about coding experience, projects...]         │
│ ✓ Has basic JavaScript, HTML, CSS                            │
│ ✓ Built personal portfolio website                           │
│ ✓ Some Python from testing automation                        │
│ ⚠ No experience with React (but motivated to learn)          │
│                                                               │
│ COMMITMENT:                                                   │
│ Full-time availability: ● Yes  ○ No                          │
│ Can start by: [March 15, 2025               ] [📅]          │
│ Learning environment: ● Quiet space  ○ Concerns              │
│ Commitment level (1-10): [9  ]                               │
│                                                               │
│ WORK AUTHORIZATION:                                           │
│ Status: [H1B                                              ▼] │
│ Expiry: [Dec 31, 2026                ] [📅]                  │
│ Concerns: ○ Yes  ● No                                        │
│                                                               │
│ FINANCIAL:                                                    │
│ Payment plan: ● Upfront  ○ Payment plan  ○ Employer funded  │
│ Budget confirmed: ● Yes  ○ Needs to discuss                  │
│                                                               │
│ SCREENING SCORE:                                              │
│ Technical Aptitude:    [████████░░] 8/10                     │
│ Commitment:            [█████████░] 9/10                     │
│ Placement Potential:   [████████░░] 8/10                     │
│ Financial Ready:       [██████████] 10/10                    │
│ Overall Fit:           [████████░░] 8.5/10                   │
│                                                               │
│ RECOMMENDATION:                                               │
│ ● APPROVED - Send Technical Assessment                       │
│ ○ CONDITIONAL - Needs [X] before approval                    │
│ ○ WAITLIST - Good fit, no current seats                      │
│ ○ REJECTED - Not a fit (reason: _____________)               │
│                                                               │
│ NOTES:                                                        │
│ [Strong candidate. Motivated, has budget ready, realistic    │
│  timeline. Recommend for Full Stack Bootcamp starting        │
│  March 15. Send technical assessment today.]                 │
│                                                               │
│ [Save Notes]  [Send Assessment]  [Schedule Follow-up]        │
└──────────────────────────────────────────────────────────────┘
```

**Time:** 30-35 minutes (call + notes)

---

### Step 5: Send Technical Assessment

**User Action:** Click "Send Assessment"

**System Response:**
```
✓ Technical Assessment Email Sent

Email sent to: rajesh.kumar@email.com

Assessment Details:
→ Platform: HackerRank / Codility
→ Duration: 2 hours
→ Topics: JavaScript basics, problem-solving, algorithms
→ Deadline: 48 hours from now
→ Pass threshold: 60%

Candidate will receive:
→ Assessment link
→ Instructions
→ Practice questions
→ Support contact if issues

[View Assessment Dashboard]
```

**Assessment Components:**

```
FULL STACK BOOTCAMP - TECHNICAL ASSESSMENT (2 hours)

Part 1: JavaScript Fundamentals (30 min)
├─ Variables, data types, operators
├─ Functions and scope
├─ Arrays and objects
├─ Loops and conditionals
└─ 10 multiple choice questions

Part 2: Problem Solving (60 min)
├─ Algorithm challenge 1: Array manipulation
├─ Algorithm challenge 2: String processing
├─ Algorithm challenge 3: Data structure (simple)
└─ 3 coding problems (JavaScript)

Part 3: HTML/CSS (20 min)
├─ Build simple webpage from mockup
├─ Use flexbox/grid layout
└─ 1 practical exercise

Part 4: Scenario Questions (10 min)
├─ "How would you debug this code?"
├─ "Explain how you would approach learning X"
└─ 3 open-ended questions

Scoring:
→ Part 1: 20 points
→ Part 2: 50 points (main weight)
→ Part 3: 20 points
→ Part 4: 10 points
→ Pass: 60/100
→ Strong: 75/100
```

**Time:** 5 minutes

---

### Step 6: Review Assessment Results

**Trigger:** Candidate completes assessment, system sends notification

**User Action:** Navigate to candidate record, view assessment results

**System Response:**
```
┌──────────────────────────────────────────────────────────────┐
│ Assessment Results: Rajesh Kumar                             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ OVERALL SCORE: 72/100 ✅ PASS                                │
│                                                               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Part 1: JavaScript Fundamentals         16/20 (80%)     │ │
│ │ ├─ Strong understanding of basics                        │ │
│ │ ├─ Missed 2 questions on scope/closures                  │ │
│ │ └─ Good foundation to build on                           │ │
│ │                                                          │ │
│ │ Part 2: Problem Solving                 35/50 (70%)     │ │
│ │ ├─ Challenge 1 (Array): Solved correctly                │ │
│ │ ├─ Challenge 2 (String): Partial solution               │ │
│ │ └─ Challenge 3 (Data): Struggled, but good approach     │ │
│ │                                                          │ │
│ │ Part 3: HTML/CSS                        15/20 (75%)     │ │
│ │ ├─ Layout correct, minor styling issues                 │ │
│ │ └─ Demonstrates practical web skills                    │ │
│ │                                                          │ │
│ │ Part 4: Scenario                         6/10 (60%)     │ │
│ │ └─ Thoughtful answers, learning mindset                 │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ INSTRUCTOR RECOMMENDATION:                                    │
│ ✅ APPROVE FOR ENROLLMENT                                    │
│                                                               │
│ Strengths:                                                    │
│ → Solid JavaScript fundamentals                              │
│ → Problem-solving mindset                                     │
│ → Practical web development experience                       │
│                                                               │
│ Areas for Growth (will cover in program):                    │
│ → Advanced JavaScript concepts (closures, async)             │
│ → Algorithm optimization                                      │
│ → Modern frameworks (React)                                   │
│                                                               │
│ [Approve & Send Enrollment]  [Request Re-Test]  [Reject]    │
└──────────────────────────────────────────────────────────────┘
```

**Time:** 10 minutes

---

### Step 7: Create Enrollment

**User Action:** Click "Approve & Send Enrollment"

**System Response:**
```
┌──────────────────────────────────────────────────────────────┐
│ Create Enrollment: Rajesh Kumar                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ Program Selection: *                                          │
│ [Full Stack Developer Bootcamp - FSB-025             ▼]     │
│ Cohort: FSB-025                                              │
│ Start Date: March 15, 2025                                   │
│ End Date: June 7, 2025                                       │
│ Seats Available: 12/20                                       │
│                                                               │
│ Pricing:                                                      │
│ Base Tuition: $8,000                                         │
│ Discounts:                                                    │
│ □ Early Bird (10% off): -$800 [Deadline: Feb 1]             │
│ □ Referral Discount (5% off): -$400                          │
│ □ Employer Sponsored: [Custom amount]                        │
│ ─────────────────────────────────                            │
│ Total Due: $8,000                                            │
│                                                               │
│ Payment Plan: *                                               │
│ ● Upfront (Full payment before start)                       │
│ ○ Payment Plan (Deposit + 2 installments)                   │
│   └─ $1,000 deposit (due now)                               │
│   └─ $3,500 (due Week 4)                                    │
│   └─ $3,500 (due Week 8)                                    │
│                                                               │
│ Deposit Amount: $1,000 (secures seat)                        │
│ Due Date: 7 days from enrollment                             │
│                                                               │
│ Enrollment Agreement:                                         │
│ ☑ Send enrollment agreement for e-signature                  │
│ ☑ Include program policies and refund terms                  │
│ ☑ Include payment schedule                                   │
│                                                               │
│ Next Steps:                                                   │
│ 1. Candidate receives enrollment agreement (DocuSign)        │
│ 2. Candidate signs agreement                                 │
│ 3. Deposit payment link sent (Stripe)                        │
│ 4. Upon payment, seat confirmed                              │
│ 5. Pre-work materials sent (2 weeks before start)            │
│                                                               │
│ [Cancel]                            [Create Enrollment]       │
└──────────────────────────────────────────────────────────────┘
```

**System Processing:**
1. Create enrollment record (status: "Agreement Pending")
2. Generate enrollment agreement (PDF)
3. Send to DocuSign for signature
4. Send payment link (Stripe Checkout)
5. Create activity timeline
6. Notify TA Manager
7. Reserve seat in cohort
8. Send welcome email to candidate

**Enrollment Field Specifications:**

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `candidateId` | UUID | Yes | Valid candidate | Applicant |
| `programId` | UUID | Yes | Valid program | Bootcamp |
| `cohortId` | UUID | Yes | Active cohort | Specific cohort |
| `startDate` | Date | Yes | Future date | Cohort start |
| `endDate` | Date | Yes | > startDate | Cohort end |
| `tuitionAmount` | Currency | Yes | > 0 | Full tuition |
| `discountAmount` | Currency | No | >= 0 | Discounts applied |
| `totalDue` | Currency | Auto | Calculated | Tuition - discounts |
| `depositAmount` | Currency | Yes | > 0 | Initial deposit |
| `paymentPlan` | Enum | Yes | upfront, installment | Payment type |
| `enrollmentStatus` | Enum | Auto | See statuses | Current status |
| `agreementSignedDate` | Date | Auto | - | When signed |
| `depositPaidDate` | Date | Auto | - | When deposit paid |

**Enrollment Statuses:**
- `agreement_pending` - Waiting for signature
- `agreement_signed` - Signed, awaiting deposit
- `deposit_paid` - Deposit received, seat confirmed
- `enrolled` - Fully enrolled, ready to start
- `in_progress` - Program started
- `completed` - Successfully finished
- `withdrawn` - Student withdrew
- `failed` - Did not complete

**Time:** 5-7 minutes

---

### Step 8: Track Enrollment Progress

**System sends automated emails:**

```
Day 1: Enrollment Agreement Sent
─────────────────────────────────
Subject: Welcome to InTime Academy!

Hi Rajesh,

Congratulations! You've been accepted into our Full Stack
Developer Bootcamp (Cohort FSB-025, starting March 15).

Next Steps:
1. Sign enrollment agreement: [DocuSign Link]
2. Pay $1,000 deposit (secures your seat): [Payment Link]
3. Complete pre-work (2 weeks before start)

Questions? Reply to this email or call me at [phone].

Looking forward to your success!
[TA Specialist Name]

─────────────────────────────────
Day 3: Reminder (if not signed)
─────────────────────────────────
Subject: Action Needed: Enrollment Agreement

Hi Rajesh,

Quick reminder - your enrollment agreement is waiting for
your signature. Your seat is reserved for 7 days.

[Sign Agreement Now]

Need help? Let me know!

─────────────────────────────────
Day 7: Final Reminder
─────────────────────────────────
Subject: Last Day: Secure Your Seat

Hi Rajesh,

Today is the last day to secure your seat. If we don't
receive your signed agreement and deposit today, we'll
need to offer the seat to the next candidate.

[Complete Enrollment]

Call me if you have any questions or concerns.

─────────────────────────────────
Upon Deposit Payment: Confirmation
─────────────────────────────────
Subject: 🎉 Your Seat is Confirmed!

Hi Rajesh,

Great news! Your deposit has been received and your seat
in the Full Stack Developer Bootcamp is confirmed.

Program Details:
→ Cohort: FSB-025
→ Start Date: March 15, 2025
→ Format: Live online (M-F, 9AM-5PM EST)
→ Instructor: [Instructor Name]

Next Steps:
1. Join Slack workspace: [Invite Link]
2. Set up development environment (guide attached)
3. Complete pre-work (due March 1): [Link]
4. Attend orientation (March 8): [Calendar Invite]

Payment Schedule:
→ Deposit: $1,000 (PAID ✓)
→ Installment 1: $3,500 (due April 12)
→ Installment 2: $3,500 (due May 10)

Welcome to the InTime Academy family!
[TA Specialist Name]
```

**Time:** Automated (0 manual time)

---

## Alternative Flow A: Corporate/Bulk Training

### A1: Company Requesting Training for Employees

**Scenario:** Company wants to train 10-20 employees

**Trigger:** Lead from [UC-TA-005](./05-generate-leads.md) converts to corporate training deal

**User Action:** Navigate to lead, click "Convert to Corporate Training"

**System Response:**
```
┌──────────────────────────────────────────────────────────────┐
│ Corporate Training Enrollment: TechCorp Inc.                 │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ Company: TechCorp Inc.                                       │
│ Contact: Sarah Johnson (VP L&D)                              │
│ Deal Value: $75,000                                          │
│                                                               │
│ Training Requirements:                                        │
│ Program: Custom React/Node.js Bootcamp                       │
│ Cohort Size: 15 employees                                    │
│ Schedule: Evenings (6-9 PM EST) for 8 weeks                 │
│ Start Date: April 1, 2025                                    │
│                                                               │
│ Custom Curriculum:                                            │
│ ☑ Aligned to TechCorp's tech stack                          │
│ ☑ Company-specific projects and use cases                    │
│ ☑ Dedicated Slack channel                                    │
│ ☑ Weekly progress reports to Sarah                           │
│                                                               │
│ Pricing:                                                      │
│ Per-Person: $5,000 × 15 = $75,000                           │
│ Volume Discount (15% for 10+): -$11,250                     │
│ ─────────────────────────                                    │
│ Total: $63,750                                               │
│                                                               │
│ Payment Terms:                                                │
│ 50% upfront ($31,875) - due upon signing                    │
│ 50% upon completion ($31,875) - due June 1                  │
│                                                               │
│ Enrollment Process:                                           │
│ 1. TechCorp provides employee roster (CSV upload)            │
│ 2. TA Specialist creates bulk enrollments                    │
│ 3. System sends individual welcome emails                    │
│ 4. Employees complete pre-work                               │
│ 5. Program starts April 1                                    │
│                                                               │
│ [Upload Roster]  [Generate Contract]  [Create Enrollments]  │
└──────────────────────────────────────────────────────────────┘
```

**Corporate Enrollment Features:**
- Bulk enrollment (CSV upload)
- Custom cohort (dedicated to one company)
- Flexible scheduling (evenings, weekends)
- Branded materials
- Executive reporting
- Volume discounts
- Custom payment terms

**Time:** 30-45 minutes (initial setup) + ongoing coordination

---

## Alternative Flow B: Waitlist Management

### B1: No Available Seats in Desired Cohort

**Scenario:** Candidate qualifies but cohort is full

**User Action:** Click "Add to Waitlist" when creating enrollment

**System Response:**
```
┌──────────────────────────────────────────────────────────────┐
│ Add to Waitlist: Rajesh Kumar                                │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ Current Status:                                               │
│ Full Stack Bootcamp - Cohort FSB-025                         │
│ Start Date: March 15, 2025                                   │
│ Status: FULL (20/20 seats filled)                            │
│                                                               │
│ Waitlist Position: #3                                        │
│                                                               │
│ Options for Candidate:                                        │
│ 1. Join Waitlist (FSB-025 - March 15)                       │
│    → Notified if seat opens (cancellations)                 │
│    → Typical conversion: 20-30%                             │
│                                                               │
│ 2. Enroll in Next Cohort (FSB-026 - April 15)              │
│    → 8 seats available                                       │
│    → Guaranteed enrollment                                   │
│                                                               │
│ 3. Enroll in Alternative Program                             │
│    → Java Bootcamp (JDB-018 - March 22)                    │
│    → Python Analytics (PDA-012 - April 1)                   │
│                                                               │
│ Candidate Preference: *                                      │
│ ● Waitlist for FSB-025 (March 15)                           │
│ ○ Enroll in FSB-026 (April 15)                              │
│ ○ Consider alternative program                               │
│                                                               │
│ Waitlist Email Template:                                      │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Subject: Waitlist Update - Full Stack Bootcamp          │ │
│ │                                                          │ │
│ │ Hi Rajesh,                                               │ │
│ │                                                          │ │
│ │ Great news - you're approved for our Full Stack        │ │
│ │ Bootcamp! However, the March 15 cohort is currently    │ │
│ │ full.                                                    │ │
│ │                                                          │ │
│ │ You're #3 on the waitlist. If a seat opens (due to     │ │
│ │ cancellation), you'll be notified immediately.          │ │
│ │                                                          │ │
│ │ Alternatively, I can guarantee you a seat in our       │ │
│ │ next cohort (April 15). Same program, just 4 weeks     │ │
│ │ later.                                                   │ │
│ │                                                          │ │
│ │ Which would you prefer?                                 │ │
│ │ [Stay on Waitlist]  [Enroll April 15]                  │ │
│ │                                                          │ │
│ │ Let me know!                                            │ │
│ │ [Your Name]                                              │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ [Cancel]                                  [Add to Waitlist]  │
└──────────────────────────────────────────────────────────────┘
```

**Waitlist Management:**
- Auto-notify when seat opens
- Position tracking
- Conversion analytics
- Alternative offering

**Time:** 5 minutes

---

## Alternative Flow C: Post-Training Placement Tracking

### C1: Training Completed - Track Job Placement

**Trigger:** Candidate completes training program

**System Response:**
```
┌──────────────────────────────────────────────────────────────┐
│ Post-Training Placement: Rajesh Kumar                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ TRAINING OUTCOME:                                             │
│ Program: Full Stack Developer Bootcamp (FSB-025)             │
│ Completed: June 7, 2025                                      │
│ Final Grade: 92% (A)                                         │
│ Attendance: 98%                                               │
│ Projects: 5/5 completed                                       │
│ Certificate: Issued ✓                                        │
│                                                               │
│ PLACEMENT TRACKING (90-day window):                           │
│ Status: [Actively Job Searching                          ▼] │
│ Start Date: June 10, 2025                                    │
│ Target Placement: By September 10, 2025 (90 days)            │
│                                                               │
│ Job Search Activities:                                        │
│ ├─ Resume reviewed: ✓ (June 12)                             │
│ ├─ LinkedIn optimized: ✓ (June 15)                          │
│ ├─ Portfolio deployed: ✓ (June 18)                          │
│ ├─ Applications submitted: 25                                │
│ ├─ Phone screens: 8                                          │
│ ├─ Technical interviews: 3                                   │
│ └─ Offers: 1 (pending decision)                              │
│                                                               │
│ BENCH SALES COORDINATION:                                     │
│ Bench Sales Rep: John Smith                                  │
│ Hotlist: ✓ Added (June 10)                                  │
│ Submissions: 5 active                                         │
│ Client Interviews: 2 scheduled                               │
│                                                               │
│ PLACEMENT OUTCOME:                                            │
│ ○ Not Placed (still searching)                               │
│ ○ Placed - Direct Hire                                       │
│ ● Placed - Contract (via InTime)                             │
│ ○ Not Seeking (personal reasons)                             │
│                                                               │
│ If Placed via InTime:                                        │
│ Client: [Select Account                                  ▼] │
│ Job: [Select Job                                         ▼] │
│ Start Date: [July 1, 2025                ] [📅]             │
│ Bill Rate: [$95  ] /hour                                     │
│                                                               │
│ [Update Status]  [View Resume]  [Contact Candidate]         │
└──────────────────────────────────────────────────────────────┘
```

**Post-Training KPIs:**
- Placement rate: Target 70% within 90 days
- Average time to placement: Target <60 days
- Placement source: Direct hire vs InTime bench
- Starting salary/rate range
- Placement retention: 30/60/90 day

**Handoff to Bench Sales:**
1. Create candidate profile in bench module
2. Add to hotlist (if qualified)
3. Tag with "Academy Graduate - [Program]"
4. Assign to bench sales rep
5. Track submissions and placements
6. Report back to TA Specialist

**Time:** 10-15 minutes initial handoff + ongoing tracking

---

## Postconditions

1. ✅ Candidate application received and reviewed
2. ✅ Screening interview conducted and scored
3. ✅ Technical assessment completed and evaluated
4. ✅ Enrollment created (if approved)
5. ✅ Enrollment agreement sent for signature
6. ✅ Deposit payment requested
7. ✅ Seat reserved in cohort
8. ✅ Pre-work materials sent (upon payment)
9. ✅ Candidate added to Slack/LMS
10. ✅ Post-training placement tracking initiated (upon completion)

---

## Business Rules

1. **Screening Required:** All candidates must complete screening interview before technical assessment
2. **Assessment Pass Threshold:** Minimum 60/100 to qualify for enrollment
3. **Deposit Requirement:** $1,000 deposit secures seat, must be paid within 7 days of agreement
4. **Refund Policy:**
   - 100% refund if withdrawn >14 days before start
   - 50% refund if withdrawn 7-14 days before start
   - 0% refund if withdrawn <7 days before start or after program starts
5. **Seat Reservation:** Seat held for 7 days pending deposit; released if not paid
6. **Waitlist Priority:** First-come, first-served for waitlist conversions
7. **Placement Tracking:** All graduates tracked for 90 days post-completion
8. **Success Metric:** 70% placement rate required to maintain program
9. **Corporate Discounts:** 10% for 5-9 seats, 15% for 10-19, 20% for 20+
10. **TA Specialist Commission:** $200 per successful enrollment (paid upon program completion)

---

## Metrics & Analytics

### Enrollment Metrics
- Applications per month: Target 40-50
- Application-to-screening conversion: Target >60%
- Screening-to-assessment conversion: Target >80%
- Assessment pass rate: Target >70%
- Enrollment conversion: Target >60% of passed assessments
- Average time from application to enrollment: Target <14 days

### Financial Metrics
- Revenue per cohort: Target $80K-$120K
- Average tuition per student: $6,000-$8,000
- Payment plan adoption: 40-50%
- Deposit collection rate: >90%
- Full payment collection: >95%

### Placement Metrics
- Placement rate (90 days): Target >70%
- Average time to placement: <60 days
- InTime bench placement: 40-50%
- Direct hire placement: 30-40%
- Average starting salary: $65K-$80K (full-time) or $40-$50/hr (contract)

### Program Quality
- Student satisfaction (NPS): Target >8.5/10
- Completion rate: Target >85%
- Attendance rate: Target >90%
- Project completion: Target >95%
- Referral rate: Target 20-30%

---

## Integration Points

### Academy Module
- **Data Flow:** Applications → Enrollments → Attendance → Completion
- **API:** `academy.createEnrollment()`, `academy.trackProgress()`
- **Webhook:** Completion event → Trigger placement tracking

### Bench Sales Module
- **Handoff:** Graduated candidates → Bench consultant profiles
- **API:** `bench.createConsultant()`, `bench.addToHotlist()`
- **Tracking:** Placement outcomes → Report to Academy

### Payment Gateway (Stripe)
- **Integration:** Stripe Checkout for payments
- **Webhook:** `payment.succeeded` → Update enrollment status
- **Refunds:** Automated refund processing per policy

### DocuSign
- **Integration:** Enrollment agreements
- **Webhook:** `envelope.completed` → Update signed status
- **Templates:** Standard enrollment agreement

### CRM
- **Lead Conversion:** Training leads → Enrollments
- **Attribution:** Track lead source → Enrollment → Placement
- **Reporting:** ROI per marketing channel

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | New application submitted | Email notification, auto-scored |
| TC-002 | Schedule screening | Calendar invite sent, Zoom created |
| TC-003 | Send technical assessment | Assessment link delivered, deadline set |
| TC-004 | Assessment pass (>60%) | Approval recommendation shown |
| TC-005 | Assessment fail (<60%) | Rejection email option, re-test offered |
| TC-006 | Create enrollment | Agreement sent, payment link generated |
| TC-007 | Deposit paid | Seat confirmed, welcome email sent |
| TC-008 | Deposit not paid (7 days) | Seat released, waitlist notified |
| TC-009 | Cohort full | Waitlist option shown |
| TC-010 | Corporate bulk enrollment | CSV upload, bulk emails sent |
| TC-011 | Withdrawal request | Refund calculated per policy |
| TC-012 | Program completion | Placement tracking initiated |

---

*Last Updated: 2025-11-30*
*Version: 1.0*
