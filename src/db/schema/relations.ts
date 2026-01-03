import { relations } from "drizzle-orm/relations";
import { badges, badgeProgress, userProfiles, badgeTriggerEvents, studentEnrollments, paymentTransactions, commissions, deals, organizations, commissionPayments, productivityReports, leads, campaigns, companies, contacts, generatedResumes, requisitionEmbeddings, resumeMatches, employeeTwinInteractions, candidateEmbeddings, leadSourcingCredits, roles, twinPreferences, topicLessons, contentAssets, moduleTopics, videoProgress, projectTimeline, sessionMetadata, campaignDocuments, events, eventDeliveryLog, eventSubscriptions, onboardingChecklist, courses, courseModules, aiConversations, aiPatterns, aiCostTracking, aiPrompts, studentProgress, aiAgentInteractions, guruInteractions, resumeVersions, interviewSessions, employeeScreenshots, topicCompletions, xpTransactions, readingProgress, labTemplates, labInstances, labSubmissions, capstoneSubmissions, twinEvents, twinConversations, quizQuestions, quizSettings, peerReviews, aiMentorChats, aiPromptVariants, sequenceTemplates, aiMentorRateLimits, aiMentorSessions, permissionOverrides, permissions, campaignSequences, apiTokens, bulkUpdateHistory, rolePermissions, systemRoles, aiQuestionPatterns, featureFlags, featureFlagRoles, userBadges, systemSettings, workflows, workflowStates, workflowTransitions, workflowInstances, workflowHistory, fileUploads, documentTemplates, generatedDocuments, emailLogs, emailTemplates, backgroundJobs, discountCodes, studentInterventions, discountCodeUsage, coursePricing, organizationSettings, contactLeadData, comments, leadTasks, notifications, tasks, organizationBranding, companyContracts, companyRateCards, companyRateCardItems, companyComplianceRequirements, companyHealthScores, companyMetrics, companyRevenue, activityLog, employeeMetadata, pods, candidates, candidateSkills, skills, groups, regions, userSessionContext, podManagers, leadStrategies, talkingPointTemplates, payrollItems, payrollRuns, timeAttendance, performanceReviews, importJobs, exportJobs, gdprRequests, duplicateRecords, duplicateRules, archivedRecords, retentionPolicies, candidateResumes, candidateBackgroundChecks, placements, submissions, candidateCertifications, candidateComplianceDocuments, objectOwners, candidateEducation, candidateReferences, candidateWorkAuthorizations, podMembers, jobs, jobSkills, jobRequirements, jobRates, jobAssignments, jobScreeningQuestions, candidateDocuments, candidateProfiles, candidatePreferences, candidateAvailability, submissionRates, submissionScreeningAnswers, submissionNotes, marketingTemplates, hotlistConsultants, benchConsultants, skillAliases, submissionStatusHistory, interviews, interviewFeedback, interviewReminders, offers, offerTerms, placementTimesheets, consultantVisaDetails, consultantWorkAuthorization, consultantAvailability, consultantRates, usersInAuth, marketingProfiles, marketingFormats, vendorRelationships, vendorBlacklist, companyTeam, companyContacts, companyRelationships, immigrationAttorneys, immigrationDocuments, immigrationAlerts, companyAddresses, companyNotes, externalJobOrderSubmissions, externalJobOrders, companyPreferences, companyTags, benefitPlans, benefitPlanOptions, integrations, integrationHealthLogs, dealStagesHistory, dealStakeholders, leadScores, leadQualification, candidateWorkHistory, leadTouchpoints, dealCompetitors, dealProducts, employees, employeeProfiles, employeeDocuments, employeeTimeOff, employeeBenefits, benefitDependents, raciChangeLog, employeeCompliance, legacyComplianceRequirements, i9Records, performanceGoals, performanceFeedback, activityPatterns, patternChecklistItems, activityPatternSuccessors, workplanTemplates, workplanPhases, workplanInstances, workplanTemplateActivities, activities, activityParticipants, activityFieldValues, patternFields, activityChecklistItems, activityComments, activityAttachments, activityReminders, podSprintMetrics, activityTimeEntries, activityDependencies, activityAutoRules, activityHistory, addresses, queueItems, workQueues, slaInstances, slaDefinitions, bulkActivityJobs, activityMetrics, teamMetrics, learningPaths, learningPathCourses, pathEnrollments, certificates, certificateTemplates, userLevels, achievements, userAchievements, learningStreaks, leaderboards, leaderboardEntries, loginHistory, userInvitations, webhooks, webhookDeliveries, integrationRetryConfig, integrationOauthTokens, integrationFailoverConfig, externalJobOrderRequirements, externalJobOrderSkills, externalJobOrderNotes, approvalWorkflows, approvalSteps, approvalInstances, placementCredits, graduateCandidates, quizAttempts, aiMentorEscalations, trainerResponses, escalationNotifications, entitySkills, certifications, contactBenchData, submissionFeedback, submissionRtr, documents, skillEndorsements, auditLogs202511, auditLogs202512, auditLogs202601, auditLogs202602, securityAlerts, alertRules, emailSends, emailSenders, activityNotes, incidents, incidentTimeline, incidentNotifications, breakGlassAccess, emergencyDrills, workQueueMembers, slaEscalationLevels, slaEvents, slaNotifications, activityEscalations, activityStatsDaily, notes, featureFlagUsage, featureFlagFeedback, featureFlagCategories, jobStatusHistory, savedSearches, candidatePreparedProfiles, candidateScreenings, contactRelationships, contactRoles, offerNegotiations, offerApprovals, contactSkills, contactWorkHistory, contactEducation, contactCertifications, placementMilestones, contactRateCards, placementExtensions, placementRates, contactAgreements, contactCompliance, groupMembers, contactCommunicationPreferences, contactMergeHistory, noteReactions, groupRegions, meetingNotes, escalations, escalationUpdates, documentAccessLog, companyClientDetails, entityDrafts, companyVendorDetails, companyPartnerDetails, dataRetentionPolicies, complianceRequirements, complianceItems, entityComplianceRequirements, contracts, contractVersions, contractParties, contractTemplates, contractClauses, rateApprovals, entityRates, rateCards, rateCardItems, rateChangeHistory, interviewParticipants, interviewScorecards, scorecardTemplates, placementVendors, placementChangeOrders, placementCheckins, onboardingTasks, employeeOnboarding, onboardingTemplates, onboardingTemplateTasks, timesheets, timesheetEntries, timesheetApprovals, timesheetExpenses, invoices, invoiceLineItems, payItems, payRuns, payItemEarnings, payItemDeductions, payStubs, timesheetApprovalWorkflows, timesheetAdjustments, timesheetTemplates, invoicePayments, paymentTerms, invoiceBatches, invoiceTemplates, payPeriods, workerTaxSetup, workerBenefits, workerGarnishments, taxDocuments, workflowExecutions, workflowSteps, workflowActions, workflowApprovals, workflowExecutionLogs, notificationPreferences, notificationTemplates, campaignEnrollments, campaignSequenceLogs, communications, communicationEvents, ptoBalances, userRoles, systemEvents202512, systemEvents202601, systemEvents202602, systemEvents202603, auditLog202602, auditLog202603, auditLog202512, auditLog202601, entityHistory202601, entityHistory202602, entityHistory202603, entityHistory202512 } from "./schema";

export const badgeProgressRelations = relations(badgeProgress, ({one}) => ({
	badge: one(badges, {
		fields: [badgeProgress.badgeId],
		references: [badges.id]
	}),
	userProfile: one(userProfiles, {
		fields: [badgeProgress.userId],
		references: [userProfiles.id]
	}),
}));

export const badgesRelations = relations(badges, ({many}) => ({
	badgeProgresses: many(badgeProgress),
	userBadges: many(userBadges),
}));

export const userProfilesRelations = relations(userProfiles, ({one, many}) => ({
	badgeProgresses: many(badgeProgress),
	badgeTriggerEvents: many(badgeTriggerEvents),
	paymentTransactions: many(paymentTransactions),
	commissions_createdBy: many(commissions, {
		relationName: "commissions_createdBy_userProfiles_id"
	}),
	commissions_userId: many(commissions, {
		relationName: "commissions_userId_userProfiles_id"
	}),
	commissionPayments: many(commissionPayments),
	productivityReports: many(productivityReports),
	leads_createdBy: many(leads, {
		relationName: "leads_createdBy_userProfiles_id"
	}),
	leads_ownerId: many(leads, {
		relationName: "leads_ownerId_userProfiles_id"
	}),
	leads_qualifiedBy: many(leads, {
		relationName: "leads_qualifiedBy_userProfiles_id"
	}),
	generatedResumes: many(generatedResumes),
	employeeTwinInteractions: many(employeeTwinInteractions),
	leadSourcingCredits_assignedTo: many(leadSourcingCredits, {
		relationName: "leadSourcingCredits_assignedTo_userProfiles_id"
	}),
	leadSourcingCredits_sourcedBy: many(leadSourcingCredits, {
		relationName: "leadSourcingCredits_sourcedBy_userProfiles_id"
	}),
	roles: many(roles),
	twinPreferences: many(twinPreferences),
	contentAssets: many(contentAssets),
	videoProgresses: many(videoProgress),
	campaignDocuments: many(campaignDocuments),
	onboardingChecklists: many(onboardingChecklist),
	courses: many(courses),
	aiConversations: many(aiConversations),
	aiPatterns: many(aiPatterns),
	aiCostTrackings: many(aiCostTracking),
	aiPrompts: many(aiPrompts),
	studentProgresses: many(studentProgress),
	aiAgentInteractions: many(aiAgentInteractions),
	guruInteractions: many(guruInteractions),
	resumeVersions: many(resumeVersions),
	interviewSessions: many(interviewSessions),
	employeeScreenshots: many(employeeScreenshots),
	topicCompletions: many(topicCompletions),
	xpTransactions_awardedBy: many(xpTransactions, {
		relationName: "xpTransactions_awardedBy_userProfiles_id"
	}),
	xpTransactions_userId: many(xpTransactions, {
		relationName: "xpTransactions_userId_userProfiles_id"
	}),
	readingProgresses: many(readingProgress),
	labTemplates: many(labTemplates),
	labInstances: many(labInstances),
	labSubmissions_gradedBy: many(labSubmissions, {
		relationName: "labSubmissions_gradedBy_userProfiles_id"
	}),
	labSubmissions_userId: many(labSubmissions, {
		relationName: "labSubmissions_userId_userProfiles_id"
	}),
	capstoneSubmissions_gradedBy: many(capstoneSubmissions, {
		relationName: "capstoneSubmissions_gradedBy_userProfiles_id"
	}),
	capstoneSubmissions_userId: many(capstoneSubmissions, {
		relationName: "capstoneSubmissions_userId_userProfiles_id"
	}),
	twinEvents_processedBy: many(twinEvents, {
		relationName: "twinEvents_processedBy_userProfiles_id"
	}),
	twinEvents_sourceUserId: many(twinEvents, {
		relationName: "twinEvents_sourceUserId_userProfiles_id"
	}),
	twinConversations: many(twinConversations),
	quizQuestions: many(quizQuestions),
	peerReviews: many(peerReviews),
	aiMentorChats: many(aiMentorChats),
	sequenceTemplates: many(sequenceTemplates),
	aiMentorRateLimits: many(aiMentorRateLimits),
	aiMentorSessions: many(aiMentorSessions),
	permissionOverrides_createdBy: many(permissionOverrides, {
		relationName: "permissionOverrides_createdBy_userProfiles_id"
	}),
	permissionOverrides_revokedBy: many(permissionOverrides, {
		relationName: "permissionOverrides_revokedBy_userProfiles_id"
	}),
	permissionOverrides_userId: many(permissionOverrides, {
		relationName: "permissionOverrides_userId_userProfiles_id"
	}),
	apiTokens_createdBy: many(apiTokens, {
		relationName: "apiTokens_createdBy_userProfiles_id"
	}),
	apiTokens_revokedBy: many(apiTokens, {
		relationName: "apiTokens_revokedBy_userProfiles_id"
	}),
	bulkUpdateHistories_appliedBy: many(bulkUpdateHistory, {
		relationName: "bulkUpdateHistory_appliedBy_userProfiles_id"
	}),
	bulkUpdateHistories_rolledBackBy: many(bulkUpdateHistory, {
		relationName: "bulkUpdateHistory_rolledBackBy_userProfiles_id"
	}),
	rolePermissions: many(rolePermissions),
	userBadges: many(userBadges),
	systemSettings: many(systemSettings),
	workflowInstances: many(workflowInstances),
	workflowHistories: many(workflowHistory),
	fileUploads: many(fileUploads),
	documentTemplates: many(documentTemplates),
	generatedDocuments: many(generatedDocuments),
	workflows: many(workflows),
	backgroundJobs: many(backgroundJobs),
	discountCodes: many(discountCodes),
	studentInterventions_assignedTrainerId: many(studentInterventions, {
		relationName: "studentInterventions_assignedTrainerId_userProfiles_id"
	}),
	studentInterventions_studentId: many(studentInterventions, {
		relationName: "studentInterventions_studentId_userProfiles_id"
	}),
	studentEnrollments: many(studentEnrollments),
	discountCodeUsages: many(discountCodeUsage),
	organizationSettings: many(organizationSettings),
	comments_authorId: many(comments, {
		relationName: "comments_authorId_userProfiles_id"
	}),
	comments_deletedBy: many(comments, {
		relationName: "comments_deletedBy_userProfiles_id"
	}),
	leadTasks_assignedTo: many(leadTasks, {
		relationName: "leadTasks_assignedTo_userProfiles_id"
	}),
	leadTasks_completedBy: many(leadTasks, {
		relationName: "leadTasks_completedBy_userProfiles_id"
	}),
	leadTasks_createdBy: many(leadTasks, {
		relationName: "leadTasks_createdBy_userProfiles_id"
	}),
	notifications: many(notifications),
	tasks_assignedTo: many(tasks, {
		relationName: "tasks_assignedTo_userProfiles_id"
	}),
	tasks_completedBy: many(tasks, {
		relationName: "tasks_completedBy_userProfiles_id"
	}),
	tasks_createdBy: many(tasks, {
		relationName: "tasks_createdBy_userProfiles_id"
	}),
	organizationBrandings: many(organizationBranding),
	companyContracts_createdBy: many(companyContracts, {
		relationName: "companyContracts_createdBy_userProfiles_id"
	}),
	companyContracts_ourSignatoryId: many(companyContracts, {
		relationName: "companyContracts_ourSignatoryId_userProfiles_id"
	}),
	companyRateCards_approvedBy: many(companyRateCards, {
		relationName: "companyRateCards_approvedBy_userProfiles_id"
	}),
	companyRateCards_createdBy: many(companyRateCards, {
		relationName: "companyRateCards_createdBy_userProfiles_id"
	}),
	companyComplianceRequirements: many(companyComplianceRequirements),
	activityLogs: many(activityLog),
	employeeMetadata: many(employeeMetadata),
	pods_createdBy: many(pods, {
		relationName: "pods_createdBy_userProfiles_id"
	}),
	pods_juniorMemberId: many(pods, {
		relationName: "pods_juniorMemberId_userProfiles_id"
	}),
	pods_managerId: many(pods, {
		relationName: "pods_managerId_userProfiles_id"
	}),
	pods_seniorMemberId: many(pods, {
		relationName: "pods_seniorMemberId_userProfiles_id"
	}),
	userSessionContexts: many(userSessionContext),
	podManagers_assignedBy: many(podManagers, {
		relationName: "podManagers_assignedBy_userProfiles_id"
	}),
	podManagers_removedBy: many(podManagers, {
		relationName: "podManagers_removedBy_userProfiles_id"
	}),
	podManagers_userId: many(podManagers, {
		relationName: "podManagers_userId_userProfiles_id"
	}),
	leadStrategies_createdBy: many(leadStrategies, {
		relationName: "leadStrategies_createdBy_userProfiles_id"
	}),
	leadStrategies_updatedBy: many(leadStrategies, {
		relationName: "leadStrategies_updatedBy_userProfiles_id"
	}),
	talkingPointTemplates: many(talkingPointTemplates),
	payrollItems: many(payrollItems),
	timeAttendances_approvedBy: many(timeAttendance, {
		relationName: "timeAttendance_approvedBy_userProfiles_id"
	}),
	timeAttendances_employeeId: many(timeAttendance, {
		relationName: "timeAttendance_employeeId_userProfiles_id"
	}),
	payrollRuns_approvedBy: many(payrollRuns, {
		relationName: "payrollRuns_approvedBy_userProfiles_id"
	}),
	payrollRuns_createdBy: many(payrollRuns, {
		relationName: "payrollRuns_createdBy_userProfiles_id"
	}),
	performanceReviews_employeeId: many(performanceReviews, {
		relationName: "performanceReviews_employeeId_userProfiles_id"
	}),
	performanceReviews_reviewerId: many(performanceReviews, {
		relationName: "performanceReviews_reviewerId_userProfiles_id"
	}),
	importJobs: many(importJobs),
	exportJobs: many(exportJobs),
	gdprRequests_createdBy: many(gdprRequests, {
		relationName: "gdprRequests_createdBy_userProfiles_id"
	}),
	gdprRequests_processedBy: many(gdprRequests, {
		relationName: "gdprRequests_processedBy_userProfiles_id"
	}),
	duplicateRecords: many(duplicateRecords),
	duplicateRules: many(duplicateRules),
	archivedRecords_archivedBy: many(archivedRecords, {
		relationName: "archivedRecords_archivedBy_userProfiles_id"
	}),
	archivedRecords_deletedBy: many(archivedRecords, {
		relationName: "archivedRecords_deletedBy_userProfiles_id"
	}),
	archivedRecords_restoredBy: many(archivedRecords, {
		relationName: "archivedRecords_restoredBy_userProfiles_id"
	}),
	retentionPolicies: many(retentionPolicies),
	candidateResumes_archivedBy: many(candidateResumes, {
		relationName: "candidateResumes_archivedBy_userProfiles_id"
	}),
	candidateResumes_candidateId: many(candidateResumes, {
		relationName: "candidateResumes_candidateId_userProfiles_id"
	}),
	candidateResumes_uploadedBy: many(candidateResumes, {
		relationName: "candidateResumes_uploadedBy_userProfiles_id"
	}),
	candidateBackgroundChecks: many(candidateBackgroundChecks),
	userProfile: one(userProfiles, {
		fields: [userProfiles.managerId],
		references: [userProfiles.id],
		relationName: "userProfiles_managerId_userProfiles_id"
	}),
	userProfiles: many(userProfiles, {
		relationName: "userProfiles_managerId_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [userProfiles.orgId],
		references: [organizations.id]
	}),
	group: one(groups, {
		fields: [userProfiles.primaryGroupId],
		references: [groups.id],
		relationName: "userProfiles_primaryGroupId_groups_id"
	}),
	systemRole: one(systemRoles, {
		fields: [userProfiles.roleId],
		references: [systemRoles.id]
	}),
	candidateCertifications: many(candidateCertifications),
	candidateComplianceDocuments: many(candidateComplianceDocuments),
	objectOwners_assignedBy: many(objectOwners, {
		relationName: "objectOwners_assignedBy_userProfiles_id"
	}),
	objectOwners_userId: many(objectOwners, {
		relationName: "objectOwners_userId_userProfiles_id"
	}),
	candidateEducations: many(candidateEducation),
	candidateReferences: many(candidateReferences),
	candidateWorkAuthorizations: many(candidateWorkAuthorizations),
	regions_createdBy: many(regions, {
		relationName: "regions_createdBy_userProfiles_id"
	}),
	regions_managerId: many(regions, {
		relationName: "regions_managerId_userProfiles_id"
	}),
	podMembers: many(podMembers),
	jobAssignments: many(jobAssignments),
	candidateDocuments: many(candidateDocuments),
	candidateProfiles: many(candidateProfiles),
	candidatePreferences: many(candidatePreferences),
	candidateAvailabilities: many(candidateAvailability),
	submissionNotes: many(submissionNotes),
	marketingTemplates: many(marketingTemplates),
	hotlistConsultants: many(hotlistConsultants),
	events: many(events),
	eventSubscriptions: many(eventSubscriptions),
	submissionStatusHistories: many(submissionStatusHistory),
	interviewFeedbacks: many(interviewFeedback),
	placementTimesheets: many(placementTimesheets),
	consultantWorkAuthorizations: many(consultantWorkAuthorization),
	consultantRates: many(consultantRates),
	marketingProfiles: many(marketingProfiles),
	vendorRelationships: many(vendorRelationships),
	vendorBlacklists: many(vendorBlacklist),
	companyTeams_assignedBy: many(companyTeam, {
		relationName: "companyTeam_assignedBy_userProfiles_id"
	}),
	companyTeams_removedBy: many(companyTeam, {
		relationName: "companyTeam_removedBy_userProfiles_id"
	}),
	companyTeams_userId: many(companyTeam, {
		relationName: "companyTeam_userId_userProfiles_id"
	}),
	companyContacts: many(companyContacts),
	companyRelationships: many(companyRelationships),
	immigrationDocuments: many(immigrationDocuments),
	immigrationAlerts: many(immigrationAlerts),
	companyNotes: many(companyNotes),
	externalJobOrderSubmissions: many(externalJobOrderSubmissions),
	companyPreferences: many(companyPreferences),
	companyTags: many(companyTags),
	integrations: many(integrations),
	integrationHealthLogs: many(integrationHealthLogs),
	externalJobOrders: many(externalJobOrders),
	dealStagesHistories: many(dealStagesHistory),
	leadQualifications: many(leadQualification),
	candidateWorkHistories: many(candidateWorkHistory),
	leadTouchpoints: many(leadTouchpoints),
	employees_createdBy: many(employees, {
		relationName: "employees_createdBy_userProfiles_id"
	}),
	employees_updatedBy: many(employees, {
		relationName: "employees_updatedBy_userProfiles_id"
	}),
	employees_userId: many(employees, {
		relationName: "employees_userId_userProfiles_id"
	}),
	employeeDocuments_createdBy: many(employeeDocuments, {
		relationName: "employeeDocuments_createdBy_userProfiles_id"
	}),
	employeeDocuments_verifiedBy: many(employeeDocuments, {
		relationName: "employeeDocuments_verifiedBy_userProfiles_id"
	}),
	employeeTimeOffs_approvedBy: many(employeeTimeOff, {
		relationName: "employeeTimeOff_approvedBy_userProfiles_id"
	}),
	employeeTimeOffs_createdBy: many(employeeTimeOff, {
		relationName: "employeeTimeOff_createdBy_userProfiles_id"
	}),
	benefitPlans: many(benefitPlans),
	employeeBenefits: many(employeeBenefits),
	raciChangeLogs: many(raciChangeLog),
	i9Records: many(i9Records),
	legacyComplianceRequirements: many(legacyComplianceRequirements),
	performanceGoals: many(performanceGoals),
	performanceFeedbacks: many(performanceFeedback),
	workplanInstances: many(workplanInstances),
	activityParticipants_addedBy: many(activityParticipants, {
		relationName: "activityParticipants_addedBy_userProfiles_id"
	}),
	activityParticipants_userId: many(activityParticipants, {
		relationName: "activityParticipants_userId_userProfiles_id"
	}),
	activityChecklistItems: many(activityChecklistItems),
	activityComments_createdBy: many(activityComments, {
		relationName: "activityComments_createdBy_userProfiles_id"
	}),
	activityComments_updatedBy: many(activityComments, {
		relationName: "activityComments_updatedBy_userProfiles_id"
	}),
	activityAttachments: many(activityAttachments),
	activityReminders: many(activityReminders),
	activityTimeEntries: many(activityTimeEntries),
	activityAutoRules: many(activityAutoRules),
	activityHistories: many(activityHistory),
	queueItems: many(queueItems),
	bulkActivityJobs: many(bulkActivityJobs),
	activityMetrics: many(activityMetrics),
	learningPaths: many(learningPaths),
	pathEnrollments: many(pathEnrollments),
	userLevels: many(userLevels),
	userAchievements: many(userAchievements),
	learningStreaks: many(learningStreaks),
	leaderboardEntries: many(leaderboardEntries),
	loginHistories: many(loginHistory),
	userInvitations_invitedBy: many(userInvitations, {
		relationName: "userInvitations_invitedBy_userProfiles_id"
	}),
	userInvitations_managerId: many(userInvitations, {
		relationName: "userInvitations_managerId_userProfiles_id"
	}),
	webhooks: many(webhooks),
	integrationOauthTokens: many(integrationOauthTokens),
	externalJobOrderNotes: many(externalJobOrderNotes),
	activities_assignedTo: many(activities, {
		relationName: "activities_assignedTo_userProfiles_id"
	}),
	activities_claimedBy: many(activities, {
		relationName: "activities_claimedBy_userProfiles_id"
	}),
	activities_createdBy: many(activities, {
		relationName: "activities_createdBy_userProfiles_id"
	}),
	activities_escalatedToUserId: many(activities, {
		relationName: "activities_escalatedToUserId_userProfiles_id"
	}),
	activities_originalAssignedTo: many(activities, {
		relationName: "activities_originalAssignedTo_userProfiles_id"
	}),
	activities_performedBy: many(activities, {
		relationName: "activities_performedBy_userProfiles_id"
	}),
	activities_updatedBy: many(activities, {
		relationName: "activities_updatedBy_userProfiles_id"
	}),
	benchConsultants_benchSalesRepId: many(benchConsultants, {
		relationName: "benchConsultants_benchSalesRepId_userProfiles_id"
	}),
	benchConsultants_candidateId: many(benchConsultants, {
		relationName: "benchConsultants_candidateId_userProfiles_id"
	}),
	benchConsultants_createdBy: many(benchConsultants, {
		relationName: "benchConsultants_createdBy_userProfiles_id"
	}),
	approvalWorkflows: many(approvalWorkflows),
	approvalSteps_approverId: many(approvalSteps, {
		relationName: "approvalSteps_approverId_userProfiles_id"
	}),
	approvalSteps_decidedBy: many(approvalSteps, {
		relationName: "approvalSteps_decidedBy_userProfiles_id"
	}),
	approvalInstances_escalatedTo: many(approvalInstances, {
		relationName: "approvalInstances_escalatedTo_userProfiles_id"
	}),
	approvalInstances_requestedBy: many(approvalInstances, {
		relationName: "approvalInstances_requestedBy_userProfiles_id"
	}),
	approvalInstances_resolvedBy: many(approvalInstances, {
		relationName: "approvalInstances_resolvedBy_userProfiles_id"
	}),
	placementCredits_createdBy: many(placementCredits, {
		relationName: "placementCredits_createdBy_userProfiles_id"
	}),
	placementCredits_juniorRecId: many(placementCredits, {
		relationName: "placementCredits_juniorRecId_userProfiles_id"
	}),
	placementCredits_seniorRecId: many(placementCredits, {
		relationName: "placementCredits_seniorRecId_userProfiles_id"
	}),
	placementCredits_verifiedBy: many(placementCredits, {
		relationName: "placementCredits_verifiedBy_userProfiles_id"
	}),
	graduateCandidates_assignedRecruiterId: many(graduateCandidates, {
		relationName: "graduateCandidates_assignedRecruiterId_userProfiles_id"
	}),
	graduateCandidates_statusChangedBy: many(graduateCandidates, {
		relationName: "graduateCandidates_statusChangedBy_userProfiles_id"
	}),
	graduateCandidates_userId: many(graduateCandidates, {
		relationName: "graduateCandidates_userId_userProfiles_id"
	}),
	quizAttempts: many(quizAttempts),
	aiMentorEscalations_assignedTo: many(aiMentorEscalations, {
		relationName: "aiMentorEscalations_assignedTo_userProfiles_id"
	}),
	aiMentorEscalations_resolvedBy: many(aiMentorEscalations, {
		relationName: "aiMentorEscalations_resolvedBy_userProfiles_id"
	}),
	aiMentorEscalations_userId: many(aiMentorEscalations, {
		relationName: "aiMentorEscalations_userId_userProfiles_id"
	}),
	trainerResponses: many(trainerResponses),
	escalationNotifications: many(escalationNotifications),
	entitySkills: many(entitySkills),
	certifications: many(certifications),
	contactBenchData_benchSalesRepId: many(contactBenchData, {
		relationName: "contactBenchData_benchSalesRepId_userProfiles_id"
	}),
	contactBenchData_createdBy: many(contactBenchData, {
		relationName: "contactBenchData_createdBy_userProfiles_id"
	}),
	contactBenchData_updatedBy: many(contactBenchData, {
		relationName: "contactBenchData_updatedBy_userProfiles_id"
	}),
	submissionFeedbacks: many(submissionFeedback),
	submissionRtrs: many(submissionRtr),
	auditLogs202511s: many(auditLogs202511),
	auditLogs202512s: many(auditLogs202512),
	auditLogs202601s: many(auditLogs202601),
	auditLogs202602s: many(auditLogs202602),
	securityAlerts_assignedTo: many(securityAlerts, {
		relationName: "securityAlerts_assignedTo_userProfiles_id"
	}),
	securityAlerts_relatedUserId: many(securityAlerts, {
		relationName: "securityAlerts_relatedUserId_userProfiles_id"
	}),
	alertRules: many(alertRules),
	emailTemplates_createdBy: many(emailTemplates, {
		relationName: "emailTemplates_createdBy_userProfiles_id"
	}),
	emailTemplates_updatedBy: many(emailTemplates, {
		relationName: "emailTemplates_updatedBy_userProfiles_id"
	}),
	emailSends: many(emailSends),
	emailSenders: many(emailSenders),
	activityNotes: many(activityNotes),
	incidents_createdBy: many(incidents, {
		relationName: "incidents_createdBy_userProfiles_id"
	}),
	incidents_incidentCommander: many(incidents, {
		relationName: "incidents_incidentCommander_userProfiles_id"
	}),
	incidents_updatedBy: many(incidents, {
		relationName: "incidents_updatedBy_userProfiles_id"
	}),
	incidentTimelines: many(incidentTimeline),
	incidentNotifications: many(incidentNotifications),
	breakGlassAccesses: many(breakGlassAccess),
	emergencyDrills_createdBy: many(emergencyDrills, {
		relationName: "emergencyDrills_createdBy_userProfiles_id"
	}),
	emergencyDrills_updatedBy: many(emergencyDrills, {
		relationName: "emergencyDrills_updatedBy_userProfiles_id"
	}),
	slaDefinitions: many(slaDefinitions),
	workQueueMembers: many(workQueueMembers),
	slaEvents: many(slaEvents),
	activityEscalations_escalatedFromUser: many(activityEscalations, {
		relationName: "activityEscalations_escalatedFromUser_userProfiles_id"
	}),
	activityEscalations_escalatedToUser: many(activityEscalations, {
		relationName: "activityEscalations_escalatedToUser_userProfiles_id"
	}),
	contacts_candidateHotlistAddedBy: many(contacts, {
		relationName: "contacts_candidateHotlistAddedBy_userProfiles_id"
	}),
	contacts_clientContactRelationshipOwnerId: many(contacts, {
		relationName: "contacts_clientContactRelationshipOwnerId_userProfiles_id"
	}),
	contacts_clientTeamLeadId: many(contacts, {
		relationName: "contacts_clientTeamLeadId_userProfiles_id"
	}),
	contacts_createdBy: many(contacts, {
		relationName: "contacts_createdBy_userProfiles_id"
	}),
	contacts_ownerId: many(contacts, {
		relationName: "contacts_ownerId_userProfiles_id"
	}),
	contacts_updatedBy: many(contacts, {
		relationName: "contacts_updatedBy_userProfiles_id"
	}),
	contacts_userProfileId: many(contacts, {
		relationName: "contacts_userProfileId_userProfiles_id"
	}),
	contacts_vendorApprovedBy: many(contacts, {
		relationName: "contacts_vendorApprovedBy_userProfiles_id"
	}),
	activityStatsDailies: many(activityStatsDaily),
	notes_createdBy: many(notes, {
		relationName: "notes_createdBy_userProfiles_id"
	}),
	notes_updatedBy: many(notes, {
		relationName: "notes_updatedBy_userProfiles_id"
	}),
	activityPatterns_assigneeUserId: many(activityPatterns, {
		relationName: "activityPatterns_assigneeUserId_userProfiles_id"
	}),
	activityPatterns_createdBy: many(activityPatterns, {
		relationName: "activityPatterns_createdBy_userProfiles_id"
	}),
	featureFlagUsages: many(featureFlagUsage),
	featureFlagFeedbacks: many(featureFlagFeedback),
	featureFlags_createdBy: many(featureFlags, {
		relationName: "featureFlags_createdBy_userProfiles_id"
	}),
	featureFlags_updatedBy: many(featureFlags, {
		relationName: "featureFlags_updatedBy_userProfiles_id"
	}),
	jobStatusHistories_changedBy: many(jobStatusHistory, {
		relationName: "jobStatusHistory_changedBy_userProfiles_id"
	}),
	jobStatusHistories_reopenApprovedBy: many(jobStatusHistory, {
		relationName: "jobStatusHistory_reopenApprovedBy_userProfiles_id"
	}),
	savedSearches: many(savedSearches),
	candidatePreparedProfiles_candidateId: many(candidatePreparedProfiles, {
		relationName: "candidatePreparedProfiles_candidateId_userProfiles_id"
	}),
	candidatePreparedProfiles_createdBy: many(candidatePreparedProfiles, {
		relationName: "candidatePreparedProfiles_createdBy_userProfiles_id"
	}),
	candidatePreparedProfiles_finalizedBy: many(candidatePreparedProfiles, {
		relationName: "candidatePreparedProfiles_finalizedBy_userProfiles_id"
	}),
	candidateScreenings_candidateId: many(candidateScreenings, {
		relationName: "candidateScreenings_candidateId_userProfiles_id"
	}),
	candidateScreenings_screenerId: many(candidateScreenings, {
		relationName: "candidateScreenings_screenerId_userProfiles_id"
	}),
	contactRelationships_createdBy: many(contactRelationships, {
		relationName: "contactRelationships_createdBy_userProfiles_id"
	}),
	contactRelationships_updatedBy: many(contactRelationships, {
		relationName: "contactRelationships_updatedBy_userProfiles_id"
	}),
	contactRoles: many(contactRoles),
	offers_acceptedBy: many(offers, {
		relationName: "offers_acceptedBy_userProfiles_id"
	}),
	offers_candidateId: many(offers, {
		relationName: "offers_candidateId_userProfiles_id"
	}),
	offers_createdBy: many(offers, {
		relationName: "offers_createdBy_userProfiles_id"
	}),
	offers_sentBy: many(offers, {
		relationName: "offers_sentBy_userProfiles_id"
	}),
	offerApprovals_approverId: many(offerApprovals, {
		relationName: "offerApprovals_approverId_userProfiles_id"
	}),
	offerApprovals_requestedBy: many(offerApprovals, {
		relationName: "offerApprovals_requestedBy_userProfiles_id"
	}),
	contactSkills: many(contactSkills),
	contactWorkHistories: many(contactWorkHistory),
	contactEducations: many(contactEducation),
	contactRateCards: many(contactRateCards),
	groups_createdBy: many(groups, {
		relationName: "groups_createdBy_userProfiles_id"
	}),
	groups_managerId: many(groups, {
		relationName: "groups_managerId_userProfiles_id"
	}),
	groups_supervisorId: many(groups, {
		relationName: "groups_supervisorId_userProfiles_id"
	}),
	groups_updatedBy: many(groups, {
		relationName: "groups_updatedBy_userProfiles_id"
	}),
	placementExtensions: many(placementExtensions),
	contactAgreements: many(contactAgreements),
	contactCompliances: many(contactCompliance),
	groupMembers_backupUserId: many(groupMembers, {
		relationName: "groupMembers_backupUserId_userProfiles_id"
	}),
	groupMembers_createdBy: many(groupMembers, {
		relationName: "groupMembers_createdBy_userProfiles_id"
	}),
	groupMembers_userId: many(groupMembers, {
		relationName: "groupMembers_userId_userProfiles_id"
	}),
	contactMergeHistories: many(contactMergeHistory),
	noteReactions: many(noteReactions),
	companies_accountManagerId: many(companies, {
		relationName: "companies_accountManagerId_userProfiles_id"
	}),
	companies_createdBy: many(companies, {
		relationName: "companies_createdBy_userProfiles_id"
	}),
	companies_onboardingCompletedBy: many(companies, {
		relationName: "companies_onboardingCompletedBy_userProfiles_id"
	}),
	companies_ownerId: many(companies, {
		relationName: "companies_ownerId_userProfiles_id"
	}),
	companies_updatedBy: many(companies, {
		relationName: "companies_updatedBy_userProfiles_id"
	}),
	groupRegions: many(groupRegions),
	documents: many(documents),
	meetingNotes_createdBy: many(meetingNotes, {
		relationName: "meetingNotes_createdBy_userProfiles_id"
	}),
	meetingNotes_updatedBy: many(meetingNotes, {
		relationName: "meetingNotes_updatedBy_userProfiles_id"
	}),
	escalations_assignedTo: many(escalations, {
		relationName: "escalations_assignedTo_userProfiles_id"
	}),
	escalations_createdBy: many(escalations, {
		relationName: "escalations_createdBy_userProfiles_id"
	}),
	escalations_escalatedTo: many(escalations, {
		relationName: "escalations_escalatedTo_userProfiles_id"
	}),
	escalations_resolvedBy: many(escalations, {
		relationName: "escalations_resolvedBy_userProfiles_id"
	}),
	escalationUpdates_createdBy: many(escalationUpdates, {
		relationName: "escalationUpdates_createdBy_userProfiles_id"
	}),
	escalationUpdates_newAssigneeId: many(escalationUpdates, {
		relationName: "escalationUpdates_newAssigneeId_userProfiles_id"
	}),
	escalationUpdates_oldAssigneeId: many(escalationUpdates, {
		relationName: "escalationUpdates_oldAssigneeId_userProfiles_id"
	}),
	documentAccessLogs: many(documentAccessLog),
	companyClientDetails: many(companyClientDetails),
	companyVendorDetails: many(companyVendorDetails),
	deals_createdBy: many(deals, {
		relationName: "deals_createdBy_userProfiles_id"
	}),
	deals_ownerId: many(deals, {
		relationName: "deals_ownerId_userProfiles_id"
	}),
	deals_podManagerId: many(deals, {
		relationName: "deals_podManagerId_userProfiles_id"
	}),
	deals_secondaryOwnerId: many(deals, {
		relationName: "deals_secondaryOwnerId_userProfiles_id"
	}),
	dataRetentionPolicies: many(dataRetentionPolicies),
	complianceRequirements: many(complianceRequirements),
	complianceItems_createdBy: many(complianceItems, {
		relationName: "complianceItems_createdBy_userProfiles_id"
	}),
	complianceItems_verifiedBy: many(complianceItems, {
		relationName: "complianceItems_verifiedBy_userProfiles_id"
	}),
	complianceItems_waivedBy: many(complianceItems, {
		relationName: "complianceItems_waivedBy_userProfiles_id"
	}),
	entityComplianceRequirements: many(entityComplianceRequirements),
	contracts_createdBy: many(contracts, {
		relationName: "contracts_createdBy_userProfiles_id"
	}),
	contracts_ownerId: many(contracts, {
		relationName: "contracts_ownerId_userProfiles_id"
	}),
	contracts_terminatedBy: many(contracts, {
		relationName: "contracts_terminatedBy_userProfiles_id"
	}),
	contractVersions_approvedBy: many(contractVersions, {
		relationName: "contractVersions_approvedBy_userProfiles_id"
	}),
	contractVersions_createdBy: many(contractVersions, {
		relationName: "contractVersions_createdBy_userProfiles_id"
	}),
	contractParties: many(contractParties),
	contractTemplates: many(contractTemplates),
	contractClauses_createdBy: many(contractClauses, {
		relationName: "contractClauses_createdBy_userProfiles_id"
	}),
	contractClauses_legalApprovedBy: many(contractClauses, {
		relationName: "contractClauses_legalApprovedBy_userProfiles_id"
	}),
	rateApprovals_decidedBy: many(rateApprovals, {
		relationName: "rateApprovals_decidedBy_userProfiles_id"
	}),
	rateApprovals_requestedBy: many(rateApprovals, {
		relationName: "rateApprovals_requestedBy_userProfiles_id"
	}),
	rateCards_approvedBy: many(rateCards, {
		relationName: "rateCards_approvedBy_userProfiles_id"
	}),
	rateCards_createdBy: many(rateCards, {
		relationName: "rateCards_createdBy_userProfiles_id"
	}),
	entityRates_approvedBy: many(entityRates, {
		relationName: "entityRates_approvedBy_userProfiles_id"
	}),
	entityRates_createdBy: many(entityRates, {
		relationName: "entityRates_createdBy_userProfiles_id"
	}),
	entityRates_negotiatedBy: many(entityRates, {
		relationName: "entityRates_negotiatedBy_userProfiles_id"
	}),
	rateChangeHistories: many(rateChangeHistory),
	jobs_closedBy: many(jobs, {
		relationName: "jobs_closedBy_userProfiles_id"
	}),
	jobs_createdBy: many(jobs, {
		relationName: "jobs_createdBy_userProfiles_id"
	}),
	jobs_intakeCompletedBy: many(jobs, {
		relationName: "jobs_intakeCompletedBy_userProfiles_id"
	}),
	jobs_ownerId: many(jobs, {
		relationName: "jobs_ownerId_userProfiles_id"
	}),
	jobs_publishedBy: many(jobs, {
		relationName: "jobs_publishedBy_userProfiles_id"
	}),
	submissions_candidateId: many(submissions, {
		relationName: "submissions_candidateId_userProfiles_id"
	}),
	submissions_createdBy: many(submissions, {
		relationName: "submissions_createdBy_userProfiles_id"
	}),
	submissions_ownerId: many(submissions, {
		relationName: "submissions_ownerId_userProfiles_id"
	}),
	submissions_submittedToClientBy: many(submissions, {
		relationName: "submissions_submittedToClientBy_userProfiles_id"
	}),
	submissions_vendorDecisionBy: many(submissions, {
		relationName: "submissions_vendorDecisionBy_userProfiles_id"
	}),
	submissions_vendorSubmittedBy: many(submissions, {
		relationName: "submissions_vendorSubmittedBy_userProfiles_id"
	}),
	interviews_cancelledBy: many(interviews, {
		relationName: "interviews_cancelledBy_userProfiles_id"
	}),
	interviews_candidateId: many(interviews, {
		relationName: "interviews_candidateId_userProfiles_id"
	}),
	interviews_confirmedBy: many(interviews, {
		relationName: "interviews_confirmedBy_userProfiles_id"
	}),
	interviews_prepCompletedBy: many(interviews, {
		relationName: "interviews_prepCompletedBy_userProfiles_id"
	}),
	interviews_rescheduledBy: many(interviews, {
		relationName: "interviews_rescheduledBy_userProfiles_id"
	}),
	interviews_scheduledBy: many(interviews, {
		relationName: "interviews_scheduledBy_userProfiles_id"
	}),
	interviews_submittedBy: many(interviews, {
		relationName: "interviews_submittedBy_userProfiles_id"
	}),
	interviewParticipants: many(interviewParticipants),
	interviewScorecards: many(interviewScorecards),
	scorecardTemplates: many(scorecardTemplates),
	placements_accountManagerId: many(placements, {
		relationName: "placements_accountManagerId_userProfiles_id"
	}),
	placements_approvedBy: many(placements, {
		relationName: "placements_approvedBy_userProfiles_id"
	}),
	placements_candidateId: many(placements, {
		relationName: "placements_candidateId_userProfiles_id"
	}),
	placements_createdBy: many(placements, {
		relationName: "placements_createdBy_userProfiles_id"
	}),
	placements_lastCheckInBy: many(placements, {
		relationName: "placements_lastCheckInBy_userProfiles_id"
	}),
	placements_recruiterId: many(placements, {
		relationName: "placements_recruiterId_userProfiles_id"
	}),
	placementChangeOrders_approvedBy: many(placementChangeOrders, {
		relationName: "placementChangeOrders_approvedBy_userProfiles_id"
	}),
	placementChangeOrders_requestedBy: many(placementChangeOrders, {
		relationName: "placementChangeOrders_requestedBy_userProfiles_id"
	}),
	placementCheckins_clientContactId: many(placementCheckins, {
		relationName: "placementCheckins_clientContactId_userProfiles_id"
	}),
	placementCheckins_completedBy: many(placementCheckins, {
		relationName: "placementCheckins_completedBy_userProfiles_id"
	}),
	placementCheckins_conductedBy: many(placementCheckins, {
		relationName: "placementCheckins_conductedBy_userProfiles_id"
	}),
	placementCheckins_escalatedTo: many(placementCheckins, {
		relationName: "placementCheckins_escalatedTo_userProfiles_id"
	}),
	onboardingTasks_assignedTo: many(onboardingTasks, {
		relationName: "onboardingTasks_assignedTo_userProfiles_id"
	}),
	onboardingTasks_completedBy: many(onboardingTasks, {
		relationName: "onboardingTasks_completedBy_userProfiles_id"
	}),
	employeeOnboardings_assignedTo: many(employeeOnboarding, {
		relationName: "employeeOnboarding_assignedTo_userProfiles_id"
	}),
	employeeOnboardings_createdBy: many(employeeOnboarding, {
		relationName: "employeeOnboarding_createdBy_userProfiles_id"
	}),
	onboardingTemplates_createdBy: many(onboardingTemplates, {
		relationName: "onboardingTemplates_createdBy_userProfiles_id"
	}),
	onboardingTemplates_updatedBy: many(onboardingTemplates, {
		relationName: "onboardingTemplates_updatedBy_userProfiles_id"
	}),
	timesheetApprovals_approverId: many(timesheetApprovals, {
		relationName: "timesheetApprovals_approverId_userProfiles_id"
	}),
	timesheetApprovals_delegatedFrom: many(timesheetApprovals, {
		relationName: "timesheetApprovals_delegatedFrom_userProfiles_id"
	}),
	timesheetExpenses: many(timesheetExpenses),
	timesheets_createdBy: many(timesheets, {
		relationName: "timesheets_createdBy_userProfiles_id"
	}),
	timesheets_submittedBy: many(timesheets, {
		relationName: "timesheets_submittedBy_userProfiles_id"
	}),
	timesheets_updatedBy: many(timesheets, {
		relationName: "timesheets_updatedBy_userProfiles_id"
	}),
	timesheetApprovalWorkflows: many(timesheetApprovalWorkflows),
	timesheetAdjustments_approvedBy: many(timesheetAdjustments, {
		relationName: "timesheetAdjustments_approvedBy_userProfiles_id"
	}),
	timesheetAdjustments_requestedBy: many(timesheetAdjustments, {
		relationName: "timesheetAdjustments_requestedBy_userProfiles_id"
	}),
	invoices_createdBy: many(invoices, {
		relationName: "invoices_createdBy_userProfiles_id"
	}),
	invoices_updatedBy: many(invoices, {
		relationName: "invoices_updatedBy_userProfiles_id"
	}),
	invoicePayments: many(invoicePayments),
	invoiceBatches: many(invoiceBatches),
	payRuns_approvedBy: many(payRuns, {
		relationName: "payRuns_approvedBy_userProfiles_id"
	}),
	payRuns_createdBy: many(payRuns, {
		relationName: "payRuns_createdBy_userProfiles_id"
	}),
	workflowExecutions: many(workflowExecutions),
	workflowApprovals_approverId: many(workflowApprovals, {
		relationName: "workflowApprovals_approverId_userProfiles_id"
	}),
	workflowApprovals_delegatedTo: many(workflowApprovals, {
		relationName: "workflowApprovals_delegatedTo_userProfiles_id"
	}),
	workflowApprovals_escalatedTo: many(workflowApprovals, {
		relationName: "workflowApprovals_escalatedTo_userProfiles_id"
	}),
	notificationPreferences: many(notificationPreferences),
	notificationTemplates: many(notificationTemplates),
	campaigns_approvedBy: many(campaigns, {
		relationName: "campaigns_approvedBy_userProfiles_id"
	}),
	campaigns_createdBy: many(campaigns, {
		relationName: "campaigns_createdBy_userProfiles_id"
	}),
	campaigns_ownerId: many(campaigns, {
		relationName: "campaigns_ownerId_userProfiles_id"
	}),
	campaigns_updatedBy: many(campaigns, {
		relationName: "campaigns_updatedBy_userProfiles_id"
	}),
	communications: many(communications),
	ptoBalances: many(ptoBalances),
	userRoles_assignedBy: many(userRoles, {
		relationName: "userRoles_assignedBy_userProfiles_id"
	}),
	userRoles_userId: many(userRoles, {
		relationName: "userRoles_userId_userProfiles_id"
	}),
	systemEvents202512s: many(systemEvents202512),
	systemEvents202601s: many(systemEvents202601),
	systemEvents202602s: many(systemEvents202602),
	systemEvents202603s: many(systemEvents202603),
	auditLog202602s_impersonatedBy: many(auditLog202602, {
		relationName: "auditLog202602_impersonatedBy_userProfiles_id"
	}),
	auditLog202602s_performedBy: many(auditLog202602, {
		relationName: "auditLog202602_performedBy_userProfiles_id"
	}),
	auditLog202603s_impersonatedBy: many(auditLog202603, {
		relationName: "auditLog202603_impersonatedBy_userProfiles_id"
	}),
	auditLog202603s_performedBy: many(auditLog202603, {
		relationName: "auditLog202603_performedBy_userProfiles_id"
	}),
	auditLog202512s_impersonatedBy: many(auditLog202512, {
		relationName: "auditLog202512_impersonatedBy_userProfiles_id"
	}),
	auditLog202512s_performedBy: many(auditLog202512, {
		relationName: "auditLog202512_performedBy_userProfiles_id"
	}),
	auditLog202601s_impersonatedBy: many(auditLog202601, {
		relationName: "auditLog202601_impersonatedBy_userProfiles_id"
	}),
	auditLog202601s_performedBy: many(auditLog202601, {
		relationName: "auditLog202601_performedBy_userProfiles_id"
	}),
	entityHistory202601s: many(entityHistory202601),
	entityHistory202602s: many(entityHistory202602),
	entityHistory202603s: many(entityHistory202603),
	entityHistory202512s: many(entityHistory202512),
}));

export const badgeTriggerEventsRelations = relations(badgeTriggerEvents, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [badgeTriggerEvents.userId],
		references: [userProfiles.id]
	}),
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({one}) => ({
	studentEnrollment: one(studentEnrollments, {
		fields: [paymentTransactions.enrollmentId],
		references: [studentEnrollments.id]
	}),
	userProfile: one(userProfiles, {
		fields: [paymentTransactions.userId],
		references: [userProfiles.id]
	}),
}));

export const studentEnrollmentsRelations = relations(studentEnrollments, ({one, many}) => ({
	paymentTransactions: many(paymentTransactions),
	videoProgresses: many(videoProgress),
	topicCompletions: many(topicCompletions),
	readingProgresses: many(readingProgress),
	labInstances: many(labInstances),
	labSubmissions: many(labSubmissions),
	capstoneSubmissions: many(capstoneSubmissions),
	studentInterventions: many(studentInterventions),
	course: one(courses, {
		fields: [studentEnrollments.courseId],
		references: [courses.id]
	}),
	courseModule: one(courseModules, {
		fields: [studentEnrollments.currentModuleId],
		references: [courseModules.id]
	}),
	moduleTopic: one(moduleTopics, {
		fields: [studentEnrollments.currentTopicId],
		references: [moduleTopics.id]
	}),
	userProfile: one(userProfiles, {
		fields: [studentEnrollments.userId],
		references: [userProfiles.id]
	}),
	discountCodeUsages: many(discountCodeUsage),
	certificates: many(certificates),
	graduateCandidates: many(graduateCandidates),
	quizAttempts: many(quizAttempts),
}));

export const commissionsRelations = relations(commissions, ({one, many}) => ({
	userProfile_createdBy: one(userProfiles, {
		fields: [commissions.createdBy],
		references: [userProfiles.id],
		relationName: "commissions_createdBy_userProfiles_id"
	}),
	deal: one(deals, {
		fields: [commissions.dealId],
		references: [deals.id]
	}),
	organization: one(organizations, {
		fields: [commissions.orgId],
		references: [organizations.id]
	}),
	userProfile_userId: one(userProfiles, {
		fields: [commissions.userId],
		references: [userProfiles.id],
		relationName: "commissions_userId_userProfiles_id"
	}),
	commissionPayments: many(commissionPayments),
}));

export const dealsRelations = relations(deals, ({one, many}) => ({
	commissions: many(commissions),
	leads: many(leads, {
		relationName: "leads_convertedToDealId_deals_id"
	}),
	dealStagesHistories: many(dealStagesHistory),
	dealStakeholders: many(dealStakeholders),
	dealCompetitors: many(dealCompetitors),
	dealProducts: many(dealProducts),
	activities: many(activities),
	contacts: many(contacts, {
		relationName: "contacts_leadConvertedToDealId_deals_id"
	}),
	company: one(companies, {
		fields: [deals.companyId],
		references: [companies.id]
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [deals.createdBy],
		references: [userProfiles.id],
		relationName: "deals_createdBy_userProfiles_id"
	}),
	contact: one(contacts, {
		fields: [deals.leadContactId],
		references: [contacts.id],
		relationName: "deals_leadContactId_contacts_id"
	}),
	lead: one(leads, {
		fields: [deals.leadId],
		references: [leads.id],
		relationName: "deals_leadId_leads_id"
	}),
	organization: one(organizations, {
		fields: [deals.orgId],
		references: [organizations.id]
	}),
	userProfile_ownerId: one(userProfiles, {
		fields: [deals.ownerId],
		references: [userProfiles.id],
		relationName: "deals_ownerId_userProfiles_id"
	}),
	userProfile_podManagerId: one(userProfiles, {
		fields: [deals.podManagerId],
		references: [userProfiles.id],
		relationName: "deals_podManagerId_userProfiles_id"
	}),
	userProfile_secondaryOwnerId: one(userProfiles, {
		fields: [deals.secondaryOwnerId],
		references: [userProfiles.id],
		relationName: "deals_secondaryOwnerId_userProfiles_id"
	}),
	jobs: many(jobs),
}));

export const organizationsRelations = relations(organizations, ({many}) => ({
	commissions: many(commissions),
	commissionPayments: many(commissionPayments),
	leads: many(leads),
	generatedResumes: many(generatedResumes),
	requisitionEmbeddings: many(requisitionEmbeddings),
	resumeMatches: many(resumeMatches),
	candidateEmbeddings: many(candidateEmbeddings),
	leadSourcingCredits: many(leadSourcingCredits),
	projectTimelines: many(projectTimeline),
	sessionMetadata: many(sessionMetadata),
	campaignDocuments: many(campaignDocuments),
	eventDeliveryLogs: many(eventDeliveryLog),
	aiCostTrackings: many(aiCostTracking),
	aiAgentInteractions: many(aiAgentInteractions),
	guruInteractions: many(guruInteractions),
	sequenceTemplates: many(sequenceTemplates),
	permissionOverrides: many(permissionOverrides),
	campaignSequences: many(campaignSequences),
	apiTokens: many(apiTokens),
	bulkUpdateHistories: many(bulkUpdateHistory),
	workflowInstances: many(workflowInstances),
	fileUploads: many(fileUploads),
	documentTemplates: many(documentTemplates),
	generatedDocuments: many(generatedDocuments),
	workflows: many(workflows),
	emailLogs: many(emailLogs),
	backgroundJobs: many(backgroundJobs),
	organizationSettings: many(organizationSettings),
	comments: many(comments),
	leadTasks: many(leadTasks),
	notifications: many(notifications),
	tasks: many(tasks),
	organizationBrandings: many(organizationBranding),
	companyContracts: many(companyContracts),
	companyRateCards: many(companyRateCards),
	companyComplianceRequirements: many(companyComplianceRequirements),
	companyHealthScores: many(companyHealthScores),
	companyMetrics: many(companyMetrics),
	companyRevenues: many(companyRevenue),
	activityLogs: many(activityLog),
	pods: many(pods),
	podManagers: many(podManagers),
	leadStrategies: many(leadStrategies),
	talkingPointTemplates: many(talkingPointTemplates),
	payrollRuns: many(payrollRuns),
	performanceReviews: many(performanceReviews),
	importJobs: many(importJobs),
	exportJobs: many(exportJobs),
	gdprRequests: many(gdprRequests),
	duplicateRecords: many(duplicateRecords),
	duplicateRules: many(duplicateRules),
	archivedRecords: many(archivedRecords),
	retentionPolicies: many(retentionPolicies),
	candidateResumes: many(candidateResumes),
	candidateBackgroundChecks: many(candidateBackgroundChecks),
	userProfiles: many(userProfiles),
	candidateCertifications: many(candidateCertifications),
	candidateComplianceDocuments: many(candidateComplianceDocuments),
	objectOwners: many(objectOwners),
	candidateEducations: many(candidateEducation),
	candidateReferences: many(candidateReferences),
	candidateWorkAuthorizations: many(candidateWorkAuthorizations),
	regions: many(regions),
	podMembers: many(podMembers),
	jobSkills: many(jobSkills),
	jobRequirements: many(jobRequirements),
	jobRates: many(jobRates),
	jobAssignments: many(jobAssignments),
	jobScreeningQuestions: many(jobScreeningQuestions),
	candidateDocuments: many(candidateDocuments),
	candidateProfiles: many(candidateProfiles),
	candidatePreferences: many(candidatePreferences),
	candidateAvailabilities: many(candidateAvailability),
	submissionRates: many(submissionRates),
	submissionScreeningAnswers: many(submissionScreeningAnswers),
	submissionNotes: many(submissionNotes),
	marketingTemplates: many(marketingTemplates),
	events: many(events),
	eventSubscriptions: many(eventSubscriptions),
	skillAliases: many(skillAliases),
	submissionStatusHistories: many(submissionStatusHistory),
	interviewFeedbacks: many(interviewFeedback),
	interviewReminders: many(interviewReminders),
	offerTerms: many(offerTerms),
	placementTimesheets: many(placementTimesheets),
	candidates: many(candidates),
	companyTeams: many(companyTeam),
	companyContacts: many(companyContacts),
	companyRelationships: many(companyRelationships),
	immigrationAttorneys: many(immigrationAttorneys),
	companyAddresses: many(companyAddresses),
	companyNotes: many(companyNotes),
	companyPreferences: many(companyPreferences),
	companyTags: many(companyTags),
	integrations: many(integrations),
	integrationHealthLogs: many(integrationHealthLogs),
	externalJobOrders: many(externalJobOrders),
	candidateWorkHistories: many(candidateWorkHistory),
	employees: many(employees),
	benefitPlans: many(benefitPlans),
	raciChangeLogs: many(raciChangeLog),
	legacyComplianceRequirements: many(legacyComplianceRequirements),
	workplanTemplates: many(workplanTemplates),
	workplanInstances: many(workplanInstances),
	podSprintMetrics: many(podSprintMetrics),
	activityAutoRules: many(activityAutoRules),
	addresses: many(addresses),
	slaInstances: many(slaInstances),
	bulkActivityJobs: many(bulkActivityJobs),
	activityMetrics: many(activityMetrics),
	teamMetrics: many(teamMetrics),
	loginHistories: many(loginHistory),
	userInvitations: many(userInvitations),
	webhooks: many(webhooks),
	webhookDeliveries: many(webhookDeliveries),
	integrationRetryConfigs: many(integrationRetryConfig),
	integrationOauthTokens: many(integrationOauthTokens),
	integrationFailoverConfigs: many(integrationFailoverConfig),
	skills: many(skills),
	activities: many(activities),
	benchConsultants: many(benchConsultants),
	approvalWorkflows: many(approvalWorkflows),
	approvalInstances: many(approvalInstances),
	placementCredits: many(placementCredits),
	entitySkills: many(entitySkills),
	certifications: many(certifications),
	contactBenchData: many(contactBenchData),
	submissionFeedbacks: many(submissionFeedback),
	submissionRtrs: many(submissionRtr),
	skillEndorsements: many(skillEndorsements),
	auditLogs202511s: many(auditLogs202511),
	auditLogs202512s: many(auditLogs202512),
	auditLogs202601s: many(auditLogs202601),
	auditLogs202602s: many(auditLogs202602),
	securityAlerts: many(securityAlerts),
	alertRules: many(alertRules),
	emailTemplates: many(emailTemplates),
	emailSends: many(emailSends),
	emailSenders: many(emailSenders),
	workQueues: many(workQueues),
	incidents: many(incidents),
	incidentTimelines: many(incidentTimeline),
	incidentNotifications: many(incidentNotifications),
	breakGlassAccesses: many(breakGlassAccess),
	emergencyDrills: many(emergencyDrills),
	slaDefinitions: many(slaDefinitions),
	slaEvents: many(slaEvents),
	contacts: many(contacts),
	activityStatsDailies: many(activityStatsDaily),
	notes: many(notes),
	activityPatterns: many(activityPatterns),
	featureFlagUsages: many(featureFlagUsage),
	featureFlagFeedbacks: many(featureFlagFeedback),
	featureFlagCategories: many(featureFlagCategories),
	featureFlags: many(featureFlags),
	jobStatusHistories: many(jobStatusHistory),
	savedSearches: many(savedSearches),
	candidatePreparedProfiles: many(candidatePreparedProfiles),
	candidateScreenings: many(candidateScreenings),
	contactRelationships: many(contactRelationships),
	contactRoles: many(contactRoles),
	offers: many(offers),
	offerNegotiations: many(offerNegotiations),
	offerApprovals: many(offerApprovals),
	contactSkills: many(contactSkills),
	contactWorkHistories: many(contactWorkHistory),
	contactEducations: many(contactEducation),
	contactCertifications: many(contactCertifications),
	placementMilestones: many(placementMilestones),
	contactRateCards: many(contactRateCards),
	groups: many(groups),
	placementExtensions: many(placementExtensions),
	placementRates: many(placementRates),
	contactAgreements: many(contactAgreements),
	contactCompliances: many(contactCompliance),
	groupMembers: many(groupMembers),
	contactCommunicationPreferences: many(contactCommunicationPreferences),
	contactMergeHistories: many(contactMergeHistory),
	companies: many(companies),
	groupRegions: many(groupRegions),
	documents: many(documents),
	meetingNotes: many(meetingNotes),
	escalations: many(escalations),
	companyClientDetails: many(companyClientDetails),
	entityDrafts: many(entityDrafts),
	companyVendorDetails: many(companyVendorDetails),
	companyPartnerDetails: many(companyPartnerDetails),
	deals: many(deals),
	dataRetentionPolicies: many(dataRetentionPolicies),
	complianceRequirements: many(complianceRequirements),
	complianceItems: many(complianceItems),
	entityComplianceRequirements: many(entityComplianceRequirements),
	contracts: many(contracts),
	contractParties: many(contractParties),
	contractTemplates: many(contractTemplates),
	contractClauses: many(contractClauses),
	rateApprovals: many(rateApprovals),
	rateCards: many(rateCards),
	rateCardItems: many(rateCardItems),
	entityRates: many(entityRates),
	jobs: many(jobs),
	submissions: many(submissions),
	interviews: many(interviews),
	interviewParticipants: many(interviewParticipants),
	interviewScorecards: many(interviewScorecards),
	scorecardTemplates: many(scorecardTemplates),
	placements: many(placements),
	placementVendors: many(placementVendors),
	placementChangeOrders: many(placementChangeOrders),
	placementCheckins: many(placementCheckins),
	onboardingTasks: many(onboardingTasks),
	employeeOnboardings: many(employeeOnboarding),
	onboardingTemplates: many(onboardingTemplates),
	onboardingTemplateTasks: many(onboardingTemplateTasks),
	timesheets: many(timesheets),
	timesheetApprovalWorkflows: many(timesheetApprovalWorkflows),
	timesheetAdjustments: many(timesheetAdjustments),
	timesheetTemplates: many(timesheetTemplates),
	invoices: many(invoices),
	invoicePayments: many(invoicePayments),
	paymentTerms: many(paymentTerms),
	invoiceBatches: many(invoiceBatches),
	invoiceTemplates: many(invoiceTemplates),
	payPeriods: many(payPeriods),
	payRuns: many(payRuns),
	workerTaxSetups: many(workerTaxSetup),
	workerBenefits: many(workerBenefits),
	workerGarnishments: many(workerGarnishments),
	taxDocuments: many(taxDocuments),
	workflowExecutions: many(workflowExecutions),
	workflowApprovals: many(workflowApprovals),
	notificationPreferences: many(notificationPreferences),
	notificationTemplates: many(notificationTemplates),
	campaigns: many(campaigns),
	campaignEnrollments: many(campaignEnrollments),
	campaignSequenceLogs: many(campaignSequenceLogs),
	communications: many(communications),
	systemEvents202512s: many(systemEvents202512),
	systemEvents202601s: many(systemEvents202601),
	systemEvents202602s: many(systemEvents202602),
	systemEvents202603s: many(systemEvents202603),
	auditLog202602s: many(auditLog202602),
	auditLog202603s: many(auditLog202603),
	auditLog202512s: many(auditLog202512),
	auditLog202601s: many(auditLog202601),
	entityHistory202601s: many(entityHistory202601),
	entityHistory202602s: many(entityHistory202602),
	entityHistory202603s: many(entityHistory202603),
	entityHistory202512s: many(entityHistory202512),
}));

export const commissionPaymentsRelations = relations(commissionPayments, ({one}) => ({
	commission: one(commissions, {
		fields: [commissionPayments.commissionId],
		references: [commissions.id]
	}),
	userProfile: one(userProfiles, {
		fields: [commissionPayments.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [commissionPayments.orgId],
		references: [organizations.id]
	}),
}));

export const productivityReportsRelations = relations(productivityReports, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [productivityReports.userId],
		references: [userProfiles.id]
	}),
}));

export const leadsRelations = relations(leads, ({one, many}) => ({
	deal: one(deals, {
		fields: [leads.convertedToDealId],
		references: [deals.id],
		relationName: "leads_convertedToDealId_deals_id"
	}),
	campaign: one(campaigns, {
		fields: [leads.campaignId],
		references: [campaigns.id]
	}),
	company_companyId: one(companies, {
		fields: [leads.companyId],
		references: [companies.id],
		relationName: "leads_companyId_companies_id"
	}),
	contact: one(contacts, {
		fields: [leads.contactId],
		references: [contacts.id]
	}),
	company_convertedToCompanyId: one(companies, {
		fields: [leads.convertedToCompanyId],
		references: [companies.id],
		relationName: "leads_convertedToCompanyId_companies_id"
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [leads.createdBy],
		references: [userProfiles.id],
		relationName: "leads_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [leads.orgId],
		references: [organizations.id]
	}),
	userProfile_ownerId: one(userProfiles, {
		fields: [leads.ownerId],
		references: [userProfiles.id],
		relationName: "leads_ownerId_userProfiles_id"
	}),
	userProfile_qualifiedBy: one(userProfiles, {
		fields: [leads.qualifiedBy],
		references: [userProfiles.id],
		relationName: "leads_qualifiedBy_userProfiles_id"
	}),
	leadSourcingCredits: many(leadSourcingCredits),
	leadTasks: many(leadTasks),
	leadStrategies: many(leadStrategies),
	leadScores: many(leadScores),
	leadQualifications: many(leadQualification),
	leadTouchpoints: many(leadTouchpoints),
	deals: many(deals, {
		relationName: "deals_leadId_leads_id"
	}),
	campaignEnrollments: many(campaignEnrollments),
}));

export const campaignsRelations = relations(campaigns, ({one, many}) => ({
	leads: many(leads),
	campaignDocuments: many(campaignDocuments),
	campaignSequences: many(campaignSequences),
	contactLeadData: many(contactLeadData),
	activities: many(activities),
	contacts: many(contacts),
	userProfile_approvedBy: one(userProfiles, {
		fields: [campaigns.approvedBy],
		references: [userProfiles.id],
		relationName: "campaigns_approvedBy_userProfiles_id"
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [campaigns.createdBy],
		references: [userProfiles.id],
		relationName: "campaigns_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [campaigns.orgId],
		references: [organizations.id]
	}),
	userProfile_ownerId: one(userProfiles, {
		fields: [campaigns.ownerId],
		references: [userProfiles.id],
		relationName: "campaigns_ownerId_userProfiles_id"
	}),
	userProfile_updatedBy: one(userProfiles, {
		fields: [campaigns.updatedBy],
		references: [userProfiles.id],
		relationName: "campaigns_updatedBy_userProfiles_id"
	}),
	campaignEnrollments: many(campaignEnrollments),
	campaignSequenceLogs: many(campaignSequenceLogs),
	communications: many(communications),
}));

export const companiesRelations = relations(companies, ({one, many}) => ({
	leads_companyId: many(leads, {
		relationName: "leads_companyId_companies_id"
	}),
	leads_convertedToCompanyId: many(leads, {
		relationName: "leads_convertedToCompanyId_companies_id"
	}),
	companyContracts: many(companyContracts),
	companyRateCards_companyId: many(companyRateCards, {
		relationName: "companyRateCards_companyId_companies_id"
	}),
	companyRateCards_mspProgramId: many(companyRateCards, {
		relationName: "companyRateCards_mspProgramId_companies_id"
	}),
	companyComplianceRequirements: many(companyComplianceRequirements),
	companyHealthScores: many(companyHealthScores),
	companyMetrics: many(companyMetrics),
	companyRevenues_billingCompanyId: many(companyRevenue, {
		relationName: "companyRevenue_billingCompanyId_companies_id"
	}),
	companyRevenues_companyId: many(companyRevenue, {
		relationName: "companyRevenue_companyId_companies_id"
	}),
	companyRevenues_endClientCompanyId: many(companyRevenue, {
		relationName: "companyRevenue_endClientCompanyId_companies_id"
	}),
	companyTeams: many(companyTeam),
	companyContacts_companyId: many(companyContacts, {
		relationName: "companyContacts_companyId_companies_id"
	}),
	companyContacts_vendorCompanyId: many(companyContacts, {
		relationName: "companyContacts_vendorCompanyId_companies_id"
	}),
	companyRelationships_companyAId: many(companyRelationships, {
		relationName: "companyRelationships_companyAId_companies_id"
	}),
	companyRelationships_companyBId: many(companyRelationships, {
		relationName: "companyRelationships_companyBId_companies_id"
	}),
	companyAddresses: many(companyAddresses),
	companyNotes: many(companyNotes),
	companyPreferences: many(companyPreferences),
	companyTags: many(companyTags),
	externalJobOrders: many(externalJobOrders),
	contactBenchData: many(contactBenchData),
	contacts_employerCompanyId: many(contacts, {
		relationName: "contacts_employerCompanyId_companies_id"
	}),
	contacts_linkedCompanyId: many(contacts, {
		relationName: "contacts_linkedCompanyId_companies_id"
	}),
	contacts_sourceCompanyId: many(contacts, {
		relationName: "contacts_sourceCompanyId_companies_id"
	}),
	contacts_vendorCompanyId: many(contacts, {
		relationName: "contacts_vendorCompanyId_companies_id"
	}),
	userProfile_accountManagerId: one(userProfiles, {
		fields: [companies.accountManagerId],
		references: [userProfiles.id],
		relationName: "companies_accountManagerId_userProfiles_id"
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [companies.createdBy],
		references: [userProfiles.id],
		relationName: "companies_createdBy_userProfiles_id"
	}),
	company_mspProviderId: one(companies, {
		fields: [companies.mspProviderId],
		references: [companies.id],
		relationName: "companies_mspProviderId_companies_id"
	}),
	companies_mspProviderId: many(companies, {
		relationName: "companies_mspProviderId_companies_id"
	}),
	userProfile_onboardingCompletedBy: one(userProfiles, {
		fields: [companies.onboardingCompletedBy],
		references: [userProfiles.id],
		relationName: "companies_onboardingCompletedBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [companies.orgId],
		references: [organizations.id]
	}),
	userProfile_ownerId: one(userProfiles, {
		fields: [companies.ownerId],
		references: [userProfiles.id],
		relationName: "companies_ownerId_userProfiles_id"
	}),
	company_parentCompanyId: one(companies, {
		fields: [companies.parentCompanyId],
		references: [companies.id],
		relationName: "companies_parentCompanyId_companies_id"
	}),
	companies_parentCompanyId: many(companies, {
		relationName: "companies_parentCompanyId_companies_id"
	}),
	pod: one(pods, {
		fields: [companies.podId],
		references: [pods.id]
	}),
	company_referringCompanyId: one(companies, {
		fields: [companies.referringCompanyId],
		references: [companies.id],
		relationName: "companies_referringCompanyId_companies_id"
	}),
	companies_referringCompanyId: many(companies, {
		relationName: "companies_referringCompanyId_companies_id"
	}),
	userProfile_updatedBy: one(userProfiles, {
		fields: [companies.updatedBy],
		references: [userProfiles.id],
		relationName: "companies_updatedBy_userProfiles_id"
	}),
	companyClientDetails: many(companyClientDetails),
	companyVendorDetails: many(companyVendorDetails),
	companyPartnerDetails: many(companyPartnerDetails),
	deals: many(deals),
	contractParties: many(contractParties),
	jobs_clientCompanyId: many(jobs, {
		relationName: "jobs_clientCompanyId_companies_id"
	}),
	jobs_companyId: many(jobs, {
		relationName: "jobs_companyId_companies_id"
	}),
	jobs_endClientCompanyId: many(jobs, {
		relationName: "jobs_endClientCompanyId_companies_id"
	}),
	jobs_vendorCompanyId: many(jobs, {
		relationName: "jobs_vendorCompanyId_companies_id"
	}),
	submissions_companyId: many(submissions, {
		relationName: "submissions_companyId_companies_id"
	}),
	submissions_submittedByCompanyId: many(submissions, {
		relationName: "submissions_submittedByCompanyId_companies_id"
	}),
	placements_billingCompanyId: many(placements, {
		relationName: "placements_billingCompanyId_companies_id"
	}),
	placements_clientCompanyId: many(placements, {
		relationName: "placements_clientCompanyId_companies_id"
	}),
	placements_companyId: many(placements, {
		relationName: "placements_companyId_companies_id"
	}),
	placements_endClientCompanyId: many(placements, {
		relationName: "placements_endClientCompanyId_companies_id"
	}),
	placements_vendorCompanyId: many(placements, {
		relationName: "placements_vendorCompanyId_companies_id"
	}),
	placementVendors: many(placementVendors),
	invoices: many(invoices),
}));

export const contactsRelations = relations(contacts, ({one, many}) => ({
	leads: many(leads),
	candidateEmbeddings: many(candidateEmbeddings),
	contactLeadData: many(contactLeadData),
	candidateSkills: many(candidateSkills),
	candidateResumes: many(candidateResumes),
	candidateBackgroundChecks: many(candidateBackgroundChecks),
	candidateCertifications: many(candidateCertifications),
	candidateComplianceDocuments: many(candidateComplianceDocuments),
	candidateEducations: many(candidateEducation),
	candidateReferences: many(candidateReferences),
	candidateWorkAuthorizations: many(candidateWorkAuthorizations),
	candidateDocuments: many(candidateDocuments),
	candidateProfiles: many(candidateProfiles),
	candidatePreferences: many(candidatePreferences),
	candidateAvailabilities: many(candidateAvailability),
	candidates: many(candidates),
	dealStakeholders: many(dealStakeholders),
	candidateWorkHistories: many(candidateWorkHistory),
	activities: many(activities),
	benchConsultants: many(benchConsultants),
	contactBenchData_contactId: many(contactBenchData, {
		relationName: "contactBenchData_contactId_contacts_id"
	}),
	contactBenchData_vendorContactId: many(contactBenchData, {
		relationName: "contactBenchData_vendorContactId_contacts_id"
	}),
	submissionFeedbacks: many(submissionFeedback),
	submissionRtrs: many(submissionRtr),
	skillEndorsements: many(skillEndorsements),
	employee_alumniFormerEmployeeId: one(employees, {
		fields: [contacts.alumniFormerEmployeeId],
		references: [employees.id],
		relationName: "contacts_alumniFormerEmployeeId_employees_id"
	}),
	contact_benchVendorContactId: one(contacts, {
		fields: [contacts.benchVendorContactId],
		references: [contacts.id],
		relationName: "contacts_benchVendorContactId_contacts_id"
	}),
	contacts_benchVendorContactId: many(contacts, {
		relationName: "contacts_benchVendorContactId_contacts_id"
	}),
	userProfile_candidateHotlistAddedBy: one(userProfiles, {
		fields: [contacts.candidateHotlistAddedBy],
		references: [userProfiles.id],
		relationName: "contacts_candidateHotlistAddedBy_userProfiles_id"
	}),
	userProfile_clientContactRelationshipOwnerId: one(userProfiles, {
		fields: [contacts.clientContactRelationshipOwnerId],
		references: [userProfiles.id],
		relationName: "contacts_clientContactRelationshipOwnerId_userProfiles_id"
	}),
	contact_clientMspId: one(contacts, {
		fields: [contacts.clientMspId],
		references: [contacts.id],
		relationName: "contacts_clientMspId_contacts_id"
	}),
	contacts_clientMspId: many(contacts, {
		relationName: "contacts_clientMspId_contacts_id"
	}),
	userProfile_clientTeamLeadId: one(userProfiles, {
		fields: [contacts.clientTeamLeadId],
		references: [userProfiles.id],
		relationName: "contacts_clientTeamLeadId_userProfiles_id"
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [contacts.createdBy],
		references: [userProfiles.id],
		relationName: "contacts_createdBy_userProfiles_id"
	}),
	contact_currentCompanyId: one(contacts, {
		fields: [contacts.currentCompanyId],
		references: [contacts.id],
		relationName: "contacts_currentCompanyId_contacts_id"
	}),
	contacts_currentCompanyId: many(contacts, {
		relationName: "contacts_currentCompanyId_contacts_id"
	}),
	employee_employeeId: one(employees, {
		fields: [contacts.employeeId],
		references: [employees.id],
		relationName: "contacts_employeeId_employees_id"
	}),
	company_employerCompanyId: one(companies, {
		fields: [contacts.employerCompanyId],
		references: [companies.id],
		relationName: "contacts_employerCompanyId_companies_id"
	}),
	deal: one(deals, {
		fields: [contacts.leadConvertedToDealId],
		references: [deals.id],
		relationName: "contacts_leadConvertedToDealId_deals_id"
	}),
	company_linkedCompanyId: one(companies, {
		fields: [contacts.linkedCompanyId],
		references: [companies.id],
		relationName: "contacts_linkedCompanyId_companies_id"
	}),
	organization: one(organizations, {
		fields: [contacts.orgId],
		references: [organizations.id]
	}),
	userProfile_ownerId: one(userProfiles, {
		fields: [contacts.ownerId],
		references: [userProfiles.id],
		relationName: "contacts_ownerId_userProfiles_id"
	}),
	contact_parentCompanyId: one(contacts, {
		fields: [contacts.parentCompanyId],
		references: [contacts.id],
		relationName: "contacts_parentCompanyId_contacts_id"
	}),
	contacts_parentCompanyId: many(contacts, {
		relationName: "contacts_parentCompanyId_contacts_id"
	}),
	address: one(addresses, {
		fields: [contacts.primaryAddressId],
		references: [addresses.id]
	}),
	campaign: one(campaigns, {
		fields: [contacts.prospectPrimaryCampaignId],
		references: [campaigns.id]
	}),
	company_sourceCompanyId: one(companies, {
		fields: [contacts.sourceCompanyId],
		references: [companies.id],
		relationName: "contacts_sourceCompanyId_companies_id"
	}),
	contact_ultimateParentId: one(contacts, {
		fields: [contacts.ultimateParentId],
		references: [contacts.id],
		relationName: "contacts_ultimateParentId_contacts_id"
	}),
	contacts_ultimateParentId: many(contacts, {
		relationName: "contacts_ultimateParentId_contacts_id"
	}),
	userProfile_updatedBy: one(userProfiles, {
		fields: [contacts.updatedBy],
		references: [userProfiles.id],
		relationName: "contacts_updatedBy_userProfiles_id"
	}),
	userProfile_userProfileId: one(userProfiles, {
		fields: [contacts.userProfileId],
		references: [userProfiles.id],
		relationName: "contacts_userProfileId_userProfiles_id"
	}),
	userProfile_vendorApprovedBy: one(userProfiles, {
		fields: [contacts.vendorApprovedBy],
		references: [userProfiles.id],
		relationName: "contacts_vendorApprovedBy_userProfiles_id"
	}),
	company_vendorCompanyId: one(companies, {
		fields: [contacts.vendorCompanyId],
		references: [companies.id],
		relationName: "contacts_vendorCompanyId_companies_id"
	}),
	candidatePreparedProfiles: many(candidatePreparedProfiles),
	candidateScreenings: many(candidateScreenings),
	contactRelationships_sourceContactId: many(contactRelationships, {
		relationName: "contactRelationships_sourceContactId_contacts_id"
	}),
	contactRelationships_targetContactId: many(contactRelationships, {
		relationName: "contactRelationships_targetContactId_contacts_id"
	}),
	contactRoles_contactId: many(contactRoles, {
		relationName: "contactRoles_contactId_contacts_id"
	}),
	contactRoles_contextCompanyId: many(contactRoles, {
		relationName: "contactRoles_contextCompanyId_contacts_id"
	}),
	contactSkills: many(contactSkills),
	contactWorkHistories_companyContactId: many(contactWorkHistory, {
		relationName: "contactWorkHistory_companyContactId_contacts_id"
	}),
	contactWorkHistories_contactId: many(contactWorkHistory, {
		relationName: "contactWorkHistory_contactId_contacts_id"
	}),
	contactEducations: many(contactEducation),
	contactCertifications: many(contactCertifications),
	contactRateCards_clientId: many(contactRateCards, {
		relationName: "contactRateCards_clientId_contacts_id"
	}),
	contactRateCards_contactId: many(contactRateCards, {
		relationName: "contactRateCards_contactId_contacts_id"
	}),
	contactAgreements: many(contactAgreements),
	contactCompliances: many(contactCompliance),
	contactCommunicationPreferences: many(contactCommunicationPreferences),
	contactMergeHistories: many(contactMergeHistory),
	deals: many(deals, {
		relationName: "deals_leadContactId_contacts_id"
	}),
	contractParties: many(contractParties),
	jobs_hiringManagerContactId: many(jobs, {
		relationName: "jobs_hiringManagerContactId_contacts_id"
	}),
	jobs_hrContactId: many(jobs, {
		relationName: "jobs_hrContactId_contacts_id"
	}),
	submissions_contactId: many(submissions, {
		relationName: "submissions_contactId_contacts_id"
	}),
	submissions_submittedByContactId: many(submissions, {
		relationName: "submissions_submittedByContactId_contacts_id"
	}),
	interviews_contactId: many(interviews, {
		relationName: "interviews_contactId_contacts_id"
	}),
	interviews_coordinatorContactId: many(interviews, {
		relationName: "interviews_coordinatorContactId_contacts_id"
	}),
	interviews_primaryInterviewerContactId: many(interviews, {
		relationName: "interviews_primaryInterviewerContactId_contacts_id"
	}),
	interviewParticipants: many(interviewParticipants),
	placements_clientManagerContactId: many(placements, {
		relationName: "placements_clientManagerContactId_contacts_id"
	}),
	placements_contactId: many(placements, {
		relationName: "placements_contactId_contacts_id"
	}),
	placements_hrContactId: many(placements, {
		relationName: "placements_hrContactId_contacts_id"
	}),
	placements_reportingManagerContactId: many(placements, {
		relationName: "placements_reportingManagerContactId_contacts_id"
	}),
	placementVendors: many(placementVendors),
	employeeOnboardings: many(employeeOnboarding),
	payItems: many(payItems),
	invoices: many(invoices),
	workerTaxSetups: many(workerTaxSetup),
	workerBenefits: many(workerBenefits),
	workerGarnishments: many(workerGarnishments),
	taxDocuments: many(taxDocuments),
	campaignEnrollments: many(campaignEnrollments),
	communications: many(communications),
}));

export const generatedResumesRelations = relations(generatedResumes, ({one}) => ({
	organization: one(organizations, {
		fields: [generatedResumes.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [generatedResumes.userId],
		references: [userProfiles.id]
	}),
}));

export const requisitionEmbeddingsRelations = relations(requisitionEmbeddings, ({one}) => ({
	organization: one(organizations, {
		fields: [requisitionEmbeddings.orgId],
		references: [organizations.id]
	}),
}));

export const resumeMatchesRelations = relations(resumeMatches, ({one}) => ({
	organization: one(organizations, {
		fields: [resumeMatches.orgId],
		references: [organizations.id]
	}),
}));

export const employeeTwinInteractionsRelations = relations(employeeTwinInteractions, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [employeeTwinInteractions.userId],
		references: [userProfiles.id]
	}),
}));

export const candidateEmbeddingsRelations = relations(candidateEmbeddings, ({one}) => ({
	contact: one(contacts, {
		fields: [candidateEmbeddings.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [candidateEmbeddings.orgId],
		references: [organizations.id]
	}),
}));

export const leadSourcingCreditsRelations = relations(leadSourcingCredits, ({one}) => ({
	userProfile_assignedTo: one(userProfiles, {
		fields: [leadSourcingCredits.assignedTo],
		references: [userProfiles.id],
		relationName: "leadSourcingCredits_assignedTo_userProfiles_id"
	}),
	lead: one(leads, {
		fields: [leadSourcingCredits.leadId],
		references: [leads.id]
	}),
	organization: one(organizations, {
		fields: [leadSourcingCredits.orgId],
		references: [organizations.id]
	}),
	userProfile_sourcedBy: one(userProfiles, {
		fields: [leadSourcingCredits.sourcedBy],
		references: [userProfiles.id],
		relationName: "leadSourcingCredits_sourcedBy_userProfiles_id"
	}),
}));

export const rolesRelations = relations(roles, ({one, many}) => ({
	userProfile: one(userProfiles, {
		fields: [roles.createdBy],
		references: [userProfiles.id]
	}),
	role: one(roles, {
		fields: [roles.parentRoleId],
		references: [roles.id],
		relationName: "roles_parentRoleId_roles_id"
	}),
	roles: many(roles, {
		relationName: "roles_parentRoleId_roles_id"
	}),
	userRoles: many(userRoles),
}));

export const twinPreferencesRelations = relations(twinPreferences, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [twinPreferences.userId],
		references: [userProfiles.id]
	}),
}));

export const contentAssetsRelations = relations(contentAssets, ({one, many}) => ({
	topicLesson: one(topicLessons, {
		fields: [contentAssets.lessonId],
		references: [topicLessons.id]
	}),
	contentAsset: one(contentAssets, {
		fields: [contentAssets.replacedBy],
		references: [contentAssets.id],
		relationName: "contentAssets_replacedBy_contentAssets_id"
	}),
	contentAssets: many(contentAssets, {
		relationName: "contentAssets_replacedBy_contentAssets_id"
	}),
	moduleTopic: one(moduleTopics, {
		fields: [contentAssets.topicId],
		references: [moduleTopics.id]
	}),
	userProfile: one(userProfiles, {
		fields: [contentAssets.uploadedBy],
		references: [userProfiles.id]
	}),
}));

export const topicLessonsRelations = relations(topicLessons, ({one, many}) => ({
	contentAssets: many(contentAssets),
	moduleTopic: one(moduleTopics, {
		fields: [topicLessons.topicId],
		references: [moduleTopics.id]
	}),
}));

export const moduleTopicsRelations = relations(moduleTopics, ({one, many}) => ({
	contentAssets: many(contentAssets),
	videoProgresses: many(videoProgress),
	courseModule: one(courseModules, {
		fields: [moduleTopics.moduleId],
		references: [courseModules.id]
	}),
	topicLessons: many(topicLessons),
	topicCompletions: many(topicCompletions),
	readingProgresses: many(readingProgress),
	labInstances: many(labInstances),
	labSubmissions: many(labSubmissions),
	quizQuestions: many(quizQuestions),
	quizSettings: many(quizSettings),
	aiMentorChats: many(aiMentorChats),
	aiMentorSessions: many(aiMentorSessions),
	aiQuestionPatterns: many(aiQuestionPatterns),
	studentEnrollments: many(studentEnrollments),
	quizAttempts: many(quizAttempts),
	aiMentorEscalations: many(aiMentorEscalations),
}));

export const videoProgressRelations = relations(videoProgress, ({one}) => ({
	studentEnrollment: one(studentEnrollments, {
		fields: [videoProgress.enrollmentId],
		references: [studentEnrollments.id]
	}),
	moduleTopic: one(moduleTopics, {
		fields: [videoProgress.topicId],
		references: [moduleTopics.id]
	}),
	userProfile: one(userProfiles, {
		fields: [videoProgress.userId],
		references: [userProfiles.id]
	}),
}));

export const projectTimelineRelations = relations(projectTimeline, ({one}) => ({
	organization: one(organizations, {
		fields: [projectTimeline.orgId],
		references: [organizations.id]
	}),
}));

export const sessionMetadataRelations = relations(sessionMetadata, ({one}) => ({
	organization: one(organizations, {
		fields: [sessionMetadata.orgId],
		references: [organizations.id]
	}),
}));

export const campaignDocumentsRelations = relations(campaignDocuments, ({one}) => ({
	campaign: one(campaigns, {
		fields: [campaignDocuments.campaignId],
		references: [campaigns.id]
	}),
	organization: one(organizations, {
		fields: [campaignDocuments.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [campaignDocuments.uploadedBy],
		references: [userProfiles.id]
	}),
}));

export const eventDeliveryLogRelations = relations(eventDeliveryLog, ({one}) => ({
	event: one(events, {
		fields: [eventDeliveryLog.eventId],
		references: [events.id]
	}),
	organization: one(organizations, {
		fields: [eventDeliveryLog.orgId],
		references: [organizations.id]
	}),
	eventSubscription: one(eventSubscriptions, {
		fields: [eventDeliveryLog.subscriptionId],
		references: [eventSubscriptions.id]
	}),
}));

export const eventsRelations = relations(events, ({one, many}) => ({
	eventDeliveryLogs: many(eventDeliveryLog),
	organization: one(organizations, {
		fields: [events.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [events.userId],
		references: [userProfiles.id]
	}),
}));

export const eventSubscriptionsRelations = relations(eventSubscriptions, ({one, many}) => ({
	eventDeliveryLogs: many(eventDeliveryLog),
	organization: one(organizations, {
		fields: [eventSubscriptions.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [eventSubscriptions.userId],
		references: [userProfiles.id]
	}),
}));

export const onboardingChecklistRelations = relations(onboardingChecklist, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [onboardingChecklist.userId],
		references: [userProfiles.id]
	}),
}));

export const coursesRelations = relations(courses, ({one, many}) => ({
	userProfile: one(userProfiles, {
		fields: [courses.createdBy],
		references: [userProfiles.id]
	}),
	courseModules: many(courseModules),
	topicCompletions: many(topicCompletions),
	capstoneSubmissions: many(capstoneSubmissions),
	aiMentorChats: many(aiMentorChats),
	aiMentorSessions: many(aiMentorSessions),
	studentInterventions: many(studentInterventions),
	studentEnrollments: many(studentEnrollments),
	coursePricings: many(coursePricing),
	learningPathCourses: many(learningPathCourses),
	graduateCandidates: many(graduateCandidates),
}));

export const courseModulesRelations = relations(courseModules, ({one, many}) => ({
	course: one(courses, {
		fields: [courseModules.courseId],
		references: [courses.id]
	}),
	moduleTopics: many(moduleTopics),
	topicCompletions: many(topicCompletions),
	studentEnrollments: many(studentEnrollments),
}));

export const aiConversationsRelations = relations(aiConversations, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [aiConversations.userId],
		references: [userProfiles.id]
	}),
}));

export const aiPatternsRelations = relations(aiPatterns, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [aiPatterns.userId],
		references: [userProfiles.id]
	}),
}));

export const aiCostTrackingRelations = relations(aiCostTracking, ({one}) => ({
	organization: one(organizations, {
		fields: [aiCostTracking.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [aiCostTracking.userId],
		references: [userProfiles.id]
	}),
}));

export const aiPromptsRelations = relations(aiPrompts, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [aiPrompts.createdBy],
		references: [userProfiles.id]
	}),
}));

export const studentProgressRelations = relations(studentProgress, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [studentProgress.studentId],
		references: [userProfiles.id]
	}),
}));

export const aiAgentInteractionsRelations = relations(aiAgentInteractions, ({one}) => ({
	organization: one(organizations, {
		fields: [aiAgentInteractions.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [aiAgentInteractions.userId],
		references: [userProfiles.id]
	}),
}));

export const guruInteractionsRelations = relations(guruInteractions, ({one}) => ({
	organization: one(organizations, {
		fields: [guruInteractions.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [guruInteractions.studentId],
		references: [userProfiles.id]
	}),
}));

export const resumeVersionsRelations = relations(resumeVersions, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [resumeVersions.studentId],
		references: [userProfiles.id]
	}),
}));

export const interviewSessionsRelations = relations(interviewSessions, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [interviewSessions.studentId],
		references: [userProfiles.id]
	}),
}));

export const employeeScreenshotsRelations = relations(employeeScreenshots, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [employeeScreenshots.userId],
		references: [userProfiles.id]
	}),
}));

export const topicCompletionsRelations = relations(topicCompletions, ({one}) => ({
	course: one(courses, {
		fields: [topicCompletions.courseId],
		references: [courses.id]
	}),
	studentEnrollment: one(studentEnrollments, {
		fields: [topicCompletions.enrollmentId],
		references: [studentEnrollments.id]
	}),
	courseModule: one(courseModules, {
		fields: [topicCompletions.moduleId],
		references: [courseModules.id]
	}),
	moduleTopic: one(moduleTopics, {
		fields: [topicCompletions.topicId],
		references: [moduleTopics.id]
	}),
	userProfile: one(userProfiles, {
		fields: [topicCompletions.userId],
		references: [userProfiles.id]
	}),
}));

export const xpTransactionsRelations = relations(xpTransactions, ({one}) => ({
	userProfile_awardedBy: one(userProfiles, {
		fields: [xpTransactions.awardedBy],
		references: [userProfiles.id],
		relationName: "xpTransactions_awardedBy_userProfiles_id"
	}),
	userProfile_userId: one(userProfiles, {
		fields: [xpTransactions.userId],
		references: [userProfiles.id],
		relationName: "xpTransactions_userId_userProfiles_id"
	}),
}));

export const readingProgressRelations = relations(readingProgress, ({one}) => ({
	studentEnrollment: one(studentEnrollments, {
		fields: [readingProgress.enrollmentId],
		references: [studentEnrollments.id]
	}),
	moduleTopic: one(moduleTopics, {
		fields: [readingProgress.topicId],
		references: [moduleTopics.id]
	}),
	userProfile: one(userProfiles, {
		fields: [readingProgress.userId],
		references: [userProfiles.id]
	}),
}));

export const labTemplatesRelations = relations(labTemplates, ({one, many}) => ({
	userProfile: one(userProfiles, {
		fields: [labTemplates.createdBy],
		references: [userProfiles.id]
	}),
	labInstances: many(labInstances),
}));

export const labInstancesRelations = relations(labInstances, ({one, many}) => ({
	studentEnrollment: one(studentEnrollments, {
		fields: [labInstances.enrollmentId],
		references: [studentEnrollments.id]
	}),
	labTemplate: one(labTemplates, {
		fields: [labInstances.labTemplateId],
		references: [labTemplates.id]
	}),
	moduleTopic: one(moduleTopics, {
		fields: [labInstances.topicId],
		references: [moduleTopics.id]
	}),
	userProfile: one(userProfiles, {
		fields: [labInstances.userId],
		references: [userProfiles.id]
	}),
	labSubmissions: many(labSubmissions),
}));

export const labSubmissionsRelations = relations(labSubmissions, ({one, many}) => ({
	studentEnrollment: one(studentEnrollments, {
		fields: [labSubmissions.enrollmentId],
		references: [studentEnrollments.id]
	}),
	userProfile_gradedBy: one(userProfiles, {
		fields: [labSubmissions.gradedBy],
		references: [userProfiles.id],
		relationName: "labSubmissions_gradedBy_userProfiles_id"
	}),
	labInstance: one(labInstances, {
		fields: [labSubmissions.labInstanceId],
		references: [labInstances.id]
	}),
	labSubmission: one(labSubmissions, {
		fields: [labSubmissions.previousSubmissionId],
		references: [labSubmissions.id],
		relationName: "labSubmissions_previousSubmissionId_labSubmissions_id"
	}),
	labSubmissions: many(labSubmissions, {
		relationName: "labSubmissions_previousSubmissionId_labSubmissions_id"
	}),
	moduleTopic: one(moduleTopics, {
		fields: [labSubmissions.topicId],
		references: [moduleTopics.id]
	}),
	userProfile_userId: one(userProfiles, {
		fields: [labSubmissions.userId],
		references: [userProfiles.id],
		relationName: "labSubmissions_userId_userProfiles_id"
	}),
}));

export const capstoneSubmissionsRelations = relations(capstoneSubmissions, ({one, many}) => ({
	course: one(courses, {
		fields: [capstoneSubmissions.courseId],
		references: [courses.id]
	}),
	studentEnrollment: one(studentEnrollments, {
		fields: [capstoneSubmissions.enrollmentId],
		references: [studentEnrollments.id]
	}),
	userProfile_gradedBy: one(userProfiles, {
		fields: [capstoneSubmissions.gradedBy],
		references: [userProfiles.id],
		relationName: "capstoneSubmissions_gradedBy_userProfiles_id"
	}),
	userProfile_userId: one(userProfiles, {
		fields: [capstoneSubmissions.userId],
		references: [userProfiles.id],
		relationName: "capstoneSubmissions_userId_userProfiles_id"
	}),
	peerReviews: many(peerReviews),
}));

export const twinEventsRelations = relations(twinEvents, ({one}) => ({
	userProfile_processedBy: one(userProfiles, {
		fields: [twinEvents.processedBy],
		references: [userProfiles.id],
		relationName: "twinEvents_processedBy_userProfiles_id"
	}),
	userProfile_sourceUserId: one(userProfiles, {
		fields: [twinEvents.sourceUserId],
		references: [userProfiles.id],
		relationName: "twinEvents_sourceUserId_userProfiles_id"
	}),
}));

export const twinConversationsRelations = relations(twinConversations, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [twinConversations.initiatorUserId],
		references: [userProfiles.id]
	}),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [quizQuestions.createdBy],
		references: [userProfiles.id]
	}),
	moduleTopic: one(moduleTopics, {
		fields: [quizQuestions.topicId],
		references: [moduleTopics.id]
	}),
}));

export const quizSettingsRelations = relations(quizSettings, ({one}) => ({
	moduleTopic: one(moduleTopics, {
		fields: [quizSettings.topicId],
		references: [moduleTopics.id]
	}),
}));

export const peerReviewsRelations = relations(peerReviews, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [peerReviews.reviewerId],
		references: [userProfiles.id]
	}),
	capstoneSubmission: one(capstoneSubmissions, {
		fields: [peerReviews.submissionId],
		references: [capstoneSubmissions.id]
	}),
}));

export const aiMentorChatsRelations = relations(aiMentorChats, ({one, many}) => ({
	course: one(courses, {
		fields: [aiMentorChats.courseId],
		references: [courses.id]
	}),
	aiPromptVariant: one(aiPromptVariants, {
		fields: [aiMentorChats.promptVariantId],
		references: [aiPromptVariants.id]
	}),
	moduleTopic: one(moduleTopics, {
		fields: [aiMentorChats.topicId],
		references: [moduleTopics.id]
	}),
	userProfile: one(userProfiles, {
		fields: [aiMentorChats.userId],
		references: [userProfiles.id]
	}),
	aiMentorEscalations: many(aiMentorEscalations),
}));

export const aiPromptVariantsRelations = relations(aiPromptVariants, ({many}) => ({
	aiMentorChats: many(aiMentorChats),
}));

export const sequenceTemplatesRelations = relations(sequenceTemplates, ({one, many}) => ({
	userProfile: one(userProfiles, {
		fields: [sequenceTemplates.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [sequenceTemplates.orgId],
		references: [organizations.id]
	}),
	campaignSequences: many(campaignSequences),
}));

export const aiMentorRateLimitsRelations = relations(aiMentorRateLimits, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [aiMentorRateLimits.userId],
		references: [userProfiles.id]
	}),
}));

export const aiMentorSessionsRelations = relations(aiMentorSessions, ({one}) => ({
	course: one(courses, {
		fields: [aiMentorSessions.courseId],
		references: [courses.id]
	}),
	moduleTopic: one(moduleTopics, {
		fields: [aiMentorSessions.topicId],
		references: [moduleTopics.id]
	}),
	userProfile: one(userProfiles, {
		fields: [aiMentorSessions.userId],
		references: [userProfiles.id]
	}),
}));

export const permissionOverridesRelations = relations(permissionOverrides, ({one}) => ({
	userProfile_createdBy: one(userProfiles, {
		fields: [permissionOverrides.createdBy],
		references: [userProfiles.id],
		relationName: "permissionOverrides_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [permissionOverrides.orgId],
		references: [organizations.id]
	}),
	permission: one(permissions, {
		fields: [permissionOverrides.permissionId],
		references: [permissions.id]
	}),
	userProfile_revokedBy: one(userProfiles, {
		fields: [permissionOverrides.revokedBy],
		references: [userProfiles.id],
		relationName: "permissionOverrides_revokedBy_userProfiles_id"
	}),
	userProfile_userId: one(userProfiles, {
		fields: [permissionOverrides.userId],
		references: [userProfiles.id],
		relationName: "permissionOverrides_userId_userProfiles_id"
	}),
}));

export const permissionsRelations = relations(permissions, ({many}) => ({
	permissionOverrides: many(permissionOverrides),
	rolePermissions: many(rolePermissions),
}));

export const campaignSequencesRelations = relations(campaignSequences, ({one}) => ({
	campaign: one(campaigns, {
		fields: [campaignSequences.campaignId],
		references: [campaigns.id]
	}),
	organization: one(organizations, {
		fields: [campaignSequences.orgId],
		references: [organizations.id]
	}),
	sequenceTemplate: one(sequenceTemplates, {
		fields: [campaignSequences.sequenceTemplateId],
		references: [sequenceTemplates.id]
	}),
}));

export const apiTokensRelations = relations(apiTokens, ({one}) => ({
	userProfile_createdBy: one(userProfiles, {
		fields: [apiTokens.createdBy],
		references: [userProfiles.id],
		relationName: "apiTokens_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [apiTokens.orgId],
		references: [organizations.id]
	}),
	userProfile_revokedBy: one(userProfiles, {
		fields: [apiTokens.revokedBy],
		references: [userProfiles.id],
		relationName: "apiTokens_revokedBy_userProfiles_id"
	}),
}));

export const bulkUpdateHistoryRelations = relations(bulkUpdateHistory, ({one}) => ({
	userProfile_appliedBy: one(userProfiles, {
		fields: [bulkUpdateHistory.appliedBy],
		references: [userProfiles.id],
		relationName: "bulkUpdateHistory_appliedBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [bulkUpdateHistory.orgId],
		references: [organizations.id]
	}),
	userProfile_rolledBackBy: one(userProfiles, {
		fields: [bulkUpdateHistory.rolledBackBy],
		references: [userProfiles.id],
		relationName: "bulkUpdateHistory_rolledBackBy_userProfiles_id"
	}),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [rolePermissions.grantedBy],
		references: [userProfiles.id]
	}),
	permission: one(permissions, {
		fields: [rolePermissions.permissionId],
		references: [permissions.id]
	}),
	systemRole: one(systemRoles, {
		fields: [rolePermissions.roleId],
		references: [systemRoles.id]
	}),
}));

export const systemRolesRelations = relations(systemRoles, ({many}) => ({
	rolePermissions: many(rolePermissions),
	featureFlagRoles: many(featureFlagRoles),
	userProfiles: many(userProfiles),
	userInvitations: many(userInvitations),
}));

export const aiQuestionPatternsRelations = relations(aiQuestionPatterns, ({one}) => ({
	moduleTopic: one(moduleTopics, {
		fields: [aiQuestionPatterns.topicId],
		references: [moduleTopics.id]
	}),
}));

export const featureFlagRolesRelations = relations(featureFlagRoles, ({one}) => ({
	featureFlag: one(featureFlags, {
		fields: [featureFlagRoles.featureFlagId],
		references: [featureFlags.id]
	}),
	systemRole: one(systemRoles, {
		fields: [featureFlagRoles.roleId],
		references: [systemRoles.id]
	}),
}));

export const featureFlagsRelations = relations(featureFlags, ({one, many}) => ({
	featureFlagRoles: many(featureFlagRoles),
	featureFlagUsages: many(featureFlagUsage),
	featureFlagFeedbacks: many(featureFlagFeedback),
	userProfile_createdBy: one(userProfiles, {
		fields: [featureFlags.createdBy],
		references: [userProfiles.id],
		relationName: "featureFlags_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [featureFlags.orgId],
		references: [organizations.id]
	}),
	userProfile_updatedBy: one(userProfiles, {
		fields: [featureFlags.updatedBy],
		references: [userProfiles.id],
		relationName: "featureFlags_updatedBy_userProfiles_id"
	}),
}));

export const userBadgesRelations = relations(userBadges, ({one}) => ({
	badge: one(badges, {
		fields: [userBadges.badgeId],
		references: [badges.id]
	}),
	userProfile: one(userProfiles, {
		fields: [userBadges.userId],
		references: [userProfiles.id]
	}),
}));

export const systemSettingsRelations = relations(systemSettings, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [systemSettings.updatedBy],
		references: [userProfiles.id]
	}),
}));

export const workflowStatesRelations = relations(workflowStates, ({one, many}) => ({
	workflow: one(workflows, {
		fields: [workflowStates.workflowId],
		references: [workflows.id]
	}),
	workflowTransitions_fromStateId: many(workflowTransitions, {
		relationName: "workflowTransitions_fromStateId_workflowStates_id"
	}),
	workflowTransitions_toStateId: many(workflowTransitions, {
		relationName: "workflowTransitions_toStateId_workflowStates_id"
	}),
	workflowInstances: many(workflowInstances),
	workflowHistories_fromStateId: many(workflowHistory, {
		relationName: "workflowHistory_fromStateId_workflowStates_id"
	}),
	workflowHistories_toStateId: many(workflowHistory, {
		relationName: "workflowHistory_toStateId_workflowStates_id"
	}),
	workflowSteps: many(workflowSteps),
}));

export const workflowsRelations = relations(workflows, ({one, many}) => ({
	workflowStates: many(workflowStates),
	workflowTransitions: many(workflowTransitions),
	workflowInstances: many(workflowInstances),
	userProfile: one(userProfiles, {
		fields: [workflows.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [workflows.orgId],
		references: [organizations.id]
	}),
}));

export const workflowTransitionsRelations = relations(workflowTransitions, ({one, many}) => ({
	workflowState_fromStateId: one(workflowStates, {
		fields: [workflowTransitions.fromStateId],
		references: [workflowStates.id],
		relationName: "workflowTransitions_fromStateId_workflowStates_id"
	}),
	workflowState_toStateId: one(workflowStates, {
		fields: [workflowTransitions.toStateId],
		references: [workflowStates.id],
		relationName: "workflowTransitions_toStateId_workflowStates_id"
	}),
	workflow: one(workflows, {
		fields: [workflowTransitions.workflowId],
		references: [workflows.id]
	}),
	workflowSteps: many(workflowSteps),
}));

export const workflowInstancesRelations = relations(workflowInstances, ({one, many}) => ({
	userProfile: one(userProfiles, {
		fields: [workflowInstances.createdBy],
		references: [userProfiles.id]
	}),
	workflowState: one(workflowStates, {
		fields: [workflowInstances.currentStateId],
		references: [workflowStates.id]
	}),
	organization: one(organizations, {
		fields: [workflowInstances.orgId],
		references: [organizations.id]
	}),
	workflow: one(workflows, {
		fields: [workflowInstances.workflowId],
		references: [workflows.id]
	}),
	workflowHistories: many(workflowHistory),
	workflowExecutions: many(workflowExecutions),
}));

export const workflowHistoryRelations = relations(workflowHistory, ({one}) => ({
	workflowState_fromStateId: one(workflowStates, {
		fields: [workflowHistory.fromStateId],
		references: [workflowStates.id],
		relationName: "workflowHistory_fromStateId_workflowStates_id"
	}),
	userProfile: one(userProfiles, {
		fields: [workflowHistory.performedBy],
		references: [userProfiles.id]
	}),
	workflowState_toStateId: one(workflowStates, {
		fields: [workflowHistory.toStateId],
		references: [workflowStates.id],
		relationName: "workflowHistory_toStateId_workflowStates_id"
	}),
	workflowInstance: one(workflowInstances, {
		fields: [workflowHistory.workflowInstanceId],
		references: [workflowInstances.id]
	}),
}));

export const fileUploadsRelations = relations(fileUploads, ({one}) => ({
	organization: one(organizations, {
		fields: [fileUploads.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [fileUploads.uploadedBy],
		references: [userProfiles.id]
	}),
}));

export const documentTemplatesRelations = relations(documentTemplates, ({one, many}) => ({
	userProfile: one(userProfiles, {
		fields: [documentTemplates.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [documentTemplates.orgId],
		references: [organizations.id]
	}),
	generatedDocuments: many(generatedDocuments),
}));

export const generatedDocumentsRelations = relations(generatedDocuments, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [generatedDocuments.generatedBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [generatedDocuments.orgId],
		references: [organizations.id]
	}),
	documentTemplate: one(documentTemplates, {
		fields: [generatedDocuments.templateId],
		references: [documentTemplates.id]
	}),
}));

export const emailLogsRelations = relations(emailLogs, ({one}) => ({
	organization: one(organizations, {
		fields: [emailLogs.orgId],
		references: [organizations.id]
	}),
	emailTemplate: one(emailTemplates, {
		fields: [emailLogs.templateId],
		references: [emailTemplates.id]
	}),
}));

export const emailTemplatesRelations = relations(emailTemplates, ({one, many}) => ({
	emailLogs: many(emailLogs),
	userProfile_createdBy: one(userProfiles, {
		fields: [emailTemplates.createdBy],
		references: [userProfiles.id],
		relationName: "emailTemplates_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [emailTemplates.orgId],
		references: [organizations.id]
	}),
	userProfile_updatedBy: one(userProfiles, {
		fields: [emailTemplates.updatedBy],
		references: [userProfiles.id],
		relationName: "emailTemplates_updatedBy_userProfiles_id"
	}),
	emailSends: many(emailSends),
}));

export const backgroundJobsRelations = relations(backgroundJobs, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [backgroundJobs.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [backgroundJobs.orgId],
		references: [organizations.id]
	}),
}));

export const discountCodesRelations = relations(discountCodes, ({one, many}) => ({
	userProfile: one(userProfiles, {
		fields: [discountCodes.createdBy],
		references: [userProfiles.id]
	}),
	discountCodeUsages: many(discountCodeUsage),
}));

export const studentInterventionsRelations = relations(studentInterventions, ({one}) => ({
	userProfile_assignedTrainerId: one(userProfiles, {
		fields: [studentInterventions.assignedTrainerId],
		references: [userProfiles.id],
		relationName: "studentInterventions_assignedTrainerId_userProfiles_id"
	}),
	course: one(courses, {
		fields: [studentInterventions.courseId],
		references: [courses.id]
	}),
	studentEnrollment: one(studentEnrollments, {
		fields: [studentInterventions.enrollmentId],
		references: [studentEnrollments.id]
	}),
	userProfile_studentId: one(userProfiles, {
		fields: [studentInterventions.studentId],
		references: [userProfiles.id],
		relationName: "studentInterventions_studentId_userProfiles_id"
	}),
}));

export const discountCodeUsageRelations = relations(discountCodeUsage, ({one}) => ({
	discountCode: one(discountCodes, {
		fields: [discountCodeUsage.discountCodeId],
		references: [discountCodes.id]
	}),
	studentEnrollment: one(studentEnrollments, {
		fields: [discountCodeUsage.enrollmentId],
		references: [studentEnrollments.id]
	}),
	userProfile: one(userProfiles, {
		fields: [discountCodeUsage.userId],
		references: [userProfiles.id]
	}),
}));

export const coursePricingRelations = relations(coursePricing, ({one}) => ({
	course: one(courses, {
		fields: [coursePricing.courseId],
		references: [courses.id]
	}),
}));

export const organizationSettingsRelations = relations(organizationSettings, ({one}) => ({
	organization: one(organizations, {
		fields: [organizationSettings.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [organizationSettings.updatedBy],
		references: [userProfiles.id]
	}),
}));

export const contactLeadDataRelations = relations(contactLeadData, ({one}) => ({
	contact: one(contacts, {
		fields: [contactLeadData.contactId],
		references: [contacts.id]
	}),
	campaign: one(campaigns, {
		fields: [contactLeadData.sourceCampaignId],
		references: [campaigns.id]
	}),
}));

export const commentsRelations = relations(comments, ({one, many}) => ({
	userProfile_authorId: one(userProfiles, {
		fields: [comments.authorId],
		references: [userProfiles.id],
		relationName: "comments_authorId_userProfiles_id"
	}),
	userProfile_deletedBy: one(userProfiles, {
		fields: [comments.deletedBy],
		references: [userProfiles.id],
		relationName: "comments_deletedBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [comments.orgId],
		references: [organizations.id]
	}),
	comment: one(comments, {
		fields: [comments.parentCommentId],
		references: [comments.id],
		relationName: "comments_parentCommentId_comments_id"
	}),
	comments: many(comments, {
		relationName: "comments_parentCommentId_comments_id"
	}),
}));

export const leadTasksRelations = relations(leadTasks, ({one}) => ({
	userProfile_assignedTo: one(userProfiles, {
		fields: [leadTasks.assignedTo],
		references: [userProfiles.id],
		relationName: "leadTasks_assignedTo_userProfiles_id"
	}),
	userProfile_completedBy: one(userProfiles, {
		fields: [leadTasks.completedBy],
		references: [userProfiles.id],
		relationName: "leadTasks_completedBy_userProfiles_id"
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [leadTasks.createdBy],
		references: [userProfiles.id],
		relationName: "leadTasks_createdBy_userProfiles_id"
	}),
	lead: one(leads, {
		fields: [leadTasks.leadId],
		references: [leads.id]
	}),
	organization: one(organizations, {
		fields: [leadTasks.orgId],
		references: [organizations.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	organization: one(organizations, {
		fields: [notifications.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [notifications.userId],
		references: [userProfiles.id]
	}),
}));

export const tasksRelations = relations(tasks, ({one, many}) => ({
	userProfile_assignedTo: one(userProfiles, {
		fields: [tasks.assignedTo],
		references: [userProfiles.id],
		relationName: "tasks_assignedTo_userProfiles_id"
	}),
	userProfile_completedBy: one(userProfiles, {
		fields: [tasks.completedBy],
		references: [userProfiles.id],
		relationName: "tasks_completedBy_userProfiles_id"
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [tasks.createdBy],
		references: [userProfiles.id],
		relationName: "tasks_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [tasks.orgId],
		references: [organizations.id]
	}),
	task: one(tasks, {
		fields: [tasks.parentTaskId],
		references: [tasks.id],
		relationName: "tasks_parentTaskId_tasks_id"
	}),
	tasks: many(tasks, {
		relationName: "tasks_parentTaskId_tasks_id"
	}),
}));

export const organizationBrandingRelations = relations(organizationBranding, ({one}) => ({
	organization: one(organizations, {
		fields: [organizationBranding.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [organizationBranding.uploadedBy],
		references: [userProfiles.id]
	}),
}));

export const companyContractsRelations = relations(companyContracts, ({one, many}) => ({
	company: one(companies, {
		fields: [companyContracts.companyId],
		references: [companies.id]
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [companyContracts.createdBy],
		references: [userProfiles.id],
		relationName: "companyContracts_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [companyContracts.orgId],
		references: [organizations.id]
	}),
	userProfile_ourSignatoryId: one(userProfiles, {
		fields: [companyContracts.ourSignatoryId],
		references: [userProfiles.id],
		relationName: "companyContracts_ourSignatoryId_userProfiles_id"
	}),
	companyContract: one(companyContracts, {
		fields: [companyContracts.parentContractId],
		references: [companyContracts.id],
		relationName: "companyContracts_parentContractId_companyContracts_id"
	}),
	companyContracts: many(companyContracts, {
		relationName: "companyContracts_parentContractId_companyContracts_id"
	}),
}));

export const companyRateCardsRelations = relations(companyRateCards, ({one, many}) => ({
	userProfile_approvedBy: one(userProfiles, {
		fields: [companyRateCards.approvedBy],
		references: [userProfiles.id],
		relationName: "companyRateCards_approvedBy_userProfiles_id"
	}),
	company_companyId: one(companies, {
		fields: [companyRateCards.companyId],
		references: [companies.id],
		relationName: "companyRateCards_companyId_companies_id"
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [companyRateCards.createdBy],
		references: [userProfiles.id],
		relationName: "companyRateCards_createdBy_userProfiles_id"
	}),
	company_mspProgramId: one(companies, {
		fields: [companyRateCards.mspProgramId],
		references: [companies.id],
		relationName: "companyRateCards_mspProgramId_companies_id"
	}),
	organization: one(organizations, {
		fields: [companyRateCards.orgId],
		references: [organizations.id]
	}),
	companyRateCardItems: many(companyRateCardItems),
}));

export const companyRateCardItemsRelations = relations(companyRateCardItems, ({one}) => ({
	companyRateCard: one(companyRateCards, {
		fields: [companyRateCardItems.rateCardId],
		references: [companyRateCards.id]
	}),
}));

export const companyComplianceRequirementsRelations = relations(companyComplianceRequirements, ({one}) => ({
	company: one(companies, {
		fields: [companyComplianceRequirements.companyId],
		references: [companies.id]
	}),
	organization: one(organizations, {
		fields: [companyComplianceRequirements.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [companyComplianceRequirements.updatedBy],
		references: [userProfiles.id]
	}),
}));

export const companyHealthScoresRelations = relations(companyHealthScores, ({one}) => ({
	company: one(companies, {
		fields: [companyHealthScores.companyId],
		references: [companies.id]
	}),
	organization: one(organizations, {
		fields: [companyHealthScores.orgId],
		references: [organizations.id]
	}),
}));

export const companyMetricsRelations = relations(companyMetrics, ({one}) => ({
	company: one(companies, {
		fields: [companyMetrics.companyId],
		references: [companies.id]
	}),
	organization: one(organizations, {
		fields: [companyMetrics.orgId],
		references: [organizations.id]
	}),
}));

export const companyRevenueRelations = relations(companyRevenue, ({one}) => ({
	company_billingCompanyId: one(companies, {
		fields: [companyRevenue.billingCompanyId],
		references: [companies.id],
		relationName: "companyRevenue_billingCompanyId_companies_id"
	}),
	company_companyId: one(companies, {
		fields: [companyRevenue.companyId],
		references: [companies.id],
		relationName: "companyRevenue_companyId_companies_id"
	}),
	company_endClientCompanyId: one(companies, {
		fields: [companyRevenue.endClientCompanyId],
		references: [companies.id],
		relationName: "companyRevenue_endClientCompanyId_companies_id"
	}),
	organization: one(organizations, {
		fields: [companyRevenue.orgId],
		references: [organizations.id]
	}),
}));

export const activityLogRelations = relations(activityLog, ({one}) => ({
	organization: one(organizations, {
		fields: [activityLog.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [activityLog.performedBy],
		references: [userProfiles.id]
	}),
}));

export const employeeMetadataRelations = relations(employeeMetadata, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [employeeMetadata.userId],
		references: [userProfiles.id]
	}),
	pod: one(pods, {
		fields: [employeeMetadata.podId],
		references: [pods.id]
	}),
}));

export const podsRelations = relations(pods, ({one, many}) => ({
	employeeMetadata: many(employeeMetadata),
	userProfile_createdBy: one(userProfiles, {
		fields: [pods.createdBy],
		references: [userProfiles.id],
		relationName: "pods_createdBy_userProfiles_id"
	}),
	group: one(groups, {
		fields: [pods.groupId],
		references: [groups.id]
	}),
	userProfile_juniorMemberId: one(userProfiles, {
		fields: [pods.juniorMemberId],
		references: [userProfiles.id],
		relationName: "pods_juniorMemberId_userProfiles_id"
	}),
	userProfile_managerId: one(userProfiles, {
		fields: [pods.managerId],
		references: [userProfiles.id],
		relationName: "pods_managerId_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [pods.orgId],
		references: [organizations.id]
	}),
	pod: one(pods, {
		fields: [pods.parentId],
		references: [pods.id],
		relationName: "pods_parentId_pods_id"
	}),
	pods: many(pods, {
		relationName: "pods_parentId_pods_id"
	}),
	region: one(regions, {
		fields: [pods.regionId],
		references: [regions.id]
	}),
	userProfile_seniorMemberId: one(userProfiles, {
		fields: [pods.seniorMemberId],
		references: [userProfiles.id],
		relationName: "pods_seniorMemberId_userProfiles_id"
	}),
	podManagers: many(podManagers),
	podMembers: many(podMembers),
	podSprintMetrics: many(podSprintMetrics),
	activityAutoRules: many(activityAutoRules),
	activityMetrics: many(activityMetrics),
	teamMetrics: many(teamMetrics),
	userInvitations: many(userInvitations),
	activities: many(activities),
	placementCredits: many(placementCredits),
	workQueues: many(workQueues),
	slaDefinitions: many(slaDefinitions),
	activityPatterns: many(activityPatterns),
	companies: many(companies),
}));

export const candidateSkillsRelations = relations(candidateSkills, ({one}) => ({
	candidate: one(candidates, {
		fields: [candidateSkills.candidateId],
		references: [candidates.id]
	}),
	contact: one(contacts, {
		fields: [candidateSkills.contactId],
		references: [contacts.id]
	}),
	skill: one(skills, {
		fields: [candidateSkills.skillId],
		references: [skills.id]
	}),
}));

export const candidatesRelations = relations(candidates, ({one, many}) => ({
	candidateSkills: many(candidateSkills),
	contact: one(contacts, {
		fields: [candidates.contactId],
		references: [contacts.id]
	}),
	usersInAuth_createdBy: one(usersInAuth, {
		fields: [candidates.createdBy],
		references: [usersInAuth.id],
		relationName: "candidates_createdBy_usersInAuth_id"
	}),
	usersInAuth_hotlistAddedBy: one(usersInAuth, {
		fields: [candidates.hotlistAddedBy],
		references: [usersInAuth.id],
		relationName: "candidates_hotlistAddedBy_usersInAuth_id"
	}),
	organization: one(organizations, {
		fields: [candidates.orgId],
		references: [organizations.id]
	}),
	usersInAuth_ownerId: one(usersInAuth, {
		fields: [candidates.ownerId],
		references: [usersInAuth.id],
		relationName: "candidates_ownerId_usersInAuth_id"
	}),
	usersInAuth_sourcedBy: one(usersInAuth, {
		fields: [candidates.sourcedBy],
		references: [usersInAuth.id],
		relationName: "candidates_sourcedBy_usersInAuth_id"
	}),
	usersInAuth_updatedBy: one(usersInAuth, {
		fields: [candidates.updatedBy],
		references: [usersInAuth.id],
		relationName: "candidates_updatedBy_usersInAuth_id"
	}),
}));

export const skillsRelations = relations(skills, ({one, many}) => ({
	candidateSkills: many(candidateSkills),
	jobSkills: many(jobSkills),
	skillAliases: many(skillAliases),
	skill_deprecatedSuccessorId: one(skills, {
		fields: [skills.deprecatedSuccessorId],
		references: [skills.id],
		relationName: "skills_deprecatedSuccessorId_skills_id"
	}),
	skills_deprecatedSuccessorId: many(skills, {
		relationName: "skills_deprecatedSuccessorId_skills_id"
	}),
	organization: one(organizations, {
		fields: [skills.orgId],
		references: [organizations.id]
	}),
	skill_parentSkillId: one(skills, {
		fields: [skills.parentSkillId],
		references: [skills.id],
		relationName: "skills_parentSkillId_skills_id"
	}),
	skills_parentSkillId: many(skills, {
		relationName: "skills_parentSkillId_skills_id"
	}),
	entitySkills: many(entitySkills),
	certifications: many(certifications),
	contactSkills: many(contactSkills),
	contactRateCards: many(contactRateCards),
}));

export const groupsRelations = relations(groups, ({one, many}) => ({
	pods: many(pods),
	userProfiles: many(userProfiles, {
		relationName: "userProfiles_primaryGroupId_groups_id"
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [groups.createdBy],
		references: [userProfiles.id],
		relationName: "groups_createdBy_userProfiles_id"
	}),
	userProfile_managerId: one(userProfiles, {
		fields: [groups.managerId],
		references: [userProfiles.id],
		relationName: "groups_managerId_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [groups.orgId],
		references: [organizations.id]
	}),
	group: one(groups, {
		fields: [groups.parentGroupId],
		references: [groups.id],
		relationName: "groups_parentGroupId_groups_id"
	}),
	groups: many(groups, {
		relationName: "groups_parentGroupId_groups_id"
	}),
	userProfile_supervisorId: one(userProfiles, {
		fields: [groups.supervisorId],
		references: [userProfiles.id],
		relationName: "groups_supervisorId_userProfiles_id"
	}),
	userProfile_updatedBy: one(userProfiles, {
		fields: [groups.updatedBy],
		references: [userProfiles.id],
		relationName: "groups_updatedBy_userProfiles_id"
	}),
	groupMembers: many(groupMembers),
	groupRegions: many(groupRegions),
}));

export const regionsRelations = relations(regions, ({one, many}) => ({
	pods: many(pods),
	userProfile_createdBy: one(userProfiles, {
		fields: [regions.createdBy],
		references: [userProfiles.id],
		relationName: "regions_createdBy_userProfiles_id"
	}),
	userProfile_managerId: one(userProfiles, {
		fields: [regions.managerId],
		references: [userProfiles.id],
		relationName: "regions_managerId_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [regions.orgId],
		references: [organizations.id]
	}),
	groupRegions: many(groupRegions),
}));

export const userSessionContextRelations = relations(userSessionContext, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [userSessionContext.userId],
		references: [userProfiles.id]
	}),
}));

export const podManagersRelations = relations(podManagers, ({one}) => ({
	userProfile_assignedBy: one(userProfiles, {
		fields: [podManagers.assignedBy],
		references: [userProfiles.id],
		relationName: "podManagers_assignedBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [podManagers.orgId],
		references: [organizations.id]
	}),
	pod: one(pods, {
		fields: [podManagers.podId],
		references: [pods.id]
	}),
	userProfile_removedBy: one(userProfiles, {
		fields: [podManagers.removedBy],
		references: [userProfiles.id],
		relationName: "podManagers_removedBy_userProfiles_id"
	}),
	userProfile_userId: one(userProfiles, {
		fields: [podManagers.userId],
		references: [userProfiles.id],
		relationName: "podManagers_userId_userProfiles_id"
	}),
}));

export const leadStrategiesRelations = relations(leadStrategies, ({one}) => ({
	userProfile_createdBy: one(userProfiles, {
		fields: [leadStrategies.createdBy],
		references: [userProfiles.id],
		relationName: "leadStrategies_createdBy_userProfiles_id"
	}),
	lead: one(leads, {
		fields: [leadStrategies.leadId],
		references: [leads.id]
	}),
	organization: one(organizations, {
		fields: [leadStrategies.orgId],
		references: [organizations.id]
	}),
	userProfile_updatedBy: one(userProfiles, {
		fields: [leadStrategies.updatedBy],
		references: [userProfiles.id],
		relationName: "leadStrategies_updatedBy_userProfiles_id"
	}),
}));

export const talkingPointTemplatesRelations = relations(talkingPointTemplates, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [talkingPointTemplates.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [talkingPointTemplates.orgId],
		references: [organizations.id]
	}),
}));

export const payrollItemsRelations = relations(payrollItems, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [payrollItems.employeeId],
		references: [userProfiles.id]
	}),
	payrollRun: one(payrollRuns, {
		fields: [payrollItems.payrollRunId],
		references: [payrollRuns.id]
	}),
}));

export const payrollRunsRelations = relations(payrollRuns, ({one, many}) => ({
	payrollItems: many(payrollItems),
	userProfile_approvedBy: one(userProfiles, {
		fields: [payrollRuns.approvedBy],
		references: [userProfiles.id],
		relationName: "payrollRuns_approvedBy_userProfiles_id"
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [payrollRuns.createdBy],
		references: [userProfiles.id],
		relationName: "payrollRuns_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [payrollRuns.orgId],
		references: [organizations.id]
	}),
}));

export const timeAttendanceRelations = relations(timeAttendance, ({one}) => ({
	userProfile_approvedBy: one(userProfiles, {
		fields: [timeAttendance.approvedBy],
		references: [userProfiles.id],
		relationName: "timeAttendance_approvedBy_userProfiles_id"
	}),
	userProfile_employeeId: one(userProfiles, {
		fields: [timeAttendance.employeeId],
		references: [userProfiles.id],
		relationName: "timeAttendance_employeeId_userProfiles_id"
	}),
}));

export const performanceReviewsRelations = relations(performanceReviews, ({one}) => ({
	userProfile_employeeId: one(userProfiles, {
		fields: [performanceReviews.employeeId],
		references: [userProfiles.id],
		relationName: "performanceReviews_employeeId_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [performanceReviews.orgId],
		references: [organizations.id]
	}),
	userProfile_reviewerId: one(userProfiles, {
		fields: [performanceReviews.reviewerId],
		references: [userProfiles.id],
		relationName: "performanceReviews_reviewerId_userProfiles_id"
	}),
}));

export const importJobsRelations = relations(importJobs, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [importJobs.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [importJobs.orgId],
		references: [organizations.id]
	}),
}));

export const exportJobsRelations = relations(exportJobs, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [exportJobs.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [exportJobs.orgId],
		references: [organizations.id]
	}),
}));

export const gdprRequestsRelations = relations(gdprRequests, ({one}) => ({
	userProfile_createdBy: one(userProfiles, {
		fields: [gdprRequests.createdBy],
		references: [userProfiles.id],
		relationName: "gdprRequests_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [gdprRequests.orgId],
		references: [organizations.id]
	}),
	userProfile_processedBy: one(userProfiles, {
		fields: [gdprRequests.processedBy],
		references: [userProfiles.id],
		relationName: "gdprRequests_processedBy_userProfiles_id"
	}),
}));

export const duplicateRecordsRelations = relations(duplicateRecords, ({one}) => ({
	organization: one(organizations, {
		fields: [duplicateRecords.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [duplicateRecords.reviewedBy],
		references: [userProfiles.id]
	}),
}));

export const duplicateRulesRelations = relations(duplicateRules, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [duplicateRules.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [duplicateRules.orgId],
		references: [organizations.id]
	}),
}));

export const archivedRecordsRelations = relations(archivedRecords, ({one}) => ({
	userProfile_archivedBy: one(userProfiles, {
		fields: [archivedRecords.archivedBy],
		references: [userProfiles.id],
		relationName: "archivedRecords_archivedBy_userProfiles_id"
	}),
	userProfile_deletedBy: one(userProfiles, {
		fields: [archivedRecords.deletedBy],
		references: [userProfiles.id],
		relationName: "archivedRecords_deletedBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [archivedRecords.orgId],
		references: [organizations.id]
	}),
	userProfile_restoredBy: one(userProfiles, {
		fields: [archivedRecords.restoredBy],
		references: [userProfiles.id],
		relationName: "archivedRecords_restoredBy_userProfiles_id"
	}),
}));

export const retentionPoliciesRelations = relations(retentionPolicies, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [retentionPolicies.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [retentionPolicies.orgId],
		references: [organizations.id]
	}),
}));

export const candidateResumesRelations = relations(candidateResumes, ({one, many}) => ({
	userProfile_archivedBy: one(userProfiles, {
		fields: [candidateResumes.archivedBy],
		references: [userProfiles.id],
		relationName: "candidateResumes_archivedBy_userProfiles_id"
	}),
	userProfile_candidateId: one(userProfiles, {
		fields: [candidateResumes.candidateId],
		references: [userProfiles.id],
		relationName: "candidateResumes_candidateId_userProfiles_id"
	}),
	contact: one(contacts, {
		fields: [candidateResumes.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [candidateResumes.orgId],
		references: [organizations.id]
	}),
	candidateResume: one(candidateResumes, {
		fields: [candidateResumes.previousVersionId],
		references: [candidateResumes.id],
		relationName: "candidateResumes_previousVersionId_candidateResumes_id"
	}),
	candidateResumes: many(candidateResumes, {
		relationName: "candidateResumes_previousVersionId_candidateResumes_id"
	}),
	userProfile_uploadedBy: one(userProfiles, {
		fields: [candidateResumes.uploadedBy],
		references: [userProfiles.id],
		relationName: "candidateResumes_uploadedBy_userProfiles_id"
	}),
}));

export const candidateBackgroundChecksRelations = relations(candidateBackgroundChecks, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [candidateBackgroundChecks.candidateId],
		references: [userProfiles.id]
	}),
	contact: one(contacts, {
		fields: [candidateBackgroundChecks.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [candidateBackgroundChecks.orgId],
		references: [organizations.id]
	}),
	placement: one(placements, {
		fields: [candidateBackgroundChecks.placementId],
		references: [placements.id]
	}),
	submission: one(submissions, {
		fields: [candidateBackgroundChecks.submissionId],
		references: [submissions.id]
	}),
}));

export const placementsRelations = relations(placements, ({one, many}) => ({
	candidateBackgroundChecks: many(candidateBackgroundChecks),
	candidateComplianceDocuments: many(candidateComplianceDocuments),
	placementTimesheets: many(placementTimesheets),
	placementMilestones: many(placementMilestones),
	placementExtensions: many(placementExtensions),
	placementRates: many(placementRates),
	submissions: many(submissions, {
		relationName: "submissions_placementId_placements_id"
	}),
	userProfile_accountManagerId: one(userProfiles, {
		fields: [placements.accountManagerId],
		references: [userProfiles.id],
		relationName: "placements_accountManagerId_userProfiles_id"
	}),
	userProfile_approvedBy: one(userProfiles, {
		fields: [placements.approvedBy],
		references: [userProfiles.id],
		relationName: "placements_approvedBy_userProfiles_id"
	}),
	company_billingCompanyId: one(companies, {
		fields: [placements.billingCompanyId],
		references: [companies.id],
		relationName: "placements_billingCompanyId_companies_id"
	}),
	userProfile_candidateId: one(userProfiles, {
		fields: [placements.candidateId],
		references: [userProfiles.id],
		relationName: "placements_candidateId_userProfiles_id"
	}),
	company_clientCompanyId: one(companies, {
		fields: [placements.clientCompanyId],
		references: [companies.id],
		relationName: "placements_clientCompanyId_companies_id"
	}),
	contact_clientManagerContactId: one(contacts, {
		fields: [placements.clientManagerContactId],
		references: [contacts.id],
		relationName: "placements_clientManagerContactId_contacts_id"
	}),
	company_companyId: one(companies, {
		fields: [placements.companyId],
		references: [companies.id],
		relationName: "placements_companyId_companies_id"
	}),
	contact_contactId: one(contacts, {
		fields: [placements.contactId],
		references: [contacts.id],
		relationName: "placements_contactId_contacts_id"
	}),
	contract: one(contracts, {
		fields: [placements.contractId],
		references: [contracts.id]
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [placements.createdBy],
		references: [userProfiles.id],
		relationName: "placements_createdBy_userProfiles_id"
	}),
	company_endClientCompanyId: one(companies, {
		fields: [placements.endClientCompanyId],
		references: [companies.id],
		relationName: "placements_endClientCompanyId_companies_id"
	}),
	contact_hrContactId: one(contacts, {
		fields: [placements.hrContactId],
		references: [contacts.id],
		relationName: "placements_hrContactId_contacts_id"
	}),
	job: one(jobs, {
		fields: [placements.jobId],
		references: [jobs.id]
	}),
	userProfile_lastCheckInBy: one(userProfiles, {
		fields: [placements.lastCheckInBy],
		references: [userProfiles.id],
		relationName: "placements_lastCheckInBy_userProfiles_id"
	}),
	offer: one(offers, {
		fields: [placements.offerId],
		references: [offers.id]
	}),
	organization: one(organizations, {
		fields: [placements.orgId],
		references: [organizations.id]
	}),
	rateCard: one(rateCards, {
		fields: [placements.rateCardId],
		references: [rateCards.id]
	}),
	rateCardItem: one(rateCardItems, {
		fields: [placements.rateCardItemId],
		references: [rateCardItems.id]
	}),
	userProfile_recruiterId: one(userProfiles, {
		fields: [placements.recruiterId],
		references: [userProfiles.id],
		relationName: "placements_recruiterId_userProfiles_id"
	}),
	contact_reportingManagerContactId: one(contacts, {
		fields: [placements.reportingManagerContactId],
		references: [contacts.id],
		relationName: "placements_reportingManagerContactId_contacts_id"
	}),
	submission: one(submissions, {
		fields: [placements.submissionId],
		references: [submissions.id],
		relationName: "placements_submissionId_submissions_id"
	}),
	company_vendorCompanyId: one(companies, {
		fields: [placements.vendorCompanyId],
		references: [companies.id],
		relationName: "placements_vendorCompanyId_companies_id"
	}),
	address: one(addresses, {
		fields: [placements.workAddressId],
		references: [addresses.id]
	}),
	placementVendors: many(placementVendors),
	placementChangeOrders: many(placementChangeOrders),
	placementCheckins: many(placementCheckins),
	invoiceLineItems: many(invoiceLineItems),
	timesheets: many(timesheets),
}));

export const submissionsRelations = relations(submissions, ({one, many}) => ({
	candidateBackgroundChecks: many(candidateBackgroundChecks),
	candidateComplianceDocuments: many(candidateComplianceDocuments),
	submissionRates: many(submissionRates),
	submissionScreeningAnswers: many(submissionScreeningAnswers),
	submissionNotes: many(submissionNotes),
	submissionStatusHistories: many(submissionStatusHistory),
	submissionFeedbacks: many(submissionFeedback),
	submissionRtrs: many(submissionRtr),
	candidateScreenings: many(candidateScreenings),
	offers: many(offers, {
		relationName: "offers_submissionId_submissions_id"
	}),
	userProfile_candidateId: one(userProfiles, {
		fields: [submissions.candidateId],
		references: [userProfiles.id],
		relationName: "submissions_candidateId_userProfiles_id"
	}),
	company_companyId: one(companies, {
		fields: [submissions.companyId],
		references: [companies.id],
		relationName: "submissions_companyId_companies_id"
	}),
	contact_contactId: one(contacts, {
		fields: [submissions.contactId],
		references: [contacts.id],
		relationName: "submissions_contactId_contacts_id"
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [submissions.createdBy],
		references: [userProfiles.id],
		relationName: "submissions_createdBy_userProfiles_id"
	}),
	submission: one(submissions, {
		fields: [submissions.duplicateOfSubmissionId],
		references: [submissions.id],
		relationName: "submissions_duplicateOfSubmissionId_submissions_id"
	}),
	submissions: many(submissions, {
		relationName: "submissions_duplicateOfSubmissionId_submissions_id"
	}),
	job: one(jobs, {
		fields: [submissions.jobId],
		references: [jobs.id]
	}),
	offer: one(offers, {
		fields: [submissions.offerId],
		references: [offers.id],
		relationName: "submissions_offerId_offers_id"
	}),
	organization: one(organizations, {
		fields: [submissions.orgId],
		references: [organizations.id]
	}),
	userProfile_ownerId: one(userProfiles, {
		fields: [submissions.ownerId],
		references: [userProfiles.id],
		relationName: "submissions_ownerId_userProfiles_id"
	}),
	placement: one(placements, {
		fields: [submissions.placementId],
		references: [placements.id],
		relationName: "submissions_placementId_placements_id"
	}),
	rateCard: one(rateCards, {
		fields: [submissions.rateCardId],
		references: [rateCards.id]
	}),
	rateCardItem: one(rateCardItems, {
		fields: [submissions.rateCardItemId],
		references: [rateCardItems.id]
	}),
	document: one(documents, {
		fields: [submissions.rtrDocumentId],
		references: [documents.id]
	}),
	company_submittedByCompanyId: one(companies, {
		fields: [submissions.submittedByCompanyId],
		references: [companies.id],
		relationName: "submissions_submittedByCompanyId_companies_id"
	}),
	contact_submittedByContactId: one(contacts, {
		fields: [submissions.submittedByContactId],
		references: [contacts.id],
		relationName: "submissions_submittedByContactId_contacts_id"
	}),
	userProfile_submittedToClientBy: one(userProfiles, {
		fields: [submissions.submittedToClientBy],
		references: [userProfiles.id],
		relationName: "submissions_submittedToClientBy_userProfiles_id"
	}),
	userProfile_vendorDecisionBy: one(userProfiles, {
		fields: [submissions.vendorDecisionBy],
		references: [userProfiles.id],
		relationName: "submissions_vendorDecisionBy_userProfiles_id"
	}),
	userProfile_vendorSubmittedBy: one(userProfiles, {
		fields: [submissions.vendorSubmittedBy],
		references: [userProfiles.id],
		relationName: "submissions_vendorSubmittedBy_userProfiles_id"
	}),
	interviews: many(interviews),
	placements: many(placements, {
		relationName: "placements_submissionId_submissions_id"
	}),
}));

export const candidateCertificationsRelations = relations(candidateCertifications, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [candidateCertifications.candidateId],
		references: [userProfiles.id]
	}),
	contact: one(contacts, {
		fields: [candidateCertifications.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [candidateCertifications.orgId],
		references: [organizations.id]
	}),
}));

export const candidateComplianceDocumentsRelations = relations(candidateComplianceDocuments, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [candidateComplianceDocuments.candidateId],
		references: [userProfiles.id]
	}),
	contact: one(contacts, {
		fields: [candidateComplianceDocuments.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [candidateComplianceDocuments.orgId],
		references: [organizations.id]
	}),
	placement: one(placements, {
		fields: [candidateComplianceDocuments.placementId],
		references: [placements.id]
	}),
	submission: one(submissions, {
		fields: [candidateComplianceDocuments.submissionId],
		references: [submissions.id]
	}),
}));

export const objectOwnersRelations = relations(objectOwners, ({one, many}) => ({
	userProfile_assignedBy: one(userProfiles, {
		fields: [objectOwners.assignedBy],
		references: [userProfiles.id],
		relationName: "objectOwners_assignedBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [objectOwners.orgId],
		references: [organizations.id]
	}),
	userProfile_userId: one(userProfiles, {
		fields: [objectOwners.userId],
		references: [userProfiles.id],
		relationName: "objectOwners_userId_userProfiles_id"
	}),
	raciChangeLogs: many(raciChangeLog),
}));

export const candidateEducationRelations = relations(candidateEducation, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [candidateEducation.candidateId],
		references: [userProfiles.id]
	}),
	contact: one(contacts, {
		fields: [candidateEducation.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [candidateEducation.orgId],
		references: [organizations.id]
	}),
}));

export const candidateReferencesRelations = relations(candidateReferences, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [candidateReferences.candidateId],
		references: [userProfiles.id]
	}),
	contact: one(contacts, {
		fields: [candidateReferences.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [candidateReferences.orgId],
		references: [organizations.id]
	}),
}));

export const candidateWorkAuthorizationsRelations = relations(candidateWorkAuthorizations, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [candidateWorkAuthorizations.candidateId],
		references: [userProfiles.id]
	}),
	contact: one(contacts, {
		fields: [candidateWorkAuthorizations.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [candidateWorkAuthorizations.orgId],
		references: [organizations.id]
	}),
}));

export const podMembersRelations = relations(podMembers, ({one}) => ({
	organization: one(organizations, {
		fields: [podMembers.orgId],
		references: [organizations.id]
	}),
	pod: one(pods, {
		fields: [podMembers.podId],
		references: [pods.id]
	}),
	userProfile: one(userProfiles, {
		fields: [podMembers.userId],
		references: [userProfiles.id]
	}),
}));

export const jobSkillsRelations = relations(jobSkills, ({one}) => ({
	job: one(jobs, {
		fields: [jobSkills.jobId],
		references: [jobs.id]
	}),
	organization: one(organizations, {
		fields: [jobSkills.orgId],
		references: [organizations.id]
	}),
	skill: one(skills, {
		fields: [jobSkills.skillId],
		references: [skills.id]
	}),
}));

export const jobsRelations = relations(jobs, ({one, many}) => ({
	jobSkills: many(jobSkills),
	jobRequirements: many(jobRequirements),
	jobRates: many(jobRates),
	jobAssignments: many(jobAssignments),
	jobScreeningQuestions: many(jobScreeningQuestions),
	jobStatusHistories: many(jobStatusHistory),
	candidatePreparedProfiles: many(candidatePreparedProfiles),
	candidateScreenings: many(candidateScreenings),
	offers: many(offers),
	company_clientCompanyId: one(companies, {
		fields: [jobs.clientCompanyId],
		references: [companies.id],
		relationName: "jobs_clientCompanyId_companies_id"
	}),
	userProfile_closedBy: one(userProfiles, {
		fields: [jobs.closedBy],
		references: [userProfiles.id],
		relationName: "jobs_closedBy_userProfiles_id"
	}),
	company_companyId: one(companies, {
		fields: [jobs.companyId],
		references: [companies.id],
		relationName: "jobs_companyId_companies_id"
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [jobs.createdBy],
		references: [userProfiles.id],
		relationName: "jobs_createdBy_userProfiles_id"
	}),
	deal: one(deals, {
		fields: [jobs.dealId],
		references: [deals.id]
	}),
	company_endClientCompanyId: one(companies, {
		fields: [jobs.endClientCompanyId],
		references: [companies.id],
		relationName: "jobs_endClientCompanyId_companies_id"
	}),
	contact_hiringManagerContactId: one(contacts, {
		fields: [jobs.hiringManagerContactId],
		references: [contacts.id],
		relationName: "jobs_hiringManagerContactId_contacts_id"
	}),
	contact_hrContactId: one(contacts, {
		fields: [jobs.hrContactId],
		references: [contacts.id],
		relationName: "jobs_hrContactId_contacts_id"
	}),
	userProfile_intakeCompletedBy: one(userProfiles, {
		fields: [jobs.intakeCompletedBy],
		references: [userProfiles.id],
		relationName: "jobs_intakeCompletedBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [jobs.orgId],
		references: [organizations.id]
	}),
	userProfile_ownerId: one(userProfiles, {
		fields: [jobs.ownerId],
		references: [userProfiles.id],
		relationName: "jobs_ownerId_userProfiles_id"
	}),
	userProfile_publishedBy: one(userProfiles, {
		fields: [jobs.publishedBy],
		references: [userProfiles.id],
		relationName: "jobs_publishedBy_userProfiles_id"
	}),
	company_vendorCompanyId: one(companies, {
		fields: [jobs.vendorCompanyId],
		references: [companies.id],
		relationName: "jobs_vendorCompanyId_companies_id"
	}),
	submissions: many(submissions),
	interviews: many(interviews),
	placements: many(placements),
}));

export const jobRequirementsRelations = relations(jobRequirements, ({one}) => ({
	job: one(jobs, {
		fields: [jobRequirements.jobId],
		references: [jobs.id]
	}),
	organization: one(organizations, {
		fields: [jobRequirements.orgId],
		references: [organizations.id]
	}),
}));

export const jobRatesRelations = relations(jobRates, ({one}) => ({
	job: one(jobs, {
		fields: [jobRates.jobId],
		references: [jobs.id]
	}),
	organization: one(organizations, {
		fields: [jobRates.orgId],
		references: [organizations.id]
	}),
}));

export const jobAssignmentsRelations = relations(jobAssignments, ({one}) => ({
	job: one(jobs, {
		fields: [jobAssignments.jobId],
		references: [jobs.id]
	}),
	organization: one(organizations, {
		fields: [jobAssignments.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [jobAssignments.userId],
		references: [userProfiles.id]
	}),
}));

export const jobScreeningQuestionsRelations = relations(jobScreeningQuestions, ({one, many}) => ({
	job: one(jobs, {
		fields: [jobScreeningQuestions.jobId],
		references: [jobs.id]
	}),
	organization: one(organizations, {
		fields: [jobScreeningQuestions.orgId],
		references: [organizations.id]
	}),
	submissionScreeningAnswers: many(submissionScreeningAnswers),
}));

export const candidateDocumentsRelations = relations(candidateDocuments, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [candidateDocuments.candidateId],
		references: [userProfiles.id]
	}),
	contact: one(contacts, {
		fields: [candidateDocuments.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [candidateDocuments.orgId],
		references: [organizations.id]
	}),
}));

export const candidateProfilesRelations = relations(candidateProfiles, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [candidateProfiles.candidateId],
		references: [userProfiles.id]
	}),
	contact: one(contacts, {
		fields: [candidateProfiles.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [candidateProfiles.orgId],
		references: [organizations.id]
	}),
}));

export const candidatePreferencesRelations = relations(candidatePreferences, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [candidatePreferences.candidateId],
		references: [userProfiles.id]
	}),
	contact: one(contacts, {
		fields: [candidatePreferences.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [candidatePreferences.orgId],
		references: [organizations.id]
	}),
}));

export const candidateAvailabilityRelations = relations(candidateAvailability, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [candidateAvailability.candidateId],
		references: [userProfiles.id]
	}),
	contact: one(contacts, {
		fields: [candidateAvailability.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [candidateAvailability.orgId],
		references: [organizations.id]
	}),
}));

export const submissionRatesRelations = relations(submissionRates, ({one}) => ({
	organization: one(organizations, {
		fields: [submissionRates.orgId],
		references: [organizations.id]
	}),
	submission: one(submissions, {
		fields: [submissionRates.submissionId],
		references: [submissions.id]
	}),
}));

export const submissionScreeningAnswersRelations = relations(submissionScreeningAnswers, ({one}) => ({
	organization: one(organizations, {
		fields: [submissionScreeningAnswers.orgId],
		references: [organizations.id]
	}),
	jobScreeningQuestion: one(jobScreeningQuestions, {
		fields: [submissionScreeningAnswers.questionId],
		references: [jobScreeningQuestions.id]
	}),
	submission: one(submissions, {
		fields: [submissionScreeningAnswers.submissionId],
		references: [submissions.id]
	}),
}));

export const submissionNotesRelations = relations(submissionNotes, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [submissionNotes.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [submissionNotes.orgId],
		references: [organizations.id]
	}),
	submission: one(submissions, {
		fields: [submissionNotes.submissionId],
		references: [submissions.id]
	}),
}));

export const marketingTemplatesRelations = relations(marketingTemplates, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [marketingTemplates.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [marketingTemplates.orgId],
		references: [organizations.id]
	}),
}));

export const hotlistConsultantsRelations = relations(hotlistConsultants, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [hotlistConsultants.addedBy],
		references: [userProfiles.id]
	}),
	benchConsultant: one(benchConsultants, {
		fields: [hotlistConsultants.consultantId],
		references: [benchConsultants.id]
	}),
}));

export const benchConsultantsRelations = relations(benchConsultants, ({one, many}) => ({
	hotlistConsultants: many(hotlistConsultants),
	consultantVisaDetails: many(consultantVisaDetails),
	consultantWorkAuthorizations: many(consultantWorkAuthorization),
	consultantAvailabilities: many(consultantAvailability),
	consultantRates: many(consultantRates),
	marketingProfiles: many(marketingProfiles),
	immigrationAlerts: many(immigrationAlerts),
	externalJobOrderSubmissions: many(externalJobOrderSubmissions),
	userProfile_benchSalesRepId: one(userProfiles, {
		fields: [benchConsultants.benchSalesRepId],
		references: [userProfiles.id],
		relationName: "benchConsultants_benchSalesRepId_userProfiles_id"
	}),
	userProfile_candidateId: one(userProfiles, {
		fields: [benchConsultants.candidateId],
		references: [userProfiles.id],
		relationName: "benchConsultants_candidateId_userProfiles_id"
	}),
	contact: one(contacts, {
		fields: [benchConsultants.contactId],
		references: [contacts.id]
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [benchConsultants.createdBy],
		references: [userProfiles.id],
		relationName: "benchConsultants_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [benchConsultants.orgId],
		references: [organizations.id]
	}),
}));

export const skillAliasesRelations = relations(skillAliases, ({one}) => ({
	organization: one(organizations, {
		fields: [skillAliases.orgId],
		references: [organizations.id]
	}),
	skill: one(skills, {
		fields: [skillAliases.skillId],
		references: [skills.id]
	}),
}));

export const submissionStatusHistoryRelations = relations(submissionStatusHistory, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [submissionStatusHistory.changedBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [submissionStatusHistory.orgId],
		references: [organizations.id]
	}),
	submission: one(submissions, {
		fields: [submissionStatusHistory.submissionId],
		references: [submissions.id]
	}),
}));

export const interviewFeedbackRelations = relations(interviewFeedback, ({one}) => ({
	interview: one(interviews, {
		fields: [interviewFeedback.interviewId],
		references: [interviews.id]
	}),
	organization: one(organizations, {
		fields: [interviewFeedback.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [interviewFeedback.submittedBy],
		references: [userProfiles.id]
	}),
}));

export const interviewsRelations = relations(interviews, ({one, many}) => ({
	interviewFeedbacks: many(interviewFeedback),
	interviewReminders: many(interviewReminders),
	submissionFeedbacks: many(submissionFeedback),
	userProfile_cancelledBy: one(userProfiles, {
		fields: [interviews.cancelledBy],
		references: [userProfiles.id],
		relationName: "interviews_cancelledBy_userProfiles_id"
	}),
	userProfile_candidateId: one(userProfiles, {
		fields: [interviews.candidateId],
		references: [userProfiles.id],
		relationName: "interviews_candidateId_userProfiles_id"
	}),
	userProfile_confirmedBy: one(userProfiles, {
		fields: [interviews.confirmedBy],
		references: [userProfiles.id],
		relationName: "interviews_confirmedBy_userProfiles_id"
	}),
	contact_contactId: one(contacts, {
		fields: [interviews.contactId],
		references: [contacts.id],
		relationName: "interviews_contactId_contacts_id"
	}),
	contact_coordinatorContactId: one(contacts, {
		fields: [interviews.coordinatorContactId],
		references: [contacts.id],
		relationName: "interviews_coordinatorContactId_contacts_id"
	}),
	job: one(jobs, {
		fields: [interviews.jobId],
		references: [jobs.id]
	}),
	organization: one(organizations, {
		fields: [interviews.orgId],
		references: [organizations.id]
	}),
	userProfile_prepCompletedBy: one(userProfiles, {
		fields: [interviews.prepCompletedBy],
		references: [userProfiles.id],
		relationName: "interviews_prepCompletedBy_userProfiles_id"
	}),
	contact_primaryInterviewerContactId: one(contacts, {
		fields: [interviews.primaryInterviewerContactId],
		references: [contacts.id],
		relationName: "interviews_primaryInterviewerContactId_contacts_id"
	}),
	userProfile_rescheduledBy: one(userProfiles, {
		fields: [interviews.rescheduledBy],
		references: [userProfiles.id],
		relationName: "interviews_rescheduledBy_userProfiles_id"
	}),
	userProfile_scheduledBy: one(userProfiles, {
		fields: [interviews.scheduledBy],
		references: [userProfiles.id],
		relationName: "interviews_scheduledBy_userProfiles_id"
	}),
	submission: one(submissions, {
		fields: [interviews.submissionId],
		references: [submissions.id]
	}),
	userProfile_submittedBy: one(userProfiles, {
		fields: [interviews.submittedBy],
		references: [userProfiles.id],
		relationName: "interviews_submittedBy_userProfiles_id"
	}),
	interviewParticipants: many(interviewParticipants),
	interviewScorecards: many(interviewScorecards),
}));

export const interviewRemindersRelations = relations(interviewReminders, ({one}) => ({
	interview: one(interviews, {
		fields: [interviewReminders.interviewId],
		references: [interviews.id]
	}),
	organization: one(organizations, {
		fields: [interviewReminders.orgId],
		references: [organizations.id]
	}),
}));

export const offerTermsRelations = relations(offerTerms, ({one}) => ({
	offer: one(offers, {
		fields: [offerTerms.offerId],
		references: [offers.id]
	}),
	organization: one(organizations, {
		fields: [offerTerms.orgId],
		references: [organizations.id]
	}),
}));

export const offersRelations = relations(offers, ({one, many}) => ({
	offerTerms: many(offerTerms),
	userProfile_acceptedBy: one(userProfiles, {
		fields: [offers.acceptedBy],
		references: [userProfiles.id],
		relationName: "offers_acceptedBy_userProfiles_id"
	}),
	userProfile_candidateId: one(userProfiles, {
		fields: [offers.candidateId],
		references: [userProfiles.id],
		relationName: "offers_candidateId_userProfiles_id"
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [offers.createdBy],
		references: [userProfiles.id],
		relationName: "offers_createdBy_userProfiles_id"
	}),
	job: one(jobs, {
		fields: [offers.jobId],
		references: [jobs.id]
	}),
	organization: one(organizations, {
		fields: [offers.orgId],
		references: [organizations.id]
	}),
	userProfile_sentBy: one(userProfiles, {
		fields: [offers.sentBy],
		references: [userProfiles.id],
		relationName: "offers_sentBy_userProfiles_id"
	}),
	submission: one(submissions, {
		fields: [offers.submissionId],
		references: [submissions.id],
		relationName: "offers_submissionId_submissions_id"
	}),
	offerNegotiations: many(offerNegotiations),
	offerApprovals: many(offerApprovals),
	submissions: many(submissions, {
		relationName: "submissions_offerId_offers_id"
	}),
	placements: many(placements),
}));

export const placementTimesheetsRelations = relations(placementTimesheets, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [placementTimesheets.approvedBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [placementTimesheets.orgId],
		references: [organizations.id]
	}),
	placement: one(placements, {
		fields: [placementTimesheets.placementId],
		references: [placements.id]
	}),
}));

export const consultantVisaDetailsRelations = relations(consultantVisaDetails, ({one}) => ({
	benchConsultant: one(benchConsultants, {
		fields: [consultantVisaDetails.consultantId],
		references: [benchConsultants.id]
	}),
}));

export const consultantWorkAuthorizationRelations = relations(consultantWorkAuthorization, ({one}) => ({
	benchConsultant: one(benchConsultants, {
		fields: [consultantWorkAuthorization.consultantId],
		references: [benchConsultants.id]
	}),
	userProfile: one(userProfiles, {
		fields: [consultantWorkAuthorization.verifiedBy],
		references: [userProfiles.id]
	}),
}));

export const consultantAvailabilityRelations = relations(consultantAvailability, ({one}) => ({
	benchConsultant: one(benchConsultants, {
		fields: [consultantAvailability.consultantId],
		references: [benchConsultants.id]
	}),
}));

export const consultantRatesRelations = relations(consultantRates, ({one}) => ({
	benchConsultant: one(benchConsultants, {
		fields: [consultantRates.consultantId],
		references: [benchConsultants.id]
	}),
	userProfile: one(userProfiles, {
		fields: [consultantRates.createdBy],
		references: [userProfiles.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	candidates_createdBy: many(candidates, {
		relationName: "candidates_createdBy_usersInAuth_id"
	}),
	candidates_hotlistAddedBy: many(candidates, {
		relationName: "candidates_hotlistAddedBy_usersInAuth_id"
	}),
	candidates_ownerId: many(candidates, {
		relationName: "candidates_ownerId_usersInAuth_id"
	}),
	candidates_sourcedBy: many(candidates, {
		relationName: "candidates_sourcedBy_usersInAuth_id"
	}),
	candidates_updatedBy: many(candidates, {
		relationName: "candidates_updatedBy_usersInAuth_id"
	}),
}));

export const marketingProfilesRelations = relations(marketingProfiles, ({one, many}) => ({
	benchConsultant: one(benchConsultants, {
		fields: [marketingProfiles.consultantId],
		references: [benchConsultants.id]
	}),
	userProfile: one(userProfiles, {
		fields: [marketingProfiles.createdBy],
		references: [userProfiles.id]
	}),
	marketingFormats: many(marketingFormats),
}));

export const marketingFormatsRelations = relations(marketingFormats, ({one}) => ({
	marketingProfile: one(marketingProfiles, {
		fields: [marketingFormats.profileId],
		references: [marketingProfiles.id]
	}),
}));

export const vendorRelationshipsRelations = relations(vendorRelationships, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [vendorRelationships.createdBy],
		references: [userProfiles.id]
	}),
}));

export const vendorBlacklistRelations = relations(vendorBlacklist, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [vendorBlacklist.blacklistedBy],
		references: [userProfiles.id]
	}),
}));

export const companyTeamRelations = relations(companyTeam, ({one}) => ({
	userProfile_assignedBy: one(userProfiles, {
		fields: [companyTeam.assignedBy],
		references: [userProfiles.id],
		relationName: "companyTeam_assignedBy_userProfiles_id"
	}),
	company: one(companies, {
		fields: [companyTeam.companyId],
		references: [companies.id]
	}),
	organization: one(organizations, {
		fields: [companyTeam.orgId],
		references: [organizations.id]
	}),
	userProfile_removedBy: one(userProfiles, {
		fields: [companyTeam.removedBy],
		references: [userProfiles.id],
		relationName: "companyTeam_removedBy_userProfiles_id"
	}),
	userProfile_userId: one(userProfiles, {
		fields: [companyTeam.userId],
		references: [userProfiles.id],
		relationName: "companyTeam_userId_userProfiles_id"
	}),
}));

export const companyContactsRelations = relations(companyContacts, ({one}) => ({
	company_companyId: one(companies, {
		fields: [companyContacts.companyId],
		references: [companies.id],
		relationName: "companyContacts_companyId_companies_id"
	}),
	userProfile: one(userProfiles, {
		fields: [companyContacts.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [companyContacts.orgId],
		references: [organizations.id]
	}),
	company_vendorCompanyId: one(companies, {
		fields: [companyContacts.vendorCompanyId],
		references: [companies.id],
		relationName: "companyContacts_vendorCompanyId_companies_id"
	}),
}));

export const companyRelationshipsRelations = relations(companyRelationships, ({one}) => ({
	company_companyAId: one(companies, {
		fields: [companyRelationships.companyAId],
		references: [companies.id],
		relationName: "companyRelationships_companyAId_companies_id"
	}),
	company_companyBId: one(companies, {
		fields: [companyRelationships.companyBId],
		references: [companies.id],
		relationName: "companyRelationships_companyBId_companies_id"
	}),
	userProfile: one(userProfiles, {
		fields: [companyRelationships.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [companyRelationships.orgId],
		references: [organizations.id]
	}),
}));

export const immigrationAttorneysRelations = relations(immigrationAttorneys, ({one}) => ({
	organization: one(organizations, {
		fields: [immigrationAttorneys.orgId],
		references: [organizations.id]
	}),
}));

export const immigrationDocumentsRelations = relations(immigrationDocuments, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [immigrationDocuments.verifiedBy],
		references: [userProfiles.id]
	}),
}));

export const immigrationAlertsRelations = relations(immigrationAlerts, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [immigrationAlerts.acknowledgedBy],
		references: [userProfiles.id]
	}),
	benchConsultant: one(benchConsultants, {
		fields: [immigrationAlerts.consultantId],
		references: [benchConsultants.id]
	}),
}));

export const companyAddressesRelations = relations(companyAddresses, ({one}) => ({
	company: one(companies, {
		fields: [companyAddresses.companyId],
		references: [companies.id]
	}),
	organization: one(organizations, {
		fields: [companyAddresses.orgId],
		references: [organizations.id]
	}),
}));

export const companyNotesRelations = relations(companyNotes, ({one}) => ({
	company: one(companies, {
		fields: [companyNotes.companyId],
		references: [companies.id]
	}),
	userProfile: one(userProfiles, {
		fields: [companyNotes.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [companyNotes.orgId],
		references: [organizations.id]
	}),
}));

export const externalJobOrderSubmissionsRelations = relations(externalJobOrderSubmissions, ({one}) => ({
	benchConsultant: one(benchConsultants, {
		fields: [externalJobOrderSubmissions.consultantId],
		references: [benchConsultants.id]
	}),
	userProfile: one(userProfiles, {
		fields: [externalJobOrderSubmissions.createdBy],
		references: [userProfiles.id]
	}),
	externalJobOrder: one(externalJobOrders, {
		fields: [externalJobOrderSubmissions.orderId],
		references: [externalJobOrders.id]
	}),
}));

export const externalJobOrdersRelations = relations(externalJobOrders, ({one, many}) => ({
	externalJobOrderSubmissions: many(externalJobOrderSubmissions),
	company: one(companies, {
		fields: [externalJobOrders.vendorCompanyId],
		references: [companies.id]
	}),
	userProfile: one(userProfiles, {
		fields: [externalJobOrders.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [externalJobOrders.orgId],
		references: [organizations.id]
	}),
	externalJobOrderRequirements: many(externalJobOrderRequirements),
	externalJobOrderSkills: many(externalJobOrderSkills),
	externalJobOrderNotes: many(externalJobOrderNotes),
}));

export const companyPreferencesRelations = relations(companyPreferences, ({one}) => ({
	company: one(companies, {
		fields: [companyPreferences.companyId],
		references: [companies.id]
	}),
	organization: one(organizations, {
		fields: [companyPreferences.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [companyPreferences.updatedBy],
		references: [userProfiles.id]
	}),
}));

export const companyTagsRelations = relations(companyTags, ({one}) => ({
	company: one(companies, {
		fields: [companyTags.companyId],
		references: [companies.id]
	}),
	userProfile: one(userProfiles, {
		fields: [companyTags.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [companyTags.orgId],
		references: [organizations.id]
	}),
}));

export const benefitPlanOptionsRelations = relations(benefitPlanOptions, ({one, many}) => ({
	benefitPlan: one(benefitPlans, {
		fields: [benefitPlanOptions.planId],
		references: [benefitPlans.id]
	}),
	employeeBenefits: many(employeeBenefits),
}));

export const benefitPlansRelations = relations(benefitPlans, ({one, many}) => ({
	benefitPlanOptions: many(benefitPlanOptions),
	userProfile: one(userProfiles, {
		fields: [benefitPlans.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [benefitPlans.orgId],
		references: [organizations.id]
	}),
}));

export const integrationsRelations = relations(integrations, ({one, many}) => ({
	userProfile: one(userProfiles, {
		fields: [integrations.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [integrations.orgId],
		references: [organizations.id]
	}),
	integrationHealthLogs: many(integrationHealthLogs),
	integrationOauthTokens: many(integrationOauthTokens),
	integrationFailoverConfigs_backupIntegrationId: many(integrationFailoverConfig, {
		relationName: "integrationFailoverConfig_backupIntegrationId_integrations_id"
	}),
	integrationFailoverConfigs_primaryIntegrationId: many(integrationFailoverConfig, {
		relationName: "integrationFailoverConfig_primaryIntegrationId_integrations_id"
	}),
}));

export const integrationHealthLogsRelations = relations(integrationHealthLogs, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [integrationHealthLogs.checkedBy],
		references: [userProfiles.id]
	}),
	integration: one(integrations, {
		fields: [integrationHealthLogs.integrationId],
		references: [integrations.id]
	}),
	organization: one(organizations, {
		fields: [integrationHealthLogs.orgId],
		references: [organizations.id]
	}),
}));

export const dealStagesHistoryRelations = relations(dealStagesHistory, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [dealStagesHistory.changedBy],
		references: [userProfiles.id]
	}),
	deal: one(deals, {
		fields: [dealStagesHistory.dealId],
		references: [deals.id]
	}),
}));

export const dealStakeholdersRelations = relations(dealStakeholders, ({one}) => ({
	contact: one(contacts, {
		fields: [dealStakeholders.contactId],
		references: [contacts.id]
	}),
	deal: one(deals, {
		fields: [dealStakeholders.dealId],
		references: [deals.id]
	}),
}));

export const leadScoresRelations = relations(leadScores, ({one}) => ({
	lead: one(leads, {
		fields: [leadScores.leadId],
		references: [leads.id]
	}),
}));

export const leadQualificationRelations = relations(leadQualification, ({one}) => ({
	lead: one(leads, {
		fields: [leadQualification.leadId],
		references: [leads.id]
	}),
	userProfile: one(userProfiles, {
		fields: [leadQualification.qualifiedBy],
		references: [userProfiles.id]
	}),
}));

export const candidateWorkHistoryRelations = relations(candidateWorkHistory, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [candidateWorkHistory.candidateId],
		references: [userProfiles.id]
	}),
	contact: one(contacts, {
		fields: [candidateWorkHistory.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [candidateWorkHistory.orgId],
		references: [organizations.id]
	}),
}));

export const leadTouchpointsRelations = relations(leadTouchpoints, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [leadTouchpoints.createdBy],
		references: [userProfiles.id]
	}),
	lead: one(leads, {
		fields: [leadTouchpoints.leadId],
		references: [leads.id]
	}),
}));

export const dealCompetitorsRelations = relations(dealCompetitors, ({one}) => ({
	deal: one(deals, {
		fields: [dealCompetitors.dealId],
		references: [deals.id]
	}),
}));

export const dealProductsRelations = relations(dealProducts, ({one}) => ({
	deal: one(deals, {
		fields: [dealProducts.dealId],
		references: [deals.id]
	}),
}));

export const employeesRelations = relations(employees, ({one, many}) => ({
	userProfile_createdBy: one(userProfiles, {
		fields: [employees.createdBy],
		references: [userProfiles.id],
		relationName: "employees_createdBy_userProfiles_id"
	}),
	employee: one(employees, {
		fields: [employees.managerId],
		references: [employees.id],
		relationName: "employees_managerId_employees_id"
	}),
	employees: many(employees, {
		relationName: "employees_managerId_employees_id"
	}),
	organization: one(organizations, {
		fields: [employees.orgId],
		references: [organizations.id]
	}),
	userProfile_updatedBy: one(userProfiles, {
		fields: [employees.updatedBy],
		references: [userProfiles.id],
		relationName: "employees_updatedBy_userProfiles_id"
	}),
	userProfile_userId: one(userProfiles, {
		fields: [employees.userId],
		references: [userProfiles.id],
		relationName: "employees_userId_userProfiles_id"
	}),
	employeeProfiles: many(employeeProfiles),
	employeeDocuments: many(employeeDocuments),
	employeeTimeOffs: many(employeeTimeOff),
	employeeBenefits: many(employeeBenefits),
	employeeCompliances: many(employeeCompliance),
	i9Records: many(i9Records),
	performanceGoals: many(performanceGoals),
	contacts_alumniFormerEmployeeId: many(contacts, {
		relationName: "contacts_alumniFormerEmployeeId_employees_id"
	}),
	contacts_employeeId: many(contacts, {
		relationName: "contacts_employeeId_employees_id"
	}),
	employeeOnboardings: many(employeeOnboarding),
}));

export const employeeProfilesRelations = relations(employeeProfiles, ({one}) => ({
	employee: one(employees, {
		fields: [employeeProfiles.employeeId],
		references: [employees.id]
	}),
}));

export const employeeDocumentsRelations = relations(employeeDocuments, ({one}) => ({
	userProfile_createdBy: one(userProfiles, {
		fields: [employeeDocuments.createdBy],
		references: [userProfiles.id],
		relationName: "employeeDocuments_createdBy_userProfiles_id"
	}),
	employee: one(employees, {
		fields: [employeeDocuments.employeeId],
		references: [employees.id]
	}),
	userProfile_verifiedBy: one(userProfiles, {
		fields: [employeeDocuments.verifiedBy],
		references: [userProfiles.id],
		relationName: "employeeDocuments_verifiedBy_userProfiles_id"
	}),
}));

export const employeeTimeOffRelations = relations(employeeTimeOff, ({one}) => ({
	userProfile_approvedBy: one(userProfiles, {
		fields: [employeeTimeOff.approvedBy],
		references: [userProfiles.id],
		relationName: "employeeTimeOff_approvedBy_userProfiles_id"
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [employeeTimeOff.createdBy],
		references: [userProfiles.id],
		relationName: "employeeTimeOff_createdBy_userProfiles_id"
	}),
	employee: one(employees, {
		fields: [employeeTimeOff.employeeId],
		references: [employees.id]
	}),
}));

export const employeeBenefitsRelations = relations(employeeBenefits, ({one, many}) => ({
	userProfile: one(userProfiles, {
		fields: [employeeBenefits.createdBy],
		references: [userProfiles.id]
	}),
	employee: one(employees, {
		fields: [employeeBenefits.employeeId],
		references: [employees.id]
	}),
	benefitPlanOption: one(benefitPlanOptions, {
		fields: [employeeBenefits.planOptionId],
		references: [benefitPlanOptions.id]
	}),
	benefitDependents: many(benefitDependents),
}));

export const benefitDependentsRelations = relations(benefitDependents, ({one}) => ({
	employeeBenefit: one(employeeBenefits, {
		fields: [benefitDependents.employeeBenefitId],
		references: [employeeBenefits.id]
	}),
}));

export const raciChangeLogRelations = relations(raciChangeLog, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [raciChangeLog.changedBy],
		references: [userProfiles.id]
	}),
	objectOwner: one(objectOwners, {
		fields: [raciChangeLog.objectOwnerId],
		references: [objectOwners.id]
	}),
	organization: one(organizations, {
		fields: [raciChangeLog.orgId],
		references: [organizations.id]
	}),
}));

export const employeeComplianceRelations = relations(employeeCompliance, ({one}) => ({
	employee: one(employees, {
		fields: [employeeCompliance.employeeId],
		references: [employees.id]
	}),
	legacyComplianceRequirement: one(legacyComplianceRequirements, {
		fields: [employeeCompliance.requirementId],
		references: [legacyComplianceRequirements.id]
	}),
}));

export const legacyComplianceRequirementsRelations = relations(legacyComplianceRequirements, ({one, many}) => ({
	employeeCompliances: many(employeeCompliance),
	userProfile: one(userProfiles, {
		fields: [legacyComplianceRequirements.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [legacyComplianceRequirements.orgId],
		references: [organizations.id]
	}),
}));

export const i9RecordsRelations = relations(i9Records, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [i9Records.createdBy],
		references: [userProfiles.id]
	}),
	employee: one(employees, {
		fields: [i9Records.employeeId],
		references: [employees.id]
	}),
}));

export const performanceGoalsRelations = relations(performanceGoals, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [performanceGoals.createdBy],
		references: [userProfiles.id]
	}),
	employee: one(employees, {
		fields: [performanceGoals.employeeId],
		references: [employees.id]
	}),
}));

export const performanceFeedbackRelations = relations(performanceFeedback, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [performanceFeedback.createdBy],
		references: [userProfiles.id]
	}),
}));

export const patternChecklistItemsRelations = relations(patternChecklistItems, ({one, many}) => ({
	activityPattern: one(activityPatterns, {
		fields: [patternChecklistItems.patternId],
		references: [activityPatterns.id]
	}),
	activityChecklistItems: many(activityChecklistItems),
}));

export const activityPatternsRelations = relations(activityPatterns, ({one, many}) => ({
	patternChecklistItems: many(patternChecklistItems),
	activityPatternSuccessors_patternId: many(activityPatternSuccessors, {
		relationName: "activityPatternSuccessors_patternId_activityPatterns_id"
	}),
	activityPatternSuccessors_successorPatternId: many(activityPatternSuccessors, {
		relationName: "activityPatternSuccessors_successorPatternId_activityPatterns_id"
	}),
	workplanTemplateActivities: many(workplanTemplateActivities),
	activityAutoRules: many(activityAutoRules),
	bulkActivityJobs: many(bulkActivityJobs),
	activities: many(activities),
	activityStatsDailies: many(activityStatsDaily),
	patternFields: many(patternFields),
	pod: one(pods, {
		fields: [activityPatterns.assigneeGroupId],
		references: [pods.id]
	}),
	userProfile_assigneeUserId: one(userProfiles, {
		fields: [activityPatterns.assigneeUserId],
		references: [userProfiles.id],
		relationName: "activityPatterns_assigneeUserId_userProfiles_id"
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [activityPatterns.createdBy],
		references: [userProfiles.id],
		relationName: "activityPatterns_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [activityPatterns.orgId],
		references: [organizations.id]
	}),
}));

export const activityPatternSuccessorsRelations = relations(activityPatternSuccessors, ({one}) => ({
	activityPattern_patternId: one(activityPatterns, {
		fields: [activityPatternSuccessors.patternId],
		references: [activityPatterns.id],
		relationName: "activityPatternSuccessors_patternId_activityPatterns_id"
	}),
	activityPattern_successorPatternId: one(activityPatterns, {
		fields: [activityPatternSuccessors.successorPatternId],
		references: [activityPatterns.id],
		relationName: "activityPatternSuccessors_successorPatternId_activityPatterns_id"
	}),
}));

export const workplanTemplatesRelations = relations(workplanTemplates, ({one, many}) => ({
	organization: one(organizations, {
		fields: [workplanTemplates.orgId],
		references: [organizations.id]
	}),
	workplanPhases: many(workplanPhases),
	workplanInstances: many(workplanInstances),
	workplanTemplateActivities: many(workplanTemplateActivities),
}));

export const workplanPhasesRelations = relations(workplanPhases, ({one}) => ({
	workplanTemplate: one(workplanTemplates, {
		fields: [workplanPhases.templateId],
		references: [workplanTemplates.id]
	}),
}));

export const workplanInstancesRelations = relations(workplanInstances, ({one, many}) => ({
	userProfile: one(userProfiles, {
		fields: [workplanInstances.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [workplanInstances.orgId],
		references: [organizations.id]
	}),
	workplanTemplate: one(workplanTemplates, {
		fields: [workplanInstances.templateId],
		references: [workplanTemplates.id]
	}),
	activities: many(activities),
}));

export const workplanTemplateActivitiesRelations = relations(workplanTemplateActivities, ({one}) => ({
	activityPattern: one(activityPatterns, {
		fields: [workplanTemplateActivities.patternId],
		references: [activityPatterns.id]
	}),
	workplanTemplate: one(workplanTemplates, {
		fields: [workplanTemplateActivities.templateId],
		references: [workplanTemplates.id]
	}),
}));

export const activityParticipantsRelations = relations(activityParticipants, ({one}) => ({
	activity: one(activities, {
		fields: [activityParticipants.activityId],
		references: [activities.id]
	}),
	userProfile_addedBy: one(userProfiles, {
		fields: [activityParticipants.addedBy],
		references: [userProfiles.id],
		relationName: "activityParticipants_addedBy_userProfiles_id"
	}),
	userProfile_userId: one(userProfiles, {
		fields: [activityParticipants.userId],
		references: [userProfiles.id],
		relationName: "activityParticipants_userId_userProfiles_id"
	}),
}));

export const activitiesRelations = relations(activities, ({one, many}) => ({
	activityParticipants: many(activityParticipants),
	activityFieldValues: many(activityFieldValues),
	activityChecklistItems: many(activityChecklistItems),
	activityComments: many(activityComments),
	activityAttachments: many(activityAttachments),
	activityReminders: many(activityReminders),
	activityTimeEntries: many(activityTimeEntries),
	activityDependencies_activityId: many(activityDependencies, {
		relationName: "activityDependencies_activityId_activities_id"
	}),
	activityDependencies_dependsOnActivityId: many(activityDependencies, {
		relationName: "activityDependencies_dependsOnActivityId_activities_id"
	}),
	activityHistories: many(activityHistory),
	slaInstances: many(slaInstances),
	pod: one(pods, {
		fields: [activities.assignedGroup],
		references: [pods.id]
	}),
	userProfile_assignedTo: one(userProfiles, {
		fields: [activities.assignedTo],
		references: [userProfiles.id],
		relationName: "activities_assignedTo_userProfiles_id"
	}),
	userProfile_claimedBy: one(userProfiles, {
		fields: [activities.claimedBy],
		references: [userProfiles.id],
		relationName: "activities_claimedBy_userProfiles_id"
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [activities.createdBy],
		references: [userProfiles.id],
		relationName: "activities_createdBy_userProfiles_id"
	}),
	userProfile_escalatedToUserId: one(userProfiles, {
		fields: [activities.escalatedToUserId],
		references: [userProfiles.id],
		relationName: "activities_escalatedToUserId_userProfiles_id"
	}),
	activity_followUpActivityId: one(activities, {
		fields: [activities.followUpActivityId],
		references: [activities.id],
		relationName: "activities_followUpActivityId_activities_id"
	}),
	activities_followUpActivityId: many(activities, {
		relationName: "activities_followUpActivityId_activities_id"
	}),
	organization: one(organizations, {
		fields: [activities.orgId],
		references: [organizations.id]
	}),
	userProfile_originalAssignedTo: one(userProfiles, {
		fields: [activities.originalAssignedTo],
		references: [userProfiles.id],
		relationName: "activities_originalAssignedTo_userProfiles_id"
	}),
	activity_parentActivityId: one(activities, {
		fields: [activities.parentActivityId],
		references: [activities.id],
		relationName: "activities_parentActivityId_activities_id"
	}),
	activities_parentActivityId: many(activities, {
		relationName: "activities_parentActivityId_activities_id"
	}),
	activityPattern: one(activityPatterns, {
		fields: [activities.patternId],
		references: [activityPatterns.id]
	}),
	userProfile_performedBy: one(userProfiles, {
		fields: [activities.performedBy],
		references: [userProfiles.id],
		relationName: "activities_performedBy_userProfiles_id"
	}),
	activity_predecessorActivityId: one(activities, {
		fields: [activities.predecessorActivityId],
		references: [activities.id],
		relationName: "activities_predecessorActivityId_activities_id"
	}),
	activities_predecessorActivityId: many(activities, {
		relationName: "activities_predecessorActivityId_activities_id"
	}),
	workQueue: one(workQueues, {
		fields: [activities.queueId],
		references: [workQueues.id]
	}),
	campaign: one(campaigns, {
		fields: [activities.relatedCampaignId],
		references: [campaigns.id]
	}),
	contact: one(contacts, {
		fields: [activities.relatedContactId],
		references: [contacts.id]
	}),
	deal: one(deals, {
		fields: [activities.relatedDealId],
		references: [deals.id]
	}),
	userProfile_updatedBy: one(userProfiles, {
		fields: [activities.updatedBy],
		references: [userProfiles.id],
		relationName: "activities_updatedBy_userProfiles_id"
	}),
	workplanInstance: one(workplanInstances, {
		fields: [activities.workplanInstanceId],
		references: [workplanInstances.id]
	}),
	activityNotes: many(activityNotes),
	activityEscalations: many(activityEscalations),
}));

export const activityFieldValuesRelations = relations(activityFieldValues, ({one}) => ({
	activity: one(activities, {
		fields: [activityFieldValues.activityId],
		references: [activities.id]
	}),
	patternField: one(patternFields, {
		fields: [activityFieldValues.fieldId],
		references: [patternFields.id]
	}),
}));

export const patternFieldsRelations = relations(patternFields, ({one, many}) => ({
	activityFieldValues: many(activityFieldValues),
	activityPattern: one(activityPatterns, {
		fields: [patternFields.patternId],
		references: [activityPatterns.id]
	}),
}));

export const activityChecklistItemsRelations = relations(activityChecklistItems, ({one}) => ({
	activity: one(activities, {
		fields: [activityChecklistItems.activityId],
		references: [activities.id]
	}),
	userProfile: one(userProfiles, {
		fields: [activityChecklistItems.completedBy],
		references: [userProfiles.id]
	}),
	patternChecklistItem: one(patternChecklistItems, {
		fields: [activityChecklistItems.patternChecklistItemId],
		references: [patternChecklistItems.id]
	}),
}));

export const activityCommentsRelations = relations(activityComments, ({one, many}) => ({
	activity: one(activities, {
		fields: [activityComments.activityId],
		references: [activities.id]
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [activityComments.createdBy],
		references: [userProfiles.id],
		relationName: "activityComments_createdBy_userProfiles_id"
	}),
	activityComment: one(activityComments, {
		fields: [activityComments.parentCommentId],
		references: [activityComments.id],
		relationName: "activityComments_parentCommentId_activityComments_id"
	}),
	activityComments: many(activityComments, {
		relationName: "activityComments_parentCommentId_activityComments_id"
	}),
	userProfile_updatedBy: one(userProfiles, {
		fields: [activityComments.updatedBy],
		references: [userProfiles.id],
		relationName: "activityComments_updatedBy_userProfiles_id"
	}),
}));

export const activityAttachmentsRelations = relations(activityAttachments, ({one}) => ({
	activity: one(activities, {
		fields: [activityAttachments.activityId],
		references: [activities.id]
	}),
	userProfile: one(userProfiles, {
		fields: [activityAttachments.uploadedBy],
		references: [userProfiles.id]
	}),
}));

export const activityRemindersRelations = relations(activityReminders, ({one}) => ({
	activity: one(activities, {
		fields: [activityReminders.activityId],
		references: [activities.id]
	}),
	userProfile: one(userProfiles, {
		fields: [activityReminders.userId],
		references: [userProfiles.id]
	}),
}));

export const podSprintMetricsRelations = relations(podSprintMetrics, ({one}) => ({
	organization: one(organizations, {
		fields: [podSprintMetrics.orgId],
		references: [organizations.id]
	}),
	pod: one(pods, {
		fields: [podSprintMetrics.podId],
		references: [pods.id]
	}),
}));

export const activityTimeEntriesRelations = relations(activityTimeEntries, ({one}) => ({
	activity: one(activities, {
		fields: [activityTimeEntries.activityId],
		references: [activities.id]
	}),
	userProfile: one(userProfiles, {
		fields: [activityTimeEntries.userId],
		references: [userProfiles.id]
	}),
}));

export const activityDependenciesRelations = relations(activityDependencies, ({one}) => ({
	activity_activityId: one(activities, {
		fields: [activityDependencies.activityId],
		references: [activities.id],
		relationName: "activityDependencies_activityId_activities_id"
	}),
	activity_dependsOnActivityId: one(activities, {
		fields: [activityDependencies.dependsOnActivityId],
		references: [activities.id],
		relationName: "activityDependencies_dependsOnActivityId_activities_id"
	}),
}));

export const activityAutoRulesRelations = relations(activityAutoRules, ({one}) => ({
	activityPattern: one(activityPatterns, {
		fields: [activityAutoRules.activityPatternId],
		references: [activityPatterns.id]
	}),
	pod: one(pods, {
		fields: [activityAutoRules.assignToGroupId],
		references: [pods.id]
	}),
	userProfile: one(userProfiles, {
		fields: [activityAutoRules.assignToUserId],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [activityAutoRules.orgId],
		references: [organizations.id]
	}),
}));

export const activityHistoryRelations = relations(activityHistory, ({one}) => ({
	activity: one(activities, {
		fields: [activityHistory.activityId],
		references: [activities.id]
	}),
	userProfile: one(userProfiles, {
		fields: [activityHistory.changedBy],
		references: [userProfiles.id]
	}),
}));

export const addressesRelations = relations(addresses, ({one, many}) => ({
	organization: one(organizations, {
		fields: [addresses.orgId],
		references: [organizations.id]
	}),
	contacts: many(contacts),
	placements: many(placements),
}));

export const queueItemsRelations = relations(queueItems, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [queueItems.assignedTo],
		references: [userProfiles.id]
	}),
	workQueue: one(workQueues, {
		fields: [queueItems.queueId],
		references: [workQueues.id]
	}),
}));

export const workQueuesRelations = relations(workQueues, ({one, many}) => ({
	queueItems: many(queueItems),
	activities: many(activities),
	pod: one(pods, {
		fields: [workQueues.assignedToGroupId],
		references: [pods.id]
	}),
	organization: one(organizations, {
		fields: [workQueues.orgId],
		references: [organizations.id]
	}),
	workQueueMembers: many(workQueueMembers),
	activityEscalations: many(activityEscalations),
}));

export const slaInstancesRelations = relations(slaInstances, ({one}) => ({
	activity: one(activities, {
		fields: [slaInstances.activityId],
		references: [activities.id]
	}),
	organization: one(organizations, {
		fields: [slaInstances.orgId],
		references: [organizations.id]
	}),
	slaDefinition: one(slaDefinitions, {
		fields: [slaInstances.slaDefinitionId],
		references: [slaDefinitions.id]
	}),
}));

export const slaDefinitionsRelations = relations(slaDefinitions, ({one, many}) => ({
	slaInstances: many(slaInstances),
	pod: one(pods, {
		fields: [slaDefinitions.escalateToGroupId],
		references: [pods.id]
	}),
	userProfile: one(userProfiles, {
		fields: [slaDefinitions.escalateToUserId],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [slaDefinitions.orgId],
		references: [organizations.id]
	}),
	slaEscalationLevels: many(slaEscalationLevels),
	slaEvents: many(slaEvents),
}));

export const bulkActivityJobsRelations = relations(bulkActivityJobs, ({one}) => ({
	activityPattern: one(activityPatterns, {
		fields: [bulkActivityJobs.activityPatternId],
		references: [activityPatterns.id]
	}),
	userProfile: one(userProfiles, {
		fields: [bulkActivityJobs.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [bulkActivityJobs.orgId],
		references: [organizations.id]
	}),
}));

export const activityMetricsRelations = relations(activityMetrics, ({one}) => ({
	organization: one(organizations, {
		fields: [activityMetrics.orgId],
		references: [organizations.id]
	}),
	pod: one(pods, {
		fields: [activityMetrics.podId],
		references: [pods.id]
	}),
	userProfile: one(userProfiles, {
		fields: [activityMetrics.userId],
		references: [userProfiles.id]
	}),
}));

export const teamMetricsRelations = relations(teamMetrics, ({one}) => ({
	organization: one(organizations, {
		fields: [teamMetrics.orgId],
		references: [organizations.id]
	}),
	pod: one(pods, {
		fields: [teamMetrics.podId],
		references: [pods.id]
	}),
}));

export const learningPathsRelations = relations(learningPaths, ({one, many}) => ({
	userProfile: one(userProfiles, {
		fields: [learningPaths.createdBy],
		references: [userProfiles.id]
	}),
	learningPathCourses: many(learningPathCourses),
	pathEnrollments: many(pathEnrollments),
}));

export const learningPathCoursesRelations = relations(learningPathCourses, ({one}) => ({
	course: one(courses, {
		fields: [learningPathCourses.courseId],
		references: [courses.id]
	}),
	learningPath: one(learningPaths, {
		fields: [learningPathCourses.pathId],
		references: [learningPaths.id]
	}),
}));

export const pathEnrollmentsRelations = relations(pathEnrollments, ({one}) => ({
	learningPath: one(learningPaths, {
		fields: [pathEnrollments.pathId],
		references: [learningPaths.id]
	}),
	userProfile: one(userProfiles, {
		fields: [pathEnrollments.userId],
		references: [userProfiles.id]
	}),
}));

export const certificatesRelations = relations(certificates, ({one}) => ({
	studentEnrollment: one(studentEnrollments, {
		fields: [certificates.enrollmentId],
		references: [studentEnrollments.id]
	}),
	certificateTemplate: one(certificateTemplates, {
		fields: [certificates.templateId],
		references: [certificateTemplates.id]
	}),
}));

export const certificateTemplatesRelations = relations(certificateTemplates, ({many}) => ({
	certificates: many(certificates),
}));

export const userLevelsRelations = relations(userLevels, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [userLevels.userId],
		references: [userProfiles.id]
	}),
}));

export const userAchievementsRelations = relations(userAchievements, ({one}) => ({
	achievement: one(achievements, {
		fields: [userAchievements.achievementId],
		references: [achievements.id]
	}),
	userProfile: one(userProfiles, {
		fields: [userAchievements.userId],
		references: [userProfiles.id]
	}),
}));

export const achievementsRelations = relations(achievements, ({many}) => ({
	userAchievements: many(userAchievements),
}));

export const learningStreaksRelations = relations(learningStreaks, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [learningStreaks.userId],
		references: [userProfiles.id]
	}),
}));

export const leaderboardEntriesRelations = relations(leaderboardEntries, ({one}) => ({
	leaderboard: one(leaderboards, {
		fields: [leaderboardEntries.leaderboardId],
		references: [leaderboards.id]
	}),
	userProfile: one(userProfiles, {
		fields: [leaderboardEntries.userId],
		references: [userProfiles.id]
	}),
}));

export const leaderboardsRelations = relations(leaderboards, ({many}) => ({
	leaderboardEntries: many(leaderboardEntries),
}));

export const loginHistoryRelations = relations(loginHistory, ({one}) => ({
	organization: one(organizations, {
		fields: [loginHistory.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [loginHistory.userId],
		references: [userProfiles.id]
	}),
}));

export const userInvitationsRelations = relations(userInvitations, ({one}) => ({
	userProfile_invitedBy: one(userProfiles, {
		fields: [userInvitations.invitedBy],
		references: [userProfiles.id],
		relationName: "userInvitations_invitedBy_userProfiles_id"
	}),
	userProfile_managerId: one(userProfiles, {
		fields: [userInvitations.managerId],
		references: [userProfiles.id],
		relationName: "userInvitations_managerId_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [userInvitations.orgId],
		references: [organizations.id]
	}),
	pod: one(pods, {
		fields: [userInvitations.podId],
		references: [pods.id]
	}),
	systemRole: one(systemRoles, {
		fields: [userInvitations.roleId],
		references: [systemRoles.id]
	}),
}));

export const webhooksRelations = relations(webhooks, ({one, many}) => ({
	userProfile: one(userProfiles, {
		fields: [webhooks.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [webhooks.orgId],
		references: [organizations.id]
	}),
	webhookDeliveries: many(webhookDeliveries),
}));

export const webhookDeliveriesRelations = relations(webhookDeliveries, ({one}) => ({
	organization: one(organizations, {
		fields: [webhookDeliveries.orgId],
		references: [organizations.id]
	}),
	webhook: one(webhooks, {
		fields: [webhookDeliveries.webhookId],
		references: [webhooks.id]
	}),
}));

export const integrationRetryConfigRelations = relations(integrationRetryConfig, ({one}) => ({
	organization: one(organizations, {
		fields: [integrationRetryConfig.orgId],
		references: [organizations.id]
	}),
}));

export const integrationOauthTokensRelations = relations(integrationOauthTokens, ({one}) => ({
	integration: one(integrations, {
		fields: [integrationOauthTokens.integrationId],
		references: [integrations.id]
	}),
	organization: one(organizations, {
		fields: [integrationOauthTokens.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [integrationOauthTokens.userId],
		references: [userProfiles.id]
	}),
}));

export const integrationFailoverConfigRelations = relations(integrationFailoverConfig, ({one}) => ({
	integration_backupIntegrationId: one(integrations, {
		fields: [integrationFailoverConfig.backupIntegrationId],
		references: [integrations.id],
		relationName: "integrationFailoverConfig_backupIntegrationId_integrations_id"
	}),
	organization: one(organizations, {
		fields: [integrationFailoverConfig.orgId],
		references: [organizations.id]
	}),
	integration_primaryIntegrationId: one(integrations, {
		fields: [integrationFailoverConfig.primaryIntegrationId],
		references: [integrations.id],
		relationName: "integrationFailoverConfig_primaryIntegrationId_integrations_id"
	}),
}));

export const externalJobOrderRequirementsRelations = relations(externalJobOrderRequirements, ({one}) => ({
	externalJobOrder: one(externalJobOrders, {
		fields: [externalJobOrderRequirements.orderId],
		references: [externalJobOrders.id]
	}),
}));

export const externalJobOrderSkillsRelations = relations(externalJobOrderSkills, ({one}) => ({
	externalJobOrder: one(externalJobOrders, {
		fields: [externalJobOrderSkills.orderId],
		references: [externalJobOrders.id]
	}),
}));

export const externalJobOrderNotesRelations = relations(externalJobOrderNotes, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [externalJobOrderNotes.createdBy],
		references: [userProfiles.id]
	}),
	externalJobOrder: one(externalJobOrders, {
		fields: [externalJobOrderNotes.orderId],
		references: [externalJobOrders.id]
	}),
}));

export const approvalWorkflowsRelations = relations(approvalWorkflows, ({one, many}) => ({
	userProfile: one(userProfiles, {
		fields: [approvalWorkflows.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [approvalWorkflows.orgId],
		references: [organizations.id]
	}),
	approvalInstances: many(approvalInstances),
}));

export const approvalStepsRelations = relations(approvalSteps, ({one}) => ({
	userProfile_approverId: one(userProfiles, {
		fields: [approvalSteps.approverId],
		references: [userProfiles.id],
		relationName: "approvalSteps_approverId_userProfiles_id"
	}),
	userProfile_decidedBy: one(userProfiles, {
		fields: [approvalSteps.decidedBy],
		references: [userProfiles.id],
		relationName: "approvalSteps_decidedBy_userProfiles_id"
	}),
	approvalInstance: one(approvalInstances, {
		fields: [approvalSteps.instanceId],
		references: [approvalInstances.id]
	}),
}));

export const approvalInstancesRelations = relations(approvalInstances, ({one, many}) => ({
	approvalSteps: many(approvalSteps),
	userProfile_escalatedTo: one(userProfiles, {
		fields: [approvalInstances.escalatedTo],
		references: [userProfiles.id],
		relationName: "approvalInstances_escalatedTo_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [approvalInstances.orgId],
		references: [organizations.id]
	}),
	userProfile_requestedBy: one(userProfiles, {
		fields: [approvalInstances.requestedBy],
		references: [userProfiles.id],
		relationName: "approvalInstances_requestedBy_userProfiles_id"
	}),
	userProfile_resolvedBy: one(userProfiles, {
		fields: [approvalInstances.resolvedBy],
		references: [userProfiles.id],
		relationName: "approvalInstances_resolvedBy_userProfiles_id"
	}),
	approvalWorkflow: one(approvalWorkflows, {
		fields: [approvalInstances.workflowId],
		references: [approvalWorkflows.id]
	}),
}));

export const placementCreditsRelations = relations(placementCredits, ({one}) => ({
	userProfile_createdBy: one(userProfiles, {
		fields: [placementCredits.createdBy],
		references: [userProfiles.id],
		relationName: "placementCredits_createdBy_userProfiles_id"
	}),
	userProfile_juniorRecId: one(userProfiles, {
		fields: [placementCredits.juniorRecId],
		references: [userProfiles.id],
		relationName: "placementCredits_juniorRecId_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [placementCredits.orgId],
		references: [organizations.id]
	}),
	graduateCandidate: one(graduateCandidates, {
		fields: [placementCredits.originalGraduateId],
		references: [graduateCandidates.id]
	}),
	pod: one(pods, {
		fields: [placementCredits.podId],
		references: [pods.id]
	}),
	userProfile_seniorRecId: one(userProfiles, {
		fields: [placementCredits.seniorRecId],
		references: [userProfiles.id],
		relationName: "placementCredits_seniorRecId_userProfiles_id"
	}),
	userProfile_verifiedBy: one(userProfiles, {
		fields: [placementCredits.verifiedBy],
		references: [userProfiles.id],
		relationName: "placementCredits_verifiedBy_userProfiles_id"
	}),
}));

export const graduateCandidatesRelations = relations(graduateCandidates, ({one, many}) => ({
	placementCredits: many(placementCredits),
	userProfile_assignedRecruiterId: one(userProfiles, {
		fields: [graduateCandidates.assignedRecruiterId],
		references: [userProfiles.id],
		relationName: "graduateCandidates_assignedRecruiterId_userProfiles_id"
	}),
	course: one(courses, {
		fields: [graduateCandidates.courseId],
		references: [courses.id]
	}),
	studentEnrollment: one(studentEnrollments, {
		fields: [graduateCandidates.enrollmentId],
		references: [studentEnrollments.id]
	}),
	userProfile_statusChangedBy: one(userProfiles, {
		fields: [graduateCandidates.statusChangedBy],
		references: [userProfiles.id],
		relationName: "graduateCandidates_statusChangedBy_userProfiles_id"
	}),
	userProfile_userId: one(userProfiles, {
		fields: [graduateCandidates.userId],
		references: [userProfiles.id],
		relationName: "graduateCandidates_userId_userProfiles_id"
	}),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({one}) => ({
	studentEnrollment: one(studentEnrollments, {
		fields: [quizAttempts.enrollmentId],
		references: [studentEnrollments.id]
	}),
	moduleTopic: one(moduleTopics, {
		fields: [quizAttempts.topicId],
		references: [moduleTopics.id]
	}),
	userProfile: one(userProfiles, {
		fields: [quizAttempts.userId],
		references: [userProfiles.id]
	}),
}));

export const aiMentorEscalationsRelations = relations(aiMentorEscalations, ({one, many}) => ({
	userProfile_assignedTo: one(userProfiles, {
		fields: [aiMentorEscalations.assignedTo],
		references: [userProfiles.id],
		relationName: "aiMentorEscalations_assignedTo_userProfiles_id"
	}),
	aiMentorChat: one(aiMentorChats, {
		fields: [aiMentorEscalations.chatId],
		references: [aiMentorChats.id]
	}),
	userProfile_resolvedBy: one(userProfiles, {
		fields: [aiMentorEscalations.resolvedBy],
		references: [userProfiles.id],
		relationName: "aiMentorEscalations_resolvedBy_userProfiles_id"
	}),
	moduleTopic: one(moduleTopics, {
		fields: [aiMentorEscalations.topicId],
		references: [moduleTopics.id]
	}),
	userProfile_userId: one(userProfiles, {
		fields: [aiMentorEscalations.userId],
		references: [userProfiles.id],
		relationName: "aiMentorEscalations_userId_userProfiles_id"
	}),
	trainerResponses: many(trainerResponses),
	escalationNotifications: many(escalationNotifications),
}));

export const trainerResponsesRelations = relations(trainerResponses, ({one}) => ({
	aiMentorEscalation: one(aiMentorEscalations, {
		fields: [trainerResponses.escalationId],
		references: [aiMentorEscalations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [trainerResponses.trainerId],
		references: [userProfiles.id]
	}),
}));

export const escalationNotificationsRelations = relations(escalationNotifications, ({one}) => ({
	aiMentorEscalation: one(aiMentorEscalations, {
		fields: [escalationNotifications.escalationId],
		references: [aiMentorEscalations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [escalationNotifications.recipientId],
		references: [userProfiles.id]
	}),
}));

export const entitySkillsRelations = relations(entitySkills, ({one, many}) => ({
	organization: one(organizations, {
		fields: [entitySkills.orgId],
		references: [organizations.id]
	}),
	skill: one(skills, {
		fields: [entitySkills.skillId],
		references: [skills.id]
	}),
	userProfile: one(userProfiles, {
		fields: [entitySkills.verifiedBy],
		references: [userProfiles.id]
	}),
	skillEndorsements: many(skillEndorsements),
}));

export const certificationsRelations = relations(certifications, ({one}) => ({
	organization: one(organizations, {
		fields: [certifications.orgId],
		references: [organizations.id]
	}),
	skill: one(skills, {
		fields: [certifications.skillId],
		references: [skills.id]
	}),
	userProfile: one(userProfiles, {
		fields: [certifications.verifiedBy],
		references: [userProfiles.id]
	}),
}));

export const contactBenchDataRelations = relations(contactBenchData, ({one}) => ({
	userProfile_benchSalesRepId: one(userProfiles, {
		fields: [contactBenchData.benchSalesRepId],
		references: [userProfiles.id],
		relationName: "contactBenchData_benchSalesRepId_userProfiles_id"
	}),
	contact_contactId: one(contacts, {
		fields: [contactBenchData.contactId],
		references: [contacts.id],
		relationName: "contactBenchData_contactId_contacts_id"
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [contactBenchData.createdBy],
		references: [userProfiles.id],
		relationName: "contactBenchData_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [contactBenchData.orgId],
		references: [organizations.id]
	}),
	userProfile_updatedBy: one(userProfiles, {
		fields: [contactBenchData.updatedBy],
		references: [userProfiles.id],
		relationName: "contactBenchData_updatedBy_userProfiles_id"
	}),
	contact_vendorContactId: one(contacts, {
		fields: [contactBenchData.vendorContactId],
		references: [contacts.id],
		relationName: "contactBenchData_vendorContactId_contacts_id"
	}),
	company: one(companies, {
		fields: [contactBenchData.vendorId],
		references: [companies.id]
	}),
}));

export const submissionFeedbackRelations = relations(submissionFeedback, ({one}) => ({
	interview: one(interviews, {
		fields: [submissionFeedback.interviewId],
		references: [interviews.id]
	}),
	organization: one(organizations, {
		fields: [submissionFeedback.orgId],
		references: [organizations.id]
	}),
	contact: one(contacts, {
		fields: [submissionFeedback.providedByContactId],
		references: [contacts.id]
	}),
	userProfile: one(userProfiles, {
		fields: [submissionFeedback.providedByUserId],
		references: [userProfiles.id]
	}),
	submission: one(submissions, {
		fields: [submissionFeedback.submissionId],
		references: [submissions.id]
	}),
}));

export const submissionRtrRelations = relations(submissionRtr, ({one}) => ({
	contact: one(contacts, {
		fields: [submissionRtr.contactId],
		references: [contacts.id]
	}),
	userProfile: one(userProfiles, {
		fields: [submissionRtr.createdBy],
		references: [userProfiles.id]
	}),
	document: one(documents, {
		fields: [submissionRtr.documentId],
		references: [documents.id]
	}),
	organization: one(organizations, {
		fields: [submissionRtr.orgId],
		references: [organizations.id]
	}),
	submission: one(submissions, {
		fields: [submissionRtr.submissionId],
		references: [submissions.id]
	}),
}));

export const documentsRelations = relations(documents, ({one, many}) => ({
	submissionRtrs: many(submissionRtr),
	organization: one(organizations, {
		fields: [documents.orgId],
		references: [organizations.id]
	}),
	document: one(documents, {
		fields: [documents.previousVersionId],
		references: [documents.id],
		relationName: "documents_previousVersionId_documents_id"
	}),
	documents: many(documents, {
		relationName: "documents_previousVersionId_documents_id"
	}),
	userProfile: one(userProfiles, {
		fields: [documents.uploadedBy],
		references: [userProfiles.id]
	}),
	documentAccessLogs: many(documentAccessLog),
	submissions: many(submissions),
	placementChangeOrders: many(placementChangeOrders),
	onboardingTasks: many(onboardingTasks),
	onboardingTemplateTasks: many(onboardingTemplateTasks),
}));

export const skillEndorsementsRelations = relations(skillEndorsements, ({one}) => ({
	contact: one(contacts, {
		fields: [skillEndorsements.endorserId],
		references: [contacts.id]
	}),
	entitySkill: one(entitySkills, {
		fields: [skillEndorsements.entitySkillId],
		references: [entitySkills.id]
	}),
	organization: one(organizations, {
		fields: [skillEndorsements.orgId],
		references: [organizations.id]
	}),
}));

export const auditLogs202511Relations = relations(auditLogs202511, ({one}) => ({
	organization: one(organizations, {
		fields: [auditLogs202511.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [auditLogs202511.userId],
		references: [userProfiles.id]
	}),
}));

export const auditLogs202512Relations = relations(auditLogs202512, ({one}) => ({
	organization: one(organizations, {
		fields: [auditLogs202512.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [auditLogs202512.userId],
		references: [userProfiles.id]
	}),
}));

export const auditLogs202601Relations = relations(auditLogs202601, ({one}) => ({
	organization: one(organizations, {
		fields: [auditLogs202601.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [auditLogs202601.userId],
		references: [userProfiles.id]
	}),
}));

export const auditLogs202602Relations = relations(auditLogs202602, ({one}) => ({
	organization: one(organizations, {
		fields: [auditLogs202602.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [auditLogs202602.userId],
		references: [userProfiles.id]
	}),
}));

export const securityAlertsRelations = relations(securityAlerts, ({one}) => ({
	userProfile_assignedTo: one(userProfiles, {
		fields: [securityAlerts.assignedTo],
		references: [userProfiles.id],
		relationName: "securityAlerts_assignedTo_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [securityAlerts.orgId],
		references: [organizations.id]
	}),
	userProfile_relatedUserId: one(userProfiles, {
		fields: [securityAlerts.relatedUserId],
		references: [userProfiles.id],
		relationName: "securityAlerts_relatedUserId_userProfiles_id"
	}),
}));

export const alertRulesRelations = relations(alertRules, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [alertRules.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [alertRules.orgId],
		references: [organizations.id]
	}),
}));

export const emailSendsRelations = relations(emailSends, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [emailSends.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [emailSends.orgId],
		references: [organizations.id]
	}),
	emailTemplate: one(emailTemplates, {
		fields: [emailSends.templateId],
		references: [emailTemplates.id]
	}),
}));

export const emailSendersRelations = relations(emailSenders, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [emailSenders.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [emailSenders.orgId],
		references: [organizations.id]
	}),
}));

export const activityNotesRelations = relations(activityNotes, ({one}) => ({
	activity: one(activities, {
		fields: [activityNotes.activityId],
		references: [activities.id]
	}),
	userProfile: one(userProfiles, {
		fields: [activityNotes.createdBy],
		references: [userProfiles.id]
	}),
}));

export const incidentsRelations = relations(incidents, ({one, many}) => ({
	userProfile_createdBy: one(userProfiles, {
		fields: [incidents.createdBy],
		references: [userProfiles.id],
		relationName: "incidents_createdBy_userProfiles_id"
	}),
	userProfile_incidentCommander: one(userProfiles, {
		fields: [incidents.incidentCommander],
		references: [userProfiles.id],
		relationName: "incidents_incidentCommander_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [incidents.orgId],
		references: [organizations.id]
	}),
	userProfile_updatedBy: one(userProfiles, {
		fields: [incidents.updatedBy],
		references: [userProfiles.id],
		relationName: "incidents_updatedBy_userProfiles_id"
	}),
	incidentTimelines: many(incidentTimeline),
	incidentNotifications: many(incidentNotifications),
	breakGlassAccesses: many(breakGlassAccess),
}));

export const incidentTimelineRelations = relations(incidentTimeline, ({one}) => ({
	incident: one(incidents, {
		fields: [incidentTimeline.incidentId],
		references: [incidents.id]
	}),
	organization: one(organizations, {
		fields: [incidentTimeline.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [incidentTimeline.performedBy],
		references: [userProfiles.id]
	}),
}));

export const incidentNotificationsRelations = relations(incidentNotifications, ({one}) => ({
	incident: one(incidents, {
		fields: [incidentNotifications.incidentId],
		references: [incidents.id]
	}),
	organization: one(organizations, {
		fields: [incidentNotifications.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [incidentNotifications.sentBy],
		references: [userProfiles.id]
	}),
}));

export const breakGlassAccessRelations = relations(breakGlassAccess, ({one}) => ({
	incident: one(incidents, {
		fields: [breakGlassAccess.incidentId],
		references: [incidents.id]
	}),
	organization: one(organizations, {
		fields: [breakGlassAccess.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [breakGlassAccess.userId],
		references: [userProfiles.id]
	}),
}));

export const emergencyDrillsRelations = relations(emergencyDrills, ({one}) => ({
	userProfile_createdBy: one(userProfiles, {
		fields: [emergencyDrills.createdBy],
		references: [userProfiles.id],
		relationName: "emergencyDrills_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [emergencyDrills.orgId],
		references: [organizations.id]
	}),
	userProfile_updatedBy: one(userProfiles, {
		fields: [emergencyDrills.updatedBy],
		references: [userProfiles.id],
		relationName: "emergencyDrills_updatedBy_userProfiles_id"
	}),
}));

export const workQueueMembersRelations = relations(workQueueMembers, ({one}) => ({
	workQueue: one(workQueues, {
		fields: [workQueueMembers.queueId],
		references: [workQueues.id]
	}),
	userProfile: one(userProfiles, {
		fields: [workQueueMembers.userId],
		references: [userProfiles.id]
	}),
}));

export const slaEscalationLevelsRelations = relations(slaEscalationLevels, ({one}) => ({
	slaDefinition: one(slaDefinitions, {
		fields: [slaEscalationLevels.slaDefinitionId],
		references: [slaDefinitions.id]
	}),
}));

export const slaEventsRelations = relations(slaEvents, ({one, many}) => ({
	organization: one(organizations, {
		fields: [slaEvents.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [slaEvents.resolvedBy],
		references: [userProfiles.id]
	}),
	slaDefinition: one(slaDefinitions, {
		fields: [slaEvents.slaDefinitionId],
		references: [slaDefinitions.id]
	}),
	slaNotifications: many(slaNotifications),
}));

export const slaNotificationsRelations = relations(slaNotifications, ({one}) => ({
	slaEvent: one(slaEvents, {
		fields: [slaNotifications.slaEventId],
		references: [slaEvents.id]
	}),
}));

export const activityEscalationsRelations = relations(activityEscalations, ({one}) => ({
	activity: one(activities, {
		fields: [activityEscalations.activityId],
		references: [activities.id]
	}),
	userProfile_escalatedFromUser: one(userProfiles, {
		fields: [activityEscalations.escalatedFromUser],
		references: [userProfiles.id],
		relationName: "activityEscalations_escalatedFromUser_userProfiles_id"
	}),
	workQueue: one(workQueues, {
		fields: [activityEscalations.escalatedToQueue],
		references: [workQueues.id]
	}),
	userProfile_escalatedToUser: one(userProfiles, {
		fields: [activityEscalations.escalatedToUser],
		references: [userProfiles.id],
		relationName: "activityEscalations_escalatedToUser_userProfiles_id"
	}),
}));

export const activityStatsDailyRelations = relations(activityStatsDaily, ({one}) => ({
	organization: one(organizations, {
		fields: [activityStatsDaily.orgId],
		references: [organizations.id]
	}),
	activityPattern: one(activityPatterns, {
		fields: [activityStatsDaily.patternId],
		references: [activityPatterns.id]
	}),
	userProfile: one(userProfiles, {
		fields: [activityStatsDaily.userId],
		references: [userProfiles.id]
	}),
}));

export const notesRelations = relations(notes, ({one, many}) => ({
	userProfile_createdBy: one(userProfiles, {
		fields: [notes.createdBy],
		references: [userProfiles.id],
		relationName: "notes_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [notes.orgId],
		references: [organizations.id]
	}),
	note_parentNoteId: one(notes, {
		fields: [notes.parentNoteId],
		references: [notes.id],
		relationName: "notes_parentNoteId_notes_id"
	}),
	notes_parentNoteId: many(notes, {
		relationName: "notes_parentNoteId_notes_id"
	}),
	note_threadRootId: one(notes, {
		fields: [notes.threadRootId],
		references: [notes.id],
		relationName: "notes_threadRootId_notes_id"
	}),
	notes_threadRootId: many(notes, {
		relationName: "notes_threadRootId_notes_id"
	}),
	userProfile_updatedBy: one(userProfiles, {
		fields: [notes.updatedBy],
		references: [userProfiles.id],
		relationName: "notes_updatedBy_userProfiles_id"
	}),
	noteReactions: many(noteReactions),
}));

export const featureFlagUsageRelations = relations(featureFlagUsage, ({one}) => ({
	featureFlag: one(featureFlags, {
		fields: [featureFlagUsage.featureFlagId],
		references: [featureFlags.id]
	}),
	organization: one(organizations, {
		fields: [featureFlagUsage.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [featureFlagUsage.userId],
		references: [userProfiles.id]
	}),
}));

export const featureFlagFeedbackRelations = relations(featureFlagFeedback, ({one}) => ({
	featureFlag: one(featureFlags, {
		fields: [featureFlagFeedback.featureFlagId],
		references: [featureFlags.id]
	}),
	organization: one(organizations, {
		fields: [featureFlagFeedback.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [featureFlagFeedback.userId],
		references: [userProfiles.id]
	}),
}));

export const featureFlagCategoriesRelations = relations(featureFlagCategories, ({one}) => ({
	organization: one(organizations, {
		fields: [featureFlagCategories.orgId],
		references: [organizations.id]
	}),
}));

export const jobStatusHistoryRelations = relations(jobStatusHistory, ({one}) => ({
	userProfile_changedBy: one(userProfiles, {
		fields: [jobStatusHistory.changedBy],
		references: [userProfiles.id],
		relationName: "jobStatusHistory_changedBy_userProfiles_id"
	}),
	job: one(jobs, {
		fields: [jobStatusHistory.jobId],
		references: [jobs.id]
	}),
	organization: one(organizations, {
		fields: [jobStatusHistory.orgId],
		references: [organizations.id]
	}),
	userProfile_reopenApprovedBy: one(userProfiles, {
		fields: [jobStatusHistory.reopenApprovedBy],
		references: [userProfiles.id],
		relationName: "jobStatusHistory_reopenApprovedBy_userProfiles_id"
	}),
}));

export const savedSearchesRelations = relations(savedSearches, ({one}) => ({
	organization: one(organizations, {
		fields: [savedSearches.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [savedSearches.userId],
		references: [userProfiles.id]
	}),
}));

export const candidatePreparedProfilesRelations = relations(candidatePreparedProfiles, ({one}) => ({
	userProfile_candidateId: one(userProfiles, {
		fields: [candidatePreparedProfiles.candidateId],
		references: [userProfiles.id],
		relationName: "candidatePreparedProfiles_candidateId_userProfiles_id"
	}),
	contact: one(contacts, {
		fields: [candidatePreparedProfiles.contactId],
		references: [contacts.id]
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [candidatePreparedProfiles.createdBy],
		references: [userProfiles.id],
		relationName: "candidatePreparedProfiles_createdBy_userProfiles_id"
	}),
	userProfile_finalizedBy: one(userProfiles, {
		fields: [candidatePreparedProfiles.finalizedBy],
		references: [userProfiles.id],
		relationName: "candidatePreparedProfiles_finalizedBy_userProfiles_id"
	}),
	job: one(jobs, {
		fields: [candidatePreparedProfiles.jobId],
		references: [jobs.id]
	}),
	organization: one(organizations, {
		fields: [candidatePreparedProfiles.orgId],
		references: [organizations.id]
	}),
}));

export const candidateScreeningsRelations = relations(candidateScreenings, ({one}) => ({
	userProfile_candidateId: one(userProfiles, {
		fields: [candidateScreenings.candidateId],
		references: [userProfiles.id],
		relationName: "candidateScreenings_candidateId_userProfiles_id"
	}),
	contact: one(contacts, {
		fields: [candidateScreenings.contactId],
		references: [contacts.id]
	}),
	job: one(jobs, {
		fields: [candidateScreenings.jobId],
		references: [jobs.id]
	}),
	organization: one(organizations, {
		fields: [candidateScreenings.orgId],
		references: [organizations.id]
	}),
	userProfile_screenerId: one(userProfiles, {
		fields: [candidateScreenings.screenerId],
		references: [userProfiles.id],
		relationName: "candidateScreenings_screenerId_userProfiles_id"
	}),
	submission: one(submissions, {
		fields: [candidateScreenings.submissionId],
		references: [submissions.id]
	}),
}));

export const contactRelationshipsRelations = relations(contactRelationships, ({one}) => ({
	userProfile_createdBy: one(userProfiles, {
		fields: [contactRelationships.createdBy],
		references: [userProfiles.id],
		relationName: "contactRelationships_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [contactRelationships.orgId],
		references: [organizations.id]
	}),
	contact_sourceContactId: one(contacts, {
		fields: [contactRelationships.sourceContactId],
		references: [contacts.id],
		relationName: "contactRelationships_sourceContactId_contacts_id"
	}),
	contact_targetContactId: one(contacts, {
		fields: [contactRelationships.targetContactId],
		references: [contacts.id],
		relationName: "contactRelationships_targetContactId_contacts_id"
	}),
	userProfile_updatedBy: one(userProfiles, {
		fields: [contactRelationships.updatedBy],
		references: [userProfiles.id],
		relationName: "contactRelationships_updatedBy_userProfiles_id"
	}),
}));

export const contactRolesRelations = relations(contactRoles, ({one}) => ({
	contact_contactId: one(contacts, {
		fields: [contactRoles.contactId],
		references: [contacts.id],
		relationName: "contactRoles_contactId_contacts_id"
	}),
	contact_contextCompanyId: one(contacts, {
		fields: [contactRoles.contextCompanyId],
		references: [contacts.id],
		relationName: "contactRoles_contextCompanyId_contacts_id"
	}),
	userProfile: one(userProfiles, {
		fields: [contactRoles.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [contactRoles.orgId],
		references: [organizations.id]
	}),
}));

export const offerNegotiationsRelations = relations(offerNegotiations, ({one}) => ({
	offer: one(offers, {
		fields: [offerNegotiations.offerId],
		references: [offers.id]
	}),
	organization: one(organizations, {
		fields: [offerNegotiations.orgId],
		references: [organizations.id]
	}),
}));

export const offerApprovalsRelations = relations(offerApprovals, ({one}) => ({
	userProfile_approverId: one(userProfiles, {
		fields: [offerApprovals.approverId],
		references: [userProfiles.id],
		relationName: "offerApprovals_approverId_userProfiles_id"
	}),
	offer: one(offers, {
		fields: [offerApprovals.offerId],
		references: [offers.id]
	}),
	organization: one(organizations, {
		fields: [offerApprovals.orgId],
		references: [organizations.id]
	}),
	userProfile_requestedBy: one(userProfiles, {
		fields: [offerApprovals.requestedBy],
		references: [userProfiles.id],
		relationName: "offerApprovals_requestedBy_userProfiles_id"
	}),
}));

export const contactSkillsRelations = relations(contactSkills, ({one}) => ({
	contact: one(contacts, {
		fields: [contactSkills.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [contactSkills.orgId],
		references: [organizations.id]
	}),
	skill: one(skills, {
		fields: [contactSkills.skillId],
		references: [skills.id]
	}),
	userProfile: one(userProfiles, {
		fields: [contactSkills.verifiedBy],
		references: [userProfiles.id]
	}),
}));

export const contactWorkHistoryRelations = relations(contactWorkHistory, ({one}) => ({
	contact_companyContactId: one(contacts, {
		fields: [contactWorkHistory.companyContactId],
		references: [contacts.id],
		relationName: "contactWorkHistory_companyContactId_contacts_id"
	}),
	contact_contactId: one(contacts, {
		fields: [contactWorkHistory.contactId],
		references: [contacts.id],
		relationName: "contactWorkHistory_contactId_contacts_id"
	}),
	organization: one(organizations, {
		fields: [contactWorkHistory.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [contactWorkHistory.verifiedBy],
		references: [userProfiles.id]
	}),
}));

export const contactEducationRelations = relations(contactEducation, ({one}) => ({
	contact: one(contacts, {
		fields: [contactEducation.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [contactEducation.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [contactEducation.verifiedBy],
		references: [userProfiles.id]
	}),
}));

export const contactCertificationsRelations = relations(contactCertifications, ({one}) => ({
	contact: one(contacts, {
		fields: [contactCertifications.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [contactCertifications.orgId],
		references: [organizations.id]
	}),
}));

export const placementMilestonesRelations = relations(placementMilestones, ({one}) => ({
	organization: one(organizations, {
		fields: [placementMilestones.orgId],
		references: [organizations.id]
	}),
	placement: one(placements, {
		fields: [placementMilestones.placementId],
		references: [placements.id]
	}),
}));

export const contactRateCardsRelations = relations(contactRateCards, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [contactRateCards.approvedBy],
		references: [userProfiles.id]
	}),
	contact_clientId: one(contacts, {
		fields: [contactRateCards.clientId],
		references: [contacts.id],
		relationName: "contactRateCards_clientId_contacts_id"
	}),
	contact_contactId: one(contacts, {
		fields: [contactRateCards.contactId],
		references: [contacts.id],
		relationName: "contactRateCards_contactId_contacts_id"
	}),
	organization: one(organizations, {
		fields: [contactRateCards.orgId],
		references: [organizations.id]
	}),
	skill: one(skills, {
		fields: [contactRateCards.skillId],
		references: [skills.id]
	}),
}));

export const placementExtensionsRelations = relations(placementExtensions, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [placementExtensions.approvedBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [placementExtensions.orgId],
		references: [organizations.id]
	}),
	placement: one(placements, {
		fields: [placementExtensions.placementId],
		references: [placements.id]
	}),
}));

export const placementRatesRelations = relations(placementRates, ({one}) => ({
	organization: one(organizations, {
		fields: [placementRates.orgId],
		references: [organizations.id]
	}),
	placement: one(placements, {
		fields: [placementRates.placementId],
		references: [placements.id]
	}),
}));

export const contactAgreementsRelations = relations(contactAgreements, ({one}) => ({
	contact: one(contacts, {
		fields: [contactAgreements.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [contactAgreements.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [contactAgreements.ourSignerId],
		references: [userProfiles.id]
	}),
}));

export const contactComplianceRelations = relations(contactCompliance, ({one}) => ({
	contact: one(contacts, {
		fields: [contactCompliance.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [contactCompliance.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [contactCompliance.verifiedBy],
		references: [userProfiles.id]
	}),
}));

export const groupMembersRelations = relations(groupMembers, ({one}) => ({
	userProfile_backupUserId: one(userProfiles, {
		fields: [groupMembers.backupUserId],
		references: [userProfiles.id],
		relationName: "groupMembers_backupUserId_userProfiles_id"
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [groupMembers.createdBy],
		references: [userProfiles.id],
		relationName: "groupMembers_createdBy_userProfiles_id"
	}),
	group: one(groups, {
		fields: [groupMembers.groupId],
		references: [groups.id]
	}),
	organization: one(organizations, {
		fields: [groupMembers.orgId],
		references: [organizations.id]
	}),
	userProfile_userId: one(userProfiles, {
		fields: [groupMembers.userId],
		references: [userProfiles.id],
		relationName: "groupMembers_userId_userProfiles_id"
	}),
}));

export const contactCommunicationPreferencesRelations = relations(contactCommunicationPreferences, ({one}) => ({
	contact: one(contacts, {
		fields: [contactCommunicationPreferences.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [contactCommunicationPreferences.orgId],
		references: [organizations.id]
	}),
}));

export const contactMergeHistoryRelations = relations(contactMergeHistory, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [contactMergeHistory.mergedBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [contactMergeHistory.orgId],
		references: [organizations.id]
	}),
	contact: one(contacts, {
		fields: [contactMergeHistory.survivorContactId],
		references: [contacts.id]
	}),
}));

export const noteReactionsRelations = relations(noteReactions, ({one}) => ({
	note: one(notes, {
		fields: [noteReactions.noteId],
		references: [notes.id]
	}),
	userProfile: one(userProfiles, {
		fields: [noteReactions.userId],
		references: [userProfiles.id]
	}),
}));

export const groupRegionsRelations = relations(groupRegions, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [groupRegions.createdBy],
		references: [userProfiles.id]
	}),
	group: one(groups, {
		fields: [groupRegions.groupId],
		references: [groups.id]
	}),
	organization: one(organizations, {
		fields: [groupRegions.orgId],
		references: [organizations.id]
	}),
	region: one(regions, {
		fields: [groupRegions.regionId],
		references: [regions.id]
	}),
}));

export const meetingNotesRelations = relations(meetingNotes, ({one}) => ({
	userProfile_createdBy: one(userProfiles, {
		fields: [meetingNotes.createdBy],
		references: [userProfiles.id],
		relationName: "meetingNotes_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [meetingNotes.orgId],
		references: [organizations.id]
	}),
	userProfile_updatedBy: one(userProfiles, {
		fields: [meetingNotes.updatedBy],
		references: [userProfiles.id],
		relationName: "meetingNotes_updatedBy_userProfiles_id"
	}),
}));

export const escalationsRelations = relations(escalations, ({one, many}) => ({
	userProfile_assignedTo: one(userProfiles, {
		fields: [escalations.assignedTo],
		references: [userProfiles.id],
		relationName: "escalations_assignedTo_userProfiles_id"
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [escalations.createdBy],
		references: [userProfiles.id],
		relationName: "escalations_createdBy_userProfiles_id"
	}),
	userProfile_escalatedTo: one(userProfiles, {
		fields: [escalations.escalatedTo],
		references: [userProfiles.id],
		relationName: "escalations_escalatedTo_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [escalations.orgId],
		references: [organizations.id]
	}),
	userProfile_resolvedBy: one(userProfiles, {
		fields: [escalations.resolvedBy],
		references: [userProfiles.id],
		relationName: "escalations_resolvedBy_userProfiles_id"
	}),
	escalationUpdates: many(escalationUpdates),
}));

export const escalationUpdatesRelations = relations(escalationUpdates, ({one}) => ({
	userProfile_createdBy: one(userProfiles, {
		fields: [escalationUpdates.createdBy],
		references: [userProfiles.id],
		relationName: "escalationUpdates_createdBy_userProfiles_id"
	}),
	escalation: one(escalations, {
		fields: [escalationUpdates.escalationId],
		references: [escalations.id]
	}),
	userProfile_newAssigneeId: one(userProfiles, {
		fields: [escalationUpdates.newAssigneeId],
		references: [userProfiles.id],
		relationName: "escalationUpdates_newAssigneeId_userProfiles_id"
	}),
	userProfile_oldAssigneeId: one(userProfiles, {
		fields: [escalationUpdates.oldAssigneeId],
		references: [userProfiles.id],
		relationName: "escalationUpdates_oldAssigneeId_userProfiles_id"
	}),
}));

export const documentAccessLogRelations = relations(documentAccessLog, ({one}) => ({
	document: one(documents, {
		fields: [documentAccessLog.documentId],
		references: [documents.id]
	}),
	userProfile: one(userProfiles, {
		fields: [documentAccessLog.userId],
		references: [userProfiles.id]
	}),
}));

export const companyClientDetailsRelations = relations(companyClientDetails, ({one}) => ({
	company: one(companies, {
		fields: [companyClientDetails.companyId],
		references: [companies.id]
	}),
	userProfile: one(userProfiles, {
		fields: [companyClientDetails.executiveSponsorId],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [companyClientDetails.orgId],
		references: [organizations.id]
	}),
}));

export const entityDraftsRelations = relations(entityDrafts, ({one}) => ({
	organization: one(organizations, {
		fields: [entityDrafts.orgId],
		references: [organizations.id]
	}),
}));

export const companyVendorDetailsRelations = relations(companyVendorDetails, ({one}) => ({
	company: one(companies, {
		fields: [companyVendorDetails.companyId],
		references: [companies.id]
	}),
	organization: one(organizations, {
		fields: [companyVendorDetails.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [companyVendorDetails.vendorManagerId],
		references: [userProfiles.id]
	}),
}));

export const companyPartnerDetailsRelations = relations(companyPartnerDetails, ({one}) => ({
	company: one(companies, {
		fields: [companyPartnerDetails.companyId],
		references: [companies.id]
	}),
	organization: one(organizations, {
		fields: [companyPartnerDetails.orgId],
		references: [organizations.id]
	}),
}));

export const dataRetentionPoliciesRelations = relations(dataRetentionPolicies, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [dataRetentionPolicies.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [dataRetentionPolicies.orgId],
		references: [organizations.id]
	}),
}));

export const complianceRequirementsRelations = relations(complianceRequirements, ({one, many}) => ({
	userProfile: one(userProfiles, {
		fields: [complianceRequirements.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [complianceRequirements.orgId],
		references: [organizations.id]
	}),
	complianceItems: many(complianceItems),
	entityComplianceRequirements: many(entityComplianceRequirements),
}));

export const complianceItemsRelations = relations(complianceItems, ({one}) => ({
	userProfile_createdBy: one(userProfiles, {
		fields: [complianceItems.createdBy],
		references: [userProfiles.id],
		relationName: "complianceItems_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [complianceItems.orgId],
		references: [organizations.id]
	}),
	complianceRequirement: one(complianceRequirements, {
		fields: [complianceItems.requirementId],
		references: [complianceRequirements.id]
	}),
	userProfile_verifiedBy: one(userProfiles, {
		fields: [complianceItems.verifiedBy],
		references: [userProfiles.id],
		relationName: "complianceItems_verifiedBy_userProfiles_id"
	}),
	userProfile_waivedBy: one(userProfiles, {
		fields: [complianceItems.waivedBy],
		references: [userProfiles.id],
		relationName: "complianceItems_waivedBy_userProfiles_id"
	}),
}));

export const entityComplianceRequirementsRelations = relations(entityComplianceRequirements, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [entityComplianceRequirements.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [entityComplianceRequirements.orgId],
		references: [organizations.id]
	}),
	complianceRequirement: one(complianceRequirements, {
		fields: [entityComplianceRequirements.requirementId],
		references: [complianceRequirements.id]
	}),
}));

export const contractsRelations = relations(contracts, ({one, many}) => ({
	userProfile_createdBy: one(userProfiles, {
		fields: [contracts.createdBy],
		references: [userProfiles.id],
		relationName: "contracts_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [contracts.orgId],
		references: [organizations.id]
	}),
	userProfile_ownerId: one(userProfiles, {
		fields: [contracts.ownerId],
		references: [userProfiles.id],
		relationName: "contracts_ownerId_userProfiles_id"
	}),
	contract_parentContractId: one(contracts, {
		fields: [contracts.parentContractId],
		references: [contracts.id],
		relationName: "contracts_parentContractId_contracts_id"
	}),
	contracts_parentContractId: many(contracts, {
		relationName: "contracts_parentContractId_contracts_id"
	}),
	contract_previousVersionId: one(contracts, {
		fields: [contracts.previousVersionId],
		references: [contracts.id],
		relationName: "contracts_previousVersionId_contracts_id"
	}),
	contracts_previousVersionId: many(contracts, {
		relationName: "contracts_previousVersionId_contracts_id"
	}),
	userProfile_terminatedBy: one(userProfiles, {
		fields: [contracts.terminatedBy],
		references: [userProfiles.id],
		relationName: "contracts_terminatedBy_userProfiles_id"
	}),
	contractVersions: many(contractVersions),
	contractParties: many(contractParties),
	placements: many(placements),
	placementVendors: many(placementVendors),
}));

export const contractVersionsRelations = relations(contractVersions, ({one}) => ({
	userProfile_approvedBy: one(userProfiles, {
		fields: [contractVersions.approvedBy],
		references: [userProfiles.id],
		relationName: "contractVersions_approvedBy_userProfiles_id"
	}),
	contract: one(contracts, {
		fields: [contractVersions.contractId],
		references: [contracts.id]
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [contractVersions.createdBy],
		references: [userProfiles.id],
		relationName: "contractVersions_createdBy_userProfiles_id"
	}),
}));

export const contractPartiesRelations = relations(contractParties, ({one}) => ({
	company: one(companies, {
		fields: [contractParties.companyId],
		references: [companies.id]
	}),
	contact: one(contacts, {
		fields: [contractParties.contactId],
		references: [contacts.id]
	}),
	contract: one(contracts, {
		fields: [contractParties.contractId],
		references: [contracts.id]
	}),
	organization: one(organizations, {
		fields: [contractParties.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [contractParties.userId],
		references: [userProfiles.id]
	}),
}));

export const contractTemplatesRelations = relations(contractTemplates, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [contractTemplates.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [contractTemplates.orgId],
		references: [organizations.id]
	}),
}));

export const contractClausesRelations = relations(contractClauses, ({one}) => ({
	userProfile_createdBy: one(userProfiles, {
		fields: [contractClauses.createdBy],
		references: [userProfiles.id],
		relationName: "contractClauses_createdBy_userProfiles_id"
	}),
	userProfile_legalApprovedBy: one(userProfiles, {
		fields: [contractClauses.legalApprovedBy],
		references: [userProfiles.id],
		relationName: "contractClauses_legalApprovedBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [contractClauses.orgId],
		references: [organizations.id]
	}),
}));

export const rateApprovalsRelations = relations(rateApprovals, ({one}) => ({
	userProfile_decidedBy: one(userProfiles, {
		fields: [rateApprovals.decidedBy],
		references: [userProfiles.id],
		relationName: "rateApprovals_decidedBy_userProfiles_id"
	}),
	entityRate: one(entityRates, {
		fields: [rateApprovals.entityRateId],
		references: [entityRates.id]
	}),
	organization: one(organizations, {
		fields: [rateApprovals.orgId],
		references: [organizations.id]
	}),
	userProfile_requestedBy: one(userProfiles, {
		fields: [rateApprovals.requestedBy],
		references: [userProfiles.id],
		relationName: "rateApprovals_requestedBy_userProfiles_id"
	}),
}));

export const entityRatesRelations = relations(entityRates, ({one, many}) => ({
	rateApprovals: many(rateApprovals),
	userProfile_approvedBy: one(userProfiles, {
		fields: [entityRates.approvedBy],
		references: [userProfiles.id],
		relationName: "entityRates_approvedBy_userProfiles_id"
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [entityRates.createdBy],
		references: [userProfiles.id],
		relationName: "entityRates_createdBy_userProfiles_id"
	}),
	userProfile_negotiatedBy: one(userProfiles, {
		fields: [entityRates.negotiatedBy],
		references: [userProfiles.id],
		relationName: "entityRates_negotiatedBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [entityRates.orgId],
		references: [organizations.id]
	}),
	rateCard: one(rateCards, {
		fields: [entityRates.rateCardId],
		references: [rateCards.id]
	}),
	rateCardItem: one(rateCardItems, {
		fields: [entityRates.rateCardItemId],
		references: [rateCardItems.id]
	}),
	rateChangeHistories: many(rateChangeHistory),
}));

export const rateCardsRelations = relations(rateCards, ({one, many}) => ({
	userProfile_approvedBy: one(userProfiles, {
		fields: [rateCards.approvedBy],
		references: [userProfiles.id],
		relationName: "rateCards_approvedBy_userProfiles_id"
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [rateCards.createdBy],
		references: [userProfiles.id],
		relationName: "rateCards_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [rateCards.orgId],
		references: [organizations.id]
	}),
	rateCard: one(rateCards, {
		fields: [rateCards.previousVersionId],
		references: [rateCards.id],
		relationName: "rateCards_previousVersionId_rateCards_id"
	}),
	rateCards: many(rateCards, {
		relationName: "rateCards_previousVersionId_rateCards_id"
	}),
	rateCardItems: many(rateCardItems),
	entityRates: many(entityRates),
	submissions: many(submissions),
	placements: many(placements),
}));

export const rateCardItemsRelations = relations(rateCardItems, ({one, many}) => ({
	organization: one(organizations, {
		fields: [rateCardItems.orgId],
		references: [organizations.id]
	}),
	rateCard: one(rateCards, {
		fields: [rateCardItems.rateCardId],
		references: [rateCards.id]
	}),
	entityRates: many(entityRates),
	submissions: many(submissions),
	placements: many(placements),
}));

export const rateChangeHistoryRelations = relations(rateChangeHistory, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [rateChangeHistory.changedBy],
		references: [userProfiles.id]
	}),
	entityRate: one(entityRates, {
		fields: [rateChangeHistory.entityRateId],
		references: [entityRates.id]
	}),
}));

export const interviewParticipantsRelations = relations(interviewParticipants, ({one, many}) => ({
	contact: one(contacts, {
		fields: [interviewParticipants.contactId],
		references: [contacts.id]
	}),
	interview: one(interviews, {
		fields: [interviewParticipants.interviewId],
		references: [interviews.id]
	}),
	organization: one(organizations, {
		fields: [interviewParticipants.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [interviewParticipants.userId],
		references: [userProfiles.id]
	}),
	interviewScorecards: many(interviewScorecards),
}));

export const interviewScorecardsRelations = relations(interviewScorecards, ({one}) => ({
	interview: one(interviews, {
		fields: [interviewScorecards.interviewId],
		references: [interviews.id]
	}),
	organization: one(organizations, {
		fields: [interviewScorecards.orgId],
		references: [organizations.id]
	}),
	interviewParticipant: one(interviewParticipants, {
		fields: [interviewScorecards.participantId],
		references: [interviewParticipants.id]
	}),
	userProfile: one(userProfiles, {
		fields: [interviewScorecards.submittedBy],
		references: [userProfiles.id]
	}),
}));

export const scorecardTemplatesRelations = relations(scorecardTemplates, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [scorecardTemplates.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [scorecardTemplates.orgId],
		references: [organizations.id]
	}),
}));

export const placementVendorsRelations = relations(placementVendors, ({one}) => ({
	organization: one(organizations, {
		fields: [placementVendors.orgId],
		references: [organizations.id]
	}),
	placement: one(placements, {
		fields: [placementVendors.placementId],
		references: [placements.id]
	}),
	company: one(companies, {
		fields: [placementVendors.vendorCompanyId],
		references: [companies.id]
	}),
	contact: one(contacts, {
		fields: [placementVendors.vendorContactId],
		references: [contacts.id]
	}),
	contract: one(contracts, {
		fields: [placementVendors.vendorContractId],
		references: [contracts.id]
	}),
}));

export const placementChangeOrdersRelations = relations(placementChangeOrders, ({one}) => ({
	userProfile_approvedBy: one(userProfiles, {
		fields: [placementChangeOrders.approvedBy],
		references: [userProfiles.id],
		relationName: "placementChangeOrders_approvedBy_userProfiles_id"
	}),
	document: one(documents, {
		fields: [placementChangeOrders.documentId],
		references: [documents.id]
	}),
	organization: one(organizations, {
		fields: [placementChangeOrders.orgId],
		references: [organizations.id]
	}),
	placement: one(placements, {
		fields: [placementChangeOrders.placementId],
		references: [placements.id]
	}),
	userProfile_requestedBy: one(userProfiles, {
		fields: [placementChangeOrders.requestedBy],
		references: [userProfiles.id],
		relationName: "placementChangeOrders_requestedBy_userProfiles_id"
	}),
}));

export const placementCheckinsRelations = relations(placementCheckins, ({one}) => ({
	userProfile_clientContactId: one(userProfiles, {
		fields: [placementCheckins.clientContactId],
		references: [userProfiles.id],
		relationName: "placementCheckins_clientContactId_userProfiles_id"
	}),
	userProfile_completedBy: one(userProfiles, {
		fields: [placementCheckins.completedBy],
		references: [userProfiles.id],
		relationName: "placementCheckins_completedBy_userProfiles_id"
	}),
	userProfile_conductedBy: one(userProfiles, {
		fields: [placementCheckins.conductedBy],
		references: [userProfiles.id],
		relationName: "placementCheckins_conductedBy_userProfiles_id"
	}),
	userProfile_escalatedTo: one(userProfiles, {
		fields: [placementCheckins.escalatedTo],
		references: [userProfiles.id],
		relationName: "placementCheckins_escalatedTo_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [placementCheckins.orgId],
		references: [organizations.id]
	}),
	placement: one(placements, {
		fields: [placementCheckins.placementId],
		references: [placements.id]
	}),
}));

export const onboardingTasksRelations = relations(onboardingTasks, ({one}) => ({
	userProfile_assignedTo: one(userProfiles, {
		fields: [onboardingTasks.assignedTo],
		references: [userProfiles.id],
		relationName: "onboardingTasks_assignedTo_userProfiles_id"
	}),
	userProfile_completedBy: one(userProfiles, {
		fields: [onboardingTasks.completedBy],
		references: [userProfiles.id],
		relationName: "onboardingTasks_completedBy_userProfiles_id"
	}),
	document: one(documents, {
		fields: [onboardingTasks.documentId],
		references: [documents.id]
	}),
	employeeOnboarding: one(employeeOnboarding, {
		fields: [onboardingTasks.onboardingId],
		references: [employeeOnboarding.id]
	}),
	organization: one(organizations, {
		fields: [onboardingTasks.orgId],
		references: [organizations.id]
	}),
}));

export const employeeOnboardingRelations = relations(employeeOnboarding, ({one, many}) => ({
	onboardingTasks: many(onboardingTasks),
	userProfile_assignedTo: one(userProfiles, {
		fields: [employeeOnboarding.assignedTo],
		references: [userProfiles.id],
		relationName: "employeeOnboarding_assignedTo_userProfiles_id"
	}),
	contact: one(contacts, {
		fields: [employeeOnboarding.contactId],
		references: [contacts.id]
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [employeeOnboarding.createdBy],
		references: [userProfiles.id],
		relationName: "employeeOnboarding_createdBy_userProfiles_id"
	}),
	employee: one(employees, {
		fields: [employeeOnboarding.employeeId],
		references: [employees.id]
	}),
	organization: one(organizations, {
		fields: [employeeOnboarding.orgId],
		references: [organizations.id]
	}),
	onboardingTemplate: one(onboardingTemplates, {
		fields: [employeeOnboarding.checklistTemplateId],
		references: [onboardingTemplates.id]
	}),
}));

export const onboardingTemplatesRelations = relations(onboardingTemplates, ({one, many}) => ({
	employeeOnboardings: many(employeeOnboarding),
	userProfile_createdBy: one(userProfiles, {
		fields: [onboardingTemplates.createdBy],
		references: [userProfiles.id],
		relationName: "onboardingTemplates_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [onboardingTemplates.orgId],
		references: [organizations.id]
	}),
	userProfile_updatedBy: one(userProfiles, {
		fields: [onboardingTemplates.updatedBy],
		references: [userProfiles.id],
		relationName: "onboardingTemplates_updatedBy_userProfiles_id"
	}),
	onboardingTemplateTasks: many(onboardingTemplateTasks),
}));

export const onboardingTemplateTasksRelations = relations(onboardingTemplateTasks, ({one}) => ({
	document: one(documents, {
		fields: [onboardingTemplateTasks.documentTemplateId],
		references: [documents.id]
	}),
	organization: one(organizations, {
		fields: [onboardingTemplateTasks.orgId],
		references: [organizations.id]
	}),
	onboardingTemplate: one(onboardingTemplates, {
		fields: [onboardingTemplateTasks.templateId],
		references: [onboardingTemplates.id]
	}),
}));

export const timesheetEntriesRelations = relations(timesheetEntries, ({one, many}) => ({
	timesheet: one(timesheets, {
		fields: [timesheetEntries.timesheetId],
		references: [timesheets.id]
	}),
	invoiceLineItems: many(invoiceLineItems),
}));

export const timesheetsRelations = relations(timesheets, ({one, many}) => ({
	timesheetEntries: many(timesheetEntries),
	timesheetApprovals: many(timesheetApprovals),
	timesheetExpenses: many(timesheetExpenses),
	invoiceLineItems: many(invoiceLineItems),
	userProfile_createdBy: one(userProfiles, {
		fields: [timesheets.createdBy],
		references: [userProfiles.id],
		relationName: "timesheets_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [timesheets.orgId],
		references: [organizations.id]
	}),
	placement: one(placements, {
		fields: [timesheets.placementId],
		references: [placements.id]
	}),
	userProfile_submittedBy: one(userProfiles, {
		fields: [timesheets.submittedBy],
		references: [userProfiles.id],
		relationName: "timesheets_submittedBy_userProfiles_id"
	}),
	userProfile_updatedBy: one(userProfiles, {
		fields: [timesheets.updatedBy],
		references: [userProfiles.id],
		relationName: "timesheets_updatedBy_userProfiles_id"
	}),
	timesheetAdjustments_adjustmentTimesheetId: many(timesheetAdjustments, {
		relationName: "timesheetAdjustments_adjustmentTimesheetId_timesheets_id"
	}),
	timesheetAdjustments_originalTimesheetId: many(timesheetAdjustments, {
		relationName: "timesheetAdjustments_originalTimesheetId_timesheets_id"
	}),
}));

export const timesheetApprovalsRelations = relations(timesheetApprovals, ({one}) => ({
	userProfile_approverId: one(userProfiles, {
		fields: [timesheetApprovals.approverId],
		references: [userProfiles.id],
		relationName: "timesheetApprovals_approverId_userProfiles_id"
	}),
	userProfile_delegatedFrom: one(userProfiles, {
		fields: [timesheetApprovals.delegatedFrom],
		references: [userProfiles.id],
		relationName: "timesheetApprovals_delegatedFrom_userProfiles_id"
	}),
	timesheet: one(timesheets, {
		fields: [timesheetApprovals.timesheetId],
		references: [timesheets.id]
	}),
}));

export const timesheetExpensesRelations = relations(timesheetExpenses, ({one}) => ({
	timesheet: one(timesheets, {
		fields: [timesheetExpenses.timesheetId],
		references: [timesheets.id]
	}),
	userProfile: one(userProfiles, {
		fields: [timesheetExpenses.verifiedBy],
		references: [userProfiles.id]
	}),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({one}) => ({
	invoice: one(invoices, {
		fields: [invoiceLineItems.invoiceId],
		references: [invoices.id]
	}),
	placement: one(placements, {
		fields: [invoiceLineItems.placementId],
		references: [placements.id]
	}),
	timesheetEntry: one(timesheetEntries, {
		fields: [invoiceLineItems.timesheetEntryId],
		references: [timesheetEntries.id]
	}),
	timesheet: one(timesheets, {
		fields: [invoiceLineItems.timesheetId],
		references: [timesheets.id]
	}),
}));

export const invoicesRelations = relations(invoices, ({one, many}) => ({
	invoiceLineItems: many(invoiceLineItems),
	contact: one(contacts, {
		fields: [invoices.billingContactId],
		references: [contacts.id]
	}),
	company: one(companies, {
		fields: [invoices.companyId],
		references: [companies.id]
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [invoices.createdBy],
		references: [userProfiles.id],
		relationName: "invoices_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [invoices.orgId],
		references: [organizations.id]
	}),
	userProfile_updatedBy: one(userProfiles, {
		fields: [invoices.updatedBy],
		references: [userProfiles.id],
		relationName: "invoices_updatedBy_userProfiles_id"
	}),
	invoicePayments: many(invoicePayments),
}));

export const payItemsRelations = relations(payItems, ({one, many}) => ({
	contact: one(contacts, {
		fields: [payItems.contactId],
		references: [contacts.id]
	}),
	payRun: one(payRuns, {
		fields: [payItems.payRunId],
		references: [payRuns.id]
	}),
	payItemEarnings: many(payItemEarnings),
	payItemDeductions: many(payItemDeductions),
	payStubs: many(payStubs),
}));

export const payRunsRelations = relations(payRuns, ({one, many}) => ({
	payItems: many(payItems),
	userProfile_approvedBy: one(userProfiles, {
		fields: [payRuns.approvedBy],
		references: [userProfiles.id],
		relationName: "payRuns_approvedBy_userProfiles_id"
	}),
	userProfile_createdBy: one(userProfiles, {
		fields: [payRuns.createdBy],
		references: [userProfiles.id],
		relationName: "payRuns_createdBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [payRuns.orgId],
		references: [organizations.id]
	}),
	payPeriod: one(payPeriods, {
		fields: [payRuns.payPeriodId],
		references: [payPeriods.id]
	}),
}));

export const payItemEarningsRelations = relations(payItemEarnings, ({one}) => ({
	payItem: one(payItems, {
		fields: [payItemEarnings.payItemId],
		references: [payItems.id]
	}),
}));

export const payItemDeductionsRelations = relations(payItemDeductions, ({one}) => ({
	payItem: one(payItems, {
		fields: [payItemDeductions.payItemId],
		references: [payItems.id]
	}),
}));

export const payStubsRelations = relations(payStubs, ({one}) => ({
	payItem: one(payItems, {
		fields: [payStubs.payItemId],
		references: [payItems.id]
	}),
}));

export const timesheetApprovalWorkflowsRelations = relations(timesheetApprovalWorkflows, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [timesheetApprovalWorkflows.escalationTo],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [timesheetApprovalWorkflows.orgId],
		references: [organizations.id]
	}),
}));

export const timesheetAdjustmentsRelations = relations(timesheetAdjustments, ({one}) => ({
	timesheet_adjustmentTimesheetId: one(timesheets, {
		fields: [timesheetAdjustments.adjustmentTimesheetId],
		references: [timesheets.id],
		relationName: "timesheetAdjustments_adjustmentTimesheetId_timesheets_id"
	}),
	userProfile_approvedBy: one(userProfiles, {
		fields: [timesheetAdjustments.approvedBy],
		references: [userProfiles.id],
		relationName: "timesheetAdjustments_approvedBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [timesheetAdjustments.orgId],
		references: [organizations.id]
	}),
	timesheet_originalTimesheetId: one(timesheets, {
		fields: [timesheetAdjustments.originalTimesheetId],
		references: [timesheets.id],
		relationName: "timesheetAdjustments_originalTimesheetId_timesheets_id"
	}),
	userProfile_requestedBy: one(userProfiles, {
		fields: [timesheetAdjustments.requestedBy],
		references: [userProfiles.id],
		relationName: "timesheetAdjustments_requestedBy_userProfiles_id"
	}),
}));

export const timesheetTemplatesRelations = relations(timesheetTemplates, ({one}) => ({
	organization: one(organizations, {
		fields: [timesheetTemplates.orgId],
		references: [organizations.id]
	}),
}));

export const invoicePaymentsRelations = relations(invoicePayments, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [invoicePayments.createdBy],
		references: [userProfiles.id]
	}),
	invoice: one(invoices, {
		fields: [invoicePayments.invoiceId],
		references: [invoices.id]
	}),
	organization: one(organizations, {
		fields: [invoicePayments.orgId],
		references: [organizations.id]
	}),
}));

export const paymentTermsRelations = relations(paymentTerms, ({one, many}) => ({
	organization: one(organizations, {
		fields: [paymentTerms.orgId],
		references: [organizations.id]
	}),
	invoiceTemplates: many(invoiceTemplates),
}));

export const invoiceBatchesRelations = relations(invoiceBatches, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [invoiceBatches.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [invoiceBatches.orgId],
		references: [organizations.id]
	}),
}));

export const invoiceTemplatesRelations = relations(invoiceTemplates, ({one}) => ({
	paymentTerm: one(paymentTerms, {
		fields: [invoiceTemplates.defaultPaymentTermsId],
		references: [paymentTerms.id]
	}),
	organization: one(organizations, {
		fields: [invoiceTemplates.orgId],
		references: [organizations.id]
	}),
}));

export const payPeriodsRelations = relations(payPeriods, ({one, many}) => ({
	organization: one(organizations, {
		fields: [payPeriods.orgId],
		references: [organizations.id]
	}),
	payRuns: many(payRuns),
}));

export const workerTaxSetupRelations = relations(workerTaxSetup, ({one}) => ({
	contact: one(contacts, {
		fields: [workerTaxSetup.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [workerTaxSetup.orgId],
		references: [organizations.id]
	}),
}));

export const workerBenefitsRelations = relations(workerBenefits, ({one}) => ({
	contact: one(contacts, {
		fields: [workerBenefits.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [workerBenefits.orgId],
		references: [organizations.id]
	}),
}));

export const workerGarnishmentsRelations = relations(workerGarnishments, ({one}) => ({
	contact: one(contacts, {
		fields: [workerGarnishments.contactId],
		references: [contacts.id]
	}),
	organization: one(organizations, {
		fields: [workerGarnishments.orgId],
		references: [organizations.id]
	}),
}));

export const taxDocumentsRelations = relations(taxDocuments, ({one, many}) => ({
	contact: one(contacts, {
		fields: [taxDocuments.contactId],
		references: [contacts.id]
	}),
	taxDocument: one(taxDocuments, {
		fields: [taxDocuments.correctsDocumentId],
		references: [taxDocuments.id],
		relationName: "taxDocuments_correctsDocumentId_taxDocuments_id"
	}),
	taxDocuments: many(taxDocuments, {
		relationName: "taxDocuments_correctsDocumentId_taxDocuments_id"
	}),
	organization: one(organizations, {
		fields: [taxDocuments.orgId],
		references: [organizations.id]
	}),
}));

export const workflowExecutionsRelations = relations(workflowExecutions, ({one, many}) => ({
	workflowInstance: one(workflowInstances, {
		fields: [workflowExecutions.instanceId],
		references: [workflowInstances.id]
	}),
	organization: one(organizations, {
		fields: [workflowExecutions.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [workflowExecutions.triggeredBy],
		references: [userProfiles.id]
	}),
	workflowSteps: many(workflowSteps),
	workflowActions: many(workflowActions),
	workflowApprovals: many(workflowApprovals),
	workflowExecutionLogs: many(workflowExecutionLogs),
}));

export const workflowStepsRelations = relations(workflowSteps, ({one, many}) => ({
	workflowExecution: one(workflowExecutions, {
		fields: [workflowSteps.executionId],
		references: [workflowExecutions.id]
	}),
	workflowState: one(workflowStates, {
		fields: [workflowSteps.stateId],
		references: [workflowStates.id]
	}),
	workflowTransition: one(workflowTransitions, {
		fields: [workflowSteps.transitionId],
		references: [workflowTransitions.id]
	}),
	workflowActions: many(workflowActions),
	workflowApprovals: many(workflowApprovals),
	workflowExecutionLogs: many(workflowExecutionLogs),
}));

export const workflowActionsRelations = relations(workflowActions, ({one, many}) => ({
	workflowExecution: one(workflowExecutions, {
		fields: [workflowActions.executionId],
		references: [workflowExecutions.id]
	}),
	workflowStep: one(workflowSteps, {
		fields: [workflowActions.stepId],
		references: [workflowSteps.id]
	}),
	workflowExecutionLogs: many(workflowExecutionLogs),
}));

export const workflowApprovalsRelations = relations(workflowApprovals, ({one}) => ({
	userProfile_approverId: one(userProfiles, {
		fields: [workflowApprovals.approverId],
		references: [userProfiles.id],
		relationName: "workflowApprovals_approverId_userProfiles_id"
	}),
	userProfile_delegatedTo: one(userProfiles, {
		fields: [workflowApprovals.delegatedTo],
		references: [userProfiles.id],
		relationName: "workflowApprovals_delegatedTo_userProfiles_id"
	}),
	userProfile_escalatedTo: one(userProfiles, {
		fields: [workflowApprovals.escalatedTo],
		references: [userProfiles.id],
		relationName: "workflowApprovals_escalatedTo_userProfiles_id"
	}),
	workflowExecution: one(workflowExecutions, {
		fields: [workflowApprovals.executionId],
		references: [workflowExecutions.id]
	}),
	organization: one(organizations, {
		fields: [workflowApprovals.orgId],
		references: [organizations.id]
	}),
	workflowStep: one(workflowSteps, {
		fields: [workflowApprovals.stepId],
		references: [workflowSteps.id]
	}),
}));

export const workflowExecutionLogsRelations = relations(workflowExecutionLogs, ({one}) => ({
	workflowAction: one(workflowActions, {
		fields: [workflowExecutionLogs.actionId],
		references: [workflowActions.id]
	}),
	workflowExecution: one(workflowExecutions, {
		fields: [workflowExecutionLogs.executionId],
		references: [workflowExecutions.id]
	}),
	workflowStep: one(workflowSteps, {
		fields: [workflowExecutionLogs.stepId],
		references: [workflowSteps.id]
	}),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({one}) => ({
	organization: one(organizations, {
		fields: [notificationPreferences.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [notificationPreferences.userId],
		references: [userProfiles.id]
	}),
}));

export const notificationTemplatesRelations = relations(notificationTemplates, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [notificationTemplates.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [notificationTemplates.orgId],
		references: [organizations.id]
	}),
}));

export const campaignEnrollmentsRelations = relations(campaignEnrollments, ({one, many}) => ({
	campaign: one(campaigns, {
		fields: [campaignEnrollments.campaignId],
		references: [campaigns.id]
	}),
	contact: one(contacts, {
		fields: [campaignEnrollments.contactId],
		references: [contacts.id]
	}),
	lead: one(leads, {
		fields: [campaignEnrollments.convertedLeadId],
		references: [leads.id]
	}),
	organization: one(organizations, {
		fields: [campaignEnrollments.orgId],
		references: [organizations.id]
	}),
	campaignSequenceLogs: many(campaignSequenceLogs),
}));

export const campaignSequenceLogsRelations = relations(campaignSequenceLogs, ({one}) => ({
	campaign: one(campaigns, {
		fields: [campaignSequenceLogs.campaignId],
		references: [campaigns.id]
	}),
	campaignEnrollment: one(campaignEnrollments, {
		fields: [campaignSequenceLogs.enrollmentId],
		references: [campaignEnrollments.id]
	}),
	organization: one(organizations, {
		fields: [campaignSequenceLogs.orgId],
		references: [organizations.id]
	}),
}));

export const communicationsRelations = relations(communications, ({one, many}) => ({
	campaign: one(campaigns, {
		fields: [communications.campaignId],
		references: [campaigns.id]
	}),
	contact: one(contacts, {
		fields: [communications.contactId],
		references: [contacts.id]
	}),
	userProfile: one(userProfiles, {
		fields: [communications.createdBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [communications.orgId],
		references: [organizations.id]
	}),
	communication_parentId: one(communications, {
		fields: [communications.parentId],
		references: [communications.id],
		relationName: "communications_parentId_communications_id"
	}),
	communications_parentId: many(communications, {
		relationName: "communications_parentId_communications_id"
	}),
	communication_threadId: one(communications, {
		fields: [communications.threadId],
		references: [communications.id],
		relationName: "communications_threadId_communications_id"
	}),
	communications_threadId: many(communications, {
		relationName: "communications_threadId_communications_id"
	}),
	communicationEvents: many(communicationEvents),
}));

export const communicationEventsRelations = relations(communicationEvents, ({one}) => ({
	communication: one(communications, {
		fields: [communicationEvents.communicationId],
		references: [communications.id]
	}),
}));

export const ptoBalancesRelations = relations(ptoBalances, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [ptoBalances.employeeId],
		references: [userProfiles.id]
	}),
}));

export const userRolesRelations = relations(userRoles, ({one}) => ({
	userProfile_assignedBy: one(userProfiles, {
		fields: [userRoles.assignedBy],
		references: [userProfiles.id],
		relationName: "userRoles_assignedBy_userProfiles_id"
	}),
	role: one(roles, {
		fields: [userRoles.roleId],
		references: [roles.id]
	}),
	userProfile_userId: one(userProfiles, {
		fields: [userRoles.userId],
		references: [userProfiles.id],
		relationName: "userRoles_userId_userProfiles_id"
	}),
}));

export const systemEvents202512Relations = relations(systemEvents202512, ({one}) => ({
	organization: one(organizations, {
		fields: [systemEvents202512.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [systemEvents202512.userId],
		references: [userProfiles.id]
	}),
}));

export const systemEvents202601Relations = relations(systemEvents202601, ({one}) => ({
	organization: one(organizations, {
		fields: [systemEvents202601.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [systemEvents202601.userId],
		references: [userProfiles.id]
	}),
}));

export const systemEvents202602Relations = relations(systemEvents202602, ({one}) => ({
	organization: one(organizations, {
		fields: [systemEvents202602.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [systemEvents202602.userId],
		references: [userProfiles.id]
	}),
}));

export const systemEvents202603Relations = relations(systemEvents202603, ({one}) => ({
	organization: one(organizations, {
		fields: [systemEvents202603.orgId],
		references: [organizations.id]
	}),
	userProfile: one(userProfiles, {
		fields: [systemEvents202603.userId],
		references: [userProfiles.id]
	}),
}));

export const auditLog202602Relations = relations(auditLog202602, ({one}) => ({
	userProfile_impersonatedBy: one(userProfiles, {
		fields: [auditLog202602.impersonatedBy],
		references: [userProfiles.id],
		relationName: "auditLog202602_impersonatedBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [auditLog202602.orgId],
		references: [organizations.id]
	}),
	userProfile_performedBy: one(userProfiles, {
		fields: [auditLog202602.performedBy],
		references: [userProfiles.id],
		relationName: "auditLog202602_performedBy_userProfiles_id"
	}),
}));

export const auditLog202603Relations = relations(auditLog202603, ({one}) => ({
	userProfile_impersonatedBy: one(userProfiles, {
		fields: [auditLog202603.impersonatedBy],
		references: [userProfiles.id],
		relationName: "auditLog202603_impersonatedBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [auditLog202603.orgId],
		references: [organizations.id]
	}),
	userProfile_performedBy: one(userProfiles, {
		fields: [auditLog202603.performedBy],
		references: [userProfiles.id],
		relationName: "auditLog202603_performedBy_userProfiles_id"
	}),
}));

export const auditLog202512Relations = relations(auditLog202512, ({one}) => ({
	userProfile_impersonatedBy: one(userProfiles, {
		fields: [auditLog202512.impersonatedBy],
		references: [userProfiles.id],
		relationName: "auditLog202512_impersonatedBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [auditLog202512.orgId],
		references: [organizations.id]
	}),
	userProfile_performedBy: one(userProfiles, {
		fields: [auditLog202512.performedBy],
		references: [userProfiles.id],
		relationName: "auditLog202512_performedBy_userProfiles_id"
	}),
}));

export const auditLog202601Relations = relations(auditLog202601, ({one}) => ({
	userProfile_impersonatedBy: one(userProfiles, {
		fields: [auditLog202601.impersonatedBy],
		references: [userProfiles.id],
		relationName: "auditLog202601_impersonatedBy_userProfiles_id"
	}),
	organization: one(organizations, {
		fields: [auditLog202601.orgId],
		references: [organizations.id]
	}),
	userProfile_performedBy: one(userProfiles, {
		fields: [auditLog202601.performedBy],
		references: [userProfiles.id],
		relationName: "auditLog202601_performedBy_userProfiles_id"
	}),
}));

export const entityHistory202601Relations = relations(entityHistory202601, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [entityHistory202601.changedBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [entityHistory202601.orgId],
		references: [organizations.id]
	}),
}));

export const entityHistory202602Relations = relations(entityHistory202602, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [entityHistory202602.changedBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [entityHistory202602.orgId],
		references: [organizations.id]
	}),
}));

export const entityHistory202603Relations = relations(entityHistory202603, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [entityHistory202603.changedBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [entityHistory202603.orgId],
		references: [organizations.id]
	}),
}));

export const entityHistory202512Relations = relations(entityHistory202512, ({one}) => ({
	userProfile: one(userProfiles, {
		fields: [entityHistory202512.changedBy],
		references: [userProfiles.id]
	}),
	organization: one(organizations, {
		fields: [entityHistory202512.orgId],
		references: [organizations.id]
	}),
}));