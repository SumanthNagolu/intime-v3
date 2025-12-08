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

export default function DesktopPage() {
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
    await Promise.all([
      utils.dashboard.getTodaysPriorities.invalidate(),
      utils.dashboard.getPipelineHealth.invalidate(),
      utils.activities.getMyActivities.invalidate(),
      utils.crm.accounts.list.invalidate(),
      utils.crm.accounts.getHealth.invalidate(),
      utils.ats.jobs.list.invalidate(),
      utils.ats.submissions.list.invalidate(),
    ])
    setIsRefreshing(false)
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

        {/* Summary Cards */}
        <MySummary
          onMetricClick={handleMetricClick}
          activeMetric={activeMetric}
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
            />
          </TabsContent>

          <TabsContent value="accounts" className="mt-4">
            <MyAccountsTable />
          </TabsContent>

          <TabsContent value="jobs" className="mt-4">
            <MyJobsTable />
          </TabsContent>

          <TabsContent value="submissions" className="mt-4">
            <MySubmissionsTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
