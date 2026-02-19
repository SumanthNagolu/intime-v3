'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User, Mic, Map, Menu, X, Cpu, ChevronDown, List, Layers, Sparkles, LogOut, FileText, Bell, Briefcase, Users, Globe, TrendingUp, LayoutDashboard, Search, Clock, Activity, Plus, DollarSign, UserPlus, Network, BarChart3, GraduationCap, Settings, Award, Rocket, Megaphone, Plane, CheckCircle, Building2, Download, ShieldCheck, Target, Lock, Terminal, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useStudentEnrollment } from '@/hooks/useStudentEnrollment';
import { trpc } from '@/lib/trpc/client';
import type { Role } from '@/lib/types';

// Navigation structures based on role
// Student nav is computed dynamically based on enrollment state
const STUDENT_NAV_ENROLLED: { title: string; icon: any; items: { label: string; path: string; icon: any }[] }[] = [
  { title: "Learn", icon: BookOpen, items: [{ label: "Learn", path: "/academy/learn", icon: BookOpen }] },
  { title: "Practice", icon: Mic, items: [{ label: "Practice", path: "/academy/practice", icon: Mic }] },
  { title: "Profile", icon: User, items: [{ label: "Profile", path: "/academy/profile", icon: User }] },
];

const STUDENT_NAV_NOT_ENROLLED: { title: string; icon: any; items: { label: string; path: string; icon: any }[] }[] = [
  { title: "Explore", icon: Layers, items: [{ label: "Explore", path: "/academy/explore", icon: Layers }] },
];

const ROLE_NAV: Record<Role, { title: string; icon: any; items: { label: string; path: string; icon: any }[] }[]> = {
  // --- 1. ACADEMY (Student) --- (dynamic, see STUDENT_NAV_* above; default to not-enrolled)
  student: STUDENT_NAV_NOT_ENROLLED,

  // --- 2. CLIENT PORTAL (External Client) ---
  client: [
      {
          title: "My Hiring",
          icon: Briefcase,
          items: [
              { label: "Dashboard", path: "/client/dashboard", icon: LayoutDashboard },
              { label: "Active Reqs", path: "/client/jobs", icon: List },
              { label: "Pipeline", path: "/client/pipeline", icon: Users },
          ]
      }
  ],

  // --- 3. TALENT PORTAL (External Consultant) ---
  consultant: [
      {
          title: "My Bench",
          icon: User,
          items: [
              { label: "Dashboard", path: "/talent/dashboard", icon: LayoutDashboard },
              { label: "Job Matches", path: "/talent/jobs", icon: Briefcase },
              { label: "My Profile", path: "/talent/profile", icon: User },
          ]
      }
  ],

  // --- 4. EMPLOYEE / HR (Internal Roles) ---

  // 1. Bench Sales
  bench_manager: [
      {
          title: "Bench Ops",
          icon: Users,
          items: [
              { label: "Console", path: "/employee/bench/dashboard", icon: LayoutDashboard },
              { label: "Talent", path: "/employee/bench/talent", icon: User },
              { label: "Leads", path: "/employee/bench/leads", icon: Target },
              { label: "Deals", path: "/employee/bench/deals", icon: DollarSign },
              { label: "Jobs", path: "/employee/bench/jobs", icon: Briefcase },
              { label: "Pipeline", path: "/employee/bench/pipeline", icon: List }
          ]
      },
      {
          title: "Shared Intel",
          icon: Globe,
          items: [
              { label: "Unified Talent", path: "/employee/shared/talent", icon: Users },
              { label: "Job Board", path: "/employee/shared/jobs", icon: Briefcase },
              { label: "Combined View", path: "/employee/shared/combined", icon: Layers }
          ]
      }
  ],

  // 2. Recruiter
  recruiter: [
      {
          title: "Recruiting Ops",
          icon: Briefcase,
          items: [
              { label: "Console", path: "/employee/recruiting/dashboard", icon: LayoutDashboard },
              { label: "Leads", path: "/employee/recruiting/leads", icon: Target },
              { label: "Deals", path: "/employee/recruiting/deals", icon: DollarSign },
              { label: "Jobs", path: "/employee/recruiting/jobs", icon: Briefcase },
              { label: "Pipeline", path: "/employee/recruiting/pipeline", icon: List },
          ]
      },
      {
          title: "Shared Intel",
          icon: Globe,
          items: [
              { label: "Unified Talent", path: "/employee/shared/talent", icon: Users },
              { label: "Job Board", path: "/employee/shared/jobs", icon: Briefcase },
              { label: "Combined View", path: "/employee/shared/combined", icon: Layers }
          ]
      }
  ],

  // 3. Sales Specialist (TA)
  ta_specialist: [
      {
          title: "Sales Ops",
          icon: UserPlus,
          items: [
              { label: "Console", path: "/employee/ta/dashboard", icon: LayoutDashboard },
              { label: "Campaigns", path: "/employee/ta/campaigns", icon: Megaphone },
              { label: "Leads", path: "/employee/ta/leads", icon: Target },
              { label: "Deals", path: "/employee/ta/deals", icon: DollarSign },
          ]
      },
      {
          title: "Shared Intel",
          icon: Globe,
          items: [
              { label: "Unified Talent", path: "/employee/shared/talent", icon: Users },
              { label: "Job Board", path: "/employee/shared/jobs", icon: Briefcase }
          ]
      }
  ],

  // 4. Academy Coordinator
  academy_admin: [
      {
          title: "Training Ops",
          icon: GraduationCap,
          items: [
              { label: "Instructor Dash", path: "/employee/academy/admin/dashboard", icon: LayoutDashboard },
              { label: "Enrollments", path: "/employee/academy/admin/enrollments", icon: UserPlus },
              { label: "Certificates", path: "/employee/academy/admin/certificates", icon: Award },
              { label: "Course Builder", path: "/employee/academy/admin/courses", icon: Layers },
          ]
      },
      {
          title: "Intel",
          icon: Globe,
          items: [
              { label: "Unified Talent", path: "/employee/shared/talent", icon: Users }
          ]
      }
  ],

  // 5. Immigration
  cross_border_specialist: [
      {
          title: "Mobility",
          icon: Plane,
          items: [
              { label: "Dashboard", path: "/employee/immigration/dashboard", icon: LayoutDashboard },
          ]
      },
      {
          title: "Intel",
          icon: Globe,
          items: [
              { label: "Unified Talent", path: "/employee/shared/talent", icon: Users }
          ]
      }
  ],

  // 6. HR Manager
  hr_admin: [
    {
      title: "Workforce",
      icon: Users,
      items: [
        { label: "Dashboard", path: "/employee/hr/dashboard", icon: LayoutDashboard },
        { label: "Directory", path: "/employee/hr/people", icon: Users },
        { label: "Org Structure", path: "/employee/hr/org", icon: Network }
      ]
    },
    {
      title: "Ops",
      icon: Briefcase,
      items: [
        { label: "Time", path: "/employee/hr/time", icon: Clock },
        { label: "Payroll", path: "/employee/hr/payroll", icon: DollarSign },
        { label: "Docs", path: "/employee/hr/documents", icon: FileText }
      ]
    },
    {
      title: "Growth",
      icon: TrendingUp,
      items: [
        { label: "Performance", path: "/employee/hr/performance", icon: Activity },
        { label: "L&D", path: "/employee/hr/learning", icon: GraduationCap },
        { label: "Hiring", path: "/employee/hr/recruitment", icon: UserPlus },
      ]
    }
  ],

  // 7. Admin
  admin: [
      {
          title: "Control",
          icon: ShieldCheck,
          items: [
              { label: "Mission Control", path: "/employee/admin/dashboard", icon: Activity },
              { label: "User Management", path: "/employee/admin/users", icon: Users },
              { label: "Permissions", path: "/employee/admin/permissions", icon: Lock },
              { label: "Course Content", path: "/employee/admin/courses", icon: BookOpen },
          ]
      },
      {
          title: "System",
          icon: Terminal,
          items: [
              { label: "Audit Logs", path: "/employee/admin/audit", icon: FileText },
              { label: "Configuration", path: "/employee/admin/settings", icon: Settings }
          ]
      }
  ],

  // 8. CEO
  ceo: [
      {
          title: "Strategy",
          icon: Activity,
          items: [
              { label: "Executive Dash", path: "/employee/ceo/dashboard", icon: LayoutDashboard },
              { label: "Financials", path: "/employee/ceo/financials", icon: TrendingUp },
              { label: "Strategic Plan", path: "/employee/ceo/strategy", icon: Map }
          ]
      },
      {
          title: "Intel",
          icon: Globe,
          items: [
              { label: "Shared Job Board", path: "/employee/shared/jobs", icon: Briefcase },
              { label: "Combined View", path: "/employee/shared/combined", icon: Layers }
          ]
      }
  ],
};

// Role-specific dashboard paths (student is dynamic, default to explore)
const DASHBOARD_PATHS: Record<Role, string> = {
  student: '/academy/explore',
  client: '/client/dashboard',
  consultant: '/talent/dashboard',
  bench_manager: '/employee/bench/dashboard',
  recruiter: '/employee/recruiting/dashboard',
  ta_specialist: '/employee/ta/dashboard',
  academy_admin: '/employee/academy/admin/dashboard',
  cross_border_specialist: '/employee/immigration/dashboard',
  hr_admin: '/employee/hr/dashboard',
  admin: '/employee/admin/dashboard',
  ceo: '/employee/ceo/dashboard',
};

// Defined order for internal role switcher
const INTERNAL_ROLES: Role[] = [
    'bench_manager',
    'recruiter',
    'ta_specialist',
    'academy_admin',
    'cross_border_specialist',
    'hr_admin',
    'admin',
    'ceo'
];

const getRoleLabel = (role: Role): string => {
  const labels: Record<Role, string> = {
    bench_manager: 'Bench Sales',
    recruiter: 'Recruiter',
    ta_specialist: 'Sales Specialist',
    academy_admin: 'Academy Coordinator',
    cross_border_specialist: 'Immigration',
    hr_admin: 'HR Manager',
    admin: 'System Admin',
    ceo: 'CEO',
    student: 'Student',
    client: 'Client',
    consultant: 'Talent',
  };
  return labels[role] ?? (role as string).toUpperCase();
};

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { activeRole, setActiveRole } = useAppStore();
  const navRef = useRef<HTMLElement>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const isPublic = pathname === '/' || pathname === '/academy' || pathname === '/clients' || pathname === '/login' || pathname.startsWith('/verify-certificate') || pathname.startsWith('/auth/');
  const isLoginPage = pathname === '/login';

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');
  const isGroupActive = (items: { path: string }[]) => items.some(item => isActive(item.path));

  // Fetch real user profile
  const { data: meData } = trpc.users.getMe.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
    retry: false,
    enabled: !isPublic,
  });

  // Determine if user has an internal role (admin, recruiter, etc.)
  const isAcademyRoute = pathname.startsWith('/academy');
  const hasInternalRole = meData?.role && !['student', 'client', 'consultant'].includes(meData.role.code);

  // On academy routes: internal users become 'subscriber', others stay 'student'
  const effectiveRole = isAcademyRoute
    ? (hasInternalRole ? 'student' : 'student')
    : activeRole;

  // Dynamic enrollment-aware student nav
  const { isEnrolled, isLoading: enrollmentLoading } = useStudentEnrollment();

  // Internal users on academy routes are always treated as enrolled (full access)
  const effectivelyEnrolled = isEnrolled || (isAcademyRoute && hasInternalRole);

  const isInternal = !['student', 'client', 'consultant'].includes(effectiveRole);

  // User display info
  const userName = meData?.fullName || 'User';
  const userInitial = userName.charAt(0).toUpperCase();
  const academyRoleLabel = hasInternalRole ? 'Subscriber' : 'Student';
  const activeNavStructure = effectiveRole === 'student'
    ? (effectivelyEnrolled ? STUDENT_NAV_ENROLLED : STUDENT_NAV_NOT_ENROLLED)
    : (ROLE_NAV[effectiveRole] || []);

  // Logo navigates to role-specific dashboard (or landing page if on public route)
  const studentDashboard = effectivelyEnrolled ? '/academy/learn' : '/academy/explore';
  const logoHref = isPublic ? '/' : (effectiveRole === 'student' ? studentDashboard : (DASHBOARD_PATHS[effectiveRole] ?? '/'));

  // Close all popups
  const closeAll = useCallback(() => {
    setActiveDropdown(null);
    setIsProfileOpen(false);
    setIsRoleSwitcherOpen(false);
    setIsNotificationsOpen(false);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        closeAll();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeAll]);

  // Close dropdowns on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAll();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeAll]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    closeAll();
  }, [pathname, closeAll]);

  const handleLogout = () => {
    router.push('/');
    closeAll();
  };

  const handleRoleSwitch = (role: Role) => {
    setActiveRole(role);
    setIsRoleSwitcherOpen(false);
    const path = DASHBOARD_PATHS[role];
    if (path) router.push(path);
  };

  return (
    <nav ref={navRef} className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className={cn(
        "pointer-events-auto w-full max-w-7xl transition-all duration-500",
        "bg-white/95 backdrop-blur-2xl border border-stone-200/50",
        "shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08),0_2px_12px_-4px_rgba(0,0,0,0.04)]",
        "rounded-2xl lg:rounded-full",
        "px-5 lg:px-7 py-3.5",
        "flex flex-col lg:flex-row items-center justify-between gap-6"
      )}>

        {/* Left: Logo + Role Switcher + Mobile Toggle */}
        <div className="w-full lg:w-auto flex items-center justify-between gap-5">
          {/* Logo → Dashboard */}
          <Link
            href={logoHref}
            className="flex items-center gap-3 group shrink-0 relative"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/10 to-stone-500/10 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700" />
            <div className="relative w-10 h-10 bg-gradient-to-br from-charcoal-900 via-stone-800 to-charcoal-900 rounded-xl flex items-center justify-center shadow-lg shadow-stone-900/10 group-hover:shadow-amber-900/15 transition-all duration-500 group-hover:scale-[1.03]">
              <span className="font-serif font-bold italic text-lg bg-gradient-to-b from-amber-300 to-amber-500 bg-clip-text text-transparent">I</span>
            </div>
            <div className="flex flex-col relative">
              <span className="font-serif font-bold text-charcoal-900 text-[17px] leading-none tracking-tight">InTime</span>
              <span className="text-[8.5px] uppercase tracking-[0.35em] text-amber-600/80 font-bold mt-0.5">Solutions</span>
            </div>
          </Link>

          {/* Role Switcher (Desktop) - Internal Only */}
          {!isPublic && isInternal && (
            <div className="relative hidden lg:block">
              <button
                onClick={() => {
                  setIsRoleSwitcherOpen(!isRoleSwitcherOpen);
                  setActiveDropdown(null);
                  setIsProfileOpen(false);
                  setIsNotificationsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300",
                  isRoleSwitcherOpen
                    ? "bg-charcoal-900 text-white"
                    : "bg-stone-100 hover:bg-stone-200 text-stone-500"
                )}
              >
                {getRoleLabel(effectiveRole)}
                <ChevronDown size={11} className={cn("transition-transform duration-300", isRoleSwitcherOpen && "rotate-180")} />
              </button>

              {isRoleSwitcherOpen && (
                <div className="absolute top-full left-0 mt-3 w-52 bg-white rounded-xl shadow-2xl shadow-stone-900/10 border border-stone-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-100">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">Switch Context</p>
                  </div>
                  <div className="py-1 max-h-80 overflow-y-auto">
                    {INTERNAL_ROLES.map((r) => (
                      <button
                        key={r}
                        onClick={() => handleRoleSwitch(r)}
                        className={cn(
                          "w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide transition-colors",
                          effectiveRole === r
                            ? "text-amber-700 bg-amber-50/60"
                            : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          {effectiveRole === r && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                          {getRoleLabel(r)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Toggle */}
          <button
            className="lg:hidden p-2 text-stone-400 hover:text-charcoal-900 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Center: Navigation Links (Desktop) */}
        {!isPublic && activeNavStructure.length > 0 && (
          <ul className="hidden lg:flex items-center gap-1">
            {activeNavStructure.map((group) => (
              group.items.length === 1 ? (
                <li key={group.title}>
                  <Link
                    href={group.items[0].path}
                    className={cn(
                      "relative flex items-center gap-2 px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300",
                      isActive(group.items[0].path)
                        ? 'text-charcoal-900 bg-stone-100/80'
                        : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50/60'
                    )}
                  >
                    {group.title}
                    {isActive(group.items[0].path) && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-amber-500 rounded-full" />
                    )}
                  </Link>
                </li>
              ) : (
                <li
                  key={group.title}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(group.title)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className={cn(
                    "relative flex items-center gap-2 px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300",
                    isGroupActive(group.items)
                      ? 'text-charcoal-900 bg-stone-100/80'
                      : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50/60'
                  )}>
                    {group.title}
                    <ChevronDown size={11} className={cn("transition-transform duration-300", activeDropdown === group.title && 'rotate-180')} />
                    {isGroupActive(group.items) && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-amber-500 rounded-full" />
                    )}
                  </button>

                  <div className={cn(
                    "absolute top-full left-1/2 -translate-x-1/2 pt-3 w-52 transition-all duration-200 transform origin-top",
                    activeDropdown === group.title ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'
                  )}>
                    <div className="bg-white rounded-xl shadow-2xl shadow-stone-900/10 border border-stone-100 py-1.5 overflow-hidden">
                      {group.items.map(item => (
                        <Link
                          key={item.path}
                          href={item.path}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 transition-colors mx-1.5 rounded-lg",
                            isActive(item.path)
                              ? 'bg-amber-50/60 text-amber-800'
                              : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                          )}
                        >
                          <item.icon size={15} className={isActive(item.path) ? "text-amber-600" : ""} />
                          <span className="text-[11px] font-bold uppercase tracking-wide">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </li>
              )
            ))}
          </ul>
        )}

        {/* Mobile Menu */}
        {!isPublic && isMobileMenuOpen && (
          <div className="lg:hidden flex flex-col w-full pb-4 border-t border-stone-100 pt-4 space-y-5">
            {isInternal && (
              <div className="p-2.5 bg-stone-50 rounded-xl">
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2 px-2">Switch View</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {INTERNAL_ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleSwitch(r)}
                      className={cn(
                        "text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors",
                        activeRole === r ? "bg-white text-amber-700 shadow-sm" : "text-stone-500 hover:bg-white/50"
                      )}
                    >
                      {getRoleLabel(r)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeNavStructure.map((group) => (
              <div key={group.title}>
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-300 mb-2.5 pl-2">{group.title}</div>
                <div className="space-y-1">
                  {group.items.map(item => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                        isActive(item.path) ? 'bg-amber-50/60 text-amber-800' : 'text-stone-500 hover:bg-stone-50'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon size={16} className={isActive(item.path) ? "text-amber-600" : ""} />
                      <span className="text-[11px] font-bold uppercase tracking-wide">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Right: Notifications + Profile */}
        <div className={cn(
          "lg:flex items-center justify-center lg:justify-end w-full lg:w-auto gap-4 shrink-0 lg:pl-4 lg:border-l border-stone-100/80",
          isMobileMenuOpen ? 'flex' : 'hidden'
        )}>
          {!isPublic ? (
            <>
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    setIsProfileOpen(false);
                    setActiveDropdown(null);
                    setIsRoleSwitcherOpen(false);
                  }}
                  className="relative p-2 text-stone-400 hover:text-stone-600 transition-colors rounded-lg hover:bg-stone-50"
                >
                  <Bell size={18} />
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                </button>

                {isNotificationsOpen && (
                  <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl shadow-stone-900/10 border border-stone-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-stone-100 flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Notifications</span>
                      <button className="text-[10px] font-bold text-amber-600 hover:text-amber-700 transition-colors">Mark all read</button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {[
                        { text: "New job order from TechFlow", time: "10m ago", unread: true },
                        { text: "Pod A placed candidate!", time: "5 hours ago", unread: false },
                      ].map((note, i) => (
                        <div key={i} className={cn(
                          "px-4 py-3 border-b border-stone-50 hover:bg-stone-50/50 transition-colors flex gap-3 cursor-pointer",
                          note.unread && "bg-amber-50/30"
                        )}>
                          <div className={cn(
                            "w-2 h-2 rounded-full mt-1.5 shrink-0",
                            note.unread ? 'bg-amber-500' : 'bg-stone-300'
                          )} />
                          <div>
                            <p className="text-sm text-stone-700 leading-snug">{note.text}</p>
                            <p className="text-[10px] text-stone-400 mt-1">{note.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-stone-100 text-center">
                      <button className="text-[10px] font-bold uppercase tracking-wider text-stone-400 hover:text-stone-600 transition-colors">
                        View All
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Info + Avatar */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <div className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.2em]">
                    {isAcademyRoute ? academyRoleLabel : isInternal ? getRoleLabel(effectiveRole) : 'Partner'}
                  </div>
                  <div className="text-[13px] font-serif font-bold text-charcoal-900 leading-tight mt-0.5">
                    {userName}
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => {
                      setIsProfileOpen(!isProfileOpen);
                      setIsNotificationsOpen(false);
                      setActiveDropdown(null);
                      setIsRoleSwitcherOpen(false);
                    }}
                    className="relative group cursor-pointer outline-none"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-br from-amber-400/30 to-stone-400/20 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500" />
                    <div className={cn(
                      "relative w-10 h-10 rounded-full border-2 border-white shadow-lg",
                      "bg-gradient-to-br from-charcoal-800 to-charcoal-900 text-white",
                      "flex items-center justify-center font-serif font-bold italic text-base",
                      "transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
                    )}>
                      {userInitial}
                    </div>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl shadow-stone-900/10 border border-stone-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 bg-gradient-to-br from-stone-50 to-stone-50/50 border-b border-stone-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-charcoal-800 to-charcoal-900 text-white flex items-center justify-center font-serif font-bold italic text-base">
                            {userInitial}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-charcoal-900">
                              {userName}
                            </p>
                            <p className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">
                              {isAcademyRoute ? academyRoleLabel : getRoleLabel(effectiveRole)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-1.5">
                        <Link
                          href={logoHref}
                          onClick={closeAll}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors"
                        >
                          <LayoutDashboard size={14} />
                          <span className="text-[11px] font-bold uppercase tracking-wide">Dashboard</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-500 hover:bg-red-50 hover:text-red-600 transition-colors mt-1 border-t border-stone-100 pt-3"
                        >
                          <LogOut size={14} />
                          <span className="text-[11px] font-bold uppercase tracking-wide">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            !isLoginPage && (
              <Link
                href="/login"
                className={cn(
                  "px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300",
                  "bg-charcoal-900 text-white hover:bg-stone-800 shadow-lg shadow-stone-900/10 hover:shadow-xl hover:-translate-y-0.5"
                )}
              >
                Sign In
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
};
