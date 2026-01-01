'use client'

import Link from 'next/link'
import { Building2, Users, MapPin, Phone, Mail, Calendar } from 'lucide-react'
import type { FullOrgGroupData } from '@/types/admin'

const GROUP_TYPE_LABELS: Record<string, string> = {
  root: 'Organization',
  division: 'Division',
  branch: 'Branch Office',
  team: 'Team',
  satellite_office: 'Satellite Office',
  producer: 'Producer',
}

interface GroupBasicsSectionProps {
  group: FullOrgGroupData
}

/**
 * Guidewire-style Group Basics Tab
 * 
 * Sections:
 * - Group Info (Name, Type, Parent, Description)
 * - Contact (Phone, Fax, Email)
 * - Address
 * - Management (Supervisor, Manager, Security Zone)
 */
export function GroupBasicsSection({ group }: GroupBasicsSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Group Info Section */}
        <div className="bg-white rounded-lg border border-charcoal-100 p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-charcoal-100">
            <Building2 className="w-5 h-5 text-gold-600" />
            <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider">
              Group Info
            </h3>
          </div>
          
          <dl className="space-y-3">
            <div className="flex justify-between py-2 border-b border-charcoal-50">
              <dt className="text-sm text-charcoal-500">Group Name</dt>
              <dd className="text-sm font-medium text-charcoal-900">{group.name}</dd>
            </div>
            
            {group.code && (
              <div className="flex justify-between py-2 border-b border-charcoal-50">
                <dt className="text-sm text-charcoal-500">Code</dt>
                <dd className="text-sm font-medium text-charcoal-900">{group.code}</dd>
              </div>
            )}
            
            <div className="flex justify-between py-2 border-b border-charcoal-50">
              <dt className="text-sm text-charcoal-500">Type</dt>
              <dd className="text-sm font-medium text-charcoal-900">
                {GROUP_TYPE_LABELS[group.groupType] ?? group.groupType}
              </dd>
            </div>
            
            <div className="flex justify-between py-2 border-b border-charcoal-50">
              <dt className="text-sm text-charcoal-500">Parent Group</dt>
              <dd className="text-sm font-medium text-charcoal-900">
                {group.parent ? (
                  <Link 
                    href={`/employee/admin/groups/${group.parent.id}`}
                    className="text-gold-600 hover:text-gold-700"
                  >
                    {group.parent.name}
                  </Link>
                ) : (
                  <span className="text-charcoal-400">—</span>
                )}
              </dd>
            </div>
            
            {group.description && (
              <div className="py-2">
                <dt className="text-sm text-charcoal-500 mb-1">Description</dt>
                <dd className="text-sm text-charcoal-700">{group.description}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg border border-charcoal-100 p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-charcoal-100">
            <Phone className="w-5 h-5 text-gold-600" />
            <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider">
              Contact
            </h3>
          </div>
          
          <dl className="space-y-3">
            <div className="flex justify-between py-2 border-b border-charcoal-50">
              <dt className="text-sm text-charcoal-500">Phone</dt>
              <dd className="text-sm font-medium text-charcoal-900">
                {group.phone || <span className="text-charcoal-400">—</span>}
              </dd>
            </div>
            
            <div className="flex justify-between py-2 border-b border-charcoal-50">
              <dt className="text-sm text-charcoal-500">Fax</dt>
              <dd className="text-sm font-medium text-charcoal-900">
                {group.fax || <span className="text-charcoal-400">—</span>}
              </dd>
            </div>
            
            <div className="flex justify-between py-2">
              <dt className="text-sm text-charcoal-500">Email</dt>
              <dd className="text-sm font-medium text-charcoal-900">
                {group.email ? (
                  <a href={`mailto:${group.email}`} className="text-gold-600 hover:text-gold-700">
                    {group.email}
                  </a>
                ) : (
                  <span className="text-charcoal-400">—</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Address Section */}
        <div className="bg-white rounded-lg border border-charcoal-100 p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-charcoal-100">
            <MapPin className="w-5 h-5 text-gold-600" />
            <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider">
              Address
            </h3>
          </div>
          
          <dl className="space-y-3">
            <div className="py-2">
              <dt className="text-sm text-charcoal-500 mb-1">Address</dt>
              <dd className="text-sm text-charcoal-900">
                {group.address_line1 || group.city || group.state ? (
                  <>
                    {group.address_line1 && <div>{group.address_line1}</div>}
                    {group.address_line2 && <div>{group.address_line2}</div>}
                    {(group.city || group.state || group.postal_code) && (
                      <div>
                        {[group.city, group.state, group.postal_code].filter(Boolean).join(', ')}
                      </div>
                    )}
                    {group.country && group.country !== 'USA' && <div>{group.country}</div>}
                  </>
                ) : (
                  <span className="text-charcoal-400">No address on file</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Management Section */}
        <div className="bg-white rounded-lg border border-charcoal-100 p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-charcoal-100">
            <Users className="w-5 h-5 text-gold-600" />
            <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider">
              Management
            </h3>
          </div>
          
          <dl className="space-y-3">
            <div className="flex justify-between py-2 border-b border-charcoal-50">
              <dt className="text-sm text-charcoal-500">Supervisor</dt>
              <dd className="text-sm font-medium text-charcoal-900">
                {group.supervisor ? (
                  <Link 
                    href={`/employee/admin/users/${group.supervisor.id}`}
                    className="text-gold-600 hover:text-gold-700"
                  >
                    {group.supervisor.full_name}
                  </Link>
                ) : (
                  <span className="text-charcoal-400">—</span>
                )}
              </dd>
            </div>
            
            <div className="flex justify-between py-2 border-b border-charcoal-50">
              <dt className="text-sm text-charcoal-500">Manager</dt>
              <dd className="text-sm font-medium text-charcoal-900">
                {group.manager ? (
                  <Link 
                    href={`/employee/admin/users/${group.manager.id}`}
                    className="text-gold-600 hover:text-gold-700"
                  >
                    {group.manager.full_name}
                  </Link>
                ) : (
                  <span className="text-charcoal-400">—</span>
                )}
              </dd>
            </div>
            
            <div className="flex justify-between py-2 border-b border-charcoal-50">
              <dt className="text-sm text-charcoal-500">Security Zone</dt>
              <dd className="text-sm font-medium text-charcoal-900">
                {group.securityZone || 'Default Security Zone'}
              </dd>
            </div>
            
            <div className="flex justify-between py-2 border-b border-charcoal-50">
              <dt className="text-sm text-charcoal-500">Load Factor</dt>
              <dd className="text-sm font-medium text-charcoal-900">
                {group.loadFactor}%
              </dd>
            </div>
            
            <div className="flex justify-between py-2">
              <dt className="text-sm text-charcoal-500">Status</dt>
              <dd>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  group.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-charcoal-100 text-charcoal-600'
                }`}>
                  {group.isActive ? 'Active' : 'Inactive'}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Audit Info Section */}
        <div className="bg-white rounded-lg border border-charcoal-100 p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-charcoal-100">
            <Calendar className="w-5 h-5 text-gold-600" />
            <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider">
              Audit Info
            </h3>
          </div>
          
          <dl className="space-y-3">
            <div className="flex justify-between py-2 border-b border-charcoal-50">
              <dt className="text-sm text-charcoal-500">Created</dt>
              <dd className="text-sm text-charcoal-700">
                {new Date(group.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </dd>
            </div>
            
            {group.created_by_user && (
              <div className="flex justify-between py-2 border-b border-charcoal-50">
                <dt className="text-sm text-charcoal-500">Created By</dt>
                <dd className="text-sm text-charcoal-700">
                  {group.created_by_user.full_name}
                </dd>
              </div>
            )}
            
            <div className="flex justify-between py-2">
              <dt className="text-sm text-charcoal-500">Last Modified</dt>
              <dd className="text-sm text-charcoal-700">
                {new Date(group.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </dd>
            </div>
          </dl>
        </div>

        {/* Child Groups Section (if any) */}
        {group.sections?.children && group.sections.children.items.length > 0 && (
          <div className="bg-white rounded-lg border border-charcoal-100 p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-charcoal-100">
              <Building2 className="w-5 h-5 text-gold-600" />
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider">
                Child Groups ({group.sections.children.total})
              </h3>
            </div>
            
            <ul className="space-y-2">
              {group.sections.children.items.map((child) => (
                <li key={child.id}>
                  <Link 
                    href={`/employee/admin/groups/${child.id}`}
                    className="flex items-center justify-between p-2 rounded hover:bg-charcoal-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-charcoal-900 hover:text-gold-600">
                      {child.name}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      child.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-charcoal-100 text-charcoal-600'
                    }`}>
                      {GROUP_TYPE_LABELS[child.group_type] ?? child.group_type}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}


