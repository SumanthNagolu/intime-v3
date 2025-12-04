/**
 * Job Detail Screen (Candidate View)
 *
 * Full job details with requirements matching and apply CTA.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const talentJobDetailScreen: ScreenDefinition = {
  id: 'talent-job-detail',
  type: 'detail',
  entityType: 'job',
  title: { type: 'field', path: 'title' },
  subtitle: { type: 'field', path: 'company' },
  icon: 'Briefcase',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.talent.getJobById',
      params: { id: { type: 'param', path: 'id' } },
    },
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'right',
    sidebar: {
      id: 'job-summary',
      type: 'info-card',
      title: 'Quick Info',
      fields: [
        { id: 'company', label: 'Company', type: 'text', path: 'company' },
        { id: 'location', label: 'Location', type: 'text', path: 'location' },
        { id: 'workMode', label: 'Work Mode', type: 'text', path: 'workMode' },
        { id: 'jobType', label: 'Job Type', type: 'text', path: 'jobType' },
        { id: 'rate', label: 'Rate Range', type: 'text', path: 'rateRange' },
        { id: 'posted', label: 'Posted', type: 'date', path: 'createdAt', config: { relative: true } },
        { id: 'applicants', label: 'Applicants', type: 'number', path: 'applicantCount' },
      ],
      footer: {
        type: 'quality-score',
        label: 'Match Score',
        path: 'matchScore',
        maxValue: 100,
      },
      actions: [
        {
          id: 'apply',
          label: 'Apply Now',
          type: 'navigate',
          icon: 'Send',
          variant: 'primary',
          config: { type: 'navigate', route: '/talent/jobs/{{id}}/apply' },
          visible: { field: 'hasApplied', operator: 'eq', value: false },
        },
        {
          id: 'already-applied',
          label: 'Applied',
          type: 'custom',
          icon: 'Check',
          variant: 'outline',
          disabled: { field: 'hasApplied', operator: 'eq', value: true },
          visible: { field: 'hasApplied', operator: 'eq', value: true },
          config: { type: 'custom', handler: 'noop' },
        },
        {
          id: 'save',
          label: 'Save Job',
          type: 'mutation',
          icon: 'Bookmark',
          variant: 'outline',
          config: { type: 'mutation', procedure: 'portal.talent.saveJob', input: { jobId: { type: 'field', path: 'id' } } },
          visible: { field: 'isSaved', operator: 'eq', value: false },
        },
        {
          id: 'unsave',
          label: 'Saved',
          type: 'mutation',
          icon: 'BookmarkCheck',
          variant: 'outline',
          config: { type: 'mutation', procedure: 'portal.talent.unsaveJob', input: { jobId: { type: 'field', path: 'id' } } },
          visible: { field: 'isSaved', operator: 'eq', value: true },
        },
        {
          id: 'share',
          label: 'Share',
          type: 'custom',
          icon: 'Share2',
          variant: 'ghost',
          config: { type: 'custom', handler: 'shareJob' },
        },
      ],
    },
    sections: [
      // ===========================================
      // JOB DESCRIPTION
      // ===========================================
      {
        id: 'description',
        type: 'info-card',
        title: 'Job Description',
        fields: [
          { id: 'description', label: '', type: 'richtext', path: 'description' },
        ],
      },

      // ===========================================
      // REQUIREMENTS WITH MATCH INDICATORS
      // ===========================================
      {
        id: 'requirements',
        type: 'custom',
        title: 'Requirements',
        component: 'RequirementsMatch',
        componentProps: {
          showMatchIndicators: true,
          requiredSkillsPath: 'skills.required',
          preferredSkillsPath: 'skills.preferred',
          userSkillsPath: 'userSkills',
        },
      },

      // ===========================================
      // SKILLS REQUIRED
      // ===========================================
      {
        id: 'skills',
        type: 'info-card',
        title: 'Skills',
        fields: [
          { id: 'requiredSkills', label: 'Required', type: 'tags', path: 'skills.required' },
          { id: 'preferredSkills', label: 'Nice to Have', type: 'tags', path: 'skills.preferred' },
        ],
      },

      // ===========================================
      // COMPANY INFO
      // ===========================================
      {
        id: 'company-info',
        type: 'info-card',
        title: 'About the Company',
        collapsible: true,
        defaultExpanded: false,
        visible: { field: 'companyInfo', operator: 'is_not_empty' },
        fields: [
          { id: 'companyDescription', label: '', type: 'richtext', path: 'companyInfo.description' },
          { id: 'industry', label: 'Industry', type: 'text', path: 'companyInfo.industry' },
          { id: 'size', label: 'Company Size', type: 'text', path: 'companyInfo.size' },
          { id: 'website', label: 'Website', type: 'url', path: 'companyInfo.website' },
        ],
      },

      // ===========================================
      // SIMILAR JOBS
      // ===========================================
      {
        id: 'similar-jobs',
        type: 'custom',
        title: 'Similar Jobs',
        component: 'SimilarJobsCarousel',
        componentProps: {
          maxItems: 4,
          showMatchScore: true,
        },
      },
    ],
  },

  actions: [
    {
      id: 'apply-top',
      label: 'Apply Now',
      type: 'navigate',
      icon: 'Send',
      variant: 'primary',
      config: { type: 'navigate', route: '/talent/jobs/{{id}}/apply' },
      visible: { field: 'hasApplied', operator: 'eq', value: false },
    },
    {
      id: 'back-to-search',
      label: 'Back to Search',
      type: 'navigate',
      icon: 'ArrowLeft',
      variant: 'ghost',
      config: { type: 'navigate', route: '/talent/jobs' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Talent Portal', route: '/talent' },
      { label: 'Jobs', route: '/talent/jobs' },
      { label: { type: 'field', path: 'title' }, active: true },
    ],
  },
};

export default talentJobDetailScreen;
