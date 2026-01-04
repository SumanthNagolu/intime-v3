import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const adminClient = createClient(supabaseUrl, supabaseKey)

async function testQuery() {
  const contactId = '2b0522ba-51ea-4636-a573-864a51291df4'
  
  console.log('Testing job_contacts query for contact:', contactId)
  console.log('---')
  
  const result = await adminClient
    .from('job_contacts')
    .select(`
      id, role, is_primary, created_at,
      job:jobs!job_contacts_job_id_fkey(
        id, title, status, job_type, bill_rate_min, bill_rate_max,
        positions_available, positions_filled, priority, created_at,
        owner:user_profiles!jobs_owner_id_fkey(id, first_name, last_name),
        account:companies!jobs_company_id_fkey(id, name)
      )
    `)
    .eq('contact_id', contactId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100)
  
  console.log('Error:', result.error)
  console.log('Data:', JSON.stringify(result.data, null, 2))
  console.log('Count:', result.data?.length)
}

testQuery()
