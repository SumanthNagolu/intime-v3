# Use Case: Extend Offer

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-021 |
| Actor | Recruiter (Technical Recruiter) |
| Goal | Extend formal job offer to candidate after successful interview process |
| Frequency | 5-10 times per week (varies by recruiter productivity) |
| Estimated Time | 15-30 minutes |
| Priority | Critical |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "offer.create" permission (default for Recruiter role)
3. Submission exists with status "interview" or "client_approved"
4. Candidate has completed all interview rounds
5. Client has verbally approved candidate
6. Rate/margin calculations are within acceptable range
7. Pod Manager consulted on final terms (for RACI compliance)

---

## Trigger

One of the following:
- Client provides verbal approval to proceed with offer
- Hiring manager requests offer extension
- Internal approval for rate/margin completed
- Candidate negotiation reaches agreement
- Pod Manager directs recruiter to extend offer

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Submission

**User Action:** Click "Submissions" in sidebar navigation

**System Response:**
- Sidebar item highlights with active state
- URL changes to: `/employee/workspace/submissions`
- Submissions list screen loads
- Loading skeleton shows for 200-500ms
- Submissions list populates with user's submissions

**Screen State:**
```
+----------------------------------------------------------+
| Submissions                      [+ New Submission] [Cmd+K]|
+----------------------------------------------------------+
| [Search submissions...]              [Filter ▼] [Sort ▼]  |
+----------------------------------------------------------+
| ● Interview │ ○ Submitted │ ○ Offer │ ○ Placed │ ○ All    |
+----------------------------------------------------------+
| Status    Candidate         Job              Client   Age |
| ─────────────────────────────────────────────────────────|
| 🟠 Intrv  Jane Doe         Sr Engineer      Google   3d  |
| 🟠 Intrv  John Smith       Java Dev         Meta     5d  |
| 🟢 Offer  Sarah Chen       Full Stack       Amazon   1d  |
+----------------------------------------------------------+
| Showing 47 submissions                                    |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Select Submission

**User Action:** Click on Jane Doe's submission row

**System Response:**
- Row highlights
- URL changes to: `/employee/workspace/submissions/{submission-id}`
- Submission detail view loads
- Shows full submission details including interview feedback

**Screen State:**
```
+----------------------------------------------------------+
| [← Back to Submissions]                 Submission Detail |
+----------------------------------------------------------+
|
| Jane Doe → Senior Software Engineer @ Google              |
| Status: 🟠 Interview Complete            [Actions ▼]     |
| Submitted: Nov 25, 2025 (5 days ago)                     |
|                                                           |
+----------------------------------------------------------+
| Overview | Interview History | Documents | Activity      |
+----------------------------------------------------------+
|
| CANDIDATE DETAILS                                         |
| Name: Jane Doe                                            |
| Email: jane.doe@email.com                                 |
| Phone: (555) 123-4567                                     |
| Visa: H1B (Valid until June 2026)                        |
| Availability: Immediate                                   |
|                                                           |
| RATE INFORMATION                                          |
| Candidate Expectation: $95-105/hr                        |
| Client Budget: $110-125/hr (Bill Rate)                   |
| Proposed Pay Rate: $100/hr                               |
| Proposed Bill Rate: $125/hr                              |
| Margin: $25/hr (20%)                                     |
|                                                           |
| INTERVIEW STATUS                                          |
| ✅ Round 1: Technical Screen (Passed) - Nov 26           |
|    Interviewer: John Manager                              |
|    Feedback: Strong technical skills, good culture fit   |
|                                                           |
| ✅ Round 2: Coding Challenge (Passed) - Nov 27           |
|    Score: 92/100                                          |
|    Feedback: Excellent problem-solving                    |
|                                                           |
| ✅ Round 3: Final Interview (Passed) - Nov 28            |
|    Interviewers: Sarah Director, Mike VP                 |
|    Feedback: Highly recommended to hire                  |
|                                                           |
| CLIENT DECISION                                           |
| 🎉 Verbal Approval Received - Nov 29                     |
| Contact: John Manager (Hiring Manager)                    |
| Notes: "Please proceed with offer, target start Dec 9"   |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 3: Click "Extend Offer" Action

**User Action:** Click "Actions ▼" dropdown, select "Extend Offer"

**System Response:**
- Dropdown opens showing available actions:
  - ✅ Extend Offer
  - Schedule Follow-up Interview
  - Request Client Feedback
  - Withdraw Submission
- User clicks "Extend Offer"
- Modal slides in from right (300ms animation)
- Modal title: "Extend Job Offer"
- First section focused

**Screen State:**
```
+----------------------------------------------------------+
|                                       Extend Job Offer [×]|
+----------------------------------------------------------+
| Step 1 of 4: Verify Rates & Margin                        |
|                                                           |
| Candidate: Jane Doe                                       |
| Job: Senior Software Engineer @ Google                    |
| Status: Ready for Offer                                   |
|                                                           |
| RATE VALIDATION                                           |
|                                                           |
| Pay Rate (to Candidate) *                                 |
| [$100.00   ] /hr                                          |
|                                                           |
| Bill Rate (to Client) *                                   |
| [$125.00   ] /hr                                          |
|                                                           |
| Calculated Margin                                         |
| Amount: $25.00/hr                                         |
| Percentage: 20.0%  [✅ Within acceptable range (15-35%)]  |
|                                                           |
| Employment Type *                                         |
| ● W2    ○ C2C    ○ 1099                                  |
|                                                           |
| Contract Duration *                                       |
| [12  ] months    □ Option to extend                      |
|                                                           |
| Expected Start Date *                                     |
| [12/09/2025                                     📅]      |
|                                                           |
| ⚠️  Manager Approval Required (Margin Review)            |
| □ I have consulted with Pod Manager on these terms       |
|                                                           |
+----------------------------------------------------------+
|                   [Cancel]  [Next: Offer Details →]      |
+----------------------------------------------------------+
```

**Field Specification: Pay Rate**
| Property | Value |
|----------|-------|
| Field Name | `payRate` |
| Type | Currency Input |
| Label | "Pay Rate (to Candidate)" |
| Required | Yes |
| Min Value | 0 |
| Precision | 2 decimal places |
| Prefix | "$" |
| Suffix | "/hr" |
| Default | Pre-filled from submission |
| Validation | Must be > 0, must allow reasonable margin |

**Field Specification: Bill Rate**
| Property | Value |
|----------|-------|
| Field Name | `billRate` |
| Type | Currency Input |
| Label | "Bill Rate (to Client)" |
| Required | Yes |
| Validation | Must be >= pay rate + minimum margin (15%) |
| Auto-calculate | Margin shown in real-time |

**Business Rule: Margin Validation**
| Margin % | Status | Approval Required |
|----------|--------|-------------------|
| < 15% | ❌ Not Allowed | Blocked |
| 15-20% | ⚠️ Low Margin | Pod Manager approval |
| 20-35% | ✅ Acceptable | No approval needed |
| > 35% | ⚠️ High Margin | Pod Manager review (competitive check) |

**Time:** ~300ms

---

### Step 4: Verify and Adjust Rates

**User Action:** Review pre-filled rates, adjust if needed

**Scenario:** Rates are acceptable, candidate negotiated to $100/hr, client approved $125/hr bill rate

**User Action:**
1. Confirm pay rate: $100/hr
2. Confirm bill rate: $125/hr
3. Verify margin: 20% (acceptable)
4. Select employment type: W2
5. Enter contract duration: 12 months
6. Check "Option to extend"
7. Select start date: Dec 9, 2025
8. Check "I have consulted with Pod Manager on these terms"

**System Response:**
- All fields validated
- Margin automatically calculated and displayed
- Green checkmark shows margin is acceptable
- Manager consultation checkbox enables "Next" button

**Alternative Flow: Margin Outside Range**

If pay rate is $105/hr and bill rate is $120/hr:
- Margin = $15/hr = 12.5%
- System shows: "⚠️ Margin below 15% minimum. Pod Manager approval required."
- Modal shows additional field:
  ```
  Manager Approval
  [Select Pod Manager...                                 ▼]

  Justification for Low Margin *
  [                                                       ]
  [Explain why this margin is necessary...               ]
  [                                                       ]

  ☑ Email approval request to Pod Manager now
  ```
- User must fill justification and select manager
- System sends approval request
- Offer workflow pauses until approved

**Time:** ~30 seconds

---

### Step 5: Click "Next" to Offer Details

**User Action:** Click "Next: Offer Details →"

**System Response:**
- Form validates Step 1 fields
- Slides to Step 2
- Pre-fills standard offer terms

**Screen State:**
```
+----------------------------------------------------------+
|                                       Extend Job Offer [×]|
+----------------------------------------------------------+
| Step 2 of 4: Offer Details & Terms                        |
|                                                           |
| COMPENSATION PACKAGE                                      |
|                                                           |
| Base Rate: $100.00/hr (W2)                               |
| Standard Hours: [40  ] hours/week                        |
| Overtime Eligible: ● Yes  ○ No                           |
| Overtime Rate: [1.5 ] × base rate (time and a half)     |
|                                                           |
| ADDITIONAL COMPENSATION (Optional)                        |
|                                                           |
| Signing Bonus                                             |
| [$        ] (one-time payment)                           |
|                                                           |
| Relocation Assistance                                     |
| [$        ] or ○ N/A                                     |
|                                                           |
| Per Diem (if travel required)                            |
| [$        ] /day or ○ N/A                                |
|                                                           |
| BENEFITS (W2 only)                                        |
|                                                           |
| Health Insurance                                          |
| ☑ Medical    ☑ Dental    ☑ Vision                        |
| Employee Contribution: [$ 250  ] /month                  |
|                                                           |
| Paid Time Off                                             |
| Vacation Days: [15  ] days/year                          |
| Sick Days: [10  ] days/year                              |
| Holidays: [10  ] days/year (company observed)            |
|                                                           |
| 401(k) Retirement Plan                                    |
| ☑ Available after [90  ] days                            |
| Company Match: [4  ]% up to [6  ]% contribution          |
|                                                           |
| CONTRACT TERMS                                            |
|                                                           |
| Work Location                                             |
| ● Remote    ○ On-site    ○ Hybrid ([3 ] days/week)      |
|                                                           |
| Hours & Schedule                                          |
| Standard: [9:00 AM] to [5:00 PM] [PST ▼]                |
| ☑ Flexible hours (core hours 10am-3pm)                   |
|                                                           |
| Equipment Provided                                        |
| ☑ Laptop    ☑ Monitor    ☑ Phone    □ Other             |
|                                                           |
| Termination Terms                                         |
| Notice Period: [2  ] weeks                               |
| ☑ Include non-compete clause (standard)                  |
|                                                           |
+----------------------------------------------------------+
|            [← Back]  [Cancel]  [Next: Review Offer →]   |
+----------------------------------------------------------+
```

**Field Specification: Standard Hours**
| Property | Value |
|----------|-------|
| Field Name | `standardHoursPerWeek` |
| Type | Number Input |
| Label | "Standard Hours" |
| Required | Yes |
| Default | 40 |
| Min | 20 |
| Max | 60 |
| Suffix | "hours/week" |

**Field Specification: Overtime Eligible**
| Property | Value |
|----------|-------|
| Field Name | `overtimeEligible` |
| Type | Radio Button Group |
| Label | "Overtime Eligible" |
| Required | Yes |
| Default | true |
| Conditional | If yes, show overtime rate multiplier |

**Field Specification: Paid Time Off**
| Property | Value |
|----------|-------|
| Field Name | `vacationDays`, `sickDays`, `holidays` |
| Type | Number Input |
| Label | Various |
| Required | Yes (for W2) |
| Default | vacation=15, sick=10, holidays=10 |
| Min | 0 |
| Max | 30 each |

**Time:** ~2 minutes (reviewing and customizing terms)

---

### Step 6: Complete Offer Details

**User Action:** Review and adjust offer terms

**Typical adjustments:**
1. Standard hours: Leave at 40
2. Overtime: Yes, 1.5x rate
3. Signing bonus: Leave blank (not offered)
4. Benefits: Check all standard (medical, dental, vision)
5. PTO: Leave defaults (15 vacation, 10 sick, 10 holidays)
6. 401(k): Available after 90 days, 4% match up to 6%
7. Work location: Remote
8. Equipment: Laptop, Monitor

**User Action:** Click "Next: Review Offer →"

**Time:** ~2 minutes

---

### Step 7: Review Complete Offer Package

**User Action:** Click "Next: Review Offer →"

**System Response:**
- Validates Step 2 fields
- Slides to Step 3
- Generates offer summary

**Screen State:**
```
+----------------------------------------------------------+
|                                       Extend Job Offer [×]|
+----------------------------------------------------------+
| Step 3 of 4: Review & Generate Offer Letter               |
|                                                           |
| OFFER SUMMARY                                             |
|                                                           |
| Candidate: Jane Doe                                       |
| Position: Senior Software Engineer                        |
| Client: Google                                            |
| Location: Remote                                          |
| Start Date: December 9, 2025                              |
|                                                           |
| COMPENSATION                                              |
| Base Rate: $100.00/hr (W2)                               |
| Standard Hours: 40 hours/week                            |
| Estimated Annual: ~$208,000                              |
| Overtime: Eligible at 1.5x rate                          |
|                                                           |
| BENEFITS                                                  |
| Health Insurance: Medical, Dental, Vision                 |
|   Employee Cost: $250/month                              |
| Paid Time Off: 15 vacation, 10 sick, 10 holidays        |
| 401(k): 4% match (available after 90 days)               |
|                                                           |
| CONTRACT TERMS                                            |
| Duration: 12 months (with option to extend)              |
| Employment Type: W2                                       |
| Work Location: Remote (100%)                             |
| Equipment: Laptop, Monitor provided                       |
| Notice Period: 2 weeks                                    |
|                                                           |
| OFFER LETTER GENERATION                                   |
|                                                           |
| Template Selection *                                      |
| [Standard W2 Contract Offer                           ▼] |
|   Options: Standard W2, C2C, 1099, Custom                |
|                                                           |
| Offer Letter Preview                                      |
| ┌──────────────────────────────────────────────────────┐ |
| │                                                      │ |
| │ [Company Letterhead]                                 │ |
| │                                                      │ |
| │ December 1, 2025                                     │ |
| │                                                      │ |
| │ Jane Doe                                             │ |
| │ jane.doe@email.com                                   │ |
| │                                                      │ |
| │ Dear Jane,                                           │ |
| │                                                      │ |
| │ We are pleased to extend an offer of employment for │ |
| │ the position of Senior Software Engineer...          │ |
| │                                                      │ |
| │ [Full offer letter content - scroll to view all]    │ |
| │                                                      │ |
| └──────────────────────────────────────────────────────┘ |
|                                                           |
| [Download PDF Preview]  [Edit Template]                  |
|                                                           |
| Additional Documents to Include                           |
| ☑ W-4 Tax Form                                           |
| ☑ I-9 Employment Eligibility                             |
| ☑ Direct Deposit Form                                    |
| ☑ Background Check Consent                               |
| □ Non-Compete Agreement                                  |
|                                                           |
| Offer Expiration                                          |
| Valid Until: [12/08/2025                        📅]      |
|   (7 days from today)                                     |
|                                                           |
+----------------------------------------------------------+
|      [← Back]  [Save as Draft]  [Cancel]  [Send Offer →]|
+----------------------------------------------------------+
```

**Field Specification: Offer Template**
| Property | Value |
|----------|-------|
| Field Name | `offerTemplate` |
| Type | Dropdown |
| Label | "Template Selection" |
| Required | Yes |
| Options | Standard W2, C2C, 1099, Custom |
| Default | Based on employment type selected |
| Description | Pre-defined offer letter templates with legal language |

**Field Specification: Offer Expiration**
| Property | Value |
|----------|-------|
| Field Name | `offerExpiresAt` |
| Type | Date Picker |
| Label | "Valid Until" |
| Required | Yes |
| Default | Today + 7 days |
| Min Date | Tomorrow |
| Max Date | Today + 30 days |
| Business Rule | Typically 5-7 days for standard offers |

**Offer Letter Auto-Generation**
| Element | Source |
|---------|--------|
| Candidate Name | `submission.candidate.fullName` |
| Position Title | `submission.job.title` |
| Client Name | `submission.job.account.name` |
| Start Date | `offer.startDate` |
| Compensation | All rate/benefit fields from previous steps |
| Legal Disclaimer | Template-based, state-specific if applicable |
| Signature Block | Digital signature area |

**Time:** ~2 minutes (reviewing and downloading preview)

---

### Step 8: Review Offer Letter Preview

**User Action:** Click "Download PDF Preview" to review full letter

**System Response:**
- Generates PDF in real-time
- Opens PDF in new tab
- Shows complete formatted offer letter with all terms

**User Action:** Reviews PDF, confirms all details are correct

**Checks to Verify:**
- Candidate name spelled correctly
- Position title matches job
- Rates are accurate ($100/hr pay, $125/hr bill)
- Start date is correct (Dec 9, 2025)
- Benefits listed accurately
- No typos or formatting issues

**User Action:** Closes PDF preview, returns to modal

**Time:** ~1 minute

---

### Step 9: Send Offer to Candidate

**User Action:** Click "Send Offer →" button

**System Response:**
- Shows final confirmation dialog

**Screen State:**
```
+----------------------------------------------------------+
|                             Confirm Offer Extension   [×] |
+----------------------------------------------------------+
|                                                           |
| ✅ Ready to Send Offer                                    |
|                                                           |
| You are about to send a formal job offer to:              |
|                                                           |
| Candidate: Jane Doe                                       |
| Email: jane.doe@email.com                                 |
| Position: Senior Software Engineer @ Google               |
| Rate: $100/hr (pay) / $125/hr (bill)                     |
| Start Date: December 9, 2025                              |
| Offer Expires: December 8, 2025 (7 days)                 |
|                                                           |
| This offer will:                                          |
| ✓ Send offer letter PDF to candidate's email             |
| ✓ Update submission status to "Offer Extended"           |
| ✓ Notify Pod Manager (Sarah Johnson)                     |
| ✓ Notify COO (Lisa Chen)                                 |
| ✓ Create offer record in system                          |
| ✓ Log activity in submission timeline                    |
| ✓ Start offer expiration countdown                       |
|                                                           |
| Delivery Method                                           |
| ● Email with DocuSign (Digital Signature)                |
| ○ Email with PDF attachment (Manual Signature)           |
|                                                           |
| Include Personal Note (Optional)                          |
| [                                                       ] |
| [Hi Jane, Congratulations! We're excited to have you  ] |
| [join the team. Please review and sign by Dec 8.      ] |
| [                                               ] 0/500  |
|                                                           |
| ☑ Send copy to hiring manager (John Manager)             |
| ☑ Send copy to myself                                    |
|                                                           |
+----------------------------------------------------------+
|       [Cancel]  [Go Back]           [Confirm & Send ✓]   |
+----------------------------------------------------------+
```

**Field Specification: Delivery Method**
| Property | Value |
|----------|-------|
| Field Name | `deliveryMethod` |
| Type | Radio Button Group |
| Label | "Delivery Method" |
| Required | Yes |
| Options | |
| - `docusign` | Email with DocuSign (recommended) |
| - `pdf` | Email with PDF attachment |
| Default | `docusign` |
| Description | DocuSign enables digital signature and tracking |

**User Action:**
1. Leave delivery method as DocuSign
2. Add personal note
3. Keep both notification checkboxes checked
4. Click "Confirm & Send ✓"

**Time:** ~30 seconds

---

### Step 10: System Sends Offer

**User Action:** Click "Confirm & Send ✓"

**System Response:**

1. **Button shows loading state** (~500ms)
2. **Creates offer record** (~100ms)
   ```sql
   INSERT INTO offers (
     id, org_id, submission_id, job_id, candidate_id,
     pay_rate, bill_rate, margin_amount, margin_percentage,
     employment_type, contract_duration_months,
     start_date, offer_expires_at,
     standard_hours_per_week, overtime_eligible, overtime_rate,
     signing_bonus, relocation_assistance, per_diem,
     vacation_days, sick_days, holidays,
     has_401k, health_insurance_cost,
     work_location, termination_notice_weeks,
     offer_letter_path, delivery_method,
     status, created_by, created_at, updated_at
   ) VALUES (...);
   ```

3. **Updates submission status** (~50ms)
   ```sql
   UPDATE submissions
   SET status = 'offer_extended',
       offer_extended_at = NOW(),
       offer_extended_by = current_user_id,
       updated_at = NOW()
   WHERE id = submission_id;
   ```

4. **Generates offer letter PDF** (~2 seconds)
   - Renders HTML template with all offer data
   - Converts to PDF using Puppeteer/Playwright
   - Uploads to Supabase Storage: `offers/{offerId}/offer_letter.pdf`

5. **Sends via DocuSign** (~3 seconds)
   - Calls DocuSign API with PDF
   - Sets signing order: Candidate → Hiring Manager → HR
   - Generates signing URL
   - Sends email to candidate with link

6. **Sends email notifications** (~1 second)
   - To Candidate: "Job Offer - Senior Software Engineer @ Google"
   - To Hiring Manager: "Offer Extended to Jane Doe"
   - To Pod Manager: "Offer sent for your submission"
   - To COO: "Offer extended by John Recruiter"

7. **Logs activities** (~100ms)
   ```sql
   INSERT INTO activities (
     entity_type, entity_id, activity_type, description, metadata
   ) VALUES
   ('offer', offer_id, 'created', 'Offer extended to candidate', {...}),
   ('submission', submission_id, 'offer_extended', 'Offer sent via DocuSign', {...}),
   ('candidate', candidate_id, 'offer_received', 'Formal job offer sent', {...});
   ```

8. **Creates RACI assignments** (~50ms)
   - Responsible: Recruiter (creator)
   - Accountable: Pod Manager
   - Informed: COO, Hiring Manager

9. **On Success:**
   - Modal closes (300ms animation)
   - Toast notification: "Offer sent successfully to Jane Doe" (green)
   - Submission detail view refreshes
   - Submission status updates to "Offer Extended"
   - Activity timeline shows new entry
   - URL stays on submission detail page

**Screen State (After Success):**
```
+----------------------------------------------------------+
| [← Back to Submissions]                 Submission Detail |
+----------------------------------------------------------+
| 🎉 Offer Extended Successfully                            |
|                                                           |
| Jane Doe → Senior Software Engineer @ Google              |
| Status: 💜 Offer Extended                [Actions ▼]     |
| Submitted: Nov 25, 2025                                   |
|                                                           |
+----------------------------------------------------------+
| Overview | Interview History | Offer Details | Activity  |
+----------------------------------------------------------+
|
| OFFER STATUS                                              |
| ✅ Offer Sent: December 1, 2025 at 2:45 PM               |
| 📧 Delivered via: DocuSign                                |
| ⏱️  Expires: December 8, 2025 (7 days remaining)         |
| 📊 Status: Awaiting Candidate Signature                   |
|                                                           |
| OFFER DETAILS                                             |
| Pay Rate: $100.00/hr                                      |
| Bill Rate: $125.00/hr                                     |
| Margin: $25.00/hr (20.0%)                                |
| Employment: W2                                            |
| Duration: 12 months (with extension option)              |
| Start Date: December 9, 2025                              |
|                                                           |
| DOCUMENTS                                                 |
| 📄 Offer Letter (Signed)                                 |
|    [View PDF]  [Download]  [Resend]                      |
|                                                           |
| TRACKING                                                  |
| ┌──────────────────────────────────────────────────────┐ |
| │ DocuSign Status                                      │ |
| │                                                      │ |
| │ ● Sent to jane.doe@email.com - Dec 1, 2:45 PM      │ |
| │ ○ Viewed by candidate - Pending                     │ |
| │ ○ Signed by candidate - Pending                     │ |
| │ ○ Countersigned by hiring manager - Pending         │ |
| │ ○ Completed - Pending                                │ |
| └──────────────────────────────────────────────────────┘ |
|                                                           |
| NEXT STEPS                                                |
| ⏳ Wait for candidate to review and sign offer           |
| ⏳ Follow up if no response in 3 days                     |
| ⏳ Monitor DocuSign for signature updates                 |
|                                                           |
| RECENT ACTIVITY                                           |
| ✅ Offer extended by You · 2 minutes ago                 |
| ✅ Offer letter generated · 2 minutes ago                |
| ✅ DocuSign envelope sent · 2 minutes ago                |
| ✅ Notifications sent to 4 stakeholders · 2 minutes ago  |
|                                                           |
+----------------------------------------------------------+
| [Send Reminder]  [Modify Offer]  [Withdraw Offer]       |
+----------------------------------------------------------+
```

**Total Processing Time:** ~7 seconds

---

## Postconditions

1. ✅ Offer record created in `offers` table
2. ✅ Submission status updated to `offer_extended`
3. ✅ Offer letter PDF generated and stored in Supabase Storage
4. ✅ DocuSign envelope created and sent to candidate
5. ✅ Email notifications sent to all stakeholders
6. ✅ RACI assignments created (R: Recruiter, A: Pod Manager, I: COO)
7. ✅ Activity logged in submission timeline
8. ✅ Offer expiration timer started (7 days countdown)
9. ✅ Commission calculation triggered (pending acceptance)
10. ✅ Candidate Portal updated with offer details

---

## Events Logged

| Event | Payload |
|-------|---------|
| `offer.created` | `{ offer_id, submission_id, candidate_id, job_id, pay_rate, bill_rate, margin, created_by, created_at }` |
| `offer.sent` | `{ offer_id, delivery_method, recipient_email, docusign_envelope_id, sent_at }` |
| `submission.status_changed` | `{ submission_id, old_status: 'interview', new_status: 'offer_extended', changed_by, changed_at }` |
| `notification.sent` | `{ type: 'offer_extended', recipients: [...], template: 'offer_extended_email', sent_at }` |

---

## Alternative Flows

### A1: Candidate Negotiation Required

At Step 4, if candidate requests different rate:

**Scenario:** Candidate responds: "Can we do $110/hr instead of $100/hr?"

**Flow:**
1. Recruiter clicks "Modify Offer" button
2. System shows offer modification modal
3. Recruiter updates pay rate to $110/hr
4. System recalculates margin: $125 - $110 = $15/hr = 12%
5. System flags: "⚠️ Margin below 15% minimum"
6. Two options:
   - **Option A:** Increase bill rate to $130/hr (margin: $20/hr = 15.4%)
     - Requires client approval
     - Recruiter contacts hiring manager
     - If approved: Update offer and resend
   - **Option B:** Request margin override from Pod Manager
     - Recruiter fills justification form
     - Pod Manager reviews and approves/denies
     - If approved: Update offer with new rate
     - If denied: Negotiate with candidate or withdraw

**Time:** +10-30 minutes (depending on approval time)

---

### A2: Counter-Offer from Candidate

After sending offer, candidate counters:

**Screen State (Counter-Offer Received):**
```
+----------------------------------------------------------+
| 📬 Counter-Offer Received                                 |
+----------------------------------------------------------+
| Jane Doe has responded with a counter-offer:              |
|                                                           |
| Original Offer: $100/hr                                   |
| Counter Request: $110/hr                                  |
|                                                           |
| Candidate's Message:                                      |
| "I really appreciate the offer! Based on my experience    |
| and market research, I was hoping for $110/hr. I'm very   |
| excited about this opportunity and hope we can work this  |
| out."                                                      |
|                                                           |
| DECISION OPTIONS                                          |
|                                                           |
| ● Accept Counter-Offer                                    |
|   Increase pay rate to $110/hr, adjust bill rate if needed|
|                                                           |
| ○ Decline Counter-Offer                                   |
|   Stand firm on original offer of $100/hr                |
|                                                           |
| ○ Make New Counter-Offer                                  |
|   Propose alternative: e.g., $105/hr                      |
|                                                           |
| Your Response to Candidate:                               |
| [                                                       ] |
| [                                                       ] |
|                                               ] 0/500     |
|                                                           |
+----------------------------------------------------------+
|      [Consult Manager]  [Cancel]  [Send Response]        |
+----------------------------------------------------------+
```

**Best Practice:**
- Always consult Pod Manager before accepting counter-offer
- Check if bill rate can be increased to maintain margin
- Consider candidate's value and market conditions
- Typical counter-offer range: 5-10% above original

**Time:** +15-60 minutes (negotiation)

---

### A3: Client Needs to Approve Higher Bill Rate

If margin adjustment requires bill rate increase:

**Flow:**
1. Recruiter clicks "Request Client Approval" in modal
2. System generates approval request email
3. Email sent to hiring manager with justification:
   ```
   Subject: Rate Adjustment Request - Jane Doe

   Hi John,

   We've extended an offer to Jane Doe at $100/hr (bill rate: $125/hr).

   She has countered at $110/hr. To maintain our margin standards,
   we would need to adjust the bill rate to $130/hr.

   This is still within your approved budget of $110-135/hr.

   Can you approve this adjustment?

   Current: $100/hr pay → $125/hr bill (20% margin)
   Proposed: $110/hr pay → $130/hr bill (15.4% margin)

   [Approve] [Decline] [Discuss]
   ```
4. Hiring manager reviews
5. If approved: Recruiter updates offer and resends
6. If declined: Recruiter negotiates with candidate or withdraws

**Time:** +1-24 hours (waiting for client approval)

---

### A4: Offer Expires Without Response

If candidate doesn't respond within expiration period:

**System Action (Automated):**
- 24 hours before expiration: Send reminder email
- On expiration date: Update offer status to `expired`
- Send notification to recruiter: "Offer to Jane Doe has expired"

**Recruiter Action:**
1. Contact candidate to understand delay
2. Options:
   - **Extend Offer:** Click "Extend Expiration" button
     - New expiration date: +3-7 days
     - Resend offer with updated expiration
   - **Withdraw Offer:** If candidate not interested
     - Update submission status to `offer_withdrawn`
     - Source new candidate
   - **Resubmit New Offer:** If terms need to change
     - Create new offer record
     - Send fresh offer

---

### A5: Offer Accepted by Candidate

**System Event (Webhook from DocuSign):**
1. DocuSign sends webhook: "Envelope completed"
2. System updates offer status to `accepted`
3. System updates submission status to `placed` (triggers placement workflow)
4. Notifications sent:
   - To Recruiter: "Congratulations! Jane Doe accepted your offer"
   - To Pod Manager: "Offer accepted - proceed with placement"
   - To Hiring Manager: "Candidate accepted, start date confirmed"
   - To HR: "New placement - initiate onboarding"
   - To Finance: "Commission eligible - calculate payout"

**Next Workflow:** Automatically triggers [22-confirm-placement.md](./22-confirm-placement.md)

---

### A6: Offer Rejected by Candidate

**Scenario:** Candidate declines offer

**Flow:**
1. Candidate emails: "I've decided to accept another offer"
2. Recruiter clicks "Mark as Rejected" in submission detail
3. System shows rejection modal:
   ```
   ┌──────────────────────────────────────────────────────┐
   │ Offer Rejection                                  [×] │
   ├──────────────────────────────────────────────────────┤
   │                                                      │
   │ Candidate: Jane Doe has declined the offer          │
   │                                                      │
   │ Reason for Rejection *                               │
   │ [Accepted competing offer                        ▼] │
   │   - Accepted competing offer                         │
   │   - Compensation too low                             │
   │   - Role not a good fit                              │
   │   - Personal reasons                                 │
   │   - Other                                            │
   │                                                      │
   │ Additional Details                                   │
   │ [Accepted offer at $120/hr with another company   ] │
   │ [                                                 ] │
   │                                               0/500  │
   │                                                      │
   │ ☑ Keep candidate in system for future opportunities │
   │ ☑ Send thank you email                              │
   │                                                      │
   └──────────────────────────────────────────────────────┘
   │              [Cancel]  [Confirm Rejection]           │
   └──────────────────────────────────────────────────────┘
   ```
4. System updates:
   - Offer status: `rejected`
   - Submission status: `offer_rejected`
   - Candidate status: Remains `active` (for future roles)
5. Notifications sent to stakeholders
6. Recruiter returns to sourcing for this job

**Learning:** Capture rejection reasons for market intelligence

---

## Exception Flows

### E1: DocuSign Service Unavailable

**Error:** DocuSign API returns 503 Service Unavailable

**System Response:**
1. Shows error toast: "DocuSign is temporarily unavailable"
2. Offers fallback options:
   ```
   ┌──────────────────────────────────────────────────────┐
   │ DocuSign Unavailable                             [×] │
   ├──────────────────────────────────────────────────────┤
   │                                                      │
   │ We're unable to connect to DocuSign right now.      │
   │                                                      │
   │ What would you like to do?                           │
   │                                                      │
   │ ● Send offer as PDF attachment                       │
   │   Candidate will print, sign, and return manually   │
   │                                                      │
   │ ○ Save as draft and retry later                     │
   │   Try DocuSign again in a few minutes               │
   │                                                      │
   │ ○ Cancel and return                                  │
   │   Don't send offer now                               │
   │                                                      │
   └──────────────────────────────────────────────────────┘
   │         [Cancel]  [Proceed with Selected Option]     │
   └──────────────────────────────────────────────────────┘
   ```
3. If PDF attachment selected:
   - Sends offer letter as PDF via standard email
   - Includes instructions: "Please sign and return to..."
   - Creates offer record with `delivery_method = 'pdf'`
   - Manual signature tracking required

**Recovery:** Retry DocuSign after service restored

---

### E2: Invalid Email Address

**Error:** Candidate email bounces or is invalid

**System Response:**
1. Email bounce notification received
2. Updates offer status to `delivery_failed`
3. Sends alert to recruiter:
   ```
   ⚠️ Offer Delivery Failed

   Email to jane.doe@email.com bounced.
   Reason: Mailbox does not exist

   Please verify email address and resend.
   ```
4. Recruiter actions:
   - Updates candidate email in profile
   - Clicks "Resend Offer" button
   - System retries delivery

**Prevention:** Validate email format before sending

---

### E3: Offer Letter Generation Fails

**Error:** PDF generation service fails

**System Response:**
1. Shows error: "Unable to generate offer letter PDF"
2. Logs error details
3. Offers options:
   - Retry generation
   - Use Word document template instead
   - Contact support

**Fallback:** Manual offer letter creation in Word/Google Docs

---

### E4: Margin Below Minimum and Manager Unavailable

**Scenario:** Offer needs <15% margin approval, but Pod Manager is unavailable (vacation, sick)

**System Response:**
1. Shows warning: "Pod Manager (Sarah Johnson) is currently unavailable"
2. Offers escalation options:
   ```
   Manager Approval Required - Escalation

   Your Pod Manager is unavailable until Dec 5.

   ● Escalate to Regional Director
     Send approval request to Mike Smith (Regional Director)

   ○ Wait for Pod Manager return
     Draft offer now, send after approval

   ○ Adjust terms to meet minimum margin
     Increase bill rate or decrease pay rate
   ```

**Best Practice:** Always maintain 15%+ margin to avoid approval delays

---

## Business Rules

### BR1: Margin Requirements

| Margin % | Rule | Action |
|----------|------|--------|
| < 15% | Not Allowed (unless approved) | Requires Pod Manager approval + justification |
| 15-20% | Low Margin Warning | Proceed but flag for review |
| 20-35% | Acceptable | No approval needed |
| 35-50% | High Margin | Check competitive market rates |
| > 50% | Very High Margin | Requires justification (may lose candidate) |

**Calculation:**
```
Margin Amount = Bill Rate - Pay Rate
Margin Percentage = (Margin Amount / Bill Rate) × 100
```

**Example:**
- Pay Rate: $100/hr
- Bill Rate: $125/hr
- Margin Amount: $25/hr
- Margin Percentage: ($25 / $125) × 100 = 20%

---

### BR2: Offer Expiration

| Offer Type | Standard Expiration | Max Extension |
|------------|---------------------|---------------|
| Standard Offer | 7 days | +7 days (14 total) |
| Urgent Hire | 3 days | +3 days (6 total) |
| Executive Role | 14 days | +14 days (28 total) |

**Auto-Reminders:**
- 50% of expiration period: Gentle reminder
- 24 hours before: Urgent reminder
- On expiration: Status changes to `expired`

---

### BR3: Employment Type Rules

| Type | W-4 Required | Benefits | 1099/Tax | Typical Use Case |
|------|--------------|----------|----------|------------------|
| W2 | Yes | Full benefits | Company withholds | Most common for contract staff |
| C2C | No | None | Consultant's corp pays | Independent contractors with LLC/Corp |
| 1099 | No | None | Consultant pays | Freelancers, no company entity |

**Default:** W2 (unless candidate specifically requests C2C/1099)

---

### BR4: Rate Adjustment Approval Matrix

| Scenario | Requires Approval From |
|----------|----------------------|
| Margin 15-20% | None (flag for monitoring) |
| Margin < 15% | Pod Manager |
| Bill rate increase < 5% | None (within budget) |
| Bill rate increase 5-10% | Hiring Manager (client) |
| Bill rate increase > 10% | Hiring Manager + Finance |
| Pay rate decrease (renegotiate) | Candidate must accept |

---

### BR5: Offer Modification Rules

| When | Can Modify? | Process |
|------|-------------|---------|
| Before candidate views | Yes | Update and resend without version change |
| After candidate views, before sign | Yes | Send "Amended Offer" (version 2) |
| After candidate signs | No | Withdraw and create new offer |
| After counter-signed by all | No | Binding contract, requires legal to change |

---

## RACI Assignments

| Event | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|-------|-----------------|-----------------|---------------|--------------|
| **Offer Created** | Recruiter (creator) | Pod Manager | Secondary Recruiter (if multi-owner) | COO |
| **Rate Verification** | Recruiter | Pod Manager | Finance (if margin <15%) | - |
| **Offer Letter Generated** | System (auto) | Recruiter | Legal (template review) | - |
| **Offer Sent** | Recruiter | Pod Manager | - | COO, Hiring Manager |
| **Counter-Offer Received** | Recruiter | Pod Manager | Finance (if rate change) | COO |
| **Offer Accepted** | Recruiter | Pod Manager | HR, Finance | COO, CEO |
| **Offer Rejected** | Recruiter | Pod Manager | - | COO |
| **Offer Expired** | Recruiter | Pod Manager | - | COO |

---

## Integration Points

### INT-1: DocuSign API

**Purpose:** Digital signature collection
**Endpoint:** `https://demo.docusign.net/restapi/v2.1/accounts/{accountId}/envelopes`
**Method:** POST
**Authentication:** OAuth 2.0
**Payload:**
```json
{
  "emailSubject": "Job Offer - Senior Software Engineer @ Google",
  "documents": [{
    "documentBase64": "...",
    "name": "offer_letter.pdf",
    "fileExtension": "pdf",
    "documentId": "1"
  }],
  "recipients": {
    "signers": [{
      "email": "jane.doe@email.com",
      "name": "Jane Doe",
      "recipientId": "1",
      "routingOrder": "1"
    }]
  },
  "status": "sent"
}
```

**Webhook:** DocuSign sends updates to `/api/webhooks/docusign`
- `recipient_completed`: Candidate signed
- `envelope_completed`: All parties signed
- `envelope_declined`: Candidate declined

---

### INT-2: Email Service (SendGrid/Postmark)

**Purpose:** Send offer notifications
**Templates:**
- `offer_extended_candidate`: To candidate with DocuSign link
- `offer_extended_manager`: To hiring manager
- `offer_extended_team`: To internal team
- `offer_reminder`: Reminder before expiration
- `offer_accepted`: Congratulations to all parties
- `offer_rejected`: Notification of rejection

---

### INT-3: PDF Generation (Puppeteer)

**Purpose:** Generate offer letter PDF from HTML template
**Process:**
1. Render HTML template with offer data
2. Apply CSS styling (company letterhead, formatting)
3. Convert to PDF using Puppeteer
4. Upload to Supabase Storage
5. Return signed URL

---

### INT-4: Commission Calculation Engine

**Purpose:** Calculate recruiter commission when offer accepted
**Trigger:** Offer status changes to `accepted`
**Calculation:**
```typescript
interface CommissionCalculation {
  basedOn: 'margin' | 'gross_profit';
  percentage: number; // e.g., 10%
  duration: 'one_time' | '3_months' | '6_months' | 'contract_duration';

  calculate(offer: Offer): number {
    const marginPerHour = offer.billRate - offer.payRate;
    const hoursPerMonth = offer.standardHoursPerWeek * 4.33;
    const monthlyMargin = marginPerHour * hoursPerMonth;

    if (this.duration === 'one_time') {
      return monthlyMargin * this.percentage;
    } else if (this.duration === '3_months') {
      return monthlyMargin * 3 * this.percentage;
    }
    // ... etc
  }
}
```

**Example:**
- Margin: $25/hr
- Hours: 40/week = 173.2/month
- Monthly Margin: $25 × 173.2 = $4,330
- Commission (10% of 3 months): $4,330 × 3 × 0.10 = $1,299

---

## Metrics & Analytics

### M1: Offer Acceptance Rate

**Formula:** `(Offers Accepted / Total Offers Sent) × 100`
**Target:** > 85%
**Tracking:** Weekly dashboard

**Breakdown by:**
- Recruiter
- Job type
- Client
- Rate range
- Employment type (W2 vs C2C)

---

### M2: Offer-to-Accept Time

**Formula:** `Average days from offer sent to accepted`
**Target:** < 3 days
**Tracking:** Real-time

**Red Flags:**
- > 5 days: Candidate may be comparing offers
- > 7 days: Risk of losing candidate

---

### M3: Counter-Offer Rate

**Formula:** `(Offers with Counter-Offers / Total Offers) × 100`
**Target:** < 20%
**Analysis:** If >30%, rates may be too low

---

### M4: Margin Analysis

**Average Margin %:** Track by recruiter, client, job type
**Target:** 20-25% average
**Monitoring:**
- Low margin deals (<15%): Requires approval
- High margin deals (>40%): Competitive risk

---

### M5: Time to Offer

**Formula:** `Days from submission to offer extended`
**Target:** < 14 days
**Breakdown:**
- Sourced → Submitted: 2 days
- Submitted → Interview: 3-5 days
- Interview → Offer: 5-7 days

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Extend offer with acceptable margin (20%) | Offer created and sent successfully |
| TC-002 | Extend offer with low margin (12%) | Pod Manager approval required |
| TC-003 | Extend offer with high margin (45%) | Warning shown, but can proceed |
| TC-004 | Candidate accepts offer within 3 days | Status updated to "accepted", placement workflow triggered |
| TC-005 | Candidate rejects offer | Status updated to "rejected", recruiter notified |
| TC-006 | Candidate counter-offers higher rate | Recruiter can accept/decline/counter |
| TC-007 | Offer expires without response | Auto-status to "expired", reminder sent 24hrs before |
| TC-008 | DocuSign service fails | Fallback to PDF email attachment |
| TC-009 | Invalid candidate email | Delivery failed, recruiter alerted to update |
| TC-010 | Modify offer before candidate views | Updated offer sent, no version change |
| TC-011 | Modify offer after candidate views | "Amended Offer v2" sent |
| TC-012 | Generate offer letter PDF | PDF created with all details, uploaded to storage |
| TC-013 | Send offer with personal note | Note included in email to candidate |
| TC-014 | Margin below 15% without approval | Blocked from sending, approval required |
| TC-015 | Multiple counter-offers (3 rounds) | All versions tracked, final accepted/rejected |

---

## Accessibility

- **Keyboard Navigation:** Full support for Tab, Enter, Esc
- **Screen Readers:** All form fields have proper labels and ARIA attributes
- **Color Contrast:** WCAG 2.1 AA compliance for margin warnings (red/yellow/green)
- **Focus Indicators:** Clear visual focus on all interactive elements
- **Error Announcements:** Screen readers announce validation errors

---

## Mobile Considerations

**Responsive Breakpoints:**
- **Mobile (<640px):** Single-column layout, simplified modal steps
- **Tablet (640-1024px):** Two-column layout for rate fields
- **Desktop (>1024px):** Full multi-column layout

**Mobile-Specific:**
- Numeric keyboard for rate inputs
- Date picker optimized for touch
- DocuSign link opens in mobile app (if installed)
- PDF preview opens in mobile PDF viewer

---

## Security

### S1: Data Protection

**Sensitive Data:**
- Pay rates (PII)
- Bill rates (confidential)
- Personal information (email, phone)
- Offer letter content

**Encryption:**
- All data encrypted at rest (Supabase)
- All data encrypted in transit (HTTPS)
- Offer letter PDFs stored with signed URLs (expiring)

---

### S2: Audit Trail

**All offer actions logged:**
- Who created offer
- Who modified offer
- Who sent offer
- Who approved margin override
- Timestamp for all actions
- IP address of user

**Retention:** 7 years (compliance)

---

### S3: Access Control

**Permissions:**
- `offer.create`: Recruiter, Pod Manager, Regional Director
- `offer.approve_margin`: Pod Manager, Regional Director, CFO
- `offer.view`: R, A, C, I (RACI-based)
- `offer.modify`: R, A only (before candidate signs)
- `offer.withdraw`: R, A, Pod Manager

---

## Performance Requirements

| Operation | Target Time |
|-----------|-------------|
| Load submission detail | < 500ms |
| Open offer modal | < 300ms |
| Calculate margin | < 50ms (real-time) |
| Generate PDF | < 2 seconds |
| Send DocuSign | < 3 seconds |
| Total offer extension | < 10 seconds |

---

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-30 | Initial creation of UC-REC-021 | Product Team |

---

*Last Updated: 2025-11-30*
*Next Review: 2026-01-30*
