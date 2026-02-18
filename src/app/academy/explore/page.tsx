export const dynamic = 'force-dynamic'
import { AcademyExploreView } from '@/components/academy/AcademyExploreView'
import { AppLayout } from '@/components/AppLayout'

export default function Page() {
  return (
    <AppLayout>
      <AcademyExploreView />
    </AppLayout>
  )
}
