'use client'

import * as React from 'react'
import { useState, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { trpc } from '@/lib/trpc/client'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Upload, FileText, Loader2, X, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadResumeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidateId: string
  candidateName: string
  onSuccess?: () => void
}

type UploadState = 'idle' | 'uploading' | 'creating' | 'success' | 'error'

export function UploadResumeDialog({
  open,
  onOpenChange,
  candidateId,
  candidateName,
  onSuccess,
}: UploadResumeDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<UploadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isPrimary, setIsPrimary] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  const createResumeMutation = trpc.resumes.create.useMutation({
    onSuccess: () => {
      setState('success')
      toast.success('Resume uploaded successfully')
      setTimeout(() => {
        handleClose()
        onSuccess?.()
      }, 1000)
    },
    onError: (err) => {
      setState('error')
      setError(err.message || 'Failed to create resume record')
    },
  })

  const handleClose = useCallback(() => {
    setFile(null)
    setState('idle')
    setError(null)
    setIsPrimary(true)
    onOpenChange(false)
  }, [onOpenChange])

  const handleFileSelect = useCallback((selectedFile: File) => {
    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(pdf|doc|docx)$/i)) {
      setError('Please upload a PDF or Word document')
      return
    }

    // Validate file size (10MB max)
    const maxSizeBytes = 10 * 1024 * 1024
    if (selectedFile.size > maxSizeBytes) {
      setError(`File too large (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`)
      return
    }

    setFile(selectedFile)
    setError(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        handleFileSelect(droppedFile)
      }
    },
    [handleFileSelect]
  )

  const handleUpload = async () => {
    if (!file) return

    setState('uploading')
    setError(null)

    try {
      const supabase = createClient()

      // Generate unique file path
      const timestamp = Date.now()
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const storagePath = `${candidateId}/${timestamp}-${sanitizedFileName}`

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      // Create resume record
      setState('creating')
      await createResumeMutation.mutateAsync({
        candidateId,
        bucket: 'resumes',
        filePath: storagePath,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/pdf',
        resumeType: 'master',
        source: 'uploaded',
        isPrimary,
      })
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Failed to upload resume')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Resume</DialogTitle>
          <DialogDescription>
            Upload a resume for {candidateName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone */}
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
              isDragging ? 'border-gold-500 bg-gold-50' : 'border-charcoal-200 hover:border-charcoal-300',
              file && 'border-green-500 bg-green-50',
              state === 'error' && 'border-red-500 bg-red-50'
            )}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0]
                if (selected) handleFileSelect(selected)
              }}
            />

            {state === 'success' ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="h-10 w-10 text-green-500" />
                <p className="font-medium text-green-700">Upload complete!</p>
              </div>
            ) : file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-charcoal-500" />
                <div className="text-left">
                  <p className="font-medium text-charcoal-900">{file.name}</p>
                  <p className="text-sm text-charcoal-500">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                    setError(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-charcoal-400 mx-auto mb-3" />
                <p className="text-charcoal-600 font-medium">
                  Drop your resume here or click to browse
                </p>
                <p className="text-sm text-charcoal-400 mt-1">
                  PDF or Word document up to 10MB
                </p>
              </>
            )}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
          )}

          {/* Options */}
          {file && state === 'idle' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPrimary"
                checked={isPrimary}
                onCheckedChange={(checked) => setIsPrimary(checked === true)}
              />
              <Label htmlFor="isPrimary" className="text-sm text-charcoal-600">
                Set as primary resume
              </Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={state === 'uploading' || state === 'creating'}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || state === 'uploading' || state === 'creating' || state === 'success'}
          >
            {state === 'uploading' && (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            )}
            {state === 'creating' && (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            )}
            {(state === 'idle' || state === 'error') && (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Resume
              </>
            )}
            {state === 'success' && (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Done
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
