'use client'

/**
 * AccountLocationsSection - Locations
 * This is an alias for AccountAddressesSection with updated branding
 * Matches wizard Step 2: Locations
 */

import type { AccountAddress } from '@/types/workspace'
import { AccountAddressesSection } from './AccountAddressesSection'

export interface AccountLocationsSectionProps {
  addresses: AccountAddress[]
  accountId: string
}

// Re-export with the new name for semantic clarity
export function AccountLocationsSection(props: AccountLocationsSectionProps) {
  return <AccountAddressesSection {...props} />
}

export default AccountLocationsSection
