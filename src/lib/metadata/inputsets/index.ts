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
  RATE_TYPE_OPTIONS,
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
