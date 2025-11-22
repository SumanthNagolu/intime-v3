/**
 * Peer Reviews List Component
 * Story: ACAD-026
 *
 * Displays peer reviews for a capstone submission
 */

'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, ThumbsDown, User, Calendar } from 'lucide-react';
import type { PeerReviewWithReviewer } from '@/types/capstone';

interface PeerReviewsListProps {
  reviews: PeerReviewWithReviewer[];
}

export function PeerReviewsList({ reviews }: PeerReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <User className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>No peer reviews yet</p>
      </div>
    );
  }

  // Calculate average rating
  const avgRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  // Get rating color
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          <span className="text-lg font-semibold">{avgRating.toFixed(1)}</span>
          <span className="text-gray-600">average rating</span>
        </div>
        <Badge variant="secondary">{reviews.length} reviews</Badge>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{review.reviewerName}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-3 w-3" />
                    {new Date(review.reviewedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <div>
                <p className="text-gray-900">{review.comments}</p>
              </div>

              {/* Strengths */}
              {review.strengths && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Strengths</p>
                      <p className="text-sm text-green-800">{review.strengths}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Improvements */}
              {review.improvements && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ThumbsDown className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">
                        Areas for Improvement
                      </p>
                      <p className="text-sm text-orange-800">{review.improvements}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Helpfulness (if tracking) */}
            {review.helpfulCount !== undefined && review.helpfulCount > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-gray-600">
                  {review.helpfulCount} people found this review helpful
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
