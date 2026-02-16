import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI-Native Demo | InTime',
  description: 'Experience the future of staffing with AI-native workflows',
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
