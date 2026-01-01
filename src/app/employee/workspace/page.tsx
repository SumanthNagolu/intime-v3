import { redirect } from 'next/navigation'
import { getMyWorkspace } from '@/server/actions/workspace'
import { MyWorkspaceClient } from './MyWorkspaceClient'

export const dynamic = 'force-dynamic'

export default async function MyWorkspacePage() {
  const data = await getMyWorkspace()

  if (!data) {
    redirect('/login')
  }

  return <MyWorkspaceClient data={data} />
}
