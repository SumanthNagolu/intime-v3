'use client'

import React from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  Clock,
  BookOpen,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Shield,
  Users,
  Award,
} from 'lucide-react'
import { AppLayout } from '@/components/AppLayout'
import { LEARNING_PATHS, getPathChapters, getPathTotalLessons, getPathEstimatedHours } from '@/lib/academy/learning-paths'

function PathCard({ path }: { path: typeof LEARNING_PATHS[number] }) {
  const chapters = getPathChapters(path.slug)
  const totalLessons = getPathTotalLessons(path.slug)
  const estimatedHours = getPathEstimatedHours(path.slug)

  return (
    <div className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-1 transition-all duration-300">
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-charcoal-900 via-gold-500 to-charcoal-900" />

      <div className="p-6">
        {/* Icon + Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl">{path.icon}</div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-charcoal-100 text-charcoal-600">
            {path.difficulty}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-heading font-bold text-xl text-charcoal-900 mb-2">
          {path.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-charcoal-500 leading-relaxed mb-5">
          {path.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-2.5 rounded-lg bg-charcoal-50">
            <div className="text-lg font-bold text-charcoal-900">{chapters.length}</div>
            <div className="text-[10px] font-medium text-charcoal-500 uppercase tracking-wider">Chapters</div>
          </div>
          <div className="text-center p-2.5 rounded-lg bg-charcoal-50">
            <div className="text-lg font-bold text-charcoal-900">{totalLessons}</div>
            <div className="text-[10px] font-medium text-charcoal-500 uppercase tracking-wider">Lessons</div>
          </div>
          <div className="text-center p-2.5 rounded-lg bg-charcoal-50">
            <div className="text-lg font-bold text-charcoal-900">{estimatedHours}h</div>
            <div className="text-[10px] font-medium text-charcoal-500 uppercase tracking-wider">Duration</div>
          </div>
        </div>

        {/* Chapter Preview */}
        <div className="mb-6">
          <h4 className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest mb-2">
            Curriculum
          </h4>
          <div className="space-y-1">
            {chapters.slice(0, 5).map((ch, i) => (
              <div key={ch.slug} className="flex items-center gap-2 text-xs text-charcoal-600">
                <span className="w-5 h-5 rounded-full bg-charcoal-100 flex items-center justify-center text-[10px] font-bold text-charcoal-500">
                  {i + 1}
                </span>
                <span className="truncate">{ch.title}</span>
              </div>
            ))}
            {chapters.length > 5 && (
              <div className="text-[10px] text-charcoal-400 font-medium pl-7">
                +{chapters.length - 5} more chapters
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/academy/catalog/${path.slug}`}
          className="flex items-center justify-center gap-2 w-full py-3 bg-charcoal-900 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all duration-300 group-hover:-translate-y-0.5"
        >
          View Path Details
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}

export default function CatalogPage() {
  return (
    <AppLayout>
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-50 text-gold-700 text-[10px] font-bold uppercase tracking-widest mb-4">
          <Sparkles size={12} />
          Guidewire Developer Training
        </div>
        <h1 className="font-heading font-black text-4xl md:text-5xl text-charcoal-900 tracking-tight mb-4">
          Choose Your Path
        </h1>
        <p className="text-charcoal-500 text-lg max-w-2xl mx-auto leading-relaxed">
          Master Guidewire InsuranceSuite development with structured, hands-on training paths.
          Each path includes video lessons, interactive content, and real-world assignments.
        </p>
      </div>

      {/* Key Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-3xl mx-auto">
        {[
          { icon: BookOpen, label: '160+ Lessons', sublabel: 'Comprehensive curriculum' },
          { icon: Clock, label: '400+ Hours', sublabel: 'Of training content' },
          { icon: Award, label: 'Certificates', sublabel: 'On path completion' },
          { icon: Users, label: 'AI Assistant', sublabel: 'Guru chat support' },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-charcoal-100">
            <div className="w-9 h-9 rounded-lg bg-charcoal-100 flex items-center justify-center">
              <stat.icon size={16} className="text-charcoal-500" />
            </div>
            <div>
              <div className="text-sm font-bold text-charcoal-900">{stat.label}</div>
              <div className="text-[10px] text-charcoal-400">{stat.sublabel}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Path Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-16">
        {LEARNING_PATHS.map((path) => (
          <PathCard key={path.slug} path={path} />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="p-8 rounded-xl bg-charcoal-900 text-white">
          <Shield size={32} className="mx-auto mb-4 text-gold-400" />
          <h2 className="font-heading font-bold text-2xl mb-2">Not sure which path to choose?</h2>
          <p className="text-charcoal-400 text-sm mb-6">
            Start with PolicyCenter Developer - it&apos;s our most popular path and provides the broadest foundation for Guidewire development.
          </p>
          <Link
            href="/academy/catalog/policycenter-developer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 text-charcoal-900 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-gold-400 transition-colors"
          >
            Start with PolicyCenter
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
