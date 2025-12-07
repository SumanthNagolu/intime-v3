'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DollarSign,
  UserCheck,
  Target,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  PauseCircle,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const qualifyFormSchema = z.object({
  // BANT Scores (0-25 each)
  bantBudget: z.number().min(0).max(25),
  bantAuthority: z.number().min(0).max(25),
  bantNeed: z.number().min(0).max(25),
  bantTimeline: z.number().min(0).max(25),
  // BANT Notes
  bantBudgetNotes: z.string().optional(),
  bantAuthorityNotes: z.string().optional(),
  bantNeedNotes: z.string().optional(),
  bantTimelineNotes: z.string().optional(),
  // Additional qualification data
  budgetStatus: z.enum(['confirmed', 'likely', 'unclear', 'no_budget']).optional(),
  estimatedMonthlySpend: z.number().optional(),
  authorityLevel: z.enum(['decision_maker', 'influencer', 'gatekeeper', 'no_authority']).optional(),
  urgency: z.enum(['immediate', 'high', 'medium', 'low']).optional(),
  targetStartDate: z.string().optional(),
  positionsCount: z.number().min(1).max(100).optional(),
  skillsNeeded: z.array(z.string()).optional(),
  contractTypes: z.array(z.enum(['contract', 'contract_to_hire', 'direct_hire', 'rpo'])).optional(),
  // Qualification result
  qualificationResult: z.enum(['qualified_convert', 'qualified_nurture', 'not_qualified']),
  qualificationNotes: z.string().optional(),
})

type QualifyFormValues = z.infer<typeof qualifyFormSchema>

interface QualifyLeadDialogProps {
  lead: {
    id: string
    company_name?: string
    first_name?: string
    last_name?: string
    bant_budget?: number
    bant_authority?: number
    bant_need?: number
    bant_timeline?: number
    positions_count?: number
    skills_needed?: string[]
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const BUDGET_OPTIONS = [
  { value: 'confirmed', label: 'Budget Confirmed', score: 25, color: 'bg-green-500' },
  { value: 'likely', label: 'Budget Likely', score: 15, color: 'bg-amber-500' },
  { value: 'unclear', label: 'Budget Unclear', score: 5, color: 'bg-charcoal-400' },
  { value: 'no_budget', label: 'No Budget', score: 0, color: 'bg-red-500' },
]

const AUTHORITY_OPTIONS = [
  { value: 'decision_maker', label: 'Decision Maker', score: 25, color: 'bg-green-500' },
  { value: 'influencer', label: 'Influencer', score: 20, color: 'bg-blue-500' },
  { value: 'gatekeeper', label: 'Gatekeeper', score: 10, color: 'bg-amber-500' },
  { value: 'no_authority', label: 'No Authority', score: 0, color: 'bg-red-500' },
]

const URGENCY_OPTIONS = [
  { value: 'immediate', label: 'Immediate (< 30 days)', score: 25, color: 'bg-red-500' },
  { value: 'high', label: 'High (30-60 days)', score: 20, color: 'bg-orange-500' },
  { value: 'medium', label: 'Medium (60-90 days)', score: 10, color: 'bg-amber-500' },
  { value: 'low', label: 'Low (90+ days)', score: 5, color: 'bg-charcoal-400' },
]

export function QualifyLeadDialog({ lead, open, onOpenChange, onSuccess }: QualifyLeadDialogProps) {
  const [activeTab, setActiveTab] = useState('budget')
  const [skillInput, setSkillInput] = useState('')
  const utils = trpc.useUtils()

  const form = useForm<QualifyFormValues>({
    resolver: zodResolver(qualifyFormSchema),
    defaultValues: {
      bantBudget: lead.bant_budget ?? 0,
      bantAuthority: lead.bant_authority ?? 0,
      bantNeed: lead.bant_need ?? 0,
      bantTimeline: lead.bant_timeline ?? 0,
      positionsCount: lead.positions_count ?? 1,
      skillsNeeded: lead.skills_needed ?? [],
      qualificationResult: 'qualified_convert',
    },
  })

  const watchedValues = form.watch()
  const totalScore = watchedValues.bantBudget + watchedValues.bantAuthority + watchedValues.bantNeed + watchedValues.bantTimeline
  const skills = watchedValues.skillsNeeded || []

  const qualifyLead = trpc.crm.leads.qualify.useMutation({
    onSuccess: () => {
      toast.success('Lead qualified successfully')
      utils.crm.leads.getById.invalidate({ id: lead.id })
      utils.crm.leads.list.invalidate()
      utils.crm.leads.getStats.invalidate()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to qualify lead')
    },
  })

  const onSubmit = (data: QualifyFormValues) => {
    qualifyLead.mutate({
      id: lead.id,
      ...data,
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600'
    if (score >= 50) return 'text-blue-600'
    if (score >= 25) return 'text-amber-600'
    return 'text-charcoal-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 75) return 'Highly Qualified'
    if (score >= 50) return 'Good Prospect'
    if (score >= 25) return 'Needs Development'
    return 'Low Priority'
  }

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      form.setValue('skillsNeeded', [...skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    form.setValue('skillsNeeded', skills.filter((s) => s !== skill))
  }

  const leadName = lead.company_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'This Lead'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">Qualify Lead: {leadName}</DialogTitle>
          <DialogDescription>
            Score this lead using the BANT framework to determine qualification
          </DialogDescription>
        </DialogHeader>

        {/* Score Summary */}
        <div className="bg-charcoal-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">BANT Score</span>
            <span className={cn('text-2xl font-bold', getScoreColor(totalScore))}>
              {totalScore}/100
            </span>
          </div>
          <Progress value={totalScore} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-charcoal-500">
            <span>Budget: {watchedValues.bantBudget}</span>
            <span>Authority: {watchedValues.bantAuthority}</span>
            <span>Need: {watchedValues.bantNeed}</span>
            <span>Timeline: {watchedValues.bantTimeline}</span>
          </div>
          <p className={cn('text-sm font-medium mt-2', getScoreColor(totalScore))}>
            {getScoreLabel(totalScore)}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="budget" className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Budget
                </TabsTrigger>
                <TabsTrigger value="authority" className="flex items-center gap-1">
                  <UserCheck className="w-4 h-4" />
                  Authority
                </TabsTrigger>
                <TabsTrigger value="need" className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Need
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Timeline
                </TabsTrigger>
              </TabsList>

              {/* Budget Tab */}
              <TabsContent value="budget" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="budgetStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Status</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {BUDGET_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              field.onChange(option.value)
                              form.setValue('bantBudget', option.score)
                            }}
                            className={cn(
                              'p-3 rounded-lg border-2 text-left transition-all',
                              field.value === option.value
                                ? 'border-hublot-900 bg-hublot-50'
                                : 'border-charcoal-200 hover:border-charcoal-300'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{option.label}</span>
                              <Badge className={cn('text-white', option.color)}>
                                {option.score} pts
                              </Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bantBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Score: {field.value}/25</FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                          max={25}
                          step={1}
                        />
                      </FormControl>
                      <FormDescription>Fine-tune the budget score</FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedMonthlySpend"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Monthly Spend ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 50000"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bantBudgetNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notes about budget discussions..."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Authority Tab */}
              <TabsContent value="authority" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="authorityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authority Level</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {AUTHORITY_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              field.onChange(option.value)
                              form.setValue('bantAuthority', option.score)
                            }}
                            className={cn(
                              'p-3 rounded-lg border-2 text-left transition-all',
                              field.value === option.value
                                ? 'border-hublot-900 bg-hublot-50'
                                : 'border-charcoal-200 hover:border-charcoal-300'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{option.label}</span>
                              <Badge className={cn('text-white', option.color)}>
                                {option.score} pts
                              </Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bantAuthority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authority Score: {field.value}/25</FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                          max={25}
                          step={1}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bantAuthorityNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authority Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Who else is involved in the decision? Org structure..."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Need Tab */}
              <TabsContent value="need" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="bantNeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Need Score: {field.value}/25</FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                          max={25}
                          step={1}
                        />
                      </FormControl>
                      <FormDescription>
                        How strong is their need for staffing services?
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="positionsCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Positions</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 1)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Skills */}
                <div>
                  <FormLabel>Skills Needed</FormLabel>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="e.g., React, Python, AWS"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addSkill()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addSkill}>
                      Add
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="contractTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Types</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'contract', label: 'Contract' },
                          { value: 'contract_to_hire', label: 'Contract to Hire' },
                          { value: 'direct_hire', label: 'Direct Hire' },
                          { value: 'rpo', label: 'RPO' },
                        ].map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => {
                              const current = field.value || []
                              if (current.includes(type.value as any)) {
                                field.onChange(current.filter((v) => v !== type.value))
                              } else {
                                field.onChange([...current, type.value])
                              }
                            }}
                            className={cn(
                              'p-2 rounded-lg border text-sm transition-all',
                              (field.value || []).includes(type.value as any)
                                ? 'border-hublot-900 bg-hublot-50'
                                : 'border-charcoal-200 hover:border-charcoal-300'
                            )}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bantNeedNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Need Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Details about their staffing needs..."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="urgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgency Level</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {URGENCY_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              field.onChange(option.value)
                              form.setValue('bantTimeline', option.score)
                            }}
                            className={cn(
                              'p-3 rounded-lg border-2 text-left transition-all',
                              field.value === option.value
                                ? 'border-hublot-900 bg-hublot-50'
                                : 'border-charcoal-200 hover:border-charcoal-300'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{option.label}</span>
                              <Badge className={cn('text-white', option.color)}>
                                {option.score} pts
                              </Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bantTimeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeline Score: {field.value}/25</FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                          max={25}
                          step={1}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bantTimelineNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeline Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Project timeline, deadlines, hiring urgency..."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            {/* Qualification Decision */}
            <div className="border-t pt-6">
              <h4 className="text-sm font-medium mb-4">Qualification Decision</h4>
              <FormField
                control={form.control}
                name="qualificationResult"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => field.onChange('qualified_convert')}
                        className={cn(
                          'p-4 rounded-lg border-2 text-center transition-all',
                          field.value === 'qualified_convert'
                            ? 'border-green-500 bg-green-50'
                            : 'border-charcoal-200 hover:border-charcoal-300'
                        )}
                      >
                        <CheckCircle2 className={cn(
                          'w-8 h-8 mx-auto mb-2',
                          field.value === 'qualified_convert' ? 'text-green-500' : 'text-charcoal-400'
                        )} />
                        <span className="font-medium">Convert to Deal</span>
                        <p className="text-xs text-charcoal-500 mt-1">Ready to create opportunity</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => field.onChange('qualified_nurture')}
                        className={cn(
                          'p-4 rounded-lg border-2 text-center transition-all',
                          field.value === 'qualified_nurture'
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-charcoal-200 hover:border-charcoal-300'
                        )}
                      >
                        <PauseCircle className={cn(
                          'w-8 h-8 mx-auto mb-2',
                          field.value === 'qualified_nurture' ? 'text-amber-500' : 'text-charcoal-400'
                        )} />
                        <span className="font-medium">Add to Nurture</span>
                        <p className="text-xs text-charcoal-500 mt-1">Keep in pipeline for later</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => field.onChange('not_qualified')}
                        className={cn(
                          'p-4 rounded-lg border-2 text-center transition-all',
                          field.value === 'not_qualified'
                            ? 'border-red-500 bg-red-50'
                            : 'border-charcoal-200 hover:border-charcoal-300'
                        )}
                      >
                        <XCircle className={cn(
                          'w-8 h-8 mx-auto mb-2',
                          field.value === 'not_qualified' ? 'text-red-500' : 'text-charcoal-400'
                        )} />
                        <span className="font-medium">Disqualify</span>
                        <p className="text-xs text-charcoal-500 mt-1">Not a fit right now</p>
                      </button>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="qualificationNotes"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Qualification Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Summary of qualification decision..."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={qualifyLead.isPending}>
                {qualifyLead.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Complete Qualification
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
