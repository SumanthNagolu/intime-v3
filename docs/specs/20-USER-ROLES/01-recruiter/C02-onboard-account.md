# Use Case: Onboard Account

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-C02 |
| Actor | Recruiter (Account Manager Role) |
| Goal | Complete new account setup including MSA documentation, billing setup, contacts, and job categories |
| Frequency | 2-4 times per month per recruiter |
| Estimated Time | 30-60 minutes |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "account.update" permission
3. Account has been created (from won deal or manually)
4. MSA or contract is signed
5. Primary contact information available

---

## Trigger

One of the following:
- Deal closed as won, account auto-created
- Manual account creation for new client
- Pod Manager assigns onboarding task
- Client ready for first job requisition
- Contract signed and returned

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Account Onboarding

**User Action:** Click on new account from dashboard alert or accounts list

**System Response:**
- Account detail page loads
- Onboarding checklist prominently displayed
- Status shows "Pending Onboarding"

**Screen State:**
```
+----------------------------------------------------------+
| [← Back to Accounts]                     Account Detail   |
+----------------------------------------------------------+
|                                                           |
| TechStart Inc                                             |
| Status: ⏳ Pending Onboarding           [Edit] [Actions ▼]|
| Created: Dec 20, 2025 | Owner: John Smith                |
|                                                           |
+----------------------------------------------------------+
|                                                           |
| ⚠️ ONBOARDING REQUIRED                                    |
| Complete the onboarding checklist to activate this account|
|                                                           |
| [▶ Start Onboarding Wizard]                              |
|                                                           |
+----------------------------------------------------------+
| Overview | Contacts | Jobs | Placements | Documents | Notes|
+----------------------------------------------------------+
|                                                           |
| ONBOARDING CHECKLIST                     Progress: 2/8    |
| ┌────────────────────────────────────────────────────┐  |
| │ ✅ Account Created                                  │  |
| │ ✅ Primary Contact Added                            │  |
| │ ⬜ Complete Company Profile                         │  |
| │ ⬜ Upload MSA/Contract                              │  |
| │ ⬜ Configure Billing                                │  |
| │ ⬜ Add Key Contacts                                 │  |
| │ ⬜ Define Job Categories                            │  |
| │ ⬜ Schedule Kickoff Call                            │  |
| │                                                     │  |
| │ ████░░░░░░░░░░░░░░░░ 25%                          │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Start Onboarding Wizard

**User Action:** Click "Start Onboarding Wizard"

**System Response:**
- Onboarding wizard opens (multi-step modal)
- Progress indicator shows current step

**Screen State:**
```
+----------------------------------------------------------+
|                           Account Onboarding Wizard   [×] |
+----------------------------------------------------------+
| Step 1 of 6: Company Profile                              |
| ●───────○───────○───────○───────○───────○                 |
+----------------------------------------------------------+
|                                                           |
| COMPANY INFORMATION                                       |
|                                                           |
| Legal Company Name *                                      |
| [TechStart Inc                                  ]        |
|                                                           |
| DBA / Trade Name (if different)                          |
| [                                               ]        |
|                                                           |
| Industry *                                                |
| [Financial Technology (FinTech)              ▼]          |
|                                                           |
| Company Size *                                            |
| [101-200 employees                           ▼]          |
|                                                           |
| Year Founded                                              |
| [2019       ]                                             |
|                                                           |
| Website *                                                 |
| [https://techstart.io                           ]        |
|                                                           |
| LinkedIn Company Page                                     |
| [https://linkedin.com/company/techstart         ]        |
|                                                           |
| HEADQUARTERS ADDRESS                                      |
|                                                           |
| Street Address *                                          |
| [500 Howard Street, Suite 400                   ]        |
|                                                           |
| City *               State *          Zip *               |
| [San Francisco    ] [CA         ▼] [94105    ]          |
|                                                           |
| Country *                                                 |
| [United States                               ▼]          |
|                                                           |
| ADDITIONAL LOCATIONS (Optional)                           |
| [+ Add Location]                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ New York Office - 100 employees                    │  |
| │ 350 5th Avenue, New York, NY 10118            [×] │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| BUSINESS DETAILS                                          |
|                                                           |
| Tax ID / EIN                                              |
| [XX-XXXXXXX          ] (Required for invoicing)          |
|                                                           |
| Funding Stage                                             |
| [Series B                                    ▼]          |
|                                                           |
| Annual Revenue Range                                      |
| [$10M - $50M                                 ▼]          |
|                                                           |
| Account Classification                                    |
| ○ Enterprise (>1000 employees, $100K+ potential)        |
| ○ Mid-Market (100-1000 employees, $25K-100K)            |
| ○ SMB (<100 employees, <$25K)                           |
|                                                           |
+----------------------------------------------------------+
|                [Cancel]  [Next: Contract Setup →]        |
+----------------------------------------------------------+
```

**Time:** ~3 minutes

---

### Step 3: Contract & MSA Setup

**User Action:** Click "Next: Contract Setup →"

**System Response:**
- Contract configuration step loads
- Document upload section shown

**Screen State:**
```
+----------------------------------------------------------+
|                           Account Onboarding Wizard   [×] |
+----------------------------------------------------------+
| Step 2 of 6: Contract Setup                               |
| ●───────●───────○───────○───────○───────○                 |
+----------------------------------------------------------+
|                                                           |
| CONTRACT INFORMATION                                      |
|                                                           |
| Contract Type *                                           |
| ○ Master Service Agreement (MSA)                         |
| ○ Statement of Work (SOW)                                |
| ○ Purchase Order (PO) Based                              |
| ○ Other                                                  |
|                                                           |
| Contract Signed Date *                                    |
| [12/20/2025                                     📅]      |
|                                                           |
| Contract Start Date *                                     |
| [01/06/2026                                     📅]      |
|                                                           |
| Contract End Date (if applicable)                         |
| [12/31/2026                                     📅]      |
| ☐ Evergreen / Auto-renew                                 |
|                                                           |
| CONTRACT DOCUMENTS                                        |
|                                                           |
| Upload Signed MSA/Contract *                              |
| [📎 Upload file...] or drag and drop                     |
| ┌────────────────────────────────────────────────────┐  |
| │ 📄 TechStart_MSA_Signed_Dec2025.pdf               │  |
| │    Uploaded: Dec 20, 2025 | 2.4 MB           [×]  │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Additional Documents (Optional)                           |
| [📎 Upload additional...] NDA, Insurance Cert, etc.      |
|                                                           |
| RATE CARD                                                 |
|                                                           |
| ☐ Standard Rate Card (Company default)                   |
| ☑ Custom Rate Card                                       |
|                                                           |
| Custom Rate Configuration                                 |
| ┌────────────────────────────────────────────────────┐  |
| │ Role Category        Bill Rate Range   Margin     │  |
| │ ──────────────────────────────────────────────── │  |
| │ Software Engineer    $90 - $130/hr     18-22%    │  |
| │ Senior Engineer      $110 - $150/hr    18-22%    │  |
| │ Tech Lead            $130 - $170/hr    18-22%    │  |
| │ Architect            $150 - $200/hr    18-22%    │  |
| │ [+ Add Role Category]                             │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| SPECIAL TERMS                                             |
|                                                           |
| Conversion Fee (if contract-to-hire)                      |
| [20    ]% of annual salary or [$ 15,000  ] flat fee     |
|                                                           |
| Guarantee Period                                          |
| [30    ] days replacement guarantee                       |
|                                                           |
| Notice Period                                             |
| [2     ] weeks for contract termination                  |
|                                                           |
| Notes on Special Terms                                    |
| [Client requested 30-day guarantee vs standard 90.      |
|  Approved by Pod Manager for first engagement.     ]    |
|                                                           |
+----------------------------------------------------------+
|        [← Back]  [Cancel]  [Next: Billing Setup →]       |
+----------------------------------------------------------+
```

**Time:** ~3 minutes

---

### Step 4: Billing Configuration

**User Action:** Click "Next: Billing Setup →"

**System Response:**
- Billing configuration step loads

**Screen State:**
```
+----------------------------------------------------------+
|                           Account Onboarding Wizard   [×] |
+----------------------------------------------------------+
| Step 3 of 6: Billing Setup                                |
| ●───────●───────●───────○───────○───────○                 |
+----------------------------------------------------------+
|                                                           |
| BILLING DETAILS                                           |
|                                                           |
| Billing Entity Name (if different from company)           |
| [                                               ]        |
|                                                           |
| Payment Terms *                                           |
| [Net 30                                        ▼]        |
|   - Net 15                                               |
|   - Net 30 (Standard)                                    |
|   - Net 45                                               |
|   - Net 60                                               |
|   - Due on Receipt                                       |
|                                                           |
| Billing Frequency *                                       |
| ○ Weekly (Every Friday)                                  |
| ○ Bi-weekly (Every other Friday)                         |
| ○ Monthly (1st of month)                                 |
|                                                           |
| Currency *                                                |
| [USD - US Dollar                               ▼]        |
|                                                           |
| BILLING ADDRESS                                           |
|                                                           |
| ☑ Same as headquarters                                   |
| ☐ Different billing address                              |
|                                                           |
| BILLING CONTACT                                           |
|                                                           |
| Contact Name *                                            |
| [Jennifer Adams                                 ]        |
|                                                           |
| Title                                                     |
| [Finance Manager                                ]        |
|                                                           |
| Email *                                                   |
| [jennifer.adams@techstart.io                    ]        |
|                                                           |
| Phone                                                     |
| [(415) 555-0199                                 ]        |
|                                                           |
| INVOICING PREFERENCES                                     |
|                                                           |
| Invoice Delivery Method *                                 |
| ☑ Email                                                  |
| ☐ Mail (physical)                                        |
| ☐ Customer Portal                                        |
|                                                           |
| CC Invoice To (Additional recipients)                     |
| [ap@techstart.io                                ]        |
|                                                           |
| PO Number Required?                                       |
| ○ Yes, PO required for all invoices                      |
| ○ No, PO not required                                    |
|                                                           |
| PO Number (if required)                                   |
| [PO-2026-001                                    ]        |
|                                                           |
| TIMESHEET APPROVAL                                        |
|                                                           |
| Who approves contractor timesheets? *                     |
| [Sarah Chen - VP Engineering                   ▼]        |
|                                                           |
| Approval Method                                           |
| ○ Email approval                                         |
| ○ Client portal approval                                 |
| ○ Automatic (trust-based)                                |
|                                                           |
+----------------------------------------------------------+
|        [← Back]  [Cancel]  [Next: Key Contacts →]        |
+----------------------------------------------------------+
```

**Time:** ~2 minutes

---

### Step 5: Add Key Contacts

**User Action:** Click "Next: Key Contacts →"

**Screen State:**
```
+----------------------------------------------------------+
|                           Account Onboarding Wizard   [×] |
+----------------------------------------------------------+
| Step 4 of 6: Key Contacts                                 |
| ●───────●───────●───────●───────○───────○                 |
+----------------------------------------------------------+
|                                                           |
| KEY CONTACTS                                              |
|                                                           |
| Building your contact map helps ensure smooth             |
| communication and faster job fulfillment.                 |
|                                                           |
| PRIMARY CONTACT (Hiring Manager) ✓                        |
| ┌────────────────────────────────────────────────────┐  |
| │ 👤 Sarah Chen                                      │  |
| │    VP of Engineering                               │  |
| │    sarah.chen@techstart.io | (415) 555-0123       │  |
| │    Role: Primary Contact / Decision Maker          │  |
| │    [Edit] [Remove]                                 │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| ADDITIONAL CONTACTS                                       |
| [+ Add Contact]                                           |
|                                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ 👤 Mike Johnson                                    │  |
| │    CTO                                             │  |
| │    mike.johnson@techstart.io | (415) 555-0124     │  |
| │    Role: Executive Sponsor                         │  |
| │    [Edit] [Remove]                                 │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ 👤 Jennifer Adams                                  │  |
| │    Finance Manager                                 │  |
| │    jennifer.adams@techstart.io | (415) 555-0199   │  |
| │    Role: Billing Contact                           │  |
| │    [Edit] [Remove]                                 │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| CONTACT ROLES                                             |
|                                                           |
| For each contact, assign relevant roles:                  |
| • Primary Contact - Main point of contact                 |
| • Hiring Manager - Makes hiring decisions                 |
| • Executive Sponsor - Senior stakeholder                  |
| • Technical Lead - Technical evaluator                    |
| • Billing Contact - Handles invoices                      |
| • HR Contact - Onboarding coordination                    |
| • Timesheet Approver - Approves contractor hours         |
|                                                           |
| COMMUNICATION PREFERENCES                                 |
|                                                           |
| Primary communication channel                             |
| ○ Email                                                  |
| ○ Phone                                                  |
| ○ Slack / Teams                                          |
| ○ Mix (depends on urgency)                               |
|                                                           |
| Preferred meeting cadence                                 |
| [Weekly check-in                               ▼]        |
|                                                           |
+----------------------------------------------------------+
|      [← Back]  [Cancel]  [Next: Job Categories →]        |
+----------------------------------------------------------+
```

**Time:** ~2 minutes

---

### Step 6: Define Job Categories

**User Action:** Click "Next: Job Categories →"

**Screen State:**
```
+----------------------------------------------------------+
|                           Account Onboarding Wizard   [×] |
+----------------------------------------------------------+
| Step 5 of 6: Job Categories & Preferences                 |
| ●───────●───────●───────●───────●───────○                 |
+----------------------------------------------------------+
|                                                           |
| HOT JOB CATEGORIES                                        |
|                                                           |
| What roles does this client typically hire?               |
| This helps us prioritize candidates and speed up filling. |
|                                                           |
| Select common role categories:                            |
| ┌────────────────────────────────────────────────────┐  |
| │ ENGINEERING                                        │  |
| │ ☑ Backend Engineer                                 │  |
| │ ☑ Frontend Engineer                                │  |
| │ ☑ Full Stack Engineer                              │  |
| │ ☐ Mobile Engineer (iOS/Android)                    │  |
| │ ☑ DevOps / SRE                                     │  |
| │ ☐ QA Engineer                                      │  |
| │ ☐ Data Engineer                                    │  |
| │ ☐ ML / AI Engineer                                 │  |
| │                                                     │  |
| │ LEADERSHIP                                         │  |
| │ ☑ Engineering Manager                              │  |
| │ ☑ Tech Lead / Staff Engineer                       │  |
| │ ☐ Director of Engineering                          │  |
| │ ☐ VP Engineering                                   │  |
| │                                                     │  |
| │ PRODUCT & DESIGN                                   │  |
| │ ☐ Product Manager                                  │  |
| │ ☐ UX Designer                                      │  |
| │ ☐ Product Designer                                 │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| TECHNICAL STACK PREFERENCES                               |
|                                                           |
| Primary Languages/Frameworks                              |
| [TypeScript, React, Node.js, PostgreSQL, AWS     ]       |
|                                                           |
| Nice-to-Have Skills                                       |
| [Kubernetes, GraphQL, Redis                      ]       |
|                                                           |
| CANDIDATE PREFERENCES                                     |
|                                                           |
| Work Authorization Requirements                           |
| ☑ US Citizen / Green Card                                |
| ☑ H1B (will sponsor transfer)                            |
| ☐ H1B (no sponsorship)                                   |
| ☑ OPT / CPT                                              |
| ☐ TN Visa (Canada/Mexico)                                |
|                                                           |
| Experience Level Preference                               |
| ☐ Junior (0-2 years)                                     |
| ☑ Mid-Level (3-5 years)                                  |
| ☑ Senior (5-8 years)                                     |
| ☑ Staff+ (8+ years)                                      |
|                                                           |
| Location Preferences                                      |
| ☑ Remote (US-based)                                      |
| ☐ Remote (Global)                                        |
| ☑ Hybrid (SF Bay Area)                                   |
| ☐ On-site only                                           |
|                                                           |
| INTERVIEW PROCESS                                         |
|                                                           |
| Typical interview rounds                                  |
| [4     ] rounds (including recruiter screen)             |
|                                                           |
| Interview process overview                                |
| [1. Phone screen with recruiter (30 min)                |
|  2. Technical phone screen with engineer (1 hr)         |
|  3. Virtual onsite: system design + coding (3 hrs)      |
|  4. Final with hiring manager (30 min)             ]    |
|                                                           |
| Average time-to-decision after final                      |
| [3-5   ] business days                                   |
|                                                           |
+----------------------------------------------------------+
|       [← Back]  [Cancel]  [Next: Schedule Kickoff →]     |
+----------------------------------------------------------+
```

**Time:** ~3 minutes

---

### Step 7: Schedule Kickoff Call

**User Action:** Click "Next: Schedule Kickoff →"

**Screen State:**
```
+----------------------------------------------------------+
|                           Account Onboarding Wizard   [×] |
+----------------------------------------------------------+
| Step 6 of 6: Schedule Kickoff & Review                    |
| ●───────●───────●───────●───────●───────●                 |
+----------------------------------------------------------+
|                                                           |
| KICKOFF CALL                                              |
|                                                           |
| Schedule a kickoff call to align on expectations and      |
| get the first job requirements.                           |
|                                                           |
| ☑ Schedule kickoff call                                  |
|                                                           |
| Attendees                                                 |
| Internal:  [John Smith (You)                    ]        |
| Client:    [Sarah Chen, Mike Johnson            ]        |
|                                                           |
| Proposed Times (Select 3)                                 |
| ☑ Mon, Dec 23 at 10:00 AM PT                            |
| ☑ Tue, Dec 24 at 2:00 PM PT                             |
| ☑ Thu, Dec 26 at 11:00 AM PT                            |
|                                                           |
| Meeting Duration                                          |
| [45    ] minutes                                          |
|                                                           |
| Meeting Type                                              |
| ○ Video Call (Google Meet)                               |
| ○ Phone Call                                             |
| ○ In-Person                                              |
|                                                           |
| Agenda Topics (Auto-generated, editable)                  |
| ┌────────────────────────────────────────────────────┐  |
| │ 1. Introductions and relationship overview         │  |
| │ 2. Review first job requirements (from deal)       │  |
| │ 3. Discuss ideal candidate profiles                │  |
| │ 4. Review interview process and timeline           │  |
| │ 5. Set expectations for communication cadence      │  |
| │ 6. Q&A and next steps                              │  |
| └────────────────────────────────────────────────────┘  |
| [Edit Agenda]                                             |
|                                                           |
| WELCOME PACKAGE                                           |
|                                                           |
| ☑ Send welcome email with meeting request                |
| ☑ Include company overview deck                          |
| ☑ Share client portal access                             |
| ☑ Attach sample candidate profiles (anonymized)          |
|                                                           |
| ONBOARDING SUMMARY                                        |
| ┌────────────────────────────────────────────────────┐  |
| │ ✅ Company Profile: Complete                       │  |
| │ ✅ Contract Setup: MSA uploaded, rates configured  │  |
| │ ✅ Billing Setup: Net 30, weekly invoicing        │  |
| │ ✅ Key Contacts: 3 contacts added                  │  |
| │ ✅ Job Categories: 5 hot categories defined        │  |
| │ ✅ Kickoff Call: Scheduling in progress            │  |
| │                                                     │  |
| │ Account Ready for Activation! 🎉                   │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| NOTES FOR INTERNAL TEAM                                   |
| [High potential account. Sarah is a great champion.     |
|  They have aggressive Q1 hiring goals. Priority for     |
|  senior backend engineers with FinTech experience. ]    |
|                                                           |
+----------------------------------------------------------+
|    [← Back]  [Save Draft]  [Complete Onboarding ✓]       |
+----------------------------------------------------------+
```

**Time:** ~2 minutes

---

### Step 8: Complete Onboarding

**User Action:** Click "Complete Onboarding ✓"

**System Response:**

1. **Account record updated**
2. **Company profile saved**
3. **Contract documents stored**
4. **Billing configuration saved**
5. **Contacts linked to account**
6. **Job categories defined**
7. **Kickoff meeting request sent**
8. **Welcome package emailed**
9. **Account status → Active**
10. **Notifications sent to team**

**On Success:**
- Wizard closes with success animation
- Toast: "Account onboarding complete! TechStart Inc is now active."
- Account status changes to "Active"

**Time:** ~3 seconds

---

## Postconditions

1. ✅ Account status = Active
2. ✅ Company profile complete
3. ✅ MSA/Contract uploaded
4. ✅ Billing configured
5. ✅ All key contacts added
6. ✅ Job categories defined
7. ✅ Kickoff meeting scheduled
8. ✅ Welcome package sent
9. ✅ Team notified

---

## Events Logged

| Event | Payload |
|-------|---------|
| `account.onboarding_completed` | `{ account_id, completed_by, completed_at }` |
| `account.status_changed` | `{ account_id, old_status, new_status: 'active' }` |
| `document.uploaded` | `{ account_id, document_type: 'msa', path }` |
| `meeting.scheduled` | `{ account_id, meeting_type: 'kickoff', attendees }` |

---

## Related Use Cases

- [B05-close-deal.md](./B05-close-deal.md) - Creates account from deal
- [C03-manage-account-profile.md](./C03-manage-account-profile.md) - Ongoing management
- [C07-take-job-requisition.md](./C07-take-job-requisition.md) - First job intake

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Complete all onboarding steps | Account activated |
| TC-002 | Upload MSA document | Document stored, linked |
| TC-003 | Add multiple contacts | All contacts saved |
| TC-004 | Configure custom rate card | Rates saved to account |
| TC-005 | Schedule kickoff meeting | Meeting request sent |
| TC-006 | Send welcome package | Email with attachments sent |

---

*Last Updated: 2025-12-05*

