# InTime OS - Permissions Matrix

**Version:** 1.0
**Last Updated:** 2025-11-30
**Status:** Canonical Reference

---

## Table of Contents

1. [Role Definitions](#1-role-definitions)
2. [Role Hierarchy](#2-role-hierarchy)
3. [Entity Permissions Matrix](#3-entity-permissions-matrix)
4. [Feature Permissions Matrix](#4-feature-permissions-matrix)
5. [Data Scope by Role](#5-data-scope-by-role)
6. [RACI Assignment Rules](#6-raci-assignment-rules)
7. [Portal-Specific Permissions](#7-portal-specific-permissions)
8. [Permission Inheritance](#8-permission-inheritance)
9. [Implementation Reference](#9-implementation-reference)

---

## 1. Role Definitions

### 1.1 All System Roles

| Role ID | Display Name | Category | Hierarchy Level | Data Scope | Description |
|---------|--------------|----------|-----------------|------------|-------------|
| `technical_recruiter` | Technical Recruiter | Recruiting | IC | Own | Full-cycle recruiting with job and candidate management |
| `bench_sales_recruiter` | Bench Sales Recruiter | Bench Sales | IC | Own | Consultant marketing and job order fulfillment |
| `ta_specialist` | Talent Acquisition Specialist | TA/Sales | IC | Own | Business development and lead generation |
| `recruiting_manager` | Recruiting Manager | Manager | Manager | Team | Team oversight, account management, and delivery |
| `bench_manager` | Bench Sales Manager | Manager | Manager | Team | Bench utilization, margins, and team performance |
| `ta_manager` | TA Manager | Manager | Manager | Team | Pipeline management, deal forecasting, and team performance |
| `hr` | Human Resources | Manager | Manager | Org | People operations, onboarding, and compliance |
| `admin` | System Administrator | Executive | Director | Org | System configuration, user management, and security |
| `coo` | Chief Operating Officer | Executive | C-Suite | Org | Operations efficiency and process optimization |
| `cfo` | Chief Financial Officer | Executive | C-Suite | Org | Financial metrics, revenue, and margins |
| `ceo` | Chief Executive Officer | Executive | C-Suite | Org | Strategic oversight and company-wide metrics |
| `client` | Client Portal User | Portal | External | Own | External client access to jobs and submissions |
| `candidate` | Candidate Portal User | Portal | External | Own | External candidate access to profile and applications |

### 1.2 Hierarchy Levels

| Level | Description | Data Scope | Reporting Structure |
|-------|-------------|------------|---------------------|
| **IC (Individual Contributor)** | Front-line workers | Own data only | Reports to Manager |
| **Manager** | Team leads | Team data | Reports to Director/C-Suite |
| **Director** | Department heads | Department/Org data | Reports to C-Suite |
| **C-Suite** | Executive leadership | Organization-wide | Reports to CEO/Board |
| **External** | Portal users | Own data only | No internal reporting |

---

## 2. Role Hierarchy

### 2.1 Organizational Chart

```
CEO
├── COO
│   ├── Recruiting Manager
│   │   └── Technical Recruiter
│   ├── Bench Manager
│   │   └── Bench Sales Recruiter
│   └── TA Manager
│       └── TA Specialist
├── CFO
├── Admin
└── HR
```

### 2.2 Reporting Relationships

| Role | Reports To | Manages |
|------|-----------|---------|
| CEO | Board | COO, CFO, Admin |
| COO | CEO | Recruiting Manager, Bench Manager, TA Manager, HR |
| CFO | CEO | (Finance team - not in scope) |
| Admin | CEO | None |
| HR | COO | None |
| Recruiting Manager | COO | Technical Recruiter |
| Bench Manager | COO | Bench Sales Recruiter |
| TA Manager | COO | TA Specialist |
| Technical Recruiter | Recruiting Manager | None |
| Bench Sales Recruiter | Bench Manager | None |
| TA Specialist | TA Manager | None |

---

## 3. Entity Permissions Matrix

### 3.1 Core Business Entities

#### 3.1.1 Jobs (Internal Requisitions)

| Role | Create | Read | Update | Delete | Scope | Approve | Reassign | Notes |
|------|--------|------|--------|--------|-------|---------|----------|-------|
| **Technical Recruiter** | Yes | Own + RACI | Own + RACI(R,A) | No | Own | No | No | Can create jobs for accounts |
| **Recruiting Manager** | Yes | Team + RACI | Team + RACI(R,A) | Team | Team | Yes | Yes | Can approve and reassign team jobs |
| **Bench Sales Recruiter** | No | RACI only | RACI(R,A) | No | RACI | No | No | Read-only for context |
| **Bench Manager** | No | RACI only | RACI(R,A) | No | RACI | No | No | Read-only for context |
| **TA Specialist** | Yes | Own + RACI | Own + RACI(R,A) | No | Own | No | No | Creates jobs from won deals |
| **TA Manager** | Yes | Team + RACI | Team + RACI(R,A) | Team | Team | Yes | Yes | Oversees job creation process |
| **HR** | Yes | Org | Org | No | Org | No | No | Creates internal positions |
| **Admin** | No | Org | Org | Org | Org | No | Yes | System admin override |
| **COO** | Yes | Org | Org | No | Org | Yes | Yes | Operational oversight |
| **CFO** | No | Org | No | No | Org | No | No | Financial visibility only |
| **CEO** | Yes | Org | Org | Org | Org | Yes | Yes | Full access |
| **Client** | No | Own Org Jobs | No | No | Own | No | No | Can view jobs they posted |
| **Candidate** | No | Active Public | No | No | Public | No | No | Can view and apply to jobs |

#### 3.1.2 Candidates/Talent

| Role | Create | Read | Update | Delete | Scope | Source | Submit | Notes |
|------|--------|------|--------|--------|-------|--------|--------|-------|
| **Technical Recruiter** | Yes | Own + RACI | Own + RACI(R,A) | No | Own | Yes | Yes | Full sourcing and submission |
| **Recruiting Manager** | Yes | Team + RACI | Team + RACI(R,A) | Team | Team | Yes | Yes | Team oversight |
| **Bench Sales Recruiter** | Yes | Own + RACI | Own + RACI(R,A) | No | Own | Yes | Yes | Markets bench consultants |
| **Bench Manager** | Yes | Team + RACI | Team + RACI(R,A) | Team | Team | Yes | Yes | Bench oversight |
| **TA Specialist** | Yes | Own + RACI | Own + RACI(R,A) | No | Own | Yes | No | Sources for job pipeline |
| **TA Manager** | Yes | Team + RACI | Team + RACI(R,A) | Team | Team | Yes | Yes | Pipeline management |
| **HR** | Yes | Org | Org | No | Org | No | No | Employee records |
| **Admin** | No | Org | Org | Org | Org | No | No | System admin |
| **COO** | No | Org | Org | No | Org | No | No | Operational metrics |
| **CFO** | No | Org (limited) | No | No | Org | No | No | Financial data only |
| **CEO** | No | Org | Org | Org | Org | No | No | Strategic oversight |
| **Client** | No | Submitted to them | No | No | Own | No | No | View candidates submitted to their jobs |
| **Candidate** | Yes (self) | Own | Own | No | Own | No | No | Manage own profile |

#### 3.1.3 Submissions

| Role | Create | Read | Update | Delete | Scope | Approve | Withdraw | Notes |
|------|--------|------|--------|--------|-------|---------|----------|-------|
| **Technical Recruiter** | Yes | Own + RACI | Own + RACI(R,A) | No | Own | No | Yes | Creates and manages submissions |
| **Recruiting Manager** | Yes | Team + RACI | Team + RACI(R,A) | Team | Team | Yes | Yes | Approves before client submission |
| **Bench Sales Recruiter** | Yes | Own + RACI | Own + RACI(R,A) | No | Own | No | Yes | Job order submissions |
| **Bench Manager** | Yes | Team + RACI | Team + RACI(R,A) | Team | Team | Yes | Yes | Approves rates and submissions |
| **TA Specialist** | No | RACI only | RACI(R,A) | No | RACI | No | No | Visibility into pipeline |
| **TA Manager** | No | Team + RACI | Team + RACI(R,A) | No | Team | No | No | Team visibility |
| **HR** | No | Org | No | No | Org | No | No | HR compliance review |
| **Admin** | No | Org | Org | Org | Org | No | No | System admin |
| **COO** | No | Org | Org | No | Org | Yes | Yes | Operational decisions |
| **CFO** | No | Org | No | No | Org | No | No | Revenue tracking |
| **CEO** | No | Org | Org | Org | Org | Yes | Yes | Strategic decisions |
| **Client** | No | Own Org | Update Status | No | Own | Yes | No | Review and approve/reject |
| **Candidate** | No | Own | View Status | No | Own | No | Yes | Can withdraw applications |

#### 3.1.4 Job Orders (Client Confirmed)

| Role | Create | Read | Update | Delete | Scope | Convert | Close | Notes |
|------|--------|------|--------|--------|-------|---------|-------|-------|
| **Technical Recruiter** | No | RACI only | RACI(R,A) | No | RACI | No | No | Works assigned orders |
| **Recruiting Manager** | Yes | Team + RACI | Team + RACI(R,A) | No | Team | Yes | Yes | Creates from requisitions |
| **Bench Sales Recruiter** | Yes | Own + RACI | Own + RACI(R,A) | No | Own | Yes | Yes | Imports external job orders |
| **Bench Manager** | Yes | Team + RACI | Team + RACI(R,A) | Team | Team | Yes | Yes | Oversees order fulfillment |
| **TA Specialist** | No | RACI only | RACI(R,A) | No | RACI | No | No | Pipeline visibility |
| **TA Manager** | Yes | Team + RACI | Team + RACI(R,A) | No | Team | Yes | Yes | Deal to order conversion |
| **HR** | No | Org | No | No | Org | No | No | Visibility only |
| **Admin** | No | Org | Org | Org | Org | No | No | System admin |
| **COO** | No | Org | Org | No | Org | Yes | Yes | Operational oversight |
| **CFO** | Yes | Org | Org | No | Org | No | No | Revenue management |
| **CEO** | No | Org | Org | Org | Org | Yes | Yes | Strategic decisions |
| **Client** | Yes | Own Org | Own Org | No | Own | No | Yes | Can create and close orders |
| **Candidate** | No | No | No | No | N/A | No | No | No access |

#### 3.1.5 Leads (Sales Prospects)

| Role | Create | Read | Update | Delete | Scope | Qualify | Convert | Notes |
|------|--------|------|--------|--------|-------|---------|---------|-------|
| **Technical Recruiter** | Yes | Own + RACI | Own + RACI(R,A) | No | Own | No | No | Can create leads from sourcing |
| **Recruiting Manager** | Yes | Team + RACI | Team + RACI(R,A) | Team | Team | Yes | Yes | Team lead management |
| **Bench Sales Recruiter** | No | RACI only | RACI(R,A) | No | RACI | No | No | Informed of opportunities |
| **Bench Manager** | No | Team + RACI | Team + RACI(R,A) | No | Team | No | No | Team visibility |
| **TA Specialist** | Yes | Own + RACI | Own + RACI(R,A) | No | Own | Yes | Yes | Primary lead creator |
| **TA Manager** | Yes | Team + RACI | Team + RACI(R,A) | Team | Team | Yes | Yes | Manages team pipeline |
| **HR** | No | No | No | No | N/A | No | No | No access |
| **Admin** | No | Org | Org | Org | Org | No | No | System admin |
| **COO** | No | Org | Org | No | Org | No | No | Strategic oversight |
| **CFO** | No | Org | No | No | Org | No | No | Pipeline valuation |
| **CEO** | No | Org | Org | Org | Org | Yes | Yes | Strategic decisions |
| **Client** | No | No | No | No | N/A | No | No | No access |
| **Candidate** | No | No | No | No | N/A | No | No | No access |

#### 3.1.6 Deals (Sales Opportunities)

| Role | Create | Read | Update | Delete | Scope | Close | Notes |
|------|--------|------|--------|--------|-------|-------|-------|
| **Technical Recruiter** | No | RACI only | RACI(R,A) | No | RACI | No | Visibility for planning |
| **Recruiting Manager** | Yes | Team + RACI | Team + RACI(R,A) | No | Team | Yes | Can close won deals |
| **Bench Sales Recruiter** | No | RACI only | RACI(R,A) | No | RACI | No | Informed of deals |
| **Bench Manager** | No | Team + RACI | Team + RACI(R,A) | No | Team | No | Team visibility |
| **TA Specialist** | Yes | Own + RACI | Own + RACI(R,A) | No | Own | No | Creates from qualified leads |
| **TA Manager** | Yes | Team + RACI | Team + RACI(R,A) | Team | Team | Yes | Closes won deals |
| **HR** | No | No | No | No | N/A | No | No access |
| **Admin** | No | Org | Org | Org | Org | No | System admin |
| **COO** | No | Org | Org | No | Org | Yes | Operational decisions |
| **CFO** | No | Org | Org | No | Org | Yes | Revenue forecasting |
| **CEO** | No | Org | Org | Org | Org | Yes | Strategic deals |
| **Client** | No | No | No | No | N/A | No | No access |
| **Candidate** | No | No | No | No | N/A | No | No access |

#### 3.1.7 Accounts (Client Companies)

| Role | Create | Read | Update | Delete | Scope | Merge | Notes |
|------|--------|------|--------|--------|-------|-------|-------|
| **Technical Recruiter** | Yes | Own + RACI | Own + RACI(R,A) | No | Own | No | Can create client accounts |
| **Recruiting Manager** | Yes | Team + RACI | Team + RACI(R,A) | Team | Team | Yes | Manages client relationships |
| **Bench Sales Recruiter** | Yes | Own + RACI | Own + RACI(R,A) | No | Own | No | Client accounts for job orders |
| **Bench Manager** | Yes | Team + RACI | Team + RACI(R,A) | Team | Team | Yes | Oversees client portfolio |
| **TA Specialist** | Yes | Own + RACI | Own + RACI(R,A) | No | Own | No | Creates accounts from leads |
| **TA Manager** | Yes | Team + RACI | Team + RACI(R,A) | Team | Team | Yes | Account strategy |
| **HR** | No | Org | No | No | Org | No | Visibility only |
| **Admin** | No | Org | Org | Org | Org | Yes | System admin |
| **COO** | No | Org | Org | No | Org | Yes | Strategic accounts |
| **CFO** | No | Org | Org | No | Org | No | Revenue by account |
| **CEO** | Yes | Org | Org | Org | Org | Yes | Executive relationships |
| **Client** | No | Own Org | Own Org | No | Own | No | Can update company info |
| **Candidate** | No | No | No | No | N/A | No | No access |

#### 3.1.8 Contacts

| Role | Create | Read | Update | Delete | Scope | Merge | Notes |
|------|--------|------|--------|--------|-------|-------|-------|
| **Technical Recruiter** | Yes | Own + RACI | Own + RACI(R,A) | No | Own | No | Client POCs and candidates |
| **Recruiting Manager** | Yes | Team + RACI | Team + RACI(R,A) | Team | Team | Yes | Team contact management |
| **Bench Sales Recruiter** | Yes | Own + RACI | Own + RACI(R,A) | No | Own | No | Client contacts |
| **Bench Manager** | Yes | Team + RACI | Team + RACI(R,A) | Team | Team | Yes | Team oversight |
| **TA Specialist** | Yes | Own + RACI | Own + RACI(R,A) | No | Own | No | Prospect contacts |
| **TA Manager** | Yes | Team + RACI | Team + RACI(R,A) | Team | Team | Yes | Contact strategy |
| **HR** | Yes | Org | Org | No | Org | Yes | Employee contacts |
| **Admin** | No | Org | Org | Org | Org | Yes | System admin |
| **COO** | No | Org | Org | No | Org | No | Visibility only |
| **CFO** | No | Org (limited) | No | No | Org | No | No access to details |
| **CEO** | No | Org | Org | No | Org | Yes | Strategic contacts |
| **Client** | No | Own Org | Own Org | No | Own | No | Company contacts only |
| **Candidate** | Yes (self) | Own | Own | No | Own | No | Own contact info |

#### 3.1.9 Campaigns (Marketing/Outreach)

| Role | Create | Read | Update | Delete | Scope | Launch | Notes |
|------|--------|------|--------|--------|-------|--------|-------|
| **Technical Recruiter** | No | RACI only | RACI(R,A) | No | RACI | No | Informed of campaigns |
| **Recruiting Manager** | Yes | Team + RACI | Team + RACI(R,A) | No | Team | Yes | Recruiting campaigns |
| **Bench Sales Recruiter** | Yes | Own + RACI | Own + RACI(R,A) | No | Own | Yes | Marketing campaigns |
| **Bench Manager** | Yes | Team + RACI | Team + RACI(R,A) | Team | Team | Yes | Campaign oversight |
| **TA Specialist** | Yes | Own + RACI | Own + RACI(R,A) | No | Own | Yes | Lead generation campaigns |
| **TA Manager** | Yes | Team + RACI | Team + RACI(R,A) | Team | Team | Yes | Campaign strategy |
| **HR** | No | No | No | No | N/A | No | No access |
| **Admin** | No | Org | Org | Org | Org | No | System admin |
| **COO** | No | Org | Org | No | Org | No | Campaign performance |
| **CFO** | No | Org | No | No | Org | No | Campaign ROI only |
| **CEO** | No | Org | Org | No | Org | Yes | Strategic campaigns |
| **Client** | No | No | No | No | N/A | No | No access |
| **Candidate** | No | No | No | No | N/A | No | No access |

#### 3.1.10 Activities (Notes, Calls, Emails, Tasks)

| Role | Create | Read | Update | Delete | Scope | Notes |
|------|--------|------|--------|--------|-------|-------|
| **Technical Recruiter** | Yes | Own + RACI | Own | No | Own | Personal activity log |
| **Recruiting Manager** | Yes | Team + RACI | Team | Team | Team | Team activity visibility |
| **Bench Sales Recruiter** | Yes | Own + RACI | Own | No | Own | Personal activity log |
| **Bench Manager** | Yes | Team + RACI | Team | Team | Team | Team activity visibility |
| **TA Specialist** | Yes | Own + RACI | Own | No | Own | Personal activity log |
| **TA Manager** | Yes | Team + RACI | Team | Team | Team | Team activity visibility |
| **HR** | Yes | Org | Org | No | Org | HR activities |
| **Admin** | No | Org | Org | Org | Org | System admin |
| **COO** | No | Org | No | No | Org | Activity metrics |
| **CFO** | No | No | No | No | N/A | No access |
| **CEO** | No | Org | No | No | Org | High-level metrics |
| **Client** | Yes | Own | Own | Own | Own | Client notes on candidates |
| **Candidate** | Yes | Own | Own | Own | Own | Application notes |

---

## 4. Feature Permissions Matrix

### 4.1 Dashboard & Analytics

| Role | Dashboard Access | Custom Reports | Export Data | View Analytics | Financial Data | People Data |
|------|------------------|----------------|-------------|----------------|----------------|-------------|
| **Technical Recruiter** | Recruiter Dashboard | Own metrics | Own data | Own performance | No | No |
| **Recruiting Manager** | Manager Dashboard | Team reports | Team data | Team analytics | Limited | Team only |
| **Bench Sales Recruiter** | Bench Dashboard | Own metrics | Own data | Own performance | Limited | No |
| **Bench Manager** | Bench Manager Dashboard | Team reports | Team data | Team analytics | Margins only | Team only |
| **TA Specialist** | TA Dashboard | Own metrics | Own data | Pipeline metrics | No | No |
| **TA Manager** | TA Manager Dashboard | Team reports | Team data | Team analytics | Pipeline value | Team only |
| **HR** | HR Dashboard | HR reports | HR data | People analytics | Salary data | Full access |
| **Admin** | Admin Dashboard | System reports | All data | System metrics | No | User data |
| **COO** | Operations Dashboard | All reports | All data | Full analytics | Limited | All |
| **CFO** | Finance Dashboard | Financial reports | Financial data | Financial analytics | Full access | Salary data |
| **CEO** | Executive Dashboard | All reports | All data | Full analytics | Full access | Full access |
| **Client** | Client Portal | Own metrics | Own data | Submission metrics | No | No |
| **Candidate** | Candidate Portal | Application status | Own data | Own applications | No | No |

### 4.2 Bulk Operations

| Role | Bulk Import | Bulk Export | Bulk Update | Bulk Delete | Bulk Assign | Bulk Email |
|------|-------------|-------------|-------------|-------------|-------------|------------|
| **Technical Recruiter** | Candidates | Own data | Own data | No | No | Own contacts |
| **Recruiting Manager** | Candidates, Jobs | Team data | Team data | No | Team items | Team contacts |
| **Bench Sales Recruiter** | Consultants | Own data | Own data | No | No | Own contacts |
| **Bench Manager** | Consultants, Job Orders | Team data | Team data | No | Team items | Team contacts |
| **TA Specialist** | Leads | Own data | Own data | No | No | Own contacts |
| **TA Manager** | Leads, Contacts | Team data | Team data | No | Team items | Team contacts |
| **HR** | Employees | HR data | HR data | No | No | All employees |
| **Admin** | Users, Any entity | All data | All data | Admin only | All items | No (system emails only) |
| **COO** | No | All data | Limited | No | All items | Executive comms |
| **CFO** | No | Financial data | No | No | No | No |
| **CEO** | No | All data | Limited | No | All items | Company-wide |
| **Client** | No | Own data | No | No | No | No |
| **Candidate** | No | Own data | No | No | No | No |

### 4.3 System Configuration

| Role | User Management | Role Assignment | Org Settings | Integration Config | Billing | API Access | Audit Logs |
|------|-----------------|-----------------|--------------|-------------------|---------|------------|------------|
| **Technical Recruiter** | No | No | No | No | No | Personal tokens | No |
| **Recruiting Manager** | Team members | No | No | No | No | Personal tokens | No |
| **Bench Sales Recruiter** | No | No | No | No | No | Personal tokens | No |
| **Bench Manager** | Team members | No | No | No | No | Personal tokens | No |
| **TA Specialist** | No | No | No | No | No | Personal tokens | No |
| **TA Manager** | Team members | No | No | No | No | Personal tokens | No |
| **HR** | Yes (employees) | Limited | People settings | HR integrations | No | No | HR logs |
| **Admin** | Yes (all users) | Yes | Yes | Yes | Yes | Yes | Yes (all) |
| **COO** | No | No | Operational settings | Limited | No | No | Yes (limited) |
| **CFO** | No | No | Financial settings | Financial integrations | Yes | No | Financial logs |
| **CEO** | No | No | Yes (all) | Yes (all) | Yes | No | Yes (all) |
| **Client** | Own org users | No | Own org only | No | Own billing | No | No |
| **Candidate** | No | No | No | No | No | No | No |

### 4.4 Approval Workflows

| Role | Approve Submissions | Approve Time Off | Approve Expenses | Approve Rates | Approve Hires | Override Status |
|------|---------------------|------------------|------------------|---------------|---------------|-----------------|
| **Technical Recruiter** | No | No | No | No | No | No |
| **Recruiting Manager** | Team submissions | Team members | Team expenses | Team rates | No | Limited |
| **Bench Sales Recruiter** | No | No | No | No | No | No |
| **Bench Manager** | Team submissions | Team members | Team expenses | Team rates | No | Limited |
| **TA Specialist** | No | No | No | No | No | No |
| **TA Manager** | No | Team members | Team expenses | No | No | Limited |
| **HR** | No | All employees | HR expenses | No | Yes | HR items |
| **Admin** | No | No | No | No | No | System override |
| **COO** | Critical items | Escalations | All expenses | All rates | Yes | All items |
| **CFO** | No | No | Yes (all) | Yes (final) | Budgeted positions | Financial items |
| **CEO** | All | All | All | All | All | All |
| **Client** | Submissions to own jobs | No | No | No | No | No |
| **Candidate** | No | No | No | No | No | No |

---

## 5. Data Scope by Role

### 5.1 Data Visibility Scopes

| Scope | Definition | Roles |
|-------|------------|-------|
| **Own** | Only records where user is owner or has RACI assignment | Technical Recruiter, Bench Sales Recruiter, TA Specialist, Client, Candidate |
| **Team** | Own + records owned by direct reports | Recruiting Manager, Bench Manager, TA Manager |
| **Pod** | Team + other team in same pod (if applicable) | Recruiting Manager, Bench Manager (via pod assignment) |
| **Department** | All records in department | (Future: Regional Directors) |
| **Org** | All records in organization | HR, Admin, COO, CFO, CEO |

### 5.2 Scope Application by Entity

| Entity | Own Scope | Team Scope | Org Scope | RACI Override |
|--------|-----------|------------|-----------|---------------|
| Jobs | Created by user | Created by team | All jobs | Yes - R/A can edit |
| Candidates | Owned by user | Owned by team | All candidates | Yes - R/A can edit |
| Submissions | Submitted by user | Submitted by team | All submissions | Yes - R/A can view |
| Job Orders | Accountable = user | Accountable = team | All job orders | Yes - R can edit |
| Leads | Owner = user | Owner = team | All leads | Yes - R/A can edit |
| Deals | Owner = user | Owner = team | All deals | Yes - R/A can edit |
| Accounts | Owner or RACI | Owner or RACI (team) | All accounts | Yes - R/A can edit |
| Contacts | Owner = user | Owner = team | All contacts | Yes - R/A can edit |
| Campaigns | Created by user | Created by team | All campaigns | Yes - R can edit |
| Activities | Created by user | Created by team | All activities | No - personal only |

### 5.3 Pod-Based Data Access

**Pod Structure:**
- Each pod contains: 1 Senior member (Manager) + 1 Junior member (IC)
- Pod types: `recruiting`, `bench_sales`, `ta`

**Cross-Pod Visibility:**
- **Same pod type:** Manager can view other pod's data for collaboration
- **Different pod type:** RACI assignments only
- **COO/CEO:** All pods visible

**Example:**
```
Pod Alpha (Recruiting)
├── Recruiting Manager 1
└── Technical Recruiter 1

Pod Beta (Recruiting)
├── Recruiting Manager 2
└── Technical Recruiter 2

→ Manager 1 can see Manager 2's team data (same pod type)
→ Manager 1 cannot see Bench Manager's data (different pod type)
```

---

## 6. RACI Assignment Rules

### 6.1 RACI Model Overview

**RACI = Responsible, Accountable, Consulted, Informed**

| Role | Permission | Description | Can Edit | Can View |
|------|-----------|-------------|----------|----------|
| **R**esponsible | Edit | Does the work | Yes | Yes |
| **A**ccountable | Approve | Approves/owns outcome (exactly 1) | Yes | Yes |
| **C**onsulted | View | Provides input (before decision) | No | Yes |
| **I**nformed | View | Kept updated (after decision) | No | Yes |

### 6.2 Auto-Assignment Rules by Entity

#### Jobs
| Event | Accountable (A) | Responsible (R) | Consulted (C) | Informed (I) |
|-------|----------------|-----------------|---------------|-------------|
| Job created by Recruiter | Recruiting Manager | Creator (Recruiter) | TA Specialist (if from deal) | - |
| Job created by TA | TA Manager | Creator (TA Specialist) | - | Recruiting Manager |
| Job assigned to recruiter | Recruiting Manager | Assigned Recruiter | Previous assignee (if any) | - |

#### Submissions
| Event | Accountable (A) | Responsible (R) | Consulted (C) | Informed (I) |
|-------|----------------|-----------------|---------------|-------------|
| Submission created | Recruiting Manager | Creator (Recruiter) | - | Candidate (the talent) |
| Submission approved | Recruiting Manager | Recruiter | - | Client hiring manager |
| Interview scheduled | Recruiting Manager | Recruiter | - | Candidate, Client |

#### Job Orders
| Event | Accountable (A) | Responsible (R) | Consulted (C) | Informed (I) |
|-------|----------------|-----------------|---------------|-------------|
| Job Order created | Bench Manager | Creator (Bench Sales) | - | - |
| Job Order imported | Bench Manager | Importing user | - | - |
| Job Order assigned | Bench Manager | Assigned Bench Sales | Previous assignee (if any) | - |

#### Leads
| Event | Accountable (A) | Responsible (R) | Consulted (C) | Informed (I) |
|-------|----------------|-----------------|---------------|-------------|
| Lead created | TA Manager | Creator (TA Specialist) | - | - |
| Lead qualified | TA Manager | TA Specialist | Recruiting Manager | - |
| Lead converted to Deal | TA Manager | TA Specialist | - | Recruiting Manager |

#### Deals
| Event | Accountable (A) | Responsible (R) | Consulted (C) | Informed (I) |
|-------|----------------|-----------------|---------------|-------------|
| Deal created | TA Manager | Creator (TA Specialist) | Recruiting Manager | - |
| Deal won | TA Manager | TA Specialist | Recruiting Manager | COO |
| Deal converted to Account | Recruiting Manager | TA Specialist | TA Manager | - |

#### Accounts
| Event | Accountable (A) | Responsible (R) | Consulted (C) | Informed (I) |
|-------|----------------|-----------------|---------------|-------------|
| Account created | Creator's Manager | Creator | - | - |
| Account assigned | New Assignee's Manager | New Assignee | Previous assignee (if any) | - |
| Strategic account flag | COO or CEO | Account Manager | All relevant managers | - |

### 6.3 Manual Assignment Rules

#### Who Can Assign RACI Roles?

| Assigner Role | Can Assign To | On Entities | Restrictions |
|---------------|--------------|-------------|--------------|
| **Technical Recruiter** | Self, peers | Own jobs, candidates | Cannot assign managers |
| **Recruiting Manager** | Team, self, peers | Team entities | Cannot assign outside team |
| **Bench Sales Recruiter** | Self, peers | Own job orders | Cannot assign managers |
| **Bench Manager** | Team, self, peers | Team entities | Cannot assign outside team |
| **TA Specialist** | Self, peers | Own leads, deals | Cannot assign managers |
| **TA Manager** | Team, self, peers, recruiters | Team entities | Can assign cross-functional |
| **HR** | HR team | HR entities | Only HR-related items |
| **Admin** | Anyone | Any entity | System admin override |
| **COO** | Anyone | Any entity | Operational override |
| **CEO** | Anyone | Any entity | Full override |

#### RACI Reassignment Escalation

| Current RACI | Can Change To | Approver Required |
|--------------|---------------|-------------------|
| Informed → Consulted | User request | Accountable approval |
| Informed → Responsible | Manager assignment | Accountable approval |
| Consulted → Responsible | Manager assignment | Accountable approval |
| Responsible → Accountable | Manager or Executive | Current Accountable approval or COO override |
| Accountable transfer | Ownership transfer | Current Accountable or Manager approval |

### 6.4 RACI Permissions Override

**Override Scenarios:**
1. **Responsible (R)** can edit entity even if not the owner
2. **Accountable (A)** can edit entity even if not the owner
3. **Consulted (C)** can view entity even if not in their scope
4. **Informed (I)** can view entity even if not in their scope

**Permission Inheritance:**
- If entity has RACI, base ownership rules are **extended** (not replaced)
- Owner always has implicit **R** or **A** role
- RACI grants **additional** access beyond scope limits

---

## 7. Portal-Specific Permissions

### 7.1 Client Portal

#### Access Level
- **External** users with `client` role
- SSO or password authentication
- Multi-user support per client organization

#### Permitted Actions

| Entity | View | Create | Update | Delete | Notes |
|--------|------|--------|--------|--------|-------|
| Jobs | Own org jobs | Yes | Own org jobs | No | Can post job requisitions |
| Candidates | Submitted to own jobs | No | No | No | View submitted profiles |
| Submissions | Submitted to own jobs | No | Update status/feedback | No | Review and approve/reject |
| Job Orders | Own org orders | Yes | Own org orders | No | Create confirmed orders |
| Contacts | Own org contacts | Yes | Own org contacts | No | Manage hiring managers |
| Accounts | Own organization | No | Own org info | No | Update company details |
| Activities | Own notes | Yes | Own notes | Yes | Notes on candidates/submissions |
| Interviews | Scheduled with own team | No | Reschedule | No | Interview management |
| Reports | Own metrics | No | No | No | Submission analytics |

#### Restrictions
- **No access to:**
  - Other client's data
  - Internal InTime users
  - Financial data (rates, margins)
  - Candidate contact info (until approved)
  - Internal notes on candidates
  - RACI assignments (internal only)
  - Other candidates not submitted to them

- **Cannot:**
  - Export data in bulk
  - See recruiter assignments
  - Access API
  - View system configurations
  - Assign RACI roles
  - View audit logs

#### Data Visibility
- **Jobs:** Only jobs they created or assigned to their organization
- **Candidates:** Only candidates submitted to their jobs
- **Submissions:** All submissions to their jobs, with limited candidate PII until approved
- **Accounts:** Only their own organization record

### 7.2 Candidate Portal

#### Access Level
- **External** users with `candidate` role
- Usually linked to a `contact` or `talent` record
- Self-registration allowed

#### Permitted Actions

| Entity | View | Create | Update | Delete | Notes |
|--------|------|--------|--------|--------|-------|
| Jobs | Active public jobs | No | No | No | Browse and search jobs |
| Candidates (Self) | Own profile | Yes (self-register) | Own profile | No | Manage profile, resume |
| Submissions | Own applications | Yes (apply) | Withdraw | Yes (withdraw) | Track application status |
| Activities | Own application notes | Yes | Own notes | Yes | Personal notes |
| Interviews | Own scheduled interviews | No | Request reschedule | No | View interview details |
| Contacts (Self) | Own contact info | Yes | Own info | No | Update contact details |
| Courses (Academy) | Enrolled courses | Enroll | Progress | No | Training enrollment |

#### Restrictions
- **No access to:**
  - Other candidates' data
  - Internal InTime users
  - Client information
  - Job financials (rates)
  - Recruiter notes
  - Submission status beyond public stages
  - RACI data

- **Cannot:**
  - Create jobs
  - View all candidates
  - Contact clients directly
  - Export data
  - Access API (unless Academy API for LMS)
  - Submit to multiple jobs simultaneously (controlled)

#### Data Visibility
- **Jobs:** Only active, public jobs (not internal or confidential)
- **Submissions:** Only own applications
- **Profile:** Full access to own data
- **Activities:** Only own application-related activities

#### Special Academy Permissions (if enrolled)
- **Courses:** View enrolled courses, submit assignments
- **Grades:** View own grades and feedback
- **Certificates:** Download earned certificates
- **Labs:** Access assigned lab environments
- **Mentors:** Chat with assigned AI mentor

---

## 8. Permission Inheritance

### 8.1 Role Inheritance Chain

```
CEO (Full Access)
  ↓
COO, CFO, Admin (Org-wide + specific domain)
  ↓
Managers (Team + RACI)
  ↓
ICs (Own + RACI)
  ↓
External Portals (Own only)
```

### 8.2 Composite Role Permissions

**Users can have multiple roles.** Permissions are **unioned (OR logic)**.

**Example:**
- User has: `recruiting_manager` + `technical_recruiter`
- Effective permissions: **Manager permissions + Recruiter permissions**
- Data scope: **Team** (highest wins)

**Hierarchy:**
- If user has both IC and Manager role → Manager takes precedence
- If user has both Manager and Executive → Executive takes precedence

**Implementation Reference:**
```typescript
// src/lib/workspace/role-hierarchy.ts
function getAggregatedPermissions(systemRoles: string[]): ExtendedPermissions {
  // OR logic: If ANY role has permission, user has it
}
```

---

## 9. Implementation Reference

### 9.1 Key Files

| File | Purpose |
|------|---------|
| `/src/lib/workspace/specific-role-config.ts` | All 11 role definitions with permissions |
| `/src/lib/workspace/role-hierarchy.ts` | Role mapping and permission aggregation |
| `/src/lib/db/schema/rbac.ts` | RBAC database schema |
| `/src/lib/db/schema/workspace.ts` | RACI object_owners table |
| `/src/server/routers/object-owners.ts` | RACI assignment API |
| `/src/lib/db/queries/ownership-filter.ts` | Data scope filtering logic |

### 9.2 Permission Check Functions

```typescript
// Check role-based permission
import { hasAggregatedPermission } from '@/lib/workspace/role-hierarchy';
const canApprove = hasAggregatedPermission(userRoles, 'canApproveSubmissions');

// Check RACI access
import { hasEditAccess } from '@/lib/db/queries/ownership-filter';
const canEdit = await hasEditAccess(userId, orgId, 'job', jobId);

// Check data scope
import { buildOwnershipCondition } from '@/lib/db/queries/ownership-filter';
const condition = await buildOwnershipCondition(ctx, 'job', jobs, 'my_team');
```

### 9.3 Database RPC Functions

| Function | Purpose |
|----------|---------|
| `user_has_permission(p_user_id, p_resource, p_action)` | Check if user has permission |
| `user_is_admin()` | Check if current user is admin |
| `user_has_role(role_name)` | Check if current user has role |

### 9.4 Enforcement Layers

1. **Router Layer (tRPC):** `orgProtectedProcedure` enforces org membership
2. **Permission Layer:** Role-based permissions checked via `getAggregatedPermissions()`
3. **Data Scope Layer:** Ownership filters applied via `buildOwnershipCondition()`
4. **RACI Layer:** RACI assignments override base scope
5. **UI Layer:** Hide/disable actions based on permissions

---

## 10. Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-30 | Initial comprehensive permissions matrix | Claude |

---

## 11. Appendix

### 11.1 Permission Scope Summary

| Scope | Definition | Access Rule |
|-------|------------|-------------|
| **Own** | User is owner or creator | `ownerId = userId` |
| **Team** | Own + direct reports' items | `ownerId IN (userId, ...reportIds)` |
| **RACI** | User has any RACI assignment | `EXISTS (object_owners WHERE userId AND entityId)` |
| **Org** | All org items (executive/admin) | `orgId = userOrgId` |

### 11.2 Entity CRUD Defaults by Hierarchy

| Hierarchy Level | Create | Read | Update | Delete |
|-----------------|--------|------|--------|--------|
| **IC** | Own entities | Own + RACI | Own + RACI(R,A) | No |
| **Manager** | Own + team entities | Team + RACI | Team + RACI(R,A) | Team (limited) |
| **Director** | Dept entities | Dept + RACI | Dept + RACI(R,A) | Dept (limited) |
| **C-Suite** | Org entities | Org | Org | Org (limited) |
| **Admin** | System entities | Org | Org | Org (admin only) |
| **External** | Own data only | Own data only | Own data only | No |

---

**End of Permissions Matrix**
