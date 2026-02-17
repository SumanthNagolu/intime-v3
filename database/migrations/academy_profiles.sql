-- ============================================================
-- Academy Profile Tables (reference SQL for future Supabase migration)
-- Maps 1:1 to the localStorage profile-store.ts data model
-- ============================================================

-- 1. Profiles: user-level profile extensions
CREATE TABLE academy_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  years_experience TEXT NOT NULL DEFAULT '',
  linkedin_url TEXT NOT NULL DEFAULT '',
  github_url TEXT NOT NULL DEFAULT '',
  portfolio_url TEXT NOT NULL DEFAULT '',
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,        -- ProfileSkill[]
  certifications JSONB NOT NULL DEFAULT '[]'::jsonb, -- Certification[]
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE INDEX academy_profiles_user_id_idx ON academy_profiles(user_id);

-- 2. Projects: project experience entries
CREATE TABLE academy_profile_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES academy_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  client TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  start_date TEXT NOT NULL DEFAULT '',
  end_date TEXT,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT NOT NULL DEFAULT '',
  responsibilities JSONB NOT NULL DEFAULT '[]'::jsonb, -- string[]
  technologies JSONB NOT NULL DEFAULT '[]'::jsonb,     -- string[]
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX academy_profile_projects_profile_id_idx ON academy_profile_projects(profile_id);

-- 3. Implementations: nested under projects
CREATE TABLE academy_profile_implementations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES academy_profile_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  problem TEXT NOT NULL DEFAULT '',
  solution TEXT NOT NULL DEFAULT '',
  technical_details TEXT NOT NULL DEFAULT '',
  impact TEXT NOT NULL DEFAULT '',
  technologies JSONB NOT NULL DEFAULT '[]'::jsonb, -- string[]
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX academy_profile_implementations_project_id_idx ON academy_profile_implementations(project_id);
