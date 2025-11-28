'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  Clock,
  Activity,
  TrendingUp,
  Sparkles,
  Brain,
  Target,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';

// Role configuration - maps role to personalized content
const ROLE_CONFIG: Record<string, {
  title: string;
  dashboardPath: string;
  metrics: Array<{
    label: string;
    value: string;
    trend?: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }>;
}> = {
  recruiter: {
    title: 'Recruiter',
    dashboardPath: '/employee/recruiting/dashboard',
    metrics: [
      { label: 'Sprint Placements', value: '5/8', trend: '+2 this week', icon: Target },
      { label: 'Active Submissions', value: '24', trend: '8 pending review', icon: TrendingUp },
      { label: 'Interviews Today', value: '3', icon: Calendar },
    ],
  },
  senior_recruiter: {
    title: 'Senior Recruiter',
    dashboardPath: '/employee/recruiting/dashboard',
    metrics: [
      { label: 'Sprint Placements', value: '7/10', trend: '+3 this week', icon: Target },
      { label: 'Active Submissions', value: '32', trend: '12 pending review', icon: TrendingUp },
      { label: 'Interviews Today', value: '4', icon: Calendar },
    ],
  },
  junior_recruiter: {
    title: 'Recruiter',
    dashboardPath: '/employee/recruiting/dashboard',
    metrics: [
      { label: 'Sprint Placements', value: '3/5', trend: '+1 this week', icon: Target },
      { label: 'Active Submissions', value: '15', trend: '5 pending review', icon: TrendingUp },
      { label: 'Interviews Today', value: '2', icon: Calendar },
    ],
  },
  bench_manager: {
    title: 'Bench Sales',
    dashboardPath: '/employee/bench/dashboard',
    metrics: [
      { label: 'Bench Utilization', value: '78%', trend: '+5% vs last month', icon: TrendingUp },
      { label: 'Active Submissions', value: '28', trend: '6 in final stages', icon: Target },
      { label: 'Hot Consultants', value: '12', icon: Activity },
    ],
  },
  bench_sales: {
    title: 'Bench Sales',
    dashboardPath: '/employee/bench/dashboard',
    metrics: [
      { label: 'Bench Utilization', value: '78%', trend: '+5% vs last month', icon: TrendingUp },
      { label: 'Active Submissions', value: '28', trend: '6 in final stages', icon: Target },
      { label: 'Hot Consultants', value: '12', icon: Activity },
    ],
  },
  ta_specialist: {
    title: 'Talent Acquisition',
    dashboardPath: '/employee/ta/dashboard',
    metrics: [
      { label: 'Prospects Sourced', value: '156', trend: '+32 this week', icon: TrendingUp },
      { label: 'Response Rate', value: '23%', trend: '+4% vs average', icon: Target },
      { label: 'Campaigns Active', value: '4', icon: Activity },
    ],
  },
  talent_acquisition: {
    title: 'Talent Acquisition',
    dashboardPath: '/employee/ta/dashboard',
    metrics: [
      { label: 'Prospects Sourced', value: '156', trend: '+32 this week', icon: TrendingUp },
      { label: 'Response Rate', value: '23%', trend: '+4% vs average', icon: Target },
      { label: 'Campaigns Active', value: '4', icon: Activity },
    ],
  },
  hr_admin: {
    title: 'HR Manager',
    dashboardPath: '/employee/hr/dashboard',
    metrics: [
      { label: 'Total Employees', value: '127', trend: '+4 this month', icon: Activity },
      { label: 'Pending Onboarding', value: '3', icon: Target },
      { label: 'Open Positions', value: '12', icon: TrendingUp },
    ],
  },
  hr_manager: {
    title: 'HR Manager',
    dashboardPath: '/employee/hr/dashboard',
    metrics: [
      { label: 'Total Employees', value: '127', trend: '+4 this month', icon: Activity },
      { label: 'Pending Onboarding', value: '3', icon: Target },
      { label: 'Open Positions', value: '12', icon: TrendingUp },
    ],
  },
  academy_admin: {
    title: 'Academy Admin',
    dashboardPath: '/employee/academy/admin/dashboard',
    metrics: [
      { label: 'Active Learners', value: '234', trend: '+18 this week', icon: Activity },
      { label: 'Completion Rate', value: '78%', trend: '+5% vs last month', icon: TrendingUp },
      { label: 'Pending Certs', value: '12', icon: Target },
    ],
  },
  trainer: {
    title: 'Trainer',
    dashboardPath: '/employee/academy/admin/dashboard',
    metrics: [
      { label: 'Active Students', value: '45', trend: '+8 this week', icon: Activity },
      { label: 'Avg. Score', value: '86%', trend: '+3% this month', icon: TrendingUp },
      { label: 'Sessions Today', value: '2', icon: Calendar },
    ],
  },
  training_coordinator: {
    title: 'Training Coordinator',
    dashboardPath: '/employee/academy/admin/dashboard',
    metrics: [
      { label: 'Active Cohorts', value: '8', trend: '2 starting next week', icon: Activity },
      { label: 'Enrollment Rate', value: '92%', icon: TrendingUp },
      { label: 'Pending Reviews', value: '5', icon: Target },
    ],
  },
  immigration_specialist: {
    title: 'Immigration',
    dashboardPath: '/employee/immigration/dashboard',
    metrics: [
      { label: 'Active Cases', value: '34', trend: '8 priority', icon: Activity },
      { label: 'Pending Approvals', value: '12', icon: Target },
      { label: 'Due This Week', value: '5', icon: Calendar },
    ],
  },
  admin: {
    title: 'Administrator',
    dashboardPath: '/employee/admin/dashboard',
    metrics: [
      { label: 'Total Users', value: '342', trend: '+12 this month', icon: Activity },
      { label: 'Active Sessions', value: '89', icon: TrendingUp },
      { label: 'System Health', value: '99.9%', icon: Target },
    ],
  },
  ceo: {
    title: 'Executive',
    dashboardPath: '/employee/ceo/dashboard',
    metrics: [
      { label: 'Revenue MTD', value: '$2.4M', trend: '+24% YoY', icon: TrendingUp },
      { label: 'Placements', value: '32', trend: '+8 this month', icon: Target },
      { label: 'Team Size', value: '127', icon: Activity },
    ],
  },
  super_admin: {
    title: 'Executive',
    dashboardPath: '/employee/ceo/dashboard',
    metrics: [
      { label: 'Revenue MTD', value: '$2.4M', trend: '+24% YoY', icon: TrendingUp },
      { label: 'Placements', value: '32', trend: '+8 this month', icon: Target },
      { label: 'Team Size', value: '127', icon: Activity },
    ],
  },
};

// Default config for unknown roles
const DEFAULT_CONFIG = {
  title: 'Employee',
  dashboardPath: '/employee/shared/combined',
  metrics: [
    { label: 'Active Jobs', value: '127', icon: Activity },
    { label: 'Placements MTD', value: '18', icon: Target },
    { label: 'System Status', value: 'Online', icon: TrendingUp },
  ],
};

interface EmployeePortalProps {
  userRole?: string;
  userName?: string;
  userRoles?: string[];
  error?: string;
}

export function EmployeePortal({ userRole, userName, userRoles = [], error }: EmployeePortalProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Good morning');
  const [showError, setShowError] = useState(!!error);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));

      const hour = now.getHours();
      if (hour < 12) setGreeting('Good morning');
      else if (hour < 17) setGreeting('Good afternoon');
      else setGreeting('Good evening');
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get config based on role
  const config = userRole && ROLE_CONFIG[userRole] ? ROLE_CONFIG[userRole] : DEFAULT_CONFIG;
  const displayName = userName?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-ivory flex flex-col lg:flex-row">

      {/* Error Banner - Wrong Portal */}
      {showError && error === 'wrong_portal' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-amber-800 text-sm flex-1">
              <span className="font-semibold">Wrong portal:</span> You tried to access the Academy Portal, but your account is an employee account. You've been redirected to the Employee Portal.
            </p>
            <button
              onClick={() => setShowError(false)}
              className="p-1 hover:bg-amber-100 rounded transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-amber-600" />
            </button>
          </div>
        </div>
      )}

      {/* Left side - Branding & greeting */}
      <div className="lg:w-[45%] px-8 md:px-12 lg:px-16 py-12 lg:py-16 flex flex-col">
        <Link href="/" className="text-charcoal-400 text-sm hover:text-charcoal-900 transition-colors mb-auto">
          ← Home
        </Link>

        <div className="my-auto">
          <div className="font-heading text-6xl md:text-7xl lg:text-8xl text-forest-900 tracking-tight leading-none">
            In<span className="text-gold-600">Time</span>
          </div>

          <div className="mt-8">
            <p className="text-gold-700 font-mono text-sm font-semibold tracking-widest uppercase">
              {config.title}
            </p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-charcoal-900 leading-[1.1] mt-3">
              {greeting},<br />{displayName}<span className="text-gold-600">.</span>
            </h1>
          </div>

          {/* Time & status */}
          <div className="mt-12 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-charcoal-500">
              <Clock size={14} />
              <span>{currentTime}</span>
            </div>
            <div className="flex items-center gap-2 text-forest-600">
              <Activity size={14} className="animate-pulse" />
              <span>All systems operational</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-8 text-xs text-charcoal-400 font-mono tracking-wider">
          SOC 2 · GDPR · CCPA
        </div>
      </div>

      {/* Right side - Metrics, AI Notes, and Dashboard button */}
      <div className="lg:w-[55%] bg-white lg:rounded-tl-[4rem] flex flex-col">

        {/* Sprint Metrics - 3 Key Stats */}
        <div className="px-8 md:px-12 py-8 lg:py-10 border-b border-charcoal-100">
          <p className="text-charcoal-400 text-sm font-medium mb-5">Sprint Overview</p>
          <div className="grid grid-cols-3 gap-4">
            {config.metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className="bg-charcoal-50 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <Icon size={16} className="text-forest-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-charcoal-900 mb-1">
                    {metric.value}
                  </div>
                  <div className="text-charcoal-500 text-xs font-medium">
                    {metric.label}
                  </div>
                  {metric.trend && (
                    <div className="text-forest-600 text-xs mt-2 font-medium">
                      {metric.trend}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Notes Section */}
        <div className="flex-1 px-8 md:px-12 py-8">
          <div className="flex items-center gap-2 mb-5">
            <Brain size={16} className="text-gold-600" />
            <p className="text-charcoal-400 text-sm font-medium">AI Twin Notes</p>
          </div>

          <div className="space-y-4">
            {/* Today's Plan */}
            <div className="bg-gradient-to-br from-forest-50 to-forest-100/50 rounded-2xl p-5 border border-forest-200/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-forest-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-900 mb-1">Today's Priority</h3>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    Focus on following up with 3 high-priority submissions from yesterday.
                    Two candidates are awaiting feedback from client interviews scheduled for this morning.
                  </p>
                </div>
              </div>
            </div>

            {/* Org Insight */}
            <div className="bg-charcoal-50 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-charcoal-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Activity size={14} className="text-charcoal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-900 mb-1">Organization Update</h3>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    Sprint ends Friday. Team is at 85% of placement goal.
                    New client onboarded yesterday with 4 open requisitions.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Insight */}
            <div className="bg-gold-50 rounded-2xl p-5 border border-gold-200/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={14} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-900 mb-1">Performance Insight</h3>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    Your submission-to-interview ratio is 15% above team average this month.
                    Keep focusing on quality over quantity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Go to Dashboard Button */}
        <div className="px-8 md:px-12 py-6 border-t border-charcoal-200 bg-charcoal-50">
          <button
            onClick={() => router.push(config.dashboardPath)}
            className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-forest-600 hover:bg-forest-700 text-white rounded-2xl font-semibold text-lg transition-colors shadow-lg shadow-forest-600/20"
          >
            Open Dashboard
            <ArrowUpRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmployeePortal;
