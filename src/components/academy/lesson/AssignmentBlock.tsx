'use client'

import React, { useState, useCallback, useRef } from 'react'
import {
  FileText,
  CheckCircle,
  Eye,
  EyeOff,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Maximize2,
  Minimize2,
  AlertCircle,
  Plus,
  Type,
  Code2,
  Image as ImageIcon,
  X,
  GripVertical,
} from 'lucide-react'
import type { SubmissionBlock } from '@/lib/academy/types'

// ============================================================
// Helpers
// ============================================================

let _blockCounter = 0
function newBlockId() {
  return `sb-${Date.now()}-${++_blockCounter}`
}

/** Resize an image file to max width, return data URL */
function resizeImage(file: File, maxWidth = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new window.Image()
      img.onload = () => {
        if (img.width <= maxWidth) {
          resolve(reader.result as string)
          return
        }
        const scale = maxWidth / img.width
        const canvas = document.createElement('canvas')
        canvas.width = maxWidth
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ============================================================
// Props
// ============================================================

interface AssignmentBlockProps {
  lessonId: string
  assignmentPdf?: string
  solutionPdf?: string
  onSubmit: (lessonId: string, response: string, blocks?: SubmissionBlock[]) => void
  isSubmitted: boolean
  previousResponse?: string
  previousBlocks?: SubmissionBlock[]
  fullPage?: boolean
}

// ============================================================
// Language options for code blocks
// ============================================================

const CODE_LANGUAGES = [
  { value: 'gosu', label: 'Gosu' },
  { value: 'xml', label: 'XML' },
  { value: 'java', label: 'Java' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'text', label: 'Plain Text' },
]

// ============================================================
// Main Component
// ============================================================

export function AssignmentBlock({
  lessonId,
  assignmentPdf,
  solutionPdf,
  onSubmit,
  isSubmitted,
  previousResponse,
  previousBlocks,
  fullPage,
}: AssignmentBlockProps) {
  const [blocks, setBlocks] = useState<SubmissionBlock[]>(
    previousBlocks ?? (previousResponse ? [{ type: 'text', id: newBlockId(), content: previousResponse }] : [])
  )
  const [showSolution, setShowSolution] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pdfExpanded, setPdfExpanded] = useState(true)
  const [pdfFullHeight, setPdfFullHeight] = useState(false)
  const [activeTab, setActiveTab] = useState<'assignment' | 'solution'>('assignment')
  const [showResponsePanel, setShowResponsePanel] = useState(!fullPage)

  const hasContent = blocks.some(b => {
    if (b.type === 'text' || b.type === 'code') return b.content.trim().length > 0
    if (b.type === 'screenshot') return b.dataUrl.length > 0
    return false
  })

  const handleSubmit = useCallback(async () => {
    if (!hasContent) return
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 600))
    // Build a plain-text summary for backward compat
    const textSummary = blocks
      .map(b => {
        if (b.type === 'text') return b.content
        if (b.type === 'code') return `[Code: ${b.language}]\n${b.content}`
        if (b.type === 'screenshot') return `[Screenshot${b.caption ? `: ${b.caption}` : ''}]`
        return ''
      })
      .filter(Boolean)
      .join('\n\n')
    onSubmit(lessonId, textSummary, blocks)
    setIsSubmitting(false)
  }, [hasContent, blocks, lessonId, onSubmit])

  const addBlock = (type: 'text' | 'code' | 'screenshot') => {
    if (isSubmitted) return
    const id = newBlockId()
    if (type === 'text') setBlocks(prev => [...prev, { type: 'text', id, content: '' }])
    else if (type === 'code') setBlocks(prev => [...prev, { type: 'code', id, language: 'gosu', content: '' }])
    else setBlocks(prev => [...prev, { type: 'screenshot', id, dataUrl: '', caption: '' }])
  }

  const removeBlock = (id: string) => {
    if (isSubmitted) return
    setBlocks(prev => prev.filter(b => b.id !== id))
  }

  const updateBlock = (id: string, updates: Partial<SubmissionBlock>) => {
    if (isSubmitted) return
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } as SubmissionBlock : b))
  }

  const pdfFilename = assignmentPdf?.split('/').pop() || 'Assignment'
  const currentPdfUrl = activeTab === 'solution' && solutionPdf ? solutionPdf : assignmentPdf

  // ---- Shared submission builder ----
  const submissionBuilder = (
    <SubmissionBuilder
      blocks={blocks}
      isSubmitted={isSubmitted}
      isSubmitting={isSubmitting}
      hasContent={hasContent}
      onAddBlock={addBlock}
      onRemoveBlock={removeBlock}
      onUpdateBlock={updateBlock}
      onSubmit={handleSubmit}
      compact={!!fullPage}
    />
  )

  // ======== FULL PAGE MODE ========
  if (fullPage) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden" id="assignment">
        {/* Top toolbar */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-warm-deep border-b border-warm-primary/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-warm-primary/40">
              <button
                onClick={() => setActiveTab('assignment')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-serif text-xs font-medium transition-all duration-200 ${
                  activeTab === 'assignment'
                    ? 'bg-warm-primary/60 text-white shadow-sm'
                    : 'text-warm-light hover:text-warm-cream'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                Assignment
              </button>
              {solutionPdf ? (
                <button
                  onClick={() => { setActiveTab('solution'); setShowSolution(true) }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-serif text-xs font-medium transition-all duration-200 ${
                    activeTab === 'solution'
                      ? 'bg-warm-primary/60 text-white shadow-sm'
                      : 'text-warm-light hover:text-warm-cream'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  Solution
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSubmitted ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sage-500/20 border border-sage-500/30">
                <CheckCircle className="w-3 h-3 text-sage-400" />
                <span className="font-mono-warm text-[9px] font-medium text-sage-300" style={{ letterSpacing: '1px' }}>Submitted</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-copper-500/20 border border-copper-500/30">
                <AlertCircle className="w-3 h-3 text-copper-400" />
                <span className="font-mono-warm text-[9px] font-medium text-copper-300" style={{ letterSpacing: '1px' }}>Required</span>
              </div>
            )}
            <button
              onClick={() => setShowResponsePanel(!showResponsePanel)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-serif text-xs font-medium text-warm-light hover:text-white hover:bg-warm-primary/40 transition-all"
            >
              <Send className="w-3 h-3" />
              {showResponsePanel ? 'Hide Submission' : 'Submit Work'}
            </button>
          </div>
        </div>

        <div className="flex-1 flex min-h-0 overflow-hidden">
          <div className="flex-1 min-w-0">
            {assignmentPdf ? (
              <iframe
                key={currentPdfUrl}
                src={`${currentPdfUrl}#toolbar=0&navpanes=0&view=FitH`}
                className="w-full h-full border-0"
                title={activeTab === 'solution' ? 'Solution Guide' : 'Assignment Document'}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="font-serif text-sm text-warm-muted">No assignment PDF available</p>
              </div>
            )}
          </div>

          {showResponsePanel && (
            <div className="w-[420px] lg:w-[480px] flex-shrink-0 border-l border-warm-light/15 bg-white flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-warm-light/15" style={{ backgroundColor: 'var(--al-cream, #f5efe5)' }}>
                <h4 className="font-mono-warm text-[9px] font-medium text-warm-secondary uppercase" style={{ letterSpacing: '2.5px' }}>
                  Your Submission
                </h4>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {submissionBuilder}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ======== INLINE MODE ========
  return (
    <div
      className="rounded-xl border-2 border-warm-light/20 bg-white shadow-elevation-sm overflow-hidden"
      id="assignment"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-warm-primary/20 bg-warm-deep">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-copper-500/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-copper-400" />
          </div>
          <div>
            <h4 className="font-display font-semibold text-white text-sm">
              Lesson Assignment
            </h4>
            <p className="font-serif text-xs text-warm-light">
              Complete the exercises and submit your work
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSubmitted ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-500/20 border border-sage-500/30">
              <CheckCircle className="w-3.5 h-3.5 text-sage-400" />
              <span className="font-mono-warm text-[9px] font-medium text-sage-300" style={{ letterSpacing: '1px' }}>Submitted</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-copper-500/20 border border-copper-500/30">
              <AlertCircle className="w-3.5 h-3.5 text-copper-400" />
              <span className="font-mono-warm text-[9px] font-medium text-copper-300" style={{ letterSpacing: '1px' }}>Required</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* PDF Viewer */}
        {assignmentPdf && (
          <div className="rounded-lg border border-warm-light/20 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-warm-light/15" style={{ backgroundColor: 'var(--al-cream, #f5efe5)' }}>
              <div className="flex items-center gap-3">
                {solutionPdf ? (
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-warm-cream">
                    <button
                      onClick={() => setActiveTab('assignment')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-serif text-xs font-medium transition-all duration-200 ${
                        activeTab === 'assignment'
                          ? 'bg-white text-warm-primary shadow-sm'
                          : 'text-warm-muted hover:text-warm-secondary'
                      }`}
                    >
                      <BookOpen className="w-3 h-3" />
                      Assignment
                    </button>
                    <button
                      onClick={() => { setActiveTab('solution'); setShowSolution(true) }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-serif text-xs font-medium transition-all duration-200 ${
                        activeTab === 'solution'
                          ? 'bg-white text-warm-primary shadow-sm'
                          : 'text-warm-muted hover:text-warm-secondary'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      Solution
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-copper-50 border border-copper-200/60 flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5 text-copper-500" />
                    </div>
                    <p className="font-serif text-xs font-medium text-warm-primary">{pdfFilename}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPdfFullHeight(!pdfFullHeight)}
                  className="p-1.5 rounded-md text-warm-muted hover:text-warm-secondary hover:bg-warm-cream transition-colors"
                  title={pdfFullHeight ? 'Compact view' : 'Full view'}
                >
                  {pdfFullHeight ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setPdfExpanded(!pdfExpanded)}
                  className="p-1.5 rounded-md text-warm-muted hover:text-warm-secondary hover:bg-warm-cream transition-colors"
                  title={pdfExpanded ? 'Collapse' : 'Expand'}
                >
                  {pdfExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {pdfExpanded && (
              <div className="transition-all duration-300" style={{ height: pdfFullHeight ? '85vh' : '70vh' }}>
                <iframe
                  key={currentPdfUrl}
                  src={`${currentPdfUrl}#toolbar=0&navpanes=0&view=FitH`}
                  className="w-full h-full border-0"
                  title={activeTab === 'solution' ? 'Solution Guide' : 'Assignment Document'}
                />
              </div>
            )}

            {!pdfExpanded && (
              <button
                onClick={() => setPdfExpanded(true)}
                className="w-full px-4 py-3 text-center font-serif text-xs text-warm-muted hover:text-warm-secondary hover:bg-warm-cream transition-colors"
              >
                Click to expand document viewer
              </button>
            )}
          </div>
        )}

        {/* Submission Builder */}
        {submissionBuilder}

        {/* Solution reveal (for when no separate solution PDF exists) */}
        {showSolution && !solutionPdf && (
          <div className="p-4 rounded-lg bg-copper-50 border border-copper-200">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-copper-600" />
              <span className="font-mono-warm text-[9px] font-medium uppercase text-copper-700" style={{ letterSpacing: '2px' }}>
                Solution Guide
              </span>
            </div>
            <p className="font-serif text-sm text-copper-800 leading-relaxed" style={{ lineHeight: '1.85' }}>
              The solution is included within the assignment document above. Review it after
              attempting the exercises on your own to compare approaches and identify
              areas for improvement.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Submission Builder - Add text, code, screenshots
// ============================================================

function SubmissionBuilder({
  blocks,
  isSubmitted,
  isSubmitting,
  hasContent,
  onAddBlock,
  onRemoveBlock,
  onUpdateBlock,
  onSubmit,
  compact,
}: {
  blocks: SubmissionBlock[]
  isSubmitted: boolean
  isSubmitting: boolean
  hasContent: boolean
  onAddBlock: (type: 'text' | 'code' | 'screenshot') => void
  onRemoveBlock: (id: string) => void
  onUpdateBlock: (id: string, updates: Partial<SubmissionBlock>) => void
  onSubmit: () => void
  compact?: boolean
}) {
  return (
    <div className="space-y-3">
      {/* Header + add buttons */}
      <div className="flex items-center justify-between">
        <label className="font-mono-warm text-[9px] font-medium text-warm-muted uppercase" style={{ letterSpacing: '2.5px' }}>
          Your Submission
        </label>
        {!isSubmitted && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onAddBlock('text')}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-warm-secondary hover:bg-warm-cream border border-warm-light/20 transition-colors"
              title="Add notes / observations"
            >
              <Type className="w-3 h-3" />
              Notes
            </button>
            <button
              onClick={() => onAddBlock('code')}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-warm-secondary hover:bg-warm-cream border border-warm-light/20 transition-colors"
              title="Add code snippet"
            >
              <Code2 className="w-3 h-3" />
              Code
            </button>
            <button
              onClick={() => onAddBlock('screenshot')}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-warm-secondary hover:bg-warm-cream border border-warm-light/20 transition-colors"
              title="Add screenshot"
            >
              <ImageIcon className="w-3 h-3" />
              Screenshot
            </button>
          </div>
        )}
      </div>

      {/* Blocks */}
      {blocks.length === 0 && !isSubmitted && (
        <div className="rounded-lg border-2 border-dashed border-warm-light/30 p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-warm-cream flex items-center justify-center">
              <Type className="w-4 h-4 text-warm-muted" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-warm-cream flex items-center justify-center">
              <Code2 className="w-4 h-4 text-warm-muted" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-warm-cream flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-warm-muted" />
            </div>
          </div>
          <p className="font-serif text-sm text-warm-muted">
            Add your work using the buttons above
          </p>
          <p className="font-serif text-xs text-warm-light mt-1">
            Submit notes, code snippets, and screenshots from the exercises
          </p>
        </div>
      )}

      {blocks.map((block) => (
        <SubmissionBlockCard
          key={block.id}
          block={block}
          isSubmitted={isSubmitted}
          onRemove={() => onRemoveBlock(block.id)}
          onUpdate={(updates) => onUpdateBlock(block.id, updates)}
        />
      ))}

      {/* Submit / Status */}
      {blocks.length > 0 && (
        <div className="pt-2">
          {!isSubmitted ? (
            <button
              onClick={onSubmit}
              disabled={!hasContent || isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-copper-500 text-white font-serif text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Work ({blocks.length} {blocks.length === 1 ? 'item' : 'items'})
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sage-50 border border-sage-200">
              <CheckCircle className="w-4 h-4 text-sage-600" />
              <span className="font-serif text-sm font-medium text-sage-700">
                Work Submitted ({blocks.length} {blocks.length === 1 ? 'item' : 'items'})
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Individual Block Cards
// ============================================================

function SubmissionBlockCard({
  block,
  isSubmitted,
  onRemove,
  onUpdate,
}: {
  block: SubmissionBlock
  isSubmitted: boolean
  onRemove: () => void
  onUpdate: (updates: Partial<SubmissionBlock>) => void
}) {
  switch (block.type) {
    case 'text':
      return <TextBlockCard block={block} isSubmitted={isSubmitted} onRemove={onRemove} onUpdate={onUpdate} />
    case 'code':
      return <CodeBlockCard block={block} isSubmitted={isSubmitted} onRemove={onRemove} onUpdate={onUpdate} />
    case 'screenshot':
      return <ScreenshotBlockCard block={block} isSubmitted={isSubmitted} onRemove={onRemove} onUpdate={onUpdate} />
    default:
      return null
  }
}

function BlockWrapper({
  icon: Icon,
  label,
  isSubmitted,
  onRemove,
  children,
}: {
  icon: React.ElementType
  label: string
  isSubmitted: boolean
  onRemove: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-warm-light/20 overflow-hidden bg-white">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-warm-light/10" style={{ backgroundColor: 'var(--al-cream, #f5efe5)' }}>
        <div className="flex items-center gap-1.5">
          <Icon className="w-3 h-3 text-warm-muted" />
          <span className="font-mono-warm text-[9px] font-medium text-warm-muted uppercase" style={{ letterSpacing: '1.5px' }}>
            {label}
          </span>
        </div>
        {!isSubmitted && (
          <button
            onClick={onRemove}
            className="p-1 rounded text-warm-light hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Remove"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="p-3">
        {children}
      </div>
    </div>
  )
}

function TextBlockCard({
  block,
  isSubmitted,
  onRemove,
  onUpdate,
}: {
  block: SubmissionBlock & { type: 'text' }
  isSubmitted: boolean
  onRemove: () => void
  onUpdate: (updates: Partial<SubmissionBlock>) => void
}) {
  return (
    <BlockWrapper icon={Type} label="Notes" isSubmitted={isSubmitted} onRemove={onRemove}>
      {isSubmitted ? (
        <p className="font-serif text-sm text-warm-primary leading-relaxed whitespace-pre-wrap">
          {block.content}
        </p>
      ) : (
        <textarea
          value={block.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Write your observations, explanations, or answers..."
          rows={4}
          className="w-full rounded-md border border-warm-light/20 bg-white px-3 py-2 font-serif text-sm text-warm-primary placeholder:text-warm-light focus:ring-2 focus:ring-copper-500/15 focus:border-copper-400/40 transition-all duration-200 resize-y"
        />
      )}
    </BlockWrapper>
  )
}

function CodeBlockCard({
  block,
  isSubmitted,
  onRemove,
  onUpdate,
}: {
  block: SubmissionBlock & { type: 'code' }
  isSubmitted: boolean
  onRemove: () => void
  onUpdate: (updates: Partial<SubmissionBlock>) => void
}) {
  return (
    <BlockWrapper icon={Code2} label={`Code — ${block.language}`} isSubmitted={isSubmitted} onRemove={onRemove}>
      {!isSubmitted && (
        <div className="mb-2">
          <select
            value={block.language}
            onChange={(e) => onUpdate({ language: e.target.value })}
            className="px-2 py-1 rounded-md border border-warm-light/20 bg-white font-serif text-xs text-warm-secondary focus:outline-none focus:ring-2 focus:ring-copper-500/15"
          >
            {CODE_LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      )}
      {isSubmitted ? (
        <pre className="rounded-md bg-charcoal-900 text-charcoal-100 p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {block.content}
        </pre>
      ) : (
        <textarea
          value={block.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Paste or write your code here..."
          rows={6}
          className="w-full rounded-md border border-warm-light/20 bg-charcoal-900 text-charcoal-100 px-3 py-2 font-mono text-xs placeholder:text-charcoal-500 focus:ring-2 focus:ring-copper-500/15 focus:border-copper-400/40 transition-all duration-200 resize-y leading-relaxed"
          spellCheck={false}
        />
      )}
    </BlockWrapper>
  )
}

function ScreenshotBlockCard({
  block,
  isSubmitted,
  onRemove,
  onUpdate,
}: {
  block: SubmissionBlock & { type: 'screenshot' }
  isSubmitted: boolean
  onRemove: () => void
  onUpdate: (updates: Partial<SubmissionBlock>) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setIsLoading(true)
    try {
      const dataUrl = await resizeImage(file)
      onUpdate({ dataUrl })
    } catch {
      // silently fail
    }
    setIsLoading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (!file) continue
        setIsLoading(true)
        try {
          const dataUrl = await resizeImage(file)
          onUpdate({ dataUrl })
        } catch {
          // silently fail
        }
        setIsLoading(false)
        return
      }
    }
  }

  return (
    <BlockWrapper icon={ImageIcon} label="Screenshot" isSubmitted={isSubmitted} onRemove={onRemove}>
      {block.dataUrl ? (
        <div className="space-y-2">
          <div className="rounded-md border border-warm-light/20 overflow-hidden bg-charcoal-50">
            <img
              src={block.dataUrl}
              alt={block.caption || 'Screenshot'}
              className="w-full h-auto max-h-[400px] object-contain"
            />
          </div>
          {isSubmitted ? (
            block.caption && (
              <p className="font-serif text-xs text-warm-muted italic">{block.caption}</p>
            )
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={block.caption}
                onChange={(e) => onUpdate({ caption: e.target.value })}
                placeholder="Add a caption (optional)..."
                className="flex-1 px-2.5 py-1.5 rounded-md border border-warm-light/20 bg-white font-serif text-xs text-warm-secondary placeholder:text-warm-light focus:ring-2 focus:ring-copper-500/15 focus:border-copper-400/40 transition-all"
              />
              <button
                onClick={() => onUpdate({ dataUrl: '' })}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium text-red-500 hover:bg-red-50 border border-red-200 transition-colors"
              >
                Replace
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onPaste={handlePaste}
          tabIndex={0}
          className="rounded-md border-2 border-dashed border-warm-light/30 p-6 text-center cursor-pointer hover:border-copper-300 hover:bg-copper-50/30 transition-all focus:outline-none focus:border-copper-400"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {isLoading ? (
            <Loader2 className="w-6 h-6 text-copper-400 animate-spin mx-auto" />
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-warm-light mx-auto mb-2" />
              <p className="font-serif text-xs text-warm-muted">
                Click to upload or <span className="text-copper-500 font-medium">paste</span> a screenshot
              </p>
              <p className="font-serif text-[10px] text-warm-light mt-1">
                PNG, JPG up to 5MB
              </p>
            </>
          )}
        </div>
      )}
    </BlockWrapper>
  )
}
