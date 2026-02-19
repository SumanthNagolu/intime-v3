# SGI Senior Developer (Guidewire) — Interview Walkthrough Guide
## PolicyCenter Scenario: Specialty Cyber Liability Line Implementation

**Candidate**: Goutham | **Role**: R6514 Senior Developer (Guidewire) | **Client**: SGI (sgi.sk.ca)
**Format**: Present your submitted solution with walkthrough (100 marks)

---

## OPENING (2 minutes)

### What to Say:
> "Thank you for this opportunity. I chose the PolicyCenter Cyber Liability scenario because it covers the full spectrum of Guidewire development — product configuration, integration, rating, UI, and testing — all within a single, cohesive use case.
>
> I'll walk you through my solution in the order a real implementation would follow: starting with the product model, then coverage configuration, underwriting rules, rating, external API integration, UI enhancements, testing, and finally reinsurance. I'll highlight key technical decisions and trade-offs at each step."

---

## SECTION 1: PRODUCT MODEL CONFIGURATION (5 minutes)

### Architecture Decision: APD vs Product Designer

```
┌─────────────────────────────────────────────────────────┐
│              WHY APD FOR A NEW PRODUCT?                  │
├──────────────────────────┬──────────────────────────────┤
│     APD (Recommended)    │     Product Designer          │
├──────────────────────────┼──────────────────────────────┤
│ Cloud API aligned        │ Limited cloud alignment       │
│ BA/Stakeholder friendly  │ Developer-only                │
│ Generates data model     │ Manual data model creation    │
│   + PCF artifacts        │                               │
│ 3-phase workflow         │ Direct configuration          │
│ Best for NEW products    │ Best for MODIFYING existing   │
│ Works locally + GWCP     │ Works on both environments    │
└──────────────────────────┴──────────────────────────────┘
```

### Speaking Notes:
> "For a brand-new Cyber Liability product, I recommended **APD** over Product Designer for three key reasons:
>
> **First**, APD follows a three-phase workflow — **Conceptualization, Visualization, and Finalization** — which maps directly to how insurance products are actually designed in the real world. In Conceptualization, we use XMind to create a mind map of the product structure — the coverables, coverages, and exclusions. We annotate the mind map with **Guidewire markers** — these markers tell APD how to interpret each element when the mind map is imported. This mind map can be shared with business analysts and actuaries before any code is written.
>
> **Second**, once imported into APD during Visualization, we can add coverage terms, availability rules, and effective dates. We can even create a test policy using the visualized product to validate behavior before committing.
>
> **Third**, in Finalization, APD auto-generates the data model entities and PCF files — saving weeks of manual development. You can generate the product code locally on your development machine or directly on the Guidewire Cloud Platform. This is critical for a product like Cyber Liability that needs rapid configuration changes as threats evolve.
>
> That said, if SGI has an existing Commercial Lines product and wants to add cyber as a sub-line, Product Designer would be more appropriate since it's better for modifying existing products."

### Product Hierarchy (Draw on Whiteboard if Available):
```
Account
  └── Policy
        └── PolicyPeriod
              └── CyberLiabilityLine (new LOB)
                    ├── CyberCoverable (risk object)
                    │     ├── DataBreachCov
                    │     │     └── CovTerms: Limit ($250K, $500K, $1M)
                    │     ├── RansomwareCov
                    │     │     └── Availability: MFA_Enabled == true
                    │     └── RegulatoryDefenseCov
                    │           └── Premium surcharge if Healthcare/Finance
                    ├── CyberExclusions
                    │     ├── WarExclusion
                    │     └── NationStateExclusion
                    └── Custom Fields (_Ext)
                          ├── CyberRiskScore_Ext (Integer)
                          ├── HasMFA_Ext (Boolean)
                          ├── IndustryType_Ext (Typelist)
                          └── ITCertifications_Ext (String)
```

### Likely Follow-up Questions:
- **Q: "How would you handle version migration if the product model changes frequently?"**
  - A: "APD supports versioning through effective dates. Each product model change gets a new effective date, and PolicyCenter automatically applies the correct model version based on the policy's effective date. For breaking changes, we'd use a product migration script."

- **Q: "What if business wants to reuse General Liability coverables?"**
  - A: "In APD, during Conceptualization we can use existing Guidewire markers to annotate mind map topics that reference base product elements. We'd reference the GL coverable patterns and extend them with cyber-specific fields. The key is to keep the cyber-specific extensions in _Ext fields to avoid conflicts with base product upgrades."

---

## SECTION 2: COVERAGE CONFIGURATION (4 minutes)

### Speaking Notes:
> "Let me walk through the three coverages and how each has unique configuration requirements."

### Coverage 1: Data Breach — Selectable Limits
> "For Data Breach coverage, I configured it with **Option Coverage Terms** — the user selects from predefined limits of $250K, $500K, and $1M. In APD, this is a CovTermPattern with type 'OptionCovTerm'. Each option has a code, name, and the actual limit value."

```
Coverage: DataBreachCov
  └── CovTerm: DataBreachLimit (OptionCovTerm)
        ├── Option: DB_250K  → $250,000
        ├── Option: DB_500K  → $500,000
        └── Option: DB_1M    → $1,000,000
```

### Coverage 2: Ransomware — Conditional Availability
> "Ransomware coverage is only available if the business has multi-factor authentication enabled. I implemented this using an **availability rule** via the `isAvailable()` override method. In APD, you define availability expressions on the coverage."

```gosu
// CyberRansomwareCov availability
override function isAvailable() : boolean {
  return this.CyberCoverable.HasMFA_Ext == true
}
```

> "If the business doesn't have MFA, the coverage simply doesn't appear in the UI. The underwriter can't override this — it's a hard product rule, not a UW rule."

### Coverage 3: Regulatory Defense — Premium Surcharge
> "Regulatory Defense coverage triggers an additional premium loading if the business operates in healthcare or finance. This is implemented in the **rating engine**, not in coverage availability. The coverage is always available, but the rate table applies a surcharge factor based on industry type."

### Likely Follow-up Questions:
- **Q: "What's the difference between availability rules and UW rules for controlling coverage?"**
  - A: "Availability rules are product-level — they control whether a coverage CAN be selected. UW rules are process-level — they control whether the transaction can PROCEED. Availability is a hard gate; UW rules can be overridden by authorized users."

- **Q: "How would you handle retroactive date for Data Breach coverage?"**
  - A: "I'd add a DateCovTerm called RetroactiveDate that limits coverage to breaches discovered after that date. This is standard in cyber policies and maps directly to a date coverage term in the product model."

---

## SECTION 3: UNDERWRITING RULES (4 minutes)

### Three-Tier Approval Framework:
```
┌──────────────────────────────────────────────────────────────┐
│                   UW RULE FRAMEWORK                          │
├──────────────────┬──────────────┬────────────────────────────┤
│ Condition        │ Approval By  │ Configuration              │
├──────────────────┼──────────────┼────────────────────────────┤
│ Prior cyber      │ Underwriter  │ Checking Set: Pre-Quote    │
│ incidents        │              │ Blocking Point: Blocks     │
│                  │              │   Quote                    │
├──────────────────┼──────────────┼────────────────────────────┤
│ No IT security   │ Supervisor   │ Checking Set: Pre-Quote    │
│ certifications   │              │ Blocking Point: Blocks     │
│                  │              │   Quote                    │
├──────────────────┼──────────────┼────────────────────────────┤
│ High-risk        │ Executive UW │ Checking Set: Pre-Quote    │
│ industry         │              │ Blocking Point: Blocks     │
│ (healthcare,     │              │   Quote                    │
│  finance)        │              │                            │
└──────────────────┴──────────────┴────────────────────────────┘
```

### Speaking Notes:
> "I created three UW rules via **Administration → Business Settings → Underwriting Rules**. Each rule has a name, code, checking set, blocking point, and condition.
>
> The critical design decision was using **'Pre-Quote' checking set** with **'Blocks Quote' blocking point** for all three rules. This means the system evaluates these rules BEFORE generating a quote, and if the condition is met, the quote is blocked until the appropriate authority approves.
>
> For the approval hierarchy, I configured **Authority Profiles** under Administration → Users & Security. Each profile defines which UW issue types that role can approve. For example:
> - The 'Underwriter' profile can approve 'PriorCyberIncident' issues
> - The 'Supervisor' profile can approve 'NoITCertification' issues
> - The 'Executive UW' profile can approve 'HighRiskIndustry' issues
>
> When multiple rules fire simultaneously — say a healthcare company with no certifications AND prior incidents — all three issues appear in the Risk Analysis screen, and each requires its respective approval before the quote proceeds."

### Likely Follow-up Questions:
- **Q: "What if a business triggers all three rules? How does the approval workflow work?"**
  - A: "All three UW issues are raised simultaneously. The system enters 'Pending Approval' state. Each issue must be independently approved by the authorized profile. The most senior approval (Executive UW) typically reviews all issues together."

- **Q: "How would you handle this for renewals where circumstances may have changed?"**
  - A: "The UW rules fire on every transaction — including renewals. If the business obtained IT certifications since last year, the 'NoITCertification' rule won't fire on renewal. The system re-evaluates conditions against current data."

---

## SECTION 4: RATEBOOK IMPLEMENTATION (4 minutes)

### Rating Architecture:
```
┌─────────────────────────────────────────────────────────┐
│                    RATING FLOW                          │
│                                                         │
│  QuoteProcess.gs                                        │
│    └── requestQuote()                                   │
│          └── requestRate()                              │
│                └── AbstractRatingEngine                 │
│                      └── CyberRatingEngine.gs           │
│                            ├── Rate Table Lookups       │
│                            │   ├── BusinessSize → Base  │
│                            │   ├── Industry → Factor    │
│                            │   ├── IT Security → Factor │
│                            │   └── Coverage → Factor    │
│                            ├── Rate Routine Steps       │
│                            │   ├── Step 1: Base Rate    │
│                            │   ├── Step 2: Industry Adj │
│                            │   ├── Step 3: Security Adj │
│                            │   ├── Step 4: Coverage Adj │
│                            │   └── Step 5: Final Premium│
│                            └── CostData → Cost Entities │
└─────────────────────────────────────────────────────────┘
```

### Speaking Notes:
> "I created a new Ratebook via **Administration → Rating → Ratebooks**. The key fields are:
> - **Code**: CyberLiab_2025
> - **Effective Date**: When the rates become applicable to policies
> - **Activation Date**: When the ratebook is actually loaded into the system — this is the critical distinction. Even if the effective date is in the future, the activation date controls when the system starts using it.
>
> The rating logic follows the standard Guidewire pattern:
>
> **Rate Tables** define the lookup data — the actuarial team provides factors for business size, industry, IT security posture, and coverage selections. I created four rate tables with these argument sources.
>
> **Rate Routines** define the calculation steps — typically provided by the actuarial team. The routine references the rate tables and performs sequential calculations: base rate x industry factor x security discount x coverage loading = final premium.
>
> **The technical flow**: `QuoteProcess.gs` calls `requestQuote()`, which calls `requestRate()`, which invokes the line-specific rating engine. The class hierarchy is `AbstractRatingEngine` (base for all LOBs in the default configuration) → `CyberRatingEngine.gs` (our custom line-specific engine). The engine creates **CostData** objects during rating, and at the end these are merged and copied to actual **Cost entities** in the database.
>
> To add the rate routine to the ratebook, I promoted it to Draft status, then clicked 'Add Rate Routine & Rate Table'. Once added, the actuarial team loads the rate factors."

### Likely Follow-up Questions:
- **Q: "How would you handle mid-term rate changes?"**
  - A: "Create a new ratebook with updated activation date. The system uses the ratebook whose effective date range covers the policy period. For in-force policies, the new rates apply at renewal or policy change, not retroactively."

- **Q: "How does the Regulatory Defense surcharge for healthcare/finance work in the rate routine?"**
  - A: "In the rate routine, I'd add a conditional step that checks IndustryType_Ext. If healthcare or finance, apply a surcharge factor (e.g., 1.25x) to the Regulatory Defense coverage premium. This factor comes from the rate table."

---

## SECTION 5: INTEGRATION — CYBER RISK ASSESSMENT API (6 minutes)

**This is the most technical section — expect deep questions here.**

### Architecture Diagram:
```
┌─────────────────────────────────────────────────────────────────┐
│                INTEGRATION ARCHITECTURE (GWCP)                  │
│                                                                 │
│  ┌──────────┐    REST     ┌──────────────┐    REST    ┌───────┐│
│  │          │───────────→│  Integration  │──────────→│ Cyber ││
│  │ Policy   │            │  Gateway (IG) │           │ Risk  ││
│  │ Center   │←───────────│  (Apache      │←──────────│ API   ││
│  │          │  System API│   Camel)      │  Response │       ││
│  └──────────┘            └──────────────┘            └───────┘│
│       │                        │                               │
│       │                        ├── OAuth2 / API Key mgmt       │
│       │                        ├── Data transformation         │
│       │                        ├── Retry / Circuit Breaker     │
│       │                        └── Secrets Manager             │
│       │                                                        │
│       └── Stores CyberRiskScore_Ext on PolicyPeriod            │
└─────────────────────────────────────────────────────────────────┘
```

### Speaking Notes:
> "In GWCP, Guidewire has moved away from heavy in-process Gosu integrations. The recommended pattern is **Integration Gateway (IG)**, which is an Apache Camel-based mediation layer.
>
> There are **two integration points** — Quote (synchronous) and Renewal (asynchronous batch):
>
> **During Quoting** — when the user clicks 'Quote' or a custom 'Assess Cyber Risk' button:
> 1. A Gosu Plugin triggers a call to the REST API Client (generated from the Cyber API's Swagger spec using the `restCodegen` Gradle task)
> 2. The request goes through Integration Gateway, which handles OAuth2 authentication and data transformation
> 3. If the API responds within 2 seconds, the risk score is displayed immediately
> 4. If slower, we trigger during 'Quote Draft' stage and notify the underwriter when the score is ready
>
> **During Renewals** — automated batch process:
> 1. Renewal Batch Process creates a renewal job
> 2. When the job reaches Draft state, PolicyCenter publishes an **App Event**
> 3. Integration Gateway listens to this event, calls the Cyber Risk API
> 4. IG calls back via PC System API (PATCH on the Job) to update the policy data with the new score
>
> **Error handling** is critical with external APIs:
> - **Circuit Breaker**: If the API is down, fail gracefully with a 'Pending' status
> - **Secret Management**: API keys stored in Guidewire Cloud Secrets Manager — never hardcoded
> - **Timeouts**: 5-second strict timeout for the Quote process to prevent UI freezing"

### REST Client Generation:
> "The `restCodegen` Gradle task generates type-safe client classes from the external API's Swagger/OpenAPI spec. These generated classes handle serialization, HTTP calls, and response parsing. In the Gosu layer, we consume these generated clients to call the external API — passing policy data (industry, certifications, business size), receiving the risk score response, and updating `CyberRiskScore_Ext` on the PolicyPeriod — all within a single bundle transaction."

### Likely Follow-up Questions:
- **Q: "Why not call the API directly from Gosu without Integration Gateway?"**
  - A: "Direct Gosu calls work for simple cases, but IG provides retry logic, circuit breakers, OAuth token management, and data transformation in a centralized, maintainable layer. It also keeps PC lightweight — the external API complexity stays outside."

- **Q: "How do you handle the scenario where the API is down during a live quote?"**
  - A: "The circuit breaker pattern lets the quote proceed with a 'Pending' CyberRiskScore. An Activity is created for the Underwriter to review once the score is available. The UW rules are configured to allow quoting with a pending score but block binding."

- **Q: "How would you test this integration in a dev environment?"**
  - A: "Mock the external API using a test stub — create a MockCyberRiskPlugin.gs that implements the same interface but returns predetermined scores. This ensures GUnit tests are deterministic and don't depend on external API availability."

---

## SECTION 6: UI ENHANCEMENTS (3 minutes)

### Speaking Notes:
> "The UI work has three parts: displaying the risk score, dynamic coverage selection, and approval workflow screens.
>
> **Displaying the Risk Score**: I modified the PCF files — specifically the PolicySetScreen or a custom CyberRiskInputSet.pcf — to add a TextInput bound to `CyberRiskScore_Ext`. This shows the fetched score on the Quote/Review screen.
>
> **Dynamic Coverage Selection**: Using **Partial Page Rendering (PPR)**, I set `postOnChange = true` on fields that affect coverage availability. When the risk score changes, the UI updates without a full page refresh — for example, if the score exceeds 70, the Cyber Extortion coverage becomes unavailable via the `visible` or `editable` property.
>
> **Refresh Risk Score Button**: Since API calls take time, I added a manual trigger button so the Underwriter can re-fetch the score. This is better UX than an automatic call that might freeze the UI.
>
> **Approval Workflow Screens**: The standard RiskAnalysisScreen.pcf handles UW issue approvals. I also created a custom CyberApprovalWorksheet.pcf with role-based buttons — Approve/Reject buttons only visible to users with `uw_supervisor` or `super_user` roles."

---

## SECTION 7: TESTING (3 minutes)

### Testing Strategy:
```
┌─────────────────────────────────────────────────────────┐
│                  TEST PYRAMID                           │
│                                                         │
│              ┌─────────┐                                │
│              │  UI/E2E │  Guidewire Testing Framework   │
│            ┌─┴─────────┴─┐                              │
│            │  Integration │  Mock API + GUnit            │
│          ┌─┴─────────────┴─┐                            │
│          │    Unit Tests    │  GUnit (extends            │
│          │                  │   test base classes)       │
│          └──────────────────┘                            │
└─────────────────────────────────────────────────────────┘
```

### Speaking Notes:
> "My testing approach follows three layers:
>
> **Unit Tests** — GUnit tests using the appropriate test base class depending on what we're testing. For tests that need database access and the full server stack, we extend the server test base class. For pure logic tests without DB, we use a lighter unit test base. For UW rules: I create a test policy with prior cyber incidents, trigger the quote process, and assert that a blocking UW issue is generated.
>
> **Integration Tests** — I **never call the real external API** in tests. Instead, I create a `MockCyberRiskPlugin.gs` that implements the same interface but returns predetermined scores. This lets me test the full flow deterministically. I swap implementations using Guidewire's plugin registry.
>
> **Automated Validation** — Using Product Model Availability Rules and Validation Rules. The validation chain is handled by `PolicyPeriodValidation` — its `ValidatePeriod()` method is the entry point for period-level validation in the base configuration. For example: if `CyberRiskScore_Ext > 70`, certain coverages become unavailable; validation rules prevent moving forward if risk data is inconsistent."

---

## SECTION 8: REINSURANCE CONFIGURATION (4 minutes)

### Reinsurance Architecture:
```
┌─────────────────────────────────────────────────────────┐
│              REINSURANCE FRAMEWORK                       │
│                                                         │
│  ┌─────────────────────┐  ┌──────────────────────────┐  │
│  │  TREATY (Automatic)  │  │  FACULTATIVE (Manual)     │  │
│  │                      │  │                           │  │
│  │  Quota Share: 40%    │  │  For CyberRiskScore > 90 │  │
│  │  to XYZ-Re           │  │  UW must arrange before   │  │
│  │                      │  │  binding                  │  │
│  │  Auto-attaches if:   │  │                           │  │
│  │  - Product = Cyber   │  │  UW navigates to RI       │  │
│  │  - Score in range    │  │  screen, adds XYZ-Re as   │  │
│  │                      │  │  participant with specific │  │
│  │  Linked to RI        │  │  amount for this policy   │  │
│  │  Program             │  │                           │  │
│  └─────────────────────┘  └──────────────────────────┘  │
│                                                         │
│  Prerequisites:                                         │
│  ├── CyberLine implements Reinsurable interface         │
│  ├── "Cyber Liability" defined as Risk Class in RI      │
│  └── Canada + US regulatory reporting configured        │
└─────────────────────────────────────────────────────────┘
```

### Speaking Notes:
> "The reinsurance configuration has three layers:
>
> **First, making the product reinsurable**: The CyberLine must implement the `Reinsurable` interface in the data model. I also defined 'Cyber Liability' as a Risk Class in the RI configuration so we can target cyber risks specifically without affecting Fire or Auto lines.
>
> **Treaty Reinsurance** — This is 'obligatory'. I configured a Quota Share treaty where XYZ-Re automatically takes 40% of every Cyber policy that meets the criteria. The treaty is linked to a Reinsurance Program — the master container that PolicyCenter evaluates during Quote. I used Product/Risk Filtering to scope it to Cyber Liability only.
>
> **Facultative Reinsurance** — For exceptional risks with a CyberRiskScore above 90, I configured a UW Issue that requires a facultative RI agreement before binding. The underwriter manually creates the agreement in the Reinsurance screen, selects XYZ-Re as participant, and specifies the amount for that specific policy.
>
> **Regulatory Compliance** — For Canada/US dual reporting, the RI configuration supports jurisdiction-based reporting. Each treaty has effective dates and territory filtering to generate the correct regulatory reports for OSFI (Canada) and state regulators (US)."

---

## CLOSING (2 minutes)

### What to Say:
> "To summarize the key architectural decisions:
>
> 1. **APD over Product Designer** — right tool for a new product, with business stakeholder collaboration built in and support for both local and cloud deployment
> 2. **Integration Gateway pattern** — decoupled, cloud-native, with circuit breaker and secret management
> 3. **Three-tier UW authority** — Pre-Quote blocking with role-based approval profiles
> 4. **Mock-based testing** — never calling external APIs in tests, deterministic GUnit coverage
>
> The entire solution is designed for the cloud platform, follows Guidewire best practices, and supports SGI's need for rapid configuration changes as cyber threats evolve.
>
> I'm happy to dive deeper into any specific area."

---

## ANTICIPATED TOUGH QUESTIONS & ANSWERS

### Q1: "What's your experience with Guidewire Cloud specifically?"
> "In my recent projects, I've worked on GWCP with SurePath Studio, Cloud API, and the Integration Gateway pattern. The cloud environment changes how we approach integrations — moving from in-process Gosu plugins to the IG mediation layer. I've also worked with the Cloud Secrets Manager for API key management."

### Q2: "How would you handle this if SGI is still on on-premise Guidewire?"
> "On-prem, the integration architecture shifts: instead of Integration Gateway, I'd use Startable Plugins or direct HTTP calls from Gosu. For product design, APD actually supports both local and cloud generation — you can validate and generate the product on your local machine and then deploy to the cloud. The core logic — UW rules, rating, coverage configuration — remains the same regardless of deployment. The integration layer is the main difference."

### Q3: "How would you estimate the effort for this implementation?"
> "Based on my experience with similar implementations:
> - Product Model (APD): 3-4 sprints
> - UW Rules + Authority: 1-2 sprints
> - Rating: 2-3 sprints (depends on actuarial readiness)
> - Integration: 2-3 sprints
> - UI: 1-2 sprints
> - Testing: Concurrent with each area
> - Reinsurance: 1-2 sprints
>
> Total: approximately 12-16 sprints with a team of 3-4 developers."

### Q4: "What would you do differently if you could start over?"
> "I'd push harder for a **proof of concept with APD first** — creating the product model and generating a test policy before touching any integration or rating code. This validates the product structure early and reduces rework. I'd also set up the mock API integration from day one so the team can develop the UI and rating in parallel."

### Q5: "How do you handle data model extensions for cyber-specific fields?"
> "All custom fields use the `_Ext` suffix convention — `CyberRiskScore_Ext`, `HasMFA_Ext`, `IndustryType_Ext`. This follows Guidewire's extension pattern and ensures clean upgrades. For IndustryType, I'd create a custom Typelist rather than a free-text field to enforce data quality."

### Q6: "How would you handle multi-jurisdictional requirements (Canada + US)?"
> "PolicyCenter supports jurisdiction-based configuration natively. I'd use:
> - **Jurisdiction-based availability rules** for coverage variations between provinces/states
> - **Separate rate tables** per jurisdiction (Canadian rates vs US rates)
> - **Territory-filtered UW rules** if approval thresholds differ
> - **Jurisdiction-specific forms** via FormInference patterns"

---

## PRESENTATION FLOW TIMING

| Section | Time | Weight |
|---------|------|--------|
| Opening / Context | 2 min | — |
| Product Model (APD) | 5 min | High |
| Coverage Configuration | 4 min | Medium |
| Underwriting Rules | 4 min | High |
| Ratebook / Rating | 4 min | Medium |
| **Integration (API)** | **6 min** | **Highest** |
| UI Enhancements | 3 min | Medium |
| Testing | 3 min | Medium |
| Reinsurance | 4 min | Medium |
| Closing + Q&A buffer | 5 min | — |
| **Total** | **~40 min** | — |

**Pro tip**: If running short on time, keep UI and Testing brief — they'll ask follow-ups if interested. Spend the most time on Integration and Product Model — these demonstrate senior-level thinking.
