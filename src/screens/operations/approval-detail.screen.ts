/**
 * Approval Detail Screen
 *
 * Detailed view for reviewing and approving submissions, offers,
 * rate overrides, and other items requiring manager approval.
 *
 * @see docs/specs/20-USER-ROLES/04-manager/04-approve-submission.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const approvalDetailScreen: ScreenDefinition = {
  id: 'approval-detail',
  type: 'detail',
  entityType: 'approval',
  title: { type: 'field', path: 'approval.subject' },
  subtitle: 'Approval Request',
  icon: 'CheckCircle',

  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'approval', procedure: 'approvals.getById', input: { id: { type: 'param', path: 'id' } } },
      { key: 'entity', procedure: 'approvals.getRelatedEntity', input: { id: { type: 'param', path: 'id' } } },
      { key: 'similarApprovals', procedure: 'approvals.getSimilar', input: { id: { type: 'param', path: 'id' } } },
    ],
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'right',
    sidebar: {
      id: 'approval-sidebar',
      type: 'custom',
      component: 'ApprovalSidebar',
      componentProps: {
        approval: { type: 'field', path: 'approval' },
      },
    },
    sections: [
      // ===========================================
      // APPROVAL TRIGGER
      // ===========================================
      {
        id: 'approval-trigger',
        type: 'custom',
        title: 'Approval Required Because',
        component: 'ApprovalTriggerCard',
        componentProps: {
          triggers: { type: 'field', path: 'approval.triggers' },
          primaryTrigger: { type: 'field', path: 'approval.primaryTrigger' },
        },
      },

      // ===========================================
      // RATE DETAILS (FOR SUBMISSION/OFFER APPROVALS)
      // ===========================================
      {
        id: 'rate-details',
        type: 'custom',
        title: 'Rate Details',
        component: 'RateComparisonCard',
        componentProps: {
          candidatePayRate: { type: 'field', path: 'entity.payRate' },
          submittedBillRate: { type: 'field', path: 'entity.billRate' },
          jobMinRate: { type: 'field', path: 'entity.job.minBillRate' },
          jobMaxRate: { type: 'field', path: 'entity.job.maxBillRate' },
          margin: { type: 'field', path: 'entity.margin' },
          marginPercent: { type: 'field', path: 'entity.marginPercent' },
          targetMargin: { type: 'field', path: 'entity.job.targetMargin' },
          estimatedAnnualRevenue: { type: 'field', path: 'entity.estimatedAnnualRevenue' },
        },
        visible: {
          type: 'condition',
          condition: { field: 'approval.approvalType', operator: 'in', value: ['submission', 'offer', 'rate_override', 'negative_margin'] },
        },
      },

      // ===========================================
      // CANDIDATE PROFILE (FOR SUBMISSIONS)
      // ===========================================
      {
        id: 'candidate-profile',
        type: 'info-card',
        title: 'Candidate Profile',
        fields: [
          { id: 'name', label: 'Name', path: 'entity.candidate.fullName', type: 'text' },
          { id: 'location', label: 'Location', path: 'entity.candidate.location', type: 'text' },
          { id: 'experience', label: 'Experience', path: 'entity.candidate.yearsExperience', type: 'text', config: { suffix: ' years' } },
          { id: 'status', label: 'Status', path: 'entity.candidate.status', type: 'text' },
          { id: 'match-score', label: 'Match Score', path: 'entity.matchScore', type: 'percentage' },
        ],
        visible: {
          type: 'condition',
          condition: { field: 'approval.approvalType', operator: 'in', value: ['submission', 'offer'] },
        },
      },

      // ===========================================
      // KEY SKILLS
      // ===========================================
      {
        id: 'key-skills',
        type: 'custom',
        title: 'Key Skills Match',
        component: 'SkillsMatchGrid',
        componentProps: {
          candidateSkills: { type: 'field', path: 'entity.candidate.skills' },
          requiredSkills: { type: 'field', path: 'entity.job.requiredSkills' },
        },
        visible: {
          type: 'condition',
          condition: { field: 'approval.approvalType', operator: 'in', value: ['submission', 'offer'] },
        },
      },

      // ===========================================
      // JOB REQUIREMENTS
      // ===========================================
      {
        id: 'job-requirements',
        type: 'info-card',
        title: 'Job Requirements',
        fields: [
          { id: 'title', label: 'Job Title', path: 'entity.job.title', type: 'link', config: { linkPattern: '/employee/recruiting/jobs/{{entity.job.id}}' } },
          { id: 'client', label: 'Client', path: 'entity.job.accountName', type: 'link', config: { linkPattern: '/employee/crm/accounts/{{entity.job.accountId}}' } },
          { id: 'experience', label: 'Experience Required', path: 'entity.job.experienceRequired', type: 'text' },
          { id: 'location', label: 'Location', path: 'entity.job.location', type: 'text' },
          { id: 'rate-range', label: 'Rate Range', path: 'entity.job.rateRange', type: 'text' },
          { id: 'is-strategic', label: 'Strategic Account', path: 'entity.job.isStrategicAccount', type: 'boolean' },
        ],
        visible: {
          type: 'condition',
          condition: { field: 'entity.job', operator: 'neq', value: null },
        },
      },

      // ===========================================
      // IC JUSTIFICATION
      // ===========================================
      {
        id: 'ic-justification',
        type: 'info-card',
        title: 'IC\'s Justification',
        fields: [
          { id: 'justification', label: '', path: 'approval.justification', type: 'textarea' },
        ],
      },

      // ===========================================
      // SUPPORTING DOCUMENTS
      // ===========================================
      {
        id: 'supporting-documents',
        type: 'custom',
        title: 'Supporting Documents',
        component: 'AttachmentsList',
        componentProps: {
          dataPath: 'approval.attachments',
          allowUpload: false,
        },
      },

      // ===========================================
      // CLIENT CONTEXT
      // ===========================================
      {
        id: 'client-context',
        type: 'info-card',
        title: 'Client Context',
        fields: [
          { id: 'account', label: 'Account', path: 'entity.account.name', type: 'text' },
          { id: 'is-strategic', label: 'Strategic Account', path: 'entity.account.isStrategic', type: 'boolean' },
          { id: 'revenue', label: 'Annual Revenue', path: 'entity.account.annualRevenue', type: 'currency' },
          { id: 'active-placements', label: 'Active Placements', path: 'entity.account.activePlacements', type: 'number' },
          { id: 'nps', label: 'NPS Score', path: 'entity.account.nps', type: 'number' },
          { id: 'health', label: 'Relationship Health', path: 'entity.account.healthScore', type: 'enum', config: {
            options: [
              { value: 'excellent', label: 'Excellent', color: 'green' },
              { value: 'good', label: 'Good', color: 'blue' },
              { value: 'moderate', label: 'Moderate', color: 'yellow' },
              { value: 'at_risk', label: 'At Risk', color: 'red' },
            ],
          }},
        ],
        visible: {
          type: 'condition',
          condition: { field: 'entity.account', operator: 'neq', value: null },
        },
      },

      // ===========================================
      // SIMILAR APPROVALS (HISTORICAL)
      // ===========================================
      {
        id: 'similar-approvals',
        type: 'table',
        title: 'Similar Approvals (Historical)',
        description: 'Previous approvals for similar scenarios',
        dataSource: { type: 'field', path: 'similarApprovals' },
        columns_config: [
          { id: 'subject', header: 'Subject', path: 'subject', type: 'text' },
          { id: 'type', header: 'Type', path: 'approvalType', type: 'text' },
          { id: 'decision', header: 'Decision', path: 'decision', type: 'enum', config: {
            options: [
              { value: 'approved', label: 'Approved', color: 'green' },
              { value: 'rejected', label: 'Rejected', color: 'red' },
              { value: 'conditional', label: 'Conditional', color: 'blue' },
            ],
          }},
          { id: 'rate', header: 'Rate', path: 'billRate', type: 'currency' },
          { id: 'margin', header: 'Margin', path: 'marginPercent', type: 'percentage' },
          { id: 'date', header: 'Date', path: 'decidedAt', type: 'date' },
        ],
        collapsible: true,
        defaultExpanded: false,
      },

      // ===========================================
      // DECISION FORM
      // ===========================================
      {
        id: 'decision-form',
        type: 'form',
        title: 'Your Decision',
        visible: {
          type: 'condition',
          condition: { field: 'approval.status', operator: 'eq', value: 'pending' },
        },
        fields: [
          {
            id: 'decision',
            label: 'Decision',
            type: 'radio',
            path: 'decision.outcome',
            options: [
              { value: 'approved', label: 'Approve', description: 'Proceed as requested' },
              { value: 'approved_with_note', label: 'Approve with Note', description: 'Approve but provide guidance to IC' },
              { value: 'conditional', label: 'Conditional Approval', description: 'Approve only if conditions are met' },
              { value: 'rejected', label: 'Reject', description: 'Do not proceed, provide feedback' },
              { value: 'request_info', label: 'Request More Info', description: 'Need additional details before deciding' },
            ],
          },
          {
            id: 'manager-notes',
            label: 'Notes to IC',
            type: 'textarea',
            path: 'decision.notes',
            config: { placeholder: 'Provide feedback, guidance, or conditions...', minRows: 4 },
          },
          {
            id: 'conditions',
            label: 'Conditions',
            type: 'textarea',
            path: 'decision.conditions',
            config: { placeholder: 'Specify conditions that must be met...' },
            visible: {
              type: 'condition',
              condition: { field: 'decision.outcome', operator: 'eq', value: 'conditional' },
            },
          },
          {
            id: 'internal-notes',
            label: 'Internal Notes (Not visible to IC)',
            type: 'textarea',
            path: 'decision.internalNotes',
            config: { placeholder: 'Notes for your own reference...' },
          },
        ],
        actions: [
          {
            id: 'submit-decision',
            label: 'Submit Decision',
            type: 'mutation',
            icon: 'Check',
            variant: 'primary',
            config: { type: 'mutation', procedure: 'approvals.decide' },
          },
        ],
      },

      // ===========================================
      // DECISION HISTORY (IF ALREADY DECIDED)
      // ===========================================
      {
        id: 'decision-history',
        type: 'info-card',
        title: 'Decision',
        visible: {
          type: 'condition',
          condition: { field: 'approval.status', operator: 'neq', value: 'pending' },
        },
        fields: [
          { id: 'decision', label: 'Decision', path: 'approval.decision', type: 'enum', config: {
            options: [
              { value: 'approved', label: 'Approved', color: 'green' },
              { value: 'rejected', label: 'Rejected', color: 'red' },
              { value: 'conditional', label: 'Conditional', color: 'blue' },
            ],
          }},
          { id: 'decided-by', label: 'Decided By', path: 'approval.decidedBy.fullName', type: 'user' },
          { id: 'decided-at', label: 'Decided At', path: 'approval.decidedAt', type: 'datetime' },
          { id: 'notes', label: 'Notes', path: 'approval.decisionNotes', type: 'textarea' },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'quick-approve',
      label: 'Approve',
      type: 'modal',
      icon: 'Check',
      variant: 'primary',
      config: { type: 'modal', modal: 'quick-approve' },
      visible: {
        type: 'condition',
        condition: { field: 'approval.status', operator: 'eq', value: 'pending' },
      },
    },
    {
      id: 'quick-reject',
      label: 'Reject',
      type: 'modal',
      icon: 'X',
      variant: 'destructive',
      config: { type: 'modal', modal: 'quick-reject' },
      visible: {
        type: 'condition',
        condition: { field: 'approval.status', operator: 'eq', value: 'pending' },
      },
    },
    {
      id: 'request-info',
      label: 'Request Info',
      type: 'modal',
      icon: 'HelpCircle',
      variant: 'secondary',
      config: { type: 'modal', modal: 'request-more-info' },
      visible: {
        type: 'condition',
        condition: { field: 'approval.status', operator: 'eq', value: 'pending' },
      },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Manager', route: '/employee/manager' },
      { label: 'Approvals', route: '/employee/manager/approvals' },
      { label: { type: 'field', path: 'approval.subject' }, active: true },
    ],
  },
};

export default approvalDetailScreen;
