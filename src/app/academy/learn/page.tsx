export const dynamic = "force-dynamic"
import { AcademyLearnView } from '@/components/academy/AcademyLearnView'
import { AppLayout } from '@/components/AppLayout'

export default function Page() {
  return (
    <AppLayout showMentor>
      <AcademyLearnView />
    </AppLayout>
  )
}
