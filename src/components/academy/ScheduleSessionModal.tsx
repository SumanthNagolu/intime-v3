'use client';


import React, { useState } from 'react';
import { X, Calendar, Clock, Video, Users, CheckCircle, Send } from 'lucide-react';

interface ScheduleSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohortName: string;
}

export const ScheduleSessionModal: React.FC<ScheduleSessionModalProps> = ({ isOpen, onClose, cohortName }) => {
  const [step, setStep] = useState<'details' | 'success'>('details');
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    duration: '60',
    link: '',
    sendInvite: true
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock API call
    setTimeout(() => {
      setStep('success');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
          <X size={24} />
        </button>

        {step === 'details' ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-8 border-b border-stone-100 pb-6">
              <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Live Classroom</div>
              <h2 className="text-3xl font-serif font-bold text-charcoal">Schedule Session</h2>
              <p className="text-stone-500 mt-2 text-sm">For <strong>{cohortName}</strong></p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Session Title</label>
                <input 
                  required
                  placeholder="e.g. Module 5 Deep Dive: Rating Engines"
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust font-medium text-charcoal"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Date</label>
                  <div className="flex items-center gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <Calendar size={16} className="text-stone-400" />
                    <input 
                      type="date" 
                      required 
                      className="bg-transparent outline-none text-sm font-bold text-charcoal w-full" 
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Time</label>
                  <div className="flex items-center gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <Clock size={16} className="text-stone-400" />
                    <input 
                      type="time" 
                      required 
                      className="bg-transparent outline-none text-sm font-bold text-charcoal w-full" 
                      value={formData.time}
                      onChange={e => setFormData({...formData, time: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Duration</label>
                    <select 
                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust text-sm font-medium"
                        value={formData.duration}
                        onChange={e => setFormData({...formData, duration: e.target.value})}
                    >
                        <option value="30">30 Minutes</option>
                        <option value="60">1 Hour</option>
                        <option value="90">1.5 Hours</option>
                        <option value="120">2 Hours</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Platform</label>
                    <div className="flex items-center gap-2 p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-500 text-sm">
                        <Video size={16} /> Google Meet (Auto)
                    </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <input 
                    type="checkbox" 
                    id="invite" 
                    checked={formData.sendInvite}
                    onChange={e => setFormData({...formData, sendInvite: e.target.checked})}
                    className="w-4 h-4 text-rust rounded border-stone-300 focus:ring-rust"
                  />
                  <label htmlFor="invite" className="text-sm text-blue-800 cursor-pointer select-none">
                      Send calendar invites to all students in cohort
                  </label>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button type="button" onClick={onClose} className="px-6 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:text-charcoal">Cancel</button>
              <button type="submit" className="px-8 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-lg flex items-center gap-2">
                Create Session <Send size={14} />
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-charcoal mb-2">Session Scheduled!</h3>
            <p className="text-stone-500 mb-8 text-sm max-w-xs mx-auto">
              Invites have been sent. The session has been added to your dashboard and the student portal.
            </p>
            <button onClick={onClose} className="px-8 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full text-xs font-bold uppercase tracking-widest transition-colors">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
