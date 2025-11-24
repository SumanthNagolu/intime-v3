-- Temporarily disable audit trigger for seeding
ALTER TABLE user_profiles DISABLE TRIGGER trigger_audit_user_profiles;

-- Now run the seed script content inline
-- (This is just a test - we'll call the full script via edge function)

SELECT 'Audit trigger disabled - ready to seed' as status;
