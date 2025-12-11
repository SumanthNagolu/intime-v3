/**
 * Check current database state for migration
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function check() {
  console.log('='.repeat(60))
  console.log('Database State Check')
  console.log('='.repeat(60))

  // Check companies
  const { data: companies, count: companyCount } = await supabase
    .from('companies')
    .select('id, name, category, legacy_account_id, legacy_vendor_id', { count: 'exact' })
    .is('deleted_at', null)
    .limit(5)

  console.log('\n--- Companies ---')
  console.log('Total active companies:', companyCount)
  console.log('Sample:', companies)

  // Check category breakdown
  const { data: all } = await supabase
    .from('companies')
    .select('category')
    .is('deleted_at', null)

  const breakdown = all?.reduce((acc: Record<string, number>, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1
    return acc
  }, {})
  console.log('Category breakdown:', breakdown)

  // Check legacy IDs
  const { count: withAccountId } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .not('legacy_account_id', 'is', null)

  const { count: withVendorId } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .not('legacy_vendor_id', 'is', null)

  console.log('Companies with legacy_account_id:', withAccountId)
  console.log('Companies with legacy_vendor_id:', withVendorId)

  // Check if legacy tables exist by trying to query them
  console.log('\n--- Legacy Tables ---')

  const { error: accountsErr } = await supabase.from('accounts').select('id').limit(1)
  console.log('accounts table exists:', !accountsErr, accountsErr?.message || '')

  const { error: vendorsErr } = await supabase.from('vendors').select('id').limit(1)
  console.log('vendors table exists:', !vendorsErr, vendorsErr?.message || '')

  const { error: leadsErr } = await supabase.from('leads').select('id').limit(1)
  console.log('leads table exists:', !leadsErr, leadsErr?.message || '')

  const { error: benchErr } = await supabase.from('bench_consultants').select('id').limit(1)
  console.log('bench_consultants table exists:', !benchErr, benchErr?.message || '')

  // Check contacts extension tables
  console.log('\n--- Contact Extension Tables ---')

  const { count: workHistoryCount } = await supabase
    .from('contact_work_history')
    .select('*', { count: 'exact', head: true })
  console.log('contact_work_history records:', workHistoryCount)

  const { count: educationCount } = await supabase
    .from('contact_education')
    .select('*', { count: 'exact', head: true })
  console.log('contact_education records:', educationCount)

  const { count: certCount } = await supabase
    .from('contact_certifications')
    .select('*', { count: 'exact', head: true })
  console.log('contact_certifications records:', certCount)

  const { count: mergeCount } = await supabase
    .from('contact_merge_history')
    .select('*', { count: 'exact', head: true })
  console.log('contact_merge_history records:', mergeCount)

  // Check contact_bench_data
  const { error: benchDataErr } = await supabase.from('contact_bench_data').select('id').limit(1)
  console.log('contact_bench_data table exists:', !benchDataErr, benchDataErr?.message || '')

  // Check contacts with lead/bench subtypes
  console.log('\n--- Contacts ---')
  const { count: contactCount } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)
  console.log('Total active contacts:', contactCount)

  const { data: subtypes } = await supabase
    .from('contacts')
    .select('subtype')
    .is('deleted_at', null)

  const subtypeBreakdown = subtypes?.reduce((acc: Record<string, number>, r) => {
    const key = r.subtype || 'null'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  console.log('Subtype breakdown:', subtypeBreakdown)

  console.log('\n' + '='.repeat(60))
  console.log('Check Complete')
  console.log('='.repeat(60))
}

check().catch(err => {
  console.error('Check failed:', err)
  process.exit(1)
})
