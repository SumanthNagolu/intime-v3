/**
 * Ashby Layout
 *
 * This layout wraps all Ashby-style pages.
 * Light mode, data-dense, enterprise-grade design.
 */

import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { AppLayout } from '@/components/ashby/layout'
import '@/styles/ashby.css'

export const metadata: Metadata = {
  title: 'InTime',
  description: 'Multi-agent staffing platform',
}

export default function AshbyLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>
}
