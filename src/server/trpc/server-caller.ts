import 'server-only'
import { cache } from 'react'
import { createCallerFactory } from './init'
import { appRouter } from './root'
import { createContext } from './context'

// Create the caller factory once
const createCaller = createCallerFactory(appRouter)

/**
 * Get a server-side tRPC caller with the current request context.
 * Uses React cache() to deduplicate calls within a single request.
 */
export const getServerCaller = cache(async () => {
  const ctx = await createContext()
  return createCaller(ctx)
})

/**
 * Type-safe server caller for use in RSC pages and layouts.
 * Example: const caller = await getServerCaller()
 *          const jobs = await caller.ats.jobs.list({ limit: 50 })
 */
export type ServerCaller = Awaited<ReturnType<typeof getServerCaller>>
