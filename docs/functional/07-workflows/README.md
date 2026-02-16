# InTime Workflow Documentation Index

Complete guide to how every role operates in the staffing platform - individually, as a team, and as a firm.

---

## Document Structure

For each role, we document:
- **What They Do** - Core responsibilities and objectives
- **How They Do It (Today)** - Current state, pain points, manual processes
- **How They Should Do It** - Ideal state with InTime automation
- **As an Individual** - Personal workflows and daily routines
- **As a Team** - Collaboration patterns and handoffs
- **As a Firm** - How their work contributes to company success

---

# TABLE OF CONTENTS

## PART 1: ADMINISTRATION & SYSTEM

### 1.1 System Administrator
- [1.1.1 User Management](#111-user-management)
  - Adding new employees
  - Role assignment and permissions
  - Removing access for departing employees
  - Managing API access
- [1.1.2 Organization Settings](#112-organization-settings)
  - Company configuration
  - Setting up teams/pods
  - Department hierarchy
  - Cost centers and budgets
- [1.1.3 Security & Compliance](#113-security--compliance)
  - Authentication settings (SSO, MFA)
  - Permission management
  - Security incident response
  - Audit logging and review
  - Compliance reporting (SOC2, GDPR)
- [1.1.4 Integrations](#114-integrations)
  - Connecting new integrations
  - Monitoring integration health
  - Email and calendar sync
  - Job board connections
  - HRIS/Payroll integrations
- [1.1.5 Data Management](#115-data-management)
  - Import/export operations
  - Data quality management
  - Duplicate detection and merge
  - Backup and recovery
- [1.1.6 Workflows & Automation](#116-workflows--automation)
  - Setting up automated workflows
  - Email templates and notifications
  - Activity patterns configuration
  - Business rules engine
- [1.1.7 System Health](#117-system-health)
  - Performance monitoring
  - Troubleshooting user issues
  - System updates and maintenance
  - Subscription and billing management

---

## PART 2: HUMAN RESOURCES

### 2.1 HR Administrator
- [2.1.1 Strategic HR Planning](#211-strategic-hr-planning)
  - Workforce planning
  - Headcount forecasting
  - Budget management
  - Policy development
- [2.1.2 Compliance & Legal](#212-compliance--legal)
  - Employment law compliance
  - Document retention
  - Audit preparation
  - Policy enforcement

### 2.2 HR Manager
- [2.2.1 Employee Lifecycle Management](#221-employee-lifecycle-management)
  - Pre-boarding new hires
  - Onboarding coordination
  - Status changes (promotions, transfers)
  - Offboarding and exit interviews
- [2.2.2 Performance Management](#222-performance-management)
  - Review cycle administration
  - Calibration facilitation
  - Performance improvement plans
  - Succession planning
- [2.2.3 Compensation Management](#223-compensation-management)
  - Salary band administration
  - Compensation reviews
  - Merit increase processing
  - Market analysis
- [2.2.4 Leave & Benefits](#224-leave--benefits)
  - Leave policy administration
  - Benefits enrollment management
  - Leave balance tracking
  - Policy exception handling

### 2.3 HR Coordinator
- [2.3.1 Daily Operations](#231-daily-operations)
  - Employee record maintenance
  - Document collection and filing
  - Inquiry handling
  - Report generation
- [2.3.2 Onboarding Execution](#232-onboarding-execution)
  - Task checklist management
  - New hire paperwork
  - System access coordination
  - First-day logistics
- [2.3.3 Employee Support](#233-employee-support)
  - Leave request processing
  - Policy questions
  - Personal information updates
  - Benefits questions routing

---

## PART 3: FINANCE & OPERATIONS

### 3.1 Finance Manager
- [3.1.1 Financial Planning](#311-financial-planning)
  - Budget management
  - Revenue forecasting
  - Cost analysis
  - Financial reporting
- [3.1.2 Accounts Receivable](#312-accounts-receivable)
  - Invoice generation
  - Payment tracking
  - Collections management
  - Client credit management
- [3.1.3 Accounts Payable](#313-accounts-payable)
  - Vendor payments
  - Contractor payments
  - Expense reimbursements
  - Payment reconciliation

### 3.2 Operations Coordinator
- [3.2.1 Timesheet Management](#321-timesheet-management)
  - Timesheet collection
  - Approval workflow management
  - Exception handling
  - Deadline enforcement
- [3.2.2 Payroll Processing](#322-payroll-processing)
  - Pay run creation
  - Rate verification
  - Special case handling (OT, bonuses)
  - Payroll submission
- [3.2.3 Invoicing Operations](#323-invoicing-operations)
  - Invoice generation from timesheets
  - Client billing schedules
  - Invoice delivery
  - AR aging management
- [3.2.4 Compliance Operations](#324-compliance-operations)
  - Document tracking
  - Certification monitoring
  - Expiration alerts
  - Audit support
- [3.2.5 Placement Operations](#325-placement-operations)
  - New placement onboarding
  - Assignment change processing
  - Extension management
  - Assignment end processing

---

## PART 4: RECRUITING & TALENT SUPPLY

### 4.1 Back Office Recruiter (Pool Builder)
- [4.1.1 Sourcing Strategy](#411-sourcing-strategy)
  - Pool coverage planning
  - Skill gap identification
  - Source channel selection
  - Dummy requirement creation
- [4.1.2 Candidate Sourcing](#412-candidate-sourcing)
  - Job board searching
  - LinkedIn prospecting
  - Referral solicitation
  - Database mining
- [4.1.3 Initial Engagement](#413-initial-engagement)
  - Outreach campaigns
  - Response handling
  - Initial screening calls
  - Interest qualification
- [4.1.4 Deep Qualification](#414-deep-qualification)
  - Work history deep dive
  - Project documentation
  - Skills assessment
  - Availability confirmation
  - Expectations alignment
- [4.1.5 Pool Maintenance](#415-pool-maintenance)
  - Profile enrichment
  - Freshness campaigns
  - Availability updates
  - Status management
- [4.1.6 Metrics & Reporting](#416-metrics--reporting)
  - Pool coverage reports
  - Source effectiveness
  - Quality metrics
  - Activity tracking

### 4.2 Front Office Recruiter (Job Filler)
- [4.2.1 Job Intake](#421-job-intake)
  - Receiving job requirements
  - Requirement clarification
  - Matching criteria definition
  - Priority assignment
- [4.2.2 Candidate Selection](#422-candidate-selection)
  - Pool matching
  - Shortlist creation
  - Availability confirmation
  - Interest confirmation
- [4.2.3 Submission Process](#423-submission-process)
  - Package preparation
  - Client presentation
  - Submission tracking
  - Follow-up cadence
- [4.2.4 Interview Coordination](#424-interview-coordination)
  - Scheduling interviews
  - Candidate preparation
  - Feedback collection
  - Status advancement
- [4.2.5 Offer Management](#425-offer-management)
  - Offer presentation
  - Negotiation handling
  - Counter-offer management
  - Acceptance confirmation
- [4.2.6 Placement Closure](#426-placement-closure)
  - Start date confirmation
  - Operations handoff
  - Documentation completion
  - Success celebration

### 4.3 Bench Sales Representative
- [4.3.1 Bench Inventory Management](#431-bench-inventory-management)
  - Consultant tracking
  - Availability monitoring
  - Skill profiling
  - Bench cost tracking
- [4.3.2 Marketing Campaigns](#432-marketing-campaigns)
  - Hotlist creation
  - Targeted outreach
  - Mass email campaigns
  - LinkedIn marketing
- [4.3.3 Lead Response](#433-lead-response)
  - Inquiry handling
  - Quick turnaround submissions
  - Rate negotiation
  - Interest qualification
- [4.3.4 Vendor Management](#434-vendor-management)
  - Vendor relationship building
  - Contract negotiation
  - Submission tracking
  - Payment terms management
- [4.3.5 Performance Metrics](#435-performance-metrics)
  - Bench utilization tracking
  - Days-on-bench analysis
  - Cost/revenue analysis
  - Placement tracking

---

## PART 5: SALES & ACCOUNT MANAGEMENT

### 5.1 Business Development Manager
- [5.1.1 Market Research](#511-market-research)
  - Target account identification
  - ICP development
  - Market analysis
  - Competitor intelligence
- [5.1.2 Prospecting](#512-prospecting)
  - Outbound campaigns
  - Cold calling
  - LinkedIn outreach
  - Event networking
- [5.1.3 Lead Qualification](#513-lead-qualification)
  - Discovery calls
  - Need assessment
  - Budget qualification
  - Decision-maker mapping
- [5.1.4 Proposal & Negotiation](#514-proposal--negotiation)
  - Proposal creation
  - Pricing strategy
  - Contract negotiation
  - MSA execution
- [5.1.5 Deal Closure](#515-deal-closure)
  - Final negotiations
  - Contract signing
  - Account handoff
  - Success documentation

### 5.2 Account Manager
- [5.2.1 Account Strategy](#521-account-strategy)
  - Account planning
  - Stakeholder mapping
  - Opportunity identification
  - Wallet share analysis
- [5.2.2 Relationship Management](#522-relationship-management)
  - Regular check-ins
  - Health monitoring
  - Issue escalation
  - Satisfaction tracking
- [5.2.3 Job Creation & Management](#523-job-creation--management)
  - Requirements gathering
  - Job posting
  - Candidate coordination
  - Fill process tracking
- [5.2.4 Issue Resolution](#524-issue-resolution)
  - Complaint handling
  - Problem investigation
  - Resolution execution
  - Prevention planning
- [5.2.5 Growth & Expansion](#525-growth--expansion)
  - Expansion opportunity identification
  - Cross-sell/up-sell
  - Contract renewals
  - Reference development
- [5.2.6 Account Health Monitoring](#526-account-health-monitoring)
  - Health score tracking
  - Risk identification
  - Proactive intervention
  - Success planning

### 5.3 Delivery Manager
- [5.3.1 Placement Success](#531-placement-success)
  - First-day coordination
  - First-week check-ins
  - Issue identification
  - Performance monitoring
- [5.3.2 Ongoing Support](#532-ongoing-support)
  - Regular consultant check-ins
  - Client satisfaction monitoring
  - Performance feedback relay
  - Issue resolution
- [5.3.3 Assignment Management](#533-assignment-management)
  - Extension negotiation
  - Rate adjustments
  - Scope changes
  - End-date management
- [5.3.4 Quality Assurance](#534-quality-assurance)
  - Performance tracking
  - Client feedback collection
  - Consultant coaching
  - Success metrics

---

## PART 6: ACADEMY & TRAINING

### 6.1 Academy Manager
- [6.1.1 Program Management](#611-program-management)
  - Curriculum development
  - Cohort planning
  - Instructor coordination
  - Resource allocation
- [6.1.2 Student Lifecycle](#612-student-lifecycle)
  - Enrollment management
  - Progress tracking
  - Intervention triggers
  - Graduation criteria
- [6.1.3 Quality & Outcomes](#613-quality--outcomes)
  - Curriculum effectiveness
  - Student satisfaction
  - Placement rates
  - Graduate success

### 6.2 Instructor
- [6.2.1 Teaching](#621-teaching)
  - Course delivery
  - Lab facilitation
  - Student assessment
  - Mentoring
- [6.2.2 Student Support](#622-student-support)
  - Office hours
  - Tutoring
  - Progress monitoring
  - Struggling student support

### 6.3 Academy Coordinator
- [6.3.1 Student Administration](#631-student-administration)
  - Enrollment processing
  - Attendance tracking
  - Schedule management
  - Documentation

### 6.4 Career Coach
- [6.4.1 Career Preparation](#641-career-preparation)
  - Resume development
  - Interview coaching
  - Placement readiness
  - Expectations alignment
- [6.4.2 Placement Support](#642-placement-support)
  - Job matching
  - Interview preparation
  - Offer guidance
  - Transition support

---

## PART 7: MANAGEMENT & LEADERSHIP

### 7.1 Team Manager (Pod Manager)
- [7.1.1 Team Performance](#711-team-performance)
  - KPI monitoring
  - Performance tracking
  - Trend analysis
  - Intervention triggers
- [7.1.2 People Development](#712-people-development)
  - 1:1 meetings
  - Coaching sessions
  - Skill development
  - Career pathing
- [7.1.3 Operations Management](#713-operations-management)
  - Workload balancing
  - Capacity planning
  - Process optimization
  - Tool effectiveness
- [7.1.4 Team Communication](#714-team-communication)
  - Team meetings
  - Status updates
  - Issue escalation
  - Celebration

### 7.2 Director/VP
- [7.2.1 Strategic Planning](#721-strategic-planning)
  - Goal setting
  - Resource allocation
  - Initiative prioritization
  - Change management
- [7.2.2 Cross-Functional Leadership](#722-cross-functional-leadership)
  - Department coordination
  - Process alignment
  - Conflict resolution
  - Initiative sponsorship
- [7.2.3 Performance Oversight](#723-performance-oversight)
  - Multi-team metrics
  - Trend analysis
  - Problem escalation
  - Success recognition

### 7.3 Executive
- [7.3.1 Business Health](#731-business-health)
  - Real-time P&L visibility
  - Revenue tracking
  - Margin analysis
  - Cash flow management
- [7.3.2 Strategic Decisions](#732-strategic-decisions)
  - Market positioning
  - Investment decisions
  - Growth planning
  - Risk management
- [7.3.3 Forecasting](#733-forecasting)
  - Revenue forecasting
  - Pipeline analysis
  - Scenario planning
  - Board reporting
- [7.3.4 Stakeholder Management](#734-stakeholder-management)
  - Board communication
  - Investor relations
  - Strategic partnerships
  - Industry positioning

---

## PART 8: CROSS-FUNCTIONAL WORKFLOWS

### 8.1 End-to-End Job Fulfillment
- [8.1.1 Job Creation to Placement](#811-job-creation-to-placement)
  - Account Manager → Job Creation
  - System → Matching
  - Front Office → Submission
  - Front Office → Interview
  - Front Office → Offer
  - Operations → Onboarding
  - Delivery → Success

### 8.2 Candidate Journey
- [8.2.1 Source to Placement](#821-source-to-placement)
  - Back Office → Sourcing
  - Back Office → Screening
  - Back Office → Qualification
  - Front Office → Submission
  - Front Office → Interview
  - Front Office → Offer
  - Operations → Start
  - Delivery → Success

### 8.3 Client Lifecycle
- [8.3.1 Prospect to Strategic Partner](#831-prospect-to-strategic-partner)
  - BD → Prospecting
  - BD → Qualification
  - BD → Closing
  - AM → Onboarding
  - AM → First Job
  - AM → First Placement
  - AM → Growth
  - AM → Strategic

### 8.4 Revenue Cycle
- [8.4.1 Placement to Payment](#841-placement-to-payment)
  - Operations → Timesheet Collection
  - Operations → Timesheet Approval
  - Operations → Payroll Processing
  - Operations → Invoice Generation
  - Finance → Invoice Delivery
  - Finance → Payment Collection
  - Finance → Reconciliation

### 8.5 Talent Supply Chain
- [8.5.1 Academy to Pool to Placement](#851-academy-to-pool-to-placement)
  - Academy → Enrollment
  - Academy → Training
  - Academy → Graduation
  - Recruiting → Pool Entry
  - Sales → Job Matching
  - Recruiting → Placement
  - Operations → Delivery

---

## PART 9: TEAM COLLABORATION PATTERNS

### 9.1 Supply Team Collaboration
- Back Office + Bench Sales coordination
- Pool builder + Job filler handoff
- Recruiter + Academy coordination

### 9.2 Demand Team Collaboration
- BD + Account Manager handoff
- Account Manager + Front Office coordination
- Account Manager + Delivery Manager partnership

### 9.3 Operations Collaboration
- HR + Operations coordination
- Finance + Operations alignment
- Compliance cross-functional support

### 9.4 Leadership Collaboration
- Team Manager + Team coordination
- Cross-department initiatives
- Executive alignment

---

## PART 10: FIRM-WIDE OPERATIONS

### 10.1 Daily Operations Rhythm
- Morning standups
- Pipeline reviews
- Issue escalations
- End-of-day reporting

### 10.2 Weekly Cadence
- Team meetings
- Pipeline reviews
- Client reviews
- Metrics reviews

### 10.3 Monthly Processes
- Business reviews
- Performance reviews
- Forecasting updates
- Process improvements

### 10.4 Quarterly Activities
- Strategic planning
- Goal setting
- Performance calibration
- Client business reviews

### 10.5 Annual Cycles
- Annual planning
- Compensation reviews
- Performance reviews
- Budget planning

---

## APPENDIX

### A. Role Matrix
- Role definitions
- Permission levels
- Reporting relationships
- Success metrics

### B. Entity Relationships
- Candidate lifecycle states
- Job lifecycle states
- Placement lifecycle states
- Account lifecycle states

### C. Metrics Dictionary
- Definition of all KPIs
- Calculation methods
- Target benchmarks
- Reporting frequency

### D. Glossary
- Industry terms
- System terminology
- Acronyms
- Abbreviations

---

## HOW TO USE THIS DOCUMENT

### For New Employees
1. Start with your role's section
2. Read "What They Do" to understand responsibilities
3. Read "How They Should Do It" for ideal workflows
4. Review team collaboration patterns
5. Understand firm-wide rhythms

### For Managers
1. Review all roles in your team
2. Understand handoff points
3. Identify improvement opportunities
4. Use metrics section for tracking

### For Process Improvement
1. Compare "Today" vs "Should" sections
2. Identify gaps
3. Prioritize improvements
4. Measure impact

---

## DOCUMENT MAINTENANCE

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | Feb 2026 | System | Initial index creation |

---

*This index will be expanded section by section. Each section will follow the standard format documenting what/how/should for individual/team/firm perspectives.*
