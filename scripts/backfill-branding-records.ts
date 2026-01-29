import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function backfillBrandingRecords() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('=== Backfilling Branding Records ===\n')

  // 1. Get all organizations
  const { data: orgs, error: orgsError } = await supabase
    .from('organizations')
    .select('id, name')

  if (orgsError || !orgs) {
    console.error('Error fetching organizations:', orgsError?.message)
    return
  }

  console.log(`Found ${orgs.length} organization(s)\n`)

  for (const org of orgs) {
    console.log(`\nProcessing org: ${org.name} (${org.id})`)

    // 2. List files in storage for this org
    const { data: files, error: filesError } = await supabase.storage
      .from('org-assets')
      .list(org.id, { limit: 50 })

    if (filesError) {
      console.log(`  Error listing files: ${filesError.message}`)
      continue
    }

    if (!files || files.length === 0) {
      console.log('  No files in storage')
      continue
    }

    console.log(`  Found ${files.length} file(s) in storage`)

    // 3. Check existing branding records
    const { data: existingRecords } = await supabase
      .from('organization_branding')
      .select('asset_type, storage_path')
      .eq('org_id', org.id)

    const existingTypes = new Set(existingRecords?.map(r => r.asset_type) || [])
    console.log(`  Existing DB records: ${existingRecords?.length || 0}`)

    // 4. Get a user profile to use for uploaded_by
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('org_id', org.id)
      .limit(1)
      .single()

    if (!profile) {
      console.log('  No user profile found, skipping')
      continue
    }

    // 5. Create missing records
    for (const file of files) {
      // Skip folders (id is null for folders)
      if (file.id === null) continue

      // Determine asset type from filename
      let assetType: string | null = null
      if (file.name.startsWith('logo_light')) assetType = 'logo_light'
      else if (file.name.startsWith('logo_dark')) assetType = 'logo_dark'
      else if (file.name.startsWith('favicon')) assetType = 'favicon'
      else if (file.name.startsWith('login_background')) assetType = 'login_background'

      if (!assetType) {
        console.log(`  Skipping unknown file: ${file.name}`)
        continue
      }

      if (existingTypes.has(assetType)) {
        console.log(`  Record exists for ${assetType}, skipping`)
        continue
      }

      // Get file metadata
      const storagePath = `${org.id}/${file.name}`
      const mimeType = file.metadata?.mimetype || 'image/png'
      const fileSize = file.metadata?.size || 0

      console.log(`  Creating record for ${assetType}: ${storagePath}`)

      // Insert the record
      const { error: insertError } = await supabase
        .from('organization_branding')
        .insert({
          org_id: org.id,
          asset_type: assetType,
          storage_path: storagePath,
          file_name: file.name,
          file_size: fileSize,
          mime_type: mimeType,
          uploaded_by: profile.id,
        })

      if (insertError) {
        console.log(`    ✗ Error: ${insertError.message}`)
      } else {
        console.log(`    ✓ Created successfully`)
      }
    }
  }

  // 6. Verify final state
  console.log('\n\n=== Final Verification ===')
  const { data: allRecords } = await supabase
    .from('organization_branding')
    .select('org_id, asset_type, storage_path, file_name')

  if (allRecords && allRecords.length > 0) {
    console.log(`\nTotal branding records: ${allRecords.length}`)
    allRecords.forEach(r => {
      console.log(`  - ${r.asset_type}: ${r.file_name}`)
    })
  } else {
    console.log('\nNo branding records in database')
  }

  console.log('\n=== Done ===')
}

backfillBrandingRecords().catch(console.error)
