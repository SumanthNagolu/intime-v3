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
  workAuthFields,
  visaDetailsFields,
  WORK_AUTH_STATUS_OPTIONS,
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
// INPUT SET REGISTRY
// ==========================================

import { addressInputSet, usAddressInputSet, workLocationInputSet } from './address.inputset';
import { contactInputSet, quickContactInputSet, pocInputSet, professionalLinksInputSet } from './contact.inputset';
import { compensationInputSet, jobRateInputSet, candidateRateInputSet, placementRateInputSet } from './compensation.inputset';
import { jobRequirementsInputSet, candidateSkillsInputSet, educationInputSet, certificationInputSet } from './skills.inputset';
import { workAuthInputSet, visaDetailsInputSet, workEligibilityInputSet } from './workauth.inputset';
import { interviewScheduleInputSet, interviewFeedbackInputSet, quickInterviewRatingInputSet, interviewRescheduleInputSet } from './interview.inputset';
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

  // Interview
  'interview-schedule': interviewScheduleInputSet,
  'interview-feedback': interviewFeedbackInputSet,
  'quick-interview-rating': quickInterviewRatingInputSet,
  'interview-reschedule': interviewRescheduleInputSet,
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
