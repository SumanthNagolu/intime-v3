# Epic 3: Recruiting Services (ATS)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**📋 Epic Name:** Recruiting Services (ATS)

**🎯 Goal:** Place pre-vetted Guidewire talent with clients in 48 hours (vs industry 30 days)

**💰 Business Value:** $1.5M Year 1 revenue (300 placements × $5K avg); 80% gross margin; feeds cross-pollination engine

**👥 User Personas:**

- Recruiters (6 pods = 12 recruiters, manage 50 placements/year each)
- Candidates (Academy grads, bench consultants, external sourcing)
- Clients (insurance carriers, consulting firms, tech companies)
- Admins (track placements, revenue, KPIs)

**🎁 Key Features:**

- Job posting system (clients submit JDs, requirements, budget)
- Candidate database (unified with user_profiles, skills, experience, availability)
- AI-powered matching (GPT-4o scores candidates 0-100 for each job)
- Talent pipeline (Academy grads, bench consultants, LinkedIn scraping)
- Resume parsing (AI extracts skills, experience from PDFs)
- Interview coordination (calendar integration, scheduling, reminders)
- Submission tracking (candidate → client, interview stages, feedback)
- Placement workflow (offer, acceptance, start date, 30-day check-in)
- Client portal (view submissions, schedule interviews, provide feedback)
- Candidate portal (view jobs, apply, track status, interview prep)
- 48-hour guarantee tracking (SLA monitoring, alert if approaching deadline)
- Recruiter dashboard (pipeline, submissions, interviews, placements)
- Email automation (submission confirmations, interview reminders, follow-ups)

**📊 Success Metrics:**

- Time-to-submit: <48 hours (vs 7-14 days industry)
- Submission-to-interview ratio: 50% (1 in 2 candidates get interviews)
- Interview-to-offer ratio: 33% (1 in 3 interviews result in offers)
- Offer-to-acceptance: 90% (9 in 10 offers accepted)
- 30-day retention: 95% (consultant still working after 30 days)
- Client repeat rate: 80% (clients use InTime again)

**🔗 Dependencies:**

- **Requires:** Epic 1 (Foundation), Epic 2 (Academy - for graduate pipeline)
- **Enables:** Epic 4 (Bench Sales - overflow becomes bench)
- **Blocks:** None

**⏱️ Effort Estimate:** 6 weeks, ~35 stories

**📅 Tentative Timeline:** Week 8-13 (Overlaps with Academy finish)

**Key Stories (Sample):**

1. Create jobs table (title, description, requirements, budget, client_id)
2. Build job posting form (client-facing, JD upload, requirements)
3. Implement candidate database (search, filter, tag management)
4. Create AI matching algorithm (parse JD, score candidates, rank results)
5. Build submission workflow (candidate selection, client notification, tracking)
6. Implement interview scheduling (calendar integration, availability matching)
7. Create feedback collection (client feedback, candidate feedback)
8. Build placement tracking (offer stage, start date, check-ins)
9. Implement 48-hour SLA monitoring (alerts, dashboard warnings)
10. Create client portal (view submissions, manage interviews, feedback)
11. Build candidate portal (browse jobs, apply, track applications)
12. Implement resume parsing (AI extraction, skill tagging)
13. Create email automation (submission confirmations, reminders, follow-ups)
14. Build recruiter dashboard (pipeline view, KPIs, activity tracking)
15. Implement LinkedIn scraping integration (RapidAPI, daily imports)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## 48-Hour Guarantee Implementation

### How We Achieve It

**Secret #1: Pre-Vetted Talent Pool**

**Talent Sources (Priority Order):**
1. InTime Academy Graduates (40% of placements)
   - Already trained, portfolio reviewed, interview-ready
2. Bench Consultants (30% of placements)
   - Between projects, proven track record, pre-screened
3. External Sourcing (30% of placements)
   - LinkedIn scraping, Indeed/Dice, referrals

**Secret #2: AI-Powered Matching**

```typescript
async function matchCandidates(jobDescription: string) {
  // Step 1: Parse JD (extract skills, experience, location)
  const jdParsed = await parseJobDescription(jobDescription);

  // Step 2: Query database (candidates with matching skills)
  const candidates = await db.query(`
    SELECT * FROM candidates
    WHERE skills @> $1  -- PostgreSQL array contains
    AND experience_years >= $2
    AND availability = 'immediate'
    LIMIT 100
  `);

  // Step 3: AI scores each candidate 0-100
  const scored = await scoreCandidates(candidates, jobDescription);

  // Step 4: Return top 10 (score >= 70)
  return scored.filter(s => s.score >= 70).slice(0, 10);
}

// Total time: <30 seconds (vs human recruiter: 8 hours)
```

**Secret #3: Dedicated Pods (No Context Switching)**

- Recruiting pod focuses on 5 active roles max (not 20)
- 100% Guidewire (no context switching between Java/NET/Guidewire)
- 80% time per role vs traditional 20%

---

## AI Matching Algorithm

### Scoring Criteria

**Skills Match (50 points):**
- PolicyCenter experience: 20 pts
- BillingCenter experience: 15 pts
- ClaimCenter experience: 15 pts

**Experience Years (30 points):**
- 3+ years: 20 pts
- 5+ years: 25 pts
- 10+ years: 30 pts

**Education (10 points):**
- Bachelor's degree: 10 pts
- Master's degree: 10 pts (no bonus, meets requirement)

**Location (10 points):**
- Remote OK: 10 pts
- Willing to relocate: 10 pts
- Local to client: 10 pts

**Pass Threshold:** 70+ points

### Resume Parsing

**AI Extraction (GPT-4o):**
- Skills: Extract tech stack (PolicyCenter, Java, SQL, etc.)
- Experience: Parse years and company names
- Education: Degrees, universities, graduation years
- Certifications: Guidewire certified, AWS, etc.

---

## Revenue Model

### Pricing

**Per Placement:**
- **Contract roles:** $5,000 flat fee
- **Full-time roles:** 15% of first-year salary (avg $15,000)

**Year 1 Mix:**
- Contract: 250 placements × $5,000 = $1,250,000 (83%)
- Full-time: 50 placements × $15,000 avg = $750,000 (17%)
  - (Conservative: adjusted to $300K in projections)

**Total Year 1 Revenue:** $1,500,000

### Cost Structure

**Per Placement:**
- Recruiter time: 8 hours × $75/hr = $600
- AI screening: 50 candidates × $0.005 = $0.25 (negligible)
- Marketing: $400 (LinkedIn ads, job boards, outreach tools)
- **Total COGS:** $1,000

**Gross Profit:** $5,000 - $1,000 = $4,000 (80% margin)

---

## Integration with Academy

### Graduate → Candidate Pipeline

**Event Flow:**

```typescript
// When student graduates from Academy
eventBus.publish('academy.graduated', {
  userId: 'student-123',
  course: 'PolicyCenter Developer',
  completionDate: '2026-03-15',
  capstoneProject: 'github.com/student/homeprotect',
  grade: 'A'
});

// Recruiting pod subscribes
eventBus.subscribe('academy.graduated', async (event) => {
  // Auto-create candidate profile
  await createCandidate({
    userId: event.payload.userId,
    source: 'academy_graduate',
    skills: ['PolicyCenter', 'Guidewire', 'Java', 'SQL'],
    availability: 'immediate',
    portfolioUrl: event.payload.capstoneProject,
    interviewReady: true
  });

  // Notify recruiting pod
  await notifyRecruiters(`New Academy grad ready: ${event.payload.userId}`);
});
```

---

## Success Criteria

**Definition of Done:**

1. ✅ Client submits job → JD parsed and stored
2. ✅ AI matches candidates within 30 seconds
3. ✅ Recruiter reviews top 10, submits 3-5 to client within 48 hours
4. ✅ Client receives email with candidate profiles
5. ✅ Interview scheduled via calendar integration
6. ✅ Placement tracked through offer → start date → 30-day check-in
7. ✅ 48-hour SLA monitored (alerts if approaching deadline)
8. ✅ Metrics dashboard shows time-to-submit, placement rates, revenue

**Quality Gates:**

- 48-hour SLA met: 95%+ of jobs
- Submission-to-interview ratio: 50%+
- Interview-to-offer ratio: 33%+
- Client satisfaction: 4.5+ stars

---

**Related Epics:**
- [Epic 1: Foundation](./epic-01-foundation.md) (Required)
- [Epic 2: Training Academy](./epic-02-training-academy.md) (Required for pipeline)
- [Epic 4: Bench Sales](./epic-04-bench-sales.md) (Enabled)
- [Epic 5: Talent Acquisition](./epic-05-talent-acquisition.md) (Enabled)

**Next Epic:** [Epic 4: Bench Sales](./epic-04-bench-sales.md)
