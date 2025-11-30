'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, AlertTriangle, CheckCircle, Activity, Zap, Target, BarChart3, Globe, Brain, ArrowRight, LayoutDashboard, Lightbulb, Download, TrendingDown, Award, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

export const CEODashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Console' | 'Strategy' | 'Intel'>('Console');
  const [animatedMetrics, setAnimatedMetrics] = useState({
    revenue: 0,
    placements: 0,
    benchUtil: 0,
    revPerEmp: 0
  });

  // Mock metrics
  const metrics = {
    revenue: 147000,
    target: 150000,
    placements: 18,
    placementsTarget: 20,
    benchUtil: 78,
    revPerEmp: 245
  };

  // Animate numbers on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedMetrics({
        revenue: Math.round(metrics.revenue * progress),
        placements: Math.round(metrics.placements * progress),
        benchUtil: Math.round(metrics.benchUtil * progress),
        revPerEmp: Math.round(metrics.revPerEmp * progress)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="animate-fade-in space-y-8">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-charcoal-100">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="px-3 py-1.5 rounded-lg bg-gold-50 text-gold-700 border border-gold-200 text-caption font-bold">
              Executive Office
            </div>
          </div>

          <h1 className="text-h1 font-heading font-black text-charcoal-900 mb-3">
            Company Performance
          </h1>

          <p className="text-body-lg text-charcoal-600">
            Real-time strategic oversight across all 19 pods
          </p>
        </div>

        <Button variant="outline" size="lg">
          <Download size={16} strokeWidth={2} />
          Export Report
        </Button>
      </div>

      {/* Premium Tabs */}
      <div className="flex gap-2 border-b border-charcoal-100">
        {[
          { id: 'Console', icon: LayoutDashboard },
          { id: 'Strategy', icon: Target },
          { id: 'Intel', icon: Lightbulb }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'Console' | 'Strategy' | 'Intel')}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-caption font-bold transition-all duration-300 border-b-2",
              activeTab === tab.id
                ? "text-forest-700 border-gold-500"
                : "text-charcoal-500 border-transparent hover:text-forest-600 hover:bg-forest-50/50 rounded-t-lg"
            )}
          >
            <tab.icon size={16} strokeWidth={2.5} />
            {tab.id}
          </button>
        ))}
      </div>

      {activeTab === 'Console' && <ConsoleView metrics={metrics} animatedMetrics={animatedMetrics} />}
      {activeTab === 'Strategy' && <StrategyView />}
      {activeTab === 'Intel' && <IntelView />}
    </div>
  );
};

const ConsoleView: React.FC<{
  metrics: {
    revenue: number;
    target: number;
    placements: number;
    placementsTarget: number;
    benchUtil: number;
    revPerEmp: number;
  };
  animatedMetrics: {
    revenue: number;
    placements: number;
    benchUtil: number;
    revPerEmp: number;
  };
}> = ({ metrics, animatedMetrics }) => {
  return (
    <div className="space-y-8">
      {/* Premium Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <Card className="relative overflow-hidden bg-gradient-forest text-white border-0 shadow-premium hover:shadow-premium-lg transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gold-400/20 rounded-full blur-3xl"></div>
          <CardContent className="relative z-10 p-8">
            <div className="text-caption text-white/70 mb-3">Revenue (November)</div>
            <div className="text-display font-heading font-black text-white leading-none mb-4">
              ${(animatedMetrics.revenue / 1000).toFixed(0)}<span className="text-h3">k</span>
            </div>
            <div className="flex items-center gap-2 text-caption text-gold-300 font-bold">
              <TrendingUp size={14} strokeWidth={2.5} />
              {Math.round((animatedMetrics.revenue / metrics.target) * 100)}% to Target
            </div>
          </CardContent>
        </Card>

        {/* Placements Card */}
        <Card className="relative overflow-hidden group">
          <CardContent className="p-8">
            <div className="text-caption text-charcoal-500 mb-3">Sprint Placements</div>
            <div className="text-display font-heading font-black text-charcoal-900 leading-none mb-4">
              {animatedMetrics.placements}<span className="text-h3 text-charcoal-500">/{metrics.placementsTarget}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning-50 text-warning-700 border border-warning-200 text-caption font-bold">
              <AlertTriangle size={12} strokeWidth={2.5} />
              2 Pods Below Goal
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        </Card>

        {/* Bench Utilization Card */}
        <Card className="relative overflow-hidden group">
          <CardContent className="p-8">
            <div className="text-caption text-charcoal-500 mb-3">Bench Utilization</div>
            <div className="text-display font-heading font-black text-charcoal-900 leading-none mb-4">
              {animatedMetrics.benchUtil}<span className="text-h3 text-charcoal-500">%</span>
            </div>
            <div className="text-caption text-charcoal-400">Target: 85%</div>
            {/* Progress Ring */}
            <div className="mt-4">
              <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-forest-500 to-forest-600 rounded-full transition-all duration-1000"
                  style={{ width: `${animatedMetrics.benchUtil}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-forest-500 to-forest-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        </Card>

        {/* Rev per Employee Card */}
        <Card className="relative overflow-hidden group">
          <CardContent className="p-8">
            <div className="text-caption text-charcoal-500 mb-3">Revenue / Employee</div>
            <div className="text-display font-heading font-black text-success-600 leading-none mb-4">
              ${animatedMetrics.revPerEmp}<span className="text-h3">k</span>
            </div>
            <div className="flex items-center gap-2 text-caption text-success-600 font-bold">
              <TrendingUp size={14} strokeWidth={2.5} />
              Annualized
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-success-500 to-success-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Premium Pod Scoreboard */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} className="text-forest-600" strokeWidth={2.5} />
                Pod Scoreboard
              </CardTitle>
              <Button variant="ghost-gold" size="sm">
                View All 19 Pods
                <ArrowRight size={14} strokeWidth={2.5} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-8">
              <table className="w-full">
                <thead className="bg-charcoal-50">
                  <tr>
                    <th className="text-left p-4 text-caption text-charcoal-500 font-bold">Pod Name</th>
                    <th className="text-left p-4 text-caption text-charcoal-500 font-bold">Type</th>
                    <th className="text-left p-4 text-caption text-charcoal-500 font-bold">Placements</th>
                    <th className="text-left p-4 text-caption text-charcoal-500 font-bold">Rev YTD</th>
                    <th className="text-left p-4 text-caption text-charcoal-500 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {[
                    { name: 'Recruiting Pod A', type: 'Recruiting', placements: 2, rev: '$180k', status: 'Exceeding', statusColor: 'success' },
                    { name: 'Sales Pod 1', type: 'Bench Sales', placements: 1, rev: '$95k', status: 'On Track', statusColor: 'info' },
                    { name: 'Recruiting Pod B', type: 'Recruiting', placements: 0, rev: '$45k', status: 'At Risk', statusColor: 'error' },
                    { name: 'TA Pod 3', type: 'Talent Acq', placements: 15, rev: 'N/A', status: 'High Perf', statusColor: 'success' },
                    { name: 'Immigration Pod 1', type: 'Immigration', placements: 8, rev: '$42k', status: 'On Track', statusColor: 'info' },
                  ].map((pod, i) => (
                    <tr key={i} className="hover:bg-charcoal-50/50 transition-colors group cursor-pointer">
                      <td className="p-4">
                        <div className="font-bold text-body-sm text-charcoal-900 group-hover:text-forest-600 transition-colors">
                          {pod.name}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-caption text-charcoal-500">{pod.type}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-body-sm font-bold text-charcoal-700">{pod.placements}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-body-sm font-bold text-charcoal-700">{pod.rev}</span>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "inline-flex px-3 py-1 rounded-lg text-caption font-bold",
                          pod.statusColor === 'success' && "bg-success-50 text-success-700 border border-success-200",
                          pod.statusColor === 'info' && "bg-info-50 text-info-700 border border-info-200",
                          pod.statusColor === 'error' && "bg-error-50 text-error-700 border border-error-200"
                        )}>
                          {pod.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Premium AI Insights */}
          <Card className="relative overflow-hidden bg-gradient-forest text-white border-0 shadow-premium">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gold-400/20 rounded-full blur-3xl"></div>

            <CardHeader className="relative z-10">
              <CardTitle className="text-h3 text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold-500/20 border border-gold-400/30 flex items-center justify-center">
                  <Sparkles size={20} className="text-gold-300" strokeWidth={2.5} />
                </div>
                AI Twin Insights
              </CardTitle>
            </CardHeader>

            <CardContent className="relative z-10 space-y-4">
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-error-500/20 border border-error-400/30 flex items-center justify-center shrink-0">
                    <AlertTriangle size={14} className="text-error-300" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <div className="text-body-sm font-bold text-white mb-2">Risk Alert</div>
                    <p className="text-body-sm text-white/80 leading-relaxed">
                      Recruiting Pod B has 0 placements this sprint. Recommendation: Reassign Senior&apos;s top client to Pod A temporarily.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-success-500/20 border border-success-400/30 flex items-center justify-center shrink-0">
                    <TrendingUp size={14} className="text-success-300" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <div className="text-body-sm font-bold text-white mb-2">Revenue Opportunity</div>
                    <p className="text-body-sm text-white/80 leading-relaxed">
                      12 Academy graduates are available. Bench Sales can place 8 within 30 days if we launch targeted outreach.
                    </p>
                  </div>
                </div>
              </div>

              <Button variant="gold" size="lg" className="w-full">
                <Download size={16} strokeWidth={2.5} />
                Generate Board Report
              </Button>
            </CardContent>
          </Card>

          {/* Premium Vision 2030 Tracker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe size={20} className="text-gold-600" strokeWidth={2.5} />
                Vision 2030
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative">
                <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gradient-to-b from-gold-400 via-charcoal-200 to-charcoal-100"></div>

                <div className="flex gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-success-100 border-2 border-success-500 flex items-center justify-center z-10 shrink-0 shadow-elevation-sm">
                    <CheckCircle size={16} className="text-success-600" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-caption text-success-600 font-bold mb-1">Year 1 • Completed</div>
                    <div className="text-body-sm font-bold text-charcoal-900">Internal Operating System</div>
                    <div className="text-caption text-charcoal-400 mt-1">Nov 2025</div>
                  </div>
                </div>

                <div className="flex gap-4 relative opacity-70">
                  <div className="w-8 h-8 rounded-full bg-gold-100 border-2 border-gold-400 flex items-center justify-center z-10 shrink-0 shadow-elevation-sm">
                    <div className="w-2.5 h-2.5 bg-gold-500 rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-caption text-gold-600 font-bold mb-1">Year 2 • In Progress</div>
                    <div className="text-body-sm font-bold text-charcoal-900">B2B SaaS (InTimeOS)</div>
                    <div className="text-caption text-charcoal-400 mt-1">Target: Q4 2026</div>
                  </div>
                </div>

                <div className="flex gap-4 relative opacity-40">
                  <div className="w-8 h-8 rounded-full bg-charcoal-100 border-2 border-charcoal-300 flex items-center justify-center z-10 shrink-0">
                    <div className="w-2.5 h-2.5 bg-charcoal-400 rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-caption text-charcoal-400 font-bold mb-1">Year 5 • Planned</div>
                    <div className="text-body-sm font-bold text-charcoal-700">IPO Ready ($250M ARR)</div>
                    <div className="text-caption text-charcoal-400 mt-1">Target: 2030</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const StrategyView: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} className="text-forest-600" strokeWidth={2.5} />
            Strategic Roadmap
          </CardTitle>
          <CardDescription>Key initiatives for Q4 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            { title: 'Market Expansion', progress: 65, quarter: 'Q4 2025', color: 'from-forest-500 to-forest-600' },
            { title: 'Product Development', progress: 45, quarter: 'Q1 2026', color: 'from-gold-500 to-gold-600' },
            { title: 'Talent Acquisition', progress: 80, quarter: 'Q3 2025', color: 'from-charcoal-600 to-charcoal-700' }
          ].map((item, i) => (
            <div key={i} className="p-6 bg-gradient-subtle rounded-xl border border-charcoal-100">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-h4 font-heading font-bold text-charcoal-900">{item.title}</h4>
                <span className="px-3 py-1 bg-white rounded-lg text-caption font-bold text-charcoal-600 border border-charcoal-200 shadow-elevation-xs">
                  {item.quarter}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-caption text-charcoal-500">
                  <span>Progress</span>
                  <span className="font-bold text-charcoal-900">{item.progress}%</span>
                </div>
                <div className="h-3 bg-charcoal-100 rounded-full overflow-hidden shadow-inner-glow">
                  <div
                    className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-1000", item.color)}
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award size={20} className="text-gold-600" strokeWidth={2.5} />
            Key Priorities
          </CardTitle>
          <CardDescription>Focus areas for leadership team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { title: 'Scale Pod Model', description: 'Grow from 19 to 30 pods by Q2', icon: Users, color: 'forest' },
            { title: 'Launch InTimeOS Beta', description: 'B2B SaaS platform for staffing firms', icon: Zap, color: 'gold' },
            { title: 'Improve Win Rate', description: 'Increase placement success from 60% to 75%', icon: Target, color: 'success' }
          ].map((priority, i) => (
            <div key={i} className="p-5 rounded-xl bg-white border border-charcoal-100 hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group">
              <div className="flex gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shadow-elevation-sm shrink-0",
                  priority.color === 'forest' && "bg-forest-50 border border-forest-200",
                  priority.color === 'gold' && "bg-gold-50 border border-gold-200",
                  priority.color === 'success' && "bg-success-50 border border-success-200"
                )}>
                  <priority.icon
                    size={20}
                    strokeWidth={2.5}
                    className={cn(
                      priority.color === 'forest' && "text-forest-600",
                      priority.color === 'gold' && "text-gold-600",
                      priority.color === 'success' && "text-success-600"
                    )}
                  />
                </div>
                <div>
                  <div className="text-body font-bold text-charcoal-900 mb-1 group-hover:text-forest-600 transition-colors">
                    {priority.title}
                  </div>
                  <div className="text-body-sm text-charcoal-600">
                    {priority.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

const IntelView: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain size={20} className="text-forest-600" strokeWidth={2.5} />
            Market Intelligence
          </CardTitle>
          <CardDescription>Competitive landscape insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-subtle border border-charcoal-100 flex items-center justify-center">
                <Lightbulb size={32} className="text-charcoal-400" strokeWidth={2} />
              </div>
              <p className="text-body text-charcoal-600 mb-6">AI-powered market insights coming soon</p>
              <Button variant="default">
                <Sparkles size={16} strokeWidth={2.5} />
                Enable AI Analysis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={20} className="text-gold-600" strokeWidth={2.5} />
            Real-Time Metrics
          </CardTitle>
          <CardDescription>Live performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[
              { label: 'Active Searches', value: '47', trend: '+8', trendUp: true },
              { label: 'Interviews Today', value: '12', trend: '+3', trendUp: true },
              { label: 'Offers Pending', value: '9', trend: '-2', trendUp: false }
            ].map((metric, i) => (
              <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-gradient-subtle border border-charcoal-100">
                <div>
                  <div className="text-caption text-charcoal-500 mb-1">{metric.label}</div>
                  <div className="text-h2 font-heading font-black text-charcoal-900">{metric.value}</div>
                </div>
                <div className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-lg text-caption font-bold",
                  metric.trendUp
                    ? "bg-success-50 text-success-700 border border-success-200"
                    : "bg-error-50 text-error-700 border border-error-200"
                )}>
                  {metric.trendUp ? <TrendingUp size={14} strokeWidth={2.5} /> : <TrendingDown size={14} strokeWidth={2.5} />}
                  {metric.trend}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
