import React from 'react';
import { Bell, MessageCircle, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Module 1 Completed',
      message: 'You have successfully passed the Foundation & Architecture assessment.',
      time: '2 hours ago',
      icon: CheckCircle
    },
    {
      id: 2,
      type: 'info',
      title: 'New Coach Note',
      message: 'Your AI Mentor has left feedback on your recent Lab submission.',
      time: '1 day ago',
      icon: MessageCircle
    },
    {
      id: 3,
      type: 'warning',
      title: 'Sprint Deadline Approaching',
      message: 'User Story US-105 is due in 24 hours. Please update your status.',
      time: '1 day ago',
      icon: Clock
    }
  ];

  return (
    <div className="animate-fade-in pt-4 max-w-2xl mx-auto pb-12">
      <div className="mb-10 text-center">
        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-3">System Alerts</div>
        <h1 className="text-4xl font-serif font-bold text-charcoal mb-4">Notifications</h1>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-stone-100 overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {notifications.map((note) => (
              <div key={note.id} className="p-6 hover:bg-stone-50 transition-colors flex gap-4 items-start">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  note.type === 'success' ? 'bg-forest/10 text-forest' :
                  note.type === 'warning' ? 'bg-yellow-50 text-yellow-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  <note.icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-charcoal text-sm">{note.title}</h3>
                    <span className="text-xs text-stone-400 whitespace-nowrap">{note.time}</span>
                  </div>
                  <p className="text-stone-500 text-sm leading-relaxed">{note.message}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-stone-400">
            <Bell size={48} className="mx-auto mb-4 opacity-20" />
            <p>You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};