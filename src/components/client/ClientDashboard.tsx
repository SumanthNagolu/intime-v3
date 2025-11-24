'use client';

import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Briefcase, AlertCircle, ArrowRight, Plus, Search, MapPin, DollarSign, ChevronLeft, Send, Clock, Calendar, Mail, Phone, Download, Award, Star, X, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { Job } from '../../types';

// --- VIEW COMPONENTS ---

const DashboardHome: React.FC<{ onSearchRequest: () => void }> = ({ onSearchRequest }) => {
  const { candidates, jobs, accounts, submissions } = useAppStore();
  const activeJobs = jobs.filter(j => j.status === 'open' || j.status === 'urgent');
  const pendingCandidates = candidates.filter(c => c.status === 'active'); // Simplified for demo

  const stats = [
    { label: "Active Hires", value: "2", target: "2", status: "success", path: "/client/pipeline" },
    { label: "Candidates in Review", value: pendingCandidates.length.toString(), target: "5+", status: "neutral", path: "/client/pipeline" },
    { label: "My Open Reqs", value: activeJobs.length.toString(), target: "3", status: "warning", path: "/client/jobs" },
  ];

  return (
    <div className="animate-fade-in">
      {/* Back Link */}
      <Link href="/client/portal" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
         <ChevronLeft size={14} /> Back to Portal
      </Link>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, i) => (
          <Link href={stat.path} key={i} className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-lg hover:shadow-xl hover:border-blue-200 transition-all block group cursor-pointer">
            <div className="flex justify-between items-center mb-2">
               <div className="text-xs font-bold uppercase tracking-widest text-stone-400 group-hover:text-blue-600 transition-colors">{stat.label}</div>
               <ArrowRight size={16} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
            </div>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-serif font-bold text-charcoal">{stat.value}</span>
              <span className={`text-sm font-bold mb-2 px-2 py-0.5 rounded ${stat.status === 'success' ? 'bg-green-100 text-green-700' : stat.status === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-stone-100 text-stone-500'}`}>
                Target: {stat.target}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Job Reqs */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-serif font-bold text-charcoal">My Active Requisitions</h3>
            <Link href="/client/jobs" className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline">View All</Link>
          </div>

          {activeJobs.map(job => {
            const account = accounts.find(a => a.id === job.accountId);
            const jobSubmissionCount = submissions.filter(s => s.jobId === job.id).length;
            
            return (
              <Link href={`/client/jobs/${job.id}`} key={job.id} className="block bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:border-blue-300 transition-all group cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-1">{account?.name || 'My Company'}</div>
                    <h4 className="text-lg font-bold text-charcoal group-hover:text-blue-600 transition-colors">{job.title}</h4>
                  </div>
                  {job.status === 'urgent' && (
                    <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                      <AlertCircle size={12} /> Urgent Fill
                    </div>
                  )}
                </div>
                <div className="flex gap-4 text-sm text-stone-500 mb-4">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                  <span className="flex items-center gap-1"><DollarSign size={14} /> {job.rate}</span>
                </div>
                <div className="flex justify-between items-center border-t border-stone-100 pt-4">
                  <div className="flex -space-x-2">
                    {jobSubmissionCount > 0 ? (
                      [...Array(Math.min(3, jobSubmissionCount))].map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-xs font-bold text-stone-500">
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-stone-400 italic">No submissions yet</span>
                    )}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-charcoal group-hover:text-blue-600 transition-colors flex items-center gap-1">
                    Manage Role <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Top Candidates */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-serif font-bold text-charcoal">Recommended for You</h3>
            <Link href="/client/pipeline" className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline">Pipeline View</Link>
          </div>

          <div className="bg-stone-50 p-6 rounded-[2rem] border border-stone-100">
            <div className="space-y-4">
              {candidates.slice(0, 3).map(candidate => (
                <Link href={`/client/candidate/${candidate.id}`} key={candidate.id} className="block bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-charcoal text-white flex items-center justify-center font-serif font-bold text-lg group-hover:bg-blue-600 transition-colors">
                    {candidate.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-charcoal group-hover:text-blue-600 transition-colors">{candidate.name}</h4>
                    <p className="text-xs text-stone-500">{candidate.role} • {candidate.experience}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-serif font-bold text-blue-600">{candidate.score}</div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-widest">Match</div>
                  </div>
                </Link>
              ))}
            </div>
            <button onClick={onSearchRequest} className="w-full mt-6 py-4 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors">
              Request Custom Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const JobIntake: React.FC = () => {
  const router = useRouter();
  const { addJob, accounts } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Contract',
    rate: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const accountId = 'a1';
      const account = accounts.find(a => a.id === accountId);
      const newJob: Job = {
        id: `j${Date.now()}`,
        accountId: accountId, // Assuming default or current user account
        client: account ? account.name : 'My Company',
        title: formData.title,
        status: 'open',
        type: formData.type as 'Contract' | 'Full-time' | 'C2H',
        rate: formData.rate,
        location: formData.location,
        ownerId: 'client-user',
        description: formData.description
      };
      addJob(newJob);
      setIsLoading(false);
      router.push('/client/dashboard');
    }, 1500);
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <Link href="/client/dashboard" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Cancel & Back
      </Link>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-200 p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
        <div className="mb-10 border-b border-stone-100 pb-8">
          <h2 className="text-3xl font-serif font-bold text-charcoal mb-2">Submit New Requisition</h2>
          <p className="text-stone-500">Our Talent AI will immediately begin sourcing matching profiles upon submission.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Position Title</label>
              <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold text-charcoal" placeholder="e.g. Senior Guidewire Developer" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Department</label>
              <input required value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-blue-500" placeholder="e.g. Policy Administration" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Location</label>
              <input required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-blue-500" placeholder="e.g. Remote (US)" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Employment Type</label>
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-blue-500">
                <option>Contract</option>
                <option>Full-time</option>
                <option>Contract-to-Hire</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Target Rate / Salary</label>
              <input required value={formData.rate} onChange={e => setFormData({ ...formData, rate: e.target.value })} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-blue-500" placeholder="e.g. $90-110/hr" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Job Description & Requirements</label>
            <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full h-48 p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none leading-relaxed" placeholder="Paste the full job description here..." />
          </div>

          <div className="flex items-center justify-end pt-6 border-t border-stone-100">
            <button type="submit" disabled={isLoading} className="px-10 py-4 bg-charcoal text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg flex items-center gap-2">
              {isLoading ? 'Processing...' : 'Submit Requisition'} <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const JobDetail: React.FC = () => {
  const { jobId } = useParams();
  const { jobs, candidates, submissions, accounts } = useAppStore();
  const job = jobs.find(j => j.id === jobId);
  const account = accounts.find(a => a.id === job?.accountId);
  
  const jobSubmissions = submissions.filter(s => s.jobId === jobId);
  const matchedCandidates = jobSubmissions.map(s => candidates.find(c => c.id === s.candidateId)).filter((c): c is typeof candidates[0] => !!c);

  if (!job) return <div>Job not found</div>;

  return (
    <div className="animate-fade-in">
      <Link href="/client/dashboard" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Back to Dashboard
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main JD Content */}
        <div className="flex-1">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-200 relative overflow-hidden mb-8">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-stone-50 to-transparent z-0"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                   <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{account?.name || 'Requisition'}</div>
                   <h1 className="text-4xl font-serif font-bold text-charcoal mb-4">{job.title}</h1>
                   <div className="flex gap-6 text-sm text-stone-600">
                      <span className="flex items-center gap-2"><MapPin size={16} className="text-blue-600"/> {job.location}</span>
                      <span className="flex items-center gap-2"><DollarSign size={16} className="text-blue-600"/> {job.rate}</span>
                      <span className="flex items-center gap-2"><Clock size={16} className="text-blue-600"/> Open for 3 days</span>
                   </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${job.status === 'urgent' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                    {job.status}
                </span>
              </div>
              
              <div className="prose prose-stone max-w-none mt-8">
                  <h3 className="font-bold uppercase text-xs tracking-widest text-stone-400 mb-4">Description</h3>
                  <p className="text-lg leading-relaxed text-charcoal">
                      We are looking for an experienced {job.title} to join our team. 
                      The ideal candidate will have extensive experience in Guidewire InsuranceSuite, specifically PolicyCenter configuration and integration patterns.
                  </p>
                  <ul className="list-disc pl-5 mt-4 space-y-2 text-stone-600">
                      <li>Lead technical design and implementation of PC modules.</li>
                      <li>Mentor junior developers and conduct code reviews.</li>
                      <li>Work closely with business analysts to define requirements.</li>
                  </ul>
                  <h3 className="font-bold uppercase text-xs tracking-widest text-stone-400 mt-8 mb-4">Requirements</h3>
                  <div className="flex flex-wrap gap-2">
                      {['Guidewire PC', 'Gosu', 'Java', 'SQL', 'REST API', 'Agile'].map(skill => (
                          <span key={skill} className="px-3 py-1 bg-stone-100 text-stone-600 rounded text-xs font-bold border border-stone-200">
                              {skill}
                          </span>
                      ))}
                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* Matches Sidebar */}
        <div className="w-full lg:w-96 shrink-0">
            <div className="bg-charcoal text-white p-8 rounded-[2.5rem] shadow-xl sticky top-24 bg-noise">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-xl font-bold">Submissions</h3>
                    <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold">{matchedCandidates.length} Review</span>
                </div>

                <div className="space-y-4">
                    {matchedCandidates.length > 0 ? matchedCandidates.map(c => (
                         <Link href={`/client/candidate/${c.id}`} key={c.id} className="block bg-white/10 hover:bg-white/20 transition-colors p-4 rounded-2xl border border-white/10">
                             <div className="flex items-center gap-3 mb-2">
                                 <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">
                                     {c.name.charAt(0)}
                                 </div>
                                 <div>
                                     <div className="font-bold text-sm">{c.name}</div>
                                     <div className="text-xs text-stone-400">{c.role}</div>
                                 </div>
                             </div>
                             <div className="flex justify-between items-center text-xs">
                                 <span className="text-green-400 font-bold">{c.score} Match</span>
                                 <span className="text-stone-400 flex items-center gap-1">View Profile <ArrowRight size={10}/></span>
                             </div>
                         </Link>
                    )) : (
                        <div className="text-center py-8 text-stone-500">
                            <p>No submissions yet.</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <Link href={`/client/jobs/${jobId}/matches`} className="inline-block w-full py-3 bg-white text-charcoal rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-colors">
                        Review All Candidates
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const CandidateProfile: React.FC = () => {
  const { candidateId } = useParams();
  const { candidates } = useAppStore();
  const candidate = candidates.find(c => c.id === candidateId);

  if (!candidate) return <div>Candidate not found</div>;

  return (
    <div className="animate-fade-in">
      <Link href="/client/pipeline" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Back to Pipeline
      </Link>
      
      <div className="bg-white rounded-[2px] shadow-2xl shadow-stone-300/50 relative min-h-[800px] border border-stone-200 max-w-5xl mx-auto p-12">
         {/* Watermark */}
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
            <span className="text-9xl font-serif font-bold -rotate-45">CONFIDENTIAL</span>
         </div>
         
         <div className="relative z-10">
             {/* Header */}
             <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-charcoal pb-8 mb-8">
                 <div className="flex gap-6 items-center">
                     <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center text-4xl font-serif font-bold text-charcoal border-4 border-white shadow-lg">
                         {candidate.name.charAt(0)}
                     </div>
                     <div>
                         <h1 className="text-4xl font-serif font-bold text-charcoal mb-1">{candidate.name}</h1>
                         <p className="text-xl text-stone-500">{candidate.role}</p>
                         <div className="flex gap-4 mt-3 text-sm font-medium text-stone-600">
                             <span className="flex items-center gap-1"><MapPin size={14}/> {candidate.location}</span>
                             <span className="flex items-center gap-1"><Briefcase size={14}/> {candidate.experience} Exp</span>
                             <span className="flex items-center gap-1"><DollarSign size={14}/> {candidate.rate}</span>
                         </div>
                     </div>
                 </div>
                 <div className="text-right mt-4 md:mt-0">
                     <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-green-100 mb-3">
                         <CheckCircle size={14}/> Verified Talent
                     </div>
                     <div className="text-xs text-stone-400">ID: {candidate.id}</div>
                 </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                 {/* Main Content */}
                 <div className="lg:col-span-2 space-y-10">
                     <section>
                         <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest border-b border-stone-200 pb-2 mb-4">Professional Summary</h3>
                         <p className="text-stone-700 leading-relaxed font-serif text-lg">
                             {candidate.notes || `Experienced ${candidate.role} with a proven track record in enterprise environments. Specialized in InsuranceSuite configuration and integration.`}
                         </p>
                     </section>

                     <section>
                         <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest border-b border-stone-200 pb-2 mb-4">Technical Skills</h3>
                         <div className="flex flex-wrap gap-2">
                             {candidate.skills.map(skill => (
                                 <span key={skill} className="px-3 py-1 bg-stone-100 text-charcoal text-sm font-medium rounded hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-default border border-stone-200">
                                     {skill}
                                 </span>
                             ))}
                         </div>
                     </section>
                     
                     <section>
                         <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest border-b border-stone-200 pb-2 mb-4">Experience Highlights</h3>
                         <div className="space-y-6">
                             <div className="pl-4 border-l-2 border-stone-200 relative">
                                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-500"></div>
                                 <h4 className="font-bold text-charcoal text-lg">Senior Developer</h4>
                                 <p className="text-sm text-blue-600 font-bold mb-1">TechFlow Insurance</p>
                                 <p className="text-stone-600 leading-relaxed">Led the migration of PolicyCenter 8 to 10. Architected the new Reinsurance integration layer.</p>
                             </div>
                             <div className="pl-4 border-l-2 border-stone-200 relative">
                                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-stone-300"></div>
                                 <h4 className="font-bold text-charcoal text-lg">Configuration Specialist</h4>
                                 <p className="text-sm text-stone-500 font-bold mb-1">Global Insure</p>
                                 <p className="text-stone-600 leading-relaxed">Implemented Personal Auto LOB from scratch. Optimized rating engine performance.</p>
                             </div>
                         </div>
                     </section>
                 </div>

                 {/* Sidebar Actions */}
                 <div className="space-y-6">
                     <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
                         <h4 className="font-bold text-charcoal mb-4 flex items-center gap-2"><Star size={16} className="text-blue-600"/> Match Score</h4>
                         <div className="text-5xl font-serif font-bold text-charcoal mb-2">{candidate.score}</div>
                         <p className="text-xs text-stone-500">Top 5% of cohort in Technical Proficiency.</p>
                     </div>

                     <div className="space-y-3">
                         <button className="w-full py-4 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-2 text-center">
                             Schedule Interview <Calendar size={16}/>
                         </button>
                         
                         <button className="w-full py-4 bg-white text-charcoal border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                             Download Resume <Download size={16}/>
                         </button>
                     </div>
                     
                     <div className="pt-6 border-t border-stone-200">
                         <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Contact Info</p>
                         <div className="space-y-2 text-sm text-stone-600">
                             <div className="flex items-center gap-2"><Mail size={14}/> {candidate.email}</div>
                             <div className="flex items-center gap-2"><Phone size={14}/> +1 (555) 000-0000</div>
                         </div>
                     </div>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};

const PipelineView: React.FC = () => {
    const { candidates } = useAppStore();
    const [searchTerm, setSearchTerm] = useState('');
    
    const filtered = candidates.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="animate-fade-in">
             <Link href="/client/dashboard" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
                <ChevronLeft size={14} /> Back to Dashboard
             </Link>
             
             <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-charcoal mb-2">Available Talent</h2>
                    <p className="text-stone-500">Browse pre-vetted professionals ready for deployment.</p>
                </div>
             </div>

             <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8 flex items-center gap-4">
                 <Search size={20} className="text-stone-400 ml-2"/>
                 <input 
                    type="text" 
                    placeholder="Search by name, role, or skill..." 
                    className="flex-1 py-2 outline-none text-charcoal font-medium placeholder-stone-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {filtered.map(c => (
                     <Link href={`/client/candidate/${c.id}`} key={c.id} className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all group">
                         <div className="flex justify-between items-start mb-6">
                             <div className="w-16 h-16 rounded-full bg-stone-100 text-charcoal flex items-center justify-center text-2xl font-serif font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                 {c.name.charAt(0)}
                             </div>
                             <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-widest border border-green-100">
                                 {c.status}
                             </span>
                         </div>
                         
                         <h3 className="text-xl font-bold text-charcoal mb-1 group-hover:text-blue-600 transition-colors">{c.name}</h3>
                         <p className="text-stone-500 text-sm mb-4">{c.role}</p>
                         
                         <div className="flex flex-wrap gap-2 mb-6">
                             {c.skills.slice(0,3).map(s => (
                                 <span key={s} className="text-[10px] font-bold uppercase tracking-wider bg-stone-50 text-stone-500 px-2 py-1 rounded border border-stone-100">
                                     {s}
                                 </span>
                             ))}
                             {c.skills.length > 3 && <span className="text-[10px] text-stone-400 px-1 py-1">+{c.skills.length - 3}</span>}
                         </div>

                         <div className="flex items-center justify-between border-t border-stone-100 pt-4 text-xs text-stone-400 font-bold uppercase tracking-widest">
                             <span>{c.location}</span>
                             <span className="flex items-center gap-1 text-charcoal group-hover:text-blue-600 transition-colors">View <ArrowRight size={12}/></span>
                         </div>
                     </Link>
                 ))}
             </div>
        </div>
    )
}

const CustomSearchModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { jobs } = useAppStore();
    const activeJobs = jobs.filter(j => j.status === 'open' || j.status === 'urgent');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-lg rounded-[2rem] p-10 shadow-2xl relative animate-slide-up" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal">
                    <X size={24} />
                </button>
                
                <h2 className="text-3xl font-serif font-bold text-charcoal mb-2">Request Custom Search</h2>
                <p className="text-stone-500 mb-8">Tell our account team what you need. We'll manually curate a list for you.</p>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Search Criteria</label>
                        <textarea className="w-full h-32 p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none" placeholder="e.g. Need a BillingCenter Lead with 8+ years exp, specifically with large commercial lines..." />
                    </div>
                    
                    {/* Link Existing JD */}
                    <div>
                         <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Link to Active Requisition (Optional)</label>
                         <select className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-bold text-charcoal">
                             <option value="">-- Select a Job --</option>
                             {activeJobs.map(j => (
                                 <option key={j.id} value={j.id}>{j.title} ({j.location})</option>
                             ))}
                         </select>
                    </div>

                    <div className="flex items-center gap-4">
                         <div className="flex-1 p-4 border-2 border-dashed border-stone-200 rounded-xl text-center cursor-pointer hover:bg-stone-50 transition-colors">
                             <div className="text-stone-400 text-xs font-bold uppercase tracking-widest flex flex-col items-center gap-2">
                                 <Download size={20} /> Attach JD (PDF)
                             </div>
                         </div>
                    </div>
                </div>

                <button onClick={() => { alert('Request Sent!'); onClose(); }} className="w-full mt-8 py-4 bg-charcoal text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-2">
                    Send Request <Send size={16} />
                </button>
            </div>
        </div>
    )
}

// --- MAIN CONTROLLER ---

export const ClientDashboard: React.FC = () => {
  const pathname = usePathname();
  const { jobId, candidateId } = useParams();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Router Logic
  let content;
  
  if (pathname.includes('/post')) {
      content = <JobIntake />;
  } else if (jobId) {
      content = <JobDetail />;
  } else if (candidateId) {
      content = <CandidateProfile />;
  } else if (pathname.includes('/pipeline')) {
      content = <PipelineView />;
  } else {
      content = <DashboardHome onSearchRequest={() => setIsSearchModalOpen(true)} />;
  }

  return (
    <div className="pt-4">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-end border-b border-stone-200 pb-6 gap-6">
        <div>
            <div className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">Client Portal</div>
            <h1 className="text-4xl font-serif font-bold text-charcoal">Hiring Dashboard</h1>
        </div>
        {!pathname.includes('/post') && !pathname.includes('/candidate/') && (
             <div className="flex gap-4">
                 <Link href="/client/pipeline" className="px-6 py-3 bg-white border border-stone-200 text-stone-600 rounded-full text-xs font-bold uppercase tracking-widest hover:border-charcoal hover:text-charcoal transition-colors flex items-center gap-2">
                     <Search size={16} /> Browse Talent Pool
                 </Link>
                 <Link href="/client/post" className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-lg flex items-center gap-2">
                     <Plus size={16} /> Submit New JD
                 </Link>
             </div>
        )}
      </div>

      {content}
      
      <CustomSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </div>
  );
};