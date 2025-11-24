'use client';


import React, { useState } from 'react';
import { X, Search, Users, Linkedin, Database, CheckCircle, Plus } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { Candidate, Submission } from '../../types';

interface SourcingModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
}

export const SourcingModal: React.FC<SourcingModalProps> = ({ isOpen, onClose, jobId }) => {
  const { candidates, addSubmission, jobs } = useAppStore();
  const [source, setSource] = useState<'internal' | 'linkedin'>('internal');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const job = jobs.find(j => j.id === jobId);

  if (!isOpen) return null;

  // Filter candidates not already submitted to this job
  // In a real app, this would query an external DB for 'linkedin' source
  const availableCandidates = candidates.filter(c => c.status !== 'placed'); 

  const toggleCandidate = (id: string) => {
    if (selectedCandidateIds.includes(id)) {
        setSelectedCandidateIds(prev => prev.filter(cid => cid !== id));
    } else {
        setSelectedCandidateIds(prev => [...prev, id]);
    }
  };

  const handleSource = () => {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
          selectedCandidateIds.forEach(cid => {
              const newSubmission: Submission = {
                  id: `sub-${Date.now()}-${cid}`,
                  jobId: jobId,
                  candidateId: cid,
                  status: 'sourced',
                  createdAt: new Date().toLocaleDateString(),
                  lastActivity: 'Sourced via ' + source,
                  matchScore: 85 // Mock score
              };
              addSubmission(newSubmission);
          });
          setIsSubmitting(false);
          onClose();
      }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-stone-100 flex justify-between items-start">
                <div>
                    <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Talent Discovery</div>
                    <h2 className="text-3xl font-serif font-bold text-charcoal">Source Candidates</h2>
                    <p className="text-stone-500 mt-1">For: <span className="font-bold text-charcoal">{job?.title}</span></p>
                </div>
                <button onClick={onClose} className="p-2 text-stone-400 hover:text-charcoal transition-colors rounded-full hover:bg-stone-100">
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex gap-6 px-8 py-4 border-b border-stone-100">
                    <button 
                        onClick={() => setSource('internal')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${source === 'internal' ? 'bg-stone-100 text-charcoal' : 'text-stone-400 hover:text-charcoal'}`}
                    >
                        <Database size={16} /> Internal DB
                    </button>
                    <button 
                        onClick={() => setSource('linkedin')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${source === 'linkedin' ? 'bg-blue-50 text-blue-700' : 'text-stone-400 hover:text-blue-600'}`}
                    >
                        <Linkedin size={16} /> LinkedIn Recruiter
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-stone-50">
                    <div className="space-y-4">
                        {availableCandidates.map(candidate => (
                            <div 
                                key={candidate.id} 
                                onClick={() => toggleCandidate(candidate.id)}
                                className={`bg-white p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${selectedCandidateIds.includes(candidate.id) ? 'border-rust ring-1 ring-rust' : 'border-stone-200 hover:border-stone-300'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedCandidateIds.includes(candidate.id) ? 'bg-rust border-rust' : 'border-stone-300 bg-white'}`}>
                                        {selectedCandidateIds.includes(candidate.id) && <CheckCircle size={14} className="text-white" />}
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center font-serif font-bold text-charcoal">
                                        {candidate.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-charcoal">{candidate.name}</div>
                                        <div className="text-xs text-stone-500">{candidate.role} • {candidate.location}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Match</div>
                                        <div className="font-bold text-green-600">{candidate.score}%</div>
                                    </div>
                                    <div className="flex gap-2">
                                        {candidate.skills.slice(0, 3).map(s => (
                                            <span key={s} className="px-2 py-1 bg-stone-50 rounded text-[10px] font-bold text-stone-500 border border-stone-100">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-stone-100 flex justify-between items-center bg-white rounded-b-[2rem]">
                <div className="text-sm font-bold text-stone-500">
                    {selectedCandidateIds.length} candidates selected
                </div>
                <div className="flex gap-4">
                    <button onClick={onClose} className="px-6 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:text-charcoal">Cancel</button>
                    <button 
                        onClick={handleSource}
                        disabled={selectedCandidateIds.length === 0 || isSubmitting}
                        className="px-8 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? 'Adding...' : `Add to Job Pipeline`} <Plus size={16} />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
