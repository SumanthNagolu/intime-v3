# Candidate Portal User - Role Overview

**Role IDs**: `candidate_user`, `consultant_user`
**User Type**: External (Job Seekers, Active Consultants, Bench Consultants)
**Access Level**: Self-Service Portal
**Primary Focus**: Profile Management, Job Applications, Assignment Management

---

## Table of Contents

1. [Role Summary](#role-summary)
2. [Portal Types](#portal-types)
3. [Core Capabilities](#core-capabilities)
4. [Permissions Model](#permissions-model)
5. [User Lifecycle](#user-lifecycle)
6. [Portal Features](#portal-features)
7. [Mobile App Support](#mobile-app-support)
8. [Integration Points](#integration-points)
9. [Security & Privacy](#security--privacy)
10. [International Support](#international-support)

---

## Role Summary

### Overview

The Candidate Portal User represents external individuals who interact with InTime v3 for employment opportunities, whether as job seekers, active consultants on assignment, or bench consultants awaiting placement.

### Key Characteristics

- **External Users**: Not InTime employees
- **Self-Service**: Manage own profile and applications
- **Limited Scope**: Only access own data
- **Multi-Device**: Full mobile and desktop support
- **International**: Support for global candidates

### Role Variants

```typescript
type CandidatePortalRole =
  | 'candidate_user'      // Job seeker, applicant
  | 'consultant_user'     // Active/bench consultant

interface CandidateProfile {
  role_id: CandidatePortalRole;
  status: 'active' | 'inactive' | 'on_assignment' | 'available' | 'not_available';
  registration_source: 'direct' | 'linkedin' | 'referral' | 'job_board' | 'recruiter_invite';
  profile_completeness: number; // 0-100
  availability_status: AvailabilityStatus;
  work_authorization: WorkAuthorizationStatus[];
}
```

### Business Context

**For Job Seekers**:
- Discover and apply to relevant positions
- Track application progress
- Communicate with recruiters
- Prepare for interviews

**For Active Consultants**:
- Submit timesheets and expenses
- View assignment details
- Report issues or concerns
- Request extensions or changes

**For Bench Consultants**:
- Update availability status
- Maintain skills and certifications
- View marketing activities
- Respond to placement opportunities

---

## Portal Types

### 1. Candidate Portal (Job Seekers)

**Primary Users**: External job applicants

**Key Features**:
- Job search and discovery
- Application submission
- Application tracking
- Interview scheduling
- Offer management
- Profile management

**Access Pattern**:
```typescript
interface CandidateAccess {
  can_view: ['own_profile', 'public_jobs', 'own_applications'];
  can_create: ['applications', 'profile_updates'];
  can_update: ['own_profile', 'own_applications'];
  can_delete: ['own_applications_draft'];
  restrictions: ['no_internal_data', 'no_other_candidates'];
}
```

### 2. Consultant Portal (Active Assignments)

**Primary Users**: Consultants on client assignments

**Key Features**:
- Assignment dashboard
- Timesheet submission
- Expense reporting
- Document access
- Issue escalation
- Extension requests

**Access Pattern**:
```typescript
interface ConsultantAccess {
  can_view: [
    'own_profile',
    'own_assignment',
    'own_timesheets',
    'own_expenses',
    'assignment_documents'
  ];
  can_create: [
    'timesheets',
    'expense_reports',
    'support_tickets'
  ];
  can_update: [
    'own_profile',
    'timesheets_pending',
    'expense_reports_draft'
  ];
  restrictions: [
    'no_client_data',
    'no_other_consultants',
    'assignment_scope_only'
  ];
}
```

### 3. Bench Portal (Available Consultants)

**Primary Users**: Internal consultants awaiting placement

**Key Features**:
- Availability management
- Skills updates
- Certification tracking
- Marketing profile
- Placement opportunities
- Training access

**Access Pattern**:
```typescript
interface BenchConsultantAccess {
  can_view: [
    'own_profile',
    'own_marketing_activities',
    'placement_opportunities',
    'training_catalog'
  ];
  can_create: [
    'availability_updates',
    'certification_submissions',
    'training_enrollments'
  ];
  can_update: [
    'own_profile',
    'availability_status',
    'skill_matrix'
  ];
  restrictions: [
    'no_client_lists',
    'no_rate_information',
    'no_internal_operations'
  ];
}
```

---

## Core Capabilities

### Profile Management

**Self-Service Profile**:
- ✅ Update contact information
- ✅ Manage work history
- ✅ Add/remove skills and certifications
- ✅ Upload resumes and documents
- ✅ Set availability preferences
- ✅ Configure notifications
- ✅ Manage privacy settings

**Profile Completeness Tracking**:
```typescript
interface ProfileCompleteness {
  overall: number; // 0-100
  sections: {
    contact_info: number;
    work_history: number;
    education: number;
    skills: number;
    certifications: number;
    documents: number;
  };
  required_for_application: string[]; // Missing required fields
  recommendations: string[]; // Suggestions to improve
}
```

### Job Discovery & Application

**Job Search**:
- ✅ Browse open positions
- ✅ Filter by location, skills, rate
- ✅ Save searches and job alerts
- ✅ View matched jobs (AI-powered)
- ✅ Share jobs via link

**Application Process**:
- ✅ One-click apply (if profile complete)
- ✅ Custom cover letters
- ✅ Application status tracking
- ✅ Withdraw applications
- ✅ Reapply to positions

### Communication

**Candidate Communication Channels**:
- ✅ In-app messaging with recruiters
- ✅ Email notifications
- ✅ SMS alerts (opt-in)
- ✅ Interview scheduling
- ✅ Document requests

**Consultant Communication Channels**:
- ✅ Assignment-specific messaging
- ✅ Timesheet approvals
- ✅ Issue escalation
- ✅ Support tickets

### Assignment Management (Consultants)

**Timesheet Capabilities**:
- ✅ Weekly timesheet entry
- ✅ Project/task allocation
- ✅ Submit for approval
- ✅ View approval status
- ✅ Correct rejected timesheets
- ✅ Export timesheets

**Expense Management**:
- ✅ Create expense reports
- ✅ Upload receipts
- ✅ Submit for reimbursement
- ✅ Track reimbursement status

---

## Permissions Model

### Data Access Rules

```typescript
interface CandidatePermissions {
  // Own Data
  own_profile: ['read', 'update'];
  own_applications: ['read', 'create', 'update_draft', 'delete_draft'];
  own_interviews: ['read', 'update_availability'];
  own_offers: ['read', 'accept', 'decline'];

  // Assignment Data (Consultants)
  own_assignment: ['read'];
  own_timesheets: ['read', 'create', 'update_pending'];
  own_expenses: ['read', 'create', 'update_draft'];

  // Public/Shared Data
  public_jobs: ['read'];
  company_info: ['read'];

  // Restrictions
  cannot_access: [
    'other_candidates',
    'internal_notes',
    'client_data',
    'rate_margins',
    'recruiter_metrics'
  ];
}
```

### Role-Based Access Control

**Base Permissions** (All Candidate Portal Users):
```sql
-- View own profile
SELECT * FROM candidates WHERE id = auth.uid();

-- View own applications
SELECT * FROM applications WHERE candidate_id = auth.uid();

-- View public jobs
SELECT * FROM jobs WHERE status = 'published' AND is_public = true;
```

**Consultant-Specific Permissions**:
```sql
-- View own assignment
SELECT * FROM placements
WHERE candidate_id = auth.uid()
  AND status = 'active';

-- Submit timesheets for own assignment
INSERT INTO timesheets (placement_id, week_ending, hours)
SELECT placement_id, $week_ending, $hours
FROM placements
WHERE candidate_id = auth.uid() AND status = 'active';
```

### Privacy Controls

**Candidate Privacy Settings**:
- Profile visibility (recruiter search)
- Resume visibility
- Contact information sharing
- Work history visibility
- Salary/rate expectations

**Data Retention**:
- Active applications: Indefinite
- Rejected applications: 1 year
- Inactive profiles: 2 years (then archived)
- Consultant timesheets: 7 years (compliance)

---

## User Lifecycle

### Stage 1: Registration & Onboarding

```typescript
interface RegistrationFlow {
  source: RegistrationSource;
  steps: [
    'create_account',
    'verify_email',
    'basic_profile',
    'resume_upload',
    'skills_assessment',
    'preferences_setup'
  ];
  profile_completeness: number;
  can_apply: boolean; // true if >= 60% complete
}

type RegistrationSource =
  | 'direct'           // Direct registration
  | 'linkedin'         // LinkedIn OAuth
  | 'referral'         // Referred by employee
  | 'job_board'        // External job board
  | 'recruiter_invite' // Invited by recruiter
```

**Registration Options**:
1. Email/Password
2. LinkedIn OAuth
3. Google OAuth
4. Referral Link
5. Recruiter Invitation

### Stage 2: Active Job Seeker

**Typical Activities**:
- Search and apply to jobs
- Update profile and resume
- Respond to recruiter outreach
- Schedule and attend interviews
- Review and accept offers

**Engagement Metrics**:
- Profile views by recruiters
- Application submissions
- Interview conversions
- Time to placement

### Stage 3: Placement & Onboarding

**Transition to Consultant**:
```typescript
interface PlacementTransition {
  from_role: 'candidate_user';
  to_role: 'consultant_user';
  triggers: [
    'offer_accepted',
    'onboarding_complete',
    'assignment_start_date'
  ];
  new_capabilities: [
    'timesheet_submission',
    'expense_reporting',
    'assignment_dashboard'
  ];
}
```

### Stage 4: Active Assignment

**Consultant Lifecycle**:
- Daily: Log work hours
- Weekly: Submit timesheets
- Monthly: Expense reporting
- Quarterly: Performance reviews
- Annual: Contract renewals

### Stage 5: Bench or Offboarding

**Bench Status**:
- Between assignments
- Available for placement
- Skills refresh/training
- Marketing to clients

**Offboarding**:
- Assignment completion
- Final timesheet submission
- Exit survey
- Alumni network access

---

## Portal Features

### Dashboard Views

**Candidate Dashboard**:
```typescript
interface CandidateDashboard {
  sections: {
    profile_completeness: ProfileWidget;
    active_applications: ApplicationList;
    job_matches: JobMatchWidget;
    upcoming_interviews: InterviewCalendar;
    recent_activity: ActivityFeed;
    messages: MessageInbox;
  };
  quick_actions: [
    'search_jobs',
    'update_profile',
    'upload_resume',
    'check_messages'
  ];
}
```

**Consultant Dashboard**:
```typescript
interface ConsultantDashboard {
  sections: {
    current_assignment: AssignmentCard;
    pending_timesheets: TimesheetWidget;
    upcoming_deadlines: DeadlineCalendar;
    pay_stubs: PaymentHistory;
    messages: MessageInbox;
    support: SupportWidget;
  };
  quick_actions: [
    'submit_timesheet',
    'report_expense',
    'contact_recruiter',
    'view_assignment'
  ];
}
```

### Notification System

**Notification Types**:
```typescript
type CandidateNotification =
  | 'application_status_change'
  | 'interview_scheduled'
  | 'offer_received'
  | 'message_received'
  | 'job_match_found'
  | 'profile_viewed'
  | 'timesheet_approved'
  | 'timesheet_rejected'
  | 'expense_reimbursed'
  | 'assignment_update';

interface NotificationPreferences {
  channels: {
    in_app: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  frequency: 'instant' | 'daily_digest' | 'weekly_digest';
  enabled_types: CandidateNotification[];
}
```

### Document Management

**Candidate Documents**:
- Resumes (multiple versions)
- Cover letters
- Certifications
- Work samples/portfolio
- References

**Consultant Documents**:
- Timesheets (submitted & approved)
- Expense reports
- Tax documents (W-2, 1099)
- Compliance documents
- Assignment agreements

---

## Mobile App Support

### Mobile-First Design

**Core Mobile Features**:
- ✅ Job search and apply
- ✅ Application tracking
- ✅ Timesheet submission (quick entry)
- ✅ Push notifications
- ✅ In-app messaging
- ✅ Document camera upload
- ✅ Offline mode (limited)

### Platform Support

**iOS App** (React Native):
- iOS 14.0+
- Native notifications
- Face ID/Touch ID
- Camera access (resume upload)
- Calendar integration

**Android App** (React Native):
- Android 10+
- Fingerprint/Pattern unlock
- Camera access
- Calendar integration
- Google Drive integration

**Progressive Web App** (PWA):
- Offline job search
- Cached profile data
- Service worker notifications
- Install to home screen

### Mobile-Specific Workflows

**Quick Timesheet Entry** (Mobile):
```typescript
interface QuickTimesheetEntry {
  mode: 'voice' | 'quick_fill' | 'copy_previous';
  validation: 'relaxed'; // Stricter validation on desktop
  offline_support: true;
  auto_sync: true;
}
```

**Mobile Application**:
```typescript
interface MobileApplication {
  quick_apply: boolean; // One-tap if profile complete
  resume_selector: 'camera' | 'gallery' | 'cloud';
  cover_letter: 'template' | 'voice_to_text' | 'skip';
  submit_method: 'instant' | 'offline_queue';
}
```

---

## Integration Points

### External Integrations

**Job Boards**:
- Indeed integration
- LinkedIn Jobs sync
- Glassdoor posting
- Monster import
- Dice (tech roles)

**Background Checks**:
- Checkr integration
- Drug screening coordination
- Reference check automation

**Skill Assessments**:
- Codility (technical)
- HackerRank (developers)
- LinkedIn Skill Assessments
- Custom assessments

### Internal Integrations

**InTime Modules**:
```typescript
interface CandidateIntegrations {
  recruiting: {
    application_tracking: true;
    interview_scheduling: true;
    offer_management: true;
  };

  bench_sales: {
    marketing_activities: 'consultant_user';
    placement_tracking: 'consultant_user';
  };

  hr: {
    onboarding: 'post_offer_acceptance';
    timesheet_approvals: 'consultant_user';
    expense_processing: 'consultant_user';
  };

  academy: {
    training_access: 'bench_consultants';
    skill_certifications: true;
    compliance_training: 'consultant_user';
  };
}
```

---

## Security & Privacy

### Authentication

**Methods Supported**:
- Email/Password (required MFA for consultants)
- LinkedIn OAuth
- Google OAuth
- SSO (enterprise consultants)

**Session Management**:
```typescript
interface CandidateSession {
  max_duration: '7_days'; // Remember me
  idle_timeout: '30_minutes';
  concurrent_sessions: 3; // Desktop + mobile + tablet
  mfa_required: boolean; // true for consultants
  ip_restrictions: false; // Candidates are external
}
```

### Data Privacy

**GDPR Compliance**:
- ✅ Right to access (data export)
- ✅ Right to rectification (profile updates)
- ✅ Right to erasure (account deletion)
- ✅ Right to data portability (JSON export)
- ✅ Right to object (opt-out of marketing)

**Data Export**:
```typescript
interface CandidateDataExport {
  format: 'json' | 'pdf' | 'csv';
  includes: [
    'profile_data',
    'application_history',
    'interview_history',
    'communications',
    'timesheets',
    'payments'
  ];
  delivery: 'email_link' | 'instant_download';
  retention: '30_days'; // Export link valid for 30 days
}
```

### Audit Trail

**Tracked Activities**:
- Profile updates
- Application submissions
- Timesheet submissions
- Document uploads
- Login/logout events
- Data exports

---

## International Support

### Multi-Language Support

**Supported Languages**:
- English (US, UK, AU)
- Spanish (ES, MX)
- French (FR, CA)
- German
- Portuguese (BR)
- Hindi
- Mandarin

**Localization**:
```typescript
interface LocalizationSupport {
  ui_language: string;
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  currency: string; // ISO 4217 code
  timezone: string; // IANA timezone
  number_format: 'en-US' | 'de-DE' | 'fr-FR';
}
```

### Regional Compliance

**Work Authorization**:
- US: H-1B, Green Card, Citizen
- UK: Tier 2, ILR, Citizen
- EU: Work Permit, EU Citizen
- Canada: Work Permit, PR, Citizen
- Australia: 457 Visa, PR, Citizen

**Tax Documents by Region**:
- US: W-2, 1099, W-4
- UK: P60, P45
- Canada: T4, T4A
- EU: Country-specific forms

### Currency & Payment

**Rate Display**:
```typescript
interface RateLocalization {
  display_currency: string; // USD, EUR, GBP, etc.
  conversion_rate: number;
  original_currency: string;
  last_updated: Date;
  show_both: boolean; // Show USD and local
}
```

**Payment Methods by Region**:
- US: Direct deposit (ACH), Wire
- UK: BACS, Faster Payments
- EU: SEPA transfer
- International: Wire transfer, PayPal

---

## Success Metrics

### Candidate Engagement

**Key Metrics**:
- Profile completion rate: >80%
- Application submission rate: >5/month (active seekers)
- Interview show-up rate: >90%
- Offer acceptance rate: >75%
- Time to first application: <24 hours

### Consultant Productivity

**Key Metrics**:
- Timesheet submission on-time: >95%
- Expense report accuracy: >98%
- Support ticket resolution: <24 hours
- Mobile app adoption: >60%

### Portal Experience

**User Satisfaction**:
- NPS Score: >70
- App store rating: >4.5/5
- Support ticket volume: <5% of users/month
- Self-service resolution: >80%

---

## Related Documentation

- [01-portal-onboarding.md](./01-portal-onboarding.md) - Registration and onboarding flows
- [02-manage-profile.md](./02-manage-profile.md) - Profile management capabilities
- [03-view-submissions.md](./03-view-submissions.md) - Application tracking
- [04-prepare-interview.md](./04-prepare-interview.md) - Interview preparation
- [05-manage-placement.md](./05-manage-placement.md) - Placement management (consultants)
- [06-search-apply-jobs.md](./06-search-apply-jobs.md) - Job search and application
