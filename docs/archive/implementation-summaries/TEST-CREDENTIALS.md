# InTime v3 - Test User Credentials

**Last Updated:** 2025-11-22
**Total Test Users:** 36
**Default Password:** `TestPass123!`

---

## Quick Access by Role

### 🔑 Leadership & Administration (3 users)

| Email | Name | Role | Department | Use Case |
|-------|------|------|------------|----------|
| `admin@intime.com` | System Administrator | Admin | Administration | Full system access, user management |
| `ceo@intime.com` | Sumanth Rajkumar Nagolu | CEO | Executive | Strategic oversight, all business data |
| `cfo@intime.com` | Sarah Johnson | CFO | Finance | Financial reports, budgets, revenue analytics |

---

### 👥 HR Department (2 users)

| Email | Name | Role | Department | Use Case |
|-------|------|------|------------|----------|
| `hr@intime.com` | Maria Rodriguez | HR Manager | Human Resources | Employee management, performance reviews |
| `hr_admin@intime.com` | James Wilson | HR Administrator | Human Resources | HR admin tasks, reports to hr@intime.com |

---

### 🎓 Training Academy (5 users)

#### Trainers (2 users)
| Email | Name | Role | Department | Use Case |
|-------|------|------|------------|----------|
| `trainer@intime.com` | Dr. Emily Chen | Lead Trainer | Training | Course creation, student management |
| `trainer_2@intime.com` | Prof. Michael Anderson | Trainer | Training | Course instruction, grading |

#### Students (3 users)
| Email | Name | Role | Progress | Use Case |
|-------|------|------|----------|----------|
| `student@intime.com` | Alex Kumar | Student | Module 2 (45%) | Active learner, mid-course |
| `student_2@intime.com` | Jessica Martinez | Student | Module 3 (60%) | Progressing well, hands-on projects |
| `student_3@intime.com` | David Lee | Student | Module 4 (80%) | Near graduation, interview prep |

---

### 📞 Recruiting Pods (4 users)

#### Pod 1 - Northeast
| Email | Name | Role | Territory | Target | Use Case |
|-------|------|------|-----------|--------|----------|
| `sr_rec@intime.com` | Alice Thompson | Senior Recruiter | Northeast | 3/month | Pod lead, client relationships |
| `jr_rec@intime.com` | Bob Garcia | Junior Recruiter | Northeast | 2/month | Support recruiter, reports to Alice |

#### Pod 2 - Midwest
| Email | Name | Role | Territory | Target | Use Case |
|-------|------|------|-----------|--------|----------|
| `sr_rec_2@intime.com` | Carol Davis | Senior Recruiter | Midwest | 3/month | Pod lead, specializes in P&C insurance |
| `jr_rec_2@intime.com` | Daniel Brown | Junior Recruiter | Midwest | 2/month | Support recruiter, reports to Carol |

---

### 💼 Bench Sales Pods (4 users)

#### Pod 1 - NYC
| Email | Name | Role | Target | Use Case |
|-------|------|------|--------|----------|
| `sr_bs@intime.com` | Eve Williams | Senior Bench Sales | 2/month | Pod lead, bench candidate placement |
| `jr_bs@intime.com` | Frank Miller | Junior Bench Sales | 1/month | Support bench sales, reports to Eve |

#### Pod 2 - Chicago
| Email | Name | Role | Target | Use Case |
|-------|------|------|--------|----------|
| `sr_bs_2@intime.com` | Grace Taylor | Senior Bench Sales | 2/month | Pod lead, regional bench sales |
| `jr_bs_2@intime.com` | Henry Clark | Junior Bench Sales | 1/month | Support bench sales, reports to Grace |

---

### 🎯 Talent Acquisition Pods (4 users)

#### Pod 1 - National
| Email | Name | Role | Territory | Target | Use Case |
|-------|------|------|-----------|--------|----------|
| `sr_ta@intime.com` | Ivy Moore | Senior TA | National | 4/month | Pod lead, pipeline building |
| `jr_ta@intime.com` | Jack White | Junior TA | National | 2/month | Sourcing specialist, reports to Ivy |

#### Pod 2 - International
| Email | Name | Role | Territory | Target | Use Case |
|-------|------|------|-----------|--------|----------|
| `sr_ta_2@intime.com` | Karen Harris | Senior TA | International | 4/month | Cross-border hiring specialist |
| `jr_ta_2@intime.com` | Leo Martin | Junior TA | International | 2/month | International sourcing, reports to Karen |

---

### 👨‍💼 Candidates (6 users)

| Email | Name | Status | Visa | Rate | Experience | Use Case |
|-------|------|--------|------|------|------------|----------|
| `candidate@intime.com` | Priya Sharma | Active | OPT | $65/hr | 5 years | Job seeker, immediate availability |
| `candidate_bench@intime.com` | Raj Patel | Bench | H1B | $75/hr | 7 years | On bench 15 days, seeking placement |
| `candidate_placed@intime.com` | Wei Zhang | Placed | GC | $85/hr | 8 years | Currently working, open to offers |
| `candidate_h1b@intime.com` | Amit Singh | Active | H1B | $70/hr | 6 years | H1B visa, available in 2 weeks |
| `candidate_gc@intime.com` | Maria Gonzalez | Active | GC | $80/hr | 9 years | Green card holder, immediate |
| `candidate_usc@intime.com` | John Smith | Active | USC | $90/hr | 10 years | US Citizen, highly experienced |

---

### 🏢 Clients (4 users)

| Email | Name (Company) | Industry | Tier | Payment Terms | Markup | Use Case |
|-------|----------------|----------|------|---------------|--------|----------|
| `client@intime.com` | Robert Johnson (TechCorp) | Technology | Preferred | Net 30 | 25% | Standard client, regular hiring |
| `client_strategic@intime.com` | Linda Chen (HealthPlus) | Healthcare | Strategic | Net 45 | 30% | Long-term partnership, high volume |
| `client_exclusive@intime.com` | Thomas Anderson (FinanceHub) | Financial Services | Exclusive | Net 60 | 35% | Premium client, exclusive rates |
| `client_new@intime.com` | Sophie Turner (StartupCo) | Insurance Tech | Preferred | Net 30 | 22% | New client, startup company |

---

## Testing Scenarios

### Scenario 1: Student Journey
1. Login as `student@intime.com`
2. View course dashboard (Module 2, 45% complete)
3. Complete lessons and quizzes
4. Interact with AI Mentor (Guidewire Guru)
5. Track progress and earn badges

### Scenario 2: Recruiting Pod Workflow
1. Login as `sr_rec@intime.com` (Pod Lead)
2. View pod dashboard (Alice + Bob)
3. Review placement targets (3/month for Alice)
4. Assign candidate to `jr_rec@intime.com`
5. Track pod performance metrics

### Scenario 3: Candidate Placement Flow
1. Login as `candidate_bench@intime.com` (Raj - on bench)
2. Update profile and availability
3. Upload updated resume
4. Login as `sr_bs@intime.com` (Bench Sales)
5. Match Raj with client opportunity
6. Track placement through pipeline

### Scenario 4: Training Academy Management
1. Login as `trainer@intime.com`
2. View enrolled students (3 students)
3. Grade assignments and quizzes
4. Review student progress
5. Identify at-risk students
6. Award completion certificates

### Scenario 5: Client Portal
1. Login as `client_strategic@intime.com` (HealthPlus)
2. View active job requisitions
3. Review submitted candidates
4. Request interviews
5. View placement analytics

### Scenario 6: Executive Dashboard
1. Login as `ceo@intime.com` (Sumanth)
2. View business KPIs across 5 pillars
3. Review revenue analytics
4. Monitor pod performance (2 placements/sprint target)
5. Analyze cross-pollination opportunities

### Scenario 7: HR Operations
1. Login as `hr@intime.com` (Maria)
2. View all employees (18 internal users)
3. Manage performance reviews
4. Track employee metrics
5. Generate HR reports

---

## Role Hierarchy

```
Level 0: Super Admin, CEO, CFO
├─ Level 1: Admin, HR Manager
   ├─ Level 2: Trainer, Senior Recruiter, Senior Bench Sales, Senior TA
      ├─ Level 3: Student, Junior Recruiter, Junior Bench Sales, Junior TA, Employee
         └─ Level 4: Candidate, Client
```

---

## Access Patterns

### Admin (`admin@intime.com`)
- ✅ Full system access
- ✅ User management
- ✅ Role assignment
- ✅ System configuration
- ✅ All reports and analytics

### CEO (`ceo@intime.com`)
- ✅ All business data
- ✅ Strategic analytics
- ✅ Revenue reports
- ✅ Pod performance
- ✅ Cross-pillar insights
- ❌ Direct user management

### HR Manager (`hr@intime.com`)
- ✅ Employee data
- ✅ Performance reviews
- ✅ Hiring/termination
- ✅ Department analytics
- ❌ System configuration

### Senior Recruiter (`sr_rec@intime.com`)
- ✅ Pod management
- ✅ Candidate pipeline
- ✅ Client relationships
- ✅ Placement tracking
- ✅ Junior recruiter oversight
- ❌ Other pods' data (unless shared)

### Student (`student@intime.com`)
- ✅ Own course progress
- ✅ Learning materials
- ✅ AI Mentor access
- ✅ Certificates and badges
- ❌ Other students' data
- ❌ Course creation

### Candidate (`candidate@intime.com`)
- ✅ Own profile
- ✅ Resume uploads
- ✅ Interview schedules
- ✅ Placement status
- ❌ Other candidates' data
- ❌ Client information

### Client (`client@intime.com`)
- ✅ Job requisitions
- ✅ Submitted candidates
- ✅ Interview scheduling
- ✅ Placement analytics
- ❌ Candidate rates/margins
- ❌ Other clients' data

---

## Setup Instructions

### 1. Clean Existing Data
```bash
# Run cleanup script
psql $SUPABASE_DB_URL -f scripts/cleanup-test-users.sql
```

### 2. Seed Test Data
```bash
# Run comprehensive seed script
psql $SUPABASE_DB_URL -f scripts/seed-comprehensive-test-data.sql
```

### 3. Create Auth Users (Supabase Dashboard)
For each email above, create auth user with:
- Email: `[email from table]`
- Password: `TestPass123!`
- Email Verified: ✅ Yes

**OR** use the automated script:
```bash
# Coming soon: scripts/create-auth-users.ts
npm run seed:auth
```

---

## Notes

- All users belong to organization ID: `00000000-0000-0000-0000-000000000001`
- Soft deletes are enabled (`deleted_at` column)
- All timestamps use timezone-aware fields
- Phone numbers use US format: `+1-555-XXXX`
- Timezones vary by user location

---

## Support

For issues with test data:
1. Check `scripts/cleanup-test-users.sql` for cleanup
2. Review `scripts/seed-comprehensive-test-data.sql` for seed logic
3. Verify organization ID exists in `organizations` table
4. Ensure Supabase Auth users are created

---

**Remember:** Default password for all accounts is `TestPass123!`
