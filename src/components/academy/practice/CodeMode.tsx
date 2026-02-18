'use client'

import React, { useState, useCallback } from 'react'
import {
  Code2,
  Play,
  Loader2,
  Sparkles,
  RotateCcw,
  Copy,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STARTER_TEMPLATES = [
  {
    id: 'gosu-entity',
    label: 'Gosu Entity Enhancement',
    desc: 'Add a calculated property to a PolicyCenter entity',
    code: `// Enhancement: AccountExt\n// Add a calculated property to Account entity\n\npackage gw.entity\n\nuses gw.api.database.Query\n\nenhancement AccountExt : entity.Account {\n\n  // TODO: Add a property that returns the total number\n  // of active policies for this account\n  property get ActivePolicyCount() : int {\n    // Your code here\n    return 0\n  }\n\n  // TODO: Add a method that checks if this account\n  // has any overdue invoices\n  function hasOverdueInvoices() : boolean {\n    // Your code here\n    return false\n  }\n}`,
  },
  {
    id: 'gosu-validation',
    label: 'Validation Rule',
    desc: 'Write a validation rule for claim submission',
    code: `// Validation Rule: ClaimSubmissionValidation\n// Ensure claim data meets business requirements before submission\n\npackage rules.validation\n\nuses gw.api.locale.DisplayKey\n\nclass ClaimSubmissionValidation {\n\n  // TODO: Validate that the claim has a valid loss date\n  // (not in the future, not more than 1 year old)\n  static function validateLossDate(claim : Claim) : String {\n    // Return null if valid, error message if invalid\n    return null\n  }\n\n  // TODO: Validate that required fields are populated\n  // based on the loss type\n  static function validateRequiredFields(claim : Claim) : String[] {\n    var errors = new ArrayList<String>()\n    // Your validation logic here\n    return errors\n  }\n}`,
  },
  {
    id: 'gosu-plugin',
    label: 'Plugin Implementation',
    desc: 'Implement an integration plugin for external system',
    code: `// Plugin: ExternalRatingPlugin\n// Integrate with external rating service\n\npackage plugins.rating\n\nuses gw.plugin.rating.IRateRoutinePlugin\nuses gw.api.web.WebServiceClient\n\nclass ExternalRatingPlugin implements IRateRoutinePlugin {\n\n  // TODO: Implement the rate method that calls\n  // an external rating service\n  override function rate(policyPeriod : PolicyPeriod) : Money {\n    // 1. Build the request payload\n    // 2. Call the external service\n    // 3. Parse the response\n    // 4. Return the calculated premium\n    return 0bd\n  }\n\n  // TODO: Implement error handling for service failures\n  private function handleServiceError(e : Exception) : Money {\n    // Your error handling logic\n    return 0bd\n  }\n}`,
  },
  {
    id: 'blank',
    label: 'Blank Canvas',
    desc: 'Start from scratch with an empty editor',
    code: `// Write your Gosu / Java / configuration code here\n// Use the AI assistant to get feedback on your code\n\n`,
  },
]

export function CodeMode() {
  const [code, setCode] = useState(STARTER_TEMPLATES[0].code)
  const [activeTemplate, setActiveTemplate] = useState(STARTER_TEMPLATES[0].id)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isGrading, setIsGrading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleTemplateSelect = useCallback((templateId: string) => {
    const template = STARTER_TEMPLATES.find((t) => t.id === templateId)
    if (template) {
      setCode(template.code)
      setActiveTemplate(templateId)
      setFeedback(null)
    }
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!code.trim() || isGrading) return
    setIsGrading(true)
    setFeedback(null)

    try {
      const template = STARTER_TEMPLATES.find((t) => t.id === activeTemplate)
      const res = await fetch('/api/ai/grade-assignment-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          taskDescription: template?.label ?? 'Code review',
          expectedBehavior: template?.desc ?? 'Review the code for correctness and best practices',
          language: 'gosu',
        }),
      })
      if (!res.ok) throw new Error('Grading failed')
      const data = await res.json()
      setFeedback(data.feedback || data.message || 'Code reviewed successfully.')
    } catch {
      setFeedback('Could not grade your code. Check your connection and try again.')
    } finally {
      setIsGrading(false)
    }
  }, [code, isGrading, activeTemplate])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  const handleReset = useCallback(() => {
    const template = STARTER_TEMPLATES.find((t) => t.id === activeTemplate)
    if (template) {
      setCode(template.code)
      setFeedback(null)
    }
  }, [activeTemplate])

  return (
    <div className="flex flex-col h-full bg-cream">
      {/* Template bar */}
      <div className="flex items-center gap-2 px-6 py-3 bg-white border-b border-charcoal-200/60 shrink-0 overflow-x-auto">
        {STARTER_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTemplateSelect(t.id)}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeTemplate === t.id
                ? 'bg-charcoal-900 text-white'
                : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main split view */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-4 py-2 bg-charcoal-900 shrink-0">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-charcoal-400" />
              <span className="text-xs text-charcoal-400 font-mono">
                {STARTER_TEMPLATES.find((t) => t.id === activeTemplate)?.label ?? 'Editor'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded text-charcoal-400 hover:text-white hover:bg-charcoal-700 transition-colors"
                title="Copy code"
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 rounded text-charcoal-400 hover:text-white hover:bg-charcoal-700 transition-colors"
                title="Reset to template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full bg-charcoal-950 text-charcoal-100 font-mono text-sm p-4 resize-none focus:outline-none leading-relaxed"
            spellCheck={false}
          />
          <div className="flex items-center justify-between px-4 py-2.5 bg-charcoal-900 border-t border-charcoal-800 shrink-0">
            <span className="text-[10px] text-charcoal-500 tabular-nums">
              {code.split('\n').length} lines
            </span>
            <button
              onClick={handleSubmit}
              disabled={!code.trim() || isGrading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500 text-white text-sm font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-40 disabled:hover:translate-y-0"
            >
              {isGrading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Reviewing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Submit for Review
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback panel */}
        <div className="w-[380px] flex flex-col border-l border-charcoal-200/60 bg-white shrink-0">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-charcoal-200/60">
            <Sparkles className="w-4 h-4 text-gold-500" />
            <span className="text-sm font-medium text-charcoal-900">AI Feedback</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {feedback ? (
              <div className="text-sm text-charcoal-700 leading-relaxed whitespace-pre-wrap">
                {feedback}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-charcoal-100 flex items-center justify-center">
                  <Code2 className="w-6 h-6 text-charcoal-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal-700">Write your code</p>
                  <p className="text-xs text-charcoal-500 mt-1">
                    Click &ldquo;Submit for Review&rdquo; to get AI feedback on your implementation
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
