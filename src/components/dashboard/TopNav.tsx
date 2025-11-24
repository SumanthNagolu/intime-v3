'use client';

import { Search, Bell, User, Settings, LogOut, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOutAction } from '@/app/actions/auth';

export function TopNav() {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/students/courses?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className="h-16 bg-white/80 backdrop-blur border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
            {/* Search */}
            <div className="flex-1 max-w-xl">
                <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="search"
                        placeholder="Search courses, lessons..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-charcoal placeholder-gray-500 focus:ring-2 focus:ring-forest-500 focus:border-transparent focus:outline-none transition-all shadow-sm"
                    />
                </form>
            </div>

            {/* Right side: Notifications + Avatar */}
            <div className="flex items-center gap-4">
                <button className="relative p-2 text-gray-500 hover:bg-gray-100 hover:text-forest-600 rounded-lg transition-all">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rust rounded-full border-2 border-white" />
                </button>

                <button className="relative p-2 text-gray-500 hover:bg-gray-100 hover:text-forest-600 rounded-lg transition-all">
                    <HelpCircle className="w-5 h-5" />
                </button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition-all">
                            <div className="w-9 h-9 rounded-lg bg-forest-50 flex items-center justify-center border border-forest-100">
                                <User className="w-5 h-5 text-forest-600" />
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/students/profile" className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/students/settings" className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                            onClick={async () => {
                                await signOutAction();
                            }}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
