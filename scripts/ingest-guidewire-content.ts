
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/db/schema/schema';
import { eq, and } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log('🚀 Starting Guidewire Content Ingestion...');

    const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL or SUPABASE_DB_URL not found');
    }

    const pool = new Pool({ connectionString });
    const db = drizzle(pool, { schema });

    // Load Manifests
    const publicDir = path.join(__dirname, '../public');
    const guidewireDir = path.join(publicDir, 'academy/guidewire');

    const videoManifestPath = path.join(guidewireDir, 'video-manifest.json');
    const assignmentManifestPath = path.join(guidewireDir, 'assignment-manifest.json');

    if (!fs.existsSync(videoManifestPath) || !fs.existsSync(assignmentManifestPath)) {
        throw new Error('Manifest files not found in public/academy/guidewire');
    }

    const videos = JSON.parse(fs.readFileSync(videoManifestPath, 'utf-8'));
    const assignments = JSON.parse(fs.readFileSync(assignmentManifestPath, 'utf-8'));

    console.log(`📦 Loaded manifest files. Found ${Object.keys(videos).length} video chapters and ${Object.keys(assignments).length} assignment chapters.`);

    // 1. Ensure Course Exists
    const courseSlug = 'guidewire-ace-academy';
    let courseId: string;

    const existingCourse = await db.query.courses.findFirst({
        where: eq(schema.courses.slug, courseSlug)
    });

    if (existingCourse) {
        console.log(`✅ Course "Guidewire ACE Academy" already exists (${existingCourse.id}). Using existing course.`);
        courseId = existingCourse.id;
    } else {
        console.log(`✨ Creating "Guidewire ACE Academy" course...`);
        const [newCourse] = await db.insert(schema.courses).values({
            title: 'Guidewire ACE Academy',
            slug: courseSlug,
            description: 'The complete Zero-to-Hero training program for Guidewire developers. Master PolicyCenter, BillingCenter, ClaimCenter, and Integration.',
            estimatedDurationWeeks: 12,
            priceMonthly: '49.00',
            priceOneTime: '499.00',
            isPublished: true,
            skillLevel: 'beginner',
            isFeatured: true,
        }).returning();
        courseId = newCourse.id;
        console.log(`✅ Created course: ${courseId}`);
    }

    // 2. Process Chapters (Modules)
    const allChapters = new Set([...Object.keys(videos), ...Object.keys(assignments)]);
    const sortedChapters = Array.from(allChapters).sort();

    for (const chapterKey of sortedChapters) {
        const match = chapterKey.match(/Ch(\d+)\s*-\s*(.+)/);
        if (!match) {
            console.warn(`⚠️  Skipping invalid chapter format: "${chapterKey}"`);
            continue;
        }

        const moduleNumber = parseInt(match[1], 10);
        const moduleTitle = match[2];
        const moduleSlug = `module-${moduleNumber}-${moduleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

        console.log(`\n📘 Processing Module ${moduleNumber}: "${moduleTitle}"...`);

        // Check if module exists
        let moduleId: string;
        const existingModule = await db.query.courseModules.findFirst({
            where: and(
                eq(schema.courseModules.courseId, courseId),
                eq(schema.courseModules.moduleNumber, moduleNumber)
            )
        });

        if (existingModule) {
            moduleId = existingModule.id;
        } else {
            const [newModule] = await db.insert(schema.courseModules).values({
                courseId,
                title: moduleTitle,
                slug: moduleSlug,
                moduleNumber,
                description: `Module ${moduleNumber}: ${moduleTitle}`,
                isPublished: true,
            }).returning();
            moduleId = newModule.id;
            console.log(`   - Created module (${moduleId})`);
        }

        // 3. Process Topics (Videos)
        const chapterVideos = videos[chapterKey] || [];
        let topicNumber = 1;

        for (const video of chapterVideos) {
            const videoMatch = video.filename.match(/^\d+\s*-\s*(.+)\.(mp4|mkv|avi|mov)$/i) || [null, video.filename];
            const topicTitle = videoMatch[1];
            const topicSlug = `topic-${moduleNumber}-${topicNumber}-video`;

            // Check if topic exists
            const existingTopic = await db.query.moduleTopics.findFirst({
                where: and(
                    eq(schema.moduleTopics.moduleId, moduleId),
                    eq(schema.moduleTopics.slug, topicSlug)
                )
            });

            let topicId: string;
            if (existingTopic) {
                topicId = existingTopic.id;
            } else {
                const [newTopic] = await db.insert(schema.moduleTopics).values({
                    moduleId,
                    title: topicTitle,
                    slug: topicSlug,
                    topicNumber: topicNumber,
                    contentType: 'video',
                    isPublished: true,
                    isRequired: true,
                    estimatedDurationMinutes: 10, // Default estimate
                }).returning();
                topicId = newTopic.id;
                console.log(`     - Created Video Topic: "${topicTitle}"`);

                // Prepare Content Asset Data
                // video.path in manifest is likely relative to `public/academy/guidewire`?
                // Let's check manifest structure. The analyze step showed path.
                // Assuming path is like "Ch01.../video.mp4"

                const relativePath = video.path; // e.g. "Ch01 - .../01 - ...mp4"
                const localFilePath = path.join(guidewireDir, relativePath);
                let fileSize = 0;
                try {
                    const stats = fs.statSync(localFilePath);
                    fileSize = stats.size;
                } catch (e) {
                    console.warn(`       ⚠️ Could not stat file: ${localFilePath}`);
                }

                const cdnUrl = `/academy/guidewire/${relativePath}`;

                await db.insert(schema.contentAssets).values({
                    topicId,
                    filename: video.filename,
                    storagePath: relativePath,
                    fileType: 'video', // Matches check constraint
                    mimeType: 'video/mp4', // Simplification
                    fileSizeBytes: fileSize,
                    cdnUrl: cdnUrl,
                    isCurrent: true,
                    isPublic: false,
                });
            }
            topicNumber++;
        }

        // 4. Process Topics (Assignments)
        const chapterAssignments = assignments[chapterKey] || [];
        for (const assignment of chapterAssignments) {
            const assignMatch = assignment.filename.match(/^(?:Lab\s*\d+\s*-\s*)?(.+)\.pdf$/i) || [null, assignment.filename];
            const topicTitle = `Lab: ${assignMatch[1]}`;
            const topicSlug = `topic-${moduleNumber}-${topicNumber}-lab`;

            const existingTopic = await db.query.moduleTopics.findFirst({
                where: and(
                    eq(schema.moduleTopics.moduleId, moduleId),
                    eq(schema.moduleTopics.slug, topicSlug)
                )
            });

            let topicId: string;
            if (existingTopic) {
                topicId = existingTopic.id;
            } else {
                const [newTopic] = await db.insert(schema.moduleTopics).values({
                    moduleId,
                    title: topicTitle,
                    slug: topicSlug,
                    topicNumber: topicNumber,
                    contentType: 'lab',
                    isPublished: true,
                    isRequired: true,
                    estimatedDurationMinutes: 30,
                }).returning();
                topicId = newTopic.id;
                console.log(`     - Created Lab Topic: "${topicTitle}"`);

                const relativePath = assignment.path;
                const localFilePath = path.join(guidewireDir, relativePath);
                let fileSize = 0;
                try {
                    const stats = fs.statSync(localFilePath);
                    fileSize = stats.size;
                } catch (e) {
                    console.warn(`       ⚠️ Could not stat file: ${localFilePath}`);
                }

                const cdnUrl = `/academy/guidewire/${relativePath}`;

                await db.insert(schema.contentAssets).values({
                    topicId,
                    filename: assignment.filename,
                    storagePath: relativePath,
                    fileType: 'pdf', // Matches check constraint
                    mimeType: 'application/pdf',
                    fileSizeBytes: fileSize,
                    cdnUrl: cdnUrl,
                    isCurrent: true,
                    isPublic: false,
                });
            }
            topicNumber++;
        }
    }

    console.log('\n✅ Ingestion Complete!');
    await pool.end();
}

main().catch((err) => {
    console.error('❌ Ingestion Failed:', err);
    process.exit(1);
});
