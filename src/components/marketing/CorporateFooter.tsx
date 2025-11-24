import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CorporateFooter() {
  return (
    <footer className="bg-black text-white border-t-8 border-[#C87941]">
      <div className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          
          {/* Brand Column */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-16 w-16 bg-white flex items-center justify-center text-black">
                <span className="font-serif font-bold italic text-4xl">I</span>
              </div>
              <div>
                <h3 className="font-heading font-bold text-3xl tracking-tight">InTime</h3>
                <p className="text-xs uppercase tracking-[0.4em] text-gray-400 mt-1">Solutions</p>
              </div>
            </div>
            <p className="text-xl text-gray-400 leading-relaxed max-w-md mb-12">
              We don't just fill positions. We engineer high-performance teams through rigorous training, precise placement, and automated workflows.
            </p>
            <div className="flex gap-4">
              {['LinkedIn', 'Twitter', 'GitHub'].map((social) => (
                <a key={social} href="#" className="text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors border-b border-transparent hover:border-[#C87941]">
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-2 md:col-start-7">
            <h4 className="font-bold text-[#C87941] uppercase tracking-widest text-sm mb-8">Offerings</h4>
            <ul className="space-y-4">
              <li><Link href="/solutions/staffing" className="text-gray-400 hover:text-white transition-colors">Staffing</Link></li>
              <li><Link href="/solutions/consulting" className="text-gray-400 hover:text-white transition-colors">Consulting</Link></li>
              <li><Link href="/academy" className="text-gray-400 hover:text-white transition-colors">Academy</Link></li>
              <li><Link href="/solutions/cross-border" className="text-gray-400 hover:text-white transition-colors">Cross-Border</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-bold text-[#C87941] uppercase tracking-widest text-sm mb-8">Company</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">Philosophy</Link></li>
              <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-bold text-[#C87941] uppercase tracking-widest text-sm mb-8">Office</h4>
            <address className="text-gray-400 not-italic leading-relaxed">
              123 Innovation Drive<br />
              Tech District, Suite 400<br />
              San Francisco, CA 94105<br />
              <br />
              <a href="mailto:hello@intime.com" className="hover:text-white transition-colors">hello@intime.com</a>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-24 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} InTime Solutions. All rights reserved.
          </p>
          <p className="text-sm text-gray-600">
            System Status: <span className="text-[#C87941]">Operational</span>
          </p>
        </div>
      </div>
    </footer>
  );
}


