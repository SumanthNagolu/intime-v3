/**
 * Content Upload System Types
 * Story: ACAD-004
 *
 * Types for managing uploaded course content (videos, PDFs, images, documents)
 */

/**
 * ContentAsset - Uploaded file tracked in database
 */
export interface ContentAsset {
  id: string;
  filename: string;
  storage_path: string;
  file_type: 'video' | 'pdf' | 'image' | 'document' | 'other';
  mime_type: string;
  file_size_bytes: number;
  topic_id: string | null;
  lesson_id: string | null;
  cdn_url: string | null;
  is_public: boolean;
  replaced_by: string | null;
  is_current: boolean;
  uploaded_by: string | null;
  uploaded_at: string;
  searchable_content: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Extended types with relationships
 */
export interface ContentAssetWithTopic extends ContentAsset {
  topic?: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface ContentAssetWithUploader extends ContentAsset {
  uploader?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface ContentAssetFull extends ContentAsset {
  topic?: {
    id: string;
    title: string;
    module_id: string;
  };
  lesson?: {
    id: string;
    title: string;
  };
  uploader?: {
    id: string;
    full_name: string;
  };
  replacement?: {
    id: string;
    filename: string;
    uploaded_at: string;
  };
}

/**
 * Upload inputs
 */
export interface UploadContentInput {
  file: File;
  topicId?: string;
  lessonId?: string;
  isPublic?: boolean;
}

export interface RecordUploadInput {
  filename: string;
  storagePath: string;
  fileType: ContentAsset['file_type'];
  mimeType: string;
  fileSizeBytes: number;
  topicId?: string;
  lessonId?: string;
  uploadedBy?: string;
  cdnUrl?: string;
}

/**
 * Upload results
 */
export interface UploadResult {
  assetId: string;
  storagePath: string;
  cdnUrl: string;
  fileType: ContentAsset['file_type'];
  fileSizeBytes: number;
}

export interface SignedUrlResult {
  signedUrl: string;
  expiresAt: Date;
}

/**
 * Storage usage statistics
 */
export interface StorageUsage {
  fileCount: number;
  totalBytes: number;
  videoCount: number;
  videoBytes: number;
  documentCount: number;
  documentBytes: number;
}

export interface CourseStorageUsage extends StorageUsage {
  courseId: string;
  courseTitle: string;
  totalGB: number;
  videoGB: number;
  documentGB: number;
}

/**
 * File metadata for UI
 */
export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface UploadProgress {
  file: FileMetadata;
  bytesUploaded: number;
  totalBytes: number;
  percentage: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

/**
 * Asset versioning
 */
export interface AssetVersion {
  assetId: string;
  filename: string;
  uploadedAt: string;
  uploadedBy: string;
  fileSizeBytes: number;
  isCurrent: boolean;
  replacedBy: string | null;
}

export interface AssetVersionHistory {
  currentVersion: AssetVersion;
  previousVersions: AssetVersion[];
  totalVersions: number;
}

/**
 * File type utilities
 */
export const FILE_TYPE_LABELS: Record<ContentAsset['file_type'], string> = {
  video: 'Video',
  pdf: 'PDF Document',
  image: 'Image',
  document: 'Document',
  other: 'Other',
};

export const FILE_TYPE_ICONS: Record<ContentAsset['file_type'], string> = {
  video: '🎥',
  pdf: '📄',
  image: '🖼️',
  document: '📁',
  other: '📎',
};

export const MAX_FILE_SIZES: Record<ContentAsset['file_type'], number> = {
  video: 2 * 1024 * 1024 * 1024, // 2GB
  pdf: 50 * 1024 * 1024, // 50MB
  image: 10 * 1024 * 1024, // 10MB
  document: 50 * 1024 * 1024, // 50MB
  other: 50 * 1024 * 1024, // 50MB
};

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
];

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

/**
 * Validation helpers
 */
export function getFileType(mimeType: string): ContentAsset['file_type'] {
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('application/')) return 'document';
  return 'other';
}

export function isValidFileType(mimeType: string, fileType: ContentAsset['file_type']): boolean {
  switch (fileType) {
    case 'video':
      return ALLOWED_VIDEO_TYPES.includes(mimeType);
    case 'pdf':
      return mimeType === 'application/pdf';
    case 'image':
      return ALLOWED_IMAGE_TYPES.includes(mimeType);
    case 'document':
      return ALLOWED_DOCUMENT_TYPES.includes(mimeType);
    default:
      return true;
  }
}

export function isFileSizeValid(sizeBytes: number, fileType: ContentAsset['file_type']): boolean {
  return sizeBytes <= MAX_FILE_SIZES[fileType];
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Error types
 */
export class FileUploadError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'FileUploadError';
  }
}

export class FileSizeExceededError extends FileUploadError {
  constructor(fileType: ContentAsset['file_type'], actualSize: number, maxSize: number) {
    super(
      `File size ${formatFileSize(actualSize)} exceeds maximum ${formatFileSize(maxSize)} for ${fileType} files`,
      'FILE_SIZE_EXCEEDED',
      { fileType, actualSize, maxSize }
    );
  }
}

export class InvalidFileTypeError extends FileUploadError {
  constructor(mimeType: string, expectedType: ContentAsset['file_type']) {
    super(
      `Invalid file type ${mimeType} for ${expectedType} upload`,
      'INVALID_FILE_TYPE',
      { mimeType, expectedType }
    );
  }
}

export class StorageQuotaExceededError extends FileUploadError {
  constructor(courseId: string, usedBytes: number, quotaBytes: number) {
    super(
      `Storage quota exceeded for course. Used: ${formatFileSize(usedBytes)}, Quota: ${formatFileSize(quotaBytes)}`,
      'STORAGE_QUOTA_EXCEEDED',
      { courseId, usedBytes, quotaBytes }
    );
  }
}
