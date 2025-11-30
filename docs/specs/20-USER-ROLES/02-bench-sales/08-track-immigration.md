# Use Case: Track Immigration Status and Compliance

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-BENCH-007 |
| Actor | Bench Sales Recruiter |
| Goal | Monitor immigration status, track visa expirations, ensure compliance, coordinate with legal team |
| Frequency | Daily review + weekly deep-dive |
| Estimated Time | 10-15 minutes daily, 45 minutes weekly |
| Priority | CRITICAL (Legal/Compliance Risk) |
| Business Impact | Submission eligibility, placement viability, compliance violations = fines/legal risk |

---

## Preconditions

1. User is logged in as Bench Sales Recruiter
2. Consultants exist in system with immigration data
3. Immigration cases have been created and tracked
4. User has "immigration.view" and "immigration.update" permissions
5. Immigration attorney contacts are configured in system
6. Compliance rules engine is active

---

## Trigger

One of the following:
- Daily morning routine (checking expiration alerts)
- System alert: Visa expiring in 180/90/60/30 days
- New consultant onboarded (immigration intake)
- H1B transfer initiated for new placement
- Green card case update from attorney
- Client submission requires work authorization verification
- Manager requests compliance audit report

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Immigration Dashboard

**User Action:** Click "Immigration" tab in Bench workspace sidebar

**System Response:**
- Immigration Dashboard loads at `/employee/workspace/bench/immigration`
- Dashboard displays overview metrics and alert cards
- Real-time expiration tracking visible

**URL:** `/employee/workspace/bench/immigration`

**Screen State:**
```
+------------------------------------------------------------------+
|  Immigration Dashboard              [Export] [Settings ⚙] [⌘K]  |
+------------------------------------------------------------------+
| Immigration Status Overview                      Updated: 8:15am |
+------------------------------------------------------------------+
| ┌─────────────────┐ ┌─────────────────┐ ┌────────────────────┐  |
| │ Total Cases     │ │ Expiring Soon   │ │ Pending Actions    │  |
| │      43         │ │       8         │ │        12          │  |
| │ active cases    │ │ (next 90 days)  │ │    tasks overdue   │  |
| │                 │ │                 │ │                    │  |
| │ 12 H1B          │ │ 🔴 2 Critical   │ │ 5 Transfers        │  |
| │ 8 Green Card    │ │ 🟠 3 Urgent     │ │ 3 Renewals         │  |
| │ 15 EAD/OPT      │ │ 🟡 3 Monitor    │ │ 4 Document Updates │  |
| │ 5 L1            │ │                 │ │                    │  |
| │ 3 Other         │ │                 │ │                    │  |
| └─────────────────┘ └─────────────────┘ └────────────────────┘  |
+------------------------------------------------------------------+
| ┌─────────────────┐ ┌─────────────────┐ ┌────────────────────┐  |
| │ Compliance      │ │ This Month      │ │ Attorney Status    │  |
| │ ✓ 98% Compliant │ │ ✓ 3 Approved    │ │ Open Cases: 18     │  |
| │                 │ │ → 2 Filed       │ │ Pending Docs: 7    │  |
| │ ⚠ 1 Issue       │ │ ⏳ 4 Pending    │ │ Next Review: 12/5  │  |
| │ (EAD gap)       │ │ ❌ 0 Denied     │ │                    │  |
| └─────────────────┘ └─────────────────┘ └────────────────────┘  |
+------------------------------------------------------------------+
| Quick Actions:                                                    |
| [🔴 View Critical Cases] [📅 Expiration Calendar] [📄 Reports]   |
| [➕ Add Case] [👤 Attorney Portal] [📋 Compliance Audit]         |
+------------------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 2: Review Critical Expiration Alerts

**User Action:** Click "🔴 View Critical Cases" button

**System Response:**
- Filters to show only critical/urgent cases
- Sorted by expiration date (soonest first)
- Alert cards display with visual warnings

**Screen State:**
```
+------------------------------------------------------------------+
| Critical Immigration Cases (10)                    [Back to All] |
+------------------------------------------------------------------+
| Showing: Cases expiring in next 90 days                          |
| Sorted by: Expiration Date (Soonest First)                       |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 🔴 CRITICAL - EXPIRES IN 18 DAYS            [⋮ More Actions] │ |
| │                                                                │ |
| │ Rajesh Kumar                                                   │ |
| │ Java Full Stack Developer                                      │ |
| │                                                                │ |
| │ Immigration Status:                                            │ |
| │ 🛂 H1B (Current Employer: Meta)                                │ |
| │ 📅 Current I-797 Expiry: December 18, 2024 (18 days)          │ |
| │ 📄 Case Status: TRANSFER PENDING → InTime Corp                │ |
| │                                                                │ |
| │ Transfer Details:                                              │ |
| │ • Transfer Type: H1B Port (Premium Processing)                │ |
| │ • Filed Date: November 15, 2024                                │ |
| │ • Receipt #: EAC2412345678                                     │ |
| │ • Attorney: Sarah Chen, Fragomen                               │ |
| │ • Expected Approval: December 10-12, 2024                      │ |
| │                                                                │ |
| │ ⚠ COMPLIANCE RISK:                                             │ |
| │ • Current H1B expires BEFORE transfer approval expected!       │ |
| │ • Gap period: 6-8 days (Dec 18 - Dec 25)                       │ |
| │ • Consultant CANNOT work during gap                            │ |
| │ • Placement start date MUST be after approval                  │ |
| │                                                                │ |
| │ 📋 Pending Actions:                                            │ |
| │ • ⏳ Check premium processing status (Due: Dec 1)              │ |
| │ • ⏳ Coordinate with client on delayed start (Due: Dec 2)      │ |
| │ • ⏳ Request attorney expedite if no update by Dec 5           │ |
| │                                                                │ |
| │ Active Submissions Affected:                                   │ |
| │ • Capital One - Backend Engineer (ON HOLD - pending transfer)  │ |
| │                                                                │ |
| │ [View Full Case] [Update Status] [Contact Attorney] [Add Note]│ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 🔴 CRITICAL - EXPIRES IN 28 DAYS            [⋮ More Actions] │ |
| │                                                                │ |
| │ Priya Sharma                                                   │ |
| │ React Developer                                                │ |
| │                                                                │ |
| │ Immigration Status:                                            │ |
| │ 🛂 OPT/EAD (STEM Extension)                                    │ |
| │ 📅 EAD Expiry: December 28, 2024 (28 days)                     │ |
| │ 📄 Case Status: H1B CAP FILED (FY 2025 - Lottery Pending)     │ |
| │                                                                │ |
| │ H1B Cap Details:                                               │ |
| │ • Petition Type: H1B Cap-Subject (First-time)                 │ |
| │ • Filed Date: April 1, 2024                                    │ |
| │ • Lottery Result: SELECTED (June 2024)                         │ |
| │ • Receipt #: EAC2423456789                                     │ |
| │ • Attorney: Michael Wong, Berry Appleman                       │ |
| │ • RFE Received: November 20, 2024                              │ |
| │ • RFE Response Due: December 20, 2024                          │ |
| │ • Expected Approval: January 2025 (if RFE cleared)             │ |
| │                                                                │ |
| │ ⚠ COMPLIANCE RISK:                                             │ |
| │ • EAD expires Dec 28, H1B approval NOT expected until Jan      │ |
| │ • Cap-gap extension ONLY valid if H1B timely filed (✓ YES)    │ |
| │ • MUST respond to RFE by Dec 20 to maintain cap-gap           │ |
| │ • If RFE denied → work auth terminates immediately            │ |
| │                                                                │ |
| │ 📋 Pending Actions:                                            │ |
| │ • 🔴 URGENT: Attorney to submit RFE response (Due: Dec 20)    │ |
| │ • ⏳ Verify cap-gap eligibility with attorney (Due: Dec 3)     │ |
| │ • ⏳ Notify client of potential Jan start delay (Due: Dec 5)   │ |
| │                                                                │ |
| │ Active Submissions Affected:                                   │ |
| │ • Meta - Frontend Engineer (interview scheduled 12/3)          │ |
| │   ⚠ RISK: May need to postpone start date                     │ |
| │                                                                │ |
| │ [View Full Case] [Update Status] [Contact Attorney] [Add Note]│ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 🟠 URGENT - EXPIRES IN 62 DAYS             [⋮ More Actions]  │ |
| │                                                                │ |
| │ Juan Martinez                                                  │ |
| │ DevOps Engineer                                                │ |
| │                                                                │ |
| │ Immigration Status:                                            │ |
| │ 🛂 L1B (Intracompany Transfer)                                │ |
| │ 📅 Current L1B Expiry: January 30, 2025 (62 days)             │ |
| │ 📄 Case Status: RENEWAL IN PROGRESS                            │ |
| │                                                                │ |
| │ Renewal Details:                                               │ |
| │ • Renewal Type: L1B Extension (3rd year)                       │ |
| │ • Filed Date: October 15, 2024                                 │ |
| │ • Receipt #: EAC2410987654                                     │ |
| │ • Attorney: Lisa Park, Greenberg Traurig                       │ |
| │ • Processing Time: 3-5 months (Normal)                         │ |
| │ • Expected Approval: January 15-30, 2025                       │ |
| │                                                                │ |
| │ ℹ STATUS: ON TRACK                                             │ |
| │ • Renewal filed 105 days before expiry (✓ TIMELY)             │ |
| │ • No RFE received (good sign)                                  │ |
| │ • 240-day extension rule applies if pending on Jan 30          │ |
| │ • Can continue working while renewal pending                   │ |
| │                                                                │ |
| │ 📋 Pending Actions:                                            │ |
| │ • ✓ DONE: Renewal petition filed                              │ |
| │ • ⏳ Check case status weekly (Next: Dec 8)                    │ |
| │ • ⏳ Prepare for possible RFE (gather docs)                    │ |
| │                                                                │ |
| │ Active Submissions:                                            │ |
| │ • Amazon - DevOps Lead (client review)                         │ |
| │   ✓ Work authorization valid (240-day rule)                   │ |
| │                                                                │ |
| │ [View Full Case] [Update Status] [Contact Attorney] [Add Note]│ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ... 7 more cases (Aisha, Chen, David, etc.) ...                  |
+------------------------------------------------------------------+
```

**Time:** ~2 minutes to review all critical cases

---

### Step 3: Open Specific Immigration Case

**User Action:** Click "View Full Case" on Rajesh Kumar's H1B transfer case

**System Response:**
- Case detail modal slides in from right (400ms animation)
- Shows comprehensive immigration history and timeline
- Document repository visible

**Screen State:**
```
+------------------------------------------------------------------+
| Immigration Case: Rajesh Kumar                              [×] |
+------------------------------------------------------------------+
| [Case Info] [Timeline] [Documents] [Tasks] [Notes] [Compliance] |
+------------------------------------------------------------------+
|                                                                  |
| CURRENT STATUS                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 🛂 H1B Transfer (Port of Entry)                               │ |
| │ From: Meta Platforms Inc → To: InTime Corp                    │ |
| │                                                                │ |
| │ Current Status: TRANSFER PENDING (Premium Processing)         │ |
| │ Receipt #: EAC2412345678                                       │ |
| │ Filed Date: November 15, 2024 (15 days ago)                   │ |
| │ Attorney: Sarah Chen (Fragomen)                                │ |
| │                                                                │ |
| │ Timeline:                                                      │ |
| │ • Filed: Nov 15, 2024 ✓                                        │ |
| │ • Receipt Notice: Nov 18, 2024 ✓                               │ |
| │ • Premium Processing: 15 calendar days → Dec 3, 2024 (ETA)    │ |
| │ • Current H1B Expiry: Dec 18, 2024 (18 days)                   │ |
| │                                                                │ |
| │ 🔴 ALERT: 6-8 day gap between expiry and expected approval    │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                  |
| WORK AUTHORIZATION DETAILS                                       |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Current Valid Period:                                          │ |
| │ • Start Date: November 1, 2021 (Meta)                          │ |
| │ • End Date: December 18, 2024                                  │ |
| │ • Days Remaining: 18                                           │ |
| │                                                                │ |
| │ Job Title (approved): Software Engineer                        │ |
| │ SOC Code: 15-1132 (Software Developers, Applications)         │ |
| │ Prevailing Wage: $95,000/year                                  │ |
| │ Work Location: 1 Hacker Way, Menlo Park, CA 94025             │ |
| │                                                                │ |
| │ Transfer Details:                                              │ |
| │ • New Employer: InTime Corp                                    │ |
| │ • New Job Title: Senior Java Developer (same SOC code)        │ |
| │ • New Wage: $176,000/year ($85/hr × 2080)                      │ |
| │ • New Location: Remote (client sites as needed)                │ |
| │ • Requested Validity: Dec 19, 2024 - Nov 1, 2027 (3 years)    │ |
| │                                                                │ |
| │ Can Start Work: Only AFTER approval notice received            │ |
| │ Can Submit to Jobs: YES (with start date contingency)          │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                  |
| PASSPORT & TRAVEL                                                |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Passport:                                                      │ |
| │ • Country: India                                               │ |
| │ • Number: J1234567                                             │ |
| │ • Issue Date: May 15, 2018                                     │ |
| │ • Expiry Date: May 14, 2028 (3.4 years)                        │ |
| │                                                                │ |
| │ Current Visa Stamp:                                            │ |
| │ • Stamp Valid Until: June 30, 2025 (Meta employer)             │ |
| │ • ⚠ Visa stamp will need update for international travel      │ |
| │ • Can work in US with expired stamp + valid I-797              │ |
| │ • Travel Risk: Will need visa interview if traveling abroad    │ |
| │                                                                │ |
| │ Travel Advisory:                                               │ |
| │ ⚠ DO NOT TRAVEL until transfer approved                       │ |
| │ ⚠ If urgent travel needed, consult attorney first             │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                  |
| FUTURE IMMIGRATION PLANS                                         |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Green Card Status:                                             │ |
| │ • Interested: YES                                              │ |
| │ • Previous Sponsorship: NO (Meta did not sponsor)              │ |
| │ • Current Stage: None                                          │ |
| │                                                                │ |
| │ Eligibility Assessment:                                        │ |
| │ • EB2 or EB3 Eligible: YES (Bachelor's + 5 years exp)          │ |
| │ • Priority Date Estimate: If filed now → ~2026-2027 (India EB2)│ |
| │ • InTime Sponsorship: Available after 6 months employment      │ |
| │                                                                │ |
| │ H1B Extension Eligibility:                                     │ |
| │ • Current H1B: Year 4 of 6                                     │ |
| │ • Max-out Date: November 1, 2027 (without GC)                  │ |
| │ • Extensions beyond 6 years: Possible if GC filed (I-140)      │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                  |
| ATTORNEY INFORMATION                                             |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Primary Attorney: Sarah Chen                                   │ |
| │ Law Firm: Fragomen, Del Rey, Bernsen & Loewy, LLP             │ |
| │ Email: sarah.chen@fragomen.com                                 │ |
| │ Phone: (650) 555-0123                                          │ |
| │                                                                │ |
| │ Case Manager: Jennifer Lee                                     │ |
| │ Email: jennifer.lee@fragomen.com                               │ |
| │ Phone: (650) 555-0124                                          │ |
| │                                                                │ |
| │ Last Contact: November 27, 2024 (3 days ago)                   │ |
| │ Subject: Premium processing status update                      │ |
| │ Next Check-in: December 3, 2024 (3 days)                       │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                  |
| [Update Status] [Add Note] [Upload Document] [Schedule Call]    |
| [Email Attorney] [Create Task] [Run Compliance Check]            |
+------------------------------------------------------------------+
```

**Time:** ~1 second to load

---

### Step 4: Review Immigration Timeline

**User Action:** Click "Timeline" tab

**System Response:**
- Shows chronological history of all immigration events
- Visual timeline with milestones and status changes

**Screen State:**
```
+------------------------------------------------------------------+
| Immigration Timeline: Rajesh Kumar                          [×] |
+------------------------------------------------------------------+
| [Case Info] [● Timeline] [Documents] [Tasks] [Notes] [Compliance]|
+------------------------------------------------------------------+
|                                                                  |
| IMMIGRATION HISTORY (Most Recent First)                          |
|                                                                  |
| 🔵 November 27, 2024 - 3 days ago                                |
| └─ Attorney Update                                               |
|    Sarah Chen provided premium processing status update          |
|    Status: "Case still pending at USCIS. Expected decision       |
|    by Dec 3 based on 15-day premium timeline."                   |
|                                                                  |
| 🔵 November 18, 2024 - 12 days ago                               |
| └─ Receipt Notice Received                                       |
|    I-797C Notice of Action received from USCIS                   |
|    Receipt #: EAC2412345678                                      |
|    📄 Document: I-797C_Receipt_Notice.pdf                        |
|                                                                  |
| 🔵 November 15, 2024 - 15 days ago                               |
| └─ H1B Transfer Petition Filed                                   |
|    Transfer petition filed with premium processing               |
|    From: Meta Platforms → To: InTime Corp                        |
|    Attorney: Fragomen (Sarah Chen)                               |
|    📄 Documents: I-129_Petition.pdf, LCA_Certified.pdf           |
|                                                                  |
| 🔵 November 10, 2024 - 20 days ago                               |
| └─ Transfer Documentation Completed                              |
|    All required docs collected and submitted to attorney:        |
|    ✓ Current I-797 approval notice                               |
|    ✓ Recent paystubs (last 3 months)                             |
|    ✓ W-2 forms (2023, 2022, 2021)                                |
|    ✓ Resume and job description                                  |
|    ✓ Degree certificates                                         |
|                                                                  |
| 🔵 November 1, 2024 - 29 days ago                                |
| └─ Placement Confirmed at Capital One                            |
|    Offer accepted: Backend Engineer role                         |
|    Start Date: TBD (contingent on H1B transfer approval)         |
|    Bill Rate: $120/hr                                            |
|    Triggered H1B transfer process                                |
|                                                                  |
| 🔵 October 25, 2024 - 36 days ago                                |
| └─ Last Day at Meta                                              |
|    Employment with Meta ended (voluntary)                        |
|    Joined InTime bench for new opportunities                     |
|    H1B still valid until Dec 18, 2024                            |
|                                                                  |
| ⚪ April 15, 2022 - 2.6 years ago                                |
| └─ H1B Extension Approved                                        |
|    3-year extension granted (Nov 1, 2021 - Dec 18, 2024)         |
|    Employer: Meta Platforms Inc                                  |
|    Receipt #: EAC2209876543                                      |
|                                                                  |
| ⚪ November 1, 2021 - 3.1 years ago                              |
| └─ Initial H1B Approved                                          |
|    First H1B approval (Cap-exempt: Master's cap)                 |
|    Employer: Meta Platforms Inc                                  |
|    Valid: Nov 1, 2021 - Oct 31, 2024                             |
|    Lottery Year: FY 2022                                         |
|                                                                  |
| ⚪ August 15, 2018 - 6.3 years ago                               |
| └─ Entered US on F-1 Student Visa                                |
|    Started Master's in Computer Science                          |
|    University: Stanford University                               |
|    Program: MS CS (Graduated May 2020)                           |
|                                                                  |
+------------------------------------------------------------------+
| [Export Timeline] [Add Event] [Back to Case]                     |
+------------------------------------------------------------------+
```

**Time:** ~30 seconds to review

---

### Step 5: Review Case Documents

**User Action:** Click "Documents" tab

**System Response:**
- Shows document repository with folders by case type
- Color-coded by document status (current, expired, pending)

**Screen State:**
```
+------------------------------------------------------------------+
| Immigration Documents: Rajesh Kumar                         [×] |
+------------------------------------------------------------------+
| [Case Info] [Timeline] [● Documents] [Tasks] [Notes] [Compliance]|
+------------------------------------------------------------------+
| [📤 Upload] [📁 Create Folder] [🔍 Search Docs]                  |
+------------------------------------------------------------------+
|                                                                  |
| 📁 CURRENT H1B (Meta) - EXPIRES DEC 18, 2024                     |
| ├─ 📄 I-797_Approval_Notice_2022.pdf (Uploaded: Apr 20, 2022)  |
| ├─ 📄 I-129_Petition_Extension.pdf (Uploaded: Apr 20, 2022)    |
| ├─ 📄 LCA_Meta_2022.pdf (Uploaded: Mar 10, 2022)               |
| └─ 📄 Paystubs_Meta_Oct2024.pdf (Uploaded: Nov 5, 2024)        |
|    [View] [Download] [Share] [Delete]                           |
|                                                                  |
| 📁 H1B TRANSFER (InTime) - PENDING                               |
| ├─ 📄 I-797C_Receipt_Notice.pdf (Uploaded: Nov 18, 2024)       |
| ├─ 📄 I-129_Transfer_Petition.pdf (Uploaded: Nov 15, 2024)     |
| ├─ 📄 LCA_InTime_Certified.pdf (Uploaded: Nov 15, 2024)        |
| ├─ 📄 Job_Offer_Letter_InTime.pdf (Uploaded: Nov 10, 2024)     |
| ├─ 📄 Support_Letter_InTime.pdf (Uploaded: Nov 10, 2024)       |
| └─ 📄 W2_Forms_2021_2023.pdf (Uploaded: Nov 10, 2024)          |
|    [View] [Download] [Share] [Delete]                           |
|                                                                  |
| 📁 INITIAL H1B (Meta) - EXPIRED OCT 31, 2024                     |
| ├─ 📄 I-797_Initial_Approval_2021.pdf (Uploaded: Nov 5, 2021)  |
| ├─ 📄 I-129_Initial_Petition.pdf (Uploaded: Nov 5, 2021)       |
| ├─ 📄 H1B_Visa_Stamp.pdf (Uploaded: Jul 15, 2021)              |
| └─ 📄 LCA_Meta_2021.pdf (Uploaded: Oct 1, 2021)                |
|    [View] [Download] [Share] [Delete]                           |
|                                                                  |
| 📁 PASSPORT & TRAVEL                                             |
| ├─ 📄 Passport_India_J1234567.pdf (Uploaded: Nov 1, 2024)      |
| │  Valid: May 14, 2028 (3.4 years) ✓                            |
| ├─ 📄 I-94_Travel_History.pdf (Uploaded: Nov 1, 2024)          |
| └─ 📄 DS-160_Confirmation.pdf (Uploaded: Jun 10, 2021)         |
|    [View] [Download] [Share] [Delete]                           |
|                                                                  |
| 📁 EDUCATION & CREDENTIALS                                       |
| ├─ 📄 Masters_Degree_Stanford.pdf (Uploaded: May 20, 2020)     |
| ├─ 📄 Bachelors_Degree_IIT_Delhi.pdf (Uploaded: May 15, 2018)  |
| ├─ 📄 Transcripts_Stanford.pdf (Uploaded: May 20, 2020)        |
| └─ 📄 Credential_Evaluation_WES.pdf (Uploaded: Aug 1, 2018)    |
|    [View] [Download] [Share] [Delete]                           |
|                                                                  |
| 📁 OPT/EAD (F-1 Student) - EXPIRED                               |
| ├─ 📄 EAD_Card_F1_OPT.pdf (Uploaded: Jun 1, 2020)              |
| │  Valid: Jun 1, 2020 - May 31, 2021 (Expired) ❌               |
| └─ 📄 I-20_Stanford.pdf (Uploaded: Aug 10, 2018)               |
|    [View] [Download] [Share] [Delete]                           |
|                                                                  |
| 📁 ATTORNEY CORRESPONDENCE                                       |
| ├─ 📧 Email_Nov27_Status_Update.pdf (Uploaded: Nov 27, 2024)   |
| ├─ 📧 Email_Nov18_Receipt_Confirmation.pdf (Nov 18, 2024)      |
| └─ 📧 Email_Nov10_Transfer_Kickoff.pdf (Uploaded: Nov 10, 2024)|
|    [View] [Download] [Share] [Delete]                           |
|                                                                  |
+------------------------------------------------------------------+
| Storage: 42 MB / 500 MB                         [Manage Storage] |
+------------------------------------------------------------------+
```

**Time:** ~20 seconds to browse

---

### Step 6: Check Pending Tasks

**User Action:** Click "Tasks" tab

**System Response:**
- Shows all open immigration-related tasks
- Sorted by due date with priority indicators

**Screen State:**
```
+------------------------------------------------------------------+
| Immigration Tasks: Rajesh Kumar                             [×] |
+------------------------------------------------------------------+
| [Case Info] [Timeline] [Documents] [● Tasks] [Notes] [Compliance]|
+------------------------------------------------------------------+
| [➕ Add Task] [✓ Mark Complete] [📅 Reschedule]                  |
+------------------------------------------------------------------+
| Showing: 5 open tasks | Completed: 8 tasks                        |
+------------------------------------------------------------------+
|                                                                  |
| 🔴 OVERDUE (1)                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ☐ Check premium processing status with attorney               │ |
| │ Due: December 1, 2024 (Yesterday!)                             │ |
| │ Assigned: You                                                  │ |
| │ Priority: HIGH                                                 │ |
| │ Description: Contact Sarah Chen for case status update.        │ |
| │              Expected decision by Dec 3.                       │ |
| │ [Mark Done] [Reschedule] [Add Note]                            │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                  |
| 🟠 DUE SOON (2)                                                  |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ☐ Coordinate with Capital One on delayed start date           │ |
| │ Due: December 2, 2024 (Tomorrow)                               │ |
| │ Assigned: You                                                  │ |
| │ Priority: HIGH                                                 │ |
| │ Description: Inform client of potential 6-8 day delay due      │ |
| │              to H1B transfer gap. Propose Jan 2 start.         │ |
| │ Related Submission: Capital One - Backend Engineer             │ |
| │ [Mark Done] [Reschedule] [Add Note]                            │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                  |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ☐ Verify consultant NOT working during gap period             │ |
| │ Due: December 3, 2024 (2 days)                                 │ |
| │ Assigned: You + HR Compliance                                  │ |
| │ Priority: CRITICAL                                             │ |
| │ Description: Ensure Rajesh does not perform ANY work between   │ |
| │              Dec 18 (expiry) and approval date. Compliance!    │ |
| │ Compliance Rule: 8 CFR 214.2(h) - Unauthorized work = visa void|
| │ [Mark Done] [Reschedule] [Add Note]                            │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                  |
| 🟡 UPCOMING (2)                                                  |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ☐ Request attorney expedite if no update by Dec 5             │ |
| │ Due: December 5, 2024 (4 days)                                 │ |
| │ Assigned: You                                                  │ |
| │ Priority: MEDIUM                                               │ |
| │ Description: If premium processing exceeds 15 days, request    │ |
| │              expedite service or escalate to senior attorney.  │ |
| │ [Mark Done] [Reschedule] [Add Note]                            │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                  |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ☐ Schedule Green Card eligibility consultation                │ |
| │ Due: December 15, 2024 (14 days)                               │ |
| │ Assigned: You + Attorney                                       │ |
| │ Priority: LOW                                                  │ |
| │ Description: After H1B transfer approved, schedule call to     │ |
| │              discuss EB2/EB3 Green Card sponsorship timeline.  │ |
| │ [Mark Done] [Reschedule] [Add Note]                            │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                  |
| ✓ COMPLETED (8) - [Show Completed]                               |
|                                                                  |
+------------------------------------------------------------------+
```

**Time:** ~30 seconds to review tasks

---

### Step 7: Update Case Status

**User Action:** Click "Update Status" button (back on Case Info tab)

**System Response:**
- Status update modal opens
- Dropdown shows possible status transitions
- Note field for details

**Screen State:**
```
+------------------------------------------------------------------+
|                    Update Immigration Status                     |
|                                                              [×] |
+------------------------------------------------------------------+
|                                                                  |
| Case: Rajesh Kumar - H1B Transfer                                |
| Current Status: TRANSFER PENDING                                 |
|                                                                  |
| New Status *                                                     |
| [Select new status...                                       ▼]  |
| ──────────────────────────────────────────────────────────────  |
| • Transfer Pending (Current)                                     |
| • RFE Received                                                   |
| • RFE Response Submitted                                         |
| • Approved                                                       |
| • Denied                                                         |
| • Withdrawn                                                      |
| • On Hold                                                        |
| ──────────────────────────────────────────────────────────────  |
|                                                                  |
| Status Date *                                                    |
| [12/02/2024                                            📅]      |
|                                                                  |
| Case Notes                                                       |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Spoke with attorney Sarah Chen today. Premium processing      │ |
| │ timeline is on track. Expecting decision by Dec 3.            │ |
| │ No RFE anticipated based on strong documentation.             │ |
| │ Coordinating with Capital One to delay start to Jan 2.        │ |
| │                                                                │ |
| │                                                                │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                  |
| Notify Users                                                     |
| ☑ Consultant (Rajesh Kumar)                                      |
| ☑ Attorney (Sarah Chen)                                          |
| ☑ HR Compliance                                                  |
| ☐ Manager                                                        |
|                                                                  |
| Attach Documents (Optional)                                      |
| [📤 Upload Files]                                                |
|                                                                  |
| ──────────────────────────────────────────────────────────────  |
|                                   [Cancel]  [Update Status]      |
+------------------------------------------------------------------+
```

**Time:** ~30 seconds to fill

**User Action:** User types notes and clicks "Update Status"

**System Response:**
- Saves status update to case timeline
- Sends notifications to selected users
- Creates activity log entry
- Updates case card on dashboard

**Time:** ~2 seconds

---

### Step 8: Return to Dashboard and View Expiration Calendar

**User Action:** Click "Back to Dashboard", then click "📅 Expiration Calendar"

**System Response:**
- Calendar view loads showing all upcoming expirations
- Color-coded by urgency level
- Hover shows case details

**Screen State:**
```
+------------------------------------------------------------------+
| Immigration Expiration Calendar                   [Back] [Print] |
+------------------------------------------------------------------+
| [Month View] [Week View] [List View]            December 2024    |
+------------------------------------------------------------------+
| [←] [December 2024] [→]                                          |
+------------------------------------------------------------------+
| Sun    Mon    Tue    Wed    Thu    Fri    Sat                    |
+------------------------------------------------------------------+
|        1      2      3      4      5      6      7               |
|                      🟠                                          |
|                      H1B                                         |
|                      Approval                                    |
|                      Expected                                    |
|                      (Rajesh)                                    |
|                                                                  |
| 8      9      10     11     12     13     14                     |
|                                                                  |
|                                                                  |
|                                                                  |
| 15     16     17     18     19     20     21                     |
|                      🔴          🔴                              |
|                      EXPIRY      RFE Due                         |
|                      H1B         (Priya)                         |
|                      (Rajesh)                                    |
|                                                                  |
| 22     23     24     25     26     27     28                     |
|                                              🔴                  |
|                                              EXPIRY              |
|                                              EAD                 |
|                                              (Priya)             |
|                                                                  |
| 29     30     31                                                 |
|             🟠                                                   |
|             L1B                                                  |
|             Expires                                              |
|             (Juan)                                               |
+------------------------------------------------------------------+
| [January 2025] →                                                 |
+------------------------------------------------------------------+
| Sun    Mon    Tue    Wed    Thu    Fri    Sat                    |
+------------------------------------------------------------------+
|              1      2      3      4      5                       |
|                                                                  |
|                                                                  |
| 5      6      7      8      9      10     11                     |
|                                                                  |
| 12     13     14     15     16     17     18                     |
|              🟢                                                  |
|              GC I-140                                            |
|              Decision                                            |
|              (Aisha)                                             |
|                                                                  |
| 19     20     21     22     23     24     25                     |
|                                                                  |
|                                                                  |
| 26     27     28     29     30     31                            |
|                      🟠          🟠                              |
|                      L1B         EAD                             |
|                      Expected    Expires                         |
|                      Approval    (Chen)                          |
|                      (Juan)                                      |
+------------------------------------------------------------------+
| Legend:                                                           |
| 🔴 Critical (0-30 days) | 🟠 Urgent (31-90 days) | 🟢 Monitor    |
+------------------------------------------------------------------+
```

**Time:** ~1 second to load

---

### Step 9: Generate Compliance Report

**User Action:** Click "Back to Dashboard", then click "📋 Compliance Audit"

**System Response:**
- Compliance report modal opens
- Real-time compliance check runs
- Issues flagged with severity

**Screen State:**
```
+------------------------------------------------------------------+
|                  Immigration Compliance Audit                    |
|                                                              [×] |
+------------------------------------------------------------------+
| Report Date: December 2, 2024                                    |
| Auditor: System (Automated) + You (Manual Review)                |
| Consultants Reviewed: 43 active cases                            |
+------------------------------------------------------------------+
|                                                                  |
| COMPLIANCE SUMMARY                                               |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Overall Status: 98% COMPLIANT (42/43 cases)                   │ |
| │                                                                │ |
| │ ✓ 42 Compliant Cases                                          │ |
| │ ⚠ 1 Issue Requiring Attention                                 │ |
| │ ❌ 0 Critical Violations                                       │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                  |
| COMPLIANCE CHECKS PERFORMED                                      |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ✓ Work Authorization Validity (43/43)                         │ |
| │   All consultants have valid or pending work auth             │ |
| │                                                                │ |
| │ ✓ I-9 Forms Current (42/43)                                   │ |
| │   1 form expiring in 15 days (auto-reverification scheduled)  │ |
| │                                                                │ |
| │ ✓ LCA Compliance (40/40)                                      │ |
| │   All H1B consultants working at LCA-approved locations       │ |
| │   Pay rates meet or exceed prevailing wage                    │ |
| │                                                                │ |
| │ ✓ Timely Extensions Filed (8/8)                               │ |
| │   All extensions filed >180 days before expiry                │ |
| │                                                                │ |
| │ ⚠ Work Authorization Gaps (1 issue)                           │ |
| │   Rajesh Kumar: 6-8 day gap projected (Dec 18-25)             │ |
| │   Mitigation: No work scheduled during gap period             │ |
| │   Status: MONITORING                                           │ |
| │                                                                │ |
| │ ✓ Attorney Engagement (18/18 active cases)                    │ |
| │   All pending cases have assigned attorney                    │ |
| │                                                                │ |
| │ ✓ Document Retention (43/43)                                  │ |
| │   All required docs on file and current                       │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                  |
| ISSUES REQUIRING ATTENTION                                       |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ⚠ Issue #1: Projected Work Authorization Gap                  │ |
| │ Consultant: Rajesh Kumar                                       │ |
| │ Case Type: H1B Transfer                                        │ |
| │ Severity: MEDIUM (mitigated)                                   │ |
| │                                                                │ |
| │ Details:                                                       │ |
| │ • Current H1B expires: Dec 18, 2024                            │ |
| │ • Transfer approval expected: Dec 3-25, 2024                   │ |
| │ • Potential gap: 6-8 days if approval delayed                 │ |
| │                                                                │ |
| │ Mitigation Plan:                                               │ |
| │ ✓ No work scheduled during potential gap                      │ |
| │ ✓ Premium processing filed (15-day timeline)                  │ |
| │ ✓ Client notified of potential start date delay               │ |
| │ ✓ Compliance team monitoring daily                            │ |
| │                                                                │ |
| │ Compliance Rule:                                               │ |
| │ 8 CFR 214.2(h)(13)(iii)(A) - Portability rule does NOT        │ |
| │ extend work auth beyond I-797 expiry. Consultant MUST stop    │ |
| │ work if gap occurs.                                            │ |
| │                                                                │ |
| │ Next Review: December 3, 2024 (premium decision expected)      │ |
| │ [View Case] [Mark Resolved] [Escalate to Legal]               │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                  |
| UPCOMING COMPLIANCE MILESTONES                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Dec 18: H1B expiry (Rajesh) - work authorization ends         │ |
| │ Dec 20: RFE response due (Priya) - must file to maintain gap  │ |
| │ Dec 28: EAD expiry (Priya) - cap-gap applies if H1B pending   │ |
| │ Jan 30: L1B expiry (Juan) - 240-day rule applies if pending   │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                  |
| COMPLIANCE METRICS (Last 90 Days)                                |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ • 0 instances of unauthorized work                            │ |
| │ • 0 missed filing deadlines                                   │ |
| │ • 0 RFE requests (good documentation quality)                 │ |
| │ • 3 approvals (100% approval rate)                            │ |
| │ • 0 denials                                                    │ |
| │ • Average processing time: 42 days (H1B transfers)            │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                  |
| [Export Report PDF] [Email to Manager] [Schedule Review Call]    |
+------------------------------------------------------------------+
```

**Time:** ~3 seconds to generate report

---

### Step 10: Add New Immigration Case (Optional Flow)

**User Action:** Click "➕ Add Case" from dashboard

**System Response:**
- New case creation wizard opens
- Step 1: Select consultant and case type

**Screen State:**
```
+------------------------------------------------------------------+
|                     Add Immigration Case                         |
|                                                              [×] |
+------------------------------------------------------------------+
| Step 1 of 3: Basic Information                                   |
|                                                                  |
| Consultant *                                                     |
| [Search consultants...                                      🔍] |
|                                                                  |
| Case Type *                                                      |
| [Select case type...                                        ▼]  |
| ──────────────────────────────────────────────────────────────  |
| H1B (Initial, Transfer, Extension, Amendment)                   |
| Green Card (PERM, I-140, I-485)                                  |
| OPT/CPT (F-1 Student Work Auth)                                  |
| EAD (Employment Authorization Document)                          |
| L1 (Intracompany Transfer)                                       |
| TN (Canadian/Mexican)                                            |
| O1 (Extraordinary Ability)                                       |
| E2 (Treaty Investor)                                             |
| Other (Custom)                                                   |
| ──────────────────────────────────────────────────────────────  |
|                                                                  |
| Case Sub-Type *                                                  |
| (Appears after selecting Case Type)                              |
|                                                                  |
| Filing Date *                                                    |
| [MM/DD/YYYY                                            📅]      |
|                                                                  |
| Attorney/Law Firm                                                |
| [Select attorney...                                         ▼]  |
| ──────────────────────────────────────────────────────────────  |
| Sarah Chen - Fragomen                                            |
| Michael Wong - Berry Appleman                                    |
| Lisa Park - Greenberg Traurig                                    |
| [+ Add New Attorney]                                             |
| ──────────────────────────────────────────────────────────────  |
|                                                                  |
| ──────────────────────────────────────────────────────────────  |
|                              [Cancel]  [Next: Details →]         |
+------------------------------------------------------------------+
```

**Field Specification: Case Type**

| Property | Value |
|----------|-------|
| Field Name | `caseType` |
| Type | Dropdown |
| Required | Yes |
| Options | H1B, Green Card, OPT/CPT, EAD, L1, TN, O1, E2, Other |
| Behavior | Sub-type dropdown appears based on selection |

**Time:** ~1 minute to fill Step 1

**User Action:** Select "H1B" → "Transfer" → Fill details → Click "Next: Details →"

**System Response:**
- Step 2: Petition details

**Screen State (Step 2):**
```
+------------------------------------------------------------------+
|                     Add Immigration Case                         |
|                                                              [×] |
+------------------------------------------------------------------+
| Step 2 of 3: H1B Transfer Details                                |
|                                                                  |
| Transfer From (Previous Employer) *                              |
| [Company name...                                            ]   |
|                                                                  |
| Transfer To (New Employer) *                                     |
| [InTime Corp                                                ] ✓ |
| (Auto-filled)                                                    |
|                                                                  |
| Receipt Number (I-797C)                                          |
| [EAC-                                                       ]   |
|                                                                  |
| Previous I-797 Expiry Date *                                     |
| [MM/DD/YYYY                                            📅]      |
|                                                                  |
| Requested Validity Period                                        |
| Start: [MM/DD/YYYY                                     📅]      |
| End:   [MM/DD/YYYY                                     📅]      |
|                                                                  |
| Premium Processing                                               |
| ☑ Yes (15 calendar days) - Recommended                           |
| ☐ No (3-5 months standard)                                       |
|                                                                  |
| Job Title (LCA) *                                                |
| [Senior Java Developer                                      ]   |
|                                                                  |
| SOC Code *                                                       |
| [15-1132                                                    ] 🔍 |
| Software Developers, Applications                                |
|                                                                  |
| Annual Salary *                                                  |
| $ [176,000                                                  ]   |
| /year                                                            |
|                                                                  |
| Work Location *                                                  |
| [Remote (Multiple client sites)                             ]   |
| [+ Add Additional Locations]                                     |
|                                                                  |
| ──────────────────────────────────────────────────────────────  |
|                         [← Back]  [Cancel]  [Next: Docs →]      |
+------------------------------------------------------------------+
```

**Time:** ~2 minutes to fill Step 2

**User Action:** Fill all fields → Click "Next: Docs →"

**System Response:**
- Step 3: Document upload and final confirmation

**Screen State (Step 3):**
```
+------------------------------------------------------------------+
|                     Add Immigration Case                         |
|                                                              [×] |
+------------------------------------------------------------------+
| Step 3 of 3: Documents & Confirmation                            |
|                                                                  |
| Required Documents:                                              |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ✓ Current I-797 Approval Notice                    [Uploaded] │ |
| │ ⏳ Passport Copy                                    [Upload]   │ |
| │ ⏳ Recent Paystubs (last 3 months)                  [Upload]   │ |
| │ ⏳ Resume                                            [Upload]   │ |
| │ ⏳ Job Description                                   [Upload]   │ |
| │ ⏳ Degree Certificates                               [Upload]   │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                  |
| Optional Documents:                                              |
| • Previous petitions (I-129)                                     |
| • W-2 forms                                                      |
| • I-94 Travel History                                            |
|                                                                  |
| [📤 Upload Multiple Files]                                       |
|                                                                  |
| ──────────────────────────────────────────────────────────────  |
| Case Summary:                                                    |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Consultant: Rajesh Kumar                                       │ |
| │ Case Type: H1B Transfer (Premium Processing)                  │ |
| │ From: Meta Platforms → To: InTime Corp                        │ |
| │ Filed: November 15, 2024                                       │ |
| │ Attorney: Sarah Chen (Fragomen)                                │ |
| │ Receipt #: EAC2412345678                                       │ |
| │ Current I-797 Expiry: December 18, 2024                        │ |
| │ Expected Decision: December 3, 2024 (15 days)                  │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                  |
| Notifications:                                                   |
| ☑ Notify consultant (Rajesh Kumar)                               |
| ☑ Notify attorney (Sarah Chen)                                   |
| ☑ Notify HR Compliance                                           |
| ☐ Notify manager                                                 |
|                                                                  |
| Auto-Create Tasks:                                               |
| ☑ Set expiration reminder (30 days before)                       |
| ☑ Schedule attorney check-ins (weekly)                           |
| ☑ Create compliance verification task                            |
|                                                                  |
| ──────────────────────────────────────────────────────────────  |
|                    [← Back]  [Cancel]  [Create Case]            |
+------------------------------------------------------------------+
```

**Time:** ~3 minutes to upload docs and review

**User Action:** Click "Create Case"

**System Response:**
- Creates case in database
- Sends notifications
- Creates auto-tasks
- Returns to dashboard with new case visible
- Success toast: "✓ Immigration case created successfully"

**Backend Processing:**

1. **Create Case Record:**
```sql
INSERT INTO immigration_cases (
  id, org_id, consultant_id, case_type, case_sub_type,
  filing_date, receipt_number, status, current_expiry_date,
  requested_validity_start, requested_validity_end,
  premium_processing, attorney_id, job_title, soc_code,
  annual_salary, work_location, created_by
) VALUES (
  uuid_generate_v4(),
  current_org_id,
  consultant_id,
  'H1B',
  'Transfer',
  '2024-11-15',
  'EAC2412345678',
  'Pending',
  '2024-12-18',
  '2024-12-19',
  '2027-11-01',
  true,
  attorney_id,
  'Senior Java Developer',
  '15-1132',
  176000,
  'Remote (Multiple client sites)',
  current_user_id
);
```

2. **Create Auto-Tasks:**
```typescript
await db.insert(activities).values([
  {
    title: 'Check premium processing status',
    dueDate: addDays(filingDate, 10),
    priority: 'high',
    entityType: 'immigration_case',
    entityId: caseId,
    assignedTo: currentUserId
  },
  {
    title: 'Verify work authorization not expired',
    dueDate: addDays(expiryDate, -7),
    priority: 'critical',
    entityType: 'immigration_case',
    entityId: caseId,
    assignedTo: hrComplianceId
  }
]);
```

**Time:** ~2 seconds processing

---

## Postconditions

1. ✅ Immigration dashboard shows current status of all cases
2. ✅ Critical expiration alerts are visible and prioritized
3. ✅ Case details updated with latest status, notes, documents
4. ✅ Tasks created for upcoming deadlines
5. ✅ Compliance report generated showing 98% compliant
6. ✅ Notifications sent to consultants, attorneys, HR as needed
7. ✅ Activity log tracks all case updates
8. ✅ Calendar view shows all upcoming expirations
9. ✅ Document repository organized by case type
10. ✅ Attorney contact information up to date
11. ✅ Work authorization gaps identified and mitigated
12. ✅ Submission eligibility verified based on visa status
13. ✅ RCAI entry: Recruiter = Responsible, Attorney = Accountable, HR = Consulted, Manager = Informed

---

## Events Logged

| Event | Payload | Recipients |
|-------|---------|-----------|
| `immigration_case.created` | `{ case_id, consultant_id, case_type, filing_date, attorney_id, created_by }` | System, Consultant, Attorney, HR |
| `immigration_case.status_updated` | `{ case_id, old_status, new_status, update_notes, updated_by }` | Consultant, Attorney, HR |
| `immigration_case.document_uploaded` | `{ case_id, document_type, file_name, uploaded_by }` | Attorney, HR (if required doc) |
| `immigration_case.expiring_soon` | `{ case_id, consultant_id, days_until_expiry, urgency_level }` | Recruiter, HR Compliance, Manager |
| `immigration_case.approved` | `{ case_id, approval_date, validity_period, approval_notice_url }` | Consultant, Recruiter, HR, Manager |
| `immigration_case.denied` | `{ case_id, denial_date, denial_reason, next_steps }` | Consultant, Recruiter, Attorney, HR, Manager |
| `immigration_case.rfe_received` | `{ case_id, rfe_date, rfe_type, response_due_date }` | Attorney, Recruiter, HR |
| `immigration_compliance.gap_detected` | `{ case_id, consultant_id, gap_start, gap_end, mitigation_plan }` | HR Compliance, Legal, Manager |
| `immigration_task.created` | `{ task_id, case_id, task_type, due_date, assigned_to }` | Assigned user |
| `immigration_attorney.contacted` | `{ case_id, attorney_id, contact_date, subject }` | System log |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Missing Work Authorization | Consultant has no valid immigration case | "⚠️ No valid work authorization on file. Cannot submit to jobs." | Add/update immigration case |
| Expired Work Auth | Current case expired, no pending renewal | "❌ Work authorization EXPIRED. Immediate compliance risk!" | File extension urgently or terminate |
| Work Auth Gap | Expiry before renewal approval | "⚠️ Projected work auth gap: {start} - {end}. Consultant cannot work during gap." | Premium processing, delay start date |
| RFE Missed Deadline | RFE response not submitted by due date | "❌ RFE deadline MISSED. Case may be denied. Contact attorney NOW." | Expedite with attorney, request extension |
| Submission Blocked | Client requires US Citizen, consultant is H1B | "⚠️ Client requires US Citizen/GC. Consultant is H1B. Submission blocked." | Skip submission, find different role |
| LCA Violation | Consultant working at non-approved location | "❌ COMPLIANCE VIOLATION: Work location not on LCA. Stop work immediately!" | File LCA amendment, notify attorney |
| Unauthorized Work | Consultant worked during gap period | "❌ CRITICAL: Unauthorized work detected. Visa may be voided!" | Legal review, damage control |
| Attorney Not Responding | No response from attorney in 7+ days | "⚠️ Attorney not responding (last contact: {date}). Escalate?" | Escalate to senior attorney, switch firms |
| Premium Processing Delayed | Decision not received within 15 days | "⚠️ Premium processing delayed (Day {day}). Request status inquiry." | File service request with USCIS |
| Document Expired | Passport expires in <6 months | "⚠️ Passport expires soon ({date}). Renewal required for visa processing." | Renew passport via consulate |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Esc` | Close case modal |
| `Tab` | Next field in forms |
| `Shift+Tab` | Previous field |
| `Cmd+S` | Save case notes |
| `Cmd+U` | Upload document |
| `Cmd+N` | Add new case |
| `Cmd+F` | Search cases |
| `Cmd+K` | Global command palette |
| `1-9` | Quick filter by urgency (dashboard) |

---

## Alternative Flows

### A1: Green Card Case Tracking

**Trigger:** Recruiter wants to track Green Card sponsorship for placed consultant

**Flow:**
1. Navigate to Immigration Dashboard
2. Click "➕ Add Case"
3. Select consultant: "Aisha Rahman"
4. Case Type: "Green Card" → Sub-type: "I-140 (Immigrant Petition)"
5. Fill details:
   - Category: EB2 (Advanced Degree)
   - PERM Status: Certified (July 15, 2024)
   - Priority Date: July 15, 2024
   - I-140 Filed: August 1, 2024
   - Receipt #: LIN2408123456
   - Attorney: Michael Wong (Berry Appleman)
6. Upload docs:
   - PERM Certification
   - I-140 Petition
   - Degree certificates
   - Experience letters
7. Create case
8. System auto-creates tasks:
   - Monitor I-140 processing time
   - Check priority date movement monthly
   - Plan I-485 filing when current
9. Dashboard shows Green Card timeline:
   ```
   PERM ✓ → I-140 Pending → I-485 (Not Yet Filed)
   Priority Date: Jul 15, 2024
   EB2 India: Currently processing Mar 2012 (12+ year backlog)
   ```

**Key Differences from H1B:**
- Multi-stage process (PERM → I-140 → I-485)
- Priority date tracking critical (retrogression)
- Long wait times (India/China backlogs)
- 3-year H1B extensions available while I-140 pending

---

### A2: OPT/EAD Expiration with H1B Cap-Gap

**Trigger:** OPT student has EAD expiring but H1B cap petition pending

**Flow:**
1. System alerts: "🔴 Priya Sharma - EAD expires in 28 days"
2. Recruiter opens case
3. Reviews H1B cap petition status:
   - Filed: April 1, 2024 ✓
   - Lottery Selected: June 2024 ✓
   - RFE Received: Nov 20, 2024
   - RFE Due: Dec 20, 2024 ⚠️
4. Checks cap-gap eligibility:
   - H1B timely filed? YES ✓
   - EAD has not expired yet? YES ✓
   - Eligible for auto-extension until Oct 1, 2025 (H1B start)? YES ✓
5. BUT: RFE must be responded to maintain cap-gap
6. Recruiter creates urgent task: "Attorney MUST respond to RFE by Dec 20"
7. Contacts attorney: Escalate RFE response
8. Adds compliance note: "If RFE denied, EAD terminates immediately"
9. Notifies client: "Possible start date delay if H1B denied"
10. System monitors daily until RFE response submitted

**Compliance Rules:**
- Cap-gap extension only valid if:
  1. H1B cap petition timely filed (before OPT expiry)
  2. Petition remains pending (not withdrawn/denied)
  3. No negative decision received
- If RFE denied → Work auth ends same day
- If approved → Can work until Oct 1 (H1B start date)

---

### A3: L1 Blanket to Individual Conversion

**Trigger:** Consultant on L1 Blanket needs individual L1 for client compliance

**Flow:**
1. Client (Bank) requires individual L1 (not blanket) for security clearance
2. Recruiter opens immigration case for "Chen Wu"
3. Current status: L1B Blanket (expires Jan 2026)
4. Attorney recommends: Convert to individual L1B
5. Process:
   - File I-129 for individual L1B
   - Can continue working during conversion (same employer)
   - Processing time: 3-5 months (or premium)
6. Recruiter creates case:
   - Type: L1 Individual Conversion
   - Reason: Client compliance requirement
   - Filed: Dec 1, 2024
   - Premium: Yes (needed for Jan project start)
7. Submits to client with note: "L1 individual petition pending, expected approval Jan 15"
8. Monitors premium processing (15 days)
9. Upon approval: Updates submission, notifies client

---

### A4: TN Visa (Canada/Mexico NAFTA)

**Trigger:** Canadian consultant needs TN status for US project

**Flow:**
1. Consultant: "Maria Garcia" (Canadian citizen, Software Engineer)
2. Case Type: TN Visa
3. TN category: Computer Systems Analyst
4. Process:
   - NO petition filed with USCIS
   - Applied at Port of Entry (border/airport)
   - Requires: Job offer letter, degree, TN support letter
5. Recruiter prepares docs:
   - InTime offer letter (Software Engineer, SOC 15-1132)
   - TN support letter (explains job duties match TN category)
   - Degree certificate (Bachelor's CS)
6. Consultant travels to border with docs
7. CBP officer approves TN on the spot (same day)
8. I-94 issued with TN status (typically 3 years)
9. Consultant can start work immediately
10. Recruiter logs TN approval in system:
    - Approval Date: Dec 5, 2024
    - Valid Until: Dec 5, 2027
    - I-94 Number: 12345678901

**TN Renewal Process:**
- Can renew indefinitely (no max limit like H1B)
- Renewal at border (same process)
- OR file I-129 extension (if don't want to travel)

---

### A5: Immigration Case Denial - Damage Control

**Trigger:** H1B transfer petition DENIED

**Flow:**
1. System alert: "❌ Rajesh Kumar - H1B Transfer DENIED"
2. Recruiter immediately:
   - Opens case
   - Reviews denial notice reasons
   - Contacts attorney (emergency call)
3. Denial reasons (example):
   - Employer-Employee relationship not established
   - Job duties don't match specialty occupation
4. Attorney options:
   - File Motion to Reopen/Reconsider (within 30 days)
   - Appeal to AAO (Administrative Appeals Office)
   - Re-file new petition with stronger evidence
5. Immediate impact:
   - Current H1B expired Dec 18 → Consultant CANNOT work
   - Active submission (Capital One) CANCELLED
   - Must remove from all job submissions
6. Recruiter actions:
   - Update consultant status: "Not Work Authorized"
   - Withdraw all active submissions
   - Notify clients: "Candidate no longer available"
   - Log activity: "H1B denied - out of status"
7. Consultant options:
   - Leave US immediately (grace period: 60 days max)
   - Change status to B1/B2 visitor
   - Enroll in school (F-1)
   - File Motion (if attorney advises)
8. If Motion successful → Can resume work
9. If Motion denied → Consultant must depart US

**Critical Compliance:**
- ZERO work during denial period
- Update I-9 immediately (work auth terminated)
- Consultant accrues unlawful presence if stays beyond grace period

---

## Rollback Scenarios

### Scenario 1: Premium Processing Refund

**What Happened:** Premium processing fee paid, but case denied anyway

**Actions:**
1. Attorney files motion to reconsider
2. USCIS refunds premium fee ($2,500) automatically if:
   - Decision not issued within 15 days, OR
   - Case denied (refund policy)
3. Recruiter logs refund received
4. Updates case notes

---

### Scenario 2: Work Authorization Gap - Retroactive Fix

**What Happened:** Consultant accidentally worked 2 days during gap

**Actions:**
1. HR discovers gap work via timesheet audit
2. Compliance alert: "❌ Unauthorized work detected"
3. Immediate stop work order
4. Legal review:
   - 2 days = Minor violation (if unintentional)
   - Attorney advises disclosure vs. non-disclosure
5. If disclosed:
   - File amended petition with explanation
   - May affect future visa applications
6. If not disclosed:
   - Risk: USCIS discovers later → visa voided
7. Recruiter logs incident in compliance system
8. Training: Prevent future violations

---

### Scenario 3: LCA Amendment Required

**What Happened:** Consultant moved to new work location not on LCA

**Actions:**
1. Compliance check flags location mismatch
2. Recruiter alerts: "⚠️ Work location not on approved LCA"
3. Stop work at new location immediately
4. Attorney files LCA amendment:
   - New location: Chicago, IL
   - Prevailing wage determination for Chicago
   - LCA certification: 7 business days
5. Once certified:
   - File H1B amendment (I-129)
   - Processing: 3-5 months (or premium)
6. Consultant can work at new location ONLY after amendment approved
7. Temporary solution:
   - Work remotely from approved location
   - Travel to Chicago only for meetings (not daily work)

---

## Related Use Cases

- [02-manage-bench.md](./02-manage-bench.md) - Monitor bench consultants
- [03-market-consultant.md](./03-market-consultant.md) - Marketing requires work auth verification
- [04-find-requirements.md](./04-find-requirements.md) - Match jobs to visa eligibility
- [05-submit-to-job.md](./05-submit-to-job.md) - Work authorization required for submission
- [06-make-placement.md](./06-make-placement.md) - Trigger H1B transfer on placement
- [07-manage-client-relationships.md](./07-manage-client-relationships.md) - Client compliance requirements

---

## Immigration Status Types

### United States

| Visa/Status | Description | Work Auth | Max Duration | Renewal | Green Card Eligible |
|-------------|-------------|-----------|--------------|---------|---------------------|
| **H1B** | Specialty occupation (Bachelor's required) | Yes | 6 years (extendable) | Yes | Yes (dual intent) |
| **L1A** | Intracompany transfer (Manager) | Yes | 7 years | Yes | Yes |
| **L1B** | Intracompany transfer (Specialist) | Yes | 5 years | Yes | Yes |
| **TN** | NAFTA (Canada/Mexico professionals) | Yes | 3 years (indefinite renewals) | Yes | No (not dual intent) |
| **O1** | Extraordinary ability | Yes | 3 years | Yes | Yes |
| **E2** | Treaty investor | Yes | 5 years | Yes | No |
| **OPT** | F-1 student (post-graduation) | Yes | 12 months (+24 STEM) | No | No |
| **CPT** | F-1 student (during studies) | Yes (part-time) | Duration of study | No | No |
| **EAD** | Employment Authorization Document | Yes | Varies | Varies | Depends |
| **Green Card (EB1)** | Priority workers | Yes | Permanent | N/A | IS Green Card |
| **Green Card (EB2)** | Advanced degree/exceptional ability | Yes | Permanent | N/A | IS Green Card |
| **Green Card (EB3)** | Skilled workers | Yes | Permanent | N/A | IS Green Card |
| **US Citizen** | Citizen | Yes | N/A | N/A | N/A |

### Canada

| Visa/Permit | Description | Work Auth | Max Duration | Renewal |
|-------------|-------------|-----------|--------------|---------|
| **LMIA Work Permit** | Labour Market Impact Assessment | Yes | 2-4 years | Yes |
| **ICT** | Intracompany Transfer | Yes | 5-7 years | Yes |
| **Open Work Permit** | Post-graduation, spouse | Yes | Varies | Yes |
| **Provincial Nominee** | Provincial sponsorship | Yes | Varies | Path to PR |
| **Permanent Resident** | Permanent | Yes | Permanent | N/A |

### United Kingdom

| Visa | Description | Work Auth | Max Duration | Renewal |
|------|-------------|-----------|--------------|---------|
| **Skilled Worker** | Tier 2 equivalent | Yes | 5 years | Yes (ILR path) |
| **Intracompany Transfer** | ICT | Yes | 5 years (varies) | Limited |
| **Global Talent** | Exceptional talent/promise | Yes | 5 years | ILR eligible |
| **Innovator** | Business founders | Yes | 3 years | ILR eligible |

### Australia

| Visa | Description | Work Auth | Max Duration | Renewal |
|------|-------------|-----------|--------------|---------|
| **TSS (482)** | Temporary Skill Shortage | Yes | 2-4 years | Yes |
| **ENS (186)** | Employer Nomination Scheme | Yes | Permanent | N/A |
| **RSMS (187)** | Regional Sponsored | Yes | Permanent | N/A |
| **Global Talent (858)** | Highly skilled | Yes | Permanent | N/A |

### European Union

| Permit | Description | Work Auth | Duration |
|--------|-------------|-----------|----------|
| **EU Blue Card** | Highly skilled (university degree) | Yes | 1-4 years (renewable) |
| **ICT Permit** | Intracompany transfer | Yes | 3 years |
| **National Work Permit** | Country-specific | Yes | Varies by country |

---

## Compliance Rules by Country

### United States - Key Compliance Rules

1. **H1B LCA Compliance:**
   - Must pay actual wage or prevailing wage (whichever higher)
   - Work location must be on certified LCA
   - LCA amendment required for location change >50 miles
   - Public Access File (PAF) must be maintained

2. **Portability (AC21):**
   - Can start work with new employer once I-129 filed (if currently in H1B)
   - DOES NOT extend work authorization beyond current I-797 expiry
   - New petition must be filed before current expiry

3. **240-Day Rule:**
   - If extension filed timely (before expiry), can continue working up to 240 days while pending
   - Applies to: H1B, L1, TN (when filed as I-129 extension)
   - Does NOT apply to: OPT, new H1B petitions

4. **Cap-Gap (OPT to H1B):**
   - Auto-extension of OPT if:
     - H1B cap petition timely filed before OPT expiry
     - Petition selected in lottery
     - Petition remains pending
   - Terminates immediately if petition denied

5. **Unauthorized Work:**
   - 180+ days unlawful presence → 3-year bar
   - 365+ days unlawful presence → 10-year bar
   - ANY unauthorized work while in H1B/L1 → visa voidance

6. **I-9 Requirements:**
   - Must complete within 3 days of hire
   - Re-verification required when work auth expires
   - Failure to maintain = $1,375-$27,500 fine per violation

### Canada - Key Compliance Rules

1. **LMIA Requirements:**
   - Employer must prove no Canadian available for role
   - Wages must meet median for occupation/region
   - Work permit tied to specific employer and location

2. **Implied Status:**
   - If extension applied before expiry, can continue on "implied status"
   - Maintains work authorization until decision

### United Kingdom - Key Compliance Rules

1. **Certificate of Sponsorship (CoS):**
   - Employer must be licensed sponsor
   - Job must meet skill level (RQF Level 3+) and salary threshold
   - CoS tied to specific job and employer

2. **Right to Work Checks:**
   - Mandatory before hire (civil penalty £20,000 per illegal worker)
   - Re-check required when visa expires

### Australia - Key Compliance Rules

1. **TSS Visa:**
   - Employer must be approved sponsor
   - 2-year Labor Market Testing (LMT) required
   - Salary must meet Temporary Skilled Migration Income Threshold (TSMIT)

2. **8107 Condition:**
   - Work only for sponsoring employer
   - Violation = visa cancellation

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | View immigration dashboard with 43 cases | Dashboard loads, metrics accurate, expiration alerts visible |
| TC-002 | Filter critical cases (0-30 days) | Shows only cases expiring in next 30 days, sorted by soonest first |
| TC-003 | Open H1B transfer case detail | Case modal opens, shows timeline, documents, tasks, compliance status |
| TC-004 | Update case status: Pending → Approved | Status saved, timeline updated, notifications sent |
| TC-005 | Upload I-797 approval notice | Document uploaded, filed under correct folder, visible in doc list |
| TC-006 | Generate compliance audit report | Report shows 98% compliant, flags 1 gap issue, lists mitigation |
| TC-007 | Create new H1B transfer case | Wizard completes 3 steps, case created, tasks auto-generated |
| TC-008 | Case with work auth gap detected | Compliance alert shown, gap period calculated, mitigation plan required |
| TC-009 | RFE received for pending case | Status updates to "RFE Received", due date task created, attorney notified |
| TC-010 | OPT case with cap-gap eligibility | System calculates cap-gap extension, shows "Valid until Oct 1, 2025" |
| TC-011 | Expired work auth (no renewal) | Case flagged red, consultant blocked from submissions, compliance violation |
| TC-012 | Premium processing exceeds 15 days | Alert: "Premium delayed", auto-task to file service request |
| TC-013 | LCA location mismatch detected | Compliance violation flagged, stop-work alert, amendment required |
| TC-014 | Green Card I-140 approved | Status updated, priority date locked, I-485 eligibility checked |
| TC-015 | TN visa renewed at border | New I-94 uploaded, expiry date updated, work auth confirmed |
| TC-016 | Expiration calendar shows Dec 2024 | Calendar displays all expirations by date, color-coded by urgency |
| TC-017 | Attorney contact updated | Contact info saved, reflected in case details, email notifications work |
| TC-018 | Case denial logged | Status "Denied", denial reason recorded, consultant work auth terminated |

---

## UI/UX Specifications

### Color Coding - Urgency Levels

| Level | Days Remaining | Color | Icon | Action Required |
|-------|----------------|-------|------|-----------------|
| **Critical** | 0-30 days | Red (`#DC2626`) | 🔴 | URGENT: Immediate action |
| **Urgent** | 31-90 days | Orange (`#EA580C`) | 🟠 | HIGH: Plan and file |
| **Monitor** | 91-180 days | Yellow (`#CA8A04`) | 🟡 | MEDIUM: Start planning |
| **Normal** | 181+ days | Green (`#16A34A`) | 🟢 | LOW: Routine monitoring |

### Case Status Colors

| Status | Color | Badge |
|--------|-------|-------|
| Approved | Green | ✅ APPROVED |
| Pending | Blue | ⏳ PENDING |
| RFE Received | Orange | ⚠️ RFE |
| Denied | Red | ❌ DENIED |
| Withdrawn | Gray | ⊘ WITHDRAWN |

### Immigration Types Icons

| Type | Icon | Color |
|------|------|-------|
| H1B | 🛂 | Blue |
| Green Card | 🟢 | Green |
| OPT/EAD | 🎓 | Purple |
| L1 | 🏢 | Teal |
| TN | 🇨🇦 | Red |
| Other | 📄 | Gray |

---

## Database Schema Reference

**Immigration Cases Table:**
```sql
CREATE TABLE immigration_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Consultant
  consultant_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Case details
  case_type TEXT NOT NULL, -- 'H1B', 'Green Card', 'OPT', 'L1', 'TN', etc.
  case_sub_type TEXT, -- 'Initial', 'Extension', 'Transfer', 'Amendment', 'PERM', 'I-140', etc.
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'denied', 'rfe_received', etc.

  -- Dates
  filing_date DATE,
  approval_date DATE,
  denial_date DATE,
  current_expiry_date DATE NOT NULL, -- Critical for compliance
  requested_validity_start DATE,
  requested_validity_end DATE,

  -- USCIS details
  receipt_number TEXT, -- EAC/WAC/LIN/SRC number
  priority_date DATE, -- For Green Card cases
  premium_processing BOOLEAN DEFAULT false,

  -- Job/Wage info (for H1B/L1/TN)
  job_title TEXT,
  soc_code TEXT,
  annual_salary NUMERIC(12, 2),
  work_location TEXT,

  -- Attorney
  attorney_id UUID REFERENCES attorneys(id),
  law_firm_name TEXT,

  -- Compliance
  compliance_status TEXT DEFAULT 'compliant', -- 'compliant', 'warning', 'violation'
  compliance_notes TEXT,
  last_compliance_check_date TIMESTAMPTZ,

  -- Related entities
  previous_case_id UUID REFERENCES immigration_cases(id), -- For extensions/transfers
  triggered_by_placement_id UUID REFERENCES placements(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);

-- Indexes
CREATE INDEX idx_immigration_cases_consultant ON immigration_cases(consultant_id);
CREATE INDEX idx_immigration_cases_expiry ON immigration_cases(current_expiry_date);
CREATE INDEX idx_immigration_cases_status ON immigration_cases(status);
CREATE INDEX idx_immigration_cases_receipt ON immigration_cases(receipt_number);
```

**Immigration Documents Table:**
```sql
CREATE TABLE immigration_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Associations
  case_id UUID NOT NULL REFERENCES immigration_cases(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Document details
  document_type TEXT NOT NULL, -- 'I-797', 'I-129', 'LCA', 'Passport', 'EAD', 'I-94', etc.
  document_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type TEXT,

  -- Validity
  issue_date DATE,
  expiry_date DATE,
  is_current BOOLEAN DEFAULT true,

  -- Metadata
  uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  uploaded_by UUID REFERENCES user_profiles(id)
);
```

**Attorneys Table:**
```sql
CREATE TABLE attorneys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Contact info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  -- Firm
  law_firm_name TEXT NOT NULL,
  firm_address TEXT,

  -- Specialization
  practice_areas TEXT[], -- ['H1B', 'Green Card', 'L1', 'PERM', etc.]

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

---

*Last Updated: 2024-11-30*
*Document Version: 1.0*
*Author: InTime v3 Product Team*
*Status: Final*
