-- Create contact_bench_data extension table for bench consultant data
-- This table stores extended bench-specific attributes for contacts with bench subtypes

-- Create bench-related enums if they don't exist
DO $$ BEGIN
    CREATE TYPE public.bench_type AS ENUM ('w2_internal', 'w2_vendor', '1099', 'c2c');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.bench_marketing_status AS ENUM ('draft', 'active', 'paused', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create contact_bench_data table
CREATE TABLE IF NOT EXISTS public.contact_bench_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES public.organizations(id),
    contact_id uuid NOT NULL UNIQUE REFERENCES public.contacts(id) ON DELETE CASCADE,

    -- Core bench information
    bench_start_date date NOT NULL,
    bench_type public.bench_type,
    bench_status text CHECK (bench_status IN ('onboarding', 'available', 'marketing', 'interviewing', 'placed', 'inactive')) DEFAULT 'available',

    -- Work authorization
    visa_type text,
    visa_expiry_date date,
    work_auth_status text,
    visa_notes text,

    -- Rate information
    min_acceptable_rate numeric(10,2),
    target_rate numeric(10,2),
    max_rate numeric(10,2),
    currency text DEFAULT 'USD',
    bill_rate numeric(10,2),
    pay_rate numeric(10,2),
    markup_percentage numeric(5,2),
    cost_per_day numeric(10,2),

    -- Location preferences
    willing_to_relocate boolean DEFAULT false,
    preferred_locations text[],
    work_preference text CHECK (work_preference IN ('remote', 'hybrid', 'onsite', 'flexible')),

    -- Marketing and sales
    marketing_status public.bench_marketing_status DEFAULT 'draft',
    marketing_started_at timestamptz,
    marketing_notes text,
    bench_sales_rep_id uuid REFERENCES public.user_profiles(id),

    -- Vendor relationship (for W2 vendor or C2C)
    vendor_id uuid REFERENCES public.companies(id),
    vendor_contact_id uuid REFERENCES public.contacts(id),
    vendor_terms text,

    -- Performance tracking
    target_end_date date,
    max_bench_days integer,
    total_placements integer DEFAULT 0,
    last_placement_end date,
    utilization_rate numeric(5,2),
    days_on_bench integer,

    -- Skills and experience (denormalized for quick access)
    primary_skills text[],
    years_of_experience numeric(4,1),
    certifications text[],

    -- Legacy reference for migration
    legacy_bench_consultant_id uuid,

    -- Audit fields
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    created_by uuid REFERENCES public.user_profiles(id),
    updated_by uuid REFERENCES public.user_profiles(id),
    deleted_at timestamptz
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contact_bench_data_org ON public.contact_bench_data(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contact_bench_data_contact ON public.contact_bench_data(contact_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contact_bench_data_status ON public.contact_bench_data(bench_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contact_bench_data_marketing ON public.contact_bench_data(marketing_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contact_bench_data_visa_expiry ON public.contact_bench_data(visa_expiry_date) WHERE visa_expiry_date IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contact_bench_data_bench_type ON public.contact_bench_data(bench_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contact_bench_data_vendor ON public.contact_bench_data(vendor_id) WHERE vendor_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contact_bench_data_sales_rep ON public.contact_bench_data(bench_sales_rep_id) WHERE bench_sales_rep_id IS NOT NULL AND deleted_at IS NULL;

-- Enable RLS
ALTER TABLE public.contact_bench_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "contact_bench_data_org_isolation" ON public.contact_bench_data
    FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

CREATE POLICY "contact_bench_data_service_role" ON public.contact_bench_data
    FOR ALL TO service_role USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_contact_bench_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contact_bench_data_updated_at ON public.contact_bench_data;
CREATE TRIGGER contact_bench_data_updated_at
    BEFORE UPDATE ON public.contact_bench_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_contact_bench_data_updated_at();

-- Add comment
COMMENT ON TABLE public.contact_bench_data IS 'Extension table for bench consultant data linked to contacts';
