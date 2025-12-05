'use client'

import * as React from 'react'
import { HardDrive, FileType, Database, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SettingsSection } from './SettingsSection'

const defaultFileTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'gif']

export function FilesSettingsPage() {
  const utils = trpc.useUtils()

  // Fetch system settings
  const { data: systemSettings, isLoading } = trpc.settings.getSystemSettings.useQuery({ category: 'files' })

  // Form state
  const [maxFileSize, setMaxFileSize] = React.useState('25')
  const [allowedFileTypes, setAllowedFileTypes] = React.useState(defaultFileTypes.join(', '))
  const [storageQuota, setStorageQuota] = React.useState('100')

  // Update form when data loads
  React.useEffect(() => {
    if (systemSettings) {
      const settingsMap = Object.fromEntries(
        systemSettings.map(s => {
          try {
            return [s.key, JSON.parse(s.value as string)]
          } catch {
            return [s.key, s.value]
          }
        })
      )

      if (settingsMap.max_file_size_mb) setMaxFileSize(String(settingsMap.max_file_size_mb))
      if (Array.isArray(settingsMap.allowed_file_types)) {
        setAllowedFileTypes(settingsMap.allowed_file_types.join(', '))
      }
      if (settingsMap.storage_quota_gb) setStorageQuota(String(settingsMap.storage_quota_gb))
    }
  }, [systemSettings])

  // Mutation
  const updateSettings = trpc.settings.bulkUpdateSystemSettings.useMutation({
    onSuccess: () => {
      utils.settings.getSystemSettings.invalidate()
      toast.success('File settings saved successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save settings')
    },
  })

  const handleSave = () => {
    const fileTypes = allowedFileTypes
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0)

    updateSettings.mutate({
      settings: [
        { key: 'max_file_size_mb', value: parseInt(maxFileSize) || 25 },
        { key: 'allowed_file_types', value: fileTypes },
        { key: 'storage_quota_gb', value: parseInt(storageQuota) || 100 },
      ],
    })
  }

  if (isLoading) {
    return (
      <DashboardShell
        title="Files & Storage Settings"
        description="Configure file upload limits and storage"
      >
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-charcoal-100 rounded-lg" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell
      title="Files & Storage Settings"
      description="Configure file upload limits and storage quotas"
      actions={
        <Button
          onClick={handleSave}
          loading={updateSettings.isPending}
          disabled={updateSettings.isPending}
        >
          Save Changes
        </Button>
      }
    >
      <div className="space-y-8">
        {/* File Upload Limits */}
        <SettingsSection
          title="File Upload Limits"
          description="Configure maximum file sizes and types"
          icon={HardDrive}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="maxSize">Maximum File Size (MB)</Label>
              <Input
                id="maxSize"
                type="number"
                value={maxFileSize}
                onChange={(e) => setMaxFileSize(e.target.value)}
                min="1"
                max="100"
              />
              <p className="text-xs text-charcoal-500">
                Maximum size for individual file uploads (1-100 MB)
              </p>
            </div>
          </div>
        </SettingsSection>

        {/* Allowed File Types */}
        <SettingsSection
          title="Allowed File Types"
          description="Configure which file types can be uploaded"
          icon={FileType}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fileTypes">Allowed Extensions</Label>
              <Input
                id="fileTypes"
                value={allowedFileTypes}
                onChange={(e) => setAllowedFileTypes(e.target.value)}
                placeholder="pdf, doc, docx, xls, xlsx..."
              />
              <p className="text-xs text-charcoal-500">
                Comma-separated list of allowed file extensions (without dots)
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {allowedFileTypes.split(',').map((type) => {
                const trimmed = type.trim()
                if (!trimmed) return null
                return (
                  <span
                    key={trimmed}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-charcoal-100 text-charcoal-700"
                  >
                    .{trimmed}
                  </span>
                )
              })}
            </div>
          </div>
        </SettingsSection>

        {/* Storage Quotas */}
        <SettingsSection
          title="Storage Quotas"
          description="Configure storage limits per organization"
          icon={Database}
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="storageQuota">Storage Quota per Organization (GB)</Label>
              <Input
                id="storageQuota"
                type="number"
                value={storageQuota}
                onChange={(e) => setStorageQuota(e.target.value)}
                min="10"
                max="1000"
              />
              <p className="text-xs text-charcoal-500">
                Default storage limit for new organizations (10-1000 GB)
              </p>
            </div>

            <div className="p-4 bg-gold-50 border border-gold-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-gold-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gold-800">
                  Storage Quota Notice
                </p>
                <p className="text-sm text-gold-700 mt-1">
                  Organizations that exceed their storage quota will not be able to upload new files until they free up space or upgrade their plan.
                </p>
              </div>
            </div>
          </div>
        </SettingsSection>
      </div>
    </DashboardShell>
  )
}
