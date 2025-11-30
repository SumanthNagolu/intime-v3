'use client';

import React, { useState } from 'react';
import { Award, Download, Eye, Search, Filter } from 'lucide-react';

export const CertificateManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const certificates = [
    { id: '1', studentName: 'Alex Rivera', course: 'Guidewire PolicyCenter', issueDate: 'Nov 20, 2025', status: 'Issued', certId: 'GW-PC-2025-001' },
    { id: '2', studentName: 'Jordan Smith', course: 'Full Stack Development', issueDate: 'Nov 18, 2025', status: 'Issued', certId: 'FSD-2025-042' },
    { id: '3', studentName: 'Sam Johnson', course: 'DevOps Engineering', issueDate: 'Nov 15, 2025', status: 'Pending', certId: 'DEVOPS-2025-018' },
    { id: '4', studentName: 'Taylor Brown', course: 'Guidewire PolicyCenter', issueDate: 'Nov 10, 2025', status: 'Issued', certId: 'GW-PC-2025-002' },
  ];

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-charcoal mb-2">Certificate Manager</h1>
        <p className="text-stone-500">Issue and manage student certifications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <Award size={20} />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-charcoal">124</div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Total Issued</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Award size={20} />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-charcoal">8</div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">This Month</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center">
              <Award size={20} />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-charcoal">3</div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Pending</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Eye size={20} />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-charcoal">342</div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Verifications</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-stone-100">
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
              <Search size={18} className="text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name or certificate ID..."
                className="bg-transparent outline-none text-charcoal w-full"
              />
            </div>
            <button className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-rust transition-colors flex items-center gap-2">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-stone-50 text-xs font-bold text-stone-400 uppercase tracking-widest">
            <tr>
              <th className="p-6">Student</th>
              <th className="p-6">Course</th>
              <th className="p-6">Certificate ID</th>
              <th className="p-6">Issue Date</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {certificates.map((cert) => (
              <tr key={cert.id} className="hover:bg-stone-50 transition-colors">
                <td className="p-6 font-bold text-charcoal">{cert.studentName}</td>
                <td className="p-6 text-sm text-stone-600">{cert.course}</td>
                <td className="p-6 font-mono text-sm text-stone-600">{cert.certId}</td>
                <td className="p-6 text-sm text-stone-600">{cert.issueDate}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                    cert.status === 'Issued' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {cert.status}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-stone-100 rounded-lg transition-colors" title="View Certificate">
                      <Eye size={16} className="text-stone-400" />
                    </button>
                    <button className="p-2 hover:bg-stone-100 rounded-lg transition-colors" title="Download Certificate">
                      <Download size={16} className="text-stone-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
