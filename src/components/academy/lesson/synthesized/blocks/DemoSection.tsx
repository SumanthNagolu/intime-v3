'use client'

import React from 'react'
import { Play } from 'lucide-react'
import type { DemoBlock, VideoRef } from '@/lib/academy/types'
import { DemoVideo } from '../../DemoVideo'

interface DemoSectionProps {
  block: DemoBlock
  videos: VideoRef[]
  chapterSlug: string
  onVideoWatched: (filename: string) => void
  watchedVideos: string[]
}

export function DemoSection({
  block,
  videos,
  chapterSlug,
  onVideoWatched,
  watchedVideos,
}: DemoSectionProps) {
  const video = videos[block.videoIndex]
  if (!video) return null

  return (
    <div className="m-demo-section m-animate" id={`block-${block.id}`}>
      {/* Context card above video */}
      <div className="m-demo-context">
        <div className="m-demo-context-badge">
          <Play className="w-3.5 h-3.5" />
          <span>Watch For</span>
        </div>
        <p className="m-demo-context-text">{block.context}</p>
      </div>

      {/* Reuse existing DemoVideo component */}
      <div className="m-video-block">
        <DemoVideo
          video={video}
          chapterSlug={chapterSlug}
          onWatched={onVideoWatched}
          isWatched={watchedVideos.includes(video.filename)}
        />
      </div>

      {/* Transcript summary below video */}
      {block.transcriptSummary && (
        <div className="m-demo-summary">
          <span className="m-demo-summary-label">Key Points from Demo</span>
          <p>{block.transcriptSummary}</p>
        </div>
      )}
    </div>
  )
}
