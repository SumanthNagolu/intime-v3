'use client';

import React, { useState } from 'react';
import { MOCK_MODULES } from '@/lib/constants';
import { Check, Clock, Database, Download, Loader2, Lock, Filter, Search, Terminal, TrendingUp, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { useAcademyStore, useBiometric } from '@/lib/store/academy-store';
import { BiometricStatusIndicator } from './academy/BiometricBackground';

export const BlueprintView: React.FC = () => {
  const { academyProgress } = useAppStore();
  const { streakDays } = useAcademyStore();
  const { state, theme, statusMessage } = useBiometric();
  const [isExporting, setIsExporting] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Completed' | 'Pending'>('All');
  const [search, setSearch] = useState('');

  // Generate blueprint items dynamically from completed lessons
  const generatedItems = MOCK_MODULES.flatMap(module =>
    module.lessons.filter(l => l.type === 'lab').map(lesson => {
      const progress = academyProgress[`${module.id}-${lesson.id}`];
      const isCompleted = progress?.status === 'completed';

      return {
        id: lesson.id,
        title: lesson.title,
        status: isCompleted ? 'completed' : 'pending',
        moduleRef: module.id,
        description: lesson.content.lab.instructions.substring(0, 150) + '...',
        deliverables: ['Configuration XML', 'Gosu Class', 'Unit Test'], // Mock deliverables
        code: progress?.labArtifact
      };
    })
  );

  const filteredItems = generatedItems.filter(item => {
    const matchesFilter = filter === 'All'
      ? true
      : filter === 'Completed'
        ? item.status === 'completed'
        : item.status !== 'completed';

    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const completedCount = generatedItems.filter(i => i.status === 'completed').length;
  const completionPercent = Math.round((completedCount / generatedItems.length) * 100) || 0;

  const handleExport = () => {
    setIsExporting(true);
    // Simulate PDF generation delay
    setTimeout(() => {
      setIsExporting(false);
      alert("Blueprint_v1.2.pdf downloaded successfully.");
    }, 2000);
  };

  return (
    <div className="animate-fade-in pt-4 pb-12">

      {/* ============================================
          HERO HEADER - Mission Control Style
          ============================================ */}
      <div className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-8 border-b-2 border-charcoal-100">
        <div>
          {/* Biometric Status */}
          <div className="mb-4">
            <BiometricStatusIndicator state={state} statusMessage={statusMessage} />
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-heading font-black text-charcoal-900 mb-4 tracking-tight leading-none">
            My<br />Blueprint
          </h1>

          {/* Motivational Quote */}
          <p className="text-charcoal-500 text-lg max-w-xl leading-relaxed font-heading italic border-l-2 pl-4 mt-6"
            style={{ borderColor: theme.pulseColor }}>
            &ldquo;Your technical experience document, built in real-time.&rdquo;
          </p>
        </div>

        {/* Primary Score Display */}
        <div className="flex flex-wrap gap-4">
          {/* Blueprint Progress - Main Metric */}
          <div
            className="relative border-2 rounded-2xl p-6 bg-white shadow-elevation-md min-w-[140px]"
            style={{ borderColor: theme.pulseColor }}
          >
            <div
              className="text-5xl font-heading font-black leading-none tracking-tighter mb-1"
              style={{ color: theme.pulseColor }}
            >
              {completionPercent}<span className="text-xl align-top">%</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-charcoal-500 font-bold font-body">
              Blueprint Complete
            </div>
            {/* Position indicator */}
            <div className="mt-3 pt-3 border-t border-charcoal-100 flex items-center gap-2 text-xs text-charcoal-600 font-body">
              <TrendingUp size={12} />
              <span>{completedCount}/{generatedItems.length} labs logged</span>
            </div>
          </div>

          {/* Stats Card */}
          <div className="border-2 border-charcoal-200 rounded-2xl p-4 bg-white shadow-elevation-sm">
            <div className="space-y-3">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-charcoal-400 mb-1 font-body">Total Artifacts</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-heading font-black text-gold-600">
                    {completedCount * 3}
                  </span>
                  <span className="text-xs text-charcoal-400 font-body">items</span>
                </div>
              </div>
              <div className="pt-2 border-t border-charcoal-100">
                <div className="text-[9px] uppercase tracking-widest text-charcoal-400 mb-1 font-body">Streak Days</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-heading font-bold text-charcoal-700">
                    {streakDays}
                  </span>
                  <span className="text-[10px] text-charcoal-400 font-body">days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          MAIN CONTENT
          ============================================ */}
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Document Visualization */}
        <div className="w-full lg:w-1/3 shrink-0">
          <div className="bg-white border-2 border-charcoal-100 shadow-elevation-md p-8 min-h-[600px] relative rounded-2xl hover:shadow-elevation-lg transition-all group sticky top-24">

            <div className="text-center mt-16 mb-12">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-heading font-black shadow-elevation-sm transition-transform group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
                  color: 'white'
                }}
              >
                IS
              </div>
              <h2 className="font-heading text-2xl font-black text-charcoal-900 uppercase tracking-widest leading-snug">Technical<br />Implementation<br />Log</h2>
              <p className="mt-4 text-charcoal-400 font-mono text-xs">CONFIDENTIAL - DO NOT DISTRIBUTE</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold border-b border-charcoal-100 pb-2 font-body">
                <span className="text-charcoal-400">PROJECT</span>
                <span className="text-charcoal-900">TECHFLOW MIGRATION</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold border-b border-charcoal-100 pb-2 font-body">
                <span className="text-charcoal-400">ROLE</span>
                <span className="text-charcoal-900">LEAD DEVELOPER</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold border-b border-charcoal-100 pb-2 font-body">
                <span className="text-charcoal-400">DURATION</span>
                <span className="text-charcoal-900">8 WEEKS</span>
              </div>
            </div>

            <div className="absolute bottom-8 left-0 right-0 text-center px-8">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full bg-charcoal-900 text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-charcoal-800 transition-all shadow-elevation-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed font-body"
              >
                {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                {isExporting ? "Generating PDF..." : "Export PDF"}
              </button>
            </div>
          </div>
        </div>

        {/* User Stories List */}
        <div className="flex-1 space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2 bg-white p-3 rounded-xl border-2 border-charcoal-100 shadow-elevation-sm flex-1">
              <Search size={16} className="text-charcoal-400 ml-1" />
              <input
                placeholder="Search stories..."
                className="bg-transparent outline-none text-sm w-full font-body text-charcoal-900"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex bg-charcoal-100 p-1 rounded-xl">
              {['All', 'Completed', 'Pending'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f as 'All' | 'Completed' | 'Pending')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors font-body ${filter === f ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-500 hover:text-charcoal-700'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredItems.length > 0 ? filteredItems.map(item => (
            <div key={item.id} className="group bg-white p-6 rounded-2xl border-2 border-charcoal-100 shadow-elevation-sm hover:shadow-elevation-lg hover:border-charcoal-300 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase tracking-widest ${item.status === 'completed' ? 'bg-forest-100 text-forest-700' : 'bg-gold-100 text-gold-700'
                    }`}>
                    Mod {item.moduleRef}
                  </div>
                  <h3 className="font-heading font-bold text-lg text-charcoal-900 group-hover:text-charcoal-700 transition-colors">{item.title}</h3>
                </div>
                {item.status === 'completed' ? (
                  <div className="w-8 h-8 rounded-xl bg-forest-500 text-white flex items-center justify-center shadow-sm">
                    <Check size={16} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-charcoal-100 text-charcoal-400 flex items-center justify-center">
                    <Clock size={16} />
                  </div>
                )}
              </div>

              <p className="text-charcoal-500 mb-6 text-sm leading-relaxed font-body">
                <span className="font-bold text-[10px] uppercase text-charcoal-400 mr-2 tracking-widest">Objective:</span>
                {item.description}
              </p>

              {item.status === 'completed' && item.code && (
                <div className="bg-charcoal-900 rounded-xl p-4 mb-6 relative overflow-hidden group/code">
                  <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                    <button className="p-1.5 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"><Terminal size={12} /></button>
                  </div>
                  <pre className="text-xs text-emerald-400 font-mono overflow-hidden h-12">
                    {item.code}
                  </pre>
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-charcoal-900 to-transparent"></div>
                </div>
              )}

              <div className="bg-charcoal-50 p-4 rounded-xl flex flex-wrap gap-4 items-center">
                <div className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest flex items-center gap-2 font-body">
                  <Database size={12} /> Artifacts:
                </div>
                {item.deliverables.map(del => (
                  <span key={del} className="text-xs font-medium text-charcoal-700 bg-white px-3 py-1.5 rounded-lg border border-charcoal-200 font-body">
                    {del}
                  </span>
                ))}
              </div>
            </div>
          )) : (
            <div className="text-center py-12 text-charcoal-400">
              <Filter size={32} className="mx-auto mb-2 opacity-20" />
              <p className="font-body">No stories found matching your criteria.</p>
            </div>
          )}

          <Link href="/academy/modules" className="block p-8 border-2 border-dashed border-charcoal-200 rounded-2xl text-center text-charcoal-400 hover:border-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-50 transition-all cursor-pointer group">
            <div className="w-12 h-12 mx-auto bg-charcoal-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Briefcase size={20} />
            </div>
            <p className="font-heading font-bold text-lg">Complete Labs to Expand Blueprint</p>
            <p className="text-xs mt-2 font-body">Every completed lab automatically adds a page to your portfolio.</p>
          </Link>
        </div>

      </div>
    </div>
  );
};
