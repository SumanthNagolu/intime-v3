# Spec Sync Checklist

**USE THIS CHECKLIST FOR EVERY TASK**

The `/docs/specs/` folder is our BIBLE - the single source of truth for all application behavior.

---

## Before Starting Any Task

- [ ] **Identify relevant specs:**
  - Database entity? → Read `docs/specs/10-DATABASE/{entity}.md`
  - User workflow? → Read `docs/specs/20-USER-ROLES/{role}/{workflow}.md`
  - Screen? → Read `docs/specs/30-SCREENS/{domain}/{screen}.md`
  - Form? → Read `docs/specs/40-FORMS/{form}.md`
  - Component? → Read `docs/specs/50-COMPONENTS/`
  - Workflow? → Read `docs/specs/60-WORKFLOWS/{workflow}.md`
  - Navigation? → Read `docs/specs/70-NAVIGATION/`
  - Events/Activities? → Read `docs/specs/80-ACTION-LOGGING/`

- [ ] **For Activities/Events, also read:**
  - `docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md`
  - `docs/specs/20-USER-ROLES/02-ACTIVITY-PATTERN-LIBRARY.md`
  - `docs/specs/20-USER-ROLES/03-EVENT-TYPE-CATALOG.md`

- [ ] **Understand the spec completely before coding**

---

## During Implementation

- [ ] **Follow spec exactly** - field names, types, validations
- [ ] **Reference spec in code comments:**
  ```typescript
  /**
   * Implements: docs/specs/10-DATABASE/01-jobs.md
   */
  ```
- [ ] **If spec seems wrong or incomplete:**
  1. STOP implementation
  2. Update the spec first
  3. Document change in spec's Change Log
  4. Continue implementation per updated spec

---

## After Implementation

- [ ] **Compare implementation against spec:**
  - All fields present?
  - All validations correct?
  - All relationships correct?
  - All workflows match?

- [ ] **Update spec if implementation revealed:**
  - Missing edge cases
  - Additional fields needed
  - Validation rules discovered
  - UI patterns standardized

- [ ] **Add to spec's Change Log:**
  ```markdown
  | Date | Author | Change |
  |------|--------|--------|
  | YYYY-MM-DD | [Name] | [What changed and why] |
  ```

---

## Spec Status Indicators

Use these in spec documents:

| Status | Meaning |
|--------|---------|
| ⏳ Pending | Spec not started |
| 📝 Draft | Spec in progress |
| ✅ Complete | Spec finalized |
| 🔧 Implemented | Code matches spec |
| ⚠️ Needs Update | Spec outdated |

---

## Quick Reference: Spec Locations

| What You're Building | Spec Location |
|---------------------|---------------|
| Database table | `10-DATABASE/{table}.md` |
| Technical Recruiter feature | `20-USER-ROLES/01-recruiter/` |
| Bench Sales feature | `20-USER-ROLES/02-bench-sales/` |
| TA/Lead Gen feature | `20-USER-ROLES/03-ta/` |
| Manager feature | `20-USER-ROLES/04-manager/` |
| HR feature | `20-USER-ROLES/05-hr/` |
| Regional feature | `20-USER-ROLES/06-regional/` |
| CFO/Finance feature | `20-USER-ROLES/07-cfo/` |
| COO/Operations feature | `20-USER-ROLES/08-coo/` |
| CEO/Executive feature | `20-USER-ROLES/09-ceo/` |
| Admin feature | `20-USER-ROLES/10-admin/` |
| Client Portal | `20-USER-ROLES/11-client-portal/` |
| Candidate Portal | `20-USER-ROLES/12-candidate-portal/` |
| Screen layout | `30-SCREENS/` |
| Form definition | `40-FORMS/` |
| Reusable component | `50-COMPONENTS/` |
| Business workflow | `60-WORKFLOWS/` |
| Activity/Event | `80-ACTION-LOGGING/` |

---

## Remember

> **"No implementation without spec. No spec change without documentation."**

Discrepancies between code and spec are **BUGS** that must be fixed.

