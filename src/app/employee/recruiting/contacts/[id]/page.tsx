import { redirect } from 'next/navigation'

interface ContactRedirectPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | undefined>>
}

/**
 * Redirect from old recruiting contacts route to consolidated contacts route.
 * This maintains backwards compatibility for any existing links.
 */
export default async function ContactRedirectPage({ params, searchParams }: ContactRedirectPageProps) {
  const { id } = await params
  const search = await searchParams

  // Preserve any query params (like ?section=activities)
  const queryString = new URLSearchParams(
    Object.entries(search).filter(([, v]) => v !== undefined) as [string, string][]
  ).toString()

  const targetUrl = `/employee/contacts/${id}${queryString ? `?${queryString}` : ''}`
  redirect(targetUrl)
}
