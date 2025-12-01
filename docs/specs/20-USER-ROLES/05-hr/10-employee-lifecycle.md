# UC-HR-010: Employee Lifecycle Management (Hire to Retire)

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** HR Manager
**Status:** Approved

---

## 1. Overview

This use case covers the complete employee lifecycle in InTime OS from recruitment through retirement/termination, including onboarding, performance management, career development, and offboarding. HR Manager orchestrates all lifecycle stages to ensure employee success and organizational compliance.

**Critical Focus:** Proper lifecycle management drives retention, performance, and compliance while creating positive employee experience.

---

## 2. Actors

- **Primary:** HR Manager
- **Secondary:** Hiring Manager, Employee, Pod Manager, Finance, IT, Legal
- **System:** HRIS, ATS, Performance Management, Learning Management, Payroll
- **External:** Background Check Vendors, Benefits Providers, Unemployment Agencies

---

## 3. Preconditions

1. HR Manager logged in with full permissions
2. HRIS and ATS integrated
3. Lifecycle workflows configured
4. Document templates available
5. Stakeholder notifications enabled

---

## 4. Trigger

- New hire requisition approved
- Offer accepted by candidate
- Employee start date
- Performance review cycle
- Promotion or transfer
- Resignation or termination notice
- Retirement announcement

---

## 5. Employee Lifecycle Stages

## Stage 1: Pre-Hire (Recruitment to Offer)

### Workflow
```
[Requisition Approved] → [Post Job] → [Source Candidates] → [Screen] →
[Interview] → [Background Check] → [Offer] → [Offer Accepted]
```

### HR Manager Actions
```
┌────────────────────────────────────────────────────────────────┐
│ PRE-HIRE CHECKLIST                                              │
├────────────────────────────────────────────────────────────────┤
│ ☐ Job requisition approved (budget, headcount, job description)│
│ ☐ Job posted internally and externally                         │
│ ☐ Candidates sourced and screened                              │
│ ☐ Interviews conducted and feedback documented                 │
│ ☐ Top candidate selected                                       │
│ ☐ Background check authorized and completed                    │
│   • Criminal background check                                  │
│   • Employment verification (past 7 years)                     │
│   • Education verification                                     │
│   • Reference checks (3 professional references)               │
│   • Credit check (if financial role)                           │
│   • Drug screen (if safety-sensitive)                          │
│ ☐ Offer letter prepared and approved                           │
│ ☐ Compensation benchmarked and approved                        │
│ ☐ Offer extended verbally                                      │
│ ☐ Offer letter sent and signed                                 │
│ ☐ Start date confirmed                                         │
│ ☐ Rejected candidates notified                                 │
└────────────────────────────────────────────────────────────────┘
```

**Key Documents:**
- Job description
- Job posting
- Interview scorecards
- Background check authorization (FCRA disclosure)
- Background check results
- Offer letter (signed)
- At-will employment acknowledgment

**Timeline:** 4-8 weeks (requisition to offer acceptance)

---

## Stage 2: Onboarding (Offer Acceptance to Day 90)

### Workflow
```
[Offer Accepted] → [Pre-Boarding] → [First Day] → [Week 1] →
[30-Day Check-in] → [60-Day Check-in] → [90-Day Review]
```

### Pre-Boarding (Before Day 1)

**HR Manager Actions:**
```
┌────────────────────────────────────────────────────────────────┐
│ PRE-BOARDING CHECKLIST (Before Start Date)                     │
├────────────────────────────────────────────────────────────────┤
│ ☐ Send welcome email with start details                        │
│ ☐ Create employee record in HRIS                               │
│ ☐ Assign employee ID                                           │
│ ☐ Request IT setup (email, laptop, phone, access)              │
│ ☐ Send new hire paperwork (digital):                           │
│   • W-4 (federal tax withholding)                              │
│   • State tax withholding forms                                │
│   • I-9 Section 1 (employee completes)                         │
│   • Direct deposit form                                        │
│   • Emergency contact form                                     │
│   • Benefits enrollment forms                                  │
│   • Employee handbook acknowledgment                           │
│   • Confidentiality/NDA agreement                              │
│   • Acceptable use policy                                      │
│ ☐ Prepare welcome kit (company swag, badge, etc.)              │
│ ☐ Schedule first-day orientation                               │
│ ☐ Notify team of new hire arrival                              │
│ ☐ Assign buddy/mentor                                          │
│ ☐ Prepare workspace (desk, supplies, equipment)                │
└────────────────────────────────────────────────────────────────┘
```

**Timeline:** 2 weeks before start date

---

### First Day

**HR Manager Actions:**
```
┌────────────────────────────────────────────────────────────────┐
│ FIRST DAY CHECKLIST                                             │
├────────────────────────────────────────────────────────────────┤
│ ☐ Welcome and building tour                                    │
│ ☐ Complete I-9 Section 2 (verify identity + work auth)         │
│   CRITICAL: Must be done within 3 business days of start       │
│ ☐ Submit E-Verify (within 3 business days)                     │
│ ☐ Collect signed paperwork                                     │
│ ☐ Issue badge, keys, equipment                                 │
│ ☐ IT setup verified (email working, systems access)            │
│ ☐ Enroll in benefits (30-day window)                           │
│ ☐ Benefits orientation session                                 │
│ ☐ Review employee handbook                                     │
│ ☐ Review company policies (anti-harassment, code of conduct)   │
│ ☐ Introduce to team and manager                                │
│ ☐ Assign initial training modules                              │
│ ☐ Set 30-day check-in meeting                                  │
│ ☐ Add to payroll (first paycheck date communicated)            │
└────────────────────────────────────────────────────────────────┘
```

**Key Documents (Day 1):**
- I-9 Section 2 (employer verification)
- All signed acknowledgments
- Benefits elections
- Photo for badge

---

### 30-Day Check-in

**Purpose:** Address early concerns, confirm role clarity

**HR Manager Actions:**
```
┌────────────────────────────────────────────────────────────────┐
│ 30-DAY CHECK-IN                                                 │
├────────────────────────────────────────────────────────────────┤
│ ☐ Schedule 1:1 meeting with employee                           │
│ ☐ Review onboarding progress                                   │
│ ☐ Confirm role clarity and expectations                        │
│ ☐ Address questions or concerns                                │
│ ☐ Verify manager providing adequate support                    │
│ ☐ Collect feedback on onboarding experience                    │
│ ☐ Ensure training on track                                     │
│ ☐ Verify benefits enrollment complete                          │
│ ☐ Document check-in notes                                      │
│ ☐ Escalate issues if needed                                    │
└────────────────────────────────────────────────────────────────┘
```

**Red Flags to Watch:**
- Employee unclear on responsibilities
- Manager not engaged
- Technical/systems issues unresolved
- Cultural fit concerns
- Performance concerns emerging

---

### 60-Day Check-in

**Purpose:** Assess integration and progress

**HR Manager Actions:**
```
┌────────────────────────────────────────────────────────────────┐
│ 60-DAY CHECK-IN                                                 │
├────────────────────────────────────────────────────────────────┤
│ ☐ Schedule 1:1 meeting with employee                           │
│ ☐ Review performance against goals                             │
│ ☐ Assess cultural fit and team integration                     │
│ ☐ Confirm training completion                                  │
│ ☐ Gather manager feedback (separate conversation)              │
│ ☐ Identify development opportunities                           │
│ ☐ Address any performance gaps early                           │
│ ☐ Document check-in and share with manager                     │
└────────────────────────────────────────────────────────────────┘
```

---

### 90-Day Review (End of Probation)

**Purpose:** Formal performance evaluation, decide to continue employment

**HR Manager Actions:**
```
┌────────────────────────────────────────────────────────────────┐
│ 90-DAY REVIEW                                                   │
├────────────────────────────────────────────────────────────────┤
│ ☐ Manager completes formal 90-day performance review           │
│ ☐ HR reviews manager's assessment                              │
│ ☐ Meet with employee to discuss review                         │
│ ☐ Make employment continuation decision:                       │
│   ○ Continue employment (successful onboarding)                │
│   ○ Extend probation (performance concerns, needs more time)   │
│   ○ Terminate (poor fit, performance, or misconduct)           │
│ ☐ If continuing:                                               │
│   • Set goals for next 6 months                                │
│   • Identify development plan                                  │
│   • Celebrate successful onboarding                            │
│ ☐ If extending probation:                                      │
│   • Document specific performance gaps                         │
│   • Create performance improvement plan (PIP)                  │
│   • Set clear metrics and timeline (30-60 days)                │
│   • Schedule weekly check-ins                                  │
│ ☐ If terminating:                                              │
│   • Document reasons (performance or policy violations)        │
│   • Consult legal if needed                                    │
│   • Initiate offboarding process                               │
│ ☐ Update HRIS with review and decision                         │
│ ☐ File in personnel file                                       │
└────────────────────────────────────────────────────────────────┘
```

**Decision Criteria:**
- Performance meets expectations
- Cultural fit confirmed
- Team integration successful
- Manager satisfied
- No compliance or policy issues

**Timeline:** Complete by day 90 (or earlier if issues arise)

---

## Stage 3: Performance & Development (Day 90 to Exit)

### Annual Performance Review Cycle

**Timeline:**
```
Jan: Goal setting for year
Q2 (Jun): Mid-year review
Q4 (Dec): Annual performance review
Jan: Compensation review and adjustments
```

**HR Manager Actions:**
```
┌────────────────────────────────────────────────────────────────┐
│ ANNUAL PERFORMANCE REVIEW CYCLE                                │
├────────────────────────────────────────────────────────────────┤
│ JANUARY: Goal Setting                                          │
│ ☐ Launch goal-setting process org-wide                         │
│ ☐ Managers set team and individual goals (SMART format)        │
│ ☐ Employees create development goals                           │
│ ☐ HR reviews goals for alignment with company objectives       │
│ ☐ Goals finalized and locked in system                         │
│                                                                 │
│ JUNE: Mid-Year Review                                           │
│ ☐ Launch mid-year review process                               │
│ ☐ Employees complete self-assessment                           │
│ ☐ Managers complete mid-year evaluation                        │
│ ☐ 1:1 review meetings conducted                                │
│ ☐ Goals adjusted if needed (business changes)                  │
│ ☐ Development plans updated                                    │
│                                                                 │
│ DECEMBER: Annual Review                                         │
│ ☐ Launch annual review process                                 │
│ ☐ Employees complete self-assessment                           │
│ ☐ Managers complete annual evaluation                          │
│ ☐ Peer feedback collected (360 review if applicable)           │
│ ☐ HR reviews all evaluations for calibration                   │
│ ☐ Review meetings conducted (manager + employee)               │
│ ☐ Performance ratings finalized:                               │
│   • Exceeds Expectations (top 20%)                             │
│   • Meets Expectations (middle 70%)                            │
│   • Below Expectations (bottom 10% - PIP required)             │
│ ☐ Promotion recommendations submitted                          │
│ ☐ Reviews filed in personnel files                             │
│                                                                 │
│ JANUARY: Compensation Review                                    │
│ ☐ HR compiles compensation recommendations                     │
│ ☐ Budget review with Finance and Leadership                    │
│ ☐ Merit increases approved (based on performance)              │
│ ☐ Promotions and title changes processed                       │
│ ☐ Compensation letters sent to employees                       │
│ ☐ Payroll updated effective Feb 1                              │
└────────────────────────────────────────────────────────────────┘
```

---

### Career Development

**HR Manager Actions:**
```
┌────────────────────────────────────────────────────────────────┐
│ CAREER DEVELOPMENT PROGRAMS                                     │
├────────────────────────────────────────────────────────────────┤
│ Individual Development Plans (IDP)                              │
│ ☐ Annual IDP creation for all employees                        │
│ ☐ Skills gap analysis                                          │
│ ☐ Training recommendations (internal and external)             │
│ ☐ Certifications and courses                                   │
│ ☐ Mentorship matching                                          │
│                                                                 │
│ Promotions and Transfers                                        │
│ ☐ Internal job postings (post internally first)                │
│ ☐ Succession planning for key roles                            │
│ ☐ Promotion criteria documented (title ladder)                 │
│ ☐ Transfer requests processed                                  │
│ ☐ Cross-training opportunities                                 │
│                                                                 │
│ Learning & Development                                          │
│ ☐ InTime Academy courses (gamified training)                   │
│ ☐ Technical skills training (role-specific)                    │
│ ☐ Leadership development program                               │
│ ☐ Tuition reimbursement (up to $5,250/year)                    │
│ ☐ Conference attendance                                        │
│ ☐ Professional certifications (PMP, PHR, SHRM, etc.)           │
└────────────────────────────────────────────────────────────────┘
```

---

### Performance Improvement Plans (PIP)

**Trigger:** Performance below expectations

**HR Manager Actions:**
```
┌────────────────────────────────────────────────────────────────┐
│ PERFORMANCE IMPROVEMENT PLAN (PIP)                             │
├────────────────────────────────────────────────────────────────┤
│ ☐ Manager documents specific performance gaps                  │
│ ☐ HR reviews documentation (ensure objectivity)                │
│ ☐ PIP meeting scheduled (manager + employee + HR)              │
│ ☐ PIP document created:                                        │
│   • Specific performance issues (concrete examples)            │
│   • Expected performance (clear, measurable standards)         │
│   • Timeline (typically 30, 60, or 90 days)                    │
│   • Support provided (training, resources, coaching)           │
│   • Check-in frequency (weekly or bi-weekly)                   │
│   • Consequences of non-improvement (termination)              │
│ ☐ Employee acknowledges PIP (signature)                        │
│ ☐ Weekly check-ins conducted and documented                    │
│ ☐ Mid-PIP review (if 60 or 90 days)                            │
│ ☐ Final PIP review:                                            │
│   ○ Successful: Remove from PIP, continue employment           │
│   ○ Unsuccessful: Proceed to termination                       │
│ ☐ Document outcome in personnel file                           │
│ ☐ If terminated, initiate offboarding                          │
└────────────────────────────────────────────────────────────────┘
```

**Legal Note:** PIPs create documentation trail for lawful termination

---

## Stage 4: Leave Management

### Types of Leave

**HR Manager Actions:**
```
┌────────────────────────────────────────────────────────────────┐
│ LEAVE MANAGEMENT                                                │
├────────────────────────────────────────────────────────────────┤
│ FMLA (Family and Medical Leave Act)                            │
│ ☐ Determine employee eligibility (12 months, 1,250 hours)      │
│ ☐ Provide FMLA notice within 5 days of request                 │
│ ☐ Request medical certification (15-day deadline)              │
│ ☐ Approve/deny FMLA (notify within 5 days)                     │
│ ☐ Track 12-week entitlement (rolling 12-month period)          │
│ ☐ Continue benefits during FMLA leave                          │
│ ☐ Job restoration upon return (same or equivalent)             │
│ ☐ Recertify medical condition (every 30 days if requested)     │
│                                                                 │
│ Parental Leave (Company Policy)                                │
│ ☐ Maternity: 12 weeks paid (primary caregiver)                 │
│ ☐ Paternity: 6 weeks paid (secondary caregiver)                │
│ ☐ Adoption: 12 weeks paid                                      │
│                                                                 │
│ Short-Term Disability (STD)                                     │
│ ☐ Medical condition prevents work                              │
│ ☐ STD insurance: 60% salary replacement                        │
│ ☐ Waiting period: 7 days                                       │
│ ☐ Duration: Up to 6 months                                     │
│                                                                 │
│ Long-Term Disability (LTD)                                      │
│ ☐ Disability extends beyond 6 months                           │
│ ☐ LTD insurance: 60% salary replacement                        │
│ ☐ Waiting period: 180 days                                     │
│ ☐ Duration: Until age 65 or recovery                           │
│                                                                 │
│ Personal Leave of Absence (Unpaid)                             │
│ ☐ Manager approval required                                    │
│ ☐ Benefits continuation (employee pays premiums)               │
│ ☐ Job restoration not guaranteed (best effort)                 │
│ ☐ Maximum: 30 days (unless extended)                           │
│                                                                 │
│ Military Leave (USERRA)                                         │
│ ☐ Reservist activation or deployment                           │
│ ☐ Job restoration guaranteed (up to 5 years)                   │
│ ☐ Benefits continuation options                                │
│ ☐ Reemployment rights protected                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Stage 5: Offboarding (Resignation, Termination, Retirement)

### Types of Separation

1. **Voluntary Resignation** (employee initiates)
2. **Involuntary Termination - Performance** (company initiates)
3. **Involuntary Termination - Misconduct** (company initiates)
4. **Layoff / Reduction in Force** (business decision)
5. **Retirement** (planned separation)
6. **Death** (tragic event)

---

### Voluntary Resignation

**HR Manager Actions:**
```
┌────────────────────────────────────────────────────────────────┐
│ VOLUNTARY RESIGNATION CHECKLIST                                │
├────────────────────────────────────────────────────────────────┤
│ ☐ Receive resignation letter (written notice)                  │
│ ☐ Confirm last day of work (standard 2-week notice)            │
│ ☐ Conduct exit interview (confidential, candid feedback)       │
│   • Reason for leaving (better opportunity, comp, culture, etc│
│   • Manager feedback (support, development, leadership)        │
│   • Team dynamics                                              │
│   • Company culture                                            │
│   • Benefits and compensation                                  │
│   • Suggestions for improvement                                │
│ ☐ Complete knowledge transfer plan with manager                │
│ ☐ Return company property:                                     │
│   • Laptop, phone, tablet                                      │
│   • Badge, keys, access cards                                  │
│   • Company credit card                                        │
│   • Documents, files (delete personal data from devices)       │
│ ☐ Revoke system access (effective last day, 5 PM)              │
│   • Email, Slack, VPN                                          │
│   • HRIS, ATS, CRM                                             │
│   • Cloud storage (Google Drive, Dropbox)                      │
│   • Client systems                                             │
│ ☐ Process final paycheck:                                      │
│   • Pay through last day worked                                │
│   • Accrued PTO payout (per state law)                         │
│   • Outstanding expense reimbursements                         │
│   • Deduct any owed amounts (equipment not returned)           │
│ ☐ Benefits termination:                                        │
│   • Medical/dental/vision end: Last day of month               │
│   • Send COBRA notice (within 30 days)                         │
│   • 401k: Employee retains account, can roll over              │
│   • Life/disability: Conversion options provided               │
│ ☐ Update HRIS status to "Terminated - Voluntary"               │
│ ☐ Remove from payroll                                          │
│ ☐ Send exit documents:                                         │
│   • Final pay stub                                             │
│   • COBRA election notice                                      │
│   • 401k distribution options                                  │
│   • Unemployment eligibility (if applicable)                   │
│   • Reference policy (who can provide references)              │
│ ☐ Archive personnel file                                       │
│ ☐ Mark as "Eligible for Rehire" or "Not Eligible"              │
│ ☐ Send goodbye announcement (if appropriate)                   │
└────────────────────────────────────────────────────────────────┘
```

**Timeline:** 2-week notice period (standard)

---

### Involuntary Termination (Performance or Misconduct)

**HR Manager Actions:**
```
┌────────────────────────────────────────────────────────────────┐
│ INVOLUNTARY TERMINATION CHECKLIST                              │
├────────────────────────────────────────────────────────────────┤
│ PRE-TERMINATION (Legal Review)                                 │
│ ☐ Review documentation (performance reviews, PIPs, warnings)   │
│ ☐ Ensure termination is lawful (not discriminatory)            │
│ ☐ Consult legal counsel if:                                    │
│   • Protected class member (EEOC concern)                      │
│   • Recent complaint or FMLA leave (retaliation concern)       │
│   • High-level employee (executive)                            │
│   • Potential litigation risk                                  │
│ ☐ Prepare termination letter (reason, effective date)          │
│ ☐ Calculate final pay and severance (if applicable)            │
│ ☐ Prepare separation agreement (if offering severance)         │
│                                                                 │
│ TERMINATION MEETING                                             │
│ ☐ Schedule meeting (private, end of day Friday ideal)          │
│ ☐ Attendees: Manager, HR, witness (optional)                   │
│ ☐ Security standby (if risk of incident)                       │
│ ☐ Deliver termination message:                                 │
│   • Clear, direct, brief (10-15 minutes)                       │
│   • State decision is final (not negotiable)                   │
│   • Explain reason (performance, policy violation, etc.)       │
│   • Avoid argument or debate                                   │
│   • Show empathy but be firm                                   │
│ ☐ Collect company property immediately                         │
│ ☐ Revoke access immediately (escorted exit if needed)          │
│ ☐ Provide final pay and termination documents                  │
│ ☐ Explain benefits termination and COBRA                       │
│ ☐ Offer outplacement services (if applicable)                  │
│ ☐ Answer questions (brief, factual)                            │
│                                                                 │
│ POST-TERMINATION                                                │
│ ☐ Update HRIS status to "Terminated - Involuntary"             │
│ ☐ Remove from payroll                                          │
│ ☐ Notify IT to disable all access (within 1 hour)              │
│ ☐ Notify team (brief, professional announcement)               │
│ ☐ Notify clients if applicable (transition plan)               │
│ ☐ Process unemployment claim (respond to state within deadline)│
│ ☐ Mark as "Not Eligible for Rehire" (typically)                │
│ ☐ Archive personnel file and documentation                     │
│ ☐ Monitor for legal claims (90 days to 1 year)                 │
└────────────────────────────────────────────────────────────────┘
```

**Legal Risks:**
- Wrongful termination lawsuit
- Discrimination claim (EEOC)
- Retaliation claim (if recent complaint or protected activity)
- Defamation (if reason stated publicly)

**Mitigation:**
- Strong documentation
- Consistent application of policies
- Legal review before termination
- Severance agreement with release (if high risk)

---

### Retirement

**HR Manager Actions:**
```
┌────────────────────────────────────────────────────────────────┐
│ RETIREMENT CHECKLIST                                            │
├────────────────────────────────────────────────────────────────┤
│ ☐ Receive retirement notice (3-6 months advance ideal)         │
│ ☐ Confirm retirement date                                      │
│ ☐ Plan knowledge transfer and succession                       │
│ ☐ Celebrate career and contributions (retirement party)        │
│ ☐ Benefits counseling:                                         │
│   • 401k distribution options (lump sum, rollover, annuity)    │
│   • Retiree health coverage (if offered)                       │
│   • Social Security filing (coordinate with retirement date)   │
│   • Medicare enrollment (age 65)                               │
│   • Pension (if applicable)                                    │
│ ☐ Process final pay and accrued PTO                            │
│ ☐ Collect company property                                     │
│ ☐ Revoke access on retirement date                             │
│ ☐ Send retirement gift (plaque, gift card, etc.)               │
│ ☐ Update HRIS status to "Retired"                              │
│ ☐ Mark as "Eligible for Rehire" (retiree consultant roles)     │
│ ☐ Stay connected (retiree alumni network)                      │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. Key Metrics

| Metric | Calculation | Target | Purpose |
|--------|-------------|--------|---------|
| **Time to Fill** | Days from requisition to start | < 45 days | Hiring efficiency |
| **Offer Acceptance Rate** | Offers accepted / Offers extended | > 85% | Offer competitiveness |
| **90-Day Retention** | New hires staying > 90 days / Total | > 90% | Onboarding effectiveness |
| **Annual Turnover** | Terminations / Avg headcount | < 15% | Retention health |
| **Voluntary Turnover** | Voluntary exits / Avg headcount | < 10% | Employee satisfaction |
| **Performance Rating Dist** | % in each rating category | 20/70/10 | Calibration |
| **Promotion Rate** | Promotions / Eligible employees | 10-15% | Career growth |
| **Training Hours per Emp** | Total training hours / Headcount | > 40 hrs/year | Development investment |

---

## 7. Integration Points

### HRIS Integration
- Employee data (single source of truth)
- Lifecycle stage tracking
- Document storage
- Workflow automation

### ATS Integration
- Candidate to employee conversion
- Background check results
- Offer letter generation

### Payroll Integration
- New hire setup
- Compensation changes
- Final pay calculations
- Termination processing

### Benefits Integration
- Enrollment triggers
- Life event changes
- COBRA administration
- Retirement distributions

---

## 8. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-30 | Initial comprehensive employee lifecycle documentation |

---

**End of UC-HR-010**
