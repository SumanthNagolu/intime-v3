export const dynamic = 'force-dynamic'
import { WebhookFormPage } from '@/components/admin/integrations/WebhookFormPage'

export default function EditWebhookPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return <WebhookFormPage paramsPromise={params} />
}
