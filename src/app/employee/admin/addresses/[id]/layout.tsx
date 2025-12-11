import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Address Details | Admin',
}

export default function AddressDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
