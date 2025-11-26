'use client';

import React, { useState } from 'react';
import { SENIOR_PERSONA, MOCK_MODULES } from '@/lib/constants';
import { Shield, Briefcase, CheckCircle, AlertCircle, Download, Edit3, Save, X, TrendingUp, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useAcademyStore, useBiometric } from '@/lib/store/academy-store';
import { BiometricStatusIndicator } from './academy/BiometricBackground';

export const PersonaView: React.FC = () => {
  const router = useRouter();
  const { academyProgress } = useAppStore();
  const { streakDays } = useAcademyStore();
  const { state, theme, statusMessage } = useBiometric();
  const [isEditing, setIsEditing] = useState(false);
  const [persona, setPersona] = useState(SENIOR_PERSONA);

  // Calculate dynamic data
  const completedLabs = MOCK_MODULES.flatMap(m =>
    m.lessons.filter(l => l.type === 'lab' && academyProgress[`${m.id}-${l.id}`]?.status === 'completed')
  );

  const hasCompletedCore = academyProgress['5-m5-l3']?.status === 'completed';

  // Calculate identity score
  const totalMilestones = 10;
  const completedMilestones = (hasCompletedCore ? 1 : 0) + completedLabs.length + 1; // +1 for foundation
  const identityScore = Math.round((completedMilestones / totalMilestones) * 100);

  const handleSave = () => {
    setIsEditing(false);
    // In real app, save to store/DB
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
            Identity<br />Forge
          </h1>

          {/* Motivational Quote */}
          <p className="text-charcoal-500 text-lg max-w-xl leading-relaxed font-heading italic border-l-2 pl-4 mt-6"
            style={{ borderColor: theme.pulseColor }}>
            &ldquo;This is not a template. This is you on graduation day.&rdquo;
          </p>
        </div>

        {/* Primary Score Display */}
        <div className="flex flex-wrap gap-4">
          {/* Identity Score - Main Metric */}
          <div
            className="relative border-2 rounded-2xl p-6 bg-white shadow-elevation-md min-w-[140px]"
            style={{ borderColor: theme.pulseColor }}
          >
            <div
              className="text-5xl font-heading font-black leading-none tracking-tighter mb-1"
              style={{ color: theme.pulseColor }}
            >
              {identityScore}<span className="text-xl align-top">%</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-charcoal-500 font-bold font-body">
              Identity Complete
            </div>
            {/* Position indicator */}
            <div className="mt-3 pt-3 border-t border-charcoal-100 flex items-center gap-2 text-xs text-charcoal-600 font-body">
              <TrendingUp size={12} />
              <span>{completedMilestones}/{totalMilestones} milestones</span>
            </div>
          </div>

          {/* Labs Card */}
          <div className="border-2 border-charcoal-200 rounded-2xl p-4 bg-white shadow-elevation-sm">
            <div className="space-y-3">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-charcoal-400 mb-1 font-body">Labs Completed</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-heading font-black text-gold-600">
                    {completedLabs.length}
                  </span>
                  <span className="text-xs text-charcoal-400 font-body">labs</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* The Resume (The Promise) */}
        <div className="bg-white p-8 lg:p-12 rounded-2xl shadow-elevation-md border-2 border-charcoal-100 relative min-h-[700px] group">
          {/* Edit Controls */}
          <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="p-2 bg-charcoal-100 rounded-xl text-charcoal-500 hover:bg-red-50 hover:text-red-500 transition-colors"><X size={16} /></button>
                <button onClick={handleSave} className="p-2 bg-charcoal-900 text-white rounded-xl hover:bg-charcoal-800 transition-colors"><Save size={16} /></button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="p-2 bg-charcoal-100 rounded-xl text-charcoal-500 hover:text-charcoal-900 transition-colors"><Edit3 size={16} /></button>
            )}
          </div>

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] z-0">
            <span className="text-9xl font-heading font-black -rotate-45">CONFIDENTIAL</span>
          </div>

          <div className="relative z-10">
            <div className="border-b-2 border-charcoal-900 pb-8 mb-8 flex justify-between items-start">
              <div>
                {isEditing ? (
                  <input
                    value={persona.name}
                    onChange={(e) => setPersona({ ...persona, name: e.target.value })}
                    className="text-3xl lg:text-4xl font-heading font-black text-charcoal-900 uppercase tracking-wide border-b-2 border-charcoal-300 focus:outline-none focus:border-charcoal-900 w-full bg-transparent"
                  />
                ) : (
                  <h2 className="text-3xl lg:text-4xl font-heading font-black text-charcoal-900 uppercase tracking-wide">{persona.name}</h2>
                )}
                <p className="text-xl text-charcoal-500 font-body font-light mt-2">{persona.title}</p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-2 bg-forest-100 text-forest-700 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest mb-2 font-body">
                  <Shield size={12} /> Verified Pro
                </div>
                <p className="text-charcoal-400 text-xs font-body">{persona.experienceLevel} Experience</p>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-[10px] font-bold text-charcoal-900 uppercase tracking-widest border-b border-charcoal-100 pb-2 mb-4 font-body">Professional Summary</h3>
              <p className="text-charcoal-600 leading-relaxed font-body">
                Senior Guidewire Developer with 7 years of specialized experience in PolicyCenter configuration and integration.
                Proven track record of delivering complex digital transformation projects for Tier-1 carriers.
                Expert in Gosu, Product Model architecture, and REST API integration patterns.
              </p>
            </div>

            <div className="mb-10">
              <h3 className="text-[10px] font-bold text-charcoal-900 uppercase tracking-widest border-b border-charcoal-100 pb-2 mb-4 font-body">Experience</h3>
              <div className="space-y-6">
                {/* Dynamic Experience from Labs */}
                {completedLabs.length > 0 ? (
                  <div>
                    <div className="flex justify-between mb-1">
                      <h4 className="font-bold text-charcoal-900 text-lg font-heading">Lead Developer - InTime Simulations</h4>
                      <span className="text-charcoal-400 text-sm italic font-body">Current</span>
                    </div>
                    <div className="text-charcoal-600 font-medium text-sm mb-2 font-body">Academy Capstone</div>
                    <ul className="list-disc pl-5 space-y-2 text-charcoal-500 text-sm leading-relaxed font-body">
                      {completedLabs.map(lab => (
                        <li key={lab.id}>{lab.content.lab.title}: Implemented full {lab.title.toLowerCase()} solution.</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-charcoal-400 text-sm italic p-4 bg-charcoal-50 rounded-xl font-body">Complete labs to unlock your experience bullets.</p>
                )}

                {persona.companies.map((job, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      {isEditing ? (
                        <input
                          value={job.role}
                          onChange={(e) => {
                            const newCompanies = [...persona.companies];
                            newCompanies[i].role = e.target.value;
                            setPersona({ ...persona, companies: newCompanies });
                          }}
                          className="font-bold text-charcoal-900 text-lg border-b border-charcoal-300 focus:border-charcoal-900 outline-none font-heading"
                        />
                      ) : (
                        <h4 className="font-bold text-charcoal-900 text-lg font-heading">{job.role}</h4>
                      )}
                      <span className="text-charcoal-400 text-sm italic font-body">{job.duration}</span>
                    </div>
                    <div className="text-charcoal-600 font-medium text-sm mb-2 font-body">{job.name}</div>
                    {isEditing ? (
                      <textarea
                        value={job.description}
                        onChange={(e) => {
                          const newCompanies = [...persona.companies];
                          newCompanies[i].description = e.target.value;
                          setPersona({ ...persona, companies: newCompanies });
                        }}
                        className="w-full text-charcoal-500 text-sm leading-relaxed border border-charcoal-200 rounded-xl p-3 font-body"
                      />
                    ) : (
                      <p className="text-charcoal-500 text-sm leading-relaxed font-body">{job.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-charcoal-900 uppercase tracking-widest border-b border-charcoal-100 pb-2 mb-4 font-body">Technical Arsenal</h3>
              <div className="flex flex-wrap gap-2">
                {persona.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-charcoal-100 text-charcoal-700 text-xs font-medium rounded-xl hover:bg-charcoal-200 transition-colors cursor-default font-body">
                    {skill}
                  </span>
                ))}
                {completedLabs.length > 0 && <span className="px-3 py-1.5 bg-forest-100 text-forest-700 text-xs font-medium rounded-xl font-body">Hands-on Config</span>}
                {isEditing && <button className="px-3 py-1.5 border-2 border-dashed border-charcoal-200 text-charcoal-400 text-xs rounded-xl hover:border-charcoal-400 hover:text-charcoal-600 font-body">+ Add</button>}
              </div>
            </div>
          </div>
        </div>

        {/* The Reality Gap (The Progress) */}
        <div className="flex flex-col gap-6">
          <div
            className="text-white p-8 rounded-2xl shadow-elevation-md relative overflow-hidden border-2"
            style={{
              background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
              borderColor: theme.gradientFrom,
            }}
          >
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                <Award size={20} className="text-gold-400" />
                Identity Gap Analysis
              </h3>
              <span className="text-[10px] font-body text-white/60 uppercase tracking-widest font-bold">
                REAL-TIME
              </span>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl border border-white/20">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm font-body">Foundation Layer</p>
                  <p className="text-xs text-white/60 font-body">Core terminology & data model concepts acquired.</p>
                </div>
              </div>

              {hasCompletedCore ? (
                <div className="flex items-center gap-4 p-4 bg-emerald-500/20 rounded-xl border border-emerald-400/40">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-emerald-300 font-body">Configuration Core</p>
                    <p className="text-xs text-emerald-200/80 font-body">Coverage patterns mastery demonstrated.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-gold-500/20 rounded-xl border border-gold-400/40 animate-pulse-slow">
                  <div className="w-10 h-10 rounded-xl bg-gold-500 text-charcoal-900 flex items-center justify-center shrink-0">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gold-300 font-body">Active Target: TechFlow Project</p>
                    <p className="text-xs text-white/60 font-body">Missing: &ldquo;Coverage Configuration&rdquo; evidence.</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 opacity-50">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-white/40 flex items-center justify-center shrink-0">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm font-body">Leadership Narratives</p>
                  <p className="text-xs text-white/40 font-body">Locked until Module 6.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border-2 border-charcoal-100 shadow-elevation-sm">
            <h3 className="font-heading text-xl font-bold text-charcoal-900 mb-2">Close the Gap</h3>
            <p className="text-charcoal-500 mb-6 text-sm font-body">You need to complete the <strong className="text-charcoal-900">Coverage Config Lab</strong> to validate the &ldquo;Configuration Specialist&rdquo; claim.</p>
            <button
              onClick={() => router.push('/academy/lesson/5/m5-l3')}
              className="w-full py-4 bg-charcoal-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-charcoal-800 transition-colors shadow-elevation-sm font-body"
            >
              Enter Lab: Coverage Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
