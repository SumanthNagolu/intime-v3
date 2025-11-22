/**
 * Video Player Component
 * Story: ACAD-026
 *
 * Plays demo videos from various platforms (YouTube, Vimeo, Loom, direct files)
 */

'use client';

import { ExternalLink, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  videoUrl: string;
}

export function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  // Detect video platform and generate embed URL
  const getEmbedInfo = (url: string) => {
    try {
      const urlObj = new URL(url);

      // YouTube
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        let videoId = '';
        if (urlObj.hostname.includes('youtu.be')) {
          videoId = urlObj.pathname.slice(1);
        } else {
          videoId = urlObj.searchParams.get('v') || '';
        }
        return {
          platform: 'YouTube',
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          isValid: !!videoId,
        };
      }

      // Vimeo
      if (urlObj.hostname.includes('vimeo.com')) {
        const videoId = urlObj.pathname.split('/').pop();
        return {
          platform: 'Vimeo',
          embedUrl: `https://player.vimeo.com/video/${videoId}`,
          isValid: !!videoId,
        };
      }

      // Loom
      if (urlObj.hostname.includes('loom.com')) {
        const videoId = urlObj.pathname.split('/').pop();
        return {
          platform: 'Loom',
          embedUrl: `https://www.loom.com/embed/${videoId}`,
          isValid: !!videoId,
        };
      }

      // Direct video file (mp4, webm, ogg)
      if (url.match(/\.(mp4|webm|ogg)$/i)) {
        return {
          platform: 'Direct Video',
          embedUrl: url,
          isValid: true,
        };
      }

      // Google Drive
      if (urlObj.hostname.includes('drive.google.com')) {
        const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (fileIdMatch) {
          return {
            platform: 'Google Drive',
            embedUrl: `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`,
            isValid: true,
          };
        }
      }

      // Default: treat as direct link
      return {
        platform: 'Unknown',
        embedUrl: url,
        isValid: false,
      };
    } catch (error) {
      return {
        platform: 'Unknown',
        embedUrl: url,
        isValid: false,
      };
    }
  };

  const { platform, embedUrl, isValid } = getEmbedInfo(videoUrl);

  if (!isValid) {
    return (
      <div className="space-y-4">
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Unable to embed video</p>
            <p className="text-sm text-gray-500 mt-1">Platform: {platform}</p>
          </div>
        </div>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button variant="outline" className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Video in New Tab
          </Button>
        </a>
      </div>
    );
  }

  // Direct video file
  if (platform === 'Direct Video') {
    return (
      <div className="space-y-4">
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <video
            src={embedUrl}
            controls
            className="w-full h-full"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button variant="outline" className="w-full" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Original Video
          </Button>
        </a>
      </div>
    );
  }

  // Embedded iframe (YouTube, Vimeo, Loom, Google Drive)
  return (
    <div className="space-y-4">
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Demo Video"
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Platform: {platform}</p>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in {platform}
          </Button>
        </a>
      </div>
    </div>
  );
}
