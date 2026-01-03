/**
 * Entity Field Tracking Configurations
 *
 * Defines which fields to track for each entity type and how to display them.
 * Following Guidewire PolicyCenter pattern: track business-meaningful fields,
 * skip technical metadata (created_at, updated_at are implicit in history timestamp).
 *
 * @module lib/services/history-configs
 */

import type { ChangeType } from './history-service'

/**
 * Configuration for a tracked field
 */
export interface EntityFieldConfig {
  /** Human-readable label for the field */
  label: string
  /** Change type to use in history */
  changeType?: ChangeType
  /** Map of value -> display label */
  valueLabels?: Record<string, string>
  /** Should this field be masked in history (e.g., SSN) */
  sensitive?: boolean
}

/**
 * Field configurations by entity type
 */
export const ENTITY_FIELD_CONFIGS: Record<string, Record<string, EntityFieldConfig>> = {
  // ============================================
  // ACCOUNT (companies table, category in ['client', 'prospect'])
  // ============================================
  account: {
    status: {
      label: 'Status',
      changeType: 'status_change',
      valueLabels: {
        active: 'Active',
        inactive: 'Inactive',
        on_hold: 'On Hold',
        churned: 'Churned',
        do_not_use: 'Do Not Use',
      },
    },
    tier: {
      label: 'Account Tier',
      changeType: 'category_change',
      valueLabels: {
        strategic: 'Strategic',
        preferred: 'Preferred',
        standard: 'Standard',
        transactional: 'Transactional',
      },
    },
    segment: {
      label: 'Segment',
      changeType: 'category_change',
      valueLabels: {
        enterprise: 'Enterprise',
        mid_market: 'Mid-Market',
        smb: 'SMB',
        startup: 'Startup',
      },
    },
    industry: {
      label: 'Industry',
      changeType: 'custom',
    },
    sub_industry: {
      label: 'Sub-Industry',
      changeType: 'custom',
    },
    owner_id: {
      label: 'Owner',
      changeType: 'owner_change',
    },
    account_manager_id: {
      label: 'Account Manager',
      changeType: 'assignment_change',
    },
    nps_score: {
      label: 'NPS Score',
      changeType: 'score_change',
    },
    health_score: {
      label: 'Health Score',
      changeType: 'score_change',
    },
    relationship_type: {
      label: 'Relationship Type',
      changeType: 'category_change',
      valueLabels: {
        client: 'Client',
        prospect: 'Prospect',
        partner: 'Partner',
        vendor: 'Vendor',
      },
    },
    category: {
      label: 'Category',
      changeType: 'category_change',
      valueLabels: {
        client: 'Client',
        prospect: 'Prospect',
        vendor: 'Vendor',
        partner: 'Partner',
      },
    },
    name: {
      label: 'Name',
      changeType: 'custom',
    },
    legal_name: {
      label: 'Legal Name',
      changeType: 'custom',
    },
    website: {
      label: 'Website',
      changeType: 'custom',
    },
    phone: {
      label: 'Phone',
      changeType: 'custom',
    },
    annual_revenue: {
      label: 'Annual Revenue',
      changeType: 'custom',
    },
    employee_count: {
      label: 'Employee Count',
      changeType: 'custom',
    },
  },

  // ============================================
  // JOB (jobs table)
  // ============================================
  job: {
    status: {
      label: 'Status',
      changeType: 'status_change',
      valueLabels: {
        draft: 'Draft',
        open: 'Open',
        on_hold: 'On Hold',
        filled: 'Filled',
        closed: 'Closed',
        cancelled: 'Cancelled',
      },
    },
    priority: {
      label: 'Priority',
      changeType: 'priority_change',
      valueLabels: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        urgent: 'Urgent',
      },
    },
    owner_id: {
      label: 'Owner',
      changeType: 'owner_change',
    },
    recruiter_id: {
      label: 'Recruiter',
      changeType: 'assignment_change',
    },
    hiring_manager_contact_id: {
      label: 'Hiring Manager',
      changeType: 'assignment_change',
    },
    title: {
      label: 'Job Title',
      changeType: 'custom',
    },
    job_type: {
      label: 'Job Type',
      changeType: 'category_change',
      valueLabels: {
        contract: 'Contract',
        contract_to_hire: 'Contract to Hire',
        direct_hire: 'Direct Hire',
        temp: 'Temporary',
      },
    },
    positions_count: {
      label: 'Positions',
      changeType: 'custom',
    },
    positions_filled: {
      label: 'Positions Filled',
      changeType: 'custom',
    },
    billing_rate: {
      label: 'Bill Rate',
      changeType: 'custom',
    },
    pay_rate: {
      label: 'Pay Rate',
      changeType: 'custom',
    },
    rate_type: {
      label: 'Rate Type',
      changeType: 'custom',
      valueLabels: {
        hourly: 'Hourly',
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        annual: 'Annual',
      },
    },
    target_fill_date: {
      label: 'Target Fill Date',
      changeType: 'custom',
    },
    target_start_date: {
      label: 'Target Start Date',
      changeType: 'custom',
    },
    target_end_date: {
      label: 'Target End Date',
      changeType: 'custom',
    },
    location_city: {
      label: 'Location (City)',
      changeType: 'custom',
    },
    location_state: {
      label: 'Location (State)',
      changeType: 'custom',
    },
    remote_type: {
      label: 'Remote Type',
      changeType: 'custom',
      valueLabels: {
        onsite: 'On-site',
        remote: 'Remote',
        hybrid: 'Hybrid',
      },
    },
  },

  // ============================================
  // CONTACT (contacts table)
  // ============================================
  contact: {
    title: {
      label: 'Title',
      changeType: 'custom',
    },
    department: {
      label: 'Department',
      changeType: 'custom',
    },
    company_id: {
      label: 'Company',
      changeType: 'custom',
    },
    is_primary: {
      label: 'Primary Contact',
      changeType: 'custom',
      valueLabels: {
        true: 'Yes',
        false: 'No',
      },
    },
    decision_authority: {
      label: 'Decision Authority',
      changeType: 'category_change',
      valueLabels: {
        decision_maker: 'Decision Maker',
        influencer: 'Influencer',
        evaluator: 'Evaluator',
        user: 'User',
        gatekeeper: 'Gatekeeper',
      },
    },
    preferred_contact_method: {
      label: 'Preferred Contact Method',
      changeType: 'custom',
      valueLabels: {
        email: 'Email',
        phone: 'Phone',
        mobile: 'Mobile',
        linkedin: 'LinkedIn',
      },
    },
    status: {
      label: 'Status',
      changeType: 'status_change',
      valueLabels: {
        active: 'Active',
        inactive: 'Inactive',
        do_not_contact: 'Do Not Contact',
      },
    },
    first_name: {
      label: 'First Name',
      changeType: 'custom',
    },
    last_name: {
      label: 'Last Name',
      changeType: 'custom',
    },
    email: {
      label: 'Email',
      changeType: 'custom',
    },
    phone: {
      label: 'Phone',
      changeType: 'custom',
    },
    mobile: {
      label: 'Mobile',
      changeType: 'custom',
    },
    linkedin_url: {
      label: 'LinkedIn URL',
      changeType: 'custom',
    },
  },

  // ============================================
  // CANDIDATE (contacts table with is_candidate=true)
  // ============================================
  candidate: {
    status: {
      label: 'Status',
      changeType: 'status_change',
      valueLabels: {
        active: 'Active',
        placed: 'Placed',
        inactive: 'Inactive',
        do_not_use: 'Do Not Use',
        blacklisted: 'Blacklisted',
      },
    },
    availability_status: {
      label: 'Availability',
      changeType: 'status_change',
      valueLabels: {
        available: 'Available',
        on_assignment: 'On Assignment',
        not_looking: 'Not Looking',
        unavailable: 'Unavailable',
      },
    },
    availability_date: {
      label: 'Available Date',
      changeType: 'custom',
    },
    work_authorization: {
      label: 'Work Authorization',
      changeType: 'category_change',
      valueLabels: {
        us_citizen: 'US Citizen',
        green_card: 'Green Card',
        h1b: 'H-1B',
        opt: 'OPT',
        ead: 'EAD',
        other: 'Other',
      },
    },
    desired_rate: {
      label: 'Desired Rate',
      changeType: 'custom',
    },
    current_rate: {
      label: 'Current Rate',
      changeType: 'custom',
    },
    owner_id: {
      label: 'Owner',
      changeType: 'owner_change',
    },
    recruiter_id: {
      label: 'Recruiter',
      changeType: 'assignment_change',
    },
    source: {
      label: 'Source',
      changeType: 'category_change',
      valueLabels: {
        job_board: 'Job Board',
        linkedin: 'LinkedIn',
        referral: 'Referral',
        direct_application: 'Direct Application',
        agency: 'Agency',
        internal: 'Internal',
      },
    },
    first_name: {
      label: 'First Name',
      changeType: 'custom',
    },
    last_name: {
      label: 'Last Name',
      changeType: 'custom',
    },
    email: {
      label: 'Email',
      changeType: 'custom',
    },
    phone: {
      label: 'Phone',
      changeType: 'custom',
    },
    location_city: {
      label: 'Location (City)',
      changeType: 'custom',
    },
    location_state: {
      label: 'Location (State)',
      changeType: 'custom',
    },
    willing_to_relocate: {
      label: 'Willing to Relocate',
      changeType: 'custom',
      valueLabels: {
        true: 'Yes',
        false: 'No',
      },
    },
  },

  // ============================================
  // SUBMISSION (submissions table)
  // ============================================
  submission: {
    status: {
      label: 'Status',
      changeType: 'status_change',
      valueLabels: {
        draft: 'Draft',
        submitted: 'Submitted',
        client_review: 'Client Review',
        interview_scheduled: 'Interview Scheduled',
        offer_pending: 'Offer Pending',
        offer_extended: 'Offer Extended',
        placed: 'Placed',
        rejected: 'Rejected',
        withdrawn: 'Withdrawn',
      },
    },
    stage: {
      label: 'Stage',
      changeType: 'stage_change',
      valueLabels: {
        pre_submission: 'Pre-Submission',
        submission: 'Submission',
        interview: 'Interview',
        offer: 'Offer',
        placement: 'Placement',
      },
    },
    submitted_rate: {
      label: 'Submitted Rate',
      changeType: 'custom',
    },
    client_feedback: {
      label: 'Client Feedback',
      changeType: 'custom',
    },
    rejection_reason: {
      label: 'Rejection Reason',
      changeType: 'custom',
    },
    internal_rating: {
      label: 'Internal Rating',
      changeType: 'score_change',
    },
    submitted_by: {
      label: 'Submitted By',
      changeType: 'assignment_change',
    },
    submitted_at: {
      label: 'Submitted At',
      changeType: 'custom',
    },
  },

  // ============================================
  // PLACEMENT (placements table)
  // ============================================
  placement: {
    status: {
      label: 'Status',
      changeType: 'status_change',
      valueLabels: {
        pending: 'Pending',
        active: 'Active',
        completed: 'Completed',
        terminated: 'Terminated',
        on_hold: 'On Hold',
      },
    },
    start_date: {
      label: 'Start Date',
      changeType: 'custom',
    },
    end_date: {
      label: 'End Date',
      changeType: 'custom',
    },
    billing_rate: {
      label: 'Bill Rate',
      changeType: 'custom',
    },
    pay_rate: {
      label: 'Pay Rate',
      changeType: 'custom',
    },
    overtime_bill_rate: {
      label: 'OT Bill Rate',
      changeType: 'custom',
    },
    overtime_pay_rate: {
      label: 'OT Pay Rate',
      changeType: 'custom',
    },
    guaranteed_hours: {
      label: 'Guaranteed Hours',
      changeType: 'custom',
    },
  },

  // ============================================
  // ACTIVITY (activities table)
  // ============================================
  activity: {
    status: {
      label: 'Status',
      changeType: 'status_change',
      valueLabels: {
        scheduled: 'Scheduled',
        open: 'Open',
        in_progress: 'In Progress',
        completed: 'Completed',
        skipped: 'Skipped',
        cancelled: 'Cancelled',
      },
    },
    priority: {
      label: 'Priority',
      changeType: 'priority_change',
      valueLabels: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        urgent: 'Urgent',
      },
    },
    assigned_to: {
      label: 'Assigned To',
      changeType: 'assignment_change',
    },
    due_date: {
      label: 'Due Date',
      changeType: 'custom',
    },
    subject: {
      label: 'Subject',
      changeType: 'custom',
    },
  },
}

/**
 * Get display name for an entity type
 */
export function getEntityTypeLabel(entityType: string): string {
  const labels: Record<string, string> = {
    account: 'Account',
    job: 'Job',
    contact: 'Contact',
    candidate: 'Candidate',
    submission: 'Submission',
    placement: 'Placement',
    activity: 'Activity',
    note: 'Note',
    document: 'Document',
    meeting: 'Meeting',
    escalation: 'Escalation',
  }
  return labels[entityType] ?? entityType.charAt(0).toUpperCase() + entityType.slice(1)
}
