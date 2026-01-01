import { redirect } from 'next/navigation'

/**
 * Redirect from old recruiting contacts list to consolidated contacts list.
 * This maintains backwards compatibility for any existing links.
 */
export default function ContactsListRedirectPage() {
  redirect('/employee/contacts')
}


