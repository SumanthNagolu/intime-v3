'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Building2,
  Palette,
  Globe,
  MapPin,
  Phone,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  Copy,
  Settings,
  Users,
  HardDrive,
  Crown,
  Briefcase,
  ShieldCheck,
  Plug,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Setup items with weights for scoring
interface SetupItem {
  id: string
  label: string
  description: string
  category: 'required' | 'recommended' | 'optional'
  weight: number
  isComplete: (org: OrganizationType) => boolean
  href: string
  icon: React.ElementType
}

interface OrganizationType {
  id?: string
  name?: string
  legal_name?: string | null
  slug?: string
  industry?: string | null
  company_size?: string | null
  founded_year?: number | null
  website?: string | null
  email?: string | null
  phone?: string | null
  address_line1?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  timezone?: string | null
  logo_url?: string | null
  primary_color?: string | null
  subscription_tier?: string
  subscription_status?: string
  max_users?: number
  max_candidates?: number
  max_storage_gb?: number
}

const SETUP_ITEMS: SetupItem[] = [
  {
    id: 'name',
    label: 'Company Name',
    description: 'Set your organization name',
    category: 'required',
    weight: 15,
    isComplete: (o) => !!o.name && o.name !== 'My Organization',
    href: '/employee/admin/settings/organization',
    icon: Building2,
  },
  {
    id: 'address',
    label: 'Business Address',
    description: 'Add your headquarters location',
    category: 'required',
    weight: 12,
    isComplete: (o) => !!o.address_line1 && !!o.city && !!o.state,
    href: '/employee/admin/settings/organization',
    icon: MapPin,
  },
  {
    id: 'contact',
    label: 'Contact Information',
    description: 'Add phone and email',
    category: 'required',
    weight: 10,
    isComplete: (o) => !!o.email || !!o.phone,
    href: '/employee/admin/settings/organization',
    icon: Phone,
  },
  {
    id: 'timezone',
    label: 'Timezone',
    description: 'Set your business timezone',
    category: 'required',
    weight: 8,
    isComplete: (o) => !!o.timezone,
    href: '/employee/admin/settings/localization',
    icon: Globe,
  },
  {
    id: 'logo',
    label: 'Company Logo',
    description: 'Upload your brand logo',
    category: 'recommended',
    weight: 10,
    isComplete: (o) => !!o.logo_url,
    href: '/employee/admin/settings/branding',
    icon: Palette,
  },
  {
    id: 'branding',
    label: 'Brand Colors',
    description: 'Customize your theme colors',
    category: 'recommended',
    weight: 8,
    isComplete: (o) => !!o.primary_color && o.primary_color !== '#000000',
    href: '/employee/admin/settings/branding',
    icon: Palette,
  },
  {
    id: 'industry',
    label: 'Industry',
    description: 'Select your industry',
    category: 'recommended',
    weight: 6,
    isComplete: (o) => !!o.industry,
    href: '/employee/admin/settings/organization',
    icon: Building2,
  },
  {
    id: 'company_size',
    label: 'Company Size',
    description: 'Set employee count range',
    category: 'optional',
    weight: 4,
    isComplete: (o) => !!o.company_size,
    href: '/employee/admin/settings/organization',
    icon: Users,
  },
  {
    id: 'website',
    label: 'Website',
    description: 'Add your company website',
    category: 'optional',
    weight: 4,
    isComplete: (o) => !!o.website,
    href: '/employee/admin/settings/organization',
    icon: ExternalLink,
  },
]

function calculateSetupScore(org: OrganizationType | null | undefined): {
  score: number
  completed: SetupItem[]
  incomplete: SetupItem[]
} {
  if (!org) return { score: 0, completed: [], incomplete: SETUP_ITEMS }

  const completed = SETUP_ITEMS.filter((item) => item.isComplete(org))
  const incomplete = SETUP_ITEMS.filter((item) => !item.isComplete(org))

  const maxScore = SETUP_ITEMS.reduce((sum, item) => sum + item.weight, 0)
  const currentScore = completed.reduce((sum, item) => sum + item.weight, 0)

  return {
    score: Math.round((currentScore / maxScore) * 100),
    completed,
    incomplete,
  }
}

// Settings category cards - matches navigation structure
const SETTINGS_CATEGORIES = [
  // Company
  {
    id: 'profile',
    label: 'Company Profile',
    description: 'Name, contact, addresses',
    icon: Building2,
    href: '/employee/admin/settings/organization',
    color: 'from-blue-500 to-blue-600',
    checkFields: ['name', 'address', 'contact'],
  },
  {
    id: 'branding',
    label: 'Branding',
    description: 'Logo, colors, theme',
    icon: Palette,
    href: '/employee/admin/settings/branding',
    color: 'from-purple-500 to-purple-600',
    checkFields: ['logo', 'branding'],
  },
  {
    id: 'regional',
    label: 'Regional',
    description: 'Timezone, locale, formats',
    icon: Globe,
    href: '/employee/admin/settings/localization',
    color: 'from-green-500 to-green-600',
    checkFields: ['timezone'],
  },
  // Operations
  {
    id: 'business',
    label: 'Business Rules',
    description: 'Workflows, policies',
    icon: Briefcase,
    href: '/employee/admin/settings/business',
    color: 'from-amber-500 to-amber-600',
    checkFields: [],
  },
  {
    id: 'compliance',
    label: 'Compliance',
    description: 'Legal, regulations',
    icon: ShieldCheck,
    href: '/employee/admin/settings/compliance',
    color: 'from-teal-500 to-teal-600',
    checkFields: [],
  },
  // Integrations & Security
  {
    id: 'integrations',
    label: 'Integrations',
    description: 'Email, API, storage',
    icon: Plug,
    href: '/employee/admin/settings/email',
    color: 'from-indigo-500 to-indigo-600',
    checkFields: [],
  },
]

function SettingsCategoryCard({
  category,
  setupProgress,
}: {
  category: (typeof SETTINGS_CATEGORIES)[number]
  setupProgress: { completed: SetupItem[]; incomplete: SetupItem[] }
}) {
  const Icon = category.icon
  const completedInCategory = category.checkFields.filter((fieldId) =>
    setupProgress.completed.some((item) => item.id === fieldId)
  )
  const pendingInCategory = category.checkFields.filter((fieldId) =>
    setupProgress.incomplete.some((item) => item.id === fieldId)
  )

  const isComplete = category.checkFields.length === 0 || pendingInCategory.length === 0
  const hasPending = pendingInCategory.length > 0

  return (
    <Link href={category.href} className="group block">
      <div className="relative overflow-hidden rounded-xl border border-charcoal-100 bg-white p-5 transition-all duration-300 hover:shadow-elevation-md hover:-translate-y-1 hover:border-gold-200">
        {/* Background gradient on hover */}
        <div
          className={cn(
            'absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-5 bg-gradient-to-br',
            category.color
          )}
        />

        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br text-white',
                category.color
              )}
            >
              <Icon className="h-5 w-5" />
            </div>

            {isComplete && category.checkFields.length > 0 && (
              <CheckCircle2 className="h-5 w-5 text-success-500" />
            )}
            {hasPending && (
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                {pendingInCategory.length} pending
              </Badge>
            )}
          </div>

          <h3 className="font-heading font-semibold text-charcoal-900 mb-1 group-hover:text-gold-600 transition-colors">
            {category.label}
          </h3>
          <p className="text-sm text-charcoal-500">{category.description}</p>

          <div className="mt-3 flex items-center text-sm text-charcoal-400 group-hover:text-gold-500 transition-colors">
            <span>Configure</span>
            <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  )
}

function SetupProgressCard({
  score,
  completed,
  incomplete,
}: {
  score: number
  completed: SetupItem[]
  incomplete: SetupItem[]
}) {
  const requiredIncomplete = incomplete.filter((i) => i.category === 'required')
  const recommendedIncomplete = incomplete.filter((i) => i.category === 'recommended')

  return (
    <div className="rounded-xl border border-charcoal-100 bg-white p-6 shadow-elevation-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-charcoal-900">Setup Progress</h3>
        <span
          className={cn(
            'text-2xl font-bold',
            score === 100 ? 'text-success-600' : score >= 70 ? 'text-amber-600' : 'text-charcoal-600'
          )}
        >
          {score}%
        </span>
      </div>

      <Progress
        value={score}
        className="h-2 mb-4"
        indicatorClassName={cn(
          score === 100 ? 'bg-success-500' : score >= 70 ? 'bg-amber-500' : 'bg-gold-500'
        )}
      />

      {score === 100 ? (
        <div className="flex items-center gap-2 text-success-600">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-medium">All setup complete!</span>
        </div>
      ) : (
        <div className="space-y-3">
          {requiredIncomplete.length > 0 && (
            <div>
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
                Required ({requiredIncomplete.length})
              </p>
              <div className="space-y-1.5">
                {requiredIncomplete.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center gap-2 text-sm text-charcoal-700 hover:text-gold-600 transition-colors"
                  >
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span>{item.label}</span>
                    <ChevronRight className="h-3 w-3 ml-auto" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {recommendedIncomplete.length > 0 && requiredIncomplete.length === 0 && (
            <div>
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
                Recommended ({recommendedIncomplete.length})
              </p>
              <div className="space-y-1.5">
                {recommendedIncomplete.slice(0, 2).map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-gold-600 transition-colors"
                  >
                    <item.icon className="h-4 w-4 text-charcoal-400" />
                    <span>{item.label}</span>
                    <ChevronRight className="h-3 w-3 ml-auto" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function UsageStatsCard({ organization }: { organization: OrganizationType | null | undefined }) {
  const tier = organization?.subscription_tier || 'free'
  const maxUsers = organization?.max_users || 5
  const maxCandidates = organization?.max_candidates || 100
  const maxStorage = organization?.max_storage_gb || 10

  // These would come from actual usage queries
  const currentUsers = 12
  const currentCandidates = 847
  const currentStorage = 2.3

  const stats = [
    {
      label: 'Users',
      current: currentUsers,
      max: maxUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Candidates',
      current: currentCandidates,
      max: maxCandidates,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Storage',
      current: currentStorage,
      max: maxStorage,
      unit: 'GB',
      icon: HardDrive,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ]

  return (
    <div className="rounded-xl border border-charcoal-100 bg-white p-6 shadow-elevation-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-gold-500" />
          <h3 className="font-heading font-semibold text-charcoal-900">
            {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
          </h3>
        </div>
        <Badge
          variant="outline"
          className={cn(
            tier === 'enterprise'
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : tier === 'pro'
                ? 'bg-gold-50 text-gold-700 border-gold-200'
                : 'bg-charcoal-50 text-charcoal-700 border-charcoal-200'
          )}
        >
          {organization?.subscription_status || 'Active'}
        </Badge>
      </div>

      <div className="space-y-4">
        {stats.map((stat) => {
          const percentage = Math.round((stat.current / stat.max) * 100)
          return (
            <div key={stat.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-charcoal-600">{stat.label}</span>
                <span className="text-sm font-medium text-charcoal-900">
                  {stat.current}
                  {stat.unit ? ` ${stat.unit}` : ''} / {stat.max}
                  {stat.unit ? ` ${stat.unit}` : ''}
                </span>
              </div>
              <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    percentage > 90
                      ? 'bg-error-500'
                      : percentage > 70
                        ? 'bg-amber-500'
                        : 'bg-success-500'
                  )}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OrganizationHeader({
  organization,
  onExport,
  onImport,
}: {
  organization: OrganizationType | null | undefined
  onExport: () => void
  onImport: () => void
}) {
  const copyOrgId = () => {
    if (organization?.id) {
      navigator.clipboard.writeText(organization.id)
      toast.success('Organization ID copied to clipboard')
    }
  }

  return (
    <div className="rounded-xl border border-charcoal-100 bg-white p-6 shadow-elevation-xs">
      <div className="flex items-start gap-5">
        {/* Logo placeholder */}
        <div
          className={cn(
            'w-16 h-16 rounded-xl flex items-center justify-center text-white font-heading font-bold text-2xl',
            'bg-gradient-to-br from-charcoal-700 to-charcoal-800'
          )}
        >
          {organization?.logo_url ? (
            <img
              src={organization.logo_url}
              alt={organization.name || 'Logo'}
              className="w-full h-full object-contain rounded-xl"
            />
          ) : (
            organization?.name?.charAt(0) || 'O'
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="font-heading text-xl font-bold text-charcoal-900 truncate">
              {organization?.name || 'My Organization'}
            </h2>
            {organization?.legal_name && organization.legal_name !== organization.name && (
              <Badge variant="outline" className="text-xs">
                {organization.legal_name}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-charcoal-500">
            {organization?.industry && <span>{organization.industry}</span>}
            {organization?.company_size && <span>• {organization.company_size}</span>}
            {(organization?.city || organization?.state) && (
              <span>
                • {[organization.city, organization.state].filter(Boolean).join(', ')}
              </span>
            )}
          </div>

          {organization?.slug && (
            <p className="mt-1 text-xs text-charcoal-400 font-mono">ID: {organization.slug}</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={copyOrgId}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Org ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onImport}>
              <Upload className="h-4 w-4 mr-2" />
              Import Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function OrganizationHub() {
  const utils = trpc.useUtils()
  const { data: organization, isLoading } = trpc.settings.getOrganization.useQuery()
  const exportMutation = trpc.settings.exportOrgSettings.useQuery(undefined, { enabled: false })

  const setupProgress = calculateSetupScore(organization)

  const handleExport = async () => {
    try {
      const result = await utils.settings.exportOrgSettings.fetch()
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `org-settings-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Settings exported successfully')
    } catch {
      toast.error('Failed to export settings')
    }
  }

  const handleImport = () => {
    // TODO: Implement import dialog
    toast.info('Import feature coming soon')
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Settings' },
  ]

  if (isLoading) {
    return (
      <AdminPageContent insideTabLayout>
        <AdminPageHeader insideTabLayout breadcrumbs={breadcrumbs} />
        <div className="space-y-6">
          <Skeleton className="h-32 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-36 rounded-xl" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          </div>
        </div>
      </AdminPageContent>
    )
  }

  return (
    <AdminPageContent insideTabLayout>
      <AdminPageHeader
        insideTabLayout
        breadcrumbs={breadcrumbs}
        actions={
          <Link href="/employee/admin/settings/organization">
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Edit Settings
            </Button>
          </Link>
        }
      />

      <div className="space-y-6">
        {/* Organization Header */}
        <OrganizationHeader
          organization={organization}
          onExport={handleExport}
          onImport={handleImport}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Categories */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading font-semibold text-charcoal-900">Settings Categories</h3>
              <span className="text-sm text-charcoal-500">
                {setupProgress.completed.length} of {SETUP_ITEMS.length} items configured
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {SETTINGS_CATEGORIES.map((category) => (
                <SettingsCategoryCard
                  key={category.id}
                  category={category}
                  setupProgress={setupProgress}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Setup Progress */}
            <SetupProgressCard
              score={setupProgress.score}
              completed={setupProgress.completed}
              incomplete={setupProgress.incomplete}
            />

            {/* Usage Stats */}
            <UsageStatsCard organization={organization} />
          </div>
        </div>
      </div>
    </AdminPageContent>
  )
}

export default OrganizationHub
