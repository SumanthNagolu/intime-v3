# InTime v3 - Epic Canvases

**Version:** 1.0
**Created:** 2025-11-18
**Author:** PM Agent + CEO Advisor
**Status:** Ready for Architecture Review

---

## Table of Contents

1. [Epic 1: Foundation & Core Platform](#epic-1-foundation--core-platform)
2. [Epic 2: Training Academy (LMS)](#epic-2-training-academy-lms)
3. [Epic 3: Recruiting Services (ATS)](#epic-3-recruiting-services-ats)
4. [Epic 4: Bench Sales](#epic-4-bench-sales)
5. [Epic 5: Talent Acquisition (Outbound)](#epic-5-talent-acquisition-outbound)
6. [Epic 6: HR & Employee Management](#epic-6-hr--employee-management)
7. [Epic 7: Productivity & Pod Management (Trikala)](#epic-7-productivity--pod-management-trikala)
8. [Epic 8: Cross-Border Solutions](#epic-8-cross-border-solutions)
9. [Epic Dependency Map](#epic-dependency-map)

---

## Epic 1: Foundation & Core Platform

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**📋 Epic Name:** Foundation & Core Platform
**🎯 Goal:** Establish unified technical foundation for all business pillars
**💰 Business Value:** Enables all other epics; prevents technical debt from legacy mistakes; ensures scalability to 10× growth
**👥 User Personas:** All users (students, employees, recruiters, admins, candidates, clients)
**🎁 Key Features:**
- Unified authentication system (Supabase Auth + RLS policies)
- Single user management system (user_profiles table with multi-role support)
- Event bus infrastructure (cross-module communication without tight coupling)
- Core UI component library (shadcn/ui, Tailwind, consistent design system)
- Database schema with audit trails (created_by, updated_by, soft deletes)
- Role-based access control (RBAC with permissions)
- API infrastructure (tRPC for type-safe APIs, Server Actions for mutations)

**📊 Success Metrics:**
- Zero duplicate user systems (1 table vs legacy's 3 tables)
- 100% RLS coverage on all tables
- 80%+ test coverage on critical paths
- Sub-2s page load times (Lighthouse Performance 90+)
- Event bus handling 1000+ events/day by Week 4

**🔗 Dependencies:**
- **Requires:** None (foundation)
- **Enables:** ALL other epics (Academy, Recruiting, HR, etc.)
- **Blocks:** Nothing (can be built in parallel with planning for other epics)

**⏱️ Effort Estimate:** 4 weeks, ~15 stories
**📅 Tentative Timeline:** Week 1-4 (Foundation Phase)

**Key Stories:**
1. Set up Next.js 15 project with TypeScript strict mode
2. Configure Supabase (PostgreSQL, Auth, Storage)
3. Create unified database schema migration (user_profiles, roles, user_roles)
4. Implement RLS policies for all core tables
5. Build authentication flow (signup, login, logout, password reset)
6. Create event bus infrastructure (publish/subscribe pattern)
7. Set up shadcn/ui component library
8. Implement RBAC middleware (role checks on routes/actions)
9. Create audit trail utilities (auto-populate created_by, updated_by)
10. Set up testing infrastructure (Vitest, Playwright)
11. Configure CI/CD pipeline (GitHub Actions, Vercel deployment)
12. Build error tracking (Sentry integration)
13. Create admin dashboard skeleton (user management, system health)
14. Implement soft delete helpers (deleted_at filtering)
15. Documentation (architecture diagrams, API docs)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## Epic 2: Training Academy (LMS)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**📋 Epic Name:** Training Academy (LMS)
**🎯 Goal:** Transform career changers into job-ready Guidewire developers in 8 weeks through AI-powered Socratic learning
**💰 Business Value:** $599K Year 1 revenue (600 students × $998 avg); 80% placement rate creates recruiting pipeline; 95% gross margin (AI-powered scalability)
**👥 User Personas:**
- Students (career changers, college grads, IT professionals wanting Guidewire skills)
- Trainers (senior + junior trainer pod, manage 50 students)
- AI Mentor (GPT-4o-mini, 24/7 Socratic guidance)
- Admins (track completions, placement rates, revenue)

**🎁 Key Features:**
- Course catalog (PolicyCenter, ClaimCenter, BillingCenter courses)
- 7-module curriculum (Insurance fundamentals → Advanced topics → Capstone)
- Video lessons (hosted on Vimeo, embedded with progress tracking)
- Interactive labs (PolicyCenter sandbox access, hands-on exercises)
- AI-powered Socratic mentor (GPT-4o-mini, contextual Q&A, escalation to human)
- Quiz system (auto-graded, 80% pass requirement, retake logic)
- Capstone projects (GitHub integration, peer review, demo videos)
- Progress tracking (topic completions, XP points, achievements/badges)
- Certificate generation (auto-issue on graduation, PDF download)
- Gamification (leaderboards, badges, XP transactions)
- Student dashboard (current module, next steps, AI mentor chat)
- Trainer dashboard (student progress, at-risk students, grading queue)

**📊 Success Metrics:**
- 70% completion rate (420 of 600 students complete 8-week program)
- 80% placement rate (336 grads placed within 90 days)
- Average time-to-complete: 8 weeks (vs 12-week bootcamps)
- Student satisfaction: 4.5+ stars (NPS 50+)
- AI mentor accuracy: 95%+ helpful responses (thumbs up/down)
- Escalation rate to human trainer: <5% of interactions

**🔗 Dependencies:**
- **Requires:** Epic 1 (Foundation - auth, user management, event bus)
- **Enables:** Epic 3 (Recruiting - graduates become candidates)
- **Blocks:** None

**⏱️ Effort Estimate:** 6 weeks, ~30 stories
**📅 Tentative Timeline:** Week 5-10 (Post-Foundation)

**Key Stories (Sample):**
1. Create products table (courses: PolicyCenter, ClaimCenter, BillingCenter)
2. Build topics/lessons hierarchy (7 modules × 5-8 topics each)
3. Implement video player (Vimeo embed, progress tracking, completion events)
4. Create quiz system (questions, attempts, scoring, retake logic)
5. Build AI mentor integration (OpenAI API, Socratic prompt engineering)
6. Implement capstone project workflow (GitHub repo creation, submission, review)
7. Create progress tracking (topic_completions table, XP transactions)
8. Build student dashboard (current progress, next steps, AI chat interface)
9. Implement graduation workflow (completion check, event publish, certificate)
10. Create trainer dashboard (grading queue, student analytics)
11. Build achievement system (badges, triggers, unlocks)
12. Implement payment processing (Stripe subscription, $499/month)
13. Create enrollment workflow (account creation, payment, onboarding)
14. Build leaderboard (XP rankings, cohort comparisons)
15. Implement escalation logic (AI → human trainer for stuck students)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## Epic 3: Recruiting Services (ATS)

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

## Epic 4: Bench Sales

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

## Epic 5: Talent Acquisition (Outbound)

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

## Epic 6: HR & Employee Management

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

## Epic 7: Productivity & Pod Management (Trikala)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**📋 Epic Name:** Productivity & Pod Management (Trikala)
**🎯 Goal:** Track pod performance (2 placements per 2-week sprint) and detect cross-pollination opportunities (1 conversation = 5+ leads)
**💰 Business Value:** Ensures pods hit targets (2 placements/sprint = $3.43M Year 1 revenue); AI-detects cross-pollination (multiplies revenue 35×); enables data-driven pod management
**👥 User Personas:**
- Pod Members (9.5 pods, Senior + Junior pairs)
- Pod Leads (manage pod goals, review performance)
- Executives (CEO, CFO - view company-wide metrics)
- Admins (configure goals, view cross-pollination opportunities)

**🎁 Key Features:**
- Pod management (create pods, assign members, set goals)
- Sprint planning (2-week sprints, goal: 2 placements per pod)
- Activity tracking (time spent on tasks, conversations, calls, emails)
- Productivity insights (AI analysis of activity patterns, recommendations)
- Cross-pollination detection (AI analyzes conversations for 5-pillar opportunities)
- Opportunity pipeline (detected leads, assignment to appropriate pod, tracking)
- Pod performance dashboard (placements this sprint, goal progress, velocity)
- Focus sessions (deep work blocks, interruption prevention)
- Meeting recording integration (Zoom/Teams, transcription, action items)
- Action item extraction (AI extracts tasks from meetings, assigns to members)
- Leaderboard (pods ranked by placements, revenue, cross-pollination finds)
- Executive dashboard (company-wide KPIs, pod comparisons, revenue tracking)

**📊 Success Metrics:**
- 80% of pods hit 2 placements/sprint goal (8 of 9.5 pods)
- Cross-pollination detection: 100+ opportunities/month (from all conversations)
- Opportunity conversion: 20% (20 of 100 detected → actual revenue)
- Productivity increase: 15% (vs baseline without tracking)
- Meeting action items completed: 80% (vs 50% without AI extraction)
- Executive dashboard usage: Daily (CEO/CFO check metrics every morning)

**🔗 Dependencies:**
- **Requires:** Epic 1 (Foundation), Epic 6 (HR - for employee/team data)
- **Enables:** Cross-pollination revenue (multiplies all other epic revenue)
- **Blocks:** None

**⏱️ Effort Estimate:** 6 weeks, ~30 stories
**📅 Tentative Timeline:** Week 16-21 (After HR foundation)

**Key Stories (Sample):**
1. Create pods table (name, senior_id, junior_id, pillar, goals)
2. Build pod management interface (create, edit, member assignment)
3. Implement sprint planning (2-week cycles, goal setting, tracking)
4. Create activity tracking (time logs, task categories, manual entry)
5. Build AI productivity insights (analyze patterns, suggest optimizations)
6. Implement cross-pollination AI (conversation analysis, opportunity detection)
7. Create opportunity pipeline (detected leads, categorize by pillar, assign)
8. Build pod performance dashboard (current sprint, placements, goal progress)
9. Implement focus sessions (pomodoro timer, interruption blocking)
10. Create meeting recording integration (Zoom API, auto-record, transcribe)
11. Build action item extraction (AI extracts tasks, assigns to members)
12. Implement leaderboard (pods ranked, gamification, recognition)
13. Create executive dashboard (company KPIs, pod comparisons, trends)
14. Build cross-pollination notification (alert appropriate pod when lead detected)
15. Implement reporting (sprint retrospectives, velocity trends, revenue attribution)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## Epic 8: Cross-Border Solutions

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

## Epic Dependency Map

### Visual Representation

```
                    ┌──────────────────────────────┐
                    │   EPIC 1: FOUNDATION         │
                    │   (Week 1-4)                 │
                    │   - Auth, User Mgmt, DB,     │
                    │     Event Bus, UI Library    │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────┴───────────────┐
                    │                              │
                    ▼                              ▼
        ┌───────────────────────┐      ┌───────────────────────┐
        │ EPIC 2: ACADEMY       │      │ EPIC 6: HR & EMPLOYEE │
        │ (Week 5-10)           │      │ (Week 14-18)          │
        │ - LMS, AI Mentor,     │      │ - Timesheets, Leave,  │
        │   Courses, Grading    │      │   Expenses, Docs      │
        └───────────┬───────────┘      └───────────┬───────────┘
                    │                              │
                    ▼                              ▼
        ┌───────────────────────┐      ┌───────────────────────┐
        │ EPIC 3: RECRUITING    │      │ EPIC 7: PRODUCTIVITY  │
        │ (Week 8-13)           │      │ (Week 16-21)          │
        │ - ATS, Jobs, AI       │      │ - Pods, Sprints,      │
        │   Matching, 48hr SLA  │      │   Cross-Pollination   │
        └───────────┬───────────┘      └───────────────────────┘
                    │
                    ├──────────────┬───────────────┐
                    ▼              ▼               ▼
        ┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐
        │ EPIC 4: BENCH    │  │ EPIC 5: TA   │  │ EPIC 8: CROSS-   │
        │ (Week 11-14)     │  │ (Week 12-16) │  │ BORDER           │
        │ - Bench Mgmt,    │  │ - Outbound,  │  │ (Week 22-25)     │
        │   Commissions    │  │   Partnerships│ │ - LMIA, H-1B     │
        └──────────────────┘  └──────────────┘  └──────────────────┘
```

### Dependency Table

| Epic | Requires (Must Build First) | Enables (Unlocks These) | Parallel (Can Build Together) |
|------|----------------------------|------------------------|------------------------------|
| **1. Foundation** | None | All other epics | None (must finish first) |
| **2. Academy** | Epic 1 | Epic 3 (graduates → candidates) | Epic 6 (HR) |
| **3. Recruiting** | Epic 1, Epic 2 (for pipeline) | Epic 4 (Bench), Epic 5 (TA) | Epic 6 (HR) |
| **4. Bench Sales** | Epic 1, Epic 3 (for clients) | Cross-pollination revenue | Epic 5 (TA), Epic 6 (HR) |
| **5. TA (Outbound)** | Epic 1, Epic 3 (for fulfillment) | Enterprise clients, Epic 8 (Cross-Border) | Epic 4 (Bench), Epic 6 (HR) |
| **6. HR & Employee** | Epic 1 | Epic 7 (Productivity - uses timesheet data) | Epic 2, 3, 4, 5 |
| **7. Productivity** | Epic 1, Epic 6 (employee data) | Cross-pollination detection | None (near end of Year 1) |
| **8. Cross-Border** | Epic 1, Epic 3, Epic 5 (clients) | Gold mine opportunities (H-1B, TN visa) | None (Year 2 priority) |

### Critical Path Analysis

**Shortest Path to Revenue:**
1. **Epic 1** (Week 1-4): Foundation
2. **Epic 2** (Week 5-10): Academy → First students enrolled, tuition revenue
3. **Epic 3** (Week 8-13): Recruiting → First placements, $5K fees

**Total:** 13 weeks to first recruiting revenue

**Full Platform (Year 1 Complete):**
1. Epic 1 → 2 → 3 → 4 → 5 (Revenue pillars operational by Week 16)
2. Epic 6 → 7 (Internal operations optimized by Week 21)
3. Epic 8 (Year 2 priority, setup in Week 22-25)

**Total:** 25 weeks to full Year 1 platform

### Sequencing Rationale

**Why This Sequence:**

1. **Foundation First (Epic 1):**
   - Non-negotiable: All other epics depend on auth, DB, event bus
   - Lesson from legacy: Build foundation BEFORE modules (avoid integration hell)

2. **Academy Early (Epic 2, Week 5):**
   - Creates talent pipeline for Recruiting (graduates → candidates)
   - Early revenue ($499/month subscriptions start immediately)
   - Proves AI mentor concept (critical differentiator)

3. **Recruiting Core (Epic 3, Week 8):**
   - Overlaps with Academy finish (Week 10)
   - By Week 11: First Academy graduates → First recruiting placements
   - Highest revenue pillar ($1.5M Year 1)

4. **Bench + TA Parallel (Epics 4-5, Week 11-16):**
   - Both depend on Recruiting (share client base)
   - Can build in parallel (different teams)
   - Bench is faster (4 weeks) than TA (5 weeks)

5. **HR Mid-Stream (Epic 6, Week 14):**
   - Not customer-facing (internal operations)
   - Can start when recruiting is stable
   - Parallel with Bench + TA finish

6. **Productivity Late (Epic 7, Week 16):**
   - Requires HR data (timesheets, teams)
   - Cross-pollination AI needs other modules operational (conversations to analyze)
   - Near Year 1 end (when pods are established, metrics matter)

7. **Cross-Border Last (Epic 8, Week 22):**
   - Year 2 priority ($0 revenue Year 1)
   - Requires recruiting + TA operational (client relationships)
   - Most complex (immigration paperwork, government processes)

### Risk Mitigation

**Risk:** Foundation takes longer than 4 weeks
**Mitigation:** Lock scope (MVP features only), time-box to 4 weeks max, defer nice-to-haves

**Risk:** Academy and Recruiting both slip → no revenue by Week 13
**Mitigation:** Academy Week 5-10 (6 weeks buffer), Recruiting overlaps Week 8 (starts before Academy done)

**Risk:** Team capacity (not enough developers for parallel work)
**Mitigation:** Sequence critical path first (Foundation → Academy → Recruiting), only parallelize when safe (Bench + TA, both simple)

**Risk:** Cross-pollination AI (Epic 7) doesn't work
**Mitigation:** Optional Year 1 (manual cross-pollination via Slack/meetings), Epic 7 is enhancement not blocker

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-4)
- **Epic 1:** Complete
- **Team:** 2-3 developers, 1 architect
- **Deliverable:** Working authentication, database, event bus, UI library
- **Success:** Can create users, assign roles, publish events

### Phase 2: Revenue Pillars (Week 5-16)
- **Epics 2-5:** Academy, Recruiting, Bench, TA
- **Team:** 4-6 developers (can split into 2 teams after Week 10)
- **Deliverable:** All 5 business pillars operational
- **Success:** First students enrolled, first placements made, revenue flowing

### Phase 3: Operations (Week 14-21)
- **Epics 6-7:** HR, Productivity
- **Team:** 2-3 developers (parallel with Phase 2 finish)
- **Deliverable:** Internal operations optimized, cross-pollination detection
- **Success:** HR processes automated, pod metrics tracked, cross-pollination opportunities captured

### Phase 4: Advanced (Week 22-25, Year 2 Prep)
- **Epic 8:** Cross-Border
- **Team:** 1-2 developers + immigration specialist
- **Deliverable:** LMIA workflow ready for Year 2 pilot
- **Success:** First LMIA case processed (even if not approved until Year 2)

---

**Next Steps:**
1. Architecture team: Review epic canvases, validate estimates
2. Break down each epic into detailed user stories (backlog refinement)
3. Assign story points (planning poker sessions)
4. Create sprint plan (2-week sprints, starting with Epic 1)
5. Begin development (Week 1 kickoff)

**Document Owner:** PM Agent + CEO Advisor
**Review Cycle:** Weekly (during implementation), adjust as needed
**Related Documents:**
- [Business Model](../vision/02-BUSINESS-MODEL.md)
- [Financial Model](../vision/03-FINANCIAL-MODEL.md)
- [Database Schema](../architecture/DATABASE-SCHEMA.md)
- [Event-Driven Integration](../architecture/EVENT-DRIVEN-INTEGRATION.md)
