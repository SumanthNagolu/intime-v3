'use client'

import React, { useState, useRef, useCallback, useMemo } from 'react'
import { Play, Pause, Monitor, Maximize2, Volume2, VolumeX, SkipBack, SkipForward, CheckCircle } from 'lucide-react'
import type { SlideContent, VideoRef } from '@/lib/academy/types'

interface DemoSlideProps {
  slide: SlideContent
  video?: VideoRef
  chapterSlug: string
  lessonNumber?: number
  onVideoWatched?: (filename: string) => void
  isVideoWatched?: boolean
}

function formatExplanation(text: string): string[] {
  const rawParagraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0)
  if (rawParagraphs.length > 1) return rawParagraphs.map((p) => p.trim())

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  if (sentences.length <= 3) return [text.trim()]

  const paragraphs: string[] = []
  let current = ''
  for (let i = 0; i < sentences.length; i++) {
    current += sentences[i]
    if ((i + 1) % 3 === 0 || i === sentences.length - 1) {
      paragraphs.push(current.trim())
      current = ''
    }
  }
  if (current.trim()) paragraphs.push(current.trim())
  return paragraphs
}

export function DemoSlide({ slide, video, chapterSlug, lessonNumber, onVideoWatched, isVideoWatched }: DemoSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [hasReached80, setHasReached80] = useState(false)

  const demoTitle = slide.title.replace(/^Demo:\s*/, '')

  const narrationText = slide.narration || ''
  const explanationParagraphs = useMemo(
    () => (narrationText ? formatExplanation(narrationText) : []),
    [narrationText]
  )

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

    if (!hasReached80 && dur > 0 && ct / dur >= 0.8) {
      setHasReached80(true)
      onVideoWatched?.(video!.filename)
    }
  }, [hasReached80, onVideoWatched, video])

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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden" style={{ backgroundColor: 'var(--al-bg, #faf6f0)' }}>
      <div
        className="flex-1 flex flex-col items-center px-3 sm:px-6 lg:px-8 py-4 sm:py-5 relative overflow-y-auto scrollbar-warm"
      >
        {/* Demo badge */}
        <div className="w-full max-w-3xl mb-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-copper-50 border border-copper-200/40 flex items-center justify-center">
              <Monitor className="w-4 h-4 text-copper-500" />
            </div>
            <div>
              <p className="font-mono-warm text-[9px] font-medium uppercase text-copper-500" style={{ letterSpacing: '2.5px' }}>
                Demonstration
              </p>
              <h2 className="font-display font-semibold text-base text-warm-primary" style={{ letterSpacing: '-0.01em' }}>
                {demoTitle}
              </h2>
            </div>
            {(isVideoWatched || hasReached80) && (
              <span className="ml-auto flex items-center gap-1 font-mono-warm text-[9px] font-medium uppercase text-sage-600" style={{ letterSpacing: '2px' }}>
                <CheckCircle className="w-3 h-3" />
                Watched
              </span>
            )}
          </div>
        </div>

        {/* Video player card */}
        {video ? (
          <div className="w-full max-w-3xl animate-fade-in">
            <div className="rounded-xl border border-warm-light/20 bg-warm-deep shadow-elevation-sm overflow-hidden">
              {/* Video element */}
              <div className="relative bg-black aspect-video">
                <video
                  ref={videoRef}
                  src={video.path}
                  className="w-full h-full"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={() => {
                    if (videoRef.current) setDuration(videoRef.current.duration)
                  }}
                  onEnded={() => {
                    setIsPlaying(false)
                    onVideoWatched?.(video.filename)
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
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.muted = !isMuted
                          setIsMuted(!isMuted)
                        }
                      }}
                      className="text-warm-light hover:text-white transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (videoRef.current) {
                          if (document.fullscreenElement) {
                            document.exitFullscreen()
                          } else {
                            videoRef.current.requestFullscreen()
                          }
                        }
                      }}
                      className="text-warm-light hover:text-white transition-colors"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* No video fallback */
          <div className="w-full max-w-3xl">
            <div className="rounded-xl border border-warm-light/20 bg-white shadow-elevation-sm p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-copper-50 border border-copper-200/40 flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-7 h-7 text-copper-500" />
              </div>
              <p className="font-serif text-xs text-warm-muted italic">
                Interactive demo — not available in this format
              </p>
            </div>
          </div>
        )}

        {/* Instructor notes */}
        {slide.notes && slide.narration && slide.notes !== slide.narration && (
          <div className="w-full max-w-3xl mt-4 animate-fade-in">
            <div className="flex items-start gap-2.5 px-4 py-2.5 rounded-lg bg-copper-50 border border-copper-200/40">
              <span className="text-copper-500 text-sm mt-px flex-shrink-0">&#x1F4A1;</span>
              <p className="font-serif text-[13px] leading-relaxed text-copper-800/70 italic">
                {slide.notes}
              </p>
            </div>
          </div>
        )}

        {/* Explanation text */}
        {explanationParagraphs.length > 0 && (
          <>
            <div className="w-16 mx-auto mt-4 mb-1 divider-warm" />
            <div className="mt-2 max-w-3xl w-full space-y-3 animate-fade-in px-1">
              {explanationParagraphs.map((para, i) => (
                <p
                  key={i}
                  className={`font-serif text-[15px] md:text-base ${
                    i === 0 ? 'text-warm-secondary' : 'text-warm-muted'
                  }`}
                  style={{ lineHeight: '1.85' }}
                >
                  {para}
                </p>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
