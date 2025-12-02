# Immigration Domain Tables

## Overview
The Immigration domain manages all aspects of immigration case processing, compliance, and document tracking for consultants and employees. This includes visa processing (H1B, Green Card, etc.), I-9 employment verification, document management, and attorney coordination.

## Tables Summary

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| [immigration_cases](./immigration_cases.md) | Core immigration case tracking (H1B, GC, etc.) | bench_consultants, immigration_attorneys, organizations |
| [immigration_alerts](./immigration_alerts.md) | Time-sensitive immigration alerts and deadlines | bench_consultants, user_profiles |
| [immigration_attorneys](./immigration_attorneys.md) | Directory of immigration attorneys and law firms | organizations |
| [immigration_documents](./immigration_documents.md) | Immigration document storage and verification | immigration_cases, user_profiles |
| [immigration_timelines](./immigration_timelines.md) | Case milestones and deadline tracking | immigration_cases |
| [i9_records](./i9_records.md) | I-9 Employment Eligibility Verification forms | employees, user_profiles |

## Entity Relationships

```
immigration_cases (hub)
├── immigration_documents (1:many) - Documents for each case
├── immigration_timelines (1:many) - Milestones for each case
├── immigration_attorneys (many:1) - Attorney handling case
├── bench_consultants (many:1) - Consultant for the case
├── organizations (many:1) - Employer/sponsor
└── user_profiles (many:1) - Case creator

immigration_alerts
├── bench_consultants (many:1) - Consultant receiving alert
└── user_profiles (many:1) - User who acknowledged

immigration_attorneys
└── organizations (many:1) - Organization using attorney

i9_records
├── employees (1:1) - Employee I-9 is for
└── user_profiles (many:1) - HR rep who created
```

## Domain Workflows

### 1. Immigration Case Management
**Purpose**: Track visa and green card cases from initiation to completion

**Flow**:
1. Create immigration case for consultant (case_type, status)
2. Assign immigration attorney if needed
3. Set employer/sponsor organization
4. Create timeline milestones with target dates
5. Upload supporting documents (visa, I-797, passport, etc.)
6. Update status as case progresses (in_progress → RFE → approved)
7. Set alerts for critical deadlines
8. Record actual completion date

**Key Tables**: immigration_cases, immigration_timelines, immigration_documents, immigration_alerts

### 2. Document Management
**Purpose**: Store, verify, and track immigration documents

**Flow**:
1. Upload documents to case (visa, work permit, passport, etc.)
2. Record issue_date and expiry_date
3. HR/Immigration team verifies documents
4. System monitors expiry dates
5. Create alerts before document expiration
6. Track verification status (verified_by, verified_at)

**Key Tables**: immigration_documents, immigration_alerts

### 3. Attorney Coordination
**Purpose**: Manage relationships with immigration law firms

**Flow**:
1. Add attorney to directory with specializations
2. Track firm, contact info, performance rating
3. Assign attorney to cases matching specialization
4. Monitor attorney performance (success rate, ratings)
5. Select best attorney for new cases based on type and rating

**Key Tables**: immigration_attorneys, immigration_cases

### 4. I-9 Employment Verification
**Purpose**: Ensure compliance with federal I-9 requirements

**Flow**:
1. Create I-9 record on or before employee's first day
2. Employee completes Section 1 (identity, work auth status)
3. Within 3 business days: employer completes Section 2
4. Employer physically examines original documents
5. Record List A OR (List B + List C) document info
6. Set reverification_date if work auth is temporary
7. Monitor expiration and trigger reverification alerts
8. Update status through workflow: pending → section1_complete → completed

**Key Tables**: i9_records, immigration_alerts

### 5. Alert & Compliance Monitoring
**Purpose**: Proactive deadline and expiration management

**Flow**:
1. System monitors immigration dates:
   - Case deadlines (RFE responses, filing dates)
   - Document expiration (visa, EAD, I-94)
   - I-9 reverification dates
   - Timeline milestone target dates
2. Create alerts based on severity:
   - Critical: < 7 days
   - High: 7-30 days
   - Medium: 30-60 days
   - Low: 60+ days
3. Show alerts to HR/Immigration team
4. Users acknowledge alerts when addressed
5. Track acknowledgment for audit purposes

**Key Tables**: immigration_alerts, immigration_cases, immigration_documents, i9_records

## Case Type Coverage

### H1B Visa Cases
- `h1b_transfer` - Transfer to new employer
- `h1b_extension` - Extend current H1B
- `h1b_amendment` - Amend H1B for job changes

### Green Card Cases
- `gc_perm` - Labor certification (first step)
- `gc_i140` - Immigrant petition (second step)
- `gc_i485` - Adjustment of status (final step)

### Other Visa Types
- `opt_extension` - OPT extensions for students
- `tn_renewal` - TN visa renewal (NAFTA)
- `l1_extension` - L1 visa extensions

## Status Values

### Immigration Case Status
- `not_started` - Case not yet initiated
- `in_progress` - Active processing
- `rfe` - Request for Evidence received
- `approved` - Case approved
- `denied` - Case denied
- `withdrawn` - Case withdrawn

### I-9 Status
- `pending` - Not yet completed
- `section1_complete` - Employee portion done
- `completed` - Fully verified
- `expired` - Needs reverification

## Key Features

### Compliance & Audit
- Complete audit trail for I-9 forms
- Document verification tracking
- Timeline milestone tracking
- Alert acknowledgment history

### Deadline Management
- Multi-level alert system (critical to low)
- Automatic alert creation from dates
- Reverification date monitoring
- Case milestone tracking

### Attorney Management
- Specialization-based assignment
- Performance rating system
- Multi-attorney support per org
- Contact information management

### Document Control
- Issue/expiry date tracking
- Verification workflow
- Multiple documents per case
- File storage integration

## Indexes & Performance

### High-Traffic Queries
- Cases by organization: `idx_immigration_cases_org_id`
- Cases by consultant: `idx_immigration_cases_consultant_id`
- Cases by status: `idx_immigration_cases_status`
- Alerts by consultant: `idx_immigration_alerts_consultant_id`
- Alerts by date: `idx_immigration_alerts_alert_date`
- I-9 by employee: `idx_i9_records_employee_id` (unique)
- I-9 by status: `idx_i9_records_status`

### Optimizations
- Indexed foreign keys for efficient joins
- Status indexes for filtering active cases
- Date indexes for alert queries
- Unique constraint on i9_records.employee_id (one I-9 per employee)

## Integration Points

### Bench Sales Module
- Immigration cases linked to bench consultants
- Track visa status for bench consultants
- Coordinate placement with visa timeline

### HR Module
- I-9 verification for new hires
- Document compliance tracking
- Employee work authorization monitoring

### File Storage
- Document file_url and file_id integration
- Support for S3 or other cloud storage
- Original filename preservation

### Activities/Communications
- Case updates logged as activities
- Attorney communication tracking
- Document upload/verification logged

## Compliance Notes

### I-9 Requirements
- Section 1: By first day of work
- Section 2: Within 3 business days of hire
- Retention: 3 years after hire OR 1 year after termination
- Reverification: When work authorization expires

### Immigration Case Requirements
- Attorney involvement for most visa cases
- Document retention for audit purposes
- USCIS receipt number tracking
- Priority date tracking for green cards

### Document Requirements
- Physical document verification for I-9
- Original documents must be examined
- Expiration date monitoring
- Timely reverification

## Future Enhancements
- Electronic I-9 with e-verify integration
- Attorney portal for case updates
- Premium processing tracking
- USCIS case status API integration
- Predictive timeline modeling based on historical data
- Attorney workload balancing
- Multi-beneficiary cases (dependents)
