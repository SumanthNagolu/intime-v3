/**
 * Enroll Button Component
 * Story: ACAD-024 + ACAD-028
 *
 * Handles course enrollment flow (free & paid via Stripe)
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronRight, Loader2, AlertCircle, CheckCircle2, CreditCard } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

interface EnrollButtonProps {
  courseId: string;
  courseName: string;
  priceMonthly: number | null;
  priceOneTime: number | null;
  stripePriceIdMonthly: string | null;
  stripePriceIdOneTime: string | null;
  canEnroll: boolean;
  missingPrerequisites: any[];
  fullWidth?: boolean;
}

export function EnrollButton({
  courseId,
  courseName,
  priceMonthly,
  priceOneTime,
  stripePriceIdMonthly,
  stripePriceIdOneTime,
  canEnroll,
  missingPrerequisites,
  fullWidth = false,
}: EnrollButtonProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [paymentType, setPaymentType] = useState<'subscription' | 'one_time'>(
    priceMonthly ? 'subscription' : 'one_time'
  );

  const enrollMutation = trpc.enrollment.enrollInCourse.useMutation({
    onSuccess: (data) => {
      toast.success('Successfully enrolled!', {
        description: `Welcome to \${courseName}. Let's start learning!`,
      });
      setIsDialogOpen(false);
      setIsEnrolling(false);

      // Redirect to dashboard
      router.push('/students/dashboard');
      router.refresh();
    },
    onError: (error) => {
      toast.error('Enrollment failed', {
        description: error.message,
      });
      setIsEnrolling(false);
    },
  });

  const checkoutMutation = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        toast.error('Checkout error', {
          description: 'Failed to generate checkout URL',
        });
        setIsEnrolling(false);
      }
    },
    onError: (error) => {
      toast.error('Checkout failed', {
        description: error.message,
      });
      setIsEnrolling(false);
    },
  });

  const isFree = !priceMonthly && !priceOneTime;
  const isPaid = priceMonthly || priceOneTime;

  const handleEnrollClick = () => {
    if (!canEnroll) {
      // Show prerequisites warning
      toast.error('Prerequisites not met', {
        description: 'Please complete prerequisite courses first.',
      });
      return;
    }

    // Show dialog for both free and paid courses
    setIsDialogOpen(true);
  };

  const handleConfirmEnrollment = async () => {
    setIsEnrolling(true);

    // For free courses, enroll directly
    if (isFree) {
      enrollMutation.mutate({
        courseId,
        paymentId: 'free-enrollment',
        paymentAmount: 0,
        paymentType: 'free',
      });
    } else {
      // For paid courses, redirect to Stripe checkout
      const priceId =
        paymentType === 'subscription' ? stripePriceIdMonthly : stripePriceIdOneTime;

      if (!priceId) {
        toast.error('Payment configuration error', {
          description: 'Stripe price ID not configured for this course.',
        });
        setIsEnrolling(false);
        return;
      }

      checkoutMutation.mutate({
        courseId,
        priceId,
        paymentType,
      });
    }
  };

  return (
    <>
      <Button
        size="lg"
        onClick={handleEnrollClick}
        disabled={!canEnroll}
        className={fullWidth ? 'w-full' : ''}
      >
        {!canEnroll ? (
          <>
            <AlertCircle className="h-5 w-5 mr-2" />
            Prerequisites Required
          </>
        ) : isFree ? (
          <>
            Enroll for Free
            <ChevronRight className="h-5 w-5 ml-2" />
          </>
        ) : (
          <>
            Enroll Now
            <ChevronRight className="h-5 w-5 ml-2" />
          </>
        )}
      </Button>

      {/* Enrollment Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isFree ? 'Confirm Enrollment' : 'Payment Required'}
            </DialogTitle>
            <DialogDescription>
              {isFree
                ? `You're about to enroll in \${courseName}. This course is completely free!`
                : `To enroll in \${courseName}, payment is required.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Course Info */}
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="font-semibold text-gray-900 mb-2">{courseName}</p>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-700">
                  {isFree
                    ? 'Free enrollment'
                    : paymentType === 'subscription'
                    ? `\$\${priceMonthly}/month subscription`
                    : `\$\${priceOneTime} one-time payment`}
                </span>
              </div>
            </div>

            {/* Payment Type Selection (if both options available) */}
            {isPaid && priceMonthly && priceOneTime && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Choose Payment Option</Label>
                <RadioGroup
                  value={paymentType}
                  onValueChange={(value: 'subscription' | 'one_time') => setPaymentType(value)}
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="subscription" id="subscription" />
                    <Label
                      htmlFor="subscription"
                      className="flex-1 cursor-pointer font-normal"
                    >
                      <div className="flex items-center justify-between">
                        <span>Monthly Subscription</span>
                        <span className="font-semibold">\${priceMonthly}/mo</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Cancel anytime. Best for ongoing learning.
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="one_time" id="one_time" />
                    <Label htmlFor="one_time" className="flex-1 cursor-pointer font-normal">
                      <div className="flex items-center justify-between">
                        <span>One-Time Payment</span>
                        <span className="font-semibold">\${priceOneTime}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Lifetime access. Pay once, learn forever.
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Secure Payment Notice */}
            {isPaid && (
              <Alert>
                <CreditCard className="h-4 w-4" />
                <AlertDescription>
                  Secure payment powered by Stripe. Your payment information is encrypted and
                  never stored on our servers.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isEnrolling}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmEnrollment} disabled={isEnrolling}>
              {isEnrolling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isFree ? 'Enrolling...' : 'Redirecting to checkout...'}
                </>
              ) : (
                <>
                  {isFree ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Confirm Enrollment
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Proceed to Checkout
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
