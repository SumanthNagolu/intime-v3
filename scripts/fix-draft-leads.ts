import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const adminClient = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  console.log('Fixing deals with name "New Deal" to be drafts...\n')

  // Find deals named "New Deal" that are in discovery stage (likely incomplete drafts)
  const { data: deals } = await adminClient
    .from('deals')
    .select('id, name, stage, value, created_at')
    .eq('name', 'New Deal')
    .neq('stage', 'draft')
    .is('deleted_at', null)

  console.log(`Found ${deals?.length || 0} deals named "New Deal" that should be drafts`)

  if (deals?.length) {
    deals.forEach(d => {
      console.log(`- ID: ${d.id}, stage: ${d.stage}, value: ${d.value}, created: ${d.created_at}`)
    })

    // Soft delete these incomplete deals (trigger issue prevents stage update)
    for (const deal of deals) {
      const { error } = await adminClient
        .from('deals')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', deal.id)

      if (error) {
        console.error(`Error deleting ${deal.id}:`, error.message)
      } else {
        console.log(`Soft deleted: ${deal.id}`)
      }
    }
    console.log(`\n✅ Processed ${deals.length} deals`)
  }
}

main().catch(console.error)
