export const dynamic = 'force-dynamic'
import { IntegrationDetailPage } from '@/components/admin/integrations/IntegrationDetailPage'

export default function IntegrationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return <IntegrationDetailPage paramsPromise={params} />
}
