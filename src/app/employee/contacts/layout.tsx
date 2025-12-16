'use client'

import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import { ReactNode } from 'react'

export default function ContactsLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout sectionId="contacts">
      {children}
    </SidebarLayout>
  )
}


