import { IncidentDetailPage } from '@/components/admin/emergency'

interface Props {
  params: Promise<{ id: string }>
}

export default async function IncidentPage({ params }: Props) {
  const { id } = await params
  return <IncidentDetailPage incidentId={id} />
}
