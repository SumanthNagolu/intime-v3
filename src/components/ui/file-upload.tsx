'use client'

import * as React from 'react'
import { Upload, X, Image as ImageIcon, FileIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

export interface FileUploadProps {
  value?: string | null
  onChange?: (value: string | null, file?: File) => void
  accept?: string
  maxSize?: number // in bytes
  className?: string
  disabled?: boolean
  preview?: boolean
  placeholder?: string
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto'
  error?: string
}

export function FileUpload({
  value,
  onChange,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  className,
  disabled = false,
  preview = true,
  placeholder = 'Drag and drop a file here, or click to select',
  aspectRatio = 'auto',
  error,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [localError, setLocalError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const displayError = error || localError

  const aspectRatioClasses = {
    square: 'aspect-square',
    landscape: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: '',
  }

  const handleFile = React.useCallback((file: File) => {
    setLocalError(null)

    // Validate file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
      setLocalError(`File size exceeds ${maxSizeMB}MB limit`)
      return
    }

    // Validate file type
    if (accept !== '*' && accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(t => t.trim())
      const fileType = file.type
      const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`

      const isValid = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExt === type.toLowerCase()
        }
        if (type.endsWith('/*')) {
          return fileType.startsWith(type.replace('/*', '/'))
        }
        return fileType === type
      })

      if (!isValid) {
        setLocalError(`Invalid file type. Accepted: ${accept}`)
        return
      }
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      onChange?.(base64, file)
    }
    reader.onerror = () => {
      setLocalError('Failed to read file')
    }
    reader.readAsDataURL(file)
  }, [accept, maxSize, onChange])

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [disabled, handleFile])

  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
    // Reset input value so same file can be selected again
    e.target.value = ''
  }, [handleFile])

  const handleClick = React.useCallback(() => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }, [disabled])

  const handleClear = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(null)
    setLocalError(null)
  }, [onChange])

  const isImage = value?.startsWith('data:image/') || value?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-300 cursor-pointer',
          aspectRatioClasses[aspectRatio],
          isDragging
            ? 'border-gold-500 bg-gold-50'
            : displayError
            ? 'border-error-300 bg-error-50'
            : 'border-charcoal-200 bg-charcoal-50 hover:border-charcoal-300 hover:bg-charcoal-100',
          disabled && 'cursor-not-allowed opacity-50',
          !value && 'min-h-[150px]'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {value && preview ? (
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-charcoal-600">
                <FileIcon className="h-12 w-12" />
                <span className="text-sm">File uploaded</span>
              </div>
            )}
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            {isDragging ? (
              <Upload className="h-10 w-10 text-gold-500" />
            ) : isImage || accept.includes('image') ? (
              <ImageIcon className="h-10 w-10 text-charcoal-400" />
            ) : (
              <Upload className="h-10 w-10 text-charcoal-400" />
            )}
            <div className="text-sm text-charcoal-600">
              <span className="font-medium text-hublot-900">Click to upload</span> or drag and drop
            </div>
            <p className="text-xs text-charcoal-500">{placeholder}</p>
          </div>
        )}
      </div>

      {displayError && (
        <p className="mt-2 text-sm text-error-600">{displayError}</p>
      )}
    </div>
  )
}
