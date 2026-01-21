// Account Workspace
export { AccountWorkspace } from './AccountWorkspace'

// Contact Workspace
export { ContactWorkspace } from './ContactWorkspace'

// Job Workspace
export { JobWorkspace } from './JobWorkspace'
export { JobWorkspaceProvider, useJobWorkspace } from './job/JobWorkspaceProvider'
export { JobHeader } from './job/JobHeader'

// Candidate Workspace (GW-031)
export { CandidateWorkspace } from './candidate/CandidateWorkspace'
export { CandidateWorkspaceProvider, useCandidateWorkspace } from './candidate/CandidateWorkspaceProvider'

// Submission Workspace (GW-040)
export { SubmissionWorkspace } from './submission/SubmissionWorkspace'

// Interview Workspace (GW-041)
export { InterviewContextHeader } from './interview'

// Lead Workspace (GW-051)
export { LeadWorkspace, LeadWorkspaceProvider, useLeadWorkspace, LeadHeader } from './lead'
