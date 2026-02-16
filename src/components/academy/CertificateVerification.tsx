'use client';


import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle, ShieldCheck, Award, Calendar, User, XCircle, Loader2 } from 'lucide-react';

export const CertificateVerification: React.FC = () => {
  const { id } = useParams();
  const [verifying, setVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Simulate API check
    const timer = setTimeout(() => {
      setVerifying(false);
      // Mock validation: IDs starting with 'X' are valid
      setIsValid(id?.startsWith('X') || false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [id]);

  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl border border-stone-200 overflow-hidden relative">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] z-0">
            <span className="text-9xl font-serif font-bold -rotate-45">INTIME</span>
        </div>

        <div className="relative z-10 p-12 text-center">
            <div className="mb-8 flex justify-center">
                <div className="w-16 h-16 bg-charcoal text-white rounded-full flex items-center justify-center font-serif font-bold text-2xl shadow-xl">I</div>
            </div>

            <h1 className="text-3xl font-serif font-bold text-charcoal mb-2">Certificate Verification</h1>
            <p className="text-stone-500 mb-8 font-mono text-sm">ID: {id}</p>

            {verifying ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 size={48} className="text-rust animate-spin mb-4" />
                    <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Verifying Blockchain Record...</p>
                </div>
            ) : isValid ? (
                <div className="animate-slide-up">
                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-8 border border-green-100">
                        <CheckCircle size={18} /> Verified Authentic
                    </div>

                    <div className="bg-stone-50 rounded-2xl p-8 border border-stone-100 text-left mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Recipient</p>
                                <p className="font-serif font-bold text-xl text-charcoal flex items-center gap-2">
                                    <User size={18} className="text-rust" /> Alex Rivera
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Issue Date</p>
                                <p className="font-serif font-bold text-xl text-charcoal flex items-center gap-2">
                                    <Calendar size={18} className="text-rust" /> Nov 24, 2025
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Certification</p>
                                <p className="font-serif font-bold text-xl text-charcoal flex items-center gap-2">
                                    <Award size={18} className="text-rust" /> Senior Guidewire Developer (PC 10)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <p className="text-sm text-stone-500 max-w-md leading-relaxed">
                            This certificate confirms that the recipient has successfully completed the rigorous requirements of the InTime Academy Senior Track.
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-stone-300 uppercase tracking-widest mt-4">
                            <ShieldCheck size={12} /> Secured by InTime OS
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-slide-up py-8">
                    <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6 border border-red-100">
                        <XCircle size={18} /> Invalid Certificate
                    </div>
                    <p className="text-stone-500 max-w-md mx-auto">
                        The certificate ID provided could not be found in our registry. Please check the ID and try again.
                    </p>
                </div>
            )}
        </div>
        
        {/* Footer */}
        <div className="bg-stone-50 p-6 text-center border-t border-stone-100">
            <Link href="/" className="text-xs font-bold text-rust hover:underline">Return to InTime Solutions</Link>
        </div>
      </div>
    </div>
  );
};
