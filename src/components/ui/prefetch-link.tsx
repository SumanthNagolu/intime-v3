'use client'

import { useCallback, useRef, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'

type EntityType = 'job' | 'candidate' | 'account' | 'lead' | 'deal' | 'placement'

interface PrefetchLinkProps {
  href: string
  children: ReactNode
  className?: string
  entityType?: EntityType
  entityId?: string
  prefetchDelay?: number
}

/**
 * PrefetchLink - A Link component that prefetches both the route and entity data on hover
 *
 * Usage:
 * <PrefetchLink
 *   href="/employee/recruiting/jobs/123"
 *   entityType="job"
 *   entityId="123"
 * >
 *   View Job
 * </PrefetchLink>
 */
export function PrefetchLink({
  href,
  children,
  className,
  entityType,
  entityId,
  prefetchDelay = 100,
}: PrefetchLinkProps) {
  const router = useRouter()
  const utils = trpc.useUtils()
  const prefetchTimerRef = useRef<NodeJS.Timeout | null>(null)
  const hasPrefetchedRef = useRef(false)

  const prefetchEntity = useCallback(async () => {
    if (!entityType || !entityId || hasPrefetchedRef.current) return

    hasPrefetchedRef.current = true

    try {
      // Prefetch based on entity type
      switch (entityType) {
        case 'job':
          await utils.ats.jobs.getById.prefetch({ id: entityId })
          break
        case 'candidate':
          await utils.ats.candidates.getById.prefetch({ id: entityId })
          break
        case 'account':
          await utils.crm.accounts.getById.prefetch({ id: entityId })
          break
        case 'lead':
          await utils.unifiedContacts.leads.getById.prefetch({ id: entityId })
          break
        case 'deal':
          await utils.crm.deals.getById.prefetch({ id: entityId })
          break
        case 'placement':
          await utils.ats.placements.getById.prefetch({ placementId: entityId })
          break
      }
    } catch {
      // Silently fail - prefetching is a performance optimization, not critical
    }
  }, [entityType, entityId, utils])

  const handleMouseEnter = useCallback(() => {
    // Clear any existing timer
    if (prefetchTimerRef.current) {
      clearTimeout(prefetchTimerRef.current)
    }

    // Start prefetch after delay (avoids prefetching when just moving mouse across)
    prefetchTimerRef.current = setTimeout(() => {
      // Prefetch the route (Next.js handles this with Link, but this ensures it)
      router.prefetch(href)

      // Prefetch the entity data
      prefetchEntity()
    }, prefetchDelay)
  }, [href, router, prefetchEntity, prefetchDelay])

  const handleMouseLeave = useCallback(() => {
    if (prefetchTimerRef.current) {
      clearTimeout(prefetchTimerRef.current)
      prefetchTimerRef.current = null
    }
  }, [])

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      prefetch={false} // Disable Next.js automatic prefetch, we handle it on hover
    >
      {children}
    </Link>
  )
}

/**
 * Hook for programmatic prefetching
 *
 * Usage:
 * const prefetch = usePrefetchEntity()
 * prefetch('job', '123')
 */
export function usePrefetchEntity() {
  const utils = trpc.useUtils()

  return useCallback(
    async (entityType: EntityType, entityId: string) => {
      try {
        switch (entityType) {
          case 'job':
            await utils.ats.jobs.getById.prefetch({ id: entityId })
            break
          case 'candidate':
            await utils.ats.candidates.getById.prefetch({ id: entityId })
            break
          case 'account':
            await utils.crm.accounts.getById.prefetch({ id: entityId })
            break
          case 'lead':
            await utils.unifiedContacts.leads.getById.prefetch({ id: entityId })
            break
          case 'deal':
            await utils.crm.deals.getById.prefetch({ id: entityId })
            break
          case 'placement':
            await utils.ats.placements.getById.prefetch({ placementId: entityId })
            break
        }
      } catch {
        // Silently fail
      }
    },
    [utils]
  )
}
