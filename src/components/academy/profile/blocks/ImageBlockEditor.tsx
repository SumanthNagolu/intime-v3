'use client'

import { useRef, useState } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import type { ImageBlock } from '@/lib/academy/implementation-blocks'
import { compressImage } from '@/lib/academy/image-utils'

interface ImageBlockEditorProps {
  block: ImageBlock
  onChange: (updates: Partial<ImageBlock>) => void
}

export function ImageBlockEditor({ block, onChange }: ImageBlockEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return

    setIsCompressing(true)
    try {
      const reader = new FileReader()
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const compressed = await compressImage(dataUrl)
      onChange({ dataUrl: compressed })
    } finally {
      setIsCompressing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) await handleFile(file)
        return
      }
    }
  }

  if (block.dataUrl) {
    return (
      <div className="space-y-2">
        <div className="relative group/img rounded-lg overflow-hidden border border-charcoal-200">
          <img
            src={block.dataUrl}
            alt={block.caption || 'Screenshot'}
            className="w-full max-h-[400px] object-contain bg-charcoal-50"
          />
          <button
            onClick={() => onChange({ dataUrl: '' })}
            className="absolute top-2 right-2 p-1 rounded-lg bg-charcoal-900/70 text-white opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-red-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <input
          type="text"
          value={block.caption}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder="Add a caption for this screenshot..."
          className="w-full px-2.5 py-1.5 rounded-lg border border-charcoal-200 bg-white text-xs text-charcoal-600 focus:outline-none focus:ring-2 focus:ring-gold-500/20 placeholder:text-charcoal-400"
        />
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onPaste={handlePaste}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-2 py-8 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
        isDragging
          ? 'border-gold-400 bg-gold-50/50'
          : 'border-charcoal-200 bg-charcoal-50/30 hover:border-charcoal-300 hover:bg-charcoal-50'
      }`}
    >
      {isCompressing ? (
        <div className="flex items-center gap-2 text-xs text-charcoal-500">
          <div className="w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          Compressing...
        </div>
      ) : (
        <>
          <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
            {isDragging ? (
              <Upload className="w-5 h-5 text-gold-500" />
            ) : (
              <ImageIcon className="w-5 h-5 text-charcoal-400" />
            )}
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-charcoal-600">
              Drop image, paste from clipboard, or click to upload
            </p>
            <p className="text-[10px] text-charcoal-400 mt-0.5">
              Images are compressed to save space
            </p>
          </div>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </div>
  )
}
