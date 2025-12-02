/**
 * Offer Detail Screen
 *
 * Full offer details with accept/decline actions.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const talentOfferDetailScreen: ScreenDefinition = {
  id: 'talent-offer-detail',
  type: 'detail',
  title: { type: 'template', template: 'Offer: {{jobTitle}}' },
  subtitle: { type: 'field', path: 'company' },
  icon: 'Gift',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.talent.getOfferById',
      params: { id: { type: 'param', path: 'id' } },
    },
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'left',
    sidebar: {
      id: 'offer-status',
      type: 'info-card',
      title: 'Offer Status',
      fields: [
        {
          id: 'status',
          label: 'Status',
          type: 'enum',
          path: 'status',
          config: {
            options: [
              { value: 'pending', label: 'Pending' },
              { value: 'accepted', label: 'Accepted' },
              { value: 'declined', label: 'Declined' },
              { value: 'expired', label: 'Expired' },
            ],
            badgeColors: { pending: 'yellow', accepted: 'green', declined: 'gray', expired: 'red' },
          },
        },
        { id: 'receivedAt', label: 'Received', type: 'date', path: 'receivedAt' },
        { id: 'expiresAt', label: 'Expires', type: 'date', path: 'expiresAt' },
      ],
      footer: {
        type: 'custom',
        component: 'ExpiryCountdown',
        componentProps: { expiresAt: { type: 'field', path: 'expiresAt' } },
      },
      actions: [
        {
          id: 'accept',
          label: 'Accept Offer',
          type: 'modal',
          icon: 'Check',
          variant: 'primary',
          config: { type: 'modal', modal: 'AcceptOffer', props: { offerId: { type: 'field', path: 'id' } } },
          visible: { field: 'status', operator: 'eq', value: 'pending' },
        },
        {
          id: 'decline',
          label: 'Decline Offer',
          type: 'modal',
          icon: 'X',
          variant: 'destructive',
          config: { type: 'modal', modal: 'DeclineOffer', props: { offerId: { type: 'field', path: 'id' } } },
          visible: { field: 'status', operator: 'eq', value: 'pending' },
        },
        {
          id: 'negotiate',
          label: 'Request to Negotiate',
          type: 'modal',
          icon: 'MessageCircle',
          variant: 'outline',
          config: { type: 'modal', modal: 'NegotiateOffer', props: { offerId: { type: 'field', path: 'id' } } },
          visible: {
            type: 'condition',
            condition: {
              operator: 'and',
              conditions: [
                { field: 'status', operator: 'eq', value: 'pending' },
                { field: 'negotiationEnabled', operator: 'eq', value: true },
              ],
            },
          },
        },
      ],
    },
    sections: [
      // ===========================================
      // OFFER LETTER
      // ===========================================
      {
        id: 'offer-letter',
        type: 'custom',
        title: 'Offer Letter',
        component: 'OfferLetterViewer',
        componentProps: {
          documentUrl: { type: 'field', path: 'offerLetterUrl' },
          allowDownload: true,
        },
      },

      // ===========================================
      // COMPENSATION BREAKDOWN
      // ===========================================
      {
        id: 'compensation',
        type: 'info-card',
        title: 'Compensation',
        fields: [
          { id: 'salary', label: 'Base Salary/Rate', type: 'currency', path: 'compensation.base' },
          { id: 'payType', label: 'Pay Type', type: 'text', path: 'compensation.payType' },
          { id: 'bonus', label: 'Signing Bonus', type: 'currency', path: 'compensation.signingBonus' },
          { id: 'pto', label: 'PTO', type: 'text', path: 'compensation.pto' },
        ],
      },

      // ===========================================
      // BENEFITS SUMMARY
      // ===========================================
      {
        id: 'benefits',
        type: 'info-card',
        title: 'Benefits Summary',
        visible: { field: 'benefits', operator: 'is_not_empty' },
        fields: [
          { id: 'healthInsurance', label: 'Health Insurance', type: 'text', path: 'benefits.healthInsurance' },
          { id: 'dentalVision', label: 'Dental & Vision', type: 'text', path: 'benefits.dentalVision' },
          { id: 'retirement', label: '401(k)', type: 'text', path: 'benefits.retirement' },
          { id: 'other', label: 'Other Benefits', type: 'tags', path: 'benefits.other' },
        ],
      },

      // ===========================================
      // TERMS & CONDITIONS
      // ===========================================
      {
        id: 'terms',
        type: 'info-card',
        title: 'Terms & Conditions',
        collapsible: true,
        fields: [
          { id: 'startDate', label: 'Proposed Start Date', type: 'date', path: 'proposedStartDate' },
          { id: 'location', label: 'Work Location', type: 'text', path: 'workLocation' },
          { id: 'workMode', label: 'Work Mode', type: 'text', path: 'workMode' },
          { id: 'contingencies', label: 'Contingencies', type: 'tags', path: 'contingencies' },
        ],
      },

      // ===========================================
      // POSITION DETAILS
      // ===========================================
      {
        id: 'position',
        type: 'info-card',
        title: 'Position Details',
        collapsible: true,
        defaultExpanded: false,
        fields: [
          { id: 'title', label: 'Title', type: 'text', path: 'jobTitle' },
          { id: 'department', label: 'Department', type: 'text', path: 'department' },
          { id: 'manager', label: 'Reporting To', type: 'text', path: 'reportingTo' },
        ],
        actions: [
          {
            id: 'view-job',
            label: 'View Original Job Post',
            type: 'navigate',
            icon: 'ExternalLink',
            variant: 'ghost',
            config: { type: 'navigate', route: '/talent/jobs/{{jobId}}' },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'download-offer',
      label: 'Download Offer Letter',
      type: 'download',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'download', url: { type: 'field', path: 'offerLetterUrl' }, filename: 'offer-letter.pdf' },
    },
    {
      id: 'contact-recruiter',
      label: 'Contact Recruiter',
      type: 'modal',
      icon: 'MessageCircle',
      variant: 'outline',
      config: { type: 'modal', modal: 'ContactRecruiter', props: { offerId: { type: 'field', path: 'id' } } },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Talent Portal', route: '/talent' },
      { label: 'Offers', route: '/talent/offers' },
      { label: { type: 'field', path: 'jobTitle' }, active: true },
    ],
  },
};

export default talentOfferDetailScreen;
