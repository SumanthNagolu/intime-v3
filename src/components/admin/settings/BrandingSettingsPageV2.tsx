'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  Loader2,
  CheckCircle2,
  Eye,
  Settings,
} from 'lucide-react'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { LogoUploadGroup } from './LogoUpload'

// Validation schema
const brandingSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Enter a valid hex color'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Enter a valid hex color'),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Enter a valid hex color'),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Enter a valid hex color'),
})

type BrandingFormData = z.infer<typeof brandingSchema>

// Default colors
const DEFAULT_COLORS = {
  primaryColor: '#000000',
  secondaryColor: '#C9A961',
  backgroundColor: '#FDFBF7',
  textColor: '#171717',
}

// Dark mode colors (derived)
const DARK_COLORS = {
  primaryColor: '#FFFFFF',
  secondaryColor: '#D4AF37',
  backgroundColor: '#121212',
  textColor: '#FAFAFA',
}

// Section component
interface SettingsSectionProps {
  title: string
  description?: string
  icon?: React.ElementType
  children: React.ReactNode
  className?: string
}

function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-charcoal-100 shadow-elevation-xs',
        className
      )}
    >
      <div className="px-6 py-4 border-b border-charcoal-100">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-charcoal-50 rounded-lg">
              <Icon className="h-5 w-5 text-charcoal-600" />
            </div>
          )}
          <div>
            <h3 className="font-heading text-lg font-semibold text-charcoal-900 tracking-wide">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-charcoal-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

// Color picker field
interface ColorFieldProps {
  label: string
  description?: string
  value: string
  onChange: (value: string) => void
  error?: string
}

function ColorField({ label, description, value, onChange, error }: ColorFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {description && <p className="text-xs text-charcoal-500">{description}</p>}
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-charcoal-200 hover:border-gold-400 transition-colors"
            style={{ padding: 0 }}
          />
          <div
            className="absolute inset-1 rounded-md pointer-events-none"
            style={{ backgroundColor: value }}
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className={cn('h-11 font-mono w-32', error && 'border-error-400')}
        />
      </div>
      {error && <p className="text-xs text-error-500">{error}</p>}
    </div>
  )
}

// Brand preview component
interface BrandPreviewProps {
  mode: 'light' | 'dark'
  colors: BrandingFormData
  logoUrl?: string | null
  orgName?: string
}

function BrandPreview({ mode, colors, logoUrl, orgName = 'Your Company' }: BrandPreviewProps) {
  const isDark = mode === 'dark'

  // Use dark mode colors for dark preview
  const previewColors = isDark
    ? {
        bg: DARK_COLORS.backgroundColor,
        text: DARK_COLORS.textColor,
        primary: colors.primaryColor === DEFAULT_COLORS.primaryColor
          ? DARK_COLORS.primaryColor
          : colors.primaryColor,
        secondary: colors.secondaryColor,
      }
    : {
        bg: colors.backgroundColor,
        text: colors.textColor,
        primary: colors.primaryColor,
        secondary: colors.secondaryColor,
      }

  return (
    <div
      className="rounded-xl border border-charcoal-200 overflow-hidden"
      style={{ backgroundColor: previewColors.bg }}
    >
      {/* Mock navbar */}
      <div
        className="px-4 py-3 flex items-center justify-between border-b"
        style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}
      >
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-6 object-contain" />
          ) : (
            <div
              className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: previewColors.primary }}
            >
              {orgName.charAt(0)}
            </div>
          )}
          <span
            className="font-heading font-semibold text-sm"
            style={{ color: previewColors.text }}
          >
            {orgName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 rounded text-xs font-medium transition-opacity hover:opacity-80"
            style={{
              backgroundColor: previewColors.primary,
              color: isDark ? '#000' : '#fff',
            }}
          >
            Primary
          </button>
          <button
            className="px-3 py-1.5 rounded text-xs font-medium transition-opacity hover:opacity-80"
            style={{
              backgroundColor: previewColors.secondary,
              color: '#fff',
            }}
          >
            Secondary
          </button>
        </div>
      </div>

      {/* Mock content */}
      <div className="p-4 space-y-3">
        <div
          className="rounded-lg p-3"
          style={{
            backgroundColor: isDark ? '#1a1a1a' : '#fff',
            border: `1px solid ${isDark ? '#333' : '#e5e5e5'}`,
          }}
        >
          <h4
            className="font-heading font-semibold text-sm mb-1"
            style={{ color: previewColors.text }}
          >
            Sample Card Title
          </h4>
          <p
            className="text-xs opacity-70"
            style={{ color: previewColors.text }}
          >
            This shows how your brand colors appear on cards and content.
          </p>
        </div>

        <div className="flex gap-2">
          <span
            className="px-2 py-0.5 rounded text-xs"
            style={{
              backgroundColor: `${previewColors.primary}20`,
              color: previewColors.primary,
            }}
          >
            Tag 1
          </span>
          <span
            className="px-2 py-0.5 rounded text-xs"
            style={{
              backgroundColor: `${previewColors.secondary}20`,
              color: previewColors.secondary,
            }}
          >
            Tag 2
          </span>
        </div>
      </div>
    </div>
  )
}

export function BrandingSettingsPageV2() {
  const utils = trpc.useUtils()
  const [previewMode, setPreviewMode] = React.useState<'light' | 'dark' | 'both'>('both')

  // Fetch data
  const { data: organization, isLoading } = trpc.settings.getOrganization.useQuery()
  const { data: brandingAssets } = trpc.settings.getBranding.useQuery()

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSchema),
    defaultValues: DEFAULT_COLORS,
  })

  // Update form when data loads
  React.useEffect(() => {
    if (organization) {
      reset({
        primaryColor: organization.primary_color || DEFAULT_COLORS.primaryColor,
        secondaryColor: organization.secondary_color || DEFAULT_COLORS.secondaryColor,
        backgroundColor: organization.background_color || DEFAULT_COLORS.backgroundColor,
        textColor: organization.text_color || DEFAULT_COLORS.textColor,
      })
    }
  }, [organization, reset])

  // Update mutation
  const updateMutation = trpc.settings.updateOrganization.useMutation({
    onSuccess: () => {
      toast.success('Branding settings saved')
      utils.settings.getOrganization.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save')
    },
  })

  // Reset to defaults mutation
  const resetMutation = trpc.settings.resetOrgSettingsSection.useMutation({
    onSuccess: () => {
      toast.success('Colors reset to defaults')
      utils.settings.getOrganization.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reset')
    },
  })

  const onSubmit = (data: BrandingFormData) => {
    updateMutation.mutate({
      primary_color: data.primaryColor,
      secondary_color: data.secondaryColor,
      background_color: data.backgroundColor,
      text_color: data.textColor,
    })
  }

  const handleReset = () => {
    if (confirm('Reset all colors to default? This cannot be undone.')) {
      resetMutation.mutate({ section: 'branding' })
    }
  }

  // Get logo URL from assets
  const logoUrl = brandingAssets?.find((a) => a.asset_type === 'logo_light')?.signed_url

  const watchedColors = watch()

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Settings', href: '/employee/admin/settings' },
    { label: 'Branding' },
  ]

  if (isLoading) {
    return (
      <AdminPageContent insideTabLayout>
        <AdminPageHeader insideTabLayout breadcrumbs={breadcrumbs} />
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-charcoal-100 rounded-xl" />
          <div className="h-64 bg-charcoal-100 rounded-xl" />
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
          <div className="flex items-center gap-3">
            {isDirty && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Unsaved changes
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={resetMutation.isPending}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        }
      />

      <div className="space-y-8">
        {/* Logo Upload */}
        <SettingsSection
          title="Brand Assets"
          description="Upload your company logo and favicon"
          icon={Palette}
        >
          <LogoUploadGroup
            lightUrl={brandingAssets?.find((a) => a.asset_type === 'logo_light')?.signed_url}
            darkUrl={brandingAssets?.find((a) => a.asset_type === 'logo_dark')?.signed_url}
            faviconUrl={brandingAssets?.find((a) => a.asset_type === 'favicon')?.signed_url}
            onUploadComplete={() => utils.settings.getBranding.invalidate()}
          />
        </SettingsSection>

        {/* Color Scheme */}
        <SettingsSection
          title="Color Scheme"
          description="Define your brand colors for the application"
          icon={Palette}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Controller
              name="primaryColor"
              control={control}
              render={({ field }) => (
                <ColorField
                  label="Primary"
                  description="Buttons, links"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.primaryColor?.message}
                />
              )}
            />
            <Controller
              name="secondaryColor"
              control={control}
              render={({ field }) => (
                <ColorField
                  label="Secondary"
                  description="Accents, highlights"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.secondaryColor?.message}
                />
              )}
            />
            <Controller
              name="backgroundColor"
              control={control}
              render={({ field }) => (
                <ColorField
                  label="Background"
                  description="Page backgrounds"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.backgroundColor?.message}
                />
              )}
            />
            <Controller
              name="textColor"
              control={control}
              render={({ field }) => (
                <ColorField
                  label="Text"
                  description="Body text, headings"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.textColor?.message}
                />
              )}
            />
          </div>
        </SettingsSection>

        {/* Live Preview */}
        <SettingsSection
          title="Live Preview"
          description="See how your branding looks in different modes"
          icon={Eye}
        >
          {/* Mode selector */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-charcoal-600 mr-2">Preview:</span>
            <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as any)}>
              <TabsList className="bg-charcoal-100">
                <TabsTrigger value="light" className="data-[state=active]:bg-white">
                  <Sun className="h-4 w-4 mr-1.5" />
                  Light
                </TabsTrigger>
                <TabsTrigger value="dark" className="data-[state=active]:bg-white">
                  <Moon className="h-4 w-4 mr-1.5" />
                  Dark
                </TabsTrigger>
                <TabsTrigger value="both" className="data-[state=active]:bg-white">
                  <Monitor className="h-4 w-4 mr-1.5" />
                  Both
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Preview panels */}
          <div
            className={cn(
              'grid gap-6',
              previewMode === 'both' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-md'
            )}
          >
            {(previewMode === 'light' || previewMode === 'both') && (
              <div>
                <p className="text-xs font-medium text-charcoal-500 mb-2 flex items-center gap-1.5">
                  <Sun className="h-3.5 w-3.5" />
                  Light Mode
                </p>
                <BrandPreview
                  mode="light"
                  colors={watchedColors}
                  logoUrl={logoUrl}
                  orgName={organization?.name}
                />
              </div>
            )}
            {(previewMode === 'dark' || previewMode === 'both') && (
              <div>
                <p className="text-xs font-medium text-charcoal-500 mb-2 flex items-center gap-1.5">
                  <Moon className="h-3.5 w-3.5" />
                  Dark Mode
                </p>
                <BrandPreview
                  mode="dark"
                  colors={watchedColors}
                  logoUrl={logoUrl}
                  orgName={organization?.name}
                />
              </div>
            )}
          </div>
        </SettingsSection>
      </div>
    </AdminPageContent>
  )
}

export default BrandingSettingsPageV2
