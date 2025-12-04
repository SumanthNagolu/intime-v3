import { TRPCError } from '@trpc/server'
import { middleware, publicProcedure } from './init'

const isAuthenticated = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in',
    })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

const hasOrg = middleware(async ({ ctx, next }) => {
  if (!ctx.orgId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must belong to an organization',
    })
  }
  return next({
    ctx: {
      ...ctx,
      orgId: ctx.orgId,
    },
  })
})

export const protectedProcedure = publicProcedure.use(isAuthenticated)
export const orgProtectedProcedure = protectedProcedure.use(hasOrg)
