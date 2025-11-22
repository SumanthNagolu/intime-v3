/**
 * Students Layout
 *
 * Provides navigation and layout structure for student training pages.
 * Requires authentication to access.
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BookOpen, GraduationCap, BarChart3, MessageSquare, FileText, Home } from 'lucide-react';

export default async function StudentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?redirectTo=/students');
  }

  return (
    <div className="flex min-h-screen bg-[#F5F3EF]">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r-2 border-gray-200">
        <div className="p-6 border-b-2 border-gray-800">
          <h1 className="text-2xl font-bold text-white">Training Academy</h1>
        </div>

        <nav className="p-4 space-y-1">
          <NavLink href="/students" label="Dashboard" icon={<Home className="w-5 h-5" />} />
          <NavLink href="/students/courses" label="Courses" icon={<BookOpen className="w-5 h-5" />} />
          <NavLink href="/students/progress" label="Progress" icon={<BarChart3 className="w-5 h-5" />} />
          <NavLink href="/students/ai-mentor" label="AI Mentor" icon={<MessageSquare className="w-5 h-5" />} />
          <NavLink href="/students/assessments" label="Assessments" icon={<FileText className="w-5 h-5" />} />
          <div className="pt-4 mt-4 border-t-2 border-gray-800">
            <NavLink href="/dashboard" label="Back to Dashboard" icon={<GraduationCap className="w-5 h-5" />} />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 text-blue-500 hover:bg-gray-900 hover:text-blue-400 transition-colors font-medium"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

