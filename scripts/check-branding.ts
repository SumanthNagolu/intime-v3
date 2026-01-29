import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

async function checkBranding() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('=== Checking Branding Assets ===\n')

  // 1. Check organization_branding table
  console.log('1. Querying organization_branding table...')
  const { data: brandingRecords, error: brandingError } = await supabase
    .from('organization_branding')
    .select('*')
    .limit(10)

  if (brandingError) {
    console.log('   Error:', brandingError.message)
  } else if (!brandingRecords || brandingRecords.length === 0) {
    console.log('   No branding records found in database')
  } else {
    console.log('   Found ' + brandingRecords.length + ' branding record(s):')
    brandingRecords.forEach((r) => {
      console.log('   - ' + r.asset_type + ': ' + r.file_name + ' (' + r.storage_path + ')')
    })
  }

  // 2. Check if org-assets bucket exists
  console.log('\n2. Checking storage buckets...')
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

  if (bucketsError) {
    console.log('   Error listing buckets:', bucketsError.message)
  } else {
    const bucketNames = buckets?.map(b => b.name).join(', ') || 'none'
    console.log('   Available buckets:', bucketNames)

    const orgAssetsBucket = buckets?.find(b => b.name === 'org-assets')
    if (orgAssetsBucket) {
      console.log('   ✓ org-assets bucket EXISTS')

      // List files in the bucket
      const { data: files, error: filesError } = await supabase.storage
        .from('org-assets')
        .list('', { limit: 20 })

      if (filesError) {
        console.log('   Error listing files:', filesError.message)
      } else if (!files || files.length === 0) {
        console.log('   No files in org-assets bucket')
      } else {
        console.log('   Files in org-assets:')
        files.forEach(f => console.log('   - ' + f.name))
      }
    } else {
      console.log('   ✗ org-assets bucket DOES NOT EXIST - uploads will fail!')
      console.log('   → Create it in Supabase Dashboard > Storage > New bucket > "org-assets"')
    }
  }

  // 3. Check organizations table for branding colors
  console.log('\n3. Checking organization data...')
  const { data: orgs, error: orgsError } = await supabase
    .from('organizations')
    .select('id, name, primary_color, secondary_color, industry, company_size')
    .limit(5)

  if (orgsError) {
    console.log('   Error:', orgsError.message)
  } else if (orgs) {
    orgs.forEach((org) => {
      console.log('   Org: ' + org.name)
      console.log('     - Industry: ' + (org.industry || 'not set'))
      console.log('     - Company Size: ' + (org.company_size || 'not set'))
      console.log('     - Primary Color: ' + (org.primary_color || 'not set'))
      console.log('     - Secondary Color: ' + (org.secondary_color || 'not set'))
    })
  }

  console.log('\n=== Done ===')
}

checkBranding().catch(console.error)
