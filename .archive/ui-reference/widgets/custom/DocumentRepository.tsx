'use client';

/**
 * Document Repository Widget
 *
 * File management component with grid/list views, categories, search, and upload.
 * Displays documents with preview modal support.
 */

import React, { useState } from 'react';
import {
  FileText, Folder, Search, Upload, Grid3X3, List, Download, Eye,
  MoreHorizontal, Trash2, Edit2, Star, Clock, Filter, ChevronDown,
  File, FileImage, FileSpreadsheet, FilePlus, X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'xls' | 'img' | 'other';
  category: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  starred?: boolean;
  url?: string;
}

// Mock document data
const MOCK_DOCUMENTS: Document[] = [
  { id: '1', name: 'Employee Handbook 2024.pdf', type: 'pdf', category: 'policies', size: 2500000, uploadedAt: '2024-01-15', uploadedBy: 'HR Admin', starred: true },
  { id: '2', name: 'PTO Request Form.docx', type: 'doc', category: 'templates', size: 125000, uploadedAt: '2024-02-01', uploadedBy: 'HR Admin' },
  { id: '3', name: 'Performance Review Template.xlsx', type: 'xls', category: 'templates', size: 85000, uploadedAt: '2024-01-20', uploadedBy: 'HR Admin' },
  { id: '4', name: 'IT Security Policy.pdf', type: 'pdf', category: 'policies', size: 1200000, uploadedAt: '2024-02-10', uploadedBy: 'IT Admin', starred: true },
  { id: '5', name: 'New Hire Checklist.pdf', type: 'pdf', category: 'templates', size: 350000, uploadedAt: '2024-01-25', uploadedBy: 'HR Admin' },
  { id: '6', name: 'Org Chart 2024.png', type: 'img', category: 'employee-files', size: 750000, uploadedAt: '2024-02-15', uploadedBy: 'HR Admin' },
  { id: '7', name: 'Benefits Guide.pdf', type: 'pdf', category: 'policies', size: 3200000, uploadedAt: '2024-01-05', uploadedBy: 'Benefits Team' },
  { id: '8', name: 'Expense Report Form.xlsx', type: 'xls', category: 'templates', size: 45000, uploadedAt: '2024-02-20', uploadedBy: 'Finance' },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  switch (type) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-error-500" />;
    case 'doc':
      return <FileText className="w-5 h-5 text-blue-500" />;
    case 'xls':
      return <FileSpreadsheet className="w-5 h-5 text-success-500" />;
    case 'img':
      return <FileImage className="w-5 h-5 text-gold-500" />;
    default:
      return <File className="w-5 h-5 text-charcoal-400" />;
  }
}

interface DocumentCardProps {
  document: Document;
  viewMode: 'grid' | 'list';
  onPreview: (doc: Document) => void;
  onDownload: (doc: Document) => void;
}

function DocumentCard({ document, viewMode, onPreview, onDownload }: DocumentCardProps) {
  if (viewMode === 'grid') {
    return (
      <div className={cn(
        "group p-4 rounded-xl border border-charcoal-100 bg-white",
        "hover:border-forest-300 hover:shadow-md transition-all duration-200",
        "cursor-pointer"
      )}
      onClick={() => onPreview(document)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 bg-charcoal-50 rounded-lg flex items-center justify-center">
            {getFileIcon(document.type)}
          </div>
          {document.starred && (
            <Star className="w-4 h-4 text-gold-500 fill-gold-500" />
          )}
        </div>
        <p className="text-sm font-medium text-charcoal-900 truncate mb-1">
          {document.name}
        </p>
        <div className="flex items-center gap-2 text-xs text-charcoal-500">
          <span>{formatFileSize(document.size)}</span>
          <span>•</span>
          <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => { e.stopPropagation(); onPreview(document); }}
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => { e.stopPropagation(); onDownload(document); }}
          >
            <Download className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div
      className={cn(
        "group flex items-center gap-4 p-3 rounded-lg",
        "hover:bg-charcoal-50 transition-colors cursor-pointer"
      )}
      onClick={() => onPreview(document)}
    >
      <div className="w-10 h-10 bg-charcoal-50 rounded-lg flex items-center justify-center shrink-0">
        {getFileIcon(document.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-charcoal-900 truncate">
            {document.name}
          </p>
          {document.starred && (
            <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500 shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-charcoal-500 mt-0.5">
          <span className="capitalize">{document.category.replace('-', ' ')}</span>
          <span>•</span>
          <span>{formatFileSize(document.size)}</span>
          <span>•</span>
          <span>{document.uploadedBy}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-charcoal-400">
        <Clock className="w-3.5 h-3.5" />
        <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={(e) => { e.stopPropagation(); onPreview(document); }}
        >
          <Eye className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={(e) => { e.stopPropagation(); onDownload(document); }}
        >
          <Download className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function DocumentRepository({ definition, data, context }: SectionWidgetProps) {
  const isLoading = context?.isLoading;
  const componentProps = (definition as { componentProps?: { showSearch?: boolean; showUpload?: boolean; categories?: string[] } }).componentProps || {};
  const showSearch = componentProps.showSearch ?? true;
  const showUpload = componentProps.showUpload ?? true;

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  // Use mock data - would come from tRPC in real implementation
  const documents = MOCK_DOCUMENTS;

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchQuery ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePreview = (doc: Document) => {
    setPreviewDocument(doc);
  };

  const handleDownload = (doc: Document) => {
    if (doc.url) {
      window.open(doc.url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-forest-100 rounded-lg animate-pulse" />
            <div className="h-6 w-40 bg-stone-200 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-32 bg-stone-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-charcoal-100 shadow-elevation-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-forest rounded-lg flex items-center justify-center shadow-sm">
                <Folder className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
                  Document Repository
                </CardTitle>
                <p className="text-sm text-charcoal-500 mt-0.5">
                  {filteredDocuments.length} documents
                </p>
              </div>
            </div>
            {showUpload && (
              <Button variant="default" size="sm" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </Button>
            )}
          </div>

          {/* Search and filters */}
          <div className="flex items-center gap-3 mt-4">
            {showSearch && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}
            <div className="flex items-center gap-1 border border-charcoal-200 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Category filters */}
          <div className="flex items-center gap-2 mt-3">
            <Button
              variant={selectedCategory === null ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            <Button
              variant={selectedCategory === 'templates' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory('templates')}
            >
              Templates
            </Button>
            <Button
              variant={selectedCategory === 'policies' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory('policies')}
            >
              Policies
            </Button>
            <Button
              variant={selectedCategory === 'employee-files' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory('employee-files')}
            >
              Employee Files
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {filteredDocuments.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredDocuments.map(doc => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    viewMode={viewMode}
                    onPreview={handlePreview}
                    onDownload={handleDownload}
                  />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-charcoal-50">
                {filteredDocuments.map(doc => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    viewMode={viewMode}
                    onPreview={handlePreview}
                    onDownload={handleDownload}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-charcoal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-charcoal-400" />
              </div>
              <p className="text-sm font-medium text-charcoal-600">
                No documents found
              </p>
              <p className="text-xs text-charcoal-400 mt-1">
                {searchQuery ? 'Try a different search term' : 'Upload documents to get started'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-charcoal-100">
              <div className="flex items-center gap-3">
                {getFileIcon(previewDocument.type)}
                <span className="font-medium text-charcoal-900">{previewDocument.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(previewDocument)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewDocument(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="p-6 h-[60vh] overflow-auto bg-charcoal-50">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-20 h-20 bg-charcoal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    {getFileIcon(previewDocument.type)}
                  </div>
                  <p className="text-charcoal-600">Document preview</p>
                  <p className="text-sm text-charcoal-400 mt-1">
                    {previewDocument.name}
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-4"
                    onClick={() => handleDownload(previewDocument)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download to View
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DocumentRepository;
