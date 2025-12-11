import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Addresses | Admin',
  description: 'Manage all addresses across your organization',
}

export default function AddressesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
