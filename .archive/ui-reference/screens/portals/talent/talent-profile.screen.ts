/**
 * Candidate Profile Screen
 *
 * Profile editor with sections for personal info, work history, skills, etc.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const talentProfileScreen: ScreenDefinition = {
  id: 'talent-profile',
  type: 'detail',
  title: 'My Profile',
  subtitle: 'Manage your professional profile',
  icon: 'User',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.talent.getProfile',
      params: {},
    },
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'sm',
    sidebarPosition: 'left',
    sidebar: {
      id: 'profile-completeness',
      type: 'custom',
      component: 'ProfileCompleteness',
      componentProps: {
        sections: [
          { id: 'personal', label: 'Personal Info', required: true },
          { id: 'experience', label: 'Work Experience', required: true },
          { id: 'education', label: 'Education', required: false },
          { id: 'skills', label: 'Skills', required: true },
          { id: 'documents', label: 'Documents', required: true },
          { id: 'preferences', label: 'Preferences', required: false },
        ],
      },
    },
    sections: [
      // ===========================================
      // PERSONAL INFORMATION
      // ===========================================
      {
        id: 'personal-info',
        type: 'form',
        title: 'Personal Information',
        collapsible: true,
        defaultExpanded: true,
        fields: [
          { id: 'firstName', type: 'text', label: 'First Name', path: 'firstName', config: { required: true } },
          { id: 'lastName', type: 'text', label: 'Last Name', path: 'lastName', config: { required: true } },
          { id: 'email', type: 'email', label: 'Email', path: 'email', config: { required: true, readOnly: true } },
          { id: 'phone', type: 'phone', label: 'Phone', path: 'phone', config: { required: true } },
          { id: 'location', type: 'text', label: 'Location', path: 'location', config: { placeholder: 'City, State' } },
          { id: 'linkedIn', type: 'url', label: 'LinkedIn Profile', path: 'linkedIn' },
          { id: 'portfolio', type: 'url', label: 'Portfolio/Website', path: 'portfolio' },
          { id: 'summary', type: 'textarea', label: 'Professional Summary', path: 'summary', config: { rows: 4 } },
        ],
        columns: 2,
        actions: [
          {
            id: 'save-personal',
            label: 'Save',
            type: 'mutation',
            variant: 'primary',
            config: { type: 'mutation', procedure: 'portal.talent.updatePersonalInfo', input: { type: 'context', path: 'formState.values' } },
          },
        ],
      },

      // ===========================================
      // WORK EXPERIENCE
      // ===========================================
      {
        id: 'work-experience',
        type: 'custom',
        title: 'Work Experience',
        collapsible: true,
        defaultExpanded: true,
        component: 'ExperienceEditor',
        componentProps: {
          dataPath: 'experience',
          allowAdd: true,
          allowEdit: true,
          allowRemove: true,
        },
        actions: [
          {
            id: 'add-experience',
            label: 'Add Experience',
            type: 'modal',
            icon: 'Plus',
            variant: 'outline',
            config: { type: 'modal', modal: 'AddExperience' },
          },
        ],
      },

      // ===========================================
      // EDUCATION
      // ===========================================
      {
        id: 'education',
        type: 'custom',
        title: 'Education',
        collapsible: true,
        defaultExpanded: false,
        component: 'EducationEditor',
        componentProps: {
          dataPath: 'education',
          allowAdd: true,
          allowEdit: true,
          allowRemove: true,
        },
        actions: [
          {
            id: 'add-education',
            label: 'Add Education',
            type: 'modal',
            icon: 'Plus',
            variant: 'outline',
            config: { type: 'modal', modal: 'AddEducation' },
          },
        ],
      },

      // ===========================================
      // SKILLS
      // ===========================================
      {
        id: 'skills',
        type: 'custom',
        title: 'Skills',
        collapsible: true,
        defaultExpanded: true,
        component: 'SkillsEditor',
        componentProps: {
          dataPath: 'skills',
          showProficiency: true,
          suggestionsEnabled: true,
        },
        actions: [
          {
            id: 'add-skill',
            label: 'Add Skill',
            type: 'modal',
            icon: 'Plus',
            variant: 'outline',
            config: { type: 'modal', modal: 'AddSkill' },
          },
        ],
      },

      // ===========================================
      // WORK PREFERENCES
      // ===========================================
      {
        id: 'preferences',
        type: 'form',
        title: 'Work Preferences',
        collapsible: true,
        defaultExpanded: false,
        fields: [
          {
            id: 'jobTypes',
            type: 'multiselect',
            label: 'Job Types',
            path: 'preferences.jobTypes',
            config: {
              options: [
                { value: 'contract', label: 'Contract' },
                { value: 'fte', label: 'Full-Time Employee' },
                { value: 'c2h', label: 'Contract-to-Hire' },
              ],
            },
          },
          {
            id: 'workModes',
            type: 'multiselect',
            label: 'Work Mode',
            path: 'preferences.workModes',
            config: {
              options: [
                { value: 'remote', label: 'Remote' },
                { value: 'hybrid', label: 'Hybrid' },
                { value: 'onsite', label: 'On-site' },
              ],
            },
          },
          {
            id: 'desiredLocations',
            type: 'tags',
            label: 'Preferred Locations',
            path: 'preferences.desiredLocations',
          },
          {
            id: 'salaryMin',
            type: 'number',
            label: 'Minimum Salary/Rate',
            path: 'preferences.salaryMin',
            config: { prefix: '$' },
          },
          {
            id: 'salaryMax',
            type: 'number',
            label: 'Maximum Salary/Rate',
            path: 'preferences.salaryMax',
            config: { prefix: '$' },
          },
          {
            id: 'availability',
            type: 'select',
            label: 'Availability',
            path: 'preferences.availability',
            config: {
              options: [
                { value: 'immediately', label: 'Immediately' },
                { value: '1_week', label: 'Within 1 Week' },
                { value: '2_weeks', label: 'Within 2 Weeks' },
                { value: '1_month', label: 'Within 1 Month' },
                { value: 'not_looking', label: 'Not Actively Looking' },
              ],
            },
          },
          {
            id: 'willingToRelocate',
            type: 'checkbox',
            label: 'Willing to Relocate',
            path: 'preferences.willingToRelocate',
          },
        ],
        columns: 2,
        actions: [
          {
            id: 'save-preferences',
            label: 'Save Preferences',
            type: 'mutation',
            variant: 'primary',
            config: { type: 'mutation', procedure: 'portal.talent.updatePreferences', input: { type: 'context', path: 'formState.values' } },
          },
        ],
      },

      // ===========================================
      // DOCUMENTS
      // ===========================================
      {
        id: 'documents',
        type: 'custom',
        title: 'Documents',
        collapsible: true,
        defaultExpanded: true,
        component: 'DocumentManager',
        componentProps: {
          documentTypes: ['resume', 'cover_letter', 'certification', 'portfolio'],
          allowMultipleResumes: true,
          maxFileSize: 10, // MB
        },
        actions: [
          {
            id: 'upload-document',
            label: 'Upload Document',
            type: 'modal',
            icon: 'Upload',
            variant: 'outline',
            config: { type: 'modal', modal: 'UploadDocument' },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'preview-profile',
      label: 'Preview as Recruiter',
      type: 'modal',
      icon: 'Eye',
      variant: 'outline',
      config: { type: 'modal', modal: 'PreviewProfile' },
    },
    {
      id: 'download-resume',
      label: 'Download Resume',
      type: 'download',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'download', url: { type: 'field', path: 'primaryResumeUrl' }, filename: 'resume.pdf' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Talent Portal', route: '/talent' },
      { label: 'My Profile', active: true },
    ],
  },
};

export default talentProfileScreen;
