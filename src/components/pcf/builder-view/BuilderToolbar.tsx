'use client'

import Link from 'next/link'
import {
  Save,
  Play,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid,
  Eye,
  CheckCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface BuilderToolbarProps {
  title: string
  breadcrumbs?: Array<{ label: string; href: string }>
  
  // Zoom controls
  zoom?: number
  onZoomIn?: () => void
  onZoomOut?: () => void
  onZoomReset?: () => void
  
  // Grid
  showGrid?: boolean
  onToggleGrid?: () => void
  
  // Undo/Redo
  canUndo?: boolean
  canRedo?: boolean
  onUndo?: () => void
  onRedo?: () => void
  
  // Actions
  onSave?: () => void
  onPreview?: () => void
  onValidate?: () => void
  
  // State
  isSaving?: boolean
  isDirty?: boolean
  isValid?: boolean
  readOnly?: boolean
  
  className?: string
}

export function BuilderToolbar({
  title,
  breadcrumbs,
  zoom = 100,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  showGrid = true,
  onToggleGrid,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onPreview,
  onValidate,
  isSaving,
  isDirty,
  isValid,
  readOnly,
  className,
}: BuilderToolbarProps) {
  return (
    <TooltipProvider>
      <div
        className={cn(
          'flex items-center justify-between px-4 py-2 bg-white border-b border-charcoal-200',
          className
        )}
      >
        {/* Left: Title and breadcrumbs */}
        <div className="flex items-center gap-3">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Link href={breadcrumbs[breadcrumbs.length - 1]?.href || '#'}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          )}
          <div>
            <h1 className="text-sm font-medium text-charcoal-900">{title}</h1>
            {breadcrumbs && (
              <div className="flex items-center gap-1 text-xs text-charcoal-500">
                {breadcrumbs.map((crumb, i) => (
                  <span key={crumb.href}>
                    {i > 0 && <span className="mx-1">/</span>}
                    <Link href={crumb.href} className="hover:text-charcoal-700">
                      {crumb.label}
                    </Link>
                  </span>
                ))}
              </div>
            )}
          </div>
          {isDirty && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              Unsaved changes
            </span>
          )}
        </div>

        {/* Center: Canvas controls */}
        <div className="flex items-center gap-1">
          {/* Undo/Redo */}
          {!readOnly && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onUndo}
                    disabled={!canUndo}
                  >
                    <Undo className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (⌘Z)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onRedo}
                    disabled={!canRedo}
                  >
                    <Redo className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (⌘⇧Z)</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6 mx-2" />
            </>
          )}

          {/* Zoom controls */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onZoomOut}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom out</TooltipContent>
          </Tooltip>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 min-w-[60px] font-mono text-xs"
            onClick={onZoomReset}
          >
            {zoom}%
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onZoomIn}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom in</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 mx-2" />

          {/* Grid toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showGrid ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={onToggleGrid}
              >
                <Grid className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle grid</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onZoomReset}
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fit to screen</TooltipContent>
          </Tooltip>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {onValidate && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onValidate}
                  className={cn(
                    'gap-1.5',
                    isValid === true && 'text-green-600',
                    isValid === false && 'text-red-600'
                  )}
                >
                  <CheckCircle className="w-4 h-4" />
                  Validate
                </Button>
              </TooltipTrigger>
              <TooltipContent>Check for errors</TooltipContent>
            </Tooltip>
          )}

          {onPreview && (
            <Button variant="outline" size="sm" onClick={onPreview} className="gap-1.5">
              <Eye className="w-4 h-4" />
              Preview
            </Button>
          )}

          {onSave && !readOnly && (
            <Button
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

