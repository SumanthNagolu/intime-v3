# Use Case: Onboard New Internal Employee

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-TA-003 |
| Actor | TA Recruiter (with HR, IT, Manager collaboration) |
| Goal | Successfully onboard new employee from offer acceptance to productive Day 1 |
| Frequency | 2-3 times per month |
| Estimated Time | Pre-Start: 5-10 hours spread over 2 weeks; Day 1: 2-3 hours |
| Priority | Critical |

---

## Preconditions

1. Offer has been signed by candidate
2. Start date confirmed
3. Background check completed and passed
4. I-9 verification scheduled
5. User has onboarding permissions
6. HR has approved new hire paperwork

---

## Trigger

One of the following:
- Candidate signs offer letter (DocuSign webhook)
- HR marks candidate as "Hired" in system
- Start date is 2 weeks away (auto-trigger)

---

## Main Flow (Click-by-Click)

### Phase 1: Pre-Start Preparation (2 weeks before start date)

#### Step 1: Initiate Onboarding

**System Response (Automatic):**
- When offer is signed, system auto-creates onboarding checklist
- Status: "Onboarding - Pre-Start"
- Assigns tasks to TA Recruiter, HR, IT, Manager

**User Action:** Navigate to candidate profile, click "Onboarding" tab

**Screen State:**
```
+----------------------------------------------------------+
| Alex Johnson - Onboarding                Start: Jan 13    |
+----------------------------------------------------------+
| Status: 🟡 Pre-Start (13 days until start)                |
| Position: Senior Technical Recruiter                      |
| Department: Talent Acquisition                            |
| Manager: Sarah Johnson                                    |
+----------------------------------------------------------+
| [Pre-Start] [Day 1] [Week 1] [30-60-90 Days]             |
+----------------------------------------------------------+
| Pre-Start Checklist (complete by Jan 12)                  |
|                                                           |
| 🏢 HR & Legal (7 tasks)                                   |
| ☑ Offer letter signed (completed Dec 13)                 |
| ☑ Background check initiated (completed Dec 13)          |
| ☑ Background check passed (completed Dec 18)             |
| ☑ I-9 verification scheduled (Dec 20 at 2pm)             |
| ☐ Benefits enrollment form sent                          |
|   [Assign to: HR] Due: Dec 27                             |
| ☐ Tax forms (W-4, state) sent                            |
|   [Assign to: HR] Due: Dec 27                             |
| ☐ Employee handbook acknowledged                         |
|   [Send Handbook] Due: Jan 6                              |
|                                                           |
| 💻 IT Setup (6 tasks)                                     |
| ☐ User account created (email, Slack, etc.)              |
|   [Assign to: IT Admin] Due: Jan 6                        |
| ☐ Equipment ordered (laptop, monitor, peripherals)       |
|   [Order Equipment] Due: Dec 20                           |
| ☐ Phone line/extension assigned                          |
|   [Assign to: IT] Due: Jan 6                              |
| ☐ System access provisioned (ATS, CRM, InTime)           |
|   [Assign to: IT] Due: Jan 10                             |
| ☐ Security training scheduled                            |
|   [Schedule] Due: Jan 13                                  |
| ☐ Equipment shipped to home address                      |
|   [Track Shipment] Due: Jan 10                            |
|                                                           |
| 📚 Training & Development (4 tasks)                       |
| ☐ Enroll in InTime Academy - Onboarding Track            |
|   [Enroll Now] Due: Jan 6                                 |
| ☐ Assign onboarding buddy                                |
|   [Select Buddy] Due: Jan 6                               |
| ☐ Manager 1:1 scheduled (Day 1)                          |
|   [Schedule] Due: Jan 6                                   |
| ☐ Team introduction meeting scheduled                    |
|   [Schedule] Due: Jan 6                                   |
|                                                           |
| 🎯 Pod Assignment (1 task)                                |
| ☐ Assign to pod                                          |
|   Recommended: TA Pod 1 (Sarah J. + 1 junior)             |
|   [Assign to Pod] (requires HR approval)                  |
|   Due: Jan 6                                              |
|                                                           |
| 📧 Communication (3 tasks)                                |
| ☐ Welcome email sent to new hire                         |
|   [Send Welcome Email] Due: Dec 20                        |
| ☐ Team announcement sent                                 |
|   [Draft Announcement] Due: Jan 6                         |
| ☐ First day agenda shared                                |
|   [Create Agenda] Due: Jan 10                             |
|                                                           |
+----------------------------------------------------------+
| Progress: 5/21 tasks completed (24%)                      |
| [Assign All Tasks] [Send Reminders] [Export Checklist]   |
+----------------------------------------------------------+
```

**Time:** ~2 minutes to review

---

#### Step 2: Order Equipment

**User Action:** Click "Order Equipment" button

**System Response:**
- Redirects to IT equipment request form
- Pre-fills new hire info

**Screen State (Equipment Request Form):**
```
+----------------------------------------------------------+
| IT Equipment Request                                  [×] |
+----------------------------------------------------------+
| For Employee: Alex Johnson                                |
| Department: Talent Acquisition                            |
| Start Date: Jan 13, 2025                                  |
| Ship To: Home Address (123 Main St, SF, CA 94102)        |
|                                                           |
| Equipment Package *                                       |
| ● Standard Recruiter Package ($2,500)                    |
|   - MacBook Pro 14" (M3, 16GB RAM, 512GB)                |
|   - 27" Monitor (Dell UltraSharp)                        |
|   - Wireless Keyboard & Mouse (Apple Magic)              |
|   - USB-C Hub/Dock                                       |
|   - Laptop Stand                                         |
|   - Noise-cancelling Headphones (Sony WH-1000XM5)        |
|                                                           |
| ○ Executive Package ($4,000)                             |
| ○ Engineering Package ($3,500)                           |
| ○ Custom (select individual items)                       |
|                                                           |
| Additional Items                                          |
| ☑ External Webcam (Logitech Brio)                        |
| ☐ Standing Desk (for office)                             |
| ☐ Ergonomic Chair (for office)                           |
|                                                           |
| Shipping                                                  |
| Requested Delivery Date: [Jan 10, 2025]                  |
|   (3 days before start date - recommended)                |
|                                                           |
| Ship To:                                                  |
| ● Home Address (pre-filled)                              |
| ○ Office (will pick up on Day 1)                         |
|                                                           |
| Special Instructions                                      |
| [Leave with front desk if no one home. Call before    ]   |
| [delivery: (555) 123-4567                             ]   |
|                                               ] 0/200     |
|                                                           |
+----------------------------------------------------------+
| Total Cost: $2,650                                        |
| Budget Approved: ✓ Yes (HR Manager)                      |
|                                                           |
| [Cancel] [Save Draft] [Submit Equipment Request →]       |
+----------------------------------------------------------+
```

**Field Specification: Equipment Package**
| Property | Value |
|----------|-------|
| Field Name | `equipmentPackage` |
| Type | Radio Button Group |
| Label | "Equipment Package" |
| Required | Yes |
| Options | Defined per department/role |
| Custom Option | Allows individual item selection |

**User Action:** Review package, click "Submit Equipment Request →"

**System Response:**
1. Request sent to IT Admin
2. IT Admin approves and places order
3. Tracking number provided
4. Task marked: "Equipment ordered ✓"
5. New task auto-created: "Track shipment"
6. Toast: "Equipment request submitted!"

**Time:** ~10 minutes

---

#### Step 3: Send Welcome Email

**User Action:** Click "Send Welcome Email" button

**System Response:**
- Email composer opens with pre-filled template

**Screen State (Welcome Email Template):**
```
+----------------------------------------------------------+
| Send Welcome Email                                    [×] |
+----------------------------------------------------------+
| To: alex.johnson@email.com (current email)                |
| CC: sarah.johnson@intime.com (manager)                    |
| From: ta-recruiter@intime.com                             |
|                                                           |
| Subject:                                                  |
| [Welcome to InTime - Your Start Date is Jan 13!       ]   |
|                                                           |
| Email Body (editable template)                            |
| ┌─────────────────────────────────────────────────────┐ |
| │ Hi Alex,                                            │ |
| │                                                      │ |
| │ Welcome to the InTime team! We're thrilled to have  │ |
| │ you joining us as a Senior Technical Recruiter on   │ |
| │ January 13, 2025.                                    │ |
| │                                                      │ |
| │ Here's what to expect before your first day:         │ |
| │                                                      │ |
| │ 🏢 HR & Legal                                        │ |
| │ • I-9 verification: Dec 20 at 2pm (Zoom link below)  │ |
| │ • Benefits enrollment: Forms arriving Dec 27         │ |
| │ • Tax forms: W-4 and state forms arriving Dec 27     │ |
| │ • Employee handbook: Review by Jan 6                 │ |
| │                                                      │ |
| │ 💻 IT Setup                                          │ |
| │ • Equipment shipping to your home: Arrives ~Jan 10   │ |
| │ • Email address: alex.johnson@intime.com (active Jan 6)│ |
| │ • First login instructions: Sent Jan 6               │ |
| │                                                      │ |
| │ 📚 Training                                          │ |
| │ • Onboarding buddy: Lisa Park (Senior Recruiter)     │ |
| │ • InTime Academy: Access sent Jan 6                  │ |
| │ • Manager 1:1: Jan 13 at 9:30am with Sarah Johnson   │ |
| │                                                      │ |
| │ 📅 First Day Agenda (Jan 13)                         │ |
| │ • 9:00 AM: Welcome & Setup                           │ |
| │ • 9:30 AM: 1:1 with Sarah (Manager)                  │ |
| │ • 10:30 AM: Team Introductions                       │ |
| │ • 11:30 AM: HR Orientation                           │ |
| │ • 12:30 PM: Lunch with Team                          │ |
| │ • 1:30 PM: Systems Training                          │ |
| │ • 3:00 PM: Onboarding Buddy Session                  │ |
| │ • 4:00 PM: Wrap-up & Questions                       │ |
| │                                                      │ |
| │ If you have any questions before your start date,    │ |
| │ please don't hesitate to reach out!                  │ |
| │                                                      │ |
| │ We're looking forward to having you on the team!     │ |
| │                                                      │ |
| │ Best,                                                │ |
| │ [Your Name]                                          │ |
| │ Talent Acquisition Recruiter                         │ |
| │ InTime                                               │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| Attachments                                               |
| ☑ New Hire Checklist (PDF)                               |
| ☑ First Day Agenda (PDF)                                 |
| ☑ I-9 Verification Zoom Link                             |
|                                                           |
+----------------------------------------------------------+
| [Save as Draft] [Cancel] [Send Email →]                  |
+----------------------------------------------------------+
```

**User Action:** Review, customize if needed, click "Send Email →"

**System Response:**
1. Email sent to candidate
2. Copy stored in candidate timeline
3. Task marked: "Welcome email sent ✓"
4. Activity logged
5. Toast: "Welcome email sent successfully!"

**Time:** ~5 minutes

---

#### Step 4: Enroll in InTime Academy

**User Action:** Click "Enroll Now" in Training section

**System Response:**
- InTime Academy enrollment modal opens
- Shows onboarding track courses

**Screen State (Academy Enrollment):**
```
+----------------------------------------------------------+
| Enroll in InTime Academy: Alex Johnson                [×] |
+----------------------------------------------------------+
| Onboarding Track (4 weeks, 20 hours)                      |
|                                                           |
| ☑ Week 1: Company & Culture (5 hours)                    |
|   • Welcome to InTime (1 hr)                             |
|   • Company History & Mission (1 hr)                     |
|   • Our Values & Culture (1 hr)                          |
|   • Organizational Structure (1 hr)                      |
|   • Products & Services Overview (1 hr)                  |
|                                                           |
| ☑ Week 2: Systems & Tools (8 hours)                      |
|   • InTime Platform Overview (2 hrs)                     |
|   • ATS Training (Greenhouse) (2 hrs)                    |
|   • CRM Training (HubSpot) (2 hrs)                       |
|   • Slack & Communication Tools (1 hr)                   |
|   • Data Security & Compliance (1 hr)                    |
|                                                           |
| ☑ Week 3: Role-Specific Training (5 hours)               |
|   • Recruiting Process at InTime (2 hrs)                 |
|   • Sourcing Best Practices (2 hrs)                      |
|   • Interview Techniques (1 hr)                          |
|                                                           |
| ☑ Week 4: Advanced Topics (2 hours)                      |
|   • Metrics & Reporting (1 hr)                           |
|   • Career Development Paths (1 hr)                      |
|                                                           |
| Additional Courses (optional)                             |
| ☐ LinkedIn Recruiter Mastery                             |
| ☐ Advanced Boolean Search                                |
| ☐ Diversity & Inclusion in Hiring                        |
|                                                           |
| Enrollment Details                                        |
| Start Date: [Jan 13, 2025] (Day 1)                       |
| Due Date: [Feb 10, 2025] (4 weeks)                       |
| Manager Review: Sarah Johnson (notified on completion)    |
|                                                           |
+----------------------------------------------------------+
| [Cancel] [Enroll Alex Johnson →]                         |
+----------------------------------------------------------+
```

**User Action:** Click "Enroll Alex Johnson →"

**System Response:**
1. Alex enrolled in Onboarding Track
2. Courses appear in Alex's Academy dashboard (access on Jan 6 when email created)
3. Manager (Sarah) notified
4. Task marked: "Enrolled in Academy ✓"
5. Toast: "Enrolled successfully!"

**Time:** ~3 minutes

---

#### Step 5: Assign Onboarding Buddy

**User Action:** Click "Select Buddy" button

**System Response:**
- Buddy selection modal opens
- Shows suggested buddies (same role, high performers)

**Screen State (Buddy Selection):**
```
+----------------------------------------------------------+
| Assign Onboarding Buddy: Alex Johnson                 [×] |
+----------------------------------------------------------+
| Recommended Buddies (Senior Recruiters)                   |
|                                                           |
| ● Lisa Park                                              |
|   Senior Technical Recruiter • 3 years at InTime         |
|   Pod: TA Pod 2 • Manager: Mike Chen                     |
|   Buddy Rating: 4.9/5 (from 7 previous buddies)          |
|   Availability: ✓ Available                              |
|   [View Profile]                                          |
|                                                           |
| ○ Maria Gonzalez                                         |
|   Senior Technical Recruiter • 2 years at InTime         |
|   Pod: TA Pod 1 • Manager: Sarah Johnson                 |
|   Buddy Rating: 4.7/5 (from 4 previous buddies)          |
|   Availability: ⚠️ Currently buddy for 1 other           |
|   [View Profile]                                          |
|                                                           |
| Buddy Responsibilities (auto-sent to buddy)               |
| • Week 1: Daily check-ins, answer questions              |
| • Week 2-4: 2-3 check-ins per week                       |
| • Week 5-8: Weekly check-ins                             |
| • Ad-hoc: Available for questions via Slack              |
|                                                           |
| Duration: [90] days                                       |
|                                                           |
+----------------------------------------------------------+
| [Cancel] [Assign Lisa Park as Buddy →]                   |
+----------------------------------------------------------+
```

**User Action:** Select Lisa Park, click "Assign Lisa Park as Buddy →"

**System Response:**
1. Lisa Park assigned as Alex's onboarding buddy
2. Notification sent to Lisa with buddy responsibilities
3. Calendar events auto-created for check-ins
4. Task marked: "Onboarding buddy assigned ✓"
5. Toast: "Lisa Park assigned as buddy!"

**Time:** ~5 minutes

---

#### Step 6: Assign to Pod

**User Action:** Click "Assign to Pod" button

**System Response:**
- Pod assignment modal opens
- Shows recommended pod based on headcount, manager, role

**Screen State (Pod Assignment):**
```
+----------------------------------------------------------+
| Assign to Pod: Alex Johnson                           [×] |
+----------------------------------------------------------+
| Employee: Alex Johnson                                    |
| Role: Senior Technical Recruiter                          |
| Manager: Sarah Johnson                                    |
|                                                           |
| Recommended Pod                                           |
| ● TA Pod 1                                               |
|   Senior Member: Sarah Johnson (TA Manager)               |
|   Junior Member: [Currently vacant - Alex will fill]      |
|   Pod Type: TA (Talent Acquisition)                      |
|   Current Sprint: 1/2 placements                          |
|   Status: ✓ Active                                       |
|                                                           |
| Alternative Pods                                          |
| ○ TA Pod 2                                               |
|   Senior: Mike Chen | Junior: Maria Gonzalez             |
|   Status: Full (2/2 members)                              |
|                                                           |
| Pod Structure at InTime:                                  |
| • 2-person teams (Senior + Junior)                       |
| • Sprint: 2 weeks                                        |
| • Goal: 2 quality hires per sprint                       |
| • Shared metrics, collaborative work                      |
|                                                           |
| Pod Metadata                                              |
| Pod Role for Alex: [Junior Member                     ▼]  |
|   (Will work toward Senior after 1 year)                  |
|                                                           |
| Sprint Start Date: [Jan 13, 2025]                        |
|   (Aligns with employee start date)                       |
|                                                           |
| IMPORTANT: Pod assignment requires HR Manager approval.   |
|                                                           |
+----------------------------------------------------------+
| [Cancel] [Request HR Approval →]                         |
+----------------------------------------------------------+
```

**User Action:** Review, click "Request HR Approval →"

**System Response:**
1. Pod assignment request sent to HR Manager
2. Status: "Pod Assignment Pending Approval"
3. HR Manager reviews and approves
4. Once approved:
   - Alex assigned to TA Pod 1 as Junior Member
   - Employee metadata updated
   - Pod metrics recalculated
   - Task marked: "Assigned to pod ✓"

**Time:** ~5 minutes

---

#### Step 7: Create User Account (IT Task)

**IT Admin receives task notification**

**IT Admin Action:** Create user account via admin panel

**System creates:**
- Email: alex.johnson@intime.com
- Slack account
- Password (temporary, must reset on first login)
- Access to InTime platform
- Access to ATS (Greenhouse)
- Access to CRM (HubSpot)
- Access to other tools

**User receives notification:** "User account created ✓"

**Time:** ~15 minutes (IT Admin)

---

#### Step 8: Track Equipment Shipment

**User Action:** Click "Track Shipment" in IT Setup section

**System Response:**
- Shows shipping tracking info (FedEx/UPS integration)

**Screen State (Shipment Tracking):**
```
+----------------------------------------------------------+
| Equipment Shipment Tracking                           [×] |
+----------------------------------------------------------+
| Order #: IT-2024-1234                                     |
| For: Alex Johnson                                         |
| Ship To: 123 Main St, San Francisco, CA 94102            |
|                                                           |
| Tracking Number: 1Z999AA10123456784                       |
| Carrier: UPS                                              |
| Expected Delivery: Jan 10, 2025 by 5:00 PM               |
|                                                           |
| Shipment Status: 🟢 In Transit                           |
|                                                           |
| Tracking History:                                         |
| ✓ Jan 8, 2:15 PM - Departed FedEx facility (Oakland)     |
| ✓ Jan 8, 9:00 AM - Arrived at FedEx facility (Oakland)   |
| ✓ Jan 7, 4:30 PM - In transit                            |
| ✓ Jan 7, 10:00 AM - Picked up (Apple distribution)       |
| ✓ Jan 6, 3:00 PM - Label created                         |
|                                                           |
| Package Contents:                                         |
| • MacBook Pro 14" (M3, 16GB, 512GB)                      |
| • Dell UltraSharp 27" Monitor                            |
| • Apple Magic Keyboard & Mouse                           |
| • USB-C Hub, Laptop Stand, Headphones                    |
|                                                           |
| Delivery Instructions:                                    |
| "Leave with front desk if no one home. Call before       |
|  delivery: (555) 123-4567"                                |
|                                                           |
| [Reschedule Delivery] [Update Address] [Contact Carrier] |
+----------------------------------------------------------+
```

**User Action:** Monitor daily, confirm delivery

**On delivery (Jan 10):**
- System receives delivery confirmation
- User calls Alex: "Equipment delivered! Please confirm receipt."
- Alex confirms
- Task marked: "Equipment delivered ✓"

**Time:** ~5 minutes (monitoring)

---

#### Step 9: Send First Day Agenda

**User Action:** Click "Create Agenda" button (1 week before start)

**System Response:**
- Agenda template opens

**Screen State (First Day Agenda):**
```
+----------------------------------------------------------+
| First Day Agenda: Alex Johnson - Jan 13, 2025        [×] |
+----------------------------------------------------------+
| Welcome to InTime! Here's your Day 1 schedule:            |
|                                                           |
| 9:00 AM - 9:30 AM: Welcome & Setup                       |
| • Join Zoom call (link below)                            |
| • IT will walk through first login, password reset       |
| • Set up email, Slack, calendar                          |
| Location: Virtual (Zoom)                                  |
| Attendees: You, IT Admin                                  |
|                                                           |
| 9:30 AM - 10:30 AM: 1:1 with Sarah Johnson (Manager)     |
| • Welcome to the team!                                   |
| • Review role expectations, 30-60-90 day plan            |
| • Answer questions                                       |
| Location: Virtual (Zoom link sent separately)             |
| Attendees: You, Sarah Johnson                             |
|                                                           |
| 10:30 AM - 11:30 AM: TA Team Introductions               |
| • Meet the Talent Acquisition team                       |
| • Icebreaker activity                                    |
| • Learn about team structure, pods                       |
| Location: Virtual (Zoom)                                  |
| Attendees: Full TA team (8 people)                        |
|                                                           |
| 11:30 AM - 12:30 PM: HR Orientation                      |
| • Benefits review, payroll setup                         |
| • PTO policy, company policies                           |
| • Sign remaining paperwork                               |
| Location: Virtual (Zoom)                                  |
| Attendees: You, HR Generalist                             |
|                                                           |
| 12:30 PM - 1:30 PM: Lunch with Team                      |
| • Casual lunch, get to know teammates                    |
| • Virtual lunch (order delivery on us! $25 budget)       |
| Location: Virtual (Zoom - optional, informal)             |
| Attendees: TA Pod 1 + buddies                             |
|                                                           |
| 1:30 PM - 3:00 PM: InTime Platform Training              |
| • Walkthrough of InTime OS                               |
| • ATS (Greenhouse) basics                                |
| • CRM (HubSpot) overview                                 |
| Location: Virtual (Zoom)                                  |
| Attendees: You, Training Coordinator                      |
|                                                           |
| 3:00 PM - 4:00 PM: Onboarding Buddy Session              |
| • Meet Lisa Park (your buddy!)                           |
| • Informal Q&A, tips for success                         |
| • Tour of resources, Slack channels, wikis               |
| Location: Virtual (Zoom)                                  |
| Attendees: You, Lisa Park                                 |
|                                                           |
| 4:00 PM - 4:30 PM: Wrap-up & Questions                   |
| • Debrief with TA Recruiter                              |
| • Address any Day 1 questions                            |
| • Preview Week 1                                         |
| Location: Virtual (Zoom)                                  |
| Attendees: You, TA Recruiter                              |
|                                                           |
| All Zoom links and calendar invites have been sent!       |
|                                                           |
| Contact for Day 1 questions:                              |
| TA Recruiter: ta-recruiter@intime.com | (555) 000-0000   |
|                                                           |
+----------------------------------------------------------+
| [Save as PDF] [Email to Alex] [Add to All Calendars]     |
+----------------------------------------------------------+
```

**User Action:** Click "Email to Alex"

**System Response:**
1. Agenda emailed to Alex
2. All calendar invites sent to participants
3. Zoom links created and distributed
4. Task marked: "First day agenda shared ✓"

**Time:** ~20 minutes

---

### Phase 2: Day 1 - First Day

#### Step 10: Day 1 Execution

**TA Recruiter monitors Day 1:**

**9:00 AM - Welcome & Setup**
- IT Admin walks Alex through first login
- Password reset, email setup, Slack setup
- TA Recruiter joins briefly to welcome

**9:30 AM - Manager 1:1**
- Sarah Johnson (manager) conducts 1:1
- Reviews expectations, answers questions
- Shares 30-60-90 day plan

**10:30 AM - Team Introductions**
- Full TA team meets Alex
- Icebreaker, team bonding

**11:30 AM - HR Orientation**
- HR reviews benefits, policies
- Final paperwork signed

**12:30 PM - Lunch**
- Informal team lunch (virtual)

**1:30 PM - Platform Training**
- Training coordinator walks through systems

**3:00 PM - Buddy Session**
- Lisa Park (buddy) meets Alex
- Tips, resources, Q&A

**4:00 PM - Wrap-up**
- TA Recruiter debriefs with Alex
- "How was Day 1?"
- "Any concerns?"
- Preview Week 1

**User Action (TA Recruiter):** At end of day, click "Complete Day 1"

**Screen State (Day 1 Completion):**
```
+----------------------------------------------------------+
| Day 1 Completion: Alex Johnson                        [×] |
+----------------------------------------------------------+
| How was Alex's first day?                                 |
|                                                           |
| Day 1 Feedback (from Alex)                                |
| Overall Experience: [Excellent                        ▼]  |
|   Options: Excellent, Good, Fair, Poor                    |
|                                                           |
| What went well?                                           |
| [Great team, felt welcomed, clear expectations...     ]   |
|                                               ] 0/500     |
|                                                           |
| What could be improved?                                   |
| [A bit overwhelming with info, but manageable...      ]   |
|                                               ] 0/500     |
|                                                           |
| Any blockers or issues?                                   |
| ○ None  ● Minor issues (resolved)  ○ Major issues        |
|                                                           |
| If issues:                                                |
| [Initial laptop setup took 30 min longer than planned,]   |
| [but IT resolved. All good now.                       ]   |
|                                               ] 0/500     |
|                                                           |
| Next Steps                                                |
| ☑ Week 1 agenda shared                                   |
| ☑ Daily check-ins scheduled with buddy                   |
| ☑ 30-day review scheduled (Feb 12)                       |
|                                                           |
+----------------------------------------------------------+
| [Save Feedback] [Complete Day 1 →]                       |
+----------------------------------------------------------+
```

**User Action:** Fill in feedback, click "Complete Day 1 →"

**System Response:**
1. Day 1 marked as complete
2. Status updated: "Onboarding - Week 1"
3. Week 1 checklist activated
4. Manager notified of Day 1 completion
5. HR notified
6. Activity logged

**Time:** 15-30 minutes (monitoring throughout day + debrief)

---

### Phase 3: Week 1 - Integration

#### Week 1 Checklist (Auto-Generated)

**System creates Week 1 tasks:**
```
Week 1 Checklist (Jan 13 - Jan 17)

☑ Day 1 completed
☐ Complete InTime Academy: Week 1 courses (5 hrs)
☐ Shadow buddy (Lisa) on 2 screening calls
☐ Attend daily team stand-ups
☐ Review job descriptions and current open roles
☐ Manager 1:1 (Friday) - Week 1 check-in
☐ Set up LinkedIn Recruiter account
☐ Submit first candidate to pipeline (with guidance)
☐ Log first activity in system
```

**TA Recruiter monitors progress, checks in mid-week**

---

### Phase 4: 30-60-90 Day Reviews

#### 30-Day Review

**Scheduled:** Feb 12, 2025

**Attendees:** Alex Johnson, Sarah Johnson (Manager), TA Recruiter

**Review Points:**
- Progress on onboarding goals
- Systems proficiency
- First placements (if any)
- Culture fit
- Questions/concerns
- Adjust 60-90 day plan if needed

**User Action:** TA Recruiter schedules, attends, logs feedback

---

#### 60-Day Review

**Scheduled:** Mar 12, 2025

**Focus:**
- Performance metrics (placements, activities)
- Skills development
- Team integration
- Career path discussion

---

#### 90-Day Review (End of Probation)

**Scheduled:** Apr 12, 2025

**Critical Review:**
- Performance vs. expectations
- Decision: Continue employment or part ways
- If positive: Transition to regular employee status
- Salary/benefits confirmation
- Long-term goal setting

---

## Postconditions

1. ✅ All pre-start tasks completed
2. ✅ Equipment delivered and set up
3. ✅ User account created and active
4. ✅ Enrolled in InTime Academy
5. ✅ Onboarding buddy assigned
6. ✅ Assigned to pod
7. ✅ Day 1 completed successfully
8. ✅ Week 1 underway
9. ✅ 30-60-90 day reviews scheduled
10. ✅ New hire engaged and productive

---

## Error Scenarios

| Error | Cause | Recovery |
|-------|-------|----------|
| Equipment delayed | Shipping issue | Provide loaner laptop, reschedule setup |
| User account not created | IT delay | Escalate to IT Manager, create manually |
| Background check fails | Candidate issue | Rescind offer, move to next candidate |
| New hire no-show Day 1 | Candidate ghosted | Contact immediately, determine status |
| Systems access issues | Provisioning delay | IT troubleshoots, temporary workarounds |
| Onboarding buddy unavailable | Unexpected absence | Assign backup buddy |
| Manager unavailable Day 1 | Conflict | Reschedule 1:1, assign interim mentor |

---

## Events Logged

| Event | Payload |
|-------|---------|
| `onboarding.initiated` | `{ employee_id, start_date, initiated_by, initiated_at }` |
| `equipment.ordered` | `{ employee_id, equipment_package, cost, ordered_at }` |
| `equipment.delivered` | `{ employee_id, tracking_number, delivered_at }` |
| `user_account.created` | `{ employee_id, email, created_by, created_at }` |
| `academy.enrolled` | `{ employee_id, track, courses, enrolled_at }` |
| `buddy.assigned` | `{ employee_id, buddy_id, assigned_at }` |
| `pod.assigned` | `{ employee_id, pod_id, pod_role, assigned_at }` |
| `onboarding.day1_completed` | `{ employee_id, feedback, completed_at }` |
| `onboarding.30day_review` | `{ employee_id, reviewer_id, outcome, reviewed_at }` |
| `onboarding.90day_review` | `{ employee_id, probation_status, reviewed_at }` |

---

## Related Use Cases

- [03-internal-hiring.md](./03-internal-hiring.md) - Previous step: offer acceptance
- [01-daily-workflow.md](./01-daily-workflow.md) - Daily onboarding tasks

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Initiate onboarding after offer signed | Checklist auto-created, tasks assigned |
| TC-002 | Order equipment for new hire | Request sent to IT, shipment tracked |
| TC-003 | Send welcome email | Email sent with attachments, logged |
| TC-004 | Enroll in Academy | Courses assigned, manager notified |
| TC-005 | Assign onboarding buddy | Buddy notified, check-ins scheduled |
| TC-006 | Assign to pod (requires approval) | Request sent to HR, approved, assigned |
| TC-007 | Complete Day 1 | Status updated, Week 1 checklist activated |
| TC-008 | 30-day review positive | Continue onboarding, 60-day scheduled |
| TC-009 | 90-day review positive | Probation passed, regular employee status |
| TC-010 | Equipment delivery delayed | Loaner provided, IT notified |

---

## Success Metrics

Onboarding is successful when:
1. ✅ All pre-start tasks completed on time
2. ✅ Equipment delivered 3 days before start
3. ✅ Day 1 rated "Excellent" or "Good" by new hire
4. ✅ Week 1 Academy modules completed
5. ✅ 30-day review: "On track" or "Exceeds expectations"
6. ✅ 60-day review: First placements achieved
7. ✅ 90-day review: Pass probation
8. ✅ 90-day retention: 95%+
9. ✅ New hire NPS score: 8+/10

---

*Last Updated: 2024-11-30*
