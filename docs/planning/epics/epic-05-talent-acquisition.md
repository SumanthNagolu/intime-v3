# Epic 5: Talent Acquisition (Outbound)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**📋 Epic Name:** Talent Acquisition (Outbound)

**🎯 Goal:** Build $2M+ pipeline of enterprise clients via proactive business development

**💰 Business Value:** $200K Year 1 revenue (23 clients onboarded, 64 placements); $200K LTV per client over 3 years; enables long-term strategic partnerships

**👥 User Personas:**

- TA Specialists (1 pod = 2 people, manage 100 prospects → 23 clients)
- Enterprise Clients (insurance carriers, consulting firms implementing Guidewire)
- Hiring Managers (CTOs, VP Engineering, HR Directors at target companies)
- Admins (track pipeline, client acquisition cost, revenue)

**🎁 Key Features:**

- Prospect database (companies implementing Guidewire, trigger events)
- Market intelligence dashboard (Guidewire partner directory, LinkedIn scraping, press releases)
- Outbound campaign management (email sequences, LinkedIn outreach, call scripts)
- Prospect enrichment (Hunter.io email finder, RocketReach phone numbers)
- Discovery meeting scheduler (Calendly integration, automated booking)
- Pipeline management (stages: Prospect → Meeting → Opportunity → Client)
- Client onboarding (contracts, retainer setup, account manager assignment)
- Partnership tier management (Preferred, Strategic, Exclusive tiers)
- Activity tracking (emails sent, calls made, meetings booked, conversions)
- TA specialist dashboard (pipeline value, meetings this week, conversion rates)
- Client relationship management (monthly check-ins, satisfaction tracking)
- Revenue attribution (track placements by TA-sourced clients)

**📊 Success Metrics:**

- Prospects identified: 460/year (~100/quarter)
- Meetings booked: 115/year (2-3/week)
- Clients onboarded: 23/year (~2/month)
- Conversion rate: Prospect → Client 5% (industry 2-3%)
- Placements via TA clients: 64 Year 1 (avg 3 placements per client)
- Client LTV: $200K over 3 years (40 placements × $5K)

**🔗 Dependencies:**

- **Requires:** Epic 1 (Foundation), Epic 3 (Recruiting - for placement fulfillment)
- **Enables:** Recruiting scalability (enterprise clients = recurring business)
- **Blocks:** None

**⏱️ Effort Estimate:** 5 weeks, ~25 stories

**📅 Tentative Timeline:** Week 12-16 (Parallel with Bench Sales)

**Key Stories (Sample):**

1. Create prospects table (company, contact, title, email, phone, tier, stage)
2. Build market intelligence scraper (Guidewire partners, LinkedIn jobs, press)
3. Implement email enrichment (Hunter.io integration, email finder)
4. Create outbound email campaigns (templates, sequences, tracking)
5. Build LinkedIn outreach (InMail templates, connection requests)
6. Implement discovery meeting scheduler (Calendly integration, booking flow)
7. Create pipeline management (Kanban view, stage transitions, notes)
8. Build client onboarding workflow (contract generation, retainer setup)
9. Implement partnership tiers (Preferred, Strategic, Exclusive pricing)
10. Create TA specialist dashboard (pipeline value, activity metrics)
11. Build activity tracking (emails sent, calls logged, outcomes)
12. Implement client relationship management (check-in scheduler, notes)
13. Create revenue attribution (track placements by client source)
14. Build reporting (CAC, LTV, conversion funnel, ROI)
15. Implement automated follow-ups (email sequences, task reminders)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## Market Intelligence

### Trigger Events (How We Identify Prospects)

**1. Guidewire Press Releases:**
- "XYZ Insurance selects Guidewire PolicyCenter"
- Action: Reach out within 24 hours

**2. Job Postings:**
- Company posts 5+ Guidewire developer roles on LinkedIn
- Action: They're scaling, need talent fast

**3. Guidewire Partner Directory:**
- New customer listed
- Action: Implementation starting, will need devs

**4. Conference Attendance:**
- Presenting at Guidewire Connections
- Action: They're invested, likely hiring

### Intelligence Sources

**Automated Daily Scraping:**
```typescript
async function scrapeMarketIntelligence() {
  const sources = [
    scrapGuidewirePartnerDirectory(),
    scrapeLinkedInJobs('Guidewire'),
    fetchPressReleases('Guidewire'),
    monitorConferenceAttendees()
  ];

  const prospects = await Promise.all(sources);

  // Enrich with contact info
  for (const prospect of prospects.flat()) {
    const enriched = await enrichProspect(prospect);
    await saveToDatabase(enriched);
  }
}

// Run daily at 2 AM
```

---

## Outbound Campaign Strategy

### Multi-Channel Approach

**Email (60% of outreach):**

```
SUBJECT: PolicyCenter developers available (48-hour turnaround)

Hi [First Name],

I noticed [Company Name] is implementing Guidewire PolicyCenter
(saw the press release last week / job postings on LinkedIn).

Most companies struggle to find qualified PolicyCenter developers
(average 30-45 days to fill a role, which delays projects).

We're InTime - we specialize 100% in Guidewire talent and guarantee
candidate submission within 48 hours.

CURRENT AVAILABILITY (this month):
• 3× Senior PolicyCenter devs (5-8 years exp, $90-$110/hr)
• 5× Mid-level PolicyCenter devs (3-5 years exp, $75-$95/hr)
• 2× BillingCenter + PolicyCenter (rare combo, $100-$120/hr)

Would you like to see profiles? Happy to send 3 today if helpful.

Best,
[TA Specialist Name]
```

**Response Rate:**
- Cold emails sent: 100/week
- Open rate: 35%
- Response rate: 10%
- Meetings booked: 5%

**LinkedIn (30% of outreach):**

```
Hi [First Name],

Saw you're [Title] at [Company] and noticed you're implementing
Guidewire PolicyCenter.

Quick question: How are you planning to staff the Guidewire team?

We can submit qualified candidates within 48 hours (vs industry
average 30+ days).

Worth a 15-min call? [Calendly Link]
```

**Phone (10% of outreach):**
- Only for urgent needs or warm leads
- High-value prospects (Fortune 500)

---

## Partnership Tiers

### Tier 1: Preferred Partner ($2,500/month retainer)

**What Client Gets:**
- Dedicated account manager (monthly 1-on-1)
- Priority access to talent (first look at Academy grads)
- Discounted placement fees ($4,000 vs $5,000)

**Commitment:**
- 6-month minimum retainer ($15,000 upfront)
- Estimated 5-10 placements per 6 months

**Total Revenue (6 months):** $15K retainer + (7.5 × $4K) = $45K avg

### Tier 2: Strategic Partner ($5,000/month retainer)

**What Client Gets:**
- Everything in Preferred, plus:
- Embedded recruiter (on-site 1-2 days/week)
- Volume hiring support (20+ hires/year)
- Training partnership (co-branded Academy)
- Deeper discount ($3,500 per placement)

**Commitment:**
- 12-month minimum ($60,000 upfront)
- Estimated 20-40 placements per year

**Total Revenue (12 months):** $60K retainer + (30 × $3.5K) = $165K avg

### Tier 3: Exclusive Partner ($10,000/month retainer)

**What Client Gets:**
- Everything in Strategic, plus:
- Exclusivity (we don't work with direct competitors)
- White-glove service (24/7 support, dedicated Slack)
- International recruiting (global talent access)

**Commitment:**
- 24-month minimum ($240,000 upfront)
- Estimated 50-100 placements

**Total Revenue (24 months):** $240K retainer + (75 × $3K) = $465K avg

---

## 90-Day Pipeline Strategy

### Month 1: Prospect Identification

**Goal:** Identify 100 qualified prospects

**Activities:**
- Week 1-2: Market research (scrape LinkedIn, Guidewire directory, press)
- Week 3-4: Prospect enrichment (find emails, phone numbers, categorize)

**Deliverable:** CRM with 100 prospects (names, titles, emails, tier)

### Month 2: Outreach

**Goal:** Book 20 discovery meetings

**Activities:**
- Week 1: Email campaign #1 (Tier 1 hot prospects, 30 companies)
- Week 2: LinkedIn outreach (all 100 prospects)
- Week 3: Email campaign #2 (Tier 2 warm prospects, 40 companies)
- Week 4: Phone calls (Tier 1 non-responders)

**Conversion:** 20 meetings booked (20% of 100 contacted)

### Month 3: Close

**Goal:** Onboard 5 new enterprise clients

**Activities:**
- Discovery meetings (20 total)
- Follow-up (capabilities deck, case studies)
- First placements (5 clients × 2 placements avg = 10 placements)

**Revenue (Month 3):** $50K placement fees + $7.5K MRR (retainers)

---

## Success Criteria

**Definition of Done:**

1. ✅ 100 prospects identified and enriched in CRM
2. ✅ Email campaigns running (weekly sends, tracking opens/clicks)
3. ✅ Discovery meetings booked (2-3 per week)
4. ✅ Client onboarding workflow (contracts, retainers, account setup)
5. ✅ First placements via TA-sourced clients
6. ✅ Partnership tiers implemented (pricing, benefits, tracking)
7. ✅ TA specialist dashboard (pipeline value, conversion rates)
8. ✅ Revenue attribution (track which clients came from TA vs inbound)

**Quality Gates:**

- Prospects identified: 460/year (on track)
- Meetings booked: 115/year (2-3/week avg)
- Clients onboarded: 23/year (~2/month)
- Client LTV: $200K+ over 3 years

---

**Related Epics:**
- [Epic 1: Foundation](./epic-01-foundation.md) (Required)
- [Epic 3: Recruiting Services](./epic-03-recruiting-services.md) (Required for fulfillment)
- [Epic 4: Bench Sales](./epic-04-bench-sales.md) (Can build in parallel)
- [Epic 8: Cross-Border](./epic-08-cross-border.md) (Enabled - TA clients for immigration)

**Next Epic:** [Epic 6: HR & Employee Management](./epic-06-hr-employee.md)
