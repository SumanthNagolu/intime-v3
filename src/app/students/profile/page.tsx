'use client';

import React from 'react';
import { User, Mail, Phone, MapPin, Shield, Clock } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="animate-fade-in pt-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-serif text-charcoal mb-4 italic">My Profile</h1>
        <p className="text-stone-500 text-lg font-light">Manage your personal information and account settings.</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Card */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-stone-200/50 border border-stone-100 bg-noise relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rust/5 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar Section */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-rust text-white border-4 border-white shadow-xl flex items-center justify-center font-serif font-bold italic text-5xl relative">
                P
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-forest border-4 border-white rounded-full"></div>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-grow space-y-6 w-full">
              <div>
                <h2 className="text-2xl font-serif font-bold text-charcoal mb-1">Priya Sharma</h2>
                <p className="text-stone-500 font-medium">Senior Developer Track • Cohort 23</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                    <Mail size={12} /> Email Address
                  </label>
                  <div className="text-charcoal font-medium">priya@example.com</div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                    <Phone size={12} /> Phone Number
                  </label>
                  <div className="text-charcoal font-medium">+1 (555) 123-4567</div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                    <MapPin size={12} /> Location
                  </label>
                  <div className="text-charcoal font-medium">San Francisco, CA</div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                    <Clock size={12} /> Time Zone
                  </label>
                  <div className="text-charcoal font-medium">Pacific Time (PT)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-stone-200/50 border border-stone-100 bg-noise">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-500">
              <Shield size={20} />
            </div>
            <h3 className="font-serif text-xl font-bold text-charcoal">Account Security</h3>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl border border-stone-100 hover:border-stone-200 transition-colors">
              <div>
                <div className="font-bold text-charcoal text-sm">Password</div>
                <div className="text-xs text-stone-500">Last changed 3 months ago</div>
              </div>
              <button className="px-4 py-2 bg-white border border-stone-200 rounded-full text-xs font-bold uppercase tracking-wide hover:border-charcoal hover:text-charcoal transition-colors text-stone-500">
                Update
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl border border-stone-100 hover:border-stone-200 transition-colors">
              <div>
                <div className="font-bold text-charcoal text-sm">Two-Factor Authentication</div>
                <div className="text-xs text-forest font-medium">Enabled</div>
              </div>
              <button className="px-4 py-2 bg-white border border-stone-200 rounded-full text-xs font-bold uppercase tracking-wide hover:border-charcoal hover:text-charcoal transition-colors text-stone-500">
                Configure
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


