'use client';


import React, { useState } from 'react';
import { ChevronLeft, Award, CheckCircle, Search, Download, Send, Loader2, Users, RefreshCcw } from 'lucide-react';
import { useAppStore } from '../../lib/store';

export const CertificateGenerator: React.FC = () => {
  const { cohorts } = useAppStore();
  const [activeTab, setActiveTab] = useState<'Generate' | 'History'>('Generate');
  const [selectedTemplate, setSelectedTemplate] = useState('Modern');
  const [selectedCohort, setSelectedCohort] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<'select' | 'customize' | 'preview' | 'done'>('select');
  
  // History Tab State
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleGenerate = () => {
      setIsGenerating(true);
      setTimeout(() => {
          setIsGenerating(false);
          setStep('done');
      }, 2000);
  };

  const handleAction = (action: string, id: string) => {
      setActionFeedback(`${action} triggered for ${id}`);
      setTimeout(() => setActionFeedback(null), 2000);
  };

  const certificates = [
      { id: 'X78-992-QA1', student: 'Alex Rivera', course: 'Senior Guidewire Developer', date: 'Nov 24, 2025', status: 'Active' },
      { id: 'X78-443-BB2', student: 'Jordan Lee', course: 'PolicyCenter Config', date: 'Oct 12, 2025', status: 'Active' },
      { id: 'X78-112-CC3', student: 'Sarah Chen', course: 'BillingCenter Fundamentals', date: 'Sep 01, 2025', status: 'Revoked' },
      { id: 'X78-555-DD4', student: 'Mike Ross', course: 'ClaimCenter Intro', date: 'Aug 15, 2025', status: 'Active' },
      { id: 'X78-777-EE5', student: 'David Kim', course: 'Integration Architect', date: 'Jul 20, 2025', status: 'Active' },
  ];

  const filteredCertificates = certificates.filter(c => 
      c.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      
      {actionFeedback && (
          <div className="fixed bottom-8 right-8 bg-charcoal text-white px-6 py-3 rounded-xl shadow-2xl animate-slide-up z-50 flex items-center gap-3">
              <CheckCircle size={18} className="text-green-400" />
              <span className="text-sm font-bold">{actionFeedback}</span>
          </div>
      )}

      {activeTab === 'Generate' && (
          step === 'done' ? (
              <div className="bg-white rounded-[2.5rem] p-16 shadow-2xl text-center border border-stone-200 max-w-3xl mx-auto mt-12">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                      <CheckCircle size={40} />
                  </div>
                  <h2 className="text-4xl font-serif font-bold text-charcoal mb-4">Certificates Issued!</h2>
                  <p className="text-stone-500 max-w-md mx-auto mb-10 text-lg">
                      PDFs have been generated and emailed to 12 students in the selected cohort. 
                      Blockchain verification links are active.
                  </p>
                  <div className="flex justify-center gap-4">
                      <button onClick={() => setStep('select')} className="px-8 py-4 bg-stone-100 text-stone-600 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-stone-200 transition-colors">
                          Issue More
                      </button>
                      <button onClick={() => setActiveTab('History')} className="px-8 py-4 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-lg">
                          View History
                      </button>
                  </div>
              </div>
          ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: Configuration */}
                  <div className="lg:col-span-4 space-y-8">
                      
                      <div className="flex bg-stone-100 p-1 rounded-full mb-2">
                          {(['Generate', 'History'] as const).map(tab => (
                              <button
                                  key={tab}
                                  onClick={() => setActiveTab(tab)}
                                  className={`flex-1 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white shadow-sm text-charcoal' : 'text-stone-400 hover:text-stone-600'}`}
                              >
                                  {tab}
                              </button>
                          ))}
                      </div>

                      <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                          <div className="flex items-center gap-3 mb-6">
                              <div className="w-8 h-8 bg-charcoal text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                              <h3 className="font-bold text-charcoal">Select Template</h3>
                          </div>
                          <div className="space-y-3">
                              {['Modern', 'Classic', 'Technical'].map(t => (
                                  <div 
                                    key={t} 
                                    onClick={() => setSelectedTemplate(t)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedTemplate === t ? 'border-rust bg-rust/5 text-rust' : 'border-stone-200 hover:border-stone-300'}`}
                                  >
                                      <div className="font-bold text-sm">{t} Design</div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                          <div className="flex items-center gap-3 mb-6">
                              <div className="w-8 h-8 bg-charcoal text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                              <h3 className="font-bold text-charcoal">Select Recipients</h3>
                          </div>
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Cohort</label>
                                  <select 
                                    value={selectedCohort}
                                    onChange={(e) => setSelectedCohort(e.target.value)}
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-charcoal focus:outline-none focus:border-rust"
                                  >
                                      <option value="">-- Select Cohort --</option>
                                      {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                  </select>
                              </div>
                              {selectedCohort && (
                                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700 flex items-center gap-2">
                                      <Users size={14} /> 12 Graduates Eligible
                                  </div>
                              )}
                          </div>
                      </div>

                      <button 
                        onClick={handleGenerate}
                        disabled={!selectedCohort || isGenerating}
                        className="w-full py-4 bg-charcoal text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                          {isGenerating ? <Loader2 size={16} className="animate-spin"/> : <Award size={16}/>}
                          {isGenerating ? 'Generating...' : 'Generate & Send'}
                      </button>
                  </div>

                  {/* Right: Preview */}
                  <div className="lg:col-span-8">
                      <div className="bg-stone-100 p-8 rounded-[2rem] border border-stone-200 min-h-[600px] flex items-center justify-center relative overflow-hidden">
                          <div className="bg-white w-full max-w-2xl aspect-[1.414] shadow-2xl relative p-12 border border-stone-100 flex flex-col justify-between text-center transform scale-95 hover:scale-100 transition-transform duration-500">
                              {/* Border Decoration */}
                              <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-double border-stone-200 pointer-events-none"></div>
                              
                              {/* Logo */}
                              <div className="mx-auto w-16 h-16 bg-charcoal text-white rounded-full flex items-center justify-center font-serif font-bold text-2xl mb-8">I</div>
                              
                              <div>
                                  <h2 className="text-4xl font-serif font-bold text-charcoal mb-2">Certificate of Completion</h2>
                                  <p className="text-stone-500 uppercase tracking-widest text-xs">Is hereby awarded to</p>
                              </div>

                              <div className="font-serif text-5xl font-bold text-rust italic py-8 border-b border-stone-200 max-w-lg mx-auto">
                                  [Student Name]
                              </div>

                              <div>
                                  <p className="text-stone-600 text-sm max-w-lg mx-auto leading-relaxed mb-8">
                                      For successfully completing the rigorous requirements of the <strong>Senior Guidewire Developer Track</strong>, demonstrating proficiency in PolicyCenter Configuration and Gosu Programming.
                                  </p>
                                  <div className="flex justify-center gap-12">
                                      <div className="text-center">
                                          <div className="font-serif font-bold text-lg font-italic text-charcoal mb-1">Elena Rodriguez</div>
                                          <div className="text-[10px] uppercase tracking-widest text-stone-400 border-t border-stone-300 pt-1 w-32 mx-auto">Head of Academy</div>
                                      </div>
                                      <div className="text-center">
                                          <div className="font-serif font-bold text-lg font-italic text-charcoal mb-1">{new Date().toLocaleDateString()}</div>
                                          <div className="text-[10px] uppercase tracking-widest text-stone-400 border-t border-stone-300 pt-1 w-32 mx-auto">Date</div>
                                      </div>
                                  </div>
                              </div>

                              <div className="absolute bottom-6 right-8 text-[8px] text-stone-300 font-mono">
                                  ID: X78-992-QA1 • Verify at intime.os/verify
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          )
      )}

      {activeTab === 'History' && (
          <div className="animate-fade-in">
              <div className="mb-8 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                      <button onClick={() => setActiveTab('Generate')} className="text-xs font-bold text-stone-400 hover:text-charcoal uppercase tracking-widest flex items-center gap-1">
                          <ChevronLeft size={12} /> Back to Generate
                      </button>
                      <h3 className="font-serif text-2xl font-bold text-charcoal">Issued Certificates</h3>
                  </div>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-lg border border-stone-200 overflow-hidden">
                  <div className="p-6 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                      <div className="flex items-center gap-4 bg-white p-3 rounded-full border border-stone-200 shadow-sm w-96">
                          <Search size={18} className="text-stone-400 ml-2" />
                          <input 
                            placeholder="Search by Student or ID..." 
                            className="bg-transparent outline-none text-sm font-medium text-charcoal placeholder-stone-400 w-full" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                      </div>
                      <button className="p-2 text-stone-400 hover:text-charcoal">
                          <RefreshCcw size={20} />
                      </button>
                  </div>
                  
                  <table className="w-full text-left">
                      <thead className="bg-stone-50 text-xs font-bold text-stone-400 uppercase tracking-widest">
                          <tr>
                              <th className="p-6">Certificate ID</th>
                              <th className="p-6">Student Name</th>
                              <th className="p-6">Course</th>
                              <th className="p-6">Issue Date</th>
                              <th className="p-6">Status</th>
                              <th className="p-6 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                          {filteredCertificates.length > 0 ? filteredCertificates.map(cert => (
                              <tr key={cert.id} className="hover:bg-stone-50 transition-colors group">
                                  <td className="p-6 font-mono text-xs font-bold text-stone-500">{cert.id}</td>
                                  <td className="p-6">
                                      <div className="font-bold text-charcoal">{cert.student}</div>
                                  </td>
                                  <td className="p-6 text-sm text-stone-600">{cert.course}</td>
                                  <td className="p-6 text-sm text-stone-500">{cert.date}</td>
                                  <td className="p-6">
                                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                          cert.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                      }`}>
                                          {cert.status}
                                      </span>
                                  </td>
                                  <td className="p-6 text-right">
                                      <div className="flex justify-end gap-2">
                                          <button onClick={() => handleAction('Downloaded', cert.id)} title="Download PDF" className="p-2 text-stone-400 hover:text-charcoal hover:bg-white rounded-lg transition-all border border-transparent hover:border-stone-200 hover:shadow-sm">
                                              <Download size={16}/>
                                          </button>
                                          <button onClick={() => handleAction('Resent Email', cert.id)} title="Resend Email" className="p-2 text-stone-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-blue-200 hover:shadow-sm">
                                              <Send size={16}/>
                                          </button>
                                          <button onClick={() => handleAction('Revoked', cert.id)} title="Revoke" className="p-2 text-stone-400 hover:text-red-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-red-200 hover:shadow-sm">
                                              <RefreshCcw size={16}/>
                                          </button>
                                      </div>
                                  </td>
                              </tr>
                          )) : (
                              <tr>
                                  <td colSpan={6} className="p-12 text-center text-stone-400 italic">
                                      No certificates found.
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
};
