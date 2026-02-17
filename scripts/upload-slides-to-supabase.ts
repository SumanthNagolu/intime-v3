/**
 * Upload Academy Slide Images to Supabase Storage
 *
 * Uploads all slide PNGs from public/academy/guidewire/slides/ to
 * the 'academy-slides' Supabase Storage bucket with the same directory structure.
 *
 * Prerequisites:
 *   - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Usage:
 *   npx tsx scripts/upload-slides-to-supabase.ts
 *
 * Options:
 *   --dry-run        List files without uploading
 *   --chapter=XX     Upload only a specific chapter (e.g., --chapter=ch04)
 *   --concurrency=N  Number of parallel uploads (default: 10)
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

config({ path: '.env.local' })

const SLIDES_DIR = path.join(process.cwd(), 'public/academy/guidewire/slides')
const BUCKET = 'academy-slides'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const chapterArg = args.find(a => a.startsWith('--chapter='))?.split('=')[1]
const concurrencyArg = args.find(a => a.startsWith('--concurrency='))?.split('=')[1]
const concurrency = concurrencyArg ? parseInt(concurrencyArg, 10) : 10

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function collectSlideFiles(): { localPath: string; storagePath: string }[] {
  const files: { localPath: string; storagePath: string }[] = []

  const chapters = fs.readdirSync(SLIDES_DIR).filter(d =>
    fs.statSync(path.join(SLIDES_DIR, d)).isDirectory() &&
    (!chapterArg || d === chapterArg)
  ).sort()

  for (const chapter of chapters) {
    const chapterDir = path.join(SLIDES_DIR, chapter)
    const lessons = fs.readdirSync(chapterDir).filter(d =>
      fs.statSync(path.join(chapterDir, d)).isDirectory()
    ).sort()

    for (const lesson of lessons) {
      const lessonDir = path.join(chapterDir, lesson)
      const slides = fs.readdirSync(lessonDir).filter(f => f.endsWith('.png')).sort()

      for (const slide of slides) {
        files.push({
          localPath: path.join(lessonDir, slide),
          storagePath: `${chapter}/${lesson}/${slide}`,
        })
      }
    }
  }

  return files
}

async function ensureBucketExists(supabase: ReturnType<typeof createClient>) {
  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some(b => b.name === BUCKET)

  if (!exists) {
    console.log(`Creating public bucket: ${BUCKET}`)
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB per file
    })
    if (error) {
      console.error('Failed to create bucket:', error.message)
      process.exit(1)
    }
    console.log('Bucket created successfully')
  } else {
    console.log(`Bucket '${BUCKET}' already exists`)
  }
}

async function checkExisting(
  supabase: ReturnType<typeof createClient>,
  files: { localPath: string; storagePath: string }[]
): Promise<Set<string>> {
  const existing = new Set<string>()

  // List files per chapter/lesson directory to check what's already uploaded
  const dirs = new Set(files.map(f => {
    const parts = f.storagePath.split('/')
    return `${parts[0]}/${parts[1]}`
  }))

  for (const dir of dirs) {
    const { data } = await supabase.storage.from(BUCKET).list(dir, { limit: 1000 })
    if (data) {
      for (const file of data) {
        existing.add(`${dir}/${file.name}`)
      }
    }
  }

  return existing
}

async function uploadBatch(
  supabase: ReturnType<typeof createClient>,
  files: { localPath: string; storagePath: string }[],
  batchSize: number
): Promise<{ uploaded: number; skipped: number; failed: number }> {
  let uploaded = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize)
    const results = await Promise.allSettled(
      batch.map(async (file) => {
        const fileBuffer = fs.readFileSync(file.localPath)
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(file.storagePath, fileBuffer, {
            contentType: 'image/png',
            upsert: false,
          })

        if (error) {
          if (error.message?.includes('already exists') || error.message?.includes('Duplicate')) {
            skipped++
            return
          }
          throw error
        }
        uploaded++
      })
    )

    for (const result of results) {
      if (result.status === 'rejected') {
        failed++
        console.error(`  Failed: ${result.reason?.message || result.reason}`)
      }
    }

    const total = uploaded + skipped + failed
    const pct = ((total / files.length) * 100).toFixed(1)
    process.stdout.write(`\r  Progress: ${total}/${files.length} (${pct}%) — ${uploaded} uploaded, ${skipped} skipped, ${failed} failed`)
  }

  console.log() // newline after progress
  return { uploaded, skipped, failed }
}

async function main() {
  console.log('Academy Slides → Supabase Storage Upload')
  console.log('=========================================\n')

  const files = collectSlideFiles()
  console.log(`Found ${files.length} slide images${chapterArg ? ` (chapter: ${chapterArg})` : ''}`)

  if (files.length === 0) {
    console.log('No files to upload.')
    return
  }

  if (dryRun) {
    console.log('\n[DRY RUN] Would upload:')
    const byChapter = new Map<string, number>()
    for (const f of files) {
      const ch = f.storagePath.split('/')[0]
      byChapter.set(ch, (byChapter.get(ch) || 0) + 1)
    }
    for (const [ch, count] of [...byChapter.entries()].sort()) {
      console.log(`  ${ch}: ${count} slides`)
    }
    console.log(`\nTotal: ${files.length} files`)
    return
  }

  const supabase = getSupabaseClient()

  // Ensure bucket exists
  await ensureBucketExists(supabase)

  // Check which files already exist
  console.log('\nChecking existing files...')
  const existing = await checkExisting(supabase, files)
  const toUpload = files.filter(f => !existing.has(f.storagePath))
  console.log(`  ${existing.size} already uploaded, ${toUpload.length} to upload\n`)

  if (toUpload.length === 0) {
    console.log('All files already uploaded!')
    return
  }

  // Upload
  console.log(`Uploading ${toUpload.length} files (concurrency: ${concurrency})...\n`)
  const { uploaded, skipped, failed } = await uploadBatch(supabase, toUpload, concurrency)

  console.log('\n--- Summary ---')
  console.log(`  Uploaded: ${uploaded}`)
  console.log(`  Skipped:  ${skipped + existing.size}`)
  console.log(`  Failed:   ${failed}`)

  // Verify a sample URL
  const sample = files[0]
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${sample.storagePath}`
  console.log(`\nSample URL:\n  ${url}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
