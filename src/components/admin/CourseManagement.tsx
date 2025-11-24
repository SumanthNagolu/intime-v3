'use client';


import React, { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Eye, MoreHorizontal, FileText, Archive, Download, Clock, AlertCircle, ArrowRight, Trash2, Play, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const CourseManagement: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [reviewModalCourse, setReviewModalCourse] = useState<any | null>(null);
  const [detailModalCourse, setDetailModalCourse] = useState<any | null>(null);

  // Mock Courses Data
  const [courses, setCourses] = useState([
      { id: 1, title: 'PolicyCenter 10 Fundamentals', author: 'Sarah Chen', status: 'Published', modules: 8, students: 47, updated: '2 days ago' },
      { id: 2, title: 'Advanced Gosu Programming', author: 'David Kim', status: 'Pending Approval', modules: 12, students: 0, updated: '3 hours ago' },
      { id: 3, title: 'BillingCenter Config', author: 'Mike Ross', status: 'Draft', modules: 5, students: 0, updated: '1 week ago' },
      { id: 4, title: 'ClaimCenter Intro', author: 'Sarah Chen', status: 'Archived', modules: 4, students: 120, updated: '3 months ago' },
      { id: 5, title: 'Integration Patterns', author: 'David Kim', status: 'Pending Approval', modules: 6, students: 0, updated: 'Yesterday' },
  ]);

  const filteredCourses = courses.filter(c => 
      (statusFilter === 'All' || c.status === statusFilter) &&
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelection = (id: number) => {
      if (selectedCourseIds.includes(id)) setSelectedCourseIds(prev => prev.filter(i => i !== id));
      else setSelectedCourseIds(prev => [...prev, id]);
  };

  const handleDelete = (id: number) => {
      if (window.confirm("Are you sure you want to delete this course? This cannot be undone.")) {
          setCourses(prev => prev.filter(c => c.id !== id));
      }
  };

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10 flex justify-between items-end border-b border-stone-200 pb-6">
        <div>
            <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Academy Admin</div>
            <h1 className="text-4xl font-serif font-bold text-charcoal">Course Management</h1>
        </div>
        <div className="flex gap-3">
            <button className="px-6 py-3 bg-white border border-stone-200 rounded-full text-xs font-bold uppercase tracking-widest hover:border-charcoal transition-colors flex items-center gap-2">
                <Download size={14} /> Export Data
            </button>
            {selectedCourseIds.length > 0 && (
                <button className="px-6 py-3 bg-stone-100 text-stone-600 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-stone-200 transition-colors flex items-center gap-2">
                    <Archive size={14} /> Archive Selected ({selectedCourseIds.length})
                </button>
            )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-[2rem] border border-stone-200 shadow-lg mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-4 bg-stone-50 px-6 py-3 rounded-full flex-1 border border-stone-100 focus-within:ring-2 focus-within:ring-rust/20 transition-all">
              <Search size={20} className="text-stone-400" />
              <input 
                type="text" 
                placeholder="Search courses..." 
                className="bg-transparent outline-none w-full text-sm font-medium text-charcoal placeholder-stone-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="flex gap-2 bg-stone-100 p-1 rounded-full">
              {['All', 'Draft', 'Pending Approval', 'Published', 'Archived'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                        statusFilter === status 
                        ? 'bg-white text-charcoal shadow-sm' 
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                      {status === 'Pending Approval' ? 'Pending' : status}
                  </button>
              ))}
          </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-xl overflow-hidden">
          <table className="w-full text-left">
              <thead className="bg-stone-50 text-xs font-bold uppercase tracking-widest text-stone-400">
                  <tr>
                      <th className="p-6 w-16 text-center">
                          <input type="checkbox" className="accent-rust" />
                      </th>
                      <th className="p-6">Course Name</th>
                      <th className="p-6">Created By</th>
                      <th className="p-6">Status</th>
                      <th className="p-6">Stats</th>
                      <th className="p-6">Last Updated</th>
                      <th className="p-6 text-right">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                  {filteredCourses.map(course => (
                      <tr key={course.id} className="hover:bg-stone-50 transition-colors group cursor-pointer">
                          <td className="p-6 text-center">
                              <input 
                                type="checkbox" 
                                checked={selectedCourseIds.includes(course.id)} 
                                onChange={() => toggleSelection(course.id)}
                                className="accent-rust"
                                onClick={(e) => e.stopPropagation()}
                              />
                          </td>
                          <td className="p-6" onClick={() => setDetailModalCourse(course)}>
                              <div className="font-bold text-charcoal text-sm hover:text-rust transition-colors">{course.title}</div>
                              <div className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">ID: CRS-{course.id}00</div>
                          </td>
                          <td className="p-6 text-sm text-stone-600">{course.author}</td>
                          <td className="p-6">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                  course.status === 'Published' ? 'bg-green-50 text-green-700' :
                                  course.status === 'Pending Approval' ? 'bg-yellow-50 text-yellow-700' :
                                  course.status === 'Archived' ? 'bg-stone-100 text-stone-500' :
                                  'bg-blue-50 text-blue-700'
                              }`}>
                                  {course.status}
                              </span>
                          </td>
                          <td className="p-6">
                              <div className="text-xs text-stone-500 space-y-1">
                                  <div>{course.modules} Modules</div>
                                  <div>{course.students} Students</div>
                              </div>
                          </td>
                          <td className="p-6 text-xs text-stone-500 font-mono">{course.updated}</td>
                          <td className="p-6 text-right">
                              {course.status === 'Pending Approval' ? (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setReviewModalCourse(course); }}
                                    className="px-4 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-sm"
                                  >
                                      Review
                                  </button>
                              ) : (
                                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={(e) => { e.stopPropagation(); setDetailModalCourse(course); }} className="p-2 text-stone-400 hover:text-charcoal hover:bg-white rounded-lg border border-transparent hover:border-stone-200" title="View">
                                          <Eye size={16}/>
                                      </button>
                                      <button onClick={(e) => { e.stopPropagation(); handleDelete(course.id); }} className="p-2 text-stone-400 hover:text-red-500 hover:bg-white rounded-lg border border-transparent hover:border-red-100" title="Delete">
                                          <Trash2 size={16}/>
                                      </button>
                                  </div>
                              )}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

      {reviewModalCourse && (
          <CourseReviewModal 
            course={reviewModalCourse} 
            onClose={() => setReviewModalCourse(null)} 
          />
      )}

      {detailModalCourse && (
          <CourseDetailModal 
            course={detailModalCourse} 
            onClose={() => setDetailModalCourse(null)} 
          />
      )}
    </div>
  );
};

// --- NEW: Reusable Preview Modal ---
const ContentPreviewModal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; type: 'module' | 'slides' }> = ({ isOpen, onClose, title, type }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-charcoal/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white w-full max-w-5xl aspect-video rounded-[2rem] shadow-2xl relative flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <h3 className="font-serif text-xl font-bold text-charcoal">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full text-stone-400 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-1 bg-black flex items-center justify-center relative group">
                    {type === 'module' && (
                        <div className="text-center text-white">
                            <div className="w-24 h-24 rounded-full border-4 border-white/20 flex items-center justify-center mx-auto mb-6 bg-white/10 group-hover:scale-110 transition-transform cursor-pointer">
                                <Play size={48} fill="currentColor" className="ml-2" />
                            </div>
                            <p className="font-mono text-sm uppercase tracking-widest text-white/50">Demo Video Playback</p>
                        </div>
                    )}
                    {type === 'slides' && (
                        <div className="text-center text-white">
                            <FileText size={80} className="mx-auto mb-6 opacity-50 group-hover:opacity-80 transition-opacity" />
                            <p className="font-mono text-sm uppercase tracking-widest text-white/50">Slide Deck Viewer</p>
                        </div>
                    )}
                    
                    {/* Fake Player Controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="h-1 bg-white/30 rounded-full mb-4 overflow-hidden">
                            <div className="h-full bg-rust w-1/3"></div>
                        </div>
                        <div className="flex justify-between items-center text-white/80 text-xs font-bold uppercase tracking-widest">
                            <span>04:20 / 12:45</span>
                            <span>HD • CC</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const CourseDetailModal: React.FC<{ course: any; onClose: () => void }> = ({ course, onClose }) => {
    const [previewItem, setPreviewItem] = useState<{ title: string; type: 'module' | 'slides' } | null>(null);

    if (!course) return null;

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <ContentPreviewModal 
                isOpen={!!previewItem} 
                onClose={() => setPreviewItem(null)} 
                title={previewItem?.title || ''} 
                type={previewItem?.type || 'module'} 
            />

            <div className="bg-white w-full max-w-3xl rounded-[2.5rem] p-10 shadow-2xl relative flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-8 right-8 text-stone-400 hover:text-charcoal"><X size={24} /></button>
                
                <div className="mb-8 border-b border-stone-100 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-stone-100 text-stone-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">{course.status}</span>
                        <span className="text-stone-400 text-xs font-bold uppercase tracking-widest">Created by {course.author}</span>
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-charcoal">{course.title}</h2>
                </div>

                <div className="flex-1 overflow-y-auto pr-4 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-center">
                            <div className="text-2xl font-bold text-charcoal">{course.modules}</div>
                            <div className="text-[10px] text-stone-400 uppercase tracking-widest">Modules</div>
                        </div>
                        <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-center">
                            <div className="text-2xl font-bold text-charcoal">{course.students}</div>
                            <div className="text-[10px] text-stone-400 uppercase tracking-widest">Students</div>
                        </div>
                        <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-center">
                            <div className="text-2xl font-bold text-charcoal">4.8</div>
                            <div className="text-[10px] text-stone-400 uppercase tracking-widest">Rating</div>
                        </div>
                    </div>

                    <div className="bg-white border border-stone-200 rounded-2xl p-6">
                        <h3 className="font-bold text-charcoal text-sm mb-4">Course Structure</h3>
                        <div className="space-y-2">
                            {Array.from({ length: course.modules }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-3 hover:bg-stone-50 rounded-lg transition-colors border-b border-stone-50 last:border-0">
                                    <span className="text-sm text-stone-600">Module {i+1}: Foundation Topic {i+1}</span>
                                    <button 
                                        onClick={() => setPreviewItem({ title: `Module ${i+1}: Foundation Topic`, type: 'module' })}
                                        className="text-xs font-bold text-rust hover:underline"
                                    >
                                        View
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-stone-100 flex justify-end">
                    <button onClick={onClose} className="px-8 py-3 bg-charcoal text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-rust transition-all">Close</button>
                </div>
            </div>
        </div>
    )
}

const CourseReviewModal: React.FC<{ course: any; onClose: () => void }> = ({ course, onClose }) => {
    const [previewItem, setPreviewItem] = useState<{ title: string; type: 'module' | 'slides' } | null>(null);

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <ContentPreviewModal 
                isOpen={!!previewItem} 
                onClose={() => setPreviewItem(null)} 
                title={previewItem?.title || ''} 
                type={previewItem?.type || 'module'} 
            />

            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] p-10 shadow-2xl relative flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-8 right-8 text-stone-400 hover:text-charcoal"><X size={24} /></button>
                
                <div className="mb-8 border-b border-stone-100 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Pending Approval</span>
                        <span className="text-stone-400 text-xs font-bold uppercase tracking-widest">Submitted by {course.author}</span>
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-charcoal">{course.title}</h2>
                </div>

                <div className="flex-1 overflow-y-auto pr-4">
                    {/* Content Preview */}
                    <div className="space-y-8">
                        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                            <h3 className="font-bold text-charcoal text-sm uppercase tracking-widest mb-4">Course Structure</h3>
                            <div className="space-y-2">
                                {['Introduction & Setup', 'Data Model Extension', 'PCF Configuration', 'Gosu Business Logic'].map((mod, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-stone-100 rounded-full flex items-center justify-center text-xs font-bold text-stone-500">{i+1}</div>
                                            <span className="text-sm font-medium text-charcoal">{mod}</span>
                                        </div>
                                        <button 
                                            onClick={() => setPreviewItem({ title: `Module ${i+1}: ${mod}`, type: 'module' })}
                                            className="text-xs font-bold text-rust hover:underline"
                                        >
                                            Preview Content
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm">
                                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">
                                    <FileText size={14} /> Slide Deck
                                </div>
                                <p className="text-sm text-stone-600 mb-4">Contains 45 slides. Reviewed for branding compliance.</p>
                                <div 
                                    onClick={() => setPreviewItem({ title: 'Course Slide Deck', type: 'slides' })}
                                    className="w-full h-32 bg-stone-100 rounded-xl flex items-center justify-center text-stone-300 font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-stone-200 transition-colors"
                                >
                                    <Play size={24} className="mr-2" /> Slide Preview
                                </div>
                            </div>
                            <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm">
                                <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-widest mb-2">
                                    <CheckCircle size={14} /> Quiz Logic
                                </div>
                                <p className="text-sm text-stone-600 mb-4">20 Questions. Passing score set to 80%.</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-stone-500">
                                        <CheckCircle size={12} className="text-green-500" /> Randomization Active
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-stone-500">
                                        <CheckCircle size={12} className="text-green-500" /> Answers Verified
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-charcoal text-sm uppercase tracking-widest mb-4">Approval Decision</h3>
                            <textarea 
                                className="w-full h-32 p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust text-sm resize-none mb-4"
                                placeholder="Add notes for the Training Specialist (Required for Rejection)..."
                            />
                            <div className="flex gap-4">
                                <button onClick={onClose} className="flex-1 py-4 bg-white border border-stone-200 text-stone-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-yellow-400 hover:text-yellow-600 transition-all">
                                    Request Revisions
                                </button>
                                <button onClick={onClose} className="flex-1 py-4 bg-white border border-stone-200 text-stone-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-red-400 hover:text-red-600 transition-all">
                                    Reject Course
                                </button>
                                <button onClick={onClose} className="flex-1 py-4 bg-green-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-700 shadow-lg transition-all flex items-center justify-center gap-2">
                                    Approve & Publish <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
