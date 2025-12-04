'use client';


import React, { useState } from 'react';
import { Calendar, Clock, User, Video, MapPin, X, CheckCircle, Phone } from 'lucide-react';

interface InterviewSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  jobTitle: string;
}

export const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({ isOpen, onClose, candidateName, jobTitle }) => {
  const [step, setStep] = useState<'details' | 'success'>('details');
  const [type, setType] = useState('Video');

  if (!isOpen) return null;

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send an API request
    setStep('success');
  };

  return (
    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
          <X size={24} />
        </button>

        {step === 'details' ? (
          <form onSubmit={handleSchedule}>
            <div className="mb-8 border-b border-stone-100 pb-6">
              <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Interview Request</div>
              <h2 className="text-3xl font-serif font-bold text-charcoal">Schedule Interview</h2>
              <p className="text-stone-500 mt-2 text-sm">For <strong>{candidateName}</strong> • {jobTitle}</p>
            </div>

            <div className="space-y-6">
              {/* Type Selection */}
              <div className="flex gap-4">
                {['Video', 'Phone', 'Onsite'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border-2 transition-all flex flex-col items-center gap-2 ${
                      type === t ? 'border-rust bg-rust/5 text-rust' : 'border-stone-100 text-stone-400 hover:border-stone-200'
                    }`}
                  >
                    {t === 'Video' && <Video size={18} />}
                    {t === 'Phone' && <Phone size={18} />}
                    {t === 'Onsite' && <MapPin size={18} />}
                    {t}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Date</label>
                  <div className="flex items-center gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <Calendar size={16} className="text-stone-400" />
                    <input type="date" required className="bg-transparent outline-none text-sm font-bold text-charcoal w-full" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Time</label>
                  <div className="flex items-center gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <Clock size={16} className="text-stone-400" />
                    <input type="time" required className="bg-transparent outline-none text-sm font-bold text-charcoal w-full" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Interviewer(s)</label>
                <div className="flex items-center gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <User size={16} className="text-stone-400" />
                  <input type="text" placeholder="e.g. Hiring Manager, Tech Lead" className="bg-transparent outline-none text-sm font-medium text-charcoal w-full placeholder-stone-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Notes / Instructions</label>
                <textarea className="w-full h-24 p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm resize-none focus:outline-none focus:border-rust" placeholder="Technical assessment focus areas..." />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button type="button" onClick={onClose} className="px-6 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:text-charcoal">Cancel</button>
              <button type="submit" className="px-8 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-lg">
                Send Invites
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-charcoal mb-2">Interview Scheduled!</h3>
            <p className="text-stone-500 mb-8 text-sm max-w-xs mx-auto">
              Calendar invites have been sent to the candidate and the interviewing team.
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
