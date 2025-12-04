import { router } from './init'
import { adminRouter } from '../routers/admin'

export const appRouter = router({
  admin: adminRouter,
})

export type AppRouter = typeof appRouter
