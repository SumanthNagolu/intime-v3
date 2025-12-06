'use client'

import * as React from 'react'
import { Palette } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SettingsSection } from '../SettingsSection'

interface BrandingTabProps {
  organization: {
    logo_url?: string | null
    favicon_url?: string | null
    primary_color?: string | null
    secondary_color?: string | null
    background_color?: string | null
    text_color?: string | null
  } | null | undefined
  onSave: (data: Record<string, unknown>) => void
  isPending: boolean
}

export function BrandingTab({ organization, onSave, isPending }: BrandingTabProps) {
  const [logoUrl, setLogoUrl] = React.useState(organization?.logo_url || '')
  const [faviconUrl, setFaviconUrl] = React.useState(organization?.favicon_url || '')
  const [primaryColor, setPrimaryColor] = React.useState(organization?.primary_color || '#000000')
  const [secondaryColor, setSecondaryColor] = React.useState(organization?.secondary_color || '#B76E79')
  const [backgroundColor, setBackgroundColor] = React.useState(organization?.background_color || '#FDFBF7')
  const [textColor, setTextColor] = React.useState(organization?.text_color || '#171717')

  React.useEffect(() => {
    if (organization) {
      setLogoUrl(organization.logo_url || '')
      setFaviconUrl(organization.favicon_url || '')
      setPrimaryColor(organization.primary_color || '#000000')
      setSecondaryColor(organization.secondary_color || '#B76E79')
      setBackgroundColor(organization.background_color || '#FDFBF7')
      setTextColor(organization.text_color || '#171717')
    }
  }, [organization])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      logo_url: logoUrl.trim() || null,
      favicon_url: faviconUrl.trim() || null,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      background_color: backgroundColor,
      text_color: textColor,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <SettingsSection
          title="Brand Assets"
          description="Logo and favicon for your organization"
          icon={Palette}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-charcoal-500">PNG or SVG, recommended 200x50px</p>
              {logoUrl && (
                <div className="mt-2 p-4 bg-charcoal-50 rounded-lg">
                  <img src={logoUrl} alt="Logo preview" className="max-h-12 object-contain" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="faviconUrl">Favicon URL</Label>
              <Input
                id="faviconUrl"
                type="url"
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                placeholder="https://example.com/favicon.ico"
              />
              <p className="text-xs text-charcoal-500">ICO or PNG, 32x32 or 64x64px</p>
              {faviconUrl && (
                <div className="mt-2 p-4 bg-charcoal-50 rounded-lg flex items-center gap-2">
                  <img src={faviconUrl} alt="Favicon preview" className="w-8 h-8 object-contain" />
                  <span className="text-sm text-charcoal-600">Favicon Preview</span>
                </div>
              )}
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Color Scheme"
          description="Define your brand colors"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="primaryColorPicker"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <Input
                  id="primaryColor"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#000000"
                  className="font-mono"
                />
              </div>
              <p className="text-xs text-charcoal-500">Primary buttons, links</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="secondaryColorPicker"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <Input
                  id="secondaryColor"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  placeholder="#B76E79"
                  className="font-mono"
                />
              </div>
              <p className="text-xs text-charcoal-500">Accents, highlights</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="backgroundColorPicker"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <Input
                  id="backgroundColor"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#FDFBF7"
                  className="font-mono"
                />
              </div>
              <p className="text-xs text-charcoal-500">Page backgrounds</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="textColorPicker"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <Input
                  id="textColor"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  placeholder="#171717"
                  className="font-mono"
                />
              </div>
              <p className="text-xs text-charcoal-500">Body text, headings</p>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Preview"
          description="See how your brand colors will look"
        >
          <div
            className="p-6 rounded-lg border"
            style={{ backgroundColor }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-8 object-contain" />
                ) : (
                  <div
                    className="h-8 w-24 rounded flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: primaryColor }}
                  >
                    LOGO
                  </div>
                )}
                <span style={{ color: textColor }} className="font-heading font-semibold">
                  Sample Navigation
                </span>
              </div>
              <div
                className="px-4 py-2 rounded text-white text-sm font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Primary Button
              </div>
            </div>
            <div
              className="p-4 rounded"
              style={{ backgroundColor: 'white', color: textColor }}
            >
              <h3 className="font-heading font-semibold mb-2">Sample Card</h3>
              <p className="text-sm opacity-80">
                This is how text will appear on your cards and content areas.
              </p>
              <button
                className="mt-3 px-3 py-1 rounded text-sm font-medium"
                style={{ backgroundColor: secondaryColor, color: 'white' }}
              >
                Secondary Action
              </button>
            </div>
          </div>
        </SettingsSection>

        <div className="flex justify-end">
          <Button id="save-settings-btn" type="submit" loading={isPending} disabled={isPending}>
            Save Branding
          </Button>
        </div>
      </div>
    </form>
  )
}
