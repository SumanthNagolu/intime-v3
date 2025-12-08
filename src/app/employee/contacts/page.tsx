'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Plus,
  MoreHorizontal,
  UserCircle,
  Building2,
  Mail,
  Phone,
  Star,
  Filter,
  Loader2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function ContactsListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(
    searchParams.get('type')
  )

  // Query contacts - using the crm.contacts.list procedure
  const contactsQuery = trpc.crm.contacts.list.useQuery({
    search: searchQuery || undefined,
    limit: 100,
  })

  const contacts = contactsQuery.data?.items || []

  // Filter contacts based on type
  const filteredContacts = selectedType === 'key'
    ? contacts.filter((c) => c.is_primary)
    : contacts

  const handleViewContact = (contactId: string) => {
    router.push(`/employee/contacts/${contactId}`)
  }

  const handleCreateContact = () => {
    router.push('/employee/contacts/new')
  }

  return (
    <SidebarLayout hideSidebar>
      <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading font-bold text-charcoal-900">
              Contacts
            </h1>
            <p className="text-charcoal-500 mt-1">
              Manage your client contacts and relationships
            </p>
          </div>
          <Button onClick={handleCreateContact}>
            <Plus className="w-4 h-4 mr-2" />
            New Contact
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <Input
                  placeholder="Search contacts by name, email, company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    {selectedType === 'key' ? 'Key Contacts' : 'All Contacts'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedType(null)}>
                    All Contacts
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedType('key')}>
                    Key Contacts Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Contact List */}
        <Card>
          <CardContent className="p-0">
            {contactsQuery.isLoading ? (
              <div className="p-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
                </div>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center">
                <UserCircle className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                <p className="text-charcoal-500">
                  {searchQuery ? 'No contacts found matching your search' : 'No contacts yet'}
                </p>
                <Button className="mt-4" onClick={handleCreateContact}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Contact
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow
                      key={contact.id}
                      className="cursor-pointer hover:bg-charcoal-50"
                      onClick={() => handleViewContact(contact.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-hublot-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-hublot-700">
                              {contact.first_name?.[0]}
                              {contact.last_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-charcoal-900">
                                {contact.first_name} {contact.last_name}
                              </span>
                              {contact.is_primary && (
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-charcoal-600">{contact.title || '-'}</span>
                      </TableCell>
                      <TableCell>
                        {contact.account ? (
                          <Link
                            href={`/employee/recruiting/accounts/${contact.account.id}`}
                            className="flex items-center gap-1 text-hublot-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Building2 className="w-4 h-4" />
                            {contact.account.name}
                          </Link>
                        ) : (
                          <span className="text-charcoal-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 text-sm text-charcoal-600">
                          {contact.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {contact.email}
                            </span>
                          )}
                          {contact.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {contact.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-charcoal-500">
                          {contact.updated_at
                            ? formatDistanceToNow(new Date(contact.updated_at), { addSuffix: true })
                            : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewContact(contact.id)}>
                              View Contact
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/employee/contacts/${contact.id}/edit`)}>
                              Edit Contact
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  )
}
