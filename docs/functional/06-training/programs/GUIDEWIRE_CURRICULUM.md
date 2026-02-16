# Guidewire Training Curriculum

## Program Overview

### Duration
- **Total Length**: 8-12 weeks (intensive full-time program)
- **Contact Hours**: 40-45 hours per week
- **Format**: Classroom-based + hands-on laboratory work

### Target Audience
- Java developers with 0-3 years professional experience
- Career changers with strong Java fundamentals
- Recent computer science graduates
- Candidates from InTime Academy's core Java prerequisite program

### Desired Outcome
Job-ready Guidewire insurance consultants capable of:
- Contributing independently to PolicyCenter, ClaimCenter, and BillingCenter implementations
- Writing and maintaining GOSU code and custom business logic
- Configuring standard Guidewire products and rules engines
- Understanding enterprise insurance workflows
- Passing Guidewire ACE (Advanced Cloud Enablement) certification

### Prerequisites
Candidates must demonstrate proficiency in:
- **Core Java**: Classes, objects, inheritance, polymorphism, interfaces, collections, exception handling
- **SQL Basics**: SELECT, INSERT, UPDATE, DELETE, JOINs, basic data modeling
- **Object-Oriented Programming (OOP)**: Design principles, patterns, SOLID concepts
- **Command-line Proficiency**: Comfort with terminal/command prompt navigation

### Program Goals
1. **Insurance Domain Knowledge**: Deep understanding of P&C insurance lifecycle and business models
2. **Guidewire Platform Mastery**: Architecture, components, and best practices across all InsuranceSuite modules
3. **Hands-on Development**: Build real-world implementations in laboratory environment
4. **Certification Ready**: Prepare for Guidewire ACE examinations
5. **Market Ready**: Develop interview skills and prepare for client interactions

---

## Week 1-2: Guidewire Fundamentals

### Week 1 Overview

#### Topic: Insurance Industry Basics

**Day 1: Insurance Fundamentals**
- Property & Casualty (P&C) insurance overview
- Types of insurance (auto, home, commercial, specialty)
- Key insurance terminology: premium, deductible, coverage, limits, exclusions
- Insurance distribution channels (direct, agents, brokers, digital)
- Typical insurance organization structure (underwriting, claims, billing, operations)

**Day 2: P&C Policy Lifecycle**
- Submission: Initial inquiry and quote request
- Quoting: Risk assessment and premium calculation
- Binding: Policy becomes effective
- Issuance: Policy documents delivered to customer
- Renewal: Annual or periodic review and update
- Endorsement: Mid-term policy modifications
- Cancellation: Policy termination and settlement

**Day 3: P&C Claims Lifecycle**
- First Notice of Loss (FNOL): Initial claim reporting
- Investigation: Fact-gathering and documentation
- Evaluation: Assessment of liability and damages
- Settlement: Negotiation and agreement
- Payment: Funds disbursement to claimant
- Closure: Case resolution and archival
- Subrogation/Recovery: Pursuing third-party reimbursement

**Day 4: Billing & Collections Process**
- Invoice generation based on policy terms
- Payment schedules and installment plans
- Collection processes for delinquent accounts
- Payment reconciliation
- Commissions and producer payments
- Refunds and adjustments

**Day 5: Review & Assessment**
- Insurance domain quiz
- Group discussion: Real-world insurance scenarios
- Case study analysis: Sample policy, claim, billing scenario

#### Topic: Guidewire Platform Architecture

**Day 1: Guidewire Company & Ecosystem**
- Guidewire Software history and market position
- Guidewire Cloud Platform (GWCP) introduction
- Guidewire solutions: InsuranceSuite, BrightPolicyAPI, Underwriting Management
- Customers and use cases
- Guidewire partner ecosystem
- Career pathways in Guidewire

**Day 2: InsuranceSuite Components**
- PolicyCenter: Policy administration and underwriting
- ClaimCenter: Claims management and reserving
- BillingCenter: Billing and collections
- Guidewire Cloud (GWCP) as deployment platform
- Integration between modules
- Third-party integrations and APIs

**Day 3: Guidewire Cloud Platform (GWCP)**
- Cloud vs. on-premise architecture comparison
- GWCP regional deployments
- Scalability and high availability
- Security model and compliance (ISO, SOC2)
- Monitoring and support capabilities
- Cost model and billing

**Day 4: Development Tools & Environment**
- Guidewire Studio: IDE overview and features
- Code editor, debugging, deployment capabilities
- Guidewire Plugin Architecture
- Version control integration
- Local development environment setup
- Cloud development vs. local development trade-offs

**Day 5: Platform Architecture Deep Dive**
- Multi-tenant architecture
- Domain object model and entity relationships
- Rule engine and business rules framework
- Workflow engine and process modeling
- Event framework and messaging
- Caching and performance considerations
- Data model and database schema

#### Lab Exercises

**Lab 1.1: Development Environment Setup**
- Install Guidewire Studio
- Connect to provided sandbox environment
- Create first Guidewire project
- Deploy "Hello World" application
- Navigate Studio IDE and explore sample code

**Lab 1.2: Insurance Domain Simulation**
- Use insurance domain simulator tool
- Walk through policy creation workflow
- Process sample claim
- Review billing transactions
- Understand data flow across modules

### Week 2 Overview

#### Topic: GOSU Language Fundamentals

**Day 1: GOSU Syntax & Types**
- GOSU language overview: syntax, philosophy, use cases
- Variables and primitive types (int, long, double, boolean, String)
- Type inference and implicit typing
- Object types and reference semantics
- Collections: Lists, Sets, Maps, arrays
- String operations and interpolation

**Day 2: Control Flow & Functions**
- Conditional statements: if/else, ternary operators
- Loops: for, foreach, while, do-while
- Switch statements and pattern matching
- Functions and method definitions
- Parameters, return types, overloading
- Scope and variable lifetime
- Closures and anonymous functions

**Day 3: Object-Oriented GOSU**
- Classes and inheritance
- Abstract classes and interfaces
- Properties and access modifiers
- Constructors and initialization
- Static members and methods
- Inner classes and nested types
- Method overriding and polymorphism

**Day 4: GOSU Advanced Features**
- Generics and type parameters
- Enums and enumeration types
- Annotations and metadata
- Exception handling in GOSU
- Java interoperability (calling Java from GOSU)
- Guidewire-specific GOSU extensions

**Day 5: GOSU Best Practices**
- Coding standards and style guide
- Performance optimization techniques
- Common pitfalls and anti-patterns
- Error handling and logging
- Unit testing GOSU code
- Code review checklist

#### Lab Exercises

**Lab 2.1: GOSU Fundamentals**
- Create GOSU classes with inheritance hierarchy
- Implement interfaces and abstract classes
- Practice control flow: conditionals, loops, functions
- Manipulate collections (list operations, iteration, filtering)
- Use string operations and formatting

**Lab 2.2: GOSU with Guidewire Objects**
- Create GOSU class that extends Guidewire entity
- Access entity properties and relationships
- Write simple business rules in GOSU
- Call Java methods from Guidewire libraries
- Handle exceptions and log errors

**Lab 2.3: Entity Manipulation in Studio**
- Open existing Guidewire entities in Studio
- Create new entity instances programmatically
- Modify entity properties and persist changes
- Query entities using Guidewire's query API
- Understand entity lifecycle and relationships

---

## Week 3-4: PolicyCenter Deep Dive

### Week 3 Overview

#### Topic: Policy Lifecycle & Administration

**Day 1: Submission & Quoting**
- Quote request intake and validation
- Risk assessment workflow
- Coverage selection and customization
- Premium calculation (base rates, factors, modifiers)
- Quote generation and delivery
- Multi-quote comparisons
- Quote expiration and rollover rules

**Day 2: Underwriting & Binding**
- Underwriting rules and decision logic
- Manual underwriting workflows for complex risks
- Approval hierarchies and exception handling
- Binding process: what legally constitutes binding
- Binding effective date and retroactive coverage considerations
- Binding authority configuration
- Decline processing and documentation

**Day 3: Policy Issuance & Renewal**
- Policy document generation
- Issuance workflow and notifications
- Policy statement and declarations page
- Renewal processes: automated, manual, agent-assisted
- Renewal underwriting requirements
- Non-renewal processing and communication
- Rate changes and customer notification

**Day 4: Endorsements & Modifications**
- Types of endorsements (address change, coverage change, premium adjustment, etc.)
- Endorsement workflow and approval
- Effective dating for endorsements
- Document generation for endorsements
- Retroactive and prospective endorsement handling
- Cancellation processing and state regulations

**Day 5: Advanced Policy Scenarios**
- Multi-policy household management
- Policy bundling and discounts
- Special programs and promotional rates
- State-specific regulatory compliance in policies
- Policy anniversary and lifecycle events
- Policy search and historical lookup

#### Topic: Product Model Configuration

**Day 1: Product Architecture**
- Product definition and structure
- Lines of Business (LOBs) and coverage types
- Coverages, limits, deductibles, and options
- Coverage relationships and dependencies
- Modifiers and rating factors
- Product hierarchy and inheritance

**Day 2: Rate Tables & Algorithms**
- Rating file creation and maintenance
- Rate table structures (character-based, lookup-based)
- Rating algorithms and formulas
- Base rate, factor, and modifier application
- Rate effective dating
- Rate jurisdiction and state-specific rates
- Rate testing and validation

**Day 3: Rules Engine & Business Rules**
- Rule engine overview and architecture
- Rule conditions and rule trees
- Rule actions and consequences
- Rule priority and conflict resolution
- Rule testing and debugging
- Rule versioning and change management
- Pre-defined rule types in PolicyCenter

**Day 4: Configuration via Guidewire Studio**
- Product designer workflow
- Coverage hierarchy configuration
- Rate table setup and maintenance
- Rule configuration in ProductBuilder
- Testing product configurations
- Deployment and rollback procedures

**Day 5: Complex Scenarios**
- Multi-state products and compliance
- Renewal rules and rate changes
- Promotional products and limited-time offerings
- Product versioning and deprecation
- Integration with external rating systems

#### Lab Exercises

**Lab 3.1: Product Configuration**
- Create new personal auto product in sandbox
- Define coverages: Liability, Collision, Comprehensive, Uninsured Motorist
- Set coverage limits, deductibles, and optional add-ons
- Configure coverage dependencies (e.g., Collision requires Comprehensive)
- Test coverage selection workflow

**Lab 3.2: Rating Configuration**
- Create rating file for personal auto (simplified)
- Define rating factors: Age, Driving record, Territory, Vehicle type, Usage
- Create lookup tables for territory and vehicle classifications
- Write simple rating algorithm
- Test rating with sample data

**Lab 3.3: End-to-End Quote & Bind**
- Create quote in PolicyCenter using configured product
- Walk through quote workflow with various coverage selections
- Bind policy and generate policy documents
- Create mid-term endorsement changing coverage
- Review policy anniversary and renewal process

### Week 4 Overview

#### Topic: Advanced PolicyCenter Concepts

**Day 1: Policy Transactions & Billing Integration**
- Policy transaction types and lifecycle
- Billing integration from PolicyCenter
- Premium calculation and billing amount determination
- Installment setup and payment schedule generation
- Fee assessment (policy fees, lapse fees, etc.)
- Adjustments and credit memos

**Day 2: Regulatory Compliance & State Laws**
- State insurance filing requirements
- Rate approval processes by jurisdiction
- Mandatory coverage requirements by state
- Rate filing documentation
- Compliance testing and validation
- Audit trails for regulatory reviews

**Day 3: Multi-Policy Features**
- Household/account management
- Policy linking and dependencies
- Cross-policy rating adjustments
- Account-level communication and billing
- Multi-policy reporting and analytics

**Day 4: Integration & APIs**
- Web services and REST APIs
- Third-party integrations (insurance exchanges, agencies)
- Data exchange formats (XML, JSON)
- Event-based integration architecture
- Real-time vs. batch integration scenarios

**Day 5: PolicyCenter Performance & Optimization**
- Performance monitoring and tuning
- Database query optimization
- Caching strategies in PolicyCenter
- Load testing for production readiness
- Troubleshooting common performance issues

#### Lab Exercises

**Lab 4.1: Complex Product Scenarios**
- Configure multi-coverage product with complex dependencies
- Implement business rule: "If Comprehensive > $500 deductible, Collision deductible must be > $250"
- Test all valid and invalid combinations
- Generate rating documents
- Perform stress testing with large datasets

**Lab 4.2: Regulatory & Compliance Scenario**
- Build California-specific auto product with mandatory coverages
- Configure state-specific rate filing requirements
- Generate rate filing documentation
- Create audit trail showing compliance checks
- Document state law requirements in product configuration

**Lab 4.3: Capstone Project Part 1: Policy Module**
- Design simplified property insurance product
- Implement coverage structure and rating
- Create quote-to-bind workflow
- Generate policy documents
- Write documentation of product design decisions

---

## Week 5-6: ClaimCenter Deep Dive

### Week 5 Overview

#### Topic: Claims Lifecycle & Processing

**Day 1: First Notice of Loss (FNOL)**
- FNOL intake channels: phone, online, mobile, chat
- Claim information capture and validation
- Immediate triage and routing rules
- Loss type categorization
- Preliminary reserve setting
- Communications and acknowledgment to insured

**Day 2: Claims Investigation**
- Assignment to adjusters/investigators
- Investigation workflow and task management
- Document collection and management
- Photo and evidence documentation
- Witness and third-party interviews
- Fraud detection and special investigations
- Investigation timeline and milestones

**Day 3: Claims Evaluation & Liability**
- Coverage verification and policy review
- Liability assessment: comparative negligence, statute of limitations
- Damages evaluation: property damage, bodily injury, lost wages
- Pre-existing condition considerations
- Expert opinions and appraisals
- Deductible and limit application
- Reserve adequacy and adjustment

**Day 4: Settlement & Negotiation**
- Demand letters and settlement negotiations
- Mediation and arbitration processes
- Structured settlements vs. lump-sum
- Settlement documentation and releases
- Statutory settlement requirements by state
- Tax implications of settlements

**Day 5: Claims Payments & Closure**
- Claim payment processing and scheduling
- Multiple payee scenarios and coordination of benefits
- Subrogation and recovery procedures
- Salvage and recycling processes
- Final reserve adjustment and claim closure
- Claims archival and retention

#### Topic: Claim Segmentation & Assignment

**Day 1: Claim Classification**
- Claim types: auto, property, casualty, workers' comp, specialty
- Severity classification: minor, moderate, major, catastrophe
- Fraud indicators and risk flags
- Volume predictors and surging events
- Special claims (high-value, complex, litigation)

**Day 2: Routing & Assignment Rules**
- Assignment algorithms and rule-based routing
- Workload balancing across teams
- Specialist assignment by claim type
- Adjuster capacity and availability
- Geographic and territorial assignment
- SLA-based routing priority

**Day 3: Workflow Management**
- Task creation and assignment
- Activity types: calls, visits, inspections, medical exams
- Due dates and deadline management
- Workflow automation and triggers
- Escalation procedures for delays
- Task metrics and performance tracking

**Day 4: Team Structures & Management**
- Adjuster roles: general, auto, property, medical
- Specialist roles: fraud investigator, appraiser, medical reviewer
- Supervisor and management oversight
- Quality assurance and file review processes
- Training and skill development tracking

**Day 5: Performance Metrics**
- Claims handling cycle time
- Cost containment metrics
- Customer satisfaction scores
- Quality audit results
- Adjuster productivity and efficiency
- Loss ratio and profitability analysis

#### Lab Exercises

**Lab 5.1: FNOL Workflow**
- Create new claim in ClaimCenter FNOL module
- Capture insured and loss information
- Set initial reserve amount
- Route claim based on loss type and severity
- Generate acknowledgment letter to insured

**Lab 5.2: Claims Investigation Setup**
- Assign claim to adjuster
- Create investigation tasks (site visit, document collection, etc.)
- Set task due dates and priorities
- Attach documents and evidence to claim
- Update investigation status and findings
- Generate investigation status report

**Lab 5.3: Claims Rules & Automation**
- Create routing rule: "Auto claims with loss > $10K to Senior Adjusters"
- Create fraud detection rule: "Multiple claims same insured within 30 days"
- Configure automatic reserve adjustment based on claim characteristics
- Set up escalation workflow for overdue tasks
- Test rules with sample claims

### Week 6 Overview

#### Topic: Reserves & Claim Financials

**Day 1: Reserve Concepts**
- Reserve definition and purpose
- Reserve adequacy and actuarial analysis
- Reserve categories: case reserves, bulk reserves, IBNR (Incurred But Not Reported)
- Reserve by claim type and loss type
- Reserve timing: when to establish, adjust, release
- Reserve impacts on financial reporting

**Day 2: Reserve Setting & Management**
- Initial reserve methodology
- Reserve adequacy guidelines by claim type
- Frequency and timing of reserve reviews
- Reserve adjustment triggers
- Inflation considerations in reserves
- Known loss reserve strategies

**Day 3: Financial Management**
- Claim payments and expense tracking
- Salvage and subrogation recovery
- Medical and vocational rehabilitation costs
- Expert fees and litigation costs
- Defense attorney costs
- Deductible and limit accounting
- Indemnity vs. expense tracking

**Day 4: Analytics & Reporting**
- Loss triangle development and trending
- Claim frequency and severity analysis
- Average cost per claim analysis
- Benchmark comparisons by claim type
- Reserve adequacy testing
- Financial impact on profitability

**Day 5: Regulatory Requirements**
- Reserve reporting to regulators (NAIC, state insurance commissioners)
- Audit requirements and examination
- Financial reporting standards (GAAP)
- Statutory accounting principles (SAP)
- Quarterly and annual filing requirements

#### Topic: Activities & Workflows

**Day 1: Activity Management**
- Activity types: calls, emails, appointments, visits, inspections
- Activity scheduling and calendar integration
- Activity notes and documentation
- Follow-up activities and reminders
- Activity history and audit trail

**Day 2: Workflow Design & Automation**
- Workflow diagram and orchestration
- Workflow states and transitions
- Automated workflow triggers and conditions
- Manual approval steps and gating
- Workflow versioning and change management
- Workflow testing and validation

**Day 3: Escalation & Alert Management**
- Escalation rules and severity levels
- Alert conditions and thresholds
- Manager notification and review
- SLA monitoring and breach alerts
- Prioritization of escalated items
- Communication protocols for escalations

**Day 4: Integration with Other Systems**
- Claims data synchronization with accounting
- Reserve data to general ledger
- Claims to billing for deductible adjustments
- Claims to policy system for coverage validation
- Third-party system integrations (medical, legal)

**Day 5: Workflow Optimization**
- Bottleneck analysis and improvement opportunities
- Automation expansion to reduce manual work
- Efficiency metrics and KPI tracking
- Staff training on workflow procedures
- Continuous improvement and feedback loops

#### Lab Exercises

**Lab 6.1: Claim Financial Tracking**
- Create property damage claim with initial reserve
- Record claim payments: repair estimates, payments, adjustments
- Add salvage recovery and subrogation recovery
- Calculate final claim cost and reserve adequacy
- Generate financial summary report

**Lab 6.2: Activity & Task Management**
- Create set of activities for complex claim: adjuster phone call, site visit, medical exam
- Set due dates and dependencies (e.g., medical exam after site visit)
- Assign to specific users
- Update activity status and add notes
- Generate activity timeline and status dashboard

**Lab 6.3: Capstone Project Part 2: Claims Module**
- Design claims handling workflow for property insurance
- Create routing rules for claim assignment
- Set up reserve methodology by claim severity
- Implement workflow automation for common scenarios
- Build dashboard showing key claims metrics
- Document workflow design and business rules

---

## Week 7-8: BillingCenter Deep Dive

### Week 7 Overview

#### Topic: Billing Lifecycle & Operations

**Day 1: Invoicing & Payment Schedules**
- Invoice generation triggers (policy issuance, renewal, endorsement)
- Invoice formats and regulatory requirements
- Payment plan options: full pay, monthly installments, quarterly, annual
- Payment schedule calculation and adjustment
- Due dates and grace periods by state
- Installment fee assessment

**Day 2: Payment Processing**
- Payment channels: check, ACH, credit card, electronic funds transfer
- Payment application and posting
- Overpayment and credit handling
- Payment disputes and reversals
- Payment plan modifications
- Auto-pay enrollment and management

**Day 3: Delinquency & Collections**
- Delinquency rules and policies by state
- Collection notices and escalation procedures
- Third-party collections agency management
- Legal collection procedures
- Payment arrangements for delinquent accounts
- Account suspension and reinstatement

**Day 4: Billing Accounts & Consolidation**
- Multi-policy account consolidation
- Household billing
- Agency account management
- Account-level discounts and adjustments
- Statement generation and delivery
- Account analysis and aged receivables

**Day 5: Refunds & Adjustments**
- Premium refund scenarios (cancellation, correction, overpayment)
- Refund calculation with proration
- Endorsement premium adjustments
- Credit memo processing
- Refund payment methods and timing
- Refund reporting and reconciliation

#### Topic: Payment Plans & Installment Management

**Day 1: Payment Plan Design**
- Industry standard payment plans (full pay, monthly, quarterly, semi-annual)
- Installment amount calculation
- Finance charge and interest calculation
- Payment plan disclosure requirements (TRID, APR disclosure)
- Default payment plan rules
- Payment plan variations by state

**Day 2: Installment Billing Mechanics**
- Installment invoice generation
- Due date calculation for each installment
- Tracking paid, pending, and missed installments
- Partial payments and credits
- Installment plan changes mid-term
- Payment application priority rules

**Day 3: Payment Plan Consolidation**
- Combining multiple payment plans into single account
- Balance rollover and adjustment
- Due date alignment across policies
- Payment plan adjustments after consolidation
- Account statement generation
- Communication to customer about consolidation

**Day 4: Cancellation & Refund on Payment Plans**
- Unearned premium calculation (pro-rata vs. short-rate)
- Refund reduction for outstanding installments
- Earned vs. unearned premium split
- Tax and fee handling in refunds
- Refund application to future policies or payment to insured

**Day 5: Advanced Payment Plan Scenarios**
- Endorsement impact on payment plan
- Policy renewal and payment plan continuation
- Down payment calculations
- Special plans for low-credit customers
- Government-affiliated payment plans

#### Lab Exercises

**Lab 7.1: Payment Plan Configuration**
- Create insurance policy and select monthly installment payment plan
- Generate invoices for all 12 monthly installments
- Apply sample payments to installments
- Handle partial payment and credit application
- Generate account statement showing payment plan status

**Lab 7.2: Delinquency & Collections Workflow**
- Create delinquent account (missed 2 payments)
- Trigger collection notice generation
- Record customer contact and payment arrangement
- Process partial payment on delinquent account
- Update payment plan after arrangement
- Clear delinquency status

**Lab 7.3: Billing Adjustments & Refunds**
- Process mid-term endorsement with premium change
- Adjust payment plan for new premium
- Cancel policy and calculate refund
- Apply unearned premium calculation
- Process refund payment
- Generate refund documentation

### Week 8 Overview

#### Topic: Commission Processing & Payables

**Day 1: Commission Structures**
- Producer commission types: percentage of premium, tiered, flat fee
- Commission calculation based on policy class and LOB
- Override commissions for special programs
- Commission frequency: monthly, quarterly, annual
- Commission accrual and payment timing
- Commission recovery on cancellation/refund

**Day 2: Payable Management**
- Payable generation and approval workflows
- Batch processing for monthly/quarterly payables
- Exception handling and manual adjustments
- Hold and release procedures (fraud investigation, disputes)
- Tax withholding and reporting (1099, W-2)
- Payable reconciliation with accounting

**Day 3: Dispute Resolution**
- Commission disputes and adjustments
- Chargeback procedures
- Appeal processes for denied commissions
- Documentation and audit trails
- Remediation procedures
- Communication with producers

**Day 4: Performance Analytics**
- Producer performance metrics
- Production volume and premium by producer
- Commission expense as percentage of premium
- Profitability by producer and book
- Comparison to market benchmarks
- Incentive program effectiveness

**Day 5: Regulatory & Tax Compliance**
- Producer licensing and appointment records
- Commission disclosure requirements
- 1099 reporting thresholds and procedures
- State-specific commission rules
- Anti-kickback regulations
- Commission audit trails for compliance

#### Topic: Disbursements & Cash Management

**Day 1: Disbursement Types**
- Check printing and delivery
- ACH and wire transfer processing
- Credit card refund processing
- Third-party settlement disbursements (subrogation, medical)
- Tax deposit management
- Vendor payment processing

**Day 2: Cash Flow Management**
- Cash position monitoring
- Float management and bank reconciliation
- Payment timing optimization
- Escrow account management
- Reserve fund management
- Treasury operations

**Day 3: Accounting Integration**
- BillingCenter to General Ledger reconciliation
- Revenue recognition timing
- Liability accounts for unearned premium
- Receivables aging and allowance for doubtful accounts
- Commission expense accrual
- Tax accrual management

**Day 4: Audit & Reconciliation**
- Monthly billing reconciliation procedures
- Bank statement reconciliation
- Exception handling and research
- Audit trail and change tracking
- Financial statement presentation
- External audit procedures

**Day 5: Technology & Automation**
- ACH automation and batch processing
- Check printing on-demand
- Electronic payment notifications
- Bank connectivity and real-time balance
- Fraud detection in payments
- Integration with accounting software

#### Lab Exercises

**Lab 8.1: Commission Processing**
- Set up producer commission rates by LOB
- Create policy and calculate producer commission
- Generate monthly commission payable report
- Adjust commission for policy cancellation
- Generate 1099 report for producers
- Reconcile commissions to accounting

**Lab 8.2: Billing & Revenue Reconciliation**
- Generate monthly billing summary
- Reconcile billed premiums to policy administration
- Identify and investigate exceptions
- Track uncollected receivables
- Reconcile to accounting system
- Generate aging report for collections follow-up

**Lab 8.3: Capstone Project Part 3: Billing Module**
- Design billing configuration for property insurance product
- Create payment plan options (full pay, monthly)
- Set up producer commission structure
- Process complete policy lifecycle: quote → bind → bill → collect payment
- Generate financial reports and reconciliation
- Document billing workflow and configuration

---

## Week 9-10: Integration & Advanced Topics

### Week 9 Overview

#### Topic: Guidewire Cloud Platform (GWCP) Architecture

**Day 1: Cloud Deployment Models**
- Guidewire Cloud Platform (GWCP) vs. on-premise
- Multi-tenant architecture and isolation
- Regional deployment and data residency
- Disaster recovery and business continuity
- Scalability and auto-scaling capabilities
- Cost models and usage-based pricing

**Day 2: Security in GWCP**
- Identity and access management (IAM)
- Network security and encryption
- Data encryption at rest and in transit
- Audit logging and compliance
- Penetration testing and security scanning
- Compliance certifications (ISO 27001, SOC 2, HIPAA)

**Day 3: Performance & Monitoring**
- Application performance monitoring (APM)
- Database performance tuning in cloud
- Real-time dashboards and alerting
- Log aggregation and analysis
- Capacity planning and resource optimization
- Cost optimization strategies

**Day 4: API & Integration Architecture**
- GWCP API overview and capabilities
- REST API design and standards
- Authentication and authorization
- Rate limiting and quotas
- Versioning and backward compatibility
- Documentation and developer portal

**Day 5: Migration to Cloud**
- Migration planning and strategy
- Data migration procedures
- Testing and validation approach
- Cutover planning and rollback procedures
- Post-migration optimization
- Support and troubleshooting

#### Topic: REST APIs & Integration Framework

**Day 1: RESTful API Design**
- REST principles and constraints
- HTTP methods (GET, POST, PUT, DELETE, PATCH)
- URL design and resource naming
- Request and response formats (JSON, XML)
- Status codes and error handling
- Pagination and filtering

**Day 2: Guidewire Cloud API (GWAPI)**
- GWAPI capabilities and use cases
- Available endpoints for PolicyCenter, ClaimCenter, BillingCenter
- Query and filtering capabilities
- Mutation operations (create, update, delete)
- Batch operations
- Error responses and retry strategies

**Day 3: Authentication & Authorization**
- OAuth 2.0 authentication flow
- API key management
- Token generation and expiration
- Scope-based authorization
- Rate limiting and quota enforcement
- Audit logging of API access

**Day 4: Integration Patterns**
- Synchronous API calls
- Asynchronous messaging and events
- Webhooks and push notifications
- File-based integration (batch exports/imports)
- Change data capture (CDC) patterns
- Request/response transformation

**Day 5: API Security & Best Practices**
- API security vulnerabilities (injection, DoS, authentication bypass)
- Input validation and sanitization
- Rate limiting and throttling
- CORS and cross-origin requests
- API versioning strategies
- Monitoring and alerting for API issues

#### Lab Exercises

**Lab 9.1: Cloud Platform Navigation**
- Access Guidewire Cloud sandbox environment
- Navigate Cloud UI and understand topology
- Review monitoring and alerting dashboards
- Check capacity and resource utilization
- Review audit logs for user actions
- Understand data residency and backup strategy

**Lab 9.2: REST API Exploration**
- Authenticate to Guidewire Cloud API
- Execute GET request to retrieve policy data
- Execute POST request to create new claim
- Execute PUT request to update policy
- Handle error responses and retries
- Build simple API client application (Python or JavaScript)

**Lab 9.3: Integration Scenario**
- Design integration: External system needs to create claims in Guidewire
- Plan API approach vs. messaging approach
- Create mock API integration using sample data
- Handle error scenarios and edge cases
- Document API contract and integration points
- Test end-to-end integration flow

### Week 10 Overview

#### Topic: Cloud API Development

**Day 1: Custom API Development**
- When to build custom APIs
- API design considerations for Guidewire
- Extending GWAPI with custom endpoints
- Building facade APIs for complex operations
- Pagination and data export APIs
- Reporting and analytics APIs

**Day 2: Advanced API Features**
- API versioning and deprecation
- Filtering and complex queries
- Sorting and ordering
- Conditional requests (ETags, If-Modified-Since)
- API documentation (OpenAPI/Swagger)
- SDK generation and client libraries

**Day 3: Performance & Optimization**
- Query optimization and indexing
- Response caching strategies
- Asynchronous processing for long operations
- Batch API operations
- Connection pooling and resource management
- Performance benchmarking

**Day 4: Error Handling & Resilience**
- Error code standards and definitions
- Retry strategies and exponential backoff
- Circuit breaker pattern
- Graceful degradation
- Request timeout handling
- Comprehensive logging for debugging

**Day 5: API Testing & Deployment**
- Unit testing for API endpoints
- Integration testing with dependent services
- Load testing and stress testing
- API mocking for testing
- Deployment pipelines and CI/CD
- Blue-green deployment strategies

#### Topic: Messaging, Events, & Plugin Development

**Day 1: Event-Driven Architecture**
- Event types: policy events, claim events, billing events
- Event publishing and subscription
- Event ordering and processing guarantees
- Dead letter queue handling
- Event schema design
- Event versioning and evolution

**Day 2: Messaging Integration**
- Message queues: Kafka, RabbitMQ, AWS SQS
- Message format and serialization (JSON, Avro, Protobuf)
- Consumer groups and partitioning
- Message ordering and processing order
- Message retention and replay
- Monitoring message pipeline

**Day 3: Plugin Architecture**
- Guidewire plugin framework overview
- Plugin types: condition, action, utility
- Plugin development lifecycle
- Plugin packaging and deployment
- Plugin debugging and testing
- Plugin versioning and compatibility

**Day 4: Building Custom Plugins**
- Setting up plugin development environment
- Creating custom rule condition plugin
- Creating custom rule action plugin
- Accessing Guidewire entity data from plugin
- Calling external services from plugin
- Exception handling and logging in plugins

**Day 5: Advanced Integration Patterns**
- Event streaming for real-time analytics
- Change data capture (CDC) for synchronization
- Service mesh and microservices considerations
- API gateway patterns
- Data lake and warehouse integration
- Real-time vs. batch processing trade-offs

#### Lab Exercises

**Lab 10.1: Cloud API Development**
- Create simple REST API endpoint for policy lookup
- Implement filtering and pagination
- Add proper error handling and status codes
- Write unit tests for API endpoint
- Deploy to Guidewire Cloud sandbox
- Test endpoint with sample requests

**Lab 10.2: Event-Driven Integration**
- Subscribe to policy creation event
- Create event handler that logs policy data
- Implement handler that creates follow-up task on claim creation
- Test event publication and consumption
- Monitor event processing and latency
- Handle event processing failures

**Lab 10.3: Plugin Development**
- Create custom rule condition: "Auto claim with airbag deployment"
- Create custom rule action: "Set claim priority to high if loss > $50K"
- Test plugin with sample claims
- Debug plugin execution and check logs
- Package plugin for deployment
- Document plugin functionality and usage

#### Batch Processing

**Day 1: Batch Processing Concepts**
- Batch vs. real-time processing
- Batch windows and scheduling
- Data validation and staging
- Error handling in batch jobs
- Restart and recovery procedures
- Performance optimization for large data volumes

**Day 2: Batch Job Implementation**
- Job scheduling frameworks (Quartz, Spring Batch)
- Reading data from multiple sources
- Data transformation and aggregation
- Writing output and error reporting
- Progress tracking and monitoring
- Logging and audit trail

**Day 3: Guidewire Batch Processing**
- PolicyCenter batch operations (renewal, lapse, archive)
- ClaimCenter batch operations (reserve adjustment, collection)
- BillingCenter batch operations (invoice generation, payment posting)
- Scheduling batch jobs in Guidewire
- Monitoring and troubleshooting batch jobs
- Performance tuning for batch operations

**Day 4: Batch Job Examples**
- Premium audit batch: recalculate premiums based on new rates
- Renewal batch: auto-generate renewals for expiring policies
- Collections batch: generate delinquency notices
- Commission batch: calculate and generate commission payables
- Reporting batch: generate daily/weekly/monthly reports

**Day 5: Advanced Batch Topics**
- Parallel batch processing
- Distributed batch processing
- Incremental batch processing (delta loads)
- Batch to real-time hybrid approaches
- Testing batch jobs at scale
- Batch job monitoring and alerting

---

## Week 11-12: Project & Certification Prep

### Week 11 Overview

#### Capstone Project: End-to-End Implementation

**Project Overview**
- Scenario: Design and implement simplified insurance system for commercial property insurance
- Scope: Coverage of all three modules (PolicyCenter, ClaimCenter, BillingCenter) in an integrated workflow
- Duration: 1 week of development (Week 11), with presentations in Week 12

**Phase 1: Project Planning (Days 1-2)**
- Understand business requirements
- Design system architecture
- Create entity relationship diagram (ERD)
- Design workflow diagrams
- Identify integration points between modules
- Create implementation plan with milestones

**Phase 2: PolicyCenter Implementation (Days 3-4)**
- Design commercial property product
- Configure coverage options (Building, Contents, Business Interruption)
- Create rating algorithm
- Implement quote-to-bind workflow
- Create sample policy documents
- Test policy lifecycle (quote, bind, renew, cancel)

**Phase 3: ClaimCenter Integration (Days 3-4)**
- Design claims handling workflow
- Configure claim assignment rules
- Set up reserve methodology
- Create claims handling procedures
- Implement activity and task management
- Test claim-to-settlement process

**Phase 4: BillingCenter Integration (Day 4-5)**
- Configure payment plans
- Create billing-to-collection workflow
- Set up delinquency handling
- Configure commission processing
- Implement payment posting
- Test end-to-end billing cycle

**Phase 5: Integration & Testing (Day 5)**
- Test data flow across modules
- Verify calculations (premium, reserve, commission)
- Test edge cases and error handling
- Create integration test scenarios
- Generate test reports and metrics
- Prepare documentation

**Deliverables**
- Product configuration documentation
- System architecture diagram
- Workflow diagrams for all major processes
- Test scenarios and results
- Implementation notes and lessons learned
- User documentation (reference guide)
- Technical documentation (API, plugins, customizations)

#### Guidewire Certification Preparation

**Certification Paths**
- ACE PolicyCenter Certification
- ACE ClaimCenter Certification
- ACE BillingCenter Certification
- Guidewire Cloud Enablement Certification

**Key Topics to Review**
- Guidewire architecture and components
- GOSU language and coding standards
- Product configuration (PolicyCenter, ClaimCenter, BillingCenter)
- Workflow design and business rules
- API and integration patterns
- Cloud platform architecture
- Performance tuning and best practices
- Common troubleshooting scenarios

#### Mock Interview Preparation

**Technical Interviews**
- GOSU coding exercises: Write code to solve business problem
- Architecture design: Design integration between systems
- Troubleshooting: Debug common Guidewire issues
- Configuration: Configure product or workflow based on requirements
- Performance: Optimize slow query or batch job

**Behavioral Interviews**
- Tell about a complex Guidewire implementation
- Describe a challenging problem you solved
- How do you approach learning new technology
- Tell about working in a team environment
- Describe your experience with insurance industry

**Interview Preparation Tips**
- Review technical fundamentals
- Practice coding exercises on whiteboard
- Prepare stories using STAR method (Situation, Task, Action, Result)
- Research company and role expectations
- Practice speaking clearly about technical topics
- Manage nervousness and time management in interviews

#### Lab Exercises

**Lab 11.1: Capstone Project - Phase 1 & 2**
- Create detailed project plan with timeline and milestones
- Design commercial property product in Guidewire Studio
- Configure coverage structure and rating
- Implement quote-to-bind workflow
- Generate sample policies and documents
- Document design decisions and assumptions

**Lab 11.2: Capstone Project - Phase 3 & 4**
- Design claims handling process for property claims
- Configure claim assignment rules
- Set up payment plan options and billing workflow
- Implement commission processing
- Test all workflows for end-to-end functionality
- Generate test reports

**Lab 11.3: Capstone Project - Integration & Testing**
- Test data flow across PolicyCenter, ClaimCenter, BillingCenter
- Create comprehensive test scenarios
- Document test results and metrics
- Identify and fix issues
- Create user documentation
- Prepare for project presentation

### Week 12 Overview

#### Certification Exam Preparation

**Exam Structure**
- Multiple choice questions (60-80 questions)
- Time limit: 90-120 minutes
- Passing score: 70-75% typically
- Topics: Architecture, configuration, development, best practices, troubleshooting

**Study Plan**
- Review exam objectives and study guide
- Complete practice exams (minimum 2)
- Score 80%+ on practice exams before taking real exam
- Review areas of weakness
- Study official Guidewire documentation
- Join study groups if available

**Exam Day Tips**
- Take practice exams under timed conditions
- Review explanations for wrong answers
- Manage time: don't spend too long on difficult questions
- Flag questions for review if time permits
- Get adequate sleep night before exam
- Arrive early to reduce stress

**Post-Exam**
- Understand results: which topics were weak
- Identify further learning needs
- Continue building practical experience
- Share knowledge with peers
- Consider additional Guidewire certifications

#### Career Development in Guidewire

**Career Paths**
- **Consultant**: Implementer at professional services firm (Guidewire partner)
- **Developer**: Software engineer building custom solutions
- **Architect**: Design and technical leadership on implementations
- **Product Manager**: Drive product direction at insurance company
- **Trainer**: Develop training and knowledge management

**Skills to Develop**
- Domain expertise in insurance workflows
- Technical depth in Guidewire platform
- Architecture and design patterns
- Leadership and communication
- Business acumen and ROI thinking
- Cloud and DevOps practices

**Continuing Education**
- Take additional Guidewire certifications
- Attend Guidewire user conferences (GuideOne, GuideCon)
- Read Guidewire blogs and release notes
- Join Guidewire community forums
- Practice with latest versions and features
- Contribute to open-source Guidewire tooling

#### Resume & LinkedIn Enhancement

**Resume Tips for Guidewire Roles**
- Highlight specific Guidewire experience and modules
- List technical skills: GOSU, REST APIs, Cloud
- Quantify achievements: efficiency improvements, cost savings
- Emphasize problem-solving and innovation
- Include certifications achieved
- Reference real projects (non-confidential details)

**LinkedIn Optimization**
- Add Guidewire and insurance industry skills
- Write detailed work experience descriptions
- Get recommendations from colleagues
- Share articles about insurance tech trends
- Connect with Guidewire community members
- Join Guidewire-related groups

**Portfolio & Project References**
- Create anonymized case studies of projects
- Build GitHub portfolio with sample code
- Write blog posts about Guidewire lessons learned
- Prepare references who can speak to your work
- Document your capstone project
- Create presentation deck on project experience

#### Lab Exercises

**Lab 12.1: Capstone Project - Final Presentation**
- Finalize all project deliverables
- Create presentation deck (15-20 minutes)
- Prepare to answer technical questions
- Present to peers and instructors
- Demonstrate working system
- Receive feedback and recommendations

**Lab 12.2: Mock Certification Exam**
- Take full-length practice exam under timed conditions
- Review answers and score results
- Identify areas for improvement
- Study weak areas using official resources
- Retake practice exam to verify improvement
- Identify any remaining knowledge gaps

**Lab 12.3: Interview Preparation & Practice**
- Conduct mock technical interview
- Practice behavioral interview questions
- Record yourself explaining technical concepts
- Get feedback on communication and clarity
- Practice writing GOSU code on whiteboard
- Discuss salary expectations and benefits

---

## Assessment Framework

### Grading Components

| Component | Weight | Details |
|-----------|--------|---------|
| Weekly Quizzes | 20% | Online quizzes testing knowledge from each week's topics. 10-15 questions per quiz. Minimum 70% to pass. |
| Lab Exercises | 30% | Hands-on laboratory work in Guidewire Studio. Exercises submitted and graded on functionality and code quality. |
| Mid-Program Assessment | 20% | Comprehensive exam at end of Week 6 covering Weeks 1-6 content. Tests both conceptual knowledge and practical application. |
| Capstone Project | 30% | End-to-end implementation project (Weeks 11-12). Graded on functionality, code quality, documentation, and presentation. |

### Scoring & Passing Criteria

**Minimum Passing Score**: 70%

**Grade Distribution**:
- 90-100%: A (Excellent)
- 80-89%: B (Good)
- 70-79%: C (Satisfactory)
- Below 70%: F (Not Satisfactory)

**Graduation Requirements**
1. Achieve 70%+ on overall program score
2. Achieve 70%+ on Capstone Project specifically
3. Complete all lab exercises
4. Meet attendance requirements (minimum 90%)
5. No academic integrity violations

### Attendance Policy

- **Expected Attendance**: 100% of all sessions
- **Excused Absences**: Medical emergency, family emergency, approved leave (with documentation)
- **Unexcused Absences**: Each unexcused absence results in 5% grade deduction
- **3+ Unexcused Absences**: May result in program termination

---

## Daily Schedule

| Time | Activity | Details |
|------|----------|---------|
| 9:00-10:30 | **Lecture/Theory** | Instructor-led classroom instruction covering concepts, architecture, and best practices. Slides, videos, and demonstrations. |
| 10:30-10:45 | **Break** | Coffee, snacks, restroom break. Informal Q&A with instructor. |
| 10:45-12:30 | **Hands-on Lab** | Guided laboratory exercises in Guidewire Studio. Instructor provides step-by-step guidance. Students follow along and ask questions. |
| 12:30-1:30 | **Lunch Break** | Lunch provided (or lunch break if remote). Informal networking with classmates. |
| 1:30-3:00 | **Practice/Exercises** | Unguided practice exercises. Students work individually or in pairs. Instructor provides assistance as needed. |
| 3:00-3:15 | **Break** | Snack and restroom break. Informal discussion with instructor and peers. |
| 3:15-5:00 | **Project Work / Q&A** | Capstone project development (Weeks 9+). Open office hours for questions and assistance. Instructor available for one-on-one help. |

---

## Resources

### Official Training & Documentation
- **Guidewire Education Portal**: Guided learning paths, video tutorials, practice exams (requires account)
- **Guidewire Developer Portal**: Technical documentation, API reference, code samples
- **Guidewire Community Forum**: Ask questions, share knowledge, discuss best practices
- **Guidewire Academy**: Free and paid certification courses

### Language & Platform References
- **GOSU Language Guide**: Official GOSU syntax and feature documentation
- **GOSU Standard Library**: Built-in classes and utility functions
- **Guidewire InsuranceSuite Documentation**: PolicyCenter, ClaimCenter, BillingCenter user guides
- **Guidewire Cloud Platform (GWCP)**: Architecture, security, deployment guides

### Development Tools & Setup
- **Guidewire Studio**: IDE for development, debugging, and deployment
- **Guidewire Studio Installation Guide**: Step-by-step setup instructions
- **Guidewire Sandbox Environments**: Cloud-based practice environments provided during training
- **Database Tools**: SQL clients for database query and analysis (optional)

### Additional Learning Materials
- **Insurance Industry Primers**: Educational resources on P&C insurance fundamentals
- **Case Studies**: Real-world implementation examples (anonymized)
- **Interview Preparation Guide**: Tips for behavioral and technical interviews
- **Sample Code Repository**: GitHub repository with sample GOSU code and configuration examples
- **Video Tutorials**: Recorded sessions from previous cohorts (available on internal portal)

### Exam Preparation
- **Guidewire Certification Guide**: Overview of ACE certification paths and requirements
- **Practice Exam Banks**: 2-3 full-length practice exams available
- **Exam Study Guide**: Topics, objectives, and sample questions
- **Guidewire Exam Schedule**: Testing centers and registration information

---

## Last Updated: February 2026
