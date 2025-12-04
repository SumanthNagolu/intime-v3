import { router } from './init'
import { adminRouter } from '../routers/admin'
import { podsRouter } from '../routers/pods'

export const appRouter = router({
  admin: adminRouter,
  pods: podsRouter,
})

export type AppRouter = typeof appRouter
