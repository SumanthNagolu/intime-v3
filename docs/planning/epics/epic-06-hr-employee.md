# Epic 6: HR & Employee Management

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**📋 Epic Name:** HR & Employee Management

**🎯 Goal:** Manage IntimeESolutions employees (timesheets, leave, expenses, documents)

**💰 Business Value:** Internal efficiency (replaces spreadsheets); compliance (audit trails); scales from 19 employees Year 1 to 100+ Year 5; no direct revenue but critical operations

**👥 User Personas:**

- Employees (19 people Year 1 - 9.5 pods across all pillars)
- HR Managers (1-2 people managing employee lifecycle)
- Admins (approve timesheets, leave requests, expenses)
- Finance (expense reimbursements, payroll integration)

**🎁 Key Features:**

- Employee directory (profiles, departments, teams, roles)
- Timesheet management (weekly submission, approval workflow, payroll export)
- Attendance tracking (clock in/out, work shifts, remote/on-site)
- Leave management (types: PTO, sick leave, unpaid; balances, accrual rules)
- Leave request workflow (submit, manager approval, auto-deduct from balance)
- Expense claims (submit expenses, attach receipts, approval workflow)
- Document management (offer letters, contracts, performance reviews)
- Onboarding workflows (new hire checklist, document signing, setup tasks)
- Offboarding workflows (exit interview, asset return, access revocation)
- Org chart visualization (departments, reporting structure)
- Employee dashboard (upcoming leave, pending expenses, timesheets due)
- Manager dashboard (team timesheets, leave requests, expense approvals)
- HR admin dashboard (employee lifecycle, compliance checks, reporting)

**📊 Success Metrics:**

- 100% timesheet submission on time (vs manual spreadsheet chaos)
- Leave approval cycle: <24 hours (vs 3-5 days manual)
- Expense reimbursement cycle: <7 days (vs 14-30 days manual)
- Employee satisfaction with HR processes: 4.0+ stars
- Zero compliance violations (proper audit trails, GDPR compliance)
- Time saved vs manual processes: 20 hours/week for HR team

**🔗 Dependencies:**

- **Requires:** Epic 1 (Foundation - user management, roles, audit trails)
- **Enables:** Epic 7 (Productivity - timesheets feed into productivity tracking)
- **Blocks:** None

**⏱️ Effort Estimate:** 5 weeks, ~25 stories

**📅 Tentative Timeline:** Week 14-18 (Parallel with TA)

**Key Stories (Sample):**

1. Create departments table (name, manager, budget)
2. Build employee profiles (extend user_profiles with employee-specific fields)
3. Implement timesheet system (weekly submission, hours tracking, approval)
4. Create attendance tracking (clock in/out, work shifts, reports)
5. Build leave types and balances (PTO, sick, unpaid; accrual rules)
6. Implement leave request workflow (submit, approve, auto-deduct)
7. Create expense claims (submit, attach receipts, approval stages)
8. Build document templates (offer letters, contracts, reviews)
9. Implement document generation (auto-fill templates, PDF export)
10. Create onboarding checklist (new hire tasks, completion tracking)
11. Build offboarding workflow (exit interview, asset return, access revoke)
12. Implement org chart (departments, teams, reporting structure)
13. Create employee dashboard (leave balance, upcoming shifts, pending items)
14. Build manager dashboard (team timesheets, approvals, team calendar)
15. Implement payroll export (timesheet data, deductions, format for ADP/Gusto)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## Timesheet Management

### Weekly Submission Workflow

**Employee Experience:**

1. **Friday End of Day:** Reminder email "Submit your timesheet"
2. **Employee fills timesheet:**
   - Monday: 8 hours (Academy training development)
   - Tuesday: 8 hours (Student support)
   - Wednesday: 8 hours (Curriculum updates)
   - Thursday: 8 hours (Grading assignments)
   - Friday: 8 hours (Team meetings)
   - **Total:** 40 hours
3. **Submit for approval**
4. **Manager approves** (Monday morning)
5. **Auto-exported to payroll** (Gusto/ADP format)

**Database Schema:**

```sql
CREATE TABLE timesheets (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES user_profiles(id),
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  total_hours NUMERIC(5,2),
  status TEXT, -- 'draft', 'submitted', 'approved', 'rejected'
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE timesheet_entries (
  id UUID PRIMARY KEY,
  timesheet_id UUID REFERENCES timesheets(id),
  date DATE NOT NULL,
  hours NUMERIC(5,2) NOT NULL,
  project TEXT, -- 'Academy Training', 'Recruiting', etc.
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Leave Management

### Leave Types

**PTO (Paid Time Off):**
- **Accrual:** 15 days/year (1.25 days/month)
- **Max balance:** 30 days (2 years worth)
- **Carry over:** Yes (up to 30 days)

**Sick Leave:**
- **Accrual:** 10 days/year (0.83 days/month)
- **Max balance:** 20 days
- **Carry over:** Yes

**Unpaid Leave:**
- **Accrual:** N/A (request as needed)
- **Approval:** Manager discretion

### Leave Request Workflow

**Employee submits leave request:**
```
Type: PTO
Start Date: 2026-03-10
End Date: 2026-03-14
Total Days: 5
Reason: Family vacation
```

**Automated checks:**
- ✅ Sufficient balance? (Employee has 8 days PTO available)
- ✅ No conflicts? (No other team member on leave same dates)
- ✅ Advance notice? (Submitted 2 weeks in advance)

**Manager approval:**
- Email notification: "John Doe requested 5 days PTO (Mar 10-14)"
- Manager clicks "Approve" or "Reject"
- If approved: Auto-deduct 5 days from balance

**Result:**
- Employee notified: "Your PTO request was approved"
- Calendar updated: John Doe marked as "On Leave" (Mar 10-14)
- Balance updated: 8 days → 3 days remaining

---

## Expense Claims

### Expense Workflow

**Employee submits expense:**
```
Date: 2026-02-15
Category: Travel
Merchant: United Airlines
Amount: $450
Description: Flight to client meeting (ABC Insurance)
Receipt: [upload PDF]
```

**Approval workflow:**
1. **Manager review** (approves if reasonable, < $500 auto-approve)
2. **Finance review** (if > $500, requires CFO approval)
3. **Reimbursement** (ACH transfer to employee, 7 days)

**Database Schema:**
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES user_profiles(id),
  date DATE NOT NULL,
  category TEXT, -- 'Travel', 'Meals', 'Equipment', 'Software'
  merchant TEXT,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  receipt_url TEXT, -- S3 bucket link
  status TEXT, -- 'pending', 'approved', 'rejected', 'reimbursed'
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  reimbursed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Document Management

### Document Templates

**Offer Letter:**
```
Dear [Candidate Name],

We are pleased to offer you the position of [Job Title] at IntimeESolutions.

Start Date: [Start Date]
Salary: $[Annual Salary] per year
Benefits: Health insurance, 15 days PTO, 10 days sick leave

Please sign below to accept this offer.

[Signature Field]
```

**Auto-Generation:**
```typescript
async function generateOfferLetter(candidateId: string, jobDetails: JobOffer) {
  const template = await getTemplate('offer-letter');
  const candidate = await getCandidate(candidateId);

  const filled = template
    .replace('[Candidate Name]', candidate.name)
    .replace('[Job Title]', jobDetails.title)
    .replace('[Start Date]', jobDetails.startDate)
    .replace('[Annual Salary]', jobDetails.salary);

  const pdf = await generatePDF(filled);
  return pdf;
}
```

---

## Onboarding Workflow

### New Hire Checklist (Automated)

**Day -7 (Before Start):**
- [ ] Send welcome email
- [ ] Create accounts (email, Slack, GitHub, Supabase)
- [ ] Order laptop (MacBook Pro M3)
- [ ] Add to payroll (Gusto)

**Day 1:**
- [ ] Complete I-9 form
- [ ] Sign offer letter
- [ ] Review employee handbook
- [ ] Set up direct deposit
- [ ] Benefits enrollment

**Week 1:**
- [ ] Team introductions (Slack #introductions)
- [ ] 1-on-1 with manager
- [ ] Training: InTime platform overview
- [ ] Training: Pod workflows

**Week 2:**
- [ ] Shadow senior pod member
- [ ] First assignment (small task)
- [ ] Check-in: How's it going?

**Day 30:**
- [ ] Performance check-in
- [ ] Feedback survey
- [ ] Full productivity expected

---

## Org Chart

### Visual Hierarchy

```
CEO (Sumanth)
├── CFO
├── COO
└── Pods (9.5 pods)
    ├── Training Academy Pod (Senior + Junior)
    ├── Recruiting Pod 1 (Senior + Junior)
    ├── Recruiting Pod 2 (Senior + Junior)
    ├── Recruiting Pod 3 (Senior + Junior)
    ├── Recruiting Pod 4 (Senior + Junior)
    ├── Recruiting Pod 5 (Senior + Junior)
    ├── Recruiting Pod 6 (Senior + Junior)
    ├── Bench Sales Pod (Senior + Junior)
    ├── TA Pod (Senior + Junior)
    └── Cross-Border Specialist (0.5 FTE Year 1)
```

---

## Success Criteria

**Definition of Done:**

1. ✅ Employee can submit timesheet weekly
2. ✅ Manager can approve/reject timesheets
3. ✅ Leave request workflow (submit → approve → auto-deduct)
4. ✅ Expense claim workflow (submit → approve → reimburse)
5. ✅ Onboarding checklist auto-created for new hires
6. ✅ Org chart visualizes company structure
7. ✅ Payroll export works (format for ADP/Gusto)
8. ✅ Zero manual spreadsheets (everything in system)

**Quality Gates:**

- 100% timesheet submission on time
- Leave approval: <24 hours
- Expense reimbursement: <7 days
- Employee satisfaction: 4.0+ stars

---

**Related Epics:**
- [Epic 1: Foundation](./epic-01-foundation.md) (Required)
- [Epic 7: Productivity & Pods](./epic-07-productivity-pods.md) (Enabled - uses timesheet data)

**Next Epic:** [Epic 7: Productivity & Pod Management](./epic-07-productivity-pods.md)
