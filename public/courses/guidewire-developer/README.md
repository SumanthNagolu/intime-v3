# Guidewire Developer Course - Content Files

This directory contains all content files for the Guidewire Developer Fundamentals course.

## Folder Structure

```
guidewire-developer/
├── README.md (this file)
├── thumbnail.jpg (course thumbnail - 1280x720px)
├── lesson-01-introduction/
│   ├── video.mp4 (45 min video)
│   ├── presentation.pdf
│   └── assignment.pdf
├── lesson-02-architecture/
│   ├── video.mp4 (50 min video)
│   ├── presentation.pdf
│   └── assignment.pdf
├── lesson-03-data-model/
│   ├── video.mp4 (55 min video)
│   ├── presentation.pdf
│   └── assignment.pdf
├── lesson-04-configuration/
│   ├── video.mp4 (60 min video)
│   ├── presentation.pdf
│   └── assignment.pdf
└── lesson-05-integration/
    ├── video.mp4 (50 min video)
    ├── presentation.pdf
    └── assignment.pdf
```

## File Requirements

### Course Thumbnail
- **File:** `thumbnail.jpg`
- **Dimensions:** 1280x720px (16:9 aspect ratio)
- **Format:** JPG or PNG
- **Purpose:** Displayed in course catalog

### Videos
- **Format:** MP4 (H.264 codec)
- **Resolution:** 1920x1080 (1080p) or 1280x720 (720p)
- **Bitrate:** 2-5 Mbps
- **Audio:** AAC, 128 kbps
- **Max File Size:** 500 MB per video
- **Recommended:** Upload to Vimeo/YouTube and use embed URLs instead

### PDFs
- **Format:** PDF
- **Max File Size:** 20 MB per file
- **Recommended:** Ensure text is selectable (not scanned images)

## Alternative: Use External Links

Instead of uploading large video files, you can:

1. **Upload to Vimeo/YouTube**
2. **Update the seed file** with embed URLs:
   ```sql
   UPDATE topic_lessons
   SET content_url = 'https://www.youtube.com/embed/YOUR_VIDEO_ID'
   WHERE lesson_number = 1 AND content_type = 'video';
   ```

3. **Host PDFs on Google Drive/Dropbox**
   - Make files publicly accessible
   - Use direct download links

## Seeding the Database

Once files are in place:

```bash
# Run the seed script
npm run db:seed:guidewire
```

Or manually:

```bash
psql $SUPABASE_DB_URL -f scripts/seed-guidewire-5-lessons.sql
```

## Verification

After seeding, verify:

```sql
-- Check course created
SELECT * FROM courses WHERE slug = 'guidewire-developer';

-- Check all 5 topics created
SELECT topic_number, title FROM module_topics
WHERE module_id = (SELECT id FROM course_modules WHERE slug = 'guidewire-fundamentals')
ORDER BY topic_number;

-- Check all 15 lessons created (5 topics × 3 lessons each)
SELECT COUNT(*) FROM topic_lessons
WHERE topic_id IN (
  SELECT id FROM module_topics
  WHERE module_id = (SELECT id FROM course_modules WHERE slug = 'guidewire-fundamentals')
);
-- Should return: 15
```

## Content Placeholders (for rapid testing)

If you want to test immediately without actual content:

**Videos:** Use this 1-minute Guidewire intro video
```
https://www.youtube.com/embed/dQw4w9WgXcQ
```

**PDFs:** Use Guidewire public documentation
```
https://docs.guidewire.com/cloud/pc/202310/cloudapibf/cloudAPI-Basics-Topics/c_rest-api-overview.pdf
```

## Need Help?

See `/ACADEMY-LMS-COMPARISON-REPORT.md` for complete testing guide.
