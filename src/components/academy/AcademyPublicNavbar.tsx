'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function AcademyPublicNavbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b-2 border-black bg-[#F5F3EF]">
            <div className="container mx-auto px-6 h-24 flex items-center justify-between">
                {/* Logo */}
                <Link href="/academy" className="flex items-center gap-3 group" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="h-12 w-12 bg-black flex items-center justify-center text-white transition-transform group-hover:rotate-3">
                        <span className="font-serif font-bold italic text-2xl">A</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-heading font-bold text-xl text-black leading-none tracking-tight">Academy</span>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-bold mt-1">By InTime</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-10">
                    <Link href="/" className="text-sm font-bold uppercase tracking-widest hover:text-[#C87941] transition-colors">
                        Corporate
                    </Link>
                    <Link href="/academy/courses" className="text-sm font-bold uppercase tracking-widest hover:text-[#C87941] transition-colors">
                        Curriculum
                    </Link>
                    <Link href="/academy/pricing" className="text-sm font-bold uppercase tracking-widest hover:text-[#C87941] transition-colors">
                        Tuition
                    </Link>
                </nav>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/auth/login" className="text-sm font-bold uppercase tracking-widest hover:text-[#C87941]">
                        Student Login
                    </Link>
                    <Link href="/academy/courses">
                        <button className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-[#C87941] transition-colors">
                            Apply Now
                        </button>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className="md:hidden p-2 text-black"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-[#F5F3EF] border-b-2 border-black py-8 px-6 flex flex-col gap-6 animate-fade-in">
                    <Link href="/" className="text-lg font-bold uppercase tracking-widest hover:text-[#C87941]" onClick={() => setIsMobileMenuOpen(false)}>
                        Corporate
                    </Link>
                    <Link href="/academy/courses" className="text-lg font-bold uppercase tracking-widest hover:text-[#C87941]" onClick={() => setIsMobileMenuOpen(false)}>
                        Curriculum
                    </Link>
                    <Link href="/academy/pricing" className="text-lg font-bold uppercase tracking-widest hover:text-[#C87941]" onClick={() => setIsMobileMenuOpen(false)}>
                        Tuition
                    </Link>
                    <Link href="/auth/login" className="text-lg font-bold uppercase tracking-widest hover:text-[#C87941]" onClick={() => setIsMobileMenuOpen(false)}>
                        Student Login
                    </Link>
                    <Link href="/academy/courses" onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-[#C87941] transition-colors">
                            Apply Now
                        </button>
                    </Link>
                </div>
            )}
        </header>
    );
}


