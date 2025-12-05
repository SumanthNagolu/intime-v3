'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FlaskConical,
  CheckCircle,
  XCircle,
  MinusCircle,
  ArrowRight,
  Search,
} from 'lucide-react'

type ChainStep = {
  step: string
  result: 'pass' | 'fail' | 'skip'
  detail: string
}

type TestResult = {
  allowed: boolean
  reason: string
  chain: ChainStep[]
  scope?: string
}

type User = {
  id: string
  full_name: string
  email: string
  role?: {
    display_name: string
  }
}

type Permission = {
  id: string
  code: string
  name: string
  object_type: string
  action: string
}

export function PermissionTestPage() {
  const [userId, setUserId] = useState<string>('')
  const [permissionCode, setPermissionCode] = useState<string>('')
  const [entityId, setEntityId] = useState<string>('')
  const [userSearch, setUserSearch] = useState('')
  const [testResult, setTestResult] = useState<TestResult | null>(null)

  const usersQuery = trpc.users.list.useQuery({
    search: userSearch || undefined,
    status: 'active',
    page: 1,
    pageSize: 50,
  })

  const permissionsQuery = trpc.permissions.getAllPermissions.useQuery()

  const testQuery = trpc.permissions.testPermission.useQuery(
    {
      userId,
      permissionCode,
      entityId: entityId || undefined,
    },
    {
      enabled: false,
    }
  )

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Permissions', href: '/employee/admin/permissions' },
    { label: 'Test' },
  ]

  const handleTest = async () => {
    if (!userId || !permissionCode) return
    const result = await testQuery.refetch()
    if (result.data) {
      setTestResult(result.data)
    }
  }

  const selectedUser = usersQuery.data?.items.find((u: User) => u.id === userId)

  const getStepIcon = (result: 'pass' | 'fail' | 'skip') => {
    switch (result) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'skip':
        return <MinusCircle className="w-5 h-5 text-charcoal-400" />
    }
  }

  const getStepBg = (result: 'pass' | 'fail' | 'skip') => {
    switch (result) {
      case 'pass':
        return 'bg-green-50 border-green-200'
      case 'fail':
        return 'bg-red-50 border-red-200'
      case 'skip':
        return 'bg-charcoal-50 border-charcoal-200'
    }
  }

  return (
    <DashboardShell
      title="Test Permission"
      description="Test if a user has a specific permission with detailed evaluation chain"
      breadcrumbs={breadcrumbs}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Form */}
        <DashboardSection>
          <div className="space-y-6">
            <div>
              <Label htmlFor="user" className="text-sm font-medium text-charcoal-700">
                Select User
              </Label>
              <div className="mt-1.5 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                  <Input
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={userId} onValueChange={setUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user to test" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersQuery.data?.items.map((user: User) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex flex-col">
                          <span>{user.full_name}</span>
                          <span className="text-xs text-charcoal-500">
                            {user.email} - {user.role?.display_name || 'No role'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="permission" className="text-sm font-medium text-charcoal-700">
                Permission
              </Label>
              <Select value={permissionCode} onValueChange={setPermissionCode}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select permission to test" />
                </SelectTrigger>
                <SelectContent>
                  {permissionsQuery.data?.map((perm: Permission) => (
                    <SelectItem key={perm.id} value={perm.code}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-1.5 py-0.5 bg-charcoal-100 rounded">
                          {perm.object_type}
                        </span>
                        <span>{perm.name}</span>
                        <span className="text-xs text-charcoal-500">({perm.code})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="entityId" className="text-sm font-medium text-charcoal-700">
                Entity ID (Optional)
              </Label>
              <Input
                id="entityId"
                placeholder="UUID of specific entity to check scope against"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                className="mt-1.5"
              />
              <p className="text-xs text-charcoal-500 mt-1">
                Provide an entity ID to test data scope restrictions
              </p>
            </div>

            <Button
              onClick={handleTest}
              disabled={!userId || !permissionCode || testQuery.isFetching}
              className="w-full bg-hublot-900 hover:bg-hublot-800 text-white"
            >
              <FlaskConical className="w-4 h-4 mr-2" />
              {testQuery.isFetching ? 'Testing...' : 'Test Permission'}
            </Button>
          </div>
        </DashboardSection>

        {/* Test Results */}
        <DashboardSection>
          <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Test Results</h3>

          {!testResult ? (
            <div className="text-center py-12 text-charcoal-500">
              <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Select a user and permission, then click &quot;Test Permission&quot; to see results.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Result Summary */}
              <div
                className={`p-4 rounded-lg border-2 ${
                  testResult.allowed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {testResult.allowed ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-500" />
                  )}
                  <div>
                    <div className="font-semibold text-lg">
                      {testResult.allowed ? 'Permission Granted' : 'Permission Denied'}
                    </div>
                    <div className="text-sm text-charcoal-600">{testResult.reason}</div>
                    {testResult.scope && (
                      <div className="text-sm mt-1">
                        <span className="text-charcoal-500">Scope:</span>{' '}
                        <span className="font-medium">{testResult.scope}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User Info */}
              {selectedUser && (
                <div className="p-3 bg-charcoal-50 rounded-lg">
                  <div className="text-sm">
                    <span className="text-charcoal-500">Testing as:</span>{' '}
                    <span className="font-medium">{selectedUser.full_name}</span>
                    <span className="text-charcoal-400 ml-2">
                      ({selectedUser.role?.display_name || 'No role'})
                    </span>
                  </div>
                </div>
              )}

              {/* Evaluation Chain */}
              <div>
                <h4 className="text-sm font-semibold text-charcoal-700 mb-3">
                  Evaluation Chain
                </h4>
                <div className="space-y-2">
                  {testResult.chain.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        {getStepIcon(step.result)}
                        {idx < testResult.chain.length - 1 && (
                          <div className="w-0.5 h-6 bg-charcoal-200 my-1" />
                        )}
                      </div>
                      <div
                        className={`flex-1 p-3 rounded-lg border ${getStepBg(step.result)}`}
                      >
                        <div className="font-medium text-sm">{step.step}</div>
                        <div className="text-xs text-charcoal-600 mt-0.5">
                          {step.detail}
                        </div>
                      </div>
                      {idx < testResult.chain.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-charcoal-300 mt-3 hidden sm:block" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DashboardSection>
      </div>
    </DashboardShell>
  )
}
