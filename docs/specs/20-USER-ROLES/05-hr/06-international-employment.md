# UC-HR-006: International Employment Management (US + Canada)

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** HR Manager
**Status:** Approved

---

## 1. Overview

This use case covers managing employment across US and Canada jurisdictions, including work authorization tracking, visa management, cross-border compliance, and employment law adherence for InTime OS staffing operations.

**Critical Focus:** US and Canada are InTime's primary markets. HR must maintain 100% compliance with immigration and employment laws in both countries.

---

## 2. Actors

- **Primary:** HR Manager
- **Secondary:** Immigration Specialist (if applicable), Legal Counsel, Finance Team
- **System:** E-Verify (US), Immigration Tracker, Audit Logger
- **External:** USCIS, IRCC (Immigration, Refugees and Citizenship Canada), State/Provincial agencies

---

## 3. Preconditions

1. HR Manager logged in with full permissions
2. Employee/consultant record exists in system
3. Work authorization documentation available
4. Access to immigration tracking module

---

## 4. Trigger

- New hire with non-citizen work authorization
- Existing employee visa expiration approaching
- Transfer between US and Canada operations
- Audit requirement
- Work authorization status change

---

## 5. Main Flow: Managing Work Authorization

### Step 1: Navigate to Immigration Tracker

**User Action:** Click "Compliance" → "Immigration Tracker" in sidebar

**System Response:**
```
┌────────────────────────────────────────────────────────────────┐
│ Immigration Tracker                    [+ Add Authorization]   │
├────────────────────────────────────────────────────────────────┤
│ [Search by name, visa type...]          [Filter ▼]  [Sort ▼]   │
├────────────────────────────────────────────────────────────────┤
│ Status Filters:                                                 │
│ [🟢 Valid] [🟡 Monitor (90-180d)] [🟠 Warning (30-90d)]        │
│ [🔴 Critical (<30d)] [⚫ Expired]                               │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ CRITICAL ALERTS (14)                                            │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 🔴 Priya Sharma - H1B expires in 18 days (Dec 15, 2024)   │ │
│ │    Last Action: Renewal in progress                        │ │
│ │    [View Details] [Update Status] [Upload Docs]            │ │
│ │                                                             │ │
│ │ 🔴 Michael Chen - OPT expires in 25 days (Dec 22, 2024)   │ │
│ │    Last Action: None                                       │ │
│ │    ⚠️ ACTION REQUIRED: Start STEM extension or H1B        │ │
│ │    [View Details] [Initiate Process]                       │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ WARNING (23)                                                    │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 🟠 David Lee - H1B expires in 45 days (Jan 15, 2025)      │ │
│ │ 🟠 Sarah Johnson - TN expires in 62 days (Feb 1, 2025)    │ │
│ │ [View All Warnings]                                         │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ MONITOR STATUS (87)                                             │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 🟡 Emily Wong - GC EAD expires in 120 days (Apr 10, 2025) │ │
│ │ 🟡 James Park - Work Permit (CA) expires in 156 days      │ │
│ │ [View All Monitoring]                                       │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ALL EMPLOYEES (247)                                             │
│ ┌──────────┬─────────────┬────────────┬─────────────┬────────┐ │
│ │ Employee │ Visa Type   │ Status     │ Expiry Date │ Action │ │
│ ├──────────┼─────────────┼────────────┼─────────────┼────────┤ │
│ │ Priya S. │ H1B         │🔴 Critical │ Dec 15,2024 │ [View] │ │
│ │ Michael C│ OPT         │🔴 Critical │ Dec 22,2024 │ [View] │ │
│ │ David L. │ H1B         │🟠 Warning  │ Jan 15,2025 │ [View] │ │
│ │ Sarah J. │ TN (Canada) │🟠 Warning  │ Feb 1, 2025 │ [View] │ │
│ │ Emily W. │ GC-EAD      │🟡 Monitor  │ Apr 10,2025 │ [View] │ │
│ └──────────┴─────────────┴────────────┴─────────────┴────────┘ │
├────────────────────────────────────────────────────────────────┤
│ [Export Report] [Schedule Automated Reminders] [Bulk Upload]   │
└────────────────────────────────────────────────────────────────┘
```

---

### Step 2: View Employee Work Authorization Detail

**User Action:** Click on "Priya Sharma - H1B" record

**System Response:**
```
┌────────────────────────────────────────────────────────────────┐
│ Employee: Priya Sharma                                    [×]  │
│ Status: 🔴 CRITICAL - H1B Expires in 18 Days                   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ WORK AUTHORIZATION DETAILS                                      │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Current Status                                             │ │
│ │ ──────────────────────────────────────────────────────────│ │
│ │ Country:              United States                        │ │
│ │ Citizenship:          India                                │ │
│ │ Work Auth Type:       H1B Visa                             │ │
│ │ Current Employer:     InTime Staffing Inc.                 │ │
│ │ Sponsor:              InTime Staffing Inc.                 │ │
│ │                                                             │ │
│ │ Key Dates                                                   │ │
│ │ ──────────────────────────────────────────────────────────│ │
│ │ H1B Approval Date:    Dec 15, 2021                         │ │
│ │ H1B Expiry Date:      Dec 15, 2024 (18 days) 🔴           │ │
│ │ I-94 Expiry:          Dec 15, 2024 (18 days) 🔴           │ │
│ │ Passport Expiry:      Aug 30, 2028 ✓                       │ │
│ │ Last Entry to US:     Nov 1, 2024                          │ │
│ │                                                             │ │
│ │ H1B Details                                                 │ │
│ │ ──────────────────────────────────────────────────────────│ │
│ │ Receipt Number:       WAC2123456789                        │ │
│ │ Petition Type:        Initial H1B (3 years)                │ │
│ │ LCA Number:           I-123-45678-901234                   │ │
│ │ Job Title (LCA):      Software Engineer                    │ │
│ │ Worksite:             New York, NY                         │ │
│ │ Prevailing Wage:      $92,000/year                         │ │
│ │ Current Salary:       $95,000/year ✓                       │ │
│ │ Can Transfer:         Yes (H1B extension eligible)         │ │
│ │ Max Duration Used:    3 of 6 years                         │ │
│ │                                                             │ │
│ │ Document Checklist                                          │ │
│ │ ──────────────────────────────────────────────────────────│ │
│ │ ✓ I-797 Approval Notice (Uploaded: Dec 20, 2021)          │ │
│ │ ✓ H1B Visa Stamp in Passport (Uploaded: Jan 5, 2022)      │ │
│ │ ✓ I-94 Arrival/Departure Record (Uploaded: Nov 2, 2024)   │ │
│ │ ✓ LCA (Labor Condition Application) (Uploaded: Nov 1,2021)│ │
│ │ ✓ Passport Bio Page (Uploaded: Dec 1, 2021)               │ │
│ │ ☐ Extension I-797 (Pending - renewal in progress)         │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ RENEWAL STATUS                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Extension Application In Progress                          │ │
│ │ ──────────────────────────────────────────────────────────│ │
│ │ Filed Date:           Oct 15, 2024                         │ │
│ │ Receipt Number:       WAC2423456790                        │ │
│ │ Status:               Pending (Premium Processing)         │ │
│ │ Expected Decision:    Dec 1, 2024                          │ │
│ │ Attorney:             Smith Immigration Law                │ │
│ │ Case Manager:         John Smith (john@smithlaw.com)       │ │
│ │ Last Update:          Nov 28, 2024 - "Case under review"  │ │
│ │                                                             │ │
│ │ ⚠️ CRITICAL: Approval must arrive before Dec 15, 2024     │ │
│ │ If not approved: Employee cannot work after Dec 15         │ │
│ │                                                             │ │
│ │ Contingency Plan:                                           │ │
│ │ ☑ Attorney on standby for emergency filing                │ │
│ │ ☑ Client notified of potential gap                        │ │
│ │ ☐ Backup consultant identified (if needed)                │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ TIMELINE & ALERTS                                               │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Nov 28, 2024 - Email sent to attorney for status update   │ │
│ │ Nov 25, 2024 - Escalated to legal team                    │ │
│ │ Nov 15, 2024 - Entered critical period (30 days)          │ │
│ │ Oct 15, 2024 - Extension filed with USCIS                 │ │
│ │ Sep 15, 2024 - Extension preparation started              │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│ [Update Status] [Upload Document] [Log Communication]          │
│ [Request Extension] [Notify Stakeholders] [Export Record]      │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. US Work Authorization Types (Complete Reference)

### 6.1 US Citizens & Permanent Residents

| Type | Code | Work Auth | Documentation | Expiry Tracking |
|------|------|-----------|---------------|-----------------|
| **US Citizen** | USC | Unlimited | Birth cert, passport, or naturalization | None |
| **Green Card** | GC | Unlimited | I-551 (Permanent Resident Card) | Card expires every 10 years |
| **Green Card EAD** | GC-EAD | Full (pending I-485) | I-485 receipt + EAD card | EAD card expiry (usually 1-2 years) |

---

### 6.2 Non-Immigrant Work Visas

#### H1B: Specialty Occupation

| Property | Details |
|----------|---------|
| **Duration** | Initial: 3 years, Extension: 3 years (6 year max unless GC pending) |
| **Employer-Specific** | Yes - Cannot change employers without H1B transfer |
| **Sponsorship** | Required by employer |
| **Key Documents** | I-797 Approval Notice, H1B visa stamp, I-94, LCA |
| **Prevailing Wage** | Must pay at least prevailing wage for position/location |
| **Job Changes** | Requires H1B amendment if job title/location/salary changes significantly |
| **Travel** | Need valid visa stamp to re-enter US (can work on I-797 alone domestically) |
| **Critical Dates** | I-94 expiry (last day of work auth), Visa stamp expiry (for travel), LCA validity |
| **Cap Subject** | Yes (85,000 annual cap: 65K regular + 20K advanced degree) |
| **Extensions** | Can extend beyond 6 years if I-140 approved or PERM pending 365+ days |

**HR Actions:**
- Track I-94 expiry (cannot work after this date)
- Monitor LCA worksites (employee cannot work outside approved locations)
- Ensure salary meets/exceeds prevailing wage
- File amendments for job changes
- Start renewal 6 months before expiry

---

#### H1B Transfer

| Property | Details |
|----------|---------|
| **Scenario** | Employee moving from another employer to InTime |
| **Processing** | Can start work when petition filed (with receipt notice) |
| **Timeline** | 4-6 months regular, 15 days premium processing |
| **Key Risk** | If transfer denied, employee must leave or return to previous employer |

**HR Actions:**
- Verify previous H1B is valid
- File new H1B petition with InTime as petitioner
- Update LCA for new worksite/salary
- Ensure no employment gap

---

#### H4 EAD: H1B Spouse Work Authorization

| Property | Details |
|----------|---------|
| **Eligibility** | Spouse of H1B holder who has approved I-140 or is in 6th year extension |
| **Work Auth** | Full (can work for any employer) |
| **Duration** | Tied to H1B holder's status |
| **Key Documents** | H4 EAD card, H1B spouse's I-797 & I-140 approval |

**HR Actions:**
- Track H4 EAD expiry separately from H1B spouse
- Verify H1B spouse's I-140 remains approved
- If H1B spouse changes status, H4 EAD may be affected

---

#### L1A/L1B: Intracompany Transfer

| Type | Description | Duration |
|------|-------------|----------|
| **L1A** | Manager or Executive | 7 years max |
| **L1B** | Specialized Knowledge | 5 years max |
| **L2 EAD** | Spouse of L1 holder | Can work for any employer |

**Requirements:**
- Must have worked for foreign affiliate for 1 continuous year in past 3 years
- US company must be related entity (subsidiary, parent, affiliate)

**HR Actions:**
- Maintain proof of qualifying relationship between entities
- Track L1 blanket vs individual petition
- Monitor L2 EAD for spouses

---

#### TN: NAFTA Professionals (Canada/Mexico)

| Property | Details |
|----------|---------|
| **Eligibility** | Canadian or Mexican citizens in specific NAFTA professions |
| **Duration** | 3 years (renewable indefinitely) |
| **Application** | Can apply at border (Canadians) or consulate (Mexicans) |
| **Professions** | 63 specific occupations (engineers, accountants, scientists, etc.) |
| **Employer-Specific** | Yes |

**HR Actions:**
- Verify profession is on NAFTA list
- Prepare support letter for border/consulate
- Track I-94 expiry
- Can renew at border or via USCIS

---

#### OPT: Optional Practical Training (Students)

| Type | Duration | Requirements |
|------|----------|--------------|
| **OPT** | 12 months | F-1 student completing degree |
| **OPT STEM Extension** | +24 months | Degree in STEM field, employer is E-Verify enrolled |
| **CPT** | During studies | School-approved internship/practical training |

**Critical Rules:**
- **90-Day Unemployment Limit:** OPT/STEM cannot be unemployed more than 90 days aggregate
- **E-Verify:** STEM employers MUST use E-Verify
- **I-983 Training Plan:** STEM requires formal training plan with employer

**HR Actions:**
- Track unemployment days (system should auto-calculate)
- Verify E-Verify enrollment for STEM extensions
- Complete I-983 training plan for STEM
- Track OPT start/end dates carefully

---

#### E3: Australian Specialty Workers

| Property | Details |
|----------|---------|
| **Eligibility** | Australian citizens only |
| **Duration** | 2 years (renewable indefinitely) |
| **Similar to** | H1B but no annual cap |

---

#### O1: Extraordinary Ability

| Property | Details |
|----------|---------|
| **Eligibility** | Individuals with extraordinary ability in sciences, arts, education, business, athletics |
| **Duration** | 3 years (renewable in 1-year increments) |
| **Evidence** | Must provide extensive evidence of achievements |

---

### 6.3 Field Specifications: US Work Authorization

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `workAuthType` | Enum | Yes | See visa types | Primary work authorization category |
| `visaType` | Enum | Conditional | If non-citizen | Specific visa (H1B, L1, TN, etc.) |
| `i94Number` | String | Conditional | 11 digits | Required for non-immigrants |
| `i94ExpiryDate` | Date | Conditional | Future date | CRITICAL: Last day of work auth |
| `visaExpiryDate` | Date | Conditional | - | For travel only (separate from work auth) |
| `receiptNumber` | String | Conditional | Format: AAA1234567890 | USCIS receipt number (I-797) |
| `passportNumber` | String | Yes | - | Passport number |
| `passportExpiry` | Date | Yes | Future date | Must be valid 6+ months |
| `visaSponsor` | String | Conditional | - | Employer sponsoring visa |
| `prevailingWage` | Currency | Conditional | - | Required for H1B/E3 |
| `lcaNumber` | String | Conditional | - | LCA number for H1B |
| `lcaWorksite` | String | Conditional | - | Approved work location |
| `i140ApprovalDate` | Date | Optional | - | For H1B 6th year extensions |
| `optStartDate` | Date | Conditional | - | OPT start date |
| `optEndDate` | Date | Conditional | - | OPT end date (track unemployment) |
| `stemExtension` | Boolean | Conditional | - | Is this OPT STEM extension? |
| `eVerifyEnrolled` | Boolean | Conditional | - | Required TRUE for STEM OPT |
| `unemploymentDays` | Number | Conditional | Max 90 | Auto-calculated for OPT/STEM |

---

## 7. Canada Work Authorization Types

### 7.1 Canadian Citizens & Permanent Residents

| Type | Code | Work Auth | Documentation | Expiry Tracking |
|------|------|-----------|---------------|-----------------|
| **Canadian Citizen** | CITIZEN | Unlimited | Birth cert, passport, citizenship card | None |
| **Permanent Resident** | PR | Unlimited | PR Card | Card expires every 5 years |

---

### 7.2 Work Permits

#### Closed Work Permit (Employer-Specific)

| Property | Details |
|----------|---------|
| **Duration** | Varies (typically 1-3 years) |
| **Employer-Specific** | Yes - tied to specific employer and job |
| **LMIA-Based** | Usually requires positive Labour Market Impact Assessment |
| **Job Changes** | Cannot change employers without new work permit |

**HR Actions:**
- Ensure employee only works for InTime (not other employers)
- Monitor work permit expiry
- Start renewal 4-6 months before expiry

---

#### Open Work Permit (Any Employer)

| Type | Details |
|------|---------|
| **Open Work Permit** | Can work for any employer (except those on ineligible list) |
| **PGWP** | Post-Graduation Work Permit (for international students) - Duration: 1-3 years based on study program |
| **Spousal Open WP** | For spouses of skilled workers or international students |
| **Bridging OWP** | For PR applicants awaiting decision (while PR in progress) |

**HR Actions:**
- Verify permit has not expired
- For PGWP: Track expiry carefully (cannot be renewed)
- For Bridging OWP: Monitor PR application status

---

#### IEC: International Experience Canada

| Type | Duration | Eligibility |
|------|----------|-------------|
| **Working Holiday** | 1-2 years | Youth from partner countries |
| **Young Professionals** | Up to 2 years | Pre-arranged employment in field of study |
| **International Co-op** | Duration of study program | Internship related to field of study |

---

#### LMIA-Based Work Permits

| Property | Details |
|----------|---------|
| **LMIA** | Labour Market Impact Assessment from ESDC |
| **Processing** | LMIA: 2-6 months, Work Permit: 2-8 weeks |
| **Cost** | $1,000 LMIA fee (employer pays) |
| **Requirements** | Proof that no Canadian worker available |

**HR Actions:**
- Apply for LMIA through Service Canada
- Demonstrate recruitment efforts
- Pay prevailing wage
- After LMIA approval, employee applies for work permit

---

### 7.3 Field Specifications: Canada Work Authorization

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `workPermitType` | Enum | Conditional | CLOSED, OWP, PGWP, etc. | Type of work permit |
| `workPermitNumber` | String | Conditional | - | Work permit document number |
| `workPermitExpiry` | Date | Conditional | Future date | Cannot work after this date |
| `lmiaNumber` | String | Optional | - | If LMIA-based |
| `lmiaExpiry` | Date | Optional | - | LMIA validity period |
| `employer` | String | Conditional | - | For closed permits only |
| `pgwpBasis` | String | Optional | - | Institution and program for PGWP |
| `prApplicationNumber` | String | Optional | - | If on Bridging OWP |

---

## 8. Alternative Flows

### 8.1 Visa Expiring Within 30 Days

**Trigger:** System detects visa expiry within 30 days

**Flow:**
1. System generates CRITICAL alert
2. HR Manager receives email + in-app notification
3. HR escalates to Legal/Immigration team
4. Options:
   - Extension already filed → Monitor status daily
   - Extension not filed → Emergency filing (premium processing if available)
   - Extension cannot be filed → Plan for employee departure/gap
5. Notify affected stakeholders (employee, manager, client if consultant)
6. Document contingency plan

---

### 8.2 Visa Expired (Work Authorization Lapsed)

**Trigger:** I-94 or work permit expiry date passed

**CRITICAL RULE:** Employee **CANNOT** work after work authorization expires (even 1 day violation is serious)

**Flow:**
1. System automatically marks employee as "Cannot Work"
2. Immediate notification to HR, Manager, Payroll
3. If employee on client assignment: Immediate removal from site
4. Payroll: Stop processing hours
5. HR Actions:
   - Confirm status with immigration attorney
   - If extension pending with timely filing: May qualify for 240-day extension (US only)
   - If no extension: Employee must stop work immediately
   - Document incident in audit log
6. Resolution:
   - If extension approved: Reinstate employee, backdate if applicable
   - If extension denied: Offboard employee, arrange departure

---

### 8.3 Change of Employment Status (Job Title/Salary/Location)

**Trigger:** Employee's job changes significantly

**US (H1B/E3):**
- Material change requires H1B amendment
- Material change = significant title change, 20%+ salary change, or new worksite

**Flow:**
1. Manager notifies HR of planned change
2. HR reviews if amendment required
3. If required:
   - File LCA for new position/worksite
   - File H1B amendment with USCIS
   - Employee can start new role after amendment filed (some risk)
4. Update employee record with new details
5. Monitor amendment status

---

### 8.4 Cross-Border Transfer (US ↔ Canada)

**Scenario:** Moving employee from US operation to Canada (or reverse)

**Flow:**
1. Determine new work authorization needed:
   - **US Citizen → Canada:** Apply for work permit (may qualify for CUSMA/NAFTA professional)
   - **Canadian Citizen → US:** Apply for TN visa or other work visa
   - **Third Country National:** Requires appropriate visa for new country
2. Plan timeline (can take 3-12 months)
3. File appropriate applications
4. Coordinate relocation logistics
5. Ensure no employment gap
6. Update tax withholding, benefits, payroll
7. Close out previous country employment records

---

## 9. Business Rules

### 9.1 Immigration Compliance Rules

| Rule ID | Rule | Consequence of Violation |
|---------|------|--------------------------|
| **IM-001** | Employee cannot work after I-94/work permit expiry | Federal violation, fines, deportation, employer sanctions |
| **IM-002** | H1B employee cannot work outside LCA-approved worksites | Violation of LCA, potential H1B revocation |
| **IM-003** | H1B employee must be paid at least prevailing wage | DOL violation, fines, H1B revocation |
| **IM-004** | OPT/STEM cannot exceed 90 days cumulative unemployment | OPT/STEM termination, must leave US |
| **IM-005** | STEM OPT employers must use E-Verify | STEM extension denial/termination |
| **IM-006** | Closed work permits (Canada) are employer-specific | Cannot work for other employers |
| **IM-007** | Changes to H1B job require amendment if material | Violation of H1B terms |

---

### 9.2 Alert Level Thresholds

| Alert Level | Threshold | Action Required |
|-------------|-----------|-----------------|
| 🟢 **Valid** | > 180 days to expiry | Routine monitoring |
| 🟡 **Monitor** | 90-180 days to expiry | Begin renewal planning, attorney engagement |
| 🟠 **Warning** | 30-90 days to expiry | File renewal/extension immediately |
| 🔴 **Critical** | < 30 days to expiry | Daily monitoring, escalate to legal, contingency plan |
| ⚫ **Expired** | Past expiry date | STOP WORK immediately, emergency legal consult |

---

## 10. Screen Specifications

### 10.1 Immigration Tracker Dashboard

**Route:** `/employee/hr/compliance/immigration`
**Access:** HR Manager, Immigration Specialist

**Wireframe:** See Step 1 in Main Flow

**Components:**
- Alert Summary Cards (Critical, Warning, Monitor counts)
- Filterable/Searchable Data Table
- Bulk Actions (export, email reminders)
- Automated Alert Configuration

---

### 10.2 Employee Work Authorization Detail

**Route:** `/employee/hr/compliance/immigration/[employeeId]`
**Access:** HR Manager, Immigration Specialist

**Wireframe:** See Step 2 in Main Flow

**Components:**
- Work Authorization Timeline
- Document Upload/Management
- Communication Log
- Renewal Tracking
- Contingency Planning

---

## 11. Integration Points

### 11.1 E-Verify (US)

**System:** US Department of Homeland Security E-Verify
**Purpose:** Verify employment eligibility for new hires
**Timing:** Within 3 business days of hire

**Integration:**
- Submit I-9 data to E-Verify
- Receive verification result
- Handle tentative non-confirmations (TNC)
- Track case status

---

### 11.2 USCIS Case Status

**System:** USCIS (US Citizenship and Immigration Services)
**Purpose:** Track visa petition status
**Method:** API or web scraping of case status

**Integration:**
- Query case status by receipt number
- Parse status updates
- Alert on status changes

---

### 11.3 IRCC (Canada)

**System:** Immigration, Refugees and Citizenship Canada
**Purpose:** Track work permit applications
**Method:** Manual check or third-party API

---

## 12. Metrics & Analytics

| Metric | Calculation | Target | Purpose |
|--------|-------------|--------|---------|
| **Immigration Compliance Rate** | (Compliant employees / Total non-citizens) × 100 | 100% | Measure compliance |
| **Visa Expiration Response Time** | Avg days from 90-day alert to renewal filed | < 30 days | Measure proactive renewal |
| **Expired Authorization Incidents** | Count of employees who worked with expired auth | 0 | Risk metric |
| **Average Renewal Timeline** | Avg days from filing to approval | Track trend | Process optimization |
| **Immigration-Related Work Stoppages** | Count of employees unable to work due to visa issues | < 1 per year | Business continuity |

---

## 13. Test Cases

### TC-HR-006-001: Add New H1B Employee

**Preconditions:** Employee hired with H1B

**Steps:**
1. Navigate to Immigration Tracker
2. Click [+ Add Authorization]
3. Select employee
4. Select visa type: H1B
5. Enter all required fields (I-94 expiry, receipt number, LCA details, etc.)
6. Upload I-797, I-94, visa stamp, LCA
7. Save

**Expected Result:**
- Employee appears in tracker with correct status
- Alert level calculated based on I-94 expiry
- If < 90 days, appears in warning/critical section

---

### TC-HR-006-002: Visa Expiring in 30 Days Alert

**Preconditions:** Employee's I-94 expires in 30 days

**Steps:**
1. System runs daily alert check
2. Identifies employees expiring in 30 days
3. Sends email to HR Manager
4. Displays in Critical Alerts section

**Expected Result:**
- Email received with employee list
- Dashboard shows critical alert
- Employee marked with 🔴 status

---

### TC-HR-006-003: OPT Unemployment Tracking

**Preconditions:** Employee on OPT, not currently employed

**Steps:**
1. View OPT employee record
2. System displays unemployment day counter
3. Counter increments daily when no active employment
4. Alert triggers at 60 days (warning), 80 days (critical)

**Expected Result:**
- Unemployment days accurate
- Alert generated before 90-day limit
- Suggested actions: hire immediately or notify employee

---

## 14. Accessibility

- All immigration statuses have text labels (not just color)
- Screen reader announces alert levels
- Document upload supports drag-and-drop and file browser
- Keyboard navigation for all actions

---

## 15. Security

- SSN, passport numbers, visa details encrypted at rest (AES-256)
- Immigration documents stored in secure document vault
- Access logged in audit trail
- Only HR Manager, Immigration Specialist have access

---

## 16. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-30 | Initial comprehensive documentation for US + Canada |

---

**End of UC-HR-006**
