'use client'

/**
 * Ashby Home Page
 *
 * Dashboard overview with key metrics and quick actions.
 */

import Link from 'next/link'
import {
  Briefcase,
  Building2,
  Calendar,
  ChevronRight,
  Clock,
  Plus,
  Target,
  TrendingUp,
  User,
  Users,
} from 'lucide-react'

// ============================================
// Stat Card Component
// ============================================

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  href,
}: {
  title: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  href: string
}) {
  return (
    <Link
      href={href}
      className="ashby-card hover:shadow-[var(--ashby-shadow-md)] transition-shadow"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--ashby-bg-secondary)] flex items-center justify-center">
            <Icon className="w-5 h-5 text-[var(--ashby-text-secondary)]" />
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--ashby-text-muted)]" />
        </div>
        <div className="text-2xl font-semibold text-[var(--ashby-text-primary)] mb-1">
          {value}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--ashby-text-secondary)]">{title}</span>
          {change && (
            <span
              className={`text-xs font-medium ${
                changeType === 'up'
                  ? 'text-[var(--ashby-success)]'
                  : changeType === 'down'
                  ? 'text-[var(--ashby-error)]'
                  : 'text-[var(--ashby-text-muted)]'
              }`}
            >
              {change}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// ============================================
// Activity Item Component
// ============================================

function ActivityItem({
  title,
  description,
  time,
  type,
}: {
  title: string
  description: string
  time: string
  type: 'job' | 'candidate' | 'interview' | 'deal'
}) {
  const icons = {
    job: Briefcase,
    candidate: User,
    interview: Calendar,
    deal: Target,
  }
  const Icon = icons[type]

  return (
    <div className="flex items-start gap-3 py-3 border-b border-[var(--ashby-border-subtle)] last:border-0">
      <div className="w-8 h-8 rounded-full bg-[var(--ashby-bg-secondary)] flex items-center justify-center">
        <Icon className="w-4 h-4 text-[var(--ashby-text-muted)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--ashby-text-primary)] truncate">
          {title}
        </p>
        <p className="text-sm text-[var(--ashby-text-secondary)] truncate">
          {description}
        </p>
      </div>
      <span className="text-xs text-[var(--ashby-text-muted)] whitespace-nowrap">
        {time}
      </span>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export default function HomePage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--ashby-text-primary)] mb-1">
          Good morning!
        </h1>
        <p className="text-[var(--ashby-text-secondary)]">
          Here's what's happening with your recruiting pipeline today.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/a/jobs/new" className="ashby-btn ashby-btn-primary">
          <Plus className="w-4 h-4" />
          New Job
        </Link>
        <Link href="/a/candidates/new" className="ashby-btn ashby-btn-secondary">
          <Plus className="w-4 h-4" />
          Add Candidate
        </Link>
        <Link href="/a/leads/new" className="ashby-btn ashby-btn-secondary">
          <Plus className="w-4 h-4" />
          Add Lead
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Open Jobs"
          value={24}
          change="+3 this week"
          changeType="up"
          icon={Briefcase}
          href="/a/jobs"
        />
        <StatCard
          title="Active Candidates"
          value={156}
          change="+12 this week"
          changeType="up"
          icon={User}
          href="/a/candidates"
        />
        <StatCard
          title="Interviews Today"
          value={8}
          icon={Calendar}
          href="/a/interviews"
        />
        <StatCard
          title="Pipeline Value"
          value="$1.2M"
          change="+8%"
          changeType="up"
          icon={TrendingUp}
          href="/a/deals"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="ashby-card">
          <div className="ashby-card-header">
            <h2 className="ashby-card-title">Recent Activity</h2>
            <Link
              href="/a/activity"
              className="text-sm text-[var(--ashby-accent)] hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="px-5 py-2">
            <ActivityItem
              title="Interview scheduled"
              description="John Smith for Senior Developer at Acme Corp"
              time="2h ago"
              type="interview"
            />
            <ActivityItem
              title="New candidate applied"
              description="Sarah Johnson applied for Product Manager"
              time="3h ago"
              type="candidate"
            />
            <ActivityItem
              title="Job published"
              description="DevOps Engineer at TechStart Inc"
              time="5h ago"
              type="job"
            />
            <ActivityItem
              title="Deal moved to negotiation"
              description="Enterprise contract with GlobalCorp"
              time="1d ago"
              type="deal"
            />
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="ashby-card">
          <div className="ashby-card-header">
            <h2 className="ashby-card-title">Today's Interviews</h2>
            <Link
              href="/a/interviews"
              className="text-sm text-[var(--ashby-accent)] hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="px-5 py-2">
            <div className="flex items-center gap-3 py-3 border-b border-[var(--ashby-border-subtle)]">
              <div className="w-10 h-10 rounded-full bg-[var(--ashby-bg-tertiary)] flex items-center justify-center text-sm font-medium">
                JS
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--ashby-text-primary)]">
                  John Smith
                </p>
                <p className="text-xs text-[var(--ashby-text-secondary)]">
                  Senior Developer • Acme Corp
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[var(--ashby-text-primary)]">
                  10:00 AM
                </p>
                <p className="text-xs text-[var(--ashby-text-muted)]">
                  Technical
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3 border-b border-[var(--ashby-border-subtle)]">
              <div className="w-10 h-10 rounded-full bg-[var(--ashby-bg-tertiary)] flex items-center justify-center text-sm font-medium">
                EW
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--ashby-text-primary)]">
                  Emily Wilson
                </p>
                <p className="text-xs text-[var(--ashby-text-secondary)]">
                  Product Manager • TechStart
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[var(--ashby-text-primary)]">
                  2:00 PM
                </p>
                <p className="text-xs text-[var(--ashby-text-muted)]">
                  Final Round
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3">
              <div className="w-10 h-10 rounded-full bg-[var(--ashby-bg-tertiary)] flex items-center justify-center text-sm font-medium">
                MK
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--ashby-text-primary)]">
                  Michael Kim
                </p>
                <p className="text-xs text-[var(--ashby-text-secondary)]">
                  DevOps Engineer • CloudSoft
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[var(--ashby-text-primary)]">
                  4:30 PM
                </p>
                <p className="text-xs text-[var(--ashby-text-muted)]">
                  Screening
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
