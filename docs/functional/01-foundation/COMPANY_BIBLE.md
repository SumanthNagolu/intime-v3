# InTime Company Bible

*The definitive guide to who we are, what we believe, and how we operate.*

---

## Part I: Our Purpose

### Mission Statement

**To eliminate chaos in staffing operations, empowering every recruiter, account manager, and operations professional to do their best work.**

We replace fragmented tools and manual processes with one unified platform that connects talent, clients, and operations—so people can focus on relationships, not spreadsheets.

### Vision

**Become the industry standard for modern staffing operations—the platform where the best agencies run their business.**

Within 3 years:
- Replace legacy systems (Bullhorn/Ceipal) for 500+ agencies
- Process $1B+ in placements through our platform
- Achieve 95%+ client retention through proactive tooling
- Enable 40% productivity gains for every user role

### The Problem We Solve

Staffing agencies run on chaos:
- **12+ disconnected tools** (ATS, CRM, spreadsheets, email, timesheets, payroll)
- **40% of recruiter time** wasted on admin instead of recruiting
- **No visibility** into what's happening across the business
- **Reactive firefighting** instead of proactive management
- **Data silos** that prevent intelligent decision-making

**We eliminate this chaos.** One platform. Seven connected workflows. Zero excuses.

---

## Part II: Our Values

### 1. Relentless Focus on User Outcomes

**We exist to make our users successful, not to ship features.**

- Every feature must answer: "How does this help a recruiter make more placements?"
- We measure success by user outcomes (time saved, placements made), not feature adoption
- We talk to users weekly, watch them work, and feel their pain
- We'd rather do one thing excellently than three things adequately

**In practice:**
- Ship small, validate fast, iterate based on feedback
- Kill features that don't move metrics, no matter how much work went in
- Celebrate when users hit goals, not when we ship code

### 2. Complexity is the Enemy

**The best solution is the simplest one that works.**

- Every line of code is a liability, not an asset
- Every config option is cognitive load for the user
- Smart defaults beat extensive customization
- "Can we remove this?" is as valuable as "Can we add this?"

**In practice:**
- New features require justification; removals do not
- We prefer convention over configuration
- If it needs a manual, it's not designed well enough
- We say "no" to 90% of feature requests—the right 10% matters

### 3. Speed is a Feature

**Fast software respects the user's time.**

- Every 100ms of latency erodes trust
- Instant feedback feels magical; waiting feels broken
- We optimize for the 80% use case, not the edge cases
- "Good enough today" often beats "perfect next quarter"

**In practice:**
- Performance budgets are sacred (< 200ms for interactions)
- Shipping a working MVP is better than planning a perfect V2
- We make reversible decisions quickly, irreversible ones carefully
- Bias toward action over analysis paralysis

### 4. Trust Through Transparency

**We earn trust by being radically honest.**

- No surprises—bad news travels fast, good news can wait
- We show our work: reasoning, tradeoffs, uncertainties
- We admit mistakes quickly and fix them faster
- We share context generously so everyone can make good decisions

**In practice:**
- Public roadmaps, public incident postmortems
- Weekly updates to all stakeholders (good and bad)
- Open access to metrics and dashboards
- Disagree openly, commit fully, follow through completely

### 5. Own It End-to-End

**Everyone is accountable for the full outcome, not just their piece.**

- A recruiter's UX problem is an engineer's problem too
- A bug in production is everyone's fire to fight
- Customer success is not a department—it's a mindset
- "Not my job" is never acceptable

**In practice:**
- Engineers talk to users; sales learns the product deeply
- On-call rotation includes product and engineering leads
- Cross-functional teams own outcomes, not functional silos
- Celebrate team wins, debug failures together

### 6. Build for the Long Term

**We make decisions that compound over years, not quarters.**

- Technical debt is real debt—pay it down systematically
- Shortcuts now become crises later
- Sustainable pace beats burnout sprints
- Reputation takes years to build, moments to destroy

**In practice:**
- Invest 20% of engineering time in technical health
- No "temporary hacks" that become permanent fixtures
- Document decisions for future team members
- Choose boring technology for critical systems

---

## Part III: Our Culture

### How We Work

#### Async-First, Meet When Necessary

- **Default to async**: Write it down, share broadly, let people engage on their schedule
- **Meet intentionally**: Meetings have agendas, decisions, and owners
- **Protect focus time**: 4-hour blocks for deep work are non-negotiable
- **Document everything**: If it wasn't written down, it didn't happen

#### Radical Ownership

- **You own the problem, not just your task**: See it through to completion
- **Escalate early, never late**: Flag blockers before they become crises
- **No victims, only owners**: If something's broken, fix it or find someone who can
- **Credit the team, own the mistakes**: Success is shared; failures have names

#### Respectful Directness

- **Say what you mean**: Clarity beats diplomacy
- **Assume positive intent**: Disagreement is professional, not personal
- **Debate ideas, not people**: Attack the argument, not the person
- **Disagree and commit**: Once decided, execute wholeheartedly

#### Continuous Improvement

- **Retrospect regularly**: What worked, what didn't, what's next
- **Learn from failures**: Every incident is a learning opportunity
- **Share knowledge**: Teaching others multiplies your impact
- **Stay curious**: Best practices evolve; so should we

### How We Communicate

| Channel | Use For | Response Time |
|---------|---------|---------------|
| **Slack** | Quick questions, coordination | Same day |
| **Linear** | Tickets, specs, formal work | Per process |
| **Docs** | Long-form thinking, decisions | Async |
| **Meetings** | Complex discussions, alignment | Real-time |
| **Email** | External communication | 24 hours |

**Communication Principles:**
- **Over-communicate context**: Assume others don't have your knowledge
- **Write for strangers**: Future you won't remember; document accordingly
- **Be explicit about urgency**: "FYI" vs "Need by EOD" vs "Blocking"
- **Close the loop**: Acknowledge, respond, resolve—don't leave threads hanging

### What We Celebrate

- **Impact delivered**: Users succeeding because of our work
- **Hard problems solved**: Elegant solutions to complex challenges
- **Teamwork**: Helping colleagues succeed at personal cost
- **Learning from failure**: Honest postmortems that prevent future issues
- **Going above and beyond**: Doing what's right, not just what's required

### What We Don't Tolerate

- **Blame culture**: Finding fault instead of fixing problems
- **Information hoarding**: Keeping context to yourself
- **Heroics over process**: Unsustainable individual efforts
- **Politics**: Prioritizing personal advancement over team success
- **Mediocrity**: Settling for "good enough" when excellent is achievable

---

## Part IV: Our Principles for Building Product

### 1. User-Centered Design

**Start with the user problem, not the solution.**

- Who has the problem?
- What are they trying to accomplish?
- How do they do it today?
- What's painful about the current approach?
- How will we know we solved it?

### 2. Progressive Disclosure

**Show complexity only when needed.**

- Default views are simple; advanced options are discoverable
- 80% of users should never see 80% of the settings
- Workflows guide users to success; features wait for experts
- Empty states teach; cluttered screens overwhelm

### 3. Automation with Judgment

**Automate the obvious; preserve human judgment for the important.**

| Category | System Does | Human Does |
|----------|-------------|------------|
| **Full Auto** | Log email, schedule reminders | Nothing |
| **Confirm** | Prepare submission, suggest matches | Click approve |
| **Human Required** | Present options | Make decision |
| **Gatekeeping** | Flag for review | Approve/reject |

### 4. Data Integrity is Sacred

**The system is only as trustworthy as its data.**

- Automatic capture beats manual entry
- Validate at boundaries; trust internally
- Audit trails for everything
- Never silently fail; always surface errors

### 5. Performance is UX

**Speed is not a technical concern—it's a user experience mandate.**

- First paint under 500ms
- Interactions respond in under 100ms
- Lists paginate; searches are instant
- Background tasks never block the user

---

## Part V: Roles & Responsibilities

> **Note:** This section describes the Phase 1 staffing operations team. As InTime grows
> into a SaaS platform company, additional roles (Engineering, Product, Design) will be
> added. See [Team Structure](../03-hiring/TEAM_STRUCTURE.md) for the full multi-phase
> org chart.

### Supply Side

#### Training Lead (Senior)

**Mission:** Run the training academy, ensure batch fill rates, and deliver placement-ready graduates.

**Responsibilities:**
- Manage training operations end-to-end (curriculum, scheduling, quality)
- Hire, train, and develop training team interns
- Coordinate with Screening Lead on enrollment pipeline
- Track student progress and intervention when needed
- Ensure 90%+ training completion rate

**Success Metrics:**
- Batch fill rate (target: 100% — 9 students always enrolled)
- Student retention (90%+ complete training)
- Top performer rate (20%+ score 90%+)
- Time to first interview (within 1 week of graduation)

#### Trainer (Guidewire)

**Mission:** Deliver high-quality technical training that produces interview-ready professionals.

**Responsibilities:**
- Conduct 3 daily training sessions (9 students total)
- Create and maintain training curriculum and materials
- Conduct mock interviews for graduating students
- Administer weekly assessments and track progress

**Success Metrics:**
- 100% session delivery rate
- Student satisfaction 4.5+/5
- Assessment pass rate 80%+
- 90%+ of graduates interview-ready

#### Screening Lead (Senior)

**Mission:** Build and maintain a qualified candidate pipeline for training enrollment and direct placement.

**Responsibilities:**
- Manage 3 screening interns (OPT Recruiter + 2 General Recruiters)
- Quality control on candidate submissions
- Maintain two pipelines: training candidates and experienced professionals
- Cross-coordinate with Training Lead on enrollment targets

**Success Metrics:**
- 15+ qualified leads to training per month
- 10+ experienced candidates to pool per month
- 80%+ pipeline accuracy (qualified candidates actually convert)
- 50 candidates screened per recruiter per week

### Demand Side

#### Business Development Manager (Senior)

**Mission:** Acquire new clients, build vendor partnerships, and open revenue channels.

**Responsibilities:**
- 10+ daily outbound prospecting calls/emails
- Build and maintain vendor/prime partnerships (TEKsystems, Insight Global, etc.)
- MSA and contract negotiations
- Market intelligence and strategy alignment with Founder

**Success Metrics:**
- 3-5 discovery calls per week
- 2-3 new vendors onboarded per month
- 1-2 direct clients acquired per quarter
- Pipeline value at 3x monthly target

#### Bench Lead (Senior)

**Mission:** Maximize bench utilization by placing W2 consultants on client projects quickly.

**Responsibilities:**
- Manage 2 bench sales interns
- Oversee daily submissions, interviews, and placements
- Client relationship development for bench placements
- Rate negotiation and margin management

**Success Metrics:**
- 80%+ bench utilization within 30 days
- Placement velocity under 3 weeks
- Target bill rate maintained
- Zero early terminations from quality issues

#### Recruiting Lead (Senior)

**Mission:** Fill client job orders and build direct client relationships for recurring business.

**Responsibilities:**
- Manage 2 account manager/recruiter interns
- Client relationship management and job intake
- Cross-coordinate with Bench Lead on shared opportunities
- New client outreach and acquisition

**Success Metrics:**
- 50%+ job fill rate
- Time to fill under 3 weeks
- 90%+ client retention (clients return with more jobs)
- 2-3 new clients per quarter

#### Delivery Manager (Senior)

**Mission:** Ensure consultant success, client satisfaction, and placement renewals.

**Responsibilities:**
- Onboarding support for newly placed consultants
- Regular check-ins with active consultants and clients
- Issue resolution and escalation management
- Renewal and extension pipeline management

**Success Metrics:**
- 95%+ 30-day retention
- 80%+ renewal rate
- Client satisfaction 4.5+/5
- Issue resolution within 48 hours

### Intern Roles (9 total)

#### Training Sales Intern

**Mission:** Fill training batches through inbound/outbound enrollment efforts.

**Key Activities:** Respond to inquiries within 2 hours, 20+ daily outreach calls, 3-5 enrollment closes per week.

#### Training Coordinator Intern

**Mission:** Ensure seamless student experience and session logistics.

**Key Activities:** Confirm attendance, prepare materials, track progress, onboard new students.

#### OPT Recruiter Intern

**Mission:** Build the US/Canada international student candidate pipeline.

**Key Activities:** Source from OPT boards and university groups, 30+ daily outreach messages, 5+ screening calls.

#### Recruiter Interns (x2)

**Mission:** Build the general candidate pipeline through high-volume sourcing.

**Key Activities:** 40+ daily outreach messages each, 8+ screening calls, categorize training vs experienced candidates.

#### Bench Sales Interns (x2)

**Mission:** Submit bench consultants to open requirements and drive placements.

**Key Activities:** Monitor job boards, 15+ submissions per day each, follow up on pending submissions, coordinate interviews.

#### Account Manager/Recruiter Interns (x2)

**Mission:** Source candidates for active jobs and support client relationships.

**Key Activities:** 20+ daily candidate outreach, 5+ screening calls, submit to clients, client check-in support.

### Founder / CEO

**Mission:** Set strategic direction, own key client relationships, and build the InTime platform.

**Responsibilities:**
- Business strategy and vision
- Key account relationships and enterprise sales
- Platform development oversight
- Hiring decisions and culture setting
- Financial management and investor relations

### Future Roles (Post Phase 1)

As InTime scales beyond Phase 1, the following roles will be added:

| Phase | New Roles | Trigger |
|-------|-----------|---------|
| **Phase 2** (10-25 placements) | Senior Recruiter, Ops Coordinator | Interns converted, volume increasing |
| **Phase 3** (25-50 placements) | Supply Manager, Demand Manager, Ops Manager | Need middle management layer |
| **Phase 4** (50-100 placements) | India Head, additional teams | P&L delegation to India |
| **Platform** (when funded) | CTO, Engineers, PM, Designer | Building SaaS product for market |

---

## Part VI: How We Hire

### What We Look For

**1. Proven Impact**
- Not just experience—demonstrated results
- We care what you accomplished, not where you worked

**2. Growth Mindset**
- Curiosity over certainty
- Learns from feedback; seeks challenges

**3. Ownership Mentality**
- Sees problems as opportunities
- Doesn't wait to be told what to do

**4. Collaborative Spirit**
- Elevates teammates; shares credit
- Communicates proactively

**5. Values Alignment**
- Resonates with our mission and values
- Cultural contribution, not just fit

### Interview Process

1. **Application Review** (2 days) - Resume and brief questions
2. **Screening Call** (30 min) - Mutual fit, role overview
3. **Technical/Skill Assessment** (60-90 min) - Role-specific evaluation
4. **Team Interview** (60 min) - Meet the team, culture assessment
5. **Founder Interview** (30 min) - Values alignment, big picture
6. **Reference Checks** (3 references)
7. **Offer** (within 48 hours of final interview)

### Our Commitment

- Respond to every application
- Clear feedback at each stage
- Respect candidates' time
- Transparent about compensation
- Fast decisions (< 2 weeks start to finish)

---

## Part VII: Decision-Making Framework

### Types of Decisions

| Type | Description | Who Decides | Process |
|------|-------------|-------------|---------|
| **Reversible** | Easy to undo | Individual | Decide fast, inform team |
| **Irreversible** | Hard to undo | Team lead + stakeholders | Discuss, document, decide |
| **Strategic** | Affects direction | Leadership | RFC, feedback, decision |

### The RFC Process (Request for Comments)

For significant decisions:

1. **Write it down**: Problem, options, recommendation, tradeoffs
2. **Share broadly**: Relevant stakeholders have visibility
3. **Feedback window**: 48-72 hours for input
4. **Decision meeting**: If needed, sync to resolve
5. **Document decision**: Record the what, why, and who

### Escalation Path

When stuck:

1. Try to resolve with direct stakeholders
2. Escalate to team lead with context
3. If unresolved, escalate to leadership
4. Leadership decides within 24 hours

---

## Part VIII: Rituals & Cadences

### Daily

- **Standup** (15 min async or sync): What I did, what I'm doing, blockers

### Weekly

- **Team Sync** (30-60 min): Progress, priorities, blockers
- **1:1s** (30 min): Manager/report connection
- **Demo** (30 min): Show what shipped this week

### Bi-Weekly

- **Sprint Planning**: Next 2 weeks of work
- **Retro**: What worked, what didn't, improvements

### Monthly

- **All Hands** (60 min): Company updates, wins, learnings
- **Metrics Review**: How we're doing against goals

### Quarterly

- **OKR Setting**: Goals for next quarter
- **Strategy Review**: Are we on track?
- **Customer Advisory Board**: Direct customer input

---

## Part IX: Performance & Growth

### Performance Philosophy

- **Impact over activity**: What you accomplished, not hours worked
- **Continuous feedback**: Regular, actionable, specific
- **No surprises**: Performance issues addressed immediately
- **Growth-oriented**: Every review includes development plan

### Review Cadence

- **Weekly 1:1s**: Ongoing feedback and coaching
- **Quarterly Check-ins**: Formal progress discussion
- **Annual Reviews**: Comprehensive evaluation, compensation

### Career Development

- **Clear levels**: Published career ladders with expectations
- **Skill development**: Budget for learning (courses, conferences)
- **Stretch assignments**: Opportunities to grow into new areas
- **Internal mobility**: Encouraged to explore different roles

### Compensation Philosophy

- **Market competitive**: 75th percentile for role and location
- **Transparent**: Published bands, clear criteria
- **Equity participation**: Everyone shares in upside
- **Regular calibration**: Annual market adjustments

---

## Part X: Appendices

### Appendix A: The InTime Vocabulary

| Term | Definition |
|------|------------|
| **Placement** | A consultant deployed at a client |
| **Submission** | A candidate presented for a job |
| **Bench** | W2 consultants between assignments |
| **Pool** | Pre-qualified candidates ready to match |
| **Account** | A client company |
| **Job** | An open position at an account |
| **Funnel** | A workflow pipeline (7 total) |
| **Health Score** | Algorithmic assessment of entity status |

### Appendix B: Key Metrics Glossary

| Metric | Definition | Target |
|--------|------------|--------|
| **Time to Fill** | Days from job creation to start | < 14 days |
| **Fill Rate** | Jobs filled / Total jobs | > 70% |
| **Bench Utilization** | Billed hours / Total hours | > 90% |
| **Client Retention** | Renewed / Up for renewal | > 95% |
| **NPS** | Net Promoter Score | > 50 |

### Appendix C: Tool Stack

| Category | Tool | Purpose |
|----------|------|---------|
| **Code** | GitHub | Version control, PRs |
| **Project** | Linear | Tickets, roadmap |
| **Communication** | Slack | Real-time chat |
| **Docs** | Notion | Long-form documentation |
| **Design** | Figma | UI/UX design |
| **Analytics** | PostHog | Product analytics |
| **Monitoring** | Sentry | Error tracking |

---

## Closing

This document is a living artifact. It captures who we are today and who we aspire to become. Everyone at InTime is expected to:

1. **Read and understand** this document
2. **Live these values** daily
3. **Hold each other accountable** to these standards
4. **Suggest improvements** as we learn and grow

The company we build is the culture we create. Let's make it extraordinary.

---

*Last updated: February 2026*
*Version: 2.0 — Roles updated to reflect Phase 1 staffing operations team*
