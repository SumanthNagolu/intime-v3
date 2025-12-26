-- Create candidates table for ATS module
-- This table stores candidate records separate from the unified contacts table
-- for staffing-specific candidate data

CREATE TABLE IF NOT EXISTS public.candidates (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    org_id uuid NOT NULL REFERENCES public.organizations(id),
    
    -- Basic Info
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text,
    linkedin_url text,
    avatar_url text,
    
    -- Professional Info
    title text,  -- Professional Headline
    professional_summary text,
    years_experience integer DEFAULT 0,
    
    -- Work Authorization
    visa_status text DEFAULT 'us_citizen',
    visa_expiry_date timestamp with time zone,
    availability text DEFAULT '2_weeks',
    
    -- Location & Preferences
    location text,
    willing_to_relocate boolean DEFAULT false,
    is_remote_ok boolean DEFAULT false,
    
    -- Compensation
    minimum_rate numeric(10,2),
    desired_rate numeric(10,2),
    rate_type text DEFAULT 'hourly',
    
    -- Source Tracking
    lead_source text,
    lead_source_detail text,
    
    -- Tags & Classification
    tags text[] DEFAULT '{}',
    status text DEFAULT 'active' NOT NULL,
    
    -- Hotlist
    is_on_hotlist boolean DEFAULT false,
    hotlist_notes text,
    hotlist_added_at timestamp with time zone,
    hotlist_added_by uuid REFERENCES auth.users(id),
    
    -- Ownership & Audit
    sourced_by uuid REFERENCES auth.users(id),
    owner_id uuid REFERENCES auth.users(id),
    created_by uuid REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    
    -- Link to contacts table (optional - for unified contact workspace)
    contact_id uuid REFERENCES public.contacts(id),
    
    -- Constraints
    CONSTRAINT candidates_email_unique UNIQUE (org_id, email)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_candidates_org_id ON public.candidates(org_id);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON public.candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON public.candidates(org_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_hotlist ON public.candidates(org_id, is_on_hotlist) WHERE deleted_at IS NULL AND is_on_hotlist = true;
CREATE INDEX IF NOT EXISTS idx_candidates_sourced_by ON public.candidates(sourced_by);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON public.candidates(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_contact_id ON public.candidates(contact_id) WHERE contact_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "candidates_select_policy" ON public.candidates
    FOR SELECT
    USING (org_id IN (
        SELECT org_id FROM public.user_roles WHERE user_id = auth.uid()
    ));

CREATE POLICY "candidates_insert_policy" ON public.candidates
    FOR INSERT
    WITH CHECK (org_id IN (
        SELECT org_id FROM public.user_roles WHERE user_id = auth.uid()
    ));

CREATE POLICY "candidates_update_policy" ON public.candidates
    FOR UPDATE
    USING (org_id IN (
        SELECT org_id FROM public.user_roles WHERE user_id = auth.uid()
    ));

CREATE POLICY "candidates_delete_policy" ON public.candidates
    FOR DELETE
    USING (org_id IN (
        SELECT org_id FROM public.user_roles WHERE user_id = auth.uid()
    ));

-- Grant permissions
GRANT ALL ON public.candidates TO authenticated;
GRANT ALL ON public.candidates TO service_role;

-- Also ensure candidate_skills table has proper foreign key
-- (it references candidate_id which should link to this table)
ALTER TABLE public.candidate_skills 
    DROP CONSTRAINT IF EXISTS candidate_skills_candidate_id_fkey;

ALTER TABLE public.candidate_skills
    ADD CONSTRAINT candidate_skills_candidate_id_fkey 
    FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;

COMMENT ON TABLE public.candidates IS 'Staffing candidates with professional and work authorization details';

