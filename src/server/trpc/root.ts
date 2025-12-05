import { router } from './init'
import { adminRouter } from '../routers/admin'
import { podsRouter } from '../routers/pods'
import { usersRouter } from '../routers/users'
import { permissionsRouter } from '../routers/permissions'
import { settingsRouter } from '../routers/settings'

export const appRouter = router({
  admin: adminRouter,
  pods: podsRouter,
  users: usersRouter,
  permissions: permissionsRouter,
  settings: settingsRouter,
})

export type AppRouter = typeof appRouter
