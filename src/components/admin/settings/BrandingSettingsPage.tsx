'use client'

import * as React from 'react'
import { Palette, Image, Type, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { FileUpload } from '@/components/ui/file-upload'
import { ColorPicker } from '@/components/ui/color-picker'
import { SettingsSection } from './SettingsSection'

export function BrandingSettingsPage() {
  const utils = trpc.useUtils()

  // Fetch branding assets and settings
  const { data: brandingAssets, isLoading: loadingAssets } = trpc.settings.getBranding.useQuery()
  const { data: orgSettings, isLoading: loadingSettings } = trpc.settings.getOrgSettings.useQuery({ category: 'branding' })
  const { data: loginPreview } = trpc.settings.getLoginPreview.useQuery()

  // Form state
  const [logoLightFile, setLogoLightFile] = React.useState<string | null>(null)
  const [logoDarkFile, setLogoDarkFile] = React.useState<string | null>(null)
  const [faviconFile, setFaviconFile] = React.useState<string | null>(null)
  const [backgroundFile, setBackgroundFile] = React.useState<string | null>(null)

  const [primaryColor, setPrimaryColor] = React.useState('#000000')
  const [secondaryColor, setSecondaryColor] = React.useState('#B76E79')
  const [accentColor, setAccentColor] = React.useState('#171717')

  const [showLogo, setShowLogo] = React.useState(true)
  const [showCompanyName, setShowCompanyName] = React.useState(true)
  const [welcomeMessage, setWelcomeMessage] = React.useState('')

  // Update form when data loads
  React.useEffect(() => {
    if (brandingAssets) {
      const logoLight = brandingAssets.find(a => a.asset_type === 'logo_light')
      const logoDark = brandingAssets.find(a => a.asset_type === 'logo_dark')
      const favicon = brandingAssets.find(a => a.asset_type === 'favicon')
      const background = brandingAssets.find(a => a.asset_type === 'login_background')

      if (logoLight?.signed_url) setLogoLightFile(logoLight.signed_url)
      if (logoDark?.signed_url) setLogoDarkFile(logoDark.signed_url)
      if (favicon?.signed_url) setFaviconFile(favicon.signed_url)
      if (background?.signed_url) setBackgroundFile(background.signed_url)
    }
  }, [brandingAssets])

  React.useEffect(() => {
    if (orgSettings) {
      const settingsMap = Object.fromEntries(
        orgSettings.map(s => {
          try {
            return [s.key, JSON.parse(s.value as string)]
          } catch {
            return [s.key, s.value]
          }
        })
      )

      if (settingsMap.primary_color) setPrimaryColor(settingsMap.primary_color)
      if (settingsMap.secondary_color) setSecondaryColor(settingsMap.secondary_color)
      if (settingsMap.accent_color) setAccentColor(settingsMap.accent_color)
      if (typeof settingsMap.login_show_logo === 'boolean') setShowLogo(settingsMap.login_show_logo)
      if (typeof settingsMap.login_show_company_name === 'boolean') setShowCompanyName(settingsMap.login_show_company_name)
      if (settingsMap.login_welcome_message) setWelcomeMessage(settingsMap.login_welcome_message)
    }
  }, [orgSettings])

  // Mutations
  const uploadAsset = trpc.settings.uploadBrandingAsset.useMutation({
    onSuccess: () => {
      utils.settings.getBranding.invalidate()
      utils.settings.getLoginPreview.invalidate()
      toast.success('Image uploaded successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload image')
    },
  })

  const deleteAsset = trpc.settings.deleteBrandingAsset.useMutation({
    onSuccess: () => {
      utils.settings.getBranding.invalidate()
      utils.settings.getLoginPreview.invalidate()
      toast.success('Image deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete image')
    },
  })

  const updateSettings = trpc.settings.bulkUpdateOrgSettings.useMutation({
    onSuccess: () => {
      utils.settings.getOrgSettings.invalidate()
      utils.settings.getLoginPreview.invalidate()
      toast.success('Settings saved successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save settings')
    },
  })

  const handleLogoUpload = (assetType: 'logo_light' | 'logo_dark' | 'favicon' | 'login_background', file: string | null, originalFile?: File) => {
    if (!file || !originalFile) {
      // Delete asset
      deleteAsset.mutate({ assetType })
      return
    }

    uploadAsset.mutate({
      assetType,
      fileBase64: file,
      fileName: originalFile.name,
      mimeType: originalFile.type,
    })
  }

  const handleSaveColors = () => {
    updateSettings.mutate({
      settings: [
        { key: 'primary_color', value: primaryColor, category: 'branding' },
        { key: 'secondary_color', value: secondaryColor, category: 'branding' },
        { key: 'accent_color', value: accentColor, category: 'branding' },
      ],
    })
  }

  const handleSaveLoginSettings = () => {
    updateSettings.mutate({
      settings: [
        { key: 'login_show_logo', value: showLogo, category: 'branding' },
        { key: 'login_show_company_name', value: showCompanyName, category: 'branding' },
        { key: 'login_welcome_message', value: welcomeMessage, category: 'branding' },
      ],
    })
  }

  const isLoading = loadingAssets || loadingSettings

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
          <div className="h-64 bg-charcoal-100 rounded-lg" />
          <div className="h-48 bg-charcoal-100 rounded-lg" />
        </div>
      </AdminPageContent>
    )
  }

  return (
    <AdminPageContent insideTabLayout>
      <AdminPageHeader insideTabLayout breadcrumbs={breadcrumbs} />
      <div className="space-y-8">
        {/* Logo Section */}
        <SettingsSection
          title="Logos"
          description="Upload your organization logos for light and dark modes"
          icon={Image}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Light Mode Logo</Label>
              <FileUpload
                value={logoLightFile}
                onChange={(val, file) => {
                  setLogoLightFile(val)
                  if (val && file) {
                    handleLogoUpload('logo_light', val, file)
                  } else if (!val) {
                    handleLogoUpload('logo_light', null)
                  }
                }}
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                placeholder="PNG, JPEG, SVG or WebP (max 5MB)"
                aspectRatio="landscape"
              />
              <p className="text-xs text-charcoal-500">
                Recommended: 200x50px minimum, transparent background
              </p>
            </div>

            <div className="space-y-3">
              <Label>Dark Mode Logo</Label>
              <FileUpload
                value={logoDarkFile}
                onChange={(val, file) => {
                  setLogoDarkFile(val)
                  if (val && file) {
                    handleLogoUpload('logo_dark', val, file)
                  } else if (!val) {
                    handleLogoUpload('logo_dark', null)
                  }
                }}
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                placeholder="PNG, JPEG, SVG or WebP (max 5MB)"
                aspectRatio="landscape"
              />
              <p className="text-xs text-charcoal-500">
                For use on dark backgrounds
              </p>
            </div>

            <div className="space-y-3">
              <Label>Favicon</Label>
              <FileUpload
                value={faviconFile}
                onChange={(val, file) => {
                  setFaviconFile(val)
                  if (val && file) {
                    handleLogoUpload('favicon', val, file)
                  } else if (!val) {
                    handleLogoUpload('favicon', null)
                  }
                }}
                accept="image/png,image/x-icon,image/svg+xml"
                placeholder="ICO, PNG or SVG (max 5MB)"
                aspectRatio="square"
              />
              <p className="text-xs text-charcoal-500">
                32x32px or 64x64px recommended
              </p>
            </div>
          </div>
        </SettingsSection>

        {/* Colors Section */}
        <SettingsSection
          title="Brand Colors"
          description="Define your primary brand colors"
          icon={Palette}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveColors}
              loading={updateSettings.isPending}
            >
              Save Colors
            </Button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label>Primary Color</Label>
              <ColorPicker
                value={primaryColor}
                onChange={setPrimaryColor}
              />
              <p className="text-xs text-charcoal-500">
                Main action buttons, links
              </p>
            </div>

            <div className="space-y-3">
              <Label>Secondary Color</Label>
              <ColorPicker
                value={secondaryColor}
                onChange={setSecondaryColor}
              />
              <p className="text-xs text-charcoal-500">
                Accent elements, highlights
              </p>
            </div>

            <div className="space-y-3">
              <Label>Accent Color</Label>
              <ColorPicker
                value={accentColor}
                onChange={setAccentColor}
              />
              <p className="text-xs text-charcoal-500">
                Secondary actions, badges
              </p>
            </div>
          </div>
        </SettingsSection>

        {/* Login Page Section */}
        <SettingsSection
          title="Login Page"
          description="Customize the login page appearance"
          icon={Type}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveLoginSettings}
              loading={updateSettings.isPending}
            >
              Save Login Settings
            </Button>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Company Logo</Label>
                  <p className="text-sm text-charcoal-500">
                    Display your logo on the login page
                  </p>
                </div>
                <Switch
                  checked={showLogo}
                  onCheckedChange={setShowLogo}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Company Name</Label>
                  <p className="text-sm text-charcoal-500">
                    Display organization name below logo
                  </p>
                </div>
                <Switch
                  checked={showCompanyName}
                  onCheckedChange={setShowCompanyName}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <Input
                  id="welcomeMessage"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Welcome to our platform"
                />
                <p className="text-xs text-charcoal-500">
                  Optional message shown on the login page
                </p>
              </div>

              <div className="space-y-3">
                <Label>Background Image</Label>
                <FileUpload
                  value={backgroundFile}
                  onChange={(val, file) => {
                    setBackgroundFile(val)
                    if (val && file) {
                      handleLogoUpload('login_background', val, file)
                    } else if (!val) {
                      handleLogoUpload('login_background', null)
                    }
                  }}
                  accept="image/png,image/jpeg,image/webp"
                  placeholder="PNG, JPEG or WebP (max 5MB)"
                  aspectRatio="landscape"
                />
              </div>
            </div>

            {/* Live Preview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-charcoal-600" />
                <Label>Live Preview</Label>
              </div>
              <div
                className="relative rounded-lg border border-charcoal-200 overflow-hidden bg-charcoal-900 h-80"
                style={{
                  backgroundImage: backgroundFile ? `url(${backgroundFile})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Content */}
                <div className="relative flex flex-col items-center justify-center h-full p-6 text-center">
                  {showLogo && loginPreview?.logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoLightFile || loginPreview.logoUrl}
                      alt="Logo"
                      className="h-12 object-contain mb-4"
                    />
                  )}
                  {showCompanyName && loginPreview?.organizationName && (
                    <h2 className="text-xl font-heading font-semibold text-white tracking-wide">
                      {loginPreview.organizationName}
                    </h2>
                  )}
                  {welcomeMessage && (
                    <p className="text-sm text-white/80 mt-2">{welcomeMessage}</p>
                  )}

                  {/* Mock login form */}
                  <div className="mt-6 w-full max-w-xs bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                    <div className="h-10 bg-white/20 rounded mb-3" />
                    <div className="h-10 bg-white/20 rounded mb-3" />
                    <div
                      className="h-10 rounded flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Sign In
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SettingsSection>
      </div>
    </AdminPageContent>
  )
}
