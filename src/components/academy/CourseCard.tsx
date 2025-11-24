import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, BookOpen, ChevronRight } from 'lucide-react';
import { Course } from '@/types/academy';

interface CourseCardProps {
    course: Course & {
        _count?: {
            modules: number;
            topics: number;
        };
    };
}

export function CourseCard({ course }: CourseCardProps) {
    return (
        <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 border-gray-200">
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-100 overflow-hidden">
                {course.thumbnail_url ? (
                    <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-forest-500 to-rust">
                        <BookOpen className="h-12 w-12 text-white/50" />
                    </div>
                )}
                {course.is_featured && (
                    <Badge className="absolute top-3 right-3 bg-rust hover:bg-rust/90 text-white border-0 shadow-sm">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Featured
                    </Badge>
                )}
            </div>

            <CardHeader className="p-5 pb-2">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-forest-50 text-forest-700 hover:bg-forest-100 border-0">
                        {course.skill_level.charAt(0).toUpperCase() + course.skill_level.slice(1)}
                    </Badge>
                </div>
                <h3 className="text-xl font-heading font-bold text-charcoal line-clamp-2 min-h-[3.5rem]">
                    <Link href={`/academy/courses/${course.slug}`} className="hover:text-rust transition-colors">
                        {course.title}
                    </Link>
                </h3>
            </CardHeader>

            <CardContent className="p-5 pt-2 flex-grow">
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 font-body">
                    {course.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{course.estimated_duration_weeks} weeks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>{course.total_modules || 0} modules</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-5 pt-0 border-t border-gray-50 bg-gray-50/50 mt-auto flex items-center justify-between">
                <div className="flex flex-col">
                    {course.price_monthly ? (
                        <>
                            <span className="text-lg font-bold text-charcoal">${course.price_monthly}</span>
                            <span className="text-xs text-gray-500">per month</span>
                        </>
                    ) : course.price_one_time ? (
                        <>
                            <span className="text-lg font-bold text-charcoal">${course.price_one_time}</span>
                            <span className="text-xs text-gray-500">one-time</span>
                        </>
                    ) : (
                        <span className="text-lg font-bold text-forest-600">Free</span>
                    )}
                </div>

                <Link href={`/academy/courses/${course.slug}`}>
                    <Button size="sm" className="btn-primary">
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
