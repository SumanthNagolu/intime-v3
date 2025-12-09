'use client'

import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, Lock } from 'lucide-react'

export default function AchievementsPage() {
  const { data: achievements, isLoading } = trpc.academy.getRecentAchievements.useQuery()

  // Placeholder for locked achievements
  const lockedAchievements = [
    { id: 'l1', name: 'Speed Learner', description: 'Complete 5 courses in one month', badge_icon: '⚡' },
    { id: 'l2', name: 'Perfect Score', description: 'Get 100% on any quiz', badge_icon: '💯' },
    { id: 'l3', name: 'Night Owl', description: 'Study after midnight', badge_icon: '🦉' },
    { id: 'l4', name: 'Mentor', description: 'Help 10 other students', badge_icon: '🤝' },
    { id: 'l5', name: 'Polyglot', description: 'Complete courses in 3 different tracks', badge_icon: '🌍' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal-900">Achievements</h1>
        <p className="text-charcoal-500 mt-1">Track your badges and milestones</p>
      </div>

      {/* Earned Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold-500" />
            Earned
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : achievements && achievements.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {achievements.map((achievement: any) => (
                <div
                  key={achievement.id}
                  className="flex flex-col items-center p-4 bg-gold-50 rounded-lg border border-gold-200"
                >
                  <span className="text-4xl mb-2">{achievement.badge_icon}</span>
                  <span className="text-sm font-medium text-center text-charcoal-900">
                    {achievement.name}
                  </span>
                  <span className="text-xs text-charcoal-500 mt-1">
                    +{achievement.xp_reward} XP
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-charcoal-500 text-center py-8">
              No achievements earned yet. Keep learning!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Locked Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Lock className="w-5 h-5 text-charcoal-400" />
            Locked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {lockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex flex-col items-center p-4 bg-charcoal-50 rounded-lg border border-charcoal-200 opacity-60"
              >
                <span className="text-4xl mb-2 grayscale">{achievement.badge_icon}</span>
                <span className="text-sm font-medium text-center text-charcoal-700">
                  {achievement.name}
                </span>
                <span className="text-xs text-charcoal-500 mt-1 text-center">
                  {achievement.description}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
