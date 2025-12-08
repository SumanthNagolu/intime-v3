import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Extend Offer | InTime',
  description: 'Create offer for candidate',
}

export default function ExtendOfferLayout({
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
