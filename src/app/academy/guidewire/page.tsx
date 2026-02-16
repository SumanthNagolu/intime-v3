
import { AppLayout } from '@/components/AppLayout';
import { getGuidewireCourse } from './actions';
import Link from 'next/link';
import { Play, FileText, ChevronRight, Lock } from 'lucide-react';

export const dynamic = "force-dynamic";

export default async function GuidewireAcademyPage() {
    const course = await getGuidewireCourse();

    if (!course) {
        return (
            <AppLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
                        <p>Please run the content ingestion script to load the data.</p>
                        <div className="mt-4 p-4 bg-gray-100 rounded text-left font-mono text-sm inline-block">
                            npx tsx scripts/ingest-guidewire-content.ts
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="bg-ivory min-h-screen pb-20">
                {/* Banner */}
                <div className="bg-charcoal text-white py-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl">
                            <span className="text-rust text-sm font-bold uppercase tracking-widest mb-4 block">Official Curriculum</span>
                            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">{course.title}</h1>
                            <p className="text-xl text-stone-300 max-w-2xl mb-8 leading-relaxed">
                                {course.description || "Master Guidewire PolicyCenter, ClaimCenter, and BillingCenter through real-world projects."}
                            </p>
                            <div className="flex gap-4">
                                <button className="px-8 py-3 bg-rust text-white rounded-full font-bold uppercase tracking-widest hover:bg-[#B8421E] transition-colors">
                                    Start Learning
                                </button>
                                <div className="flex items-center gap-2 text-stone-400 px-4 py-3">
                                    <span>{course.course_modules?.length || 0} Modules</span>
                                    <span className="w-1 h-1 bg-stone-500 rounded-full"></span>
                                    <span>Project-Based</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modules List */}
                <div className="container mx-auto px-4 -mt-10 relative z-10">
                    <div className="max-w-4xl space-y-6">
                        {course.course_modules && course.course_modules.length > 0 ? (
                            course.course_modules.map((module: any) => (
                                <div key={module.id} className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 overflow-hidden border border-stone-100">
                                    <div className="p-8 border-b border-stone-100 bg-stone-50/50">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-rust text-xs font-bold uppercase tracking-widest">Module {module.module_number}</span>
                                            <span className="bg-stone-200 text-stone-600 text-[10px] font-bold px-2 py-1 rounded uppercase">
                                                {module.module_topics?.length || 0} Lessons
                                            </span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-charcoal">{module.title}</h2>
                                        {module.description && <p className="text-stone-500 mt-2">{module.description}</p>}
                                    </div>

                                    <div className="divide-y divide-stone-100">
                                        {module.module_topics && module.module_topics.length > 0 ? (
                                            module.module_topics.map((topic: any) => (
                                                <Link
                                                    key={topic.id}
                                                    href={`/academy/guidewire/course/${module.slug}/${topic.slug}`}
                                                    className="block p-4 hover:bg-stone-50 transition-colors group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${topic.content_type === 'video' ? 'bg-rust/10 text-rust' : 'bg-blue-100 text-blue-600'}`}>
                                                                {topic.content_type === 'video' ? <Play size={16} fill="currentColor" /> : <FileText size={16} />}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-charcoal group-hover:text-rust transition-colors text-sm">
                                                                    {topic.topic_number}. {topic.title}
                                                                </h3>
                                                                <p className="text-xs text-stone-400 capitalize">{topic.content_type} • {topic.estimated_duration_minutes} min</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-stone-300 group-hover:text-rust transition-colors">
                                                            <ChevronRight size={16} />
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-stone-400 italic">No topics available yet.</div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white p-12 rounded-2xl shadow-sm border border-stone-200 text-center">
                                <p className="text-lg text-stone-500">Curriculum is being updated. Check back soon.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
