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
})

export type AppRouter = typeof appRouter
