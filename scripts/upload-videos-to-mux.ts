/**
 * Upload Academy Videos to Mux
 *
 * Prerequisites:
 *   1. Add Mux integration from Vercel Marketplace (Vercel Dashboard → Integrations → Mux)
 *      OR create a Mux account at mux.com and get API credentials
 *   2. Add to .env.local:
 *      MUX_TOKEN_ID=your-token-id
 *      MUX_TOKEN_SECRET=your-token-secret
 *
 * Usage:
 *   pnpm tsx scripts/upload-videos-to-mux.ts
 *
 * Options:
 *   --dry-run      List files without uploading
 *   --chapter=XX   Upload only a specific chapter (e.g., --chapter=ch05)
 *   --resume       Skip files already in the manifest
 *   --status       Check status of pending uploads
 */

import Mux from '@mux/mux-node'
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

config({ path: '.env.local' })

const VIDEOS_DIR = path.join(process.cwd(), 'public/academy/guidewire/videos')
const MANIFEST_PATH = path.join(process.cwd(), 'public/academy/guidewire/video-manifest.json')

interface VideoEntry {
  playbackId: string
  assetId: string
  status: 'preparing' | 'ready' | 'errored'
  duration?: number
  size: number
  uploadedAt: string
}

interface VideoManifest {
  generatedAt: string
  provider: 'mux'
  totalFiles: number
  videos: Record<string, VideoEntry>
}

function loadManifest(): VideoManifest {
  if (fs.existsSync(MANIFEST_PATH)) {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'))
  }
  return { generatedAt: '', provider: 'mux', totalFiles: 0, videos: {} }
}

function saveManifest(manifest: VideoManifest): void {
  manifest.generatedAt = new Date().toISOString()
  manifest.totalFiles = Object.keys(manifest.videos).length
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
}

function getAllVideoFiles(chapterFilter?: string): { relativePath: string; absolutePath: string; size: number }[] {
  const files: { relativePath: string; absolutePath: string; size: number }[] = []

  const chapters = fs.readdirSync(VIDEOS_DIR).filter(d => {
    if (chapterFilter && d !== chapterFilter) return false
    return fs.statSync(path.join(VIDEOS_DIR, d)).isDirectory()
  })

  for (const chapter of chapters.sort()) {
    const chapterDir = path.join(VIDEOS_DIR, chapter)
    const videoFiles = fs.readdirSync(chapterDir).filter(f =>
      /\.(mp4|webm|mkv|mov|avi)$/i.test(f)
    ).sort()

    for (const file of videoFiles) {
      const absolutePath = path.join(chapterDir, file)
      const stat = fs.statSync(absolutePath)
      files.push({
        relativePath: `${chapter}/${file}`,
        absolutePath,
        size: stat.size,
      })
    }
  }

  return files
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`
  return `${(bytes / 1073741824).toFixed(2)} GB`
}

async function checkStatus(mux: Mux, manifest: VideoManifest): Promise<void> {
  const pending = Object.entries(manifest.videos).filter(([, v]) => v.status === 'preparing')

  if (pending.length === 0) {
    console.log('\n  All videos are ready!\n')
    return
  }

  console.log(`\n  Checking ${pending.length} pending videos...\n`)

  let updated = 0
  for (const [key, entry] of pending) {
    try {
      const asset = await mux.video.assets.retrieve(entry.assetId)
      if (asset.status !== 'preparing') {
        entry.status = asset.status as VideoEntry['status']
        entry.duration = asset.duration
        updated++
        console.log(`  ${key}: ${asset.status}`)
      }
    } catch (err: any) {
      console.error(`  ${key}: error checking - ${err.message}`)
    }
  }

  if (updated > 0) {
    saveManifest(manifest)
    console.log(`\n  Updated ${updated} entries in manifest\n`)
  } else {
    console.log(`\n  No status changes yet\n`)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const resume = args.includes('--resume')
  const statusCheck = args.includes('--status')
  const chapterArg = args.find(a => a.startsWith('--chapter='))
  const chapterFilter = chapterArg?.split('=')[1]

  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    console.error('\n  Missing Mux credentials in .env.local')
    console.error('')
    console.error('  Option A: Add Mux via Vercel Marketplace')
    console.error('    1. Vercel Dashboard → Integrations → Browse → Mux')
    console.error('    2. Connect to your project')
    console.error('    3. Copy MUX_TOKEN_ID and MUX_TOKEN_SECRET to .env.local')
    console.error('')
    console.error('  Option B: Sign up at mux.com')
    console.error('    1. Go to mux.com → Sign up')
    console.error('    2. Settings → API Access Tokens → Generate new token')
    console.error('    3. Add to .env.local:')
    console.error('       MUX_TOKEN_ID=your-token-id')
    console.error('       MUX_TOKEN_SECRET=your-token-secret\n')
    process.exit(1)
  }

  const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
  })

  const manifest = loadManifest()
  if (!manifest.videos) manifest.videos = {}

  // Status check mode
  if (statusCheck) {
    await checkStatus(mux, manifest)
    return
  }

  const files = getAllVideoFiles(chapterFilter)
  const totalSize = files.reduce((sum, f) => sum + f.size, 0)

  console.log(`\n  Academy Video Upload → Mux`)
  console.log(`  ─────────────────────────────`)
  console.log(`  Files:   ${files.length}`)
  console.log(`  Size:    ${formatBytes(totalSize)}`)
  if (chapterFilter) console.log(`  Filter:  ${chapterFilter}`)
  if (dryRun) console.log(`  Mode:    DRY RUN`)
  if (resume) console.log(`  Mode:    RESUME (skipping existing)`)
  console.log()

  if (dryRun) {
    for (const file of files) {
      const existing = manifest.videos?.[file.relativePath]
      const status = existing ? ` [${existing.status}]` : ''
      console.log(`  ${file.relativePath.padEnd(50)} ${formatBytes(file.size).padStart(10)}${status}`)
    }
    console.log(`\n  Total: ${formatBytes(totalSize)}\n`)
    return
  }

  let uploaded = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const key = file.relativePath

    // Skip if already uploaded and resuming
    if (resume && manifest.videos[key]) {
      skipped++
      console.log(`  [${i + 1}/${files.length}] SKIP  ${key}`)
      continue
    }

    try {
      console.log(`  [${i + 1}/${files.length}] UP    ${key} (${formatBytes(file.size)})...`)

      // Create a direct upload URL
      const upload = await mux.video.uploads.create({
        new_asset_settings: {
          playback_policy: ['public'],
          encoding_tier: 'baseline',
          // Tag with chapter for Mux dashboard organization
          passthrough: key,
        },
        cors_origin: '*',
      })

      // Upload the file via PUT to the Mux upload URL
      const fileBuffer = fs.readFileSync(file.absolutePath)
      const uploadRes = await fetch(upload.url!, {
        method: 'PUT',
        body: fileBuffer,
        headers: { 'Content-Type': 'application/octet-stream' },
      })

      if (!uploadRes.ok) {
        throw new Error(`Upload PUT failed: ${uploadRes.status} ${uploadRes.statusText}`)
      }

      // Wait a moment for Mux to process the upload and create the asset
      await new Promise(r => setTimeout(r, 2000))

      // Get the upload to find the asset ID
      const uploadStatus = await mux.video.uploads.retrieve(upload.id)
      const assetId = uploadStatus.asset_id

      if (!assetId) {
        // Asset not created yet - store with upload ID, we'll resolve later
        console.log(`         → Upload accepted (processing...) upload_id=${upload.id}`)
        manifest.videos[key] = {
          playbackId: '',
          assetId: upload.id, // temporarily store upload ID
          status: 'preparing',
          size: file.size,
          uploadedAt: new Date().toISOString(),
        }
      } else {
        // Get the asset details for the playback ID
        const asset = await mux.video.assets.retrieve(assetId)
        const playbackId = asset.playback_ids?.[0]?.id ?? ''

        manifest.videos[key] = {
          playbackId,
          assetId,
          status: asset.status as VideoEntry['status'],
          duration: asset.duration,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        }

        console.log(`         → playback_id=${playbackId} (${asset.status})`)
      }

      // Save manifest after each upload (crash-safe)
      saveManifest(manifest)
      uploaded++
    } catch (err: any) {
      failed++
      console.error(`  [${i + 1}/${files.length}] FAIL  ${key}: ${err.message}`)
    }
  }

  console.log(`\n  ─────────────────────────────`)
  console.log(`  Uploaded: ${uploaded}`)
  console.log(`  Skipped:  ${skipped}`)
  console.log(`  Failed:   ${failed}`)
  console.log(`  Manifest: ${MANIFEST_PATH}`)
  console.log(`\n  After uploads finish processing, run:`)
  console.log(`  pnpm tsx scripts/upload-videos-to-mux.ts --status`)
  console.log(`  to update playback IDs for pending videos.\n`)
}

main().catch(console.error)
