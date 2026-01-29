import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkStorageFiles() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('=== Checking Storage Files ===\n')

  // List root level
  const { data: rootFiles, error: rootError } = await supabase.storage
    .from('org-assets')
    .list('', { limit: 50 })

  if (rootError) {
    console.log('Error listing root:', rootError.message)
    return
  }

  console.log('Root level items:', rootFiles?.length || 0)

  // For each folder/file at root
  for (const item of rootFiles || []) {
    console.log('\n' + item.name + ':')

    if (item.id === null) {
      // This is a folder, list its contents
      const { data: folderFiles, error: folderError } = await supabase.storage
        .from('org-assets')
        .list(item.name, { limit: 50 })

      if (folderError) {
        console.log('  Error:', folderError.message)
      } else if (folderFiles && folderFiles.length > 0) {
        console.log('  Files:')
        for (const file of folderFiles) {
          console.log('    - ' + file.name + ' (' + (file.metadata?.size || 'unknown size') + ' bytes)')

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('org-assets')
            .getPublicUrl(item.name + '/' + file.name)
          console.log('      URL: ' + urlData.publicUrl)
        }
      } else {
        console.log('  (empty folder)')
      }
    } else {
      console.log('  File: ' + item.name)
    }
  }

  console.log('\n=== Done ===')
}

checkStorageFiles().catch(console.error)
