'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MySummary,
  MyActivitiesTable,
  MyAccountsTable,
  MyJobsTable,
  MySubmissionsTable,
} from '@/components/workspace'
import {
  RefreshCw,
  Clock,
  Building2,
  Briefcase,
  Send,
  LayoutDashboard,
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'

type TabValue = 'activities' | 'accounts' | 'jobs' | 'submissions'

// Types for the consolidated data
export interface DesktopData {
  summary: {
    priorities: {
      counts: {
        overdue: number
        dueToday: number
        total: number
      }
    }
    pipeline: {
      activeJobs: number
      urgentJobs: number
      pendingSubmissions: number
      interviewsThisWeek: number
      outstandingOffers: number
      activePlacements: number
    }
  }
  tables: {
    activities: {
      items: ActivityItem[]
      total: number
    }
    accounts: {
      items: AccountItem[]
      total: number
    }
    jobs: {
      items: JobItem[]
      total: number
    }
    submissions: {
      items: SubmissionItem[]
      total: number
    }
  }
}

export interface ActivityItem {
  id: string
  subject: string | null
  description: string | null
  activityType: string
  status: string
  priority: string | null
  dueDate: string | null
  entityType: string
  entityId: string
  accountName: string | null
  contact: { id: string; name: string } | null
  isOverdue: boolean
  isDueToday: boolean
  createdAt: string
  completedAt: string | null
}

export interface AccountItem {
  id: string
  name: string
  industry: string | null
  status: string
  city: string | null
  state: string | null
  lastContactDate: string | null
  health?: {
    healthStatus: string
    healthScore: number
    activeJobs: number
  }
}

export interface JobItem {
  id: string
  title: string
  location: string | null
  job_type: string | null
  status: string
  createdAt: string
  account: { id: string; name: string } | null
  submissions_count: number
}

export interface SubmissionItem {
  id: string
  status: string
  submitted_at: string | null
  updated_at: string | null
  candidate: {
    id: string
    first_name: string
    last_name: string
    title: string | null
  } | null
  job: {
    id: string
    title: string
    company: { id: string; name: string } | null
  } | null
}

interface DesktopClientProps {
  initialData: DesktopData
}

export function DesktopClient({ initialData }: DesktopClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as TabValue) || 'activities'

  const [activeTab, setActiveTab] = useState<TabValue>(initialTab)
  const [activeMetric, setActiveMetric] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const utils = trpc.useUtils()

  const handleTabChange = (value: string) => {
    const tab = value as TabValue
    setActiveTab(tab)
    setActiveMetric(null)
    // Update URL without full navigation
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handleMetricClick = (metricType: string) => {
    setActiveMetric(metricType)

    // Map metric clicks to appropriate tab and filter
    switch (metricType) {
      case 'dueToday':
      case 'overdue':
        setActiveTab('activities')
        break
      case 'jobs':
        setActiveTab('jobs')
        break
      case 'submissions':
        setActiveTab('submissions')
        break
      case 'interviews':
        setActiveTab('submissions')
        break
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await utils.dashboard.getDesktopData.invalidate()
    setIsRefreshing(false)
    // Trigger a page refresh to get fresh server data
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="p-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-charcoal-500">
          <Link
            href="/employee/workspace/dashboard"
            className="hover:text-hublot-700 transition-colors"
          >
            My Work
          </Link>
          <span>/</span>
          <span className="text-charcoal-900 font-medium">Desktop</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-semibold text-charcoal-900">
              Desktop
            </h1>
            <p className="text-charcoal-500">
              Your personal workspace - Activities, Accounts, Jobs, and Submissions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/employee/workspace/dashboard">
              <Button variant="outline">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards - Pass data as props */}
        <MySummary
          onMetricClick={handleMetricClick}
          activeMetric={activeMetric}
          data={initialData.summary}
        />

        {/* Tabs with Tables */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger
              value="activities"
              className="data-[state=active]:bg-hublot-900 data-[state=active]:text-white"
            >
              <Clock className="w-4 h-4 mr-2" />
              Activities
            </TabsTrigger>
            <TabsTrigger
              value="accounts"
              className="data-[state=active]:bg-hublot-900 data-[state=active]:text-white"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Accounts
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="data-[state=active]:bg-hublot-900 data-[state=active]:text-white"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Jobs
            </TabsTrigger>
            <TabsTrigger
              value="submissions"
              className="data-[state=active]:bg-hublot-900 data-[state=active]:text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Submissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="mt-4">
            <MyActivitiesTable
              filterOverdue={activeMetric === 'overdue'}
              filterDueToday={activeMetric === 'dueToday'}
              data={initialData.tables.activities}
            />
          </TabsContent>

          <TabsContent value="accounts" className="mt-4">
            <MyAccountsTable data={initialData.tables.accounts} />
          </TabsContent>

          <TabsContent value="jobs" className="mt-4">
            <MyJobsTable data={initialData.tables.jobs} />
          </TabsContent>

          <TabsContent value="submissions" className="mt-4">
            <MySubmissionsTable data={initialData.tables.submissions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
