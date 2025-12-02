/**
 * Portal Screen Definitions
 *
 * Exports all portal screen definitions for external users:
 * - Client Portal: For hiring managers and external stakeholders
 * - Talent Portal: For job seekers and candidates
 * - Academy Portal: For training and learning platform
 */

// ===========================================
// CLIENT PORTAL SCREENS
// ===========================================
export {
  clientDashboardScreen,
  clientJobsListScreen,
  clientJobDetailScreen,
  clientSubmissionsScreen,
  clientSubmissionDetailScreen,
  clientInterviewsScreen,
  clientInterviewDetailScreen,
  clientPlacementsScreen,
  clientPlacementDetailScreen,
  clientReportsScreen,
  clientSettingsScreen,
} from './client';

// ===========================================
// TALENT PORTAL SCREENS
// ===========================================
export {
  talentDashboardScreen,
  talentProfileScreen,
  talentJobSearchScreen,
  talentJobDetailScreen,
  talentApplicationFlowScreen,
  talentApplicationsScreen,
  talentApplicationDetailScreen,
  talentInterviewsScreen,
  talentInterviewDetailScreen,
  talentOffersScreen,
  talentOfferDetailScreen,
  talentSavedJobsScreen,
  talentSettingsScreen,
} from './talent';

// ===========================================
// ACADEMY PORTAL SCREENS
// ===========================================
export {
  academyDashboardScreen,
  academyCoursesCatalogScreen,
  academyCourseDetailScreen,
  academyLessonViewScreen,
  academyMyLearningScreen,
  academyCertificatesScreen,
  academyAchievementsScreen,
} from './academy';

// ===========================================
// SCREEN REGISTRY BY PORTAL
// ===========================================
export const clientPortalScreens = {
  dashboard: 'client-dashboard',
  jobsList: 'client-jobs-list',
  jobDetail: 'client-job-detail',
  submissions: 'client-submissions',
  submissionDetail: 'client-submission-detail',
  interviews: 'client-interviews',
  interviewDetail: 'client-interview-detail',
  placements: 'client-placements',
  placementDetail: 'client-placement-detail',
  reports: 'client-reports',
  settings: 'client-settings',
} as const;

export const talentPortalScreens = {
  dashboard: 'talent-dashboard',
  profile: 'talent-profile',
  jobSearch: 'talent-job-search',
  jobDetail: 'talent-job-detail',
  applicationFlow: 'talent-application-flow',
  applications: 'talent-applications',
  applicationDetail: 'talent-application-detail',
  interviews: 'talent-interviews',
  interviewDetail: 'talent-interview-detail',
  offers: 'talent-offers',
  offerDetail: 'talent-offer-detail',
  savedJobs: 'talent-saved-jobs',
  settings: 'talent-settings',
} as const;

export const academyPortalScreens = {
  dashboard: 'academy-dashboard',
  coursesCatalog: 'academy-courses-catalog',
  courseDetail: 'academy-course-detail',
  lessonView: 'academy-lesson-view',
  myLearning: 'academy-my-learning',
  certificates: 'academy-certificates',
  achievements: 'academy-achievements',
} as const;
