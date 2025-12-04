/**
 * Employee Detail Screen Definition
 *
 * Metadata-driven detail screen for employee profiles.
 * Features sidebar + main content with tabbed navigation.
 *
 * Per docs/specs/20-USER-ROLES/05-hr/10-employee-lifecycle.md
 * Tabs: Profile, Employment, Documents, Benefits, Time Off, Performance, Compliance, Payroll, Activities
 */

import type { ScreenDefinition, TabDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS (for badges/status)
// ==========================================

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'active', label: 'Active' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'terminated', label: 'Terminated' },
] as const;

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'full_time', label: 'Full-Time' },
  { value: 'part_time', label: 'Part-Time' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'intern', label: 'Intern' },
] as const;

const WORK_MODE_OPTIONS = [
  { value: 'on_site', label: 'On-Site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
] as const;

const TIME_OFF_TYPE_OPTIONS = [
  { value: 'pto', label: 'PTO' },
  { value: 'sick', label: 'Sick' },
  { value: 'personal', label: 'Personal' },
  { value: 'parental', label: 'Parental' },
  { value: 'bereavement', label: 'Bereavement' },
  { value: 'unpaid', label: 'Unpaid' },
] as const;

const TIME_OFF_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
] as const;

const GOAL_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'completed', label: 'Completed' },
] as const;

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'id', label: 'Photo ID' },
  { value: 'i9', label: 'I-9' },
  { value: 'w4', label: 'W-4' },
  { value: 'direct_deposit', label: 'Direct Deposit' },
  { value: 'tax_form', label: 'State Tax Form' },
  { value: 'work_authorization', label: 'Work Authorization' },
  { value: 'resume', label: 'Resume' },
  { value: 'offer_letter', label: 'Offer Letter' },
  { value: 'nda', label: 'NDA' },
  { value: 'other', label: 'Other' },
] as const;

const DOCUMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'expired', label: 'Expired' },
  { value: 'rejected', label: 'Rejected' },
] as const;

const COMPLIANCE_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
] as const;

const I9_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'section1_complete', label: 'Section 1 Complete' },
  { value: 'verified', label: 'Verified' },
  { value: 'reverify_needed', label: 'Reverification Needed' },
  { value: 'expired', label: 'Expired' },
] as const;

const BENEFIT_TYPE_OPTIONS = [
  { value: 'medical', label: 'Medical' },
  { value: 'dental', label: 'Dental' },
  { value: 'vision', label: 'Vision' },
  { value: '401k', label: '401(k)' },
  { value: 'life', label: 'Life Insurance' },
  { value: 'disability', label: 'Disability' },
  { value: 'hsa', label: 'HSA' },
  { value: 'fsa', label: 'FSA' },
] as const;

const REVIEW_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'self_review', label: 'Self Review' },
  { value: 'manager_review', label: 'Manager Review' },
  { value: 'complete', label: 'Complete' },
] as const;

const ACTIVITY_TYPE_OPTIONS = [
  { value: 'task', label: 'Task' },
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'note', label: 'Note' },
] as const;

const ACTIVITY_STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
] as const;

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const documentColumns: TableColumnDefinition[] = [
  {
    id: 'documentType',
    label: 'Type',
    path: 'documentType',
    type: 'enum',
    config: { options: DOCUMENT_TYPE_OPTIONS },
  },
  { id: 'fileName', label: 'File Name', path: 'fileName', type: 'text' },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: DOCUMENT_STATUS_OPTIONS,
      badgeColors: { pending: 'yellow', approved: 'green', expired: 'red', rejected: 'red' },
    },
  },
  { id: 'uploadedAt', label: 'Uploaded', path: 'uploadedAt', type: 'date' },
  { id: 'expiryDate', label: 'Expires', path: 'expiryDate', type: 'date' },
];

const benefitEnrollmentColumns: TableColumnDefinition[] = [
  {
    id: 'benefitType',
    label: 'Benefit',
    path: 'benefitType',
    type: 'enum',
    config: { options: BENEFIT_TYPE_OPTIONS },
  },
  { id: 'planName', label: 'Plan', path: 'planName', type: 'text' },
  { id: 'coverageLevel', label: 'Coverage', path: 'coverageLevel', type: 'text' },
  { id: 'effectiveDate', label: 'Effective Date', path: 'effectiveDate', type: 'date' },
  { id: 'employeeCost', label: 'Employee Cost', path: 'employeeCost', type: 'currency' },
  { id: 'employerCost', label: 'Employer Cost', path: 'employerCost', type: 'currency' },
];

const timeOffColumns: TableColumnDefinition[] = [
  {
    id: 'type',
    label: 'Type',
    path: 'type',
    type: 'enum',
    config: { options: TIME_OFF_TYPE_OPTIONS },
  },
  { id: 'startDate', label: 'Start', path: 'startDate', type: 'date', sortable: true },
  { id: 'endDate', label: 'End', path: 'endDate', type: 'date' },
  { id: 'totalDays', label: 'Days', path: 'totalDays', type: 'number' },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: TIME_OFF_STATUS_OPTIONS,
      badgeColors: { pending: 'yellow', approved: 'green', denied: 'red' },
    },
  },
  { id: 'notes', label: 'Notes', path: 'notes', type: 'text' },
];

const reviewColumns: TableColumnDefinition[] = [
  { id: 'reviewPeriod', label: 'Period', path: 'reviewPeriod', type: 'text' },
  { id: 'reviewType', label: 'Type', path: 'reviewType', type: 'text' },
  { id: 'dueDate', label: 'Due Date', path: 'dueDate', type: 'date', sortable: true },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: REVIEW_STATUS_OPTIONS,
      badgeColors: { pending: 'gray', self_review: 'blue', manager_review: 'purple', complete: 'green' },
    },
  },
  { id: 'overallRating', label: 'Rating', path: 'overallRating', type: 'number' },
];

const goalColumns: TableColumnDefinition[] = [
  { id: 'title', label: 'Goal', path: 'title', type: 'text', sortable: true },
  { id: 'category', label: 'Category', path: 'category', type: 'text' },
  { id: 'dueDate', label: 'Due Date', path: 'dueDate', type: 'date', sortable: true },
  { id: 'progress', label: 'Progress', path: 'progressPercent', type: 'progress', config: { max: 100 } },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: GOAL_STATUS_OPTIONS,
      badgeColors: { not_started: 'gray', in_progress: 'blue', at_risk: 'orange', completed: 'green' },
    },
  },
];

const complianceColumns: TableColumnDefinition[] = [
  { id: 'requirement', label: 'Requirement', path: 'requirement.name', type: 'text' },
  { id: 'type', label: 'Type', path: 'requirement.type', type: 'text' },
  { id: 'dueDate', label: 'Due Date', path: 'dueDate', type: 'date', sortable: true },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: COMPLIANCE_STATUS_OPTIONS,
      badgeColors: { pending: 'yellow', completed: 'green', overdue: 'red' },
    },
  },
  { id: 'completedAt', label: 'Completed', path: 'completedAt', type: 'date' },
];

const compensationColumns: TableColumnDefinition[] = [
  { id: 'effectiveDate', label: 'Effective Date', path: 'effectiveDate', type: 'date', sortable: true },
  { id: 'changeType', label: 'Type', path: 'changeType', type: 'text' },
  { id: 'previousSalary', label: 'Previous', path: 'previousSalary', type: 'currency' },
  { id: 'newSalary', label: 'New', path: 'newSalary', type: 'currency' },
  { id: 'changePercent', label: 'Change', path: 'changePercent', type: 'percentage' },
  { id: 'reason', label: 'Reason', path: 'reason', type: 'text' },
];

const activityColumns: TableColumnDefinition[] = [
  {
    id: 'type',
    label: 'Type',
    path: 'type',
    type: 'enum',
    config: { options: ACTIVITY_TYPE_OPTIONS },
  },
  { id: 'subject', label: 'Subject', path: 'subject', type: 'text' },
  { id: 'dueDate', label: 'Due Date', path: 'dueDate', type: 'date', sortable: true },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: ACTIVITY_STATUS_OPTIONS,
      badgeColors: { open: 'yellow', in_progress: 'blue', completed: 'green' },
    },
  },
  { id: 'assignedTo', label: 'Assigned To', path: 'assignedTo.fullName', type: 'text' },
  { id: 'completedAt', label: 'Completed', path: 'completedAt', type: 'date' },
];

// ==========================================
// TAB DEFINITIONS
// ==========================================

const profileTab: TabDefinition = {
  id: 'profile',
  label: 'Profile',
  icon: 'User',
  sections: [
    // Quick Log for Activity-Centric UI
    {
      id: 'quick-log',
      type: 'custom',
      component: 'QuickLogButtons',
      componentProps: {
        entityType: 'employee',
        types: ['call', 'email', 'note', 'task', 'meeting'],
      },
    },
    {
      id: 'personal-info',
      type: 'info-card',
      title: 'Personal Information',
      columns: 2,
      fields: [
        { id: 'firstName', label: 'First Name', type: 'text', path: 'firstName' },
        { id: 'lastName', label: 'Last Name', type: 'text', path: 'lastName' },
        { id: 'preferredName', label: 'Preferred Name', type: 'text', path: 'preferredName' },
        { id: 'pronouns', label: 'Pronouns', type: 'text', path: 'pronouns' },
        { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', path: 'dateOfBirth' },
        { id: 'ssn', label: 'SSN (last 4)', type: 'text', path: 'ssnLast4', config: { masked: true } },
      ],
    },
    {
      id: 'contact-info',
      type: 'info-card',
      title: 'Contact Information',
      columns: 2,
      fields: [
        { id: 'email', label: 'Email', type: 'email', path: 'email' },
        { id: 'personalEmail', label: 'Personal Email', type: 'email', path: 'personalEmail' },
        { id: 'phone', label: 'Phone', type: 'phone', path: 'phone' },
        { id: 'mobilePhone', label: 'Mobile', type: 'phone', path: 'mobilePhone' },
        { id: 'address', label: 'Address', type: 'address', path: 'address' },
      ],
    },
    {
      id: 'emergency-contact',
      type: 'info-card',
      title: 'Emergency Contact',
      columns: 2,
      fields: [
        { id: 'emergencyName', label: 'Name', type: 'text', path: 'emergencyContact.name' },
        { id: 'emergencyRelationship', label: 'Relationship', type: 'text', path: 'emergencyContact.relationship' },
        { id: 'emergencyPhone', label: 'Phone', type: 'phone', path: 'emergencyContact.phone' },
        { id: 'emergencyEmail', label: 'Email', type: 'email', path: 'emergencyContact.email' },
      ],
    },
  ],
};

const employmentTab: TabDefinition = {
  id: 'employment',
  label: 'Employment',
  icon: 'Briefcase',
  sections: [
    {
      id: 'position-info',
      type: 'info-card',
      title: 'Position Information',
      columns: 2,
      fields: [
        { id: 'jobTitle', label: 'Job Title', type: 'text', path: 'jobTitle' },
        { id: 'department', label: 'Department', type: 'text', path: 'department' },
        { id: 'manager', label: 'Manager', type: 'text', path: 'manager.fullName' },
        { id: 'location', label: 'Location', type: 'text', path: 'workLocation' },
        {
          id: 'employmentType',
          label: 'Employment Type',
          type: 'enum',
          path: 'employmentType',
          config: { options: EMPLOYMENT_TYPE_OPTIONS },
        },
        {
          id: 'workMode',
          label: 'Work Mode',
          type: 'enum',
          path: 'workMode',
          config: { options: WORK_MODE_OPTIONS },
        },
      ],
    },
    {
      id: 'dates-info',
      type: 'info-card',
      title: 'Important Dates',
      columns: 2,
      fields: [
        { id: 'hireDate', label: 'Hire Date', type: 'date', path: 'hireDate' },
        { id: 'startDate', label: 'Start Date', type: 'date', path: 'startDate' },
        { id: 'probationEndDate', label: 'Probation End', type: 'date', path: 'probationEndDate' },
        { id: 'tenure', label: 'Tenure', type: 'text', path: 'tenureDisplay' },
      ],
    },
    {
      id: 'compensation-info',
      type: 'info-card',
      title: 'Compensation',
      columns: 2,
      fields: [
        { id: 'salary', label: 'Annual Salary', type: 'currency', path: 'salary' },
        { id: 'payFrequency', label: 'Pay Frequency', type: 'text', path: 'payFrequency' },
        { id: 'flsaStatus', label: 'FLSA Status', type: 'text', path: 'flsaStatus' },
        { id: 'lastRaiseDate', label: 'Last Raise', type: 'date', path: 'lastRaiseDate' },
      ],
    },
  ],
};

const documentsTab: TabDefinition = {
  id: 'documents',
  label: 'Documents',
  icon: 'FileText',
  badge: { type: 'count', path: 'documentCount' },
  sections: [
    {
      id: 'documents-table',
      type: 'table',
      title: 'Employee Documents',
      columns_config: documentColumns,
      dataSource: {
        type: 'related',
        entityType: 'document',
        relation: 'documents',
      },
      emptyState: {
        title: 'No Documents',
        description: 'No documents have been uploaded for this employee',
        icon: 'FileText',
      },
      actions: [
        {
          id: 'upload-document',
          label: 'Upload Document',
          type: 'modal',
          variant: 'primary',
          icon: 'Upload',
          config: {
            type: 'modal',
            modal: 'UploadDocumentModal',
            props: { employeeId: { type: 'param', path: 'id' } },
          },
        },
      ],
    },
  ],
};

const benefitsTab: TabDefinition = {
  id: 'benefits',
  label: 'Benefits',
  icon: 'Heart',
  sections: [
    {
      id: 'benefit-summary',
      type: 'metrics-grid',
      title: 'Benefits Summary',
      columns: 4,
      fields: [
        { id: 'medicalPlan', label: 'Medical', type: 'text', path: 'benefits.medical.planName' },
        { id: 'dentalPlan', label: 'Dental', type: 'text', path: 'benefits.dental.planName' },
        { id: 'visionPlan', label: 'Vision', type: 'text', path: 'benefits.vision.planName' },
        { id: '401kContribution', label: '401(k) %', type: 'percentage', path: 'benefits.retirement.contributionPercent' },
      ],
    },
    {
      id: 'enrollments-table',
      type: 'table',
      title: 'Current Enrollments',
      columns_config: benefitEnrollmentColumns,
      dataSource: {
        type: 'related',
        entityType: 'benefitEnrollment',
        relation: 'benefitEnrollments',
        filter: { status: 'active' },
      },
    },
    {
      id: 'dependents-info',
      type: 'info-card',
      title: 'Dependents',
      collapsible: true,
      fields: [
        { id: 'dependentCount', label: 'Total Dependents', type: 'number', path: 'dependentCount' },
      ],
    },
  ],
};

const timeOffTab: TabDefinition = {
  id: 'time-off',
  label: 'Time Off',
  icon: 'Calendar',
  sections: [
    {
      id: 'balances',
      type: 'metrics-grid',
      title: 'Current Balances',
      columns: 4,
      fields: [
        { id: 'ptoAvailable', label: 'PTO Available', type: 'number', path: 'ptoBalance.available', config: { suffix: ' hrs' } },
        { id: 'ptoUsed', label: 'PTO Used', type: 'number', path: 'ptoBalance.used', config: { suffix: ' hrs' } },
        { id: 'sickAvailable', label: 'Sick Available', type: 'number', path: 'sickBalance.available', config: { suffix: ' hrs' } },
        { id: 'sickUsed', label: 'Sick Used', type: 'number', path: 'sickBalance.used', config: { suffix: ' hrs' } },
      ],
    },
    {
      id: 'accrual-info',
      type: 'info-card',
      title: 'Accrual Information',
      columns: 2,
      fields: [
        { id: 'accrualRate', label: 'Accrual Rate', type: 'text', path: 'accrualRate' },
        { id: 'maxCarryover', label: 'Max Carryover', type: 'number', path: 'maxCarryover', config: { suffix: ' hrs' } },
        { id: 'nextAccrualDate', label: 'Next Accrual', type: 'date', path: 'nextAccrualDate' },
        { id: 'yearEndReset', label: 'Year-End Reset', type: 'boolean', path: 'yearEndReset' },
      ],
    },
    {
      id: 'time-off-history',
      type: 'table',
      title: 'Request History',
      columns_config: timeOffColumns,
      dataSource: {
        type: 'related',
        entityType: 'timeoff',
        relation: 'timeOffRequests',
        sort: { field: 'startDate', direction: 'desc' },
      },
      actions: [
        {
          id: 'request-time-off',
          label: 'Request Time Off',
          type: 'modal',
          variant: 'primary',
          icon: 'Plus',
          config: {
            type: 'modal',
            modal: 'RequestTimeOffModal',
            props: { employeeId: { type: 'param', path: 'id' } },
          },
        },
      ],
    },
  ],
};

const performanceTab: TabDefinition = {
  id: 'performance',
  label: 'Performance',
  icon: 'Target',
  sections: [
    {
      id: 'reviews-table',
      type: 'table',
      title: 'Performance Reviews',
      columns_config: reviewColumns,
      dataSource: {
        type: 'related',
        entityType: 'performance',
        relation: 'performanceReviews',
        sort: { field: 'dueDate', direction: 'desc' },
      },
      rowClick: {
        type: 'navigate',
        route: '/employee/hr/performance/{{id}}',
      },
    },
    {
      id: 'goals-table',
      type: 'table',
      title: 'Performance Goals',
      columns_config: goalColumns,
      dataSource: {
        type: 'related',
        entityType: 'goal',
        relation: 'performanceGoals',
        sort: { field: 'dueDate', direction: 'asc' },
      },
      actions: [
        {
          id: 'add-goal',
          label: 'Add Goal',
          type: 'modal',
          variant: 'secondary',
          icon: 'Plus',
          config: {
            type: 'modal',
            modal: 'AddGoalModal',
            props: { employeeId: { type: 'param', path: 'id' } },
          },
        },
      ],
    },
    {
      id: 'pip-section',
      type: 'info-card',
      title: 'Performance Improvement Plan',
      collapsible: true,
      visible: { field: 'hasPip', operator: 'eq', value: true },
      fields: [
        { id: 'pipStatus', label: 'PIP Status', type: 'text', path: 'pip.status' },
        { id: 'pipStartDate', label: 'Start Date', type: 'date', path: 'pip.startDate' },
        { id: 'pipEndDate', label: 'End Date', type: 'date', path: 'pip.endDate' },
        { id: 'pipNotes', label: 'Notes', type: 'textarea', path: 'pip.notes' },
      ],
    },
  ],
};

const complianceTab: TabDefinition = {
  id: 'compliance',
  label: 'Compliance',
  icon: 'Shield',
  badge: { type: 'overdue-count', path: 'complianceOverdueCount', variant: 'destructive' },
  sections: [
    {
      id: 'i9-status',
      type: 'info-card',
      title: 'I-9 Verification',
      columns: 2,
      fields: [
        {
          id: 'i9Status',
          label: 'Status',
          type: 'enum',
          path: 'i9.status',
          config: {
            options: I9_STATUS_OPTIONS,
            badgeColors: {
              pending: 'yellow',
              section1_complete: 'blue',
              verified: 'green',
              reverify_needed: 'orange',
              expired: 'red',
            },
          },
        },
        { id: 'i9Section1Date', label: 'Section 1 Date', type: 'date', path: 'i9.section1Date' },
        { id: 'i9Section2Date', label: 'Section 2 Date', type: 'date', path: 'i9.section2Date' },
        { id: 'i9ExpirationDate', label: 'Expiration', type: 'date', path: 'i9.expirationDate' },
        { id: 'i9ReverifyDate', label: 'Reverification Due', type: 'date', path: 'i9.reverificationDate' },
      ],
    },
    {
      id: 'work-authorization',
      type: 'info-card',
      title: 'Work Authorization',
      columns: 2,
      visible: { field: 'requiresWorkAuth', operator: 'eq', value: true },
      fields: [
        { id: 'visaType', label: 'Visa Type', type: 'text', path: 'workAuth.visaType' },
        { id: 'visaStatus', label: 'Status', type: 'text', path: 'workAuth.status' },
        { id: 'visaExpiration', label: 'Expiration', type: 'date', path: 'workAuth.expirationDate' },
        { id: 'daysRemaining', label: 'Days Remaining', type: 'number', path: 'workAuth.daysRemaining' },
      ],
    },
    {
      id: 'compliance-items',
      type: 'table',
      title: 'Compliance Requirements',
      columns_config: complianceColumns,
      dataSource: {
        type: 'related',
        entityType: 'compliance',
        relation: 'complianceItems',
        sort: { field: 'dueDate', direction: 'asc' },
      },
    },
  ],
};

const payrollTab: TabDefinition = {
  id: 'payroll',
  label: 'Payroll',
  icon: 'DollarSign',
  sections: [
    {
      id: 'current-compensation',
      type: 'info-card',
      title: 'Current Compensation',
      columns: 2,
      fields: [
        { id: 'salary', label: 'Annual Salary', type: 'currency', path: 'salary' },
        { id: 'hourlyRate', label: 'Hourly Rate', type: 'currency', path: 'hourlyRate' },
        { id: 'payFrequency', label: 'Pay Frequency', type: 'text', path: 'payFrequency' },
        { id: 'flsaStatus', label: 'FLSA Status', type: 'text', path: 'flsaStatus' },
      ],
    },
    {
      id: 'deductions-info',
      type: 'info-card',
      title: 'Deductions',
      columns: 2,
      fields: [
        { id: 'federalWithholding', label: 'Federal Withholding', type: 'text', path: 'deductions.federalStatus' },
        { id: 'stateWithholding', label: 'State Withholding', type: 'text', path: 'deductions.stateStatus' },
        { id: 'benefitDeductions', label: 'Benefit Deductions', type: 'currency', path: 'deductions.benefitsTotal' },
        { id: 'otherDeductions', label: 'Other Deductions', type: 'currency', path: 'deductions.otherTotal' },
      ],
    },
    {
      id: 'compensation-history',
      type: 'table',
      title: 'Compensation History',
      columns_config: compensationColumns,
      dataSource: {
        type: 'related',
        entityType: 'compensation',
        relation: 'compensationHistory',
        sort: { field: 'effectiveDate', direction: 'desc' },
      },
    },
    {
      id: 'direct-deposit',
      type: 'info-card',
      title: 'Direct Deposit',
      columns: 2,
      fields: [
        { id: 'bankName', label: 'Bank', type: 'text', path: 'directDeposit.bankName' },
        { id: 'accountType', label: 'Account Type', type: 'text', path: 'directDeposit.accountType' },
        { id: 'accountLast4', label: 'Account (last 4)', type: 'text', path: 'directDeposit.accountLast4' },
        { id: 'routingLast4', label: 'Routing (last 4)', type: 'text', path: 'directDeposit.routingLast4' },
      ],
    },
  ],
};

const activitiesTab: TabDefinition = {
  id: 'activities',
  label: 'Activities',
  icon: 'Activity',
  badge: { type: 'count', path: 'activityCount' },
  sections: [
    {
      id: 'activity-timeline',
      type: 'custom',
      title: 'Activity Timeline',
      component: 'ActivityTimeline',
      componentProps: {
        entityType: 'employee',
        includeEvents: true,
        groupBy: 'day',
      },
      dataSource: {
        type: 'custom',
        query: {
          procedure: 'activities.getTimeline',
          params: {
            entityType: 'employee',
            entityId: { type: 'param', path: 'id' },
          },
        },
      },
    },
    {
      id: 'activities-table',
      type: 'table',
      title: 'All Activities',
      columns_config: activityColumns,
      dataSource: {
        type: 'related',
        entityType: 'activity',
        relation: 'activities',
        sort: { field: 'dueDate', direction: 'desc' },
      },
      actions: [
        {
          id: 'add-activity',
          label: 'Log Activity',
          type: 'modal',
          variant: 'primary',
          icon: 'Plus',
          config: {
            type: 'modal',
            modal: 'ActivityModal',
            props: {
              entityType: 'employee',
              entityId: { type: 'param', path: 'id' },
            },
          },
        },
      ],
    },
  ],
};

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const employeeDetailScreen: ScreenDefinition = {
  id: 'employee-detail',
  type: 'detail',
  entityType: 'employee',

  title: { type: 'field', path: 'fullName' },
  subtitle: { type: 'field', path: 'jobTitle' },
  icon: 'User',

  // Data source
  dataSource: {
    type: 'entity',
    entityType: 'employee',
    entityId: { type: 'param', path: 'id' },
  },

  // Layout: Sidebar + Tabs
  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebar: {
      id: 'sidebar',
      type: 'info-card',
      header: {
        type: 'avatar',
        path: 'avatarUrl',
        fallbackPath: 'initials',
        size: 'lg',
      },
      fields: [
        { id: 'fullName', type: 'text', path: 'fullName', label: 'Name' },
        { id: 'jobTitle', type: 'text', path: 'jobTitle', label: 'Title' },
        {
          id: 'status',
          type: 'enum',
          path: 'status',
          label: 'Status',
          config: {
            options: EMPLOYMENT_STATUS_OPTIONS,
            badgeColors: {
              onboarding: 'yellow',
              active: 'green',
              on_leave: 'orange',
              terminated: 'red',
            },
          },
        },
        { id: 'employeeNumber', label: 'Employee #', type: 'text', path: 'employeeNumber' },
        { id: 'department', label: 'Department', type: 'text', path: 'department' },
        { id: 'manager', label: 'Manager', type: 'text', path: 'manager.fullName' },
        { id: 'hireDate', label: 'Hire Date', type: 'date', path: 'hireDate' },
        { id: 'email', label: 'Email', type: 'email', path: 'email' },
        { id: 'phone', label: 'Phone', type: 'phone', path: 'phone' },
      ],
      footer: {
        type: 'quality-score',
        label: 'Profile Complete',
        path: 'profileCompleteness',
        maxValue: 100,
      },
    },
    tabs: [
      profileTab,
      employmentTab,
      documentsTab,
      benefitsTab,
      timeOffTab,
      performanceTab,
      complianceTab,
      payrollTab,
      activitiesTab,
    ],
    defaultTab: 'profile',
  },

  // Header Actions
  actions: [
    {
      id: 'edit',
      label: 'Edit',
      type: 'navigate',
      variant: 'secondary',
      icon: 'Pencil',
      config: {
        type: 'navigate',
        route: '/employee/hr/people/{{id}}/edit',
      },
    },
    {
      id: 'log-activity',
      label: 'Log Activity',
      type: 'modal',
      variant: 'secondary',
      icon: 'Plus',
      config: {
        type: 'modal',
        modal: 'ActivityModal',
        props: {
          entityType: 'employee',
          entityId: { type: 'param', path: 'id' },
        },
      },
    },
    {
      id: 'change-department',
      label: 'Change Department',
      type: 'modal',
      variant: 'outline',
      icon: 'Briefcase',
      config: {
        type: 'modal',
        modal: 'ChangeDepartmentModal',
        props: { employeeId: { type: 'param', path: 'id' } },
      },
    },
    {
      id: 'promote',
      label: 'Promote',
      type: 'modal',
      variant: 'outline',
      icon: 'TrendingUp',
      config: {
        type: 'modal',
        modal: 'PromoteEmployeeModal',
        props: { employeeId: { type: 'param', path: 'id' } },
      },
    },
    {
      id: 'terminate',
      label: 'Terminate',
      type: 'modal',
      variant: 'destructive',
      icon: 'UserX',
      config: {
        type: 'modal',
        modal: 'TerminateEmployeeModal',
        props: { employeeId: { type: 'param', path: 'id' } },
      },
      confirm: {
        title: 'Terminate Employee',
        message: 'Are you sure you want to terminate this employee? This action cannot be undone.',
        confirmLabel: 'Terminate',
        destructive: true,
      },
      visible: { field: 'status', operator: 'neq', value: 'terminated' },
    },
  ],

  // Navigation
  navigation: {
    back: {
      label: 'Back to Directory',
      route: '/employee/hr/people',
    },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Employee Directory', route: '/employee/hr/people' },
      { label: { type: 'field', path: 'fullName' } },
    ],
  },
};

export default employeeDetailScreen;
