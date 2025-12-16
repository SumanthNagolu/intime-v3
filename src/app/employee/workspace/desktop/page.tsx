import { getServerCaller } from '@/server/trpc/server-caller'
import { DesktopClient, type DesktopData } from './DesktopClient'

export default async function DesktopPage() {
  // Single database call to get all desktop data
  const caller = await getServerCaller()
  const data = await caller.dashboard.getDesktopData({})

  // Cast to DesktopData type for type safety
  const desktopData: DesktopData = data

  return <DesktopClient initialData={desktopData} />
}
