# SGI Interview — Quick Reference Cheat Sheet
## Keep this on a second monitor during the walkthrough

---

### KEY CLASS NAMES TO DROP (shows depth)
| Component | Class/File |
|-----------|-----------|
| Rating engine base | `AbstractRatingEngine` (extends `AbstractRatingEngineBase`) |
| Line-specific rating | `CyberRatingEngine.gs` (custom, extends AbstractRatingEngine) |
| Quote trigger | `QuoteProcess.gs → requestQuote() → requestRate()` |
| UW rules location | Admin → Business Settings → Underwriting Rules |
| Authority profiles | Admin → Users & Security → Authority Profiles |
| Ratebook location | Admin → Rating → Ratebooks |
| Risk analysis PCF | `RiskAnalysisScreen.pcf` |
| Validation class | `PolicyPeriodValidation` / `ValidatePeriod()` |
| Test framework | GUnit (server test base for DB access, unit test base for pure logic) |
| REST client gen | `restCodegen` Gradle task (generates client from Swagger/OpenAPI spec) |
| Integration Gateway | Apache Camel-based mediation layer |
| Reinsurable interface | `Reinsurable` on CyberLine entity |
| Coverage availability | `isAvailable()` override method (Gosu) |
| Rating cost objects | CostData → merged to Cost entities |
| App Events | Renewal trigger for async integration |
| Secrets | Guidewire Cloud Secrets Manager |

---

### APD THREE PHASES (memorize this)
1. **Conceptualization** → XMind mind map → annotate with **Guidewire markers** → share with BAs
2. **Visualization** → Import to APD → add cov terms, availability rules, effective dates → test policy
3. **Finalization** → Generate data model + PCF artifacts → deploy (locally or on GWCP)

---

### UW RULE FIELDS (when they ask for specifics)
- **Name**: e.g., "Prior Cyber Incident Review"
- **Code**: e.g., "PriorCyberIncident_01"
- **Checking Set**: Pre-Quote (when to evaluate)
- **Blocking Point**: Blocks Quote (what it blocks)
- **Applies To**: PolicyLine
- **Context**: CyberLiabilityLine
- **Condition**: `policyPeriod.CyberLine.HasPriorIncidents_Ext == true`

---

### RATING FLOW (draw this if asked)
```
Rate Table (factors from Actuarial)
         ↓
Rate Routine (calculation steps)
         ↓
Ratebook (container: code, effective date, activation date)
         ↓
AbstractRatingEngine → CyberRatingEngine.gs → CostData objects → Cost entities
```

**Activation Date vs Effective Date**:
- Effective date = when rates apply to policies
- Activation date = when system starts USING this ratebook

---

### INTEGRATION PATTERN (GWCP cloud)
```
PC → REST API Client → Integration Gateway (IG) → External API
                              ↓
                    - OAuth2/API Key handling
                    - Data transformation (JSON mapping)
                    - Retry + Circuit Breaker
                    - Cloud Secrets Manager for keys
```

**Quote** = Synchronous (Gosu Plugin → REST Client → IG → API → score back)
**Renewal** = Async (App Event → IG listens → calls API → PATCH back via System API on the Job)

---

### REINSURANCE QUICK REFERENCE
- **Treaty** = automatic (Quota Share: XYZ-Re takes 40%)
- **Facultative** = manual (for CyberRiskScore > 90, UW arranges before bind)
- **Prerequisite**: CyberLine implements `Reinsurable` interface
- **Risk Class**: "Cyber Liability" defined in RI config
- **Program**: Master container, links to treaties, evaluated during Quote

---

### IF THEY ASK ABOUT SGI SPECIFICALLY
- SGI = Saskatchewan Government Insurance (Crown corporation)
- Operates in **Canada** (Saskatchewan primarily) — mention compliance with Canadian regulations
- The assessment mentions Canada AND US → show you thought about **multi-jurisdictional** requirements
- SGI likely has existing Guidewire on-prem or migrating to cloud — be ready for both scenarios

---

### IF THEY ASK ABOUT APD vs ON-PREM
- APD works **both locally and on GWCP** — you can generate product code on your local machine
- Product Designer is the alternative for modifying existing products
- Integration Gateway is cloud-specific — on-prem uses Startable Plugins / direct HTTP

---

### POWER PHRASES TO USE
- "In my experience implementing this..."
- "The trade-off here is..."
- "On the Guidewire Cloud Platform, the recommended pattern is..."
- "From a maintainability perspective..."
- "This follows Guidewire's standard extension pattern..."
- "The actuarial team would provide..." (shows you understand team boundaries)
- "We'd validate this in a lower environment first..."
