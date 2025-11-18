# InTime Training Academy

**Version:** 1.0
**Last Updated:** November 17, 2025
**Owner:** Academy Pod Lead
**Status:** Living Document

---

## Table of Contents

1. [Academy Overview](#academy-overview)
2. [Curriculum Design](#curriculum-design)
3. [AI-Powered Socratic Mentor](#ai-powered-socratic-mentor)
4. [Student Journey (Day 0 → Job Placement)](#student-journey-day-0--job-placement)
5. [Success Metrics & KPIs](#success-metrics--kpis)
6. [Economics & Unit Metrics](#economics--unit-metrics)
7. [Operations & Workflows](#operations--workflows)

---

## Academy Overview

### Mission

> **"Transform anyone with aptitude into a job-ready Guidewire developer in 8 weeks, then place them in $85K+ jobs."**

### Core Principles

1. **Socratic Method** - Guide with questions, don't just tell answers
2. **Sequential Mastery** - Can't skip ahead, must master each module
3. **Hands-On Experience** - Build real applications, not just watch videos
4. **Job Placement Integration** - Training → Recruiting pod → Guaranteed placement effort

### Value Proposition

**For Students:**
- **Time:** 8 weeks part-time (vs 12-week full-time bootcamps)
- **Cost:** $998 total (vs $15,000 bootcamps, $4,500 Guidewire official)
- **Outcome:** 80% placement rate at $85K-$95K average salary
- **Support:** 24/7 AI mentor + human trainer + recruiting pod

**For Business:**
- **Revenue:** $598,800 Year 1 (600 students × $998 avg)
- **Talent Pipeline:** 420 graduates/year → recruiting pipeline
- **Margin:** 95% gross margin (AI-powered, scalable)
- **Cross-Pollination:** 1 student enrollment = 5+ revenue opportunities

---

## Curriculum Design

### Course Structure

**Total Duration:** 8 weeks (56 days)
**Time Commitment:** 2-3 hours/day, 6 days/week (flexible schedule)
**Total Hours:** 96-144 hours of learning
**Completion Rate:** 70% (420 of 600 students complete)

### Module Breakdown

#### **Module 1: Insurance Fundamentals (Week 1)**

**Objective:** Understand insurance industry basics before touching Guidewire

**Topics:**
- What is insurance? (auto, home, life, health, commercial)
- Key concepts: Premium, deductible, claim, policy, coverage
- Insurance company operations (underwriting, claims, billing)
- Regulatory environment (state vs federal, compliance)

**Learning Method:**
- Videos: 5 hours (industry overview, terminology)
- Interactive scenarios: "You're an underwriter, decide if you'd insure this driver"
- Quiz: 20 questions (must score 80% to proceed)
- AI mentor: Answer "why does insurance exist?" type questions

**Deliverable:**
- Essay (500 words): "How does an insurance company make money?"
- AI grades, provides feedback, student revises until passing

**Success Criteria:**
- Can explain P&L of an insurance company
- Understands key terminology (no Googling during later modules)

#### **Module 2: PolicyCenter Basics (Week 2)**

**Objective:** Understand what PolicyCenter does and why it exists

**Topics:**
- What is Guidewire PolicyCenter? (policy administration system)
- Key entities: Policy, PolicyLine, Coverage, Exclusion, Rating
- Workflow: Quote → Bind → Issue → Renew → Cancel
- Configuration vs customization (OOTB vs custom)

**Learning Method:**
- Videos: 8 hours (PolicyCenter walkthrough, data model)
- Sandbox access: Click through PolicyCenter UI (read-only)
- Lab 1: Create a personal auto policy (guided)
- Lab 2: Modify an existing policy (add coverage)

**Deliverable:**
- Lab report: Screenshots + explanations of each step
- Presentation: "Explain PolicyCenter to a non-technical friend"

**Success Criteria:**
- Can navigate PolicyCenter UI without help
- Understands data model (Policy → PolicyLine → Coverage hierarchy)

#### **Module 3: PolicyCenter Configuration (Weeks 3-4)**

**Objective:** Build a working policy product from scratch

**Topics:**
- Product model design (lines of business, coverages, rating)
- Rules (validation, pre-update, rating)
- Gosu scripting basics (syntax, expressions, functions)
- Testing (unit tests, integration tests)

**Learning Method:**
- Videos: 12 hours (configuration deep-dive)
- Project: Build "Pet Insurance" product
  - Define coverages (vet visits, surgery, medications)
  - Create rating algorithm (age, breed, location)
  - Write validation rules (can't insure pets over 12 years old)
  - Build quote page UI
- Peer review: Review another student's pet insurance product

**Deliverable:**
- Working Pet Insurance product (deployed to sandbox)
- GitHub repository (code, tests, documentation)
- Demo video (3 minutes, show quote → bind flow)

**Success Criteria:**
- Pet Insurance product is functional (can quote, bind, issue)
- Code follows best practices (no hardcoded values, proper error handling)
- 80%+ test coverage

#### **Module 4: PolicyCenter Integrations (Week 5)**

**Objective:** Connect PolicyCenter to external systems (common real-world requirement)

**Topics:**
- REST APIs (GET, POST, PUT, DELETE)
- SOAP web services (WSDL, XML)
- Integration patterns (sync vs async, batch vs real-time)
- Error handling (retry logic, circuit breakers)

**Learning Method:**
- Videos: 6 hours (integration patterns, best practices)
- Lab 1: Build REST API endpoint (expose policy data)
- Lab 2: Consume external API (credit score check before binding)
- Lab 3: Handle failures (what if credit API is down?)

**Deliverable:**
- Integration project (PolicyCenter ↔ Mock Credit Bureau)
- API documentation (Swagger/OpenAPI spec)
- Error handling report (what happens when things fail?)

**Success Criteria:**
- API is functional, documented, tested
- Handles edge cases (API timeout, invalid response, etc.)

#### **Module 5: Advanced Topics (Week 6)**

**Objective:** Learn real-world skills (what senior devs actually do)

**Topics:**
- Performance optimization (slow quote generation? debug it)
- Batch jobs (renewal processing, billing)
- Reporting (SQL queries, custom reports)
- Troubleshooting (logs, stack traces, debugging)

**Learning Method:**
- Videos: 4 hours (war stories from real projects)
- Case study 1: "Quote generation takes 30 seconds. Fix it." (performance tuning)
- Case study 2: "Build nightly renewal batch job" (scheduled processing)
- Case study 3: "Client wants custom report" (SQL + Jasper)

**Deliverable:**
- Performance analysis report (before/after metrics, what you changed)
- Working batch job (tested with 1,000 sample policies)
- Custom report (PDF output, client-ready)

**Success Criteria:**
- Quote generation < 5 seconds (from 30 seconds)
- Batch job processes 1,000 policies in < 10 minutes
- Report looks professional (not just raw SQL output)

#### **Module 6: BillingCenter Basics (Week 7)**

**Objective:** Expand beyond PolicyCenter (most roles require multi-product knowledge)

**Topics:**
- What is BillingCenter? (policy billing, payment processing)
- Key entities: Account, Invoice, Payment, Delinquency
- Integration with PolicyCenter (policy issued → invoice generated)
- Payment plans (monthly, quarterly, annual)

**Learning Method:**
- Videos: 6 hours (BillingCenter overview)
- Lab: Configure payment plan (monthly installments with 3% fee)
- Lab: Build delinquency process (missed payment → warning → cancel)

**Deliverable:**
- Working payment plan (tested with sample policies)
- Delinquency workflow diagram (Visio/Lucidchart)

**Success Criteria:**
- Understands PolicyCenter ↔ BillingCenter integration
- Can explain payment plan logic to non-technical stakeholder

#### **Module 7: Capstone Project (Week 8)**

**Objective:** Build end-to-end solution (portfolio piece for job interviews)

**Project:** "HomeProtect Insurance"
- Product: Homeowners insurance with 3 coverage options
- Rating: Based on home value, location (zip code), construction type
- Integration: Connect to mock property valuation API
- Billing: Offer monthly or annual payment plans
- Reports: Generate policy summary PDF

**Requirements:**
- Fully functional (quote → bind → issue → bill)
- Code in GitHub (public repo, good README)
- Deployed to cloud (Heroku/Render/Vercel)
- Demo video (5 minutes, walk through entire flow)

**Deliverable:**
- GitHub repo (code, tests, docs)
- Live demo link
- Demo video (uploaded to YouTube)
- Presentation (10 slides, explain architecture decisions)

**Success Criteria:**
- Project is functional, deployed, documented
- Code quality (no major bugs, follows best practices)
- Impressive enough to show in job interviews

---

## AI-Powered Socratic Mentor

### How It Works

**Technology Stack:**
- **Model:** GPT-4o-mini (cost-effective, fast)
- **Context Window:** 128K tokens (entire conversation history)
- **Response Time:** <2 seconds average
- **Availability:** 24/7 (global students, different timezones)

### Socratic Method Implementation

**Example Interaction:**

```
STUDENT: "I don't understand how rating works in PolicyCenter"

❌ BAD AI RESPONSE (Just Telling):
"Rating in PolicyCenter uses rating tables and formulas. You configure
rating factors like driver age, vehicle type, and location. The system
calculates premium by applying these factors..."

✅ GOOD AI RESPONSE (Socratic):
AI: "Great question! Let's explore this together. Have you ever
     wondered how your car insurance company decides how much to
     charge you?"

STUDENT: "Yeah, I know they look at my age and driving record"

AI: "Exactly! Now think about this: if you're 25 with no accidents
     and I'm 18 with 2 speeding tickets, should we pay the same?"

STUDENT: "No, I'm lower risk so I should pay less"

AI: "Perfect! So the insurance company needs a system to calculate
     that difference. That's what rating does. Now, in PolicyCenter,
     how do you think we tell the system '18-year-olds are higher risk'?"

STUDENT: "Maybe a table with age ranges and multipliers?"

AI: "You're thinking like a developer! Let's look at rating tables
     in your sandbox. Can you find the DriverAge rating table?"

[STUDENT DISCOVERS THE ANSWER, DOESN'T JUST GET TOLD]
```

### Guardrails & Quality Control

**What AI Can Do:**
- ✅ Answer technical questions (Guidewire, Java, SQL)
- ✅ Debug student code (point out issues, suggest fixes)
- ✅ Explain concepts (insurance, PolicyCenter, BillingCenter)
- ✅ Grade assignments (automated scoring + feedback)
- ✅ Suggest resources (docs, videos, blog posts)

**What AI Cannot Do:**
- ❌ Give direct answers to graded assignments (must guide, not solve)
- ❌ Override human trainer decisions (if trainer said "redo this," AI can't override)
- ❌ Make exceptions to deadlines (escalate to human)
- ❌ Guarantee job placement (only recruiting pod can do that)

**Escalation to Human Trainer:**

Triggers:
- Student asks same question 5+ times (not getting it, needs human help)
- Student expresses frustration ("this is stupid," "I want to quit")
- Technical issue AI can't solve (sandbox access, environment setup)
- Complex career advice ("should I negotiate my offer?")

### Cost Analysis

**Per Student:**
- Average interactions: 30 per student (throughout 8 weeks)
- Average tokens per interaction: 500 (question + answer)
- Cost: 30 × 500 × $0.0006 / 1,000 = **$0.009 per student**

**At Scale (1,000 students):**
- Total cost: $9/month
- Human mentor equivalent: $60,000/year salary for 100 students = $600K for 1,000 students
- **Savings: $599,991/year (99.99% cost reduction!)**

---

## Student Journey (Day 0 → Job Placement)

### Day 0: Discovery

**How Students Find Us:**

1. **SEO (60% of students)**
   - Google search: "Guidewire training," "PolicyCenter course," "insurance tech career"
   - Rank #1-#3 for 50+ Guidewire keywords
   - Blog posts: "How to become a Guidewire developer," "Guidewire salary guide"

2. **Content Marketing (20%)**
   - Free YouTube tutorials (PolicyCenter basics, BillingCenter intro)
   - Lead magnet: "Guidewire Career Roadmap" PDF download
   - Weekly newsletter: "Guidewire tips and job postings"

3. **Referrals (15%)**
   - Alumni refer friends: $1,000 bonus per successful referral
   - Word-of-mouth: "My friend got a $90K job through InTime"

4. **Paid Ads (5%)**
   - Google Ads: "Guidewire training" (testing only, small budget)
   - LinkedIn Ads: Target insurance professionals wanting to upskill

**Student Profile (Typical):**
- Age: 25-35
- Current role: Customer service, entry-level IT, insurance operations
- Income: $30K-$50K (stuck, want career change)
- Education: Bachelor's degree (any field)
- Technical experience: Basic (maybe some Excel, no coding)
- Motivation: Want $80K+ tech job, heard Guidewire is lucrative

### Day 1-7: Enrollment & Onboarding

**Enrollment Flow:**

1. **Visit Website** → Click "Enroll in PolicyCenter Developer Course"
2. **Create Account** → Email, password, profile info
3. **Payment** → $499/month subscription (Stripe)
4. **Onboarding Call** → 30-min video call with trainer
   - What's your background?
   - What's your goal? (career change? upskill? international opportunity?)
   - Set expectations (8 weeks, 2-3 hours/day, we'll place you if you finish)
5. **Slack Invitation** → Join InTime Academy Slack workspace
6. **First Lesson** → "Introduction to Insurance" (Module 1, Lesson 1)

**Week 1 Experience:**
- Complete Module 1 (insurance fundamentals)
- First interaction with AI mentor: "What's a deductible?"
- First peer interaction: Slack channel, meet cohort
- First milestone: Pass insurance quiz (80%+)

### Week 2-6: Intensive Learning

**Daily Routine:**

```
MORNING (30 min before work):
├─ Watch 1 video lesson (15 min)
├─ Take notes, mark confusing parts
└─ Ask AI mentor quick questions

EVENING (2 hours after work):
├─ Hands-on lab (60 min)
├─ Build project component (30 min)
├─ Peer review another student's work (15 min)
└─ Slack discussion: "What did you learn today?" (15 min)

WEEKEND (3-4 hours):
├─ Catch up on any missed lessons
├─ Work on capstone project (incremental progress)
└─ Optional: Watch additional resources (Guidewire docs, YouTube)
```

**Milestones:**

- **End of Week 2:** PolicyCenter configured (simple product working)
- **End of Week 4:** Integration built (PolicyCenter ↔ external API)
- **End of Week 6:** BillingCenter basics complete
- **End of Week 8:** Capstone project deployed (portfolio-ready)

### Week 7-8: Job Prep & Placement

**Activities:**

1. **Resume Building (Week 7)**
   - AI generates Guidewire-optimized resume (GPT-4o)
   - Recruiter reviews, provides feedback
   - Final version: "PolicyCenter Developer" headline, capstone project featured

2. **Mock Interviews (Week 7-8)**
   - 3 mock technical interviews with AI (PolicyCenter questions)
   - 1 mock behavioral interview with recruiter
   - Feedback: "Talk slower," "Explain your thought process," etc.

3. **Portfolio Prep (Week 8)**
   - GitHub profile optimized (README, project descriptions)
   - LinkedIn updated (new headline, skills, capstone project link)
   - Personal website (optional): "Hi, I'm Sarah, Guidewire Developer" + portfolio

4. **Handoff to Recruiting Pod (End of Week 8)**
   - Training pod marks student as "Graduated"
   - Recruiting pod receives notification: "Sarah completed, ready for placement"
   - Recruiter reaches out: "Congrats! Let's get you a job. When can you start?"

### Post-Graduation: Placement (Day 60-90)

**Recruiting Pod Takes Over:**

**Day 60:** Graduate completes training
**Day 61-63:** Recruiter submits to 6 active JDs (PolicyCenter roles)
**Day 64-70:** 3 interview requests come in
**Day 71-75:** Sarah interviews with 3 companies
**Day 76:** Offer received ($90K, remote, full-time)
**Day 77:** Sarah accepts
**Day 90:** Sarah starts new job (2 weeks notice at old job)

**Total Timeline:** 90 days from enrollment to first day of $90K job

**InTime Revenue from Sarah:**
- Training subscription: $998 (2 months)
- Placement fee: $5,000
- **Total:** $5,998

**Sarah's ROI:**
- Investment: $998
- Outcome: $90,000/year job
- **Return:** 9,000% in 90 days!

---

## Success Metrics & KPIs

### Student Metrics

| Metric | Target | Year 1 Actual | Industry Benchmark |
|--------|--------|---------------|-------------------|
| **Enrollment** | 50/month | TBD | N/A |
| **Completion Rate** | 70% | TBD | 60% (bootcamps) |
| **Time-to-Complete** | 8 weeks avg | TBD | 12 weeks (bootcamps) |
| **Placement Rate** | 80% | TBD | 60-70% (bootcamps) |
| **Avg Starting Salary** | $85K-$95K | TBD | $60K-$70K (bootcamps) |
| **90-Day Retention** | 95% | TBD | 85% (industry) |
| **Student Satisfaction** | 4.5+ stars | TBD | 4.0 (typical) |

### Business Metrics

| Metric | Target | Year 1 Actual |
|--------|--------|---------------|
| **Revenue** | $598,800 | TBD |
| **COGS** | $10,800 | TBD |
| **Gross Margin** | 98% | TBD |
| **CAC** | $300 | TBD |
| **LTV** | $5,998 | TBD |
| **LTV/CAC Ratio** | 20× | TBD |
| **Payback Period** | 0.5 months | TBD |

### Quality Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Code Quality** | 80%+ test coverage | Automated (GitHub Actions) |
| **Capstone Projects** | 90% functional | Manual review by trainer |
| **AI Mentor Accuracy** | 95%+ helpful responses | Student thumbs up/down |
| **Escalation Rate** | <5% to human trainer | Automated tracking |

---

## Economics & Unit Metrics

### Revenue Model

**Per Student:**
```
SUBSCRIPTION: $499/month
AVERAGE DURATION: 2 months (some finish in 6 weeks, some take 10 weeks)
AVERAGE REVENUE: $998 per student

YEAR 1 TARGETS:
├─ Month 1-3: 20 students/month × $998 = $19,960/month
├─ Month 4-6: 30 students/month × $998 = $29,940/month
├─ Month 7-9: 40 students/month × $998 = $39,920/month
└─ Month 10-12: 50 students/month × $998 = $49,900/month

TOTAL YEAR 1: 450 students × $998 = $449,100
```

**Indirect Revenue (Cross-Pollination):**
- 80% placement rate → 360 placements × $5,000 = $1,800,000 (recruiting revenue)
- Training attribution bonus: 15% of placement fee = $270,000
- **Total Attributed Revenue:** $449,100 + $270,000 = $719,100

### Cost Structure

**Per Student:**
```
AI MENTOR: $0.009 (30 interactions)
PLATFORM COSTS: $30 (Supabase, Vercel, bandwidth)
TRAINER SUPPORT: $200 (2 hours × $100/hr, avg across all students)
TOTAL COGS: $230.01 per student

GROSS PROFIT: $998 - $230 = $768
GROSS MARGIN: 77%
```

**Fixed Costs (Year 1):**
```
SALARIES:
├─ Senior Trainer: $100,000
├─ Junior Trainer: $60,000
└─ TOTAL: $160,000

TECHNOLOGY:
├─ Guidewire licenses (sandbox): $12,000/year
├─ Video hosting (Vimeo): $1,200/year
├─ Course platform: Included in main stack
└─ TOTAL: $13,200

CONTENT CREATION (one-time):
├─ Video production: $20,000
├─ Curriculum development: $30,000
└─ TOTAL: $50,000 (Year 1 only, amortize over 3 years)

TOTAL FIXED: $223,200 + $16,667 (amortized content) = $239,867
```

**Profitability:**
```
REVENUE: $449,100
COGS: $230 × 450 = $103,500
GROSS PROFIT: $345,600

FIXED COSTS: $239,867
NET PROFIT: $105,733
NET MARGIN: 24%
```

---

## Operations & Workflows

### Daily Operations (Training Pod)

**Senior Trainer:**
- Morning (2 hours): Review student submissions from previous day
- Midday (3 hours): Create new content, update curriculum
- Afternoon (2 hours): Office hours (live Q&A), 1-on-1 troubleshooting
- Evening (1 hour): Admin (grading, student progress tracking)

**Junior Trainer:**
- Morning (3 hours): Grade assignments, provide feedback
- Afternoon (2 hours): Slack support, answer questions
- Evening (2 hours): Update student progress dashboard, escalations
- On-call (async): Monitor AI mentor escalations

### Weekly Operations

**Monday:**
- Team standup (30 min): Review student progress, identify at-risk students
- Content review (1 hour): Update videos/labs based on student feedback

**Wednesday:**
- Office hours (2 hours): Live Zoom session, students can drop in
- Peer review session (1 hour): Students review each other's capstone projects

**Friday:**
- Weekly wrap-up (30 min): Celebrate completions, share wins
- Alumni check-in (30 min): Reach out to recent grads, get placement updates

### Monthly Operations

**First Monday:**
- Cohort analysis: Completion rate, time-to-complete, placement rate
- Content audit: Which modules are students struggling with?
- AI mentor review: Accuracy rate, escalation patterns

**Last Friday:**
- Planning for next month: Expected enrollments, capacity planning
- Recruiting handoff: How many students graduating next month?

### Tools & Systems

**Student Management:**
- Custom LMS (built on Supabase + Next.js)
- Tracks: Progress, assignments, quiz scores, capstone status
- Integrates with: Stripe (payments), Slack (community), GitHub (code reviews)

**AI Mentor:**
- OpenAI API (GPT-4o-mini)
- Custom prompt library (tested, optimized for Socratic method)
- Escalation logic (if student stuck, flag for human)

**Communication:**
- Slack (primary): #general, #module-1, #module-2, ..., #capstone, #job-search
- Email (secondary): Weekly newsletter, important announcements
- Zoom (live sessions): Office hours, mock interviews

---

**Next Review:** Monthly (curriculum updates based on student feedback)
**Document Owner:** Academy Pod Lead
**Related Documents:**
- [Business Model](02-BUSINESS-MODEL.md)
- [AI Strategy](09-AI-STRATEGY.md)
- [Recruiting Services](05-RECRUITING-SERVICES.md)
