import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Address | Admin',
}

export default function NewAddressLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
