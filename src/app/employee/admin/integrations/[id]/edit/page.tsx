export const dynamic = 'force-dynamic'
import { IntegrationFormPage } from '@/components/admin/integrations/IntegrationFormPage'

export default function EditIntegrationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return <IntegrationFormPage paramsPromise={params} />
}
