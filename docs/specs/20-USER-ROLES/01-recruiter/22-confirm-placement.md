# Use Case: Confirm Placement

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-022 |
| Actor | Recruiter (Technical Recruiter) |
| Goal | Confirm candidate placement after offer acceptance and complete pre-start paperwork |
| Frequency | 3-5 times per week (per productive recruiter) |
| Estimated Time | 20-45 minutes |
| Priority | Critical |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "placement.create" permission (default for Recruiter role)
3. Offer has been accepted by candidate (status = "accepted")
4. Offer has been counter-signed by all parties (via DocuSign)
5. Start date has been confirmed
6. Candidate is ready to begin onboarding process

---

## Trigger

One of the following:
- DocuSign envelope completed (all signatures collected)
- Candidate confirms acceptance via email/phone
- Hiring manager confirms readiness for candidate start
- HR requests placement confirmation for onboarding
- Start date is approaching (7 days out)

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Accepted Offer

**User Action:** Click "Submissions" in sidebar navigation

**System Response:**
- Sidebar highlights
- URL changes to: `/employee/workspace/submissions`
- Submissions list loads with filter showing "Offer Accepted"

**Screen State:**
```
+----------------------------------------------------------+
| Submissions                      [+ New Submission] [Cmd+K]|
+----------------------------------------------------------+
| [Search submissions...]              [Filter ▼] [Sort ▼]  |
+----------------------------------------------------------+
| ● Accepted │ ○ Offer │ ○ Interview │ ○ Placed │ ○ All    |
+----------------------------------------------------------+
| Status      Candidate         Job              Start Date |
| ─────────────────────────────────────────────────────────|
| 🎉 Accepted Jane Doe         Sr Engineer      Dec 9      |
| 🎉 Accepted Mike Chen        Java Dev         Dec 16     |
+----------------------------------------------------------+
| Showing 2 accepted offers pending placement               |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Open Accepted Submission

**User Action:** Click on Jane Doe's submission row

**System Response:**
- Row highlights
- URL changes to: `/employee/workspace/submissions/{submission-id}`
- Submission detail view loads showing offer accepted status

**Screen State:**
```
+----------------------------------------------------------+
| [← Back to Submissions]                 Submission Detail |
+----------------------------------------------------------+
|
| 🎉 Offer Accepted - Ready for Placement                  |
|                                                           |
| Jane Doe → Senior Software Engineer @ Google              |
| Status: 💚 Offer Accepted               [Actions ▼]     |
| Start Date: December 9, 2025 (8 days away)               |
|                                                           |
+----------------------------------------------------------+
| Overview | Offer Details | Placement Checklist | Activity|
+----------------------------------------------------------+
|
| OFFER STATUS                                              |
| ✅ Offer Sent: December 1, 2025                          |
| ✅ Candidate Signed: December 2, 2025                    |
| ✅ Hiring Manager Signed: December 2, 2025               |
| ✅ HR Counter-Signed: December 3, 2025                   |
| ✅ DocuSign Completed: December 3, 2025                  |
|                                                           |
| ACCEPTED TERMS                                            |
| Pay Rate: $100.00/hr (W2)                                |
| Bill Rate: $125.00/hr                                     |
| Margin: $25.00/hr (20.0%)                                |
| Duration: 12 months                                       |
| Start Date: December 9, 2025                              |
| Work Location: Remote                                     |
|                                                           |
| NEXT STEPS                                                |
| ⏭️  Confirm placement and initiate onboarding            |
| ⏭️  Complete pre-employment paperwork                    |
| ⏭️  Coordinate first day logistics                       |
|                                                           |
| ⚠️  Action Required: Placement must be confirmed before  |
|     start date to trigger commission and onboarding.     |
|                                                           |
+----------------------------------------------------------+
| [📋 Confirm Placement]  [📅 Update Start Date]          |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 3: Click "Confirm Placement"

**User Action:** Click "📋 Confirm Placement" button

**System Response:**
- Button shows loading state briefly
- Modal slides in from right (300ms animation)
- Modal title: "Confirm Candidate Placement"
- Pre-filled with offer details

**Screen State:**
```
+----------------------------------------------------------+
|                              Confirm Candidate Placement [×]|
+----------------------------------------------------------+
| Step 1 of 4: Verify Placement Details                     |
|                                                           |
| Candidate: Jane Doe                                       |
| Position: Senior Software Engineer                        |
| Client: Google                                            |
| Offer Accepted: December 3, 2025                          |
|                                                           |
| PLACEMENT VERIFICATION                                    |
|                                                           |
| Start Date *                                              |
| [12/09/2025                                     📅]      |
|                                                           |
| ☑ Confirmed with candidate                               |
| ☑ Confirmed with hiring manager                          |
| ☑ All paperwork signed via DocuSign                      |
|                                                           |
| End Date *                                                |
| [12/09/2026                                     📅]      |
| (12 months from start date)                               |
|                                                           |
| Assignment Type *                                         |
| ● Contract-to-Hire    ○ Contract Only    ○ Direct Hire   |
|                                                           |
| Work Schedule                                             |
| Standard Hours: [40  ] hours/week                        |
| Work Days: ☑ Mon ☑ Tue ☑ Wed ☑ Thu ☑ Fri □ Sat □ Sun   |
| Time Zone: [Pacific (PST/PDT)                        ▼]  |
|                                                           |
| RATE CONFIRMATION                                         |
|                                                           |
| Pay Rate (to Candidate): $100.00/hr                      |
| Bill Rate (to Client): $125.00/hr                        |
| Margin: $25.00/hr (20.0%)                                |
| Employment Type: W2                                       |
|                                                           |
| ✅ Rates match accepted offer                            |
|                                                           |
+----------------------------------------------------------+
|                        [Cancel]  [Next: Paperwork →]     |
+----------------------------------------------------------+
```

**Field Specification: Start Date**
| Property | Value |
|----------|-------|
| Field Name | `placementStartDate` |
| Type | Date Picker |
| Label | "Start Date" |
| Required | Yes |
| Default | From accepted offer |
| Validation | Must be future date, typically within 2-4 weeks |
| Business Rule | Cannot be changed after placement confirmed without client approval |

**Field Specification: End Date**
| Property | Value |
|----------|-------|
| Field Name | `placementEndDate` |
| Type | Date Picker |
| Label | "End Date" |
| Required | Yes |
| Auto-calculate | Start Date + Contract Duration |
| Editable | Yes (if different from original contract) |

**Field Specification: Assignment Type**
| Property | Value |
|----------|-------|
| Field Name | `assignmentType` |
| Type | Radio Button Group |
| Label | "Assignment Type" |
| Required | Yes |
| Options | |
| - `contract_to_hire` | Contract-to-Hire (evaluation period) |
| - `contract` | Contract Only (no conversion) |
| - `direct_hire` | Direct Hire (permanent placement) |
| Default | Based on job type |

**Time:** ~300ms

---

### Step 4: Verify Placement Details

**User Action:** Review and confirm all details

**Typical Checks:**
1. ✅ Start date is correct (Dec 9, 2025)
2. ✅ End date is 12 months later (Dec 9, 2026)
3. ✅ Assignment type: Contract-to-Hire
4. ✅ Work schedule: 40 hrs/week, Mon-Fri
5. ✅ Time zone: Pacific (correct for Google)
6. ✅ Rates match offer ($100/hr pay, $125/hr bill)

**User Action:** All verifications complete, click "Next: Paperwork →"

**System Response:**
- Validates Step 1 fields
- Slides to Step 2 (Paperwork Checklist)

**Time:** ~30 seconds

---

### Step 5: Complete Paperwork Checklist

**Screen State:**
```
+----------------------------------------------------------+
|                              Confirm Candidate Placement [×]|
+----------------------------------------------------------+
| Step 2 of 4: Pre-Employment Paperwork                     |
|                                                           |
| REQUIRED DOCUMENTS (Must be completed before start)       |
|                                                           |
| Federal & State Forms                                     |
| ☑ I-9 Employment Eligibility Verification                |
|   Status: ✅ Completed (DocuSign) - Dec 3                |
|   [View Document]                                         |
|                                                           |
| ☑ W-4 Federal Tax Withholding                            |
|   Status: ✅ Completed (DocuSign) - Dec 3                |
|   [View Document]                                         |
|                                                           |
| ☑ State Tax Withholding (California)                     |
|   Status: ✅ Completed (DocuSign) - Dec 3                |
|   [View Document]                                         |
|                                                           |
| Banking & Payroll                                         |
| ☑ Direct Deposit Authorization                           |
|   Status: ✅ Completed - Dec 3                           |
|   Bank: Wells Fargo, Account: ****1234                   |
|   [View Document]                                         |
|                                                           |
| Background & Compliance                                   |
| ☑ Background Check Consent                               |
|   Status: ✅ Completed - Dec 1                           |
|   Report: ✅ Clear (no issues) - Dec 2                   |
|   [View Report]                                           |
|                                                           |
| ☑ Drug Screening (if required)                           |
|   Status: ⏭️  Not Required for remote position           |
|                                                           |
| Client-Specific Requirements                              |
| ☑ Google NDA                                             |
|   Status: ✅ Signed - Dec 3                              |
|   [View Document]                                         |
|                                                           |
| ☑ Google Security Training                               |
|   Status: ⏳ Scheduled for Dec 8 (day before start)      |
|   Link: [Complete Training]                              |
|                                                           |
| □ Google Badge/Access Request                            |
|   Status: ⏳ Pending - Submit request now                |
|   [ ] I have submitted access request to Google IT       |
|                                                           |
| Equipment & Logistics                                     |
| ☑ Laptop Request                                         |
|   Status: ✅ Ordered - Ships Dec 6                       |
|   Model: MacBook Pro 16" M3                              |
|   Tracking: [UPS #1Z999AA10123456784]                    |
|                                                           |
| ☑ Monitor Request                                        |
|   Status: ✅ Ordered - Ships Dec 6                       |
|   Model: Dell 27" 4K                                     |
|                                                           |
| Insurance & Benefits (W2 Only)                            |
| ☑ Health Insurance Enrollment                            |
|   Status: ✅ Enrolled - Dec 3                            |
|   Plan: Blue Cross PPO                                    |
|   Effective: Dec 9, 2025                                  |
|   [View Coverage Details]                                 |
|                                                           |
| ☑ 401(k) Enrollment                                      |
|   Status: ⏳ Available after 90 days (Mar 9, 2026)       |
|   Auto-remind: ☑ Email candidate on Mar 1               |
|                                                           |
| COMPLETION STATUS                                         |
| ████████████████████████░░░ 88% Complete (7 of 8)        |
|                                                           |
| ⚠️  1 item pending: Google Badge/Access Request          |
|                                                           |
+----------------------------------------------------------+
|     [← Back]  [Mark All Complete]  [Next: First Day →]  |
+----------------------------------------------------------+
```

**Field Specification: Paperwork Checklist**
| Property | Value |
|----------|-------|
| Field Name | `paperworkChecklist` |
| Type | Checkbox List |
| Label | Various per item |
| Required | Most items required before confirming placement |
| Dynamic | Based on employment type, location, client |
| Validation | Cannot proceed if critical items incomplete |

**Checklist Items (Dynamic Based on Context):**

| Document | Required For | Auto-Collected | Manual Required |
|----------|--------------|----------------|-----------------|
| I-9 | All US hires | ✅ DocuSign | - |
| W-4 | W2 only | ✅ DocuSign | - |
| State Tax | All | ✅ DocuSign | - |
| Direct Deposit | All | ✅ Online Form | - |
| Background Check | All | ✅ Auto via Checkr | - |
| Drug Screen | Client-specific | - | ⚠️ Manual scheduling |
| Client NDA | Client-specific | ✅ DocuSign | - |
| Security Training | Client-specific | - | ⚠️ Link sent to candidate |
| Badge/Access | On-site/hybrid | - | ⚠️ IT request form |
| Equipment Order | Remote workers | ✅ Auto via IT system | - |
| Benefits Enrollment | W2 only | ✅ Benefits portal | - |

**User Action:** Review checklist, verify all items are complete or scheduled

**Pending Item:** Google Badge/Access Request not yet submitted

**User Action:**
1. Check "I have submitted access request to Google IT"
2. System verifies submission
3. Checklist now 100% complete

**User Action:** Click "Next: First Day →"

**Time:** ~2 minutes

---

### Step 6: Coordinate First Day Logistics

**System Response:**
- Validates Step 2 (all required items checked)
- Slides to Step 3 (First Day Logistics)

**Screen State:**
```
+----------------------------------------------------------+
|                              Confirm Candidate Placement [×]|
+----------------------------------------------------------+
| Step 3 of 4: First Day Logistics                          |
|                                                           |
| FIRST DAY DETAILS                                         |
|                                                           |
| Start Date: Monday, December 9, 2025                      |
| Start Time: [9:00 AM] [Pacific Time ▼]                   |
|                                                           |
| Onboarding Format                                         |
| ● Virtual Onboarding    ○ In-Person    ○ Hybrid          |
|                                                           |
| Meeting Details (if virtual)                              |
| Meeting Link: [https://meet.google.com/xxx-yyyy-zzz   ]  |
| Meeting ID: xxx-yyyy-zzz                                  |
| Passcode: [12345 ]                                        |
|                                                           |
| ☑ Send calendar invite to candidate                      |
| ☑ Include joining instructions                           |
|                                                           |
| First Day Agenda                                          |
| 9:00 AM - 9:30 AM   Welcome & Introductions              |
| 9:30 AM - 10:00 AM  Company Overview                     |
| 10:00 AM - 11:00 AM HR Orientation                       |
| 11:00 AM - 12:00 PM IT Setup & Tools                     |
| 12:00 PM - 1:00 PM  Lunch Break                          |
| 1:00 PM - 2:00 PM   Team Introduction                    |
| 2:00 PM - 3:00 PM   Role-Specific Training               |
| 3:00 PM - 4:00 PM   Q&A / Workspace Setup                |
| 4:00 PM - 5:00 PM   First Assignment & Wrap-up           |
|                                                           |
| [Customize Agenda]                                        |
|                                                           |
| KEY CONTACTS                                              |
|                                                           |
| Hiring Manager                                            |
| Name: John Manager                                        |
| Email: john.manager@google.com                            |
| Phone: (555) 111-2222                                     |
|                                                           |
| HR Contact                                                |
| Name: Sarah HR                                            |
| Email: sarah.hr@intime.com                                |
| Phone: (555) 333-4444                                     |
|                                                           |
| IT Support                                                |
| Email: it@intime.com                                      |
| Phone: (555) 555-6666                                     |
| Hours: 8 AM - 6 PM PT                                     |
|                                                           |
| InTime Recruiter (You)                                    |
| Your Name: Mike Recruiter                                 |
| Your Email: mike.recruiter@intime.com                     |
| Your Phone: (555) 777-8888                                |
|                                                           |
| PRE-START COMMUNICATION                                   |
|                                                           |
| Welcome Email Sent                                        |
| ☑ Send welcome email 3 days before start (Dec 6)         |
|                                                           |
| Email will include:                                       |
| ✓ Start date/time confirmation                           |
| ✓ Meeting link and instructions                          |
| ✓ First day agenda                                       |
| ✓ What to expect                                         |
| ✓ Key contacts                                           |
| ✓ Equipment delivery status                              |
| ✓ Dress code (casual for remote)                         |
|                                                           |
| Reminder Call Scheduled                                   |
| ☑ Call candidate 1 day before start (Dec 8)              |
|   To confirm: Ready to start, equipment received, any Qs |
|                                                           |
+----------------------------------------------------------+
|    [← Back]  [Send Test Invite]  [Next: Final Review →] |
+----------------------------------------------------------+
```

**Field Specification: Start Time**
| Property | Value |
|----------|-------|
| Field Name | `startTime` |
| Type | Time Picker |
| Label | "Start Time" |
| Required | Yes |
| Default | 9:00 AM |
| Format | 12-hour with AM/PM |

**Field Specification: Onboarding Format**
| Property | Value |
|----------|-------|
| Field Name | `onboardingFormat` |
| Type | Radio Button Group |
| Label | "Onboarding Format" |
| Required | Yes |
| Options | Virtual, In-Person, Hybrid |
| Default | Virtual (for remote positions) |
| Conditional | If in-person, show location field |

**Field Specification: First Day Agenda**
| Property | Value |
|----------|-------|
| Field Name | `firstDayAgenda` |
| Type | Rich Text Editor |
| Label | "First Day Agenda" |
| Required | No |
| Default | Standard template |
| Editable | Yes (click "Customize Agenda") |

**User Action:** Review first day logistics

**Typical Checks:**
1. ✅ Start time: 9:00 AM Pacific (works for candidate)
2. ✅ Virtual onboarding (remote position)
3. ✅ Meeting link created and tested
4. ✅ Agenda looks comprehensive
5. ✅ All contacts are correct
6. ✅ Welcome email will send Dec 6
7. ✅ Reminder call scheduled for Dec 8

**User Action:** Click "Send Test Invite" to preview calendar invite

**System Response:**
- Generates preview of calendar invite
- Shows subject, body, attachments
- User reviews and closes preview

**User Action:** Click "Next: Final Review →"

**Time:** ~2 minutes

---

### Step 7: Final Review and Confirmation

**System Response:**
- Validates Step 3 fields
- Slides to Step 4 (Final Review)
- Generates complete placement summary

**Screen State:**
```
+----------------------------------------------------------+
|                              Confirm Candidate Placement [×]|
+----------------------------------------------------------+
| Step 4 of 4: Final Review & Confirm                       |
|                                                           |
| PLACEMENT SUMMARY                                         |
|                                                           |
| Candidate Details                                         |
| Name: Jane Doe                                            |
| Email: jane.doe@email.com                                 |
| Phone: (555) 123-4567                                     |
| Visa: H1B (Valid until June 2026)                        |
|                                                           |
| Position Details                                          |
| Title: Senior Software Engineer                           |
| Client: Google                                            |
| Department: Engineering                                   |
| Hiring Manager: John Manager                              |
| Work Location: Remote                                     |
|                                                           |
| Contract Terms                                            |
| Start Date: December 9, 2025 (Monday)                    |
| End Date: December 9, 2026 (Wednesday)                   |
| Duration: 12 months                                       |
| Assignment Type: Contract-to-Hire                         |
|                                                           |
| Compensation                                              |
| Pay Rate: $100.00/hr (W2)                                |
| Bill Rate: $125.00/hr                                     |
| Margin: $25.00/hr (20.0%)                                |
| Standard Hours: 40 hrs/week                              |
| Overtime: Eligible at 1.5x                                |
| Estimated Annual Pay: ~$208,000                          |
| Estimated Annual Revenue: ~$260,000                      |
| Estimated Annual Margin: ~$52,000                        |
|                                                           |
| Paperwork Status                                          |
| ✅ I-9 Employment Eligibility: Complete                  |
| ✅ W-4 Federal Tax: Complete                             |
| ✅ State Tax Withholding: Complete                       |
| ✅ Direct Deposit: Complete                              |
| ✅ Background Check: Clear                               |
| ✅ Client NDA: Signed                                    |
| ✅ Security Training: Scheduled                          |
| ✅ Badge/Access: Requested                               |
| ✅ Equipment: Ordered (ships Dec 6)                      |
| ✅ Benefits: Enrolled                                    |
|                                                           |
| First Day Logistics                                       |
| Date: Monday, December 9, 2025                            |
| Time: 9:00 AM Pacific                                     |
| Format: Virtual Onboarding                                |
| Meeting: Google Meet (link in calendar invite)           |
| Welcome Email: Sends Dec 6 (auto)                        |
| Reminder Call: Dec 8 (scheduled)                         |
|                                                           |
| NOTIFICATIONS                                             |
|                                                           |
| The following will be notified upon placement confirmation:|
| ✓ Pod Manager (Sarah Johnson)                            |
| ✓ Regional Director (Mike Smith)                         |
| ✓ HR Manager (Sarah HR)                                  |
| ✓ Finance (for invoicing setup)                          |
| ✓ COO (Lisa Chen)                                        |
| ✓ Hiring Manager (John Manager)                          |
| ✓ Candidate (Jane Doe) - Confirmation email              |
|                                                           |
| SYSTEM ACTIONS                                            |
|                                                           |
| Upon confirmation, the system will:                       |
| ✓ Create placement record                                |
| ✓ Update submission status to "Placed"                   |
| ✓ Update candidate status to "Placed"                    |
| ✓ Trigger commission calculation                         |
| ✓ Create invoicing schedule                              |
| ✓ Schedule 30/60/90 day check-ins                        |
| ✓ Log placement in activity timeline                     |
| ✓ Update RACI assignments                                |
| ✓ Notify all stakeholders                                |
|                                                           |
| ⚠️  IMPORTANT: This action cannot be easily undone.      |
|     Please verify all details are correct before confirming.|
|                                                           |
| Final Checklist                                           |
| ☑ All placement details are accurate                     |
| ☑ All paperwork is complete and verified                 |
| ☑ Start date is confirmed with candidate and client      |
| ☑ First day logistics are coordinated                    |
| ☑ I have reviewed the placement summary                  |
|                                                           |
+----------------------------------------------------------+
| [← Back]  [Save as Draft]  [Cancel]  [Confirm Placement ✓]|
+----------------------------------------------------------+
```

**User Action:** Review complete placement summary

**Critical Verifications:**
1. ✅ Candidate information correct
2. ✅ Position details match job
3. ✅ Contract terms accurate
4. ✅ Rates correct ($100/hr pay, $125/hr bill, 20% margin)
5. ✅ All paperwork complete
6. ✅ First day logistics confirmed
7. ✅ All checkboxes in final checklist checked

**User Action:** Click "Confirm Placement ✓" button

**Time:** ~2 minutes

---

### Step 8: System Confirms Placement

**User Action:** Click "Confirm Placement ✓"

**System Response:**

1. **Button shows loading state** (~1 second)

2. **Creates placement record** (~100ms)
   ```sql
   INSERT INTO placements (
     id, org_id, submission_id, job_id, candidate_id, account_id,
     placement_type, assignment_type,
     start_date, end_date, actual_start_date,
     pay_rate, bill_rate, margin_amount, margin_percentage,
     employment_type, standard_hours_per_week,
     work_location, time_zone,
     hiring_manager_name, hiring_manager_email,
     onboarding_format, first_day_meeting_link,
     paperwork_complete, equipment_shipped,
     status, created_by, created_at, updated_at
   ) VALUES (...);
   ```

3. **Updates submission status** (~50ms)
   ```sql
   UPDATE submissions
   SET status = 'placed',
       placement_id = new_placement_id,
       placed_at = NOW(),
       placed_by = current_user_id,
       updated_at = NOW()
   WHERE id = submission_id;
   ```

4. **Updates candidate status** (~50ms)
   ```sql
   UPDATE user_profiles
   SET candidate_status = 'placed',
       current_placement_id = new_placement_id,
       updated_at = NOW()
   WHERE id = candidate_id;
   ```

5. **Triggers commission calculation** (~100ms)
   ```typescript
   const commission = calculateCommission({
     placementId: newPlacementId,
     recruiterId: currentUserId,
     marginAmount: 25, // $25/hr
     hoursPerWeek: 40,
     commissionPercentage: 0.10, // 10%
     durationMonths: 3 // pay commission for first 3 months
   });

   // Result:
   // Monthly margin: $25/hr × 173.2 hrs = $4,330
   // 3-month margin: $4,330 × 3 = $12,990
   // Commission (10%): $12,990 × 0.10 = $1,299
   ```

6. **Creates invoicing schedule** (~100ms)
   ```sql
   -- Create recurring invoice schedule
   INSERT INTO invoice_schedules (
     id, org_id, placement_id, account_id,
     frequency, start_date, end_date,
     bill_rate, estimated_hours_per_period,
     next_invoice_date, created_at
   ) VALUES (
     gen_random_uuid(), org_id, placement_id, account_id,
     'weekly', start_date, end_date,
     125.00, 40,
     start_date + interval '7 days', NOW()
   );
   ```

7. **Schedules automated check-ins** (~100ms)
   ```sql
   -- 30-day check-in
   INSERT INTO scheduled_tasks (
     task_type, entity_type, entity_id,
     assigned_to, due_date, status
   ) VALUES (
     '30_day_checkin', 'placement', placement_id,
     recruiter_id, start_date + interval '30 days', 'pending'
   );

   -- 60-day check-in
   INSERT INTO scheduled_tasks (...)
   VALUES (
     '60_day_checkin', 'placement', placement_id,
     recruiter_id, start_date + interval '60 days', 'pending'
   );

   -- 90-day check-in
   INSERT INTO scheduled_tasks (...)
   VALUES (
     '90_day_checkin', 'placement', placement_id,
     recruiter_id, start_date + interval '90 days', 'pending'
   );
   ```

8. **Sends email notifications** (~2 seconds)
   - **To Candidate:**
     ```
     Subject: Congratulations! Placement Confirmed - Start Dec 9

     Hi Jane,

     Congratulations! Your placement has been officially confirmed.

     Position: Senior Software Engineer
     Client: Google
     Start Date: Monday, December 9, 2025 at 9:00 AM Pacific
     Format: Virtual Onboarding

     What's Next:
     - You'll receive a welcome email on Dec 6 with joining details
     - We'll call you on Dec 8 to confirm you're all set
     - Your equipment will arrive by Dec 6
     - First day meeting link: [Google Meet Link]

     We're excited for you to start this new role!

     Best regards,
     Mike Recruiter
     InTime
     ```

   - **To Pod Manager:**
     ```
     Subject: Placement Confirmed - Jane Doe @ Google

     Sarah,

     Placement Details:
     - Candidate: Jane Doe
     - Position: Senior Software Engineer @ Google
     - Start: Dec 9, 2025
     - Rate: $100/hr pay, $125/hr bill (20% margin)
     - Revenue: ~$260K/year
     - Commission: $1,299 (estimated)

     All paperwork complete, first day logistics coordinated.

     [View Placement Details]
     ```

   - **To Finance:**
     ```
     Subject: New Placement - Invoicing Setup Required

     Finance Team,

     New placement confirmed:
     - Client: Google
     - Candidate: Jane Doe
     - Start: Dec 9, 2025
     - Bill Rate: $125/hr
     - Frequency: Weekly invoicing
     - PO Number: [To be provided]

     Please set up invoicing schedule.

     [View Details]
     ```

   - **To HR:**
     ```
     Subject: New Placement - Onboarding Required

     HR Team,

     New W2 employee starting:
     - Name: Jane Doe
     - Start: Dec 9, 2025
     - Position: Senior Software Engineer
     - Client: Google
     - Benefits: Enrolled

     All I-9, W-4 completed. Please initiate onboarding.

     [View Profile]
     ```

   - **To Hiring Manager (Client):**
     ```
     Subject: Jane Doe - Start Date Confirmed

     Hi John,

     Great news! Jane Doe's placement is confirmed.

     Start Date: Monday, December 9, 2025 at 9:00 AM Pacific
     Meeting Link: [Google Meet Link]

     Jane will be ready to go with all necessary access and equipment.

     Looking forward to a successful engagement!

     Best,
     Mike Recruiter
     ```

9. **Logs activities** (~100ms)
   ```sql
   INSERT INTO activities (
     entity_type, entity_id, activity_type, description, metadata
   ) VALUES
   ('placement', placement_id, 'created', 'Placement confirmed', {...}),
   ('submission', submission_id, 'placed', 'Candidate placed', {...}),
   ('candidate', candidate_id, 'placed', 'Placed at Google', {...}),
   ('job', job_id, 'filled', 'Position filled', {...});
   ```

10. **Creates RACI assignments** (~50ms)
    - Responsible: Recruiter (creator)
    - Accountable: Pod Manager
    - Consulted: HR, Finance
    - Informed: COO, Regional Director, Hiring Manager

11. **On Success:**
    - Modal closes (300ms animation)
    - Confetti animation plays (celebration!)
    - Toast notification: "🎉 Placement Confirmed! Jane Doe starts Dec 9" (green)
    - Submission detail view refreshes
    - Status badge updates to "💚 Placed"
    - Activity timeline shows new placement entry
    - URL changes to: `/employee/workspace/placements/{placement-id}`
    - Placement detail view opens automatically

**Screen State (After Success):**
```
+----------------------------------------------------------+
| 🎉 PLACEMENT CONFIRMED!                                   |
+----------------------------------------------------------+
| [← Back to Placements]                  Placement Detail  |
+----------------------------------------------------------+
|
| Jane Doe @ Google                                         |
| Senior Software Engineer                                  |
| Status: 💚 Active Placement            [Actions ▼]       |
| Start Date: December 9, 2025 (8 days away)               |
| Confirmed: December 1, 2025 by You                        |
|                                                           |
+----------------------------------------------------------+
| Overview | Timeline | Documents | Check-ins | Financials |
+----------------------------------------------------------+
|
| PLACEMENT OVERVIEW                                        |
|                                                           |
| Contract Details                                          |
| Start Date: Dec 9, 2025                                   |
| End Date: Dec 9, 2026                                     |
| Duration: 12 months                                       |
| Status: Confirmed (awaiting start)                        |
|                                                           |
| Compensation                                              |
| Pay Rate: $100.00/hr                                      |
| Bill Rate: $125.00/hr                                     |
| Margin: $25.00/hr (20%)                                  |
| Employment: W2                                            |
|                                                           |
| Financial Metrics                                         |
| Estimated Annual Revenue: $260,000                       |
| Estimated Annual Margin: $52,000                         |
| Your Commission: $1,299 (estimated)                      |
| Commission Status: Pending start                          |
|                                                           |
| First Day Logistics                                       |
| Date: Monday, Dec 9 at 9:00 AM PT                        |
| Format: Virtual Onboarding                                |
| Meeting Link: [Google Meet]                              |
|                                                           |
| Upcoming Milestones                                       |
| 📧 Dec 6: Welcome email sent (auto)                      |
| 📞 Dec 8: Reminder call to candidate                     |
| 🎉 Dec 9: First day / Start date                         |
| ✅ Jan 8: 30-day check-in                                |
| ✅ Feb 7: 60-day check-in                                |
| ✅ Mar 9: 90-day check-in (+ 401k eligibility)           |
|                                                           |
| Key Contacts                                              |
| Hiring Manager: John Manager (john.manager@google.com)   |
| HR Contact: Sarah HR (sarah.hr@intime.com)               |
| IT Support: it@intime.com                                 |
|                                                           |
| RECENT ACTIVITY                                           |
| ✅ Placement confirmed by You · 2 minutes ago            |
| ✅ Commission calculated: $1,299 · 2 minutes ago         |
| ✅ Invoicing schedule created · 2 minutes ago            |
| ✅ 30/60/90 day check-ins scheduled · 2 minutes ago      |
| ✅ Notifications sent to 7 stakeholders · 2 minutes ago  |
|                                                           |
+----------------------------------------------------------+
| [Update Status]  [Add Note]  [Schedule Check-in]        |
+----------------------------------------------------------+
```

**Total Processing Time:** ~5 seconds

---

## Postconditions

1. ✅ Placement record created in `placements` table
2. ✅ Submission status updated to `placed`
3. ✅ Candidate status updated to `placed`
4. ✅ Job position count decremented (if all positions filled, job status → `filled`)
5. ✅ Commission record created with estimated amount
6. ✅ Invoicing schedule created for weekly billing
7. ✅ 30/60/90 day check-ins scheduled as tasks
8. ✅ Welcome email scheduled to send 3 days before start
9. ✅ Reminder call task created for 1 day before start
10. ✅ Email notifications sent to all stakeholders (7 people)
11. ✅ RACI assignments created (R: Recruiter, A: Pod Manager, C: HR/Finance, I: COO)
12. ✅ Activity logged in placement, submission, candidate, and job timelines
13. ✅ Recruiter redirected to placement detail page

---

## Events Logged

| Event | Payload |
|-------|---------|
| `placement.created` | `{ placement_id, candidate_id, job_id, start_date, end_date, pay_rate, bill_rate, margin, created_by, created_at }` |
| `placement.confirmed` | `{ placement_id, confirmation_date, confirmed_by }` |
| `submission.placed` | `{ submission_id, placement_id, placed_at, placed_by }` |
| `candidate.placed` | `{ candidate_id, placement_id, client_name, position_title, start_date }` |
| `job.position_filled` | `{ job_id, placement_id, positions_remaining }` |
| `commission.calculated` | `{ recruiter_id, placement_id, amount, calculation_method, created_at }` |
| `invoice_schedule.created` | `{ schedule_id, placement_id, account_id, frequency, bill_rate, start_date }` |
| `notification.sent` | `{ type: 'placement_confirmed', recipients: [...], template: 'placement_confirmed_email', sent_at }` |

---

## Alternative Flows

### A1: Start Date Needs to Change

**Scenario:** Candidate requests to push start date by 1 week

**Flow:**
1. Recruiter clicks "Update Start Date" button on submission detail
2. System shows date change modal:
   ```
   ┌──────────────────────────────────────────────────────┐
   │ Update Start Date                                [×] │
   ├──────────────────────────────────────────────────────┤
   │                                                      │
   │ Current Start Date: December 9, 2025                │
   │                                                      │
   │ New Start Date *                                     │
   │ [12/16/2025                                 📅]     │
   │                                                      │
   │ Reason for Change *                                  │
   │ [Candidate requested additional week for current  ] │
   │ [project handoff at previous employer            ] │
   │                                             0/500   │
   │                                                      │
   │ ☑ Notify hiring manager for approval               │
   │ ☑ Update end date (maintain 12-month duration)     │
   │ ☑ Reschedule welcome email and reminder call       │
   │ ☑ Adjust equipment delivery if needed              │
   │                                                      │
   └──────────────────────────────────────────────────────┘
   │              [Cancel]  [Request Date Change]         │
   └──────────────────────────────────────────────────────┘
   ```
3. System sends approval request to hiring manager
4. If approved:
   - Updates placement start date
   - Adjusts end date to maintain contract duration
   - Reschedules automated tasks (welcome email, check-ins)
   - Notifies candidate of confirmed new date
5. If declined:
   - Reverts to original date
   - Notifies recruiter to discuss with candidate

**Time:** +10-60 minutes (waiting for approval)

---

### A2: Missing Paperwork Discovered

**Scenario:** During final review, discover I-9 is incomplete

**Flow:**
1. System shows warning on Step 2:
   ```
   ⚠️  Critical Paperwork Missing

   The following required documents are incomplete:
   - I-9 Employment Eligibility Verification

   You cannot confirm placement until all required paperwork
   is completed.

   [Resend I-9 to Candidate]  [Mark as Complete Manually]
   ```
2. Recruiter options:
   - **Option A:** Resend I-9 form via DocuSign
     - System sends new DocuSign envelope
     - Candidate completes form
     - Webhook updates status to complete
     - Recruiter can proceed
   - **Option B:** Mark as complete manually (if signed offline)
     - Recruiter uploads signed PDF
     - Checks "I-9 verified and uploaded"
     - Proceeds with placement confirmation

**Time:** +5-60 minutes (depending on candidate response)

---

### A3: Equipment Delayed

**Scenario:** Laptop shipment delayed, won't arrive by start date

**Flow:**
1. Recruiter notices equipment tracking shows delay
2. Two options:
   - **Option A:** Delay start date
     - See A1: Update start date
     - Push start to when equipment arrives
   - **Option B:** Provide loaner equipment
     - Coordinate with IT for temporary laptop
     - Update equipment notes in placement
     - Candidate starts on time with loaner
     - Permanent equipment arrives later, swap out

**Best Practice:** Always order equipment 7-10 days before start to allow buffer

---

### A4: Background Check Issues

**Scenario:** Background check reveals discrepancy

**Flow:**
1. Background check report shows issue (e.g., undisclosed criminal record)
2. System sends alert to recruiter:
   ```
   ⚠️  Background Check Issue - Action Required

   Candidate: Jane Doe
   Issue: Criminal record found (misdemeanor, 5 years ago)
   Status: Requires review

   [View Full Report]
   ```
3. Recruiter reviews report
4. Consults with Pod Manager and HR
5. Decisions:
   - **Pass:** Issue is minor, proceed with placement
     - Add note to file
     - Inform hiring manager (transparency)
     - Continue with confirmation
   - **Conditional Pass:** Requires client approval
     - Send report to hiring manager
     - Wait for decision
     - If approved: Continue
     - If denied: Withdraw offer
   - **Fail:** Serious issue, cannot hire
     - Withdraw offer
     - Notify candidate (legally compliant communication)
     - Source replacement

**Legal Requirement:** Must follow FCRA guidelines when taking adverse action

---

### A5: Client Postpones Start Date Indefinitely

**Scenario:** Hiring manager says "Hold on starting, project delayed by 2 months"

**Flow:**
1. Recruiter receives notification from client
2. Updates placement status to "on_hold"
3. Notifies candidate:
   ```
   Hi Jane,

   We've received notification from Google that the project
   start date needs to be postponed. They're estimating a
   2-month delay.

   Options:
   1. Wait for confirmed new start date (we'll keep you updated)
   2. We can source other opportunities for you in the meantime
   3. Withdraw from this placement

   Let me know your preference.
   ```
4. Candidate decides:
   - **Wait:** Status remains "on_hold", check in weekly
   - **Source alternatives:** Return to active candidate pool, source for other jobs
   - **Withdraw:** Cancel placement, submission status → "withdrawn"

**Risk:** Candidate may accept another offer during wait period

---

### A6: Multiple Positions Filled Simultaneously

**Scenario:** Job has 3 open positions, all filled at once

**Flow:**
1. Recruiter confirms placement for Candidate 1
2. System decrements `positions_filled` from 3 to 2
3. Recruiter confirms placement for Candidate 2
4. System decrements `positions_filled` from 2 to 1
5. Recruiter confirms placement for Candidate 3
6. System decrements `positions_filled` from 1 to 0
7. System automatically updates job status to `filled`
8. Notifications sent:
   - To Pod Manager: "All 3 positions filled for [Job Title]"
   - To Hiring Manager: "All positions filled, thank you"
   - To COO: "Job successfully filled"
9. Job removed from active job boards
10. Recruiter receives celebration notification:
    ```
    🎉 Congratulations! All 3 Positions Filled

    Job: Senior Software Engineer @ Google
    Placements:
    - Jane Doe (start Dec 9)
    - Mike Chen (start Dec 9)
    - Sarah Lee (start Dec 16)

    Total Revenue: $780K/year
    Total Margin: $156K/year
    Your Commission: $3,897 (estimated)

    Outstanding work!
    ```

---

## Exception Flows

### E1: Placement Confirmation Fails (System Error)

**Error:** Database write fails during placement creation

**System Response:**
1. Shows error toast: "Failed to create placement. Please try again."
2. Logs error details for debugging
3. Modal remains open with all data intact
4. User can retry by clicking "Confirm Placement" again
5. If retry fails 3 times:
   ```
   ⚠️  System Error - Contact Support

   We're experiencing technical difficulties creating this placement.

   Your data has been saved as a draft.

   Please contact IT support: it@intime.com

   Error ID: #ERR-20251201-1234 (provide to support)
   ```

**Recovery:** IT team manually creates placement record

---

### E2: Commission Calculation Error

**Error:** Commission calculation service throws exception

**System Response:**
1. Placement still created successfully
2. Commission record created with status `calculation_failed`
3. Alert sent to Finance team:
   ```
   ⚠️  Commission Calculation Failed

   Placement ID: #PLC-12345
   Recruiter: Mike Recruiter
   Expected Commission: Unable to calculate

   Please manually calculate and update.

   [View Placement]
   ```
4. Finance manually calculates commission
5. Updates commission record
6. Notifies recruiter of final amount

**Prevention:** Add validation before placement confirmation

---

### E3: Email Notification Failures

**Error:** Email service (SendGrid/Postmark) is down

**System Response:**
1. Placement creates successfully
2. Email notifications queued for retry
3. System attempts retry every 5 minutes for 24 hours
4. If still failing after 24 hours:
   - Alert sent to IT team
   - Recruiter manually notifies stakeholders
5. Once email service restored:
   - Queued emails sent
   - Notifications marked as delivered

**Fallback:** Recruiter manually calls/emails stakeholders

---

### E4: DocuSign Webhook Missed

**Error:** DocuSign sends "completed" webhook, but InTime doesn't receive it

**System Response:**
1. Offer remains in "awaiting signature" status
2. Automated hourly check queries DocuSign API for envelope status
3. If envelope shows "completed":
   - Syncs status to InTime
   - Updates offer to "accepted"
   - Triggers placement workflow
4. If still mismatch after 24 hours:
   - Alert sent to recruiter
   - Recruiter manually confirms status

**Prevention:** Implement webhook retry mechanism with DocuSign

---

## Business Rules

### BR1: Placement Timing Rules

| Event | Timing Rule |
|-------|-------------|
| Confirm Placement | Anytime after offer accepted, ideally 7-14 days before start |
| Welcome Email | Auto-send 3 days before start date |
| Reminder Call | 1 day before start date |
| Equipment Order | 7-10 days before start to allow shipping buffer |
| Access Requests | Submit 5-7 days before start (client IT processing time) |
| 30-day Check-in | Exactly 30 days after start date |
| 60-day Check-in | Exactly 60 days after start date |
| 90-day Check-in | Exactly 90 days after start date (also 401k eligibility) |

---

### BR2: Paperwork Requirements by Employment Type

| Document | W2 | C2C | 1099 | Notes |
|----------|-----|------|------|-------|
| I-9 | ✅ Required | ❌ Not required | ❌ Not required | US work eligibility |
| W-4 | ✅ Required | ❌ Not required | ❌ Not required | Tax withholding |
| State Tax | ✅ Required | ❌ Not required | ❌ Not required | State withholding |
| Direct Deposit | ✅ Required | ✅ Required | ✅ Required | Payment method |
| Background Check | ✅ Required | ⚠️ Client-dependent | ⚠️ Client-dependent | Security clearance |
| Drug Screen | ⚠️ Client-dependent | ⚠️ Client-dependent | ⚠️ Client-dependent | Some industries |
| Benefits Enrollment | ✅ Required | ❌ Not applicable | ❌ Not applicable | Health, 401k |
| Contractor Agreement | ❌ Not required | ✅ Required | ✅ Required | MSA/SOW |

---

### BR3: Placement Status Transitions

| From Status | To Status | Trigger | Can Revert? |
|-------------|-----------|---------|-------------|
| - | Confirmed | Recruiter confirms placement | No (start date in future) |
| Confirmed | Active | Start date arrives (auto) | No |
| Confirmed | On Hold | Client postpones start | Yes (to Confirmed) |
| Confirmed | Cancelled | Candidate or client cancels before start | Yes (to Submitted) |
| Active | Completed | End date arrives or contract ends | No |
| Active | Terminated | Early termination by either party | No |
| Active | Extended | Contract extended beyond original end | No (creates new end date) |
| On Hold | Confirmed | New start date set | Yes |
| On Hold | Cancelled | Indefinite hold or withdrawal | Yes (to Submitted) |

---

### BR4: Commission Eligibility Rules

| Scenario | Commission Eligible? | Amount |
|----------|---------------------|--------|
| Placement confirmed, starts successfully | ✅ Yes | 10% of 3-month margin |
| Placement confirmed, candidate no-shows | ❌ No | $0 |
| Placement confirmed, terminated within 30 days | ⚠️ Partial | 50% of calculated amount |
| Placement confirmed, terminated within 60 days | ⚠️ Partial | 75% of calculated amount |
| Placement confirmed, completes 90+ days | ✅ Full | 100% of calculated amount |
| Placement extended beyond original contract | ✅ Bonus | +5% of extension margin |
| Replacement placement (within 30 days of termination) | ✅ Yes | No additional cost to client |

**Calculation Example:**
```
Margin: $25/hr
Hours: 40/week = 173.2/month
Monthly Margin: $25 × 173.2 = $4,330
3-Month Margin: $4,330 × 3 = $12,990
Commission (10%): $12,990 × 0.10 = $1,299
```

---

### BR5: Replacement Guarantee Policy

| Termination Timing | Replacement Terms |
|--------------------|-------------------|
| Within 7 days | Free replacement, no questions asked |
| 8-30 days | Free replacement if performance-related |
| 31-60 days | 50% discount on replacement fee |
| 61-90 days | 25% discount on replacement fee |
| 90+ days | No replacement guarantee (standard fee) |

**Performance-related:** Skill mismatch, culture fit issues, quality concerns
**Non-performance:** Budget cuts, project cancellation, candidate personal reasons

---

## RACI Assignments

| Event | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|-------|-----------------|-----------------|---------------|--------------|
| **Placement Confirmed** | Recruiter (creator) | Pod Manager | HR, Finance | COO, Regional Director, Hiring Manager |
| **Paperwork Verified** | Recruiter | HR | Legal (if complex) | - |
| **First Day Coordinated** | Recruiter | Pod Manager | Hiring Manager | Candidate |
| **Commission Calculated** | Finance | CFO | Pod Manager | Recruiter, COO |
| **Invoicing Setup** | Finance | CFO | Account Manager | Recruiter |
| **30-Day Check-in** | Recruiter | Recruiter | Pod Manager (if issues) | HR |
| **60-Day Check-in** | Recruiter | Recruiter | Pod Manager | HR |
| **90-Day Check-in** | Recruiter | Pod Manager | HR | COO |
| **Contract Extension** | Recruiter | Pod Manager | Hiring Manager, Finance | COO |
| **Early Termination** | Recruiter | Pod Manager | HR, Legal | COO, CEO |

---

## Integration Points

### INT-1: HRIS System (BambooHR/Workday)

**Purpose:** Sync new hire data for onboarding
**Trigger:** Placement confirmed
**Data Sent:**
```json
{
  "employee": {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@email.com",
    "startDate": "2025-12-09",
    "jobTitle": "Senior Software Engineer",
    "department": "Engineering",
    "employmentType": "W2",
    "payRate": 100.00,
    "workLocation": "Remote"
  }
}
```

**Webhook:** HRIS sends updates back for onboarding completion

---

### INT-2: Payroll System (Gusto/ADP)

**Purpose:** Set up new employee for payroll
**Trigger:** Placement confirmed (W2 only)
**Data Sent:**
- Employee profile
- Pay rate
- Tax withholding (W-4 data)
- Direct deposit details
- Start date

**Sync Frequency:** Real-time on placement confirmation

---

### INT-3: Time Tracking System (TSheets/Harvest)

**Purpose:** Enable timesheet submission for contractor
**Trigger:** Placement start date arrives
**Action:**
- Create time tracking account for candidate
- Associate with client project code
- Set billing rate
- Send login credentials to candidate

---

### INT-4: Invoicing System (QuickBooks/FreshBooks)

**Purpose:** Automate weekly/monthly client invoicing
**Trigger:** Placement confirmed
**Setup:**
- Create recurring invoice schedule
- Link to client account
- Set billing rate, frequency
- Auto-generate invoices based on approved timesheets

---

## Metrics & Analytics

### M1: Placement Confirmation Rate

**Formula:** `(Placements Confirmed / Offers Accepted) × 100`
**Target:** > 95%
**Analysis:** Should be very high; if <90%, investigate why accepted offers don't convert to placements

---

### M2: Time from Offer Accepted to Placement Confirmed

**Formula:** `Average days from offer acceptance to placement confirmation`
**Target:** < 3 days
**Tracking:** Daily dashboard

**Breakdown:**
- Same day: Excellent
- 1-3 days: Good
- 4-7 days: Acceptable
- 7+ days: Too slow (risk of candidate drop-off)

---

### M3: Paperwork Completion Rate

**Formula:** `(Complete Paperwork Checklists / Total Placements) × 100`
**Target:** 100%
**Monitoring:** Any incomplete paperwork blocks start date

---

### M4: First Day No-Show Rate

**Formula:** `(Candidates Who No-Show / Total Placements) × 100`
**Target:** < 2%
**Analysis:** High no-show rate indicates issues in confirmation process

**Prevention:**
- Confirmation calls 1 day before
- Welcome emails 3 days before
- Equipment delivery confirmation
- Clear joining instructions

---

### M5: 30-Day Retention Rate

**Formula:** `(Placements Still Active at 30 Days / Total Placements) × 100`
**Target:** > 95%
**Critical:** Terminations within 30 days trigger replacement guarantee

**Red Flags:**
- <90%: Serious sourcing/screening issues
- <95%: Need to improve candidate quality or client expectations

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Confirm placement with all paperwork complete | Placement created successfully |
| TC-002 | Attempt to confirm with missing I-9 | Blocked with warning, cannot proceed |
| TC-003 | Confirm placement, triggers commission calculation | Commission record created with correct amount |
| TC-004 | Confirm placement, creates invoicing schedule | Weekly invoice schedule created |
| TC-005 | Confirm placement, schedules check-ins | 30/60/90 day check-in tasks created |
| TC-006 | Update start date before confirmation | New date saved, end date adjusted |
| TC-007 | Update start date after confirmation | Requires manager approval |
| TC-008 | Confirm placement for multi-position job | Job positions decremented correctly |
| TC-009 | Confirm last position for job | Job status changes to "filled" |
| TC-010 | Email notification service fails | Placement created, emails queued for retry |
| TC-011 | Commission calculation fails | Placement created, Finance alerted to calculate manually |
| TC-012 | Background check has issues | Placement blocked, HR/Legal review required |
| TC-013 | Equipment delivery delayed | Placement on hold or loaner equipment arranged |
| TC-014 | Client postpones start date indefinitely | Status changes to "on_hold", candidate notified |
| TC-015 | Send welcome email 3 days before start | Email delivered successfully with all details |

---

## Accessibility

- **Keyboard Navigation:** Full support for Tab, Enter, Esc, Space
- **Screen Readers:** All checklist items announced clearly
- **Color Contrast:** Status indicators meet WCAG 2.1 AA standards
- **Focus Indicators:** Clear visual focus on all checkboxes and inputs
- **Error Announcements:** Screen readers announce validation errors

---

## Mobile Considerations

**Responsive Breakpoints:**
- **Mobile (<640px):** Single-column layout, vertical stepper
- **Tablet (640-1024px):** Two-column for rate/date fields
- **Desktop (>1024px):** Full multi-column layout

**Mobile-Specific:**
- Checklist items have larger tap targets (44px minimum)
- Date picker optimized for touch
- PDF documents open in mobile viewer
- Email/call links trigger native apps

---

## Security

### S1: Data Protection

**Sensitive Data:**
- SSN/Tax IDs (I-9, W-4)
- Bank account details (direct deposit)
- Background check reports
- Medical information (benefits enrollment)

**Encryption:**
- All PII encrypted at rest (AES-256)
- All data encrypted in transit (TLS 1.3)
- Access logs for all paperwork views

---

### S2: Audit Trail

**All placement actions logged:**
- Who confirmed placement
- When confirmed
- What paperwork was verified
- Who was notified
- Commission amount calculated
- Any changes to start date or terms
- IP address and timestamp

**Retention:** 7 years (compliance with employment law)

---

### S3: Access Control

**Permissions:**
- `placement.create`: Recruiter, Pod Manager, Regional Director
- `placement.view`: R, A, C, I (RACI-based) + HR, Finance
- `placement.modify`: R, A only (before start date)
- `placement.terminate`: R, A, Pod Manager, HR
- `paperwork.view`: R, A, HR, Legal (strict need-to-know)

---

## Performance Requirements

| Operation | Target Time |
|-----------|-------------|
| Load submission detail | < 500ms |
| Open placement modal | < 300ms |
| Validate paperwork checklist | < 100ms |
| Create placement record | < 2 seconds |
| Send all notifications | < 3 seconds |
| Total placement confirmation | < 10 seconds |

---

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-30 | Initial creation of UC-REC-022 | Product Team |

---

*Last Updated: 2025-11-30*
*Next Review: 2026-01-30*
