/**
 * DocumentUploadModal Component
 *
 * Generic file upload modal with metadata (category, description, tags).
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  X,
  File,
  FileText,
  Image,
  FileSpreadsheet,
  Presentation,
  Loader2,
  Tag,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { DocumentCategory } from '../tabs/DocumentsTab';

// =====================================================
// TYPES
// =====================================================

export interface UploadedFileMetadata {
  category: string;
  description: string;
  tags: string[];
}

export interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[], metadata: UploadedFileMetadata) => Promise<void>;
  categories: DocumentCategory[];
  title?: string;
  description?: string;
  acceptedTypes?: string;
  maxFiles?: number;
  maxSizeMB?: number;
}

// =====================================================
// HELPERS
// =====================================================

function getFileIcon(mimeType: string): React.ReactNode {
  if (mimeType.startsWith('image/')) return <Image className="w-5 h-5 text-purple-500" />;
  if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
    return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint'))
    return <Presentation className="w-5 h-5 text-orange-500" />;
  if (mimeType.includes('word') || mimeType.includes('document'))
    return <FileText className="w-5 h-5 text-blue-500" />;
  return <File className="w-5 h-5 text-stone-500" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// =====================================================
// DROP ZONE
// =====================================================

function DropZone({
  onFilesSelected,
  acceptedTypes,
  maxFiles,
  maxSizeMB,
}: {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes: string;
  maxFiles: number;
  maxSizeMB: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).slice(0, maxFiles);
      onFilesSelected(files);
    },
    [maxFiles, onFilesSelected]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      onFilesSelected(Array.from(files).slice(0, maxFiles));
    }
  };

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
        isDragging ? 'border-rust bg-rust/5' : 'border-stone-200 hover:border-stone-300'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        className="hidden"
        accept={acceptedTypes}
        multiple={maxFiles > 1}
      />
      <Upload className="w-10 h-10 mx-auto mb-3 text-stone-400" />
      <p className="text-sm font-medium text-charcoal mb-1">
        Drop files here or click to browse
      </p>
      <p className="text-xs text-stone-500">
        Max {maxFiles} files, up to {maxSizeMB}MB each
      </p>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function DocumentUploadModal({
  isOpen,
  onClose,
  onUpload,
  categories,
  title = 'Upload Documents',
  description = 'Select files to upload and add metadata',
  acceptedTypes = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg',
  maxFiles = 10,
  maxSizeMB = 25,
}: DocumentUploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState(categories[0]?.key || '');
  const [fileDescription, setFileDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFilesSelected = (newFiles: File[]) => {
    // Filter by size
    const validFiles = newFiles.filter((f) => f.size <= maxSizeMB * 1024 * 1024);
    setFiles((prev) => [...prev, ...validFiles].slice(0, maxFiles));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    if (files.length === 0 || !category) return;

    setIsUploading(true);
    try {
      await onUpload(files, {
        category,
        description: fileDescription,
        tags,
      });
      // Reset and close
      setFiles([]);
      setCategory(categories[0]?.key || '');
      setFileDescription('');
      setTags([]);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setFiles([]);
      setCategory(categories[0]?.key || '');
      setFileDescription('');
      setTags([]);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Drop Zone or File List */}
          {files.length === 0 ? (
            <DropZone
              onFilesSelected={handleFilesSelected}
              acceptedTypes={acceptedTypes}
              maxFiles={maxFiles}
              maxSizeMB={maxSizeMB}
            />
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                  {files.length} file(s) selected
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setFiles([])}
                >
                  Clear all
                </Button>
              </div>
              <div className="bg-stone-50 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm bg-white rounded-lg p-2">
                    {getFileIcon(file.type)}
                    <span className="truncate flex-1">{file.name}</span>
                    <span className="text-stone-400 text-xs flex-shrink-0">
                      {formatFileSize(file.size)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => removeFile(idx)}
                    >
                      <Trash2 className="w-3 h-3 text-stone-400 hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              {files.length < maxFiles && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                >
                  Add more files
                </Button>
              )}
            </div>
          )}

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category *</label>
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
              value={fileDescription}
              onChange={(e) => setFileDescription(e.target.value)}
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
              <Button type="button" variant="outline" size="icon" onClick={addTag}>
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
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUploading || files.length === 0 || !category}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {files.length > 0 ? `(${files.length})` : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DocumentUploadModal;
