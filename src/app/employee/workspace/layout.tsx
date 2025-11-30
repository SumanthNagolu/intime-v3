/**
 * Unified Workspace Layout
 *
 * Provides the shell for all workspace pages with:
 * - Top header with user info and logout
 * - Navigation sidebar
 * - SlidePanel provider for contextual views
 * - Global workspace state
 */

'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Target,
  Building2,
  DollarSign,
  Briefcase,
  Users,
  Send,
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Pin,
  Clock,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SlidePanelProvider } from '@/components/workspaces/unified';
import { useWorkspaceStore, usePinnedItems, useRecentItems } from '@/stores/workspace-store';
import { getEntityConfig, type EntityType } from '@/lib/workspace';
import { trpc } from '@/lib/trpc/client';
import { createClient } from '@/lib/supabase/client';

// Navigation items
const NAV_ITEMS: { type: EntityType | 'dashboard' | 'pipeline' | 'analytics'; label: string; icon: typeof Target; href: string }[] = [
  { type: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/workspace' },
  { type: 'lead', label: 'Leads', icon: Target, href: '/employee/workspace/leads' },
  { type: 'account', label: 'Accounts', icon: Building2, href: '/employee/workspace/accounts' },
  { type: 'deal', label: 'Deals', icon: DollarSign, href: '/employee/workspace/deals' },
  { type: 'job', label: 'Jobs', icon: Briefcase, href: '/employee/workspace/jobs' },
  { type: 'talent', label: 'Talent', icon: Users, href: '/employee/workspace/talent' },
  { type: 'submission', label: 'Submissions', icon: Send, href: '/employee/workspace/submissions' },
  { type: 'pipeline', label: 'Pipeline', icon: TrendingUp, href: '/employee/workspace/pipeline' },
  { type: 'analytics', label: 'Analytics', icon: BarChart3, href: '/employee/workspace/analytics' },
];

function NavItem({
  item,
  isActive,
  count,
}: {
  item: typeof NAV_ITEMS[0];
  isActive: boolean;
  count?: number;
}) {
  const Icon = item.icon;

  return (
    <Link href={item.href}>
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
          isActive
            ? 'bg-rust/10 text-rust'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-sm font-medium">{item.label}</span>
        {count !== undefined && count > 0 && (
          <Badge variant="secondary" className="h-5 px-1.5 text-xs">
            {count}
          </Badge>
        )}
      </div>
    </Link>
  );
}

function PinnedSection() {
  const pinnedItems = usePinnedItems();
  const router = useRouter();

  if (pinnedItems.length === 0) return null;

  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
        <Pin className="w-3 h-3" />
        <span>Pinned</span>
      </div>
      <div className="space-y-1">
        {pinnedItems.slice(0, 5).map((item) => {
          const config = getEntityConfig(item.type);
          const Icon = config.icon;
          return (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => router.push(config.routes.detail(item.id))}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors"
            >
              <Icon className={cn('w-3.5 h-3.5', config.color)} />
              <span className="truncate flex-1">{item.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RecentSection() {
  const recentItems = useRecentItems();
  const router = useRouter();

  if (recentItems.length === 0) return null;

  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>Recent</span>
      </div>
      <div className="space-y-1">
        {recentItems.slice(0, 5).map((item) => {
          const config = getEntityConfig(item.type);
          const Icon = config.icon;
          return (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => router.push(config.routes.detail(item.id))}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left rounded hover:bg-muted transition-colors"
            >
              <Icon className={cn('w-3.5 h-3.5', config.color)} />
              <span className="truncate flex-1">{item.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WorkspaceHeader() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/employee');
  };

  return (
    <header className="h-14 border-b border-border bg-white flex items-center justify-between px-4 flex-shrink-0">
      {/* Logo & Brand */}
      <div className="flex items-center gap-4">
        <Link href="/employee/workspace" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-forest rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">IT</span>
          </div>
          <span className="font-heading font-bold text-lg text-charcoal">InTime</span>
        </Link>
        <div className="h-6 w-px bg-border" />
        <Link
          href="/employee/portal"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-charcoal transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
      </div>

      {/* Search (placeholder) */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search jobs, talent, accounts..."
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rust rounded-full" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-forest text-white text-xs">U</AvatarFallback>
              </Avatar>
              <ChevronRight className="w-4 h-4 text-muted-foreground rotate-90" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/employee/portal">
                <Home className="w-4 h-4 mr-2" />
                Employee Portal
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/employee/workspace">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Workspace
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-rust focus:text-rust">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Determine active nav item
  const activeType = NAV_ITEMS.find((item) =>
    item.href === '/employee/workspace'
      ? pathname === item.href
      : pathname.startsWith(item.href)
  )?.type;

  return (
    <SlidePanelProvider>
      <div className="flex flex-col h-screen bg-background overflow-hidden">
        {/* Top Header */}
        <WorkspaceHeader />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <aside className="w-56 flex-shrink-0 border-r border-border bg-stone-50/50 flex flex-col">
            {/* Sidebar Header */}
            <div className="h-12 flex items-center px-4 border-b border-border">
              <h2 className="font-semibold text-charcoal text-sm">Workspace</h2>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1">
              <nav className="p-2 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <NavItem
                    key={item.type}
                    item={item}
                    isActive={activeType === item.type}
                  />
                ))}
              </nav>

              {/* Divider */}
              <div className="my-2 mx-3 border-t border-border" />

              {/* Pinned Items */}
              <PinnedSection />

              {/* Recent Items */}
              <RecentSection />
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t border-border">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <ChevronRight className="w-4 h-4" />
                Collapse
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SlidePanelProvider>
  );
}
