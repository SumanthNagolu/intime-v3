'use client'

import React, { useState, useCallback } from 'react'
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
} from 'lucide-react'

interface AssignmentBlockProps {
  lessonId: string
  assignmentPdf?: string
  solutionPdf?: string
  onSubmit: (lessonId: string, response: string) => void
  isSubmitted: boolean
  previousResponse?: string
  fullPage?: boolean
}

export function AssignmentBlock({
  lessonId,
  assignmentPdf,
  solutionPdf,
  onSubmit,
  isSubmitted,
  previousResponse,
  fullPage,
}: AssignmentBlockProps) {
  const [response, setResponse] = useState(previousResponse || '')
  const [showSolution, setShowSolution] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pdfExpanded, setPdfExpanded] = useState(true)
  const [pdfFullHeight, setPdfFullHeight] = useState(false)
  const [activeTab, setActiveTab] = useState<'assignment' | 'solution'>('assignment')
  const [showResponsePanel, setShowResponsePanel] = useState(!fullPage)

  const handleSubmit = useCallback(async () => {
    if (!response.trim()) return
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    onSubmit(lessonId, response)
    setIsSubmitting(false)
  }, [response, lessonId, onSubmit])

  const pdfFilename = assignmentPdf?.split('/').pop() || 'Assignment'

  const currentPdfUrl = activeTab === 'solution' && solutionPdf
    ? solutionPdf
    : assignmentPdf

  // ======== FULL PAGE MODE ========
  if (fullPage) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden" id="assignment">
        {/* Top toolbar with Assignment/Solution tabs */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-warm-deep border-b border-warm-primary/20">
          <div className="flex items-center gap-3">
            {/* Assignment / Solution tab switcher */}
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
                  onClick={() => {
                    setActiveTab('solution')
                    setShowSolution(true)
                  }}
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
            {/* Status badge */}
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

            {/* Toggle response panel */}
            <button
              onClick={() => setShowResponsePanel(!showResponsePanel)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-serif text-xs font-medium text-warm-light hover:text-white hover:bg-warm-primary/40 transition-all"
            >
              <Send className="w-3 h-3" />
              {showResponsePanel ? 'Hide Response' : 'Write Response'}
            </button>
          </div>
        </div>

        {/* Main content: PDF + optional response sidebar */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Full-page PDF iframe */}
          <div className="flex-1 min-w-0">
            {assignmentPdf ? (
              <iframe
                key={currentPdfUrl}
                src={`${currentPdfUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full border-0"
                title={activeTab === 'solution' ? 'Solution Guide' : 'Assignment Document'}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="font-serif text-sm text-warm-muted">No assignment PDF available</p>
              </div>
            )}
          </div>

          {/* Response sidebar panel */}
          {showResponsePanel && (
            <div className="w-80 lg:w-96 flex-shrink-0 border-l border-warm-light/15 bg-white flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-warm-light/15" style={{ backgroundColor: 'var(--al-cream, #f5efe5)' }}>
                <h4 className="font-mono-warm text-[9px] font-medium text-warm-secondary uppercase" style={{ letterSpacing: '2.5px' }}>
                  Your Response
                </h4>
              </div>
              <div className="flex-1 flex flex-col p-4 min-h-0">
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Write your assignment response here..."
                  disabled={isSubmitted}
                  className="flex-1 w-full rounded-lg border border-warm-light/20 bg-white px-3 py-2.5 font-mono-warm text-sm text-warm-primary placeholder:text-warm-light focus:ring-2 focus:ring-copper-500/15 focus:border-copper-400/40 transition-all duration-200 resize-none disabled:bg-warm-cream disabled:cursor-not-allowed"
                />
                <div className="mt-3">
                  {!isSubmitted ? (
                    <button
                      onClick={handleSubmit}
                      disabled={!response.trim() || isSubmitting}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-copper-500 text-white font-serif text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Response
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sage-50 border border-sage-200">
                      <CheckCircle className="w-4 h-4 text-sage-600" />
                      <span className="font-serif text-sm font-medium text-sage-700">Response Submitted</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ======== INLINE MODE (for scroll view) ========
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
              Complete and submit your response
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
        {/* Inline PDF Viewer */}
        {assignmentPdf && (
          <div className="rounded-lg border border-warm-light/20 overflow-hidden">
            {/* PDF toolbar */}
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
                      onClick={() => {
                        setActiveTab('solution')
                        setShowSolution(true)
                      }}
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
                    <div>
                      <p className="font-serif text-xs font-medium text-warm-primary">{pdfFilename}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPdfFullHeight(!pdfFullHeight)}
                  className="p-1.5 rounded-md text-warm-muted hover:text-warm-secondary hover:bg-warm-cream transition-colors"
                  title={pdfFullHeight ? 'Compact view' : 'Full view'}
                >
                  {pdfFullHeight ? (
                    <Minimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => setPdfExpanded(!pdfExpanded)}
                  className="p-1.5 rounded-md text-warm-muted hover:text-warm-secondary hover:bg-warm-cream transition-colors"
                  title={pdfExpanded ? 'Collapse' : 'Expand'}
                >
                  {pdfExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>


            {pdfExpanded && (
              <div
                className="transition-all duration-300"
                style={{ height: pdfFullHeight ? '80vh' : '480px' }}
              >
                <iframe
                  key={currentPdfUrl}
                  src={`${currentPdfUrl}#toolbar=0&navpanes=0`}
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

        {/* Response textarea */}
        <div className="space-y-2">
          <label className="font-mono-warm text-[9px] font-medium text-warm-muted uppercase" style={{ letterSpacing: '2.5px' }}>
            Your Response
          </label>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Write your assignment response here. You can include code, explanations, and observations from the exercises..."
            rows={8}
            disabled={isSubmitted}
            className="w-full rounded-lg border border-warm-light/20 bg-white px-4 py-3 font-mono-warm text-sm text-warm-primary placeholder:text-warm-light focus:ring-2 focus:ring-copper-500/15 focus:border-copper-400/40 transition-all duration-200 resize-y disabled:bg-warm-cream disabled:cursor-not-allowed"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          {!solutionPdf ? (
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-warm-light/20 font-serif text-xs font-medium transition-all duration-200 text-warm-secondary hover:bg-warm-cream"
            >
              {showSolution ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  Hide Solution
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  View Solution Guide
                </>
              )}
            </button>
          ) : (
            <div />
          )}

          {!isSubmitted && (
            <button
              onClick={handleSubmit}
              disabled={!response.trim() || isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-copper-500 text-white font-serif text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Response
                </>
              )}
            </button>
          )}
        </div>

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
