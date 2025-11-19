# Epic 4: Bench Sales

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**📋 Epic Name:** Bench Sales

**🎯 Goal:** Place consultants on bench into projects within 30-60 days with proactive outreach

**💰 Business Value:** $1.13M Year 1 revenue (60 placements × $10K + ongoing 5% commission); 92% gross margin (highest of all pillars); recurring commission revenue

**👥 User Personas:**

- Bench Specialists (1 pod = 2 people, manage 5-10 consultants at a time)
- Consultants (between projects, need placement, income urgency)
- Clients (same as recruiting - insurance carriers, consulting firms)
- Admins (track placements, commission revenue, consultant satisfaction)

**🎁 Key Features:**

- Bench consultant onboarding (intake call, resume optimization, skill assessment)
- Consultant database (availability, bench duration, target rate, preferences)
- Weekly check-in system (Monday 9 AM calls, status updates, interview prep)
- Proactive submission workflow (submit to 5-10 clients in first week)
- Commission tracking (5% ongoing, auto-calculate from billing rate)
- Resume optimization (AI-powered, Guidewire keyword optimization)
- Client matching (similar to recruiting but for bench-specific workflows)
- Placement tracking (offer, start date, ongoing check-ins)
- Consultant satisfaction tracking (NPS, retention, referrals)
- Bench specialist dashboard (active bench, submissions, placements, commissions)
- Automated reminders (weekly check-ins, submission follow-ups)

**📊 Success Metrics:**

- Time on bench: 30 days average (vs 45-60 days industry)
- Placement rate: 90% (9 in 10 consultants placed within 60 days)
- Submissions per consultant: 10 in first week (vs 2-3 industry)
- Interview rate: 30% (3 in 10 submissions → interviews)
- Consultant satisfaction: 4.5+ stars
- Repeat placements: 50% (same consultant re-placed after project ends)

**🔗 Dependencies:**

- **Requires:** Epic 1 (Foundation), Epic 3 (Recruiting - shares client base)
- **Enables:** Cross-pollination (consultants refer colleagues)
- **Blocks:** None

**⏱️ Effort Estimate:** 4 weeks, ~20 stories

**📅 Tentative Timeline:** Week 11-14 (After Recruiting foundation)

**Key Stories (Sample):**

1. Create bench_consultants table (user_id, bench_start_date, target_rate, status)
2. Build intake workflow (form, scheduling, qualification checks)
3. Implement resume optimization (AI-powered, keyword injection)
4. Create weekly check-in system (scheduled calls, notes, action items)
5. Build proactive submission workflow (batch submit to multiple clients)
6. Implement commission tracking (5% calculation, monthly reports)
7. Create consultant dashboard (active submissions, interviews, offers)
8. Build bench specialist dashboard (active bench, pipeline, KPIs)
9. Implement automated reminders (check-in notifications, follow-ups)
10. Create placement workflow (offer acceptance, start date, check-ins)
11. Build satisfaction tracking (NPS surveys, feedback collection)
12. Implement referral tracking (consultant refers colleague, bonus)
13. Create commission payout system (monthly calculations, invoicing)
14. Build client matching (similar to recruiting, bench-specific filters)
15. Implement reporting (bench duration, placement velocity, revenue)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## 30-Day Placement Strategy

### Secret #1: Active Pipeline (Not Reactive)

**Traditional Agency:**
- "We'll call you when we have something"
- Consultant waits 45 days, no calls
- Gets desperate, reaches out: "Any updates?"

**InTime Approach:**
- Day 1: Intake call, resume optimization
- Day 2-7: Submit to 10 active client JDs
- Day 8-14: 3 interview requests
- Day 15-21: 1 offer received
- Day 22-30: Start new project

### Secret #2: Dedicated Bench Specialist

**Not a generalist recruiter working on 50 things:**
- Focus ONLY on bench consultants
- Manage 5-10 consultants max at any time
- 8 hours/week per consultant (proactive outreach)

**Result:** 30 days average (vs 45-60 days industry)

### Secret #3: Weekly Check-Ins (Accountability)

**Every Monday 9 AM:**
```
BENCH SPECIALIST: "Here's where we are:"
├─ "Submitted to 3 clients last week"
├─ "ABC wants to interview Thursday 2 PM - can you make it?"
├─ "XYZ passed (wanted BillingCenter, you're PolicyCenter)"
└─ "DEF hasn't responded yet (follow up Wednesday)"

CONSULTANT: "Great! Yes, Thursday 2 PM works."

RESULT: Consultant feels supported, knows status, stays positive
```

---

## Revenue Model

### Dual Revenue Stream

**Placement Fee (One-Time):**
- **Amount:** $10,000 per placement
- **When:** Consultant starts work
- **Year 1:** 60 placements × $10,000 = $600,000

**Commission (Recurring):**
- **Amount:** 5% of billing rate
- **Example:** $85/hr × 2,080 hours/year × 5% = $8,840/year
- **When:** Monthly, as long as consultant works
- **Year 1:** 60 consultants × $8,840 × (6 months avg) = $265,200

**Total Year 1 Revenue:** $600,000 + $530,400 = $1,130,400

### Lifetime Value

**Per Consultant (3 Years):**
```
YEAR 1: $10,000 (placement) + $8,840 (commission) = $18,840
YEAR 2: $8,840 (commission, still working)
YEAR 3: $8,840 + $10,000 (re-placed when project ends) = $18,840
REFERRALS: 2 colleagues × $10,000 = $20,000

TOTAL LTV: $66,520 over 3 years
```

---

## Commission Tracking

### Auto-Calculation

**Database Schema:**
```sql
CREATE TABLE commission_transactions (
  id UUID PRIMARY KEY,
  consultant_id UUID REFERENCES user_profiles(id),
  client_id UUID REFERENCES clients(id),
  billing_rate NUMERIC(10,2), -- $85.00/hr
  hours_worked NUMERIC(10,2), -- 160 hrs/month
  commission_rate NUMERIC(5,4), -- 0.05 (5%)
  commission_amount NUMERIC(10,2), -- Auto-calculated
  period_start DATE,
  period_end DATE,
  status TEXT, -- 'pending', 'approved', 'paid'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Auto-Calculation Logic:**
```typescript
// Run monthly (1st of month)
async function calculateMonthlyCommissions() {
  const consultants = await getActiveConsultants();

  for (const consultant of consultants) {
    const hoursWorked = await getHoursWorked(
      consultant.id,
      lastMonth.start,
      lastMonth.end
    );

    const commission =
      consultant.billingRate *
      hoursWorked *
      0.05; // 5%

    await createCommissionTransaction({
      consultantId: consultant.id,
      hoursWorked,
      commissionAmount: commission,
      status: 'pending' // Awaiting approval
    });
  }
}
```

---

## Resume Optimization (AI)

### Before AI Optimization

```
"Software Engineer
- Developed insurance applications
- Worked with various technologies
- 6 years experience"
```

### After AI Optimization

```
"Guidewire ClaimCenter Consultant | 6 Years Experience | AVAILABLE IMMEDIATELY

CORE COMPETENCIES:
• ClaimCenter 10.0 (Claims Processing, FNOL, Workflow Configuration)
• Gosu Scripting (Rating Algorithms, Business Rules, Integrations)
• Java, SQL, RESTful APIs (System Integration, Custom Development)

ACHIEVEMENTS:
• Reduced claim processing time by 30% (re-engineered workflow, ABC Insurance)
• Led ClaimCenter 9.0 → 10.0 upgrade (zero downtime, 10,000 claims migrated)
• Integrated ClaimCenter with 5 external systems (fraud detection, medical billing)

AVAILABILITY: Immediate | RATE: $85-$95/hr | REMOTE: Yes"
```

**AI Prompt:**
- Headline: "Guidewire [Product] Consultant | [X] Years Experience"
- Highlight Guidewire products prominently
- Quantify achievements (e.g., "Reduced processing time by 30%")
- Add "AVAILABLE IMMEDIATELY" at top
- Keywords: Guidewire, PolicyCenter, ClaimCenter, BillingCenter, Gosu, Java, SQL

---

## Success Criteria

**Definition of Done:**

1. ✅ Consultant joins bench → Intake completed within 24 hours
2. ✅ Resume optimized by AI → Approved by specialist
3. ✅ Submitted to 10 clients in first week
4. ✅ Weekly check-ins scheduled (Monday 9 AM recurring)
5. ✅ Placement within 30-60 days (90% success rate)
6. ✅ Commission calculated automatically each month
7. ✅ Consultant receives weekly status updates
8. ✅ Satisfaction tracked (NPS surveys post-placement)

**Quality Gates:**

- Time on bench: 30 days average (measure weekly)
- Placement rate: 90%+ (9 in 10 placed within 60 days)
- Consultant satisfaction: 4.5+ stars
- Commission accuracy: 100% (no calculation errors)

---

**Related Epics:**
- [Epic 1: Foundation](./epic-01-foundation.md) (Required)
- [Epic 3: Recruiting Services](./epic-03-recruiting-services.md) (Required for client base)
- [Epic 5: Talent Acquisition](./epic-05-talent-acquisition.md) (Can build in parallel)

**Next Epic:** [Epic 5: Talent Acquisition](./epic-05-talent-acquisition.md)
