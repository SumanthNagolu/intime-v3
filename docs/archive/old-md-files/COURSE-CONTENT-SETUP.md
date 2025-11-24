# Course Content Setup - Quick Reference

## File Placement

Place your files exactly here:

```
/Users/sumanthrajkumarnagolu/Projects/intime-v3/public/courses/guidewire-developer/

lesson-01-introduction/
├── video.mp4
├── presentation.pdf
└── assignment.pdf

lesson-02-[rename-folder]/
├── video.mp4
├── presentation.pdf
└── assignment.pdf

lesson-03-[rename-folder]/
├── video.mp4
├── presentation.pdf
└── assignment.pdf

lesson-04-[rename-folder]/
├── video.mp4
├── presentation.pdf
└── assignment.pdf

lesson-05-[rename-folder]/
├── video.mp4
├── presentation.pdf
└── assignment.pdf
```

## What I Need From You

1. **Rename folders** (lessons 2-5) to match your topic names
2. **Place files** (video.mp4, presentation.pdf, assignment.pdf in each folder)
3. **Tell me the 5 lesson titles/topics** so I can update the seed script

## What I'll Do Next

Once you place files:
1. Update `scripts/seed-guidewire-5-lessons.sql` with your topic names
2. Run the seed script to populate database
3. Build Course Player UI to display lessons
4. Test the complete flow

## Database Structure (Already Exists!)

- **courses** - Guidewire Developer course
- **course_modules** - Module 1: Fundamentals
- **module_topics** - 5 topics (one per lesson)
- **topic_lessons** - 3 lessons per topic (video, PDF presentation, PDF assignment)

Ready when you are! 🚀
