
import { AppLayout } from '@/components/AppLayout';
import { getGuidewireCourse } from '../../../actions';
import { AiTutorDialog } from '@/components/academy/AiTutorDialog';
import Link from 'next/link';
import { Play, FileText, ChevronLeft, CheckCircle, Menu, Download } from 'lucide-react';
import { notFound } from 'next/navigation';

export const dynamic = "force-dynamic";

export default async function TopicPage(props: { params: Promise<{ moduleSlug: string, topicSlug: string }> }) {
    const params = await props.params;
    const { moduleSlug, topicSlug } = params;
    const course = await getGuidewireCourse();

    if (!course) {
        return (
            <AppLayout>
                <div className="flex h-screen items-center justify-center">
                    <p>Course content not loaded. Please run ingestion script.</p>
                </div>
            </AppLayout>
        );
    }

    // Find current module and topic
    const currentModule = course.course_modules?.find((m: any) => m.slug === moduleSlug);
    const currentTopic = currentModule?.module_topics?.find((t: any) => t.slug === topicSlug);

    if (!currentTopic) {
        return notFound();
    }

    const asset = currentTopic.content_assets?.[0]; // Access first asset
    const assetUrl = asset?.cdn_url;
    const fileType = asset?.file_type; // 'video' or 'pdf'

    return (
        <AppLayout>
            <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
                {/* Sidebar */}
                <div className="w-80 border-r border-stone-200 overflow-y-auto hidden md:block bg-stone-50">
                    <div className="p-4 border-b border-stone-200 sticky top-0 bg-stone-50 z-10">
                        <Link href="/academy/guidewire" className="flex items-center text-xs font-bold text-stone-500 hover:text-rust uppercase tracking-widest mb-4 transition-colors">
                            <ChevronLeft size={12} className="mr-1" /> Back to Curriculum
                        </Link>
                        <h2 className="font-serif font-bold text-lg leading-tight text-charcoal">{course.title}</h2>
                    </div>

                    <div className="p-2 pb-20">
                        {course.course_modules?.map((module: any) => (
                            <div key={module.id} className="mb-4">
                                <div className="px-2 py-1 text-xs font-bold text-stone-400 uppercase tracking-widest mb-1 sticky top-14 bg-stone-50/90 backdrop-blur z-9">
                                    Module {module.module_number}
                                </div>
                                {module.module_topics?.map((topic: any) => {
                                    const isActive = topic.slug === topicSlug;
                                    const isVideo = topic.content_type === 'video';

                                    return (
                                        <Link
                                            key={topic.id}
                                            href={`/academy/guidewire/course/${module.slug}/${topic.slug}`}
                                            className={`flex items-center gap-3 p-3 rounded-lg text-sm transition-all mb-1 ${isActive ? 'bg-rust text-white shadow-md' : 'text-stone-600 hover:bg-stone-200'}`}
                                        >
                                            <div className={`shrink-0 ${isActive ? 'text-white' : 'text-stone-400'}`}>
                                                {isVideo ? <Play size={14} fill={isActive ? "currentColor" : "none"} /> : <FileText size={14} />}
                                            </div>
                                            <span className="truncate leading-snug">{topic.topic_number}. {topic.title}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto bg-ivory">
                    <div className="max-w-5xl mx-auto p-4 md:p-8 pb-20">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 text-stone-500 text-xs font-bold uppercase tracking-widest mb-2">
                                <span>{currentModule.title}</span>
                                <ChevronLeft size={10} className="rotate-180" />
                                <span>Lesson {currentTopic.topic_number}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-charcoal">{currentTopic.title}</h1>
                        </div>

                        <div className="bg-charcoal rounded-2xl overflow-hidden shadow-2xl relative border border-stone-800">
                            {assetUrl ? (
                                fileType === 'video' ? (
                                    <div className="aspect-video">
                                        <video
                                            controls
                                            className="w-full h-full"
                                            src={assetUrl}
                                            poster="/academy/video-poster-placeholder.jpg" // We could generate one or fetch one
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                ) : (
                                    <div className="aspect-[4/3] bg-white text-charcoal flex flex-col">
                                        {/* PDF Viewer using iframe for simplicity */}
                                        <iframe src={assetUrl} className="w-full h-full flex-1" title="Assignment PDF"></iframe>
                                        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-between items-center">
                                            <span className="text-sm font-bold text-stone-600">{currentTopic.title}.pdf</span>
                                            <a href={assetUrl} download className="flex items-center gap-2 text-rust text-sm font-bold hover:underline">
                                                <Download size={16} /> Download PDF
                                            </a>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="aspect-video flex items-center justify-center text-stone-500 bg-stone-100">
                                    <div className="text-center">
                                        <p className="mb-2">Asset not found for this topic.</p>
                                        <p className="text-xs font-mono">{topicSlug}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-between items-center p-6 bg-white rounded-2xl shadow-sm border border-stone-100">
                            <div>
                                <p className="text-sm text-stone-500 mb-1">Duration</p>
                                <p className="font-bold text-charcoal">{currentTopic.estimated_duration_minutes || 10} Minutes</p>
                            </div>

                            <div className="flex gap-4">
                                <button className="px-6 py-3 border border-stone-200 rounded-full text-stone-500 font-bold uppercase tracking-widest text-xs hover:bg-stone-50 hover:border-rust hover:text-rust transition-all">
                                    Previous
                                </button>
                                {currentTopic.content_type === 'lab' && (
                                    <AiTutorDialog
                                        moduleId={currentModule.id}
                                        topicId={currentTopic.id}
                                        topicName={currentTopic.title}
                                    />
                                )}
                                <button className="px-6 py-3 bg-rust text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#B8421E] transition-all flex items-center gap-2 shadow-lg shadow-rust/20">
                                    Mark Complete <CheckCircle size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
