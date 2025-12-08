import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Schedule Interview | InTime',
  description: 'Schedule interview for candidate',
}

export default function ScheduleInterviewLayout({
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
