/**
 * Upload Academy Videos to Vercel Blob
 *
 * Prerequisites:
 *   1. Create a Blob store in Vercel Dashboard → Storage → Create Blob Store
 *   2. Copy the BLOB_READ_WRITE_TOKEN to .env.local
 *
 * Usage:
 *   pnpm tsx scripts/upload-videos-to-blob.ts
 *
 * Options:
 *   --dry-run    List files without uploading
 *   --chapter=XX Upload only a specific chapter (e.g., --chapter=ch05)
 *   --resume     Skip files already in the manifest
 */

import { put } from '@vercel/blob'
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

config({ path: '.env.local' })

const VIDEOS_DIR = path.join(process.cwd(), 'public/academy/guidewire/videos')
const MANIFEST_PATH = path.join(process.cwd(), 'public/academy/guidewire/video-manifest.json')

interface VideoManifest {
  generatedAt: string
  totalFiles: number
  totalSizeBytes: number
  videos: Record<string, { url: string; size: number; uploadedAt: string }>
}

function loadManifest(): VideoManifest {
  if (fs.existsSync(MANIFEST_PATH)) {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'))
  }
  return { generatedAt: '', totalFiles: 0, totalSizeBytes: 0, videos: {} }
}

function saveManifest(manifest: VideoManifest): void {
  manifest.generatedAt = new Date().toISOString()
  manifest.totalFiles = Object.keys(manifest.videos).length
  manifest.totalSizeBytes = Object.values(manifest.videos).reduce((sum, v) => sum + v.size, 0)
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
}

function getAllVideoFiles(chapterFilter?: string): { relativePath: string; absolutePath: string; size: number }[] {
  const files: { relativePath: string; absolutePath: string; size: number }[] = []

  const chapters = fs.readdirSync(VIDEOS_DIR).filter(d => {
    if (chapterFilter && d !== chapterFilter) return false
    return fs.statSync(path.join(VIDEOS_DIR, d)).isDirectory()
  })

  for (const chapter of chapters) {
    const chapterDir = path.join(VIDEOS_DIR, chapter)
    const videoFiles = fs.readdirSync(chapterDir).filter(f =>
      /\.(mp4|webm|mkv|mov|avi)$/i.test(f)
    )

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

  return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath))
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`
  return `${(bytes / 1073741824).toFixed(2)} GB`
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const resume = args.includes('--resume')
  const chapterArg = args.find(a => a.startsWith('--chapter='))
  const chapterFilter = chapterArg?.split('=')[1]

  if (!dryRun && !process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('\n  Missing BLOB_READ_WRITE_TOKEN in .env.local')
    console.error('  1. Go to Vercel Dashboard → Storage → Create Blob Store')
    console.error('  2. Copy the read-write token to .env.local as BLOB_READ_WRITE_TOKEN=...\n')
    process.exit(1)
  }

  const files = getAllVideoFiles(chapterFilter)
  const totalSize = files.reduce((sum, f) => sum + f.size, 0)

  console.log(`\n  Academy Video Upload`)
  console.log(`  ─────────────────────────────`)
  console.log(`  Files:   ${files.length}`)
  console.log(`  Size:    ${formatBytes(totalSize)}`)
  if (chapterFilter) console.log(`  Filter:  ${chapterFilter}`)
  if (dryRun) console.log(`  Mode:    DRY RUN`)
  console.log()

  if (dryRun) {
    for (const file of files) {
      console.log(`  ${file.relativePath.padEnd(50)} ${formatBytes(file.size).padStart(10)}`)
    }
    console.log(`\n  Total: ${formatBytes(totalSize)}\n`)
    return
  }

  const manifest = loadManifest()
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

      const fileBuffer = fs.readFileSync(file.absolutePath)
      const blob = await put(`academy/videos/${key}`, fileBuffer, {
        access: 'public',
        addRandomSuffix: false,
        contentType: key.endsWith('.mkv') ? 'video/x-matroska' : 'video/mp4',
      })

      manifest.videos[key] = {
        url: blob.url,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      }

      // Save manifest after each upload (crash-safe)
      saveManifest(manifest)
      uploaded++
      console.log(`         → ${blob.url}`)
    } catch (err: any) {
      failed++
      console.error(`  [${i + 1}/${files.length}] FAIL  ${key}: ${err.message}`)
    }
  }

  console.log(`\n  ─────────────────────────────`)
  console.log(`  Uploaded: ${uploaded}`)
  console.log(`  Skipped:  ${skipped}`)
  console.log(`  Failed:   ${failed}`)
  console.log(`  Manifest: ${MANIFEST_PATH}\n`)
}

main().catch(console.error)
