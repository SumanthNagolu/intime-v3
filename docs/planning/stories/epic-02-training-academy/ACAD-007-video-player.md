# ACAD-007: Build Video Player with Progress Tracking

**Story Points:** 5
**Sprint:** Sprint 2 (Week 7-8)
**Priority:** CRITICAL

---

## User Story

As a **Student**,
I want **to watch course videos with automatic progress tracking**,
So that **I can learn at my own pace and the system knows what I've watched**.

---

## Acceptance Criteria

- [ ] Vimeo player embedded (or YouTube as fallback)
- [ ] Video progress tracking (pause/resume from last position)
- [ ] Auto-mark complete when 90%+ watched
- [ ] Playback speed controls (0.75x, 1x, 1.25x, 1.5x, 2x)
- [ ] Transcript display (if available)
- [ ] Next video auto-advance (optional, user preference)
- [ ] Watch time analytics (total minutes watched)
- [ ] Mobile-responsive player
- [ ] Keyboard shortcuts (space=pause, arrows=seek)

---

## Technical Implementation

### Video Player Component

```typescript
// src/components/academy/VideoPlayer.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc/client';

interface VideoPlayerProps {
  videoUrl: string;
  topicId: string;
  enrollmentId: string;
  onComplete?: () => void;
}

export function VideoPlayer({ videoUrl, topicId, enrollmentId, onComplete }: VideoPlayerProps) {
  const [watchedPercentage, setWatchedPercentage] = useState(0);
  const playerRef = useRef<HTMLVideoElement>(null);
  const completeMutation = trpc.progress.completeTopic.useMutation();

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handleTimeUpdate = () => {
      const percent = (player.currentTime / player.duration) * 100;
      setWatchedPercentage(percent);

      if (percent >= 90 && !completeMutation.data) {
        completeMutation.mutate({
          enrollmentId,
          topicId,
          timeSpentSeconds: Math.floor(player.currentTime),
          completionMethod: 'video_watched',
        });
        onComplete?.();
      }
    };

    player.addEventListener('timeupdate', handleTimeUpdate);
    return () => player.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  return (
    <div className="video-container">
      <video
        ref={playerRef}
        src={videoUrl}
        controls
        className="w-full aspect-video"
      />
      <div className="mt-2 text-sm text-gray-600">
        Watched: {watchedPercentage.toFixed(0)}%
      </div>
    </div>
  );
}
```

### Progress Persistence

```sql
-- Store last watched position
CREATE TABLE video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  topic_id UUID NOT NULL REFERENCES module_topics(id),
  last_position_seconds INTEGER DEFAULT 0,
  total_watch_time_seconds INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, topic_id)
);
```

---

## Dependencies

- **ACAD-001** (Topics) - Video URLs stored
- **ACAD-003** (Progress) - Completion tracking
- **ACAD-004** (Content Upload) - Video files

---

## Testing

```typescript
it('should mark complete at 90% watched', async () => {
  // Simulate video watched to 90%
  await simulateWatchTime(videoPlayer, 0.9);
  expect(completionCalled).toBe(true);
});
```

---

**Related Stories:**
- **Next:** ACAD-008 (Lab Environments)
- **Depends On:** ACAD-001, ACAD-003, ACAD-004
