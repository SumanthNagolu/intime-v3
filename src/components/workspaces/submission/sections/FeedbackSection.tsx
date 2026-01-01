'use client'

import { MessageSquare, ThumbsUp, ThumbsDown, Minus, Plus, Star } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { FullSubmission, SubmissionFeedback } from '@/types/submission'

interface FeedbackSectionProps {
  submission: FullSubmission
  onAddFeedback?: () => void
}

const RECOMMENDATION_CONFIG: Record<string, { label: string; color: string; icon: typeof ThumbsUp }> = {
  strong_yes: { label: 'Strong Yes', color: 'bg-green-100 text-green-700', icon: ThumbsUp },
  yes: { label: 'Yes', color: 'bg-green-50 text-green-600', icon: ThumbsUp },
  maybe: { label: 'Maybe', color: 'bg-amber-100 text-amber-700', icon: Minus },
  no: { label: 'No', color: 'bg-red-50 text-red-600', icon: ThumbsDown },
  strong_no: { label: 'Strong No', color: 'bg-red-100 text-red-700', icon: ThumbsDown },
}

export function FeedbackSection({ submission, onAddFeedback }: FeedbackSectionProps) {
  const feedbackItems = submission.sections?.feedback?.items || []

  // Also include client_feedback from main submission if exists
  const hasClientFeedback = !!submission.client_feedback

  if (feedbackItems.length === 0 && !hasClientFeedback) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-charcoal-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-charcoal-900 mb-2">No Feedback Yet</h3>
            <p className="text-charcoal-500 mb-6">
              Add feedback to track client and internal responses.
            </p>
            <Button onClick={onAddFeedback}>
              <Plus className="h-4 w-4 mr-2" />
              Add Feedback
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with action */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-charcoal-900">
          Feedback ({feedbackItems.length + (hasClientFeedback ? 1 : 0)})
        </h2>
        <Button variant="outline" size="sm" onClick={onAddFeedback}>
          <Plus className="h-4 w-4 mr-2" />
          Add Feedback
        </Button>
      </div>

      {/* Client Feedback Card (if exists) */}
      {hasClientFeedback && (
        <Card className="border-gold-200 bg-gold-50/30">
          <CardContent className="py-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
                <Star className="h-5 w-5 text-gold-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-charcoal-900">Client Feedback</span>
                  <span className="text-xs text-charcoal-500">
                    {submission.submitted_to_client_at
                      ? new Date(submission.submitted_to_client_at).toLocaleDateString()
                      : ''}
                  </span>
                </div>
                <p className="text-charcoal-700">{submission.client_feedback}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Items */}
      <div className="space-y-4">
        {feedbackItems.map((item) => (
          <FeedbackCard key={item.id} feedback={item} />
        ))}
      </div>
    </div>
  )
}

function FeedbackCard({ feedback }: { feedback: SubmissionFeedback }) {
  const recommendation = feedback.recommendation || 'maybe'
  const recConfig = RECOMMENDATION_CONFIG[recommendation] || RECOMMENDATION_CONFIG.maybe
  const RecIcon = recConfig.icon

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={feedback.createdBy?.avatar_url || undefined} />
            <AvatarFallback className="bg-charcoal-100 text-charcoal-600">
              {feedback.createdBy?.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-medium text-charcoal-900">
                {feedback.createdBy?.full_name || 'Unknown'}
              </span>
              <span className="text-xs text-charcoal-500">
                {new Date(feedback.created_at).toLocaleDateString()}
              </span>
              {feedback.feedback_type && (
                <span className="text-xs text-charcoal-400 uppercase">
                  {feedback.feedback_type.replace(/_/g, ' ')}
                </span>
              )}
            </div>

            {/* Rating */}
            {feedback.rating !== undefined && feedback.rating !== null && (
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={cn(
                      'text-lg',
                      star <= (feedback.rating || 0) ? 'text-amber-400' : 'text-charcoal-200'
                    )}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}

            {/* Recommendation Badge */}
            {feedback.recommendation && (
              <div className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-2',
                recConfig.color
              )}>
                <RecIcon className="h-3.5 w-3.5" />
                {recConfig.label}
              </div>
            )}

            {/* Comments */}
            {feedback.comments && (
              <p className="text-charcoal-700 mt-2">{feedback.comments}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
