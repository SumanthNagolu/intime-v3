
import { getAdminClient } from '@/lib/supabase/admin';

export async function getGuidewireCourse() {
    const adminClient = getAdminClient();
    const { data: course } = await adminClient
        .from('courses')
        .select(`
            *,
            course_modules (
                id,
                title,
                slug,
                description,
                module_number,
                is_published,
                module_topics (
                    id,
                    title,
                    slug,
                    topic_number,
                    content_type,
                    is_published,
                    estimated_duration_minutes,
                    content_assets (
                        id,
                        asset_type,
                        file_type,
                        cdn_url,
                        storage_path
                    )
                )
            )
        `)
        .eq('slug', 'guidewire-ace-academy')
        .single();

    if (course && course.course_modules) {
        // Sort modules by number
        course.course_modules.sort((a: any, b: any) => (a.module_number || 0) - (b.module_number || 0));

        // Sort topics in each module
        course.course_modules.forEach((m: any) => {
            if (m.module_topics) {
                m.module_topics.sort((a: any, b: any) => (a.topic_number || 0) - (b.topic_number || 0));
            }
        });
    }

    return course;
}
