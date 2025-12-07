'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2, Palette, Globe, Clock, Calendar,
  Settings, Phone, Download, Upload, RotateCcw
} from 'lucide-react'
import { CompanyInfoTab } from './org-tabs/CompanyInfoTab'
import { BrandingTab } from './org-tabs/BrandingTab'
import { RegionalTab } from './org-tabs/RegionalTab'
import { BusinessHoursTab } from './org-tabs/BusinessHoursTab'
import { FiscalYearTab } from './org-tabs/FiscalYearTab'
import { DefaultsTab } from './org-tabs/DefaultsTab'
import { ContactTab } from './org-tabs/ContactTab'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function OrgSettingsPage() {
  const utils = trpc.useUtils()
  const [activeTab, setActiveTab] = React.useState('company')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const { data: organization, isLoading } = trpc.settings.getOrganization.useQuery()

  const updateMutation = trpc.settings.updateOrganization.useMutation({
    onSuccess: () => {
      toast.success('Settings saved successfully')
      utils.settings.getOrganization.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save settings')
    },
  })

  const importMutation = trpc.settings.importOrgSettings.useMutation({
    onSuccess: () => {
      toast.success('Settings imported successfully')
      utils.settings.getOrganization.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to import settings')
    },
  })

  const resetMutation = trpc.settings.resetOrgSettingsSection.useMutation({
    onSuccess: () => {
      toast.success('Section reset to defaults')
      utils.settings.getOrganization.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reset settings')
    },
  })

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
      toast.success('Settings exported')
    } catch {
      toast.error('Failed to export settings')
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (data.settings) {
        await importMutation.mutateAsync({ settings: data.settings, overwriteExisting: true })
      } else {
        toast.error('Invalid settings file format')
      }
    } catch {
      toast.error('Failed to read settings file')
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleReset = (section: 'branding' | 'regional' | 'fiscal' | 'business_hours' | 'defaults') => {
    if (confirm(`Are you sure you want to reset ${section.replace('_', ' ')} settings to defaults?`)) {
      resetMutation.mutate({ section })
    }
  }

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 's') {
          e.preventDefault()
          // Trigger save from active tab
          document.getElementById('save-settings-btn')?.click()
        }
        // Tab switching: Cmd+1 through Cmd+7
        const num = parseInt(e.key)
        if (num >= 1 && num <= 7) {
          e.preventDefault()
          const tabs = ['company', 'branding', 'regional', 'hours', 'fiscal', 'defaults', 'contact']
          setActiveTab(tabs[num - 1])
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Organization Settings' },
  ]

  if (isLoading) {
    return (
      <AdminPageContent>
        <AdminPageHeader
          title="Organization Settings"
          description="Configure organization-wide settings"
          breadcrumbs={breadcrumbs}
        />
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-charcoal-100 rounded-lg w-full" />
          <div className="h-96 bg-charcoal-100 rounded-lg" />
        </div>
      </AdminPageContent>
    )
  }

  return (
    <AdminPageContent>
      <AdminPageHeader
        title="Organization Settings"
        description="Configure organization-wide settings including branding, regional settings, and defaults"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleImportClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleReset('branding')}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Branding
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReset('regional')}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Regional
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReset('fiscal')}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Fiscal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReset('business_hours')}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Business Hours
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReset('defaults')}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Defaults
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-charcoal-100 p-1 rounded-lg grid grid-cols-7 w-full">
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden lg:inline">Company</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden lg:inline">Branding</span>
          </TabsTrigger>
          <TabsTrigger value="regional" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden lg:inline">Regional</span>
          </TabsTrigger>
          <TabsTrigger value="hours" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden lg:inline">Hours</span>
          </TabsTrigger>
          <TabsTrigger value="fiscal" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden lg:inline">Fiscal</span>
          </TabsTrigger>
          <TabsTrigger value="defaults" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden lg:inline">Defaults</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Phone className="h-4 w-4" />
            <span className="hidden lg:inline">Contact</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <CompanyInfoTab
            organization={organization}
            onSave={(data) => updateMutation.mutate(data)}
            isPending={updateMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="branding">
          <BrandingTab
            organization={organization}
            onSave={(data) => updateMutation.mutate(data)}
            isPending={updateMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="regional">
          <RegionalTab
            organization={organization}
            onSave={(data) => updateMutation.mutate(data)}
            isPending={updateMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="hours">
          <BusinessHoursTab
            organization={organization}
            onSave={(data) => updateMutation.mutate(data)}
            isPending={updateMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="fiscal">
          <FiscalYearTab
            organization={organization}
            onSave={(data) => updateMutation.mutate(data)}
            isPending={updateMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="defaults">
          <DefaultsTab
            organization={organization}
            onSave={(data) => updateMutation.mutate(data)}
            isPending={updateMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="contact">
          <ContactTab
            organization={organization}
            onSave={(data) => updateMutation.mutate(data)}
            isPending={updateMutation.isPending}
          />
        </TabsContent>
      </Tabs>

      <div className="mt-4 text-xs text-charcoal-400">
        <p>Keyboard shortcuts: Cmd+1-7 to switch tabs, Cmd+S to save</p>
      </div>
    </AdminPageContent>
  )
}
