'use client';

/**
 * Permissions Matrix Widget
 *
 * Displays a role-permission grid with checkboxes.
 * Groups permissions by module and shows effective permissions for a user.
 */

import React, { useState } from 'react';
import { Shield, Check, X, ChevronDown, ChevronRight, Info, Lock, Unlock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

// Permission modules and their permissions
const PERMISSION_MODULES = [
  {
    id: 'crm',
    name: 'CRM',
    permissions: [
      { id: 'accounts.view', label: 'View Accounts' },
      { id: 'accounts.create', label: 'Create Accounts' },
      { id: 'accounts.edit', label: 'Edit Accounts' },
      { id: 'accounts.delete', label: 'Delete Accounts' },
      { id: 'leads.view', label: 'View Leads' },
      { id: 'leads.create', label: 'Create Leads' },
      { id: 'leads.convert', label: 'Convert Leads' },
      { id: 'deals.view', label: 'View Deals' },
      { id: 'deals.create', label: 'Create Deals' },
      { id: 'deals.close', label: 'Close Deals' },
    ],
  },
  {
    id: 'recruiting',
    name: 'Recruiting',
    permissions: [
      { id: 'jobs.view', label: 'View Jobs' },
      { id: 'jobs.create', label: 'Create Jobs' },
      { id: 'jobs.edit', label: 'Edit Jobs' },
      { id: 'candidates.view', label: 'View Candidates' },
      { id: 'candidates.create', label: 'Create Candidates' },
      { id: 'submissions.view', label: 'View Submissions' },
      { id: 'submissions.create', label: 'Submit Candidates' },
      { id: 'interviews.schedule', label: 'Schedule Interviews' },
      { id: 'offers.create', label: 'Create Offers' },
      { id: 'placements.view', label: 'View Placements' },
    ],
  },
  {
    id: 'bench',
    name: 'Bench Sales',
    permissions: [
      { id: 'consultants.view', label: 'View Consultants' },
      { id: 'consultants.create', label: 'Add Consultants' },
      { id: 'consultants.edit', label: 'Edit Consultants' },
      { id: 'vendors.view', label: 'View Vendors' },
      { id: 'vendors.manage', label: 'Manage Vendors' },
      { id: 'jobOrders.view', label: 'View Job Orders' },
      { id: 'marketing.manage', label: 'Manage Marketing' },
      { id: 'hotlists.send', label: 'Send Hotlists' },
    ],
  },
  {
    id: 'hr',
    name: 'HR',
    permissions: [
      { id: 'employees.view', label: 'View Employees' },
      { id: 'employees.manage', label: 'Manage Employees' },
      { id: 'pods.view', label: 'View Pods' },
      { id: 'pods.manage', label: 'Manage Pods' },
      { id: 'documents.view', label: 'View Documents' },
      { id: 'documents.manage', label: 'Manage Documents' },
      { id: 'learning.view', label: 'View Learning' },
      { id: 'learning.manage', label: 'Manage Learning' },
    ],
  },
  {
    id: 'admin',
    name: 'Admin',
    permissions: [
      { id: 'users.view', label: 'View Users' },
      { id: 'users.create', label: 'Create Users' },
      { id: 'users.edit', label: 'Edit Users' },
      { id: 'users.delete', label: 'Delete Users' },
      { id: 'roles.manage', label: 'Manage Roles' },
      { id: 'settings.view', label: 'View Settings' },
      { id: 'settings.manage', label: 'Manage Settings' },
      { id: 'audit.view', label: 'View Audit Logs' },
      { id: 'integrations.manage', label: 'Manage Integrations' },
    ],
  },
];

interface PermissionRowProps {
  permission: { id: string; label: string };
  granted: boolean;
  inherited: boolean;
  readOnly?: boolean;
  onToggle?: (id: string, granted: boolean) => void;
}

function PermissionRow({ permission, granted, inherited, readOnly, onToggle }: PermissionRowProps) {
  return (
    <div className={cn(
      "flex items-center justify-between py-2 px-3 rounded-lg transition-colors",
      "hover:bg-charcoal-50"
    )}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-charcoal-700">{permission.label}</span>
        {inherited && (
          <span className="text-[10px] text-charcoal-400 bg-charcoal-100 px-1.5 py-0.5 rounded">
            inherited
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {readOnly ? (
          <div className={cn(
            "w-6 h-6 rounded-md flex items-center justify-center",
            granted ? "bg-success-100 text-success-600" : "bg-charcoal-100 text-charcoal-400"
          )}>
            {granted ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </div>
        ) : (
          <button
            onClick={() => onToggle?.(permission.id, !granted)}
            className={cn(
              "w-6 h-6 rounded-md flex items-center justify-center transition-colors",
              granted
                ? "bg-success-500 text-white hover:bg-success-600"
                : "bg-charcoal-200 text-charcoal-400 hover:bg-charcoal-300"
            )}
          >
            {granted ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

interface ModuleSectionProps {
  module: typeof PERMISSION_MODULES[0];
  permissions: Record<string, boolean>;
  inheritedPermissions: Record<string, boolean>;
  readOnly?: boolean;
  onToggle?: (id: string, granted: boolean) => void;
}

function ModuleSection({ module, permissions, inheritedPermissions, readOnly, onToggle }: ModuleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const grantedCount = module.permissions.filter(p => permissions[p.id] || inheritedPermissions[p.id]).length;

  return (
    <div className="border border-charcoal-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between p-3 bg-charcoal-50",
          "hover:bg-charcoal-100 transition-colors"
        )}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-charcoal-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-charcoal-500" />
          )}
          <span className="font-medium text-charcoal-900">{module.name}</span>
        </div>
        <span className={cn(
          "text-xs font-bold px-2 py-0.5 rounded-full",
          grantedCount === module.permissions.length
            ? "bg-success-100 text-success-700"
            : grantedCount > 0
              ? "bg-gold-100 text-gold-700"
              : "bg-charcoal-100 text-charcoal-500"
        )}>
          {grantedCount}/{module.permissions.length}
        </span>
      </button>
      {isExpanded && (
        <div className="divide-y divide-charcoal-50">
          {module.permissions.map(permission => (
            <PermissionRow
              key={permission.id}
              permission={permission}
              granted={permissions[permission.id] || inheritedPermissions[permission.id] || false}
              inherited={inheritedPermissions[permission.id] && !permissions[permission.id]}
              readOnly={readOnly}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PermissionsMatrix({ definition, data, context }: SectionWidgetProps) {
  const isLoading = context?.isLoading;
  const readOnly = (definition as { componentProps?: { readOnly?: boolean } }).componentProps?.readOnly ?? true;

  // Extract permissions from data - would come from user's role
  const userPermissions = (data as { permissions?: Record<string, boolean> })?.permissions || {};
  const inheritedPermissions = (data as { inheritedPermissions?: Record<string, boolean> })?.inheritedPermissions || {};

  const [localPermissions, setLocalPermissions] = useState<Record<string, boolean>>(userPermissions);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (permissionId: string, granted: boolean) => {
    setLocalPermissions(prev => ({ ...prev, [permissionId]: granted }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Would call tRPC mutation to save permissions
    console.log('Saving permissions:', localPermissions);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalPermissions(userPermissions);
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-forest-100 rounded-lg animate-pulse" />
            <div className="h-6 w-40 bg-stone-200 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-stone-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPermissions = PERMISSION_MODULES.reduce((sum, m) => sum + m.permissions.length, 0);
  const grantedTotal = PERMISSION_MODULES.reduce((sum, module) => {
    return sum + module.permissions.filter(p =>
      localPermissions[p.id] || inheritedPermissions[p.id]
    ).length;
  }, 0);

  return (
    <Card className="border-charcoal-100 shadow-elevation-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-forest rounded-lg flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
                {(typeof definition.title === 'string' ? definition.title : 'Effective Permissions') || 'Effective Permissions'}
              </CardTitle>
              <p className="text-sm text-charcoal-500 mt-0.5">
                {grantedTotal} of {totalPermissions} permissions granted
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {readOnly ? (
              <span className="flex items-center gap-1 text-xs text-charcoal-500 bg-charcoal-100 px-2 py-1 rounded-full">
                <Lock className="w-3 h-3" />
                Read-only
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-forest-600 bg-forest-50 px-2 py-1 rounded-full">
                <Unlock className="w-3 h-3" />
                Editable
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {PERMISSION_MODULES.map(module => (
            <ModuleSection
              key={module.id}
              module={module}
              permissions={localPermissions}
              inheritedPermissions={inheritedPermissions}
              readOnly={readOnly}
              onToggle={handleToggle}
            />
          ))}
        </div>

        {/* Action buttons for editable mode */}
        {!readOnly && hasChanges && (
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-charcoal-100">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-charcoal-100 text-xs text-charcoal-500">
          <div className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>Legend:</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-success-100 rounded flex items-center justify-center">
              <Check className="w-3 h-3 text-success-600" />
            </div>
            <span>Granted</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-charcoal-100 rounded flex items-center justify-center">
              <X className="w-3 h-3 text-charcoal-400" />
            </div>
            <span>Denied</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="bg-charcoal-100 px-1.5 py-0.5 rounded text-[10px]">inherited</span>
            <span>From role</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PermissionsMatrix;
