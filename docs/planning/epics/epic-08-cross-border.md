# Epic 8: Cross-Border Solutions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**📋 Epic Name:** Cross-Border Solutions

**🎯 Goal:** Place international Guidewire talent (India → Canada/USA) with complete immigration support (job + visa in 100 days)

**💰 Business Value:** $0 Year 1 (pilot/setup), $100K Year 2, $500K Year 3, $1M Year 5; 60-70% net margin (premium pricing); opens global talent market

**👥 User Personas:**

- International Candidates (India, Philippines - want Canada/USA opportunities)
- Cross-Border Specialist (0.5 person Year 1, 1 pod Year 2)
- Clients (Canadian/US companies willing to sponsor immigration)
- Immigration Partners (lawyers, consultants for LMIA/H-1B process)
- Admins (track immigration timelines, success rates, revenue)

**🎁 Key Features:**

- International candidate database (location, visa status, IELTS scores, experience)
- LMIA workflow (Canada - 100-day process tracking, document management)
- H-1B workflow (USA - lottery tracking, petition management)
- Immigration document management (LMIA letters, work permit applications, tracking)
- Client immigration onboarding (willing to sponsor, requirements education)
- Timeline tracking (Day 0 → Day 100, milestone alerts, bottleneck detection)
- Job matching (candidates to immigration-friendly clients)
- Immigration status dashboard (candidate view, specialist view, admin view)
- Document checklist (IELTS, degrees, passport, police clearance, medical)
- Government fee tracking ($1,000 LMIA + $240 work permit per case)
- Success rate reporting (LMIA approvals, work permit approvals, arrival tracking)
- Revenue tracking (placement fee $5K + immigration fee $17K per case)

**📊 Success Metrics:**

- Year 1: 0 placements (setup year - build processes, partnerships)
- Year 2: 5 placements (pilot, refine process, prove model)
- LMIA success rate: 90% (vs 60-70% industry)
- Time-to-arrival: 100 days average (vs 150+ days industry)
- Candidate satisfaction: 4.8+ stars (life-changing opportunity)
- Client satisfaction: 4.5+ stars (quality talent, smooth process)

**🔗 Dependencies:**

- **Requires:** Epic 1 (Foundation), Epic 3 (Recruiting - for client base), Epic 5 (TA - for client relationships)
- **Enables:** Two gold mines (H-1B → Canada, Canadian → USA TN visa)
- **Blocks:** None (low priority Year 1, pilot Year 2)

**⏱️ Effort Estimate:** 4 weeks, ~20 stories

**📅 Tentative Timeline:** Week 22-25 (Post-MVP, Year 2 prep)

**Key Stories (Sample):**

1. Create immigration_cases table (candidate, client, type: LMIA/H-1B, status, timeline)
2. Build international candidate onboarding (IELTS upload, document checklist)
3. Implement LMIA workflow (4 phases: screening, job advertising, application, processing)
4. Create document management (upload, track, government submission)
5. Build immigration timeline tracker (Day 0-100, milestone alerts)
6. Implement client immigration onboarding (willing to sponsor, education)
7. Create LMIA job advertising tracker (3 platforms, 4 weeks, recruitment report)
8. Build government fee tracking (LMIA $1K, work permit $240, payments)
9. Implement candidate dashboard (immigration status, next steps, documents needed)
10. Create specialist dashboard (active cases, bottlenecks, approval tracking)
11. Build success rate reporting (approvals, denials, reasons)
12. Implement H-1B lottery tracking (registration, results, petition filing)
13. Create arrival tracking (flight booking, port of entry, first day)
14. Build partnership management (immigration lawyers, consultants)
15. Implement revenue tracking (placement $5K + immigration $17K per case)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## 100-Day Immigration Process (LMIA)

### Timeline Overview (India → Canada)

```
DAY 0: Candidate identified (TA pod finds "Rahul" in India)

DAY 1-10: SCREENING & JOB MATCHING
├─ Technical interview (PolicyCenter skills)
├─ English proficiency (IELTS 6.0+)
├─ Background check (education, employment verification)
├─ Match to Canadian client (willing to sponsor)
└─ Client interview (Day 8-10)

DAY 11-15: JOB OFFER & LMIA PREP
├─ Client extends conditional offer
├─ Gather documents (resume, IELTS, certificates, passport)
├─ Prepare LMIA application (100+ page package)
└─ Client signs LMIA application

DAY 16-60: LMIA PROCESSING (Government of Canada)
├─ Submit to Service Canada (ESDC)
├─ Processing: 30-60 business days (avg 45 days)
├─ During wait: Candidate prepares (sells belongings, goodbyes)
└─ LMIA APPROVED! (Day 60)

DAY 61-90: WORK PERMIT APPLICATION
├─ Submit to IRCC (Immigration, Refugees, Citizenship Canada)
├─ Processing: 15-30 business days (avg 20 days)
├─ Biometrics appointment (fingerprints + photo)
├─ Medical exam (if required)
└─ WORK PERMIT APPROVED! (Day 80-90)

DAY 91-100: ARRIVAL & ONBOARDING
├─ Book flight (India → Toronto/Vancouver)
├─ Arrive in Canada (work permit issued at airport)
├─ Find housing, SIN, bank account, phone
├─ START WORK (Day 100-110)
└─ SUCCESS! 🎉
```

---

## LMIA Workflow (Detailed)

### What is LMIA?

**Labour Market Impact Assessment** = Canadian government approval to hire foreign worker

**Government's Question:** "Is this job taking away opportunity from a Canadian citizen?"

**Our Job:** Prove "NO, no Canadians are available for this role"

### LMIA Requirements

**Requirement #1: Job Was Advertised Publicly**

- Must advertise on 3 platforms for 4 weeks minimum
- Platforms: Job Bank (government), Indeed, LinkedIn
- Collect proof: Screenshots, application logs

**Requirement #2: No Qualified Canadians Applied**

- Track all applicants (how many Canadians?)
- For each: Why rejected? (lacks experience, too expensive, unavailable)
- Document: "15 Canadians applied, 0 were qualified"

**Requirement #3: Wage is at Market Rate (or higher)**

- Must pay at least median wage for role in province
- Example: PolicyCenter dev Ontario = $85K median
- Client offers $90K → APPROVED!

**Requirement #4: Positive Impact on Canadian Labor Market**

- Hiring foreign worker will HELP Canadians (not hurt)
- Example: "Developer will train 3 Canadian junior devs"

**Requirement #5: Employer is Legitimate**

- Company registered in Canada
- Financially stable (won't go bankrupt)
- No history of LMIA violations

---

## Revenue Model

### Pricing

**Per Successful Placement:**

- **Placement Fee:** $5,000 (job placement)
- **Immigration Fee:** $17,000 (LMIA + work permit support)
- **Total Revenue:** $22,000

### Cost Breakdown

**Per Case:**

- Specialist time: 80 hours × $75/hr = $6,000
- Government fees: $1,000 (LMIA) + $240 (work permit) = $1,240
- Legal review: $1,000 (if complex)
- Document translation: $500 (if needed)
- Miscellaneous: $260 (courier, notary, etc.)
- **Total Cost:** $9,000

**Gross Profit:** $22,000 - $9,000 = $13,000 (59% margin)

### Year 2 Projections (First Revenue Year)

```
PLACEMENTS: 5 successful (from 6 attempts, 1 LMIA denied)
REVENUE: 5 × $22,000 = $110,000

COSTS:
├─ Specialist salary (part-time, 50%): $50,000
├─ Direct costs (5 × $9,000): $45,000
└─ TOTAL: $95,000

NET PROFIT: $110,000 - $95,000 = $15,000
NET MARGIN: 14% (low Year 2, improves Year 3+)
```

---

## Two Gold Mines (Strategic Opportunities)

### Gold Mine #1: H-1B Holders (USA → Canada)

**Market Context:**

- Canada announced **special work permits for H-1B holders**
- Guidelines **NOT YET RELEASED** (first-mover advantage!)
- Thousands of H-1B holders uncertain about US immigration

**Why This is a Gold Mine:**

1. **First-Mover Advantage:** Guidelines not released, we prepare NOW
2. **High Conversion:** Already in North America, emotionally motivated
3. **Premium Pricing:** Willing to pay $30K-$50K (vs $17K India→Canada)
4. **Cross-Pollination:** Every H-1B has network of 10-20 colleagues

**Strategy:**

- **Phase 1 (Now):** Monitor Canada immigration announcements daily
- **Phase 2 (When Guidelines Released):** Launch "H-1B to Canada" service immediately
- **Phase 3 (3-6 Months):** Scale via referrals, partnerships

**Projected Revenue (Year 1 of program):**

- Placements: 20 (conservative)
- Average fee: $40,000 per placement
- **Total:** $800,000

### Gold Mine #2: Canadian Citizens (Canada → USA on TN Visa)

**Market Context:**

- **TN visa** = easy work visa for Canadians to USA (NAFTA/USMCA)
- No lottery, no sponsorship cost, 3-year renewable
- Many new Canadian citizens (recently naturalized from India/Asia)

**Why This is a Gold Mine:**

1. **Overlooked Market:** No one targets Canada→USA (assumed "easy")
2. **Existing Relationships:** InTime has network of Indian-origin Canadians
3. **Two-Way Value:** Place Canadians in US jobs ($20K-$30K fee)
4. **TN Advantages:** No lottery, fast (1-2 weeks), unlimited renewals

**Strategy:**

- **Phase 1:** Education (webinar: "TN Visa Masterclass")
- **Phase 2:** Candidate Pipeline (LinkedIn: Canadian citizens, Guidewire skills)
- **Phase 3:** Client Development (US companies: "Hire Canadians, no H-1B lottery")

**Projected Revenue (Year 1):**

- Placements: 10
- Placement fee: $25,000 + Visa support: $5,000 = $30,000 total
- **Total:** $300,000

---

## Database Schema

```sql
CREATE TABLE immigration_cases (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES user_profiles(id),
  client_id UUID REFERENCES clients(id),
  type TEXT, -- 'LMIA', 'H1B', 'TN', 'H1B_SPECIAL'
  status TEXT, -- 'screening', 'job_advertising', 'application_submitted',
               -- 'processing', 'approved', 'denied', 'work_permit_issued', 'arrived'
  timeline_start_date DATE,
  expected_arrival_date DATE,
  actual_arrival_date DATE,
  lmia_submitted_date DATE,
  lmia_approved_date DATE,
  work_permit_submitted_date DATE,
  work_permit_approved_date DATE,
  government_fees_paid NUMERIC(10,2), -- $1,240 for LMIA + work permit
  placement_fee NUMERIC(10,2), -- $5,000
  immigration_fee NUMERIC(10,2), -- $17,000
  total_revenue NUMERIC(10,2), -- $22,000
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE immigration_documents (
  id UUID PRIMARY KEY,
  case_id UUID REFERENCES immigration_cases(id),
  document_type TEXT, -- 'IELTS', 'degree', 'passport', 'police_clearance',
                      -- 'lmia_letter', 'work_permit', 'job_offer'
  file_url TEXT, -- S3 bucket link
  status TEXT, -- 'pending', 'uploaded', 'verified', 'submitted_to_government'
  uploaded_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Success Criteria

**Definition of Done (Year 1 - Setup):**

1. ✅ Immigration workflows documented (LMIA, H-1B, TN visa)
2. ✅ Database schema created (immigration_cases, documents)
3. ✅ Partnership established with immigration lawyer
4. ✅ Document checklist and templates ready
5. ✅ Timeline tracker functional (Day 0-100 milestones)
6. ✅ Client education materials (willing to sponsor, LMIA process)
7. ✅ Monitoring setup (H-1B special program announcements)

**Definition of Done (Year 2 - Pilot):**

1. ✅ 5 LMIA cases successfully placed (candidates arrived in Canada)
2. ✅ 90% LMIA approval rate (vs 60-70% industry)
3. ✅ 100-day average timeline (Day 0 → arrival)
4. ✅ Candidate satisfaction: 4.8+ stars
5. ✅ Client satisfaction: 4.5+ stars
6. ✅ Revenue: $110K (5 cases × $22K)

---

**Related Epics:**
- [Epic 1: Foundation](./epic-01-foundation.md) (Required)
- [Epic 3: Recruiting Services](./epic-03-recruiting-services.md) (Required for client base)
- [Epic 5: Talent Acquisition](./epic-05-talent-acquisition.md) (Required for enterprise clients)

**This is the final epic!** Ready for implementation roadmap.
