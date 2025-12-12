'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  FlaskConical,
  Play,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import {
  type EntityType,
  ENTITY_FIELDS,
} from '@/lib/workflows/types'

interface WorkflowTestDialogProps {
  workflowId: string
  entityType: EntityType
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface TestResult {
  success: boolean
  triggered: boolean
  conditionsResult: {
    passed: boolean
    evaluations: {
      field: string
      operator: string
      expected: unknown
      actual: unknown
      passed: boolean
    }[]
  }
  stepsPreview?: {
    stepNumber: number
    stepName: string
    approverType: string
    resolvedApprover?: string
  }[]
  actionsPreview?: {
    actionType: string
    trigger: string
    config: Record<string, unknown>
  }[]
  errors?: string[]
  warnings?: string[]
}

export function WorkflowTestDialog({
  workflowId,
  entityType,
  open,
  onOpenChange,
}: WorkflowTestDialogProps) {
  const [testData, setTestData] = useState<Record<string, unknown>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    conditions: true,
    steps: false,
    actions: false,
  })

  // Get workflow details
  const workflowQuery = trpc.workflows.getById.useQuery({ id: workflowId })

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setResult(null)
      // Initialize test data with empty values for entity fields
      const fields = ENTITY_FIELDS[entityType] || []
      const initialData: Record<string, unknown> = {}
      fields.forEach(field => {
        if (field.type === 'boolean') {
          initialData[field.name] = false
        } else if (field.type === 'number' || field.type === 'currency') {
          initialData[field.name] = 0
        } else {
          initialData[field.name] = ''
        }
      })
      setTestData(initialData)
    }
  }, [open, entityType])

  const handleRunTest = async () => {
    setIsRunning(true)
    setResult(null)

    try {
      // Simulate dry run evaluation
      // In production, this would call a tRPC procedure that evaluates the workflow without executing
      await new Promise(resolve => setTimeout(resolve, 1000))

      const workflow = workflowQuery.data
      if (!workflow) {
        setResult({
          success: false,
          triggered: false,
          conditionsResult: { passed: false, evaluations: [] },
          errors: ['Workflow not found'],
        })
        return
      }

      // Evaluate conditions against test data
      const conditions = workflow.trigger_conditions?.conditions || []
      const logic = workflow.trigger_conditions?.logic || 'and'
      const evaluations: TestResult['conditionsResult']['evaluations'] = []

      let allPassed = true
      let anyPassed = false

      conditions.forEach((cond: { field: string; operator: string; value: unknown }) => {
        const actual = testData[cond.field]
        let passed = false

        // Simple evaluation logic
        switch (cond.operator) {
          case 'eq':
            passed = actual === cond.value
            break
          case 'neq':
            passed = actual !== cond.value
            break
          case 'gt':
            passed = Number(actual) > Number(cond.value)
            break
          case 'lt':
            passed = Number(actual) < Number(cond.value)
            break
          case 'gte':
            passed = Number(actual) >= Number(cond.value)
            break
          case 'lte':
            passed = Number(actual) <= Number(cond.value)
            break
          case 'contains':
            passed = String(actual).includes(String(cond.value))
            break
          case 'is_empty':
            passed = !actual || actual === ''
            break
          case 'is_not_empty':
            passed = !!actual && actual !== ''
            break
          default:
            passed = true
        }

        evaluations.push({
          field: cond.field,
          operator: cond.operator,
          expected: cond.value,
          actual,
          passed,
        })

        if (passed) anyPassed = true
        else allPassed = false
      })

      const conditionsPassed = conditions.length === 0 || (logic === 'and' ? allPassed : anyPassed)

      // Build steps preview
      const stepsPreview = workflow.steps?.map((step: { step_name: string; approver_type: string; approver_config: Record<string, unknown> }, i: number) => ({
        stepNumber: i + 1,
        stepName: step.step_name,
        approverType: step.approver_type,
        resolvedApprover: resolveApproverPreview(step.approver_type, step.approver_config, testData),
      }))

      // Build actions preview
      const actionsPreview = workflow.actions?.map((action: { action_type: string; action_trigger: string; action_config: Record<string, unknown> }) => ({
        actionType: action.action_type,
        trigger: action.action_trigger,
        config: action.action_config,
      }))

      setResult({
        success: true,
        triggered: conditionsPassed,
        conditionsResult: {
          passed: conditionsPassed,
          evaluations,
        },
        stepsPreview,
        actionsPreview,
        warnings: conditionsPassed ? [] : ['Workflow would NOT trigger with this test data'],
      })

    } catch (error) {
      setResult({
        success: false,
        triggered: false,
        conditionsResult: { passed: false, evaluations: [] },
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
      })
    } finally {
      setIsRunning(false)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const fields = ENTITY_FIELDS[entityType] || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-purple-600" />
            Test Workflow (Dry Run)
          </DialogTitle>
          <DialogDescription>
            Enter test data to see if the workflow would trigger and preview the actions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Test Data Input */}
          <div>
            <h3 className="text-sm font-medium text-charcoal-700 mb-3">Test Data</h3>
            <div className="grid grid-cols-2 gap-3 p-4 bg-charcoal-50 rounded-lg max-h-[300px] overflow-y-auto">
              {fields.map(field => (
                <div key={field.name}>
                  <Label className="text-xs text-charcoal-500">{field.label}</Label>
                  {field.type === 'select' && field.options ? (
                    <select
                      value={String(testData[field.name] || '')}
                      onChange={(e) => setTestData({ ...testData, [field.name]: e.target.value })}
                      className="mt-1 w-full px-3 py-2 text-sm border border-charcoal-200 rounded-lg bg-white"
                    >
                      <option value="">Select...</option>
                      {field.options.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'boolean' ? (
                    <select
                      value={testData[field.name] === true ? 'true' : 'false'}
                      onChange={(e) => setTestData({ ...testData, [field.name]: e.target.value === 'true' })}
                      className="mt-1 w-full px-3 py-2 text-sm border border-charcoal-200 rounded-lg bg-white"
                    >
                      <option value="false">False</option>
                      <option value="true">True</option>
                    </select>
                  ) : field.type === 'number' || field.type === 'currency' ? (
                    <Input
                      type="number"
                      value={String(testData[field.name] || '')}
                      onChange={(e) => setTestData({ ...testData, [field.name]: Number(e.target.value) })}
                      className="mt-1"
                    />
                  ) : (
                    <Input
                      value={String(testData[field.name] || '')}
                      onChange={(e) => setTestData({ ...testData, [field.name]: e.target.value })}
                      className="mt-1"
                      placeholder={field.type === 'date' ? 'YYYY-MM-DD' : ''}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Run Test Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleRunTest}
              disabled={isRunning}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Run Test
            </Button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Overall Result */}
              <div className={`p-4 rounded-lg border ${
                result.triggered
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-center gap-3">
                  {result.triggered ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  )}
                  <div>
                    <h4 className={`font-medium ${result.triggered ? 'text-emerald-800' : 'text-amber-800'}`}>
                      {result.triggered ? 'Workflow Would Trigger' : 'Workflow Would NOT Trigger'}
                    </h4>
                    <p className={`text-sm ${result.triggered ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {result.triggered
                        ? 'All conditions are met with this test data'
                        : 'One or more conditions are not met'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Errors */}
              {result.errors && result.errors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">Errors</h4>
                      <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                        {result.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Conditions Evaluation */}
              <div className="border border-charcoal-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('conditions')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-charcoal-50 hover:bg-charcoal-100"
                >
                  <span className="font-medium text-sm">Conditions Evaluation</span>
                  {expandedSections.conditions ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {expandedSections.conditions && (
                  <div className="p-4 space-y-2">
                    {result.conditionsResult.evaluations.length === 0 ? (
                      <div className="text-sm text-charcoal-500 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        No conditions configured - workflow always triggers
                      </div>
                    ) : (
                      result.conditionsResult.evaluations.map((eval_, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            eval_.passed ? 'bg-emerald-50' : 'bg-red-50'
                          }`}
                        >
                          <div className="text-sm">
                            <span className="font-medium">{eval_.field}</span>
                            <span className="text-charcoal-500 mx-2">{eval_.operator}</span>
                            <span className="font-mono bg-white px-2 py-0.5 rounded">
                              {String(eval_.expected)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-charcoal-500">
                              Actual: <span className="font-mono">{String(eval_.actual || '(empty)')}</span>
                            </span>
                            {eval_.passed ? (
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Steps Preview */}
              {result.stepsPreview && result.stepsPreview.length > 0 && (
                <div className="border border-charcoal-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('steps')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-charcoal-50 hover:bg-charcoal-100"
                  >
                    <span className="font-medium text-sm">Approval Steps Preview</span>
                    {expandedSections.steps ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSections.steps && (
                    <div className="p-4 space-y-2">
                      {result.stepsPreview.map((step, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-charcoal-50 rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-hublot-900 text-white flex items-center justify-center text-xs font-medium">
                            {step.stepNumber}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{step.stepName}</p>
                            <p className="text-xs text-charcoal-500">
                              Approver: {step.resolvedApprover || step.approverType}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions Preview */}
              {result.actionsPreview && result.actionsPreview.length > 0 && (
                <div className="border border-charcoal-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('actions')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-charcoal-50 hover:bg-charcoal-100"
                  >
                    <span className="font-medium text-sm">Actions Preview</span>
                    {expandedSections.actions ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSections.actions && (
                    <div className="p-4 space-y-2">
                      {result.actionsPreview.map((action, i) => (
                        <div key={i} className="p-3 bg-charcoal-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium capitalize">
                              {action.actionType.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs px-2 py-1 bg-charcoal-200 rounded">
                              {action.trigger.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {Object.keys(action.config).length > 0 && (
                            <pre className="text-xs font-mono text-charcoal-600 bg-white p-2 rounded">
                              {JSON.stringify(action.config, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to resolve approver preview
function resolveApproverPreview(
  approverType: string,
  config: Record<string, unknown>,
  _testData: Record<string, unknown>
): string {
  switch (approverType) {
    case 'specific_user':
      return config.user_id ? `User: ${config.user_id}` : 'Specific user (not configured)'
    case 'record_owner':
      return 'Record Owner (resolved at runtime)'
    case 'owners_manager':
      return "Record Owner's Manager (resolved at runtime)"
    case 'role_based':
      return config.role_name ? `Role: ${config.role_name}` : 'Role-based (not configured)'
    case 'pod_manager':
      return 'Pod Manager (resolved at runtime)'
    case 'custom_formula':
      return 'Custom Formula (resolved at runtime)'
    default:
      return approverType
  }
}
