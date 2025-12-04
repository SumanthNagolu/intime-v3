'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Briefcase, MapPin, DollarSign, Calendar, FileText } from 'lucide-react';

export const PostJobOrder: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    location: '',
    minSalary: '',
    maxSalary: '',
    startDate: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle job posting
    router.push('/employee/recruiting/jobs');
  };

  return (
    <div className="animate-fade-in pt-4 max-w-4xl mx-auto">
      <Link href="/employee/recruiting/jobs" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Back to Jobs
      </Link>

      <div className="mb-10 text-center">
        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Recruiting</div>
        <h1 className="text-4xl font-serif font-bold text-charcoal">Post Job Order</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-xl border border-stone-200 overflow-hidden p-10">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Job Title</label>
            <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200 focus-within:border-rust focus-within:ring-2 focus-within:ring-rust/20 transition-all">
              <Briefcase size={18} className="text-stone-400" />
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Senior Full Stack Developer"
                className="bg-transparent outline-none font-bold text-charcoal w-full"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Client</label>
              <input
                type="text"
                value={formData.client}
                onChange={e => setFormData({...formData, client: e.target.value})}
                placeholder="Company name"
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl font-bold text-charcoal focus:outline-none focus:border-rust"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Location</label>
              <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <MapPin size={18} className="text-stone-400" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., Remote, New York, NY"
                  className="bg-transparent outline-none font-bold text-charcoal w-full"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Min Salary</label>
              <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <DollarSign size={18} className="text-stone-400" />
                <input
                  type="text"
                  value={formData.minSalary}
                  onChange={e => setFormData({...formData, minSalary: e.target.value})}
                  placeholder="120,000"
                  className="bg-transparent outline-none font-bold text-charcoal w-full"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Max Salary</label>
              <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <DollarSign size={18} className="text-stone-400" />
                <input
                  type="text"
                  value={formData.maxSalary}
                  onChange={e => setFormData({...formData, maxSalary: e.target.value})}
                  placeholder="150,000"
                  className="bg-transparent outline-none font-bold text-charcoal w-full"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Target Start Date</label>
            <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <Calendar size={18} className="text-stone-400" />
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
                className="bg-transparent outline-none font-bold text-charcoal w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Job Description</label>
            <div className="flex gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <FileText size={18} className="text-stone-400 mt-1" />
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the role, requirements, and responsibilities..."
                rows={6}
                className="bg-transparent outline-none font-bold text-charcoal w-full resize-none"
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-stone-100">
            <button type="submit" className="flex-1 py-4 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all">
              Post Job Order
            </button>
            <button type="button" onClick={() => router.back()} className="px-8 py-4 bg-stone-50 border border-stone-200 text-charcoal rounded-xl text-xs font-bold uppercase tracking-widest hover:border-rust transition-all">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
