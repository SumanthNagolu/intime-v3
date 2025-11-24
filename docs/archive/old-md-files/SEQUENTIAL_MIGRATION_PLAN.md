# Sequential Website Migration Plan (Legacy -> V3)

**Goal:** Migrate all 100+ pages from the legacy `intime-esolutions` codebase to `intime-v3`, updating the design to the "Living Organism" (Black/Beige/Sharp) aesthetic while preserving **100% of the content context** (processes, lists, stats, value props).

## Phase 1: Critical Foundation & Navigation (Immediate)
- [ ] **Fix Navbar Links**: Ensure every link in the new "Mega Menu" points to a valid route (even if it's a placeholder).
- [ ] **Standardize Layouts**: Ensure `src/app/(public)/layout.tsx` is correctly wrapping all public pages with the `CorporateNavbar` and `CorporateFooter`.

## Phase 2: Deep Migration - Solutions (High Priority)
The current V3 pages are too thin. We must migrate the deep content from legacy.

### 2.1 IT Staffing (`/solutions/it-staffing`)
- [ ] **Migrate Content**:
    - "4-Step Staffing Process" (Understand, Source, Submit, Support).
    - "Service Categories" (Contract, Contract-to-Hire, Direct Placement) - with full details.
    - "Domains & Expertise" list (Database, Network, Software, etc.).
    - "Java Expertise" highlight section.
- [ ] **V3 Styling**: Convert "Steps" to numbered sharp cards. Convert "Domains" to a grid of bordered boxes.

### 2.2 Cross-Border (`/solutions/cross-border`)
- [ ] **Migrate Content**:
    - Detailed "H1B to Canada" process flow.
    - "TN Visa" specifics for Mexico/Canada.
    - "Nearshore" value proposition.

### 2.3 Training (`/solutions/training`)
- [ ] **Migrate Content**:
    - "Corporate Training" vs "Individual Academy" split.
    - Curriculum highlights (Guidewire, Salesforce, Java).
    - "Simulation-Based" methodology explanation.

## Phase 3: Industry Scale-Out (13 Pages)
Use the `IndustryTemplate` to rapidly migrate the legacy industry content.

- [ ] **Automobile** (`/industries/automobile`): Autonomous driving, EV tech, Supply chain.
- [ ] **Government** (`/industries/government`): Security clearance, compliance, legacy modernization.
- [ ] **Hospitality** (`/industries/hospitality`): Reservation systems, POS, Customer experience.
- [ ] **Legal** (`/industries/legal`): Case management, E-discovery, Data privacy.
- [ ] **Logistics** (`/industries/logistics`): Route optimization, Tracking, Fleet management.
- [ ] **Retail** (`/industries/retail`): E-commerce, Omnichannel, Inventory.
- [ ] **Telecom** (`/industries/telecom`): 5G, Network infrastructure, Billing.
- [ ] **Warehouse** (`/industries/warehouse`): Robotics, WMS, IoT.
- [ ] **AI/ML & Data** (`/industries/ai-data`): Predictive analytics, NLP, Computer vision.
- [ ] **Engineering** (`/industries/engineering`): CAD/CAM, Embedded systems.
- [ ] **Human Resources** (`/industries/hr`): HRIS, Payroll, Talent management.
- [ ] **Manufacturing** (`/industries/manufacturing`): Industry 4.0, IoT, Automation.
- [ ] **Information Technology** (`/industries/technology`): (Update existing placeholder).

## Phase 4: Consulting Services (New Section)
The legacy site had dedicated pages for each service. We need to recreate these.

- [ ] **Create Sub-Pages**:
    - `/consulting/custom-software` (Software Development Life Cycle)
    - `/consulting/quality-assurance` (Automation, Performance Testing)
    - `/consulting/rpo` (Recruitment Process Outsourcing)
    - `/consulting/staff-augmentation` (Team extension)
    - `/consulting/system-integration` (API, ERP, Legacy)

## Phase 5: Resources & Careers
- [ ] **Resources**:
    - Create `/resources/blog` (Grid of articles).
    - Create `/resources/case-studies` (Success stories).
- [ ] **Careers**:
    - Update `/careers/join-team` with internal culture content ("Values in Action").
    - Update `/careers/available-talent` (Hotlist of candidates).

## Phase 6: Final Polish
- [ ] **Anti-AI Audit**: Scan all new pages for "Trust Blue" or "Success Green" and replace with Brand Black/Rust.
- [ ] **Link Verification**: Click-test every single link in the Mega Menu.


