import { events } from '../emitter'
import { getAdminClient } from '@/lib/supabase/admin'

// Register handlers
events.on('account.submitted', async ({ accountId, orgId, userId }) => {
  const adminClient = getAdminClient()

  // Create welcome activity
  await adminClient.from('activities').insert({
    entity_type: 'account',
    entity_id: accountId,
    org_id: orgId,
    subject: 'Schedule welcome call with new client',
    activity_type: 'call',
    status: 'open',
    priority: 'high',
    due_date: addBusinessDays(new Date(), 3).toISOString(),
    assigned_to: userId,
    created_by: userId,
  })
})

events.on('account.status.changed', async ({ accountId, payload }) => {
  console.log(`Account ${accountId} status changed:`, payload)
  // Add to history, send notifications, etc.
})

// Helper
function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date)
  let added = 0
  while (added < days) {
    result.setDate(result.getDate() + 1)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      added++
    }
  }
  return result
}
