// Force dynamic rendering to prevent prerender serialization issues
export const dynamic = 'force-dynamic'

export default function DealsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
