import { z } from 'zod'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

export const searchRouter = router({
  global: orgProtectedProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().default(5),
    }))
    .query(async ({ input, ctx }) => {
      const { query, limit } = input
      const { orgId } = ctx
      const adminClient = getAdminClient()
      const searchTerm = `%${query}%`

      // We'll run parallel queries for speed
      const [candidates, jobs, accounts] = await Promise.all([
        // Search Candidates
        adminClient
          .from('ats_candidates')
          .select('id, first_name, last_name, title, email')
          .eq('org_id', orgId)
          .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
          .limit(limit),

        // Search Jobs
        adminClient
          .from('ats_jobs')
          .select('id, title, status')
          .eq('org_id', orgId)
          .ilike('title', searchTerm)
          .limit(limit),

        // Search Accounts
        adminClient
          .from('crm_accounts')
          .select('id, name, industry')
          .eq('org_id', orgId)
          .ilike('name', searchTerm)
          .limit(limit),
      ])

      const results = [
        ...(candidates.data || []).map(c => ({
          type: 'candidate',
          id: c.id,
          title: `${c.first_name} ${c.last_name}`,
          subtitle: c.title || c.email,
          href: `/candidates?id=${c.id}`,
        })),
        ...(jobs.data || []).map(j => ({
          type: 'job',
          id: j.id,
          title: j.title,
          subtitle: j.status,
          href: `/jobs?id=${j.id}`,
        })),
        ...(accounts.data || []).map(a => ({
          type: 'account',
          id: a.id,
          title: a.name,
          subtitle: a.industry,
          href: `/accounts?id=${a.id}`,
        })),
      ]

      return results
    }),
})
