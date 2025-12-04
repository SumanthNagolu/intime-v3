/**
 * Layout design tokens for InTime v3 application
 * Based on 01-LAYOUT-SHELL.md specification
 */

export const layoutTokens = {
  sidebar: {
    widthCollapsed: 64,  // 64px (w-16)
    widthExpanded: 224,  // 224px (w-56)
  },
  header: {
    height: 56,  // 56px (h-14)
  },
  page: {
    paddingX: 24,
    paddingY: 24,
    maxWidth: 1440,
  },
  card: {
    padding: 16,
    borderRadius: 8,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  animation: {
    duration: {
      fast: 150,
      normal: 200,
      slow: 300,
    },
    easing: {
      default: 'ease',
      inOut: 'ease-in-out',
      out: 'ease-out',
    },
  },
  navItem: {
    height: 40,
    iconSize: 16,
    fontSize: 14,
    paddingX: 12,
    paddingY: 8,
    gap: 12,
  },
  badge: {
    height: 20,
    paddingX: 6,
    fontSize: 12,
  },
} as const;

export type LayoutTokens = typeof layoutTokens;
