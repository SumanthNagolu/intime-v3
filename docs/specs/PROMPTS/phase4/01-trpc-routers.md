# PROMPT: TRPC-ROUTERS (Window 1)

Copy everything below the line and paste into Claude Code CLI:

---

Use the trpc skill and database skill.

Create all tRPC routers for InTime v3 based on the database schemas.

## Read First:
- src/lib/db/schema/*.ts (All schemas)
- src/server/routers/*.ts (Existing routers)
- src/server/trpc.ts (tRPC setup)
- docs/specs/20-USER-ROLES/00-MASTER-FRAMEWORK.md

## Create/Update Routers (src/server/routers/):

### 1. Core Routers:

#### organizationRouter.ts
Procedures:
- `get` - Get current org
- `update` - Update org settings
- `getSettings` - Get org settings
- `updateSettings` - Update specific settings

#### userRouter.ts
Procedures:
- `list` - List users (paginated, filtered)
- `get` - Get user by ID
- `create` - Create user
- `update` - Update user
- `deactivate` - Soft delete user
- `getProfile` - Get current user profile
- `updateProfile` - Update current user profile
- `getRoles` - Get user's roles
- `assignRole` - Assign role to user
- `removeRole` - Remove role from user

#### podRouter.ts
Procedures:
- `list` - List pods
- `get` - Get pod by ID
- `create` - Create pod
- `update` - Update pod
- `addMember` - Add member to pod
- `removeMember` - Remove member from pod
- `getMembers` - Get pod members

#### auditRouter.ts
Procedures:
- `list` - List audit logs (paginated, filtered)
- `getEntityHistory` - Get history for entity

### 2. ATS Routers:

#### jobRouter.ts
Procedures:
- `list` - List jobs (paginated, filtered by status, account, priority)
- `get` - Get job with relations
- `create` - Create job
- `update` - Update job
- `updateStatus` - Change job status
- `clone` - Clone job
- `getRequirements` - Get job requirements
- `getSkills` - Get job skills
- `getSubmissions` - Get submissions for job
- `getStats` - Get job stats (submissions, interviews)

#### candidateRouter.ts
Procedures:
- `list` - List candidates (paginated, filtered)
- `get` - Get candidate with profile
- `create` - Create candidate
- `update` - Update candidate
- `updateStatus` - Change status
- `getSkills` - Get candidate skills
- `addSkill` - Add skill
- `updateSkill` - Update skill proficiency
- `getWorkHistory` - Get work history
- `getDocuments` - Get documents
- `uploadDocument` - Upload document
- `getSubmissions` - Get submissions for candidate
- `search` - Search candidates (for autocomplete)

#### submissionRouter.ts
Procedures:
- `list` - List submissions (paginated, filtered)
- `get` - Get submission with relations
- `create` - Create submission
- `update` - Update submission
- `updateStatus` - Change status
- `getRates` - Get submission rates
- `updateRates` - Update rates
- `getNotes` - Get notes
- `addNote` - Add note
- `getHistory` - Get status history
- `getForJob` - Get submissions for job
- `getForCandidate` - Get submissions for candidate

#### interviewRouter.ts
Procedures:
- `list` - List interviews (paginated, filtered)
- `get` - Get interview with participants
- `create` - Schedule interview
- `update` - Update interview
- `cancel` - Cancel interview
- `reschedule` - Reschedule
- `addParticipant` - Add participant
- `removeParticipant` - Remove participant
- `getFeedback` - Get feedback
- `submitFeedback` - Submit feedback
- `getUpcoming` - Get upcoming interviews

#### offerRouter.ts
Procedures:
- `list` - List offers
- `get` - Get offer with terms
- `create` - Create offer
- `update` - Update offer
- `send` - Send offer
- `withdraw` - Withdraw offer
- `getTerms` - Get offer terms
- `addTerm` - Add term
- `getNegotiations` - Get negotiations
- `addNegotiation` - Add negotiation

#### placementRouter.ts
Procedures:
- `list` - List placements
- `get` - Get placement
- `create` - Create placement from offer
- `update` - Update placement
- `extend` - Extend placement
- `terminate` - Terminate placement
- `getRates` - Get rate history
- `getTimesheets` - Get timesheets
- `submitTimesheet` - Submit timesheet

### 3. CRM Routers:

#### accountRouter.ts
Procedures:
- `list` - List accounts (paginated, filtered by tier, status)
- `get` - Get account with contacts
- `create` - Create account
- `update` - Update account
- `getContacts` - Get account contacts
- `addContact` - Add contact
- `getContracts` - Get contracts
- `getPreferences` - Get preferences
- `getMetrics` - Get account metrics
- `getTeam` - Get account team
- `assignTeamMember` - Assign team member
- `getJobs` - Get jobs for account
- `search` - Search accounts

#### contactRouter.ts
Procedures:
- `list` - List contacts
- `get` - Get contact
- `create` - Create contact
- `update` - Update contact
- `getAccounts` - Get contact's accounts
- `getPreferences` - Get preferences
- `search` - Search contacts

#### leadRouter.ts
Procedures:
- `list` - List leads (paginated, filtered)
- `get` - Get lead with score
- `create` - Create lead
- `update` - Update lead
- `qualify` - Qualify lead
- `disqualify` - Disqualify lead
- `convert` - Convert to account
- `getScore` - Get lead score
- `getTouchpoints` - Get touchpoints
- `addTouchpoint` - Add touchpoint
- `assign` - Assign lead

#### dealRouter.ts
Procedures:
- `list` - List deals (pipeline view)
- `get` - Get deal
- `create` - Create deal
- `update` - Update deal
- `updateStage` - Move deal stage
- `close` - Close deal (won/lost)
- `getStakeholders` - Get stakeholders
- `getProducts` - Get deal products
- `getHistory` - Get stage history

#### campaignRouter.ts
Procedures:
- `list` - List campaigns
- `get` - Get campaign
- `create` - Create campaign
- `update` - Update campaign
- `launch` - Launch campaign
- `pause` - Pause campaign
- `getTargets` - Get targets
- `addTargets` - Add targets
- `getMetrics` - Get campaign metrics

### 4. Bench Sales Routers:

#### consultantRouter.ts
Procedures:
- `list` - List consultants
- `get` - Get consultant with visa details
- `onboard` - Onboard new consultant
- `update` - Update consultant
- `updateStatus` - Change status
- `getVisaDetails` - Get visa details
- `updateVisaDetails` - Update visa
- `getRates` - Get rate history
- `updateRates` - Update rates
- `getSkillsMatrix` - Get skills matrix
- `getAvailability` - Get availability
- `getSubmissions` - Get job order submissions

#### marketingRouter.ts
Procedures:
- `getProfile` - Get marketing profile
- `createProfile` - Create profile
- `updateProfile` - Update profile
- `publish` - Publish profile
- `archive` - Archive profile
- `getFormats` - Get format versions
- `generateFormat` - Generate format (PDF)
- `getTemplates` - Get templates

#### hotlistRouter.ts
Procedures:
- `list` - List hotlists
- `get` - Get hotlist with consultants
- `create` - Create hotlist
- `update` - Update hotlist
- `addConsultant` - Add consultant
- `removeConsultant` - Remove consultant
- `reorder` - Reorder consultants
- `export` - Export hotlist

#### vendorRouter.ts
Procedures:
- `list` - List vendors
- `get` - Get vendor with terms
- `create` - Create vendor
- `update` - Update vendor
- `getContacts` - Get contacts
- `addContact` - Add contact
- `getTerms` - Get terms
- `updateTerms` - Update terms
- `getPerformance` - Get performance metrics
- `blacklist` - Blacklist vendor
- `getRelationships` - Get relationships

#### jobOrderRouter.ts
Procedures:
- `list` - List job orders
- `get` - Get job order
- `create` - Create job order
- `update` - Update job order
- `updateStatus` - Change status
- `getRequirements` - Get requirements
- `getSubmissions` - Get submissions
- `submitConsultant` - Submit consultant
- `getNotes` - Get notes
- `addNote` - Add note

#### immigrationRouter.ts
Procedures:
- `listCases` - List immigration cases
- `getCase` - Get case details
- `createCase` - Create case
- `updateCase` - Update case
- `getDocuments` - Get documents
- `uploadDocument` - Upload document
- `getTimeline` - Get timeline
- `addMilestone` - Add milestone
- `getAlerts` - Get immigration alerts
- `acknowledgeAlert` - Acknowledge alert
- `listAttorneys` - List attorneys

### 5. HR & Academy Routers:

#### employeeRouter.ts
Procedures:
- `list` - List employees
- `get` - Get employee
- `create` - Create employee
- `update` - Update employee
- `terminate` - Terminate employee
- `getDocuments` - Get documents
- `getOnboarding` - Get onboarding status
- `getBenefits` - Get enrolled benefits
- `getTimeOff` - Get time off balance

#### benefitRouter.ts
Procedures:
- `listPlans` - List benefit plans
- `getPlan` - Get plan details
- `getOptions` - Get plan options
- `enroll` - Enroll employee
- `unenroll` - Unenroll employee
- `getDependents` - Get dependents
- `addDependent` - Add dependent

#### courseRouter.ts
Procedures:
- `list` - List courses
- `get` - Get course with modules
- `create` - Create course
- `update` - Update course
- `publish` - Publish course
- `archive` - Archive course
- `getModules` - Get modules
- `getLessons` - Get lessons
- `getEnrollments` - Get enrollments

#### enrollmentRouter.ts
Procedures:
- `list` - List enrollments
- `enroll` - Enroll user
- `drop` - Drop enrollment
- `getProgress` - Get progress
- `updateProgress` - Update lesson progress
- `submitQuiz` - Submit quiz attempt
- `submitAssignment` - Submit assignment
- `getCertificate` - Get certificate

#### gamificationRouter.ts
Procedures:
- `getLevel` - Get user level
- `getXP` - Get XP transactions
- `getAchievements` - Get achievements
- `getStreaks` - Get streaks
- `getLeaderboard` - Get leaderboard

### 6. Workplan & Activity Routers:

#### activityRouter.ts
Procedures:
- `list` - List activities (filtered)
- `get` - Get activity with details
- `create` - Create activity
- `update` - Update activity
- `start` - Start activity
- `complete` - Complete activity
- `defer` - Defer activity
- `cancel` - Cancel activity
- `reassign` - Reassign activity
- `getChecklist` - Get checklist
- `updateChecklist` - Update checklist item
- `getComments` - Get comments
- `addComment` - Add comment
- `getMyQueue` - Get personal queue
- `getTeamQueue` - Get team queue

#### patternRouter.ts
Procedures:
- `list` - List patterns
- `get` - Get pattern with fields
- `create` - Create pattern
- `update` - Update pattern
- `getFields` - Get pattern fields
- `getChecklist` - Get default checklist

#### eventRouter.ts
Procedures:
- `list` - List events
- `get` - Get event
- `getForEntity` - Get events for entity
- `subscribe` - Subscribe to event type
- `unsubscribe` - Unsubscribe

## Router Pattern:
```typescript
export const entityRouter = router({
  list: protectedProcedure
    .input(listInputSchema)
    .query(async ({ ctx, input }) => {
      // Implementation
    }),
  // ...
});
```

## Requirements:
- Input validation with Zod
- Proper error handling
- Permission checks (use ctx.user.permissions)
- Pagination for list queries
- Soft delete support
- Audit logging on mutations
- Activity creation on key actions

## After Routers:
- Register all routers in src/server/routers/index.ts
- Generate types: pnpm build
