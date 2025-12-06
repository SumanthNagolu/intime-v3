export const dynamic = 'force-dynamic'
import { WebhookDebugPage } from '@/components/admin/integrations/WebhookDebugPage'

export default function WebhookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return <WebhookDebugPage paramsPromise={params} />
}
