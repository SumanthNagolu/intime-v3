'use client';

import Link from 'next/link';
import { ArrowRight, Briefcase, GraduationCap, User, Users } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid md:grid-cols-2 bg-white shadow-2xl overflow-hidden border-2 border-black">
        
        {/* Left: Brand */}
        <div className="bg-black text-white p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
             <div className="h-16 w-16 bg-white text-black flex items-center justify-center mb-8">
                <span className="font-serif font-bold italic text-4xl">I</span>
             </div>
             <h1 className="text-5xl font-heading font-bold mb-6">Welcome Back.</h1>
             <p className="text-gray-400 text-xl leading-relaxed">
               Access your dashboard to manage talent, track applications, or continue your training.
             </p>
          </div>
          
          {/* Decoration */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 border-[20px] border-[#C87941] rounded-full opacity-20"></div>
        </div>

        {/* Right: Options */}
        <div className="p-12 flex flex-col justify-center">
           <h2 className="text-2xl font-heading font-bold mb-8 text-center">Choose Your Portal</h2>
           
           <div className="grid gap-4">
              <Link href="/auth/login/student" className="group">
                 <div className="border-2 border-gray-200 p-6 hover:border-black hover:bg-gray-50 transition-all flex items-center gap-6">
                    <div className="w-12 h-12 bg-black text-white flex items-center justify-center group-hover:bg-[#C87941] transition-colors">
                       <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="font-bold text-lg">Academy Student</h3>
                       <p className="text-sm text-gray-500">Access courses and training.</p>
                    </div>
                    <ArrowRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
              </Link>

              <Link href="/auth/login/client" className="group">
                 <div className="border-2 border-gray-200 p-6 hover:border-black hover:bg-gray-50 transition-all flex items-center gap-6">
                    <div className="w-12 h-12 bg-black text-white flex items-center justify-center group-hover:bg-[#C87941] transition-colors">
                       <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="font-bold text-lg">Hiring Partner</h3>
                       <p className="text-sm text-gray-500">Manage job requisitions.</p>
                    </div>
                    <ArrowRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
              </Link>

              <Link href="/auth/login/candidate" className="group">
                 <div className="border-2 border-gray-200 p-6 hover:border-black hover:bg-gray-50 transition-all flex items-center gap-6">
                    <div className="w-12 h-12 bg-black text-white flex items-center justify-center group-hover:bg-[#C87941] transition-colors">
                       <User className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="font-bold text-lg">Candidate</h3>
                       <p className="text-sm text-gray-500">Update profile and availability.</p>
                    </div>
                    <ArrowRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
              </Link>
              
              <Link href="/auth/login/employee" className="group">
                 <div className="border-2 border-gray-200 p-6 hover:border-black hover:bg-gray-50 transition-all flex items-center gap-6">
                    <div className="w-12 h-12 bg-black text-white flex items-center justify-center group-hover:bg-[#C87941] transition-colors">
                       <Users className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="font-bold text-lg">InTime Employee</h3>
                       <p className="text-sm text-gray-500">Internal systems access.</p>
                    </div>
                    <ArrowRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
              </Link>
           </div>
           
           <div className="mt-8 text-center">
              <Link href="/" className="text-sm font-bold uppercase tracking-widest hover:text-[#C87941] underline">
                 Back to Home
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}


