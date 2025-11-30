'use client';

import React from 'react';
import { Bell, MessageCircle, CheckCircle, Clock, TrendingUp, Trash2, MoreHorizontal } from 'lucide-react';
import { useAcademyStore, useBiometric } from '@/lib/store/academy-store';
import { BiometricStatusIndicator } from './academy/BiometricBackground';
import { cn } from '@/lib/utils';

export const NotificationsView: React.FC = () => {
  const { streakDays } = useAcademyStore();
  const { state, theme, statusMessage } = useBiometric();

  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Module 1 Completed',
      message: 'You have successfully passed the Foundation & Architecture assessment.',
      time: '2 hours ago',
      icon: CheckCircle,
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: 'New Coach Note',
      message: 'Your AI Mentor has left feedback on your recent Lab submission.',
      time: '1 day ago',
      icon: MessageCircle,
      read: false
    },
    {
      id: 3,
      type: 'warning',
      title: 'Sprint Deadline Approaching',
      message: 'User Story US-105 is due in 24 hours. Please update your status.',
      time: '1 day ago',
      icon: Clock,
      read: true
    },
    {
      id: 4,
      type: 'success',
      title: 'Achievement Unlocked',
      message: 'You earned the "First Blood" achievement for completing your first lesson!',
      time: '2 days ago',
      icon: CheckCircle,
      read: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const typeStyles = {
    success: {
      bg: 'bg-forest-100',
      text: 'text-forest-700',
      border: 'border-forest-200'
    },
    warning: {
      bg: 'bg-gold-100',
      text: 'text-gold-700',
      border: 'border-gold-200'
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-200'
    }
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
            Notifications
          </h1>

          {/* Motivational Quote */}
          <p className="text-charcoal-500 text-lg max-w-xl leading-relaxed font-heading italic border-l-2 pl-4 mt-6"
            style={{ borderColor: theme.pulseColor }}>
            &ldquo;Stay updated on your progress and important alerts.&rdquo;
          </p>
        </div>

        {/* Primary Score Display */}
        <div className="flex flex-wrap gap-4">
          {/* Unread Count - Main Metric */}
          <div
            className="relative border-2 rounded-2xl p-6 bg-white shadow-elevation-md min-w-[140px]"
            style={{ borderColor: theme.pulseColor }}
          >
            <div
              className="text-5xl font-heading font-black leading-none tracking-tighter mb-1"
              style={{ color: theme.pulseColor }}
            >
              {unreadCount}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-charcoal-500 font-bold font-body">
              Unread
            </div>
            {/* Position indicator */}
            <div className="mt-3 pt-3 border-t border-charcoal-100 flex items-center gap-2 text-xs text-charcoal-600 font-body">
              <TrendingUp size={12} />
              <span>{notifications.length} total</span>
            </div>
          </div>

          {/* Stats Card */}
          <div className="border-2 border-charcoal-200 rounded-2xl p-4 bg-white shadow-elevation-sm">
            <div className="space-y-3">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-charcoal-400 mb-1 font-body">This Week</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-heading font-black text-gold-600">
                    {notifications.length}
                  </span>
                  <span className="text-xs text-charcoal-400 font-body">alerts</span>
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
      <div className="max-w-3xl">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button className="text-xs font-bold text-charcoal-900 uppercase tracking-widest font-body px-4 py-2 bg-charcoal-100 rounded-xl">
              All
            </button>
            <button className="text-xs font-bold text-charcoal-500 uppercase tracking-widest font-body px-4 py-2 hover:bg-charcoal-50 rounded-xl transition-colors">
              Unread ({unreadCount})
            </button>
          </div>
          <button className="text-xs font-bold text-charcoal-500 hover:text-charcoal-900 uppercase tracking-widest font-body flex items-center gap-2">
            <Trash2 size={14} />
            Clear All
          </button>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-elevation-sm border-2 border-charcoal-100 overflow-hidden">
          {notifications.length > 0 ? (
            <div className="divide-y divide-charcoal-100">
              {notifications.map((note) => {
                const styles = typeStyles[note.type as keyof typeof typeStyles];
                return (
                  <div
                    key={note.id}
                    className={cn(
                      "p-6 hover:bg-charcoal-50 transition-colors flex gap-4 items-start group",
                      !note.read && "bg-charcoal-50/50"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      styles.bg,
                      styles.text
                    )}>
                      <note.icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1 gap-4">
                        <h3 className={cn(
                          "font-heading font-bold text-sm",
                          !note.read ? "text-charcoal-900" : "text-charcoal-600"
                        )}>
                          {note.title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-charcoal-400 whitespace-nowrap font-body">{note.time}</span>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity text-charcoal-400 hover:text-charcoal-700">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-charcoal-500 text-sm leading-relaxed font-body">{note.message}</p>
                      {!note.read && (
                        <div className="mt-2">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: theme.pulseColor }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-16 text-center text-charcoal-400">
              <div className="w-16 h-16 bg-charcoal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell size={32} className="text-charcoal-300" />
              </div>
              <p className="font-heading font-bold text-lg text-charcoal-600 mb-2">You&apos;re all caught up!</p>
              <p className="text-sm font-body">No new notifications at the moment.</p>
            </div>
          )}
        </div>

        {/* Load More */}
        {notifications.length > 0 && (
          <div className="mt-6 text-center">
            <button className="text-xs font-bold text-charcoal-500 hover:text-charcoal-900 uppercase tracking-widest font-body">
              Load older notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
