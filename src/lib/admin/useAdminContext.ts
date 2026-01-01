'use client'

import { useSearchParams } from 'next/navigation'

export function useAdminContext() {
  const searchParams = useSearchParams()
  const orgUnitId = searchParams.get('orgUnit')
  return { orgUnitId, hasFilter: !!orgUnitId }
}

export function withOrgUnitFilter<T extends Record<string, unknown>>(
  filters: T,
  orgUnitId: string | null
): T & { podId?: string } {
  if (!orgUnitId) return filters
  return { ...filters, podId: orgUnitId }
}
