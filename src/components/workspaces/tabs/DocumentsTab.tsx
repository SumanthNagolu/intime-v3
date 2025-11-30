/**
 * DocumentsTab Component
 *
 * Generic document management tab for workspace pages.
 * Supports categorized uploads, filtering, download, and delete.
 */

'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  FolderOpen,
  FileText,
  File,
  Image,
  FileSpreadsheet,
  Presentation,
  ExternalLink,
  Trash2,
  X,
  Loader2,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import type { EntityType } from '@/lib/workspace/entity-registry';

// =====================================================
// TYPES
// =====================================================

export interface DocumentCategory {
  key: string;
  label: string;
  color: string;
  description?: string;
}

export interface DocumentsTabProps {
  entityType: EntityType;
  entityId: string;
  categories: DocumentCategory[];
  canUpload?: boolean;
  canDelete?: boolean;
  className?: string;
}

interface FileMetadata {
  category: string;
  description: string;
  tags: string[];
}

interface DocumentFile {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  uploaderName?: string;
  metadata?: {
    category?: string;
    description?: string;
    tags?: string[];
  } | null;
}

// =====================================================
// HELPERS
// =====================================================

function getFileIcon(mimeType: string): React.ReactNode {
  if (mimeType.startsWith('image/')) return <Image className="w-6 h-6 text-purple-500" />;
  if (mimeType.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
    return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint'))
    return <Presentation className="w-6 h-6 text-orange-500" />;
  if (mimeType.includes('word') || mimeType.includes('document'))
    return <FileText className="w-6 h-6 text-blue-500" />;
  return <File className="w-6 h-6 text-stone-500" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// =====================================================
// UPLOAD MODAL
// =====================================================

function UploadModal({
  isOpen,
  onClose,
  files,
  categories,
  isUploading,
  onUpload,
}: {
  isOpen: boolean;
  onClose: () => void;
  files: File[];
  categories: DocumentCategory[];
  isUploading: boolean;
  onUpload: (metadata: FileMetadata) => void;
}) {
  const [category, setCategory] = useState(categories[0]?.key || '');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = () => {
    onUpload({ category, description, tags });
    // Reset form
    setCategory(categories[0]?.key || '');
    setDescription('');
    setTags([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Files Preview */}
          <div className="bg-stone-50 rounded-lg p-3 space-y-2">
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              {files.length} file(s) selected
            </p>
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                {getFileIcon(file.type)}
                <span className="truncate flex-1">{file.name}</span>
                <span className="text-stone-400 text-xs">{formatFileSize(file.size)}</span>
              </div>
            ))}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.key} value={cat.key}>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', cat.color.split(' ')[0])} />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description (optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (optional)</label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>
                <Tag className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isUploading || !category}>
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function DocumentsTab({
  entityType,
  entityId,
  categories,
  canUpload = true,
  canDelete = true,
  className,
}: DocumentsTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch documents
  const {
    data: documents,
    isLoading,
    refetch,
  } = trpc.files.list.useQuery(
    { entityType, entityId, limit: 100, offset: 0 },
    { enabled: !!entityType && !!entityId }
  );

  // Upload mutation
  const getUploadUrlMutation = trpc.files.getUploadUrl.useMutation();
  const recordUploadMutation = trpc.files.recordUpload.useMutation();
  const deleteFileMutation = trpc.files.delete.useMutation({
    onSuccess: () => refetch(),
  });

  // Download URL mutation
  const getDownloadUrlMutation = trpc.files.getDownloadUrl.useMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setPendingFiles(Array.from(files));
      setShowUploadModal(true);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadWithMetadata = async (metadata: FileMetadata) => {
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of pendingFiles) {
        // Get presigned URL
        const { uploadUrl, filePath, bucket } = await getUploadUrlMutation.mutateAsync({
          fileName: file.name,
          mimeType: file.type,
          entityType,
          entityId,
        });

        // Upload to S3
        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        // Record in database
        await recordUploadMutation.mutateAsync({
          bucket,
          filePath,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          entityType,
          entityId,
          metadata: {
            category: metadata.category,
            description: metadata.description,
            tags: metadata.tags,
          },
        });
      }

      refetch();
      setShowUploadModal(false);
      setPendingFiles([]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      const { url } = await getDownloadUrlMutation.mutateAsync({ fileId });
      window.open(url, '_blank');
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!confirm(`Delete "${fileName}"? This cannot be undone.`)) return;
    deleteFileMutation.mutate({ fileId });
  };

  // Filter documents by category
  const filteredDocuments = selectedCategory
    ? (documents as DocumentFile[] | undefined)?.filter(
        (d) => d.metadata?.category === selectedCategory
      )
    : (documents as DocumentFile[] | undefined);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="bg-stone-50 rounded-xl border border-stone-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-600">
              Documents
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Upload and manage files related to this {entityType.replace('_', ' ')}
            </p>
          </div>
          {canUpload && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg"
                multiple
              />
              <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload Document
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All ({documents?.length || 0})
        </Button>
        {categories.map((cat) => {
          const count =
            (documents as DocumentFile[] | undefined)?.filter(
              (d) => d.metadata?.category === cat.key
            ).length || 0;
          return (
            <Button
              key={cat.key}
              variant={selectedCategory === cat.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.key)}
              className={selectedCategory === cat.key ? cat.color : ''}
            >
              {cat.label} {count > 0 && `(${count})`}
            </Button>
          );
        })}
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-stone-400" />
          </div>
        ) : filteredDocuments && filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => {
            const category = categories.find((c) => c.key === doc.metadata?.category);

            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-stone-200 p-4 hover:border-stone-300 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {getFileIcon(doc.mimeType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-charcoal truncate">{doc.fileName}</span>
                      {category && (
                        <Badge variant="secondary" className={cn('text-xs', category.color)}>
                          {category.label}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-stone-400 flex items-center gap-3 mt-1">
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>•</span>
                      <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      {doc.uploaderName && (
                        <>
                          <span>•</span>
                          <span>by {doc.uploaderName}</span>
                        </>
                      )}
                    </div>
                    {doc.metadata?.description && (
                      <p className="text-xs text-stone-500 mt-1 truncate">
                        {doc.metadata.description}
                      </p>
                    )}
                    {doc.metadata?.tags && doc.metadata.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {doc.metadata.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                        {doc.metadata.tags.length > 3 && (
                          <span className="text-[10px] text-stone-400">
                            +{doc.metadata.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDownload(doc.id)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-stone-400 hover:text-destructive"
                        onClick={() => handleDelete(doc.id, doc.fileName)}
                        disabled={deleteFileMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 text-stone-300" />
            <p className="text-stone-500 font-medium">
              {selectedCategory
                ? `No ${categories.find((c) => c.key === selectedCategory)?.label} documents yet`
                : 'No documents yet'}
            </p>
            <p className="text-sm text-stone-400 mt-1">Upload your first document to get started</p>
            {canUpload && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Document
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setPendingFiles([]);
        }}
        files={pendingFiles}
        categories={categories}
        isUploading={isUploading}
        onUpload={handleUploadWithMetadata}
      />
    </div>
  );
}

export default DocumentsTab;
