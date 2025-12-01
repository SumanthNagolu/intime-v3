# UC-RD-006: Multi-Country Compliance Management

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** Regional Director
**Status:** Approved

---

## 1. Overview

The Regional Director is responsible for ensuring comprehensive compliance across all countries within their region, covering employment law, immigration, tax, data privacy, and industry-specific regulations. This use case covers the systems, workflows, and controls required to maintain compliance in a multi-jurisdictional staffing environment, with primary focus on US + Canada operations.

**Critical Success Factors:**
- Zero major compliance violations
- 100% immigration status tracking and renewal
- Full labor law compliance in all jurisdictions
- Data privacy regulatory adherence (GDPR, CCPA, etc.)
- Audit-ready documentation and controls

---

## 2. Actors

- **Primary:** Regional Director
- **Secondary:** Country Managers, HR Manager, Legal Counsel, Finance/Tax Team
- **System:** InTime Compliance Module, Immigration Tracker, Audit Management System
- **External:** Government agencies (USCIS, IRCC, DOL, CRA), Legal firms, Auditors

---

## 3. Preconditions

- Regional Director has full access to compliance dashboards
- Legal and HR teams are established in each country
- Compliance policies documented and approved
- Immigration tracking system implemented
- Audit trails enabled on all system changes
- External legal counsel retained for each jurisdiction

---

## 4. Trigger

**Continuous monitoring with event-based interventions:**
- Daily: Immigration expiry alerts
- Weekly: Compliance dashboard review
- Monthly: Country compliance reports
- Quarterly: Legal and audit reviews
- Annually: Policy updates and training
- Ad-hoc: Regulatory changes, violations, audits

---

## 5. Main Flow: Continuous Compliance Management

### 5.1 Daily Immigration Monitoring

**Step 1: Review Immigration Alert Dashboard**

Regional Director reviews daily alert feed:

```
┌──────────────────────────────────────────────────────────────────┐
│ IMMIGRATION COMPLIANCE DASHBOARD                    [Settings]   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Alert Summary (Americas Region)                                  │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│ │ 🔴 Critical│ │ 🟠 Warning│ │ 🟡 Monitor│ │ 🟢 Valid │             │
│ │     3     │ │    12    │ │    45    │ │   892    │             │
│ │ <30 days  │ │ 30-90 day│ │90-180 day│ │  >180 day│             │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
│                                                                   │
│ CRITICAL: Action Required < 30 Days                              │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ Name          │ Visa Type │ Expiry    │ Status  │ Action  │   │
│ ├───────────────┼───────────┼───────────┼─────────┼─────────┤   │
│ │ Priya Kumar   │ H1B       │ Dec 15    │ 🔴 15d  │ [Act]   │   │
│ │ Juan Martinez │ TN        │ Dec 22    │ 🔴 22d  │ [Act]   │   │
│ │ Li Chen       │ OPT       │ Dec 28    │ 🔴 28d  │ [Act]   │   │
│ └───────────────┴───────────┴───────────┴─────────┴─────────┘   │
│                                                                   │
│ WARNING: Renewal Planning 30-90 Days                             │
│ [View All 12 Cases]                                              │
│                                                                   │
│ By Country:  [USA: 8] [Canada: 4] [Mexico: 3]                   │
│ By Pod:      [View Breakdown]                                    │
│ By Visa Type: [H1B: 5] [OPT/STEM: 4] [TN: 2] [Other: 4]        │
│                                                                   │
│ [Export Report] [Schedule Review] [Escalate to HR] [Settings]   │
└──────────────────────────────────────────────────────────────────┘
```

**Step 2: Drill into Critical Cases**

For each critical case (< 30 days), Regional Director verifies:
- Current placement status (billable, bench, notice period)
- Renewal application status (not started, in progress, pending approval)
- Pod Manager awareness and action plan
- HR/Immigration counsel involvement
- Backup plan if renewal fails

**Step 3: Escalate as Needed**

```
┌─────────────────────────────────────────────────────────────┐
│ Immigration Case: Priya Kumar                          [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Current Status                                              │
│ ├─ Visa Type: H1B (Employer: InTime Inc.)                  │
│ ├─ Expiry: December 15, 2025 (🔴 15 days)                  │
│ ├─ I-94 Expiry: December 15, 2025                          │
│ ├─ Passport Expiry: March 2027 ✓                           │
│ ├─ Current Placement: Google (Active, billable)            │
│ └─ Responsible: Pod Manager - Raj Patel                    │
│                                                             │
│ Renewal Status: ⚠️ NOT STARTED                             │
│                                                             │
│ Risk Assessment: 🔴 HIGH RISK                              │
│ - H1B transfer typically takes 3-6 months                  │
│ - Premium processing unavailable                           │
│ - Must stop work if I-94 expires                           │
│ - Client project critical path dependency                  │
│                                                             │
│ Recommended Actions:                                        │
│ ☐ Immediate escalation to Immigration Counsel              │
│ ☐ File extension/transfer with premium (if eligible)       │
│ ☐ Notify client of potential staffing change               │
│ ☐ Identify backup consultant                               │
│ ☐ Daily status tracking until resolved                     │
│                                                             │
│ [Escalate to HR] [Assign Legal] [Email Pod Mgr] [Log]     │
└─────────────────────────────────────────────────────────────┘
```

Regional Director actions:
- Immediately escalate to HR Manager and Immigration Counsel
- Email Pod Manager with URGENT flag
- Log case in executive risk register
- Schedule daily check-in until resolved

### 5.2 Weekly Compliance Dashboard Review

**Step 1: Review Regional Compliance Scorecard**

Every Monday morning, Regional Director reviews comprehensive compliance status:

```
┌──────────────────────────────────────────────────────────────────┐
│ REGIONAL COMPLIANCE SCORECARD - AMERICAS            Week 48/2025 │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Overall Compliance Rating: 🟢 COMPLIANT (Score: 94/100)          │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐  │
│ │ CATEGORY               │ Status │ Score │ Trend │ Alerts   │  │
│ ├────────────────────────┼────────┼───────┼───────┼──────────┤  │
│ │ Immigration            │  🟡    │ 88/100│  ↑    │ 15 warn  │  │
│ │ Employment Law (US)    │  🟢    │ 98/100│  →    │ 0        │  │
│ │ Employment Law (CAN)   │  🟢    │ 95/100│  →    │ 1 minor  │  │
│ │ Employment Law (MEX)   │  🟡    │ 85/100│  ↓    │ 3 warn   │  │
│ │ Tax Compliance         │  🟢    │ 99/100│  →    │ 0        │  │
│ │ Data Privacy (CCPA)    │  🟢    │ 96/100│  ↑    │ 0        │  │
│ │ Industry Certifications│  🟢    │ 92/100│  →    │ 2 pending│  │
│ │ Audit Readiness        │  🟢    │ 97/100│  →    │ 0        │  │
│ └────────────────────────┴────────┴───────┴───────┴──────────┘  │
│                                                                   │
│ Recent Violations (Last 30 Days)                                 │
│ ┌─────────────────────────────────────────────────────────────┐  │
│ │ Date  │ Type    │ Severity │ Country │ Status    │ Owner   │  │
│ ├───────┼─────────┼──────────┼─────────┼───────────┼─────────┤  │
│ │ Nov 22│ OT Pay  │ Minor    │ USA-CA  │ Resolved  │ HR Mgr  │  │
│ │ Nov 18│ I-9 Gap │ Minor    │ USA     │ Remediated│ HR Mgr  │  │
│ └───────┴─────────┴──────────┴─────────┴───────────┴─────────┘  │
│                                                                   │
│ Upcoming Audits & Inspections                                    │
│ ├─ DOL Wage & Hour Review (USA): Q1 2026 (scheduled)             │
│ ├─ I-9 Internal Audit: January 2026 (planned)                    │
│ └─ State Tax Audit (California): In Progress (since Oct)         │
│                                                                   │
│ Training Compliance                                              │
│ ├─ Required Training Completion: 97% (Target: 100%)             │
│ ├─ Overdue Employees: 12 (down from 18 last week)               │
│ └─ Next Training Cycle: Anti-Harassment (Jan 2026)              │
│                                                                   │
│ [Drill Down by Country] [View Violations] [Export] [Settings]   │
└──────────────────────────────────────────────────────────────────┘
```

**Step 2: Investigate Yellow/Red Categories**

Regional Director clicks on Immigration (🟡) to investigate:

```
┌──────────────────────────────────────────────────────────────────┐
│ IMMIGRATION COMPLIANCE DETAIL - AMERICAS                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Score Breakdown: 88/100 (🟡 Warning - Below Target 95)           │
│                                                                   │
│ Issues Identified:                                               │
│ ┌─────────────────────────────────────────────────────────────┐  │
│ │ Issue                      │ Impact │ Count │ Deadline      │  │
│ ├────────────────────────────┼────────┼───────┼───────────────┤  │
│ │ Expiring < 30 days         │  🔴    │   3   │ Immediate     │  │
│ │ Expiring 30-90 days        │  🟠    │  12   │ Start renewal │  │
│ │ Missing passport scans     │  🟡    │   8   │ 30 days       │  │
│ │ EAD renewal pending        │  🟠    │   5   │ In progress   │  │
│ │ H1B transfer in process    │  🟡    │   7   │ Monitoring    │  │
│ └────────────────────────────┴────────┴───────┴───────────────┘  │
│                                                                   │
│ Root Causes (Last 90 Days):                                      │
│ 1. Late notification from employees (40% of warnings)            │
│ 2. Immigration counsel processing delays (30%)                   │
│ 3. Premium processing unavailability (20%)                       │
│ 4. Incomplete documentation from employees (10%)                 │
│                                                                   │
│ Corrective Actions Implemented:                                  │
│ ☑ Automated 180-day advance alerts to employees                 │
│ ☑ Monthly reminders to Pod Managers                             │
│ ☐ Engagement of second immigration law firm (in progress)       │
│ ☐ Employee self-service portal for doc upload (planned Q1)      │
│                                                                   │
│ [Assign Actions] [Schedule Review] [Email HR] [Export Report]   │
└──────────────────────────────────────────────────────────────────┘
```

**Step 3: Assign Follow-up Actions**

Regional Director assigns corrective actions with deadlines:

```
Action Plan Created:
├─ HR Manager: Engage backup immigration counsel (Due: Dec 5)
├─ IT Team: Expedite employee self-service portal (Due: Jan 15)
├─ Pod Managers: Review all consultants >90 days to expiry (Due: Dec 10)
└─ Regional Director: Monthly immigration review with HR (Recurring)
```

### 5.3 Monthly Country Compliance Reports

**Step 1: Review Country Manager Submissions**

Each country manager submits monthly compliance certification:

```
┌──────────────────────────────────────────────────────────────────┐
│ COUNTRY COMPLIANCE REPORT - UNITED STATES          November 2025 │
├──────────────────────────────────────────────────────────────────┤
│ Submitted by: Sarah Johnson (Country Manager - USA)              │
│ Reviewed by: [Pending Regional Director Review]                  │
│                                                                   │
│ CERTIFICATION STATEMENT:                                         │
│ ☑ I certify that to the best of my knowledge, InTime Inc. (USA)  │
│   is in compliance with all applicable federal, state, and local │
│   employment laws, immigration regulations, tax requirements, and │
│   data privacy laws as of November 30, 2025.                     │
│                                                                   │
│ COMPLIANCE CHECKLIST (100% Complete):                            │
│                                                                   │
│ Federal Compliance                                               │
│ ☑ FLSA compliance (all non-exempt properly classified/paid)      │
│ ☑ I-9 verification completed for all new hires                   │
│ ☑ Equal Employment Opportunity (no discrimination complaints)    │
│ ☑ OSHA workplace safety requirements met                         │
│ ☑ Federal tax withholding and reporting current                  │
│ ☑ COBRA notifications sent to eligible employees                 │
│ ☑ FMLA tracking and compliance (12+ weeks)                       │
│ ☑ Affordable Care Act (ACA) compliance                           │
│                                                                   │
│ State Compliance (Multi-State Operations)                        │
│ ☑ California: Wage orders, meal breaks, sick leave compliance    │
│ ☑ New York: Wage theft prevention, sexual harassment training    │
│ ☑ Texas: Workers' comp, state tax filings current                │
│ ☑ All other states: Local compliance verified                    │
│                                                                   │
│ Immigration Compliance                                           │
│ ☑ H1B LCA postings maintained (public access files)              │
│ ☑ No unauthorized workers identified                             │
│ ☑ Immigration renewals tracked (see separate dashboard)          │
│ ☑ E-Verify usage for OPT/STEM employees                          │
│                                                                   │
│ Data Privacy (CCPA)                                              │
│ ☑ Consumer requests handled within 45 days (3 requests/month)    │
│ ☑ Privacy policy updated and posted                              │
│ ☑ Vendor data processing agreements in place                     │
│ ☑ Data breach response plan tested (last: Oct 2025)              │
│                                                                   │
│ Issues & Remediation:                                            │
│ 1. Minor I-9 documentation gap (2 cases) - RESOLVED Nov 20       │
│    Action: Re-verified employment authorization, forms updated   │
│                                                                   │
│ 2. California overtime miscalculation (1 employee) - RESOLVED    │
│    Action: Retroactive payment issued, payroll system updated    │
│                                                                   │
│ Upcoming Compliance Activities:                                  │
│ ├─ Annual harassment prevention training: January 2026           │
│ ├─ I-9 self-audit: January 2026                                  │
│ └─ Benefits compliance review: Q1 2026                           │
│                                                                   │
│ [Approve] [Request Changes] [Flag for Review] [Export]           │
└──────────────────────────────────────────────────────────────────┘
```

**Step 2: Review and Approve/Challenge**

Regional Director reviews each country report:
- Verify certifications align with known issues
- Check for any red flags or omissions
- Review remediation actions for effectiveness
- Assess upcoming compliance needs
- Approve or request additional information

**Step 3: Aggregate Regional View**

System aggregates all country reports into regional summary for CEO/CFO reporting.

---

## 6. Alternative Flows

### 6.1 Regulatory Change Management

**Trigger:** New employment law, immigration policy, or data privacy regulation enacted

**Flow:**

```
[Regulation Announced] → [Legal Counsel Assessment] → [Impact Analysis] →
[Policy Update] → [System Changes] → [Training] → [Compliance Monitoring]
```

**Example: New State Salary Transparency Law**

```
Step 1: Legal Alert Received
├─ California enacts pay transparency law (effective Jan 1, 2026)
├─ Requires salary ranges in all job postings
└─ Penalties: $100-$10,000 per violation

Step 2: Regional Director Coordinates Response
├─ Legal Counsel: Detailed analysis and recommendations
├─ HR: Policy draft and salary band review
├─ IT: System updates to job posting templates
├─ Ops: Training for recruiters
└─ Deadline: December 15, 2025 (2 weeks before effective date)

Step 3: Implementation
├─ Policy approved and communicated
├─ Job posting templates updated in InTime
├─ Recruiter training completed (attendance: 100%)
├─ Existing job postings updated
└─ Compliance monitoring activated

Step 4: Ongoing Monitoring
├─ Weekly audits of new job postings
├─ Monthly compliance reports
└─ Quarterly legal review
```

### 6.2 Compliance Violation Response

**Trigger:** Violation identified (internal audit, employee complaint, government notice)

**Flow:**

```
[Violation Detected] → [Immediate Containment] → [Root Cause Analysis] →
[Remediation] → [Corrective Action] → [Monitoring] → [Report to Leadership]
```

**Example: Unauthorized Worker Discovered**

```
┌─────────────────────────────────────────────────────────────┐
│ COMPLIANCE INCIDENT REPORT                           [URGENT]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Incident ID: INC-2025-1142                                  │
│ Severity: 🔴 CRITICAL                                       │
│ Category: Immigration Violation                             │
│ Country: United States                                      │
│ Discovered: November 28, 2025 10:30 AM EST                  │
│ Reported by: HR Manager - Jane Smith                        │
│                                                             │
│ INCIDENT SUMMARY:                                           │
│ During routine I-9 audit, discovered employee (John Doe,    │
│ EMP-12345) has been working on expired OPT authorization.   │
│ EAD expired: October 15, 2025 (44 days ago)                 │
│ Employee continued billing to client.                       │
│                                                             │
│ IMMEDIATE ACTIONS TAKEN (Within 2 hours):                   │
│ ☑ Employee removed from client assignment (10:45 AM)        │
│ ☑ Billing to client stopped (10:45 AM)                      │
│ ☑ Employee placed on unpaid leave (11:00 AM)               │
│ ☑ Immigration counsel contacted (11:15 AM)                  │
│ ☑ Legal counsel notified (11:30 AM)                         │
│ ☑ Regional Director and COO escalation (12:00 PM)          │
│                                                             │
│ ROOT CAUSE ANALYSIS:                                        │
│ 1. Employee failed to notify HR of EAD expiry               │
│ 2. Automated alert system failed (IT investigating)         │
│ 3. Pod Manager did not verify work authorization            │
│ 4. Monthly I-9 audit missed this case                       │
│                                                             │
│ REMEDIATION PLAN:                                           │
│ Immediate (0-7 days):                                       │
│ ├─ File for EAD renewal (if eligible) - URGENT             │
│ ├─ Self-disclosure to government (legal counsel advising)   │
│ ├─ Credit client for unauthorized billing                   │
│ └─ Disciplinary action per policy                          │
│                                                             │
│ Short-term (7-30 days):                                     │
│ ├─ Fix automated alert system                              │
│ ├─ Re-audit all OPT/EAD employees (100% verification)      │
│ ├─ Mandatory training: Pod Managers on work auth           │
│ └─ Enhanced I-9 audit procedures                           │
│                                                             │
│ Long-term (30-90 days):                                     │
│ ├─ Implement employee self-certification (monthly)          │
│ ├─ Redundant alert system (email + SMS + manager notify)   │
│ ├─ Quarterly legal compliance review                        │
│ └─ Policy update and company-wide communication            │
│                                                             │
│ FINANCIAL IMPACT:                                           │
│ ├─ Client credit: $12,600 (44 days × 8 hrs × $71.43/hr)    │
│ ├─ Legal fees (estimated): $15,000                         │
│ ├─ Potential government fines: $0 - $25,000 (TBD)          │
│ └─ Total exposure: $27,600 - $52,600                       │
│                                                             │
│ REGULATORY REPORTING:                                       │
│ ☐ USCIS notification (legal counsel preparing)             │
│ ☐ DOL notification (if required - TBD)                     │
│ ☑ Internal audit log updated                               │
│ ☑ Board notification (if material - TBD by CEO)            │
│                                                             │
│ Responsible: Regional Director - Michael Chen               │
│ Next Review: Daily until resolved                           │
│                                                             │
│ [Update Status] [Add Note] [Assign Task] [Escalate]        │
└─────────────────────────────────────────────────────────────┘
```

Regional Director Actions:
1. Chair daily incident response meeting until resolved
2. Direct communication with client (apologize, credit billing, ensure no relationship damage)
3. Coordinate with Legal Counsel on government self-disclosure
4. Review and approve all corrective actions
5. Report to CEO/COO with full transparency
6. Post-incident review and lessons learned documentation

---

## 7. Exception Flows

### 7.1 Government Audit or Inspection

**Trigger:** Notice of audit from DOL, USCIS, state agency, or tax authority

**Critical Timeline:**
- Hour 0: Notice received
- Hour 1: Legal counsel engaged, Regional Director notified
- Hour 2-4: Audit team assembled, initial document review
- Day 1: Response plan finalized
- Days 2-30: Audit cooperation and response
- Days 30-90: Post-audit remediation (if needed)

**Audit Response Protocol:**

```
┌─────────────────────────────────────────────────────────────┐
│ GOVERNMENT AUDIT RESPONSE - DOL WAGE & HOUR INVESTIGATION   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Audit Notice Received: November 25, 2025                    │
│ Agency: U.S. Department of Labor, Wage & Hour Division      │
│ Scope: California operations, Q3-Q4 2024                    │
│ Focus Areas: Overtime pay, independent contractor class.    │
│ Document Request Deadline: December 9, 2025 (14 days)       │
│                                                             │
│ AUDIT RESPONSE TEAM:                                        │
│ ├─ Lead: Regional Director (Michael Chen)                   │
│ ├─ Legal Counsel: External employment attorney              │
│ ├─ HR Manager: Jane Smith                                   │
│ ├─ Finance Director: Kevin Park                             │
│ ├─ Country Manager (USA): Sarah Johnson                     │
│ └─ IT Support: For data extraction                         │
│                                                             │
│ DOCUMENT REQUEST CHECKLIST:                                 │
│ Payroll Records (Q3-Q4 2024):                              │
│ ☑ Time records for all non-exempt employees                │
│ ☑ Payroll registers with overtime calculations              │
│ ☑ Exempt vs. non-exempt classifications                     │
│ ☑ Independent contractor agreements and payments            │
│                                                             │
│ Policies & Procedures:                                      │
│ ☑ Timekeeping policy                                        │
│ ☑ Overtime approval procedures                              │
│ ☑ Independent contractor classification criteria            │
│ ☑ Wage & hour training materials                           │
│                                                             │
│ Employee Information:                                       │
│ ☑ Job descriptions for all positions                        │
│ ☑ Offer letters and employment agreements                   │
│ ☑ Organizational charts                                     │
│ ☑ Employee handbooks                                        │
│                                                             │
│ PRELIMINARY RISK ASSESSMENT:                                │
│ Low Risk:                                                   │
│ ├─ Timekeeping records comprehensive and accurate           │
│ ├─ Overtime properly calculated and paid                    │
│ └─ Independent contractor usage minimal and proper          │
│                                                             │
│ Medium Risk:                                                │
│ ├─ Some ambiguous exempt classifications (managers)         │
│ ├─ A few timekeeping gaps (off-the-clock work claims?)      │
│ └─ Potential misclassification of 2-3 contractors           │
│                                                             │
│ High Risk:                                                  │
│ ├─ None identified                                          │
│                                                             │
│ RESPONSE STRATEGY:                                          │
│ 1. Full cooperation and transparency with DOL               │
│ 2. Provide all requested documents on time                  │
│ 3. Legal counsel to review before submission                │
│ 4. Prepare written responses to any findings                │
│ 5. Self-disclose any issues discovered during review        │
│ 6. Implement immediate remediation if needed                │
│                                                             │
│ ESTIMATED COST:                                             │
│ ├─ Legal fees: $25,000 - $50,000                           │
│ ├─ Internal labor (1,000+ hours): $75,000 equivalent       │
│ ├─ Potential back pay (if violations found): $0 - $100,000 │
│ ├─ Penalties (if violations found): $0 - $50,000           │
│ └─ Total potential cost: $100,000 - $275,000               │
│                                                             │
│ COMMUNICATION PLAN:                                         │
│ ├─ CEO/COO: Daily updates during audit                     │
│ ├─ Board: Notify if material findings expected              │
│ ├─ Employees: Limited communication (legal advice)          │
│ └─ External: No public disclosure unless required          │
│                                                             │
│ [Upload Documents] [Schedule Call] [Update Status] [Log]   │
└─────────────────────────────────────────────────────────────┘
```

**Regional Director Responsibilities:**
- Chair audit response team meetings
- Allocate resources and budget for audit response
- Ensure document production deadlines met
- Review all submissions before sending to government
- Coordinate with Legal Counsel on strategy
- Make decisions on settlements or disputes
- Report regularly to CEO/Board
- Oversee post-audit remediation
- Document lessons learned for future prevention

### 7.2 Cross-Border Employment Complexity

**Trigger:** Need to employ consultants across US-Canada border

**Scenarios:**
1. US citizen working remotely from Canada for US client
2. Canadian PR working in US on TN visa
3. Dual employment (Canada payroll, US client project)
4. Cross-border travel for short-term projects

**Compliance Considerations:**

```
┌──────────────────────────────────────────────────────────────────┐
│ CROSS-BORDER EMPLOYMENT ANALYSIS                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Scenario: Canadian resident working for US client                │
│                                                                   │
│ Employee Details:                                                │
│ ├─ Name: Robert Singh                                            │
│ ├─ Citizenship: India                                            │
│ ├─ Immigration Status: Canada Permanent Resident                 │
│ ├─ Residence: Toronto, ON, Canada                                │
│ └─ Client: Acme Corp (USA - New York)                            │
│                                                                   │
│ Work Arrangement: Remote from Canada (100%), no US travel        │
│                                                                   │
│ COMPLIANCE MATRIX:                                               │
│                                                                   │
│ Canada Considerations:                                           │
│ ☑ Employment contract: Canadian entity (InTime Canada Ltd.)      │
│ ☑ Payroll: Canadian payroll with CPP, EI, income tax withhold   │
│ ☑ Benefits: Canadian benefits (provincial health supplement)     │
│ ☑ Labor law: Canada Labour Code applies (federal)                │
│ ☑ Ontario ESA: Employment Standards Act compliance               │
│ ☑ Work hours: 8hr/day, 40hr/wk standard, 1.5x OT after 44hr     │
│ ☑ Vacation: Minimum 2 weeks (10 days) annual                     │
│ ☑ Notice period: 2 weeks minimum (depends on tenure)             │
│ ☑ Statutory holidays: 9 federal holidays                         │
│                                                                   │
│ United States Considerations:                                    │
│ ☑ Work authorization: NONE REQUIRED (remote from Canada)         │
│ ☑ US income tax: NO (no US source income, no physical presence)  │
│ ☑ State tax: NO (not in US state)                               │
│ ☑ Client compliance: Must not create US tax nexus               │
│ ☑ Data privacy: CCPA may apply if handling CA resident data     │
│ ☐ Business visitor: If traveling to US, B-1 or TN visa needed   │
│                                                                   │
│ Billing & Invoicing:                                             │
│ ├─ InTime Canada invoices US client in USD                       │
│ ├─ Payment via wire transfer to Canadian bank account            │
│ ├─ Currency exchange risk managed by Finance                     │
│ ├─ GST/HST may apply (Canadian sales tax) - 13% in Ontario      │
│ └─ US client may require W-8BEN-E form (tax treaty)             │
│                                                                   │
│ Transfer Pricing:                                                │
│ ├─ Arm's length pricing between InTime Inc. and InTime Canada    │
│ ├─ Management fee or markup on Canadian costs                    │
│ ├─ CRA and IRS transfer pricing documentation required           │
│ └─ Annual TP study by external tax advisor                       │
│                                                                   │
│ RECOMMENDED STRUCTURE: ✓ APPROVED                                │
│                                                                   │
│ Employment: InTime Canada Ltd. (Canadian payroll)                │
│ Client billing: InTime Inc. bills Acme Corp (USD)                │
│ Intercompany: InTime Canada invoices InTime Inc. (cost + markup) │
│ Work location: 100% remote from Canada                           │
│ US travel: PROHIBITED without proper visa (TN or B-1)            │
│                                                                   │
│ RISK MITIGATION:                                                 │
│ ☑ Legal opinion obtained from Canadian and US counsel            │
│ ☑ Tax treatment confirmed by CPA and Canadian accountant         │
│ ☑ Contract language reviewed and approved                        │
│ ☑ Client informed of consultant's location                       │
│ ☑ Time tracking system shows work location = Canada              │
│ ☑ No US business presence created                               │
│                                                                   │
│ Ongoing Monitoring:                                              │
│ ├─ Quarterly review of tax compliance                            │
│ ├─ Annual transfer pricing documentation update                  │
│ ├─ Track any US travel (must get visa before travel)             │
│ └─ Monitor changes to Canada/US tax treaty                       │
│                                                                   │
│ [Approve Setup] [Request Legal Review] [Flag Issue] [Export]    │
└──────────────────────────────────────────────────────────────────┘
```

**Regional Director Decision Points:**
- Approve cross-border employment structure
- Ensure legal and tax review completed
- Verify compliance with both countries' laws
- Monitor ongoing compliance and risks
- Approve any changes to structure

---

## 8. Postconditions

**After successful compliance management:**
- Regional compliance score remains > 95/100
- Zero major violations or government findings
- All immigration status tracked and current
- Audit-ready documentation maintained
- Regulatory changes implemented on time
- Training completion at 100%
- Risk register updated and monitored
- Executive leadership fully informed

---

## 9. Business Rules

### BR-1: Immigration Tracking and Alerts

```
IF consultant visa/work permit expiry date < 180 days THEN
  status = "Monitor" (🟡)
  actions = ["Start renewal planning"]

IF consultant visa/work permit expiry date < 90 days THEN
  status = "Warning" (🟠)
  actions = ["Initiate renewal process", "Engage immigration counsel"]
  notify = [Pod Manager, HR Manager, Regional Director]

IF consultant visa/work permit expiry date < 30 days THEN
  status = "Critical" (🔴)
  actions = ["URGENT: Expedite renewal or cease work"]
  notify = [Pod Manager, HR Manager, Regional Director, COO, Legal]
  escalation = IMMEDIATE

IF consultant visa/work permit expiry date < 0 days THEN
  status = "Expired" (⚫)
  actions = ["STOP ALL WORK IMMEDIATELY", "Remove from client"]
  notify = [ALL EXECUTIVES, LEGAL, HR]
  auto_action = ["Suspend from active roster", "Stop billing"]
```

### BR-2: Compliance Violation Severity

```
CRITICAL Violation (immediate escalation to Regional Director + Legal):
- Unauthorized worker
- Discrimination or harassment finding
- Wage theft or FLSA violation
- Data breach (PII/PHI)
- Government enforcement action
- Potential criminal liability

MAJOR Violation (escalation to Regional Director within 24 hours):
- Immigration non-compliance (late renewal, missing docs)
- Tax withholding errors
- Benefits compliance failures
- Safety violations
- Repeated minor violations

MINOR Violation (Country Manager handles, notify Regional Director):
- Administrative errors (I-9 paperwork gaps, late filings)
- Isolated policy violations
- Correctable oversights
- Single-occurrence issues
```

### BR-3: Multi-Country Employment Rules

```
US Employment:
- Entity: InTime Inc.
- Payroll: US payroll (ADP, Paychex, etc.)
- Benefits: US health insurance, 401(k)
- Labor law: FLSA + state laws
- Tax: Federal + state + local
- Immigration: I-9, E-Verify (if OPT/STEM)

Canada Employment:
- Entity: InTime Canada Ltd.
- Payroll: Canadian payroll (CPP, EI, provincial tax)
- Benefits: Provincial health supplement, RRSP
- Labor law: Canada Labour Code or provincial ESA
- Tax: Federal + provincial
- Immigration: Work permit verification (if not citizen/PR)

Cross-Border:
- ALWAYS employ in country of residence
- NEVER create permanent establishment in other country
- Use proper visas for any cross-border travel/work
- Document transfer pricing for intercompany billing
- Annual tax and legal review of structure
```

### BR-4: Audit Response Protocol

```
Government Audit Received:
├─ Hour 1: Notify Regional Director, engage Legal Counsel
├─ Hour 2: Assemble audit response team
├─ Day 1: Preliminary document review and risk assessment
├─ Day 2: Response strategy meeting with Legal
├─ Day 3-14: Document preparation and legal review
├─ Day 14: Submit response (or request extension if needed)
├─ Day 15-30: Cooperate with investigation, provide additional info
├─ Day 30+: Negotiate settlement or dispute findings
└─ Post-audit: Remediation, policy updates, training

Escalation:
├─ CEO/COO: Immediate notification
├─ Board: If material risk or large potential exposure
├─ Insurance: If potential claim (E&O, D&O, EPLI)
└─ External counsel: Always for government audits
```

### BR-5: Training and Certification Requirements

```
Annual Mandatory Training (100% completion required):

All Employees:
├─ Code of Conduct and Ethics (60 min)
├─ Data Privacy and Security (45 min)
├─ Anti-Harassment and Discrimination (90 min, CA = 120 min)
└─ Information Security (30 min)

Managers and Above:
├─ All employee training (above)
├─ Employment Law and Compliance (120 min)
├─ Performance Management (60 min)
└─ Leadership and Culture (90 min)

Regional Directors:
├─ All manager training (above)
├─ Financial Management and Controls (120 min)
├─ Executive Leadership (external program)
└─ Board Governance (if applicable)

Compliance Tracking:
├─ Deadline: 30 days from hire, then annual renewal
├─ Consequences: Suspension of system access if overdue >30 days
├─ Reporting: Monthly completion dashboard to Regional Director
└─ Certification: Signed acknowledgment required
```

---

## 10. Screen Specifications

### SCR-RD-006-01: Immigration Compliance Dashboard

**Route:** `/app/compliance/immigration`
**Access:** Regional Director, HR Manager, Pod Managers (view only)
**Layout:** Dashboard with alerts, drill-down tables, and action panels

**Key Features:**
- Real-time immigration status for all consultants in region
- Color-coded alert levels (green/yellow/orange/red/black)
- Filterable by country, pod, visa type, expiry date range
- Drill-down to individual consultant detail
- Bulk actions (assign to immigration counsel, send reminders)
- Export to Excel for offline analysis
- Historical trend charts (visa expirations over time)

### SCR-RD-006-02: Regional Compliance Scorecard

**Route:** `/app/compliance/scorecard`
**Access:** Regional Director, Country Managers, COO
**Layout:** Executive dashboard with KPIs and trend charts

**Key Metrics:**
- Overall compliance score (0-100)
- Scores by category (immigration, labor law, tax, data privacy, etc.)
- Recent violations and remediation status
- Upcoming audits and inspections
- Training compliance percentage
- Trend charts (week-over-week, month-over-month)

### SCR-RD-006-03: Compliance Incident Management

**Route:** `/app/compliance/incidents`
**Access:** Regional Director, HR Manager, Legal, Country Managers
**Layout:** Case management interface with workflow tracking

**Key Features:**
- Incident intake form
- Severity classification (critical/major/minor)
- Workflow: Report → Investigate → Remediate → Close
- Task assignment and tracking
- Document repository for evidence
- Timeline view of all actions
- Escalation workflows
- Regulatory reporting templates

---

## 11. Field Specifications

### Immigration Tracking Fields

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| visaType | enum | Yes | US/Canada visa types | See master framework |
| visaExpiryDate | date | Yes | Future date | Primary alert trigger |
| i94ExpiryDate | date | Conditional | Future date | US non-immigrants only |
| eadExpiryDate | date | Conditional | Future date | If EAD-based work auth |
| passportExpiryDate | date | No | Future date | Must be valid 6+ months |
| renewalStatus | enum | Yes | not_started, in_progress, pending, approved, denied | Tracks renewal process |
| immigrationCounsel | user | No | - | Assigned attorney |
| lastStatusUpdate | datetime | Auto | - | System-generated |
| alertLevel | enum | Auto-calculated | green, yellow, orange, red, black | Based on days to expiry |

### Compliance Violation Fields

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| violationType | enum | Yes | immigration, labor_law, tax, data_privacy, safety, other | Category |
| severity | enum | Yes | critical, major, minor | Determines escalation |
| discoveredDate | date | Yes | - | When violation identified |
| country | enum | Yes | ISO country codes | Where violation occurred |
| description | richtext | Yes | Min 50 chars | Full description |
| rootCause | richtext | No | - | Why it happened |
| remediation | richtext | Conditional | Required if not closed | How it was fixed |
| status | enum | Yes | open, investigating, remediating, closed | Workflow state |
| assignedTo | user | Yes | - | Owner |
| estimatedCost | currency | No | - | Financial impact |

---

## 12. Integration Points

### INT-006-01: Government APIs

**USCIS Case Status API:**
- Query visa/immigration application status
- Automated status updates
- Renewal deadline tracking

**CRA Business Number Validation (Canada):**
- Verify contractor business numbers
- GST/HST registration checks

### INT-006-02: Legal Counsel Portals

**Immigration Law Firm Integration:**
- Case management system sync
- Document upload/download
- Status updates and alerts
- Billing integration

**Employment Law Firm:**
- Matter management
- Document repository
- Conflict checks

### INT-006-03: Compliance Training Platforms

**LMS Integration:**
- Course assignment based on role
- Completion tracking
- Certificate storage
- Reminder automation

---

## 13. RACI Assignments

| Activity | R | A | C | I |
|----------|---|---|---|---|
| Daily immigration monitoring | HR Manager | Regional Director | Pod Managers | COO |
| Weekly compliance dashboard | Regional Director | COO | Country Managers | CEO |
| Monthly country certifications | Country Manager | Regional Director | HR, Legal | COO |
| Violation response | Country Manager | Regional Director | Legal, HR | COO, CEO |
| Regulatory changes | Legal Counsel | Regional Director | HR, Ops | All managers |
| Government audits | Regional Director | CEO | Legal, CFO | Board |
| Policy updates | HR Manager | Regional Director | Legal | All employees |
| Training programs | HR Manager | Regional Director | Compliance | All employees |

---

## 14. Metrics & Analytics

### Compliance KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Overall Compliance Score | > 95/100 | Monthly scorecard |
| Immigration Compliance | 100% current | No expired work auth |
| Major Violations | 0 | Per year |
| Minor Violations | < 5 | Per year |
| Training Completion | 100% | Within 30 days of due |
| Audit Findings | 0 material | Per audit |
| Time to Remediate | < 30 days | Average |

### Leading Indicators

- Immigration alerts (trend down over time)
- Training completion rate (maintain 100%)
- Policy acknowledgment rate
- Audit readiness score
- Regulatory change implementation timeliness

---

## 15. Test Cases

### TC-RD-006-001: Immigration Expiry Alert

**Priority:** Critical
**Type:** E2E

**Steps:**
1. Set consultant visa expiry to 29 days from today
2. Wait for automated alert system to trigger (daily job)
3. Verify Regional Director receives email alert
4. Verify dashboard shows critical (🔴) status
5. Verify Pod Manager notified
6. Verify HR Manager notified
7. Check alert includes consultant details and action items

**Expected Result:** All notifications sent, dashboard updated, no manual intervention needed

### TC-RD-006-002: Compliance Violation Workflow

**Priority:** High
**Type:** Functional

**Steps:**
1. Country Manager submits minor violation (I-9 gap)
2. Verify Regional Director receives notification
3. Regional Director reviews and assigns to HR Manager
4. HR Manager adds remediation notes
5. HR Manager marks as closed
6. Verify violation logged in compliance database
7. Verify appears on monthly compliance report

**Expected Result:** Full audit trail, proper workflow, reporting accurate

### TC-RD-006-003: Cross-Border Employment Setup

**Priority:** High
**Type:** Integration

**Steps:**
1. Regional Director initiates cross-border employment request
2. System presents compliance checklist
3. Legal and tax review requested
4. Approvals obtained
5. Employment contract generated (correct entity)
6. Payroll setup in correct country
7. Intercompany billing configured
8. Verify compliance monitoring activated

**Expected Result:** Compliant cross-border structure, all approvals documented, ongoing monitoring

---

## 16. Accessibility

- All compliance dashboards WCAG 2.1 AA compliant
- Color-coding supplemented with icons and text labels
- Screen reader support for all alerts and notifications
- Keyboard navigation for all workflows
- High-contrast mode for dashboards

---

## 17. Mobile Considerations

**Critical Mobile Features:**
- Immigration alerts push to mobile app
- Quick view of compliance scorecard
- Ability to acknowledge and assign violations
- Document upload for audits (camera capture)
- Emergency contact for critical issues

**Not on Mobile:**
- Detailed compliance analysis
- Complex report generation
- Bulk data export

---

## 18. Security

### Data Classification

**Highly Confidential:**
- Immigration documents (passport, visa, I-9, work permits)
- Government audit findings
- Violation details
- Legal opinions and advice

**Access Controls:**
- Immigration data: Regional Director, HR Manager, Legal, assigned Pod Manager only
- Compliance violations: Regional Director, Country Manager, HR, Legal
- Audit documents: Regional Director, CEO, CFO, Legal, external auditors
- All access logged for audit trail

### Encryption

- All immigration documents encrypted at rest
- TLS 1.3 for data in transit
- Document retention per legal requirements (typically 3-7 years)

---

## 19. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-30 | COO | Initial document - comprehensive multi-country compliance management |

---

**Document Owner:** Chief Operating Officer
**Review Cycle:** Quarterly (regulatory environment changes frequently)
**Next Review:** 2026-02-28
