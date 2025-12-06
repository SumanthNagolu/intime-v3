'use client'

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'

// =============================================================================
// Types
// =============================================================================

interface FeatureFlagResult {
  enabled: boolean
  isLoading: boolean
  reason?: string
  showBetaBadge?: boolean
  showNewBadge?: boolean
  showFeedbackPrompt?: boolean
}

interface FeatureFlagContextValue {
  checkFlag: (key: string) => FeatureFlagResult
  isEnabled: (key: string) => boolean
  showFeedback: (flagId: string) => void
}

// =============================================================================
// Context
// =============================================================================

const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null)

// =============================================================================
// Provider Component
// =============================================================================

interface FeatureFlagProviderProps {
  children: ReactNode
  preloadKeys?: string[]
}

export function FeatureFlagProvider({ children, preloadKeys = [] }: FeatureFlagProviderProps) {
  const [feedbackFlagId, setFeedbackFlagId] = useState<string | null>(null)
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState('')

  const utils = trpc.useUtils()

  const feedbackMutation = trpc.featureFlags.submitFeedback.useMutation({
    onSuccess: () => {
      setFeedbackFlagId(null)
      setFeedbackRating(0)
      setFeedbackText('')
    },
  })

  const showFeedback = useCallback((flagId: string) => {
    setFeedbackFlagId(flagId)
  }, [])

  const submitFeedback = () => {
    if (feedbackFlagId && feedbackRating > 0) {
      feedbackMutation.mutate({
        flagId: feedbackFlagId,
        rating: feedbackRating,
        feedbackText: feedbackText || undefined,
      })
    }
  }

  const value: FeatureFlagContextValue = {
    checkFlag: () => ({ enabled: false, isLoading: true }),
    isEnabled: () => false,
    showFeedback,
  }

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}

      {/* Feedback Dialog */}
      <Dialog open={!!feedbackFlagId} onOpenChange={() => setFeedbackFlagId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>How do you like this feature?</DialogTitle>
            <DialogDescription>
              Your feedback helps us improve.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFeedbackRating(rating)}
                  className="p-2"
                >
                  <Star
                    className={`w-8 h-8 ${
                      rating <= feedbackRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-charcoal-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <Label htmlFor="feedback">Comments (optional)</Label>
            <Textarea
              id="feedback"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tell us what you think..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackFlagId(null)}>
              Skip
            </Button>
            <Button
              onClick={submitFeedback}
              disabled={feedbackRating === 0 || feedbackMutation.isPending}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FeatureFlagContext.Provider>
  )
}

// =============================================================================
// Main Hook
// =============================================================================

interface UseFeatureFlagOptions {
  logUsage?: boolean
  showFeedbackOnFirstUse?: boolean
}

/**
 * Hook to check if a feature flag is enabled for the current user.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isEnabled, showBetaBadge } = useFeatureFlag('ai_twin_system')
 *
 *   if (!isEnabled) {
 *     return null // or fallback UI
 *   }
 *
 *   return (
 *     <div>
 *       {showBetaBadge && <Badge>Beta</Badge>}
 *       <AITwinFeature />
 *     </div>
 *   )
 * }
 * ```
 */
export function useFeatureFlag(
  featureKey: string,
  options: UseFeatureFlagOptions = {}
): FeatureFlagResult & { refetch: () => void } {
  const { logUsage = true, showFeedbackOnFirstUse = true } = options
  const [hasShownFeedback, setHasShownFeedback] = useState(false)

  const context = useContext(FeatureFlagContext)

  const query = trpc.featureFlags.isEnabled.useQuery(
    { key: featureKey, logUsage },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  )

  // Show feedback prompt on first successful check if enabled
  useEffect(() => {
    if (
      query.data?.enabled &&
      query.data?.showFeedbackPrompt &&
      showFeedbackOnFirstUse &&
      !hasShownFeedback &&
      context
    ) {
      // Check localStorage to see if we've already shown feedback
      const storageKey = `feature_feedback_shown_${featureKey}`
      const hasShown = localStorage.getItem(storageKey)

      if (!hasShown) {
        // Delay slightly so user sees the feature first
        const timer = setTimeout(() => {
          // Get the flag ID to submit feedback
          // For now we'll skip this since we'd need another query
          // context.showFeedback(flagId)
          localStorage.setItem(storageKey, 'true')
          setHasShownFeedback(true)
        }, 30000) // 30 seconds after first use

        return () => clearTimeout(timer)
      }
    }
  }, [query.data, featureKey, showFeedbackOnFirstUse, hasShownFeedback, context])

  return {
    enabled: query.data?.enabled ?? false,
    isLoading: query.isLoading,
    reason: query.data?.reason,
    showBetaBadge: query.data?.showBetaBadge,
    showNewBadge: query.data?.showNewBadge,
    showFeedbackPrompt: query.data?.showFeedbackPrompt,
    refetch: query.refetch,
  }
}

// =============================================================================
// Utility Hook: Check Multiple Flags
// =============================================================================

/**
 * Hook to check multiple feature flags at once.
 *
 * @example
 * ```tsx
 * function FeatureGatedNavigation() {
 *   const flags = useFeatureFlags(['ai_twin', 'advanced_analytics', 'bulk_email'])
 *
 *   return (
 *     <nav>
 *       {flags.ai_twin?.enabled && <NavItem href="/ai-twin">AI Twin</NavItem>}
 *       {flags.advanced_analytics?.enabled && <NavItem href="/analytics">Analytics</NavItem>}
 *       {flags.bulk_email?.enabled && <NavItem href="/email">Bulk Email</NavItem>}
 *     </nav>
 *   )
 * }
 * ```
 */
export function useFeatureFlags(keys: string[]): Record<string, FeatureFlagResult> {
  const results: Record<string, FeatureFlagResult> = {}

  // Note: This creates multiple queries. For better performance,
  // consider adding a batch endpoint to the tRPC router.
  for (const key of keys) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const result = useFeatureFlag(key, { logUsage: false })
    results[key] = result
  }

  return results
}

// =============================================================================
// Utility Hook: Feature Gate Component
// =============================================================================

interface FeatureGateProps {
  feature: string
  children: ReactNode
  fallback?: ReactNode
  showLoading?: boolean
}

/**
 * Component that conditionally renders children based on feature flag.
 *
 * @example
 * ```tsx
 * <FeatureGate feature="ai_twin_system" fallback={<UpgradeBanner />}>
 *   <AITwinDashboard />
 * </FeatureGate>
 * ```
 */
export function FeatureGate({
  feature,
  children,
  fallback = null,
  showLoading = false,
}: FeatureGateProps) {
  const { enabled, isLoading } = useFeatureFlag(feature)

  if (isLoading && showLoading) {
    return (
      <div className="animate-pulse bg-charcoal-100 rounded h-20" />
    )
  }

  if (isLoading) {
    return null
  }

  return enabled ? <>{children}</> : <>{fallback}</>
}

// =============================================================================
// Export Context Hook
// =============================================================================

export function useFeatureFlagContext() {
  const context = useContext(FeatureFlagContext)
  if (!context) {
    throw new Error('useFeatureFlagContext must be used within FeatureFlagProvider')
  }
  return context
}
