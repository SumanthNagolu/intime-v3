/**
 * Markdown Reader Component
 * ACAD-009
 *
 * Features:
 * - Markdown rendering with syntax highlighting
 * - Code block copy functionality
 * - Reading progress tracking
 * - Table of contents
 * - Dark mode support
 * - Auto-complete at 90% scroll
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MarkdownReaderProps,
  ReadingProgressUpdate,
  TOCHeading,
  extractHeadings,
  calculateScrollPercentage,
  shouldMarkReadingComplete,
  estimateReadingTime,
  copyToClipboard,
} from '@/types/reading';

export function MarkdownReader({
  content,
  onProgress,
  onComplete,
  initialScrollPosition = 0,
  darkMode = false,
  showTableOfContents = true,
}: MarkdownReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [lastProgressSave, setLastProgressSave] = useState(0);
  const [toc, setToc] = useState<TOCHeading[]>([]);
  const [activeHeading, setActiveHeading] = useState<string | null>(null);

  const PROGRESS_SAVE_INTERVAL = 10; // Save progress every 10 seconds

  // Extract TOC from markdown
  useEffect(() => {
    if (showTableOfContents) {
      const headings = extractHeadings(content);
      setToc(headings);
    }
  }, [content, showTableOfContents]);

  // Set initial scroll position
  useEffect(() => {
    if (initialScrollPosition > 0 && containerRef.current) {
      containerRef.current.scrollTop = initialScrollPosition;
    }
  }, [initialScrollPosition]);

  // Handle scroll tracking
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollPosition = container.scrollTop;
    const documentHeight = container.scrollHeight;
    const windowHeight = container.clientHeight;

    const percentage = calculateScrollPercentage(scrollPosition, documentHeight, windowHeight);
    setScrollPercentage(percentage);

    // Report progress
    const currentTime = Date.now();
    const timeElapsed = (currentTime - lastProgressSave) / 1000;

    if (timeElapsed >= PROGRESS_SAVE_INTERVAL) {
      onProgress?.({
        scrollPercentage: percentage,
        scrollPosition,
        readingTimeIncrement: Math.round(timeElapsed),
      });
      setLastProgressSave(currentTime);
    }

    // Auto-complete at 90%
    if (!hasCompleted && shouldMarkReadingComplete(percentage, 90)) {
      setHasCompleted(true);
      onComplete?.();
    }

    // Update active heading in TOC
    updateActiveHeading();
  }, [lastProgressSave, hasCompleted, onProgress, onComplete]);

  // Update active heading based on scroll position
  const updateActiveHeading = () => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let activeId: string | null = null;

    headings.forEach((heading) => {
      const rect = heading.getBoundingClientRect();
      if (rect.top <= 100) {
        activeId = heading.id;
      }
    });

    setActiveHeading(activeId);
  };

  // Estimate reading time
  const readingTimeMinutes = estimateReadingTime(content);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Table of Contents */}
      {showTableOfContents && toc.length > 0 && (
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="sticky top-4">
            <TableOfContents headings={toc} activeId={activeHeading} darkMode={darkMode} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={cn('lg:col-span-3 order-1 lg:order-2', showTableOfContents && toc.length > 0 ? '' : 'lg:col-span-4')}>
        {/* Reading Progress Bar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 pb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{readingTimeMinutes} min read</span>
            </div>
            <span>{scrollPercentage}% complete</span>
          </div>
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${scrollPercentage}%` }}
            />
          </div>
        </div>

        {/* Markdown Content */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className={cn(
            'prose prose-lg max-w-none overflow-y-auto max-h-[calc(100vh-200px)]',
            darkMode ? 'prose-invert' : ''
          )}
        >
          <ReactMarkdown
            components={{
              code({ node, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const inline = props.inline;
                return !inline && match ? (
                  <CodeBlock
                    language={match[1]}
                    code={String(children).replace(/\n$/, '')}
                    darkMode={darkMode}
                  />
                ) : (
                  <code className={cn('px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800', className)} {...props}>
                    {children}
                  </code>
                );
              },
              h1: ({ children, ...props }) => (
                <h1 id={generateId(String(children))} {...props}>
                  {children}
                </h1>
              ),
              h2: ({ children, ...props }) => (
                <h2 id={generateId(String(children))} {...props}>
                  {children}
                </h2>
              ),
              h3: ({ children, ...props }) => (
                <h3 id={generateId(String(children))} {...props}>
                  {children}
                </h3>
              ),
              h4: ({ children, ...props }) => (
                <h4 id={generateId(String(children))} {...props}>
                  {children}
                </h4>
              ),
              h5: ({ children, ...props }) => (
                <h5 id={generateId(String(children))} {...props}>
                  {children}
                </h5>
              ),
              h6: ({ children, ...props }) => (
                <h6 id={generateId(String(children))} {...props}>
                  {children}
                </h6>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Completion Badge */}
        {hasCompleted && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
            <Check className="h-6 w-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-200 font-medium">
              Reading Completed!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Code Block with Copy Button
 */
function CodeBlock({
  language,
  code,
  darkMode,
}: {
  language: string;
  code: string;
  darkMode: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded bg-gray-700 hover:bg-gray-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
      <SyntaxHighlighter
        language={language}
        style={darkMode ? oneDark : oneLight}
        customStyle={{
          borderRadius: '0.5rem',
          padding: '1rem',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

/**
 * Table of Contents
 */
function TableOfContents({
  headings,
  activeId,
  darkMode,
}: {
  headings: TOCHeading[];
  activeId: string | null;
  darkMode: boolean;
}) {
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderHeading = (heading: TOCHeading) => (
    <li key={heading.id}>
      <button
        onClick={() => scrollToHeading(heading.id)}
        className={cn(
          'text-left w-full py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors',
          activeId === heading.id
            ? 'text-blue-600 dark:text-blue-400 font-medium'
            : 'text-gray-600 dark:text-gray-400'
        )}
        style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
      >
        {heading.text}
      </button>
      {heading.children && heading.children.length > 0 && (
        <ul className="ml-3">{heading.children.map(renderHeading)}</ul>
      )}
    </li>
  );

  return (
    <div className={cn('p-4 rounded-lg border', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
      <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">
        Table of Contents
      </h3>
      <ul className="space-y-1 text-sm">{headings.map(renderHeading)}</ul>
    </div>
  );
}

/**
 * Generate ID from heading text
 */
function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Reading Progress Display (standalone)
 */
export function ReadingProgressDisplay({
  scrollPercentage,
  readingTimeSeconds,
}: {
  scrollPercentage: number;
  readingTimeSeconds: number;
}) {
  const minutes = Math.floor(readingTimeSeconds / 60);

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{scrollPercentage}%</span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${scrollPercentage}%` }}
          />
        </div>
      </div>
      <div className="text-gray-600">
        {minutes}m read
      </div>
    </div>
  );
}
