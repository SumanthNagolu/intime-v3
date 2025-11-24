-- ACAD-016: Badge Seed Data
-- Sprint 3 (Week 9-10)
-- Description: Initial badge definitions for gamification system

-- ============================================================================
-- FIRST EXPERIENCE BADGES (Common)
-- ============================================================================

INSERT INTO badges (slug, name, description, icon_url, xp_reward, rarity, trigger_type, trigger_threshold, display_order) VALUES
('first-video', 'Video Voyager', 'Watched your first video lesson', '/badges/first-video.svg', 50, 'common', 'first_video', 1, 1),
('first-quiz', 'Quiz Novice', 'Completed your first quiz', '/badges/first-quiz.svg', 50, 'common', 'first_quiz', 1, 2),
('first-lab', 'Lab Explorer', 'Completed your first hands-on lab', '/badges/first-lab.svg', 50, 'common', 'first_lab', 1, 3),
('first-ai-chat', 'AI Apprentice', 'Had your first conversation with the AI mentor', '/badges/first-ai-chat.svg', 50, 'common', 'ai_mentor_usage', 1, 4);

-- ============================================================================
-- QUIZ MASTERY BADGES (Common → Epic)
-- ============================================================================

INSERT INTO badges (slug, name, description, icon_url, xp_reward, rarity, trigger_type, trigger_threshold, display_order) VALUES
-- Quiz streaks
('quiz-streak-3', 'Quiz Tripler', 'Completed 3 quizzes in a row', '/badges/quiz-streak-3.svg', 100, 'common', 'quiz_streak', 3, 10),
('quiz-streak-5', 'Quiz Pentacle', 'Completed 5 quizzes in a row', '/badges/quiz-streak-5.svg', 200, 'rare', 'quiz_streak', 5, 11),
('quiz-streak-10', 'Quiz Marathon', 'Completed 10 quizzes in a row', '/badges/quiz-streak-10.svg', 500, 'epic', 'quiz_streak', 10, 12),

-- Perfect scores
('perfect-quiz-1', 'Perfectionist', 'Scored 100% on a quiz', '/badges/perfect-quiz.svg', 150, 'common', 'perfect_quiz', 1, 13),
('perfect-quiz-5', 'Flawless Five', 'Scored 100% on 5 quizzes', '/badges/perfect-quiz-5.svg', 300, 'rare', 'perfect_quiz', 5, 14),
('perfect-quiz-10', 'Quiz Perfectionist', 'Scored 100% on 10 quizzes', '/badges/perfect-quiz-10.svg', 750, 'epic', 'perfect_quiz', 10, 15),
('perfect-quiz-25', 'Ultimate Quiz Master', 'Scored 100% on 25 quizzes', '/badges/perfect-quiz-25.svg', 2000, 'legendary', 'perfect_quiz', 25, 16);

-- ============================================================================
-- LAB COMPLETION BADGES (Common → Legendary)
-- ============================================================================

INSERT INTO badges (slug, name, description, icon_url, xp_reward, rarity, trigger_type, trigger_threshold, display_order) VALUES
('lab-5', 'Lab Technician', 'Completed 5 hands-on labs', '/badges/lab-5.svg', 150, 'common', 'lab_completion', 5, 20),
('lab-10', 'Lab Specialist', 'Completed 10 hands-on labs', '/badges/lab-10.svg', 300, 'rare', 'lab_completion', 10, 21),
('lab-25', 'Lab Expert', 'Completed 25 hands-on labs', '/badges/lab-25.svg', 750, 'epic', 'lab_completion', 25, 22),
('lab-50', 'Lab Legend', 'Completed 50 hands-on labs', '/badges/lab-50.svg', 2000, 'legendary', 'lab_completion', 50, 23);

-- ============================================================================
-- COURSE COMPLETION BADGES (Rare → Legendary)
-- ============================================================================

INSERT INTO badges (slug, name, description, icon_url, xp_reward, rarity, trigger_type, trigger_threshold, display_order) VALUES
('course-1', 'Graduate', 'Completed your first course', '/badges/course-1.svg', 500, 'rare', 'course_completion', 1, 30),
('course-3', 'Triple Threat', 'Completed 3 courses', '/badges/course-3.svg', 1000, 'epic', 'course_completion', 3, 31),
('course-5', 'Polymath', 'Completed 5 courses', '/badges/course-5.svg', 2500, 'legendary', 'course_completion', 5, 32);

-- ============================================================================
-- AI MENTOR BADGES (Common → Epic)
-- ============================================================================

INSERT INTO badges (slug, name, description, icon_url, xp_reward, rarity, trigger_type, trigger_threshold, display_order) VALUES
('ai-chat-10', 'AI Conversationalist', 'Had 10 conversations with AI mentor', '/badges/ai-chat-10.svg', 100, 'common', 'ai_mentor_usage', 10, 40),
('ai-chat-50', 'AI Collaborator', 'Had 50 conversations with AI mentor', '/badges/ai-chat-50.svg', 300, 'rare', 'ai_mentor_usage', 50, 41),
('ai-chat-100', 'AI Partner', 'Had 100 conversations with AI mentor', '/badges/ai-chat-100.svg', 750, 'epic', 'ai_mentor_usage', 100, 42);

-- ============================================================================
-- TIME-BASED BADGES (Rare → Legendary)
-- ============================================================================

INSERT INTO badges (slug, name, description, icon_url, xp_reward, rarity, trigger_type, trigger_threshold, display_order) VALUES
('speed-demon', 'Speed Demon', 'Completed a course in record time (top 10%)', '/badges/speed-demon.svg', 500, 'epic', 'speed_demon', 1, 50),
('night-owl', 'Night Owl', 'Completed 10 lessons between midnight and 5am', '/badges/night-owl.svg', 200, 'rare', 'night_owl', 10, 51),
('early-bird', 'Early Bird', 'Completed 10 lessons between 5am and 8am', '/badges/early-bird.svg', 200, 'rare', 'early_bird', 10, 52);

-- ============================================================================
-- CONSISTENCY BADGES (Common → Legendary)
-- ============================================================================

INSERT INTO badges (slug, name, description, icon_url, xp_reward, rarity, trigger_type, trigger_threshold, display_order) VALUES
('consistent-7', 'Weekly Warrior', 'Studied for 7 days in a row', '/badges/consistent-7.svg', 200, 'common', 'consistency', 7, 60),
('consistent-14', 'Fortnight Fighter', 'Studied for 14 days in a row', '/badges/consistent-14.svg', 500, 'rare', 'consistency', 14, 61),
('consistent-30', 'Monthly Master', 'Studied for 30 days in a row', '/badges/consistent-30.svg', 1500, 'epic', 'consistency', 30, 62),
('consistent-90', 'Quarter Champion', 'Studied for 90 days in a row', '/badges/consistent-90.svg', 5000, 'legendary', 'consistency', 90, 63);

-- ============================================================================
-- ACHIEVEMENT HUNTER BADGES (Hidden until earned)
-- ============================================================================

INSERT INTO badges (slug, name, description, icon_url, xp_reward, rarity, trigger_type, trigger_threshold, display_order, is_hidden) VALUES
('collector-10', 'Badge Collector', 'Earned 10 different badges', '/badges/collector-10.svg', 300, 'rare', 'achievement_hunter', 10, 70, true),
('collector-25', 'Badge Enthusiast', 'Earned 25 different badges', '/badges/collector-25.svg', 1000, 'epic', 'achievement_hunter', 25, 71, true),
('collector-50', 'Badge Fanatic', 'Earned 50 different badges', '/badges/collector-50.svg', 3000, 'legendary', 'achievement_hunter', 50, 72, true);

-- ============================================================================
-- HELPING OTHERS BADGES (Rare → Legendary)
-- ============================================================================

INSERT INTO badges (slug, name, description, icon_url, xp_reward, rarity, trigger_type, trigger_threshold, display_order) VALUES
('helper-5', 'Helpful Hand', 'Helped 5 other students', '/badges/helper-5.svg', 250, 'rare', 'help_others', 5, 80),
('helper-25', 'Community Champion', 'Helped 25 other students', '/badges/helper-25.svg', 1000, 'epic', 'help_others', 25, 81),
('helper-100', 'Mentor', 'Helped 100 other students', '/badges/helper-100.svg', 5000, 'legendary', 'help_others', 100, 82);

-- ============================================================================
-- SPECIAL/SECRET BADGES (Legendary, Hidden)
-- ============================================================================

INSERT INTO badges (slug, name, description, icon_url, xp_reward, rarity, trigger_type, trigger_threshold, display_order, is_hidden) VALUES
('unicorn', 'Unicorn', 'Found the hidden easter egg', '/badges/unicorn.svg', 1000, 'legendary', 'achievement_hunter', 1, 90, true),
('founding-member', 'Founding Member', 'One of the first 100 students', '/badges/founding-member.svg', 2000, 'legendary', 'achievement_hunter', 1, 91, true),
('bug-hunter', 'Bug Hunter', 'Reported 5 valid bugs', '/badges/bug-hunter.svg', 1500, 'legendary', 'help_others', 5, 92, true);
