import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terminate Placement | InTime',
  description: 'Process placement termination',
}

export default function TerminatePlacementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto py-8 px-4">
        {children}
      </div>
    </div>
  )
}
