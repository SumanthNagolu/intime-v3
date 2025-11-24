'use client';


import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Search, Filter, Plus, MoreHorizontal, Mail, MapPin, Building2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Employee } from '../../types';

export const PeopleDirectory: React.FC = () => {
  const { employees, addEmployee } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filtered = employees.filter(e => 
      e.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in pt-4 relative">
       {/* Header */}
       <div className="mb-10 flex flex-col md:flex-row justify-between items-end border-b border-stone-200 pb-6 gap-6">
        <div>
            <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Organization</div>
            <h1 className="text-4xl font-serif font-bold text-charcoal">People Directory</h1>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
             <div className="bg-white p-3 rounded-full border border-stone-200 flex items-center gap-3 flex-1 md:w-64 shadow-sm focus-within:ring-2 focus-within:ring-rust/20">
                 <Search size={18} className="text-stone-400 ml-2" />
                 <input 
                    type="text" 
                    placeholder="Search by name or role..." 
                    className="flex-1 bg-transparent outline-none text-sm font-medium text-charcoal placeholder-stone-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
             </div>
             <button 
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2 whitespace-nowrap"
             >
                 <Plus size={16} /> Add Person
             </button>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(employee => (
              <div key={employee.id} className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 hover:-translate-y-1 transition-all group relative">
                  <div className="absolute top-6 right-6">
                      <button className="text-stone-300 hover:text-charcoal transition-colors">
                          <MoreHorizontal size={20} />
                      </button>
                  </div>
                  
                  <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-20 h-20 rounded-full bg-stone-100 text-charcoal flex items-center justify-center text-2xl font-serif font-bold mb-4 border-4 border-white shadow-lg group-hover:scale-105 transition-transform">
                          {employee.image ? (
                              <img src={employee.image} alt={employee.firstName} className="w-full h-full rounded-full object-cover" />
                          ) : (
                              employee.firstName.charAt(0)
                          )}
                      </div>
                      <h3 className="text-xl font-bold text-charcoal group-hover:text-rust transition-colors">{employee.firstName} {employee.lastName}</h3>
                      <p className="text-sm text-stone-500 font-medium mb-1">{employee.role}</p>
                      {employee.pod && (
                          <span className="inline-block px-3 py-1 bg-stone-50 text-stone-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-stone-100">
                              {employee.pod}
                          </span>
                      )}
                  </div>

                  <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm text-stone-600">
                          <Building2 size={16} className="text-stone-300" />
                          <span>{employee.department}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-stone-600">
                          <MapPin size={16} className="text-stone-300" />
                          <span>{employee.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-stone-600">
                          <Mail size={16} className="text-stone-300" />
                          <span className="truncate">{employee.email}</span>
                      </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                          employee.status === 'Active' ? 'bg-green-50 text-green-700' :
                          employee.status === 'Onboarding' ? 'bg-blue-50 text-blue-700' :
                          'bg-stone-100 text-stone-500'
                      }`}>
                          {employee.status}
                      </span>
                      {/* Fixed Link Path */}
                      <Link href={`/employee/hr/profile/${employee.id}`} className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-charcoal transition-colors">
                          View Profile <ChevronRight size={14} />
                      </Link>
                  </div>
              </div>
          ))}
      </div>

      <AddEmployeeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={addEmployee} />
    </div>
  );
};

// Exporting for use in Dashboard
export const AddEmployeeModal: React.FC<{ isOpen: boolean; onClose: () => void; onAdd: (e: Employee) => void }> = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        department: 'Recruiting',
        location: '',
        startDate: '',
        manager: '',
        salary: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newEmployee: Employee = {
            id: `e${Date.now()}`,
            ...formData,
            status: 'Onboarding',
            pod: 'Unassigned',
            department: formData.department as any
        };
        onAdd(newEmployee);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl relative animate-slide-up" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-serif font-bold text-charcoal mb-8">Add New Team Member</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">First Name</label>
                            <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Last Name</label>
                            <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                         <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Role Title</label>
                            <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Department</label>
                            <select className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                                <option>Recruiting</option>
                                <option>Bench Sales</option>
                                <option>Engineering</option>
                                <option>HR</option>
                                <option>Product</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                         <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Email</label>
                            <input type="email" required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Location</label>
                            <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-50 rounded-xl">Cancel</button>
                        <button type="submit" className="flex-1 py-4 bg-charcoal text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-rust transition-colors shadow-lg">Create Profile</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
