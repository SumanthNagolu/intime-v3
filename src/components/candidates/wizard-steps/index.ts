'use client'

/**
 * Candidate Wizard Step Wrappers
 *
 * These components bridge between the wizard infrastructure (formData, setFormData, errors)
 * and the unified section components (mode, data, onChange).
 *
 * Each wrapper:
 * 1. Accepts wizard props: formData, setFormData, errors
 * 2. Maps formData to section-specific data format
 * 3. Maps setFormData to onChange handler
 * 4. Renders section with mode='create'
 */

export { SourceSelectionStepWrapper } from './SourceSelectionStepWrapper'
export { IdentityStepWrapper } from './IdentityStepWrapper'
export { ExperienceStepWrapper } from './ExperienceStepWrapper'
export { SkillsStepWrapper } from './SkillsStepWrapper'
export { AuthorizationStepWrapper } from './AuthorizationStepWrapper'
export { CompensationStepWrapper } from './CompensationStepWrapper'
export { ResumeStepWrapper } from './ResumeStepWrapper'
