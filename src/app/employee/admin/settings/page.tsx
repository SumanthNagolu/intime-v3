import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  redirect('/employee/admin/settings/organization')
}
