# UC-BENCH-013: Manage Vendor Relationships

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** Bench Sales Recruiter
**Status:** Approved

---

## 1. Overview

This use case describes how Bench Sales Recruiters manage ongoing relationships with third-party vendor partners. Vendor management includes tracking vendor contacts, monitoring performance metrics, maintaining communication history, managing custom commission terms, reconciling payments, and escalating issues. Vendors are critical partners who provide job requirements and bench consultant access, making effective relationship management essential for bench sales success.

---

## 2. Actors

### 2.1 Primary Actor
- **Bench Sales Recruiter** - Day-to-day vendor relationship owner

### 2.2 Secondary Actors
- **Bench Sales Manager** - Approves vendor-related decisions, handles escalations
- **Finance Team** - Processes vendor payments, reconciles commissions
- **Regional Director** - Reviews vendor agreements, approves non-standard terms
- **Legal Team** - Reviews contracts, handles disputes

### 2.3 System Actors
- **Vendor Performance Analytics** - Auto-calculates vendor metrics (response rate, fill rate, etc.)
- **Commission Calculator** - Tracks and calculates custom commission based on vendor agreements
- **Email Integration** - Syncs vendor email communications into CRM

---

## 3. Preconditions

- Vendor exists in system (from [UC-BENCH-014: Onboard Vendor](./14-onboard-vendor.md))
- Vendor has signed agreement with custom commission terms documented
- Bench Sales Recruiter has access to Vendor Management module
- Vendor has at least one active contact person

---

## 4. Trigger

One of the following initiates vendor management activities:
- Daily routine: Review vendor dashboard for new requirements and updates
- Vendor sends job requirement via email or portal
- Weekly vendor relationship call scheduled
- Monthly performance review due
- Commission payment dispute received
- Vendor contract renewal date approaching

---

## 5. Main Flow

### Step 1: Access Vendor Dashboard

**1.1 Navigate to Vendor Module**
- From main menu, click **Bench Dashboard** → **Vendors**
- Or use keyboard shortcut: `g` then `v`

**1.2 Vendor Dashboard Overview**

```
┌────────────────────────────────────────────────────────────────────────┐
│ Vendor Management Dashboard                             [Help] [?]     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ 📊 VENDOR PERFORMANCE (Last 30 Days)                                    │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐   │
│  │ Active       │  │ Requirements │  │ Submissions  │  │ Placements│  │
│  │ Vendors      │  │ Received     │  │ Made         │  │ Filled    │  │
│  │     42       │  │     156      │  │     89       │  │     12    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘   │
│                                                                          │
│  Avg Response Time: 4.2 hours    Fill Rate: 7.7%    Placement Rate: 13%│
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ 🏆 TOP VENDORS (By Placements)                      [View All]   │   │
│ ├──────────────────────────────────────────────────────────────────┤   │
│ │                                                                  │   │
│ │  1. TechStaff Solutions - 5 placements | $45K revenue           │   │
│ │     Performance: ⭐⭐⭐⭐⭐ (9.2/10) | Last Contact: 2 days ago  │   │
│ │     [View Dashboard] [Log Activity] [Send Email]                │   │
│ │                                                                  │   │
│ │  2. Global IT Partners - 4 placements | $38K revenue            │   │
│ │     Performance: ⭐⭐⭐⭐ (8.5/10) | Last Contact: 5 days ago    │   │
│ │     [View Dashboard] [Log Activity] [Send Email]                │   │
│ │                                                                  │   │
│ │  3. Prime Consulting - 3 placements | $29K revenue              │   │
│ │     Performance: ⭐⭐⭐⭐ (8.1/10) | Last Contact: 1 week ago    │   │
│ │     [View Dashboard] [Log Activity] [Send Email]                │   │
│ │                                                                  │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ ⚠️ VENDORS NEEDING ATTENTION                        [View All]   │   │
│ ├──────────────────────────────────────────────────────────────────┤   │
│ │                                                                  │   │
│ │  🔴 ABC Staffing - No contact in 30 days | Contract expires 15d │   │
│ │     Last Placement: 90 days ago | Action: Schedule renewal call │   │
│ │                                                                  │   │
│ │  🟡 XYZ Solutions - Pending commission dispute | $5K outstanding│   │
│ │     Action: Finance reconciliation needed                       │   │
│ │                                                                  │   │
│ │  🟠 Tech Pros Inc. - Low response rate (35%) | Last 30 days     │   │
│ │     Action: Relationship review call needed                     │   │
│ │                                                                  │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

### Step 2: Review Individual Vendor Profile

**2.1 Select Vendor**
- Click on vendor name from dashboard or search
- Vendor detail page opens

**2.2 Vendor Profile Layout**

```
┌────────────────────────────────────────────────────────────────────────┐
│ [← Back to Vendors]          TechStaff Solutions              [Edit]   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ [Tabs: Overview | Contacts | Agreement | Performance | Activity]        │
│                                                                          │
│ ═══════════════════ OVERVIEW TAB ════════════════════                   │
│                                                                          │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ VENDOR INFORMATION                                              │    │
│ ├─────────────────────────────────────────────────────────────────┤    │
│ │                                                                 │    │
│ │ Legal Name: TechStaff Solutions Inc.                           │    │
│ │ DBA (if different): TechStaff                                  │    │
│ │ Website: https://techstaffsolutions.com                        │    │
│ │                                                                 │    │
│ │ Primary Contact: John Smith, VP of Partnerships                │    │
│ │ Phone: +1 (555) 123-4567 | Email: john@techstaff.com          │    │
│ │                                                                 │    │
│ │ Address: 123 Business Blvd, Suite 500, New York, NY 10001      │    │
│ │                                                                 │    │
│ │ Relationship Status: 🟢 Active                                 │    │
│ │ Partnership Start Date: Jan 15, 2024                           │    │
│ │ Last Contact: 2 days ago (Nov 28, 2025)                       │    │
│ │                                                                 │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ PARTNERSHIP METRICS (Last 90 Days)                              │    │
│ ├─────────────────────────────────────────────────────────────────┤    │
│ │                                                                 │    │
│ │  Requirements Received: 45 | Consultants Submitted: 28         │    │
│ │  Interviews: 15 | Placements: 5                                │    │
│ │                                                                 │    │
│ │  Response Rate: 92% (requirements responded to)                │    │
│ │  Submit Rate: 62% (requirements we submitted to)               │    │
│ │  Interview Rate: 54% (submissions that got interviews)         │    │
│ │  Fill Rate: 11% (requirements filled)                          │    │
│ │                                                                 │    │
│ │  Revenue Generated: $45,280 (5 placements)                     │    │
│ │  Avg Deal Size: $9,056                                         │    │
│ │                                                                 │    │
│ │  Performance Score: ⭐⭐⭐⭐⭐ 9.2/10                           │    │
│ │   - Response Speed: 9.5/10 (Avg: 2.3 hours)                   │    │
│ │   - Quality of Requirements: 9.0/10 (Clear specs)              │    │
│ │   - Payment Timeliness: 9.5/10 (Avg: Net 5 days)              │    │
│ │   - Relationship Quality: 9.0/10 (Collaborative)               │    │
│ │                                                                 │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ QUICK ACTIONS                                                   │    │
│ ├─────────────────────────────────────────────────────────────────┤    │
│ │ [Log Call] [Send Email] [Schedule Meeting] [Add Requirement]   │    │
│ │ [View Bench] [Review Agreement] [Dispute Commission]           │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

### Step 3: Manage Vendor Contacts

**3.1 Click "Contacts" Tab**

**3.2 Contacts List**

| Name | Title | Email | Phone | Relationship Type | Last Contact | Actions |
|------|-------|-------|-------|------------------|--------------|---------|
| John Smith | VP of Partnerships | john@techstaff.com | 555-123-4567 | Primary | 2 days ago | [Edit] [Email] [Call] |
| Sarah Johnson | Recruiter | sarah@techstaff.com | 555-123-4568 | Operational | 1 week ago | [Edit] [Email] [Call] |
| Mike Brown | Account Manager | mike@techstaff.com | 555-123-4569 | Billing | 2 weeks ago | [Edit] [Email] [Call] |

**3.3 Add New Contact**

- Click **[+ Add Contact]**
- Modal opens:

```
┌────────────────────────────────────────────────────────────┐
│ Add Vendor Contact                                    [X]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ First Name *              Last Name *                     │
│ ┌─────────────────────┐   ┌─────────────────────┐         │
│ │                     │   │                     │         │
│ └─────────────────────┘   └─────────────────────┘         │
│                                                            │
│ Title                                                      │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ e.g., Recruiter, Account Manager                    │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ Email *                   Phone                           │
│ ┌─────────────────────┐   ┌─────────────────────┐         │
│ │                     │   │                     │         │
│ └─────────────────────┘   └─────────────────────┘         │
│                                                            │
│ Relationship Type *                                        │
│ ○ Primary (main point of contact)                         │
│ ● Operational (day-to-day requirements)                   │
│ ○ Billing/Finance (invoicing, payments)                   │
│ ○ Executive (C-level, escalations)                        │
│ ○ Other                                                    │
│                                                            │
│ LinkedIn URL                                               │
│ ┌──────────────────────────────────────────────────────┐  │
│ │                                                      │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ Notes                                                      │
│ ┌──────────────────────────────────────────────────────┐  │
│ │                                                      │  │
│ │                                                      │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ [Cancel]                                      [Add Contact]│
└────────────────────────────────────────────────────────────┘
```

- Fill form and click **[Add Contact]**
- New contact added to vendor contact list
- System logs activity: "New contact added: [Name]"

**3.4 Update Contact Information**

- Click **[Edit]** next to contact name
- Update any fields (phone, email, title, notes)
- Click **[Save Changes]**
- System logs activity: "Contact updated: [Name]"

### Step 4: Track Vendor Communication History

**4.1 Click "Activity" Tab**

**4.2 Activity Timeline**

```
┌────────────────────────────────────────────────────────────────────┐
│ ACTIVITY TIMELINE                                 [Filter ▼] [Add] │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ 📧 Nov 28, 2025 - 2:30 PM - Email Sent                            │
│ To: john@techstaff.com                                            │
│ Subject: Follow-up on Java Developer Requirement #12345           │
│ Status: Opened (Nov 28, 3:15 PM)                                  │
│ [View Email] [Reply]                                              │
│                                                                    │
│ ─────────────────────────────────────────────────────────────────│
│                                                                    │
│ 📞 Nov 26, 2025 - 10:00 AM - Phone Call (Duration: 15 min)       │
│ With: John Smith                                                   │
│ Purpose: Weekly check-in call                                     │
│ Notes: Discussed upcoming requirements for Q1 2026. John          │
│        mentioned they have 5 new clients in healthcare vertical.  │
│        Requested updated hotlist for .NET developers.             │
│ Follow-up: Send hotlist by Nov 27                                 │
│ [View Details] [Edit Notes]                                       │
│                                                                    │
│ ─────────────────────────────────────────────────────────────────│
│                                                                    │
│ 💼 Nov 25, 2025 - 4:00 PM - Requirement Received                  │
│ Job: Senior Java Developer - NYC - $95/hr (Req #12345)           │
│ Status: In Progress (2 consultants submitted)                     │
│ [View Requirement] [Submit Consultant]                            │
│                                                                    │
│ ─────────────────────────────────────────────────────────────────│
│                                                                    │
│ 🤝 Nov 20, 2025 - Placement Made                                  │
│ Consultant: Jane Doe → Java Developer @ Acme Corp                │
│ Bill Rate: $100/hr | InTime Commission: $20/hr (20%)             │
│ Vendor Commission: $5/hr (5% per agreement)                       │
│ Start Date: Nov 27, 2025                                          │
│ [View Placement] [View Contract]                                  │
│                                                                    │
│ ─────────────────────────────────────────────────────────────────│
│                                                                    │
│ [Load More Activity...]                                            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**4.3 Log New Activity**

- Click **[Add]** or **[Log Call]** from Quick Actions
- Select activity type:
  - 📞 Phone Call
  - 📧 Email (manual log if not auto-synced)
  - 🤝 Meeting
  - 💼 Requirement Received
  - 📝 Note/Follow-up

**Example: Log Phone Call**

```
┌────────────────────────────────────────────────────────────┐
│ Log Phone Call - TechStaff Solutions                  [X]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Date & Time *                                              │
│ ┌─────────────────────┐  ┌──────────────────────┐         │
│ │ Nov 30, 2025        │  │ 2:00 PM          ▼  │         │
│ └─────────────────────┘  └──────────────────────┘         │
│                                                            │
│ Contact *                                                  │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ John Smith (VP of Partnerships)              ▼      │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ Call Direction *                                           │
│ ● Outbound (I called them)                                │
│ ○ Inbound (They called me)                                │
│                                                            │
│ Duration (minutes)                                         │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 20                                                   │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ Call Purpose *                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ [Select]                                         ▼  │  │
│ └──────────────────────────────────────────────────────┘  │
│ Options: Weekly check-in, Requirement discussion,         │
│          Commission dispute, Relationship review,          │
│          New opportunity, Other                            │
│                                                            │
│ Call Summary *                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Discussed Q1 requirements. John mentioned they have │  │
│ │ 3 new clients in fintech vertical looking for       │  │
│ │ Python/AWS consultants. Agreed to send updated      │  │
│ │ hotlist by Dec 2. Also reviewed payment for Invoice │  │
│ │ #1234 - confirmed payment will process this week.   │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ Follow-up Required?                                        │
│ ☑ Yes  Create follow-up task                             │
│                                                            │
│ Follow-up Action                                           │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Send Python/AWS hotlist to John                     │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ Follow-up Due Date                                         │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Dec 2, 2025                                      📅 │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ [Cancel]                                       [Log Call]  │
└────────────────────────────────────────────────────────────┘
```

- Click **[Log Call]**
- Activity added to timeline
- If follow-up task created, appears in **My Tasks**

### Step 5: Review Vendor Agreement & Commission Terms

**5.1 Click "Agreement" Tab**

**5.2 Agreement Overview**

```
┌────────────────────────────────────────────────────────────────────┐
│ VENDOR AGREEMENT DETAILS                                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ Agreement Type: Prime Vendor (InTime subcontracts to TechStaff)   │
│ Agreement Status: 🟢 Active                                        │
│                                                                    │
│ Effective Date: Jan 15, 2024                                      │
│ Expiration Date: Jan 14, 2026 (45 days remaining)                 │
│ Auto-Renew: Yes (90-day notice for non-renewal)                   │
│ Termination Notice: 30 days                                       │
│                                                                    │
│ Signed Agreement: [📄 TechStaff_Agreement_2024.pdf] [Download]    │
│ W-9 on File: [✅ Yes] Last Updated: Jan 10, 2024                  │
│ Insurance Certificate: [✅ Yes] Expires: Dec 31, 2025             │
│                                                                    │
│ ──────────────────────────────────────────────────────────────────│
│                                                                    │
│ CUSTOM COMMISSION TERMS (Negotiated)                              │
│                                                                    │
│ Commission Structure Type: Tiered Percentage                       │
│                                                                    │
│ Tier 1: First 5 placements/quarter                                │
│   - Vendor Commission: 5% of bill rate                            │
│   - InTime Margin: 20-25%                                         │
│                                                                    │
│ Tier 2: 6-10 placements/quarter                                   │
│   - Vendor Commission: 4% of bill rate (volume discount)          │
│   - InTime Margin: 21-26%                                         │
│                                                                    │
│ Tier 3: 11+ placements/quarter                                    │
│   - Vendor Commission: 3% of bill rate (max volume discount)      │
│   - InTime Margin: 22-27%                                         │
│                                                                    │
│ Current Quarter Performance: 4 placements (Tier 1)                │
│ Next placement will be at: 5% commission (still Tier 1)           │
│                                                                    │
│ ──────────────────────────────────────────────────────────────────│
│                                                                    │
│ PAYMENT TERMS                                                      │
│                                                                    │
│ Invoicing Frequency: Monthly (consolidated invoice)               │
│ Payment Terms: Net 30 days from invoice date                      │
│ Payment Method: ACH Direct Deposit                                │
│ Invoice Email: billing@techstaffsolutions.com                     │
│                                                                    │
│ Late Payment Terms: 1.5% monthly interest after 45 days           │
│                                                                    │
│ ──────────────────────────────────────────────────────────────────│
│                                                                    │
│ VOLUME COMMITMENT (Optional)                                       │
│                                                                    │
│ Minimum Placements/Quarter: 3 (to maintain preferred status)      │
│ Current Quarter: 4 placements ✅ Commitment met                   │
│                                                                    │
│ Bonus Incentive: If 15+ placements/quarter → Additional 0.5%      │
│                  discount on InTime margin (shared savings)        │
│                                                                    │
│ ──────────────────────────────────────────────────────────────────│
│                                                                    │
│ EXCLUSIVITY TERMS                                                  │
│                                                                    │
│ Exclusivity Type: First Right of Refusal                          │
│ Duration: 48 hours after requirement received                     │
│ Scope: Technology consultants in NY/NJ metro area                 │
│                                                                    │
│ If InTime does not respond within 48 hours, TechStaff may         │
│ submit consultants to other vendors for same requirement.         │
│                                                                    │
│ ──────────────────────────────────────────────────────────────────│
│                                                                    │
│ NON-COMPETE / NON-SOLICITATION                                     │
│                                                                    │
│ Non-Compete: 6 months post-termination                            │
│ Scope: InTime will not solicit TechStaff's placed consultants     │
│       TechStaff will not solicit InTime's end clients             │
│                                                                    │
│ Non-Solicitation: 12 months post-termination                      │
│ Scope: Neither party will hire the other's employees              │
│                                                                    │
│ [View Full Agreement] [Request Amendment] [Renew Agreement]       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**5.3 Actions:**

- **View Full Agreement:** Downloads signed PDF
- **Request Amendment:** Initiates amendment request workflow (requires manager/legal approval)
- **Renew Agreement:** Starts renewal process (if expiring soon)

### Step 6: Monitor Vendor Performance

**6.1 Click "Performance" Tab**

**6.2 Performance Dashboard**

```
┌────────────────────────────────────────────────────────────────────┐
│ VENDOR PERFORMANCE METRICS                     [Time Period: Q4 ▼] │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ 📊 FUNNEL METRICS (Oct 1 - Nov 30, 2025)                          │
│                                                                    │
│ ┌───────────────────────────────────────────────────────────────┐ │
│ │                                                               │ │
│ │  Requirements Received: 45                                    │ │
│ │  ├─→ Responded To: 41 (91% response rate) 🟢                 │ │
│ │  ├─→ Ignored/Skipped: 4 (9%)                                 │ │
│ │                                                               │ │
│ │  Consultants Submitted: 28 (to 25 unique requirements)        │ │
│ │  ├─→ Submit Rate: 61% (of responded requirements)            │ │
│ │  ├─→ Avg Submissions per Req: 1.1                            │ │
│ │                                                               │ │
│ │  Interviews Scheduled: 15 (53% of submissions) 🟢            │ │
│ │  ├─→ Client Interest Rate: 53%                               │ │
│ │                                                               │ │
│ │  Offers Extended: 7 (47% of interviews) 🟢                   │ │
│ │  ├─→ Offer Rate: 25% of submissions                          │ │
│ │                                                               │ │
│ │  Placements Made: 5 (71% offer acceptance) 🟢                │ │
│ │  ├─→ Fill Rate: 11% (placements / requirements received)     │ │
│ │  ├─→ Submission-to-Placement: 18%                            │ │
│ │                                                               │ │
│ └───────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ 💰 FINANCIAL METRICS                                               │
│                                                                    │
│  Total Revenue Generated: $45,280                                 │
│  ├─→ InTime Margin: $9,056 (20% avg)                             │
│  ├─→ Vendor Commission Paid: $2,264 (5% avg)                     │
│  ├─→ Consultant Pay: $34,416                                     │
│                                                                    │
│  Avg Bill Rate: $98/hr                                            │
│  Avg Pay Rate: $75/hr                                             │
│  Avg Margin: $23/hr (23.5%)                                       │
│                                                                    │
│  Revenue per Placement: $9,056                                    │
│  Commission per Placement: $453                                   │
│                                                                    │
│ ⏱️ SPEED METRICS                                                   │
│                                                                    │
│  Avg Response Time (to requirements): 2.3 hours 🟢               │
│  Avg Time to Submit (requirement → submission): 1.2 days 🟢       │
│  Avg Time to Interview (submission → interview): 3.5 days         │
│  Avg Time to Fill (requirement → placement): 12 days 🟢          │
│                                                                    │
│ 🎯 QUALITY METRICS                                                 │
│                                                                    │
│  Requirement Quality Score: 9.0/10 🟢                             │
│  ├─→ Clarity of specs (clear skills, rate, location): 9.5/10     │
│  ├─→ Responsiveness to questions: 9.0/10                         │
│  ├─→ Realistic expectations (rate, timeline): 8.5/10             │
│                                                                    │
│  Payment Timeliness: 9.5/10 🟢                                    │
│  ├─→ Avg Days to Payment: 25 days (5 days early)                 │
│  ├─→ Late Payments: 0 (past 12 months)                           │
│  ├─→ Disputed Invoices: 1 (resolved in 3 days)                   │
│                                                                    │
│  Relationship Quality: 9.0/10 🟢                                  │
│  ├─→ Communication responsiveness: 9.5/10                        │
│  ├─→ Collaboration/partnership approach: 9.0/10                  │
│  ├─→ Issue resolution: 8.5/10                                    │
│                                                                    │
│ 📈 TREND ANALYSIS                                                  │
│                                                                    │
│  Placements Trend (Last 6 Months):                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Month  │ Reqs │ Subs │ Placements │ Revenue  │ Trend      │  │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ Jun    │  12  │  8   │     1      │  $8.5K   │            │  │
│  │ Jul    │  15  │  10  │     2      │ $18.2K   │ ↗️         │  │
│  │ Aug    │  18  │  14  │     3      │ $27.1K   │ ↗️         │  │
│  │ Sep    │  20  │  16  │     3      │ $28.9K   │ →          │  │
│  │ Oct    │  25  │  18  │     4      │ $36.4K   │ ↗️         │  │
│  │ Nov    │  20  │  10  │     1      │  $8.9K   │ ↘️ ⚠️     │  │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ⚠️ Alert: Nov performance declined significantly                 │
│     Action: Schedule performance review call                      │
│                                                                    │
│ [Export Report] [Share with Manager] [Schedule Review]            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**6.3 Performance Score Calculation**

System auto-calculates **Overall Performance Score** based on weighted factors:

| Factor | Weight | Score | Weighted |
|--------|--------|-------|----------|
| Fill Rate (11%) | 20% | 7/10 | 1.4 |
| Response Time (2.3 hrs) | 15% | 9.5/10 | 1.4 |
| Payment Timeliness (Net 25) | 15% | 9.5/10 | 1.4 |
| Requirement Quality (9.0) | 10% | 9.0/10 | 0.9 |
| Relationship Quality (9.0) | 10% | 9.0/10 | 0.9 |
| Revenue Generated ($45K) | 15% | 9/10 | 1.4 |
| Submit Rate (61%) | 10% | 8/10 | 0.8 |
| Interview Rate (53%) | 5% | 9/10 | 0.5 |
| **Total** | **100%** | - | **9.2/10** ⭐⭐⭐⭐⭐ |

**Performance Tier Thresholds:**
- 9.0-10.0 = Tier 1 (Preferred Vendor) ⭐⭐⭐⭐⭐
- 7.5-8.9 = Tier 2 (Standard Vendor) ⭐⭐⭐⭐
- 6.0-7.4 = Tier 3 (Marginal Vendor) ⭐⭐⭐
- <6.0 = Tier 4 (Review/Probation) ⭐⭐

**Tier Benefits:**
- **Tier 1:** Priority access to hotlists, faster response, volume discounts
- **Tier 2:** Standard service
- **Tier 3:** Monthly performance reviews, improvement plan required
- **Tier 4:** 30-day probation, escalate to manager, consider termination

### Step 7: Track Commission Payments

**7.1 Navigate to Vendor Profile → "Performance" Tab → "Commissions" Section**

**7.2 Commission Tracking Table**

```
┌────────────────────────────────────────────────────────────────────┐
│ COMMISSION TRACKING                                [Export CSV]     │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ Filter: [All Time ▼] [Status: All ▼] [Search Invoice/Placement]   │
│                                                                    │
│ Current Quarter (Q4 2025) Summary:                                 │
│   Total Placements: 5                                              │
│   Total Commission Owed: $2,264                                    │
│   Total Commission Paid: $1,811 (80%)                              │
│   Outstanding Balance: $453 (Invoice #1238 pending)                │
│                                                                    │
│ ┌──────────────────────────────────────────────────────────────┐  │
│ │ Invoice # │ Date  │ Placement │ Bill  │ Comm% │ Amt  │ Status││  │
│ ├──────────────────────────────────────────────────────────────┤  │
│ │ 1238      │12/01  │Jane→Acme │$100/hr│  5%   │$453  │Pending││  │
│ │           │       │Nov-Dec   │       │       │      │       ││  │
│ │           │       │[View]    │       │       │[Pay Now]     ││  │
│ │                                                              │  │
│ │ 1235      │11/15  │Tom→XYZ   │$95/hr │  5%   │$428  │✅Paid││  │
│ │           │       │Nov       │       │       │      │11/20  ││  │
│ │           │       │[View]    │       │       │      │       ││  │
│ │                                                              │  │
│ │ 1232      │11/01  │Lisa→ABC  │$98/hr │  5%   │$441  │✅Paid││  │
│ │           │       │Nov       │       │       │      │11/05  ││  │
│ │                                                              │  │
│ │ 1229      │10/15  │John→DEF  │$105/hr│  5%   │$473  │✅Paid││  │
│ │           │       │Oct       │       │       │      │10/20  ││  │
│ │                                                              │  │
│ │ 1226      │10/01  │Sarah→GHI │$92/hr │  5%   │$414  │✅Paid││  │
│ │           │       │Oct       │       │       │      │10/05  ││  │
│ │                                                              │  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ [Reconcile Payments] [Dispute Invoice] [Generate Statement]       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**7.3 Commission Calculation Example**

**Placement Details:**
- Consultant: Jane Doe
- Client: Acme Corp (via TechStaff vendor)
- Bill Rate: $100/hr
- Pay Rate: $75/hr (to consultant)
- Hours Worked (Nov 2025): 160 hours

**Rate Stack:**
- Client pays vendor (TechStaff): $100/hr × 160 = $16,000
- Vendor pays InTime: $95/hr × 160 = $15,200 (vendor keeps $800 or 5%)
- InTime pays consultant: $75/hr × 160 = $12,000
- InTime margin: $15,200 - $12,000 = $3,200 (20%)

**OR (if InTime is prime and TechStaff is subcontractor):**
- Client pays InTime: $100/hr × 160 = $16,000
- InTime pays consultant: $75/hr × 160 = $12,000
- InTime commission to TechStaff (5% of bill rate): $100 × 0.05 × 160 = $800
- InTime net margin: $16,000 - $12,000 - $800 = $3,200 (20%)

**Invoice Generated:**
- Invoice #1238
- Amount Due: $800 (for Nov 2025)
- Due Date: Dec 31, 2025 (Net 30)
- Status: Pending (awaiting payment)

**7.4 Mark Invoice as Paid**

- When Finance processes payment, they update invoice status:
  - Navigate to Invoice #1238
  - Click **[Mark as Paid]**
  - Enter payment details:
    - Payment Date: [Date]
    - Payment Method: ACH
    - Payment Reference: [Check/ACH number]
    - Notes: [Optional]
  - Click **[Confirm Payment]**
- System updates invoice status to ✅ Paid
- Vendor can view payment status in their portal (if vendor portal access enabled)

### Step 8: Handle Commission Disputes

**8.1 Vendor Disputes Commission**

**Trigger:** Vendor emails: "Invoice #1238 shows $800 but our agreement says 10%, should be $1,600"

**8.2 Initiate Dispute Resolution**

- Navigate to Invoice #1238
- Click **[Dispute Invoice]**
- Modal opens:

```
┌────────────────────────────────────────────────────────────┐
│ Dispute Invoice #1238                                 [X]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Dispute Initiated By:                                      │
│ ● Vendor (TechStaff Solutions)                            │
│ ○ InTime (us)                                             │
│                                                            │
│ Dispute Type:                                              │
│ ● Commission Rate Discrepancy                             │
│ ○ Hours Worked Mismatch                                   │
│ ○ Calculation Error                                       │
│ ○ Missing Placement                                       │
│ ○ Other                                                    │
│                                                            │
│ Vendor's Claim:                                            │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Vendor claims commission should be 10% ($1,600)     │  │
│ │ instead of 5% ($800) as shown on invoice.           │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ Our Position:                                              │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Agreement Section 4.2 clearly states 5% commission  │  │
│ │ for Tier 1 (1-5 placements/quarter). This is the    │  │
│ │ 4th placement in Q4, so 5% applies.                 │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ Supporting Documents:                                      │
│ [+ Upload Agreement Excerpt] [+ Upload Email Trail]       │
│                                                            │
│ Escalation:                                                │
│ ☑ Notify Bench Sales Manager                             │
│ ☑ Notify Finance Team                                    │
│ ☐ Escalate to Legal (if unresolved)                      │
│                                                            │
│ [Cancel]                              [Submit Dispute]    │
└────────────────────────────────────────────────────────────┘
```

- Click **[Submit Dispute]**
- System:
  - Updates invoice status to **🔴 Disputed**
  - Notifies Manager and Finance
  - Creates task: "Resolve commission dispute with TechStaff - Invoice #1238"
  - Pauses payment processing until resolved

**8.3 Resolution Process**

1. **Manager Reviews Dispute**
   - Reviews vendor agreement (Section 4.2)
   - Confirms commission tier calculation
   - Checks placement count for quarter

2. **Determine Correct Commission**
   - In this case: Agreement clearly states 5% for Tier 1
   - Vendor is incorrect

3. **Communicate Resolution**
   - Manager emails vendor:
     ```
     Subject: RE: Commission Dispute - Invoice #1238

     Hi John,

     Thank you for bringing this to our attention. I've reviewed our
     agreement (attached, Section 4.2) and our Q4 placement count.

     Per our tiered commission structure:
     - Tier 1 (1-5 placements/quarter): 5% commission
     - Tier 2 (6-10 placements/quarter): 4% commission
     - Tier 3 (11+ placements/quarter): 3% commission

     This placement is the 4th in Q4 2025, placing it in Tier 1,
     so the correct commission is 5% ($800).

     If your next placement (5th in Q4) closes before Dec 31, you'll
     remain at 5%. The 6th placement would move you to Tier 2 (4%).

     Let me know if you'd like to discuss further or if you have
     questions about the tier structure.

     Best,
     [Manager Name]
     ```

4. **Update System**
   - If vendor accepts resolution:
     - Update invoice status: **🟢 Resolved - No Change**
     - Proceed with payment of $800
     - Log resolution in activity timeline
   - If vendor disputes further:
     - Escalate to Regional Director and Legal
     - Hold payment pending legal review

### Step 9: Vendor Relationship Review (Quarterly)

**9.1 Schedule Quarterly Review**

- System auto-generates task at end of each quarter:
  - "Conduct Q4 2025 vendor review for TechStaff Solutions"
  - Due: Jan 15, 2026

**9.2 Review Agenda**

1. **Performance Review** (15 min)
   - Review performance metrics dashboard
   - Discuss trends (positive and negative)
   - Address any concerns

2. **Pipeline Review** (10 min)
   - Current open requirements
   - Upcoming opportunities
   - Skills in demand

3. **Commission & Payment Review** (5 min)
   - Review commission payments (any disputes?)
   - Confirm payment terms still work for both parties

4. **Relationship Feedback** (10 min)
   - What's working well?
   - What could improve?
   - Any issues to address?

5. **Strategic Planning** (10 min)
   - Goals for next quarter
   - New client/vertical opportunities
   - Volume commitments

6. **Action Items** (5 min)
   - Document follow-ups
   - Set next review date

**9.3 Document Review Outcomes**

- Log meeting notes in Activity Timeline
- Update vendor rating/tier if performance changed
- Create follow-up tasks as needed
- Share summary with Manager

---

## 6. Alternative Flows

(Continue with Alternative Flows, Exception Flows, Business Rules, etc. - Similar structure to previous documents)

---

## 19. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-30 | InTime v3 Product Team | Initial document creation |
