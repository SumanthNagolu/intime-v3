/**
 * Course Detail Page
 * Story: ACAD-024
 * Design System V2 (Ivory/Forest/Rust)
 *
 * Full course details with enrollment flow
 */

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  Clock,
  Award,
  Star,
  CheckCircle2,
  PlayCircle,
  FileText,
  Brain,
  FlaskConical,
  Trophy,
  ChevronRight,
  Lock,
  Users,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/server';
import { createClient } from '@/lib/supabase/server';
import { EnrollButton } from '@/components/academy/EnrollButton';

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?redirect=/students/courses/${params.slug}`);
  }

  // Get course details
  const caller = trpc.createCaller({ userId: user.id });

  let course;
  try {
    course = await caller.courses.getBySlug({ slug: params.slug });
  } catch (error) {
    notFound();
  }

  // Check if user is enrolled
  const enrollments = await caller.enrollment.getMyEnrollments();
  const enrollment = enrollments.find((e) => e.course_id === course.id);

  // Get full course structure
  let courseWithModules;
  if (enrollment) {
    courseWithModules = await caller.courses.getCourseWithProgress({
      courseId: course.id,
      enrollmentId: enrollment.id,
    });
  } else {
    courseWithModules = await caller.courses.getById({ courseId: course.id });
  }

  // Check prerequisites
  const prerequisiteCheck = await caller.enrollment.checkPrerequisites({
    courseId: course.id,
  });

  // Content type icons
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return PlayCircle;
      case 'reading':
        return FileText;
      case 'quiz':
        return Brain;
      case 'lab':
        return FlaskConical;
      case 'project':
        return Trophy;
      default:
        return BookOpen;
    }
  };

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Hero Section */}
      <div className="bg-forest-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('/grid-pattern.svg')] bg-center" />
        
        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Course Info */}
            <div>
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary" className="bg-white/10 text-forest-50 border-0 backdrop-blur-sm">
                  {course.skill_level.charAt(0).toUpperCase() + course.skill_level.slice(1)}
                </Badge>
                {course.is_featured && (
                  <Badge className="bg-rust text-white border-0 shadow-sm">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
                {enrollment && (
                  <Badge className="bg-forest-500 text-white border-0 shadow-sm">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Enrolled
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 leading-tight">{course.title}</h1>

              {/* Subtitle */}
              {course.subtitle && <p className="text-xl text-forest-100 mb-8 font-light">{course.subtitle}</p>}

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 text-forest-100 mb-8 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{course.estimated_duration_weeks} weeks</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>{courseWithModules.modules?.length || 0} modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>{course.total_topics || 0} topics</span>
                </div>
              </div>

              {/* CTA */}
              {enrollment ? (
                <Link href={`/students`}>
                  <Button size="lg" className="bg-white text-forest-800 hover:bg-forest-50 border-0 font-semibold">
                    Continue Learning
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <div className="flex gap-4">
                    <EnrollButton
                    courseId={course.id}
                    courseName={course.title}
                    priceMonthly={course.price_monthly}
                    priceOneTime={course.price_one_time}
                    canEnroll={prerequisiteCheck.canEnroll}
                    missingPrerequisites={prerequisiteCheck.missingPrerequisites}
                    />
                </div>
              )}

              {/* Prerequisites Warning */}
              {!prerequisiteCheck.canEnroll && (
                <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-sm text-red-100 mb-2 font-semibold">
                    Prerequisites required:
                  </p>
                  <ul className="text-sm text-red-100 space-y-1 list-disc list-inside">
                    {prerequisiteCheck.missingPrerequisites.map((prereq: any) => (
                      <li key={prereq.id}>{prereq.title}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Promo Video or Thumbnail */}
            <div>
              {course.promo_video_url ? (
                <div className="relative rounded-xl overflow-hidden shadow-elevation-xl aspect-video bg-black border border-forest-700">
                  <video
                    src={course.promo_video_url}
                    controls
                    className="w-full h-full"
                    poster={course.thumbnail_url}
                  />
                </div>
              ) : course.thumbnail_url ? (
                <div className="relative rounded-xl overflow-hidden shadow-elevation-xl border border-forest-700">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-auto"
                  />
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden shadow-elevation-xl aspect-video bg-forest-800 flex items-center justify-center border border-forest-700">
                  <Sparkles className="h-24 w-24 text-forest-600" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card className="p-8 shadow-sm border-gray-200">
              <h2 className="text-2xl font-heading font-bold text-charcoal mb-4">About This Course</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line font-body">
                {course.description}
              </p>
            </Card>

            {/* Course Syllabus */}
            <Card className="p-8 shadow-sm border-gray-200">
              <h2 className="text-2xl font-heading font-bold text-charcoal mb-6">Course Syllabus</h2>

              <div className="space-y-4">
                {courseWithModules.modules?.map((module: any, moduleIndex: number) => {
                  const Icon = BookOpen;
                  const totalTopics = module.topics?.length || 0;

                  return (
                    <div key={module.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      {/* Module Header */}
                      <div className="bg-gray-50 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                            <Icon className="h-5 w-5 text-forest-600" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Module {module.module_number}</p>
                            <h3 className="text-lg font-semibold text-charcoal">
                              {module.title}
                            </h3>
                          </div>
                        </div>

                        <div className="text-right hidden sm:block">
                          <p className="text-sm text-gray-600 font-medium">{totalTopics} topics</p>
                          {module.estimated_duration_hours && (
                            <p className="text-xs text-gray-500">
                              ~{module.estimated_duration_hours}h
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Module Topics */}
                      <div className="divide-y divide-gray-100 bg-white">
                        {module.topics?.map((topic: any, topicIndex: number) => {
                          const ContentIcon = getContentIcon(topic.content_type);
                          // Logic: Locked if not enrolled OR if backend says so
                          // If not enrolled, isLocked = true
                          // If enrolled, isLocked = !topic.is_unlocked
                          const isLocked = !enrollment || (enrollment && !topic.is_unlocked);
                          
                          // If unlocked, allow clicking
                          const TopicWrapper = isLocked ? 'div' : Link;
                          const wrapperProps = isLocked ? {} : { href: `/students/courses/${params.slug}/learn/${topic.id}` };

                          return (
                            <TopicWrapper
                              key={topic.id}
                              className={`p-4 flex items-center justify-between transition-colors ${isLocked ? 'bg-gray-50/50 cursor-not-allowed' : 'hover:bg-forest-50 cursor-pointer'}`}
                              {...wrapperProps}
                            >
                              <div className="flex items-center gap-3">
                                <ContentIcon
                                  className={`h-5 w-5 ${isLocked ? 'text-gray-400' : 'text-forest-600'}`}
                                />
                                <div>
                                  <p
                                    className={`font-medium ${isLocked ? 'text-gray-500' : 'text-charcoal'}`}
                                  >
                                    {topic.title}
                                  </p>
                                  {topic.description && (
                                    <p className="text-sm text-gray-500 line-clamp-1 font-body">
                                      {topic.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                {topic.estimated_duration_minutes && (
                                  <span className="text-sm text-gray-400 hidden sm:inline-block">
                                    {topic.estimated_duration_minutes} min
                                  </span>
                                )}
                                {isLocked ? (
                                  <Lock className="h-4 w-4 text-gray-300" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-forest-300" />
                                )}
                              </div>
                            </TopicWrapper>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar (1/3 width) */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="p-6 sticky top-6 shadow-elevation-md border-gray-200">
              <div className="text-center mb-6">
                {course.price_monthly ? (
                  <>
                    <p className="text-4xl font-heading font-bold text-charcoal">${course.price_monthly}</p>
                    <p className="text-sm text-gray-500 font-medium">per month</p>
                  </>
                ) : course.price_one_time ? (
                  <>
                    <p className="text-4xl font-heading font-bold text-charcoal">${course.price_one_time}</p>
                    <p className="text-sm text-gray-500 font-medium">one-time payment</p>
                  </>
                ) : (
                  <p className="text-4xl font-heading font-bold text-forest-600">Free</p>
                )}
              </div>

              <Separator className="my-6 bg-gray-100" />

              {/* What's Included */}
              <div className="space-y-4 mb-8">
                <p className="font-heading font-semibold text-charcoal">This course includes:</p>

                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <CheckCircle2 className="h-5 w-5 text-forest-500 flex-shrink-0" />
                  <span>{courseWithModules.modules?.length || 0} comprehensive modules</span>
                </div>

                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <CheckCircle2 className="h-5 w-5 text-forest-500 flex-shrink-0" />
                  <span>{course.total_topics || 0} learning topics</span>
                </div>

                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <CheckCircle2 className="h-5 w-5 text-forest-500 flex-shrink-0" />
                  <span>AI Mentor support</span>
                </div>

                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <CheckCircle2 className="h-5 w-5 text-forest-500 flex-shrink-0" />
                  <span>Hands-on lab exercises</span>
                </div>

                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <CheckCircle2 className="h-5 w-5 text-forest-500 flex-shrink-0" />
                  <span>Capstone project</span>
                </div>

                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <CheckCircle2 className="h-5 w-5 text-forest-500 flex-shrink-0" />
                  <span>Certificate of completion</span>
                </div>

                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <CheckCircle2 className="h-5 w-5 text-forest-500 flex-shrink-0" />
                  <span>Lifetime access</span>
                </div>
              </div>

              {enrollment ? (
                <Link href={`/students`}>
                  <Button className="w-full btn-primary" size="lg">
                    Go to Dashboard
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <EnrollButton
                  courseId={course.id}
                  courseName={course.title}
                  priceMonthly={course.price_monthly}
                  priceOneTime={course.price_one_time}
                  canEnroll={prerequisiteCheck.canEnroll}
                  missingPrerequisites={prerequisiteCheck.missingPrerequisites}
                  fullWidth
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const caller = trpc.createCaller({});

  try {
    const course = await caller.courses.getBySlug({ slug: params.slug });
    return {
      title: `${course.title} - InTime Training Academy`,
      description: course.description?.substring(0, 160),
    };
  } catch {
    return {
      title: 'Course Not Found',
    };
  }
}
