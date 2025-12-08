import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Submit to Client | InTime',
  description: 'Submit candidate to client',
}

export default function SubmitToClientLayout({
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
