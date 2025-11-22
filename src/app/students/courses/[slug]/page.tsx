/**
 * Course Detail Page
 * Story: ACAD-024
 *
 * Full course details with enrollment flow
 */

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
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

  // Get full course structure
  const courseWithModules = await caller.courses.getById({ courseId: course.id });

  // Check if user is enrolled
  const enrollments = await caller.enrollment.getMyEnrollments();
  const enrollment = enrollments.find((e) => e.course_id === course.id);

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Course Info */}
            <div>
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {course.skill_level.charAt(0).toUpperCase() + course.skill_level.slice(1)}
                </Badge>
                {course.is_featured && (
                  <Badge className="bg-yellow-500 text-white border-0">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {enrollment && (
                  <Badge className="bg-green-500 text-white border-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Enrolled
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-5xl font-bold mb-4">{course.title}</h1>

              {/* Subtitle */}
              {course.subtitle && <p className="text-xl text-purple-100 mb-6">{course.subtitle}</p>}

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 text-purple-100 mb-8">
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
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                    Continue Learning
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
                />
              )}

              {/* Prerequisites Warning */}
              {!prerequisiteCheck.canEnroll && (
                <div className="mt-4 bg-red-500/20 border border-red-300 rounded-lg p-4">
                  <p className="text-sm text-white mb-2">
                    <strong>Prerequisites required:</strong>
                  </p>
                  <ul className="text-sm text-purple-100 space-y-1">
                    {prerequisiteCheck.missingPrerequisites.map((prereq: any) => (
                      <li key={prereq.id}>• {prereq.title}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Promo Video or Thumbnail */}
            <div>
              {course.promo_video_url ? (
                <div className="relative rounded-lg overflow-hidden shadow-2xl aspect-video bg-black">
                  <video
                    src={course.promo_video_url}
                    controls
                    className="w-full h-full"
                    poster={course.thumbnail_url}
                  />
                </div>
              ) : course.thumbnail_url ? (
                <div className="relative rounded-lg overflow-hidden shadow-2xl">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-auto"
                  />
                </div>
              ) : (
                <div className="relative rounded-lg overflow-hidden shadow-2xl aspect-video bg-purple-800/30 flex items-center justify-center">
                  <Sparkles className="h-24 w-24 text-white/30" />
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
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            </Card>

            {/* Course Syllabus */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Syllabus</h2>

              <div className="space-y-4">
                {courseWithModules.modules?.map((module: any, moduleIndex: number) => {
                  const Icon = BookOpen;
                  const totalTopics = module.topics?.length || 0;

                  return (
                    <div key={module.id} className="border rounded-lg overflow-hidden">
                      {/* Module Header */}
                      <div className="bg-gray-50 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Module {module.module_number}</p>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {module.title}
                            </h3>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-600">{totalTopics} topics</p>
                          {module.estimated_duration_hours && (
                            <p className="text-xs text-gray-500">
                              ~{module.estimated_duration_hours}h
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Module Topics */}
                      <div className="divide-y">
                        {module.topics?.map((topic: any, topicIndex: number) => {
                          const ContentIcon = getContentIcon(topic.content_type);
                          const isLocked = !enrollment; // Lock if not enrolled

                          return (
                            <div
                              key={topic.id}
                              className={`p-4 flex items-center justify-between \${isLocked ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                            >
                              <div className="flex items-center gap-3">
                                <ContentIcon
                                  className={`h-5 w-5 \${isLocked ? 'text-gray-400' : 'text-purple-600'}`}
                                />
                                <div>
                                  <p
                                    className={`font-medium \${isLocked ? 'text-gray-500' : 'text-gray-900'}`}
                                  >
                                    {topic.title}
                                  </p>
                                  {topic.description && (
                                    <p className="text-sm text-gray-500 line-clamp-1">
                                      {topic.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                {topic.estimated_duration_minutes && (
                                  <span className="text-sm text-gray-500">
                                    {topic.estimated_duration_minutes} min
                                  </span>
                                )}
                                {isLocked && (
                                  <Lock className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </div>
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
            <Card className="p-6 sticky top-6">
              <div className="text-center mb-6">
                {course.price_monthly ? (
                  <>
                    <p className="text-4xl font-bold text-gray-900">\${course.price_monthly}</p>
                    <p className="text-sm text-gray-500">per month</p>
                  </>
                ) : course.price_one_time ? (
                  <>
                    <p className="text-4xl font-bold text-gray-900">\${course.price_one_time}</p>
                    <p className="text-sm text-gray-500">one-time payment</p>
                  </>
                ) : (
                  <p className="text-4xl font-bold text-green-600">Free</p>
                )}
              </div>

              <Separator className="my-6" />

              {/* What's Included */}
              <div className="space-y-3 mb-6">
                <p className="font-semibold text-gray-900 mb-3">This course includes:</p>

                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{courseWithModules.modules?.length || 0} comprehensive modules</span>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{course.total_topics || 0} learning topics</span>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>AI Mentor support</span>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Hands-on lab exercises</span>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Capstone project</span>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Certificate of completion</span>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Lifetime access</span>
                </div>
              </div>

              {enrollment ? (
                <Link href={`/students`}>
                  <Button className="w-full" size="lg">
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
      title: `\${course.title} - InTime Training Academy`,
      description: course.description?.substring(0, 160),
    };
  } catch {
    return {
      title: 'Course Not Found',
    };
  }
}
