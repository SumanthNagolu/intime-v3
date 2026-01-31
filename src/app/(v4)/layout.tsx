/**
 * V4 Layout
 *
 * This layout wraps all v4 pages with the new Linear-style design.
 * The dark class is applied at the html level to enable dark mode.
 */

import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { AppLayout } from '@/components/v4/layout'
import '@/styles/linear.css'

export const metadata: Metadata = {
  title: 'InTime v4',
  description: 'Multi-agent staffing platform',
}

export default function V4Layout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>
}
