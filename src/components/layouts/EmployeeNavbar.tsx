'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Users,
  TrendingUp,
  Target,
  Briefcase,
  GraduationCap,
  Database,
  LogOut,
  LayoutDashboard,
  Building2,
  DollarSign,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationLinks = [
  {
    name: 'Portal',
    href: '/employee/portal',
    icon: Shield,
  },
  {
    name: 'Recruiting',
    href: '/employee/recruiting/dashboard',
    icon: Users,
  },
  {
    name: 'Bench Sales',
    href: '/employee/bench/dashboard',
    icon: TrendingUp,
  },
  {
    name: 'Talent Acquisition',
    href: '/employee/ta/dashboard',
    icon: Target,
  },
  {
    name: 'HR',
    href: '/employee/hr/dashboard',
    icon: Briefcase,
  },
  {
    name: 'Academy',
    href: '/employee/academy/admin/dashboard',
    icon: GraduationCap,
  },
  {
    name: 'Shared',
    href: '/employee/shared/combined',
    icon: Database,
  },
];

// Sub-navigation for recruiting
const recruitingSubNav = [
  {
    name: 'Console',
    href: '/employee/recruiting/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Jobs',
    href: '/employee/recruiting/jobs',
    icon: Briefcase,
  },
  {
    name: 'Accounts',
    href: '/employee/recruiting/accounts',
    icon: Building2,
  },
  {
    name: 'Leads',
    href: '/employee/recruiting/leads',
    icon: Target,
  },
  {
    name: 'Deals',
    href: '/employee/recruiting/deals',
    icon: DollarSign,
  },
  {
    name: 'Pipeline',
    href: '/employee/recruiting/pipeline',
    icon: List,
  },
];

export function EmployeeNavbar() {
  const pathname = usePathname();

  // Determine which section we're in for sub-navigation
  const isRecruiting = pathname?.startsWith('/employee/recruiting');

  return (
    <nav className="border-b border-white/10 bg-[#0D0D0F]/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/employee/portal" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-500/20 rounded-lg flex items-center justify-center">
              <Shield size={20} className="text-gold-400" />
            </div>
            <span className="text-lg font-heading font-bold text-white">
              InTime OS
            </span>
          </Link>

          {/* Section-Specific Navigation */}
          <div className="flex items-center gap-1 flex-1 justify-center">
            {isRecruiting && recruitingSubNav.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href ||
                (link.href === '/employee/recruiting/jobs' && pathname?.startsWith('/employee/recruiting/jobs'));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all',
                    isActive
                      ? 'bg-gold-500/20 text-gold-400'
                      : 'text-charcoal-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon size={14} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <Link
              href="/api/auth/signout"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-charcoal-400 hover:text-white transition-colors"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default EmployeeNavbar;
