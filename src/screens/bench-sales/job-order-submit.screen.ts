/**
 * Job Order Submit Screen
 *
 * Split view for submitting consultants to job orders.
 * Left: Job order summary and requirements
 * Right: Consultant selector with match indicators
 *
 * Per 00-OVERVIEW.md Section 8.2:
 * - Skills match (>70% required)
 * - Visa match (>180 days validity or pending renewal)
 * - Rate match
 *
 * @see docs/specs/20-USER-ROLES/02-bench-sales/05-submit-bench-consultant.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';
import { fieldValue } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const CONTRACT_TYPE_OPTIONS = [
  { value: 'c2c', label: 'C2C' },
  { value: 'w2', label: 'W2' },
  { value: '1099', label: '1099' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const jobOrderSubmitScreen: ScreenDefinition = {
  id: 'job-order-submit',
  type: 'detail',
  entityType: 'job_order',

  title: 'Submit Consultant',
  subtitle: { type: 'field', path: 'title' },
  icon: 'Send',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'bench.jobOrders.getById',
      params: { id: fieldValue('id') },
    },
  },

  layout: {
    type: 'two-column',
    sections: [
      // Left Column - Job Order Summary
      {
        id: 'job-order-column',
        type: 'info-card',
        span: 1,
        sections: [
          // Job Header
          {
            id: 'job-header',
            type: 'info-card',
            title: 'Job Order Details',
            icon: 'Briefcase',
            fields: [
              { id: 'title', label: 'Title', type: 'text', path: 'title' },
              { id: 'vendor', label: 'Vendor', type: 'text', path: 'vendor.name' },
              { id: 'client', label: 'End Client', type: 'text', path: 'clientName' },
              { id: 'location', label: 'Location', type: 'text', path: 'location' },
              { id: 'workMode', label: 'Work Mode', type: 'enum', path: 'workMode' },
              { id: 'duration', label: 'Duration', type: 'text', path: 'duration' },
            ],
          },

          // Rate Information
          {
            id: 'rate-info',
            type: 'info-card',
            title: 'Rate Information',
            icon: 'DollarSign',
            fields: [
              {
                id: 'billRate',
                label: 'Bill Rate',
                type: 'currency',
                path: 'billRate',
                config: { suffix: '/hr' },
              },
              {
                id: 'maxRate',
                label: 'Max Rate',
                type: 'currency',
                path: 'maxBillRate',
                config: { suffix: '/hr' },
              },
              {
                id: 'margin',
                label: 'Target Margin',
                type: 'number',
                path: 'margin',
                config: { suffix: '%' },
              },
            ],
          },

          // Requirements
          {
            id: 'requirements',
            type: 'info-card',
            title: 'Requirements',
            icon: 'ClipboardList',
            fields: [
              { id: 'skills', label: 'Required Skills', type: 'tags', path: 'skills' },
              { id: 'experience', label: 'Experience', type: 'text', path: 'experience' },
              { id: 'visaRequirements', label: 'Visa Requirements', type: 'text', path: 'visaRequirements' },
            ],
          },

          // Description
          {
            id: 'description',
            type: 'info-card',
            title: 'Description',
            icon: 'FileText',
            collapsible: true,
            defaultExpanded: false,
            fields: [
              { id: 'description', type: 'text', path: 'description', config: { multiline: true } },
            ],
          },

          // Existing Submissions
          {
            id: 'existing-submissions',
            type: 'table',
            title: 'Existing Submissions',
            icon: 'Users',
            collapsible: true,
            defaultExpanded: false,
            columns_config: [
              { id: 'consultant', label: 'Consultant', path: 'consultant.fullName', type: 'text' },
              { id: 'status', label: 'Status', path: 'status', type: 'enum' },
              { id: 'submittedAt', label: 'Submitted', path: 'submittedAt', type: 'date', config: { format: 'relative' } },
            ],
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'bench.jobOrders.getSubmissions',
                params: { jobOrderId: fieldValue('id') },
              },
            },
          },
        ],
      },

      // Right Column - Consultant Selector
      {
        id: 'consultant-selector-column',
        type: 'form',
        span: 1,
        sections: [
          // Match Indicators Legend
          {
            id: 'match-legend',
            type: 'custom',
            component: 'MatchIndicatorLegend',
            componentProps: {
              indicators: [
                { id: 'skills', label: 'Skills Match', threshold: 70, icon: 'Code' },
                { id: 'visa', label: 'Visa Valid (>180 days)', icon: 'Globe' },
                { id: 'rate', label: 'Rate Match', icon: 'DollarSign' },
                { id: 'availability', label: 'Available', icon: 'Calendar' },
              ],
            },
          },

          // Consultant Search & Selection
          {
            id: 'consultant-selector',
            type: 'custom',
            component: 'ConsultantMatchSelector',
            componentProps: {
              jobOrderId: fieldValue('id'),
              showMatchScores: true,
              matchCriteria: {
                skills: { weight: 0.4, threshold: 70 },
                visa: { weight: 0.2, minDays: 180 },
                rate: { weight: 0.2 },
                availability: { weight: 0.2 },
              },
              // Per spec: visa color coding
              visaColorCoding: {
                green: { minDays: 181, color: 'green' },
                yellow: { minDays: 90, maxDays: 180, color: 'yellow' },
                orange: { minDays: 30, maxDays: 90, color: 'orange' },
                red: { minDays: 1, maxDays: 30, color: 'red' },
                black: { maxDays: 0, color: 'gray' },
              },
              sortOptions: [
                { value: 'matchScore', label: 'Best Match' },
                { value: 'daysOnBench', label: 'Days on Bench' },
                { value: 'rate', label: 'Rate (Low to High)' },
              ],
              defaultSort: 'matchScore',
            },
          },

          // Submission Form
          {
            id: 'submission-form',
            type: 'form',
            title: 'Submission Details',
            icon: 'Send',
            visible: {
              type: 'condition',
              condition: { field: 'selectedConsultantId', operator: 'exists' },
            },
            fields: [
              {
                id: 'consultant-preview',
                type: 'custom',
                component: 'ConsultantSubmissionPreview',
                componentProps: {
                  consultantIdPath: 'selectedConsultantId',
                  showVisaBadge: true,
                  showRateCard: true,
                },
              },
              {
                id: 'submitRate',
                label: 'Submission Rate',
                type: 'currency',
                path: 'submission.rate',
                required: true,
                config: {
                  suffix: '/hr',
                  helpText: 'Rate to submit to vendor',
                },
              },
              {
                id: 'contractType',
                label: 'Contract Type',
                type: 'select',
                path: 'submission.contractType',
                required: true,
                options: CONTRACT_TYPE_OPTIONS,
              },
              {
                id: 'coverNote',
                label: 'Cover Note',
                type: 'textarea',
                path: 'submission.coverNote',
                config: {
                  rows: 3,
                  placeholder: 'Optional note to vendor...',
                },
              },
              {
                id: 'attachResume',
                label: 'Attach Resume',
                type: 'select',
                path: 'submission.resumeId',
                config: {
                  entityType: 'document',
                  filter: { consultantId: fieldValue('selectedConsultantId'), type: 'resume' },
                  displayField: 'fileName',
                },
              },
            ],
          },

          // Rate Calculation Preview
          {
            id: 'rate-calculation',
            type: 'custom',
            title: 'Rate Stack',
            component: 'RateStackPreview',
            visible: {
              type: 'condition',
              condition: { field: 'submission.rate', operator: 'exists' },
            },
            componentProps: {
              // Per spec Section 8.6 & 8.7
              billRatePath: 'submission.rate',
              vendorMarkupPath: 'vendor.defaultMarkup',
              showBreakdown: true,
              format: 'Client Bill Rate: ${billRate}/hr\n├── Vendor Markup: ${vendorMarkup}/hr (${vendorMarkupPercent}%)\n├── InTime Margin: ${margin}/hr (${marginPercent}%)\n└── Consultant Pay: ${payRate}/hr',
            },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'submit',
      label: 'Submit Consultant',
      type: 'mutation',
      icon: 'Send',
      variant: 'primary',
      config: {
        type: 'mutation',
        procedure: 'bench.submissions.create',
        input: {
          jobOrderId: fieldValue('id'),
          consultantId: fieldValue('selectedConsultantId'),
          rate: fieldValue('submission.rate'),
          contractType: fieldValue('submission.contractType'),
          coverNote: fieldValue('submission.coverNote'),
          resumeId: fieldValue('submission.resumeId'),
        },
      },
      visible: {
        type: 'condition',
        condition: { field: 'selectedConsultantId', operator: 'exists' },
      },
    },
    {
      id: 'cancel',
      label: 'Cancel',
      type: 'navigate',
      icon: 'X',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/bench/jobs/{{id}}' },
    },
  ],

  navigation: {
    back: {
      label: 'Back to Job Order',
      route: '/employee/bench/jobs/{{id}}',
    },
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Bench Sales', route: '/employee/bench' },
      { label: 'Job Orders', route: '/employee/bench/jobs' },
      { label: { type: 'field', path: 'title' }, route: '/employee/bench/jobs/{{id}}' },
      { label: 'Submit', active: true },
    ],
  },
};

export default jobOrderSubmitScreen;
