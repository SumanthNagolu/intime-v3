'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Shield,
  Users,
  Target,
  Briefcase,
  TrendingUp,
  Database,
  Globe,
  BarChart3,
  Zap,
  CheckCircle,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * EmployeePortal - InTime OS Entry Point
 *
 * Landing page for employees providing quick access to all
 * employee dashboards and key metrics.
 */
export function EmployeePortal() {
  const router = useRouter();

  // Quick access tiles for different employee roles/features
  const quickAccessTiles = [
    {
      title: 'Recruiting',
      description: 'Manage candidates, jobs, and placements',
      icon: Users,
      href: '/employee/recruiting/dashboard',
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-500'
    },
    {
      title: 'Bench Sales',
      description: 'Pipeline, hotlist, and deal management',
      icon: TrendingUp,
      href: '/employee/bench/dashboard',
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-500'
    },
    {
      title: 'Talent Acquisition',
      description: 'Sourcing, prospects, and campaigns',
      icon: Target,
      href: '/employee/ta/dashboard',
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-500'
    },
    {
      title: 'HR Management',
      description: 'Employee records and onboarding',
      icon: Briefcase,
      href: '/employee/hr/dashboard',
      color: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-500'
    },
    {
      title: 'Academy Admin',
      description: 'Training programs and certifications',
      icon: Shield,
      href: '/employee/academy/admin/dashboard',
      color: 'from-gold-500 to-gold-600',
      iconBg: 'bg-gold-500/20',
      iconColor: 'text-gold-500'
    },
    {
      title: 'Shared Resources',
      description: 'Cross-team talent and job boards',
      icon: Database,
      href: '/employee/shared/combined',
      color: 'from-slate-500 to-slate-600',
      iconBg: 'bg-slate-500/20',
      iconColor: 'text-slate-400'
    }
  ];

  // Key metrics to display (these could be fetched from API)
  const metrics = [
    { label: 'Active Jobs', value: '127', change: '+12', trend: 'up' },
    { label: 'Bench Consultants', value: '43', change: '-5', trend: 'down' },
    { label: 'Placements (MTD)', value: '18', change: '+3', trend: 'up' },
    { label: 'Pipeline Value', value: '$2.4M', change: '+18%', trend: 'up' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gold-500/20 rounded-2xl flex items-center justify-center">
              <Shield size={32} className="text-gold-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tight">
                InTime OS
              </h1>
              <p className="text-charcoal-400 text-lg mt-1">
                Internal Operations Hub
              </p>
            </div>
          </div>

          {/* System Status */}
          <div className="flex items-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-green-400 animate-pulse" />
              <span className="text-charcoal-400">System Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-gold-400" />
              <span className="text-charcoal-400">All Services Active</span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-gold-500/30 transition-all duration-300"
            >
              <div className="text-charcoal-500 text-xs font-bold uppercase tracking-wider mb-2">
                {metric.label}
              </div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-heading font-bold text-white">
                  {metric.value}
                </div>
                <div className={cn(
                  "text-xs font-semibold px-2 py-1 rounded",
                  metric.trend === 'up' ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
                )}>
                  {metric.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Access Grid */}
        <div>
          <h2 className="text-2xl font-heading font-bold text-white mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Quick Access
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickAccessTiles.map((tile, index) => {
              const Icon = tile.icon;
              return (
                <button
                  key={index}
                  onClick={() => router.push(tile.href)}
                  className="group bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-gold-500/50 hover:bg-white/[0.05] transition-all duration-300 text-left animate-fade-in"
                  style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                    tile.iconBg
                  )}>
                    <Icon size={28} className={tile.iconColor} />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-white mb-2 group-hover:text-gold-400 transition-colors">
                    {tile.title}
                  </h3>
                  <p className="text-charcoal-400 text-sm mb-4 leading-relaxed">
                    {tile.description}
                  </p>
                  <div className="flex items-center gap-2 text-gold-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Access Dashboard
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
    </div>
  );
}

export default EmployeePortal;
