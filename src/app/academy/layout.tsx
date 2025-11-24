import Link from 'next/link';
import AcademyPublicNavbar from '@/components/academy/AcademyPublicNavbar';

export default function AcademyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-[#F5F3EF] font-body text-black">
            <AcademyPublicNavbar />

            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-black text-white border-t-8 border-[#C87941] py-16">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-1">
                            <Link href="/academy" className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 bg-white flex items-center justify-center text-black">
                                    <span className="font-serif font-bold italic text-xl">A</span>
                                </div>
                                <span className="font-heading font-bold text-xl">InTime Academy</span>
                            </Link>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                We don't sell courses. We manufacture Senior Developers through simulation-based training.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#C87941] uppercase tracking-widest text-sm mb-6">Programs</h4>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li><Link href="/academy/courses" className="hover:text-white transition-colors">Guidewire</Link></li>
                                <li><Link href="/academy/courses" className="hover:text-white transition-colors">Salesforce</Link></li>
                                <li><Link href="/academy/courses" className="hover:text-white transition-colors">Full Stack</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#C87941] uppercase tracking-widest text-sm mb-6">Company</h4>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li><Link href="/about" className="hover:text-white transition-colors">About InTime</Link></li>
                                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#C87941] uppercase tracking-widest text-sm mb-6">Connect</h4>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">YouTube</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-600">
                            © {new Date().getFullYear()} InTime Academy. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
