"use client";

import * as React from "react";
import {
  X,
  Download,
  Share2,
  Printer,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  File,
  Loader2,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

type PreviewType = "image" | "pdf" | "document" | "html" | "iframe";

interface PreviewItem {
  id: string;
  title: string;
  type: PreviewType;
  url?: string;
  content?: string;
  metadata?: Record<string, string>;
}

export interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: PreviewItem[];
  initialIndex?: number;
  onDownload?: (item: PreviewItem) => void;
  onShare?: (item: PreviewItem) => void;
  onPrint?: (item: PreviewItem) => void;
}

export function PreviewModal({
  isOpen,
  onClose,
  items,
  initialIndex = 0,
  onDownload,
  onShare,
  onPrint,
}: PreviewModalProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [zoom, setZoom] = React.useState(100);
  const [rotation, setRotation] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  const currentItem = items[currentIndex];

  // Reset state on open
  React.useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoom(100);
      setRotation(0);
      setIsLoading(true);
    }
  }, [isOpen, initialIndex]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowLeft":
          if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
            setIsLoading(true);
          }
          break;
        case "ArrowRight":
          if (currentIndex < items.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setIsLoading(true);
          }
          break;
        case "Escape":
          if (isFullscreen) {
            setIsFullscreen(false);
          } else {
            onClose();
          }
          break;
        case "+":
        case "=":
          setZoom((prev) => Math.min(prev + 25, 200));
          break;
        case "-":
          setZoom((prev) => Math.max(prev - 25, 50));
          break;
        case "r":
          setRotation((prev) => (prev + 90) % 360);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, items.length, isFullscreen, onClose]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsLoading(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsLoading(true);
    }
  };

  const getFileIcon = (type: PreviewType) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-8 w-8" />;
      case "pdf":
      case "document":
        return <FileText className="h-8 w-8" />;
      default:
        return <File className="h-8 w-8" />;
    }
  };

  const renderContent = () => {
    if (!currentItem) return null;

    switch (currentItem.type) {
      case "image":
        return (
          <div
            className="flex h-full items-center justify-center overflow-auto p-4"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: "transform 0.2s ease",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentItem.url}
              alt={currentItem.title}
              className="max-h-full max-w-full object-contain"
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </div>
        );

      case "pdf":
        return (
          <iframe
            src={currentItem.url}
            title={currentItem.title}
            className="h-full w-full border-0"
            onLoad={() => setIsLoading(false)}
          />
        );

      case "html":
        return (
          <div
            className="h-full w-full overflow-auto p-4"
            dangerouslySetInnerHTML={{ __html: currentItem.content || "" }}
          />
        );

      case "iframe":
        return (
          <iframe
            src={currentItem.url}
            title={currentItem.title}
            className="h-full w-full border-0"
            onLoad={() => setIsLoading(false)}
          />
        );

      case "document":
      default:
        return (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
            {getFileIcon(currentItem.type)}
            <div className="text-center">
              <div className="font-medium">{currentItem.title}</div>
              <div className="text-sm text-muted-foreground">
                Preview not available for this file type
              </div>
            </div>
            {onDownload && (
              <button
                type="button"
                onClick={() => onDownload(currentItem)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md",
                  "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
                  "hover:bg-primary/90"
                )}
              >
                <Download className="h-4 w-4" />
                Download File
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed z-50 flex flex-col bg-background",
            isFullscreen
              ? "inset-0"
              : "left-[50%] top-[50%] h-[90vh] w-[90vw] max-w-5xl translate-x-[-50%] translate-y-[-50%] rounded-lg border shadow-xl"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-3">
              {getFileIcon(currentItem?.type || "document")}
              <div>
                <Dialog.Title className="font-medium">
                  {currentItem?.title || "Preview"}
                </Dialog.Title>
                {items.length > 1 && (
                  <div className="text-xs text-muted-foreground">
                    {currentIndex + 1} of {items.length}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Zoom controls (for images) */}
              {currentItem?.type === "image" && (
                <>
                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.max(prev - 25, 50))}
                    disabled={zoom <= 50}
                    className="rounded-md p-2 hover:bg-muted disabled:opacity-50"
                    title="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="w-14 text-center text-sm">{zoom}%</span>
                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.min(prev + 25, 200))}
                    disabled={zoom >= 200}
                    className="rounded-md p-2 hover:bg-muted disabled:opacity-50"
                    title="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="rounded-md p-2 hover:bg-muted"
                    title="Rotate"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                  <div className="mx-2 h-6 w-px bg-border" />
                </>
              )}

              {/* Actions */}
              {onPrint && (
                <button
                  type="button"
                  onClick={() => currentItem && onPrint(currentItem)}
                  className="rounded-md p-2 hover:bg-muted"
                  title="Print"
                >
                  <Printer className="h-4 w-4" />
                </button>
              )}
              {onShare && (
                <button
                  type="button"
                  onClick={() => currentItem && onShare(currentItem)}
                  className="rounded-md p-2 hover:bg-muted"
                  title="Share"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              )}
              {onDownload && (
                <button
                  type="button"
                  onClick={() => currentItem && onDownload(currentItem)}
                  className="rounded-md p-2 hover:bg-muted"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
              )}

              <div className="mx-2 h-6 w-px bg-border" />

              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="rounded-md p-2 hover:bg-muted"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>

              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-md p-2 hover:bg-muted"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Content */}
          <div className="relative flex-1 overflow-hidden bg-muted/30">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {renderContent()}
          </div>

          {/* Navigation (for multiple items) */}
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className={cn(
                  "absolute left-4 top-1/2 z-10 -translate-y-1/2",
                  "rounded-full bg-background/80 p-2 shadow-lg backdrop-blur-sm",
                  "hover:bg-background disabled:opacity-50"
                )}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex === items.length - 1}
                className={cn(
                  "absolute right-4 top-1/2 z-10 -translate-y-1/2",
                  "rounded-full bg-background/80 p-2 shadow-lg backdrop-blur-sm",
                  "hover:bg-background disabled:opacity-50"
                )}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Metadata Footer */}
          {currentItem?.metadata && Object.keys(currentItem.metadata).length > 0 && (
            <div className="flex flex-wrap gap-4 border-t px-4 py-2 text-xs text-muted-foreground">
              {Object.entries(currentItem.metadata).map(([key, value]) => (
                <div key={key}>
                  <span className="capitalize">{key}:</span> <span>{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Thumbnail strip (for multiple items) */}
          {items.length > 1 && (
            <div className="flex gap-2 overflow-x-auto border-t p-2">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsLoading(true);
                  }}
                  className={cn(
                    "flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md border",
                    "overflow-hidden transition-all",
                    index === currentIndex
                      ? "border-primary ring-2 ring-primary"
                      : "border-muted hover:border-primary/50"
                  )}
                >
                  {item.type === "image" && item.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground">{getFileIcon(item.type)}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default PreviewModal;
