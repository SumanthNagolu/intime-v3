import { router } from './init'
import { adminRouter } from '../routers/admin'
import { podsRouter } from '../routers/pods'
import { usersRouter } from '../routers/users'
import { permissionsRouter } from '../routers/permissions'
import { settingsRouter } from '../routers/settings'
import { dataRouter } from '../routers/data'
import { integrationsRouter } from '../routers/integrations'
import { auditRouter } from '../routers/audit'
import { workflowsRouter } from '../routers/workflows'
import { emailTemplatesRouter } from '../routers/emailTemplates'
import { emergencyRouter } from '../routers/emergency'
import { slaRouter } from '../routers/sla'
import { activityPatternsRouter } from '../routers/activityPatterns'
import { featureFlagsRouter } from '../routers/featureFlags'
import { notificationsRouter } from '../routers/notifications'
// Recruiter workspace routers (H01-H04)
import { activitiesRouter } from '../routers/activities'
import { crmRouter } from '../routers/crm'
import { atsRouter } from '../routers/ats'
import { dashboardRouter } from '../routers/dashboard'
import { reportsRouter } from '../routers/reports'
import { benchRouter } from '../routers/bench'
// HR module router
import { hrRouter } from '../routers/hr'
// Academy portal router
import { academyRouter } from '../routers/academy'
// Sequence templates router
import { sequencesRouter } from '../routers/sequences'
// Unified contacts router (Guidewire-inspired)
import { unifiedContactsRouter } from '../routers/unified-contacts'
// Centralized addresses router
import { addressesRouter } from '../routers/addresses'
// Contact supporting table routers (enterprise contact system)
import { contactRelationshipsRouter } from '../routers/contact-relationships'
import { contactRolesRouter } from '../routers/contact-roles'
import { contactSkillsRouter } from '../routers/contact-skills'
import { contactComplianceRouter } from '../routers/contact-compliance'
import { contactAgreementsRouter } from '../routers/contact-agreements'
import { contactRateCardsRouter } from '../routers/contact-rate-cards'
import { contactWorkHistoryRouter } from '../routers/contact-work-history'
import { contactEducationRouter } from '../routers/contact-education'
import { contactCertificationsRouter } from '../routers/contact-certifications'
import { contactMergeHistoryRouter } from '../routers/contact-merge-history'
import { contactBenchRouter } from '../routers/contact-bench'
// Unified companies router (accounts + vendors + partners consolidated)
import { companiesRouter } from '../routers/companies'
// Entity resolution service (ENTITIES-01)
import { entitiesRouter } from '../routers/entities'
// Centralized notes system (NOTES-01)
import { notesRouter } from '../routers/notes'
// Centralized documents system (DOCS-01)
import { documentsRouter } from '../routers/documents'
// Unified skills system (SKILLS-01)
import { skillsRouter } from '../routers/skills'
import { entitySkillsRouter } from '../routers/entity-skills'
// Unified history & audit trail system (HISTORY-01)
import { historyRouter } from '../routers/history'

export const appRouter = router({
  admin: adminRouter,
  pods: podsRouter,
  users: usersRouter,
  permissions: permissionsRouter,
  settings: settingsRouter,
  data: dataRouter,
  integrations: integrationsRouter,
  audit: auditRouter,
  workflows: workflowsRouter,
  emailTemplates: emailTemplatesRouter,
  emergency: emergencyRouter,
  sla: slaRouter,
  activityPatterns: activityPatternsRouter,
  featureFlags: featureFlagsRouter,
  notifications: notificationsRouter,
  // Recruiter workspace routers (H01-H04)
  activities: activitiesRouter,
  crm: crmRouter,
  ats: atsRouter,
  dashboard: dashboardRouter,
  reports: reportsRouter,
  bench: benchRouter,
  // HR module
  hr: hrRouter,
  // Academy portal
  academy: academyRouter,
  // Sequence templates
  sequences: sequencesRouter,
  // Unified contacts (Guidewire-inspired single table inheritance)
  unifiedContacts: unifiedContactsRouter,
  // Centralized addresses
  addresses: addressesRouter,
  // Contact supporting tables (enterprise contact system)
  contactRelationships: contactRelationshipsRouter,
  contactRoles: contactRolesRouter,
  contactSkills: contactSkillsRouter,
  contactCompliance: contactComplianceRouter,
  contactAgreements: contactAgreementsRouter,
  contactRateCards: contactRateCardsRouter,
  contactWorkHistory: contactWorkHistoryRouter,
  contactEducation: contactEducationRouter,
  contactCertifications: contactCertificationsRouter,
  contactMergeHistory: contactMergeHistoryRouter,
  contactBench: contactBenchRouter,
  // Unified companies (accounts + vendors + partners consolidated)
  companies: companiesRouter,
  // Entity resolution service (ENTITIES-01)
  entities: entitiesRouter,
  // Centralized notes system (NOTES-01)
  notes: notesRouter,
  // Centralized documents system (DOCS-01)
  documents: documentsRouter,
  // Unified skills system (SKILLS-01)
  skills: skillsRouter,
  entitySkills: entitySkillsRouter,
  // Unified history & audit trail system (HISTORY-01)
  history: historyRouter,
})

export type AppRouter = typeof appRouter
