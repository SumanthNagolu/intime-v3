/**
 * Video Player Types
 * ACAD-007
 */

// ============================================================================
// VIDEO PROGRESS
// ============================================================================

export interface VideoProgress {
  id: string;
  userId: string;
  topicId: string;
  enrollmentId: string;
  lastPositionSeconds: number;
  totalWatchTimeSeconds: number;
  videoDurationSeconds: number | null;
  completionPercentage: number;
  videoUrl: string | null;
  videoProvider: VideoProvider;
  sessionCount: number;
  lastWatchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type VideoProvider = 'vimeo' | 'youtube' | 'direct' | 's3';

export interface SaveVideoProgressInput {
  userId: string;
  topicId: string;
  enrollmentId: string;
  lastPositionSeconds: number;
  videoDurationSeconds: number;
  videoUrl: string;
  videoProvider: VideoProvider;
  watchTimeIncrement?: number;
}

export interface VideoProgressSummary {
  lastPositionSeconds: number;
  totalWatchTimeSeconds: number;
  completionPercentage: number;
  sessionCount: number;
  lastWatchedAt: Date;
}

// ============================================================================
// ANALYTICS
// ============================================================================

export interface UserWatchStats {
  totalVideosWatched: number;
  totalWatchTimeSeconds: number;
  totalVideosCompleted: number;
  avgCompletionPercentage: number;
}

export interface CourseWatchStats {
  topicId: string;
  topicTitle: string;
  totalViewers: number;
  avgCompletionPercentage: number;
  totalWatchTimeHours: number;
}

export interface VideoWatchStats {
  userId: string;
  topicId: string;
  enrollmentId: string;
  topicTitle: string;
  moduleTitle: string;
  courseTitle: string;
  totalWatchTimeSeconds: number;
  completionPercentage: number;
  sessionCount: number;
  lastWatchedAt: Date;
  videoDurationSeconds: number | null;
  videoProvider: VideoProvider;
  engagementScore: number; // 0-100
}

// ============================================================================
// VIDEO PLAYER PROPS
// ============================================================================

export interface VideoPlayerProps {
  videoUrl: string;
  videoProvider: VideoProvider;
  topicId: string;
  enrollmentId: string;
  userId: string;
  initialPosition?: number;
  autoPlay?: boolean;
  onProgress?: (progress: VideoProgressUpdate) => void;
  onComplete?: () => void;
  transcript?: string | null;
}

export interface VideoProgressUpdate {
  currentTime: number;
  duration: number;
  percentageWatched: number;
  watchTimeIncrement: number; // Seconds since last update
}

// ============================================================================
// VIDEO CONTROLS
// ============================================================================

export interface VideoControlsState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number; // 0-1
  playbackRate: number; // 0.75, 1, 1.25, 1.5, 2
  currentTime: number;
  duration: number;
  isFullscreen: boolean;
  showControls: boolean;
}

export type PlaybackSpeed = 0.75 | 1 | 1.25 | 1.5 | 2;

// ============================================================================
// TRANSCRIPT
// ============================================================================

export interface TranscriptSegment {
  startTime: number; // seconds
  endTime: number; // seconds
  text: string;
}

export interface Transcript {
  language: string;
  segments: TranscriptSegment[];
}

// ============================================================================
// VIDEO METADATA
// ============================================================================

export interface VideoMetadata {
  title: string;
  description?: string;
  duration: number; // seconds
  thumbnailUrl?: string;
  provider: VideoProvider;
  providerId?: string; // Vimeo video ID, YouTube video ID, etc.
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface VideoPlayerError {
  code: string;
  message: string;
  details?: unknown;
}

export type VideoPlayerStatus =
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'ended'
  | 'error';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Detect video provider from URL
 */
export function detectVideoProvider(url: string): VideoProvider {
  if (url.includes('vimeo.com')) {
    return 'vimeo';
  }
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('s3.amazonaws.com') || url.includes('cloudfront.net')) {
    return 's3';
  }
  return 'direct';
}

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export function formatVideoTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate engagement score (0-100)
 */
export function calculateEngagementScore(
  watchTimeSeconds: number,
  durationSeconds: number
): number {
  if (durationSeconds === 0) return 0;
  return Math.min(100, Math.round((watchTimeSeconds / durationSeconds) * 100));
}

/**
 * Check if video should be marked as complete
 */
export function shouldMarkComplete(
  currentTime: number,
  duration: number,
  threshold: number = 0.9
): boolean {
  if (duration === 0) return false;
  return currentTime / duration >= threshold;
}

/**
 * Extract Vimeo video ID from URL
 */
export function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtu\.be\/([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}
