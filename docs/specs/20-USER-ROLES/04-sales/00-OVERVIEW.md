# Sales / Business Development Role - Complete Specification

## Role Overview

The **Sales Representative** (Business Development) is the primary revenue-generating individual contributor (IC) role in InTime OS. Sales Reps are responsible for the full sales lifecycle: prospecting new clients, qualifying leads, managing sales pipeline, negotiating contracts, closing deals, and handing off to account management for ongoing service delivery.

---

## Role Summary

| Property | Value |
|----------|-------|
| Role ID | `sales_rep` |
| Role Type | Individual Contributor (IC) |
| Reports To | Sales Director / VP of Sales |
| Primary Entities | Leads, Deals, Accounts, Contacts, MSAs, Contracts |
| RCAI Default | Responsible (R) on their assigned leads and deals |
| Sprint Target | 2 new clients per quarter (varies by market segment) |

---

## Role Definition

A Sales Representative (Business Development Rep) focuses on new business acquisition. Unlike Account Managers who maintain existing client relationships, Sales Reps:

1. **Prospect and qualify leads** - Identify potential clients through outbound, referrals, and inbound channels
2. **Conduct discovery** - Understand client needs, pain points, and budget through consultative selling
3. **Present solutions** - Demonstrate InTime's value proposition tailored to client requirements
4. **Negotiate contracts** - Work with legal and finance to structure MSAs, rate cards, and SOWs
5. **Close deals** - Secure signed agreements and transition to account management
6. **Manage territory** - Own a geographic or vertical market segment
7. **Build pipeline** - Maintain 3-6 month forward pipeline of qualified opportunities

**Key Difference from Account Manager:** Sales Reps focus on **new logo acquisition**, while Account Managers focus on **retention, upsells, and expansion** of existing accounts.

---

## Key Responsibilities

1. **Lead Generation** - Proactive outbound prospecting, networking, referral generation
2. **Lead Qualification** - BANT qualification (Budget, Authority, Need, Timeline)
3. **Discovery Calls** - Consultative needs analysis, pain point identification
4. **Solution Presentation** - Tailored demos, case studies, ROI analysis
5. **Proposal Development** - Create custom proposals, rate cards, service packages
6. **Contract Negotiation** - Work with legal on MSA/SOW terms, pricing, payment terms
7. **Deal Closing** - Secure signatures, process paperwork, coordinate onboarding
8. **Territory Management** - Plan account strategy, competitive intelligence, market analysis
9. **Pipeline Management** - Maintain accurate forecasts, stage progression, deal hygiene
10. **Cross-Pollination** - Identify upsell/cross-sell opportunities for other pillars

---

## Primary Metrics (KPIs)

| Metric | Target | Measurement Period |
|--------|--------|-------------------|
| New Logos (Clients) | 2-3 | Per quarter |
| Pipeline Value | $500K - $1M | Ongoing (3-month forward) |
| Win Rate | 25-30% | Per quarter |
| Average Deal Size | $50K - $150K | Per deal (annual value) |
| Sales Cycle | 45-90 days | Per deal |
| Qualified Leads | 10-15 | Per month |
| Discovery Calls | 15-20 | Per month |
| Proposals Sent | 5-8 | Per month |
| Client Meetings | 20-25 | Per month |
| Response Time | <4 hours | For inbound leads |

---

## Daily Workflow Summary

### Morning (8:00 AM - 10:00 AM)
1. Review **Sales Dashboard** - Pipeline health, deals closing this week, overdue tasks
2. Check overnight inbound leads
3. Review emails and voicemails
4. Update deal stages from yesterday's activities
5. Prioritize top 3 deals for the day

### Mid-Morning (10:00 AM - 12:00 PM)
1. Prospecting calls (cold/warm outreach)
2. Discovery calls with qualified leads
3. Follow-up calls on proposals sent
4. Competitive research

### Afternoon (12:00 PM - 3:00 PM)
1. Client presentations/demos
2. Proposal writing
3. Contract negotiation calls
4. Internal stakeholder coordination (legal, finance, delivery)

### Late Afternoon (3:00 PM - 5:00 PM)
1. Pipeline review and forecast update
2. CRM hygiene (update notes, stages, next steps)
3. Follow-up emails
4. Plan next day priorities
5. Manager sync (if weekly 1-on-1)

---

## Permissions Matrix

### Entity Permissions

| Entity | Create | Read | Update | Delete | Notes |
|--------|--------|------|--------|--------|-------|
| Leads | ✅ | ✅ Own + Territory | ✅ Own | ❌ | Can manage leads in assigned territory |
| Deals | ✅ | ✅ Own + Consulted | ✅ Own | ❌ | Primary sales entity |
| Accounts | ✅ | ✅ All | ✅ Own | ❌ | Create new accounts, edit assigned |
| Contacts | ✅ | ✅ All | ✅ Own | ❌ | Create and manage contacts |
| Activities | ✅ | ✅ Own | ✅ Own | ✅ Own | Full control of own activities |
| Proposals | ✅ | ✅ Own | ✅ Own | ❌ | Create and manage proposals |
| Contracts/MSAs | ✅ | ✅ Own Deals | ✅ Limited | ❌ | Create, limited edits |
| Invoices | ❌ | ✅ Own Accounts | ❌ | ❌ | Read-only for context |
| Jobs | ❌ | ✅ Own Accounts | ❌ | ❌ | Read-only after handoff |
| Candidates | ❌ | ✅ Limited | ❌ | ❌ | Limited visibility for demos |

### Feature Permissions

| Feature | Access |
|---------|--------|
| Sales Dashboard | ✅ Full |
| Lead Management | ✅ Full |
| Deal Pipeline | ✅ Full |
| Account Creation | ✅ Full |
| Contact Management | ✅ Full |
| Activity Logging | ✅ Full |
| Proposal Generator | ✅ Full |
| Contract Builder | ✅ Full |
| Rate Card Editor | ✅ Limited (templates only) |
| Reports (Own Data) | ✅ Full |
| Reports (Team Data) | ❌ No |
| Email Marketing | ✅ Full |
| Territory Management | ✅ Own Territory |
| Forecasting | ✅ Own Pipeline |
| Commission Reports | ✅ Own Only |
| System Settings | ❌ No |
| User Management | ❌ No |

---

## RCAI Assignments (Typical)

| Scenario | Responsible | Accountable | Consulted | Informed |
|----------|-------------|-------------|-----------|----------|
| New Lead Created (Inbound) | Sales Rep | Sales Rep | - | Manager |
| Lead Qualified | Sales Rep | Sales Rep | - | Manager |
| Deal Created | Sales Rep | Sales Rep | - | Manager, Finance |
| Discovery Call Completed | Sales Rep | Sales Rep | Delivery Lead | - |
| Proposal Sent | Sales Rep | Sales Rep | Delivery Lead | Manager |
| Contract Negotiation | Sales Rep | Manager | Legal, Finance | CEO |
| Deal Closed/Won | Sales Rep | Sales Rep | Account Manager | CEO, Manager |
| Account Handoff | Account Manager | Sales Rep | Delivery Lead | - |

---

## Navigation Quick Reference

### Sidebar Access
- ✅ Dashboard / Today View
- ✅ Tasks
- ✅ Leads
- ✅ Deals (Pipeline)
- ✅ Accounts
- ✅ Contacts
- ✅ Proposals
- ✅ Contracts
- ✅ Activities
- ❌ Jobs (limited visibility)
- ❌ Candidates (limited visibility)
- ❌ Placements (no access)
- ❌ Finance (read-only for invoices)
- ❌ Analytics (own metrics only)

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+K` | Open Command Bar |
| `g l` | Go to Leads |
| `g d` | Go to Deals |
| `g a` | Go to Accounts |
| `g c` | Go to Contacts |
| `n` | New entity (context-aware) |
| `e` | Edit current entity |
| `l` | Log activity |
| `p` | Create proposal |

---

## Use Cases (Summary)

The following use cases are documented in detail in separate files:

| Use Case | File | Priority |
|----------|------|----------|
| Daily Workflow | [01-daily-workflow.md](./01-daily-workflow.md) | High |
| Qualify Lead (BANT) | [02-prospect-qualification.md](./02-prospect-qualification.md) | High |
| Close Deal | [03-close-deal.md](./03-close-deal.md) | High |
| Manage Territory | [04-manage-territory.md](./04-manage-territory.md) | Medium |

---

## Screen Access Map

| Screen | Route | Access Level |
|--------|-------|--------------|
| Sales Dashboard | `/employee/workspace/sales` | Full |
| Leads List | `/employee/workspace/sales/leads` | Own + Territory |
| Lead Detail | `/employee/workspace/sales/leads/[id]` | Own + Territory |
| Deals Pipeline | `/employee/workspace/sales/deals` | Own + Consulted |
| Deal Detail | `/employee/workspace/sales/deals/[id]` | Own + Consulted |
| Accounts List | `/employee/workspace/sales/accounts` | All (org) |
| Account Detail | `/employee/workspace/sales/accounts/[id]` | All (org) |
| Contacts List | `/employee/workspace/sales/contacts` | All (org) |
| Proposals List | `/employee/workspace/sales/proposals` | Own |
| Proposal Builder | `/employee/workspace/sales/proposals/new` | Full |

---

## Training Requirements

Before using the system, a new Sales Rep should complete:

1. **System Orientation** (1 hour)
   - Navigation and UI overview
   - Keyboard shortcuts
   - Command bar usage
   - Sales dashboard walkthrough

2. **Sales Process Training** (3 hours)
   - InTime sales methodology
   - BANT qualification framework
   - Deal stages and progression
   - RCAI ownership model
   - Handoff to account management

3. **Product Knowledge Training** (4 hours)
   - InTime service offerings (Recruiting, Bench Sales, TA, Academy)
   - Value propositions by vertical
   - Competitive differentiation
   - Pricing and rate card structure
   - Case studies and success stories

4. **CRM & Tools Training** (2 hours)
   - Lead management workflow
   - Deal pipeline management
   - Activity logging
   - Proposal builder
   - Contract generation

5. **Legal & Compliance Training** (1 hour)
   - MSA structure and key terms
   - SOW requirements
   - Pricing approval thresholds
   - Contract review process
   - Compliance requirements (multi-country)

6. **Territory Management Training** (1 hour)
   - Territory assignment and planning
   - Competitive analysis
   - Account planning
   - Market research tools

---

## Sales Process Stages

### Lead Lifecycle

| Stage | Definition | Sales Rep Actions |
|-------|------------|-------------------|
| **New** | Raw lead, not yet contacted | Initial research, first contact |
| **Contacted** | Initial outreach made | Follow-up, schedule discovery |
| **Qualified (MQL)** | Marketing Qualified Lead | BANT qualification |
| **Qualified (SQL)** | Sales Qualified Lead | Create deal, schedule demo |
| **Disqualified** | Not a fit | Document reason, archive |
| **Nurture** | Good fit, bad timing | Add to drip campaign |

### Deal Lifecycle

| Stage | Definition | Avg. Time in Stage | Exit Criteria |
|-------|------------|-------------------|---------------|
| **Discovery** | Initial needs assessment | 7-14 days | Discovery call completed, needs documented |
| **Qualification** | BANT validation | 3-7 days | Budget confirmed, decision-maker identified |
| **Proposal** | Solution presentation | 7-14 days | Proposal sent, meeting scheduled |
| **Negotiation** | Contract terms discussion | 14-30 days | Agreement on rates, terms, MSA draft |
| **Legal Review** | Contract finalization | 7-14 days | Legal approval, final edits |
| **Closed-Won** | Signed contract | - | MSA signed, SOW signed, payment terms set |
| **Closed-Lost** | Deal did not close | - | Reason documented, post-mortem completed |

---

## Sales Methodology

InTime uses **Consultative Selling** combined with **Solution Selling**:

### Key Principles
1. **Listen First** - Understand before presenting
2. **Ask, Don't Tell** - Discovery through questions
3. **Value-Based Selling** - ROI focus, not features
4. **Challenger Approach** - Teach, Tailor, Take Control
5. **Solution Fit** - Only sell what we can deliver excellently

### Discovery Framework (SPIN)

- **Situation Questions** - Current state, existing vendors, team structure
- **Problem Questions** - Pain points, challenges, inefficiencies
- **Implication Questions** - Cost of inaction, business impact
- **Need-Payoff Questions** - Value of solving, ROI expectations

### Objection Handling

| Common Objection | Response Strategy |
|------------------|-------------------|
| "Too expensive" | Reframe to ROI, compare cost of vacancy vs. placement fee |
| "Happy with current vendor" | Identify gaps, offer pilot program, build relationship |
| "No budget" | Explore payment terms, next fiscal year planning |
| "Need to think about it" | Uncover real objection, create urgency, offer trial |
| "Can you do it for less?" | Bundle services, volume discounts, payment plans |

---

## Territory Structure

### Geographic Territories (USA)
- **Northeast** - NY, NJ, PA, CT, MA, NH, VT, ME, RI
- **Southeast** - FL, GA, NC, SC, VA, TN, AL, MS, LA
- **Midwest** - IL, OH, MI, IN, WI, MN, IA, MO
- **Southwest** - TX, AZ, NM, OK, AR
- **West** - CA, WA, OR, NV, CO, UT

### Vertical Markets (Industry-Based)
- **Financial Services** - Banks, insurance, fintech
- **Technology** - SaaS, software, hardware, consulting
- **Healthcare** - Hospitals, pharma, biotech, health tech
- **Government/Federal** - Federal agencies, state/local, contractors
- **Manufacturing** - Industrial, automotive, aerospace
- **Retail/E-commerce** - Retail chains, e-commerce, CPG

### Account Segmentation
- **Enterprise** - 1,000+ employees, $100K+ annual spend potential
- **Mid-Market** - 100-999 employees, $50K-$100K annual spend
- **SMB** - <100 employees, <$50K annual spend (often referred to partnerships)

---

## Commission Structure

Sales Reps are compensated with base salary + commission:

### Base Salary
- Typical range: $60K - $80K base (varies by market, experience)

### Commission Tiers

| Tier | Achievement | Commission Rate | Example (on $100K deal) |
|------|-------------|-----------------|-------------------------|
| Tier 1 | 0-79% of quota | 8% of revenue | $8,000 |
| Tier 2 | 80-99% of quota | 10% of revenue | $10,000 |
| Tier 3 | 100-124% of quota | 12% of revenue | $12,000 |
| Tier 4 | 125%+ of quota (Overachievement) | 15% of revenue | $15,000 |

### Quota Structure
- **Annual Quota** - $600K - $1M in new revenue (varies by segment)
- **Quarterly Quota** - $150K - $250K per quarter
- **New Logo Bonus** - Additional $1K-$2K per new client (beyond quota)

### Commission Calculation

**Example Deal:**
```
Client: Acme Corp
MSA Value: $200K annual (10 placements @ avg $20K each)
Sales Rep Quota Attainment: 105% (Q2)
Commission Rate: 12% (Tier 3)

Commission: $200K × 12% = $24,000
New Logo Bonus: $1,500
Total Commission: $25,500
```

### Payment Schedule
- Commission paid monthly based on **invoiced** revenue
- New Logo Bonus paid after first invoice payment received
- Clawback policy: 6 months (if client churns early, commission prorated)

---

## International Considerations

### Multi-Country Sales

When selling to clients in multiple countries, Sales Reps must:

1. **Currency Management**
   - Quote in local currency (USD, EUR, GBP, INR, AUD)
   - Use corporate exchange rates (updated weekly)
   - Lock rates at contract signing

2. **Legal Requirements**
   - Different MSA templates by country (USA, UK, India, Australia)
   - Compliance with local labor laws
   - Tax implications (VAT, GST, etc.)
   - Data privacy (GDPR, CCPA, etc.)

3. **Pricing Strategy by Region**

| Region | Pricing Model | Typical Markup | Payment Terms |
|--------|---------------|----------------|---------------|
| USA | Hourly/Contract | 35-50% | Net 30 |
| UK | Daily/Contract | 30-40% | Net 30 |
| Europe (EU) | Daily/Contract | 30-40% | Net 30 |
| India | Monthly/Hourly | 40-60% | Net 15 |
| Australia | Hourly/Daily | 35-45% | Net 30 |

4. **Regional Differences in Sales Approach**
   - **USA** - Fast-paced, ROI-driven, challenger approach
   - **UK** - Relationship-focused, longer sales cycles, consultative
   - **India** - Price-sensitive, volume-based, relationship-driven
   - **Australia** - Direct, value-focused, compliance-heavy

### International Contract Considerations

**UK Example:**
```
MSA: UK-specific template (Ltd company structure)
Rate Card: £450-£750/day (GBP)
Payment Terms: Net 30, BACS transfer
VAT: 20% added if applicable
IR35: Compliance required for contractors
Data Privacy: GDPR compliant
```

**India Example:**
```
MSA: India-specific template (Pvt Ltd structure)
Rate Card: ₹50,000-₹150,000/month (INR)
Payment Terms: Net 15, NEFT/RTGS
GST: 18% added
Work Authorization: No restrictions for Indian nationals
Data Privacy: DPDP Act compliant
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Lead not responding | Try multiple channels (phone, email, LinkedIn). Attempt 5-7 touches before disqualifying. |
| Deal stuck in negotiation | Identify blocker. Escalate to manager if pricing issue. Involve legal for contract concerns. |
| Client wants lower pricing | Present ROI analysis. Offer volume discounts or payment plans. Stand firm on value. |
| Competitor undercut pricing | Differentiate on quality, service, and outcomes. Provide case studies and testimonials. |
| Legal review taking too long | Escalate internally. Offer to schedule call between legal teams. |
| Client asking for services we don't offer | Document feature request. Offer partnership or refer to partner. Don't over-promise. |
| Lost deal to competitor | Conduct post-mortem. Document reason. Add to nurture campaign for future. |

---

## Escalation Path

| Situation | Escalate To | Timeline |
|-----------|-------------|----------|
| Pricing approval needed (>20% discount) | Sales Director | Before proposal sent |
| Contract terms outside standard MSA | Legal Team | Immediately |
| Deal >$200K annual value | VP of Sales | At proposal stage |
| Client threatens to walk | Sales Director | Immediately |
| Competitor pricing significantly lower | Sales Director | Before negotiation |
| Payment terms >Net 45 | Finance | Before contract sent |
| International deal (new country) | Legal + Finance | At discovery stage |

---

## Success Metrics

### Individual Performance (Quarterly)
- Revenue closed: Target $150K-$250K
- New logos: Target 2-3 clients
- Win rate: Target 25-30%
- Pipeline value: Maintain 3x quarterly quota
- Average deal size: Target $50K-$150K
- Sales cycle: Target 45-90 days

### Activity Metrics (Weekly)
- Prospecting calls: 30-50 per week
- Discovery calls: 3-5 per week
- Proposals sent: 1-2 per week
- Client meetings: 5-7 per week
- Follow-ups: 20-30 per week

---

## Tools & Integrations

### Sales Tools
- **InTime CRM** - Lead and deal management
- **Email Tracking** - HubSpot/Outreach integration
- **Calendar** - Google Calendar/Outlook integration
- **Proposal Builder** - Integrated in InTime
- **Contract Management** - DocuSign integration
- **LinkedIn Sales Navigator** - Prospecting and research

### Data Sources
- **ZoomInfo** - Contact data and company intelligence
- **Clearbit** - Enrichment and firmographics
- **LinkedIn** - Professional networking and research
- **G2/Capterra** - Competitive intelligence
- **Builtwith** - Technology stack analysis

### Reporting Tools
- **Sales Dashboard** - Real-time pipeline view
- **Forecasting** - Weighted pipeline forecast
- **Activity Reports** - Calls, meetings, emails
- **Commission Tracker** - Earnings visibility

---

*Last Updated: 2024-11-30*
