# UC-HR-009: Compliance Audit & Checklist

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** HR Manager
**Status:** Approved

---

## 1. Overview

This use case covers comprehensive HR compliance auditing for InTime OS, including preparation for external audits, internal compliance reviews, regulatory checklists, and ongoing compliance monitoring across employment law, benefits, immigration, and workplace safety.

**Critical Focus:** Non-compliance can result in severe penalties, lawsuits, and reputational damage. HR Manager must maintain continuous compliance across all jurisdictions and regulations.

---

## 2. Actors

- **Primary:** HR Manager
- **Secondary:** Legal Counsel, Finance Team, COO, External Auditors
- **System:** Compliance Tracker, Document Management, Audit Logger, Alert System
- **External:** DOL, EEOC, IRS, State Labor Departments, Immigration Agencies

---

## 3. Preconditions

1. HR Manager logged in with full permissions
2. Employee records up to date in HRIS
3. Compliance policies documented
4. Required forms and documents accessible
5. Audit trails enabled

---

## 4. Trigger

- Scheduled internal audit (quarterly/annual)
- External audit notice (DOL, EEOC, IRS)
- New regulation effective date
- Compliance incident or complaint
- Executive request for compliance status
- Certification renewal (ISO, SOC2, etc.)

---

## 5. Main Flow: Compliance Dashboard

### Step 1: Navigate to Compliance Dashboard

**User Action:** Click "HR" → "Compliance" → "Dashboard" in sidebar

**System Response:**
```
┌────────────────────────────────────────────────────────────────┐
│ HR Compliance Dashboard                                        │
│ Last Updated: Dec 3, 2024 10:45 AM                            │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ OVERALL COMPLIANCE SCORE                                        │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │                                                              ││
│ │              ████████████████████░░  92%                     ││
│ │                                                              ││
│ │  🟢 Good Standing - Minor items requiring attention          ││
│ │                                                              ││
│ │  Last Full Audit: Sep 15, 2024 (Q3 2024)                    ││
│ │  Next Audit Due:  Dec 15, 2024 (Q4 2024)                    ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ COMPLIANCE AREAS                                                │
│ ┌──────────────────────────┬──────────┬──────────┬───────────┐ │
│ │ Area                     │ Status   │ Score    │ Issues    │ │
│ ├──────────────────────────┼──────────┼──────────┼───────────┤ │
│ │ 🟢 I-9 / E-Verify        │ Compliant│ 98%      │ 2 minor   │ │
│ │ 🟢 Benefits (ACA/ERISA)  │ Compliant│ 95%      │ 3 minor   │ │
│ │ 🟡 Immigration Tracking  │ Warning  │ 88%      │ 12 expiry │ │
│ │ 🟢 Payroll (FLSA)        │ Compliant│ 100%     │ 0         │ │
│ │ 🟢 EEOC / Anti-Discrim   │ Compliant│ 100%     │ 0         │ │
│ │ 🟢 OSHA / Safety         │ Compliant│ 95%      │ 1 minor   │ │
│ │ 🟡 FMLA / Leave          │ Warning  │ 85%      │ 5 overdue │ │
│ │ 🟢 Record Retention      │ Compliant│ 92%      │ 2 gaps    │ │
│ │ 🟢 Worker Classification │ Compliant│ 100%     │ 0         │ │
│ │ 🟢 Background Checks     │ Compliant│ 100%     │ 0         │ │
│ └──────────────────────────┴──────────┴──────────┴───────────┘ │
│                                                                 │
│ CRITICAL ALERTS (0)                                             │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ ✓ No critical compliance issues                            │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ WARNINGS (17)                                                   │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 🟡 12 Immigration expirations within 90 days               │ │
│ │    → Action: Begin renewal process immediately             │ │
│ │    [Review Immigration Tracker]                            │ │
│ │                                                             │ │
│ │ 🟡 5 FMLA certifications overdue for recertification       │ │
│ │    → Action: Request updated medical certifications        │ │
│ │    [Review FMLA Cases]                                      │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ UPCOMING DEADLINES                                              │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Dec 10: Carrier enrollment file upload (benefits)          │ │
│ │ Dec 31: Year-end payroll compliance review                 │ │
│ │ Jan 31: W-2 distribution to employees                      │ │
│ │ Jan 31: 1099-NEC distribution to contractors               │ │
│ │ Mar 31: ACA 1095-C distribution and IRS filing             │ │
│ │ Apr 15: OSHA 300A posting (Feb 1 - Apr 30)                 │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ QUICK ACTIONS                                                   │
│ [Run Full Audit] [Generate Compliance Report] [View Checklists]│
│ [Immigration Tracker] [I-9 Audit] [Document Repository]        │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

### Step 2: Run Quarterly Compliance Audit

**User Action:** Click "Run Full Audit"

**System Response:**
```
┌────────────────────────────────────────────────────────────────┐
│ Quarterly Compliance Audit - Q4 2024                           │
│ Audit Date: Dec 3, 2024                                        │
│ Auditor: Jessica Chen (HR Manager)                             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ AUDIT CATEGORIES (Click to expand)                             │
│                                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ ▶ 1. I-9 Employment Eligibility (Federal)                  │ │
│ │ ▼ 2. E-Verify Compliance (Federal)                         │ │
│ │   ┌──────────────────────────────────────────────────────┐ │ │
│ │   │ CHECKLIST:                                           │ │ │
│ │   │ ✓ E-Verify enrolled and active                       │ │ │
│ │   │ ✓ All new hires verified within 3 business days     │ │ │
│ │   │ ✓ No outstanding TNCs (Tentative Non-Confirmations) │ │ │
│ │   │ ⚠️ 2 cases pending verification (within timeline)   │ │ │
│ │   │   • Sarah Chen (hired Nov 30, due Dec 5)            │ │ │
│ │   │   • Michael Brown (hired Nov 28, due Dec 3) ⚠️      │ │ │
│ │   │                                                       │ │ │
│ │   │ FINDINGS:                                             │ │ │
│ │   │ • 245/247 employees verified ✓                       │ │ │
│ │   │ • 2 pending (within 3-day window) ⚠️                │ │ │
│ │   │ • 0 violations                                        │ │ │
│ │   │                                                       │ │ │
│ │   │ RECOMMENDATION:                                       │ │ │
│ │   │ Complete Michael Brown E-Verify today (deadline)     │ │ │
│ │   │                                                       │ │ │
│ │   │ [Mark Complete] [Add Note] [Assign Task]            │ │ │
│ │   └──────────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │ ▶ 3. Benefits Compliance (ACA, ERISA, COBRA)               │ │
│ │ ▶ 4. Immigration Compliance (I-94, Visa Tracking)          │ │
│ │ ▶ 5. Wage & Hour (FLSA, Overtime, Minimum Wage)            │ │
│ │ ▶ 6. EEOC / Anti-Discrimination                            │ │
│ │ ▶ 7. OSHA / Workplace Safety                               │ │
│ │ ▶ 8. FMLA / Leave Management                               │ │
│ │ ▶ 9. Record Retention (Federal & State)                    │ │
│ │ ▶ 10. Worker Classification (W2 vs 1099 vs C2C)            │ │
│ │ ▶ 11. Background Checks (FCRA)                             │ │
│ │ ▶ 12. State-Specific Compliance                            │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ AUDIT PROGRESS                                                  │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Completed: 4/12 categories ████░░░░░░░░░ 33%               ││
│ │ Estimated Time: 2 hours remaining                           ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ [Continue Audit] [Save Progress] [Export Checklist] [Cancel]   │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

### Step 3: I-9 Compliance Audit

**User Action:** Expand "I-9 Employment Eligibility"

**System Response:**
```
┌────────────────────────────────────────────────────────────────┐
│ I-9 Employment Eligibility Audit                               │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ I-9 COMPLIANCE CHECKLIST                                        │
│                                                                 │
│ FORM COMPLETION                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ ✓ All employees have I-9 on file (247/247)                 │ │
│ │ ✓ Section 1 completed by employee on/before first day      │ │
│ │ ✓ Section 2 completed within 3 business days of hire       │ │
│ │ ⚠️ Section 3 (reverification) due for 8 employees          │ │
│ │   • Work authorization expiring within 90 days             │ │
│ │   [View Reverification List]                               │ │
│ │                                                             │ │
│ │ ✓ Using current I-9 form (expires 10/31/2026)              │ │
│ │ ✓ Forms stored separately from personnel files             │ │
│ │ ✓ Electronic storage encrypted and audit-trailed           │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ DOCUMENT VERIFICATION                                           │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ ✓ List A documents (identity + work auth):                 │ │
│ │   • US Passport: 89 employees                              │ │
│ │   • Passport Card: 12 employees                            │ │
│ │   • Green Card: 34 employees                               │ │
│ │   • EAD (Employment Authorization Document): 23 employees  │ │
│ │                                                             │ │
│ │ ✓ List B + C documents (identity + work auth):             │ │
│ │   • Driver's License + Social Security Card: 78 employees  │ │
│ │   • State ID + Birth Certificate: 11 employees             │ │
│ │                                                             │ │
│ │ ✓ All documents examined for authenticity                  │ │
│ │ ✓ Document numbers and expiration dates recorded           │ │
│ │ ⚠️ 12 documents expiring within 90 days (reverify needed)  │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ COMMON I-9 ERRORS (Audit for these)                             │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ ✓ Section 1 signed and dated                               │ │
│ │ ✓ Section 2 completed within 3 business days               │ │
│ │ ✓ No correction fluid used (cross out and initial errors)  │ │
│ │ ✓ Preparer/Translator section completed if applicable      │ │
│ │ ✓ Employer signature and date in Section 2                 │ │
│ │ ✓ No discrimination in document selection                  │ │
│ │ ✓ No backdating                                            │ │
│ │ ✓ No requesting specific documents (employee chooses)      │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ REVERIFICATION DUE (8)                                          │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Employee            Work Auth Expires    Action Due         │ │
│ │ ─────────────────────────────────────────────────────────│ │
│ │ Priya Sharma        Dec 15, 2024        Dec 14 (1 day b4)  │ │
│ │ Michael Chen        Dec 22, 2024        Dec 21              │ │
│ │ David Lee           Jan 15, 2025        Jan 14              │ │
│ │ [View All 8 Employees]                                      │ │
│ │                                                             │ │
│ │ REVERIFICATION PROCESS:                                     │ │
│ │ 1. Request new work authorization document before expiry   │ │
│ │ 2. Complete Section 3 of existing I-9 (do NOT create new)  │ │
│ │ 3. Record new document number and expiration                │ │
│ │ 4. Sign and date Section 3                                 │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ RETENTION REQUIREMENTS                                          │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ ✓ Active employees: Retain I-9 for duration of employment  │ │
│ │ ✓ Terminated employees: Retain I-9 for 3 years from hire   │ │
│ │   OR 1 year from termination (whichever is later)          │ │
│ │                                                             │ │
│ │ PURGE ELIGIBLE (Retention period expired):                 │ │
│ │ • 12 terminated employees from 2020 eligible for purge     │ │
│ │   [Review Purge List] [Purge Now]                          │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ICE AUDIT READINESS                                             │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ If ICE (Immigration and Customs Enforcement) audits:        │ │
│ │ ✓ I-9 forms organized and accessible (3-day response)       │ │
│ │ ✓ Designated I-9 custodian: Jessica Chen (HR Manager)      │ │
│ │ ✓ Legal counsel contact ready: Smith Law (555-1234)        │ │
│ │ ✓ Audit response plan documented                           │ │
│ │ ✓ No known issues that would trigger fines                 │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ FINDINGS SUMMARY                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Status: 🟢 COMPLIANT                                        │ │
│ │ Score: 98%                                                  │ │
│ │                                                             │ │
│ │ Strengths:                                                  │ │
│ │ • 100% I-9 completion rate                                 │ │
│ │ • Proper storage and retention                             │ │
│ │ • E-Verify integration functional                          │ │
│ │                                                             │ │
│ │ Action Items (8):                                           │ │
│ │ • Complete 8 reverifications before expiry dates           │ │
│ │ • Purge 12 expired I-9 forms (retention period ended)      │ │
│ │                                                             │ │
│ │ Risk Level: LOW                                             │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Mark Section Complete] [Assign Follow-up Tasks] [Next Section]│
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. Compliance Checklists by Area

### 6.1 Benefits Compliance (ACA, ERISA, COBRA)

**Checklist:**
```
ACA (Affordable Care Act)
┌────────────────────────────────────────────────────────────────┐
│ ✓ Medical coverage offered to 95%+ of full-time employees      │
│ ✓ Coverage is "affordable" (<9.12% of W-2 wages)               │
│ ✓ Coverage meets "minimum value" (60% actuarial value)         │
│ ✓ 1095-C forms prepared for all full-time employees            │
│ ✓ 1094-C transmittal form prepared                             │
│ ⏳ 1095-C distribution by March 31 (PENDING - on schedule)      │
│ ⏳ 1094-C/1095-C IRS filing by March 31 (PENDING)               │
│ ✓ Monthly tracking of full-time status (30+ hrs/week)          │
│ ✓ Measurement period defined (12 months)                       │
└────────────────────────────────────────────────────────────────┘

ERISA (Employee Retirement Income Security Act)
┌────────────────────────────────────────────────────────────────┐
│ ✓ Summary Plan Description (SPD) provided to all participants  │
│ ✓ Form 5500 filed annually (due July 31)                       │
│ ✓ Plan documents maintained and accessible                     │
│ ✓ Claims appeal process documented                             │
│ ✓ ERISA notices provided (SMM, SAR, etc.)                      │
│ ✓ Fiduciary responsibilities assigned                          │
│ ✓ 401k plan audit conducted (required if 100+ participants)    │
│ ⚠️ SPD updates needed for 3 plan changes in 2024               │
└────────────────────────────────────────────────────────────────┘

COBRA (Consolidated Omnibus Budget Reconciliation Act)
┌────────────────────────────────────────────────────────────────┐
│ ✓ Initial COBRA notice provided at enrollment                  │
│ ✓ Termination notices sent within 30 days of qualifying event  │
│ ✓ 60-day election period enforced                              │
│ ✓ Premium calculations correct (102% of plan cost)             │
│ ✓ Payment grace period enforced (45 days)                      │
│ ✓ Maximum coverage periods tracked (18 or 36 months)           │
│ ⚠️ 2 COBRA elections pending (within 60-day window)            │
│ ✓ 8 active COBRA participants monitored monthly                │
└────────────────────────────────────────────────────────────────┘
```

**Findings:** 95% compliant, 3 minor action items

---

### 6.2 Immigration Compliance

**Checklist:**
```
Work Authorization Tracking
┌────────────────────────────────────────────────────────────────┐
│ ✓ All non-citizen employees have valid work authorization      │
│ ⚠️ 12 employees with work auth expiring within 90 days         │
│ ✓ I-94 expiration dates tracked                                │
│ ✓ Visa expiration dates tracked separately (for travel)        │
│ ✓ Automated alerts for expirations (90, 30, 7 days)            │
│ ✓ Renewal process initiated 6 months before expiry             │
│ ⚠️ 3 renewals in critical period (<30 days)                    │
│ ✓ No expired work authorizations (CRITICAL - zero tolerance)   │
└────────────────────────────────────────────────────────────────┘

H1B Compliance
┌────────────────────────────────────────────────────────────────┐
│ ✓ LCA (Labor Condition Application) on file for all H1Bs       │
│ ✓ Employees working at LCA-approved worksites only             │
│ ✓ Salaries meet or exceed prevailing wage                      │
│ ✓ Public Access File (PAF) maintained                          │
│ ✓ H1B amendments filed for material job changes                │
│ ⚠️ 1 H1B transfer pending approval (employee working on EAD)   │
└────────────────────────────────────────────────────────────────┘

OPT/STEM Compliance
┌────────────────────────────────────────────────────────────────┐
│ ✓ Unemployment days tracked (max 90 days aggregate)            │
│ ✓ E-Verify enrollment active (required for STEM)               │
│ ✓ I-983 training plans on file for STEM OPT                    │
│ ✓ I-983 evaluations completed on time (6-month, 12-month)      │
│ ✓ No OPT employees exceeding unemployment limit                │
└────────────────────────────────────────────────────────────────┘
```

**Findings:** 88% compliant (warning due to upcoming expirations)

---

### 6.3 Wage & Hour (FLSA)

**Checklist:**
```
Fair Labor Standards Act (FLSA)
┌────────────────────────────────────────────────────────────────┐
│ ✓ All employees properly classified (exempt vs non-exempt)     │
│ ✓ Non-exempt employees paid overtime (1.5x) for 40+ hours      │
│ ✓ Minimum wage requirements met (federal + state)              │
│ ✓ Timekeeping system accurate and accessible                   │
│ ✓ Meal/rest breaks compliant with state law                    │
│ ✓ Child labor laws followed (if applicable)                    │
│ ✓ Equal pay for equal work (no gender/race pay gaps)           │
│ ✓ Record retention: 3 years (payroll records)                  │
└────────────────────────────────────────────────────────────────┘

Exempt Classification (Salary Basis Test)
┌────────────────────────────────────────────────────────────────┐
│ ✓ Exempt employees meet salary threshold ($684/week = $35,568) │
│ ✓ Exempt employees meet duties test (executive, admin, prof)   │
│ ✓ No improper deductions from exempt salaries                  │
│ ✓ Computer employees meet exemption ($27.63/hr or $684/week)   │
└────────────────────────────────────────────────────────────────┘
```

**Findings:** 100% compliant

---

### 6.4 EEOC / Anti-Discrimination

**Checklist:**
```
Equal Employment Opportunity Commission (EEOC)
┌────────────────────────────────────────────────────────────────┐
│ ✓ EEO-1 Report filed annually (due March 31)                   │
│ ✓ Anti-discrimination policy in employee handbook              │
│ ✓ Anti-harassment policy in employee handbook                  │
│ ✓ Annual anti-harassment training conducted                    │
│ ✓ Complaint procedure documented and accessible                │
│ ✓ No pending EEOC charges                                      │
│ ✓ Hiring practices non-discriminatory (documented)             │
│ ✓ Promotion/compensation decisions objective and documented    │
└────────────────────────────────────────────────────────────────┘

Protected Classes (No Discrimination Based On)
┌────────────────────────────────────────────────────────────────┐
│ ✓ Race                    ✓ Color                              │
│ ✓ Religion                ✓ Sex (including pregnancy)          │
│ ✓ National Origin         ✓ Age (40+)                          │
│ ✓ Disability              ✓ Genetic Information                │
│ ✓ Sexual Orientation (state law)                               │
│ ✓ Gender Identity (state law)                                  │
└────────────────────────────────────────────────────────────────┘

Harassment Prevention
┌────────────────────────────────────────────────────────────────┐
│ ✓ Anti-harassment policy posted and distributed                │
│ ✓ All employees trained (annual requirement in some states)    │
│ ✓ Managers trained on complaint handling                       │
│ ✓ Complaint hotline active (anonymous reporting)               │
│ ✓ Investigations conducted promptly and thoroughly             │
│ ✓ Zero harassment complaints pending (0 open cases)            │
└────────────────────────────────────────────────────────────────┘
```

**Findings:** 100% compliant

---

### 6.5 OSHA / Workplace Safety

**Checklist:**
```
Occupational Safety and Health Administration (OSHA)
┌────────────────────────────────────────────────────────────────┐
│ ✓ OSHA poster displayed in workplace                           │
│ ✓ Safety training provided to all employees                    │
│ ⚠️ First aid kits inspected and stocked (1 kit needs restocking│
│ ✓ Emergency evacuation plan posted                             │
│ ✓ Fire extinguishers inspected annually                        │
│ ✓ No workplace injuries in past 12 months                      │
│ ⏳ OSHA 300 Log maintained (will post 300A Feb 1 - Apr 30)      │
│ ✓ Bloodborne pathogen plan (if applicable)                     │
│ ✓ Hazard communication program (if chemicals used)             │
└────────────────────────────────────────────────────────────────┘

Recordkeeping (OSHA 300/300A/301)
┌────────────────────────────────────────────────────────────────┐
│ ✓ OSHA 300 Log (injury/illness log) maintained                 │
│ ⏳ OSHA 300A Summary (will post Feb 1 - Apr 30, 2025)           │
│ ✓ OSHA 301 Incident Reports for each injury/illness            │
│ ✓ Records retained for 5 years                                 │
│ ✓ Zero recordable incidents in 2024                            │
└────────────────────────────────────────────────────────────────┘
```

**Findings:** 95% compliant, 1 minor item (first aid kit)

---

### 6.6 FMLA / Leave Management

**Checklist:**
```
Family and Medical Leave Act (FMLA)
┌────────────────────────────────────────────────────────────────┐
│ ✓ FMLA poster displayed                                        │
│ ✓ FMLA policy in employee handbook                             │
│ ✓ Eligible employees: 50+ employees within 75 miles            │
│ ✓ Employee eligibility tracked (12 months employment, 1,250 hrs│
│ ✓ FMLA requests processed within 5 days                        │
│ ✓ Medical certifications requested (15-day deadline)           │
│ ⚠️ 5 medical certifications overdue for recertification        │
│ ✓ 12-week entitlement tracked (rolling 12-month period)        │
│ ✓ Job restoration guaranteed (same or equivalent position)     │
│ ✓ Benefits continued during FMLA leave                         │
└────────────────────────────────────────────────────────────────┘

Active FMLA Cases (23)
┌────────────────────────────────────────────────────────────────┐
│ ✓ 18 cases with current medical certification                  │
│ ⚠️ 5 cases requiring recertification (every 30 days)           │
│ ✓ All cases documented in FMLA tracker                         │
│ ✓ Intermittent leave properly tracked (hours used)             │
│ [View FMLA Cases]                                               │
└────────────────────────────────────────────────────────────────┘
```

**Findings:** 85% compliant (warning due to recertification delays)

---

### 6.7 Record Retention

**Checklist:**
```
Federal Record Retention Requirements
┌────────────────────────────────────────────────────────────────┐
│ Document Type              Retention Period     Status          │
│ ──────────────────────────────────────────────────────────────│
│ Payroll records            3 years             ✓ Compliant     │
│ Tax records (W-2, 941)     4 years             ✓ Compliant     │
│ I-9 forms                  3 years from hire   ✓ Compliant     │
│                            OR 1 year from term                  │
│ Personnel files            7 years from term   ✓ Compliant     │
│ Benefits records           6 years             ✓ Compliant     │
│ OSHA records               5 years             ✓ Compliant     │
│ EEO-1 reports              1 year              ✓ Compliant     │
│ FMLA records               3 years             ✓ Compliant     │
│ Job applications           1 year              ⚠️ 2 gaps found │
│ Performance reviews        Employment + 7 yrs  ✓ Compliant     │
└────────────────────────────────────────────────────────────────┘

State-Specific Retention (Example: California)
┌────────────────────────────────────────────────────────────────┐
│ Payroll records            4 years (CA > Federal 3 years)      │
│ Personnel records          4 years from termination            │
│ Timecards                  4 years                             │
│ Wage statements            3 years                             │
└────────────────────────────────────────────────────────────────┘

Purge Schedule (Automated)
┌────────────────────────────────────────────────────────────────┐
│ ✓ System identifies documents eligible for purge               │
│ ✓ HR reviews before deletion                                   │
│ ✓ Legal hold check (no pending litigation)                     │
│ ⏳ Next purge run: Jan 15, 2025 (annual)                        │
│   • 47 documents eligible for purge                            │
│   [Review Purge List]                                           │
└────────────────────────────────────────────────────────────────┘
```

**Findings:** 92% compliant, 2 gaps in job application retention

---

### 6.8 Worker Classification

**Checklist:**
```
W2 vs 1099 vs C2C Classification
┌────────────────────────────────────────────────────────────────┐
│ ✓ All workers properly classified based on IRS 20-Factor Test  │
│ ✓ Classification assessments documented                        │
│ ✓ No misclassification risk identified                         │
│ ✓ W-9 forms on file for all 1099/C2C                           │
│ ✓ 1099-NEC forms prepared for contractors paid $600+           │
│ ✓ C2C agreements verify business entity (LLC, S-Corp, etc.)    │
│ ✓ No behavioral control over 1099 contractors                  │
│ ✓ Annual classification review conducted                       │
└────────────────────────────────────────────────────────────────┘

Worker Breakdown (247 total)
┌────────────────────────────────────────────────────────────────┐
│ W2 Employees:     245 (99%)                                     │
│ 1099 Contractors:   0 (0%)  - Low risk                          │
│ C2C Consultants:    2 (1%)  - Verified business entities       │
└────────────────────────────────────────────────────────────────┘
```

**Findings:** 100% compliant

---

### 6.9 Background Checks (FCRA)

**Checklist:**
```
Fair Credit Reporting Act (FCRA)
┌────────────────────────────────────────────────────────────────┐
│ ✓ Written authorization obtained before background check       │
│ ✓ Pre-adverse action notice sent if adverse info found         │
│ ✓ 5-day waiting period observed before final adverse action    │
│ ✓ Final adverse action notice sent with FCRA disclosure        │
│ ✓ Vendor (background check provider) is CRA-certified          │
│ ✓ No pending disputes from candidates                          │
│ ✓ "Ban the Box" compliance (state/local laws)                  │
│ ✓ No blanket exclusions (individualized assessments)           │
└────────────────────────────────────────────────────────────────┘
```

**Findings:** 100% compliant

---

## 7. State-Specific Compliance

### 7.1 New York

**Checklist:**
```
New York State Compliance
┌────────────────────────────────────────────────────────────────┐
│ ✓ Sexual harassment training (annual, all employees)           │
│ ✓ Wage theft prevention notice provided at hire                │
│ ✓ Paid sick leave tracked (56 hours/year for 100+ employees)   │
│ ✓ Minimum wage compliance ($15/hr NYC, varies by region)       │
│ ✓ Salary history ban (no asking prior salary)                  │
│ ✓ Lactation accommodation policy                               │
│ ✓ Required posters displayed                                   │
└────────────────────────────────────────────────────────────────┘
```

---

### 7.2 California

**Checklist:**
```
California Compliance
┌────────────────────────────────────────────────────────────────┐
│ ✓ Meal/rest break compliance (strict enforcement)              │
│ ✓ Paid sick leave (24 hours/year minimum)                      │
│ ✓ Minimum wage ($16/hr as of 2024)                             │
│ ✓ Independent contractor ABC test (stricter than IRS)          │
│ ✓ PAGA notices (Private Attorneys General Act)                 │
│ ✓ Cal-OSHA compliance                                          │
│ ✓ CFRA (California Family Rights Act) - 12 weeks leave         │
│ ✓ Required posters (8 mandatory posters)                       │
└────────────────────────────────────────────────────────────────┘
```

---

## 8. Audit Preparation (External Audit)

### 8.1 DOL (Department of Labor) Audit

**Trigger:** Received notice of DOL investigation

**Preparation Steps:**
1. Notify legal counsel immediately
2. Identify audit scope (FLSA, FMLA, OSHA, etc.)
3. Gather requested documents:
   - Payroll records (past 3 years)
   - Timekeeping records
   - Overtime calculations
   - Job descriptions
   - Personnel files
4. Designate point of contact (HR Manager + Legal)
5. Brief management on audit process
6. Do NOT destroy any documents (spoliation)
7. Respond within deadline (typically 30 days)

**Common DOL Audit Triggers:**
- Employee complaint
- Industry-wide sweep (e.g., tech staffing)
- Random selection
- High turnover rates
- Unusually low wage patterns

---

### 8.2 IRS Audit (Worker Classification)

**Trigger:** IRS examines worker classification

**Preparation Steps:**
1. Gather classification assessments for all 1099/C2C
2. Compile contracts and agreements
3. Document lack of behavioral control
4. Show business entity verification (C2C)
5. Prepare to argue economic reality test
6. Legal counsel review

**IRS Safe Harbors:**
- Section 530 relief (if reasonable basis for classification)
- Prior IRS audits found compliant
- Industry practice

---

## 9. Compliance Metrics

| Metric | Calculation | Target | Current |
|--------|-------------|--------|---------|
| **Overall Compliance Score** | Weighted avg of all areas | > 90% | 92% |
| **I-9 Completion Rate** | Forms complete / Total employees | 100% | 100% |
| **Immigration Compliance** | Valid work auth / Non-citizens | 100% | 100% |
| **FMLA Timely Processing** | Processed within 5 days / Total | > 95% | 91% |
| **Benefits ACA Compliance** | Offered coverage / FT employees | > 95% | 98% |
| **Background Check FCRA** | Compliant checks / Total checks | 100% | 100% |
| **Audit Findings (Critical)** | Critical issues found | 0 | 0 |
| **Audit Findings (Minor)** | Minor issues found | < 10 | 7 |

---

## 10. Compliance Calendar

```
ANNUAL COMPLIANCE CALENDAR

January
┌────────────────────────────────────────────────────────────────┐
│ • Jan 31: W-2 distribution to employees                        │
│ • Jan 31: 1099-NEC distribution to contractors                 │
│ • Jan 31: Provide prior year benefits summary to employees     │
└────────────────────────────────────────────────────────────────┘

February
┌────────────────────────────────────────────────────────────────┐
│ • Feb 1: Post OSHA 300A Summary (through April 30)             │
│ • Feb 28: W-2/1099 filing with IRS/SSA                         │
└────────────────────────────────────────────────────────────────┘

March
┌────────────────────────────────────────────────────────────────┐
│ • Mar 31: ACA 1095-C distribution to employees                 │
│ • Mar 31: ACA 1094-C/1095-C IRS filing                         │
│ • Mar 31: EEO-1 Report filing                                  │
└────────────────────────────────────────────────────────────────┘

April
┌────────────────────────────────────────────────────────────────┐
│ • Apr 30: OSHA 300A posting ends                               │
└────────────────────────────────────────────────────────────────┘

July
┌────────────────────────────────────────────────────────────────┐
│ • Jul 31: Form 5500 filing (retirement plans)                  │
└────────────────────────────────────────────────────────────────┘

Quarterly
┌────────────────────────────────────────────────────────────────┐
│ • Internal compliance audit (Q1, Q2, Q3, Q4)                   │
│ • Form 941 (quarterly payroll tax) filing                      │
│ • Immigration status review (expirations)                      │
│ • FMLA case review and recertifications                        │
└────────────────────────────────────────────────────────────────┘

Monthly
┌────────────────────────────────────────────────────────────────┐
│ • Benefits reconciliation (carriers vs HRIS)                   │
│ • I-9 reverification due date checks                           │
│ • COBRA payment tracking                                       │
│ • Payroll audit (wage/hour compliance)                         │
└────────────────────────────────────────────────────────────────┘
```

---

## 11. Test Cases

### TC-HR-009-001: Run Quarterly Compliance Audit

**Preconditions:** Quarter end (Q4 2024)

**Steps:**
1. Navigate to Compliance Dashboard
2. Click "Run Full Audit"
3. Complete all 12 compliance category checklists
4. Review findings and assign corrective actions
5. Generate audit report

**Expected Result:**
- All categories scored
- Overall compliance score calculated (target > 90%)
- Action items identified and assigned
- Audit report generated for COO review

---

### TC-HR-009-002: I-9 Reverification Workflow

**Preconditions:** Employee work authorization expiring in 30 days

**Steps:**
1. System alerts HR Manager (30 days before expiry)
2. HR contacts employee for new work authorization document
3. Employee provides new EAD/visa
4. HR completes Section 3 of existing I-9
5. Upload new document to system
6. Mark reverification complete

**Expected Result:**
- Section 3 completed before expiry
- No work authorization gap
- Employee continues work without interruption
- Audit trail logged

---

## 12. Security & Privacy

- Compliance audit results restricted to HR Manager, Legal, COO
- Sensitive compliance data (SSN, medical info) encrypted
- Audit trails for all compliance reviews
- External auditor access temporary and logged
- Document retention follows legal requirements

---

## 13. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-30 | Initial comprehensive compliance audit documentation |

---

**End of UC-HR-009**
