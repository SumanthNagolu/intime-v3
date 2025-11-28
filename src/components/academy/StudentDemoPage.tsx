'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Play,
  ChevronRight,
  CheckCircle,
  Users,
  Star,
  ShieldCheck,
  X,
  AlertCircle,
  Phone,
  Clock,
  Calendar,
  Loader2,
  LogOut,
  Home,
} from 'lucide-react';
import { submitCallbackRequest } from '@/app/actions/academy';
import { signOut } from '@/lib/auth/client';

/**
 * StudentDemoPage - Landing page for students without active enrollment
 *
 * Shows:
 * - Academy value proposition
 * - Demo video placeholder
 * - Callback request form for admins to follow up
 * - Information about next cohort
 */
export function StudentDemoPage() {
  const router = useRouter();
  const [showDemo, setShowDemo] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [applicationStep, setApplicationStep] = useState<'form' | 'submitting' | 'success'>('form');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', interest: '' });
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.interest.length < 200) {
      setError('Please tell us more about your background (min 200 characters). We are selective.');
      return;
    }

    setApplicationStep('submitting');

    const result = await submitCallbackRequest({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      interest: formData.interest,
    });

    if (!result.success) {
      setError(result.error || 'Failed to submit request');
      setApplicationStep('form');
      return;
    }

    setApplicationStep('success');
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push('/');
  };

  return (
    <div className="animate-fade-in min-h-screen bg-ivory">
      {/* Header with Home Link and Sign Out */}
      <header className="sticky top-0 z-20 bg-ivory/80 backdrop-blur-md border-b border-charcoal-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-charcoal-600 hover:text-charcoal-900 transition-colors font-medium"
          >
            <Home size={18} />
            <span className="text-sm">Home</span>
          </Link>

          <div className="font-heading text-xl text-forest-900 tracking-tight">
            In<span className="text-gold-600">Time</span>
            <span className="text-charcoal-400 text-sm ml-2 font-sans">Academy</span>
          </div>

          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center gap-2 px-4 py-2 text-charcoal-500 hover:text-charcoal-900 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isSigningOut ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut size={16} />
                Sign Out
              </>
            )}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-20 lg:pt-32 lg:pb-28">
        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest-600/10 text-forest-700 text-xs font-bold uppercase tracking-widest mb-8 border border-forest-600/20">
            <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse" />
            Welcome to InTime Academy
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-charcoal-900 mb-8 leading-tight">
            Your Journey to
            <br />
            <span className="text-forest-600">Senior Developer</span> Starts Here
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-charcoal-500 mb-12 leading-relaxed">
            You&apos;re signed up, but not yet enrolled in a cohort. Request a callback to discuss
            which program is right for you and get started on your transformation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={() => setShowApply(true)}
              className="px-10 py-5 bg-forest-600 text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-forest-700 transition-all shadow-xl hover:shadow-forest-600/30 flex items-center gap-2"
            >
              <Phone size={16} />
              Request Callback
            </button>
            <button
              onClick={() => setShowDemo(true)}
              className="px-10 py-5 bg-white text-charcoal-900 border border-charcoal-200 rounded-2xl text-sm font-bold uppercase tracking-widest hover:border-forest-600 hover:text-forest-700 transition-all flex items-center gap-2 group"
            >
              <Play size={16} className="group-hover:text-forest-600 transition-colors" />
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-gold-50 border-y border-gold-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center">
                <Clock size={24} className="text-gold-700" />
              </div>
              <div>
                <p className="text-gold-800 font-semibold">Your Status</p>
                <p className="text-gold-600 text-sm">Awaiting Enrollment</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-12 bg-gold-300" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center">
                <Calendar size={24} className="text-gold-700" />
              </div>
              <div>
                <p className="text-gold-800 font-semibold">Next Cohort</p>
                <p className="text-gold-600 text-sm">Starting Soon</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-12 bg-gold-300" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-gold-700" />
              </div>
              <div>
                <p className="text-gold-800 font-semibold">Cohort Size</p>
                <p className="text-gold-600 text-sm">Limited to 20 Students</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What You'll Get Section */}
      <div className="py-24 container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-charcoal-900 text-center mb-4">
          What Makes Us Different
        </h2>
        <p className="text-charcoal-500 text-center mb-12 max-w-2xl mx-auto">
          We don&apos;t just teach code. We transform careers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: ShieldCheck,
              title: 'Senior Identity',
              desc: "You don't start as a student. You start as a Senior Developer. We give you the resume first, then fill in the skills.",
            },
            {
              icon: Users,
              title: 'Cohort Learning',
              desc: 'No self-paced isolation. You join a Sprint Team. If you miss a deadline, your team sees it. Accountability drives results.',
            },
            {
              icon: Star,
              title: 'The Blueprint',
              desc: 'Walk away with a 60-page technical specification document authored by you. Proof of experience that beats any certificate.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-8 bg-white rounded-3xl border border-charcoal-100 shadow-lg hover:shadow-xl hover:border-forest-200 transition-all group"
            >
              <div className="w-14 h-14 bg-charcoal-50 rounded-2xl flex items-center justify-center text-charcoal-600 mb-6 group-hover:bg-forest-600 group-hover:text-white transition-colors">
                <item.icon size={28} />
              </div>
              <h3 className="text-xl font-heading font-bold text-charcoal-900 mb-4">{item.title}</h3>
              <p className="text-charcoal-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-forest-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-forest-200 mb-8 max-w-xl mx-auto">
            Request a callback from our admissions team. We&apos;ll discuss your goals and find the
            right program for you.
          </p>
          <button
            onClick={() => setShowApply(true)}
            className="px-10 py-5 bg-gold-500 text-charcoal-900 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-gold-400 transition-all shadow-xl flex items-center gap-2 mx-auto"
          >
            Request Callback
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Video Modal */}
      {showDemo && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setShowDemo(false)}
        >
          <div
            className="bg-black w-full max-w-4xl aspect-video rounded-2xl overflow-hidden relative shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center text-white mb-4">
                  <Play size={32} fill="currentColor" />
                </div>
                <p className="text-white/50 font-mono text-sm">Demo Video Coming Soon</p>
              </div>
            </div>
            <button
              onClick={() => setShowDemo(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {showApply && (
        <div
          className="fixed inset-0 bg-charcoal-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowApply(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-3xl p-10 shadow-2xl relative animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowApply(false)}
              className="absolute top-6 right-6 text-charcoal-300 hover:text-charcoal-900"
            >
              <X size={24} />
            </button>

            {applicationStep === 'form' || applicationStep === 'submitting' ? (
              <form onSubmit={handleSubmitApplication}>
                <h3 className="text-3xl font-heading font-bold text-charcoal-900 mb-2">
                  Request Callback
                </h3>
                <p className="text-charcoal-500 mb-8">
                  Our admissions team will contact you within 24 hours to discuss your enrollment.
                </p>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl flex items-center gap-2 border border-red-100">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-2">
                      Full Name
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-charcoal-50 border border-charcoal-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500"
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={applicationStep === 'submitting'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-2">
                      Email Address
                    </label>
                    <input
                      required
                      type="email"
                      className="w-full bg-charcoal-50 border border-charcoal-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={applicationStep === 'submitting'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      className="w-full bg-charcoal-50 border border-charcoal-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={applicationStep === 'submitting'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-2">
                      Why InTime? (Min 200 chars)
                    </label>
                    <textarea
                      required
                      className="w-full bg-charcoal-50 border border-charcoal-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 h-32 resize-none text-sm"
                      placeholder="Tell us about your career goals, current experience, and why you're ready for this intensive program..."
                      value={formData.interest}
                      onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                      disabled={applicationStep === 'submitting'}
                    />
                    <p className="text-right text-[10px] text-charcoal-400 mt-1">
                      {formData.interest.length} / 200
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={applicationStep === 'submitting'}
                  className="w-full py-4 bg-forest-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-forest-700 transition-colors mt-6 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {applicationStep === 'submitting' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-3xl font-heading font-bold text-charcoal-900 mb-4">
                  Request Received
                </h3>
                <p className="text-charcoal-500 mb-8">
                  Thank you for your interest in InTime Academy. Our admissions team will review your
                  request and contact you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setShowApply(false);
                    setApplicationStep('form');
                    setFormData({ name: '', email: '', phone: '', interest: '' });
                  }}
                  className="px-8 py-3 bg-charcoal-100 text-charcoal-600 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-charcoal-200 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="py-8 text-center text-xs text-charcoal-400 font-mono tracking-wider">
        SOC 2 Compliant | GDPR | CCPA
      </div>
    </div>
  );
}

export default StudentDemoPage;
