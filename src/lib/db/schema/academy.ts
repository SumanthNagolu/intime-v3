import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { userProfiles } from './user-profiles';

// Enums
export const skillLevelEnum = pgEnum('skill_level', ['beginner', 'intermediate', 'advanced']);
export const contentTypeEnum = pgEnum('content_type', ['video', 'reading', 'quiz', 'lab', 'project']);
export const lessonContentTypeEnum = pgEnum('lesson_content_type', ['video', 'markdown', 'pdf', 'quiz', 'lab', 'external_link']);
export const enrollmentStatusEnum = pgEnum('enrollment_status', ['pending', 'active', 'completed', 'dropped', 'expired']);
export const paymentTypeEnum = pgEnum('payment_type', ['subscription', 'one_time', 'free', 'scholarship']);
export const riskLevelEnum = pgEnum('risk_level', ['low', 'medium', 'high']);
export const interventionStatusEnum = pgEnum('intervention_status', ['pending', 'in_progress', 'completed', 'ineffective']);
export const badgeRarityEnum = pgEnum('badge_rarity', ['common', 'rare', 'epic', 'legendary']);
export const badgeTriggerTypeEnum = pgEnum('badge_trigger_type', [
    'first_video', 'first_quiz', 'first_lab', 'quiz_streak', 'perfect_quiz',
    'lab_completion', 'course_completion', 'ai_mentor_usage', 'help_others',
    'speed_demon', 'night_owl', 'early_bird', 'consistency', 'achievement_hunter'
]);
export const transactionTypeEnum = pgEnum('transaction_type', [
    'topic_completion', 'quiz_passed', 'lab_completed', 'project_submitted',
    'bonus_achievement', 'badge_earned', 'penalty', 'adjustment'
]);
export const referenceTypeEnum = pgEnum('reference_type', [
    'topic_completion', 'enrollment', 'achievement', 'badge', 'admin_action'
]);

// Courses
export const courses = pgTable('courses', {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    subtitle: text('subtitle'),
    description: text('description').notNull(),
    total_modules: integer('total_modules').notNull().default(0),
    total_topics: integer('total_topics').notNull().default(0),
    estimated_duration_weeks: integer('estimated_duration_weeks').notNull().default(0),
    price_monthly: integer('price_monthly'),
    price_one_time: integer('price_one_time'),
    is_included_in_all_access: boolean('is_included_in_all_access').notNull().default(true),
    prerequisite_course_ids: uuid('prerequisite_course_ids').array(),
    skill_level: skillLevelEnum('skill_level').notNull().default('beginner'),
    thumbnail_url: text('thumbnail_url'),
    promo_video_url: text('promo_video_url'),
    is_published: boolean('is_published').notNull().default(false),
    is_featured: boolean('is_featured').notNull().default(false),
    created_by: uuid('created_by').references(() => userProfiles.id),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    deleted_at: timestamp('deleted_at'),
});

// Course Modules
export const courseModules = pgTable('course_modules', {
    id: uuid('id').defaultRandom().primaryKey(),
    course_id: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    module_number: integer('module_number').notNull(),
    estimated_duration_hours: integer('estimated_duration_hours'),
    prerequisite_module_ids: uuid('prerequisite_module_ids').array(),
    is_published: boolean('is_published').notNull().default(false),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Module Topics
export const moduleTopics = pgTable('module_topics', {
    id: uuid('id').defaultRandom().primaryKey(),
    module_id: uuid('module_id').references(() => courseModules.id, { onDelete: 'cascade' }).notNull(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    topic_number: integer('topic_number').notNull(),
    estimated_duration_minutes: integer('estimated_duration_minutes'),
    content_type: contentTypeEnum('content_type').notNull().default('reading'),
    prerequisite_topic_ids: uuid('prerequisite_topic_ids').array(),
    is_published: boolean('is_published').notNull().default(false),
    is_required: boolean('is_required').notNull().default(true),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Topic Lessons
export const topicLessons = pgTable('topic_lessons', {
    id: uuid('id').defaultRandom().primaryKey(),
    topic_id: uuid('topic_id').references(() => moduleTopics.id, { onDelete: 'cascade' }).notNull(),
    title: text('title').notNull(),
    lesson_number: integer('lesson_number').notNull(),
    content_type: lessonContentTypeEnum('content_type').notNull().default('markdown'),
    content_url: text('content_url'),
    content_markdown: text('content_markdown'),
    duration_seconds: integer('duration_seconds'),
    lab_environment_template: text('lab_environment_template'),
    lab_instructions_url: text('lab_instructions_url'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Student Enrollments
export const studentEnrollments = pgTable('student_enrollments', {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id').references(() => userProfiles.id).notNull(),
    course_id: uuid('course_id').references(() => courses.id).notNull(),
    status: enrollmentStatusEnum('status').notNull().default('pending'),
    enrolled_at: timestamp('enrolled_at').defaultNow().notNull(),
    completed_at: timestamp('completed_at'),
    expires_at: timestamp('expires_at'),
    current_module_id: uuid('current_module_id').references(() => courseModules.id),
    current_topic_id: uuid('current_topic_id').references(() => moduleTopics.id),
    completion_percentage: integer('completion_percentage').default(0),
    is_at_risk: boolean('is_at_risk').default(false),
    at_risk_since: timestamp('at_risk_since'),
    payment_id: text('payment_id'),
    payment_amount: integer('payment_amount'),
    payment_type: paymentTypeEnum('payment_type'),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Topic Completions
export const topicCompletions = pgTable('topic_completions', {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id').references(() => userProfiles.id).notNull(),
    enrollment_id: uuid('enrollment_id').references(() => studentEnrollments.id, { onDelete: 'cascade' }).notNull(),
    topic_id: uuid('topic_id').references(() => moduleTopics.id).notNull(),
    completed_at: timestamp('completed_at').defaultNow().notNull(),
});

// XP Transactions
export const xpTransactions = pgTable('xp_transactions', {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id').references(() => userProfiles.id).notNull(),
    amount: integer('amount').notNull(),
    transaction_type: transactionTypeEnum('transaction_type').notNull(),
    reference_type: referenceTypeEnum('reference_type'),
    reference_id: uuid('reference_id'),
    description: text('description'),
    awarded_at: timestamp('awarded_at').defaultNow().notNull(),
    awarded_by: uuid('awarded_by').references(() => userProfiles.id),
    created_at: timestamp('created_at').defaultNow().notNull(),
});

// User XP Totals
export const userXpTotals = pgTable('user_xp_totals', {
    user_id: uuid('user_id').references(() => userProfiles.id).primaryKey(),
    total_xp: integer('total_xp').notNull().default(0),
    transaction_count: integer('transaction_count').notNull().default(0),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Badges
export const badges = pgTable('badges', {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    icon_url: text('icon_url'),
    xp_reward: integer('xp_reward').notNull().default(0),
    rarity: badgeRarityEnum('rarity').notNull().default('common'),
    display_order: integer('display_order').notNull().default(0),
    is_hidden: boolean('is_hidden').notNull().default(false),
    trigger_type: badgeTriggerTypeEnum('trigger_type').notNull(),
    trigger_threshold: integer('trigger_threshold').notNull().default(1),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// User Badges
export const userBadges = pgTable('user_badges', {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id').references(() => userProfiles.id).notNull(),
    badge_id: uuid('badge_id').references(() => badges.id).notNull(),
    earned_at: timestamp('earned_at').defaultNow().notNull(),
    progress_value: integer('progress_value').notNull().default(0),
    is_new: boolean('is_new').notNull().default(true),
    viewed_at: timestamp('viewed_at'),
    shared_at: timestamp('shared_at'),
    share_count: integer('share_count').notNull().default(0),
});

// Quiz Attempts
export const quizAttempts = pgTable('quiz_attempts', {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id').references(() => userProfiles.id).notNull(),
    enrollment_id: uuid('enrollment_id').references(() => studentEnrollments.id).notNull(),
    quiz_id: uuid('quiz_id').notNull(),
    score: integer('score').notNull(),
    passed: boolean('passed').notNull(),
    attempted_at: timestamp('attempted_at').defaultNow().notNull(),
    answers: jsonb('answers'),
});

// Capstone Submissions
export const capstoneSubmissions = pgTable('capstone_submissions', {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id').references(() => userProfiles.id).notNull(),
    enrollment_id: uuid('enrollment_id').references(() => studentEnrollments.id).notNull(),
    course_id: uuid('course_id').references(() => courses.id).notNull(),
    submission_url: text('submission_url').notNull(),
    status: text('status').notNull().default('pending'),
    grade: integer('grade'),
    feedback: text('feedback'),
    submitted_at: timestamp('submitted_at').defaultNow().notNull(),
    reviewed_at: timestamp('reviewed_at'),
    reviewed_by: uuid('reviewed_by').references(() => userProfiles.id),
});

// Onboarding Checklist
export const onboardingChecklist = pgTable('onboarding_checklist', {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id').references(() => userProfiles.id).notNull(),
    enrollment_id: uuid('enrollment_id').references(() => studentEnrollments.id).notNull(),
    item_key: text('item_key').notNull(),
    is_completed: boolean('is_completed').notNull().default(false),
    completed_at: timestamp('completed_at'),
    sort_order: integer('sort_order').notNull().default(0),
});

// Student Interventions
export const studentInterventions = pgTable('student_interventions', {
    id: uuid('id').defaultRandom().primaryKey(),
    enrollment_id: uuid('enrollment_id').references(() => studentEnrollments.id).notNull(),
    student_id: uuid('student_id').references(() => userProfiles.id).notNull(),
    trainer_id: uuid('trainer_id').references(() => userProfiles.id).notNull(),
    risk_reasons: text('risk_reasons').array(),
    notes: text('notes'),
    status: interventionStatusEnum('status').notNull().default('pending'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    contacted_at: timestamp('contacted_at'),
    resolved_at: timestamp('resolved_at'),
});

// Escalations
export const escalations = pgTable('escalations', {
    id: uuid('id').defaultRandom().primaryKey(),
    student_id: uuid('student_id').references(() => userProfiles.id).notNull(),
    enrollment_id: uuid('enrollment_id').references(() => studentEnrollments.id),
    reason: text('reason').notNull(),
    status: text('status').notNull().default('pending'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    resolved_at: timestamp('resolved_at'),
});

// Course Pricing
export const coursePricing = pgTable('course_pricing', {
    id: uuid('id').defaultRandom().primaryKey(),
    course_id: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull().unique(),
    price_monthly: integer('price_monthly'),
    price_annual: integer('price_annual'),
    price_one_time: integer('price_one_time'),
    stripe_price_id_monthly: text('stripe_price_id_monthly'),
    stripe_price_id_annual: text('stripe_price_id_annual'),
    stripe_price_id_one_time: text('stripe_price_id_one_time'),
    stripe_product_id: text('stripe_product_id'),
    early_bird_price: integer('early_bird_price'),
    early_bird_valid_until: timestamp('early_bird_valid_until'),
    scholarship_available: boolean('scholarship_available').default(false),
    scholarship_criteria: text('scholarship_criteria'),
    team_discount_percentage: integer('team_discount_percentage'),
    min_team_size: integer('min_team_size').default(5),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Pricing Plans
export const pricingPlans = pgTable('pricing_plans', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull().unique(),
    description: text('description'),
    slug: text('slug').notNull().unique(),
    plan_type: text('plan_type').notNull(),
    price_monthly: integer('price_monthly'),
    price_annual: integer('price_annual'),
    price_one_time: integer('price_one_time'),
    stripe_price_id_monthly: text('stripe_price_id_monthly'),
    stripe_price_id_annual: text('stripe_price_id_annual'),
    stripe_price_id_one_time: text('stripe_price_id_one_time'),
    stripe_product_id: text('stripe_product_id'),
    features: jsonb('features').default([]),
    max_courses: integer('max_courses'),
    max_users: integer('max_users'),
    display_order: integer('display_order').default(0),
    is_featured: boolean('is_featured').default(false),
    badge_text: text('badge_text'),
    is_active: boolean('is_active').default(true),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    deleted_at: timestamp('deleted_at'),
});

// =====================================================
// LEARNING PATHS
// =====================================================

// Learning Paths
export const learningPaths = pgTable('learning_paths', {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    category: text('category'),
    difficulty: skillLevelEnum('difficulty').notNull().default('beginner'),
    duration_estimate_hours: integer('duration_estimate_hours'),
    status: text('status').notNull().default('draft'),
    thumbnail_url: text('thumbnail_url'),
    created_by: uuid('created_by').references(() => userProfiles.id),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    deleted_at: timestamp('deleted_at'),
});

// Learning Path Courses (junction table)
export const learningPathCourses = pgTable('learning_path_courses', {
    id: uuid('id').defaultRandom().primaryKey(),
    path_id: uuid('path_id').references(() => learningPaths.id, { onDelete: 'cascade' }).notNull(),
    course_id: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
    sequence: integer('sequence').notNull(),
    is_required: boolean('is_required').notNull().default(true),
    created_at: timestamp('created_at').defaultNow().notNull(),
});

// Path Enrollments
export const pathEnrollments = pgTable('path_enrollments', {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id').references(() => userProfiles.id).notNull(),
    path_id: uuid('path_id').references(() => learningPaths.id).notNull(),
    status: enrollmentStatusEnum('status').notNull().default('pending'),
    enrolled_at: timestamp('enrolled_at').defaultNow().notNull(),
    completed_at: timestamp('completed_at'),
    progress_percent: integer('progress_percent').default(0),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// =====================================================
// CERTIFICATES
// =====================================================

// Certificate Templates
export const certificateTemplates = pgTable('certificate_templates', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    design_template: text('design_template').notNull(),
    fields: jsonb('fields'),
    is_active: boolean('is_active').default(true),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Certificates
export const certificates = pgTable('certificates', {
    id: uuid('id').defaultRandom().primaryKey(),
    enrollment_id: uuid('enrollment_id').references(() => studentEnrollments.id).notNull(),
    template_id: uuid('template_id').references(() => certificateTemplates.id),
    certificate_number: text('certificate_number').notNull().unique(),
    issued_at: timestamp('issued_at').defaultNow().notNull(),
    expiry_date: timestamp('expiry_date'),
    pdf_url: text('pdf_url'),
    verification_code: text('verification_code').notNull().unique(),
    created_at: timestamp('created_at').defaultNow().notNull(),
});

// =====================================================
// GAMIFICATION - LEVELS & ACHIEVEMENTS
// =====================================================

// Level Definitions
export const levelDefinitions = pgTable('level_definitions', {
    level: integer('level').primaryKey(),
    xp_required: integer('xp_required').notNull(),
    title: text('title').notNull(),
    badge_url: text('badge_url'),
    perks: jsonb('perks'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// User Levels
export const userLevels = pgTable('user_levels', {
    user_id: uuid('user_id').references(() => userProfiles.id).primaryKey(),
    current_level: integer('current_level').notNull().default(1),
    current_xp: integer('current_xp').notNull().default(0),
    xp_to_next_level: integer('xp_to_next_level').notNull().default(100),
    level_up_at: timestamp('level_up_at'),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Achievements (broader than badges)
export const achievements = pgTable('achievements', {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    category: text('category').notNull(),
    badge_url: text('badge_url'),
    xp_reward: integer('xp_reward').notNull().default(0),
    criteria: jsonb('criteria').notNull(),
    is_secret: boolean('is_secret').default(false),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// User Achievements
export const userAchievements = pgTable('user_achievements', {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id').references(() => userProfiles.id).notNull(),
    achievement_id: uuid('achievement_id').references(() => achievements.id).notNull(),
    unlocked_at: timestamp('unlocked_at').defaultNow().notNull(),
    progress: jsonb('progress'),
    created_at: timestamp('created_at').defaultNow().notNull(),
});

// =====================================================
// STREAKS
// =====================================================

// Learning Streaks
export const learningStreaks = pgTable('learning_streaks', {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id').references(() => userProfiles.id).notNull(),
    streak_type: text('streak_type').notNull(),
    current_count: integer('current_count').notNull().default(0),
    longest_count: integer('longest_count').notNull().default(0),
    last_activity_date: timestamp('last_activity_date'),
    streak_started_at: timestamp('streak_started_at'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// =====================================================
// LEADERBOARDS
// =====================================================

// Leaderboards
export const leaderboards = pgTable('leaderboards', {
    id: uuid('id').defaultRandom().primaryKey(),
    type: text('type').notNull(),
    scope: text('scope').notNull(),
    period_start: timestamp('period_start').notNull(),
    period_end: timestamp('period_end').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Leaderboard Entries
export const leaderboardEntries = pgTable('leaderboard_entries', {
    id: uuid('id').defaultRandom().primaryKey(),
    leaderboard_id: uuid('leaderboard_id').references(() => leaderboards.id, { onDelete: 'cascade' }).notNull(),
    user_id: uuid('user_id').references(() => userProfiles.id).notNull(),
    rank: integer('rank').notNull(),
    xp_earned: integer('xp_earned').notNull().default(0),
    courses_completed: integer('courses_completed').notNull().default(0),
    lessons_completed: integer('lessons_completed').notNull().default(0),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});
