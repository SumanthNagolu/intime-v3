'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Trophy, DollarSign, TrendingUp, Sparkles, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface PlacementCelebrationProps {
  show: boolean
  candidateName: string
  accountName: string
  jobTitle: string
  monthlyRevenue: number
  monthlyCommission: number
  totalCommission: number
  durationMonths: number
  startDate: string
  onViewPlacement: () => void
  onClose: () => void
}

export function PlacementCelebration({
  show,
  candidateName,
  accountName,
  jobTitle,
  monthlyRevenue,
  monthlyCommission,
  totalCommission,
  durationMonths,
  startDate,
  onViewPlacement,
  onClose,
}: PlacementCelebrationProps) {
  useEffect(() => {
    if (show) {
      // Fire confetti from both sides
      const duration = 3000
      const end = Date.now() + duration

      const frame = () => {
        // Left side confetti
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#B76E79', '#FFD700', '#000000', '#FFFFFF'],
        })
        // Right side confetti
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#B76E79', '#FFD700', '#000000', '#FFFFFF'],
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()

      // Final burst
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#B76E79', '#FFD700', '#000000'],
        })
      }, 500)
    }
  }, [show])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Trophy Icon with Animation */}
            <div className="relative inline-flex mb-6">
              <div className="absolute inset-0 animate-ping rounded-full bg-gold-200 opacity-75" />
              <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg">
                <Trophy className="w-10 h-10 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-heading font-bold text-charcoal-900 mb-2 tracking-wide uppercase">
              Placement Confirmed!
            </h2>
            <p className="text-charcoal-600 mb-6">
              Congratulations! You just made a placement!
            </p>

            {/* Placement Details */}
            <div className="bg-charcoal-50 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-gold-500" />
                <span className="font-medium text-charcoal-900">{candidateName}</span>
              </div>
              <p className="text-sm text-charcoal-600 mb-1">
                {jobTitle} at <span className="font-medium">{accountName}</span>
              </p>
              <div className="flex items-center gap-1 text-xs text-charcoal-500">
                <Calendar className="w-3 h-3" />
                <span>Starts: {startDate}</span>
              </div>
            </div>

            {/* Commission Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="py-3 px-4">
                  <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-green-600 font-medium">Monthly Revenue</p>
                  <p className="text-lg font-bold text-green-800">
                    {formatCurrency(monthlyRevenue)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gold-50 border-gold-200">
                <CardContent className="py-3 px-4">
                  <TrendingUp className="w-5 h-5 text-gold-600 mx-auto mb-1" />
                  <p className="text-xs text-gold-600 font-medium">Your Commission</p>
                  <p className="text-lg font-bold text-gold-800">
                    {formatCurrency(monthlyCommission)}/mo
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Total Commission Highlight */}
            <Card className="bg-gradient-to-br from-gold-100 to-gold-200 border-gold-300 mb-6">
              <CardContent className="py-4">
                <p className="text-sm text-gold-700 font-medium mb-1">
                  Estimated Total Commission ({durationMonths} months)
                </p>
                <p className="text-3xl font-bold text-gold-900">
                  {formatCurrency(totalCommission)}
                </p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Back to Pipeline
              </Button>
              <Button onClick={onViewPlacement} className="flex-1">
                <Sparkles className="w-4 h-4 mr-2" />
                View Placement
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
