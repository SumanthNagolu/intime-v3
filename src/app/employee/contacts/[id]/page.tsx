'use client'

import { ContactWorkspace } from '@/components/workspaces/ContactWorkspace'

/**
 * Contact Detail Page
 *
 * Key patterns:
 * - Page component is < 20 lines
 * - No config objects
 * - Data comes from context (set by layout via ONE database call)
 * - Sidebar provided by SidebarLayout via EntityJourneySidebar
 */
export default function ContactDetailPage() {
  return <ContactWorkspace />
}
