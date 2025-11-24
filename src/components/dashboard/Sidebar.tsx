'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Trophy, Target, MessageCircle, Settings, type LucideIcon, GraduationCap } from 'lucide-react';

interface SidebarLinkProps {
    icon: LucideIcon;
    label: string;
    href: string;
}

function SidebarLink({ icon: Icon, label, href }: SidebarLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${isActive
                    ? 'bg-forest-50 text-forest-700 border-l-4 border-forest-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-forest-600'
                }`}
        >
            <Icon className={`w-5 h-5 ${isActive ? 'text-forest-600' : 'text-gray-500'}`} />
            <span>{label}</span>
        </Link>
    );
}

export function Sidebar() {
    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-20">
            {/* Logo */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-forest-500 flex items-center justify-center text-white shadow-sm">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-heading font-bold text-charcoal leading-none">InTime</h1>
                        <p className="text-xs text-gray-500 mt-1 font-medium">Academy</p>
                    </div>
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 p-4 space-y-1">
                <SidebarLink icon={Home} label="Dashboard" href="/students" />
                <SidebarLink icon={BookOpen} label="My Courses" href="/students/courses" />
                <SidebarLink icon={Trophy} label="Achievements" href="/students/certificates" />
                <SidebarLink icon={Target} label="Progress" href="/students/progress" />
                <SidebarLink icon={MessageCircle} label="AI Mentor" href="/students/ai-mentor" />
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-gray-100">
                <SidebarLink icon={Settings} label="Settings" href="/students/settings" />
            </div>
        </aside>
    );
}
