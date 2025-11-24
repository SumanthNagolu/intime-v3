import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, Filter, X } from 'lucide-react';
import { trpc } from '@/lib/trpc/server';
import { CourseCard } from '@/components/academy/CourseCard';
// import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const metadata = {
    title: 'Course Catalog - InTime Academy',
    description: 'Browse our comprehensive catalog of courses in Guidewire, Salesforce, and more.',
};

export default async function CourseCatalogPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    let allCourses: any[] = [];
    let errorMsg = null;

    try {
        const caller = await trpc.createCaller({});
        allCourses = await caller.courses.listPublished();
    } catch (e: any) {
        console.error("Failed to fetch courses:", e);
        errorMsg = e.message;
    }

    if (errorMsg) {
        return <div className="p-10 text-red-500">Error: {errorMsg}</div>;
    }

    // Filter logic (basic implementation)
    const query = typeof searchParams.q === 'string' ? searchParams.q.toLowerCase() : '';
    const category = typeof searchParams.category === 'string' ? searchParams.category.toLowerCase() : '';
    const level = typeof searchParams.level === 'string' ? searchParams.level.toLowerCase() : '';

    const filteredCourses = allCourses.filter((course) => {
        const matchesQuery = course.title.toLowerCase().includes(query) ||
            course.description.toLowerCase().includes(query);
        const matchesCategory = category ? course.title.toLowerCase().includes(category) : true; // Simple category match
        const matchesLevel = level ? course.skill_level === level : true;

        return matchesQuery && matchesCategory && matchesLevel;
    });

    const FilterSidebar = () => (
        <div className="space-y-8">
            <div>
                <h3 className="font-heading font-semibold text-charcoal mb-4">Categories</h3>
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="cat-guidewire" className="border-forest-200 text-forest-600 focus:ring-forest-500" />
                        <Label htmlFor="cat-guidewire" className="text-gray-600">Guidewire</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="cat-salesforce" className="border-forest-200 text-forest-600 focus:ring-forest-500" />
                        <Label htmlFor="cat-salesforce" className="text-gray-600">Salesforce</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="cat-aws" className="border-forest-200 text-forest-600 focus:ring-forest-500" />
                        <Label htmlFor="cat-aws" className="text-gray-600">AWS Cloud</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="cat-web" className="border-forest-200 text-forest-600 focus:ring-forest-500" />
                        <Label htmlFor="cat-web" className="text-gray-600">Web Development</Label>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="font-heading font-semibold text-charcoal mb-4">Skill Level</h3>
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="level-beginner" className="border-forest-200 text-forest-600 focus:ring-forest-500" />
                        <Label htmlFor="level-beginner" className="text-gray-600">Beginner</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="level-intermediate" className="border-forest-200 text-forest-600 focus:ring-forest-500" />
                        <Label htmlFor="level-intermediate" className="text-gray-600">Intermediate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="level-advanced" className="border-forest-200 text-forest-600 focus:ring-forest-500" />
                        <Label htmlFor="level-advanced" className="text-gray-600">Advanced</Label>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="font-heading font-semibold text-charcoal mb-4">Price</h3>
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="price-free" className="border-forest-200 text-forest-600 focus:ring-forest-500" />
                        <Label htmlFor="price-free" className="text-gray-600">Free</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="price-paid" className="border-forest-200 text-forest-600 focus:ring-forest-500" />
                        <Label htmlFor="price-paid" className="text-gray-600">Paid</Label>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-16">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-charcoal mb-6">Course Catalog</h1>
                    <p className="text-lg text-gray-500 max-w-2xl leading-relaxed font-body">
                        Explore our expert-led courses designed to take you from beginner to job-ready professional.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar (Desktop) */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <FilterSidebar />
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Search and Mobile Filter */}
                        <div className="flex gap-4 mb-8">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search courses..."
                                    className="pl-10 h-12 border-gray-200 focus:border-forest-500 focus:ring-forest-500 rounded-lg"
                                    defaultValue={query}
                                />
                            </div>
                        </div>

                        {/* Results */}
                        {filteredCourses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filteredCourses.map((course) => (
                                    <CourseCard key={course.id} course={course} />
                                    // <div key={course.id} className="p-4 border rounded">Course Card Placeholder</div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-white rounded-xl border border-dashed border-gray-200">
                                <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Search className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-charcoal mb-2">No courses found</h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    Try adjusting your search or filters to find what you're looking for.
                                </p>
                                <Button variant="outline" onClick={() => { }} className="border-gray-300 text-charcoal hover:border-forest-500 hover:text-forest-600">
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
