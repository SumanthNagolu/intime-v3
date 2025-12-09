// Wizard Configurations Index
// Export all wizard configs for easy importing

// Job Intake Wizard (existing - full intake)
export {
  jobIntakeWizardConfig,
  jobIntakeSteps,
  type JobIntakeFormData,
} from './job-intake.config'

// Job Create Wizard (simple 3-step creation)
export {
  jobCreateWizardConfig,
  createJobCreateConfig,
  jobCreateSteps,
  jobCreateSchema,
  type JobCreateFormData,
} from './job-create.config'

// Account Onboarding Wizard (existing)
export {
  accountOnboardingWizardConfig,
  accountOnboardingSteps,
  type AccountOnboardingFormData,
} from './account-onboarding.config'

// Candidate Intake Wizard
export {
  candidateIntakeWizardConfig,
  createCandidateIntakeConfig,
  candidateIntakeSteps,
  candidateIntakeSchema,
  type CandidateIntakeFormData,
} from './candidate-intake.config'

// Deal Intake Wizard
export {
  dealIntakeWizardConfig,
  createDealIntakeConfig,
  dealIntakeSteps,
  dealIntakeSchema,
  type DealIntakeFormData,
} from './deal-intake.config'

// Placement Setup Wizard
export {
  placementSetupWizardConfig,
  createPlacementSetupConfig,
  placementSetupSteps,
  placementSetupSchema,
  type PlacementSetupFormData,
} from './placement-setup.config'

// Campaign Setup Wizard
export {
  campaignSetupWizardConfig,
  createCampaignSetupConfig,
  campaignSetupSteps,
  campaignSetupSchema,
  type CampaignSetupFormData,
} from './campaign-setup.config'

