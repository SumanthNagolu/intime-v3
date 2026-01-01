'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit, Trash2, Save, X, Tags } from 'lucide-react'
import type { FullUserData } from '@/types/admin'

interface UserAttributesTabProps {
  user: FullUserData
}

/**
 * User Attributes Tab - Custom attributes table
 */
export function UserAttributesTab({ user }: UserAttributesTabProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  // User attributes from user data or empty array
  const attributes = user.attributes || []

  const handleAddAttribute = () => {
    // TODO: Implement add attribute mutation
    setIsAdding(false)
    setNewKey('')
    setNewValue('')
  }

  const handleDeleteAttribute = (id: string) => {
    // TODO: Implement delete attribute mutation
    console.log('Delete attribute:', id)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
              Custom Attributes
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Attribute
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {attributes.length === 0 && !isAdding ? (
            <div className="text-center py-12">
              <Tags className="w-12 h-12 mx-auto text-charcoal-300 mb-3" />
              <p className="text-charcoal-500 mb-4">No custom attributes defined</p>
              <Button
                variant="outline"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Attribute
              </Button>
            </div>
          ) : (
            <div className="border border-charcoal-100 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-charcoal-50 border-b border-charcoal-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                      Key
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-4 py-3 w-[100px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {isAdding && (
                    <tr className="bg-gold-50">
                      <td className="px-4 py-3">
                        <Input
                          placeholder="Attribute key..."
                          value={newKey}
                          onChange={(e) => setNewKey(e.target.value)}
                          className="h-8"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          placeholder="Attribute value..."
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          className="h-8"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-600"
                            onClick={handleAddAttribute}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setIsAdding(false)
                              setNewKey('')
                              setNewValue('')
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {attributes.map((attr) => (
                    <tr key={attr.id} className="hover:bg-charcoal-50">
                      <td className="px-4 py-3">
                        {editingId === attr.id ? (
                          <Input
                            defaultValue={attr.key}
                            className="h-8"
                          />
                        ) : (
                          <span className="font-medium text-charcoal-900">{attr.key}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === attr.id ? (
                          <Input
                            defaultValue={attr.value}
                            className="h-8"
                          />
                        ) : (
                          <span className="text-charcoal-600">{attr.value}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {editingId === attr.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-green-600"
                                onClick={() => setEditingId(null)}
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setEditingId(null)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setEditingId(attr.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600"
                                onClick={() => handleDeleteAttribute(attr.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Attributes (Read-only) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
            System Attributes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">User ID</p>
              <p className="font-mono text-sm text-charcoal-700">{user.id}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Created At</p>
              <p className="text-sm text-charcoal-700">
                {new Date(user.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Updated At</p>
              <p className="text-sm text-charcoal-700">
                {new Date(user.updated_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">User Type</p>
              <p className="text-sm text-charcoal-700">
                {user.is_external ? 'External' : 'Internal'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
