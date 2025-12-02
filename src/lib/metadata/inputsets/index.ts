/**
 * Standard InputSets
 *
 * Reusable field group configurations for common form patterns.
 * Following Guidewire InputSet pattern for composable, reusable form sections.
 *
 * @example
 * ```typescript
 * import { addressInputSet, contactInputSet } from '@/lib/metadata/inputsets';
 *
 * // Use in a screen definition
 * const screenDef = {
 *   layout: {
 *     sections: [
 *       {
 *         id: 'contact-info',
 *         type: 'input-set',
 *         inputSet: contactInputSet,
 *       },
 *       {
 *         id: 'address-info',
 *         type: 'input-set',
 *         inputSet: addressInputSet,
 *       },
 *     ],
 *   },
 * };
 * ```
 */

// ==========================================
// ADDRESS INPUT SETS
// ==========================================

export {
  addressInputSet,
  usAddressInputSet,
  workLocationInputSet,
  addressFields,
} from './address.inputset';

// ==========================================
// CONTACT INPUT SETS
// ==========================================

export {
  contactInputSet,
  quickContactInputSet,
  pocInputSet,
  professionalLinksInputSet,
  contactFields,
  nameFields,
} from './contact.inputset';

// ==========================================
// COMPENSATION INPUT SETS
// ==========================================

export {
  compensationInputSet,
  jobRateInputSet,
  candidateRateInputSet,
  placementRateInputSet,
  compensationFields,
  billRateFields,
  payRateFields,
  RATE_TYPE_OPTIONS,
  CURRENCY_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
} from './compensation.inputset';

// ==========================================
// SKILLS INPUT SETS
// ==========================================

export {
  jobRequirementsInputSet,
  candidateSkillsInputSet,
  educationInputSet,
  certificationInputSet,
  jobRequirementsFields,
  candidateSkillsFields,
  educationFields,
  certificationFields,
  EXPERIENCE_LEVEL_OPTIONS,
  SKILL_PROFICIENCY_OPTIONS,
} from './skills.inputset';

// ==========================================
// WORK AUTHORIZATION INPUT SETS
// ==========================================

export {
  workAuthInputSet,
  visaDetailsInputSet,
  workEligibilityInputSet,
  multiCountryWorkAuthInputSet,
  canadaWorkAuthInputSet,
  workAuthFields,
  visaDetailsFields,
  multiCountryWorkAuthFields,
  WORK_AUTH_STATUS_OPTIONS,
  US_WORK_AUTH_OPTIONS,
  CANADA_WORK_AUTH_OPTIONS,
  ALL_WORK_AUTH_OPTIONS,
  WORK_COUNTRY_OPTIONS,
} from './workauth.inputset';

// ==========================================
// INTERVIEW INPUT SETS
// ==========================================

export {
  interviewScheduleInputSet,
  interviewFeedbackInputSet,
  quickInterviewRatingInputSet,
  interviewRescheduleInputSet,
  interviewScheduleFields,
  interviewFeedbackFields,
  INTERVIEW_TYPE_OPTIONS,
  INTERVIEW_STATUS_OPTIONS,
  INTERVIEW_OUTCOME_OPTIONS,
} from './interview.inputset';

// ==========================================
// RATE CARD INPUT SETS
// ==========================================

export {
  rateCardInputSet,
  rateRangeInputSet,
  desiredRateInputSet,
  overtimeRateInputSet,
  rateCardFields,
  rateRangeFields,
  desiredRateFields,
  overtimeRateFields,
  // Note: RATE_TYPE_OPTIONS already exported from compensation.inputset
  RATE_CURRENCY_OPTIONS,
} from './ratecard.inputset';

// ==========================================
// AVAILABILITY INPUT SETS
// ==========================================

export {
  availabilityInputSet,
  simpleAvailabilityInputSet,
  placementAvailabilityInputSet,
  availabilityFields,
  simpleAvailabilityFields,
  placementAvailabilityFields,
  AVAILABILITY_STATUS_OPTIONS,
  NOTICE_PERIOD_OPTIONS,
  WORK_MODE_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS as AVAILABILITY_EMPLOYMENT_TYPE_OPTIONS,
  TRAVEL_PERCENT_OPTIONS,
} from './availability.inputset';

// ==========================================
// TIMELINE INPUT SETS
// ==========================================

export {
  timelineFilterInputSet,
  quickLogActivityInputSet,
  scheduleActivityInputSet,
  activityBadgeInputSet,
  timelineFilterFields,
  quickLogActivityFields,
  scheduleActivityFields,
  activityBadgeFields,
  TIMELINE_ENTRY_TYPE_OPTIONS,
  ACTIVITY_TYPE_OPTIONS,
  ACTIVITY_STATUS_OPTIONS,
  ACTIVITY_OUTCOME_OPTIONS,
  ACTIVITY_PRIORITY_OPTIONS,
  DIRECTION_OPTIONS,
  DATE_RANGE_OPTIONS,
  REMINDER_OPTIONS,
} from './timeline.inputset';

// ==========================================
// RACI INPUT SETS
// ==========================================

export {
  raciAssignmentInputSet,
  raciDisplayInputSet,
  quickOwnerChangeInputSet,
  bulkRaciInputSet,
  raciMatrixInputSet,
  raciAssignmentFields,
  raciDisplayFields,
  quickOwnerChangeFields,
  bulkRaciFields,
  raciMatrixFields,
  RACI_ROLE_OPTIONS,
  RACI_PERMISSION_OPTIONS,
  ASSIGNMENT_TYPE_OPTIONS,
  OWNER_CHANGE_REASON_OPTIONS,
  RACI_ENTITY_TYPE_OPTIONS,
} from './raci.inputset';

// ==========================================
// CRM CONTACT INPUT SETS
// ==========================================

export {
  crmContactBasicInputSet,
  crmContactTypeInputSet,
  crmContactCompanyInputSet,
  crmContactDecisionInputSet,
  crmContactPreferencesInputSet,
  crmContactEmailPrefsInputSet,
  crmContactSocialInputSet,
  crmContactNotesInputSet,
  crmContactEngagementInputSet,
  crmContactFullInputSet,
  crmContactQuickAddInputSet,
  crmContactBasicFields,
  crmContactTypeFields,
  crmContactCompanyFields,
  crmContactDecisionFields,
  crmContactPreferencesFields,
  crmContactEmailPrefsFields,
  crmContactSocialFields,
  crmContactNotesFields,
  crmContactEngagementFields,
} from './crm-contact.inputset';

// ==========================================
// CRM DEAL INPUT SETS
// ==========================================

export {
  dealBasicInputSet,
  dealValueInputSet,
  dealStageInputSet,
  dealAssignmentInputSet,
  dealOutcomeInputSet,
  dealNotesInputSet,
  dealStakeholderInputSet,
  dealCompetitorInputSet,
  dealProductInputSet,
  dealStageHistoryInputSet,
  dealFullInputSet,
  dealQuickAddInputSet,
  dealBasicFields,
  dealValueFields,
  dealStageFields,
  dealAssignmentFields,
  dealOutcomeFields,
  dealNotesFields,
  dealStakeholderFields,
  dealCompetitorFields,
  dealProductFields,
  dealStageHistoryFields,
  dealFullFields,
  dealQuickAddFields,
} from './crm-deal.inputset';

// ==========================================
// CRM LEAD INPUT SETS
// ==========================================

export {
  leadBANTScoreInputSet,
  leadBANTNotesInputSet,
  leadQualificationBudgetInputSet,
  leadQualificationAuthorityInputSet,
  leadQualificationNeedInputSet,
  leadQualificationTimelineInputSet,
  leadQualificationStatusInputSet,
  leadTouchpointInputSet,
  leadBANTFullInputSet,
  leadBANTScoreFields,
  leadBANTNotesFields,
  leadQualificationBudgetFields,
  leadQualificationAuthorityFields,
  leadQualificationNeedFields,
  leadQualificationTimelineFields,
  leadQualificationStatusFields,
  leadTouchpointFields,
  TOUCHPOINT_TYPE_OPTIONS,
  TOUCHPOINT_OUTCOME_OPTIONS,
  NEED_URGENCY_OPTIONS,
  TIMELINE_OPTIONS,
  BUDGET_TIMEFRAME_OPTIONS,
  DECISION_MAKER_OPTIONS,
  QUALIFICATION_STATUS_OPTIONS,
} from './crm-lead.inputset';

// ==========================================
// CRM ACCOUNT INPUT SETS
// ==========================================

export {
  accountAddressInputSet,
  accountContractInputSet,
  accountTeamInputSet,
  accountPreferencesSkillsInputSet,
  accountPreferencesVisaInputSet,
  accountPreferencesRateInputSet,
  accountPreferencesWorkInputSet,
  accountPreferencesInterviewInputSet,
  accountPreferencesFullInputSet,
  accountMetricsPlacementInputSet,
  accountMetricsRevenueInputSet,
  accountMetricsPerformanceInputSet,
  accountMetricsActivityInputSet,
  accountMetricsFullInputSet,
  accountAddressFields,
  accountContractFields,
  accountTeamFields,
  accountPreferencesSkillsFields,
  accountPreferencesVisaFields,
  accountPreferencesRateFields,
  accountPreferencesWorkFields,
  accountPreferencesInterviewFields,
  accountPreferencesNotesFields,
  accountMetricsPlacementFields,
  accountMetricsRevenueFields,
  accountMetricsPerformanceFields,
  accountMetricsActivityFields,
  ADDRESS_TYPE_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
  CONTRACT_STATUS_OPTIONS,
  ACCOUNT_TEAM_ROLE_OPTIONS,
  WORK_MODE_PREFERENCE_OPTIONS,
  VISA_TYPE_OPTIONS,
  SECURITY_CLEARANCE_OPTIONS,
} from './crm-account.inputset';

// ==========================================
// CRM CAMPAIGN INPUT SETS
// ==========================================

export {
  campaignBasicInputSet,
  campaignScheduleInputSet,
  campaignTargetInputSet,
  campaignGoalsInputSet,
  campaignAssignmentInputSet,
  campaignNotesInputSet,
  campaignContentInputSet,
  campaignTargetRecordInputSet,
  campaignMetricsInputSet,
  campaignRatesInputSet,
  campaignCostInputSet,
  campaignFullInputSet,
  campaignQuickAddInputSet,
  campaignBasicFields,
  campaignScheduleFields,
  campaignTargetFields,
  campaignGoalsFields,
  campaignAssignmentFields,
  campaignNotesFields,
  campaignContentFields,
  campaignTargetRecordFields,
  campaignMetricsFields,
  campaignRatesFields,
  campaignCostFields,
  campaignFullFields,
  campaignQuickAddFields,
} from './crm-campaign.inputset';

// ==========================================
// HR EMPLOYEE INPUT SETS
// ==========================================

export {
  hrEmployeeBasicInputSet,
  hrEmployeeEmploymentInputSet,
  hrEmployeeCompensationInputSet,
  hrEmployeeAddressInputSet,
  hrEmployeeEmergencyInputSet,
  hrEmployeeTerminationInputSet,
  hrEmployeeDocumentInputSet,
  hrEmployeeFullInputSet,
  hrEmployeeQuickAddInputSet,
  hrEmployeeBasicFields,
  hrEmployeeEmploymentFields,
  hrEmployeeCompensationFields,
  hrEmployeeAddressFields,
  hrEmployeeEmergencyFields,
  hrEmployeeTerminationFields,
  hrEmployeeDocumentFields,
  EMPLOYMENT_STATUS_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS as HR_EMPLOYMENT_TYPE_OPTIONS,
  HR_WORK_MODE_OPTIONS,
  SALARY_TYPE_OPTIONS,
  CURRENCY_OPTIONS as HR_CURRENCY_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  DOCUMENT_STATUS_OPTIONS,
} from './hr-employee.inputset';

// ==========================================
// HR TIME OFF INPUT SETS
// ==========================================

export {
  hrTimeOffRequestInputSet,
  hrTimeOffApprovalInputSet,
  hrTimeOffBalanceInputSet,
  hrTimeOffRequestFields,
  hrTimeOffApprovalFields,
  hrTimeOffBalanceFields,
  TIME_OFF_TYPE_OPTIONS,
  TIME_OFF_STATUS_OPTIONS,
} from './hr-timeoff.inputset';

// ==========================================
// HR ONBOARDING INPUT SETS
// ==========================================

export {
  hrOnboardingTaskInputSet,
  hrOnboardingTaskCompletionInputSet,
  hrOnboardingAssignmentInputSet,
  hrOnboardingTaskFields,
  hrOnboardingTaskCompletionFields,
  hrOnboardingAssignmentFields,
  ONBOARDING_STATUS_OPTIONS,
  TASK_STATUS_OPTIONS,
  TASK_CATEGORY_OPTIONS,
} from './hr-onboarding.inputset';

// ==========================================
// HR BENEFITS INPUT SETS
// ==========================================

export {
  hrBenefitPlanInputSet,
  hrBenefitPlanOptionInputSet,
  hrBenefitEnrollmentInputSet,
  hrBenefitDependentInputSet,
  hrBenefitPlanFields,
  hrBenefitPlanOptionFields,
  hrBenefitEnrollmentFields,
  hrBenefitDependentFields,
  BENEFIT_TYPE_OPTIONS,
  COVERAGE_LEVEL_OPTIONS,
  BENEFIT_STATUS_OPTIONS,
  RELATIONSHIP_OPTIONS,
} from './hr-benefits.inputset';

// ==========================================
// HR PERFORMANCE INPUT SETS
// ==========================================

export {
  hrPerformanceGoalInputSet,
  hrGoalRatingInputSet,
  hrPerformanceFeedbackInputSet,
  hrSelfAssessmentInputSet,
  hrManagerEvaluationInputSet,
  hrPerformanceGoalFields,
  hrGoalRatingFields,
  hrPerformanceFeedbackFields,
  hrSelfAssessmentFields,
  hrManagerEvaluationFields,
  PERFORMANCE_GOAL_CATEGORY_OPTIONS,
  GOAL_STATUS_OPTIONS,
  FEEDBACK_TYPE_OPTIONS,
  RATING_OPTIONS,
} from './hr-performance.inputset';

// ==========================================
// HR COMPLIANCE INPUT SETS
// ==========================================

export {
  hrComplianceRequirementInputSet,
  hrEmployeeComplianceInputSet,
  hrI9Section1InputSet,
  hrI9Section2InputSet,
  hrI9ReverificationInputSet,
  hrComplianceRequirementFields,
  hrEmployeeComplianceFields,
  hrI9Section1Fields,
  hrI9Section2Fields,
  hrI9ReverificationFields,
  COMPLIANCE_TYPE_OPTIONS,
  COMPLIANCE_FREQUENCY_OPTIONS,
  COMPLIANCE_APPLIES_TO_OPTIONS,
  COMPLIANCE_STATUS_OPTIONS,
  I9_STATUS_OPTIONS,
} from './hr-compliance.inputset';

// ==========================================
// INPUT SET REGISTRY
// ==========================================

import { addressInputSet, usAddressInputSet, workLocationInputSet } from './address.inputset';
import { contactInputSet, quickContactInputSet, pocInputSet, professionalLinksInputSet } from './contact.inputset';
import { compensationInputSet, jobRateInputSet, candidateRateInputSet, placementRateInputSet } from './compensation.inputset';
import { jobRequirementsInputSet, candidateSkillsInputSet, educationInputSet, certificationInputSet } from './skills.inputset';
import { workAuthInputSet, visaDetailsInputSet, workEligibilityInputSet, multiCountryWorkAuthInputSet, canadaWorkAuthInputSet } from './workauth.inputset';
import { interviewScheduleInputSet, interviewFeedbackInputSet, quickInterviewRatingInputSet, interviewRescheduleInputSet } from './interview.inputset';
import { rateCardInputSet, rateRangeInputSet, desiredRateInputSet, overtimeRateInputSet } from './ratecard.inputset';
import { availabilityInputSet, simpleAvailabilityInputSet, placementAvailabilityInputSet } from './availability.inputset';
import { timelineFilterInputSet, quickLogActivityInputSet, scheduleActivityInputSet, activityBadgeInputSet } from './timeline.inputset';
import { raciAssignmentInputSet, raciDisplayInputSet, quickOwnerChangeInputSet, bulkRaciInputSet, raciMatrixInputSet } from './raci.inputset';
import {
  crmContactBasicInputSet,
  crmContactTypeInputSet,
  crmContactCompanyInputSet,
  crmContactDecisionInputSet,
  crmContactPreferencesInputSet,
  crmContactEmailPrefsInputSet,
  crmContactSocialInputSet,
  crmContactNotesInputSet,
  crmContactEngagementInputSet,
  crmContactFullInputSet,
  crmContactQuickAddInputSet,
} from './crm-contact.inputset';
import {
  dealBasicInputSet,
  dealValueInputSet,
  dealStageInputSet,
  dealAssignmentInputSet,
  dealOutcomeInputSet,
  dealNotesInputSet,
  dealStakeholderInputSet,
  dealCompetitorInputSet,
  dealProductInputSet,
  dealStageHistoryInputSet,
  dealFullInputSet,
  dealQuickAddInputSet,
} from './crm-deal.inputset';
import {
  campaignBasicInputSet,
  campaignScheduleInputSet,
  campaignTargetInputSet,
  campaignGoalsInputSet,
  campaignAssignmentInputSet,
  campaignNotesInputSet,
  campaignContentInputSet,
  campaignTargetRecordInputSet,
  campaignMetricsInputSet,
  campaignRatesInputSet,
  campaignCostInputSet,
  campaignFullInputSet,
  campaignQuickAddInputSet,
} from './crm-campaign.inputset';
import {
  leadBANTScoreInputSet,
  leadBANTNotesInputSet,
  leadQualificationBudgetInputSet,
  leadQualificationAuthorityInputSet,
  leadQualificationNeedInputSet,
  leadQualificationTimelineInputSet,
  leadQualificationStatusInputSet,
  leadTouchpointInputSet,
  leadBANTFullInputSet,
} from './crm-lead.inputset';
import {
  accountAddressInputSet,
  accountContractInputSet,
  accountTeamInputSet,
  accountPreferencesSkillsInputSet,
  accountPreferencesVisaInputSet,
  accountPreferencesRateInputSet,
  accountPreferencesWorkInputSet,
  accountPreferencesInterviewInputSet,
  accountPreferencesFullInputSet,
  accountMetricsPlacementInputSet,
  accountMetricsRevenueInputSet,
  accountMetricsPerformanceInputSet,
  accountMetricsActivityInputSet,
  accountMetricsFullInputSet,
} from './crm-account.inputset';
import {
  hrEmployeeBasicInputSet,
  hrEmployeeEmploymentInputSet,
  hrEmployeeCompensationInputSet,
  hrEmployeeAddressInputSet,
  hrEmployeeEmergencyInputSet,
  hrEmployeeTerminationInputSet,
  hrEmployeeDocumentInputSet,
  hrEmployeeFullInputSet,
  hrEmployeeQuickAddInputSet,
} from './hr-employee.inputset';
import {
  hrTimeOffRequestInputSet,
  hrTimeOffApprovalInputSet,
  hrTimeOffBalanceInputSet,
} from './hr-timeoff.inputset';
import {
  hrOnboardingTaskInputSet,
  hrOnboardingTaskCompletionInputSet,
  hrOnboardingAssignmentInputSet,
} from './hr-onboarding.inputset';
import {
  hrBenefitPlanInputSet,
  hrBenefitPlanOptionInputSet,
  hrBenefitEnrollmentInputSet,
  hrBenefitDependentInputSet,
} from './hr-benefits.inputset';
import {
  hrPerformanceGoalInputSet,
  hrGoalRatingInputSet,
  hrPerformanceFeedbackInputSet,
  hrSelfAssessmentInputSet,
  hrManagerEvaluationInputSet,
} from './hr-performance.inputset';
import {
  hrComplianceRequirementInputSet,
  hrEmployeeComplianceInputSet,
  hrI9Section1InputSet,
  hrI9Section2InputSet,
  hrI9ReverificationInputSet,
} from './hr-compliance.inputset';
import type { InputSetConfig } from '../types';

/**
 * Registry of all standard InputSets by ID
 */
export const INPUT_SET_REGISTRY: Record<string, InputSetConfig> = {
  // Address
  address: addressInputSet,
  'us-address': usAddressInputSet,
  'work-location': workLocationInputSet,

  // Contact
  contact: contactInputSet,
  'quick-contact': quickContactInputSet,
  poc: pocInputSet,
  'professional-links': professionalLinksInputSet,

  // Compensation
  compensation: compensationInputSet,
  'job-rate': jobRateInputSet,
  'candidate-rate': candidateRateInputSet,
  'placement-rate': placementRateInputSet,

  // Skills
  'job-requirements': jobRequirementsInputSet,
  'candidate-skills': candidateSkillsInputSet,
  education: educationInputSet,
  certification: certificationInputSet,

  // Work Auth
  workauth: workAuthInputSet,
  'visa-details': visaDetailsInputSet,
  'work-eligibility': workEligibilityInputSet,
  'multi-country-workauth': multiCountryWorkAuthInputSet,
  'canada-workauth': canadaWorkAuthInputSet,

  // Interview
  'interview-schedule': interviewScheduleInputSet,
  'interview-feedback': interviewFeedbackInputSet,
  'quick-interview-rating': quickInterviewRatingInputSet,
  'interview-reschedule': interviewRescheduleInputSet,

  // Rate Card
  'rate-card': rateCardInputSet,
  'rate-range': rateRangeInputSet,
  'desired-rate': desiredRateInputSet,
  'overtime-rate': overtimeRateInputSet,

  // Availability
  availability: availabilityInputSet,
  'simple-availability': simpleAvailabilityInputSet,
  'placement-availability': placementAvailabilityInputSet,

  // Timeline
  'timeline-filter': timelineFilterInputSet,
  'quick-log-activity': quickLogActivityInputSet,
  'schedule-activity': scheduleActivityInputSet,
  'activity-badge': activityBadgeInputSet,

  // RACI
  'raci-assignment': raciAssignmentInputSet,
  'raci-display': raciDisplayInputSet,
  'quick-owner-change': quickOwnerChangeInputSet,
  'bulk-raci': bulkRaciInputSet,
  'raci-matrix': raciMatrixInputSet,

  // CRM Contact
  'crm-contact-basic': crmContactBasicInputSet,
  'crm-contact-type': crmContactTypeInputSet,
  'crm-contact-company': crmContactCompanyInputSet,
  'crm-contact-decision': crmContactDecisionInputSet,
  'crm-contact-preferences': crmContactPreferencesInputSet,
  'crm-contact-email-prefs': crmContactEmailPrefsInputSet,
  'crm-contact-social': crmContactSocialInputSet,
  'crm-contact-notes': crmContactNotesInputSet,
  'crm-contact-engagement': crmContactEngagementInputSet,
  'crm-contact-full': crmContactFullInputSet,
  'crm-contact-quick-add': crmContactQuickAddInputSet,

  // CRM Deal
  'deal-basic': dealBasicInputSet,
  'deal-value': dealValueInputSet,
  'deal-stage': dealStageInputSet,
  'deal-assignment': dealAssignmentInputSet,
  'deal-outcome': dealOutcomeInputSet,
  'deal-notes': dealNotesInputSet,
  'deal-stakeholder': dealStakeholderInputSet,
  'deal-competitor': dealCompetitorInputSet,
  'deal-product': dealProductInputSet,
  'deal-stage-history': dealStageHistoryInputSet,
  'deal-full': dealFullInputSet,
  'deal-quick-add': dealQuickAddInputSet,

  // CRM Campaign
  'campaign-basic': campaignBasicInputSet,
  'campaign-schedule': campaignScheduleInputSet,
  'campaign-target': campaignTargetInputSet,
  'campaign-goals': campaignGoalsInputSet,
  'campaign-assignment': campaignAssignmentInputSet,
  'campaign-notes': campaignNotesInputSet,
  'campaign-content': campaignContentInputSet,
  'campaign-target-record': campaignTargetRecordInputSet,
  'campaign-metrics': campaignMetricsInputSet,
  'campaign-rates': campaignRatesInputSet,
  'campaign-cost': campaignCostInputSet,
  'campaign-full': campaignFullInputSet,
  'campaign-quick-add': campaignQuickAddInputSet,

  // CRM Lead
  'lead-bant-score': leadBANTScoreInputSet,
  'lead-bant-notes': leadBANTNotesInputSet,
  'lead-qualification-budget': leadQualificationBudgetInputSet,
  'lead-qualification-authority': leadQualificationAuthorityInputSet,
  'lead-qualification-need': leadQualificationNeedInputSet,
  'lead-qualification-timeline': leadQualificationTimelineInputSet,
  'lead-qualification-status': leadQualificationStatusInputSet,
  'lead-touchpoint': leadTouchpointInputSet,
  'lead-bant-full': leadBANTFullInputSet,

  // CRM Account
  'account-address': accountAddressInputSet,
  'account-contract': accountContractInputSet,
  'account-team': accountTeamInputSet,
  'account-preferences-skills': accountPreferencesSkillsInputSet,
  'account-preferences-visa': accountPreferencesVisaInputSet,
  'account-preferences-rate': accountPreferencesRateInputSet,
  'account-preferences-work': accountPreferencesWorkInputSet,
  'account-preferences-interview': accountPreferencesInterviewInputSet,
  'account-preferences-full': accountPreferencesFullInputSet,
  'account-metrics-placements': accountMetricsPlacementInputSet,
  'account-metrics-revenue': accountMetricsRevenueInputSet,
  'account-metrics-performance': accountMetricsPerformanceInputSet,
  'account-metrics-activity': accountMetricsActivityInputSet,
  'account-metrics-full': accountMetricsFullInputSet,

  // HR Employee
  'hr-employee-basic': hrEmployeeBasicInputSet,
  'hr-employee-employment': hrEmployeeEmploymentInputSet,
  'hr-employee-compensation': hrEmployeeCompensationInputSet,
  'hr-employee-address': hrEmployeeAddressInputSet,
  'hr-employee-emergency': hrEmployeeEmergencyInputSet,
  'hr-employee-termination': hrEmployeeTerminationInputSet,
  'hr-employee-document': hrEmployeeDocumentInputSet,
  'hr-employee-full': hrEmployeeFullInputSet,
  'hr-employee-quick-add': hrEmployeeQuickAddInputSet,

  // HR Time Off
  'hr-timeoff-request': hrTimeOffRequestInputSet,
  'hr-timeoff-approval': hrTimeOffApprovalInputSet,
  'hr-timeoff-balance': hrTimeOffBalanceInputSet,

  // HR Onboarding
  'hr-onboarding-task': hrOnboardingTaskInputSet,
  'hr-onboarding-task-completion': hrOnboardingTaskCompletionInputSet,
  'hr-onboarding-assignment': hrOnboardingAssignmentInputSet,

  // HR Benefits
  'hr-benefit-plan': hrBenefitPlanInputSet,
  'hr-benefit-plan-option': hrBenefitPlanOptionInputSet,
  'hr-benefit-enrollment': hrBenefitEnrollmentInputSet,
  'hr-benefit-dependent': hrBenefitDependentInputSet,

  // HR Performance
  'hr-performance-goal': hrPerformanceGoalInputSet,
  'hr-goal-rating': hrGoalRatingInputSet,
  'hr-performance-feedback': hrPerformanceFeedbackInputSet,
  'hr-self-assessment': hrSelfAssessmentInputSet,
  'hr-manager-evaluation': hrManagerEvaluationInputSet,

  // HR Compliance
  'hr-compliance-requirement': hrComplianceRequirementInputSet,
  'hr-employee-compliance': hrEmployeeComplianceInputSet,
  'hr-i9-section1': hrI9Section1InputSet,
  'hr-i9-section2': hrI9Section2InputSet,
  'hr-i9-reverification': hrI9ReverificationInputSet,
};

/**
 * Get an InputSet by ID
 */
export function getInputSet(id: string): InputSetConfig | undefined {
  return INPUT_SET_REGISTRY[id];
}

/**
 * Get all available InputSet IDs
 */
export function getAvailableInputSetIds(): string[] {
  return Object.keys(INPUT_SET_REGISTRY);
}

/**
 * Check if an InputSet exists
 */
export function hasInputSet(id: string): boolean {
  return id in INPUT_SET_REGISTRY;
}
