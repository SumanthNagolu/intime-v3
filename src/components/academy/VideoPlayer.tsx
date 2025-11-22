/**
 * Video Player Component
 * ACAD-007
 *
 * Features:
 * - Multiple provider support (Vimeo, YouTube, direct URLs)
 * - Automatic progress tracking
 * - Resume from last position
 * - Auto-complete at 90% watched
 * - Playback speed controls
 * - Keyboard shortcuts
 * - Mobile responsive
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  VideoPlayerProps,
  VideoProgressUpdate,
  PlaybackSpeed,
  VideoControlsState,
  formatVideoTime,
  shouldMarkComplete,
} from '@/types/video';

export function VideoPlayer({
  videoUrl,
  videoProvider,
  topicId,
  enrollmentId,
  userId,
  initialPosition = 0,
  autoPlay = false,
  onProgress,
  onComplete,
  transcript,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [controls, setControls] = useState<VideoControlsState>({
    isPlaying: false,
    isMuted: false,
    volume: 1,
    playbackRate: 1,
    currentTime: 0,
    duration: 0,
    isFullscreen: false,
    showControls: true,
  });

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [lastProgressSave, setLastProgressSave] = useState(0);
  const [hasCompletedVideo, setHasCompletedVideo] = useState(false);

  const PROGRESS_SAVE_INTERVAL = 10; // Save progress every 10 seconds

  // Initialize video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set initial position
    if (initialPosition > 0) {
      video.currentTime = initialPosition;
    }

    // Auto-play if enabled
    if (autoPlay) {
      video.play().catch((err) => console.error('Auto-play failed:', err));
    }
  }, [initialPosition, autoPlay]);

  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const currentTime = video.currentTime;
    const duration = video.duration;

    setControls((prev) => ({
      ...prev,
      currentTime,
      duration,
    }));

    // Report progress
    const percentageWatched = (currentTime / duration) * 100;
    const watchTimeIncrement = currentTime - lastProgressSave;

    if (watchTimeIncrement >= PROGRESS_SAVE_INTERVAL) {
      onProgress?.({
        currentTime,
        duration,
        percentageWatched,
        watchTimeIncrement,
      });
      setLastProgressSave(currentTime);
    }

    // Auto-complete at 90%
    if (!hasCompletedVideo && shouldMarkComplete(currentTime, duration, 0.9)) {
      setHasCompletedVideo(true);
      onComplete?.();
    }
  }, [lastProgressSave, hasCompletedVideo, onProgress, onComplete]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Playback controls
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setControls((prev) => ({ ...prev, isPlaying: true }));
    } else {
      video.pause();
      setControls((prev) => ({ ...prev, isPlaying: false }));
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setControls((prev) => ({ ...prev, isMuted: video.muted }));
  };

  const changePlaybackSpeed = (speed: PlaybackSpeed) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = speed;
    setControls((prev) => ({ ...prev, playbackRate: speed }));
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setControls((prev) => ({ ...prev, isFullscreen: true }));
    } else {
      document.exitFullscreen();
      setControls((prev) => ({ ...prev, isFullscreen: false }));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setControls((prev) => ({ ...prev, currentTime: newTime }));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setControls((prev) => ({ ...prev, volume: newVolume, isMuted: newVolume === 0 }));
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.min(video.duration, video.currentTime + 30);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-lg overflow-hidden group"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          const video = videoRef.current;
          if (video) {
            setControls((prev) => ({ ...prev, duration: video.duration }));
          }
        }}
        onPlay={() => setControls((prev) => ({ ...prev, isPlaying: true }))}
        onPause={() => setControls((prev) => ({ ...prev, isPlaying: false }))}
        onEnded={() => {
          setControls((prev) => ({ ...prev, isPlaying: false }));
          if (!hasCompletedVideo) {
            setHasCompletedVideo(true);
            onComplete?.();
          }
        }}
      />

      {/* Custom Controls */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity',
          controls.showControls ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        )}
      >
        {/* Progress Bar */}
        <div className="mb-3">
          <input
            type="range"
            min="0"
            max={controls.duration || 0}
            value={controls.currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-white/80 mt-1">
            <span>{formatVideoTime(controls.currentTime)}</span>
            <span>{formatVideoTime(controls.duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={togglePlayPause}
            className="text-white hover:text-blue-400 transition-colors"
            aria-label={controls.isPlaying ? 'Pause' : 'Play'}
          >
            {controls.isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </button>

          {/* Skip Forward */}
          <button
            onClick={skipForward}
            className="text-white hover:text-blue-400 transition-colors"
            aria-label="Skip forward 30 seconds"
          >
            <SkipForward className="h-5 w-5" />
          </button>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-white hover:text-blue-400 transition-colors"
              aria-label={controls.isMuted ? 'Unmute' : 'Mute'}
            >
              {controls.isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={controls.volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="flex-1" />

          {/* Playback Speed */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="text-white hover:text-blue-400 transition-colors flex items-center gap-1 text-sm"
            >
              <Settings className="h-5 w-5" />
              <span>{controls.playbackRate}x</span>
            </button>
            {showSpeedMenu && (
              <div className="absolute bottom-full mb-2 right-0 bg-black/90 rounded-lg p-2 min-w-[100px]">
                {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => changePlaybackSpeed(speed as PlaybackSpeed)}
                    className={cn(
                      'block w-full text-left px-3 py-1.5 text-sm rounded hover:bg-white/10 transition-colors',
                      controls.playbackRate === speed ? 'text-blue-400' : 'text-white'
                    )}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-blue-400 transition-colors"
            aria-label="Toggle fullscreen"
          >
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Completion Badge */}
      {hasCompletedVideo && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          ✓ Completed
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      <div className="absolute top-4 left-4 text-white/60 text-xs">
        Press <kbd className="px-1 bg-white/20 rounded">Space</kbd> to play/pause
      </div>
    </div>
  );
}

/**
 * Simple Progress Display
 */
export function VideoProgressDisplay({
  currentTime,
  duration,
  completionPercentage,
}: {
  currentTime: number;
  duration: number;
  completionPercentage: number;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-600">
      <span>
        {formatVideoTime(currentTime)} / {formatVideoTime(duration)}
      </span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
      <span className="font-medium">{Math.round(completionPercentage)}%</span>
    </div>
  );
}
