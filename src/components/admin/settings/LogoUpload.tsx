'use client'

import * as React from 'react'
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LogoUploadProps {
  assetType: 'logo_light' | 'logo_dark' | 'favicon' | 'login_background'
  currentUrl?: string | null
  onUploadComplete?: (url: string) => void
  onDelete?: () => void
  label?: string
  description?: string
  recommendedSize?: string
  accept?: string
  maxSizeMB?: number
  className?: string
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error'

/**
 * LogoUpload - File upload component for organization branding assets
 *
 * Features:
 * - Drag and drop support
 * - File type validation
 * - Size validation
 * - Preview before upload
 * - Progress indication
 * - Delete existing asset
 */
export function LogoUpload({
  assetType,
  currentUrl,
  onUploadComplete,
  onDelete,
  label = 'Logo',
  description = 'Upload your company logo',
  recommendedSize = 'Recommended: 200x50px',
  accept = 'image/png,image/jpeg,image/svg+xml,image/webp',
  maxSizeMB = 5,
  className,
}: LogoUploadProps) {
  const [uploadState, setUploadState] = React.useState<UploadState>('idle')
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [dragActive, setDragActive] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const utils = trpc.useUtils()

  // Upload mutation
  const uploadMutation = trpc.settings.uploadBrandingAsset.useMutation({
    onSuccess: (data) => {
      setUploadState('success')
      setPreviewUrl(null)
      toast.success(`${label} uploaded successfully`)
      onUploadComplete?.(data.signed_url || '')
      utils.settings.getBranding.invalidate()
      utils.settings.getOrganization.invalidate()

      // Reset state after animation
      setTimeout(() => setUploadState('idle'), 2000)
    },
    onError: (error) => {
      setUploadState('error')
      toast.error(error.message || 'Failed to upload')
    },
  })

  // Delete mutation
  const deleteMutation = trpc.settings.deleteBrandingAsset.useMutation({
    onSuccess: () => {
      toast.success(`${label} removed`)
      onDelete?.()
      utils.settings.getBranding.invalidate()
      utils.settings.getOrganization.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete')
    },
  })

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Validate and process file
  const processFile = async (file: File) => {
    // Validate type
    const allowedTypes = accept.split(',').map((t) => t.trim())
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`)
      return
    }

    // Validate size
    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      toast.error(`File too large. Maximum size: ${maxSizeMB}MB`)
      return
    }

    // Create preview
    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)

    // Upload
    setUploadState('uploading')
    try {
      const base64 = await fileToBase64(file)
      await uploadMutation.mutateAsync({
        assetType,
        fileBase64: base64,
        fileName: file.name,
        mimeType: file.type,
      })
    } catch {
      // Error handled by mutation
    }
  }

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  // Handle delete
  const handleDelete = () => {
    if (confirm(`Are you sure you want to remove the ${label.toLowerCase()}?`)) {
      deleteMutation.mutate({ assetType })
    }
  }

  // Cleanup preview URL
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const displayUrl = previewUrl || currentUrl
  const isLoading = uploadState === 'uploading' || deleteMutation.isPending

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-charcoal-900">{label}</h4>
          <p className="text-xs text-charcoal-500">{description}</p>
        </div>
        {displayUrl && !isLoading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-charcoal-500 hover:text-error-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Upload area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={cn(
          'relative rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer',
          'flex flex-col items-center justify-center',
          displayUrl ? 'p-4' : 'p-8',
          dragActive
            ? 'border-gold-400 bg-gold-50'
            : displayUrl
              ? 'border-charcoal-200 hover:border-gold-300 bg-charcoal-50'
              : 'border-charcoal-200 hover:border-gold-300 bg-white',
          isLoading && 'pointer-events-none opacity-70'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />

        {/* Preview or placeholder */}
        {displayUrl ? (
          <div className="relative">
            <img
              src={displayUrl}
              alt={label}
              className={cn(
                'max-h-20 max-w-full object-contain',
                assetType === 'favicon' && 'max-h-12'
              )}
            />
            {uploadState === 'uploading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded">
                <Loader2 className="h-6 w-6 text-gold-500 animate-spin" />
              </div>
            )}
            {uploadState === 'success' && (
              <div className="absolute -top-2 -right-2">
                <div className="bg-success-500 text-white rounded-full p-1">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors',
                dragActive ? 'bg-gold-100' : 'bg-charcoal-100'
              )}
            >
              {uploadState === 'uploading' ? (
                <Loader2 className="h-6 w-6 text-gold-500 animate-spin" />
              ) : uploadState === 'error' ? (
                <AlertCircle className="h-6 w-6 text-error-500" />
              ) : (
                <Upload
                  className={cn(
                    'h-6 w-6 transition-colors',
                    dragActive ? 'text-gold-600' : 'text-charcoal-400'
                  )}
                />
              )}
            </div>

            <p className="text-sm text-charcoal-600 text-center">
              {dragActive ? (
                'Drop to upload'
              ) : (
                <>
                  <span className="font-medium text-gold-600">Click to upload</span> or drag and
                  drop
                </>
              )}
            </p>
            <p className="text-xs text-charcoal-400 mt-1">{recommendedSize}</p>
          </>
        )}
      </div>

      {/* Click to change hint when has image */}
      {displayUrl && !isLoading && (
        <p className="text-xs text-charcoal-400 text-center">Click to replace</p>
      )}
    </div>
  )
}

/**
 * LogoUploadGroup - Group of logo uploads for light/dark mode
 */
export function LogoUploadGroup({
  lightUrl,
  darkUrl,
  faviconUrl,
  onUploadComplete,
}: {
  lightUrl?: string | null
  darkUrl?: string | null
  faviconUrl?: string | null
  onUploadComplete?: () => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <LogoUpload
        assetType="logo_light"
        currentUrl={lightUrl}
        label="Logo (Light Mode)"
        description="For light backgrounds"
        recommendedSize="PNG or SVG, 200x50px"
        onUploadComplete={onUploadComplete}
      />
      <LogoUpload
        assetType="logo_dark"
        currentUrl={darkUrl}
        label="Logo (Dark Mode)"
        description="For dark backgrounds"
        recommendedSize="PNG or SVG, 200x50px"
        onUploadComplete={onUploadComplete}
      />
      <LogoUpload
        assetType="favicon"
        currentUrl={faviconUrl}
        label="Favicon"
        description="Browser tab icon"
        recommendedSize="ICO or PNG, 32x32px"
        accept="image/x-icon,image/png,image/ico"
        onUploadComplete={onUploadComplete}
      />
    </div>
  )
}

export default LogoUpload
