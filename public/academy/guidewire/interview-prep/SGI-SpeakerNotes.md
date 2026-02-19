# SGI Interview — Speaker Notes
### Goutham | PolicyCenter Cyber Liability | ~40 min walkthrough

---

## OPENING (2 min)

Thank you for this opportunity. I chose the PolicyCenter Cyber Liability scenario because it covers the full spectrum of Guidewire development — product configuration, integration, rating, UI, and testing — all within a single, cohesive use case.

I'll walk you through my solution in the order a real implementation would follow: product model, coverage configuration, underwriting rules, rating, external API integration, UI enhancements, testing, and reinsurance. I'll highlight key technical decisions and trade-offs at each step.

---

## 1. PRODUCT MODEL — APD (5 min)

For a brand-new Cyber Liability product, I recommended **APD** over Product Designer for three key reasons.

**First** — APD follows a three-phase workflow: **Conceptualization, Visualization, and Finalization**. This maps to how insurance products are actually designed. In Conceptualization, we use XMind to create a mind map of the product structure — coverables, coverages, exclusions. We annotate the mind map with **Guidewire markers** that tell APD how to interpret each element when imported. This mind map can be shared with BAs and actuaries before any code is written.

**Second** — Once imported into APD during Visualization, we add coverage terms, availability rules, and effective dates. We can create a test policy to validate behavior before committing.

**Third** — In Finalization, APD auto-generates the data model entities and PCF files. You can generate locally on your dev machine or directly on GWCP. This saves weeks of manual development and is critical for a product like Cyber Liability that needs rapid changes as threats evolve.

That said, if SGI has an existing Commercial Lines product and wants to add cyber as a sub-line, Product Designer would be more appropriate since it's better for modifying existing products.

---

## 2. COVERAGE CONFIGURATION (4 min)

Let me walk through the three coverages — each has unique configuration requirements.

**Data Breach — Selectable Limits**
I configured this with **Option Coverage Terms** — the user selects from predefined limits of $250K, $500K, and $1M. In APD, this is a CovTermPattern with type OptionCovTerm. Each option has a code, name, and the actual limit value.

**Ransomware — Conditional Availability**
Ransomware coverage is only available if the business has multi-factor authentication enabled. I implemented this using the `isAvailable()` override method. If the business doesn't have MFA, the coverage simply doesn't appear in the UI. The underwriter can't override this — it's a hard product rule, not a UW rule.

**Regulatory Defense — Premium Surcharge**
This coverage triggers additional premium loading if the business operates in healthcare or finance. This is implemented in the **rating engine**, not in coverage availability. The coverage is always available, but the rate table applies a surcharge factor based on industry type.

---

## 3. UNDERWRITING RULES (4 min)

I created three UW rules via **Administration → Business Settings → Underwriting Rules**. Each rule has a name, code, checking set, blocking point, and condition.

The critical design decision was using **Pre-Quote checking set** with **Blocks Quote blocking point** for all three:

- **Prior cyber incidents** → requires Underwriter approval
- **No IT security certifications** → requires Supervisor approval
- **High-risk industry** (healthcare, finance) → requires Executive UW approval

The system evaluates these BEFORE generating a quote. If a condition is met, the quote is blocked until the appropriate authority approves.

For the approval hierarchy, I configured **Authority Profiles** under Administration → Users & Security. Each profile defines which UW issue types that role can approve.

When multiple rules fire simultaneously — say a healthcare company with no certifications AND prior incidents — all three issues appear in the **Risk Analysis screen**, and each requires its respective approval before the quote proceeds.

---

## 4. RATEBOOK / RATING (4 min)

I created a new Ratebook via **Administration → Rating → Ratebooks**. Key fields:

- **Code**: CyberLiab_2025
- **Effective Date**: when rates apply to policies
- **Activation Date**: when the system actually starts using this ratebook — this is the critical distinction

The rating logic follows the standard Guidewire pattern:

**Rate Tables** define the lookup data — actuarial provides factors for business size, industry, IT security posture, and coverage selections.

**Rate Routines** define the calculation steps: base rate × industry factor × security discount × coverage loading = final premium.

**The technical flow**: `QuoteProcess.gs` calls `requestQuote()`, which calls `requestRate()`, which invokes the rating engine. The class hierarchy is **`AbstractRatingEngine`** (base for all LOBs) → **`CyberRatingEngine.gs`** (our custom engine). The engine creates **CostData** objects during rating, which are then merged and copied to actual **Cost entities** in the database.

---

## 5. INTEGRATION — CYBER RISK API (6 min)

*This is the most important section — spend time here.*

In GWCP, the recommended pattern is **Integration Gateway**, an Apache Camel-based mediation layer. There are two integration points:

**During Quoting** (synchronous):
1. Gosu Plugin triggers a call to the REST API Client — generated from the Swagger spec using the **`restCodegen` Gradle task**
2. Request goes through Integration Gateway, which handles OAuth2 and data transformation
3. If the API responds within 2 seconds, risk score displays immediately
4. If slower, we trigger during Quote Draft stage and notify the underwriter when ready

**During Renewals** (asynchronous):
1. Renewal Batch Process creates a renewal job
2. Job reaches Draft state → PolicyCenter publishes an **App Event**
3. Integration Gateway listens, calls the Cyber Risk API
4. IG calls back via **PC System API (PATCH on the Job)** to update the score

**Error handling** is critical:
- **Circuit Breaker** — if API is down, fail gracefully with 'Pending' status
- **Secrets** — API keys in Guidewire Cloud Secrets Manager, never hardcoded
- **Timeouts** — 5-second strict timeout to prevent UI freezing

---

## 6. UI ENHANCEMENTS (3 min)

Three parts:

**Displaying the Risk Score** — Modified PCF files to add a TextInput bound to `CyberRiskScore_Ext` on the Quote/Review screen.

**Dynamic Coverage Selection** — Using **Partial Page Rendering**, I set `postOnChange = true` on fields that affect coverage availability. When the risk score changes, the UI updates without a full page refresh.

**Refresh Risk Score Button** — Manual trigger so the Underwriter can re-fetch. Better UX than automatic calls that might freeze the UI.

**Approval Screens** — Standard `RiskAnalysisScreen.pcf` handles UW approvals. Custom `CyberApprovalWorksheet.pcf` with role-based Approve/Reject buttons.

---

## 7. TESTING (3 min)

Three layers:

**Unit Tests** — GUnit tests using the appropriate test base class. For UW rules: create a test policy with prior cyber incidents, trigger quote, assert a blocking UW issue is generated.

**Integration Tests** — Never call the real external API. Create a `MockCyberRiskPlugin.gs` that returns predetermined scores. Swap implementations using Guidewire's plugin registry. Fully deterministic.

**Validation** — The validation chain is handled by **`PolicyPeriodValidation`** — its **`ValidatePeriod()`** method is the entry point for period-level validation. Example: if CyberRiskScore > 70, certain coverages become unavailable.

---

## 8. REINSURANCE (4 min)

Three layers:

**Making it reinsurable** — CyberLine implements the **`Reinsurable` interface**. Defined "Cyber Liability" as a **Risk Class** in RI configuration.

**Treaty Reinsurance** (automatic) — Quota Share treaty where XYZ-Re takes 40% of every Cyber policy meeting criteria. Linked to a **Reinsurance Program** — the master container evaluated during Quote. Scoped using Product/Risk Filtering.

**Facultative Reinsurance** (manual) — For CyberRiskScore above 90, a UW Issue requires a facultative agreement before binding. Underwriter creates the agreement in the RI screen, selects XYZ-Re, specifies the amount.

**Regulatory** — Canada/US dual reporting via jurisdiction-based RI config with territory filtering for OSFI (Canada) and state regulators (US).

---

## CLOSING (2 min)

To summarize four key architectural decisions:

1. **APD over Product Designer** — right tool for a new product, supports both local and cloud, enables BA collaboration
2. **Integration Gateway** — decoupled, cloud-native, with circuit breaker and secret management
3. **Three-tier UW authority** — Pre-Quote blocking with role-based approval profiles
4. **Mock-based testing** — never calling external APIs in tests, deterministic GUnit coverage

The entire solution follows Guidewire best practices and supports SGI's need for rapid configuration changes as cyber threats evolve.

Happy to dive deeper into any area.
