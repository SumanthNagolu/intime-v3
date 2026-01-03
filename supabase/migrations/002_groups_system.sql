-- ============================================
-- Guidewire-Style Groups System
-- ============================================
-- This migration creates:
-- 1. groups table - Hierarchical organizational units
-- 2. group_members table - User membership in groups
-- 3. group_regions table - Regions serviced by groups
-- 4. Updates user_profiles with primary_group_id
-- 5. Creates root group for each organization

-- ============================================
-- 1. GROUPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Basic Info
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    
    -- Group Type (Guidewire-style)
    group_type TEXT NOT NULL DEFAULT 'team',
    CONSTRAINT groups_type_check CHECK (group_type IN (
        'root',           -- Organization root (auto-created)
        'division',       -- Major division (Recruiting, Bench Sales, HR)
        'branch',         -- Regional branch office
        'team',           -- Specific team within a branch
        'satellite_office', -- Remote/satellite office
        'producer'        -- External producer/vendor group
    )),
    
    -- Hierarchy
    parent_group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    hierarchy_level INTEGER DEFAULT 0,
    hierarchy_path TEXT, -- Materialized path for efficient tree queries
    
    -- Management
    supervisor_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    manager_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    
    -- Security (Guidewire-style security zones)
    security_zone TEXT DEFAULT 'default',
    
    -- Contact Info
    phone TEXT,
    fax TEXT,
    email TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'USA',
    
    -- Assignment Rules
    load_factor INTEGER DEFAULT 100,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES public.user_profiles(id),
    updated_by UUID REFERENCES public.user_profiles(id),
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT groups_unique_name_per_org UNIQUE NULLS NOT DISTINCT (org_id, name, deleted_at),
    CONSTRAINT groups_unique_code_per_org UNIQUE NULLS NOT DISTINCT (org_id, code, deleted_at),
    CONSTRAINT groups_root_no_parent CHECK (
        (group_type = 'root' AND parent_group_id IS NULL) OR
        (group_type != 'root')
    )
);

COMMENT ON TABLE public.groups IS 'Guidewire-style hierarchical organizational groups. Each organization has a root group with child groups forming a tree structure.';
COMMENT ON COLUMN public.groups.group_type IS 'Type of group: root (org), division, branch, team, satellite_office, producer';
COMMENT ON COLUMN public.groups.hierarchy_path IS 'Materialized path like /root-id/division-id/team-id for efficient tree queries';
COMMENT ON COLUMN public.groups.security_zone IS 'Security zone for data visibility restrictions (Guidewire pattern)';
COMMENT ON COLUMN public.groups.load_factor IS 'Work assignment load factor (100 = full load)';

-- Indexes for groups
CREATE INDEX IF NOT EXISTS idx_groups_org_id ON public.groups(org_id);
CREATE INDEX IF NOT EXISTS idx_groups_parent_id ON public.groups(parent_group_id);
CREATE INDEX IF NOT EXISTS idx_groups_type ON public.groups(group_type);
CREATE INDEX IF NOT EXISTS idx_groups_hierarchy_path ON public.groups(hierarchy_path);
CREATE INDEX IF NOT EXISTS idx_groups_supervisor ON public.groups(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_groups_manager ON public.groups(manager_id);
CREATE INDEX IF NOT EXISTS idx_groups_active ON public.groups(is_active) WHERE deleted_at IS NULL;

-- RLS for groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY groups_select_policy ON public.groups
    FOR SELECT USING (
        org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid())
    );

CREATE POLICY groups_insert_policy ON public.groups
    FOR INSERT WITH CHECK (
        org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid())
    );

CREATE POLICY groups_update_policy ON public.groups
    FOR UPDATE USING (
        org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid())
    );

CREATE POLICY groups_delete_policy ON public.groups
    FOR DELETE USING (
        org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid())
    );

-- ============================================
-- 2. GROUP MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Membership details
    is_manager BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    load_factor INTEGER DEFAULT 100,
    load_permission TEXT DEFAULT 'normal',
    CONSTRAINT group_members_load_permission_check CHECK (load_permission IN ('normal', 'reduced', 'exempt')),
    
    -- Vacation/backup
    vacation_status TEXT DEFAULT 'available',
    CONSTRAINT group_members_vacation_check CHECK (vacation_status IN ('available', 'vacation', 'sick', 'leave')),
    backup_user_id UUID REFERENCES public.user_profiles(id),
    
    -- Dates
    joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    left_at TIMESTAMPTZ,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES public.user_profiles(id),
    
    -- Constraints
    CONSTRAINT group_members_unique UNIQUE (group_id, user_id)
);

COMMENT ON TABLE public.group_members IS 'User membership in organizational groups (Guidewire-style)';
COMMENT ON COLUMN public.group_members.is_manager IS 'User has manager privileges in this group';
COMMENT ON COLUMN public.group_members.load_factor IS 'Individual work assignment load factor (100 = full load)';
COMMENT ON COLUMN public.group_members.load_permission IS 'Load assignment permission level';
COMMENT ON COLUMN public.group_members.vacation_status IS 'Current availability status for work assignment';
COMMENT ON COLUMN public.group_members.backup_user_id IS 'User who handles work when this member is unavailable';

-- Indexes for group_members
CREATE INDEX IF NOT EXISTS idx_group_members_org_id ON public.group_members(org_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_active ON public.group_members(is_active) WHERE left_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_group_members_manager ON public.group_members(group_id) WHERE is_manager = true;

-- RLS for group_members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY group_members_select_policy ON public.group_members
    FOR SELECT USING (
        org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid())
    );

CREATE POLICY group_members_insert_policy ON public.group_members
    FOR INSERT WITH CHECK (
        org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid())
    );

CREATE POLICY group_members_update_policy ON public.group_members
    FOR UPDATE USING (
        org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid())
    );

CREATE POLICY group_members_delete_policy ON public.group_members
    FOR DELETE USING (
        org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid())
    );

-- ============================================
-- 3. GROUP REGIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.group_regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    region_id UUID NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
    
    -- Status
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES public.user_profiles(id),
    
    -- Constraints
    CONSTRAINT group_regions_unique UNIQUE (group_id, region_id)
);

COMMENT ON TABLE public.group_regions IS 'Many-to-many relationship between groups and regions they service';
COMMENT ON COLUMN public.group_regions.is_primary IS 'Primary region for this group';

-- Indexes for group_regions
CREATE INDEX IF NOT EXISTS idx_group_regions_org_id ON public.group_regions(org_id);
CREATE INDEX IF NOT EXISTS idx_group_regions_group_id ON public.group_regions(group_id);
CREATE INDEX IF NOT EXISTS idx_group_regions_region_id ON public.group_regions(region_id);

-- RLS for group_regions
ALTER TABLE public.group_regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY group_regions_select_policy ON public.group_regions
    FOR SELECT USING (
        org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid())
    );

CREATE POLICY group_regions_insert_policy ON public.group_regions
    FOR INSERT WITH CHECK (
        org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid())
    );

CREATE POLICY group_regions_update_policy ON public.group_regions
    FOR UPDATE USING (
        org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid())
    );

CREATE POLICY group_regions_delete_policy ON public.group_regions
    FOR DELETE USING (
        org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid())
    );

-- ============================================
-- 4. UPDATE USER_PROFILES
-- ============================================
-- Add primary_group_id to user_profiles for primary group assignment
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS primary_group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.user_profiles.primary_group_id IS 'Primary organizational group for this user (Guidewire-style)';

CREATE INDEX IF NOT EXISTS idx_user_profiles_primary_group ON public.user_profiles(primary_group_id);

-- ============================================
-- 5. UPDATE PODS TABLE
-- ============================================
-- Add group_id to pods so pods can belong to a group
ALTER TABLE public.pods 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.pods.group_id IS 'Organizational group this pod belongs to';

CREATE INDEX IF NOT EXISTS idx_pods_group_id ON public.pods(group_id);

-- ============================================
-- 6. HIERARCHY PATH TRIGGER
-- ============================================
-- Function to maintain hierarchy_path when groups are created/updated
CREATE OR REPLACE FUNCTION update_group_hierarchy_path()
RETURNS TRIGGER AS $$
DECLARE
    parent_path TEXT;
    parent_level INTEGER;
BEGIN
    IF NEW.parent_group_id IS NULL THEN
        -- Root group
        NEW.hierarchy_path := '/' || NEW.id::TEXT;
        NEW.hierarchy_level := 0;
    ELSE
        -- Get parent's path and level
        SELECT hierarchy_path, hierarchy_level
        INTO parent_path, parent_level
        FROM public.groups
        WHERE id = NEW.parent_group_id;
        
        IF parent_path IS NOT NULL THEN
            NEW.hierarchy_path := parent_path || '/' || NEW.id::TEXT;
            NEW.hierarchy_level := COALESCE(parent_level, 0) + 1;
        ELSE
            NEW.hierarchy_path := '/' || NEW.id::TEXT;
            NEW.hierarchy_level := 0;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_group_hierarchy ON public.groups;
CREATE TRIGGER trg_update_group_hierarchy
    BEFORE INSERT OR UPDATE OF parent_group_id ON public.groups
    FOR EACH ROW
    EXECUTE FUNCTION update_group_hierarchy_path();

-- ============================================
-- 7. UPDATED_AT TRIGGER
-- ============================================
-- Add updated_at trigger for groups
DROP TRIGGER IF EXISTS trg_groups_updated_at ON public.groups;
CREATE TRIGGER trg_groups_updated_at
    BEFORE UPDATE ON public.groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_group_members_updated_at ON public.group_members;
CREATE TRIGGER trg_group_members_updated_at
    BEFORE UPDATE ON public.group_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. SEED ROOT GROUPS FOR EXISTING ORGS
-- ============================================
-- Create a root group for each existing organization that doesn't have one
INSERT INTO public.groups (org_id, name, code, group_type, description, is_active)
SELECT 
    o.id as org_id,
    o.name as name,
    LOWER(REPLACE(o.slug, '-', '_')) as code,
    'root' as group_type,
    'Root organizational group for ' || o.name as description,
    true as is_active
FROM public.organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM public.groups g 
    WHERE g.org_id = o.id AND g.group_type = 'root'
)
AND o.deleted_at IS NULL;

-- ============================================
-- 9. FUNCTION TO CREATE ROOT GROUP FOR NEW ORGS
-- ============================================
CREATE OR REPLACE FUNCTION create_root_group_for_org()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.groups (org_id, name, code, group_type, description, is_active)
    VALUES (
        NEW.id,
        NEW.name,
        LOWER(REPLACE(NEW.slug, '-', '_')),
        'root',
        'Root organizational group for ' || NEW.name,
        true
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_root_group ON public.organizations;
CREATE TRIGGER trg_create_root_group
    AFTER INSERT ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION create_root_group_for_org();




