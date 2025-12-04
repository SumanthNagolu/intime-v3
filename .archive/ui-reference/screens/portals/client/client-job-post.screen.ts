/**
 * Client Job Post Screen
 *
 * Form for clients to submit new job requests.
 * Simplified version of the recruiter job form.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const clientJobPostScreen: ScreenDefinition = {
  id: 'client-job-post',
  type: 'detail',
  entityType: 'job',
  title: 'Submit Job Request',
  subtitle: 'Submit a new position for our team to fill',
  icon: 'Briefcase',

  dataSource: {
    type: 'empty',
    defaults: {
      status: 'pending',
      currency: 'USD',
      rateType: 'hourly',
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // Job Details
      {
        id: 'job-details',
        type: 'field-grid',
        title: 'Job Details',
        columns: 2,
        fields: [
          {
            id: 'title',
            type: 'text',
            path: 'title',
            label: 'Job Title',
            placeholder: 'e.g., Senior Software Engineer',
            required: true,
          },
          {
            id: 'department',
            type: 'text',
            path: 'department',
            label: 'Department',
            placeholder: 'e.g., Engineering',
          },
          {
            id: 'location',
            type: 'text',
            path: 'location',
            label: 'Location',
            placeholder: 'City, State',
            required: true,
          },
          {
            id: 'workType',
            type: 'select',
            path: 'workType',
            label: 'Work Type',
            required: true,
            options: [
              { value: 'onsite', label: 'On-site' },
              { value: 'remote', label: 'Remote' },
              { value: 'hybrid', label: 'Hybrid' },
            ],
          },
          {
            id: 'jobType',
            type: 'select',
            path: 'jobType',
            label: 'Job Type',
            required: true,
            options: [
              { value: 'contract', label: 'Contract' },
              { value: 'contract_to_hire', label: 'Contract to Hire' },
              { value: 'full_time', label: 'Full-Time' },
            ],
          },
          {
            id: 'positions',
            type: 'number',
            path: 'positions',
            label: 'Number of Positions',
            config: { min: 1, max: 50, defaultValue: 1 },
          },
        ],
      },

      // Compensation
      {
        id: 'compensation',
        type: 'field-grid',
        title: 'Compensation',
        columns: 2,
        fields: [
          {
            id: 'rateMin',
            type: 'currency',
            path: 'rateMin',
            label: 'Minimum Rate ($/hr)',
            placeholder: '0.00',
          },
          {
            id: 'rateMax',
            type: 'currency',
            path: 'rateMax',
            label: 'Maximum Rate ($/hr)',
            placeholder: '0.00',
          },
          {
            id: 'startDate',
            type: 'date',
            path: 'startDate',
            label: 'Target Start Date',
          },
          {
            id: 'duration',
            type: 'text',
            path: 'duration',
            label: 'Duration',
            placeholder: 'e.g., 6 months',
          },
        ],
      },

      // Description
      {
        id: 'description',
        type: 'field-grid',
        title: 'Job Description',
        columns: 1,
        fields: [
          {
            id: 'description',
            type: 'richtext',
            path: 'description',
            label: 'Description',
            placeholder: 'Describe the role, responsibilities, and requirements...',
            required: true,
            config: { minHeight: 200 },
          },
        ],
      },

      // Requirements
      {
        id: 'requirements',
        type: 'field-grid',
        title: 'Requirements',
        columns: 1,
        fields: [
          {
            id: 'requiredSkills',
            type: 'tags',
            path: 'requiredSkills',
            label: 'Required Skills',
            placeholder: 'Add required skills...',
          },
          {
            id: 'experience',
            type: 'text',
            path: 'experience',
            label: 'Experience Required',
            placeholder: 'e.g., 5+ years',
          },
          {
            id: 'additionalNotes',
            type: 'textarea',
            path: 'additionalNotes',
            label: 'Additional Notes',
            placeholder: 'Any other requirements or preferences...',
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'submit',
      label: 'Submit Request',
      type: 'mutation',
      icon: 'Send',
      variant: 'primary',
      config: {
        type: 'mutation',
        procedure: 'portal.client.submitJobRequest',
        input: { type: 'form' },
      },
      onSuccess: {
        type: 'navigate',
        route: '/client/jobs',
        message: 'Job request submitted successfully!',
      },
    },
    {
      id: 'cancel',
      label: 'Cancel',
      type: 'navigate',
      icon: 'X',
      variant: 'ghost',
      config: {
        type: 'navigate',
        route: '/client/jobs',
      },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Client Portal', route: '/client' },
      { label: 'Jobs', route: '/client/jobs' },
      { label: 'New Request', active: true },
    ],
  },
};

export default clientJobPostScreen;
