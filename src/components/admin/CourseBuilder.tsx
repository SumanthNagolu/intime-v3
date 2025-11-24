'use client';


import React, { useState } from 'react';
import { Layers, Plus, BookOpen, Video, ShieldCheck, Terminal, Save, ChevronLeft, GripVertical, Trash2, Upload, FileText, CheckSquare, Play, ListPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const CourseBuilder: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'theory' | 'demo' | 'verify' | 'build'>('theory');

  // Demo Tab State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [chapters, setChapters] = useState([{ time: '0:00', label: 'Introduction' }]);
  
  // Build Tab State
  const [rubricItems, setRubricItems] = useState([{ id: 1, criteria: 'Requirement 1', points: 25 }]);

  const handleVideoDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          setVideoFile(e.dataTransfer.files[0]);
      }
  };

  return (
    <div className="animate-fade-in">
      
      <Link href="/employee/academy/admin/courses" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Back to Courses
      </Link>

      {/* Controls */}
      <div className="flex justify-between items-center mb-8">
          <h2 className="font-serif text-2xl font-bold text-charcoal">Edit Course Content</h2>
          <div className="flex gap-4">
            <button className="px-6 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:text-charcoal">Save Draft</button>
            <button onClick={() => router.push('/employee/academy/admin/courses')} className="px-8 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg">Publish Course</button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar: Structure */}
          <div className="lg:col-span-3 space-y-6">
              <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-lg">
                  <h3 className="font-bold text-charcoal text-sm mb-4">Course Structure</h3>
                  <div className="space-y-3">
                      {['Module 1: Intro', 'Module 2: Data Model', 'Module 3: PCF'].map((m, i) => (
                          <div key={i} className="p-3 rounded-xl border border-stone-100 bg-stone-50 hover:border-rust transition-colors cursor-pointer group">
                              <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">{m}</span>
                                  <GripVertical size={14} className="text-stone-300" />
                              </div>
                              <div className="space-y-1 pl-2 border-l-2 border-stone-200">
                                  <div className="text-xs font-bold text-charcoal py-1 hover:text-rust cursor-pointer">Lesson 1.1</div>
                                  <div className="text-xs text-stone-500 py-1 hover:text-rust cursor-pointer">Lesson 1.2</div>
                              </div>
                          </div>
                      ))}
                      <button className="w-full py-3 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 text-xs font-bold uppercase tracking-widest hover:border-rust hover:text-rust transition-colors flex items-center justify-center gap-2">
                          <Plus size={14} /> Add Module
                      </button>
                  </div>
              </div>
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-9">
              <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
                  {/* Lesson Header */}
                  <div className="p-8 border-b border-stone-100 bg-stone-50">
                      <input className="text-2xl font-serif font-bold text-charcoal bg-transparent border-none focus:ring-0 w-full placeholder-stone-300" placeholder="Lesson Title" defaultValue="Data Model: Entities & Typelists" />
                      <input className="text-sm text-stone-500 bg-transparent border-none focus:ring-0 w-full mt-2" placeholder="Lesson Description" defaultValue="Master the fundamental building blocks of the Guidewire application." />
                  </div>

                  {/* Tabs */}
                  <div className="px-8 pt-6 border-b border-stone-100 flex gap-8">
                      {[
                          { id: 'theory', label: 'Theory', icon: BookOpen },
                          { id: 'demo', label: 'Demo', icon: Video },
                          { id: 'verify', label: 'Verify', icon: ShieldCheck },
                          { id: 'build', label: 'Build', icon: Terminal },
                      ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`pb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${
                                activeTab === tab.id 
                                ? 'border-rust text-rust' 
                                : 'border-transparent text-stone-400 hover:text-charcoal'
                            }`}
                          >
                              <tab.icon size={16} /> {tab.label}
                          </button>
                      ))}
                  </div>

                  {/* Tab Content */}
                  <div className="p-8 flex-1 bg-stone-50/30 overflow-y-auto">
                      
                      {/* THEORY EDITOR */}
                      {activeTab === 'theory' && (
                          <div className="space-y-6 animate-fade-in">
                              <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm">
                                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Slide 1 Content</h4>
                                  <input className="w-full mb-4 p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm font-bold" placeholder="Slide Title" />
                                  <textarea className="w-full h-32 p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm resize-none" placeholder="Bullet points (one per line)" />
                              </div>
                              <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rust hover:underline">
                                  <Plus size={14} /> Add Slide
                              </button>
                          </div>
                      )}

                      {/* DEMO EDITOR (Video Upload) */}
                      {activeTab === 'demo' && (
                          <div className="space-y-8 animate-fade-in">
                              <div 
                                onDrop={handleVideoDrop}
                                onDragOver={e => e.preventDefault()}
                                className="border-2 border-dashed border-stone-300 rounded-3xl p-12 text-center hover:border-rust hover:bg-rust/5 transition-all cursor-pointer bg-stone-50"
                              >
                                  {videoFile ? (
                                      <div className="flex flex-col items-center">
                                          <div className="w-16 h-16 bg-charcoal rounded-full flex items-center justify-center text-white mb-4">
                                              <Play size={24} />
                                          </div>
                                          <p className="font-bold text-charcoal">{videoFile.name}</p>
                                          <p className="text-xs text-stone-500">Ready to upload</p>
                                          <button onClick={() => setVideoFile(null)} className="mt-4 text-xs text-red-500 font-bold hover:underline">Replace</button>
                                      </div>
                                  ) : (
                                      <div className="flex flex-col items-center text-stone-400">
                                          <Upload size={48} className="mb-4 opacity-50" />
                                          <h3 className="font-bold text-stone-600">Drag & Drop Video File</h3>
                                          <p className="text-xs mt-2">MP4, MOV, AVI (Max 2GB)</p>
                                      </div>
                                  )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Metadata</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-stone-400 uppercase mb-2">Video Title</label>
                                            <input className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm" placeholder="e.g. Entity Creation Demo" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-stone-400 uppercase mb-2">Duration</label>
                                            <input className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm" placeholder="Auto-detected" disabled />
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-stone-100">
                                        <label className="block text-[10px] font-bold text-stone-400 uppercase mb-2">Transcript / Captions</label>
                                        <div className="flex gap-4">
                                            <button className="px-4 py-2 bg-stone-100 rounded-lg text-xs font-bold text-charcoal hover:bg-stone-200">Auto-Generate (AI)</button>
                                            <button className="px-4 py-2 border border-stone-200 rounded-lg text-xs font-bold text-stone-500">Upload .SRT</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Chapter Markers */}
                                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <ListPlus size={14} /> Chapter Markers
                                    </h4>
                                    <div className="space-y-3 mb-4">
                                        {chapters.map((chap, i) => (
                                            <div key={i} className="flex gap-2">
                                                <input 
                                                    className="w-20 p-2 bg-stone-50 border border-stone-200 rounded text-sm text-center" 
                                                    placeholder="0:00" 
                                                    defaultValue={chap.time}
                                                />
                                                <input 
                                                    className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded text-sm" 
                                                    placeholder="Chapter Title" 
                                                    defaultValue={chap.label}
                                                />
                                                <button className="text-stone-300 hover:text-red-500"><Trash2 size={14}/></button>
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => setChapters([...chapters, { time: '', label: '' }])}
                                        className="text-xs font-bold text-rust hover:underline flex items-center gap-1"
                                    >
                                        <Plus size={12} /> Add Marker
                                    </button>
                                </div>
                              </div>
                          </div>
                      )}

                      {/* VERIFY EDITOR (Quiz) */}
                      {activeTab === 'verify' && (
                          <div className="space-y-6 animate-fade-in">
                              <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm relative group">
                                  <button className="absolute top-4 right-4 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Question 1</h4>
                                  <input className="w-full mb-4 p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm font-bold" placeholder="Question Text" />
                                  <div className="space-y-2">
                                      {['Option A', 'Option B', 'Option C', 'Option D'].map((opt, i) => (
                                          <div key={i} className="flex items-center gap-3">
                                              <input type="radio" name="correct" />
                                              <input className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded text-sm" placeholder={opt} />
                                          </div>
                                      ))}
                                  </div>
                              </div>
                              <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rust hover:underline">
                                  <Plus size={14} /> Add Question
                              </button>
                          </div>
                      )}
                      
                      {/* BUILD EDITOR (Project Spec) */}
                      {activeTab === 'build' && (
                          <div className="space-y-8 animate-fade-in">
                              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Project Specification</h4>
                                  <input className="w-full mb-4 p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm font-bold" placeholder="Project Title (e.g. Create Vehicle Entity)" />
                                  <textarea className="w-full h-32 p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm resize-none" placeholder="Detailed instructions & acceptance criteria..." />
                                  
                                  <div className="mt-6">
                                      <h5 className="text-[10px] font-bold text-stone-400 uppercase mb-3">Starter Resources</h5>
                                      <div className="flex gap-4">
                                          <button className="flex items-center gap-2 px-4 py-2 border border-dashed border-stone-300 rounded-lg text-xs font-bold text-stone-500 hover:text-charcoal hover:border-charcoal">
                                              <Upload size={14} /> Upload Starter Code (.zip)
                                          </button>
                                      </div>
                                  </div>
                              </div>

                              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                                  <div className="flex justify-between items-center mb-4">
                                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Grading Rubric</h4>
                                      <span className="text-xs font-bold text-charcoal">Total: {rubricItems.reduce((acc, i) => acc + i.points, 0)} Points</span>
                                  </div>
                                  
                                  <div className="space-y-3">
                                      {rubricItems.map((item, i) => (
                                          <div key={item.id} className="flex gap-4 items-center">
                                              <div className="w-8 h-8 bg-stone-100 rounded flex items-center justify-center text-xs font-bold text-stone-500">{i+1}</div>
                                              <input className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded text-sm" placeholder="Criterion" defaultValue={item.criteria} />
                                              <input className="w-20 p-2 bg-stone-50 border border-stone-200 rounded text-sm text-center" type="number" defaultValue={item.points} />
                                              <button className="text-stone-300 hover:text-red-500"><Trash2 size={14}/></button>
                                          </div>
                                      ))}
                                  </div>
                                  <button 
                                    onClick={() => setRubricItems([...rubricItems, { id: Date.now(), criteria: '', points: 0 }])}
                                    className="mt-4 text-xs font-bold text-rust hover:underline flex items-center gap-1"
                                  >
                                      <Plus size={12} /> Add Criterion
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
