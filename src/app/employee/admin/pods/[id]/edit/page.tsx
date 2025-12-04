export const dynamic = 'force-dynamic'

import { PodFormPage } from '@/components/admin/pods/PodFormPage'

interface EditPodPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPodPage({ params }: EditPodPageProps) {
  const { id } = await params
  return <PodFormPage mode="edit" podId={id} />
}
