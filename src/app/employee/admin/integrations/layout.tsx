'use client'

import {
  Plug,
  Webhook,
  AlertCircle,
  RefreshCw,
  RotateCcw,
} from 'lucide-react'
import { HorizontalTabsLayout, type TabItem } from '@/components/layouts/HorizontalTabsLayout'

const integrationsTabs: TabItem[] = [
  {
    label: 'Integrations',
    href: '/employee/admin/integrations',
    icon: Plug,
  },
  {
    label: 'Webhooks',
    href: '/employee/admin/integrations/webhooks',
    icon: Webhook,
  },
  {
    label: 'Dead Letter Queue',
    href: '/employee/admin/integrations/dlq',
    icon: AlertCircle,
  },
  {
    label: 'Failover',
    href: '/employee/admin/integrations/failover',
    icon: RefreshCw,
  },
  {
    label: 'Retry Config',
    href: '/employee/admin/integrations/retry-config',
    icon: RotateCcw,
  },
]

export default function IntegrationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <HorizontalTabsLayout
      title="Integrations"
      description="Manage third-party connections and webhook configurations"
      tabs={integrationsTabs}
    >
      {children}
    </HorizontalTabsLayout>
  )
}
