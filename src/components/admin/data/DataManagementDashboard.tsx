'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Upload,
  Download,
  Archive,
  Users,
  ShieldCheck,
  Copy,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import { ImportWizard } from './ImportWizard'
import { ExportBuilder } from './ExportBuilder'
import { DuplicatesManager } from './DuplicatesManager'
import { GdprRequestsList } from './GdprRequestsList'
import { ArchiveManager } from './ArchiveManager'
import { BulkOperationsDialog } from './BulkOperationsDialog'
import { formatDistanceToNow } from 'date-fns'

export function DataManagementDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showImportWizard, setShowImportWizard] = useState(false)
  const [showExportBuilder, setShowExportBuilder] = useState(false)
  const [showBulkOps, setShowBulkOps] = useState(false)

  const { data: stats, isLoading: statsLoading } = trpc.data.getDashboardStats.useQuery()
  const { data: recentImports } = trpc.data.listImportJobs.useQuery({ limit: 5 })
  const { data: recentExports } = trpc.data.listExportJobs.useQuery({ limit: 5 })

  const statsCards = [
    {
      title: 'Total Imports',
      value: stats?.totalImports || 0,
      icon: Upload,
      description: 'Data import operations',
    },
    {
      title: 'Total Exports',
      value: stats?.totalExports || 0,
      icon: Download,
      description: 'Data export operations',
    },
    {
      title: 'Pending Duplicates',
      value: stats?.pendingDuplicates || 0,
      icon: Copy,
      description: 'Awaiting review',
    },
    {
      title: 'GDPR Requests',
      value: stats?.pendingGdpr || 0,
      icon: ShieldCheck,
      description: 'Pending processing',
    },
    {
      title: 'Archived Records',
      value: stats?.archivedRecords || 0,
      icon: Archive,
      description: 'Available for restore',
    },
  ]

  return (
    <DashboardShell
      title="Data Management"
      description="Import, export, and manage your data"
      breadcrumbs={[
        { label: 'Admin', href: '/employee/admin' },
        { label: 'Data Management' },
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowExportBuilder(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowImportWizard(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-charcoal-100">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="duplicates">Duplicates</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR</TabsTrigger>
          <TabsTrigger value="archive">Archive</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {statsCards.map((stat) => (
              <Card key={stat.title} className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-charcoal-600">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-charcoal-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-charcoal-900">
                    {statsLoading ? '...' : stat.value.toLocaleString()}
                  </div>
                  <p className="text-xs text-charcoal-500 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common data management tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-24 flex-col"
                onClick={() => setShowImportWizard(true)}
              >
                <Upload className="h-6 w-6 mb-2" />
                Import Data
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col"
                onClick={() => setShowExportBuilder(true)}
              >
                <Download className="h-6 w-6 mb-2" />
                Export Data
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col"
                onClick={() => setActiveTab('duplicates')}
              >
                <Copy className="h-6 w-6 mb-2" />
                Review Duplicates
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col"
                onClick={() => setShowBulkOps(true)}
              >
                <Users className="h-6 w-6 mb-2" />
                Bulk Operations
              </Button>
            </CardContent>
          </Card>

          {/* Recent Operations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Imports */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Recent Imports</CardTitle>
                <CardDescription>Latest data import operations</CardDescription>
              </CardHeader>
              <CardContent>
                {recentImports?.jobs && recentImports.jobs.length > 0 ? (
                  <div className="space-y-3">
                    {recentImports.jobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <StatusIcon status={job.status} />
                          <div>
                            <p className="font-medium text-charcoal-900">
                              {job.file_name}
                            </p>
                            <p className="text-sm text-charcoal-500">
                              {job.entity_type} &bull; {job.success_rows || 0} records
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-charcoal-400">
                          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-charcoal-500 py-8">
                    No imports yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Exports */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Recent Exports</CardTitle>
                <CardDescription>Latest data export operations</CardDescription>
              </CardHeader>
              <CardContent>
                {recentExports?.jobs && recentExports.jobs.length > 0 ? (
                  <div className="space-y-3">
                    {recentExports.jobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <StatusIcon status={job.status} />
                          <div>
                            <p className="font-medium text-charcoal-900">
                              {job.export_name || `${job.entity_type} export`}
                            </p>
                            <p className="text-sm text-charcoal-500">
                              {job.entity_type} &bull; {job.record_count || 0} records &bull; {job.format.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-charcoal-400">
                          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-charcoal-500 py-8">
                    No exports yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="duplicates">
          <DuplicatesManager />
        </TabsContent>

        <TabsContent value="gdpr">
          <GdprRequestsList />
        </TabsContent>

        <TabsContent value="archive">
          <ArchiveManager />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ImportWizard open={showImportWizard} onClose={() => setShowImportWizard(false)} />
      <ExportBuilder open={showExportBuilder} onClose={() => setShowExportBuilder(false)} />
      <BulkOperationsDialog open={showBulkOps} onOpenChange={setShowBulkOps} operationType="update" />
    </DashboardShell>
  )
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-600" />
    case 'failed':
      return <XCircle className="h-5 w-5 text-red-600" />
    case 'processing':
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-600" />
    default:
      return <AlertTriangle className="h-5 w-5 text-charcoal-400" />
  }
}
