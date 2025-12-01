# UC-ADMIN-006: Permission Management

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** Admin
**Status:** Approved

---

## 1. Overview

This use case covers the comprehensive permission and access control system for InTime OS. Admin configures role-based permissions (RBAC), data scope rules, feature flags, and custom permission overrides to ensure proper security and access control across the platform.

---

## 2. Permission Model

InTime OS uses a **multi-layer permission model**:

1. **Role-Based Access Control (RBAC)** - Base permissions by role
2. **Data Scope** - Limits data visibility (Own, Team, Region, Org)
3. **RACI Assignments** - Object-level access (Responsible, Accountable, Consulted, Informed)
4. **Feature Flags** - Enable/disable features per role or user
5. **Custom Overrides** - Exception-based permissions

---

## 3. Permission Matrix by Role

```
┌────────────────────────────────────────────────────────────────┐
│ Permission Matrix                              [Edit] [Export] │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ OBJECT: JOBS (Requisitions)                                    │
│ ┌──────────────┬───────┬───────┬────────┬────────┬──────────┐ │
│ │ Role         │Create │ Read  │ Update │ Delete │ Approve  │ │
│ ├──────────────┼───────┼───────┼────────┼────────┼──────────┤ │
│ │Tech Recruiter│ ✓     │ Own+R │ Own+RA │ Draft  │ ✗        │ │
│ │Bench Sales   │ ✓     │ Own+R │ Own+RA │ Draft  │ ✗        │ │
│ │TA Specialist │ ✓     │ Own+R │ Own+RA │ Draft  │ ✗        │ │
│ │Pod Manager   │ ✓     │ Team  │ Team   │ ✓      │ ✓        │ │
│ │Regional Dir  │ ✓     │ Region│ Region │ ✓      │ ✓        │ │
│ │HR Manager    │ ✓     │ Org   │ Org    │ ✗      │ ✓        │ │
│ │COO           │ ✓     │ Org   │ Org    │ ✗      │ ✓        │ │
│ │CEO           │ ✓     │ Org   │ Org    │ ✓      │ ✓        │ │
│ │Admin         │ ✓     │ Org   │ Org    │ ✓      │ ✓        │ │
│ └──────────────┴───────┴───────┴────────┴────────┴──────────┘ │
│                                                                 │
│ Legend:                                                         │
│ • Own: Only objects user owns (created or assigned as R/A)     │
│ • Own+R: Own + objects where user is in RACI (any role)        │
│ • Own+RA: Own + objects where user is R or A                   │
│ • Team: User's pod/team                                        │
│ • Region: User's region                                        │
│ • Org: All objects in organization                             │
│ • Draft: Can only delete if status = Draft                     │
│                                                                 │
│ [Jobs] [Candidates] [Submissions] [Accounts] [Users] [Reports]│
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Scope Configuration

```
┌────────────────────────────────────────────────────────────────┐
│ Data Scope Rules                                               │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ SCOPE LEVELS                                                    │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ OWN (Most Restrictive)                                      │ │
│ │ • User can only see objects they created or own (R/A)       │ │
│ │ • Example: Technical Recruiter sees only their jobs         │ │
│ │ • Use for: Individual contributors, contractors             │ │
│ │                                                             │ │
│ │ TEAM                                                        │ │
│ │ • User can see all objects in their pod/team                │ │
│ │ • Example: Pod Manager sees all jobs in their pod           │ │
│ │ • Use for: Pod Managers, Team Leads                         │ │
│ │                                                             │ │
│ │ REGION                                                      │ │
│ │ • User can see all objects in their region (US, Canada)     │ │
│ │ • Example: Regional Director sees all jobs in US            │ │
│ │ • Use for: Regional Directors, Regional HR                  │ │
│ │                                                             │ │
│ │ ORGANIZATION (Least Restrictive)                            │ │
│ │ • User can see ALL objects across entire organization       │ │
│ │ • Example: COO sees all jobs globally                       │ │
│ │ • Use for: Executives, HR, Finance, Admin                   │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ SCOPE BY ROLE (Default Settings)                               │
│ ┌──────────────────────────┬─────────────────────────────────┐ │
│ │ Role                     │ Default Data Scope              │ │
│ ├──────────────────────────┼─────────────────────────────────┤ │
│ │ Technical Recruiter      │ Own (+ RACI assignments)        │ │
│ │ Bench Sales Recruiter    │ Own (+ RACI assignments)        │ │
│ │ TA Specialist            │ Own (+ RACI assignments)        │ │
│ │ Pod Manager              │ Team (all pod members)          │ │
│ │ Regional Director        │ Region (US or Canada)           │ │
│ │ HR Manager               │ Organization (all)              │ │
│ │ CFO                      │ Organization (all)              │ │
│ │ COO                      │ Organization (all)              │ │
│ │ CEO                      │ Organization (all)              │ │
│ │ Admin                    │ Organization (all)              │ │
│ │ Client Portal User       │ Own (client's jobs only)        │ │
│ └──────────────────────────┴─────────────────────────────────┘ │
│                                                                 │
│ [Edit Scope Rules] [Override for User] [Test Permissions]      │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 5. Feature Flags

```
┌────────────────────────────────────────────────────────────────┐
│ Feature Flags                               [+ New Feature]    │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ACTIVE FEATURES                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Feature: AI Twin System                                     │ │
│ │ ──────────────────────────────────────────────────────────│ │
│ │ Status: 🟢 Enabled for selected roles                      │ │
│ │ Enabled for:                                                │ │
│ │ ✓ Technical Recruiter                                      │ │
│ │ ✓ Bench Sales Recruiter                                    │ │
│ │ ✓ TA Specialist                                            │ │
│ │ ✓ Pod Manager                                              │ │
│ │ ✗ Client Portal (not available externally)                 │ │
│ │                                                             │ │
│ │ [Edit] [Disable]                                            │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Feature: Bulk Email Campaigns                              │ │
│ │ ──────────────────────────────────────────────────────────│ │
│ │ Status: 🟡 Beta (Limited Rollout)                          │ │
│ │ Enabled for:                                                │ │
│ │ ✓ Bench Sales (beta testers)                              │ │
│ │ ✗ Technical Recruiter (not yet)                            │ │
│ │ ✗ Others                                                    │ │
│ │                                                             │ │
│ │ [Edit] [Enable All] [Disable]                              │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Feature: Advanced Analytics                                │ │
│ │ ──────────────────────────────────────────────────────────│ │
│ │ Status: 🟢 Enabled for Management+                         │ │
│ │ Enabled for:                                                │ │
│ │ ✗ Technical Recruiter                                      │ │
│ │ ✗ Bench Sales                                              │ │
│ │ ✓ Pod Manager                                              │ │
│ │ ✓ Regional Director                                        │ │
│ │ ✓ COO, CEO, CFO                                            │ │
│ │                                                             │ │
│ │ [Edit] [Disable]                                            │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ALL AVAILABLE FEATURES                                          │
│ [+ AI Twin System] [+ Bulk Email] [+ Advanced Analytics]       │
│ [+ Client Portal] [+ Mobile App] [+ API Access]                │
│ [+ Custom Reports] [+ Data Export] [+ Integrations]            │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. Permission Testing Tool

```
┌────────────────────────────────────────────────────────────────┐
│ Test Permissions                                         [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ TEST AS USER                                                    │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Select User: [Sarah Patel - Tech Recruiter          ▼]     │ │
│ │                                                             │ │
│ │ Role:           Technical Recruiter                        │ │
│ │ Pod:            Recruiting Pod Alpha                       │ │
│ │ Data Scope:     Own + RACI                                 │ │
│ │ Manager:        Mike Jones                                 │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ TEST PERMISSION                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Object Type:    [Jobs                                  ▼]  │ │
│ │ Action:         [Update                                ▼]  │ │
│ │ Object ID:      [JOB-2024-1234]                            │ │
│ │                                                             │ │
│ │ [Test Permission]                                           │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ RESULT                                                          │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ ✓ ALLOWED                                                   │ │
│ │                                                             │ │
│ │ Reason:                                                     │
│ │ • User is Responsible (R) for this job                     │ │
│ │ • Role "Technical Recruiter" has Update permission on      │ │
│ │   objects where user is R or A                             │ │
│ │ • No conflicting overrides                                 │ │
│ │                                                             │ │
│ │ Permission Chain:                                           │ │
│ │ 1. Check role base permissions: ✓ Update allowed          │ │
│ │ 2. Check data scope: ✓ User is R (owns object)            │ │
│ │ 3. Check custom overrides: ✓ None found                   │ │
│ │ 4. Check feature flags: ✓ No restrictions                 │ │
│ │ 5. RESULT: ALLOW                                            │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Test Another] [View Full Permission Matrix] [Close]           │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 7. Custom Permission Overrides

**Use Case:** Grant exception-based permissions to specific users

```
┌────────────────────────────────────────────────────────────────┐
│ Custom Permission Override                               [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ User: Sarah Patel (Technical Recruiter)                        │
│                                                                 │
│ OVERRIDE DETAILS                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Object Type:    Jobs                                        │ │
│ │ Permission:     Delete (normally not allowed for this role) │ │
│ │ Scope:          All jobs (not just own)                     │ │
│ │                                                             │ │
│ │ Reason: *                                                   │ │
│ │ [Sarah is handling bulk cleanup of old jobs for Q4 2024  ] │ │
│ │ [audit. Temporary permission needed for data cleanup.    ] │ │
│ │                                                             │ │
│ │ Duration:                                                   │ │
│ │ ● Temporary (expires after date)                           │ │
│ │   Expires: [Dec 31, 2024                         ] [📅]    │ │
│ │ ○ Permanent (does not expire)                              │ │
│ │                                                             │ │
│ │ Approval:                                                   │ │
│ │ Approved by: [Admin (you)]                                 │ │
│ │ Date: Dec 3, 2024                                          │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ⚠️ WARNING: Overrides bypass role-based security               │
│ Only use for legitimate business needs with time limits        │
│                                                                 │
│ [Cancel]                                   [Create Override]   │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 8. API Access & Tokens

```
┌────────────────────────────────────────────────────────────────┐
│ API Access Management                                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ API TOKENS                                                      │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Name: Zapier Integration                                   │ │
│ │ Token: ************************************1a2b3c           │ │
│ │ Created: Nov 1, 2024                                        │ │
│ │ Last Used: Dec 3, 2024 at 9:42 AM                          │ │
│ │ Expires: Never                                              │ │
│ │ Permissions:                                                │ │
│ │ • jobs.list (read jobs)                                    │ │
│ │ • jobs.create (create jobs)                                │ │
│ │ • candidates.list (read candidates)                        │ │
│ │ [Revoke] [Edit Permissions] [Regenerate]                   │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [+ Generate New API Token]                                     │
│                                                                 │
│ API RATE LIMITS                                                 │
│ • 1000 requests/hour per token                                 │
│ • 100 requests/minute per token                                │
│ • 10,000 requests/day per organization                         │
│                                                                 │
│ [View API Documentation] [Monitor Usage]                       │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 9. Audit Trail for Permission Changes

Every permission change is logged:

```
┌────────────────────────────────────────────────────────────────┐
│ Permission Change Audit Log                                    │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Dec 3, 2024 10:30 AM - Admin (admin@intime.com)               │
│ • Created custom override for Sarah Patel                      │
│ • Permission: Delete Jobs (All scope)                          │
│ • Expires: Dec 31, 2024                                        │
│ • Reason: Q4 data cleanup                                      │
│                                                                 │
│ Dec 1, 2024 2:15 PM - Admin (admin@intime.com)                │
│ • Enabled feature: Bulk Email Campaigns                        │
│ • Enabled for: Bench Sales Recruiter                           │
│ • Reason: Beta testing                                         │
│                                                                 │
│ Nov 28, 2024 9:00 AM - Admin (admin@intime.com)               │
│ • Changed role: Mike Jones                                     │
│ • From: Technical Recruiter → To: Pod Manager                  │
│ • Permissions automatically updated per role                   │
│                                                                 │
│ [Export Audit Log] [Filter by User] [Filter by Date]          │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 10. Key Concepts

### Permission Evaluation Order

```
When user attempts action, system evaluates in this order:

1. Is user account active?
   NO → DENY (401 Unauthorized)
   YES → Continue

2. Does user's role have base permission?
   NO → DENY (403 Forbidden)
   YES → Continue

3. Check data scope (Own, Team, Region, Org)
   NOT IN SCOPE → DENY (403 Forbidden)
   IN SCOPE → Continue

4. Check RACI assignment (if object-level)
   NOT IN RACI → DENY (unless Org scope)
   IN RACI → Continue

5. Check custom overrides
   DENY OVERRIDE → DENY
   ALLOW OVERRIDE → ALLOW
   NO OVERRIDE → Continue

6. Check feature flags
   FEATURE DISABLED → DENY
   FEATURE ENABLED → ALLOW

7. RESULT: ALLOW (200 OK)
```

---

## 11. Common Permission Scenarios

### Scenario 1: Technical Recruiter wants to view another recruiter's job

**Question:** Can Sarah (Tech Recruiter, Pod Alpha) view a job created by John (Tech Recruiter, Pod Beta)?

**Answer:** NO (403 Forbidden)

**Reason:**
- Sarah's role: Technical Recruiter
- Data scope: Own + RACI assignments
- Job owner: John (not Sarah)
- Sarah is not in RACI for this job
- Result: Not in scope → DENY

**Exception:** If Sarah is added to RACI (e.g., as Consulted), she can view.

---

### Scenario 2: Pod Manager wants to approve job in their pod

**Question:** Can Mike (Pod Manager, Pod Alpha) approve a job created by Sarah (Tech Recruiter, Pod Alpha)?

**Answer:** YES (200 OK)

**Reason:**
- Mike's role: Pod Manager
- Data scope: Team (Pod Alpha)
- Job owner: Sarah (in Pod Alpha)
- Mike's role has Approve permission
- Result: In scope + Permission exists → ALLOW

---

### Scenario 3: COO wants to delete a candidate

**Question:** Can Lisa (COO) delete any candidate?

**Answer:** NO (403 Forbidden by business rule)

**Reason:**
- Lisa's role: COO
- Data scope: Organization (all data visible)
- Permission: COO role does NOT have Delete permission on Candidates
- Reason: Data integrity (prevent accidental deletion)
- Result: No permission → DENY

**Exception:** Admin can delete (with audit trail).

---

## 12. Security Best Practices

1. **Principle of Least Privilege**
   - Grant minimum permissions needed for job function
   - Use data scope to limit visibility
   - Avoid Organization scope unless necessary

2. **Temporary Overrides**
   - Always set expiration date
   - Document business reason
   - Review and revoke after use

3. **Regular Audits**
   - Review permissions quarterly
   - Audit custom overrides monthly
   - Check for dormant accounts (no login 90+ days)

4. **Separation of Duties**
   - No single person has all permissions
   - Critical actions require approval (e.g., delete user, change permissions)
   - Admin should not perform day-to-day operations

5. **Monitor for Anomalies**
   - Alert on unusual permission changes
   - Alert on failed permission checks (potential attack)
   - Review audit logs for suspicious activity

---

## 13. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-30 | Initial permission management documentation |

---

**End of UC-ADMIN-006**
