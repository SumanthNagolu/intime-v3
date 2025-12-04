# UC-ADMIN-006: Permission Management

**Version:** 2.0
**Last Updated:** 2025-12-04
**Role:** Admin
**Status:** Approved

---

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-ADMIN-006 |
| Actor | Admin |
| Goal | Configure role-based permissions (RBAC), data scope rules, feature flags, and custom permission overrides |
| Frequency | Weekly (reviews), As needed (changes) |
| Estimated Time | 5-15 min per permission change |
| Priority | HIGH |

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

## 13. Permission Inheritance Visualization

### Inheritance Tree View

```
┌────────────────────────────────────────────────────────────────┐
│ Permission Inheritance                                         │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ORGANIZATION HIERARCHY                                          │
│                                                                 │
│   InTime Corp (Organization)                                    │
│   └─── Organization-level permissions                           │
│        │                                                        │
│        ├─── US Region                                           │
│        │    └─── Region-level permissions (inherited + added)   │
│        │         │                                              │
│        │         ├─── Recruiting Pod Alpha                      │
│        │         │    └─── Pod-level permissions                │
│        │         │         │                                    │
│        │         │         ├─── Mike Jones (Pod Manager)        │
│        │         │         │    └─── Team scope                 │
│        │         │         │                                    │
│        │         │         ├─── Sarah Patel (Tech Recruiter)    │
│        │         │         │    └─── Own + RACI scope           │
│        │         │         │                                    │
│        │         │         └─── John Smith (Tech Recruiter)     │
│        │         │              └─── Own + RACI scope           │
│        │         │                                              │
│        │         └─── Bench Sales Pod Beta                      │
│        │              └─── Pod-level permissions                │
│        │                                                        │
│        └─── Canada Region                                       │
│             └─── Region-level permissions                       │
│                                                                 │
│ INHERITANCE RULES:                                              │
│ • Child inherits parent permissions (unless explicitly denied)  │
│ • More specific rules override general rules                    │
│ • User-level overrides take highest priority                    │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Permission Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ Permission Resolution Flow                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐                                            │
│  │ User requests   │                                            │
│  │ action on object│                                            │
│  └────────┬────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐     ┌─────────────────┐                    │
│  │ Check user      │ NO  │ Return 401      │                    │
│  │ account active? ├────►│ Unauthorized    │                    │
│  └────────┬────────┘     └─────────────────┘                    │
│           │ YES                                                  │
│           ▼                                                      │
│  ┌─────────────────┐     ┌─────────────────┐                    │
│  │ Check role base │ NO  │ Return 403      │                    │
│  │ permission?     ├────►│ Forbidden       │                    │
│  └────────┬────────┘     └─────────────────┘                    │
│           │ YES                                                  │
│           ▼                                                      │
│  ┌─────────────────┐     ┌─────────────────┐                    │
│  │ Check data      │ NO  │ Return 403      │                    │
│  │ scope access?   ├────►│ Forbidden       │                    │
│  └────────┬────────┘     └─────────────────┘                    │
│           │ YES                                                  │
│           ▼                                                      │
│  ┌─────────────────┐     ┌─────────────────┐                    │
│  │ Check RACI      │ NO  │ Return 403      │                    │
│  │ assignment?     ├────►│ (if required)   │                    │
│  └────────┬────────┘     └─────────────────┘                    │
│           │ YES                                                  │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │ Check custom    │                                            │
│  │ overrides       │                                            │
│  └────────┬────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐     ┌─────────────────┐                    │
│  │ Check feature   │ NO  │ Return 403      │                    │
│  │ flags?          ├────►│ Feature disabled│                    │
│  └────────┬────────┘     └─────────────────┘                    │
│           │ YES                                                  │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │ Return 200 OK   │                                            │
│  │ Allow action    │                                            │
│  └─────────────────┘                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 14. Role Comparison View

```
┌────────────────────────────────────────────────────────────────┐
│ Compare Roles                                                   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Compare: [Technical Recruiter ▼] vs [Pod Manager ▼]            │
│                                                                 │
│ JOBS PERMISSIONS                                                │
│ ┌───────────────────┬────────────────────┬────────────────────┐│
│ │ Action            │ Tech Recruiter     │ Pod Manager        ││
│ ├───────────────────┼────────────────────┼────────────────────┤│
│ │ Create            │ ✓ Yes              │ ✓ Yes              ││
│ │ Read              │ Own + RACI         │ Team (all pod)     ││
│ │ Update            │ Own + RA only      │ Team (all pod)     ││
│ │ Delete            │ Draft only         │ ✓ Yes              ││
│ │ Approve           │ ✗ No               │ ✓ Yes              ││
│ │ Assign RACI       │ ✗ No               │ ✓ Yes              ││
│ └───────────────────┴────────────────────┴────────────────────┘│
│                                                                 │
│ CANDIDATES PERMISSIONS                                          │
│ ┌───────────────────┬────────────────────┬────────────────────┐│
│ │ Action            │ Tech Recruiter     │ Pod Manager        ││
│ ├───────────────────┼────────────────────┼────────────────────┤│
│ │ Create            │ ✓ Yes              │ ✓ Yes              ││
│ │ Read              │ Own + RACI         │ Team (all pod)     ││
│ │ Update            │ Own + RA only      │ Team (all pod)     ││
│ │ Delete            │ ✗ No               │ ✗ No               ││
│ │ Export            │ Own only           │ Team               ││
│ └───────────────────┴────────────────────┴────────────────────┘│
│                                                                 │
│ FEATURES                                                        │
│ ┌───────────────────┬────────────────────┬────────────────────┐│
│ │ Feature           │ Tech Recruiter     │ Pod Manager        ││
│ ├───────────────────┼────────────────────┼────────────────────┤│
│ │ AI Twin           │ ✓ Enabled          │ ✓ Enabled          ││
│ │ Advanced Analytics│ ✗ Disabled         │ ✓ Enabled          ││
│ │ Bulk Email        │ ✗ Disabled         │ ✓ Enabled          ││
│ │ Data Export       │ Limited            │ Full               ││
│ │ API Access        │ ✗ Disabled         │ ✓ Enabled          ││
│ └───────────────────┴────────────────────┴────────────────────┘│
│                                                                 │
│ DATA SCOPE COMPARISON                                           │
│ ┌───────────────────┬────────────────────┬────────────────────┐│
│ │ Scope             │ Tech Recruiter     │ Pod Manager        ││
│ ├───────────────────┼────────────────────┼────────────────────┤│
│ │ Default           │ Own                │ Team               ││
│ │ Jobs              │ Own + RACI         │ Team               ││
│ │ Candidates        │ Own + RACI         │ Team               ││
│ │ Users             │ Self only          │ Team members       ││
│ │ Reports           │ Own metrics        │ Team dashboard     ││
│ └───────────────────┴────────────────────┴────────────────────┘│
│                                                                 │
│ [Export Comparison] [Print]                                     │
└────────────────────────────────────────────────────────────────┘
```

---

## 15. Bulk Permission Updates

### Bulk Update Wizard

```
┌────────────────────────────────────────────────────────────────┐
│ Bulk Permission Update                                    [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ STEP 1: SELECT USERS                                            │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Select users to update:                                    │ │
│ │                                                             │ │
│ │ ● By Role: [Technical Recruiter                        ▼] │ │
│ │   Found: 89 users                                          │ │
│ │                                                             │ │
│ │ ○ By Pod: [Select pod...]                                 │ │
│ │ ○ By Region: [Select region...]                           │ │
│ │ ○ Custom selection (checkbox)                             │ │
│ │                                                             │ │
│ │ Preview users:                                             │ │
│ │ • Sarah Patel (sarah@intime.com)                          │ │
│ │ • John Smith (john@intime.com)                            │ │
│ │ • ... and 87 more                                         │ │
│ │                                                             │ │
│ │ [View All Users]                                           │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ STEP 2: SELECT UPDATE TYPE                                      │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Update type:                                               │ │
│ │                                                             │ │
│ │ ● Enable Feature                                           │ │
│ │ ○ Disable Feature                                          │ │
│ │ ○ Change Data Scope                                        │ │
│ │ ○ Add Permission                                           │ │
│ │ ○ Remove Permission                                        │ │
│ │                                                             │ │
│ │ Feature to enable:                                         │ │
│ │ [Bulk Email Campaigns                                  ▼] │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ STEP 3: CONFIRM                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Summary:                                                   │ │
│ │ • 89 Technical Recruiters will have "Bulk Email"          │ │
│ │   feature ENABLED                                          │ │
│ │                                                             │ │
│ │ ☑ Send notification email to affected users               │ │
│ │ ☑ Log this change in audit trail                          │ │
│ │                                                             │ │
│ │ Reason for change: *                                       │ │
│ │ [Rolling out bulk email to all recruiters                ] │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Cancel]                          [Apply to 89 Users]          │
└────────────────────────────────────────────────────────────────┘
```

### Bulk Update History

```
┌────────────────────────────────────────────────────────────────┐
│ Bulk Update History                                             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Dec 4, 2024 10:30 AM - Admin                                   │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Enabled "Bulk Email Campaigns" for 89 Technical Recruiters │ │
│ │ Reason: Rolling out bulk email to all recruiters           │ │
│ │ [View Affected Users] [Rollback]                           │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Nov 15, 2024 2:00 PM - Admin                                   │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Changed data scope for 24 Pod Managers: Own → Team         │ │
│ │ Reason: Pod managers need visibility into their teams      │ │
│ │ [View Affected Users] [Rollback]                           │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 16. Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `Cmd+K` / `Ctrl+K` | Open command palette | Any admin page |
| `g p` | Go to Permissions | Any admin page |
| `g r` | Go to Roles | Any admin page |
| `/` | Focus search | Permission matrix |
| `j` / `k` | Navigate up/down | Role list |
| `Enter` | Open selected role | Role list |
| `c` | Compare roles | Role list (select 2) |
| `t` | Test permissions | Permission matrix |
| `e` | Edit permissions | Role detail |
| `Escape` | Close modal | Any modal |

---

## 17. Test Cases

| Test ID | Scenario | Preconditions | Steps | Expected Result |
|---------|----------|---------------|-------|-----------------|
| ADMIN-PRM-001 | View permission matrix | Admin logged in | 1. Navigate to Permissions 2. Select "Jobs" tab | Matrix shows all roles and their permissions |
| ADMIN-PRM-002 | Edit role permissions | Role exists | 1. Click role 2. Change permission 3. Save | Permission updated, audit log created |
| ADMIN-PRM-003 | Test user permission | User exists | 1. Open "Test Permissions" 2. Select user 3. Select action | Shows ALLOW or DENY with reason chain |
| ADMIN-PRM-004 | Create custom override | User exists | 1. Open user 2. Create override 3. Set expiration | Override active, appears in audit log |
| ADMIN-PRM-005 | Expired override cleanup | Override exists with past date | System runs daily cleanup | Expired override removed, logged |
| ADMIN-PRM-006 | Bulk enable feature | Feature exists, users exist | 1. Open Bulk Update 2. Select role 3. Enable feature | Feature enabled for all users in role |
| ADMIN-PRM-007 | Rollback bulk update | Bulk update exists | 1. Open Bulk History 2. Click Rollback | All changes reverted, new audit entry |
| ADMIN-PRM-008 | Compare two roles | Two roles exist | 1. Open Compare 2. Select roles | Side-by-side comparison displayed |
| ADMIN-PRM-009 | Permission inheritance test | Hierarchy exists | 1. Check child permissions 2. Verify parent inheritance | Child inherits parent permissions correctly |
| ADMIN-PRM-010 | Deny override takes priority | Allow + Deny override exist | 1. User with both overrides 2. Test permission | DENY takes priority, access blocked |
| ADMIN-PRM-011 | Feature flag blocks action | Feature disabled for role | 1. User attempts action 2. Feature check | 403 Forbidden, feature disabled message |
| ADMIN-PRM-012 | Data scope enforcement | User has Team scope | 1. Try to access other team's data | 403 Forbidden, out of scope |
| ADMIN-PRM-013 | RACI expands access | User is C on object | 1. User reads object 2. Check access | Access allowed via RACI assignment |
| ADMIN-PRM-014 | API token respects permissions | Token has limited scopes | 1. Call API with token 2. Request out-of-scope | 403 Forbidden, scope not granted |
| ADMIN-PRM-015 | Audit log completeness | Permission changed | 1. Change permission 2. Check audit | All changes logged with user, time, reason |

---

## 18. Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Permission denied | User lacks permission | "You don't have permission to perform this action" | Request access or contact admin |
| Feature disabled | Feature flag off | "This feature is not available for your role" | Contact admin to enable |
| Out of scope | Data scope restriction | "You don't have access to this record" | Get added to RACI or request scope change |
| Override expired | Temp override past date | "Your temporary access has expired" | Request new override |
| Role not found | Role deleted | "The selected role no longer exists" | Select different role |
| Circular inheritance | A inherits from B, B inherits from A | "Circular permission inheritance detected" | Remove circular reference |
| Bulk update too large | >1000 users selected | "Bulk update limited to 1000 users. Please narrow selection." | Filter to smaller group |
| Invalid scope | Scope doesn't exist | "Invalid data scope specified" | Use valid scope value |

---

## 19. Field Specifications

### Custom Permission Override Form

**Field Specification: User Selection**

| Property | Value |
|----------|-------|
| Field Name | `userId` |
| Type | Select (searchable) |
| Required | Yes |
| Options | Active users from `user_profiles` table |
| Validation | Valid user ID, user must be active |
| Error Messages | |
| - Empty | "Please select a user" |
| - Invalid | "Selected user not found or is inactive" |

**Field Specification: Object Type**

| Property | Value |
|----------|-------|
| Field Name | `objectType` |
| Type | Select |
| Required | Yes |
| Options | Jobs, Candidates, Submissions, Accounts, Users, Reports, Settings |
| Default | Jobs |
| Validation | Must be valid object type |
| Error Messages | |
| - Empty | "Please select an object type" |

**Field Specification: Permission Action**

| Property | Value |
|----------|-------|
| Field Name | `permissionAction` |
| Type | Select |
| Required | Yes |
| Options | Create, Read, Update, Delete, Approve, Export |
| Validation | Valid action for selected object type |
| Error Messages | |
| - Empty | "Please select a permission action" |
| - Invalid | "This action is not available for the selected object type" |

**Field Specification: Scope Override**

| Property | Value |
|----------|-------|
| Field Name | `scopeOverride` |
| Type | Select |
| Required | No |
| Default | Role default |
| Options | Own, Team, Region, Organization |
| Validation | Cannot exceed organization-level scope |
| Error Messages | |
| - Invalid | "Scope override exceeds maximum allowed level" |

**Field Specification: Override Reason**

| Property | Value |
|----------|-------|
| Field Name | `reason` |
| Type | Textarea |
| Required | Yes |
| Min Length | 10 characters |
| Max Length | 500 characters |
| Placeholder | "Explain the business reason for this override..." |
| Validation | Non-empty, within length limits |
| Error Messages | |
| - Empty | "Please provide a reason for this override" |
| - Too Short | "Reason must be at least 10 characters" |
| - Too Long | "Reason cannot exceed 500 characters" |

**Field Specification: Override Duration**

| Property | Value |
|----------|-------|
| Field Name | `durationType` |
| Type | Radio |
| Required | Yes |
| Options | Temporary (with expiration), Permanent |
| Default | Temporary |
| Validation | If temporary, expiration date required |
| Error Messages | |
| - Empty | "Please select override duration" |

**Field Specification: Expiration Date**

| Property | Value |
|----------|-------|
| Field Name | `expiresAt` |
| Type | DatePicker |
| Required | Conditional (if duration = Temporary) |
| Min Date | Tomorrow |
| Max Date | 1 year from today |
| Default | 30 days from today |
| Validation | Must be future date, within 1 year |
| Error Messages | |
| - Empty | "Please select an expiration date" |
| - Past Date | "Expiration date must be in the future" |
| - Too Far | "Expiration date cannot be more than 1 year away" |

### Bulk Permission Update Form

**Field Specification: Selection Method**

| Property | Value |
|----------|-------|
| Field Name | `selectionMethod` |
| Type | Radio |
| Required | Yes |
| Options | By Role, By Pod, By Region, Custom Selection |
| Default | By Role |
| Validation | Must select one method |
| Error Messages | |
| - Empty | "Please select how to choose users" |

**Field Specification: Role Selection**

| Property | Value |
|----------|-------|
| Field Name | `roleId` |
| Type | Select (searchable) |
| Required | Conditional (if method = By Role) |
| Options | Active roles from `roles` table |
| Validation | Valid role ID |
| Error Messages | |
| - Empty | "Please select a role" |
| - Invalid | "Selected role not found" |

**Field Specification: Update Type**

| Property | Value |
|----------|-------|
| Field Name | `updateType` |
| Type | Radio |
| Required | Yes |
| Options | Enable Feature, Disable Feature, Change Data Scope, Add Permission, Remove Permission |
| Validation | Must select one type |
| Error Messages | |
| - Empty | "Please select an update type" |

**Field Specification: Feature Selection**

| Property | Value |
|----------|-------|
| Field Name | `featureId` |
| Type | Select |
| Required | Conditional (if type = Enable/Disable Feature) |
| Options | Available features from `feature_flags` table |
| Validation | Valid feature ID |
| Error Messages | |
| - Empty | "Please select a feature" |
| - Invalid | "Selected feature not found" |

**Field Specification: Bulk Update Reason**

| Property | Value |
|----------|-------|
| Field Name | `bulkReason` |
| Type | Textarea |
| Required | Yes |
| Min Length | 10 characters |
| Max Length | 500 characters |
| Placeholder | "Explain the reason for this bulk update..." |
| Validation | Non-empty, within length limits |
| Error Messages | |
| - Empty | "Please provide a reason for this bulk update" |
| - Too Short | "Reason must be at least 10 characters" |

**Field Specification: Notify Users**

| Property | Value |
|----------|-------|
| Field Name | `notifyUsers` |
| Type | Checkbox |
| Required | No |
| Default | true |
| Label | "Send notification email to affected users" |

### Permission Test Form

**Field Specification: Test User**

| Property | Value |
|----------|-------|
| Field Name | `testUserId` |
| Type | Select (searchable) |
| Required | Yes |
| Options | All users from `user_profiles` table |
| Placeholder | "Search for user to test..." |
| Validation | Valid user ID |
| Error Messages | |
| - Empty | "Please select a user to test" |

**Field Specification: Test Object Type**

| Property | Value |
|----------|-------|
| Field Name | `testObjectType` |
| Type | Select |
| Required | Yes |
| Options | Jobs, Candidates, Submissions, Accounts, Users |
| Validation | Valid object type |
| Error Messages | |
| - Empty | "Please select an object type" |

**Field Specification: Test Action**

| Property | Value |
|----------|-------|
| Field Name | `testAction` |
| Type | Select |
| Required | Yes |
| Options | Create, Read, Update, Delete |
| Validation | Valid action |
| Error Messages | |
| - Empty | "Please select an action to test" |

**Field Specification: Test Object ID**

| Property | Value |
|----------|-------|
| Field Name | `testObjectId` |
| Type | TextInput |
| Required | No |
| Placeholder | "JOB-2024-1234 (optional)" |
| Validation | Valid ID format if provided |
| Error Messages | |
| - Invalid Format | "Invalid object ID format" |
| - Not Found | "Object not found" |

---

## 20. Database Schema Reference

```sql
-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false, -- Cannot be deleted
  default_data_scope VARCHAR(20) DEFAULT 'own',
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions table
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'jobs.create', 'candidates.read'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  object_type VARCHAR(50) NOT NULL, -- jobs, candidates, users, etc.
  action VARCHAR(20) NOT NULL, -- create, read, update, delete, approve
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role-Permission assignments
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id),
  scope_condition VARCHAR(50), -- null = default scope, or 'own', 'team', etc.
  granted BOOLEAN DEFAULT true, -- true = allow, false = explicit deny
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Custom permission overrides
CREATE TABLE permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id),
  granted BOOLEAN NOT NULL, -- true = allow, false = deny
  scope_override VARCHAR(50), -- null = role default, or specific scope
  reason TEXT NOT NULL,
  expires_at TIMESTAMPTZ, -- null = permanent
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature flags
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  default_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature flag role assignments
CREATE TABLE feature_flag_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feature_flag_id, role_id)
);

-- Indexes
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_permission_overrides_user ON permission_overrides(user_id);
CREATE INDEX idx_permission_overrides_expires ON permission_overrides(expires_at);
CREATE INDEX idx_feature_flag_roles_flag ON feature_flag_roles(feature_flag_id);
CREATE INDEX idx_feature_flag_roles_role ON feature_flag_roles(role_id);
```

---

## 21. Related Use Cases

- [UC-ADMIN-005: User Management](./05-user-management.md)
- [UC-ADMIN-008: Audit Logs](./08-audit-logs.md)
- [UC-ADMIN-014: Feature Flags](./14-feature-flags.md)

---

## 22. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-30 | Initial permission management documentation |
| 2.0 | 2025-12-04 | Added overview table, inheritance visualization, role comparison, bulk updates, keyboard shortcuts, test cases, error scenarios, database schema |
| 2.1 | 2025-12-04 | Added field specifications for custom override form, bulk update form, permission test form |

---

**End of UC-ADMIN-006**
