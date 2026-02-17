'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Play, Pause, Maximize2, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'
import type { VideoRef } from '@/lib/academy/types'
import { resolveVideoUrl } from '@/lib/academy/content-loader'

interface DemoVideoProps {
  video: VideoRef
  chapterSlug: string
  onWatched?: (videoFilename: string) => void
  isWatched?: boolean
}

// Lazy-load Mux Player only when needed
const MuxPlayerLazy = React.lazy(() =>
  import('@mux/mux-player-react').then(mod => ({ default: mod.default }))
)

export function DemoVideo({ video, chapterSlug, onWatched, isWatched }: DemoVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [hasReached80, setHasReached80] = useState(false)

  // Resolved video source - could be a Mux playback ID or a URL/path
  const [videoSrc, setVideoSrc] = useState<{ type: 'mux'; playbackId: string } | { type: 'url'; url: string }>({
    type: 'url',
    url: `/academy/guidewire/videos/${chapterSlug}/${video.filename}`,
  })

  useEffect(() => {
    resolveVideoUrl(chapterSlug, video.filename)
      .then(resolved => {
        if (resolved.startsWith('mux:')) {
          setVideoSrc({ type: 'mux', playbackId: resolved.slice(4) })
        } else {
          setVideoSrc({ type: 'url', url: resolved })
        }
      })
      .catch(() => {
        // Keep fallback URL on error
      })
  }, [chapterSlug, video.filename])

  const handleWatchProgress = useCallback((pct: number) => {
    if (!hasReached80 && pct >= 0.8) {
      setHasReached80(true)
      onWatched?.(video.filename)
    }
  }, [hasReached80, onWatched, video.filename])

  // ALL hooks must be declared before any conditional return
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return
    const ct = videoRef.current.currentTime
    const dur = videoRef.current.duration
    setCurrentTime(ct)
    setProgress(dur > 0 ? (ct / dur) * 100 : 0)
    handleWatchProgress(dur > 0 ? ct / dur : 0)
  }, [handleWatchProgress])

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }, [])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = pct * videoRef.current.duration
  }, [])

  const skip = useCallback((seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds)
      )
    }
  }, [])

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }, [isMuted])

  const toggleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // ── Mux Player ──
  if (videoSrc.type === 'mux') {
    return (
      <div className="rounded-xl border border-warm-light/20 bg-warm-deep shadow-elevation-sm overflow-hidden" id={`video-${video.index}`}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-warm-primary/20">
          <div className="flex items-center gap-2">
            <Play className="w-3.5 h-3.5 text-copper-400" />
            <span className="font-serif text-xs font-medium text-warm-light">
              Demo {video.index}
            </span>
            <span className="font-mono-warm text-xs text-warm-muted">
              {video.filename}
            </span>
          </div>
          {(isWatched || hasReached80) && (
            <span className="font-mono-warm text-[9px] font-medium uppercase text-sage-400" style={{ letterSpacing: '2px' }}>
              Watched
            </span>
          )}
        </div>
        <React.Suspense fallback={
          <div className="aspect-video bg-black flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-warm-light/30 border-t-copper-400 rounded-full" />
          </div>
        }>
          <MuxPlayerLazy
            playbackId={videoSrc.playbackId}
            streamType="on-demand"
            accentColor="#B87333"
            style={{ aspectRatio: '16/9', width: '100%' }}
            onTimeUpdate={(e: any) => {
              const el = e.target
              if (el.duration > 0) {
                handleWatchProgress(el.currentTime / el.duration)
              }
            }}
            onEnded={() => onWatched?.(video.filename)}
          />
        </React.Suspense>
      </div>
    )
  }

  // ── Fallback HTML5 Player (local dev / no manifest) ──
  return (
    <div className="rounded-xl border border-warm-light/20 bg-warm-deep shadow-elevation-sm overflow-hidden" id={`video-${video.index}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-warm-primary/20">
        <div className="flex items-center gap-2">
          <Play className="w-3.5 h-3.5 text-copper-400" />
          <span className="font-serif text-xs font-medium text-warm-light">
            Demo {video.index}
          </span>
          <span className="font-mono-warm text-xs text-warm-muted">
            {video.filename}
          </span>
        </div>
        {(isWatched || hasReached80) && (
          <span className="font-mono-warm text-[9px] font-medium uppercase text-sage-400" style={{ letterSpacing: '2px' }}>
            Watched
          </span>
        )}
      </div>

      {/* Video element */}
      <div className="relative bg-black aspect-video">
        <video
          ref={videoRef}
          src={videoSrc.url}
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            setIsPlaying(false)
            onWatched?.(video.filename)
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          playsInline
        />

        {/* Play overlay when paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity hover:bg-black/40"
          >
            <div className="w-16 h-16 rounded-full bg-copper-500/90 flex items-center justify-center shadow-lg transition-transform hover:scale-110">
              <Play className="w-7 h-7 text-white ml-1" />
            </div>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="px-4 py-3 space-y-2">
        {/* Progress bar */}
        <div
          className="h-1.5 bg-warm-primary/30 rounded-full cursor-pointer group"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-copper-500 rounded-full transition-all duration-150 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-copper-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => skip(-10)}
              className="text-warm-light hover:text-white transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-warm-primary/40 hover:bg-warm-primary/60 flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5" />
              )}
            </button>
            <button
              onClick={() => skip(10)}
              className="text-warm-light hover:text-white transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <span className="font-mono-warm text-xs text-warm-light tabular-nums ml-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-warm-light hover:text-white transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={toggleFullscreen}
              className="text-warm-light hover:text-white transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
