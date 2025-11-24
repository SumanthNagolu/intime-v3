/**
 * Reading Materials Types
 * ACAD-009
 */

// ============================================================================
// READING PROGRESS
// ============================================================================

export interface ReadingProgress {
  id: string;
  userId: string;
  topicId: string;
  enrollmentId: string;
  scrollPercentage: number;
  lastScrollPosition: number;
  totalReadingTimeSeconds: number;
  currentPage: number | null;
  totalPages: number | null;
  contentType: ContentType;
  contentLength: number | null;
  sessionCount: number;
  lastReadAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ContentType = 'markdown' | 'pdf' | 'html';

export interface SaveReadingProgressInput {
  userId: string;
  topicId: string;
  enrollmentId: string;
  scrollPercentage: number;
  lastScrollPosition: number;
  readingTimeIncrement?: number;
  contentType?: ContentType;
  contentLength?: number;
  currentPage?: number;
  totalPages?: number;
}

export interface ReadingProgressSummary {
  scrollPercentage: number;
  lastScrollPosition: number;
  totalReadingTimeSeconds: number;
  currentPage: number | null;
  totalPages: number | null;
  contentType: ContentType;
  sessionCount: number;
  lastReadAt: Date;
}

// ============================================================================
// READING STATS
// ============================================================================

export interface UserReadingStats {
  totalArticlesRead: number;
  totalReadingTimeSeconds: number;
  totalArticlesCompleted: number;
  avgScrollPercentage: number;
}

export interface CourseReadingStats {
  topicId: string;
  topicTitle: string;
  totalReaders: number;
  avgScrollPercentage: number;
  totalReadingTimeHours: number;
}

export interface ReadingStatsItem {
  userId: string;
  topicId: string;
  enrollmentId: string;
  topicTitle: string;
  moduleTitle: string;
  courseTitle: string;
  scrollPercentage: number;
  totalReadingTimeSeconds: number;
  sessionCount: number;
  lastReadAt: Date;
  contentType: ContentType;
  currentPage: number | null;
  totalPages: number | null;
  engagementScore: number; // 0-100
}

// ============================================================================
// TABLE OF CONTENTS
// ============================================================================

export interface TOCHeading {
  level: number; // 1-6 (h1-h6)
  text: string;
  id: string;
  children?: TOCHeading[];
}

export interface TableOfContents {
  headings: TOCHeading[];
  activeId: string | null;
}

// ============================================================================
// CODE BLOCK
// ============================================================================

export interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
  highlightLines?: number[];
}

// ============================================================================
// MARKDOWN READER PROPS
// ============================================================================

export interface MarkdownReaderProps {
  content: string;
  onProgress?: (progress: ReadingProgressUpdate) => void;
  onComplete?: () => void;
  initialScrollPosition?: number;
  darkMode?: boolean;
  showTableOfContents?: boolean;
}

export interface ReadingProgressUpdate {
  scrollPercentage: number;
  scrollPosition: number;
  readingTimeIncrement: number; // Seconds since last update
}

// ============================================================================
// PDF VIEWER PROPS
// ============================================================================

export interface PDFViewerProps {
  pdfUrl: string;
  initialPage?: number;
  onProgress?: (progress: PDFProgressUpdate) => void;
  onComplete?: () => void;
}

export interface PDFProgressUpdate {
  currentPage: number;
  totalPages: number;
  scrollPercentage: number;
  readingTimeIncrement: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate engagement score based on scroll percentage
 */
export function calculateEngagementScore(scrollPercentage: number): number {
  if (scrollPercentage >= 90) return 100;
  if (scrollPercentage >= 75) return 85;
  if (scrollPercentage >= 50) return 70;
  if (scrollPercentage >= 25) return 50;
  return 25;
}

/**
 * Determine if reading should be marked complete
 */
export function shouldMarkReadingComplete(
  scrollPercentage: number,
  threshold: number = 90
): boolean {
  return scrollPercentage >= threshold;
}

/**
 * Format reading time
 */
export function formatReadingTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Estimate reading time based on word count
 */
export function estimateReadingTime(content: string, wordsPerMinute: number = 200): number {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
}

/**
 * Extract headings from markdown for TOC
 */
export function extractHeadings(markdown: string): TOCHeading[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: TOCHeading[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text.toLowerCase().replace(/[^\w]+/g, '-');

    headings.push({
      level,
      text,
      id,
    });
  }

  return buildTOCTree(headings);
}

/**
 * Build hierarchical TOC tree
 */
function buildTOCTree(headings: TOCHeading[]): TOCHeading[] {
  const root: TOCHeading[] = [];
  const stack: { heading: TOCHeading; level: number }[] = [];

  for (const heading of headings) {
    // Remove all items from stack with level >= current level
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      // Top-level heading
      root.push(heading);
    } else {
      // Nested heading
      const parent = stack[stack.length - 1].heading;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(heading);
    }

    stack.push({ heading, level: heading.level });
  }

  return root;
}

/**
 * Calculate scroll percentage from position and document height
 */
export function calculateScrollPercentage(
  scrollPosition: number,
  documentHeight: number,
  windowHeight: number
): number {
  const scrollableHeight = documentHeight - windowHeight;
  if (scrollableHeight <= 0) return 100;

  const percentage = (scrollPosition / scrollableHeight) * 100;
  return Math.min(100, Math.max(0, Math.round(percentage)));
}

/**
 * Generate unique ID for heading
 */
export function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Get reading level badge
 */
export function getReadingLevelBadge(scrollPercentage: number): {
  label: string;
  color: string;
} {
  if (scrollPercentage >= 90) {
    return { label: 'Completed', color: 'green' };
  } else if (scrollPercentage >= 50) {
    return { label: 'In Progress', color: 'blue' };
  } else if (scrollPercentage > 0) {
    return { label: 'Started', color: 'yellow' };
  } else {
    return { label: 'Not Started', color: 'gray' };
  }
}

/**
 * Convert markdown to plain text (for word count)
 */
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, '') // Remove headings
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered lists
    .trim();
}
