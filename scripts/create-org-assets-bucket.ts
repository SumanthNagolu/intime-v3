import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

async function createBucket() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('Creating org-assets bucket...')

  const { data, error } = await supabase.storage.createBucket('org-assets', {
    public: false,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/svg+xml',
      'image/webp',
      'image/x-icon',
    ],
  })

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('✓ Bucket already exists')
    } else {
      console.error('✗ Error creating bucket:', error.message)
      process.exit(1)
    }
  } else {
    console.log('✓ Bucket created successfully:', data)
  }

  // Verify the bucket exists
  const { data: buckets } = await supabase.storage.listBuckets()
  const orgAssets = buckets?.find(b => b.name === 'org-assets')

  if (orgAssets) {
    console.log('✓ Verified: org-assets bucket exists')
    console.log('  - Public:', orgAssets.public)
    console.log('  - Created:', orgAssets.created_at)
  }

  console.log('\nYou can now upload logos on the Branding page!')
}

createBucket().catch(console.error)
