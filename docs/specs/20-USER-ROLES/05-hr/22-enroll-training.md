# Use Case: Employee Training Enrollment (Academy)

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-EMP-003 |
| Actor | Any Employee (All Internal Staff) |
| Goal | Browse training catalog, enroll in courses, track progress, earn XP and certificates |
| Frequency | 2-5 times per month per employee |
| Estimated Time | 5-30 minutes (browse + enroll) |
| Priority | High (Compliance training is CRITICAL) |

---

## Preconditions

1. User is logged in as any employee (Recruiter, HR, Sales, Manager, etc.)
2. User has "academy.enroll" permission (default for all employees)
3. Training Academy is activated for organization
4. Employee profile exists with assigned role and department
5. Manager is assigned (required for paid/external training approval)

---

## Trigger

One of the following:
- Employee proactively browses training catalog
- Manager assigns required training
- System auto-enrolls employee in compliance training (new hire, annual refresh)
- Notification: "New training available: [Course Name]"
- Notification: "Required training due: [Course Name] - Due: [Date]"
- Gamification prompt: "Earn 500 XP by completing [Course Name]"

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Training Academy

**User Action:** Click "Academy" in sidebar navigation

**System Response:**
- Sidebar highlights "Academy"
- URL changes to: `/employee/academy`
- Academy dashboard loads
- Loading skeleton shows for 200-500ms
- Dashboard populates with personalized training data

**Screen State:**
```
+----------------------------------------------------------+
| Academy                                    [⌘K] [Profile] |
+----------------------------------------------------------+
| Welcome back, Sarah! 🎓                                   |
| Current Streak: 🔥 7 days | Total XP: ⭐ 3,450          |
| Level 4 - Recruiting Pro (850 XP to Level 5)             |
+----------------------------------------------------------+
| [My Courses] [Browse Catalog] [Certificates] [Leaderboard]
+----------------------------------------------------------+
| In Progress (2)                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ Advanced Boolean Search                            │  |
| │ Progress: [████████░░] 80% (4 of 5 modules)       │  |
| │ Due: Dec 20, 2024 | XP: 300                        │  |
| │ [Continue →]                                       │  |
| └────────────────────────────────────────────────────┘  |
| ┌────────────────────────────────────────────────────┐  |
| │ LinkedIn Recruiter Mastery                         │  |
| │ Progress: [███░░░░░░░] 30% (2 of 7 modules)       │  |
| │ Due: Jan 10, 2025 | XP: 500                        │  |
| │ [Continue →]                                       │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Required Training (1)                                     |
| ┌────────────────────────────────────────────────────┐  |
| │ 🔴 URGENT: Anti-Harassment Training 2024           │  |
| │ Status: Not Started                                │  |
| │ Due: Dec 31, 2024 (12 days left) | XP: 200         │  |
| │ [Start Now]                                        │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Recommended for You (3)                                   |
| [View All →]                                              |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Browse Training Catalog

**User Action:** Click "Browse Catalog" tab

**System Response:**
- Tab highlights
- Catalog view loads with all available courses
- Filters appear on left sidebar
- Courses displayed in grid or list view

**Screen State:**
```
+----------------------------------------------------------+
| Academy > Browse Catalog                 [Grid] [List ▼] |
+----------------------------------------------------------+
| Filters                    [Search courses...]  [Sort ▼] |
| ─────────                                                |
| Category                   ○ All  ● Required  ○ Optional |
| ☐ Recruiting (24)          ─────────────────────────────|
| ☐ Sales (18)               Category: Recruiting          |
| ☐ HR & Compliance (12)     ┌──────────────┬─────────────┐
| ☐ Technology (15)          │ 🟢 NEW       │ 🔴 REQUIRED │
| ☐ Leadership (9)           │ Sourcing 101 │ Annual      │
| ☐ Soft Skills (22)         │ for Tech     │ Compliance  │
|                            │ Recruiters   │ 2024        │
| Difficulty                 │ ⏱ 2 hours    │ ⏱ 1 hour    │
| ☐ Beginner (35)            │ ⭐ 300 XP    │ ⭐ 200 XP    │
| ☐ Intermediate (28)        │ 👥 142 taken │ 👥 All Req. │
| ☐ Advanced (12)            │ [Enroll]     │ [Start Now] │
|                            ├──────────────┼─────────────┤
| Format                     │ 🎓           │ 💰 PAID     │
| ☐ Video (42)               │ Advanced     │ LinkedIn    │
| ☐ Interactive (18)         │ Interview    │ Recruiter   │
| ☐ Quiz (25)                │ Techniques   │ Certification
| ☐ Live/Webinar (8)         │ ⏱ 4 hours    │ ⏱ 16 hours  │
|                            │ ⭐ 500 XP    │ ⭐ 1000 XP   │
| Certification              │ 👥 89 taken  │ 👥 12 taken │
| ☐ Yes (15)                 │ [Enroll]     │ ⚠️ Manager  │
|                            │              │ [Request]   │
| Duration                   └──────────────┴─────────────┘
| ☐ < 1 hour (28)            [Showing 4 of 24 courses]     |
| ☐ 1-3 hours (31)           [Load More]                   |
| ☐ 3+ hours (16)            |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 3: View Course Details

**User Action:** Click on "Advanced Interview Techniques" course card

**System Response:**
- Course detail modal or page opens
- Shows full course description, syllabus, instructor, reviews
- Enrollment button appears

**Screen State:**
```
+----------------------------------------------------------+
| Advanced Interview Techniques                        [×] |
+----------------------------------------------------------+
| [Overview] [Syllabus] [Reviews (42)] [FAQs]              |
+----------------------------------------------------------+
| Course Details                                            |
|                                                           |
| 🎓 Level: Advanced                                       |
| ⏱ Duration: 4 hours (self-paced)                         |
| ⭐ XP Reward: 500 XP                                     |
| 📜 Certificate: Yes (upon 100% completion + quiz pass)   |
| 👥 Enrolled: 89 employees                                |
| ⭐ Rating: 4.8/5.0 (42 reviews)                          |
| 🏆 Top Performer Bonus: +100 XP for 90%+ quiz score     |
|                                                           |
| ─────────────────────────────────────────────────────── |
| Description                                               |
|                                                           |
| Master the art of candidate interviewing with advanced   |
| techniques including behavioral questioning, technical   |
| assessments, and red flag identification. This course    |
| is designed for recruiters with 6+ months experience.    |
|                                                           |
| What You'll Learn:                                        |
| • Advanced STAR method questioning                       |
| • Technical skill assessment strategies                  |
| • Cultural fit evaluation                                |
| • Red flag identification                                |
| • Salary negotiation tactics                             |
| • Post-interview candidate engagement                    |
|                                                           |
| Prerequisites:                                            |
| • Completed "Sourcing 101 for Tech Recruiters"          |
| • 6+ months recruiting experience                        |
|                                                           |
| ─────────────────────────────────────────────────────── |
| Instructor                                                |
|                                                           |
| 👤 Mike Rodriguez                                        |
| Senior Recruiting Manager | 8 years experience           |
| Courses: 12 | Students: 450 | Rating: 4.9/5.0            |
|                                                           |
+----------------------------------------------------------+
| Prerequisites: ✅ Met                  [Enroll in Course] |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 4: Enroll in Free/Optional Course

**User Action:** Click "Enroll in Course" button

**System Response:**
- Checks prerequisites (auto-validates)
- Checks if course requires manager approval (optional courses = no)
- Instantly enrolls employee
- Shows enrollment confirmation

**Screen State (Enrollment Confirmation):**
```
+----------------------------------------------------------+
| ✅ Enrolled Successfully!                                |
+----------------------------------------------------------+
| You're now enrolled in:                                  |
| Advanced Interview Techniques                             |
|                                                           |
| Course Start: Immediately                                 |
| Suggested Completion: 2 weeks                             |
| XP Reward: 500 XP (+ 100 bonus for 90%+ quiz score)     |
|                                                           |
| 📅 Would you like to set a goal date?                    |
| [Yes, set goal] [No, learn at my pace]                   |
|                                                           |
| Next Steps:                                               |
| 1. Start Module 1: Introduction to Advanced Interviewing |
| 2. Complete 4 modules at your own pace                   |
| 3. Pass final quiz (80% required for certificate)        |
| 4. Download your certificate                             |
|                                                           |
| [Start Learning Now] [Go to My Courses]                  |
+----------------------------------------------------------+
```

**Field Specification: Enrollment**
| Property | Value |
|----------|-------|
| Field Name | `enrollment` |
| Type | Auto-created record |
| Table | `academy_enrollments` |
| Required Fields | `employee_id`, `course_id`, `enrolled_at` |
| Status | `enrolled` (not started) |
| Progress | 0% |
| Due Date | Calculated based on course settings |

**User Action:** Click "Start Learning Now"

**System Response:**
- Redirects to course player
- Module 1 loads
- Progress tracking begins

**Time:** ~5 seconds

---

### Step 5: Browse Required Training

**User Action:** Back button to Academy, scroll to "Required Training" section

**System Response:**
- Shows all mandatory courses
- Highlights overdue or upcoming due dates
- Shows compliance status

**Screen State:**
```
+----------------------------------------------------------+
| Academy > My Courses > Required Training                 |
+----------------------------------------------------------+
| Required Training (3 courses)                             |
| ℹ️ These courses are mandatory. Completion is tracked.   |
+----------------------------------------------------------+
| 🔴 OVERDUE (1)                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ ⚠️ URGENT: Anti-Harassment Training 2024           │  |
| │ Status: Not Started                                │  |
| │ Due: Dec 31, 2024 (12 days left)                   │  |
| │ Type: Annual Compliance Requirement                │  |
| │ Duration: 1 hour | XP: 200                          │  |
| │ ⚠️ Manager will be notified if not completed       │  |
| │ [Start Now]                                        │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| ✅ COMPLETED (1)                                         |
| ┌────────────────────────────────────────────────────┐  |
| │ ✓ Cybersecurity Awareness 2024                     │  |
| │ Completed: Nov 15, 2024                            │  |
| │ Score: 95% | XP Earned: 200                        │  |
| │ Certificate: [Download PDF]                        │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| 📅 UPCOMING (1)                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ HIPAA Privacy & Security Training                  │  |
| │ Status: Not Started                                │  |
| │ Available: Jan 1, 2025                             │  |
| │ Due: Feb 28, 2025                                  │  |
| │ Auto-enrolled on availability date                 │  |
| └────────────────────────────────────────────────────┘  |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 6: Start Required Training (Auto-Enroll)

**User Action:** Click "Start Now" on "Anti-Harassment Training 2024"

**System Response:**
- Auto-enrolls employee (no approval needed for required training)
- Marks enrollment status as "in_progress"
- Opens course player
- Starts progress tracking

**Screen State (Course Player):**
```
+----------------------------------------------------------+
| Anti-Harassment Training 2024                        [×] |
+----------------------------------------------------------+
| Module 1 of 3: Introduction to Workplace Harassment      |
| Progress: [███░░░░░░░] 30% complete                     |
+----------------------------------------------------------+
| ┌────────────────────────────────────────────────────┐  |
| │                                                    │  |
| │         [Video Player Area]                        │  |
| │                                                    │  |
| │         ▶️ Play Video (15:00)                      │  |
| │         ━━━━━━━━━━━━━━━━━━━━━━ 5:32 / 15:00       │  |
| │                                                    │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Transcript:                                               |
| [00:05:30] "...creating a safe and respectful work      |
| environment is critical to our company values..."        |
|                                                           |
| Notes: [Your notes here...]                              |
|                                                           |
+----------------------------------------------------------+
| [◀ Previous]  [Bookmark]  [Mark Complete]  [Next ▶]     |
+----------------------------------------------------------+
| Modules:                                                  |
| ✓ Module 1: Introduction (15 min) - Current              |
| ○ Module 2: Identifying Harassment (20 min)              |
| ○ Module 3: Reporting & Prevention (15 min)              |
| ○ Final Quiz (10 min) - Required 80% to pass            |
+----------------------------------------------------------+
```

**User Action:** Watch video, click "Mark Complete"

**System Response:**
- Marks Module 1 as complete
- Awards partial XP: +67 XP (200 total / 3 modules)
- Updates progress: 33% → 66% (after Module 2)
- Unlocks next module
- Shows mini celebration: "+67 XP earned! 🎉"

**Time:** ~15-20 minutes (to complete full module)

---

### Step 7: Request Paid/External Training

**User Action:** Back to catalog, click on "LinkedIn Recruiter Certification" (paid course)

**System Response:**
- Course detail page opens
- Shows "Manager Approval Required" badge
- Shows cost and approval workflow

**Screen State:**
```
+----------------------------------------------------------+
| LinkedIn Recruiter Certification                     [×] |
+----------------------------------------------------------+
| 💰 PAID COURSE - Manager Approval Required              |
+----------------------------------------------------------+
| Course Details                                            |
|                                                           |
| 🎓 Level: Advanced                                       |
| ⏱ Duration: 16 hours (4 weeks, instructor-led)          |
| 💵 Cost: $499 per employee                               |
| ⭐ XP Reward: 1,000 XP                                   |
| 📜 Certificate: LinkedIn Official Certification          |
| 👥 Enrolled: 12 employees (from InTime)                 |
| ⭐ Rating: 4.9/5.0 (128 reviews - LinkedIn)             |
|                                                           |
| ─────────────────────────────────────────────────────── |
| Description                                               |
|                                                           |
| Official LinkedIn certification program for Recruiter    |
| power users. Gain expert-level skills in sourcing,       |
| Boolean search, InMail strategies, and advanced filters. |
| Includes live instructor sessions, hands-on projects,    |
| and official LinkedIn certification.                     |
|                                                           |
| What's Included:                                          |
| • 16 hours of live instructor sessions                   |
| • LinkedIn Recruiter premium access (90 days)           |
| • Official certification exam                            |
| • LinkedIn badge for profile                            |
| • Lifetime access to course materials                   |
|                                                           |
| Prerequisites:                                            |
| • Active LinkedIn Recruiter license                      |
| • 1+ year recruiting experience                          |
| • Manager approval (due to cost)                         |
|                                                           |
| Business Justification:                                   |
| This course requires manager approval because:           |
| • External cost: $499                                   |
| • Time commitment during work hours                      |
| • Premium tool access required                           |
|                                                           |
+----------------------------------------------------------+
| [Cancel]                    [Request Manager Approval →] |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 8: Submit Training Request

**User Action:** Click "Request Manager Approval"

**System Response:**
- Opens request form
- Pre-fills employee and course details
- Requires business justification

**Screen State:**
```
+----------------------------------------------------------+
| Request Training Approval                                |
+----------------------------------------------------------+
| Course: LinkedIn Recruiter Certification                 |
| Cost: $499                                               |
| Duration: 16 hours (4 weeks)                             |
| Your Manager: Mike Rodriguez                             |
+----------------------------------------------------------+
| Business Justification *                                  |
| [Why do you need this training? How will it benefit     |
| your role and the company?                               |
|                                                          |
| ________________________________________________]        |
|                                               0/500      |
|                                                           |
| Expected Outcomes *                                       |
| [What skills will you gain? How will you apply them?    |
|                                                          |
| ________________________________________________]        |
|                                               0/500      |
|                                                           |
| Preferred Start Date                                      |
| [MM/DD/YYYY                                       📅]    |
|                                                           |
| ☐ I understand this requires manager approval and       |
|   may take 2-3 business days for review                  |
|                                                           |
+----------------------------------------------------------+
| [Cancel]                               [Submit Request] |
+----------------------------------------------------------+
```

**Field Specification: Business Justification**
| Property | Value |
|----------|-------|
| Field Name | `business_justification` |
| Type | Textarea |
| Label | "Business Justification" |
| Required | Yes (for paid courses) |
| Max Length | 500 characters |
| Placeholder | "Why do you need this training? How will it benefit your role?" |

**Field Specification: Expected Outcomes**
| Property | Value |
|----------|-------|
| Field Name | `expected_outcomes` |
| Type | Textarea |
| Label | "Expected Outcomes" |
| Required | Yes (for paid courses) |
| Max Length | 500 characters |

**User Action:** Fill in justification:
> "Our team is expanding LinkedIn Recruiter usage. This certification will help me maximize our ROI on the license, improve sourcing efficiency, and train junior recruiters on best practices."

**User Action:** Fill in expected outcomes:
> "I'll gain advanced Boolean search techniques, InMail optimization strategies, and pipeline management skills. I'll create training materials for the team and increase our sourcing success rate."

**User Action:** Select start date: Jan 15, 2025

**User Action:** Check acknowledgment box, click "Submit Request"

**System Response:**
1. **Create Training Request:**
   ```sql
   INSERT INTO training_requests (
     id, employee_id, course_id, manager_id,
     business_justification, expected_outcomes,
     preferred_start_date, cost, status,
     requested_at
   ) VALUES (
     uuid_generate_v4(),
     current_employee_id,
     'linkedin-recruiter-cert',
     mike_rodriguez_id,
     'Our team is expanding...',
     'I will gain advanced Boolean...',
     '2025-01-15',
     499.00,
     'pending_approval',
     NOW()
   );
   ```

2. **Send Notification to Manager:**
   - Email to mike.rodriguez@intime.com
   - Subject: "Training Request from Sarah Chen - LinkedIn Recruiter Certification"
   - In-app notification
   - Slack message (if integrated)

3. **Success Response:**
   - Modal closes
   - Toast: "Training request submitted! Mike Rodriguez will review within 2-3 business days."
   - Adds request to "My Requests" queue

**Screen State (Confirmation):**
```
+----------------------------------------------------------+
| ✅ Training Request Submitted                            |
+----------------------------------------------------------+
| Your request has been sent to Mike Rodriguez for review. |
|                                                           |
| Course: LinkedIn Recruiter Certification                 |
| Cost: $499                                               |
| Status: Pending Approval                                 |
|                                                           |
| You'll be notified via email when your manager responds. |
| Typical response time: 2-3 business days                 |
|                                                           |
| Track your request in: Academy > My Requests             |
|                                                           |
| [View My Requests] [Back to Catalog]                     |
+----------------------------------------------------------+
```

**Time:** ~3 minutes

---

### Step 9: Track Progress & Earn Certificate

**User Action:** Navigate to "My Courses" > In Progress

**System Response:**
- Shows all enrolled courses
- Displays real-time progress
- Shows XP earned and pending

**Screen State:**
```
+----------------------------------------------------------+
| Academy > My Courses                                      |
+----------------------------------------------------------+
| [In Progress (3)] [Completed (8)] [Wishlist (2)]         |
+----------------------------------------------------------+
| In Progress                                               |
|                                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ Advanced Interview Techniques                      │  |
| │ Progress: [███░░░░░░░] 30% (Started 2 hours ago)  │  |
| │ Module 1 of 4 completed                            │  |
| │ XP Earned: 125 / 500                               │  |
| │ Next: Module 2 - STAR Method Deep Dive             │  |
| │ [Continue Learning]                                │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ 🔴 Anti-Harassment Training 2024 (REQUIRED)        │  |
| │ Progress: [██████░░░░] 66% (Due: Dec 31)          │  |
| │ Module 2 of 3 completed                            │  |
| │ XP Earned: 134 / 200                               │  |
| │ Next: Module 3 - Reporting & Prevention            │  |
| │ ⚠️ 12 days remaining - Complete soon!              │  |
| │ [Continue Learning]                                │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ LinkedIn Recruiter Mastery                         │  |
| │ Progress: [███░░░░░░░] 30% (Started 1 week ago)   │  |
| │ Module 2 of 7 completed                            │  |
| │ XP Earned: 150 / 500                               │  |
| │ Due: Jan 10, 2025 (42 days left)                   │  |
| │ [Continue Learning]                                │  |
| └────────────────────────────────────────────────────┘  |
+----------------------------------------------------------+
```

**User Action:** Click "Continue Learning" on Anti-Harassment Training (complete Module 3 and final quiz)

**System Response (After completing final quiz with 92% score):**

```
+----------------------------------------------------------+
| 🎉 Congratulations! Course Complete!                     |
+----------------------------------------------------------+
| You've successfully completed:                            |
| Anti-Harassment Training 2024                             |
|                                                           |
| Final Score: 92% (11 of 12 correct)                      |
| Time Spent: 52 minutes                                    |
|                                                           |
| 🏆 Achievements Unlocked:                                |
| • Course Completed: +200 XP                              |
| • Perfect Attendance: +25 XP (no missed deadlines)       |
| • Quick Learner: +25 XP (completed in < 1 day)          |
| • Total XP Earned: +250 XP                               |
|                                                           |
| 📜 Certificate Ready!                                    |
| Your certificate has been generated and added to your    |
| profile. Download it below or view in My Certificates.   |
|                                                           |
| [Download Certificate PDF] [Share on LinkedIn]           |
|                                                           |
| ─────────────────────────────────────────────────────── |
| Next Steps:                                               |
| • Rate this course (help others!)                        |
| • Share your achievement with your team                  |
| • Browse related courses                                 |
|                                                           |
| Recommended Next:                                         |
| • Workplace Safety Fundamentals (+200 XP)               |
| • Diversity & Inclusion Training (+300 XP)              |
|                                                           |
| [Rate Course] [Back to Academy]                          |
+----------------------------------------------------------+
```

**Time:** ~45 minutes (total course time)

---

## Postconditions

### After Enrolling in Optional Course:
1. ✅ Enrollment record created in `academy_enrollments` table
2. ✅ Course appears in "My Courses" > "In Progress"
3. ✅ Progress tracking initialized (0%)
4. ✅ Due date calculated (if applicable)
5. ✅ Employee receives enrollment confirmation email
6. ✅ Activity logged: "course.enrolled"

### After Auto-Enrollment in Required Training:
1. ✅ Auto-enrolled without manager approval
2. ✅ Compliance deadline enforced
3. ✅ Manager notified of employee's enrollment
4. ✅ Reminder emails scheduled (7 days before due, 3 days before, 1 day before)
5. ✅ Employee record flagged if overdue

### After Requesting Paid Training:
1. ✅ Training request created in `training_requests` table
2. ✅ Manager notified via email and in-app
3. ✅ Request visible in "My Requests" queue
4. ✅ Status set to "pending_approval"
5. ✅ Activity logged: "training_request.submitted"

### After Completing Course:
1. ✅ Enrollment status updated to "completed"
2. ✅ XP awarded to employee profile
3. ✅ Certificate generated (if applicable)
4. ✅ Progress: 100%
5. ✅ Completion date recorded
6. ✅ Manager notified (for required training)
7. ✅ Activity logged: "course.completed"
8. ✅ Leaderboard updated
9. ✅ Level-up check (if XP threshold reached)

---

## Events Logged

| Event | Payload |
|-------|---------|
| `course.browsed` | `{ employee_id, course_id, timestamp }` |
| `course.enrolled` | `{ employee_id, course_id, enrollment_id, enrollment_type: 'voluntary' \| 'auto' }` |
| `course.started` | `{ employee_id, course_id, enrollment_id, started_at }` |
| `module.completed` | `{ employee_id, course_id, module_id, xp_earned }` |
| `course.completed` | `{ employee_id, course_id, score, xp_earned, certificate_id, completed_at }` |
| `training_request.submitted` | `{ employee_id, course_id, manager_id, cost, requested_at }` |
| `training_request.approved` | `{ request_id, manager_id, approved_at }` |
| `training_request.denied` | `{ request_id, manager_id, reason, denied_at }` |
| `certificate.earned` | `{ employee_id, course_id, certificate_id, issued_at }` |
| `xp.earned` | `{ employee_id, amount, source: 'course' \| 'quiz' \| 'bonus', source_id }` |
| `level.up` | `{ employee_id, old_level, new_level, timestamp }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Prerequisites Not Met | Missing prerequisite course | "You must complete 'Sourcing 101' before enrolling" | Complete prerequisite first |
| Duplicate Enrollment | Already enrolled | "You're already enrolled in this course" | Continue existing enrollment |
| Course Full | Enrollment limit reached | "This course is full. Join waitlist?" | Join waitlist or choose different date |
| Manager Not Assigned | No manager in profile | "Unable to submit request - no manager assigned to your profile" | Contact HR to assign manager |
| Cost Approval Required | Paid course, no approval | "This course requires manager approval" | Submit approval request |
| Overdue Required Training | Missed deadline | "⚠️ Required training overdue. Complete immediately." | Complete ASAP |
| Quiz Failed | Score < 80% | "Quiz failed (65%). Retake required." | Review materials, retake quiz |
| Certificate Generation Failed | System error | "Certificate generation failed. Contact support." | Retry or contact IT |
| Network Error | API call failed | "Unable to load course. Please try again." | Retry |

---

## Alternative Flows

### A1: Manager Approves Paid Training Request

**Trigger:** Manager receives notification, reviews request

**Flow:**
1. Manager opens training request notification
2. Reviews employee justification and course details
3. Checks budget and team priorities
4. Clicks "Approve" or "Deny"
5. If approved:
   - Employee receives approval notification
   - Course enrollment auto-created
   - Budget deducted from team training budget
   - Employee can start course immediately
   - HR and Finance notified (for invoicing)
6. If denied:
   - Manager provides denial reason
   - Employee receives notification with reason
   - Request status: "denied"
   - Employee can discuss with manager or choose different course

### A2: Manager Assigns Required Training to Employee

**Trigger:** Manager identifies training gap or new compliance requirement

**Flow:**
1. Manager navigates to Team > Training
2. Selects employee(s)
3. Clicks "Assign Training"
4. Searches for course
5. Sets due date and priority
6. Adds assignment note (why it's required)
7. Clicks "Assign"
8. System:
   - Auto-enrolls employee
   - Sends notification: "Your manager assigned you: [Course Name]"
   - Sets deadline
   - Tracks completion
9. Employee receives notification, sees course in "Required Training"

### A3: Auto-Enroll New Hire in Onboarding Training

**Trigger:** New employee onboarding initiated by HR

**Flow:**
1. HR creates employee record with role and start date
2. System triggers onboarding workflow
3. Auto-enrolls in role-specific training:
   - **All Employees:**
     - Cybersecurity Awareness
     - Anti-Harassment Training
     - Company Culture & Values
   - **Recruiters:**
     - ATS Basics
     - Sourcing 101
     - Interview Techniques
   - **Sales:**
     - CRM Fundamentals
     - Sales Process Overview
   - **HR:**
     - HRIS System Training
     - Payroll Processing
4. Employee receives welcome email with training links
5. Due dates set: Complete by Day 30 (first month)
6. Manager receives progress reports

### A4: Complete Course and Download Certificate

**Trigger:** Employee completes final quiz with passing score

**Flow:**
1. System validates all modules completed
2. Checks final quiz score ≥ 80%
3. Generates PDF certificate:
   - Employee name
   - Course name
   - Completion date
   - Final score
   - InTime logo + signature
   - Unique certificate ID
4. Stores certificate in employee profile
5. Awards XP and achievements
6. Shows completion celebration screen
7. Employee options:
   - Download PDF
   - Share on LinkedIn (auto-posts)
   - Add to resume/profile
   - Email to manager
8. Certificate appears in "My Certificates" section

### A5: Earn XP and Level Up

**Trigger:** Employee completes activity that awards XP

**XP Sources:**
- Course completion: 100-1000 XP (based on difficulty)
- Module completion: Partial XP (e.g., 25% of course XP per module)
- Quiz passing: 50-200 XP
- Perfect quiz score (100%): Bonus +50 XP
- Completing required training on time: Bonus +25 XP
- Learning streak: +10 XP per day
- Helping others (forum, peer review): +15 XP per answer

**Level Progression:**
- Level 1: 0-500 XP (Beginner)
- Level 2: 501-1,500 XP (Learner)
- Level 3: 1,501-3,000 XP (Practitioner)
- Level 4: 3,001-5,000 XP (Professional)
- Level 5: 5,001-8,000 XP (Expert)
- Level 6+: +3,500 XP per level (Master, Guru, Legend)

**Level-Up Celebration:**
```
+----------------------------------------------------------+
| 🎉 LEVEL UP! 🎉                                          |
+----------------------------------------------------------+
|           ⭐⭐⭐⭐⭐                                      |
|           Level 5 Unlocked!                              |
|           Expert Recruiter                               |
+----------------------------------------------------------+
| Total XP: 5,125 XP                                       |
| Next Level: 8,000 XP (2,875 XP to go)                   |
|                                                           |
| New Perks Unlocked:                                       |
| 🏆 Expert Badge on Profile                               |
| 🎓 Access to Advanced Courses                           |
| 👥 Mentor Status (earn XP by helping others)            |
| 🎁 $50 Amazon Gift Card (HR will send)                  |
|                                                           |
| [Share Achievement] [Continue Learning]                  |
+----------------------------------------------------------+
```

---

## Gamification Elements

### XP System
- All completed courses award XP
- XP displayed prominently in Academy dashboard
- Progress bar shows XP to next level
- Leaderboard shows top learners (team, org, all-time)

### Streaks
- Daily learning streak: Complete 1 module/day
- Streak counter: "🔥 7 days"
- Bonus XP for maintaining streaks
- Streak freeze: Use 1x per month if you miss a day

### Achievements/Badges
- **Fast Learner:** Complete course in < 50% of suggested time
- **Overachiever:** Score 100% on final quiz
- **Completionist:** Finish all courses in a category
- **Helping Hand:** Answer 10 peer questions
- **Streak Master:** Maintain 30-day learning streak
- **Early Bird:** Complete required training 30+ days before due date

### Leaderboard
```
+----------------------------------------------------------+
| Leaderboard - This Month                                 |
+----------------------------------------------------------+
| Rank | Employee          | XP Earned | Courses | Level   |
| ───────────────────────────────────────────────────────|
| 🥇   | Sarah Chen         | 1,250 XP  | 5       | Level 5 |
| 🥈   | Michael Johnson    | 1,100 XP  | 4       | Level 4 |
| 🥉   | David Park         | 980 XP    | 3       | Level 4 |
| 4    | You (Sarah Chen)   | 850 XP    | 3       | Level 4 |
| 5    | Lisa Wong          | 720 XP    | 2       | Level 3 |
+----------------------------------------------------------+
```

---

## Manager View (Training Requests)

When manager receives training request notification:

**Screen State:**
```
+----------------------------------------------------------+
| Training Request from Sarah Chen                         |
+----------------------------------------------------------+
| Employee: Sarah Chen (Senior Recruiter)                  |
| Request Date: Dec 15, 2024                               |
| Status: Pending Your Approval                            |
+----------------------------------------------------------+
| Course Details                                            |
| Name: LinkedIn Recruiter Certification                   |
| Provider: LinkedIn Learning                              |
| Cost: $499                                               |
| Duration: 16 hours (4 weeks)                             |
| Format: Instructor-led (live sessions)                   |
| Certification: Yes                                       |
+----------------------------------------------------------+
| Business Justification                                    |
| "Our team is expanding LinkedIn Recruiter usage. This    |
| certification will help me maximize our ROI on the       |
| license, improve sourcing efficiency, and train junior   |
| recruiters on best practices."                           |
|                                                           |
| Expected Outcomes                                         |
| "I'll gain advanced Boolean search techniques, InMail    |
| optimization strategies, and pipeline management skills. |
| I'll create training materials for the team and increase |
| our sourcing success rate."                              |
|                                                           |
| Preferred Start Date: Jan 15, 2025                       |
+----------------------------------------------------------+
| Budget Impact                                             |
| Team Training Budget: $2,500 remaining (Q1)              |
| After Approval: $2,001 remaining                         |
|                                                           |
| Sarah's Training History:                                 |
| • Completed 8 courses this year                          |
| • Average score: 92%                                     |
| • Last paid training: 6 months ago ($299)               |
+----------------------------------------------------------+
| Manager Decision                                          |
|                                                           |
| ○ Approve    ○ Deny    ○ Request More Info              |
|                                                           |
| Comments (optional):                                      |
| [Great initiative! This will benefit the whole team.    |
| Approved.                                                |
| ________________________________________________]        |
|                                                           |
| [Cancel]                                [Submit Decision] |
+----------------------------------------------------------+
```

---

## Related Use Cases

- [02-employee-onboarding.md](./02-employee-onboarding.md) - Auto-enroll in onboarding training
- [04-performance-reviews.md](./04-performance-reviews.md) - Link training to performance goals
- [01-daily-workflow.md](./01-daily-workflow.md) - Daily Academy dashboard check

---

## Backend Processing

### tRPC Router Reference

**File:** `src/server/routers/academy.ts`

**Procedures:**
- `academy.courses.list` - Browse catalog (Query)
- `academy.courses.get` - Get course details (Query)
- `academy.enrollments.create` - Enroll in course (Mutation)
- `academy.enrollments.progress` - Update progress (Mutation)
- `academy.requests.create` - Submit training request (Mutation)
- `academy.certificates.generate` - Generate certificate (Mutation)
- `academy.xp.award` - Award XP (Mutation)

### Database Schema Reference

**Table: academy_courses**
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `org_id` | UUID | FK → organizations.id |
| `title` | VARCHAR(200) | Course name |
| `description` | TEXT | Full description |
| `category` | ENUM | 'recruiting', 'sales', 'hr', 'compliance', 'leadership', 'tech' |
| `difficulty` | ENUM | 'beginner', 'intermediate', 'advanced' |
| `format` | ENUM | 'video', 'interactive', 'quiz', 'live' |
| `duration_minutes` | INT | Estimated duration |
| `xp_reward` | INT | XP awarded on completion |
| `certification` | BOOLEAN | Awards certificate? |
| `cost` | DECIMAL(10,2) | External cost (0 for free) |
| `requires_approval` | BOOLEAN | Manager approval needed? |
| `is_required` | BOOLEAN | Auto-enroll for all? |
| `prerequisites` | UUID[] | Required courses |
| `status` | ENUM | 'draft', 'published', 'archived' |

**Table: academy_enrollments**
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `employee_id` | UUID | FK → employees.id |
| `course_id` | UUID | FK → academy_courses.id |
| `enrollment_type` | ENUM | 'voluntary', 'auto', 'assigned' |
| `status` | ENUM | 'enrolled', 'in_progress', 'completed', 'failed' |
| `progress_percent` | INT | 0-100 |
| `enrolled_at` | TIMESTAMP | |
| `started_at` | TIMESTAMP | |
| `completed_at` | TIMESTAMP | |
| `due_date` | DATE | For required training |
| `final_score` | INT | Quiz score (0-100) |
| `xp_earned` | INT | Total XP from course |

**Table: training_requests**
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `employee_id` | UUID | FK → employees.id |
| `course_id` | UUID | FK → academy_courses.id |
| `manager_id` | UUID | FK → employees.id |
| `business_justification` | TEXT | Why needed |
| `expected_outcomes` | TEXT | Expected benefits |
| `preferred_start_date` | DATE | |
| `cost` | DECIMAL(10,2) | |
| `status` | ENUM | 'pending', 'approved', 'denied' |
| `reviewed_at` | TIMESTAMP | |
| `reviewed_by` | UUID | FK → employees.id |
| `denial_reason` | TEXT | If denied |

**Table: academy_certificates**
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `employee_id` | UUID | FK → employees.id |
| `course_id` | UUID | FK → academy_courses.id |
| `enrollment_id` | UUID | FK → academy_enrollments.id |
| `certificate_number` | VARCHAR(50) | Unique ID |
| `issued_at` | TIMESTAMP | |
| `pdf_url` | TEXT | S3 URL |
| `final_score` | INT | Quiz score |

---

*Last Updated: 2024-11-30*
