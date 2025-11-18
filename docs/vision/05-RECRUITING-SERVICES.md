# InTime Recruiting Services

**Version:** 1.0
**Last Updated:** November 17, 2025
**Owner:** Recruiting Pod Leads
**Status:** Living Document

---

## Table of Contents

1. [Recruiting Overview](#recruiting-overview)
2. [48-Hour Guarantee](#48-hour-guarantee)
3. [Client Acquisition](#client-acquisition)
4. [Candidate Sourcing & Screening](#candidate-sourcing--screening)
5. [Placement Workflow](#placement-workflow)
6. [Success Metrics & KPIs](#success-metrics--kpis)
7. [Economics & Unit Metrics](#economics--unit-metrics)

---

## Recruiting Overview

### Mission

> **"Place pre-vetted Guidewire talent with clients in 48 hours, delivering quality that traditional agencies take 30 days to achieve."**

### Core Differentiators

1. **Speed:** 48-hour candidate submission (vs 7-14 days industry average)
2. **Quality:** Pre-vetted talent pool (InTime grads + screened external candidates)
3. **Specialization:** 100% Guidewire (PolicyCenter, ClaimCenter, BillingCenter, Cloud)
4. **Pricing:** $5,000 flat fee (vs 15-25% of salary = $15K-$25K)
5. **Guarantee:** 30-day replacement if hire doesn't work out

### Value Proposition

**For Clients:**
- **Time Saved:** Get candidates in 2 days vs 30 days (15× faster)
- **Cost Saved:** $5K vs $15K-$25K (3-5× cheaper)
- **Risk Reduced:** Pre-vetted candidates, 30-day guarantee
- **Quality:** Guidewire specialists, not generalists

**For Business:**
- **Revenue:** $1,500,000 Year 1 (300 placements × $5,000)
- **Margin:** 80% gross margin (AI-powered, efficient)
- **Scalability:** Add 1 pod (2 people) = add $250K revenue
- **Cross-Pollination:** Candidates become students, clients become TA targets

---

## 48-Hour Guarantee

### The Promise

**Client submits job description → We submit qualified candidates within 48 business hours**

**What "Qualified" Means:**
- ✅ Skills match 80%+ of requirements
- ✅ Experience level matches (junior, mid, senior)
- ✅ Availability matches (start date, contract length)
- ✅ Location/remote preference matches
- ✅ Salary expectations aligned

**What Happens If We Miss 48 Hours:**
- We waive the placement fee ($5,000 → $0)
- Client still gets candidates (just took longer than promised)
- Has only happened once in testing (sandbox access issue, resolved in 72 hours)

### How We Achieve 48-Hour Turnaround

**Secret #1: Pre-Vetted Talent Pool**
```
TALENT SOURCES (in priority order):

1. InTime Academy Graduates (40% of placements)
   ├─ Already trained (we know their skills)
   ├─ Portfolio projects reviewed
   ├─ Interview-ready (mock interviews passed)
   └─ Eager to start (just completed training)

2. Bench Consultants (30% of placements)
   ├─ Between projects (available immediately)
   ├─ Proven track record (worked before)
   ├─ Referenced (we've placed them previously)
   └─ Pre-screened (technical assessment passed)

3. External Sourcing (30% of placements)
   ├─ LinkedIn scraping (automated daily)
   ├─ Indeed/Dice/Monster (job board search)
   ├─ Referrals (from placed consultants)
   └─ AI-screened (GPT-4o-mini scores 0-100)
```

**Secret #2: AI-Powered Matching**
```typescript
// When client submits JD, AI instantly matches candidates

async function matchCandidates(jobDescription: string) {
  // Step 1: Parse JD (extract skills, experience, location)
  const jdParsed = await parseJobDescription(jobDescription);

  // Step 2: Query database (candidates with matching skills)
  const candidates = await db.query(`
    SELECT * FROM candidates
    WHERE skills @> $1  -- PostgreSQL array contains
    AND experience_years >= $2
    AND availability = 'immediate'
    AND location IN ($3, 'remote')
    LIMIT 100
  `, [jdParsed.skills, jdParsed.experienceYears, jdParsed.location]);

  // Step 3: AI scores each candidate 0-100
  const scored = await Promise.all(
    candidates.map(c => scoreCandidateForJob(c, jobDescription))
  );

  // Step 4: Return top 10 (score >= 70)
  return scored
    .filter(s => s.score >= 70)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

// Total time: <30 seconds (vs human recruiter: 8 hours)
```

**Secret #3: Dedicated Pods (No Context Switching)**
```
TRADITIONAL AGENCY:
├─ Recruiter works on 20 different roles simultaneously
├─ Context switching penalty (Java dev → .NET dev → Guidewire dev)
├─ Only 20% time per role = slow

INTIME:
├─ Recruiting pod focuses on 5 active roles max
├─ 100% Guidewire (no context switching)
├─ 80% time per role = fast
```

### Real-World Example: ABC Insurance

**Timeline:**

```
FRIDAY 3:00 PM: ABC Insurance lead dev quits (project in 8 weeks)
FRIDAY 3:30 PM: CTO panics, googles "urgent PolicyCenter developer"
FRIDAY 4:00 PM: CTO finds InTime, fills form: "Need PolicyCenter dev ASAP"
FRIDAY 4:15 PM: InTime auto-responds: "Received. We'll submit candidates by Monday 4 PM"

SATURDAY 10:00 AM: Senior recruiter reviews (works weekends for urgent requests)
SATURDAY 10:30 AM: AI matches 8 candidates (score 75-92)
SATURDAY 11:00 AM: Recruiter calls top 3 candidates
  ├─ Raj (score 92): Available Monday, 5 years PolicyCenter ✅
  ├─ Maria (score 85): Available in 2 weeks, wants full-time ❌
  └─ John (score 78): Available Monday, but wants $120/hr (client budget $95/hr) ❌

SATURDAY 12:00 PM: Recruiter sends 3 profiles to CTO (Raj + 2 backups)
SATURDAY 2:00 PM: CTO interviews Raj via Zoom
SATURDAY 5:00 PM: CTO: "I want Raj!"

SUNDAY 10:00 AM: Contract drafted, sent to ABC Legal
SUNDAY 2:00 PM: Contract signed ✅

MONDAY 9:00 AM: Raj starts work (crisis averted!)

TOTAL TIME: 42 hours from request to start (vs industry 30 days = 720 hours)
```

**Result:**
- ABC saved: $500K (project penalty avoided)
- ABC paid InTime: $5,000 (placement fee)
- ROI for ABC: 100× ($500K saved / $5K paid)
- ABC becomes long-term client: 5 more placements in 6 months = $25K total revenue

---

## Client Acquisition

### Target Clients

**Tier 1: Insurance Carriers (40% of clients)**
```
PROFILE:
├─ Size: 500-5,000 employees
├─ Revenue: $100M-$10B
├─ Guidewire: Implementing or maintaining PolicyCenter/ClaimCenter/BillingCenter
├─ Pain: Can't find qualified Guidewire talent fast enough
├─ Budget: $80-$120/hr for contractors, $100K-$150K for FTEs

EXAMPLES:
- Regional carriers (State Farm of Nebraska, COUNTRY Financial)
- Specialty insurers (Pet insurance, Cyber insurance, Crop insurance)
- Life & Health carriers (Guardian, MetLife)
```

**Tier 2: Consulting Firms (35% of clients)**
```
PROFILE:
├─ Size: 50-500 consultants
├─ Focus: Guidewire implementation partners (SI, system integrators)
├─ Pain: Project starts Monday, need 5 devs immediately
├─ Budget: $95-$150/hr for contractors (bill clients $150-$250/hr)

EXAMPLES:
- Guidewire partners (EIS, Majesco, Solartis)
- Big 4 consulting (Deloitte, PwC, Accenture, Capgemini)
- Boutique Guidewire shops (10-50 person teams)
```

**Tier 3: Tech Companies (15% of clients)**
```
PROFILE:
├─ Size: 100-1,000 employees
├─ Focus: InsurTech startups, SaaS platforms for insurance
├─ Pain: Need Guidewire integration expertise (connect their product to Guidewire)
├─ Budget: $100-$160/hr for contractors, $120K-$180K for FTEs

EXAMPLES:
- InsurTech startups (Lemonade, Root, Hippo)
- SaaS platforms (Duck Creek, Applied Systems)
- Guidewire ISVs (independent software vendors building on Guidewire)
```

**Tier 4: Direct Employers (10% of clients)**
```
PROFILE:
├─ Companies hiring Guidewire talent full-time (not contract)
├─ Usually 1-5 hires per year (not volume)
├─ Budget: $100K-$150K salary + benefits

EXAMPLES:
- Mid-size carriers building in-house Guidewire teams
- Consulting firms hiring permanent staff (not contractors)
```

### Acquisition Channels

**1. Inbound (SEO) - 40% of clients**

**Strategy:**
- Rank #1-#3 for "Guidewire staffing," "PolicyCenter recruiters," "Guidewire contractors"
- Landing pages for each skill:
  - guidewire-staffing.com/policycenter-developers
  - guidewire-staffing.com/claimcenter-consultants
  - guidewire-staffing.com/billingcenter-contractors
- Case studies: "How ABC Insurance filled urgent role in 3 days"
- Free consultation: "Tell us what you need, we'll find talent"

**Conversion Flow:**
```
GOOGLE SEARCH: "urgent PolicyCenter developer"
↓
LAND ON: InTime case study (ABC Insurance success story)
↓
READ: "We placed candidate in 3 days, client saved $500K"
↓
CLICK: "I need Guidewire talent" (CTA button)
↓
FILL FORM: Role, skills, timeline, budget
↓
AUTO-RESPONSE: "Thanks! We'll submit candidates within 48 hours"
↓
RECRUITER CALLS: 30 min discovery call (understand needs, set expectations)
↓
CANDIDATE SUBMISSION: 3-5 profiles within 48 hours
↓
CLIENT INTERVIEWS: We coordinate, provide feedback
↓
OFFER: Client extends offer, we facilitate
↓
PLACEMENT: Consultant starts, we earn $5K fee
```

**2. Outbound (TA Pod) - 40% of clients**

**Strategy:**
- Identify companies implementing Guidewire (job postings, press releases, Guidewire partner directory)
- Cold email hiring managers, CTOs, HR directors
- LinkedIn outreach with personalized message
- Offer value upfront: "We have 10 pre-vetted PolicyCenter devs available this month"

**Outreach Template:**

```
SUBJECT: PolicyCenter developers available (48-hour turnaround)

Hi [First Name],

I noticed [Company Name] is hiring PolicyCenter developers (saw your
LinkedIn post last week). Most agencies take 30+ days to submit candidates.

We're InTime - we specialize 100% in Guidewire and guarantee candidate
submission within 48 hours.

Current bench (available this week):
• 3× Senior PolicyCenter devs (5-8 years exp, $90-$110/hr)
• 5× Mid-level PolicyCenter devs (3-5 years exp, $75-$95/hr)
• 2× BillingCenter + PolicyCenter (rare combo, $100-$120/hr)

Flat fee: $5,000 per placement (vs typical 15-25% = $15K-$25K)
Guarantee: 30-day replacement if hire doesn't work out

Would you like to see profiles? I can send 3 today if helpful.

Best,
[Recruiter Name]
InTime Recruiting
[Email] | [Phone] | [Calendar Link]

P.S. No obligation - even if you don't hire today, good to have fast
     access when urgent needs arise. (Like ABC Insurance did last month!)
```

**Conversion Rate:**
- Cold emails sent: 100/week
- Responses: 10% (10/week)
- Discovery calls: 5% (5/week)
- Clients onboarded: 2% (2/week)
- **Time to first placement:** 2-4 weeks average

**3. Referrals - 20% of clients**

**Strategy:**
- Happy clients refer other companies
- Incentive: $1,000 credit toward next placement
- Partner referrals: Guidewire system integrators send clients our way (10% referral fee)

**Example:**
```
ABC Insurance (client) → Refers XYZ Insurance (prospect)
↓
XYZ Insurance hires 3 consultants through InTime = $15K revenue
↓
ABC Insurance gets $1,000 credit toward next placement
↓
Win-win: ABC saves money, XYZ gets great talent, InTime gets new client
```

---

## Candidate Sourcing & Screening

### Sourcing Strategy

**Source #1: InTime Academy Graduates (40%)**

**Advantages:**
- ✅ Pre-trained (we know their skills exactly)
- ✅ Portfolio reviewed (capstone project proves competence)
- ✅ Interview-ready (mock interviews passed)
- ✅ Eager (just finished training, want to start immediately)
- ✅ Low risk (if they fail, we trained them poorly → our problem to fix)

**Process:**
1. Student completes training (Week 8)
2. Training pod marks as "Graduated" in system
3. Recruiting pod receives notification
4. Recruiter reviews capstone project, grades, trainer notes
5. Add to "Academy Grad" talent pool (top priority for placements)

**Source #2: Bench Consultants (30%)**

**Advantages:**
- ✅ Proven track record (worked before, have references)
- ✅ Available immediately (between projects, no 2-week notice)
- ✅ Pre-screened (technical assessment passed when first joining bench)

**Process:**
1. Consultant's project ends (or gets laid off)
2. Bench pod adds to talent pool
3. Recruiting pod can pull from bench for placements
4. Faster than external sourcing (already vetted)

**Source #3: External Sourcing (30%)**

**Channels:**

**LinkedIn (Primary):**
```typescript
// Automated daily scraping (RapidAPI LinkedIn Scraper)

async function scrapeLinkedInDaily() {
  const searches = [
    'PolicyCenter developer',
    'ClaimCenter consultant',
    'BillingCenter developer',
    'Guidewire Cloud',
  ];

  for (const keyword of searches) {
    const results = await searchLinkedIn({
      keywords: keyword,
      location: ['United States', 'Remote'],
      limit: 50
    });

    // Save to database
    await saveToTalentPool(results, source: 'linkedin');
  }
}

// Run nightly at 2 AM (when API usage is cheaper)
```

**Indeed/Dice/Monster:**
- Job board resume search
- Filter: Guidewire skills, 3+ years experience
- Export results → import to talent pool

**Referrals:**
- Placed consultants refer colleagues: $1,000 bonus
- "Hey, my friend Rahul is on bench at XYZ Agency. He's great with PolicyCenter. Want his contact?"

### Screening Process

**Stage 1: AI Pre-Screen (Automated, <30 sec)**

```typescript
async function aiPreScreen(candidate: Candidate, job: JobDescription) {
  const prompt = `Score this candidate for the job (0-100).

  CANDIDATE:
  ${candidate.resume}

  JOB:
  ${job.description}

  SCORING:
  - Skills match: 50 pts (PolicyCenter? BillingCenter? ClaimCenter?)
  - Experience years: 30 pts (3+ years? 5+ years? 10+ years?)
  - Education: 10 pts (relevant degree?)
  - Location: 10 pts (remote OK? willing to relocate?)

  RETURN JSON:
  {
    "score": 85,
    "skills_match": 45,
    "experience_match": 30,
    "education_match": 10,
    "location_match": 0,
    "missing_requirements": ["BillingCenter"],
    "recommendation": "Strong candidate. Missing BillingCenter but PolicyCenter expert."
  }`;

  const score = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });

  return score;
}

// If score >= 70 → proceed to Stage 2
// If score < 70 → reject (polite email: "Not a fit right now, we'll keep you in pipeline")
```

**Stage 2: Recruiter Review (15 min)**

- Read full resume (not just AI summary)
- Check LinkedIn profile (career progression, recommendations)
- Google search (blog posts, GitHub, Stack Overflow)
- Red flags: Job hopping (5 jobs in 3 years), employment gaps, lack of Guidewire experience

**Stage 3: Phone Screen (30 min)**

**Questions:**
1. "Walk me through your Guidewire experience. Which products? What projects?"
2. "Describe a challenging PolicyCenter configuration you implemented."
3. "Are you available to start immediately? Or do you have 2-week notice?"
4. "What's your hourly rate expectation for contract work?" (ensure alignment with budget)
5. "Are you open to remote? On-site? Hybrid?"

**Red flags:**
- Can't articulate Guidewire projects (resume lies)
- Unrealistic rate expectations ($200/hr when market is $95/hr)
- Unavailable (can't start for 2 months)

**Stage 4: Technical Assessment (Optional, 1 hour)**

For senior roles or skeptical clients, we offer technical assessment:

```
TASK: "Build a simple PolicyCenter rating algorithm"

GIVEN:
- PolicyCenter sandbox access
- Requirements doc: "Rate personal auto based on driver age, vehicle value"

DELIVERABLE (in 1 hour):
- Working rating table (configured in PolicyCenter)
- Test cases (3 scenarios with expected premiums)

EVALUATION:
- Does it work? (functional)
- Is it correct? (accurate premiums)
- Is it clean? (no hardcoded values, proper naming)

PASS: 80%+ → submit to client
FAIL: <80% → reject (or offer training if promising)
```

**Stage 5: Reference Check (30 min)**

For external candidates (not InTime grads):
- Call previous manager or client
- Questions:
  - "How was [Candidate's] performance? (1-10 scale)"
  - "Would you hire them again?"
  - "Any concerns or areas for improvement?"
  - "Why did they leave?"

---

## Placement Workflow

### Step 1: Job Intake (Day 0)

**Client submits job via:**
- Website form (most common)
- Email (jobs@intimesolutions.com)
- Phone call (urgent, escalated)
- Slack (for existing clients with dedicated channel)

**Recruiter reviews within 2 hours:**
- Clarifying questions (if JD is vague)
- Confirm budget (hourly rate or salary range)
- Confirm timeline (start date, contract length)
- Set expectations: "We'll submit 3-5 candidates within 48 hours"

### Step 2: Candidate Matching (Day 0-1)

**Automated (AI) - 30 seconds:**
- Parse job description
- Query talent pool (1,000+ candidates)
- Score each candidate (GPT-4o-mini)
- Return top 20 (score >= 70)

**Manual (Recruiter) - 2 hours:**
- Review top 20, select best 10
- Phone screen top 10 (30 min each, spread over Day 1)
- Select best 3-5 for client submission

### Step 3: Submission to Client (Day 1-2)

**Email to client:**

```
SUBJECT: 3 PolicyCenter candidates (as promised, within 48 hours)

Hi [Client Name],

As promised, here are 3 qualified PolicyCenter developers for your review:

1. CANDIDATE A (Recommended)
   • 5 years PolicyCenter experience (healthcare insurance vertical)
   • Salary expectation: $95/hr (within your $90-$100 budget)
   • Available: Immediately
   • Highlights: Built complex rating algorithms, integrated with external APIs
   • Resume attached, LinkedIn: [link]

2. CANDIDATE B
   • 3 years PolicyCenter + 2 years BillingCenter (rare combo!)
   • Salary expectation: $85/hr (under budget, great value)
   • Available: 2 weeks (currently on project, wrapping up)
   • Highlights: InTime Academy graduate, strong capstone project
   • Resume attached, LinkedIn: [link]

3. CANDIDATE C
   • 7 years PolicyCenter (very senior, premium candidate)
   • Salary expectation: $110/hr (above budget but worth consideration)
   • Available: Immediately
   • Highlights: Led Guidewire implementations for 2 Fortune 500 insurers
   • Resume attached, LinkedIn: [link]

NEXT STEPS:
- Review resumes
- Let me know who you'd like to interview
- I can coordinate schedules (we typically get interviews set up within 24 hours)

Any questions or need more candidates? Let me know!

Best,
[Recruiter Name]
```

**Client response time:**
- Same day: 40% (urgent needs)
- Next day: 50%
- 3+ days: 10% (not urgent, or internal delays)

### Step 4: Interview Coordination (Day 3-5)

**Recruiter as facilitator:**
- Schedule interviews (send Calendly link or manual coordination)
- Prep candidate: "Here's what to expect, typical questions, dress code (even for Zoom)"
- Prep client: "Here's candidate's background, strengths, potential concerns"

**Interview formats:**
- Phone screen (30 min): HR or hiring manager, culture fit
- Technical interview (60 min): Architect or lead dev, Guidewire questions
- Final interview (30 min): CTO or VP, compensation discussion

**Post-interview:**
- Collect feedback from both sides
- If client likes candidate: Move to offer
- If client passes: Ask why, improve future matches

### Step 5: Offer & Acceptance (Day 5-7)

**Recruiter facilitates:**
- Client makes verbal offer → Recruiter communicates to candidate
- Candidate negotiates (if needed) → Recruiter mediates
- Agreement reached → Contract drafted
- Contract signed → Candidate confirmed

**Common negotiation points:**
- **Rate:** Client offers $90/hr, candidate wants $95/hr → settle at $92.50/hr
- **Start date:** Client wants Monday, candidate needs 2 weeks notice → compromise: start in 10 days
- **Contract length:** Client wants 3 months, candidate wants 6 months → start with 3, option to extend

**InTime's role:**
- Don't push too hard (we want long-term client relationships)
- Don't undervalue candidate (we want happy consultants who refer friends)
- Find win-win (both sides happy = repeat business)

### Step 6: Onboarding & Start Date (Day 7-14)

**Week before start:**
- Recruiter checks in with candidate: "Still good for Monday? Need anything?"
- Recruiter checks in with client: "Laptop ready? Access provisioned?"

**Day 1:**
- Candidate starts work
- Recruiter monitors: "How's your first day going?"

**Day 7:**
- Check-in with both: "Any issues? Everything smooth?"

**Day 30:**
- Final check-in: "Still going well? Consultant happy? Client happy?"
- If both happy: Placement successful ✅
- If issues: Escalate, resolve, or invoke 30-day replacement guarantee

---

## Success Metrics & KPIs

### Recruiting Metrics

| Metric | Target | Industry Benchmark |
|--------|--------|-------------------|
| **Time-to-Submit** | <48 hours | 7-14 days |
| **Submission-to-Interview Ratio** | 50% (1 in 2 get interviews) | 30% (1 in 3) |
| **Interview-to-Offer Ratio** | 33% (1 in 3 get offers) | 25% (1 in 4) |
| **Offer-to-Acceptance** | 90% (9 in 10 accept) | 80% |
| **30-Day Retention** | 95% (consultant still working) | 85% |
| **90-Day Retention** | 92% | 80% |
| **Client Repeat Rate** | 80% (use us again) | 60% |

### Business Metrics

| Metric | Year 1 Target |
|--------|--------------|
| **Placements** | 300 |
| **Revenue** | $1,500,000 |
| **Gross Margin** | 80% |
| **Revenue per Recruiter** | $250,000 |
| **Placements per Recruiter** | 50 (1/week) |
| **CAC (Client)** | $1,000 |
| **LTV (Client, 3 years)** | $80,000 |

---

## Economics & Unit Metrics

### Revenue Model

**Per Placement:**
```
FEE: $5,000 flat (contract roles)
OR
FEE: 15% of first-year salary (full-time roles)
  Example: $100K salary × 15% = $15,000

YEAR 1 MIX:
├─ Contract roles: 250 placements × $5,000 = $1,250,000 (83%)
└─ Full-time roles: 50 placements × $15,000 avg = $750,000 (17%)
    (Note: Adjusted to $300K for conservative projections)

TOTAL YEAR 1 REVENUE: $1,500,000
```

### Cost Structure

**Per Placement:**
```
RECRUITER TIME: 8 hours × $75/hr = $600
AI SCREENING: 50 candidates × $0.005 = $0.25 (negligible)
MARKETING: $400 (LinkedIn ads, job boards, outreach tools)
TOTAL COGS: $1,000

GROSS PROFIT: $5,000 - $1,000 = $4,000
GROSS MARGIN: 80%
```

**Fixed Costs (Year 1, 6 Pods = 12 Recruiters):**
```
SALARIES:
├─ 6 Senior Recruiters: 6 × $100,000 = $600,000
├─ 6 Junior Recruiters: 6 × $60,000 = $360,000
└─ TOTAL: $960,000

TECHNOLOGY:
├─ LinkedIn Recruiter (10 licenses): $120,000/year
├─ ATS (custom, included in main platform): $0
├─ Job boards (Indeed, Dice): $12,000/year
└─ TOTAL: $132,000

TOTAL FIXED: $1,092,000
```

**Profitability:**
```
REVENUE: $1,500,000
COGS: $1,000 × 300 = $300,000
GROSS PROFIT: $1,200,000

FIXED COSTS: $1,092,000
NET PROFIT: $108,000
NET MARGIN: 7% (low Year 1 due to upfront hiring, improves to 40%+ Year 2)
```

---

**Next Review:** Weekly (pipeline, placements, client feedback)
**Document Owner:** Recruiting Pod Leads
**Related Documents:**
- [Business Model](02-BUSINESS-MODEL.md)
- [Training Academy](04-TRAINING-ACADEMY.md)
- [Bench Sales](06-BENCH-SALES.md)
