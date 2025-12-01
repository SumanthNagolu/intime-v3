# UC-RD-007: Pod Restructuring and Reorganization

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** Regional Director
**Status:** Approved

---

## 1. Overview

Pod restructuring involves creating new pods, merging existing pods, splitting pods, or reassigning individual contributors between pods to optimize organizational effectiveness. The Regional Director drives these structural changes based on business growth, market dynamics, team performance, and strategic priorities. This use case covers the complete lifecycle of pod reorganization.

**Key Restructuring Scenarios:**
- Creating new pod for market expansion or client growth
- Merging underperforming or redundant pods
- Splitting large pods for better focus and management
- Reassigning ICs to balance workload or develop talent
- Reorganizing after acquisitions or major client wins/losses

---

## 2. Actors

- **Primary:** Regional Director
- **Secondary:** Pod Managers, Country Managers, HR Manager, COO
- **System:** InTime Platform, HRIS, Project Management
- **Affected:** Individual Contributors (Recruiters, Bench Sales, TA Specialists)

---

## 3. Preconditions

- Regional Director has authority to restructure organization
- Current pod structure and performance data available
- Business case for restructuring documented
- HR Manager consulted for employee impact assessment
- COO approval obtained for major restructuring (>20% of pods)
- Communication plan prepared for affected employees

---

## 4. Trigger

**Restructuring triggers include:**
- Business growth requiring new pod creation
- Pod underperformance (revenue, margin, retention)
- Market opportunity requiring specialized focus
- Pod Manager departure or promotion
- Client concentration risk requiring rebalancing
- Acquisition integration
- Cost reduction initiatives
- Strategic pivot (new service line, geography, vertical)

---

## 5. Main Flow: Pod Creation

### 5.1 Assess Need for New Pod

**Step 1: Business Case Development**

Regional Director identifies opportunity and builds business case:

```
┌──────────────────────────────────────────────────────────────────┐
│ NEW POD BUSINESS CASE                                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Proposed Pod Name: Enterprise SaaS Recruiting (US-West)          │
│ Pod Type: ● Recruiting  ○ Bench Sales  ○ TA                     │
│ Geography: United States - West Coast (CA, OR, WA)               │
│ Vertical Focus: Enterprise SaaS companies                        │
│                                                                   │
│ BUSINESS RATIONALE:                                              │
│                                                                   │
│ Market Opportunity:                                              │
│ ├─ 50+ SaaS companies in SF Bay Area seeking IT talent           │
│ ├─ Average deal size: $500K-$2M annually                         │
│ ├─ High growth market (20% YoY)                                  │
│ ├─ Underserved by current generalist pods                        │
│ └─ Competitor analysis: 3 specialized firms, room for 4th        │
│                                                                   │
│ Current State Gaps:                                              │
│ ├─ Enterprise SaaS accounts spread across 3 pods                 │
│ ├─ No deep SaaS industry expertise in team                       │
│ ├─ Losing deals to specialized competitors                       │
│ ├─ Account coverage inconsistent (too many accounts per IC)      │
│ └─ Missing 30% of inbound leads due to capacity                  │
│                                                                   │
│ Strategic Alignment:                                             │
│ ├─ Company goal: Increase enterprise segment from 20% to 35%     │
│ ├─ Regional goal: Add $15M in new revenue (2026)                 │
│ ├─ This pod addresses both objectives                            │
│ └─ Enables further expansion in 2027-2028                        │
│                                                                   │
│ FINANCIAL PROJECTIONS (3-Year):                                  │
│                                                                   │
│ Year 1 (2026):                                                   │
│ ├─ Revenue: $3.5M (conservative ramp)                            │
│ ├─ Gross Margin: 28% (new pod, learning curve)                   │
│ ├─ EBITDA: $0.2M (breakeven achieved Month 9)                    │
│ └─ Team Size: 1 Manager + 4 Recruiters                          │
│                                                                   │
│ Year 2 (2027):                                                   │
│ ├─ Revenue: $8.5M (143% growth)                                  │
│ ├─ Gross Margin: 32% (efficiency gains)                          │
│ ├─ EBITDA: $1.2M                                                 │
│ └─ Team Size: 1 Manager + 8 Recruiters                          │
│                                                                   │
│ Year 3 (2028):                                                   │
│ ├─ Revenue: $14.0M (65% growth)                                  │
│ ├─ Gross Margin: 35% (mature pod)                                │
│ ├─ EBITDA: $2.5M                                                 │
│ └─ Team Size: 1 Manager + 12 Recruiters                         │
│                                                                   │
│ Total 3-Year Value: $26M revenue, $3.9M EBITDA                   │
│                                                                   │
│ INVESTMENT REQUIRED:                                             │
│                                                                   │
│ Initial Setup (Months 1-3):                                      │
│ ├─ Pod Manager hire: $150K base + $50K sign-on                   │
│ ├─ 4 Recruiter hires: $280K base total                           │
│ ├─ Recruiting costs: $80K (external fees)                        │
│ ├─ Technology/tools: $20K (licenses, setup)                      │
│ ├─ Marketing/branding: $30K (website, collateral)                │
│ ├─ Training: $40K (SaaS industry, sales)                         │
│ └─ Total: $650K                                                  │
│                                                                   │
│ Ongoing Costs (Monthly, Year 1):                                 │
│ ├─ Salaries + benefits: $85K/month                               │
│ ├─ Office/overhead: $15K/month                                   │
│ ├─ Sales & marketing: $10K/month                                 │
│ └─ Total: $110K/month = $1.32M annually                          │
│                                                                   │
│ Breakeven Analysis:                                              │
│ ├─ Monthly revenue needed: $400K (at 30% margin)                 │
│ ├─ Estimated time to breakeven: 9 months                         │
│ ├─ Risk: Medium (proven market, experienced leadership)          │
│ └─ Payback period: 18 months                                     │
│                                                                   │
│ RISK ASSESSMENT:                                                 │
│                                                                   │
│ High Risks:                                                      │
│ ├─ Failure to hire strong Pod Manager (mitigation: use exec      │
│ │   search firm, offer competitive package)                      │
│ ├─ Market downturn in tech/SaaS (mitigation: diversify clients,  │
│ │   build 12-month runway)                                       │
│ └─ Talent acquisition challenges (mitigation: leverage existing   │
│     team for referrals, use Academy program)                     │
│                                                                   │
│ Medium Risks:                                                    │
│ ├─ Slower ramp than projected (mitigation: seed pod with 2-3     │
│ │   existing accounts)                                           │
│ ├─ Culture/integration issues (mitigation: strong onboarding,    │
│ │   mentorship from existing pods)                               │
│ └─ Technology platform gaps (mitigation: budget for custom dev)  │
│                                                                   │
│ Low Risks:                                                       │
│ ├─ Competitive response (strong brand, existing relationships)   │
│ └─ Regulatory changes (well-understood compliance environment)   │
│                                                                   │
│ SUCCESS METRICS:                                                 │
│                                                                   │
│ Month 3:                                                         │
│ ├─ Pod Manager hired and onboarded                               │
│ ├─ 3+ recruiters hired and trained                               │
│ ├─ 5+ target accounts identified and contacted                   │
│ └─ First job order received                                      │
│                                                                   │
│ Month 6:                                                         │
│ ├─ Full team of 5 (1 manager + 4 ICs) in place                   │
│ ├─ 15+ active client accounts                                    │
│ ├─ 10+ open job orders                                           │
│ ├─ First placements made (3+)                                    │
│ └─ Revenue: $150K/month run rate                                 │
│                                                                   │
│ Month 12:                                                        │
│ ├─ Revenue: $300K/month run rate ($3.6M annualized)              │
│ ├─ Gross margin: 28%+                                            │
│ ├─ EBITDA positive                                               │
│ ├─ Client satisfaction: 8.5+/10                                  │
│ ├─ Employee retention: 90%+                                      │
│ └─ Ready to scale to 8 ICs                                       │
│                                                                   │
│ RECOMMENDATION: ✓ PROCEED                                        │
│                                                                   │
│ Regional Director: Michael Chen                                  │
│ Date: November 30, 2025                                          │
│                                                                   │
│ Approvals Required:                                              │
│ ☐ COO Approval (required for new pod creation)                   │
│ ☐ CFO Approval (budget allocation: $650K setup + $1.32M Y1)     │
│ ☐ HR Manager Review (hiring plan, comp structure)                │
│                                                                   │
│ [Submit for Approval] [Save Draft] [Request Feedback] [Cancel]  │
└──────────────────────────────────────────────────────────────────┘
```

**Step 2: Obtain Executive Approval**

Regional Director submits business case to COO and CFO. Approval meeting scheduled:

```
Approval Meeting Agenda:
├─ Business case presentation (20 min)
├─ Financial model review (15 min)
├─ Risk assessment discussion (10 min)
├─ Q&A and decision (15 min)
└─ Next steps if approved (5 min)

Decision Criteria:
├─ ROI > 20% by Year 3
├─ Breakeven within 12 months
├─ Strategic fit with company goals
├─ Talent availability to staff pod
├─ Budget capacity in regional P&L
└─ Risk level acceptable
```

**Step 3: Create Pod in System**

Once approved, Regional Director creates pod in InTime platform:

```
┌──────────────────────────────────────────────────────────────────┐
│ CREATE NEW POD                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Basic Information                                                │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ Pod Name: *                                                │   │
│ │ [Enterprise SaaS Recruiting (US-West)                    ] │   │
│ │                                                            │   │
│ │ Pod Code: * (auto-generated)                               │   │
│ │ [US-WEST-SAAS-001                                        ] │   │
│ │                                                            │   │
│ │ Pod Type: *                                                │   │
│ │ ● Recruiting  ○ Bench Sales  ○ TA  ○ Hybrid              │   │
│ │                                                            │   │
│ │ Region: *                                                  │   │
│ │ [Americas                                             ▼] │   │
│ │                                                            │   │
│ │ Country: *                                                 │   │
│ │ [United States                                        ▼] │   │
│ │                                                            │   │
│ │ Office Location:                                           │   │
│ │ [San Francisco, CA                                    ▼] │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│ Focus Areas                                                      │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ Industry Vertical:                                         │   │
│ │ [☑] SaaS/Cloud  [ ] FinTech  [ ] HealthTech               │   │
│ │ [ ] E-commerce  [ ] Cybersecurity  [ ] AI/ML              │   │
│ │                                                            │   │
│ │ Geography:                                                 │   │
│ │ [☑] California  [☑] Oregon  [☑] Washington                │   │
│ │ [ ] Colorado    [ ] Texas   [ ] New York                  │   │
│ │                                                            │   │
│ │ Client Segment:                                            │   │
│ │ [☑] Enterprise (1000+ employees)                           │   │
│ │ [ ] Mid-Market (100-999)                                   │   │
│ │ [ ] SMB (<100)                                             │   │
│ │                                                            │   │
│ │ Technology Skills (primary):                               │   │
│ │ [Cloud Architecture, DevOps, Full Stack, Data Engineer  ] │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│ Pod Manager                                                      │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ Assign Pod Manager: *                                      │   │
│ │ ○ Existing Employee:  [Search...                       ▼] │   │
│ │ ● To Be Hired (create job req)                             │   │
│ │                                                            │   │
│ │ If TBH:                                                    │   │
│ │ Job Title: [Pod Manager - Enterprise SaaS Recruiting    ] │   │
│ │ Target Start: [February 1, 2026                      📅] │   │
│ │ Hiring Manager: [Michael Chen (Regional Director)    ▼] │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│ Team Structure (Target State)                                    │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ Pod Manager:          1                                    │   │
│ │ Senior Recruiters:    [1]  (3+ years exp)                  │   │
│ │ Recruiters:           [2]  (1-3 years)                     │   │
│ │ Junior Recruiters:    [1]  (0-1 years)                     │   │
│ │                                                            │   │
│ │ Total Team Size:      5 (Year 1)                          │   │
│ │ Target Size (Year 2): [8]                                  │   │
│ │ Target Size (Year 3): [12]                                 │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│ Financial Targets (Year 1)                                       │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ Revenue Target:       [$3,500,000              ]           │   │
│ │ Gross Margin Target:  [28] %                               │   │
│ │ EBITDA Target:        [$200,000                ]           │   │
│ │ Breakeven Month:      [9]                                  │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│ Operational Targets                                              │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ Placements/Month:     [8] (by Month 12)                    │   │
│ │ Time-to-Fill (avg):   [22] days                            │   │
│ │ Client Satisfaction:  [8.5] / 10                           │   │
│ │ Consultant Retention: [90] % (90-day)                      │   │
│ │ Employee Retention:   [90] %                               │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│ Launch Plan                                                      │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ Launch Date:          [February 1, 2026              📅] │   │
│ │ Ramp Period:          [6] months to full productivity      │   │
│ │ Initial Budget:       [$650,000] (setup costs)             │   │
│ │                                                            │   │
│ │ Key Milestones:                                            │   │
│ │ ☐ Month 1: Pod Manager hired                              │   │
│ │ ☐ Month 2: First 2 recruiters hired                       │   │
│ │ ☐ Month 3: Full team (5) in place                         │   │
│ │ ☐ Month 4: First client accounts signed                   │   │
│ │ ☐ Month 5: First placements made                          │   │
│ │ ☐ Month 6: $150K monthly revenue run rate                 │   │
│ │ ☐ Month 9: Breakeven achieved                             │   │
│ │ ☐ Month 12: $300K monthly revenue run rate                │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│ [Create Pod] [Save Draft] [Cancel]                               │
└──────────────────────────────────────────────────────────────────┘
```

**Step 4: Execute Launch Plan**

Regional Director oversees pod launch:

```
Launch Timeline (Weeks 1-12):

Week 1-4: Hiring Blitz
├─ Post Pod Manager job (external search firms engaged)
├─ Screen candidates (target: 20+ applicants, 5 interviews)
├─ Make offer (by Week 3)
└─ Onboard Pod Manager (Week 4)

Week 5-8: Team Building
├─ Pod Manager starts recruiting team (with Regional Director support)
├─ Post recruiter positions (internal + external)
├─ Screen and interview candidates
├─ Make offers (2-3 recruiters by Week 8)
└─ Onboarding and training

Week 9-12: Market Entry
├─ Complete team hiring (5 total)
├─ Industry training (SaaS market, buyers, tech stacks)
├─ Sales training (enterprise selling, account planning)
├─ InTime platform training
├─ Assign initial target account list (50 accounts)
├─ Launch marketing campaign (LinkedIn, email, events)
└─ First client meetings and job orders
```

### 5.2 Pod Launch Communication

**Step 1: Internal Announcement**

Regional Director announces new pod to organization:

```
From: Michael Chen <michael.chen@intime.com>
To: Americas Team <americas@intime.com>
Cc: Executive Team <exec@intime.com>
Subject: 🚀 Announcing New Pod: Enterprise SaaS Recruiting (US-West)

Team,

I'm excited to announce the creation of a new pod in the Americas region:

ENTERPRISE SAAS RECRUITING (US-WEST)

WHY WE'RE DOING THIS:
The Enterprise SaaS market on the West Coast represents a $50M+ opportunity
for InTime. By creating a specialized pod focused exclusively on this segment,
we'll deliver better results for clients and accelerate our growth.

WHAT THIS MEANS FOR YOU:
- New career opportunities (we're hiring 5 roles - see links below)
- Knowledge sharing (SaaS expertise will be shared across pods)
- Cross-pod collaboration (you can refer SaaS leads to the new team)
- Regional growth (stronger regional performance benefits everyone)

LEADERSHIP:
We're currently recruiting an exceptional Pod Manager to lead this team.
If you have referrals, please send them my way.

TIMELINE:
- Launch: February 1, 2026
- Full team in place: April 2026
- First placements: May 2026
- Breakeven: October 2026

OPEN POSITIONS:
1. Pod Manager - Enterprise SaaS Recruiting (apply)
2. Senior Recruiter - Enterprise SaaS (x1) (apply)
3. Recruiter - Enterprise SaaS (x2) (apply)
4. Junior Recruiter - Enterprise SaaS (x1) (apply)

HOW YOU CAN HELP:
1. Refer strong candidates for the open roles
2. Share any SaaS client leads or contacts
3. Welcome the new team members when they join
4. Share your best practices and lessons learned

I'll be hosting a Q&A session on this Thursday at 10am PT. Calendar invite
to follow.

Questions? Reach out anytime.

Let's make this a huge success!

Michael
---
Michael Chen
Regional Director - Americas
InTime | www.intime.com
```

**Step 2: External Messaging**

Marketing team prepares external launch announcement (press release, LinkedIn, website update).

---

## 6. Alternative Flows

### 6.1 Pod Merger

**Trigger:** Two or more pods underperforming, overlapping focus, or leadership vacancy

**Decision Criteria for Merger:**
- Combined revenue < $5M (below critical mass)
- Duplicate client coverage or specialization
- Leadership gap (Pod Manager departed, no successor)
- Market conditions deteriorated (e.g., vertical in decline)
- Strategic consolidation (simplify org structure)

**Example Scenario:**

```
┌──────────────────────────────────────────────────────────────────┐
│ POD MERGER ANALYSIS                                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Proposed Merger: FinTech Recruiting Pod A + FinTech Pod B        │
│                                                                   │
│ CURRENT STATE:                                                   │
│                                                                   │
│ Pod A (New York):                                                │
│ ├─ Team: 1 Manager + 3 Recruiters                                │
│ ├─ Revenue: $2.1M annually                                       │
│ ├─ Gross Margin: 24% (below target)                              │
│ ├─ EBITDA: -$50K (unprofitable)                                  │
│ ├─ Clients: 35 active accounts                                   │
│ ├─ Manager: Jane Smith (5 years tenure, strong performer)        │
│ └─ Issues: Small team, high overhead, market saturation          │
│                                                                   │
│ Pod B (Boston):                                                  │
│ ├─ Team: 1 Manager + 2 Recruiters                                │
│ ├─ Revenue: $1.8M annually                                       │
│ ├─ Gross Margin: 26%                                             │
│ ├─ EBITDA: -$80K (unprofitable)                                  │
│ ├─ Clients: 28 active accounts                                   │
│ ├─ Manager: Bob Jones (departed November 2025)                   │
│ └─ Issues: Leadership vacancy, struggling without manager        │
│                                                                   │
│ MERGER RATIONALE:                                                │
│                                                                   │
│ 1. Economies of Scale:                                           │
│    Combined revenue $3.9M supports leadership and overhead       │
│                                                                   │
│ 2. Leadership Continuity:                                        │
│    Jane Smith manages combined team (eliminates vacancy)         │
│                                                                   │
│ 3. Geographic Synergy:                                           │
│    NY + Boston = Northeast FinTech corridor (natural fit)        │
│                                                                   │
│ 4. Client Deduplication:                                         │
│    7 overlapping clients can be better served by unified team    │
│                                                                   │
│ 5. Cost Savings:                                                 │
│    Eliminate duplicate manager role = $180K annual savings       │
│                                                                   │
│ PROPOSED MERGED POD:                                             │
│                                                                   │
│ Name: Northeast FinTech Recruiting                               │
│ Team: 1 Manager (Jane) + 5 Recruiters (keep best performers)     │
│ Revenue: $3.9M (combined)                                        │
│ Target Margin: 30% (efficiency gains)                            │
│ EBITDA: +$150K (profitable)                                      │
│ Clients: 56 total (63 - 7 overlaps)                              │
│ Geography: NY + Boston + Philadelphia expansion                  │
│                                                                   │
│ PEOPLE IMPACT:                                                   │
│                                                                   │
│ Retained (6 employees):                                          │
│ ├─ Jane Smith (Pod Manager) - promotion to larger pod            │
│ ├─ Alice (Senior Recruiter, Pod A) - retained                    │
│ ├─ Carol (Recruiter, Pod A) - retained                           │
│ ├─ David (Recruiter, Pod A) - retained                           │
│ ├─ Eve (Senior Recruiter, Pod B) - retained                      │
│ └─ Frank (Recruiter, Pod B) - retained                           │
│                                                                   │
│ Impacted (1 employee):                                           │
│ ├─ Grace (Junior Recruiter, Pod B) - underperformer              │
│ └─ Action: Performance improvement plan or reassignment          │
│                                                                   │
│ FINANCIAL IMPACT:                                                │
│                                                                   │
│ One-Time Costs:                                                  │
│ ├─ Severance (if needed): $0 - $50K                              │
│ ├─ Relocation assistance (Boston→NY): $30K                       │
│ ├─ Office consolidation: $20K                                    │
│ ├─ Technology migration: $10K                                    │
│ └─ Total: $60K - $110K                                           │
│                                                                   │
│ Annual Savings:                                                  │
│ ├─ Manager salary elimination: $180K                             │
│ ├─ Office space (Boston): $60K                                   │
│ ├─ Overhead reduction: $40K                                      │
│ └─ Total: $280K annual savings                                   │
│                                                                   │
│ Payback: <6 months                                               │
│                                                                   │
│ RISKS & MITIGATION:                                              │
│                                                                   │
│ 1. Employee Morale:                                              │
│    Risk: Uncertainty, fear of job loss                           │
│    Mitigation: Transparent communication, retention bonuses      │
│                                                                   │
│ 2. Client Disruption:                                            │
│    Risk: Confusion, relationship gaps during transition          │
│    Mitigation: Client-by-client transition plan, joint calls     │
│                                                                   │
│ 3. Geography Challenges:                                         │
│    Risk: NY team unfamiliar with Boston market                   │
│    Mitigation: Keep local expertise, gradual integration         │
│                                                                   │
│ 4. Jane Smith Overwhelm:                                         │
│    Risk: Managing 5 ICs vs. 3, larger portfolio                  │
│    Mitigation: Promote Senior Recruiter to Team Lead role        │
│                                                                   │
│ TIMELINE:                                                        │
│                                                                   │
│ Week 1: Announce merger, communicate to teams                    │
│ Week 2-3: Client communication and transition planning           │
│ Week 4-6: System migrations, account reassignments               │
│ Week 7-8: Office consolidation, relocation support               │
│ Week 9-12: Integration completion, performance monitoring        │
│                                                                   │
│ RECOMMENDATION: ✓ PROCEED WITH MERGER                            │
│                                                                   │
│ Approvals:                                                       │
│ ☑ Regional Director: Michael Chen (November 30, 2025)            │
│ ☐ COO Approval Required                                          │
│ ☐ HR Manager Review (people impact)                              │
│                                                                   │
│ [Submit for Approval] [Revise Plan] [Cancel]                     │
└──────────────────────────────────────────────────────────────────┘
```

**Merger Execution Steps:**

```
Step 1: Executive Approval (Week 1)
├─ Present merger business case to COO
├─ HR review of people impact and risk
├─ Legal review of employment contracts (any issues?)
└─ Obtain approvals

Step 2: Leadership Communication (Week 1)
├─ Meet with Jane Smith (confirm willingness to lead merged pod)
├─ Communicate to Pod B team (Bob's former team)
├─ Discuss career paths, retention packages
└─ Address concerns and questions

Step 3: Team Announcement (Week 1, Day 5)
├─ Joint meeting with both pods
├─ Explain rationale (business, not performance)
├─ Detail transition timeline
├─ Emphasize opportunities (larger pod, more resources)
└─ Q&A session

Step 4: Client Communication (Week 2-3)
├─ Email all clients explaining transition
├─ Joint calls with Pod A + B account owners
├─ Introduce new single point of contact
├─ Reassure continuity and improved service
└─ Update CRM ownership records

Step 5: System Integration (Week 4-6)
├─ Merge pod records in InTime platform
├─ Reassign accounts to unified pod
├─ Consolidate pipelines and candidate databases
├─ Update reporting and dashboards
└─ Archive Pod B as "merged" (historical data retained)

Step 6: Physical Consolidation (Week 7-8)
├─ Relocate Boston team to New York (or remote)
├─ Office space adjustments
├─ Technology setup (desks, phones, VPN)
└─ Welcome and integration activities

Step 7: Performance Monitoring (Week 9-12)
├─ Weekly check-ins with Jane and team
├─ Client satisfaction surveys
├─ Revenue and pipeline tracking
├─ Address issues quickly
└─ Celebrate wins and milestones
```

### 6.2 Pod Split

**Trigger:** Pod too large (>12 ICs), geography too broad, or multiple specializations

**Decision Criteria for Split:**
- Pod size > 12 ICs (beyond span of control)
- Revenue > $15M (too large for one manager)
- Multiple distinct specializations (e.g., FinTech + HealthTech)
- Geographic spread too wide (e.g., US East + West)
- Client concentration risk (one manager owns too much)
- Talent development (create leadership opportunities)

**Example Scenario:**

```
┌──────────────────────────────────────────────────────────────────┐
│ POD SPLIT ANALYSIS                                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Current Pod: General IT Recruiting (US-National)                 │
│                                                                   │
│ CURRENT STATE:                                                   │
│                                                                   │
│ Team: 1 Manager (Sarah Lee) + 14 Recruiters                      │
│ Revenue: $18.5M annually                                         │
│ Gross Margin: 32%                                                │
│ EBITDA: $2.1M                                                    │
│ Clients: 120 active accounts                                     │
│ Geography: Nationwide (all 50 states)                            │
│                                                                   │
│ ISSUES:                                                          │
│                                                                   │
│ 1. Span of Control:                                              │
│    Sarah manages 14 direct reports (recommended max: 8-10)       │
│    Limited 1:1 time, coaching, development                       │
│                                                                   │
│ 2. Geographic Challenges:                                        │
│    Nationwide coverage = timezone complexity (ET to PT)          │
│    Difficult to specialize in local markets                      │
│    Client visits require extensive travel                        │
│                                                                   │
│ 3. Generalist vs. Specialist:                                    │
│    Team covers all IT skills (infrastructure, dev, data, etc.)   │
│    Losing deals to specialized competitors                       │
│    Recruiters stretched thin on skill depth                      │
│                                                                   │
│ 4. Growth Constraints:                                           │
│    Can't add more ICs to this pod (already too large)            │
│    Revenue growth limited by management bandwidth                │
│    Leadership development stalled (no path to Pod Manager)       │
│                                                                   │
│ PROPOSED SPLIT:                                                  │
│                                                                   │
│ Split into 2 pods:                                               │
│                                                                   │
│ POD 1: Infrastructure & DevOps Recruiting (US-East)              │
│ ├─ Manager: Sarah Lee (current manager, stays with East)         │
│ ├─ Team: 7 Recruiters (infrastructure, cloud, DevOps focus)      │
│ ├─ Revenue: $9.5M (51% of current)                               │
│ ├─ Geography: Eastern US (ET/CT timezones)                       │
│ └─ Clients: 60 accounts (infrastructure/cloud focused)           │
│                                                                   │
│ POD 2: Software Development Recruiting (US-West)                 │
│ ├─ Manager: Alex Kim (Senior Recruiter promotion)                │
│ ├─ Team: 7 Recruiters (software dev, full stack, data focus)     │
│ ├─ Revenue: $9.0M (49% of current)                               │
│ ├─ Geography: Western US (MT/PT timezones)                       │
│ └─ Clients: 60 accounts (software development focused)           │
│                                                                   │
│ BENEFITS:                                                        │
│                                                                   │
│ 1. Better Management:                                            │
│    7 ICs per manager (optimal span of control)                   │
│    More coaching, development, career growth                     │
│    Improved employee satisfaction and retention                  │
│                                                                   │
│ 2. Specialization:                                               │
│    Deeper skill expertise in each area                           │
│    Better competitive positioning                                │
│    Higher win rates and margins                                  │
│                                                                   │
│ 3. Geographic Focus:                                             │
│    Local market knowledge and presence                           │
│    Easier client visits and relationship building                │
│    Timezone alignment with clients                               │
│                                                                   │
│ 4. Leadership Development:                                       │
│    Alex Kim promoted to Pod Manager (internal promotion)         │
│    Creates clear career path for high performers                 │
│    Builds leadership bench for future growth                     │
│                                                                   │
│ 5. Scalability:                                                  │
│    Each pod can grow to 10 ICs = 20 total (vs. 14 today)         │
│    Revenue potential: $30M+ combined (vs. $18.5M today)          │
│    Flexibility to create additional pods later                   │
│                                                                   │
│ PEOPLE IMPACT:                                                   │
│                                                                   │
│ Sarah Lee (Current Manager):                                     │
│ ├─ Stays as Pod Manager - Infrastructure & DevOps (East)         │
│ ├─ Manages 7 recruiters (reduced from 14)                        │
│ ├─ Geographic focus: East Coast                                  │
│ └─ No change to compensation (revenue scope similar)             │
│                                                                   │
│ Alex Kim (Senior Recruiter → Pod Manager):                       │
│ ├─ Promoted to Pod Manager - Software Dev (West)                 │
│ ├─ Manages 7 recruiters (first-time manager)                     │
│ ├─ Geographic focus: West Coast                                  │
│ ├─ Base salary increase: $120K → $150K                           │
│ ├─ Eligible for manager-level bonus and equity                   │
│ └─ Extensive onboarding and mentorship by Sarah + Regional Dir   │
│                                                                   │
│ 14 Recruiters:                                                   │
│ ├─ 7 assigned to Pod 1 (Infrastructure/DevOps)                   │
│ ├─ 7 assigned to Pod 2 (Software Dev)                            │
│ ├─ Assignments based on: skill focus, geography, client accounts │
│ ├─ No salary changes (just pod reassignment)                     │
│ └─ Opportunity: Smaller pod = more visibility, faster growth     │
│                                                                   │
│ FINANCIAL IMPACT:                                                │
│                                                                   │
│ One-Time Costs:                                                  │
│ ├─ Alex Kim promotion (comp increase): $30K annually             │
│ ├─ Manager training for Alex: $15K                               │
│ ├─ System setup (new pod, reporting): $10K                       │
│ ├─ Marketing/branding (new pod identity): $20K                   │
│ └─ Total: $75K first year                                        │
│                                                                   │
│ Ongoing Costs:                                                   │
│ ├─ Additional manager salary: $30K/year (Alex increase)          │
│ ├─ Overhead allocation: $40K/year (second pod)                   │
│ └─ Total: $70K annually                                          │
│                                                                   │
│ Revenue Impact (Year 1 post-split):                              │
│ ├─ Pod 1: $10.5M (+11% growth from specialization)               │
│ ├─ Pod 2: $10.0M (+11% growth)                                   │
│ └─ Total: $20.5M (+11% vs. $18.5M pre-split)                     │
│                                                                   │
│ EBITDA Impact:                                                   │
│ ├─ Pre-split: $2.1M on $18.5M (11.4%)                            │
│ ├─ Post-split: $2.5M on $20.5M (12.2%)                           │
│ └─ Improvement: +$400K EBITDA                                    │
│                                                                   │
│ ROI: 533% first year ($400K gain / $75K investment)              │
│                                                                   │
│ RISKS & MITIGATION:                                              │
│                                                                   │
│ 1. Alex Kim Readiness:                                           │
│    Risk: First-time manager, unproven leadership                 │
│    Mitigation: Intensive manager training, Sarah mentorship,     │
│                Regional Director close monitoring, 90-day plan   │
│                                                                   │
│ 2. Team Disruption:                                              │
│    Risk: Uncertainty, relationship changes                       │
│    Mitigation: Transparent communication, team choice in         │
│                assignments, maintain cross-pod collaboration     │
│                                                                   │
│ 3. Client Confusion:                                             │
│    Risk: Which pod to contact for what?                          │
│    Mitigation: Clear communication, updated website/marketing,   │
│                joint introduction calls, CRM tagging             │
│                                                                   │
│ 4. Sarah Resentment:                                             │
│    Risk: Feels diminished (smaller pod, peer created)            │
│    Mitigation: Frame as positive (better management, growth      │
│                opportunity for all), recognize her mentorship    │
│                                                                   │
│ TIMELINE:                                                        │
│                                                                   │
│ Month 1:                                                         │
│ ├─ Week 1: Announce split, communicate rationale                 │
│ ├─ Week 2: Alex Kim promotion announced and accepted             │
│ ├─ Week 3: Team assignments determined (input from team)         │
│ ├─ Week 4: Client communication begins                           │
│                                                                   │
│ Month 2:                                                         │
│ ├─ Week 5-6: Alex Kim manager training intensive                 │
│ ├─ Week 7-8: System setup, pod creation in InTime                │
│ ├─ Week 8: Official split effective date                         │
│                                                                   │
│ Month 3:                                                         │
│ ├─ Week 9-12: Integration, performance monitoring                │
│ ├─ Weekly check-ins with both pod managers                       │
│ ├─ Address issues, celebrate wins                                │
│ └─ Month 3 review: assess results, adjust as needed              │
│                                                                   │
│ RECOMMENDATION: ✓ PROCEED WITH SPLIT                             │
│                                                                   │
│ Approvals:                                                       │
│ ☑ Regional Director: Michael Chen (November 30, 2025)            │
│ ☐ COO Approval Required                                          │
│ ☐ HR Manager Review (Alex promotion, comp)                       │
│ ☐ Sarah Lee Consultation (critical to get her buy-in)            │
│                                                                   │
│ [Submit for Approval] [Revise Plan] [Cancel]                     │
└──────────────────────────────────────────────────────────────────┘
```

### 6.3 Individual Contributor Reassignment

**Trigger:** Performance issues, workload balancing, career development, or pod restructuring

**Reassignment Types:**

```
1. Performance-Based Reassignment:
   ├─ Underperformer moved to pod with stronger mentorship
   ├─ IC not fitting pod culture → better cultural fit elsewhere
   └─ Skill mismatch → pod aligned with IC's strengths

2. Development-Based Reassignment:
   ├─ High performer moved to challenging pod (stretch assignment)
   ├─ Senior IC to smaller pod for leadership development
   └─ Cross-training assignment (temporary, 3-6 months)

3. Workload Balancing:
   ├─ Overloaded pod → transfer IC to understaffed pod
   ├─ New pod launch → seed with experienced ICs
   └─ Client concentration → redistribute accounts

4. Geographic Reassignment:
   ├─ IC relocates to different city → transfer to local pod
   ├─ Remote IC timezone conflicts → transfer to aligned pod
   └─ Client proximity → transfer to pod closer to client
```

**Reassignment Workflow:**

```
┌──────────────────────────────────────────────────────────────────┐
│ INDIVIDUAL CONTRIBUTOR REASSIGNMENT                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Employee: David Martinez                                         │
│ Current Pod: General IT Recruiting (US-West)                     │
│ Current Manager: Sarah Lee                                       │
│ Tenure: 2.5 years                                                │
│                                                                   │
│ REASSIGNMENT DETAILS:                                            │
│                                                                   │
│ New Pod: [Enterprise SaaS Recruiting (US-West)            ▼]    │
│ New Manager: [Alex Kim                                     ▼]    │
│ Effective Date: [January 15, 2026                       📅]    │
│                                                                   │
│ Reassignment Type:                                               │
│ ● Development (Career Growth)                                    │
│ ○ Performance (Better Fit)                                       │
│ ○ Workload Balancing                                             │
│ ○ Geographic                                                     │
│ ○ Pod Restructuring                                              │
│                                                                   │
│ BUSINESS RATIONALE:                                              │
│                                                                   │
│ David is a high performer with deep SaaS industry knowledge      │
│ (previously worked at Salesforce). His expertise aligns          │
│ perfectly with the new Enterprise SaaS pod focus. This is a      │
│ development opportunity for David and strengthens the new pod    │
│ with experienced talent during launch phase.                     │
│                                                                   │
│ IMPACT ASSESSMENT:                                               │
│                                                                   │
│ David (Employee):                                                │
│ ├─ Career: Positive (specialization, growth opportunity)         │
│ ├─ Compensation: No change (lateral move)                        │
│ ├─ Accounts: Transfer 15 SaaS accounts to new pod, reassign      │
│ │             10 non-SaaS accounts to current pod teammates      │
│ └─ Development: Better alignment with skills and interests       │
│                                                                   │
│ Current Pod (General IT Recruiting):                             │
│ ├─ Loss of high performer (temporary hit to performance)         │
│ ├─ Opportunity: Redistribute accounts, develop junior ICs        │
│ ├─ Mitigation: Backfill role with new hire (in progress)         │
│ └─ Net: Manageable with transition support                       │
│                                                                   │
│ New Pod (Enterprise SaaS):                                       │
│ ├─ Gain: Experienced IC with SaaS expertise                      │
│ ├─ Immediate contribution: 15 SaaS accounts transfer             │
│ ├─ Mentorship: David can help train junior ICs                   │
│ └─ Net: Strongly positive                                        │
│                                                                   │
│ TRANSITION PLAN:                                                 │
│                                                                   │
│ Week 1-2 (Pre-Reassignment):                                     │
│ ├─ Communicate to David (get agreement)                          │
│ ├─ Notify current manager Sarah (manage impact)                  │
│ ├─ Notify new manager Alex (prepare for onboarding)              │
│ └─ Plan account transitions                                      │
│                                                                   │
│ Week 3 (Transition Week):                                        │
│ ├─ Client communication (15 SaaS accounts)                       │
│ ├─ Account handoff (10 non-SaaS accounts)                        │
│ ├─ System updates (CRM ownership, pod assignment)                │
│ └─ Farewell/welcome team meetings                                │
│                                                                   │
│ Week 4+ (Post-Reassignment):                                     │
│ ├─ David onboards to new pod                                     │
│ ├─ 1:1s with new manager Alex (weekly initially)                 │
│ ├─ Monitor performance and satisfaction                          │
│ └─ 30/60/90 day check-ins                                        │
│                                                                   │
│ APPROVALS:                                                       │
│                                                                   │
│ ☑ Current Manager (Sarah Lee): Approved (reluctantly)            │
│ ☑ New Manager (Alex Kim): Approved (enthusiastically)            │
│ ☑ Regional Director (Michael Chen): Approved                     │
│ ☐ Employee Acceptance (David Martinez): Pending conversation     │
│ ☐ HR Review: Pending                                             │
│                                                                   │
│ NOTES:                                                           │
│                                                                   │
│ - David has expressed interest in SaaS specialization             │
│ - This move benefits his career and the business                  │
│ - Sarah understands but will need backfill support                │
│ - Client relationships are strong, low risk of disruption         │
│                                                                   │
│ [Approve & Execute] [Revise Plan] [Cancel] [Schedule Meeting]   │
└──────────────────────────────────────────────────────────────────┘
```

**Communication Script (Regional Director to Employee):**

```
Meeting: David Martinez Reassignment Discussion
Location: Regional Director office (private)
Duration: 30-45 minutes

OPENING:
"David, thanks for meeting with me. I want to talk about an exciting
opportunity that's come up for you."

CONTEXT:
"As you know, we're launching a new Enterprise SaaS Recruiting pod in
February. Given your background at Salesforce and your deep knowledge
of the SaaS market, I think you'd be a perfect fit for this team."

OPPORTUNITY:
"I'd like to offer you the chance to transfer to the new pod and be
one of the founding members. You'd work with Alex Kim, focus exclusively
on SaaS clients (which I know you enjoy), and have the opportunity to
help build something new."

WHAT'S IN IT FOR DAVID:
- Specialization in SaaS (aligns with his interests)
- Founding member of new pod (entrepreneurial experience)
- 15 of his current SaaS accounts would transfer with him
- Same compensation, new growth opportunities
- Potential path to Senior Recruiter or future leadership role

WHAT'S REQUIRED:
- Transfer 10 non-SaaS accounts to teammates
- Start date: January 15 (6 weeks from now)
- Onboarding to new pod and manager

ANSWER QUESTIONS:
- Why me? (SaaS expertise, high performer, culture fit)
- What if I say no? (No pressure, stay in current pod)
- Impact on compensation? (No change)
- What about my current manager Sarah? (She supports this)
- What about my teammates? (They understand, will celebrate you)

CLOSE:
"Take 24-48 hours to think about it. Talk to your spouse, Sarah, or
anyone else. I think this is a great opportunity for you, but I want
you to be excited about it. Let me know by Wednesday?"

[Wait for David's questions and reactions]
```

---

## 7. Exception Flows

### 7.1 Pod Closure

**Trigger:** Strategic exit from market, catastrophic performance, regulatory prohibition

**Rare Scenarios:**
- Market collapse (e.g., entire vertical disappears)
- Regulatory changes prohibit business (e.g., country bans staffing)
- Ethical violations requiring complete shutdown
- Acquisition where pod is redundant

**Closure Workflow:**

```
Pod Closure Plan (8-12 weeks):

Week 1-2: Decision and Planning
├─ Regional Director + COO + CEO decision
├─ Legal review (client contracts, employee agreements)
├─ Financial analysis (costs, liabilities)
├─ Communication strategy
└─ Timeline and milestones

Week 3-4: Internal Communication
├─ Notify Pod Manager and team (private meetings)
├─ Discuss options: transfers, severance, outplacement
├─ HR support for affected employees
└─ Begin internal job posting for transfers

Week 5-6: Client Communication
├─ Personal calls to all clients
├─ Offer transfer to other pods or smooth offboarding
├─ Complete open placements if possible
├─ Issue refunds or credits if contractually required
└─ Maintain reputation and relationships

Week 7-8: Operational Wind-Down
├─ Transfer active placements to other pods
├─ Close recruiting pipelines
├─ Archive candidate data (retention policy)
├─ Cancel vendor contracts
└─ Close accounts and wind down operations

Week 9-12: Final Closure
├─ Employee separations (transfers or terminations)
├─ Final client invoicing and collections
├─ Financial close and P&L finalization
├─ System deactivation and data archival
├─ Post-mortem and lessons learned
└─ Pod officially closed in system
```

### 7.2 Emergency Restructuring

**Trigger:** Sudden Pod Manager departure, major client loss, unexpected crisis

**Immediate Actions (within 24-48 hours):**

```
1. Stabilize Operations
   ├─ Appoint interim Pod Manager (Regional Director or Senior IC)
   ├─ Communicate to team (calm fears, ensure continuity)
   ├─ Contact all clients (reassure, no disruption)
   └─ Review all active placements and jobs

2. Assess Situation
   ├─ Why did this happen? (resignation, termination, crisis)
   ├─ What's at risk? (client relationships, placements, team morale)
   ├─ How long will recovery take? (days, weeks, months)
   └─ What resources are needed? (interim manager, support, budget)

3. Develop Recovery Plan
   ├─ Short-term (0-30 days): Stabilize
   ├─ Medium-term (30-90 days): Rebuild
   ├─ Long-term (90+ days): Optimize
   └─ Metrics to track: revenue, retention, morale

4. Execute and Monitor
   ├─ Daily check-ins with team (first 2 weeks)
   ├─ Weekly performance reviews
   ├─ Client satisfaction surveys
   └─ Adjust plan as needed
```

---

## 8. Postconditions

**After successful pod restructuring:**
- New organizational structure implemented in InTime platform
- All employees informed and assigned to pods
- Client accounts reassigned with clear ownership
- Financial targets updated and tracked
- Communication completed (internal and external)
- Performance monitoring initiated
- Lessons learned documented

---

## 9. Business Rules

### BR-1: Pod Creation Criteria

```
New Pod Creation APPROVED if:
├─ Market opportunity > $5M annual revenue potential (3-year)
├─ Business case shows profitability within 12 months
├─ Leadership identified (hire or promote within 90 days)
├─ Budget approved (setup + Year 1 operating costs)
├─ Strategic alignment with company goals
└─ COO approval obtained

New Pod Creation DENIED if:
├─ Market opportunity < $3M (too small)
├─ Unproven market or business model
├─ No clear leadership candidate
├─ Budget constraints
├─ Conflicts with existing pods
└─ Regulatory or compliance barriers
```

### BR-2: Pod Merger Criteria

```
Pod Merger RECOMMENDED if:
├─ Combined revenue < $5M (below critical mass)
├─ Both pods unprofitable (negative EBITDA)
├─ Significant client or market overlap (>30%)
├─ Leadership vacancy in one or both pods
├─ Geographic or specialization synergy exists
└─ Cost savings > $200K annually

Pod Merger REJECTED if:
├─ Both pods healthy and profitable
├─ No overlap or synergy
├─ Cultural incompatibility
├─ Client disruption risk too high
└─ Employee impact unacceptable (mass exodus risk)
```

### BR-3: Pod Split Criteria

```
Pod Split RECOMMENDED if:
├─ Pod size > 12 ICs (span of control exceeded)
├─ Revenue > $15M (too large for one manager)
├─ Multiple distinct specializations (can be separated)
├─ Wide geographic spread (>3 timezones)
├─ Leadership development opportunity (promote Senior IC)
└─ Growth constrained by current structure

Pod Split REJECTED if:
├─ Pod size < 10 ICs (too small to split)
├─ Revenue < $10M (both pods would be undercritical mass)
├─ No clear split criteria (geography, vertical, etc.)
├─ No leadership candidate for second pod
└─ Recent restructuring (<12 months ago)
```

### BR-4: IC Reassignment Rules

```
IC Reassignment REQUIRES:
├─ Business rationale (performance, development, workload, etc.)
├─ Employee conversation (understand impact, get input)
├─ Current manager approval (or escalation if denied)
├─ New manager acceptance
├─ Account transition plan (minimum 2 weeks)
├─ Regional Director approval
└─ HR review (if involuntary or performance-based)

IC Reassignment PROHIBITED if:
├─ Employee on active performance improvement plan
├─ Recent reassignment (<6 months ago)
├─ Legal or HR investigation ongoing
├─ Client contractual restrictions
└─ Would violate non-compete or employment agreement
```

### BR-5: Restructuring Communication Timeline

```
Internal Communication:
├─ T-14 days: Pod Manager(s) notified, consulted
├─ T-7 days: Affected employees notified (1:1 meetings)
├─ T-3 days: Broader team announcement (all-hands)
├─ T-0 (Effective Date): Restructuring goes live
└─ T+7, T+30, T+90: Check-ins and adjustments

External Communication:
├─ T-7 days: Key client communication (personal calls)
├─ T-3 days: All client email announcement
├─ T-0: Website/marketing updates
└─ T+30: Client satisfaction survey

System Changes:
├─ T-14 days: IT/system changes planned
├─ T-3 days: Testing and validation
├─ T-0: System cutover (pod reassignments, CRM updates)
└─ T+1: Verify all changes successful
```

---

## 10. Screen Specifications

### SCR-RD-007-01: Pod Management Dashboard

**Route:** `/app/admin/pods`
**Access:** Regional Director, COO, HR Manager
**Layout:** List view with pod cards and actions

**Key Features:**
- List of all pods in region
- Pod performance snapshot (revenue, margin, team size)
- Quick actions: Create, Merge, Split, View Details
- Filter by country, pod type, performance status
- Export pod structure to org chart

### SCR-RD-007-02: Pod Restructuring Wizard

**Route:** `/app/admin/pods/restructure`
**Access:** Regional Director, COO
**Layout:** Multi-step wizard for restructuring workflows

**Steps:**
1. Select restructuring type (Create, Merge, Split, IC Reassign)
2. Enter details and rationale
3. Financial projections and business case
4. People impact assessment
5. Communication plan
6. Approval routing
7. Execution timeline

### SCR-RD-007-03: Pod Performance Comparison

**Route:** `/app/analytics/pod-comparison`
**Access:** Regional Director, Pod Managers
**Layout:** Comparative dashboard with charts and tables

**Metrics Compared:**
- Revenue (actual vs. target)
- Gross margin %
- EBITDA
- Placements per IC
- Time-to-fill
- Client satisfaction
- Employee retention
- Growth rate (YoY, QoQ)

---

## 11. Field Specifications

### Pod Structure Fields

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| podName | string | Yes | min:3, max:100, unique | Descriptive name |
| podCode | string | Auto | alphanumeric | System-generated ID |
| podType | enum | Yes | recruiting, bench_sales, ta, hybrid | Primary function |
| region | enum | Yes | americas, emea, apac | Geographic region |
| country | enum | Yes | ISO country code | Primary country |
| launchDate | date | Yes | - | When pod started |
| status | enum | Yes | planning, active, merging, splitting, closed | Lifecycle status |
| podManager | user | Conditional | Required if status=active | Manager assignment |

### Restructuring Fields

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| restructuringType | enum | Yes | create, merge, split, ic_reassign, close | Action type |
| rationale | richtext | Yes | min:100 chars | Business justification |
| effectiveDate | date | Yes | Future date | When change occurs |
| approvals | json | Yes | COO, CFO, HR (depending on type) | Approval tracking |
| peopleImpact | number | Auto-calculated | - | Number of employees affected |
| estimatedCost | currency | Conditional | Required for create, merge, close | One-time costs |

---

## 12. Integration Points

### INT-007-01: HRIS Integration

**Integration:** Sync pod assignments to payroll/HRIS
- Employee transfers update HRIS org structure
- Manager changes reflected in HRIS
- Reporting structure automatically updated

### INT-007-02: Financial System Integration

**Integration:** Pod P&L tracking
- Each pod is a cost center in financial system
- Revenue and expenses tracked by pod
- Budget allocations by pod
- Real-time financial performance

---

## 13. RACI Assignments

| Activity | R | A | C | I |
|----------|---|---|---|---|
| Pod creation business case | Regional Director | COO | CFO, HR | CEO |
| Pod creation approval | COO | CEO | CFO | Board (if material) |
| Pod merger decision | Regional Director | COO | Pod Managers, HR | Affected employees |
| Pod split decision | Regional Director | COO | Pod Manager | Affected employees |
| IC reassignment | Regional Director | Pod Managers | HR (if performance) | Employee |
| Pod closure | Regional Director | COO, CEO | Legal, CFO | Board, employees |
| Communication execution | Regional Director | Pod Managers | HR, Marketing | All employees |

---

## 14. Metrics & Analytics

### Restructuring Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to execute restructuring | < 90 days | From approval to completion |
| Employee retention during restructuring | > 85% | 90 days post-restructuring |
| Client satisfaction post-restructuring | > 8.0/10 | Survey 30 days after |
| Financial performance vs. plan | ±10% | Revenue, margin, EBITDA |
| New pod time to breakeven | < 12 months | From launch date |
| Merged pod cost savings | > 80% of projected | Annual run rate |
| Split pod performance | Both profitable within 6 months | EBITDA > 0 |

---

## 15. Test Cases

### TC-RD-007-001: Create New Pod

**Priority:** High
**Type:** E2E

**Steps:**
1. Regional Director initiates pod creation wizard
2. Complete business case (all required fields)
3. Submit for COO approval
4. COO approves
5. Create pod in system (effective date future)
6. Hire Pod Manager
7. On effective date, pod goes live
8. Verify pod appears in dashboards, reports

**Expected Result:** Pod created successfully, all data accurate, reporting correct

### TC-RD-007-002: Merge Two Pods

**Priority:** High
**Type:** E2E

**Steps:**
1. Regional Director selects two pods to merge
2. Complete merger analysis and business case
3. Obtain approvals (COO, HR)
4. Communicate to affected employees (document)
5. Reassign ICs to merged pod
6. Transfer accounts and data
7. Archive closed pod (retain historical data)
8. Verify merged pod performance tracking

**Expected Result:** Pods merged cleanly, no data loss, employees and clients informed

### TC-RD-007-003: IC Reassignment

**Priority:** Medium
**Type:** Functional

**Steps:**
1. Regional Director initiates IC reassignment
2. Enter rationale and impact assessment
3. Meet with employee (document conversation)
4. Obtain current and new manager approval
5. Create transition plan (account handoff)
6. Execute reassignment on effective date
7. Monitor 30/60/90 day performance
8. Verify system updates (pod, manager, accounts)

**Expected Result:** IC successfully transferred, accounts transitioned, no client disruption

---

## 16. Accessibility

- All pod management screens WCAG 2.1 AA compliant
- Org chart visualization supports screen readers (text alternative)
- Keyboard navigation for all restructuring workflows
- Color-coding supplemented with icons and labels

---

## 17. Mobile Considerations

**Limited mobile functionality:**
- View pod structure (read-only)
- Pod performance dashboards (summary view)
- Approve/reject restructuring requests
- Not supported on mobile: Creating pods, detailed planning

---

## 18. Security

### Data Access

**Pod Structure Data:**
- Regional Director: Full access to all pods in region
- COO: Full access to all pods globally
- Pod Managers: View own pod only
- ICs: View own pod basic info only

**Restructuring Plans:**
- Confidential until approved and communicated
- Access limited to: Regional Director, COO, HR Manager
- Audit log of all access and changes

---

## 19. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-30 | COO | Initial document - comprehensive pod restructuring workflows |

---

**Document Owner:** Chief Operating Officer
**Review Cycle:** Annual or upon major organizational changes
**Next Review:** 2026-11-30
