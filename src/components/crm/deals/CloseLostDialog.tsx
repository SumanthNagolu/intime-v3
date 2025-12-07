'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, XCircle, AlertTriangle, DollarSign } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'

const closeLostSchema = z.object({
  lossReasonCategory: z.enum([
    'competitor',
    'no_budget',
    'project_cancelled',
    'hired_internally',
    'went_dark',
    'price_too_high',
    'requirements_changed',
    'other',
  ]),
  lossDetails: z.string().optional(),
  competitorWon: z.string().optional(),
  competitorPrice: z.number().optional(),
  futurePotential: z.enum(['yes', 'maybe', 'no']),
  reengagementDate: z.date().optional(),
  lessonsLearned: z.string().optional(),
})

type CloseLostFormValues = z.infer<typeof closeLostSchema>

interface CloseLostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deal: {
    id: string
    name: string
    value?: number
    competitors?: string[] | null
  }
  onSuccess?: () => void
}

const lossReasons = [
  { value: 'competitor', label: 'Lost to Competitor', icon: '🏆' },
  { value: 'no_budget', label: 'No Budget / Budget Cut', icon: '💰' },
  { value: 'project_cancelled', label: 'Project Cancelled', icon: '❌' },
  { value: 'hired_internally', label: 'Hired Internally', icon: '🏠' },
  { value: 'went_dark', label: 'Went Dark / No Response', icon: '👻' },
  { value: 'price_too_high', label: 'Price Too High', icon: '📈' },
  { value: 'requirements_changed', label: 'Requirements Changed', icon: '🔄' },
  { value: 'other', label: 'Other', icon: '📋' },
]

const futurePotentialOptions = [
  { value: 'yes', label: 'Yes - Strong potential for future business', color: 'green' },
  { value: 'maybe', label: 'Maybe - Worth checking in later', color: 'amber' },
  { value: 'no', label: 'No - Unlikely to re-engage', color: 'red' },
]

export function CloseLostDialog({
  open,
  onOpenChange,
  deal,
  onSuccess,
}: CloseLostDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const form = useForm<CloseLostFormValues>({
    resolver: zodResolver(closeLostSchema),
    defaultValues: {
      lossReasonCategory: 'competitor',
      futurePotential: 'maybe',
    },
  })

  const closeLost = trpc.crm.deals.closeLost.useMutation({
    onSuccess: () => {
      toast({
        title: 'Deal Closed',
        description: `"${deal.name}" has been marked as lost.`,
      })
      utils.crm.deals.list.invalidate()
      utils.crm.deals.pipeline.invalidate()
      utils.crm.deals.getById.invalidate({ id: deal.id })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const onSubmit = (data: CloseLostFormValues) => {
    closeLost.mutate({
      id: deal.id,
      lossReasonCategory: data.lossReasonCategory,
      lossDetails: data.lossDetails,
      competitorWon: data.competitorWon,
      competitorPrice: data.competitorPrice,
      futurePotential: data.futurePotential,
      reengagementDate: data.reengagementDate
        ? format(data.reengagementDate, 'yyyy-MM-dd')
        : undefined,
      lessonsLearned: data.lessonsLearned,
    })
  }

  const selectedReason = form.watch('lossReasonCategory')
  const futurePotential = form.watch('futurePotential')
  const showCompetitorFields = selectedReason === 'competitor'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="font-heading text-lg uppercase tracking-wider">
                Close Deal as Lost
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <span>{deal.name}</span>
                {deal.value && (
                  <span className="text-muted-foreground">
                    (${deal.value.toLocaleString()})
                  </span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Loss Reason */}
            <FormField
              control={form.control}
              name="lossReasonCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why did we lose this deal? *</FormLabel>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {lossReasons.map((reason) => (
                      <label
                        key={reason.value}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all',
                          field.value === reason.value
                            ? 'border-red-300 bg-red-50 ring-1 ring-red-300'
                            : 'border-border hover:bg-muted/50'
                        )}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          value={reason.value}
                          checked={field.value === reason.value}
                          onChange={() => field.onChange(reason.value)}
                        />
                        <span className="text-lg">{reason.icon}</span>
                        <span className="text-sm font-medium">{reason.label}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Competitor Details */}
            {showCompetitorFields && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Competitor Details
                </h4>

                <FormField
                  control={form.control}
                  name="competitorWon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Competitor Who Won</FormLabel>
                      {deal.competitors && deal.competitors.length > 0 ? (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select competitor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {deal.competitors.map((competitor) => (
                              <SelectItem key={competitor} value={competitor}>
                                {competitor}
                              </SelectItem>
                            ))}
                            <SelectItem value="unknown">Unknown / Other</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <FormControl>
                          <Input
                            placeholder="Enter competitor name"
                            {...field}
                          />
                        </FormControl>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="competitorPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Competitor&apos;s Price (if known)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            className="pl-9"
                            placeholder="Their quoted price"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Loss Details */}
            <FormField
              control={form.control}
              name="lossDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What happened? Any specific feedback from the client?"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Future Potential */}
            <FormField
              control={form.control}
              name="futurePotential"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Future Potential</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-2"
                    >
                      {futurePotentialOptions.map((option) => (
                        <label
                          key={option.value}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                            field.value === option.value
                              ? option.color === 'green'
                                ? 'border-green-300 bg-green-50'
                                : option.color === 'amber'
                                ? 'border-amber-300 bg-amber-50'
                                : 'border-red-300 bg-red-50'
                              : 'border-border hover:bg-muted/50'
                          )}
                        >
                          <RadioGroupItem value={option.value} />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Re-engagement Date */}
            {futurePotential !== 'no' && (
              <FormField
                control={form.control}
                name="reengagementDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Re-engagement Date</FormLabel>
                    <FormDescription>
                      When should we follow up with this prospect?
                    </FormDescription>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Lessons Learned */}
            <FormField
              control={form.control}
              name="lessonsLearned"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lessons Learned</FormLabel>
                  <FormDescription>
                    What can we do better next time?
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Key takeaways from this deal..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={closeLost.isPending}
                variant="destructive"
              >
                {closeLost.isPending ? 'Closing...' : 'Close as Lost'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
