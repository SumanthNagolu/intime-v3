import { getServerCaller } from '@/server/trpc/server-caller'
import { TodayClient, type TodayData } from './TodayClient'

export const dynamic = 'force-dynamic'

export default async function TodayPage() {
  // ONE database call - consolidated query
  const caller = await getServerCaller()
  const data = await caller.dashboard.getTodayData()

  // Pass all data to client component
  const todayData: TodayData = data

  return <TodayClient initialData={todayData} />
}
