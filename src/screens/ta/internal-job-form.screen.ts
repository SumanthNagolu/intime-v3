/**
 * Internal Job Form Screen Definition
 *
 * Create/Edit form for internal job postings with:
 * - Job details and requirements
 * - Compensation range
 * - Posting settings
 * - TA Manager approval workflow
 *
 * Routes:
 * - /employee/workspace/ta/internal-jobs/new (create)
 * - /employee/workspace/ta/internal-jobs/:id/edit (edit)
 *
 * @see docs/specs/20-USER-ROLES/03-ta/03-internal-hiring.md
 */

import type { ScreenDefinition, SectionDefinition } from '@/lib/metadata/types/screen.types';
import type { FieldDefinition } from '@/lib/metadata/types/widget.types';
import {
  INTERNAL_JOB_STATUS_OPTIONS,
  INTERNAL_JOB_TYPE_OPTIONS,
} from '@/lib/metadata/options/ta-options';
import { WORK_MODE_OPTIONS } from '@/lib/metadata/options/crm-options';

// ==========================================
// INTERNAL JOB FORM CONFIG
// ==========================================

export const internalJobFormConfig: {
  entityType: string;
  domain: string;
  sections: Array<{ id: string; title: string; icon: string; columns: number; fields: FieldDefinition[] }>;
} = {
  entityType: 'internalJob',
  domain: 'ta',

  sections: [
    // Basic Information
    {
      id: 'basic-info',
      title: 'Basic Information',
      icon: 'Briefcase',
      columns: 2,
      fields: [
        {
          id: 'title',
          label: 'Job Title',
          path: 'title',
          type: 'text',
          required: true,
          placeholder: 'e.g., Senior Software Engineer',
        },
        {
          id: 'department',
          label: 'Department',
          path: 'department',
          type: 'async-select',
          config: {
            procedure: 'org.departments.list',
            labelPath: 'name',
            valuePath: 'id',
          },
          required: true,
        },
        {
          id: 'hiringManagerId',
          label: 'Hiring Manager',
          path: 'hiringManagerId',
          type: 'user-select',
          config: {
            procedure: 'users.listManagers',
            labelPath: 'name',
            valuePath: 'id',
          },
          required: true,
        },
        {
          id: 'employmentType',
          label: 'Employment Type',
          path: 'employmentType',
          type: 'select',
          options: INTERNAL_JOB_TYPE_OPTIONS,
          required: true,
        },
        {
          id: 'location',
          label: 'Location',
          path: 'location',
          type: 'text',
          placeholder: 'e.g., New York, NY',
        },
        {
          id: 'workMode',
          label: 'Work Mode',
          path: 'workMode',
          type: 'select',
          options: WORK_MODE_OPTIONS,
        },
        {
          id: 'headcount',
          label: 'Number of Positions',
          path: 'headcount',
          type: 'number',
          config: { min: 1 },
          defaultValue: 1,
        },
      ],
    },

    // Job Description
    {
      id: 'job-description',
      title: 'Job Description',
      icon: 'FileText',
      columns: 1,
      fields: [
        {
          id: 'description',
          label: 'Description',
          path: 'description',
          type: 'rich-text',
          required: true,
          config: {
            placeholder: 'Describe the role, responsibilities, and what success looks like...',
            minHeight: 200,
          },
        },
      ],
    },

    // Requirements
    {
      id: 'requirements',
      title: 'Requirements',
      icon: 'ClipboardCheck',
      columns: 1,
      fields: [
        {
          id: 'requirements',
          label: 'Required Qualifications',
          path: 'requirements',
          type: 'rich-text',
          config: {
            placeholder: 'List the must-have qualifications...',
            minHeight: 150,
          },
        },
        {
          id: 'requiredSkills',
          label: 'Required Skills',
          path: 'requiredSkills',
          type: 'tags',
          config: {
            placeholder: 'Add required skills...',
            suggestions: true,
            suggestionsProcedure: 'skills.listCommon',
          },
        },
        {
          id: 'niceToHaves',
          label: 'Nice to Have',
          path: 'niceToHaves',
          type: 'rich-text',
          config: {
            placeholder: 'List preferred but not required qualifications...',
            minHeight: 100,
          },
        },
        {
          id: 'niceToHaveSkills',
          label: 'Preferred Skills',
          path: 'niceToHaveSkills',
          type: 'tags',
          config: {
            placeholder: 'Add preferred skills...',
          },
        },
      ],
    },

    // Compensation
    {
      id: 'compensation',
      title: 'Compensation',
      icon: 'DollarSign',
      columns: 2,
      fields: [
        {
          id: 'salaryMin',
          label: 'Minimum Salary',
          path: 'salaryMin',
          type: 'currency',
          config: { prefix: '$' },
          required: true,
        },
        {
          id: 'salaryMax',
          label: 'Maximum Salary',
          path: 'salaryMax',
          type: 'currency',
          config: { prefix: '$' },
          required: true,
        },
        {
          id: 'bonusPercentage',
          label: 'Bonus (%)',
          path: 'bonusPercentage',
          type: 'number',
          config: { min: 0, max: 100, suffix: '%' },
        },
        {
          id: 'equityGrant',
          label: 'Equity Grant',
          path: 'equityGrant',
          type: 'text',
          placeholder: 'e.g., 0.5% - 1%',
        },
        {
          id: 'benefits',
          label: 'Benefits Notes',
          path: 'benefitsNotes',
          type: 'textarea',
          config: { rows: 2 },
          placeholder: 'Any specific benefits to highlight...',
          span: 2,
        },
      ],
    },

    // Posting Settings
    {
      id: 'posting-settings',
      title: 'Posting Settings',
      icon: 'Settings',
      columns: 2,
      fields: [
        {
          id: 'postExternally',
          label: 'Post Externally',
          path: 'postExternally',
          type: 'checkbox',
          config: {
            label: 'Also post on external job boards',
          },
        },
        {
          id: 'referralBonus',
          label: 'Referral Bonus',
          path: 'referralBonus',
          type: 'currency',
          config: { prefix: '$' },
          placeholder: 'e.g., $2,000',
        },
        {
          id: 'targetStartDate',
          label: 'Target Start Date',
          path: 'targetStartDate',
          type: 'date',
        },
        {
          id: 'priority',
          label: 'Priority',
          path: 'priority',
          type: 'select',
          options: [
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'urgent', label: 'Urgent' },
          ],
          defaultValue: 'medium',
        },
      ],
    },

    // Internal Notes
    {
      id: 'internal-notes',
      title: 'Internal Notes',
      icon: 'StickyNote',
      columns: 1,
      fields: [
        {
          id: 'internalNotes',
          label: 'Notes for TA Team',
          path: 'internalNotes',
          type: 'textarea',
          config: { rows: 3 },
          placeholder: 'Internal notes about this position (not visible to candidates)...',
        },
      ],
    },
  ],
};

// ==========================================
// CREATE INTERNAL JOB SCREEN
// ==========================================

export const internalJobCreateScreen: ScreenDefinition = {
  id: 'internal-job-create',
  type: 'detail',
  entityType: 'internalJob',
  title: 'Create Internal Job',
  icon: 'Plus',

  layout: {
    type: 'single-column',
    sections: internalJobFormConfig.sections.map(section => ({
      id: section.id,
      type: 'form',
      title: section.title,
      icon: section.icon,
      columns: section.columns,
      fields: section.fields,
    })),
  },

  actions: [
    {
      id: 'save-draft',
      type: 'mutation',
      label: 'Save as Draft',
      icon: 'Save',
      variant: 'outline',
      config: {
        type: 'mutation',
        procedure: 'ta.internalJobs.create',
        input: { status: 'draft' },
      },
      onSuccess: {
        type: 'navigate',
        route: '/employee/workspace/ta/internal-jobs/{id}',
        toast: 'Job saved as draft',
      },
    },
    {
      id: 'submit-for-approval',
      type: 'mutation',
      label: 'Submit for Approval',
      icon: 'Send',
      variant: 'primary',
      config: {
        type: 'mutation',
        procedure: 'ta.internalJobs.create',
        input: { status: 'pending_approval' },
      },
      onSuccess: {
        type: 'navigate',
        route: '/employee/workspace/ta/internal-jobs/{id}',
        toast: 'Job submitted for TA Manager approval',
      },
    },
    {
      id: 'cancel',
      type: 'navigate',
      label: 'Cancel',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/workspace/ta/internal-jobs' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
      { label: 'Internal Jobs', route: '/employee/workspace/ta/internal-jobs' },
      { label: 'New Job' },
    ],
  },
};

// ==========================================
// EDIT INTERNAL JOB SCREEN
// ==========================================

export const internalJobEditScreen: ScreenDefinition = {
  id: 'internal-job-edit',
  type: 'detail',
  entityType: 'internalJob',
  title: { template: 'Edit: {title}', fields: ['title'] },
  icon: 'Pencil',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'ta.internalJobs.getById',
      params: { id: { param: 'id' } },
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      ...internalJobFormConfig.sections.map(section => ({
        id: section.id,
        type: 'form' as const,
        title: section.title,
        icon: section.icon,
        columns: section.columns,
        fields: section.fields,
      })),
      // Status (edit only)
      {
        id: 'status-section',
        type: 'form',
        title: 'Status',
        icon: 'CircleDot',
        columns: 2,
        fields: [
          {
            id: 'status',
            label: 'Job Status',
            path: 'status',
            type: 'select',
            options: INTERNAL_JOB_STATUS_OPTIONS,
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'save',
      type: 'mutation',
      label: 'Save Changes',
      icon: 'Save',
      variant: 'primary',
      config: {
        type: 'mutation',
        procedure: 'ta.internalJobs.update',
        input: { id: { param: 'id' } },
      },
      onSuccess: {
        type: 'navigate',
        route: '/employee/workspace/ta/internal-jobs/{id}',
        toast: 'Job updated successfully',
      },
    },
    {
      id: 'cancel',
      type: 'navigate',
      label: 'Cancel',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/workspace/ta/internal-jobs/{id}' },
    },
  ],

  navigation: {
    back: {
      label: 'Back to Job',
      route: '/employee/workspace/ta/internal-jobs/{id}',
    },
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
      { label: 'Internal Jobs', route: '/employee/workspace/ta/internal-jobs' },
      { label: { field: 'title' }, route: '/employee/workspace/ta/internal-jobs/{id}' },
      { label: 'Edit' },
    ],
  },
};

export default { internalJobCreateScreen, internalJobEditScreen, internalJobFormConfig };
