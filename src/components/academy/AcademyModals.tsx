'use client';


import React, { useState } from 'react';
import { X, Send, Bell, Download, CheckCircle, FileText, Users, Check } from 'lucide-react';

// --- MESSAGE MODAL ---
interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
}

export const MessageModal: React.FC<MessageModalProps> = ({ isOpen, onClose, recipientName }) => {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setMessage('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
          <X size={24} />
        </button>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-serif font-bold text-charcoal">Message Sent</h3>
            <p className="text-stone-500 text-sm mt-2">Notification dispatched to {recipientName}.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Direct Message</div>
              <h2 className="text-2xl font-serif font-bold text-charcoal">Message {recipientName}</h2>
            </div>
            <textarea 
              className="w-full h-32 p-4 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none mb-4"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex justify-end">
              <button onClick={handleSend} className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all flex items-center gap-2">
                Send <Send size={14} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// --- ANNOUNCEMENT MODAL ---
interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: string;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ isOpen, onClose, target }) => {
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handlePost = () => {
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
          <X size={24} />
        </button>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={32} />
            </div>
            <h3 className="text-xl font-serif font-bold text-charcoal">Announcement Posted</h3>
            <p className="text-stone-500 text-sm mt-2">All students in {target} have been notified.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Broadcast</div>
              <h2 className="text-2xl font-serif font-bold text-charcoal">New Announcement</h2>
              <p className="text-sm text-stone-500 mt-1">Target: <strong>{target}</strong></p>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Title</label>
                    <input className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust text-sm font-bold text-charcoal" placeholder="e.g. Schedule Change" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Content</label>
                    <textarea className="w-full h-32 p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none" placeholder="Details..." />
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <Users size={16} className="text-blue-600" />
                    <span className="text-xs text-blue-700 font-medium">Will notify 20 students via Email & Portal</span>
                </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={handlePost} className="px-8 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all flex items-center gap-2">
                Post <Send size={14} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// --- EXPORT MODAL ---
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
          <X size={24} />
        </button>

        <div className="text-center">
            <div className="w-16 h-16 bg-stone-100 text-stone-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText size={32} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-charcoal mb-2">Export Report</h3>
            <p className="text-stone-500 text-sm mb-8">Select the data points to include in your CSV export.</p>
            
            <div className="text-left space-y-3 mb-8 px-4">
                <label className="flex items-center gap-3 p-3 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50">
                    <input type="checkbox" defaultChecked className="accent-rust" />
                    <span className="text-sm font-bold text-charcoal">Student Progress & Scores</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50">
                    <input type="checkbox" defaultChecked className="accent-rust" />
                    <span className="text-sm font-bold text-charcoal">Attendance Records</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50">
                    <input type="checkbox" className="accent-rust" />
                    <span className="text-sm font-bold text-charcoal">Communication Logs</span>
                </label>
            </div>

            <button 
                onClick={handleDownload}
                disabled={downloading}
                className="w-full py-4 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all flex items-center justify-center gap-2"
            >
                {downloading ? 'Generating...' : 'Download CSV'} <Download size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

// --- GRADING MODAL ---
interface GradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  assignmentTitle: string;
}

export const GradingModal: React.FC<GradingModalProps> = ({ isOpen, onClose, studentName, assignmentTitle }) => {
  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl relative flex flex-col max-h-[90vh]">
              <button onClick={onClose} className="absolute top-8 right-8 text-stone-400 hover:text-charcoal">
                  <X size={24} />
              </button>
              
              <div className="mb-6 border-b border-stone-100 pb-6">
                  <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Assessment</div>
                  <h2 className="text-3xl font-serif font-bold text-charcoal">Grade Submission</h2>
                  <p className="text-stone-500 mt-1">{assignmentTitle} • {studentName}</p>
              </div>

              <div className="flex-1 overflow-y-auto pr-2">
                  <div className="bg-stone-900 p-6 rounded-xl text-stone-300 font-mono text-xs mb-8 overflow-x-auto">
                      <p className="text-green-400 mb-2">// Student Code Submission</p>
                      <pre>{`<CoveragePattern public-id="PAMedPayCov" ...>\n  <CovTerms>\n    <OptionCovTerm ... />\n  </CovTerms>\n</CoveragePattern>`}</pre>
                  </div>

                  <h4 className="font-bold text-charcoal text-sm uppercase tracking-widest mb-4">Rubric</h4>
                  <div className="space-y-4 mb-8">
                      <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
                          <div>
                              <div className="font-bold text-charcoal text-sm">Correct Public ID Naming</div>
                              <div className="text-xs text-stone-500">Follows convention (PascalCase)</div>
                          </div>
                          <div className="flex gap-2">
                              <button className="px-3 py-1 bg-white border border-stone-200 rounded text-xs font-bold hover:bg-green-50 hover:text-green-700 hover:border-green-200">25 pts</button>
                          </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
                          <div>
                              <div className="font-bold text-charcoal text-sm">Existence Logic</div>
                              <div className="text-xs text-stone-500">Set to &apos;Electable&apos;</div>
                          </div>
                          <div className="flex gap-2">
                              <button className="px-3 py-1 bg-white border border-stone-200 rounded text-xs font-bold hover:bg-green-50 hover:text-green-700 hover:border-green-200">25 pts</button>
                          </div>
                      </div>
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Feedback</label>
                      <textarea className="w-full h-24 p-4 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none" placeholder="Enter comments..." />
                  </div>
              </div>

              <div className="mt-8 pt-6 border-t border-stone-100 flex justify-end gap-4">
                  <button className="px-6 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-50 rounded-xl">Request Revisions</button>
                  <button onClick={onClose} className="px-8 py-3 bg-green-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-700 shadow-lg flex items-center gap-2">
                      <Check size={16} /> Approve & Grade
                  </button>
              </div>
          </div>
      </div>
  );
};
