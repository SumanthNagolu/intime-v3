'use client'

import React, { createContext, useContext, useEffect, useMemo } from 'react'
import { trpc } from '@/lib/trpc/client'

interface BrandingAsset {
  id: string
  asset_type: 'logo_light' | 'logo_dark' | 'favicon' | 'login_background'
  signed_url: string | null
  file_name: string
}

interface BrandingColors {
  primary: string | null
  secondary: string | null
  background: string | null
  text: string | null
}

interface BrandingContextValue {
  colors: BrandingColors
  assets: {
    logoLight: string | null
    logoDark: string | null
    favicon: string | null
    loginBackground: string | null
  }
  isLoading: boolean
  orgName: string | null
}

const defaultColors: BrandingColors = {
  primary: '#000000',
  secondary: '#B76E79',
  background: '#FDFBF7',
  text: '#171717',
}

const BrandingContext = createContext<BrandingContextValue>({
  colors: defaultColors,
  assets: {
    logoLight: null,
    logoDark: null,
    favicon: null,
    loginBackground: null,
  },
  isLoading: true,
  orgName: null,
})

export function useBranding() {
  return useContext(BrandingContext)
}

// Convert hex color to HSL for CSS variables
function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '')

  // Parse hex values
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

interface BrandingProviderProps {
  children: React.ReactNode
}

export function BrandingProvider({ children }: BrandingProviderProps) {
  // Fetch organization data for colors
  const { data: org, isLoading: orgLoading } = trpc.settings.getOrganization.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  // Fetch branding assets for logos
  const { data: brandingAssets, isLoading: assetsLoading } = trpc.settings.getBranding.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  const isLoading = orgLoading || assetsLoading

  // Memoize colors
  const colors = useMemo<BrandingColors>(() => ({
    primary: org?.primary_color || defaultColors.primary,
    secondary: org?.secondary_color || defaultColors.secondary,
    background: org?.background_color || defaultColors.background,
    text: org?.text_color || defaultColors.text,
  }), [org])

  // Memoize assets
  const assets = useMemo(() => {
    const assetsMap = (brandingAssets as BrandingAsset[] | undefined)?.reduce((acc, asset) => {
      acc[asset.asset_type] = asset.signed_url
      return acc
    }, {} as Record<string, string | null>) || {}

    return {
      logoLight: assetsMap.logo_light || null,
      logoDark: assetsMap.logo_dark || null,
      favicon: assetsMap.favicon || null,
      loginBackground: assetsMap.login_background || null,
    }
  }, [brandingAssets])

  // Apply CSS variables when colors change
  useEffect(() => {
    if (isLoading) return

    const root = document.documentElement

    // Apply primary color (used for buttons, links)
    if (colors.primary) {
      root.style.setProperty('--brand-primary', colors.primary)
      root.style.setProperty('--brand-primary-hsl', hexToHsl(colors.primary))
    }

    // Apply secondary color (used for accents, highlights)
    if (colors.secondary) {
      root.style.setProperty('--brand-secondary', colors.secondary)
      root.style.setProperty('--brand-secondary-hsl', hexToHsl(colors.secondary))
    }

    // Apply background color
    if (colors.background) {
      root.style.setProperty('--brand-background', colors.background)
      root.style.setProperty('--brand-background-hsl', hexToHsl(colors.background))
    }

    // Apply text color
    if (colors.text) {
      root.style.setProperty('--brand-text', colors.text)
      root.style.setProperty('--brand-text-hsl', hexToHsl(colors.text))
    }

    // Cleanup on unmount
    return () => {
      root.style.removeProperty('--brand-primary')
      root.style.removeProperty('--brand-primary-hsl')
      root.style.removeProperty('--brand-secondary')
      root.style.removeProperty('--brand-secondary-hsl')
      root.style.removeProperty('--brand-background')
      root.style.removeProperty('--brand-background-hsl')
      root.style.removeProperty('--brand-text')
      root.style.removeProperty('--brand-text-hsl')
    }
  }, [colors, isLoading])

  // Update favicon when it changes
  useEffect(() => {
    if (assets.favicon) {
      // Find existing favicon link or create new one
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = assets.favicon
    }
  }, [assets.favicon])

  const value = useMemo<BrandingContextValue>(() => ({
    colors,
    assets,
    isLoading,
    orgName: org?.name || null,
  }), [colors, assets, isLoading, org?.name])

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  )
}
