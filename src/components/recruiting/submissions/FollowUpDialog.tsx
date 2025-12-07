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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Loader2,
  MessageSquare,
  Mail,
  Phone,
  Clock,
  Copy,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'

// Form validation schema
const followUpSchema = z.object({
  method: z.enum(['email', 'call', 'other']),
  notes: z.string().min(10, 'Notes must be at least 10 characters').max(1000),
})

type FollowUpFormData = z.infer<typeof followUpSchema>

interface FollowUpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  submissionId: string
  candidateName: string
  jobTitle: string
  accountName: string
  clientContactName?: string
  clientContactEmail?: string
  submittedAt?: Date | string
  daysPending?: number
  onSuccess?: () => void
}

// Email template generator
function generateFollowUpEmail(params: {
  candidateName: string
  jobTitle: string
  accountName: string
  clientContactName?: string
  submittedAt?: Date | string
}) {
  const { candidateName, jobTitle, accountName, clientContactName, submittedAt } = params
  const submittedDate = submittedAt
    ? format(new Date(submittedAt), 'MMMM d, yyyy')
    : 'recently'

  return `Hi ${clientContactName || 'there'},

I wanted to follow up on the candidate I submitted for the ${jobTitle} position.

Candidate: ${candidateName}
Submitted: ${submittedDate}

Have you had a chance to review their profile? I'd love to hear your thoughts and discuss next steps.

Please let me know if you need any additional information or would like to schedule an interview.

Best regards`
}

export function FollowUpDialog({
  open,
  onOpenChange,
  submissionId,
  candidateName,
  jobTitle,
  accountName,
  clientContactName,
  clientContactEmail,
  submittedAt,
  daysPending = 0,
  onSuccess,
}: FollowUpDialogProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'email' | 'log'>('email')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FollowUpFormData>({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      method: 'email',
      notes: '',
    },
  })

  const method = watch('method')

  // Generate email template
  const emailTemplate = generateFollowUpEmail({
    candidateName,
    jobTitle,
    accountName,
    clientContactName,
    submittedAt,
  })

  // Copy email to clipboard
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailTemplate)
      setCopied(true)
      toast({
        title: 'Email copied',
        description: 'Follow-up email copied to clipboard',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy to clipboard',
        variant: 'error',
      })
    }
  }

  // Open email client
  const handleOpenEmail = () => {
    const subject = encodeURIComponent(`Follow up: ${candidateName} for ${jobTitle}`)
    const body = encodeURIComponent(emailTemplate)
    const mailto = clientContactEmail
      ? `mailto:${clientContactEmail}?subject=${subject}&body=${body}`
      : `mailto:?subject=${subject}&body=${body}`
    window.location.href = mailto
  }

  // TODO: Add activity logging when endpoint is available
  const onSubmit = (data: FollowUpFormData) => {
    // For now, just show success and close
    // In a full implementation, this would log the activity
    toast({
      title: 'Follow-up logged',
      description: `${data.method === 'email' ? 'Email' : data.method === 'call' ? 'Call' : 'Follow-up'} logged for ${candidateName}`,
    })
    handleClose()
    onSuccess?.()
  }

  const handleClose = () => {
    reset()
    setCopied(false)
    setActiveTab('email')
    onOpenChange(false)
  }

  // Urgency based on days pending
  const urgency = daysPending >= 5 ? 'critical' : daysPending >= 3 ? 'high' : 'normal'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gold-500" />
            Follow Up
          </DialogTitle>
          <DialogDescription>
            Follow up on <span className="font-medium text-charcoal-900">{candidateName}</span>{' '}
            submitted to <span className="font-medium text-charcoal-900">{accountName}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Status Card */}
        <Card className={cn(
          'border-l-4',
          urgency === 'critical' ? 'border-l-red-500 bg-red-50' :
          urgency === 'high' ? 'border-l-amber-500 bg-amber-50' :
          'border-l-blue-500 bg-blue-50'
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className={cn(
                  'w-5 h-5',
                  urgency === 'critical' ? 'text-red-600' :
                  urgency === 'high' ? 'text-amber-600' :
                  'text-blue-600'
                )} />
                <span className="font-medium text-charcoal-900">
                  {daysPending} day{daysPending !== 1 ? 's' : ''} pending
                </span>
              </div>
              <Badge variant={urgency === 'critical' ? 'destructive' : urgency === 'high' ? 'secondary' : 'outline'}>
                {urgency === 'critical' ? 'Overdue' : urgency === 'high' ? 'Needs Attention' : 'On Track'}
              </Badge>
            </div>
            {submittedAt && (
              <p className="text-sm text-charcoal-500 mt-1">
                Submitted {formatDistanceToNow(new Date(submittedAt), { addSuffix: true })}
              </p>
            )}
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'email' | 'log')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Template
            </TabsTrigger>
            <TabsTrigger value="log" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Log Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4 mt-4">
            {/* Email Template Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Email Template</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyEmail}
                  className="text-charcoal-500"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <Card className="bg-charcoal-50">
                <CardContent className="p-3">
                  <pre className="text-sm text-charcoal-700 whitespace-pre-wrap font-sans">
                    {emailTemplate}
                  </pre>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleOpenEmail}
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                Open in Email
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyEmail}
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Template
              </Button>
            </div>

            {clientContactEmail && (
              <p className="text-sm text-charcoal-500 text-center">
                Sending to: <span className="font-medium">{clientContactEmail}</span>
              </p>
            )}
          </TabsContent>

          <TabsContent value="log" className="mt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Method Selection */}
              <div className="space-y-2">
                <Label>Contact Method</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setValue('method', 'email')}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors',
                      method === 'email'
                        ? 'border-hublot-900 bg-hublot-50'
                        : 'border-charcoal-200 hover:border-charcoal-300'
                    )}
                  >
                    <Mail className="w-5 h-5" />
                    <span className="text-sm">Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('method', 'call')}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors',
                      method === 'call'
                        ? 'border-hublot-900 bg-hublot-50'
                        : 'border-charcoal-200 hover:border-charcoal-300'
                    )}
                  >
                    <Phone className="w-5 h-5" />
                    <span className="text-sm">Call</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('method', 'other')}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors',
                      method === 'other'
                        ? 'border-hublot-900 bg-hublot-50'
                        : 'border-charcoal-200 hover:border-charcoal-300'
                    )}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-sm">Other</span>
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes *</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Summary of the follow-up conversation..."
                  rows={4}
                  className="resize-none"
                />
                {errors.notes && (
                  <p className="text-sm text-red-500">{errors.notes.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  Log Follow-Up
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>

        {activeTab === 'email' && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
