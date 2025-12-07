'use client'

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
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, UserPlus, Flame, ThermometerSun, Snowflake } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const convertFormSchema = z.object({
  leadScore: z.number().min(0).max(100).optional(),
  interestLevel: z.enum(['hot', 'warm', 'cold']),
  // BANT
  budgetStatus: z.enum(['unknown', 'limited', 'defined', 'approved']).optional(),
  budgetNotes: z.string().optional(),
  authorityStatus: z.enum(['unknown', 'influencer', 'decision_maker', 'champion']).optional(),
  authorityNotes: z.string().optional(),
  needStatus: z.enum(['unknown', 'identified', 'defined', 'urgent']).optional(),
  needNotes: z.string().optional(),
  timelineStatus: z.enum(['unknown', 'long', 'medium', 'short']).optional(),
  timelineNotes: z.string().optional(),
  // Details
  hiringNeeds: z.string().optional(),
  urgency: z.enum(['low', 'normal', 'high', 'urgent']),
  painPoints: z.string().optional(),
  // Next steps
  nextAction: z.string().optional(),
  nextActionDate: z.string().optional(),
  notes: z.string().optional(),
  notifyPodManager: z.boolean(),
})

type ConvertFormValues = z.infer<typeof convertFormSchema>

interface ProspectData {
  id: string
  first_name?: string
  last_name?: string
  company_name?: string
}

interface ConvertProspectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prospect: ProspectData
  onSuccess?: () => void
}

export function ConvertProspectDialog({
  open,
  onOpenChange,
  prospect,
  onSuccess,
}: ConvertProspectDialogProps) {
  const form = useForm<ConvertFormValues>({
    resolver: zodResolver(convertFormSchema),
    defaultValues: {
      interestLevel: 'warm',
      urgency: 'normal',
      notifyPodManager: false,
    },
  })

  const convertProspect = trpc.crm.campaigns.convertProspectToLead.useMutation({
    onSuccess: () => {
      toast.success('Prospect converted to lead successfully!')
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to convert prospect')
    },
  })

  const onSubmit = (data: ConvertFormValues) => {
    convertProspect.mutate({
      prospectId: prospect.id,
      ...data,
    })
  }

  const interestLevel = form.watch('interestLevel')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Convert to Lead
          </DialogTitle>
          <DialogDescription>
            Convert {prospect.first_name} {prospect.last_name} at {prospect.company_name} to a qualified lead
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Interest Level */}
            <FormField
              control={form.control}
              name="interestLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interest Level *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      <div className="relative">
                        <RadioGroupItem value="hot" id="hot" className="peer sr-only" />
                        <label
                          htmlFor="hot"
                          className={cn(
                            'flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all',
                            'hover:border-charcoal-300',
                            'peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:bg-red-50'
                          )}
                        >
                          <Flame className="w-6 h-6 text-red-500 mb-2" />
                          <span className="font-medium">Hot</span>
                          <span className="text-xs text-charcoal-500">Ready to buy</span>
                        </label>
                      </div>
                      <div className="relative">
                        <RadioGroupItem value="warm" id="warm" className="peer sr-only" />
                        <label
                          htmlFor="warm"
                          className={cn(
                            'flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all',
                            'hover:border-charcoal-300',
                            'peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50'
                          )}
                        >
                          <ThermometerSun className="w-6 h-6 text-orange-500 mb-2" />
                          <span className="font-medium">Warm</span>
                          <span className="text-xs text-charcoal-500">Interested</span>
                        </label>
                      </div>
                      <div className="relative">
                        <RadioGroupItem value="cold" id="cold" className="peer sr-only" />
                        <label
                          htmlFor="cold"
                          className={cn(
                            'flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all',
                            'hover:border-charcoal-300',
                            'peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50'
                          )}
                        >
                          <Snowflake className="w-6 h-6 text-blue-500 mb-2" />
                          <span className="font-medium">Cold</span>
                          <span className="text-xs text-charcoal-500">Needs nurturing</span>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Urgency and Score */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low - 2 weeks+</SelectItem>
                        <SelectItem value="normal">Normal - 1 week</SelectItem>
                        <SelectItem value="high">High - 2-3 days</SelectItem>
                        <SelectItem value="urgent">Urgent - 24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="leadScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Score (0-100)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="Auto-calculated"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* BANT Qualification */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-4">BANT Qualification (Optional)</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="budgetStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unknown" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unknown">Unknown</SelectItem>
                          <SelectItem value="limited">Limited</SelectItem>
                          <SelectItem value="defined">Defined</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="authorityStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unknown" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unknown">Unknown</SelectItem>
                          <SelectItem value="influencer">Influencer</SelectItem>
                          <SelectItem value="decision_maker">Decision Maker</SelectItem>
                          <SelectItem value="champion">Champion</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="needStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Need</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unknown" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unknown">Unknown</SelectItem>
                          <SelectItem value="identified">Identified</SelectItem>
                          <SelectItem value="defined">Defined</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timelineStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeline</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unknown" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unknown">Unknown</SelectItem>
                          <SelectItem value="long">Long (6+ months)</SelectItem>
                          <SelectItem value="medium">Medium (3-6 months)</SelectItem>
                          <SelectItem value="short">Short (0-3 months)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Details */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-4">Opportunity Details</h4>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="hiringNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hiring Needs</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the hiring needs or business opportunity..."
                          className="min-h-[60px]"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="painPoints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pain Points</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What challenges are they facing?"
                          className="min-h-[60px]"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Next Steps */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-4">Next Steps</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nextAction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Action</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Schedule discovery call" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nextActionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional context or notes..."
                        className="min-h-[60px]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Notification */}
            <FormField
              control={form.control}
              name="notifyPodManager"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between border rounded-lg p-4">
                  <div>
                    <FormLabel>Notify Pod Manager</FormLabel>
                    <FormDescription>Send notification about this new lead</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={convertProspect.isPending}>
                {convertProspect.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Convert to Lead
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
