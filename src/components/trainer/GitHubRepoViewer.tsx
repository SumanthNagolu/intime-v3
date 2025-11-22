/**
 * GitHub Repository Viewer Component
 * Story: ACAD-026
 *
 * Embeds GitHub repository for code review
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Code, FileCode, GitBranch } from 'lucide-react';

interface GitHubRepoViewerProps {
  repositoryUrl: string;
}

export function GitHubRepoViewer({ repositoryUrl }: GitHubRepoViewerProps) {
  const [viewMode, setViewMode] = useState<'embed' | 'link'>('embed');

  // Parse GitHub URL to extract owner and repo
  const parseGitHubUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      if (pathParts.length >= 2) {
        return {
          owner: pathParts[0],
          repo: pathParts[1].replace('.git', ''),
          isValid: true,
        };
      }
    } catch (error) {
      console.error('Invalid GitHub URL:', error);
    }
    
    return { owner: '', repo: '', isValid: false };
  };

  const { owner, repo, isValid } = parseGitHubUrl(repositoryUrl);

  // GitHub.dev embed URL (VS Code in browser)
  const githubDevUrl = `https://github.dev/${owner}/${repo}`;
  
  // GitHub embed URL (using github1s.com for better embedding)
  const github1sUrl = `https://github1s.com/${owner}/${repo}`;

  if (!isValid) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-medium">Invalid GitHub Repository URL</p>
        <p className="text-red-600 text-sm mt-1">{repositoryUrl}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Repository Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-gray-600" />
          <div>
            <p className="font-mono text-sm text-gray-900">
              {owner}/{repo}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'embed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('embed')}
          >
            <Code className="h-4 w-4 mr-1" />
            Embedded
          </Button>
          <Button
            variant={viewMode === 'link' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('link')}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Links
          </Button>
        </div>
      </div>

      {viewMode === 'embed' ? (
        <div className="space-y-4">
          {/* Embedded Code Viewer */}
          <div className="border rounded-lg overflow-hidden bg-white">
            <iframe
              src={github1sUrl}
              className="w-full h-[600px] border-0"
              title="GitHub Repository Viewer"
              allow="clipboard-read; clipboard-write"
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            💡 Use the embedded VS Code to browse the repository code
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a
              href={repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">View on GitHub</p>
                <p className="text-sm text-gray-600">Browse repository</p>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </a>

            <a
              href={githubDevUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <FileCode className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Open in VS Code</p>
                <p className="text-sm text-gray-600">github.dev editor</p>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </a>

            <a
              href={`${repositoryUrl}/commits`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">View Commits</p>
                <p className="text-sm text-gray-600">Commit history</p>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </a>

            <a
              href={`${repositoryUrl}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                <Code className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">View Issues</p>
                <p className="text-sm text-gray-600">Bug reports & tasks</p>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </a>
          </div>

          {/* Clone Command */}
          <div className="p-4 bg-gray-50 border rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Clone Repository</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-gray-900 text-gray-100 rounded font-mono text-sm overflow-x-auto">
                git clone {repositoryUrl}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(`git clone ${repositoryUrl}`);
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
