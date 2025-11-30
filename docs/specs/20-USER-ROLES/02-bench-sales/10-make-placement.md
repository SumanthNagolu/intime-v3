# Use Case: Make Bench Placement

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-BENCH-010 |
| Actor | Bench Sales Recruiter |
| Goal | Record a successful bench placement when consultant starts working at vendor/client |
| Frequency | 1 per 2-week sprint (target: 1 per person per sprint) |
| Estimated Time | 20-25 minutes |
| Priority | CRITICAL (Revenue Moment + Bench Reduction) |
| Business Impact | Direct revenue recognition, commission calculation, bench utilization improvement, sprint tracking |

---

## Preconditions

1. User is logged in as Bench Sales Recruiter
2. Vendor offer has been received and accepted
3. Bench submission record exists with status = "offered" or "placed"
4. Consultant has accepted the placement
5. Start date is confirmed with consultant and vendor
6. All rate tiers have been negotiated and agreed (consultant pay → vendor bill → end client bill)
7. User has "bench_placement.create" permission (default for Bench Sales Recruiter role)
8. Consultant is currently on bench (benchMetadata exists)

---

## Trigger

One of the following:
- Bench Sales Recruiter receives signed offer letter from vendor
- Consultant confirms start date via email/call
- Vendor confirms onboarding schedule
- HR notifies recruiter that employment contract is ready
- Bench Sales Recruiter clicks "Convert to Placement" from bench submission detail screen

---

## Key Differences from Regular Placement

| Aspect | Regular Placement | Bench Placement |
|--------|------------------|----------------|
| **Candidate Type** | External candidate | Internal employee/consultant |
| **Rate Structure** | Bill Rate → Pay Rate (2 tiers) | Consultant Pay → InTime Markup → Vendor Markup → End Client (3+ tiers) |
| **Primary Metric** | Time-to-fill | Days on bench reduction |
| **Commission** | Based on gross margin | Based on InTime's markup % |
| **Onboarding** | Full onboarding required | May already be employee, simplified process |
| **Paperwork** | W-4, I-9, background check | Subcontracting agreement, client letter |
| **Immigration** | Verify work authorization | May need client letter for H1B transfer/extension |
| **Status Change** | Candidate → Placed | On Bench → Placed (bench cleared) |

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Bench Submission with Accepted Offer

**User Action:** Click "Bench Pipeline" in sidebar, filter by "Offer Accepted"

**System Response:**
- Sidebar item highlights
- URL changes to: `/employee/workspace/bench/submissions?status=offered`
- Bench submissions list loads showing all accepted offers
- Each submission shows green "Offer Accepted" badge

**Screen State:**
```
+----------------------------------------------------------+
| Bench Pipeline                          [+ New] [⚙] [⌘K] |
+----------------------------------------------------------+
| [Search submissions...]                 [Filter ▼] [⌘F]  |
+----------------------------------------------------------+
| Identified │ Submitted │ Interview │ ● Offered │ Placed  |
+----------------------------------------------------------+
| Status      Consultant        External Job      Vendor   |
| ──────────────────────────────────────────────────────── |
| ✓ OFFERED   Rajesh Kumar      Java Dev (Dice)   TechSta  |
|   (Offer: $100/hr vendor | Start: 12/15/24)              |
|   💰 InTime bills: $85/hr | Consultant: $65/hr | 30% GM  |
|   🟠 42 days on bench - HIGH PRIORITY                    |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 2: Open Bench Submission Detail

**User Action:** Click on submission row "Rajesh Kumar - Java Developer"

**System Response:**
- Row highlights
- Detail panel slides in from right (300ms animation)
- Shows full bench submission history
- **"Convert to Placement 🎉" button prominently displayed** in action bar
- Shows rate stack calculation

**Screen State:**
```
+----------------------------------------------------------+
| Rajesh Kumar → TechStaff → Accenture               [×]   |
+----------------------------------------------------------+
| [Convert to Placement 🎉]  [View Offer]  [Timeline]     |
+----------------------------------------------------------+
| Consultant: Rajesh Kumar (Internal - H1B)                |
| External Job: Java Developer (Dice.com)                  |
| Vendor: TechStaff Solutions                              |
| End Client: Accenture Federal Services                   |
| Status: OFFER ACCEPTED ✓                                 |
|                                                          |
| Rate Stack:                                              |
| 💵 Consultant Pay Rate: $65/hr                          |
| ➕ InTime Markup: $20/hr (30.77%)                       |
| 💰 InTime Bills Vendor: $85/hr                          |
| ➕ Vendor Markup: $15/hr (17.65%)                       |
| 🏦 Vendor Bills End Client: $100/hr                     |
|                                                          |
| InTime Margin Analysis:                                  |
| • Markup: $20/hr                                         |
| • Gross Margin: 23.53% (on $85 revenue to us)           |
| • Monthly Revenue: $14,960 ($85 × 176 hrs)              |
|                                                          |
| Consultant Bench Status:                                 |
| 🟠 42 days on bench (URGENT - 30+ days alert)           |
| Last project: Meta (ended 11/3/24)                       |
| Sprint impact: +1 placement → 50% of target!             |
|                                                          |
| Offer Details:                                           |
| • Vendor Offer Rate: $85/hr (what vendor pays InTime)   |
| • Accepted: 12/10/24                                     |
| • Proposed Start: 12/15/24                               |
| • Duration: 6 months (contract)                          |
| • Location: Remote (US-based)                            |
|                                                          |
| Timeline:                                                |
| 12/10/24  Vendor Offer Accepted                          |
| 12/08/24  Vendor Offer Received                          |
| 12/06/24  Client Interview Completed                     |
| 12/05/24  Vendor Interview Completed                     |
| 12/03/24  Submitted to Vendor                            |
| 12/02/24  Consultant Contacted & Interested              |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 3: Click "Convert to Placement"

**User Action:** Click the green "Convert to Placement 🎉" button

**System Response:**
- Button shows click animation
- Placement creation modal slides in from right (400ms)
- Modal title: "🎉 Create Bench Placement - Revenue Moment!"
- Form pre-fills data from bench submission and offer
- First field (Placement Type) is focused

**Screen State:**
```
+----------------------------------------------------------+
|      🎉 CREATE BENCH PLACEMENT - REVENUE MOMENT!         |
|                                                      [×] |
+----------------------------------------------------------+
| Step 1 of 5: Placement Details                           |
|                                                          |
| Consultant * (Internal Employee)                         |
| [Rajesh Kumar (EMP-2041)                       ] ✓       |
| Status: On Bench (42 days) → Transitioning to Placed    |
|                                                          |
| External Job *                                           |
| [Java Developer - Dice (Accenture Federal)     ] ✓       |
|                                                          |
| Vendor * (Prime Vendor)                                  |
| [TechStaff Solutions                           ] ✓       |
|                                                          |
| End Client *                                             |
| [Accenture Federal Services                    ] ✓       |
|                                                          |
| Placement Type *                                         |
| [Contract (C2C)                                ▼]        |
|                                                          |
| Work Location *                                          |
| [Remote (US-based)                             ▼]        |
|                                                          |
+----------------------------------------------------------+
|                              [Cancel]  [Next: Dates →]  |
+----------------------------------------------------------+
```

**Time:** ~400ms

---

### Step 4: Review Pre-filled Details

**User Action:** Review pre-filled consultant, job, vendor, and client info

**System Response:**
- Fields are locked/read-only (shown with checkmark)
- User can see all details are correct from bench submission
- Bench status indicator shows transition: "On Bench → Placed"

**Field Specification: Consultant Name**
| Property | Value |
|----------|-------|
| Field Name | `consultantId` |
| Type | Read-only Display |
| Label | "Consultant (Internal Employee)" |
| Pre-filled From | `benchSubmission.candidateId` |
| Display Format | `{firstName} {lastName} (EMP-{employeeId})` |
| Required | Yes |
| Editable | No |
| Additional Info | Shows current bench status and days on bench |

**Field Specification: External Job**
| Property | Value |
|----------|-------|
| Field Name | `externalJobId` |
| Type | Read-only Display |
| Label | "External Job" |
| Pre-filled From | `externalJob.title` |
| Display Format | `{title} - {sourceName} ({companyName})` |
| Required | Yes |
| Editable | No |

**Field Specification: Vendor**
| Property | Value |
|----------|-------|
| Field Name | `vendorAccountId` |
| Type | Read-only Display |
| Label | "Vendor (Prime Vendor)" |
| Pre-filled From | `benchSubmission.vendorName` |
| Display Format | `{vendor.name}` |
| Required | Yes |
| Editable | No |
| Note | This is the vendor who pays InTime |

**Field Specification: End Client**
| Property | Value |
|----------|-------|
| Field Name | `endClientName` |
| Type | Read-only Display |
| Label | "End Client" |
| Pre-filled From | `externalJob.companyName` |
| Required | Yes |
| Editable | No |
| Note | Ultimate client where consultant will work |

**Time:** ~5 seconds

---

### Step 5: Select Placement Type

**User Action:** Click "Placement Type" dropdown, confirm or change selection

**System Response:**
- Dropdown opens
- Shows placement types relevant to bench sales
- Pre-selected from external job type

**Field Specification: Placement Type**
| Property | Value |
|----------|-------|
| Field Name | `placementType` |
| Type | Dropdown |
| Label | "Placement Type" |
| Pre-filled From | `externalJob.rateType` or "contract" |
| Required | Yes |
| Options | |
| - `contract_c2c` | "Contract (Corp-to-Corp)" |
| - `contract_w2` | "Contract (W2)" |
| - `contract_1099` | "Contract (1099)" |
| - `contract_to_hire` | "Contract to Hire (C2H)" |
| - `sow` | "Statement of Work (SOW)" |
| Impact on Fields | Contract: Show end date; All types: Show subcontract details |
| Default | `contract_c2c` (most common for bench sales) |

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
|      🎉 CREATE BENCH PLACEMENT - REVENUE MOMENT!         |
|                                                      [×] |
+----------------------------------------------------------+
| Step 2 of 5: Dates & Duration                            |
|                                                          |
| Start Date *                                             |
| [12/15/2024                                    📅]       |
|                                                          |
| End Date *                                               |
| [MM/DD/YYYY                                    📅]       |
| (Contract end date from vendor offer)                    |
|                                                          |
| Duration (auto-calculated)                               |
| [___] months                                             |
|                                                          |
| ⚡ Quick Set:                                            |
| [3 mo] [6 mo] [12 mo] [Custom]                          |
|                                                          |
| Bench Impact Preview:                                    |
| 🟠 Rajesh Kumar: 42 days on bench → 0 days (cleared!)   |
| 📊 Bench Utilization: 35% → 28% (-7%)                   |
| 🎯 Sprint Progress: 0 → 1 placement (50% of target)     |
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
- Pre-filled with vendor offer's proposed start date
- User can adjust if needed
- Calendar highlights today and selected date

**Field Specification: Start Date**
| Property | Value |
|----------|-------|
| Field Name | `startDate` |
| Type | Date Picker |
| Label | "Start Date" |
| Format | MM/DD/YYYY |
| Pre-filled From | `benchSubmission.placementStartDate` or `offer.startDate` |
| Min Date | Today (warning if past date selected) |
| Max Date | None |
| Required | Yes |
| Validation | Must be a valid future date (or warn if past) |
| Error Messages | |
| - Empty | "Start date is required" |
| - Past date | "⚠️ Warning: Start date is in the past. Confirm this is correct for backdated placement." |

**Time:** ~5 seconds

---

### Step 8: Set End Date

**User Action:** Click calendar for end date, select date OR click quick-set button

**System Response:**
- End date field is visible and required (bench placements are typically contract)
- Quick-set buttons auto-calculate end date
- Duration in months auto-calculates
- Bench impact preview updates with placement duration

**Field Specification: End Date**
| Property | Value |
|----------|-------|
| Field Name | `endDate` |
| Type | Date Picker |
| Label | "End Date" |
| Format | MM/DD/YYYY |
| Visible | Always (bench placements are typically contract) |
| Required | Yes for contract types |
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
| Format | "{months} months" or "{days} days" if <1 month |
| Calculation | `Math.ceil((endDate - startDate) / (30 * 24 * 60 * 60 * 1000))` |
| Visible | Always when end date is set |

**Quick-Set Buttons:**
- "3 mo" → Sets end date to start date + 3 months
- "6 mo" → Sets end date to start date + 6 months (most common)
- "12 mo" → Sets end date to start date + 12 months
- "Custom" → Allows manual date selection

**Time:** ~5 seconds

---

### Step 9: Click "Next: Rates"

**User Action:** Click "Next: Rates →" button

**System Response:**
- Validates dates
- Slides to Step 3 - Rate Stack (300ms animation)
- **This is the most complex step for bench placements**

**Screen State (Step 3):**
```
+----------------------------------------------------------+
|      🎉 CREATE BENCH PLACEMENT - REVENUE MOMENT!         |
|                                                      [×] |
+----------------------------------------------------------+
| Step 3 of 5: Rate Stack & Margins (The Money!)           |
|                                                          |
| 💵 Consultant Pay Rate (What consultant receives) *      |
| $ [65.00         ] /hr                                   |
| Employee ID: EMP-2041 | Current status: On Bench         |
|                                                          |
| 💰 InTime Bill Rate (What vendor pays us) *              |
| $ [85.00         ] /hr                                   |
| Vendor: TechStaff Solutions                              |
|                                                          |
| 🏦 Vendor Bill Rate (What end client pays vendor)        |
| $ [100.00        ] /hr (informational)                   |
| End Client: Accenture Federal Services                   |
|                                                          |
| ─────────────────────────────────────────────────────── |
| InTime Margin Calculation:                               |
| • Markup: $20.00/hr ($85 - $65)                         |
| • Markup %: 30.77% ($20 / $65 × 100)                    |
| • Gross Margin: 23.53% ($20 / $85 × 100)                |
| • Monthly Revenue (to InTime): $14,960                   |
| • Monthly Markup (InTime profit): $3,520                 |
| ─────────────────────────────────────────────────────── |
|                                                          |
| 💰 Your Commission Preview:                              |
| Commission Tier: Tier 4 (20-25% gross margin)           |
| Commission Rate: 6% of InTime revenue                    |
| Monthly Commission: $897.60                              |
| 6-Month Total: $5,385.60                                 |
|                                                          |
| 🎯 Sprint Impact:                                        |
| +1 placement → 50% of sprint target!                     |
|                                                          |
| 📊 Bench Impact:                                         |
| • Days on bench cleared: 42 days → 0 days               |
| • Bench utilization improved: 35% → 28%                  |
| • Pod bench metric: Improved!                            |
|                                                          |
| Currency                                                 |
| [USD                                               ▼]    |
|                                                          |
+----------------------------------------------------------+
|              [← Back]  [Cancel]  [Next: Immigration →]  |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 10: Enter Consultant Pay Rate

**User Action:** Review pre-filled consultant pay rate OR adjust if negotiated

**System Response:**
- Field pre-filled from consultant's expected rate in profile
- User can adjust if consultant negotiated rate increase
- Auto-formats with $ and decimal places
- **Real-time margin calculation updates** as user types

**Field Specification: Consultant Pay Rate**
| Property | Value |
|----------|-------|
| Field Name | `consultantPayRate` |
| Type | Currency Input |
| Label | "Consultant Pay Rate (What consultant receives)" |
| Prefix | "$" |
| Suffix | "/hr" |
| Pre-filled From | `userProfile.expectedRate` or `benchSubmission.consultantRate` |
| Required | Yes |
| Min Value | 0.01 |
| Max Value | InTime Bill Rate - 0.01 |
| Precision | 2 decimal places |
| Validation | Must be > 0 and < InTime bill rate |
| Error Messages | |
| - Empty | "Consultant pay rate is required" |
| - Invalid | "Consultant pay rate must be a positive number" |
| - Greater than InTime rate | "Consultant pay rate must be less than InTime bill rate" |
| - Negative margin | "⚠️ Warning: Negative margin! This will result in a loss." |

**Time:** ~3 seconds

---

### Step 11: Enter InTime Bill Rate

**User Action:** Review pre-filled InTime bill rate (what vendor pays us)

**System Response:**
- Field pre-filled from `benchSubmission.placementBillRate` or vendor offer
- This is the CRITICAL rate - what InTime actually receives
- **Real-time margin calculation updates** as user types
- Margin formula and commission preview update live
- Color coding: Green (>20%), Yellow (15-20%), Red (<15%)

**Field Specification: InTime Bill Rate**
| Property | Value |
|----------|-------|
| Field Name | `inTimeBillRate` |
| Type | Currency Input |
| Label | "InTime Bill Rate (What vendor pays us)" |
| Prefix | "$" |
| Suffix | "/hr" |
| Pre-filled From | `benchSubmission.placementBillRate` |
| Required | Yes |
| Min Value | Consultant Pay Rate + 0.01 |
| Max Value | 999999.99 |
| Precision | 2 decimal places |
| Validation | Must be > consultant pay rate |
| Error Messages | |
| - Empty | "InTime bill rate is required" |
| - Less than pay | "InTime bill rate must be greater than consultant pay rate" |
| - Low margin | "⚠️ Warning: Margin below 15%. Consider renegotiating." |

**Time:** ~5 seconds

---

### Step 12: Enter Vendor Bill Rate (Optional/Informational)

**User Action:** Enter vendor's bill rate to end client (informational only)

**System Response:**
- This field is optional and informational
- Used for understanding total value chain
- Does NOT affect InTime's margin calculations
- Helps track market rates and vendor markups

**Field Specification: Vendor Bill Rate**
| Property | Value |
|----------|-------|
| Field Name | `vendorBillRate` |
| Type | Currency Input |
| Label | "Vendor Bill Rate (What end client pays vendor)" |
| Prefix | "$" |
| Suffix | "/hr" |
| Required | No (informational) |
| Min Value | InTime Bill Rate |
| Validation | Should be ≥ InTime bill rate |
| Purpose | Market intelligence, vendor relationship tracking |
| Note | "This is for tracking purposes only and doesn't affect your commission" |

**Time:** ~3 seconds

---

### Step 13: Review Margin Calculation

**User Action:** Review auto-calculated margins and commission

**System Response:**
- Calculations update in real-time
- Commission tier is displayed
- Monthly revenue estimate shown
- Sprint progress indicator updates
- Bench impact metrics shown

**Margin Calculation Formulas:**

| Metric | Formula | Example (Consultant: $65, InTime: $85) |
|--------|---------|---------------------------------------|
| Markup | `inTimeBillRate - consultantPayRate` | $85 - $65 = $20/hr |
| Markup % | `(markup / consultantPayRate) × 100` | ($20 / $65) × 100 = 30.77% |
| Gross Margin | `(markup / inTimeBillRate) × 100` | ($20 / $85) × 100 = 23.53% |
| Monthly Revenue | `inTimeBillRate × 176 hours` | $85 × 176 = $14,960 |
| Monthly Markup | `markup × 176 hours` | $20 × 176 = $3,520 |

**Commission Tier Table (Bench Sales):**

| Tier | Gross Margin Range | Commission Rate | Example (on $14,960 revenue) |
|------|-------------------|----------------|------------------------------|
| Tier 1 | 0-14.99% | 3% | $448.80/month |
| Tier 2 | 15-19.99% | 4.5% | $672.20/month |
| Tier 3 | 20-24.99% | 6% | $897.60/month |
| Tier 4 | 25-29.99% | 7% | $1,047.20/month |
| Tier 5 | 30%+ | 8% | $1,196.80/month |

**Note:** Bench sales commission rates are slightly higher than regular recruiting to incentivize bench reduction.

**Sprint Progress Visualization:**
```
Sprint Target: 1 placement per 2-week sprint
Current Sprint: Sprint 23 (12/01/24 - 12/14/24)

Progress: 1 of 1 [████████████████████████] 100%
✅ Placement #1: Rajesh Kumar → TechStaff/Accenture
🎉 Sprint Target ACHIEVED!
```

**Bench Impact Visualization:**
```
Bench Utilization Impact:
Before: 7 consultants on bench (35% of 20 total)
After:  6 consultants on bench (28% of 20 total)
Change: -7% utilization (GOOD!)

Days on Bench Cleared:
Rajesh Kumar: 42 days → 0 days
Average days on bench: 38 days → 34 days (-4 days)
```

**Time:** ~10 seconds

---

### Step 14: Select Currency (Optional)

**User Action:** Review or change currency (defaults to USD)

**Field Specification: Currency**
| Property | Value |
|----------|-------|
| Field Name | `currency` |
| Type | Dropdown |
| Label | "Currency" |
| Default | "USD" |
| Required | Yes |
| Options | USD, INR, CAD, EUR, GBP, AUD, MXN |
| Note | For international placements, conversion tracking |

**Time:** ~2 seconds

---

### Step 15: Click "Next: Immigration"

**User Action:** Click "Next: Immigration →" button

**System Response:**
- Validates all financial fields
- Checks if consultant has active immigration case
- Slides to Step 4 - Immigration & Compliance

**Screen State (Step 4):**
```
+----------------------------------------------------------+
|      🎉 CREATE BENCH PLACEMENT - REVENUE MOMENT!         |
|                                                      [×] |
+----------------------------------------------------------+
| Step 4 of 5: Immigration & Compliance                    |
|                                                          |
| Consultant Immigration Status                            |
| Current Visa: H1B                                        |
| Expiry: 08/15/2026 (✓ Valid for 20 months)              |
| Employer: InTime Solutions Inc.                          |
|                                                          |
| ⚠ Actions Required for Placement:                       |
|                                                          |
| ☑ Client Letter Required                                |
|   H1B consultant working at end client location requires |
|   a client letter for USCIS compliance.                  |
|   [Generate Client Letter Template]                      |
|                                                          |
| ☐ H1B Transfer (if applicable)                          |
|   Not required - consultant already on InTime's H1B      |
|                                                          |
| ☐ Immigration Case Update                               |
|   Update active immigration case with new client info    |
|   [View Immigration Case #IMM-2024-089]                  |
|                                                          |
| Work Location Verification:                              |
| End Client Work Site: [Remote (US-based)         ▼]     |
|                                                          |
| ☑ I confirm consultant is authorized to work at this     |
|   location per their visa requirements                   |
|                                                          |
| LCA (Labor Condition Application) Status:                |
| ○ Existing LCA covers this location                     |
| ● New LCA required for this client                      |
| ○ Not applicable (remote work)                          |
|                                                          |
| ─────────────────────────────────────────────────────── |
| Compliance Checklist:                                    |
| ☑ Consultant has valid work authorization               |
| ☑ Visa expiry is >180 days from start date              |
| ☑ End client location is permitted                      |
| ☐ Client letter generated (if required)                 |
| ☐ Immigration team notified (if updates needed)         |
|                                                          |
+----------------------------------------------------------+
|                 [← Back]  [Cancel]  [Next: Confirm →]   |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 16: Review Immigration Requirements

**User Action:** Review consultant's immigration status and required actions

**System Response:**
- Auto-detects if consultant has active immigration case
- Determines if client letter is needed (H1B, L1 consultants)
- Validates visa expiry date
- Shows compliance checklist

**Field Specification: Client Letter Required**
| Property | Value |
|----------|-------|
| Field Name | `clientLetterRequired` |
| Type | Checkbox (auto-detected) |
| Label | "Client Letter Required" |
| Auto-selected | If consultant visa type = H1B, L1, TN |
| Required | No |
| Action | Generates client letter template for HR/immigration team |
| Template | Includes: consultant name, client name, work location, start/end dates, job duties |

**Immigration Validation Rules:**
- ✅ Visa must be valid for >180 days from start date
- ✅ Work location must be permitted by visa type
- ✅ H1B consultants at client site require client letter
- ✅ H1B transfer takes 3-6 months (consultant should already be on InTime's H1B)
- ⚠️ OPT consultants: Check EAD expiry, cannot submit if <60 days

**Time:** ~5-10 seconds

---

### Step 17: Click "Next: Confirm"

**User Action:** Click "Next: Confirm →" button

**System Response:**
- Validates all fields including immigration compliance
- Slides to Step 5 - Confirmation screen

**Screen State (Step 5):**
```
+----------------------------------------------------------+
|      🎉 CREATE BENCH PLACEMENT - REVENUE MOMENT!         |
|                                                      [×] |
+----------------------------------------------------------+
| Step 5 of 5: Confirm & Celebrate                         |
|                                                          |
| Review Bench Placement Details:                          |
|                                                          |
| ┌────────────────────────────────────────────────────┐ |
| │ CONSULTANT:    Rajesh Kumar (EMP-2041)             │ |
| │ External Job:  Java Developer (Dice.com)           │ |
| │ Vendor:        TechStaff Solutions (Prime)         │ |
| │ End Client:    Accenture Federal Services          │ |
| │ Type:          Contract (C2C)                      │ |
| │ Location:      Remote (US-based)                   │ |
| │                                                    │ |
| │ DATES:                                             │ |
| │ • Start:       12/15/2024                          │ |
| │ • End:         06/15/2025                          │ |
| │ • Duration:    6 months                            │ |
| │                                                    │ |
| │ RATE STACK:                                        │ |
| │ • Consultant Pay:   $65.00/hr                     │ |
| │ • InTime Bills:     $85.00/hr                     │ |
| │ • Vendor Bills:     $100.00/hr (informational)    │ |
| │ • Markup:           $20.00/hr (30.77%)            │ |
| │ • Gross Margin:     23.53% (Tier 3)               │ |
| │ • Revenue (InTime): $14,960/month                 │ |
| │ • Your Commission:  $897.60/month                 │ |
| │ • 6-Month Total:    $5,385.60                     │ |
| │                                                    │ |
| │ BENCH IMPACT:                                      │ |
| │ • Days on bench cleared: 42 days → 0              │ |
| │ • Bench utilization: 35% → 28% (-7%)              │ |
| │ • Sprint progress: 0 → 1 (100% of target!)        │ |
| │                                                    │ |
| │ IMMIGRATION:                                       │ |
| │ • Visa Type: H1B (valid through 08/2026)          │ |
| │ • Client Letter: Required (will be generated)     │ |
| │ • Compliance: ✓ All checks passed                 │ |
| └────────────────────────────────────────────────────┘ |
|                                                          |
| ✅ Auto-triggered Actions:                               |
| • Clear consultant from bench (benchMetadata updated)    |
| • Create subcontracting agreement checklist              |
| • Generate client letter for H1B compliance              |
| • Update immigration case with new client info           |
| • Notify HR Manager for payroll setup                    |
| • Notify bench sales manager                             |
| • Update sprint progress                                 |
| • Calculate commission                                   |
| • Send congratulations email to consultant               |
| • Update bench utilization metrics                       |
|                                                          |
| 🎉 Ready to record this bench placement and celebrate?   |
|                                                          |
+----------------------------------------------------------+
|       [← Back]  [Cancel]  [🎉 Create Placement!]        |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 18: Review Confirmation Summary

**User Action:** Review all placement details one final time

**System Response:**
- Shows complete summary including rate stack
- Lists all auto-triggered actions
- Displays celebration message
- Highlights bench impact metrics

**Time:** ~15 seconds

---

### Step 19: Click "Create Placement!"

**User Action:** Click the green "🎉 Create Placement!" button

**System Response:**
1. Button shows loading spinner (500ms)
2. API call `POST /api/trpc/bench/placements.create`
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
|          │  🏆 BENCH PLACEMENT MADE! 🏆   │            |
|          │                                 │            |
|          │  Consultant back to work!       │            |
|          │                                 │            |
|          │  💰 Monthly Revenue: $14,960   │            |
|          │  💵 Your Commission: $897.60   │            |
|          │  🎯 Sprint Target: 100% ✓      │            |
|          │  📊 Bench: 42 days cleared!    │            |
|          │  🔥 Bench Rate: 35% → 28%      │            |
|          │                                 │            |
|          │  Rajesh Kumar → TechStaff       │            |
|          │  → Accenture Federal            │            |
|          │  Starts: 12/15/24               │            |
|          │                                 │            |
|          └─────────────────────────────────┘            |
|                                                          |
|         [View Placement]  [Back to Bench Dashboard]     |
|                                                          |
+----------------------------------------------------------+
```

**Backend Processing (Sequential):**

1. **Create Placement Record:**
   ```sql
   INSERT INTO placements (
     id, org_id, submission_id, job_id,
     candidate_id, vendor_account_id, end_client_name,
     placement_type, start_date, end_date,
     consultant_pay_rate, bill_rate, vendor_bill_rate,
     markup_percentage, gross_margin_percentage,
     status, recruiter_id, is_bench_placement,
     bench_submission_id, created_by
   ) VALUES (
     uuid_generate_v4(),
     current_org_id,
     NULL, -- No internal job for bench placement
     NULL, -- External job, not internal
     consultant_id,
     vendor_account_id,
     'Accenture Federal Services',
     'contract_c2c',
     '2024-12-15',
     '2025-06-15',
     65.00,
     85.00,
     100.00, -- informational
     23.53,
     23.53,
     'active',
     current_user_id,
     TRUE, -- bench placement flag
     bench_submission_id,
     current_user_id
   );
   ```

2. **Update Bench Submission Status:**
   ```sql
   UPDATE bench_submissions
   SET status = 'placed',
       placed_at = NOW(),
       placement_start_date = '2024-12-15',
       placement_bill_rate = 85.00,
       updated_at = NOW()
   WHERE id = bench_submission_id;
   ```

3. **Clear Consultant from Bench:**
   ```sql
   -- Update user profile status
   UPDATE user_profiles
   SET profile_status = 'placed',
       updated_at = NOW()
   WHERE id = consultant_id;

   -- Archive bench metadata (consultant no longer on bench)
   UPDATE bench_metadata
   SET days_on_bench = 0,
       last_placement_date = '2024-12-15',
       total_placements = total_placements + 1,
       total_bench_days = total_bench_days + 42, -- for historical tracking
       updated_at = NOW()
   WHERE user_id = consultant_id;

   -- Or delete bench_metadata entirely since consultant is placed
   DELETE FROM bench_metadata WHERE user_id = consultant_id;
   ```

4. **Update External Job:**
   ```sql
   UPDATE external_jobs
   SET submission_count = submission_count + 1,
       last_placement_date = CURRENT_DATE,
       updated_at = NOW()
   WHERE id = external_job_id;
   ```

5. **Create Subcontracting Checklist:**
   ```typescript
   const subcontractingTasks = [
     { name: 'Subcontracting Agreement Signed', dueDate: startDate, priority: 'critical' },
     { name: 'Client Letter for H1B (if needed)', dueDate: addDays(startDate, -5), priority: 'high' },
     { name: 'Vendor Portal Access Setup', dueDate: addDays(startDate, -3), priority: 'medium' },
     { name: 'Timesheet Submission Process', dueDate: startDate, priority: 'high' },
     { name: 'Insurance Certificate (if required)', dueDate: addDays(startDate, -7), priority: 'medium' },
     { name: 'Background Check (if required)', dueDate: addDays(startDate, -10), priority: 'medium' },
     { name: 'Client Onboarding Coordination', dueDate: addDays(startDate, -2), priority: 'high' },
     { name: 'First Week Check-in Call', dueDate: addDays(startDate, 7), priority: 'high' }
   ];

   for (const task of subcontractingTasks) {
     await db.insert(activities).values({
       orgId: currentOrgId,
       entityType: 'bench_placement',
       entityId: placementId,
       activityType: 'task',
       title: task.name,
       dueDate: task.dueDate,
       priority: task.priority,
       status: 'pending',
       assignedTo: task.name.includes('Client Letter') ? immigrationManagerId : hrManagerId,
       createdBy: currentUserId
     });
   }
   ```

6. **Generate Client Letter (H1B Compliance):**
   ```typescript
   if (consultantVisaType === 'H1B' || consultantVisaType === 'L1') {
     const clientLetter = await generateClientLetter({
       consultantName: 'Rajesh Kumar',
       consultantTitle: 'Java Developer',
       clientName: 'Accenture Federal Services',
       workLocation: 'Remote (US-based)',
       startDate: '2024-12-15',
       endDate: '2025-06-15',
       jobDuties: externalJob.description,
       supervisorInfo: {
         name: 'TBD',
         title: 'Project Manager',
         phone: 'TBD'
       }
     });

     await db.insert(fileUploads).values({
       orgId: currentOrgId,
       fileName: `Client_Letter_Rajesh_Kumar_Accenture_${Date.now()}.pdf`,
       fileType: 'application/pdf',
       filePath: clientLetter.path,
       uploadedBy: currentUserId,
       entityType: 'immigration_case',
       entityId: immigrationCaseId,
       category: 'client_letter'
     });

     // Notify immigration team
     await sendNotification({
       userId: immigrationManagerId,
       type: 'client_letter_required',
       title: 'Client Letter Required for H1B Consultant',
       message: `Client letter generated for ${consultantName} placement at ${endClientName}. Please review and send to consultant.`,
       link: `/employee/hr/immigration/${immigrationCaseId}`
     });
   }
   ```

7. **Update Immigration Case:**
   ```typescript
   if (immigrationCaseId) {
     await db.update(immigrationCases)
       .set({
         status: 'active_placement',
         currentClientName: 'Accenture Federal Services',
         currentWorkLocation: 'Remote (US-based)',
         placementStartDate: startDate,
         placementEndDate: endDate,
         nextAction: 'Send client letter to USCIS',
         nextActionDate: addDays(startDate, -10),
         internalNotes: sql`internal_notes || '\n' || ${`Placed via TechStaff Solutions (vendor) to Accenture on ${startDate}`}`,
         updatedAt: new Date()
       })
       .where(eq(immigrationCases.id, immigrationCaseId));
   }
   ```

8. **Calculate Commission:**
   ```typescript
   const consultantPayRate = 65.00;
   const inTimeBillRate = 85.00;
   const markup = inTimeBillRate - consultantPayRate; // $20
   const grossMargin = (markup / inTimeBillRate) * 100; // 23.53%

   // Determine commission tier (bench sales tiers slightly higher)
   let commissionRate = 0.03; // Default tier 1
   if (grossMargin >= 30) commissionRate = 0.08; // Tier 5
   else if (grossMargin >= 25) commissionRate = 0.07; // Tier 4
   else if (grossMargin >= 20) commissionRate = 0.06; // Tier 3
   else if (grossMargin >= 15) commissionRate = 0.045; // Tier 2

   const monthlyRevenue = inTimeBillRate * 176; // $14,960
   const monthlyCommission = monthlyRevenue * commissionRate; // $897.60

   // Calculate total commission for contract duration
   const durationMonths = 6;
   const totalCommission = monthlyCommission * durationMonths; // $5,385.60

   // Store in commission tracking table
   await db.insert(commissions).values({
     placementId,
     benchSalesRepId: currentUserId,
     commissionRate,
     grossMarginPercentage: grossMargin,
     monthlyRevenue,
     monthlyCommission,
     totalCommission,
     durationMonths,
     status: 'pending',
     createdAt: new Date()
   });
   ```

9. **Update Sprint Progress:**
   ```typescript
   // Get current sprint for bench sales rep's pod
   const pod = await db.query.employeeMetadata.findFirst({
     where: eq(employeeMetadata.userId, currentUserId),
     with: { pod: true }
   });

   if (pod?.pod && pod.pod.podType === 'bench_sales') {
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

10. **Update Bench Metrics:**
    ```typescript
    // Update organization bench utilization
    const totalConsultants = await db
      .select({ count: sql`count(*)` })
      .from(userProfiles)
      .where(and(
        eq(userProfiles.orgId, currentOrgId),
        eq(userProfiles.employeeType, 'consultant')
      ));

    const benchConsultants = await db
      .select({ count: sql`count(*)` })
      .from(benchMetadata)
      .where(eq(benchMetadata.orgId, currentOrgId));

    const newBenchUtilization = (benchConsultants.count / totalConsultants.count) * 100;

    // Log bench metric improvement
    await db.insert(benchMetricsLog).values({
      orgId: currentOrgId,
      metricDate: new Date(),
      totalConsultants: totalConsultants.count,
      benchConsultants: benchConsultants.count - 1, // after placement
      benchUtilizationRate: newBenchUtilization,
      averageDaysOnBench: await calculateAverageDaysOnBench(),
      placementsThisPeriod: sql`placements_this_period + 1`,
      createdBy: currentUserId
    });
    ```

11. **Update Leaderboard:**
    ```typescript
    // Increment bench sales rep's placement count for current quarter
    await db.insert(benchSalesMetrics).values({
      benchSalesRepId: currentUserId,
      period: 'Q4-2024',
      placementsCount: sql`COALESCE((SELECT placements_count FROM bench_sales_metrics WHERE bench_sales_rep_id = ${currentUserId} AND period = 'Q4-2024'), 0) + 1`,
      revenue: sql`COALESCE((SELECT revenue FROM bench_sales_metrics WHERE bench_sales_rep_id = ${currentUserId} AND period = 'Q4-2024'), 0) + ${monthlyRevenue}`,
      benchDaysCleared: sql`COALESCE((SELECT bench_days_cleared FROM bench_sales_metrics WHERE bench_sales_rep_id = ${currentUserId} AND period = 'Q4-2024'), 0) + 42`,
      averageMargin: sql`COALESCE((SELECT average_margin FROM bench_sales_metrics WHERE bench_sales_rep_id = ${currentUserId} AND period = 'Q4-2024'), 0)`, // Recalculate
      updatedAt: new Date()
    }).onConflictDoUpdate({
      target: [benchSalesMetrics.benchSalesRepId, benchSalesMetrics.period],
      set: {
        placementsCount: sql`bench_sales_metrics.placements_count + 1`,
        revenue: sql`bench_sales_metrics.revenue + ${monthlyRevenue}`,
        benchDaysCleared: sql`bench_sales_metrics.bench_days_cleared + 42`,
        updatedAt: new Date()
      }
    });
    ```

12. **Send Notifications:**
    ```typescript
    // Notify HR Manager
    await sendNotification({
      userId: hrManagerId,
      type: 'bench_placement_created',
      title: 'Bench Placement - Subcontracting Setup Required',
      message: `${consultantName} placed at ${endClientName} via ${vendorName}. Start: ${startDate}. Subcontracting tasks assigned.`,
      link: `/employee/hr/placements/${placementId}`
    });

    // Notify Bench Sales Manager
    await sendNotification({
      userId: managerId,
      type: 'team_bench_placement',
      title: 'Team Bench Placement!',
      message: `${benchSalesRepName} placed ${consultantName} at ${endClientName}. 42 bench days cleared!`,
      link: `/employee/bench/placements/${placementId}`
    });

    // Notify CEO (for 30+ day bench placements)
    if (daysOnBench >= 30) {
      await sendNotification({
        userId: ceoId,
        type: 'urgent_bench_placement',
        title: 'Urgent Bench Placement Resolved!',
        message: `${consultantName} (${daysOnBench} days on bench) placed at ${endClientName}. Great work by ${benchSalesRepName}!`,
        link: `/employee/bench/placements/${placementId}`
      });
    }

    // Notify Immigration Team (if applicable)
    if (clientLetterRequired) {
      await sendNotification({
        userId: immigrationManagerId,
        type: 'immigration_action_required',
        title: 'Client Letter Required for Placement',
        message: `${consultantName} (${visaType}) placed at ${endClientName}. Client letter template generated. Review and send ASAP.`,
        link: `/employee/hr/immigration/${immigrationCaseId}`
      });
    }
    ```

13. **Send Congratulations Email to Consultant:**
    ```typescript
    await sendEmail({
      to: consultantEmail,
      subject: `🎉 Congratulations! New Placement at ${endClientName}`,
      template: 'consultant_bench_placement_congrats',
      data: {
        consultantName,
        endClientName,
        vendorName,
        jobTitle: externalJob.title,
        startDate,
        endDate,
        workLocation,
        payRate: consultantPayRate,
        benchSalesRepName,
        benchSalesRepPhone,
        benchSalesRepEmail,
        nextSteps: [
          'Review and sign subcontracting agreement',
          'Complete vendor portal setup',
          'Attend client orientation (details to follow)',
          'Submit timesheets weekly via vendor portal',
          'Contact your bench sales rep with any questions'
        ],
        daysOnBench: 42,
        encouragementMessage: 'Great news! After 42 days, you\'re back to doing what you do best. Let\'s make this a successful engagement!'
      }
    });
    ```

14. **Log Activity:**
    ```typescript
    await db.insert(activityLog).values({
      orgId: currentOrgId,
      entityType: 'bench_placement',
      entityId: placementId,
      activityType: 'bench_placement_created',
      description: `Bench placement created: ${consultantName} → ${vendorName} → ${endClientName} | Start: ${startDate} | ${daysOnBench} bench days cleared`,
      metadata: {
        consultantPayRate,
        inTimeBillRate,
        vendorBillRate,
        grossMargin,
        monthlyRevenue,
        commission: monthlyCommission,
        totalCommission,
        placementType,
        daysOnBench,
        benchUtilizationImprovement: '35% → 28%',
        visaType: consultantVisaType,
        clientLetterRequired
      },
      createdBy: currentUserId,
      createdAt: new Date()
    });
    ```

**Time:** ~5-7 seconds (backend processing + animation)

---

## Postconditions

1. ✅ New placement record created in `placements` table with `is_bench_placement = true`
2. ✅ Placement status = "active"
3. ✅ Bench submission status updated to "placed"
4. ✅ Consultant removed from bench (benchMetadata cleared or archived)
5. ✅ Consultant profile status updated to "placed"
6. ✅ Bench utilization metrics updated (improved)
7. ✅ Days on bench cleared for consultant (42 days → 0)
8. ✅ Subcontracting checklist created with 8 tasks assigned to HR
9. ✅ Client letter generated (if H1B/L1 consultant)
10. ✅ Immigration case updated with new client info
11. ✅ Commission calculated and stored
12. ✅ Sprint progress updated (+1 placement for current sprint)
13. ✅ Leaderboard updated (bench sales rep's placement count incremented)
14. ✅ Notifications sent to HR Manager, Bench Sales Manager, CEO (if urgent), Immigration Team
15. ✅ Congratulations email sent to consultant
16. ✅ Activity logged for audit trail
17. ✅ RCAI entry: Bench Sales Rep = Responsible + Accountable, HR = Consulted, Manager = Informed
18. ✅ Revenue recognized in current period

---

## Events Logged

| Event | Payload | Recipients |
|-------|---------|-----------|
| `bench_placement.created` | `{ placement_id, consultant_id, vendor_id, end_client_name, bench_sales_rep_id, consultant_pay_rate, intime_bill_rate, vendor_bill_rate, gross_margin, revenue, commission, days_on_bench_cleared, start_date, created_at }` | System |
| `bench_submission.placed` | `{ bench_submission_id, placement_id, updated_by }` | System |
| `consultant.placed` | `{ consultant_id, placement_id, vendor_id, days_on_bench: 42 }` | System |
| `bench.cleared` | `{ consultant_id, days_on_bench_cleared: 42, bench_sales_rep_id }` | System |
| `bench_utilization.improved` | `{ org_id, old_rate: 35%, new_rate: 28%, consultants_on_bench: -1 }` | System |
| `immigration.client_letter_required` | `{ placement_id, consultant_id, visa_type, client_name, immigration_case_id }` | Immigration Team |
| `subcontracting.initiated` | `{ placement_id, consultant_id, vendor_id, tasks_count: 8, assigned_to: hr_manager_id }` | HR Manager |
| `commission.calculated` | `{ placement_id, bench_sales_rep_id, commission_rate, monthly_commission, total_commission, tier }` | Bench Sales Rep, Finance |
| `sprint.progress_updated` | `{ pod_id, sprint_placements, target_placements, progress_percent: 100 }` | Bench Sales Rep, Manager |
| `leaderboard.updated` | `{ bench_sales_rep_id, quarter, placements_count, revenue, bench_days_cleared }` | All Bench Sales Reps |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Consultant Not on Bench | benchMetadata does not exist | "Cannot create bench placement: Consultant is not currently on bench" | Verify consultant status |
| Vendor Offer Not Accepted | Bench submission status ≠ "offered" | "Cannot create placement: Vendor offer has not been accepted yet" | Accept offer first |
| Missing InTime Bill Rate | InTime bill rate is null or 0 | "InTime bill rate is required to create placement" | Enter valid rate |
| Missing Consultant Pay Rate | Consultant pay rate is null or 0 | "Consultant pay rate is required to create placement" | Enter valid rate |
| Negative Margin | Consultant pay rate ≥ InTime bill rate | "⚠️ Warning: Negative or zero margin. This placement will result in a loss. Do you want to proceed?" | Adjust rates or confirm override |
| Missing Start Date | Start date is null | "Start date is required" | Select start date |
| Past Start Date | Start date < Today | "⚠️ Warning: Start date is in the past. Is this a backdated placement?" | Confirm or adjust date |
| End Date Before Start | End date ≤ Start date | "End date must be after start date" | Adjust end date |
| Visa Expired | Visa expiry < Start date | "⚠️ Error: Consultant's visa will be expired by start date. Cannot create placement." | Update visa or delay start |
| Visa Expiring Soon | Visa expiry < Start date + 180 days | "⚠️ Warning: Consultant's visa expires in <180 days. Immigration action may be required." | Notify immigration team |
| Duplicate Placement | Placement already exists for bench submission | "Placement already exists for this bench submission" | View existing placement |
| Immigration Case Invalid | H1B consultant but no active immigration case | "⚠️ Warning: No active immigration case found for H1B consultant. Create case first?" | Create immigration case |
| Permission Denied | User lacks "bench_placement.create" permission | "You don't have permission to create bench placements" | Contact Admin |
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

### A1: Create Placement from Bench Dashboard

**Trigger:** User is viewing bench dashboard, sees urgent consultant (30+ days)

**Flow:**
1. User clicks on consultant card in bench dashboard
2. Sees "Active Submissions" section
3. Clicks "Convert to Placement" on accepted offer
4. Placement modal opens (same as main flow Step 3)
5. Continue from Step 4 onwards

### A2: Backdate Placement (Past Start Date)

**Trigger:** Consultant already started working, bench sales rep needs to record placement retroactively

**Flow:**
1. User enters start date in the past
2. System shows warning: "⚠️ Start date is in the past. Is this a backdated placement?"
3. User clicks "Confirm Backdated Placement"
4. System prompts: "Reason for backdated placement?"
5. User enters reason (e.g., "Vendor notified late", "Paperwork delay", "System down")
6. System creates placement with `isBackdated = true` flag
7. Activity log records reason and backdated flag
8. Bench days cleared calculation uses actual start date
9. Continue normal flow

### A3: Multi-Currency Placement (International)

**Trigger:** Consultant in India, paid in INR, vendor in US, billed in USD

**Flow:**
1. User selects "INR" for consultant pay rate currency
2. User enters consultant pay rate: ₹5,000/hr (INR)
3. System prompts for exchange rate or uses current rate: 1 USD = 83 INR
4. User enters InTime bill rate in USD: $85/hr
5. System converts and shows margin calculation:
   - Consultant Pay: ₹5,000/hr = $60.24/hr (at 83 INR/USD)
   - InTime Bills: $85/hr
   - Markup: $24.76/hr
   - Gross Margin: 29.13%
6. Commission calculated on USD revenue
7. Placement record stores both currencies and exchange rate
8. Continue normal flow

### A4: H1B Transfer Required (New Consultant)

**Trigger:** Consultant is new hire (not yet on InTime's H1B), needs transfer

**Flow:**
1. User proceeds through placement creation
2. On Immigration step, system detects: "Consultant has H1B with previous employer"
3. System shows: "⚠️ H1B Transfer Required (3-6 months processing time)"
4. Options:
   - "Start immediately on current H1B (if allowed)" → Placement proceeds
   - "Wait for transfer approval" → Placement marked as "pending_immigration"
   - "Cancel and revisit later"
5. If "pending_immigration" selected:
   - Placement created with status = "pending_immigration"
   - Immigration case automatically created
   - H1B transfer petition task assigned to immigration team
   - Start date must be >3 months out
6. System monitors immigration case
7. When approved, placement auto-activates on start date

### A5: Placement with Client Letter Generation

**Trigger:** H1B consultant placement requires client letter for USCIS

**Flow:**
1. User proceeds through placement creation
2. On Immigration step, system auto-detects: "Client Letter Required"
3. User checks box: "Generate Client Letter Template"
4. System prompts for additional info:
   - Client supervisor name
   - Client supervisor title
   - Work location address (if not remote)
   - Job duties (auto-filled from external job description)
5. User reviews and confirms
6. On placement creation:
   - Client letter PDF auto-generated
   - Letter includes: consultant name, visa type, client name, work location, dates, job duties, supervisor info
   - Letter attached to immigration case
   - Immigration team notified to review and send
7. Continue normal flow

### A6: Placement Extension (Existing Placement)

**Trigger:** Vendor wants to extend consultant's contract

**Flow:**
1. User navigates to existing placement
2. Clicks "Extend Placement"
3. Modal opens: "Extend Bench Placement"
4. Current end date shown: 06/15/2025
5. New end date picker: 12/15/2025 (+6 months)
6. Rate verification:
   - "Same rates as original?" → Yes/No
   - If No, enter new rates
7. Extension reason: [Contract extended by client ▼]
8. Click "Extend Placement"
9. System:
   - Updates placement end date
   - Recalculates total revenue and commission
   - Creates activity log: "Placement extended"
   - Notifies HR and consultant
   - Updates immigration case (if H1B, check if LCA covers extension)
10. Extension recorded separately for metrics

---

## Rollback Scenarios

### Scenario 1: Consultant No-Show on Day 1

**What Happened:** Consultant doesn't show up on start date

**Actions:**
1. Bench Sales Rep navigates to placement detail
2. Clicks "Mark as Cancelled"
3. Selects reason: "Consultant No-Show"
4. System prompts: "Return consultant to bench?"
5. User clicks "Yes, Return to Bench"
6. System:
   - Updates placement status to "cancelled"
   - Re-creates benchMetadata record for consultant
   - Sets bench start date = original start date (not today, to track gap)
   - Days on bench calculation resumes from placement start date
   - Creates activity: "Consultant no-show follow-up"
   - Rolls back sprint progress (-1 placement)
   - Reverses commission accrual
   - Reopens bench submission (status = "cancelled")
   - Sends notification to HR (cancel subcontracting)
   - Sends notification to manager
   - Logs activity: "Placement cancelled - consultant no-show"

### Scenario 2: Vendor Cancels Before Start Date

**What Happened:** Vendor cancels requisition before consultant starts

**Actions:**
1. Bench Sales Rep receives cancellation notice from vendor
2. Navigates to placement detail
3. Clicks "Cancel Placement"
4. Selects reason: "Vendor Cancelled Requisition"
5. System prompts: "What do you want to do with consultant?"
6. Options:
   - "Return to bench" → Consultant goes back on bench
   - "Place with different vendor" → Create new submission
   - "Mark as unavailable" → Consultant not available
7. User selects "Return to bench"
8. System executes rollback:
   - Placement status → "cancelled"
   - Consultant status → "on_bench"
   - BenchMetadata re-created with original bench start date
   - Sprint progress rolled back
   - Commission reversed
   - Bench submission marked "cancelled"
9. Notifications sent to all stakeholders

### Scenario 3: Consultant Quits Early (Before End Date)

**What Happened:** Consultant quits mid-contract

**Actions:**
1. Bench Sales Rep navigates to placement detail
2. Clicks "End Placement Early"
3. Enters actual end date: 03/15/2025 (ended after 3 months of 6-month contract)
4. Selects reason: "Voluntary Resignation", "Terminated by Vendor", "Performance Issue", "Found Better Opportunity"
5. Additional notes: "Consultant found full-time role"
6. System prompts: "Return to bench or mark as unavailable?"
7. User selects: "Mark as Unavailable (Left Company)"
8. System:
   - Updates placement status to "ended_early"
   - Sets `actualEndDate` field = 03/15/2025
   - Calculates actual revenue (prorated): 3 months instead of 6
   - Adjusts commission: $897.60 × 3 = $2,692.80 (instead of $5,385.60)
   - Clawback calculation: $5,385.60 - $2,692.80 = $2,692.80
   - Updates consultant status: "unavailable" or "terminated"
   - Deletes benchMetadata (consultant no longer with company)
   - Logs activity: "Placement ended early - voluntary resignation"
   - Sends notification to Finance (adjust billing and commission)
   - Sends notification to HR (offboarding tasks)

### Scenario 4: Rate Correction Needed

**What Happened:** Bench Sales Rep entered wrong rate, needs correction

**Actions:**
1. Manager reviews placement, notices error
2. Navigates to placement detail
3. Clicks "Edit Placement" (requires manager approval)
4. Updates InTime bill rate: $85 → $90 (correct rate)
5. System recalculates:
   - Old margin: 23.53% → New margin: 27.78%
   - Old commission: $897.60/mo → New commission: $1,080/mo
6. Reason for change: "Vendor rate correction - confirmed via email"
7. Clicks "Save Changes"
8. System:
   - Updates placement record
   - Creates audit log: "Placement rate corrected by [Manager]"
   - Recalculates commission
   - Notifies Bench Sales Rep: "Placement rate corrected - commission updated"
   - Notifies Finance: "Rate correction for placement [ID]"

---

## Related Use Cases

- [02-manage-bench.md](./02-manage-bench.md) - Manage bench consultants before placement
- [03-market-consultant.md](./03-market-consultant.md) - Marketing consultants via hotlists
- [04-find-requirements.md](./04-find-requirements.md) - Finding external job opportunities
- [05-submit-bench-consultant.md](./05-submit-bench-consultant.md) - Submitting consultant to vendor
- [08-track-immigration.md](./08-track-immigration.md) - Immigration case tracking
- [09-schedule-interview.md](./09-schedule-interview.md) - Vendor interview coordination

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Create bench placement with all required fields | Placement created, all 18 postconditions met |
| TC-002 | Submit without InTime bill rate | Error: "InTime bill rate is required" |
| TC-003 | Submit with past start date | Warning: "Start date is in the past" + confirmation prompt |
| TC-004 | Submit with consultant pay rate > InTime rate | Error: "Negative margin" + override option |
| TC-005 | Submit with end date before start date | Error: "End date must be after start date" |
| TC-006 | Create placement for 6-month contract | Duration auto-calculated: 6 months, total commission calculated |
| TC-007 | Create placement with 25% margin | Commission tier 4 (7%), correct commission calculated |
| TC-008 | Create placement when sprint already has 0 | Sprint progress updates to 100%, celebration message |
| TC-009 | Create placement for consultant with 42 days on bench | Bench metrics updated: days cleared, utilization improved |
| TC-010 | Create placement for H1B consultant | Client letter required, immigration checklist created |
| TC-011 | Cancel placement mid-creation | Confirmation prompt, data not saved |
| TC-012 | Network error during creation | Retry button, data preserved |
| TC-013 | Create placement with InTime Rate = $85, Consultant Rate = $65 | Margin = 23.53%, Tier 3, Commission = 6%, Monthly = $897.60 |
| TC-014 | Click quick-set "6 mo" button | End date = start date + 6 months, duration shows "6 months" |
| TC-015 | Create placement when no active sprint | Warning: "No active sprint", placement created anyway |
| TC-016 | Create placement as non-bench-sales role | Permission denied error |
| TC-017 | Backdate placement with reason | Placement created with `isBackdated = true`, reason logged |
| TC-018 | Create second placement for same bench submission | Error: "Placement already exists for this bench submission" |
| TC-019 | Create placement for consultant not on bench | Error: "Consultant is not currently on bench" |
| TC-020 | Create placement with expired visa | Error: "Consultant's visa will be expired by start date" |
| TC-021 | Create placement for consultant with visa expiring in 120 days | Warning: "Visa expires in <180 days. Immigration action required." |
| TC-022 | Extend existing placement by 6 months | Placement end date updated, commission recalculated, notifications sent |
| TC-023 | Cancel placement (consultant no-show) | Consultant returned to bench, metrics rolled back, commission reversed |
| TC-024 | End placement early (3 of 6 months) | Commission prorated, clawback calculated, placement status = "ended_early" |

---

## UI/UX Specifications

### Celebration Animation Details

**Animation Sequence:**
1. **Confetti Burst** (2s):
   - 50 confetti pieces fall from top
   - Colors: Gold (#FFD700), Forest Green (#2D5016), Blue (#4A90E2)
   - Physics: Gravity + random rotation

2. **Success Card Slide-In** (500ms):
   - Card slides up from bottom with bounce easing
   - Background overlay: rgba(0,0,0,0.3)

3. **Metric Counter Animation** (1.5s):
   - Numbers count up from 0 to actual value
   - Easing: ease-out

4. **Sound Effect** (optional):
   - Success chime (if user has sound enabled)

### Rate Stack Visualization

**Visual Design:**
```
┌─────────────────────────────────────────┐
│ 💰 Rate Stack Breakdown                 │
├─────────────────────────────────────────┤
│                                         │
│  💵 Consultant Pay: $65.00/hr          │
│  ├─ What consultant receives            │
│  │                                      │
│  ➕ InTime Markup: +$20.00/hr          │
│  ├─ InTime's profit                    │
│  │                                      │
│  💰 InTime Bills Vendor: $85.00/hr     │
│  ├─ What vendor pays InTime            │
│  │                                      │
│  ➕ Vendor Markup: +$15.00/hr          │
│  ├─ Vendor's profit                    │
│  │                                      │
│  🏦 End Client Pays: $100.00/hr        │
│  └─ Total client cost                  │
│                                         │
│  InTime's Share:                        │
│  • $20/hr profit (23.53% margin)       │
│  • $14,960/month revenue                │
│  • Your commission: $897.60/month       │
│                                         │
└─────────────────────────────────────────┘
```

### Bench Impact Dashboard

**Visual Design:**
```
┌────────────────────────────────────────┐
│ 📊 Bench Impact Preview                │
├────────────────────────────────────────┤
│ Rajesh Kumar                           │
│ 🟠 42 days on bench → ✅ 0 days       │
│                                        │
│ Bench Utilization:                     │
│ Before: ████████████░░░░░░░░░░ 35%   │
│ After:  ████████░░░░░░░░░░░░░░ 28%   │
│ Change: -7% (GREAT!)                   │
│                                        │
│ Your Sprint:                           │
│ Target: 1 placement                    │
│ Actual: 1 placement ✅                │
│ Status: 🎯 TARGET ACHIEVED!           │
└────────────────────────────────────────┘
```

---

## Database Schema Reference

**Placements Table (Bench Placement Fields):**
```sql
CREATE TABLE placements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Standard associations
  submission_id UUID REFERENCES submissions(id),
  offer_id UUID REFERENCES offers(id),
  job_id UUID REFERENCES jobs(id),
  candidate_id UUID NOT NULL REFERENCES user_profiles(id),
  account_id UUID REFERENCES accounts(id),

  -- Bench-specific associations
  is_bench_placement BOOLEAN DEFAULT FALSE NOT NULL,
  bench_submission_id UUID REFERENCES bench_submissions(id),
  vendor_account_id UUID REFERENCES accounts(id), -- Prime vendor
  end_client_name TEXT, -- Ultimate client

  -- Placement details
  placement_type TEXT DEFAULT 'contract',
  start_date DATE NOT NULL,
  end_date DATE,

  -- Compensation (bench placements have 3-tier rate structure)
  consultant_pay_rate NUMERIC(10, 2), -- What consultant receives
  bill_rate NUMERIC(10, 2) NOT NULL, -- What InTime bills vendor (InTime revenue)
  vendor_bill_rate NUMERIC(10, 2), -- What vendor bills end client (informational)
  pay_rate NUMERIC(10, 2), -- For non-bench placements

  markup_percentage NUMERIC(5, 2), -- (bill_rate - consultant_pay_rate) / consultant_pay_rate
  gross_margin_percentage NUMERIC(5, 2), -- (bill_rate - consultant_pay_rate) / bill_rate
  currency TEXT DEFAULT 'USD',

  -- Status
  status TEXT NOT NULL DEFAULT 'active',
  end_reason TEXT,
  actual_end_date DATE,

  -- Bench tracking
  days_on_bench_cleared INTEGER, -- How many bench days this placement cleared
  bench_start_date DATE, -- When consultant went on bench (for historical tracking)

  -- Immigration
  client_letter_required BOOLEAN DEFAULT FALSE,
  client_letter_file_id UUID REFERENCES file_uploads(id),
  immigration_case_id UUID REFERENCES immigration_cases(id),

  -- Assignment
  recruiter_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Metadata
  is_backdated BOOLEAN DEFAULT FALSE,
  backdate_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);

-- Index for bench placements
CREATE INDEX idx_placements_bench ON placements(is_bench_placement) WHERE is_bench_placement = TRUE;
CREATE INDEX idx_placements_bench_submission ON placements(bench_submission_id);
CREATE INDEX idx_placements_vendor ON placements(vendor_account_id);
```

**BenchMetadata Table (Updated on Placement):**
```sql
CREATE TABLE bench_metadata (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Bench tracking
  bench_start_date DATE NOT NULL,
  days_on_bench INTEGER, -- Computed: CURRENT_DATE - bench_start_date

  -- Historical tracking
  last_placement_date DATE,
  total_placements INTEGER DEFAULT 0,
  total_bench_days INTEGER DEFAULT 0, -- Cumulative days on bench across all cycles

  -- ... other fields ...

  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- When placement is created, benchMetadata is either deleted (consultant placed)
-- or archived for historical tracking
```

---

## Commission Calculation Deep Dive

### Base Formula (Bench Sales)

```typescript
// Input
const consultantPayRate = 65.00; // $/hr - what consultant receives
const inTimeBillRate = 85.00;   // $/hr - what InTime bills vendor (InTime's revenue)
const vendorBillRate = 100.00;  // $/hr - what vendor bills end client (informational)
const hoursPerMonth = 176; // Standard: 40 hrs/week × 4.4 weeks

// Calculations
const markup = inTimeBillRate - consultantPayRate; // $20.00/hr
const markupPercentage = (markup / consultantPayRate) * 100; // 30.77%
const grossMargin = (markup / inTimeBillRate) * 100; // 23.53%
const monthlyRevenue = inTimeBillRate * hoursPerMonth; // $14,960
const monthlyMarkup = markup * hoursPerMonth; // $3,520

// Determine tier (bench sales tiers slightly higher than regular recruiting)
let tier = 1;
let commissionRate = 0.03;

if (grossMargin >= 30) { tier = 5; commissionRate = 0.08; } // 8%
else if (grossMargin >= 25) { tier = 4; commissionRate = 0.07; } // 7%
else if (grossMargin >= 20) { tier = 3; commissionRate = 0.06; } // 6%
else if (grossMargin >= 15) { tier = 2; commissionRate = 0.045; } // 4.5%

// Final commission
const monthlyCommission = monthlyRevenue * commissionRate; // $897.60
const durationMonths = 6;
const totalCommission = monthlyCommission * durationMonths; // $5,385.60
```

### Multi-Currency Conversion (International Placements)

For international placements with different currencies:

```typescript
// Example: Consultant in India (INR), Vendor in US (USD)
const consultantPayRateINR = 5000; // ₹5,000/hr
const exchangeRate = 83; // 1 USD = 83 INR
const consultantPayRateUSD = consultantPayRateINR / exchangeRate; // $60.24/hr

const inTimeBillRateUSD = 85.00; // $85/hr (vendor pays in USD)

// Calculate margin in USD
const markupUSD = inTimeBillRateUSD - consultantPayRateUSD; // $24.76/hr
const grossMargin = (markupUSD / inTimeBillRateUSD) * 100; // 29.13%

// Commission calculated on USD revenue (InTime's books in USD)
const monthlyRevenueUSD = inTimeBillRateUSD * 176; // $14,960
const commissionRate = 0.07; // Tier 4 (25-29.99%)
const monthlyCommissionUSD = monthlyRevenueUSD * commissionRate; // $1,047.20
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
const fullCommission = 5385.60; // 6 months × $897.60
const proratedCommission = (monthsWorked / originalMonths) * fullCommission; // $2,692.80
const clawback = fullCommission - proratedCommission; // $2,692.80 to be clawed back

// Commission is typically paid monthly, so clawback only applies to future months
// Months 1-3: Already paid $2,692.80 ✓
// Months 4-6: Not paid (would have been $2,692.80) → Clawback avoided
```

---

## Subcontracting Checklist Details

**Standard 8-Task Checklist for Bench Placements:**

| # | Task | Assigned To | Due Date | Priority | Description |
|---|------|------------|----------|----------|-------------|
| 1 | Subcontracting Agreement Signed | HR Manager | Start Date | Critical | Execute subcontracting agreement between InTime and vendor |
| 2 | Client Letter for H1B | Immigration Team | Start Date - 5 days | High | Generate and send client letter to consultant for USCIS compliance (if H1B/L1) |
| 3 | Vendor Portal Access Setup | HR Manager | Start Date - 3 days | Medium | Set up consultant access to vendor's timesheet/portal system |
| 4 | Timesheet Submission Process | Bench Sales Rep | Start Date | High | Train consultant on timesheet submission to vendor |
| 5 | Insurance Certificate | Finance/HR | Start Date - 7 days | Medium | Provide certificate of insurance to vendor (if required) |
| 6 | Background Check | HR Manager | Start Date - 10 days | Medium | Complete vendor-required background check (if not already done) |
| 7 | Client Onboarding Coordination | Bench Sales Rep | Start Date - 2 days | High | Coordinate consultant's onboarding with end client |
| 8 | First Week Check-in Call | Bench Sales Rep | Start Date + 7 days | High | Call consultant to ensure smooth first week, address any issues |

**Task Status Flow:**
```
pending → in_progress → completed
                     ↓
                  cancelled (if placement cancelled)
```

---

## Immigration Compliance Details

### Visa Types and Requirements

| Visa Type | Client Letter Required | LCA Required | Work Location Restrictions | Max Contract Duration |
|-----------|----------------------|--------------|---------------------------|----------------------|
| **H1B** | ✅ Yes (always) | ✅ Yes | Must match LCA location | As per H1B validity |
| **H1B Transfer** | ✅ Yes | ✅ Yes (new LCA) | Must match new LCA | As per new H1B |
| **L1** | ✅ Yes | ❌ No | Any US location | As per L1 validity |
| **TN** | ⚠️ Sometimes | ❌ No | Any US/Canada location | 3 years (renewable) |
| **Green Card** | ❌ No | ❌ No | Any US location | Unlimited |
| **Citizen** | ❌ No | ❌ No | Any US location | Unlimited |
| **OPT** | ⚠️ Sometimes | ❌ No | Any US location | As per EAD validity |

### Client Letter Template

**When Required:**
- H1B consultants working at end client location (always)
- L1 consultants working at end client location (always)
- TN consultants (if requested by USCIS)
- OPT consultants (if requested for STEM OPT reporting)

**Template Structure:**
```
[InTime Letterhead]

Date: [Date]

To Whom It May Concern:

This letter is to confirm that [Consultant Name], an employee of InTime Solutions Inc.,
will be working on assignment at [End Client Name] from [Start Date] to [End Date].

CONSULTANT DETAILS:
Name: [Full Name]
Title: [Job Title]
Work Location: [Full Address or "Remote - US Based"]
Supervisor: [Client Supervisor Name, Title]
Supervisor Contact: [Phone/Email]

JOB DUTIES:
[Detailed description of consultant's job duties, minimum 3-4 bullet points]
• [Duty 1]
• [Duty 2]
• [Duty 3]
• [Duty 4]

WORK SCHEDULE:
[Full-time/Part-time], [Hours per week], [Days of week]

COMPENSATION:
[Consultant will be paid by InTime Solutions Inc.]

This assignment is pursuant to a subcontracting agreement between InTime Solutions Inc.
and [Vendor Name], who has a direct contract with [End Client Name].

Should you have any questions, please contact:
[Immigration Manager Name]
[Title]
[Phone]
[Email]

Sincerely,

[Signature]
[Name, Title]
InTime Solutions Inc.
```

### LCA (Labor Condition Application) Tracking

**When Required:**
- New H1B consultants (initial LCA filed with H1B petition)
- H1B consultants changing work location (new LCA required if location not covered)
- H1B consultants changing job duties significantly

**System Tracking:**
- Each placement with H1B consultant checks: Does existing LCA cover this location?
- If no: Flag for immigration team to file new LCA
- LCA processing time: 7-10 business days
- Placement cannot start until LCA approved (if new LCA required)

---

*Last Updated: 2024-11-30*
*Document Version: 1.0*
*Author: InTime v3 Product Team*
*Status: Final*
