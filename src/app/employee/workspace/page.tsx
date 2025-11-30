/**
 * Workspace Dashboard
 *
 * Role-based central hub with personalized widgets, metrics, and quick actions.
 * Automatically adapts to the user's specific role(s):
 * - IC: Recruiter, Bench Sales, TA Specialist
 * - Manager: Recruiting Manager, Bench Manager, TA Manager (with optional IC view)
 * - Executive: CEO, COO, CFO
 * - Functional: HR, Admin
 *
 * Users with multiple roles can switch between role-specific dashboards.
 */

'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Settings, Users, Briefcase, TrendingUp, Shield, Building2, DollarSign, UserCog } from 'lucide-react';
import { RoleDashboard } from '@/components/workspaces/dashboard';
import { roleConfigs, type WorkspaceRole } from '@/lib/workspace/role-config';
import { getWorkspaceRole } from '@/lib/workspace/role-mapping';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trpc } from '@/lib/trpc/client';

// Import all consoles
import {
  RecruiterConsole,
  BenchSalesConsole,
  TAConsole,
  ManagerConsole,
  CEOConsole,
  COOConsole,
  CFOConsole,
  HRConsole,
  AdminConsole,
  type ManagerType,
} from '@/components/workspaces/consoles';

// Import role hierarchy utilities
import {
  getSpecificRolesForUser,
  getPrimarySpecificRole,
  getCombinedRoleTitle,
  getSpecificRoleLabel,
} from '@/lib/workspace/role-hierarchy';
import type { SpecificRole } from '@/lib/workspace/specific-role-config';

// Map specific roles to their console components
const SPECIFIC_ROLE_CONSOLES: Record<SpecificRole, React.ComponentType<any>> = {
  technical_recruiter: RecruiterConsole,
  bench_sales_recruiter: BenchSalesConsole,
  ta_specialist: TAConsole,
  recruiting_manager: ManagerConsole,
  bench_manager: ManagerConsole,
  ta_manager: ManagerConsole,
  hr: HRConsole,
  admin: AdminConsole,
  ceo: CEOConsole,
  coo: COOConsole,
  cfo: CFOConsole,
};

// Map manager specific roles to their ManagerType
const MANAGER_TYPE_MAP: Record<string, ManagerType> = {
  recruiting_manager: 'recruiting',
  bench_manager: 'bench',
  ta_manager: 'ta',
};

// Role display config with icons
const ROLE_DISPLAY_CONFIG: Record<SpecificRole, { label: string; icon: React.ElementType; description: string }> = {
  technical_recruiter: { label: 'Recruiter', icon: Briefcase, description: 'Recruiting operations' },
  bench_sales_recruiter: { label: 'Bench Sales', icon: Users, description: 'Consultant marketing' },
  ta_specialist: { label: 'TA Specialist', icon: TrendingUp, description: 'Business development' },
  recruiting_manager: { label: 'Recruiting Manager', icon: UserCog, description: 'Team & operations' },
  bench_manager: { label: 'Bench Manager', icon: UserCog, description: 'Team & operations' },
  ta_manager: { label: 'TA Manager', icon: UserCog, description: 'Team & operations' },
  hr: { label: 'HR', icon: Users, description: 'People operations' },
  admin: { label: 'Admin', icon: Shield, description: 'System administration' },
  ceo: { label: 'CEO', icon: Building2, description: 'Executive overview' },
  coo: { label: 'COO', icon: Building2, description: 'Operations overview' },
  cfo: { label: 'CFO', icon: DollarSign, description: 'Financial overview' },
};

// IC roles that can be combined with manager roles
const IC_ROLES: SpecificRole[] = ['technical_recruiter', 'bench_sales_recruiter', 'ta_specialist'];

function WorkspaceDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch user's system roles for auto-detection
  const { data: userRoles, isLoading: rolesLoading } = trpc.auth.getUserRoles.useQuery();

  // Compute specific roles from user's system roles
  const specificRoles = useMemo(() => {
    if (!userRoles || userRoles.length === 0) return ['technical_recruiter'] as SpecificRole[];
    return getSpecificRolesForUser(userRoles);
  }, [userRoles]);

  // State for selected role (for multi-role users)
  const [activeRole, setActiveRole] = useState<SpecificRole | null>(null);

  // Set initial active role when specific roles are loaded
  useEffect(() => {
    if (specificRoles.length > 0 && !activeRole) {
      // Check URL param for specific role override
      const roleParam = searchParams.get('specificRole') as SpecificRole | null;
      if (roleParam && specificRoles.includes(roleParam)) {
        setActiveRole(roleParam);
      } else {
        setActiveRole(specificRoles[0]);
      }
    }
  }, [specificRoles, activeRole, searchParams]);

  // Get current role for display
  const currentRole = activeRole || specificRoles[0] || 'technical_recruiter';

  // Check if user has multiple roles
  const hasMultipleRoles = specificRoles.length > 1;

  // Check if current role is a manager role
  const isManagerRole = ['recruiting_manager', 'bench_manager', 'ta_manager'].includes(currentRole);

  // Check if user has IC role in addition to manager role
  const hasICRole = useMemo(() => {
    return specificRoles.some(r => IC_ROLES.includes(r));
  }, [specificRoles]);

  // Get manager type if applicable
  const managerType = useMemo((): ManagerType | undefined => {
    return MANAGER_TYPE_MAP[currentRole as string];
  }, [currentRole]);

  // Handle role switch
  const handleRoleSwitch = (role: SpecificRole) => {
    setActiveRole(role);
    // Update URL param
    const url = new URL(window.location.href);
    url.searchParams.set('specificRole', role);
    router.push(url.pathname + url.search);
  };

  // Get role display info
  const getRoleDisplay = (role: SpecificRole) => {
    return ROLE_DISPLAY_CONFIG[role] || { label: role, icon: Briefcase, description: '' };
  };

  // Render the appropriate console based on current role
  const renderConsole = () => {
    // Loading state
    if (rolesLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      );
    }

    // Get the console component for the current role
    const ConsoleComponent = SPECIFIC_ROLE_CONSOLES[currentRole];

    if (!ConsoleComponent) {
      // Fallback
      return <RecruiterConsole />;
    }

    // For manager roles, pass the manager type and hasICRole
    if (managerType) {
      return <ManagerConsole managerType={managerType} hasICRole={hasICRole} />;
    }

    // For other roles, render the console directly
    return <ConsoleComponent />;
  };

  const currentRoleDisplay = getRoleDisplay(currentRole);
  const CurrentIcon = currentRoleDisplay.icon;

  return (
    <ScrollArea className="h-full">
      <div className="min-h-screen bg-background">
        {/* Role Switcher - Shows when user has multiple roles */}
        <div className="absolute top-4 right-4 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={hasMultipleRoles ? "default" : "outline"}
                size="sm"
                className={cn(
                  "gap-2",
                  hasMultipleRoles && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                <CurrentIcon className="w-4 h-4" />
                {currentRoleDisplay.label}
                {hasMultipleRoles && (
                  <>
                    <span className="text-xs opacity-75">+{specificRoles.length - 1}</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {hasMultipleRoles ? (
                <>
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Switch Dashboard View
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={currentRole}
                    onValueChange={(value) => handleRoleSwitch(value as SpecificRole)}
                  >
                    {specificRoles.map((role) => {
                      const display = getRoleDisplay(role);
                      const Icon = display.icon;
                      return (
                        <DropdownMenuRadioItem
                          key={role}
                          value={role}
                          className="flex items-start gap-3 py-3 cursor-pointer"
                        >
                          <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                          <div className="flex flex-col">
                            <span className="font-medium">{display.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {display.description}
                            </span>
                          </div>
                        </DropdownMenuRadioItem>
                      );
                    })}
                  </DropdownMenuRadioGroup>
                </>
              ) : (
                <div className="p-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <CurrentIcon className="w-4 h-4" />
                    <span className="font-medium">{currentRoleDisplay.label}</span>
                  </div>
                  <p className="text-xs">{currentRoleDisplay.description}</p>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Role-Based Console */}
        {renderConsole()}
      </div>
    </ScrollArea>
  );
}

export default function WorkspaceDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <WorkspaceDashboardContent />
    </Suspense>
  );
}
