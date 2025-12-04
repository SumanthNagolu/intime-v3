/**
 * HR Recruitment Screen Definition
 *
 * Metadata-driven screen for internal talent acquisition.
 * Uses custom component for recruitment workflow management.
 */

import type { ScreenDefinition } from '@/lib/metadata';

export const recruitmentScreen: ScreenDefinition = {
  id: 'hr-recruitment',
  type: 'dashboard',

  title: 'Talent Acquisition',
  subtitle: 'Manage internal hiring for InTime Org expansion',
  icon: 'Users',

  layout: {
    type: 'single-column',
    sections: [
      {
        id: 'recruitment-workflow',
        type: 'custom',
        component: 'RecruitmentWorkflow',
        componentProps: {
          tabs: ['Requisitions', 'Candidates', 'Screening', 'Onboarding'],
          defaultTab: 'Requisitions',
          enableAIScreening: true,
          enableCalendarIntegration: true,
        },
      },
    ],
  },

  actions: [
    {
      id: 'create-requisition',
      label: 'Create Requisition',
      type: 'modal',
      variant: 'primary',
      icon: 'UserPlus',
      config: {
        type: 'modal',
        modal: 'CreateRequisitionModal',
      },
    },
  ],

  navigation: {
    back: { label: 'Back to Dashboard', route: '/employee/hr' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Talent Acquisition' },
    ],
  },
};

export default recruitmentScreen;
