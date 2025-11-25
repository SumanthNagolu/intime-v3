'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/templates';

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-ivory">
      <MarketingNavbar />

      {/* Header */}
      <section className="py-20 bg-charcoal-900">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-charcoal-400 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-forest-500/10 text-forest-400 border border-forest-500/20 mb-6">
              <FileText size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Legal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-charcoal-400">
              Last updated: January 1, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto prose prose-lg prose-charcoal">
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using the InTime Solutions website and services, you agree to be bound by
              these Terms of Service. If you disagree with any part of these terms, you may not access
              our services.
            </p>

            <h2>2. Description of Services</h2>
            <p>InTime Solutions provides:</p>
            <ul>
              <li>Technology staffing and recruitment services</li>
              <li>Training and certification programs through InTime Academy</li>
              <li>Consulting services</li>
              <li>Cross-border employment solutions</li>
            </ul>

            <h2>3. User Accounts</h2>
            <h3>Account Creation</h3>
            <p>
              To access certain features, you may need to create an account. You agree to provide accurate,
              complete information and keep your account credentials secure.
            </p>

            <h3>Account Responsibilities</h3>
            <p>You are responsible for:</p>
            <ul>
              <li>All activities that occur under your account</li>
              <li>Maintaining the confidentiality of your password</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>

            <h2>4. Training Programs (InTime Academy)</h2>
            <h3>Enrollment</h3>
            <p>
              By enrolling in a training program, you agree to the specific terms and conditions of that
              program, including payment terms, attendance requirements, and completion criteria.
            </p>

            <h3>Payment Terms</h3>
            <ul>
              <li>Full payment is required before program access unless otherwise arranged</li>
              <li>Refunds are subject to our refund policy</li>
              <li>Income Share Agreements (ISAs) have separate terms</li>
            </ul>

            <h3>Intellectual Property</h3>
            <p>
              All training materials are proprietary to InTime Solutions. You may not reproduce, distribute,
              or share course content without written permission.
            </p>

            <h2>5. Staffing Services</h2>
            <h3>For Candidates</h3>
            <ul>
              <li>You authorize us to submit your profile to potential employers</li>
              <li>You agree to provide accurate information about your qualifications</li>
              <li>Placement fees may apply as disclosed in separate agreements</li>
            </ul>

            <h3>For Clients</h3>
            <ul>
              <li>You agree to our service agreements and fee structures</li>
              <li>You will not directly hire candidates outside of our process</li>
              <li>Payment terms are as specified in your service agreement</li>
            </ul>

            <h2>6. Prohibited Uses</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use our services for any illegal purpose</li>
              <li>Violate any intellectual property rights</li>
              <li>Transmit harmful code or interfere with our systems</li>
              <li>Impersonate others or provide false information</li>
              <li>Scrape or collect data without permission</li>
              <li>Use our services to discriminate against any person</li>
            </ul>

            <h2>7. Intellectual Property</h2>
            <p>
              The InTime Solutions name, logo, website content, and training materials are protected by
              copyright, trademark, and other laws. You may not use our intellectual property without
              written consent.
            </p>

            <h2>8. Disclaimer of Warranties</h2>
            <p>
              Our services are provided "as is" without warranties of any kind, either express or implied.
              We do not guarantee employment outcomes or specific results from our training programs.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, InTime Solutions shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages arising from your use of our services.
            </p>

            <h2>10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless InTime Solutions and its employees from any claims
              arising from your use of our services or violation of these terms.
            </p>

            <h2>11. Termination</h2>
            <p>
              We may terminate or suspend your account at any time for violations of these terms or for
              any other reason at our discretion. Upon termination, your right to use our services ceases
              immediately.
            </p>

            <h2>12. Governing Law</h2>
            <p>
              These terms shall be governed by the laws of the State of Texas, without regard to conflict
              of law provisions.
            </p>

            <h2>13. Dispute Resolution</h2>
            <p>
              Any disputes shall be resolved through binding arbitration in Dallas, Texas, in accordance
              with AAA rules, except for claims that may be brought in small claims court.
            </p>

            <h2>14. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective when posted
              to our website. Continued use of our services constitutes acceptance of modified terms.
            </p>

            <h2>15. Contact Information</h2>
            <p>
              For questions about these Terms of Service, contact us at:
            </p>
            <ul>
              <li>Email: legal@intimeesolutions.com</li>
              <li>Address: Dallas, TX</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsOfService;
