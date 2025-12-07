import { Metadata } from 'next'
import { CommissionDashboard } from '@/components/recruiting/commissions'

export const metadata: Metadata = {
  title: 'My Commissions | InTime',
  description: 'Track your placement commissions and earnings',
}

export default function CommissionsPage() {
  return <CommissionDashboard />
}
