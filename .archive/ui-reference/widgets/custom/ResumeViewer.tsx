'use client';

/**
 * Resume Viewer Widget
 *
 * Displays PDF or document preview with download and print options.
 * Supports zoom controls and fullscreen mode.
 */

import React, { useState } from 'react';
import {
  FileText, Download, Printer, ZoomIn, ZoomOut, Maximize2, Minimize2,
  ChevronLeft, ChevronRight, ExternalLink, File, AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface ResumeData {
  url?: string;
  fileName?: string;
  fileType?: string;
  uploadedAt?: string;
  fileSize?: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResumeViewer({ definition, data, context }: SectionWidgetProps) {
  const isLoading = context?.isLoading;
  const componentProps = (definition as { componentProps?: { dataPath?: string; showDownload?: boolean } }).componentProps || {};
  const showDownload = componentProps.showDownload ?? true;

  // Extract resume data
  const resumeData = componentProps.dataPath
    ? (data as Record<string, unknown>)?.[componentProps.dataPath] as ResumeData | undefined
    : data as ResumeData | undefined;

  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(1); // Would come from PDF loader
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

  const handleDownload = () => {
    if (resumeData?.url) {
      window.open(resumeData.url, '_blank');
    }
  };

  const handlePrint = () => {
    if (resumeData?.url) {
      const printWindow = window.open(resumeData.url, '_blank');
      printWindow?.print();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rust-100 rounded-lg animate-pulse" />
            <div className="h-6 w-40 bg-stone-200 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-stone-100 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!resumeData?.url) {
    return (
      <Card className="border-charcoal-100 shadow-elevation-sm">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-charcoal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-charcoal-400" />
            </div>
            <p className="text-sm font-medium text-charcoal-600">
              No resume uploaded
            </p>
            <p className="text-xs text-charcoal-400 mt-1">
              Upload a resume to view it here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "border-charcoal-100 shadow-elevation-sm",
      isFullscreen && "fixed inset-4 z-50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rust-500 to-rust-600 rounded-lg flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
                {resumeData.fileName || 'Resume'}
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-charcoal-500 mt-0.5">
                {resumeData.fileType && (
                  <span className="uppercase">{resumeData.fileType}</span>
                )}
                {resumeData.fileSize && (
                  <>
                    <span>•</span>
                    <span>{formatFileSize(resumeData.fileSize)}</span>
                  </>
                )}
                {resumeData.uploadedAt && (
                  <>
                    <span>•</span>
                    <span>Uploaded {new Date(resumeData.uploadedAt).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {showDownload && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="h-8 w-8 p-0"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrint}
                  className="h-8 w-8 p-0"
                  title="Print"
                >
                  <Printer className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(resumeData.url, '_blank')}
              className="h-8 w-8 p-0"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-y border-charcoal-100 bg-charcoal-50">
        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="h-7 w-7 p-0"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs font-medium text-charcoal-600 min-w-[3rem] text-center">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="h-7 w-7 p-0"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs font-medium text-charcoal-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage >= totalPages}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Fullscreen toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="h-7 w-7 p-0"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Document viewer */}
      <CardContent className={cn(
        "p-0 overflow-auto bg-charcoal-100",
        isFullscreen ? "h-[calc(100vh-180px)]" : "h-[500px]"
      )}>
        <div
          className="flex items-center justify-center min-h-full p-4"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
        >
          {/* Iframe for PDF viewing - works with most browsers */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-[816px]">
            {resumeData.url ? (
              <iframe
                src={`${resumeData.url}#toolbar=0`}
                className="w-full h-[1056px]"
                title="Resume Preview"
              />
            ) : (
              <div className="h-[1056px] flex items-center justify-center">
                <div className="text-center">
                  <File className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
                  <p className="text-charcoal-500">Unable to preview document</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Error state fallback */}
      {!resumeData.url && (
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-warning-50 border border-warning-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-warning-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-warning-800">
                Document preview unavailable
              </p>
              <p className="text-xs text-warning-600 mt-0.5">
                Download the document to view it locally
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default ResumeViewer;
