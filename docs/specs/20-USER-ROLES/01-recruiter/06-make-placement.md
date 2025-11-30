# Use Case: Make Placement

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-005 |
| Actor | Recruiter (Technical Recruiter) |
| Goal | Record a successful placement when candidate starts working at client |
| Frequency | 1-2 per 2-week sprint (target: 1 per person per sprint) |
| Estimated Time | 15-20 minutes |
| Priority | CRITICAL (Revenue Moment) |
| Business Impact | Direct revenue recognition, commission calculation, sprint tracking |

---

## Preconditions

1. User is logged in as Recruiter
2. Offer has been accepted by candidate
3. Offer record exists with status = "accepted"
4. Submission record exists with status = "offer_stage" or "placed"
5. Start date is confirmed with candidate and client
6. Bill rate and pay rate have been negotiated and agreed
7. User has "placement.create" permission (default for Recruiter role)

---

## Trigger

One of the following:
- Recruiter receives signed offer letter from candidate
- Candidate confirms start date via email/call
- Client confirms onboarding schedule
- HR notifies recruiter that offer is fully executed
- Recruiter clicks "Convert to Placement" from offer detail screen

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Submission with Accepted Offer

**User Action:** Click "Pipeline" in sidebar, filter by "Offer Accepted"

**System Response:**
- Sidebar item highlights
- URL changes to: `/employee/workspace/submissions?status=offer_accepted`
- Submissions list loads showing all accepted offers
- Each submission shows green "Accepted" badge

**Screen State:**
```
+----------------------------------------------------------+
| Submissions Pipeline                    [+ New] [⚙] [⌘K] |
+----------------------------------------------------------+
| [Search submissions...]                 [Filter ▼] [⌘F]  |
+----------------------------------------------------------+
| Sourced │ Screening │ Client │ Interview │ ● Offer │ All |
+----------------------------------------------------------+
| Status    Candidate           Job              Client    |
| ──────────────────────────────────────────────────────── |
| ✓ ACCEPTED Sarah Johnson     Sr Developer   Google       |
|   (Offer: $120/hr | Start: 12/15/24)                     |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 2: Open Submission Detail

**User Action:** Click on submission row "Sarah Johnson - Sr Developer"

**System Response:**
- Row highlights
- Detail panel slides in from right (300ms animation)
- Shows full submission history
- **"Convert to Placement" button prominently displayed** in action bar

**Screen State:**
```
+----------------------------------------------------------+
| Sarah Johnson → Google Sr Developer             [×]      |
+----------------------------------------------------------+
| [Convert to Placement 🎉]  [View Offer]  [Timeline]     |
+----------------------------------------------------------+
| Candidate: Sarah Johnson                                 |
| Job: Senior Software Developer                           |
| Client: Google (Technology)                              |
| Status: OFFER ACCEPTED ✓                                 |
|                                                          |
| Offer Details:                                           |
| • Offer Rate: $120/hr                                    |
| • Accepted: 12/10/24                                     |
| • Proposed Start: 12/15/24                               |
|                                                          |
| Timeline:                                                |
| 12/10/24  Offer Accepted                                 |
| 12/08/24  Offer Sent                                     |
| 12/05/24  Interview #2 Completed                         |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 3: Click "Convert to Placement"

**User Action:** Click the green "Convert to Placement 🎉" button

**System Response:**
- Button shows click animation
- Placement creation modal slides in from right (400ms)
- Modal title: "🎉 Create Placement - Revenue Moment!"
- Form pre-fills data from offer and submission
- First field (Start Date) is focused

**Screen State:**
```
+----------------------------------------------------------+
|          🎉 CREATE PLACEMENT - REVENUE MOMENT!           |
|                                                      [×] |
+----------------------------------------------------------+
| Step 1 of 4: Placement Details                           |
|                                                          |
| Candidate *                                              |
| [Sarah Johnson                                 ] ✓       |
|                                                          |
| Job Title *                                              |
| [Senior Software Developer                     ] ✓       |
|                                                          |
| Client *                                                 |
| [Google (Technology)                           ] ✓       |
|                                                          |
| Placement Type *                                         |
| [Contract                                      ▼]        |
|                                                          |
+----------------------------------------------------------+
|                              [Cancel]  [Next: Dates →]  |
+----------------------------------------------------------+
```

**Time:** ~400ms

---

### Step 4: Review Pre-filled Details

**User Action:** Review pre-filled candidate, job, and client info

**System Response:**
- Fields are locked/read-only (shown with checkmark)
- User can see all details are correct from offer

**Field Specification: Candidate Name**
| Property | Value |
|----------|-------|
| Field Name | `candidateId` |
| Type | Read-only Display |
| Label | "Candidate" |
| Pre-filled From | `submission.candidateId` |
| Display Format | `{firstName} {lastName}` |
| Required | Yes |
| Editable | No |

**Field Specification: Job Title**
| Property | Value |
|----------|-------|
| Field Name | `jobId` |
| Type | Read-only Display |
| Label | "Job Title" |
| Pre-filled From | `job.title` |
| Required | Yes |
| Editable | No |

**Field Specification: Client**
| Property | Value |
|----------|-------|
| Field Name | `accountId` |
| Type | Read-only Display |
| Label | "Client" |
| Pre-filled From | `account.name` |
| Display Format | `{account.name} ({account.industry})` |
| Required | Yes |
| Editable | No |

**Time:** ~5 seconds

---

### Step 5: Select Placement Type

**User Action:** Click "Placement Type" dropdown, confirm or change selection

**System Response:**
- Dropdown opens
- Shows all placement types
- Pre-selected from offer type

**Field Specification: Placement Type**
| Property | Value |
|----------|-------|
| Field Name | `placementType` |
| Type | Dropdown |
| Label | "Placement Type" |
| Pre-filled From | `offer.offerType` |
| Required | Yes |
| Options | |
| - `contract` | "Contract" |
| - `permanent` | "Permanent (Direct Hire)" |
| - `contract_to_hire` | "Contract to Hire (C2H)" |
| - `temp` | "Temporary" |
| - `sow` | "Statement of Work (SOW)" |
| Impact on Fields | Contract/C2H: Show end date; Permanent: Hide end date |

**Time:** ~2 seconds

---

### Step 6: Click "Next: Dates"

**User Action:** Click "Next: Dates →" button

**System Response:**
- Form validates Step 1
- Slides to Step 2 (300ms animation)

**Screen State (Step 2):**
```
+----------------------------------------------------------+
|          🎉 CREATE PLACEMENT - REVENUE MOMENT!           |
|                                                      [×] |
+----------------------------------------------------------+
| Step 2 of 4: Dates & Duration                            |
|                                                          |
| Start Date *                                             |
| [12/15/2024                                    📅]       |
|                                                          |
| End Date                                                 |
| [MM/DD/YYYY                                    📅]       |
| (Leave blank for permanent placements)                   |
|                                                          |
| Duration (auto-calculated for contracts)                 |
| [___] months                                             |
|                                                          |
| ⚡ Quick Set:                                            |
| [3 mo] [6 mo] [12 mo] [Permanent]                       |
|                                                          |
+----------------------------------------------------------+
|                    [← Back]  [Cancel]  [Next: Rates →]  |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 7: Set Start Date

**User Action:** Click calendar icon, select start date

**System Response:**
- Date picker opens
- Pre-filled with offer's proposed start date
- User can adjust if needed
- Calendar highlights today and selected date

**Field Specification: Start Date**
| Property | Value |
|----------|-------|
| Field Name | `startDate` |
| Type | Date Picker |
| Label | "Start Date" |
| Format | MM/DD/YYYY |
| Pre-filled From | `offer.startDate` |
| Min Date | Today (warning if past date selected) |
| Max Date | None |
| Required | Yes |
| Validation | Must be a valid future date (or warn if past) |
| Error Messages | |
| - Empty | "Start date is required" |
| - Past date | "⚠️ Warning: Start date is in the past. Confirm this is correct." |

**Time:** ~5 seconds

---

### Step 8: Set End Date (If Contract)

**User Action:** Click calendar for end date, select date OR click quick-set button

**System Response:**
- If Contract/C2H: End date field is visible and required
- If Permanent: End date field is hidden
- Quick-set buttons auto-calculate end date
- Duration in months auto-calculates

**Field Specification: End Date**
| Property | Value |
|----------|-------|
| Field Name | `endDate` |
| Type | Date Picker |
| Label | "End Date" |
| Format | MM/DD/YYYY |
| Visible | Only when `placementType` is "contract", "contract_to_hire", "temp" |
| Required | Yes for contract types, No for permanent |
| Min Date | Start Date + 1 day |
| Validation | Must be after start date |
| Error Messages | |
| - Empty | "End date is required for contract placements" |
| - Before start | "End date must be after start date" |

**Field Specification: Duration**
| Property | Value |
|----------|-------|
| Field Name | `durationMonths` (computed) |
| Type | Read-only Display |
| Label | "Duration" |
| Format | "{months} months" |
| Calculation | `Math.ceil((endDate - startDate) / (30 * 24 * 60 * 60 * 1000))` |
| Visible | Only when end date is set |

**Quick-Set Buttons:**
- "3 mo" → Sets end date to start date + 3 months
- "6 mo" → Sets end date to start date + 6 months
- "12 mo" → Sets end date to start date + 12 months
- "Permanent" → Clears end date, changes type to permanent

**Time:** ~5 seconds

---

### Step 9: Click "Next: Rates"

**User Action:** Click "Next: Rates →" button

**System Response:**
- Validates dates
- Slides to Step 3 (300ms animation)

**Screen State (Step 3):**
```
+----------------------------------------------------------+
|          🎉 CREATE PLACEMENT - REVENUE MOMENT!           |
|                                                      [×] |
+----------------------------------------------------------+
| Step 3 of 4: Financial Details (The Money!)              |
|                                                          |
| Bill Rate (What client pays us) *                        |
| $ [120.00        ] /hr                                   |
|                                                          |
| Pay Rate (What we pay candidate) *                       |
| $ [95.00         ] /hr                                   |
|                                                          |
| ─────────────────────────────────────────────────────── |
| Margin Calculation:                                      |
| • Markup: $25.00/hr                                      |
| • Markup %: 26.32%                                       |
| • Gross Margin: 20.83%                                   |
| • Monthly Revenue (est.): $21,120                        |
| ─────────────────────────────────────────────────────── |
|                                                          |
| 💰 Commission Preview:                                   |
| Your Commission (Tier 2 - 20-25% margin): $1,056/mo     |
| Sprint Impact: +1 placement → 50% of sprint target! 🎯  |
|                                                          |
| Currency                                                 |
| [USD                                               ▼]    |
|                                                          |
+----------------------------------------------------------+
|                 [← Back]  [Cancel]  [Next: Confirm →]   |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 10: Enter Bill Rate

**User Action:** Review pre-filled bill rate OR adjust if needed

**System Response:**
- Field pre-filled from `offer.rate`
- User can adjust if negotiation changed rate
- Auto-formats with $ and decimal places

**Field Specification: Bill Rate**
| Property | Value |
|----------|-------|
| Field Name | `billRate` |
| Type | Currency Input |
| Label | "Bill Rate (What client pays us)" |
| Prefix | "$" |
| Suffix | "/hr" (or "/day", "/month", "/year" based on rate type) |
| Pre-filled From | `offer.rate` |
| Required | Yes |
| Min Value | 0.01 |
| Max Value | 999999.99 |
| Precision | 2 decimal places |
| Validation | Must be > 0 and > pay rate |
| Error Messages | |
| - Empty | "Bill rate is required" |
| - Invalid | "Bill rate must be a positive number" |
| - Less than pay | "Bill rate must be greater than pay rate" |

**Time:** ~3 seconds

---

### Step 11: Enter Pay Rate

**User Action:** Enter pay rate (what candidate receives)

**System Response:**
- User types pay rate
- **Real-time margin calculation updates** as user types
- Margin formula and commission preview update live
- Color coding: Green (>20%), Yellow (15-20%), Red (<15%)

**Field Specification: Pay Rate**
| Property | Value |
|----------|-------|
| Field Name | `payRate` |
| Type | Currency Input |
| Label | "Pay Rate (What we pay candidate)" |
| Prefix | "$" |
| Suffix | "/hr" |
| Required | Yes |
| Min Value | 0.01 |
| Max Value | Bill Rate - 0.01 |
| Precision | 2 decimal places |
| Validation | Must be > 0 and < bill rate |
| Error Messages | |
| - Empty | "Pay rate is required" |
| - Greater than bill | "Pay rate must be less than bill rate" |
| - Negative margin | "⚠️ Warning: Negative margin! This will result in a loss." |

**Time:** ~5 seconds

---

### Step 12: Review Margin Calculation

**User Action:** Review auto-calculated margins and commission

**System Response:**
- Calculations update in real-time
- Commission tier is displayed
- Monthly revenue estimate shown
- Sprint progress indicator updates

**Margin Calculation Formulas:**

| Metric | Formula | Example (Bill: $120, Pay: $95) |
|--------|---------|-------------------------------|
| Markup | `billRate - payRate` | $120 - $95 = $25/hr |
| Markup % | `(markup / payRate) × 100` | ($25 / $95) × 100 = 26.32% |
| Gross Margin | `(markup / billRate) × 100` | ($25 / $120) × 100 = 20.83% |
| Monthly Revenue | `billRate × 176 hours` | $120 × 176 = $21,120 |
| Monthly Markup | `markup × 176 hours` | $25 × 176 = $4,400 |

**Commission Tier Table:**

| Tier | Gross Margin Range | Commission Rate | Example (on $21,120 revenue) |
|------|-------------------|----------------|------------------------------|
| Tier 1 | 0-14.99% | 3% | $633/month |
| Tier 2 | 15-19.99% | 4% | $845/month |
| Tier 3 | 20-24.99% | 5% | $1,056/month |
| Tier 4 | 25-29.99% | 6% | $1,267/month |
| Tier 5 | 30%+ | 7% | $1,478/month |

**Sprint Progress Visualization:**
```
Sprint Target: 2 placements per 2-week sprint
Current Sprint: Sprint 23 (12/01/24 - 12/14/24)

Progress: 1 of 2 [████████████░░░░] 50%
✅ Placement #1: This placement!
⬜ Placement #2: Keep going!
```

**Time:** ~10 seconds

---

### Step 13: Select Currency (Optional)

**User Action:** Review or change currency (defaults to USD)

**Field Specification: Currency**
| Property | Value |
|----------|-------|
| Field Name | `currency` |
| Type | Dropdown |
| Label | "Currency" |
| Default | "USD" |
| Required | Yes |
| Options | USD, CAD, EUR, GBP, INR, MXN, AUD |

**Time:** ~2 seconds

---

### Step 14: Click "Next: Confirm"

**User Action:** Click "Next: Confirm →" button

**System Response:**
- Validates all financial fields
- Slides to Step 4 - Confirmation screen

**Screen State (Step 4):**
```
+----------------------------------------------------------+
|          🎉 CREATE PLACEMENT - REVENUE MOMENT!           |
|                                                      [×] |
+----------------------------------------------------------+
| Step 4 of 4: Confirm & Celebrate                         |
|                                                          |
| Review Placement Details:                                |
|                                                          |
| ┌────────────────────────────────────────────────────┐ |
| │ Candidate:      Sarah Johnson                      │ |
| │ Job:            Senior Software Developer          │ |
| │ Client:         Google (Technology)                │ |
| │ Type:           Contract                           │ |
| │                                                    │ |
| │ Dates:                                             │ |
| │ • Start:        12/15/2024                         │ |
| │ • End:          06/15/2025                         │ |
| │ • Duration:     6 months                           │ |
| │                                                    │ |
| │ Financials:                                        │ |
| │ • Bill Rate:    $120.00/hr                         │ |
| │ • Pay Rate:     $95.00/hr                          │ |
| │ • Margin:       20.83% (Tier 3)                    │ |
| │ • Revenue:      $21,120/month                      │ |
| │ • Your Comm:    $1,056/month                       │ |
| └────────────────────────────────────────────────────┘ |
|                                                          |
| ✅ Auto-triggered Actions:                               |
| • Create onboarding checklist (I-9, W-4, background)    |
| • Notify HR Manager                                      |
| • Update sprint progress                                 |
| • Calculate commission                                   |
| • Send welcome email to candidate                        |
|                                                          |
| 🎉 Ready to record this placement and celebrate?         |
|                                                          |
+----------------------------------------------------------+
|       [← Back]  [Cancel]  [🎉 Create Placement!]        |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 15: Review Confirmation Summary

**User Action:** Review all placement details one final time

**System Response:**
- Shows complete summary
- Lists all auto-triggered actions
- Displays celebration message

**Time:** ~10 seconds

---

### Step 16: Click "Create Placement!"

**User Action:** Click the green "🎉 Create Placement!" button

**System Response:**
1. Button shows loading spinner (500ms)
2. API call `POST /api/trpc/placements.create`
3. **Success animation sequence:**
   - Modal shows success checkmark (1s)
   - Confetti animation (2s)
   - Modal closes
   - Full-screen celebration overlay appears

**Screen State (Celebration):**
```
+----------------------------------------------------------+
|                                                          |
|                    [Confetti animation]                  |
|                                                          |
|              🎉🎊🎉🎊🎉🎊🎉🎊🎉🎊                        |
|                                                          |
|          ┌─────────────────────────────────┐            |
|          │                                 │            |
|          │   🏆 PLACEMENT CONFIRMED! 🏆   │            |
|          │                                 │            |
|          │  You just made a placement!     │            |
|          │                                 │            |
|          │  💰 Monthly Revenue: $21,120   │            |
|          │  💵 Your Commission: $1,056    │            |
|          │  🎯 Sprint Progress: 50%       │            |
|          │  🔥 Pod Leaderboard: +1        │            |
|          │                                 │            |
|          │  Sarah Johnson → Google         │            |
|          │  Starts: 12/15/24               │            |
|          │                                 │            |
|          └─────────────────────────────────┘            |
|                                                          |
|         [View Placement]  [Back to Dashboard]           |
|                                                          |
+----------------------------------------------------------+
```

**Backend Processing (Sequential):**

1. **Create Placement Record:**
   ```sql
   INSERT INTO placements (
     id, org_id, submission_id, offer_id, job_id,
     candidate_id, account_id, placement_type,
     start_date, end_date, bill_rate, pay_rate,
     markup_percentage, status, recruiter_id,
     created_by
   ) VALUES (
     uuid_generate_v4(),
     current_org_id,
     submission_id,
     offer_id,
     job_id,
     candidate_id,
     account_id,
     'contract',
     '2024-12-15',
     '2025-06-15',
     120.00,
     95.00,
     20.83,
     'active',
     current_user_id,
     current_user_id
   );
   ```

2. **Update Submission Status:**
   ```sql
   UPDATE submissions
   SET status = 'placed',
       updated_at = NOW()
   WHERE id = submission_id;
   ```

3. **Update Job Positions Filled:**
   ```sql
   UPDATE jobs
   SET positions_filled = positions_filled + 1,
       updated_at = NOW()
   WHERE id = job_id;

   -- If all positions filled, mark job as filled
   UPDATE jobs
   SET status = 'filled',
       filled_date = CURRENT_DATE
   WHERE id = job_id
     AND positions_filled >= positions_count;
   ```

4. **Update Candidate Status:**
   ```sql
   UPDATE user_profiles
   SET profile_status = 'placed',
       updated_at = NOW()
   WHERE id = candidate_id;
   ```

5. **Create Onboarding Checklist:**
   ```typescript
   const onboardingTasks = [
     { name: 'I-9 Verification', dueDate: startDate, priority: 'critical' },
     { name: 'W-4 Tax Form', dueDate: startDate, priority: 'high' },
     { name: 'Background Check', dueDate: addDays(startDate, -7), priority: 'high' },
     { name: 'Drug Screen', dueDate: addDays(startDate, -3), priority: 'medium' },
     { name: 'Direct Deposit Setup', dueDate: startDate, priority: 'medium' },
     { name: 'IT Equipment Request', dueDate: addDays(startDate, -5), priority: 'high' },
     { name: 'Benefits Enrollment', dueDate: addDays(startDate, 30), priority: 'low' },
     { name: 'First Day Welcome Call', dueDate: startDate, priority: 'high' }
   ];

   for (const task of onboardingTasks) {
     await db.insert(activities).values({
       orgId: currentOrgId,
       entityType: 'placement',
       entityId: placementId,
       activityType: 'task',
       title: task.name,
       dueDate: task.dueDate,
       priority: task.priority,
       status: 'pending',
       assignedTo: hrManagerId, // Assign to HR
       createdBy: currentUserId
     });
   }
   ```

6. **Calculate Commission:**
   ```typescript
   const billRate = 120.00;
   const payRate = 95.00;
   const markup = billRate - payRate; // $25
   const grossMargin = (markup / billRate) * 100; // 20.83%

   // Determine commission tier
   let commissionRate = 0.03; // Default tier 1
   if (grossMargin >= 30) commissionRate = 0.07; // Tier 5
   else if (grossMargin >= 25) commissionRate = 0.06; // Tier 4
   else if (grossMargin >= 20) commissionRate = 0.05; // Tier 3
   else if (grossMargin >= 15) commissionRate = 0.04; // Tier 2

   const monthlyRevenue = billRate * 176; // $21,120
   const monthlyCommission = monthlyRevenue * commissionRate; // $1,056

   // Store in commission tracking table (future enhancement)
   await db.insert(commissions).values({
     placementId,
     recruiterId: currentUserId,
     commissionRate,
     monthlyRevenue,
     monthlyCommission,
     status: 'pending',
     createdAt: new Date()
   });
   ```

7. **Update Sprint Progress:**
   ```typescript
   // Get current sprint for recruiter's pod
   const pod = await db.query.employeeMetadata.findFirst({
     where: eq(employeeMetadata.userId, currentUserId),
     with: { pod: true }
   });

   if (pod?.pod) {
     // Increment current sprint placements
     await db.update(pods)
       .set({
         currentSprintPlacements: sql`current_sprint_placements + 1`,
         totalPlacements: sql`total_placements + 1`,
         updatedAt: new Date()
       })
       .where(eq(pods.id, pod.podId));
   }
   ```

8. **Update Leaderboard:**
   ```typescript
   // Increment recruiter's placement count for current quarter
   await db.insert(recruiterMetrics).values({
     recruiterId: currentUserId,
     period: 'Q4-2024',
     placementsCount: sql`COALESCE((SELECT placements_count FROM recruiter_metrics WHERE recruiter_id = ${currentUserId} AND period = 'Q4-2024'), 0) + 1`,
     revenue: sql`COALESCE((SELECT revenue FROM recruiter_metrics WHERE recruiter_id = ${currentUserId} AND period = 'Q4-2024'), 0) + ${monthlyRevenue}`,
     updatedAt: new Date()
   }).onConflictDoUpdate({
     target: [recruiterMetrics.recruiterId, recruiterMetrics.period],
     set: {
       placementsCount: sql`recruiter_metrics.placements_count + 1`,
       revenue: sql`recruiter_metrics.revenue + ${monthlyRevenue}`,
       updatedAt: new Date()
     }
   });
   ```

9. **Send Notifications:**
   ```typescript
   // Notify HR Manager
   await sendNotification({
     userId: hrManagerId,
     type: 'placement_created',
     title: 'New Placement - Onboarding Required',
     message: `${candidateName} starts at ${clientName} on ${startDate}. Onboarding tasks assigned.`,
     link: `/employee/hr/onboarding/${placementId}`
   });

   // Notify Recruiter's Manager
   await sendNotification({
     userId: managerId,
     type: 'team_placement',
     title: 'Team Placement!',
     message: `${recruiterName} made a placement: ${candidateName} → ${clientName}`,
     link: `/employee/recruiting/placements/${placementId}`
   });

   // Notify Account Manager (if different from recruiter)
   if (accountManagerId && accountManagerId !== currentUserId) {
     await sendNotification({
       userId: accountManagerId,
       type: 'client_placement',
       title: 'New Placement at Your Account',
       message: `${candidateName} placed at ${clientName}. Start: ${startDate}`,
       link: `/employee/accounts/${accountId}`
     });
   }
   ```

10. **Send Welcome Email to Candidate:**
    ```typescript
    await sendEmail({
      to: candidateEmail,
      subject: `Welcome to ${clientName}!`,
      template: 'candidate_placement_welcome',
      data: {
        candidateName,
        clientName,
        jobTitle,
        startDate,
        recruiterName,
        recruiterPhone,
        recruiterEmail,
        nextSteps: [
          'Complete I-9 form',
          'Submit direct deposit info',
          'Attend orientation on Day 1',
          'Contact your recruiter with any questions'
        ]
      }
    });
    ```

11. **Log Activity:**
    ```typescript
    await db.insert(activityLog).values({
      orgId: currentOrgId,
      entityType: 'placement',
      entityId: placementId,
      activityType: 'placement_created',
      description: `Placement created: ${candidateName} → ${clientName} | Start: ${startDate}`,
      metadata: {
        billRate,
        payRate,
        grossMargin,
        monthlyRevenue,
        commission: monthlyCommission,
        placementType
      },
      createdBy: currentUserId,
      createdAt: new Date()
    });
    ```

**Time:** ~3-5 seconds (backend processing + animation)

---

## Postconditions

1. ✅ New placement record created in `placements` table
2. ✅ Placement status = "active"
3. ✅ Submission status updated to "placed"
4. ✅ Job `positions_filled` incremented by 1
5. ✅ Job status updated to "filled" if all positions filled
6. ✅ Candidate status updated to "placed"
7. ✅ Onboarding checklist created with 8 tasks assigned to HR
8. ✅ Commission calculated and stored
9. ✅ Sprint progress updated (+1 placement for current sprint)
10. ✅ Leaderboard updated (recruiter's placement count incremented)
11. ✅ Notifications sent to HR Manager, Recruiter's Manager, Account Manager
12. ✅ Welcome email sent to candidate
13. ✅ Activity logged for audit trail
14. ✅ RCAI entry: Recruiter = Responsible + Accountable, HR = Consulted, Manager = Informed
15. ✅ Revenue recognized in current period

---

## Events Logged

| Event | Payload | Recipients |
|-------|---------|-----------|
| `placement.created` | `{ placement_id, candidate_id, job_id, account_id, recruiter_id, bill_rate, pay_rate, margin, revenue, commission, start_date, created_at }` | System |
| `submission.placed` | `{ submission_id, placement_id, updated_by }` | System |
| `job.positions_filled` | `{ job_id, positions_filled, positions_count }` | System |
| `candidate.placed` | `{ candidate_id, placement_id, client_id }` | System |
| `onboarding.initiated` | `{ placement_id, candidate_id, tasks_count: 8, assigned_to: hr_manager_id }` | HR Manager |
| `commission.calculated` | `{ placement_id, recruiter_id, commission_rate, monthly_commission, tier }` | Recruiter, Finance |
| `sprint.progress_updated` | `{ pod_id, sprint_placements, target_placements, progress_percent }` | Recruiter, Manager |
| `leaderboard.updated` | `{ recruiter_id, quarter, placements_count, revenue }` | All Recruiters |
| `notification.sent` | See step 16 backend processing | HR, Manager, Account Manager |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Offer Not Accepted | Submission status ≠ "offer_accepted" | "Cannot create placement: Offer has not been accepted yet" | Accept offer first |
| Missing Bill Rate | Bill rate is null or 0 | "Bill rate is required to create placement" | Enter valid bill rate |
| Missing Pay Rate | Pay rate is null or 0 | "Pay rate is required to create placement" | Enter valid pay rate |
| Negative Margin | Pay rate ≥ Bill rate | "⚠️ Warning: Negative or zero margin. This placement will result in a loss. Do you want to proceed?" | Adjust rates or confirm override |
| Missing Start Date | Start date is null | "Start date is required" | Select start date |
| Past Start Date | Start date < Today | "⚠️ Warning: Start date is in the past. Is this a backdated placement?" | Confirm or adjust date |
| End Date Before Start | End date ≤ Start date | "End date must be after start date" | Adjust end date |
| Duplicate Placement | Placement already exists for submission | "Placement already exists for this submission" | View existing placement |
| Job Already Filled | Job.positions_filled ≥ Job.positions_count | "⚠️ Warning: This job is already filled. Creating this placement will overfill the requisition." | Confirm or cancel |
| Permission Denied | User lacks "placement.create" permission | "You don't have permission to create placements" | Contact Admin |
| Network Error | API call failed | "Network error. Placement not created. Please try again." | Retry |
| Database Error | Insert/update failed | "Database error. Please contact support." | Notify support, retry |

---

## Keyboard Shortcuts (During Flow)

| Key | Action |
|-----|--------|
| `Esc` | Close modal (with confirmation if data entered) |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Enter` | Submit current step / Next step |
| `Cmd+Enter` | Skip to final confirmation (if all required fields filled) |
| `Cmd+S` | Save as draft (future enhancement) |

---

## Alternative Flows

### A1: Create Placement from Offer Detail Screen

**Trigger:** User is viewing offer detail, clicks "Convert to Placement"

**Flow:**
1. User navigates to offer detail
2. Clicks "Convert to Placement" button
3. Placement modal opens (same as main flow Step 3)
4. Continue from Step 4 onwards

### A2: Backdate Placement (Past Start Date)

**Trigger:** Candidate already started, recruiter needs to record placement retroactively

**Flow:**
1. User enters start date in the past
2. System shows warning: "⚠️ Start date is in the past. Is this a backdated placement?"
3. User clicks "Confirm Backdated Placement"
4. System prompts: "Reason for backdated placement?"
5. User enters reason (e.g., "HR notified late", "Paperwork delay")
6. System creates placement with `isBackdated = true` flag
7. Activity log records reason
8. Continue normal flow

### A3: Create Placement with Negative Margin (Override)

**Trigger:** Pay rate is higher than bill rate (unusual edge case)

**Flow:**
1. User enters pay rate ≥ bill rate
2. System shows error: "⚠️ Warning: Negative or zero margin (-5%). This placement will result in a loss."
3. System displays: "Do you want to proceed anyway?"
4. User clicks "Proceed with Caution"
5. System requires manager approval code
6. Manager enters approval code
7. System creates placement with `requiresApproval = true`
8. Notification sent to Finance for review
9. Continue normal flow

### A4: Convert Permanent to Contract (Type Change)

**Trigger:** User realizes placement type needs to be changed after creation

**Flow:**
1. User views placement detail
2. Clicks "Edit Placement"
3. Changes placement type from "permanent" to "contract"
4. End date field becomes visible and required
5. User sets end date
6. System recalculates revenue projection
7. User confirms change
8. Placement updated
9. Activity logged

### A5: Multiple Placements for Same Job

**Trigger:** Job has positions_count > 1, recruiter places second candidate

**Flow:**
1. User creates placement for Candidate A
2. Job shows: positions_filled = 1 of 2
3. User creates second placement for Candidate B
4. Job shows: positions_filled = 2 of 2
5. Job status auto-updates to "filled"
6. Celebration shows: "🎉 Job fully filled! All 2 positions placed!"
7. Continue normal flow

---

## Rollback Scenarios

### Scenario 1: Candidate No-Show on Day 1

**What Happened:** Candidate doesn't show up on start date

**Actions:**
1. Recruiter navigates to placement detail
2. Clicks "Mark as Cancelled"
3. Selects reason: "Candidate No-Show"
4. System prompts: "Do you want to create a fallout activity?"
5. User clicks "Yes"
6. System:
   - Updates placement status to "cancelled"
   - Creates activity: "Candidate no-show follow-up"
   - Rolls back sprint progress (-1 placement)
   - Reverses commission accrual
   - Decrements job.positions_filled
   - Re-opens job (status = "open")
   - Sends notification to HR (cancel onboarding)
   - Logs activity

### Scenario 2: Client Cancels Before Start Date

**What Happened:** Client cancels requisition before candidate starts

**Actions:**
1. Account Manager navigates to job detail
2. Clicks "Cancel Job"
3. System shows: "⚠️ This job has 1 active placement. What do you want to do?"
4. Options:
   - "Cancel placement and job" → Cancels both
   - "Move placement to different job" → Re-assigns placement
   - "Keep placement, cancel job" → Rare, but allowed
5. User selects action
6. System executes rollback
7. Notifications sent to all stakeholders

### Scenario 3: Candidate Quits Early (Before End Date)

**What Happened:** Contractor quits mid-contract

**Actions:**
1. Recruiter navigates to placement detail
2. Clicks "End Placement Early"
3. Enters actual end date
4. Selects reason: "Voluntary Resignation", "Terminated by Client", "Performance Issue"
5. System:
   - Updates placement status to "ended"
   - Sets `actualEndDate` field
   - Calculates actual revenue (prorated)
   - Adjusts commission (if applicable)
   - Logs activity
   - Sends notification to Finance (adjust billing)

---

## Related Use Cases

- [02-create-job.md](./02-create-job.md) - Create the job requisition first
- [03-source-candidates.md](./03-source-candidates.md) - Source candidates for job
- [04-submit-candidate.md](./04-submit-candidate.md) - Submit candidate to client
- [05-schedule-interview.md](./05-schedule-interview.md) - Schedule interviews
- [07-extend-offer.md](./07-extend-offer.md) - Extend offer before placement
- [08-manage-onboarding.md](./08-manage-onboarding.md) - HR onboarding process

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Create placement with all required fields | Placement created, all 11 postconditions met |
| TC-002 | Submit without start date | Error: "Start date is required" |
| TC-003 | Submit with past start date | Warning: "Start date is in the past" + confirmation prompt |
| TC-004 | Submit with pay rate > bill rate | Error: "Negative margin" + override option |
| TC-005 | Submit with end date before start date | Error: "End date must be after start date" |
| TC-006 | Create placement for contract (6 months) | Duration auto-calculated: 6 months |
| TC-007 | Create placement for permanent hire | End date field hidden, duration not shown |
| TC-008 | Create placement with 25% margin | Commission tier 4 (6%), correct commission calculated |
| TC-009 | Create placement when sprint already has 1 | Sprint progress updates to 100%, celebration message |
| TC-010 | Create placement when job has 2 positions, 1 filled | Job remains "open", positions_filled = 2 of 2, job status → "filled" |
| TC-011 | Cancel placement mid-creation | Confirmation prompt, data not saved |
| TC-012 | Network error during creation | Retry button, data preserved |
| TC-013 | Create placement with Bill Rate = $100, Pay Rate = $80 | Margin = 20%, Tier 3, Commission = 5%, Monthly = $100 × 176 × 0.05 |
| TC-014 | Click quick-set "6 mo" button | End date = start date + 6 months, duration shows "6 months" |
| TC-015 | Create placement when no active sprint | Warning: "No active sprint", placement created anyway |
| TC-016 | Create placement as non-recruiter role | Permission denied error |
| TC-017 | Backdate placement with reason | Placement created with `isBackdated = true`, reason logged |
| TC-018 | Create second placement for same submission | Error: "Placement already exists for this submission" |

---

## UI/UX Specifications

### Celebration Animation Details

**Animation Sequence:**
1. **Confetti Burst** (2s):
   - 50 confetti pieces fall from top
   - Colors: Gold (#FFD700), Forest Green (#2D5016), Rust (#E07A5F)
   - Physics: Gravity + random rotation

2. **Success Card Slide-In** (500ms):
   - Card slides up from bottom with bounce easing
   - Background overlay: rgba(0,0,0,0.3)

3. **Metric Counter Animation** (1.5s):
   - Numbers count up from 0 to actual value
   - Easing: ease-out

4. **Sound Effect** (optional):
   - Success chime (if user has sound enabled)

### Progress Indicator

**Sprint Progress Bar:**
```
┌─────────────────────────────────────────┐
│ Sprint 23 (12/01 - 12/14)               │
│ Target: 2 placements                    │
│                                         │
│ [████████████████████░░░░░░░░░░] 50%  │
│                                         │
│ ✅ Placement #1: Sarah → Google         │
│ ⬜ Placement #2: Keep hustling!         │
└─────────────────────────────────────────┘
```

### Commission Preview Card

**Visual Design:**
```
┌────────────────────────────────────────┐
│ 💰 Your Commission Preview             │
├────────────────────────────────────────┤
│ Tier: 3 (20-25% margin)                │
│ Rate: 5% of revenue                    │
│                                        │
│ Monthly Commission: $1,056             │
│ 6-Month Total: $6,336                  │
│                                        │
│ 🎯 Sprint Impact:                      │
│ +1 placement → 50% of target!          │
└────────────────────────────────────────┘
```

---

## Database Schema Reference

**Placements Table:**
```sql
CREATE TABLE placements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Associations
  submission_id UUID NOT NULL REFERENCES submissions(id),
  offer_id UUID REFERENCES offers(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  candidate_id UUID NOT NULL REFERENCES user_profiles(id),
  account_id UUID NOT NULL REFERENCES accounts(id),

  -- Placement details
  placement_type TEXT DEFAULT 'contract',
  start_date DATE NOT NULL,
  end_date DATE,

  -- Compensation
  bill_rate NUMERIC(10, 2) NOT NULL,
  pay_rate NUMERIC(10, 2) NOT NULL,
  markup_percentage NUMERIC(5, 2), -- Auto-calculated
  currency TEXT DEFAULT 'USD',

  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'extended', 'ended', 'cancelled'
  end_reason TEXT,
  actual_end_date DATE,

  -- Financials
  total_revenue NUMERIC(12, 2),
  total_paid NUMERIC(12, 2),

  -- Onboarding
  onboarding_status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  onboarding_completed_at TIMESTAMPTZ,

  -- Performance
  performance_rating INTEGER,
  extension_count INTEGER DEFAULT 0,

  -- Assignment
  recruiter_id UUID NOT NULL REFERENCES user_profiles(id),
  account_manager_id UUID REFERENCES user_profiles(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);
```

---

## Commission Calculation Deep Dive

### Base Formula

```typescript
// Input
const billRate = 120.00; // $/hr
const payRate = 95.00;   // $/hr
const hoursPerMonth = 176; // Standard: 40 hrs/week × 4.4 weeks

// Calculations
const markup = billRate - payRate; // $25.00/hr
const grossMargin = (markup / billRate) * 100; // 20.83%
const monthlyRevenue = billRate * hoursPerMonth; // $21,120
const monthlyMarkup = markup * hoursPerMonth; // $4,400

// Determine tier
let tier = 1;
let commissionRate = 0.03;

if (grossMargin >= 30) { tier = 5; commissionRate = 0.07; }
else if (grossMargin >= 25) { tier = 4; commissionRate = 0.06; }
else if (grossMargin >= 20) { tier = 3; commissionRate = 0.05; }
else if (grossMargin >= 15) { tier = 2; commissionRate = 0.04; }

// Final commission
const monthlyCommission = monthlyRevenue * commissionRate; // $1,056
const sixMonthCommission = monthlyCommission * 6; // $6,336 (for 6-month contract)
```

### Annual Salary Conversion

For permanent placements with annual salary:

```typescript
// Input
const annualSalary = 150000; // Candidate salary
const clientFee = 0.20; // 20% placement fee

// Calculations
const placementFee = annualSalary * clientFee; // $30,000 one-time
const recruiterCommission = placementFee * 0.10; // 10% of placement fee = $3,000
```

### Prorated Commission (Early Termination)

If placement ends early:

```typescript
// Original 6-month contract
const originalEndDate = new Date('2025-06-15');
const actualEndDate = new Date('2025-03-15'); // Ended after 3 months

// Calculate actual months worked
const monthsWorked = 3;
const originalMonths = 6;

// Prorated commission
const fullCommission = 6336; // 6 months × $1,056
const proratedCommission = (monthsWorked / originalMonths) * fullCommission; // $3,168
const clawback = fullCommission - proratedCommission; // $3,168 to be clawed back
```

---

## Onboarding Checklist Details

**Standard 8-Task Checklist:**

| # | Task | Assigned To | Due Date | Priority | Description |
|---|------|------------|----------|----------|-------------|
| 1 | I-9 Verification | HR Manager | Start Date | Critical | Complete I-9 Employment Eligibility Verification |
| 2 | W-4 Tax Form | HR Manager | Start Date | High | Complete federal tax withholding form |
| 3 | Background Check | HR Manager | Start Date - 7 days | High | Initiate and complete background check |
| 4 | Drug Screen | HR Manager | Start Date - 3 days | Medium | Schedule and complete drug screening |
| 5 | Direct Deposit Setup | HR Manager | Start Date | Medium | Set up direct deposit for payroll |
| 6 | IT Equipment Request | IT Manager | Start Date - 5 days | High | Request laptop, phone, and access credentials |
| 7 | Benefits Enrollment | HR Manager | Start Date + 30 days | Low | Enroll in health, dental, vision insurance (if eligible) |
| 8 | First Day Welcome Call | Recruiter | Start Date | High | Call candidate on Day 1 to ensure smooth start |

**Task Status Flow:**
```
pending → in_progress → completed
                     ↓
                  cancelled (if placement cancelled)
```

---

*Last Updated: 2024-11-30*
*Document Version: 1.0*
*Author: InTime v3 Product Team*
*Status: Final*
