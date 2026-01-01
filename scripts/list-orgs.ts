import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name')
    .limit(10)
  
  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
  
  console.log('\nOrganizations:')
  for (const org of data || []) {
    console.log(`  ${org.id} - ${org.name}`)
  }
}

main()

